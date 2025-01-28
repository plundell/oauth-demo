/**
 * An extension of the Error class which adds HTML error codes and should
 * always be suitable to return to the user.
 * 
 * //TODO: add a method to print any causing error before this is sent to user
 */
import { NextResponse } from "next/server";
const defaultCode = 500;

export default class HTMLError extends Error {
    #code: number = defaultCode;
    get code(): number {
        return this.#code;
    }
    /**
     * Sets the HTTP error code for this error. 
     * @param value The error code to set
     */
    set code(value: number) {
        this.#code = HTMLError.#getcode(value).code;
    }
    /**
     * The official name of the error with this code
     */
    get name(): string {
        return HTMLError.#getcode(this.#code).name;
    }

    /**
     * The description of the error as stated by https://www.w3schools.com/tags/ref_httpmessages.asp
     */
    get description(): string {
        return HTMLError.#getcode(this.#code).description;
    }

    /**
     * Verifies that an unknown number is a valid error code and returns
     * an object with the code, name and description
     */
    static #getcode(code: number): { code: number, name: string, description: string } {
        //this will never happen, but it looks nicer
        if (!(code in HTMLError.codes)) {
            console.error(`Unknown error code: ${String(code)}, defaulting to ${defaultCode}.`);
            code = defaultCode;
        }
        return (HTMLError.codes as any)[code];
    }
    constructor(code: number, message?: string, options?: ErrorOptions) {
        super(message || HTMLError.#getcode(code).description, options);
        this.code = code;

    }

    toResponse(): NextResponse {
        if (this.cause) {
            console.error("Responding with error:\n", this.code, this.message, "\nCaused by:\n", this.cause);
        }
        return NextResponse.json({ error: this.message }, { status: this.code });
    }



    /**
     * All the valid HTML error codes and their descriptions
     */
    static codes = {
        400: { code: 400, name: "Bad Request", description: "The request cannot be fulfilled due to bad syntax" }
        , 401: { code: 401, name: "Unauthorized", description: "The request was a legal request, but the server is refusing to respond to it. For use when authentication is possible but has failed or not yet been provided" }
        , 402: { code: 402, name: "Payment Required", description: "Reserved for future use" }
        , 403: { code: 403, name: "Forbidden", description: "The request was a legal request, but the server is refusing to respond to it" }
        , 404: { code: 404, name: "Not Found", description: "The requested page could not be found but may be available again in the future" }
        , 405: { code: 405, name: "Method Not Allowed", description: "A request was made of a page using a request method not supported by that page" }
        , 406: { code: 406, name: "Not Acceptable", description: "The server can only generate a response that is not accepted by the client" }
        , 407: { code: 407, name: "Proxy Authentication Required", description: "The client must first authenticate itself with the proxy" }
        , 408: { code: 408, name: "Request Timeout", description: "The server timed out waiting for the request" }
        , 409: { code: 409, name: "Conflict", description: "The request could not be completed because of a conflict in the request" }
        , 410: { code: 410, name: "Gone", description: "The requested page is no longer available" }
        , 411: { code: 411, name: "Length Required", description: "The 'Content-Length' is not defined. The server will not accept the request without it " }
        , 412: { code: 412, name: "Precondition Failed", description: "The precondition given in the request evaluated to false by the server" }
        , 413: { code: 413, name: "Request Too Large", description: "The server will not accept the request, because the request entity is too large" }
        , 414: { code: 414, name: "Request-URI Too Long", description: "The server will not accept the request, because the URI is too long. Occurs when you convert a POST request to a GET request with a long query information " }
        , 415: { code: 415, name: "Unsupported Media Type", description: "The server will not accept the request, because the media type is not supported " }
        , 416: { code: 416, name: "Range Not Satisfiable", description: "The client has asked for a portion of the file, but the server cannot supply that portion" }
        , 417: { code: 417, name: "Expectation Failed", description: "The server cannot meet the requirements of the Expect request-header field" }
        , 500: { code: 500, name: "Internal Server Error", description: "A generic error message, given when no more specific message is suitable" }
        , 501: { code: 501, name: "Not Implemented", description: "The server either does not recognize the request method, or it lacks the ability to fulfill the request" }
        , 502: { code: 502, name: "Bad Gateway", description: "The server was acting as a gateway or proxy and received an invalid response from the upstream server" }
        , 503: { code: 503, name: "Service Unavailable", description: "The server is currently unavailable (overloaded or down)" }
        , 504: { code: 504, name: "Gateway Timeout", description: "The server was acting as a gateway or proxy and did not receive a timely response from the upstream server" }
        , 505: { code: 505, name: "HTTP Version Not Supported", description: "The server does not support the HTTP protocol version used in the request" }
        , 511: { code: 511, name: "Network Authentication Required", description: "The client needs to authenticate to gain network access" }
    }
}

