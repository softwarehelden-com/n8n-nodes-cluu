import { INodeProperties } from "n8n-workflow";

import { WellKnownAssistantParameterNames } from "./WellKnownAssistantParameterNames";

export const AssistantIdProperty: INodeProperties = {
	displayName: 'Assistant Name or ID',
	name: WellKnownAssistantParameterNames.assistantId,
	type: 'options',
	description:
		'The assistant to call. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	typeOptions: {
		loadOptionsMethod: 'getAssistants',
	},
	options: [],
	default: '',
};
export const EnableJsonProperty: INodeProperties = {
	displayName: 'Enable JSON Response',
	name: WellKnownAssistantParameterNames.enableJson,
	type: 'boolean',
	default: false,
	description: 'Whether to enable JSON response from the assistant',
};
export const MaxTokensProperty: INodeProperties = {
	displayName: 'Max Tokens',
	name: WellKnownAssistantParameterNames.maxTokens,
	type: 'number',
	default: null,
	description: 'The maximum number of tokens to generate in the response',
};
export const MessageProperty: INodeProperties = {
	displayName: 'Message',
	name: WellKnownAssistantParameterNames.message,
	type: 'string',
	default: '',
	description: 'The message to send to the assistant',
	required: true,
};
export const TemperatureProperty: INodeProperties = {
	displayName: 'Temperature',
	name: WellKnownAssistantParameterNames.temperature,
	type: 'number',
	typeOptions: {
		minValue: 0,
		maxValue: 1,
		numberStep: 0.1,
	},
	default: null,
	description:
		'What sampling temperature to use. Higher values means the model will take more risks. Try 0.9 for more creative applications, and 0 (argmax sampling) for ones with a well-defined answer.',
};
