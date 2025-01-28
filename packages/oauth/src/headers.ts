import { JWT } from "#jwt";
import { getKeys } from "#keys";
import { OauthEnvVars } from "#types";
import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";

export async function getReferer(request: NextRequest): Promise<string> {
	const origin = request.nextUrl.origin;
	const headersList = await headers();
	const referer = new URL(headersList.get('referer') || origin, origin).toString();
	return referer;
}

/**
 * Checks if the user has a JWT cookie, signed by us, which is not expired. 
 * If so then he's authenticated!
 * 
 * @param request - The request object
 * @param env - The environment variables
 * 
 * @returns True if the user is authenticated, false otherwise
 */
export async function isUserAuthenticated(request: NextRequest, env: OauthEnvVars): Promise<JWT | null> {
	const cookieStore = await cookies();
	const jwtCookie = cookieStore.get('jwt');
	if (jwtCookie) {
		const { publicKey } = await getKeys(env);
		try {
			const jwt = JWT.verify(jwtCookie.value, publicKey); //he has a key...
			console.log("jwt", jwt)
			if (!jwt.hasExpired()) { //it's not expired....
				//This means he's already logged in, so we redirect to the referer which is
				//otherwise what @local/oauth/providers/google/gettoken would do
				return jwt;
			}
		} catch (e) {
			console.warn(e);
			console.warn("Someone tried to use a JWT not signed by us. DANGER!");
			console.warn(jwtCookie)
		}
	}
	return null;
}