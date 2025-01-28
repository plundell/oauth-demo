# Google OAuth 2.0 

These endpoints are used to authenticate users with Google OAuth 2.0.


## The login flow
They work on the principle of redirecting the user to Google and then having Google redirect the user back to us.

Depending on the type of client (web app, desktop app, or mobile app) this process may contain more or less steps. Our client is what Google refers to as a **web server app** (as opposed to a *web client app* which has no backend component), the practical implication of which is that there will be _2 steps_.

