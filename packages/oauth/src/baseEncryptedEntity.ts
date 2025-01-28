// import { encrypt, decrypt, sign } from "@local/util-crypto/encryption";
// import { JSONCompatible } from "@local/util-vars/json";




// interface EncryptedEntityStaticMethods<T extends JSONCompatible<any>> {
// 	new(properties: T): BaseEncryptedEntity<T>;
// 	validate(properties: unknown): T;
// 	decrypt(base64: string, publicKey: string): BaseEncryptedEntity<T>;
// 	verify(base64: string, publicKey: string): BaseEncryptedEntity<T>;
// }


// /**
//  * @module @local/oauth/baseEncryptedEntity
//  *
//  * This module provides a base class for handling encryption and decryption of entities.
//  * It is designed to be extended by specific classes like JWT and State, which require
//  * encryption and decryption capabilities.
//  */

// /**
//  * A generic base class for entities that require encryption and decryption.
//  *
//  * @template T - The type of the properties that the entity will hold.
//  */
// export abstract class BaseEncryptedEntity<T extends JSONCompatible<any>> {
// 	protected properties: T;

// 	/**
// 	 * @internal
// 	 * Protected constructor to be used by subclasses.
// 	 *
// 	 * @param properties - The properties of the entity.
// 	 */
// 	constructor(properties: T) {
// 		this.properties = this.validate(properties);
// 	}

// 	/**
// 	 * Validates the format of an unknown object to make sure it conforms the the
// 	 * specific entities properties. 
// 	 * 
// 	 * @returns a JSON-compatible representation of this BaseEncryptedEntity object.
// 	 */
// 	abstract validate(data: unknown): T;

// 	/**
// 	 * Encrypts the entity using the provided private key.
// 	 *
// 	 * @param privateKey - The private key for encryption.
// 	 * @returns a base64 string which can be used as an encrypted token.
// 	 */
// 	encrypt(privateKey: string): string {
// 		return encrypt(this.toJSON(), privateKey);
// 	}

// 	/**
// 	 * Signs the entity using the provided private key. Unlike encryption, signing
// 	 * implies creating a.....
// 	 *
// 	 * @param privateKey - The private key for signing.
// 	 * @returns a base64 string which can be used as a signed token.
// 	 */
// 	sign(privateKey: string): string {
// 		return sign(this.toJSON(), privateKey, this.expiration);
// 	}



// 	/**
// 	 * Converts the entity to a JSON-compatible representation.
// 	 *
// 	 * @returns {T} A JSON-compatible representation of the entity.
// 	 */
// 	toJSON(): T {
// 		return this.properties;
// 	}

// 	/**
// 	 * Returns the expiration timestamp of the entity. If the expiration is not set, 
// 	 * it returns a fallback value of 1 day from now.
// 	 *
// 	 * @returns {number} The expiration timestamp.
// 	 */
// 	get expiration(): number {
// 		const expiration = (this.properties as any).expiration;
// 		const fallback = new Date(Date.now() + 86400000).getTime();
// 		if (!expiration) return fallback;
// 		try {
// 			return new Date(expiration).getTime();
// 		} catch (e) {
// 			return fallback;
// 		}
// 	}

// 	/**
// 	 * Checks if the entity has expired based on its expiration property.
// 	 *
// 	 * @returns {boolean} True if the entity has expired, false otherwise.
// 	 */
// 	hasExpired(): boolean {
// 		return Date.now() > this.expiration;
// 	}



// 	/**
// 	 * Returns the number of seconds until the JWT expires.
// 	 *
// 	 * @returns {number} The number of seconds until the JWT expires.
// 	 */
// 	expiresIn(): number {
// 		return Math.floor((this.expiration - Date.now()) / 1000);
// 	}


// 	static enforceStaticMethod<T extends EncryptedEntityStaticMethods<T>>(this: BaseEncryptedEntity<T>) {
// 		if (typeof this.staticMethod !== 'function') {
// 			throw new Error('Static method "staticMethod" must be implemented.');
// 		}
// 	}

// } 