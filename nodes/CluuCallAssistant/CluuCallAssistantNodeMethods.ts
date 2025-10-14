import { IExecuteFunctions, ILoadOptionsFunctions, INodePropertyOptions } from "n8n-workflow";

import { CluuQueryService } from "../../CluuApi/Query/CluuQueryService";

interface IAssistant {
	Caption: string;
	Id: string;
	UniqueId: string;
}

export class CluuCallAssistantNodeMethods {
	public static createCluuCallAssistantNodeMethods() {
		return {
			loadOptions: {
				async getAssistants(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
					return await CluuCallAssistantNodeMethods.getAssistantsAsync(this);
				},
			},
		};
	}

	private static async getAssistantsAsync(
		functions: ILoadOptionsFunctions,
	): Promise<INodePropertyOptions[]> {
		const executeFunctions = functions as unknown as IExecuteFunctions;

		const assistants = await CluuQueryService.instance.queryCluuAsync<IAssistant>(
			`FROM CluuAssistant.Assistant SELECT Id, UniqueId, Caption`,
			executeFunctions,
		);

		const values = assistants
			.sort((a, b) => a.Caption.localeCompare(b.Caption))
			.map((assistant: IAssistant) => ({
				name: assistant.Caption,
				value: assistant.UniqueId,
			}));

		return [{ name: '-', value: '' }, ...values];
	}
}
