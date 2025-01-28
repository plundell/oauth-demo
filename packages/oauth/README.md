# OAuth Mixin

Back to monorepo [root](../../README.md).

This package can be imported into any Next.js project to provide OAuth authentication. 



## Directory Structure

| File | Description |
|------|-------------|
| `src/headers.ts` | Manages HTTP headers related to OAuth requests |
| `src/jwt.ts` | Handles JSON Web Token (JWT) creation and validation |
| `src/state.ts` | Manages the state parameter used in OAuth flows to prevent CSRF attacks |
| `src/baseEncryptedEntity.ts` | Unfinished attempt to write abstract parent class for jwt and state |
| `src/keys.ts` | Manages cryptographic keys used in OAuth processes |
| `src/types.ts` | Contains TypeScript type definitions used across the OAuth package |
| `src/providers/google/startOAuth.ts` | Initiates the OAuth process with Google |
| `src/providers/google/finishOAuth.ts` | Completes the OAuth process and handles token exchange |

## Usage

To use this package in another package in this monorepo just run:

```bash
npm install @local/oauth
```

