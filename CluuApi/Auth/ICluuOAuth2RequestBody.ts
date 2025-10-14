
export interface ICluuOAuth2RequestBody {
	client_id: string;
	client_secret: string;
	grant_type: string;
	password: string;
	remote_scheme: string;
	scope: string;
	username: string;
}
