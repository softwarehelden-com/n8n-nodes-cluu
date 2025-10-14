import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	LoggerProxy as Logger,
} from 'n8n-workflow';

import { ICluuHttpError } from '../ICluuHttpError';
import { ICluuServiceDiscoveryResponse } from '../ICluuServiceDiscoveryResponse';
import { ICluuOAuth2RequestBody } from './ICluuOAuth2RequestBody';
import { ICluuOAuth2Response } from './ICluuOAuth2Response';

interface ICluuCredentialsCache {
	accessToken?: string;
	credentialsHash?: string;
	expiryTime?: number;
}

interface ICluuOAuth2ApiCredentials {
	clientId: string;
	clientSecret: string;
	cluuBackendUrl: string;
	grantType: string;
	password: string;
	remoteScheme: string;
	scope: string;
	username: string;
}

interface ICluuWorkflowStaticData extends IDataObject {
	__cluu_oauth_api_cache?: ICluuCredentialsCache;
}

export class CluuAuthService {
	private static _instance: CluuAuthService;

	private constructor() {}

	public static get instance(): CluuAuthService {
		if (!CluuAuthService._instance) {
			CluuAuthService._instance = new CluuAuthService();
		}
		return CluuAuthService._instance;
	}

	public async executeCluuHttpRequestAsync(
		functions: IExecuteFunctions,
		requestOptions: Omit<IHttpRequestOptions, 'baseURL'>,
	): Promise<unknown> {
		const credentials: ICluuOAuth2ApiCredentials = await functions.getCredentials('cluuOAuth2Api');

		const requestOptionsInternal: IHttpRequestOptions = { ...requestOptions };
		requestOptionsInternal.baseURL = credentials.cluuBackendUrl;

		const accessToken = await this.ensureCluuAccessTokenAsync(functions);
		requestOptionsInternal.headers = { ...(requestOptionsInternal.headers ?? {}) };
		requestOptionsInternal.headers.Authorization = `Bearer ${accessToken}`;

		try {
			return await functions.helpers.httpRequest(requestOptionsInternal);
		} catch (error: ICluuHttpError | unknown) {
			const isHttpError =
				(error as ICluuHttpError).status != null &&
				(error as ICluuHttpError).response != null &&
				(error as ICluuHttpError).response.data != null;

			if (!isHttpError) {
				throw error;
			}

			const httpError = error as ICluuHttpError;

			// https://community.n8n.io/t/how-to-get-data-payload-from-webhook-with-http-status-code-500/182836
			const hasProblemDetails = httpError?.response?.data != null;

			if (httpError.status === 500 && hasProblemDetails) {
				const problemDetails = httpError.response?.data;

				let message = `Cluu API Error`;

				if (problemDetails?.title != null) {
					message += ` - ${problemDetails?.title}`;

					if (problemDetails?.detail != null) {
						message += `: ${problemDetails?.detail}`;
					}
				}

				throw new Error(message);
			}

			throw error;
		}
	}

	private async ensureCluuAccessTokenAsync(functions: IExecuteFunctions): Promise<string> {
		const credentials: ICluuOAuth2ApiCredentials = await functions.getCredentials('cluuOAuth2Api');

		const cluuCredentials: ICluuOAuth2RequestBody = {
			grant_type: credentials.grantType,
			username: credentials.username,
			password: credentials.password,
			client_id: credentials.clientId,
			client_secret: credentials.clientSecret,
			scope: credentials.scope,
			remote_scheme: credentials.remoteScheme,
		};

		const [cachedAccessToken, cluuCredentialsHash, cacheData] = await this.getCachedCredentials(
			functions,
			cluuCredentials,
		);

		if (cachedAccessToken) {
			Logger.debug('Using cached Cluu access token');
			return cachedAccessToken;
		}

		const serviceDiscoveryResult: ICluuServiceDiscoveryResponse =
			await functions.helpers.httpRequest({
				method: 'GET',
				url: credentials.cluuBackendUrl as string,
			});

		const response: ICluuOAuth2Response = await functions.helpers.httpRequest({
			method: 'POST',
			url: serviceDiscoveryResult.authenticateViaCluuSecurityEndpoint,
			body: cluuCredentials,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			returnFullResponse: false,
			ignoreHttpStatusErrors: false,
		});

		cacheData.accessToken = response.access_token;
		cacheData.expiryTime = Date.now() + (response.expires_in - 360) * 1000;
		cacheData.credentialsHash = cluuCredentialsHash;

		return response.access_token;
	}

	private async getCachedCredentials(
		functions: IExecuteFunctions,
		cluuCredentials: ICluuOAuth2RequestBody,
	): Promise<
		[accessToken: string | null, credentialsHash: string, cacheData: ICluuCredentialsCache]
	> {
		const crypto = await import('crypto');

		const cluuCredentialsHash = crypto
			.createHash('md5')
			.update(JSON.stringify(cluuCredentials))
			.digest('hex');

		const data: ICluuWorkflowStaticData = functions.getWorkflowStaticData('global');

		if (data.__cluu_oauth_api_cache == null) {
			data.__cluu_oauth_api_cache = {};
		}

		let cacheData: ICluuCredentialsCache = data.__cluu_oauth_api_cache;

		if (
			(cacheData.expiryTime ?? 0) > Date.now() &&
			cacheData.accessToken != null &&
			cacheData.credentialsHash == cluuCredentialsHash
		) {
			return [cacheData.accessToken, cluuCredentialsHash, cacheData];
		}

		return [null, cluuCredentialsHash, cacheData];
	}
}
