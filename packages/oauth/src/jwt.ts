import { sign, verify } from "@local/util-crypto/encryption";
import { JSONCompatible } from "@local/util-vars/json";

/**
 * @module @local/oauth/jwt
 *
 * This module contains a class for handling JSON Web Tokens (JWT) with encryption and decryption.
 * The JWT class includes fields for email, name, picture, and expiration.
 */

/**
 * @type JWTProperties - The public properties of a JWT object.
 * @field email - The email of the user.
 * @field name - The name of the user.
 * @field picture - The picture URL of the user.
 * @field expiration - Date.now() when the JWT expires.
 */
type JWTProperties = JSONCompatible<{
	email: string;
	name: string;
	picture: string;
	expiration: number;
}>;

/**
 * A class representing a JSON Web Token (JWT) with encryption and decryption capabilities.
 *
 * This class has a private constructor, so use either {@link JWT.create()} or {@link JWT.decrypt()} to create an instance.
 */
export class JWT implements JWTProperties {
	email: string;
	name: string;
	picture: string;
	expiration: number;

	/**
	 * @internal
	 * Private constructor. Use either {@link JWT.create()} or {@link JWT.decrypt()}.
	 *
	 * @param email - The email of the user.
	 * @param name - The name of the user.
	 * @param picture - The picture URL of the user.
	 * @param expiration - The number of milliseconds since epoch when the JWT expires.
	 */
	private constructor(email: string, name: string, picture: string, expiration: number) {
		this.email = email;
		this.name = name;
		this.picture = picture;
		this.expiration = expiration;
	}

	/**
	 * Creates a new JWT object.
	 *
	 * @param email - The email of the user.
	 * @param name - The name of the user.
	 * @param picture - The picture URL of the user.
	 * @param ttl - The number of seconds from now after which the JWT expires.
	 *
	 * @returns a new JWT object.
	 */
	static create(email: string, name: string, picture: string, ttl: number): JWT {
		return new JWT(email, name, picture, Date.now() + Math.floor(Math.abs(ttl * 1000)));
	}

	/**
	 * Encrypts this JWT object using the provided private key.
	 *
	 * @param privateKey - The private key for encryption.
	 * @returns a base64 string which can be used as a JWT token.
	 */
	sign(privateKey: string): string {
		return sign(this.toJSON(), privateKey, this.expiresIn());
	}

	/**
	 * Decrypts a base64 encoded string which was created by {@link JWT.encrypt()}.
	 *
	 * @param base64 - A base64 string which should contain a JWT object.
	 * @param publicKey - The public key for decryption.
	 * @returns a new JWT object parsed from the base64 string.
	 *
	 * @throws `Error` If unable to decrypt (i.e., it wasn't encrypted by us).
	 */
	static verify(base64: string, publicKey: string): JWT {
		const { email, name, picture, expiration } = verify(base64, publicKey, JWT.#validate);
		return new JWT(email, name, picture, expiration);
	}

	/**
	 * Used by {@link JWT.decrypt()} to validate the format of the decrypted and deserialized data.
	 *
	 * @returns a JSON-compatible representation of this JWT object.
	 */
	static #validate(data: unknown): JWTProperties {
		if (data && typeof data === 'object') {
			if ("email" in data && "name" in data && "picture" in data && "expiration" in data) {
				if (typeof data.email === 'string' && typeof data.name === 'string' && typeof data.picture === 'string') {
					if (!isNaN(Number(data.expiration))) {
						return {
							email: data.email,
							name: data.name,
							picture: data.picture,
							expiration: Number(data.expiration)
						};
					}
				}
			}
		}
		throw new Error('Not valid JWT data: ' + JSON.stringify(data));
	}

	/**
	 * Returns a JSON-compatible representation of this JWT object for serialization/deserialization.
	 *
	 * @returns {JWTProperties} An object containing the email, name, picture, and expiration timestamp.
	 */
	toJSON(): JWTProperties {
		return {
			email: this.email,
			name: this.name,
			picture: this.picture,
			expiration: this.expiration
		};
	}


	/**
	 * Returns the number of seconds until the JWT expires.
	 *
	 * @returns {number} The number of seconds until the JWT expires.
	 */
	expiresIn(): number {
		return Math.floor((this.expiration - Date.now()) / 1000);
	}



	/**
	 * Checks if the JWT has expired.
	 *
	 * @returns {boolean} True if the JWT has expired, false otherwise.
	 */
	hasExpired(): boolean {
		return Date.now() > this.expiration;
	}
}
