import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import { CluuQueryService } from '../../CluuApi/Query/CluuQueryService';

export class CluuQueryNode implements INodeType {
	public description: INodeTypeDescription = {
		displayName: 'Cluu Query',
		name: 'cluuQueryNode',
		icon: { light: 'file:Logo.svg', dark: 'file:Logo.svg' },
		group: ['input'],
		version: 1,
		description: 'Queries a cluu instance',
		defaults: {
			name: 'Cluu Query',
		},
		credentials: [
			{
				name: 'cluuOAuth2Api',
				required: true,
			},
		],
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Cluu Query',
				name: 'cluuQuery',
				type: 'string',
				default: '',
				placeholder: 'FROM SwhOrgManagement.Person SELECT Id, FirstName',
				description: 'The Cluu query to execute',
			},
		],
	};

	public async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const resultItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			let item: INodeExecutionData = items[itemIndex];

			try {
				const cluuQuery = this.getNodeParameter('cluuQuery', itemIndex, '') as string;

				const entities = await CluuQueryService.instance.queryCluuAsync<unknown>(cluuQuery, this);

				for (const entity of entities) {
					resultItems.push({
						json: entity as IDataObject,
						pairedItem: itemIndex,
					});
				}
			} catch (error: any) {
				if (this.continueOnFail()) {
					const errorItem: INodeExecutionData = {
						json: item.json,
						pairedItem: itemIndex,
						error: error,
					};

					resultItems.push(errorItem);
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;

						throw error;
					}

					throw new NodeOperationError(this.getNode(), error, { itemIndex });
				}
			}
		}

		return [resultItems];
	}
}
