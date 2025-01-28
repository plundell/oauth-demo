# Foo.com

Back to monorepo [root](../../../README.md).

This is one of two sites in this project. It's a simple Next.js site which uses the OAuth package to authenticate users.

Unlike example.com, this site redirects the user correctly after authentication because it uses a popup window for the oauth flow instead of redirecting the whole window.

## Usage

Start by reading the [README](../../README.md) in the root of the project to set everything up, then run `npm run dev` in this dir and open your browser to http://foo.com:3000 (localhost:3000 will work to load the site, but google will say no because you didn't configure that origin for that oauth client).


## Structure


| Directory | Description |
|-------------------------|-----------------------------------------------------------------------------|
| `src/app/` | We're using the Next.js' _App Router_, so all the pages and api's are nested under this folder |
| `src/app/api/` | Contains what Next.js refers to as _route handlers_ which are effectively API endpoints |
| `src/app/api/auth/` | OAuth authentication endpoints which are just wrappers around the [OAuth package](../../../util/oauth/README.md). |
| `src/app/api/account-data/` | Example endpoint which fetches data from backend if user is logged in. |
| `src/app/(logged-in)/` | Groups pages that require authentication. The () imply it's not part of the routing path. |
| `src/app/about/` | Contains the 'About' page which doesn't need authentication. |
| `src/components/` | Contains reusable UI components which need to be imported into the pages in `src/app/`. |
| `src/context/` | Contains context providers for managing global state. |


| File | Description |
|-------------------------|-----------------------------------------------------------------------------|
| `src/app/(logged-in)/layout.tsx` | Applies the privacy screen to all these pages by checking the AuthContext. |
| `src/app/layout.tsx` | Defines overall layout of app. Inserts navbar and wraps everything in AuthContext (see below) |
| `src/app/page.tsx` | The main entry page for the application. |
| `src/components/navbar.tsx` | The navigation bar component. |
| `src/components/privacy-screen.tsx` | The privacy screen which covers pages that require authentication. |
| `src/context/AuthContext.tsx` | Manages authentication state and logic. **This is where Oauth is enforced and interacted with** |
| `src/app/api/auth/start-oauth.ts` | The OAuth endpoint which starts the OAuth flow. This is what the login() function in `AuthContext.tsx` calls. |
| `src/app/api/auth/finish-oauth.ts` | The OAuth endpoint which finishes the OAuth flow. This is where google redirects the user after start-oauth is complete. |