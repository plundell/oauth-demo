/**
 * @module /oauth/providers/google/gettoken
 * 
 * This module is a complete Next.js route handler. 
 * 
 * @usage 
 * ```
 * import 
 *
 * 
 * ```
 * 
 *  is what Google will redirect the user back to after they've logged in.
 * It takes a short-lived 'code' provided by Google and exchanges it for a long-lived
 * Google-issued JWT. It's the second and final step of the login flow, the first being
 * @see /oauth/providers/google/getcode
 * 
 */

import fetch from "node-fetch";
import { NextResponse, NextRequest } from 'next/server';
import HTMLError from "@local/util-errors-next/HTMLError";
import { State } from '#state';
import { InboundTokenResponsePayloadSchema, userInfoSchema } from "../../types";
import type {
	OauthEnvVarsSecret,
	InboundRequestSearchParams,
	OutboundCodeToTokenRequestPayload,
	InboundTokenResponsePayload,
	UserInfo
} from "#types";
import { JWT } from "#jwt";
import { getKeys } from "#keys";




const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo";



export async function finishOAuth(request: NextRequest, env: OauthEnvVarsSecret): Promise<NextResponse> {
	try {
		//Get the keys using the paths in the env
		const { privateKey, publicKey } = await getKeys(env);

		//Make sure we got the required code from Google and that the state is valid
		const { code, state } = parseInboundRequest(request, publicKey);
		console.log("User authenticated and google sent us a code:", code)
		console.log("After we check it works we'll send the user to: ", state.referer)

		// Use the code (combined with our CLIENT_SECRET) to get an access token. 
		const token = await exchangeCodeForToken(code, env);

		//We now have an access token which means we're authenticated however, why not
		//properly verify it by using it to fetch user info? 		
		const user = await fetchUserInfo(token.access_token);
		console.log("Successfully fetched user info from Google:\n", user)
		//Now we have all the goods, but remember that this is an endpoint not a page. What we
		//want to do it set some headers and redirect the user to wherever the state says
		//they came from
		const response = NextResponse.redirect(state.referer) as NextResponse<void>;

		//Now it's time to create our own token since we don't want to have to check with Google if this
		//user is still logged in - we know it's the right guy now, so from now on we trust ourselves.
		const expiration = Date.now() + env.OAUTH_JWT_TTL * 1000;
		const jwt = JWT.create(user.email, user.name, user.picture, expiration);
		response.cookies.set('jwt', jwt.sign(privateKey), {
			httpOnly: false, //if this is set to true the client won't be able to access the cookie, so they can't check if they're logged in
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			expires: new Date(expiration)
		});

		return response;

	} catch (e: unknown) {
		const err: HTMLError = (!(e instanceof HTMLError) ?
			new HTMLError(500, "Unknown server error.", { cause: e })
			: e as HTMLError
		);
		return err.toResponse(); //this will print the cause and create a NextResponse
	}

}





function parseInboundRequest(req: NextRequest, privateKey: string): InboundRequestSearchParams {
	const code = req.nextUrl.searchParams.get("code");
	if (!code) {
		throw new HTMLError(400, "No authorization code provided in request searchparams.");
	}
	const stateString = req.nextUrl.searchParams.get("state");
	if (!stateString) {
		throw new HTMLError(400, "No state provided in request searchparams.");
	}

	//Decrypt the state and check if it's expired
	const state = State.decrypt(stateString, privateKey);
	if (state.hasExpired()) {
		throw new HTMLError(401, "State has expired. Time limit between /api/auth/getcode " +
			"and /api/auth/gettoken exceeded. Please try again.");
	}

	return { code, state };
}



/**
 * Makes a request to the Google's token endpoint to exchange a short-lived 'code'
 * returned from their authorization endpoint for a long-lived access token.
 *
 * @param code The code returned from Google's authorization endpoint
 * @return A promise which resolves to a `TokenData` object containing the access token
 * @throws `HTMLError` If Google responds with an error
 * @throws `Error` If the request fails or the response can't be parsed. The error will have a `.cause` property set to the error which caused it.
 * @async
 */
async function exchangeCodeForToken(code: string, env: OauthEnvVarsSecret): Promise<InboundTokenResponsePayload> {

	//Construct the payload (outside the try block so we can access it in the catch block)
	const params: OutboundCodeToTokenRequestPayload = {
		code,
		client_id: env.OAUTH_CLIENT_ID,
		client_secret: env.OAUTH_CLIENT_SECRET,
		redirect_uri: env.OAUTH_REDIRECT, //same as the one in /api/auth/getcode, but not used for anything
		grant_type: "authorization_code",
	}

	try {

		//Make the request
		const res = await fetch(TOKEN_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams(params),
		});

		//If the request failed, throw and pass the error along to the client
		//TODO: Do we want that?
		if (!res.ok) {
			throw new HTMLError(res.status, await res.text());
		}

		//TODO: Are we technically authenticated now?

		//Ok, request was good, that means we should have a JSON response
		//which we parse into a known format.
		const payload = await res.json();
		const tokenPayload = InboundTokenResponsePayloadSchema.parse(payload);

		//Now we have a typed and verified payload which we can return, but first
		//we want to check that the user granted us the scope we requested and to
		//format the items the scope to conform with env.OAUTH_SCOPE
		formatListOfScopes(tokenPayload, env);

		return tokenPayload;

	} catch (e) {
		if (e instanceof HTMLError)
			throw e;
		else {
			//Hide the secret, then create and throw an error
			params.client_secret = params.client_secret.slice(0, 4) + "...";
			throw new Error(`Request to ${TOKEN_URL} failed. Payload sent was:\n${JSON.stringify(params)}`, { cause: e });
		}
	}

}

/**
 * The scopes requested are usually in the form `openid email profile`, but google
 * seems to store them like `openid https://www.googleapis.com/auth/userinfo.email 
 * https://www.googleapis.com/auth/userinfo.profile`. Since we might want to use
 * the list to actually check what we're allowed to do it's better if it's in a 
 * format we expect.
 * 
 * @param tokenPayload The .scope field of this object is altered.
 */
function formatListOfScopes(tokenPayload: InboundTokenResponsePayload, env: OauthEnvVarsSecret): void {
	const reqScopes = env.OAUTH_SCOPE.split(" ")
	const grantScopes = tokenPayload.scope.split(" ")
	const scopes: string[] = []
	for (let req of reqScopes) {
		for (let i of grantScopes.keys()) {
			if (grantScopes[i].endsWith(req)) {
				scopes.push(req);
				grantScopes.splice(i, 1);
				break;
			}
		}
		tokenPayload.scope = scopes.join(" ");
	}
}

/**
 * Fetches the user info from Google using the access token.
 *
 * @param accessToken The access token obtained from `exchangeCodeForToken`
 * @return A promise which resolves to a `UserInfo` object containing the user's info
 * @throws `Error` If the request fails or the response can't be parsed. The error will have a `.cause` property set to the error which caused it.
 * @async
 */
async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
	try {
		const res = await fetch(`${USERINFO_URL}?access_token=${accessToken}`);
		if (!res.ok) {
			throw new HTMLError(res.status, await res.text());
		}
		const payload = await res.json();
		const partialUserInfo = userInfoSchema.partial().parse(payload);
		const userInfo = Object.assign({ email: "unknown@unknown.com", name: "Unknown Person", picture: "" }, partialUserInfo);
		return userInfo;
	} catch (e) {
		if (e instanceof HTMLError)
			throw e
		else
			throw new HTMLError(500, `Unknown Error. Failed to get user info using access token:\n${accessToken}\n`, { cause: e });
	}
}



