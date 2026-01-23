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
	CluuKeyValuePropertyDescription,
	PropertyValuesPropertyDescription,
} from '../CluuCrud/CluuCrudNodeParameters';
import { CluuCrudNodeService } from '../CluuCrud/CluuCrudNodeService';

export class CluuUpdateNode implements INodeType {
	public description: INodeTypeDescription = {
		displayName: 'Cluu Update',
		name: 'cluuUpdateNode',
		icon: { light: 'file:Logo.svg', dark: 'file:Logo.svg' },
		group: ['input'],
		version: 1,
		description: 'Executes cluu entity updates in a batch operation',
		defaults: {
			name: 'Cluu Entity Update',
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
				default: 'update',
				required: true,
			},
			CluuClassNamePropertyDescription,
			CluuKeyValuePropertyDescription,
			PropertyValuesPropertyDescription,
		],
	};
	public methods = CluuCrudNodeService.instance.createCrudNodeMethods();

	public async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return await CluuCrudNodeService.instance.executeCrudNodeAsync(this);
	}
}
