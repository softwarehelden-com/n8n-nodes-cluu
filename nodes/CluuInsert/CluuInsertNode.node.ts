import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
} from 'n8n-workflow';

import { WellKnownCrudParameterNames } from '../CluuCrud/WellKnownCrudParameterNames';
import {
	CluuClassNamePropertyDescription,
	HasCluuTemporaryKeyValuePropertyDescription,
	PropertyValuesPropertyDescription,
} from '../CluuCrud/CluuCrudParameterDescriptions';
import { CluuCrudNodeService } from '../CluuCrud/CluuCrudNodeService';

export class CluuInsertNode implements INodeType {
	public description: INodeTypeDescription = {
		displayName: 'Cluu Insert',
		name: 'cluuInsertNode',
		icon: { light: 'file:Logo.svg', dark: 'file:Logo.svg' },
		group: ['input'],
		version: 1,
		description: 'Executes cluu entity inserts in a batch operation',
		defaults: {
			name: 'Cluu Entity Insert',
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
				name: WellKnownCrudParameterNames.changeType,
				type: 'hidden',
				default: 'insert',
				required: true,
			},
			CluuClassNamePropertyDescription,
			HasCluuTemporaryKeyValuePropertyDescription,
			{
				displayName: 'Cluu Key Value',
				name: WellKnownCrudParameterNames.key,
				type: 'string',
				displayOptions: {
					show: {
						hasCluuTemporaryKeyValue: [false],
					},
				},
				description:
					'The cluu key value to identify the entity. You can use expressions to set the value dynamically.',
				options: [],
				default: '',
			},
			PropertyValuesPropertyDescription,
		],
	};
	public methods = CluuCrudNodeService.instance.createCrudNodeMethods();

	public async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return await CluuCrudNodeService.instance.executeCrudNodeAsync(this);
	}
}
