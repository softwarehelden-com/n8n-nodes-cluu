import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
} from 'n8n-workflow';

import { WellKnownCrudOperations } from './WellKnownCrudOperations';
import {
	CluuClassNamePropertyDescription,
	CluuKeyValuePropertyDescription,
	HasCluuTemporaryKeyValuePropertyDescription,
	PropertyValuesPropertyDescription,
} from './CluuCrudParameterDescriptions';
import { CluuCrudNodeService } from './CluuCrudNodeService';

export class CluuCrudNode implements INodeType {
	public description: INodeTypeDescription = {
		displayName: 'Cluu CRUD (universal mixed mode)',
		name: 'cluuCrudNode',
		icon: { light: 'file:Logo.svg', dark: 'file:Logo.svg' },
		group: ['input'],
		version: 1,
		description: 'Executes cluu entity CRUD operations in a batch operation',
		defaults: {
			name: 'Cluu Entity CRUD',
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
				displayName: 'Change Type',
				name: 'changeType',
				type: 'options',
				default: 'update',
				options: [
					{
						name: 'Insert',
						value: WellKnownCrudOperations.insert,
						description: 'Insert a new entity',
					},
					{
						name: 'Update',
						value: WellKnownCrudOperations.update,
						description: 'Update an existing entity',
					},
					{
						name: 'Delete',
						value: WellKnownCrudOperations.delete,
						description: 'Delete an existing entity',
					},
				],
				description: 'The type of change to perform on the cluu entity',
				required: true,
			},
			CluuClassNamePropertyDescription,
			HasCluuTemporaryKeyValuePropertyDescription,
			CluuKeyValuePropertyDescription,
			PropertyValuesPropertyDescription,
		],
	};
	public methods = CluuCrudNodeService.instance.createCrudNodeMethods();

	public async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return await CluuCrudNodeService.instance.executeCrudNodeAsync(this);
	}
}
