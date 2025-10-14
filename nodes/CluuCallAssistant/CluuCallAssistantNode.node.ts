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
import { CluuCallAssistantNodeMethods } from './CluuCallAssistantNodeMethods';
import { WellKnownAssistantParameterNames } from './WellKnownAssistantParameterNames';
import {
	AssistantIdProperty,
	EnableJsonProperty,
	MaxTokensProperty,
	MessageProperty,
	TemperatureProperty,
} from './CluuCallAssistantNodeProperties';

interface IAssistantResponse {
	responseMessage: string;
}

export class CluuCallAssistantNode implements INodeType {
	public description: INodeTypeDescription = {
		displayName: 'Cluu Call Assistant',
		name: 'cluuCallAssistantNode',
		icon: { light: 'file:Logo.svg', dark: 'file:Logo.svg' },
		group: ['input'],
		version: 1,
		description: 'Calls a cluu assistant',
		defaults: {
			name: 'Cluu Call Assistant',
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
			AssistantIdProperty,
			MessageProperty,
			EnableJsonProperty,
			MaxTokensProperty,
			TemperatureProperty,
		],
	};
	public methods = CluuCallAssistantNodeMethods.createCluuCallAssistantNodeMethods();

	public async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const resultItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			let item: INodeExecutionData = items[itemIndex];

			try {
				const assistantId = getNodeParameter<string>(
					this,
					WellKnownAssistantParameterNames.assistantId,
					itemIndex,
					'',
				);

				const message = getNodeParameter<string>(
					this,
					WellKnownAssistantParameterNames.message,
					itemIndex,
					'',
				);

				const enableJson = getNodeParameter<boolean>(
					this,
					WellKnownAssistantParameterNames.enableJson,
					itemIndex,
					false,
				);

				const maxTokens = getNodeParameter<number | null>(
					this,
					WellKnownAssistantParameterNames.maxTokens,
					itemIndex,
					null,
				);

				const temperature = getNodeParameter<number | null>(
					this,
					WellKnownAssistantParameterNames.temperature,
					itemIndex,
					null,
				);

				const requestMessage: object = {
					assistantId: assistantId == null || assistantId === '' ? null : assistantId,
					message: message,
					enableJson: enableJson,
					maxTokens: maxTokens,
					temperature: temperature,
				};

				const responseMessage = await CluuInvokeService.instance.invokeCluuAsync<
					object,
					IAssistantResponse
				>('CluuAssistant.AddIns.TextCompletion.SingleTextCompletion', requestMessage, this);

				let result: IDataObject;

				if (enableJson) {
					result = JSON.parse(responseMessage.responseMessage);
				} else {
					result = { response: responseMessage.responseMessage };
				}

				resultItems.push({
					json: result,
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
	parameterName: WellKnownAssistantParameterNames,
	itemIndex: number,
	defaultValue?: T | undefined,
): T {
	return executeFunctions.getNodeParameter(parameterName, itemIndex, defaultValue) as T;
}
