# OAuth Demo App

This is a demo of how one might add "Login with Google" to a Next.js app without using a library.

## Design Criteria

- TypeScript
- Next.js 15 with App Router
- OAuth authentication using Google
- Mono-repo structure with functionality split across packages

## Project Structure

This is a monorepo, as such it can support multiple seperate APIs and sites. To allow fine-grained control over which packages are included in which final resource we create seperate npm packages which we then _require into eachother_ (for some reason npm calls nested packages _workspaces_ so we've configed that in `package.json`). 

This is the overall folder structure:

| Path | Description |
|------|-------------|
| `./tsconfig.root.json` | TypeScript configuration for the project. Every package is configured to use this root tsconfig so we get the same compiler options for all packages. |
| `./packages` | Contains all the packages used in the project. |
| `./packages/oauth` | OAuth package for handling authentication. [See below](#oauth) |
| `./packages/util` | Utility packages for various functionalities. |
| `./packages/sites` | Contains 2 deployable Next.js apps which make use of the other packages. |

### OAuth

This package actually handles the OAuth authentication. Check out it's [README](./packages/oauth/README.md) for more details.

I decided to make this a mixin rather than a seperate API. Both work. This is a simpler design, but if you're doing a big ecosystem you'll likely want to have a seperate API which handles OAuth for all other resources.

### Sites
These are the resulting _resources_, which happen to be Next.js GUI sites. I've created 2 to show how both case use the same OAuth package.

| Path | Description |
|------|-------------|
| `./packages/sites/example.com` | Example site configuration and code. [README](./packages/sites/example.com/README.md) |
| `./packages/sites/foo.com` | Foo site configuration and code. [README](./packages/sites/foo.com/README.md) |

### Utils
Utility packages which provide various functions. Now I've just created a few for reference to show the functionality; in a real project you'd likely have a lot more and they'd be larger as well.

| Path | Description |
|---------|-------------|
| `./packages/util/vars` | Utility for handling variables. [README](./packages/util/vars/README.md) |
| `./packages/util/errors-next` | Next.js specific error handling utilities. [README](./packages/util/errors-next/README.md) |
| `./packages/util/errors` | General error handling utilities. [README](./packages/util/errors/README.md) |
| `./packages/util/crypto` | Cryptographic utilities for encryption and decryption. [README](./packages/util/crypto/README.md) |

## Usage
To use this demo, follow these steps:

### 1. Set up Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the OAuth2 API if not already enabled
4. Do the following for both _example.com_ and _foo.com_:
 - Go to "Credentials" and click "Create Credentials" > "OAuth 2.0 Client ID"
 - Select "Web application" as the application type
 - Add authorized JavaScript origins, eg. `http://example.com:3000`
 - Add authorized redirect URIs which is the same origin as above, and then the path to the _finish-oauth_ endpoint: `http://example.com:3000/api/auth/finish-oauth` 
 - Click "Create" and note down your **Client ID** and **Client Secret**

### 2. Configure Environment and Run

Create a `.env` file in the root of each site package by copying the `.env.template` file and filling in OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET from above.

Since we're using _example.com_ as the origin instead of localhost you'll need to configure your hosts file to point _example.com_ to localhost, on Windows this is `C:\Windows\System32\drivers\etc\hosts` and on Mac/Linux it's `/etc/hosts`; just add the following lines:
```
127.0.0.1 example.com
127.0.0.1 foo.com
```

Now you're ready to roll. Run the site with `npm run dev` in the root of the site package.







