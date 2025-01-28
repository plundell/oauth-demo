import { z } from "zod";
import { State } from '#state';

/**
 * The environment variables expected for the OAuth provider
 * 
 * @property `OAUTH_CLIENT_ID` - Obtained from Google Cloud Console, used in first step of OAuth flow
 * @property `OAUTH_REDIRECT` - The URL Google will redirect to after first OAuth step (should point to /api/auth/gettoken)
 * @property `OAUTH_SCOPE` - Space-separated list of OAuth scopes being requested (e.g. "openid email profile")
 * @property `OAUTH_STATE_TTL` - Time-to-live in seconds for the state parameter used to prevent various attacks, maybe
 * @property `OAUTH_PRIVATE_KEY` - The private key used to sign the State and JWT
 * @property `OAUTH_PUBLIC_KEY` - The public key used to verify the State and JWT
 */
export type OauthEnvVars = {
	OAUTH_CLIENT_ID: string
	OAUTH_REDIRECT: string
	OAUTH_SCOPE: string
	OAUTH_STATE_TTL: number
	OAUTH_PRIVATE_KEY: string
	OAUTH_PUBLIC_KEY: string
	OAUTH_JWT_TTL: number
}

/**
 * Extends {@link OauthEnvVars} with the CLIENT_SECRET
 *
 * @property `OAUTH_CLIENT_SECRET` - The client secret obtained from Google Cloud Console. Used to authenticate this application to Google.
 */
export type OauthEnvVarsSecret = OauthEnvVars & {
	OAUTH_CLIENT_SECRET: string
}


/**
 * The searchparams on the inboud request to this endpoint
 * 
 * @param code A short-lived 'code' provided by Google which can be used to request a long-lived access token. 
 * @param state Technically passed as a base64-encoded string, but can be parsed by {@link State.decrypt()}
*/
export type InboundRequestSearchParams = {
	code: string
	state: State
}


/** 
 * The data sent back to Google to exchange the code for a token
*/
export type OutboundCodeToTokenRequestPayload = {
	code: string;
	client_id: string;
	client_secret: string;
	redirect_uri: string;
	grant_type: 'authorization_code';
}


export const InboundTokenResponsePayloadSchema = z.object({
	access_token: z.string(),
	expires_in: z.number(),
	token_type: z.literal("Bearer"),
	scope: z.string(),
	refresh_token: z.string().optional(),
});
/**
 * The data returned from the Google's token endpoint.
 * @param access_token The access token
 * @param expires_in The number of seconds until the access token expires
 * @param token_type Always set to "Bearer". 
 * @param scope The scope the user has granted us access to (may differ from what we requested)
 * @param refresh_token Only passed if 'access_type' was set to 'offline' (default) by /api/auth/getcode
*/
export type InboundTokenResponsePayload = z.infer<typeof InboundTokenResponsePayloadSchema>;



export const userInfoSchema = z.object({
	email: z.string().email(),
	name: z.string(),
	picture: z.string().url(),
	id: z.string().regex(/^\d+$/).optional(),//'100205282399326678960'
	verified_email: z.boolean().optional(),
	given_name: z.string().optional(),
	family_name: z.string().optional(),
});
/**
 * The data returned from the Google's user info endpoint. It should 
 * return all these values, but marking all except email as optional 
 * so we don't fail validation just because we don't have a picture.
 * 
 * @see https://developers.google.com/identity/sign-in/web/backend-auth
 * 
 * @param email The user's email.
 * @param name The user's first and last name
 * @param picture The URL of the user's profile picture
 * @param id A numerical id... no clue what it is
 * @param verified_email I just this boolean is true if... i don't know
 * @param given_name First name
 * @param family_name Last name
 */
export type UserInfo = z.infer<typeof userInfoSchema>;