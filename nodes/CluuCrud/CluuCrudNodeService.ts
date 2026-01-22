import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';

import { CluuEntityChangeType } from '../../CluuApi/CluuEntityChangeType';
import { CluuTemporaryKeyValueService } from '../../CluuApi/CluuTemporaryKeyValueService';
import { CluuTypedPropertyValue } from '../../CluuApi/CluuTypedPropertyValue';
import { ICluuEntityChange } from '../../CluuApi/ICluuEntityChange';
import { IEntityChangeResult } from '../../CluuApi/IEntityChangeResult';
import { CluuUpdateService } from '../../CluuApi/Update/CluuUpdateService';
import { getCluuClassNamesAsync, getPropertyNamesAsync } from '../CluuLoadMethods';
import { WellKnownCrudOperations } from './WellKnownCrudOperations';
import { WellKnownCrudParameterNames } from './WellKnownCrudParameterNames';

export class CluuCrudNodeService {
	private static readonly _instance: CluuCrudNodeService;

	private constructor() {}

	public static get instance(): CluuCrudNodeService {
		if (!this._instance) {
			return new CluuCrudNodeService();
		}
		return this._instance;
	}

	public createCrudNodeMethods(): {
		loadOptions?: {
			[key: string]: (this: ILoadOptionsFunctions) => Promise<INodePropertyOptions[]>;
		};
	} {
		return {
			loadOptions: {
				async getCluuClassNames(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
					return await getCluuClassNamesAsync(this);
				},
				async getPropertyNames(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
					return getPropertyNamesAsync(this);
				},
			},
		};
	}

	public async executeCrudNodeAsync(
		executeFunctions: IExecuteFunctions,
	): Promise<INodeExecutionData[][]> {
		const items = executeFunctions.getInputData();

		const cluuEntityChanges: ICluuEntityChange[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const cluuClassName = this.getNodeParameter<string>(
				executeFunctions,
				WellKnownCrudParameterNames.cluuClassName,
				itemIndex,
			);

			const hasCluuTemporaryKeyValue = this.getNodeParameter<boolean>(
				executeFunctions,
				WellKnownCrudParameterNames.hasCluuTemporaryKeyValue,
				itemIndex,
				false,
			);

			const entityChangeTypeValue = this.getNodeParameter<WellKnownCrudOperations>(
				executeFunctions,
				WellKnownCrudParameterNames.changeType,
				itemIndex,
			);

			let entityChangeType: CluuEntityChangeType | null = null;

			if (entityChangeTypeValue === WellKnownCrudOperations.insert) {
				entityChangeType = CluuEntityChangeType.Insert;
			} else if (entityChangeTypeValue === WellKnownCrudOperations.update) {
				entityChangeType = CluuEntityChangeType.Update;
			} else if (entityChangeTypeValue === WellKnownCrudOperations.delete) {
				entityChangeType = CluuEntityChangeType.Delete;
			} else {
				throw new NodeOperationError(
					executeFunctions.getNode(),
					`Invalid entity change type: ${entityChangeTypeValue}`,
					{ itemIndex },
				);
			}

			let key: CluuTypedPropertyValue = null;

			if (!hasCluuTemporaryKeyValue) {
				key = this.getNodeParameter<CluuTypedPropertyValue>(
					executeFunctions,
					WellKnownCrudParameterNames.key,
					itemIndex,
				);

				if (key == null) {
					throw new NodeOperationError(
						executeFunctions.getNode(),
						'Key value must be provided when not using a temporary key value.',
						{ itemIndex },
					);
				}
			} else {
				const guid: string = crypto.randomUUID();

				key = { $tmpKey: guid };
			}

			let values: { [propertyName: string]: CluuTypedPropertyValue } | undefined = undefined;

			if (entityChangeType !== CluuEntityChangeType.Delete) {
				const propertyValuesValue = this.getNodeParameter<[{ name: string; value: string }]>(
					executeFunctions,
					WellKnownCrudParameterNames.propertyValues_propertyValue,
					itemIndex,
					undefined,
				);

				values = {};

				for (const property of propertyValuesValue ?? []) {
					values[property.name] = property.value;
				}
			}

			cluuEntityChanges.push({
				type: entityChangeType,
				cluuClassName,
				key,
				values: values,
			});
		}

		try {
			const entityChangeResults = await CluuUpdateService.instance.updateCluuAsync(
				cluuEntityChanges,
				executeFunctions,
			);

			const resultItems: INodeExecutionData[] = [];

			for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
				const entityChange = cluuEntityChanges[itemIndex];

				const json: IDataObject = {
					cluuEntityChange: entityChange,
				};

				if (entityChange.type === CluuEntityChangeType.Insert) {
					const entityChangeResult = this.getEntityChangeResult(entityChange, entityChangeResults);

					json.updatedKeyValue = entityChangeResult?.updatedKeyValue ?? entityChange.key;
				}

				resultItems.push({
					json: json,
					pairedItem: itemIndex,
				});
			}

			return [resultItems];
		} catch (error: any) {
			if (executeFunctions.continueOnFail()) {
				throw new NodeOperationError(
					executeFunctions.getNode(),
					'Continue on fail is not supported for this node.',
				);
			} else {
				throw new NodeOperationError(executeFunctions.getNode(), error);
			}
		}
	}

	private getEntityChangeResult(
		entityChange: ICluuEntityChange,
		entityChangeResults: readonly IEntityChangeResult[],
	) {
		const entityChangeTemporaryKey =
			CluuTemporaryKeyValueService.instance.tryExtractCluuTemporaryKeyValue(entityChange.key);

		if (!entityChangeTemporaryKey) {
			return null;
		}

		const entityChangeResult = entityChangeResults.find((x) => {
			const updatedTemporaryKey =
				CluuTemporaryKeyValueService.instance.tryExtractCluuTemporaryKeyValue(
					x.entityReference.keyValue,
				);

			return updatedTemporaryKey && updatedTemporaryKey === entityChangeTemporaryKey;
		});

		return entityChangeResult;
	}

	private getNodeParameter<T>(
		executeFunctions: IExecuteFunctions,
		parameterName: WellKnownCrudParameterNames,
		itemIndex: number,
		defaultValue?: T | undefined,
	): T {
		return executeFunctions.getNodeParameter(parameterName, itemIndex, defaultValue) as T;
	}
}
