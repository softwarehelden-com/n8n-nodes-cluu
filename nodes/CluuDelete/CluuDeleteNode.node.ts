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
} from '../CluuCrud/CluuCrudParameterDescriptions';
import { CluuCrudNodeService } from '../CluuCrud/CluuCrudNodeService';

export class CluuDeleteNode implements INodeType {
	public description: INodeTypeDescription = {
		displayName: 'Cluu Delete',
		name: 'cluuDeleteNode',
		icon: { light: 'file:Logo.svg', dark: 'file:Logo.svg' },
		group: ['input'],
		version: 1,
		description: 'Executes cluu entity deletes in a batch operation',
		defaults: {
			name: 'Cluu Entity Delete',
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
				default: 'delete',
				required: true,
			},
			CluuClassNamePropertyDescription,
			CluuKeyValuePropertyDescription,
		],
	};
	public methods = CluuCrudNodeService.instance.createCrudNodeMethods();

	public async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return await CluuCrudNodeService.instance.executeCrudNodeAsync(this);
	}
}
