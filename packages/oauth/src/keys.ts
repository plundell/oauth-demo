import { OauthEnvVars } from "#types";
import { readWriteKeyPair, KeyPair } from "packages/util/crypto/src/keys";

//We'll cache the keys in memory to avoid repeated file system reads
var keys: KeyPair | undefined = undefined;


/**
 * Retrieves or initializes the encryption key pair used for JWT and State encryption/decryption.
 * This function caches the keys in memory to avoid repeated file system reads.
 * 
 * @param env - Environment variables containing paths to public/private key files
 * @throws {Error} If keys cannot be read from the specified paths
 * @returns Promise resolving to a KeyPair containing public and private keys
 */

export async function getKeys(env: OauthEnvVars): Promise<KeyPair> {
	if (!keys) {
		keys = await readWriteKeyPair({
			private: env.OAUTH_PRIVATE_KEY,
			public: env.OAUTH_PUBLIC_KEY
		});
	}
	return keys;
}