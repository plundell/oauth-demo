# Example.com

Back to monorepo [root](../../../README.md).

This is one of two sites in this project. It's a simple Next.js site which uses the OAuth package to authenticate users.

**DISCLAIMER**: This site doesn't redirect the user correctly after authentication. See [foo.com](./../foo.com/README.md) instead (I'm just keeping this site here two show that the oauth package works with multiple sites).

## Usage

Start by reading the [README](../../README.md) in the root of the project to set everything up, then run `npm run dev` in this dir and open your browser to http://example.com:3000 (localhost:3000 will work to load the site, but google will say no because you didn't configure that origin for that oauth client).


