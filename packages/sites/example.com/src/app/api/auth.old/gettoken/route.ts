/**
 * GetToken Endpoint
 * 
 * This endpoint is what Google will redirect the user back to after they've logged in.
 * It takes a short-lived 'code' provided by Google and exchanges it for a long-lived
 * Google-issued JWT. It's the second and final step of the login flow, the first being
 * @see /login
 * 
 * 
 */

import fetch, { Response as FetchResponse } from "node-fetch";
import { NextResponse, NextRequest } from 'next/server';
import HTMLError from "@local/helpers-next/errors/HTMLError";
import { State } from '../_common/State';
import env from "@local/website/env"
import { z } from "zod";



const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo";



/**
 * The searchparams on the inboud request to this endpoint
 * 
 * @param code A short-lived 'code' provided by Google which can be used to request a long-lived access token. 
 * @param state Technically passed as a base64-encoded string, but can be parsed by {@link State.decrypt()}
*/
type InboundRequestSearchParams = {
    code: string
    state: State
}


/** 
 * The data sent back to Google to exchange the code for a token
*/
type OutboundCodeToTokenRequestPayload = {
    code: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    grant_type: 'authorization_code';
}


const InboundTokenResponsePayloadSchema = z.object({
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
type InboundTokenResponsePayload = z.infer<typeof InboundTokenResponsePayloadSchema>;

const parseInboundTokenResponsePayload = (payload: unknown): InboundTokenResponsePayload => {
    return InboundTokenResponsePayloadSchema.parse(payload);
}

const userInfoSchema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    picture: z.string().url().optional(),
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
type UserInfo = z.infer<typeof userInfoSchema>;



export async function GET(request: NextRequest) {
    try {

        //Make sure we got the required code from Google and that the state is valid
        const { code, state } = parseInboundRequest(request);
        console.log("User authenticated and google sent us a code:", code)
        console.log("After we check it works we'll send the user to: ", state.referer)

        // Use the code (combined with our CLIENT_SECRET) to get an access token. 
        const token = await exchangeCodeForToken(code);

        //We now have an access token which means we're authenticated however, why not
        //properly verify it by using it to fetch user info? 
        const user = await fetchUserInfo(token.access_token);
        console.log("Successfully fetched user info from Google:\n", user)
        //Now we have all the goods, but remember that this is an endpoint not a page. What we
        //want to do it set some headers and redirect the user to wherever the state says
        //they came from
        const response = NextResponse.redirect(state.referer);
        response.cookies.set('accessToken', token.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24, // 1 day
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


function parseInboundRequest(req: NextRequest): InboundRequestSearchParams {
    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
        throw new HTMLError(400, "No authorization code provided in request searchparams.");
    }
    const stateString = req.nextUrl.searchParams.get("state");
    if (!stateString) {
        throw new HTMLError(400, "No state provided in request searchparams.");
    }
    const state = State.decrypt(stateString);
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
async function exchangeCodeForToken(code: string): Promise<InboundTokenResponsePayload> {

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
        const tokenPayload = parseInboundTokenResponsePayload(payload);

        //Now we have a typed and verified payload which we can return, but first
        //we want to check that the user granted us the scope we requested and to
        //format the items the scope to conform with env.OAUTH_SCOPE
        formatListOfScopes(tokenPayload);

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
function formatListOfScopes(tokenPayload: InboundTokenResponsePayload): void {
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



