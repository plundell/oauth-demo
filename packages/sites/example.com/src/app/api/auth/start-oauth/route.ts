import { NextRequest } from 'next/server';
import { startOAuth } from '@local/oauth/providers/google/startOAuth';
import env from '#env';

/**
 * @route GET /api/auth/start-oauth
 * 
 * @returns {Promise<void>} This endpoint will redirect the user to the OAuth provider or
 *  redirect them to the referer if they're already logged in
 */
export async function GET(request: NextRequest): Promise<void> {
	return startOAuth(request, env)
}