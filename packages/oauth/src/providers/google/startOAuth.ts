/**
 * @module @local/oauth/providers/google/getcode
 * 
 * This is the endpoint which starts the OAuth flow. It ultimately
 * redirects the user to https://accounts.google.com/o/oauth2/v2/auth
 * using Next.js's redirect() function: 
 *   https://nextjs.org/docs/app/api-reference/functions/redirect
 * 
 * See also {@link @local/oauth/providers/google/gettoken} which handles the 
 * next and final step of the flow
 */
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { cookies, headers } from 'next/headers'
import { State } from '#state';
import type { OauthEnvVars } from '../../types'
import HTMLError from '@local/util-errors-next/HTMLError';
import { getKeys } from "#keys";
import { getReferer, isUserAuthenticated } from "#headers";
import { JWT } from '#jwt';



export async function startOAuth(request: NextRequest, env: OauthEnvVars) {
	console.log("Starting OAuth flow");
	const jwt = await isUserAuthenticated(request, env)
	if (jwt) {
		console.log(`User ${jwt.email} already authenticated. Skipping rest of OAuth flow.`);
		redirect(await getReferer(request));
	}

	//If we're here, the user doesn't have a JWT cookie, so we need to start the OAuth flow

	//Start building the redirect url
	const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

	try {
		//We're going to want the referer header to know where to send the user after login.
		//We'll use it to create a State object (which also contains an expiration timestamp
		//and is encrypted to prevent cross-site request forgery)
		const referer = await getReferer(request);
		const state = State.create(referer, env.OAUTH_STATE_TTL);


		//Since our client is a 'web server app' we need to set the 'response_type' to 'code'
		//  https://developers.google.com/identity/protocols/oauth2/web-server#request-parameter-response_type
		authUrl.searchParams.set('response_type', 'code');

		//The state get's turned into an encrypted base64 string
		const { privateKey } = await getKeys(env);
		authUrl.searchParams.set('state', state.encrypt(privateKey));

		//After authentication Google should redirect the user the the next part
		//of the login flow, namely file://./../gettoken/route.ts 
		authUrl.searchParams.set('redirect_uri', env.OAUTH_REDIRECT);

		//The CLIENT_ID is a public key obtained from https://console.cloud.google.com/auth/clients
		authUrl.searchParams.set('client_id', env.OAUTH_CLIENT_ID);

		//The scope is a comma-separated list of scopes we want access to. It must be a subset
		//of the scopes we've listed on https://console.cloud.google.com/auth/scopes
		authUrl.searchParams.set('scope', env.OAUTH_SCOPE);

	} catch (e: unknown) {
		const err: HTMLError = (!(e instanceof HTMLError)
			? new HTMLError(500, "Something went wrong when trying to redirect you " +
				"to start the OAuth login flow. Developers should check server logs.", { cause: e })
			: e as HTMLError
		);
		return err.toResponse(); //this will print the cause and create a NextResponse
	}

	//Now redirect the user. Since we're in what Next.js refers to as a "Route Handler"
	//this will serve a 307 (Temporary Redirect) to the user. Next.js also wants us to
	//call this after the try/catch block above (see link at top of file)
	redirect(authUrl.toString());
}


