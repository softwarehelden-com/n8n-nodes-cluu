import { IExecuteFunctions, IHttpRequestOptions } from "n8n-workflow";

import { CluuAuthService } from "../Auth/CluuAuthService";

export class CluuQueryService {
	private static _instance: CluuQueryService;

	private constructor() {}

	public static get instance(): CluuQueryService {
		if (!CluuQueryService._instance) {
			CluuQueryService._instance = new CluuQueryService();
		}
		return CluuQueryService._instance;
	}

	public async queryCluuAsync<T>(
		cluuQuery: string,
		executeFunctions: IExecuteFunctions,
	): Promise<T[]> {
		const requestOptions: IHttpRequestOptions = {
			method: 'POST',
			url: '/invoke/CluuAssistant.AddIns.Functions.Query',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				Accept: 'application/json; charset=utf-8',
			},
			body: {
				cluuQuery: cluuQuery,
			},
		};

		const response = await CluuAuthService.instance.executeCluuHttpRequestAsync(
			executeFunctions,
			requestOptions,
		);

		var { results } = response as { results: T[] };

		return results;
	}
}
