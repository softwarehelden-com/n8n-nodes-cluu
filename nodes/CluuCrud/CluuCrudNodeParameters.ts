import { INodeProperties } from 'n8n-workflow';
import { WellKnownCrudNodeMethodNames } from './WellKnownCrudNodeMethodNames';
import { WellKnownCrudOperations } from './WellKnownCrudOperations';
import { WellKnownCrudParameterNames } from './WellKnownCrudParameterNames';

export const CluuClassNamePropertyDescription: INodeProperties = {
	displayName: 'Cluu Class Name or ID',
	name: WellKnownCrudParameterNames.cluuClassName,
	type: 'options',
	description:
		'The cluu class name to operate on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	typeOptions: {
		loadOptionsMethod: WellKnownCrudNodeMethodNames.getCluuClassNames,
	},
	options: [],
	default: '',
	required: true,
};
export const CluuKeyValuePropertyDescription: INodeProperties = {
	displayName: 'Cluu Key Value',
	name: WellKnownCrudParameterNames.key,
	type: 'string',
	description:
		'The cluu key value to identify the entity. You can use expressions to set the value dynamically.',
	options: [],
	default: '',
};
export const HasCluuTemporaryKeyValuePropertyDescription: INodeProperties = {
	displayName: 'Has Temporary Key Value',
	name: WellKnownCrudParameterNames.hasCluuTemporaryKeyValue,
	type: 'boolean',
	displayOptions: {
		show: {
			[WellKnownCrudParameterNames.changeType]: [WellKnownCrudOperations.insert],
		},
	},
	default: false,
	required: true,
	description: 'Whether the key value is a temporary key value',
};

// https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/nodes/HttpRequest/V3/Description.ts
export const PropertyValuesPropertyDescription: INodeProperties = {
	displayName: 'Property Values',
	name: WellKnownCrudParameterNames.propertyValues,
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	displayOptions: {
		show: {
			[WellKnownCrudParameterNames.changeType]: [
				WellKnownCrudOperations.insert,
				WellKnownCrudOperations.update,
			],
		},
	},
	placeholder: 'Add Property Value',
	default: {
		propertyValue: [
			{
				name: '',
				value: '',
			},
		],
	},
	options: [
		{
			name: WellKnownCrudParameterNames.propertyValue,
			displayName: 'Parameter Value',
			values: [
				{
					displayName: 'Name or ID',
					name: 'name',
					type: 'options',
					description:
						'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					default: '',
					typeOptions: {
						loadOptionsMethod: WellKnownCrudNodeMethodNames.getPropertyNames,
					},
					options: [],
				},
				{
					displayName: 'Value',
					name: 'value',
					type: 'string',
					default: '',
				},
			],
		},
	],
};
