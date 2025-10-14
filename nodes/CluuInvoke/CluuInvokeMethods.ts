import { IExecuteFunctions, ILoadOptionsFunctions, INodePropertyOptions } from "n8n-workflow";

import { CluuQueryService } from "../../CluuApi/Query/CluuQueryService";

interface IActionInfo {
	Id: string;
	Name: string;
}

export class CluuInvokeNodeMethods {
	public static createCluuInvokeNodeMethods() {
		return {
			loadOptions: {
				async getActions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
					return await CluuInvokeNodeMethods.getActionsAsync(this);
				},
			},
		};
	}

	private static async getActionsAsync(
		functions: ILoadOptionsFunctions,
	): Promise<INodePropertyOptions[]> {
		const executeFunctions = functions as unknown as IExecuteFunctions;

		const actions = await CluuQueryService.instance.queryCluuAsync<IActionInfo>(
			`FROM CluuMetadata.ActionInfo WHERE Type == "Action" SELECT Id, Name`,
			executeFunctions,
		);

		return actions
			.sort((a, b) => a.Name.localeCompare(b.Name))
			.map((action: IActionInfo) => ({
				name: action.Name,
				value: action.Name,
			}));
	}
}
