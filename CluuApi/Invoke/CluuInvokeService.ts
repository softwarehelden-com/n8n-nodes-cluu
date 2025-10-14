import { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';

import { CluuAuthService } from '../Auth/CluuAuthService';

export class CluuInvokeService {
	private static _instance: CluuInvokeService;

	private constructor() {}

	public static get instance(): CluuInvokeService {
		if (!CluuInvokeService._instance) {
			CluuInvokeService._instance = new CluuInvokeService();
		}
		return CluuInvokeService._instance;
	}

	public async invokeCluuAsync<TRequestMessage, TResponseMessage>(
		actionName: string,
		requestMessage: TRequestMessage | undefined,
		executeFunctions: IExecuteFunctions,
	): Promise<TResponseMessage> {
		const headers: IDataObject = {
			Accept: '*/*',
		};

		const requestOptions: IHttpRequestOptions = {
			method: 'POST',
			url: '/Invoke/' + actionName,
			headers: headers,
		};

		if (requestMessage != null) {
			if (!(requestMessage instanceof Object)) {
				throw new Error('Request message must be an object or null');
			}

			headers['Content-Type'] = 'application/json; charset=utf-8';

			requestOptions.body = requestMessage;
		}

		const result = await CluuAuthService.instance.executeCluuHttpRequestAsync(
			executeFunctions,
			requestOptions,
		);

		return result as TResponseMessage;
	}
}
