import { IExecuteFunctions, IHttpRequestOptions } from "n8n-workflow";

import { CluuAuthService } from "../Auth/CluuAuthService";
import { ICluuEntityChange } from "../ICluuEntityChange";
import { IEntityChangeResult } from "../IEntityChangeResult";

export class CluuUpdateService {
	private static _instance: CluuUpdateService;

	private constructor() {}

	public static get instance(): CluuUpdateService {
		if (!CluuUpdateService._instance) {
			CluuUpdateService._instance = new CluuUpdateService();
		}
		return CluuUpdateService._instance;
	}

	public async updateCluuAsync(
		entityChanges: readonly ICluuEntityChange[],
		executeFunctions: IExecuteFunctions,
	): Promise<readonly IEntityChangeResult[]> {
		const requestOptions: IHttpRequestOptions = {
			method: 'POST',
			url: '/Update',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Cluu-UpdateReturnType': 'Minimal',
				Accept: 'application/json; charset=utf-8',
			},
			body: entityChanges,
		};

		const result = (await CluuAuthService.instance.executeCluuHttpRequestAsync(
			executeFunctions,
			requestOptions,
		)) as IEntityChangeResult[];

		return result;
	}
}
