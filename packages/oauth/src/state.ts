/**
 * @module @local/oauth/state
 * 
 * This file contains a class which can be passed along with the user's request to the auth server in 
 * an encrypted format. It allows us to:
 *  - keep track of the referer the user will be sent to after login
 *  - increase security by preventing cross-site request forgery
 * 
 * @see https://developers.google.com/identity/protocols/oauth2/web-server#request-parameter-state
 */
import { encrypt, decrypt } from "@local/util-crypto/encryption";
// import { readWriteKeyPair } from "@local/util-crypto/keys";
import { JSONCompatible } from "@local/util-vars/json";


//Generate or reuse a key pair which we'll use to encrypt/decrypt the state. It doesn't
//really matter if we create new keys every time we start the server since the ttl of
//the state is short (shouldn't be more than a few minutes).
// const { publicKey, privateKey } = readWriteKeyPair({
// 	outdir: "./"
// 	, prefix: "oauth-test-"
// });
//dev-note palun 2025-01-25: when decrypting i got error code: 'ERR_OSSL_RSA_INVALID_PADDING' 
//which I think has to do with new keys being generated between requests which it shouldn't
//be doing, but perhaps it's got something to do with next or react... anyway, adding a mode
//which disables generation of new keys to see if it helps (ie. it will fail when run on a new machine)

/**
 * @type StateProperties - The public properties of a State object. See {@link State}.
 * @field referer - The URL the user will be sent to after login
 * @field expiration - Date.now() when the state expires. 
 */
type StateProperties = JSONCompatible<{
	referer: string;
	expiration: number;
}>;



/**
 * A class which can be passed along with the user's request to the auth server in 
 * an encrypted format. 
 * 
 * This class has a private constructor, so use either {@link State.create()} 
 * or {@link State.decrypt()} to create an instance.
 * 
 * @example Create a new State object and attach it encrypted to a redirect
 * ```
 * const state = State.create("https://example.com", 60);
 * redirect(`https://accounts.google.com/o/oauth2/v2/auth?state=${state.encrypt()}&...`);
 *    
 * ```
 * @example
 * ```
 * const state = State.fromString("https://example.com,1234");   
 * ```
 * 
 */
export class State implements StateProperties {
	referer: string;
	expiration: number;

	/**
	 * @internal
	 * Private constructor. Use either {@link State.create()} or {@link State.decrypt()} 
	 * 
	 * @param referer the URL the user will be sent to after login
	 * @param expiration the number of milliseconds since epoch when the state expires
	 * 
	 * NOTE: No checks are performed
	 */
	private constructor(referer: string, expiration: number) {
		this.referer = referer;
		this.expiration = expiration;
	}

	/**
	 * Creates a new State object from a 'referer' string.
	 * 
	 * @param referer the URL the user will be sent to after login
	 * @param ttl the number of seconds from nowafter which the state expires
	 * 
	 * @returns a new State object
	 */
	static create(referer: string, ttl: number): State {
		return new State(referer, Date.now() + Math.floor(Math.abs(ttl * 1000)));
	}


	/**
	 * Encrypts this State object using the private key we generated earlier.
	 * 
	 * @returns a base64 string which can be used as the 'state' parameter in a 
	 *          redirect to the auth server. This string can be decrypted later
	 *          to get back the original State object using {@link State.decrypt()}.
	 */
	encrypt(privateKey: string): string {
		return encrypt(this.toJSON(), privateKey);
	}



	/**
	 * Decrypts a base64 encoded string which was created by {@link State.encrypt()}
	 * 
	 * @param base64 a base64 string which should contain a State object
	 * 
	 * @returns a new State object parsed from the base64 string
	 * 
	 * @throws `Error` If we're unable to decrypt (ie. it wasn't encrypted by us)
	 */
	static decrypt(base64: string, publicKey: string): State {
		//Decrypt the base64 string and validate it's format. This does not 
		//check if the referer is a valid URL or if it has expired
		const { referer, expiration } = decrypt(base64, publicKey, State.#validate);

		return new State(referer, expiration);
	}


	/**
	 * Used by {@link State.decrypt()} to validate the format of the 
	 * decrypted and deserialized data to make sure we can create a 
	 * new State object from it.
	 * 
	 * NOTE: This will NOT check if the state is expired
	 * 
	 * @returns a JSON-compatible representation of this State object
	 */
	static #validate(data: unknown): StateProperties {
		if (data && typeof data === 'object') {
			if ("referer" in data && "expiration" in data) {
				if (typeof data.referer == 'string') {
					if (!isNaN(Number(data.expiration))) {
						return {
							referer: data.referer,
							expiration: Number(data.expiration)
						}
					}
				}
			}
		}
		throw new Error('Not valid State data: ' + JSON.stringify(data));
	}

	/**
	 * Returns a JSON-compatible representation of this State object
	 * that can be used for serialization/deserialization.
	 * 
	 * @returns {StateProperties} An object containing the referer URL and expiration timestamp
	 */
	toJSON(): StateProperties {
		return {
			referer: this.referer,
			expiration: this.expiration
		}
	}

	hasExpired(): boolean {
		return Date.now() > this.expiration;
	}


}