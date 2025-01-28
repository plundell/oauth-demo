// env.ts
import { z } from 'zod';
import fs from 'fs';

const envSchema = z.object({
    OAUTH_CLIENT_ID: z.string().endsWith(".apps.googleusercontent.com"),
    OAUTH_CLIENT_SECRET: z.string(),
    OAUTH_SCOPE: z.string(),
    OAUTH_STATE_TTL: z.coerce.number().gt(10).lt(600),
    OAUTH_ORIGIN: z.string().url(),
    OAUTH_REDIRECT: z.string().url().refine(
        url => fs.existsSync(`src/app${(new URL(url)).pathname}`)
        , { message: '${input} must be a route which exists in src/app' }
    ),
});

const env = envSchema.parse(process.env);

export default env;
