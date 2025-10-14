import {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

// https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes
export class CluuOAuth2Api implements ICredentialType {
	name = 'cluuOAuth2Api';
	displayName = 'Cluu OAuth2 API';
	documentationUrl = 'https://www.softwarehelden.com';
	properties: INodeProperties[] = [
		{
			displayName: 'Cluu Backend URL',
			name: 'cluuBackendUrl',
			type: 'string',
			default: '',
			placeholder: 'https://<domain>.com/Backbone',
			description: 'The URL of the Cluu backend',
		},
		{
			displayName: 'Grant type',
			name: 'grantType',
			type: 'hidden',
			default: 'password',
			required: true,
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'openid offline_access',
			required: true,
		},
		{
			displayName: 'Remote scheme',
			name: 'remoteScheme',
			type: 'hidden',
			default: 'CluuSecurity',
			required: true,
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.cluuBackendUrl}}',
			url: '/',
			method: 'GET',
		},
	};
}
