import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import { CluuInvokeService } from '../../CluuApi/Invoke/CluuInvokeService';
import { CluuInvokeNodeMethods } from './CluuInvokeMethods';

enum WellKnownInvokeParameterNames {
	ActionName = 'actionName',
	HasRequestMessage = 'hasRequestMessage',
	RequestMessage = 'requestMessage',
}

export class CluuInvokeNode implements INodeType {
	public description: INodeTypeDescription = {
		displayName: 'Cluu Invoke',
		name: 'cluuInvokeNode',
		icon: { light: 'file:Logo.svg', dark: 'file:Logo.svg' },
		group: ['input'],
		version: 1,
		description: 'Executes cluu invoke actions',
		defaults: {
			name: 'Cluu Invoke',
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
				displayName: 'Action Name or ID',
				name: WellKnownInvokeParameterNames.ActionName,
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getActions',
				},
				options: [],
				default: '',
				placeholder: 'MyAppModel.AddIns.Namespace.ActionName',
				description:
					'The name of the action to invoke. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				required: true,
			},
			{
				displayName: 'Has Request Message',
				name: WellKnownInvokeParameterNames.HasRequestMessage,
				type: 'boolean',
				default: true,
				description: 'Whether the action has a request message',
				required: true,
			},
			{
				displayName: 'Request Message',
				name: WellKnownInvokeParameterNames.RequestMessage,
				type: 'json',
				default: {},
				placeholder: '{ "property1": "value1", "property2": "value2" }',
				description: 'The request message to send with the action',
				displayOptions: {
					show: {
						[WellKnownInvokeParameterNames.HasRequestMessage]: [true],
					},
				},
				required: true,
			},
		],
	};

	public methods = CluuInvokeNodeMethods.createCluuInvokeNodeMethods();

	public async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const resultItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			let item: INodeExecutionData = items[itemIndex];

			try {
				const actionName = getNodeParameter<string>(
					this,
					WellKnownInvokeParameterNames.ActionName,
					itemIndex,
					'',
				);

				const hasRequestMessage = getNodeParameter<boolean>(
					this,
					WellKnownInvokeParameterNames.HasRequestMessage,
					itemIndex,
					true,
				);

				let requestMessage = undefined;

				if (hasRequestMessage) {
					// Type='json' führt derzeit zu einem String
					const jsonValue = getNodeParameter<string>(
						this,
						WellKnownInvokeParameterNames.RequestMessage,
						itemIndex,
						'{}',
					);

					requestMessage = JSON.parse(jsonValue) as object;
				}

				const responseMessage = await CluuInvokeService.instance.invokeCluuAsync<
					object,
					IDataObject | undefined
				>(actionName, requestMessage, this);

				resultItems.push({
					json: responseMessage ?? {},
					pairedItem: itemIndex,
				});
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

function getNodeParameter<T>(
	executeFunctions: IExecuteFunctions,
	parameterName: WellKnownInvokeParameterNames,
	itemIndex: number,
	defaultValue?: T | undefined,
): T {
	return executeFunctions.getNodeParameter(parameterName, itemIndex, defaultValue) as T;
}
