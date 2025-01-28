/**
 * @module @local/util-crypto/keys
 * 
 * This module contains a function for generating a key pair
 * which can be used for encryption and decryption. It also 
 * handles saving or reading keys from disk as needed (so you
 * can call the same function every time, including the first time)
 * 
 * @export {@link generate} - Generate a key pair without saving to disk
 * @export {@link readKeyFile} - Read a single key file and make sure it contains a key
 * @export {@link readKeyPair} - Read a key pair from disk, validate, and return
 * @export {@link readWriteKeyPair} - Generate and save on first call, read from disk on subsequent calls
 */
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import BUG from '@local/util-errors/BUG';




/**
 * @type KeyPair - Contents of cryptographic key files.
 * @field `publicKey` - The contents of a public key file. 
 * @field `privateKey` - The contents of a private key file. 
 */
export type KeyPair = {
	publicKey: string;
	privateKey: string;
}



const defaultPathOptions = {
	outdir: './',
	prefix: '',
	public: 'public',
	private: 'private',
}
/**
 * @type PathOptions - Options for {@link readKeyPair} and {@link readWriteKeyPair}.
 * 
 * @field `outdir` - The directory where the key pair should be saved. Only used if absolute paths are not provided.
 * @field `prefix` - A prefix to use on both key files. Will be used even if absolute paths are provided so leave empty if you don't want to use a prefix.
 * @field `public` - The full or partial path to the public key file.
 * @field `private` - The full or partial path to the private key file.
 */
type PathOptions = Partial<typeof defaultPathOptions>


/**
 * Parse a partial set of paths options to get absolute paths to 
 * both key files.
 * 
 * @param pathOptions - The partial options to parse.
 * 
 * @returns The absolute paths to the public and private key files
 * 
 * @throws {Error} If the mode isn't recognized.
 */
function parseOptions(pathOptions?: PathOptions) {
	//Combine passed in options with defaults
	const options = { ...defaultPathOptions, ...pathOptions };

	//Then make sure we have a full path for each key
	for (const k of ['public', 'private'] as (keyof PathOptions)[]) {
		//Grab the components...
		const ext = path.extname(options[k]||'') || '.pem';
		const base = path.basename(options[k]||'', ext)||k;
		const dir = path.dirname(options[k]||'')||'./';
		//...then combine everything, using the outdir if absolute paths
		//were not specified
		options[k] = path.resolve(path.join(dir, options.prefix + base + ext), options.outdir);
	}
	return { publicKeyPath: options.public, privateKeyPath: options.private }
}

function explainParsing(options?: PathOptions) {
	return `\nOptions:\n` +
		`  Passed in:\n${JSON.stringify(options)}\n\n` +
		`  Defaults:\n${JSON.stringify(defaultPathOptions)}\n\n` +
		`  Parsed options:\n${JSON.stringify(parseOptions(options))}\n`;
}

/**
 * Read a key file and make sure it's a valid PEM file. 
 * 
 * @param filepath - The filepath to check
 * 
 * @throws {Error} If the specified path is not a file or if the file is not a valid PEM file.
 * 
 * @returns The contents of the file
 */
export function readKeyFile(filepath: string): string {
	try {
		if (!fs.statSync(filepath).isFile()) {
			throw new Error(`The specified path is not a file: ${filepath}`);
		}
		const contents = fs.readFileSync(filepath, { encoding: 'utf-8' });
		const beginRegEx = /^-----BEGIN (RSA |EC )?(PUBLIC|PRIVATE) KEY-----$/gm;
		const endRegEx = /^-----END (RSA |EC )?(PUBLIC|PRIVATE) KEY-----$/gm;
		if (!beginRegEx.test(contents) || !endRegEx.test(contents)) {
			throw new Error(`It didn't start/end with the expected strings.`);
		}
		return contents;
	} catch (e) {
		throw new Error(`Could not get valid PEM key from: ${filepath}`, { cause: e });
	}
}


function _readKeyPair(publicKeyPath: string, privateKeyPath: string): KeyPair {
	//then read and return those keys
	const publicKey = readKeyFile(publicKeyPath);
	const privateKey = readKeyFile(privateKeyPath);
	// console.log(`Read RSA keys read from ${publicKeyPath} and ${privateKeyPath}`);
	return { publicKey, privateKey };

}

/**
 * Reads a key pair from disk and returns it.
 *
 * @param options - Where to read the key pair from. See props {@link PathOptions here}
 *
 * @throws `Error` If the key pair could not be read from disk. This can happen if the specified directory does not exist, is not writable, or if the files with the prefix already exist.
 * 
 * @return `{publicKey, privateKey}` - string key values ready to be used for encryption/decryption
 *
 */
export function readKeyPair(options?: PathOptions): KeyPair {
	try {
		//Parse the options to get absolute paths for both keys...
		const { publicKeyPath, privateKeyPath } = parseOptions(options);
		return _readKeyPair(publicKeyPath, privateKeyPath);
	} catch (cause) {
		throw new Error("Failed to read key pair from disk."
			+ explainParsing(options), { cause });
	}
}



/**
 * Generates a 2048-bit RSA key pair.
 *
 * @return `{publicKey, privateKey}` - string key values ready to be used for encryption/decryption
 */
export function generate(): KeyPair {
	try {
		// Generate a 2048-bit RSA key pair
		return crypto.generateKeyPairSync('rsa', {
			modulusLength: 2048,
			publicKeyEncoding: {
				type: 'spki', // common format, supported by most systems
				format: 'pem',
			},
			privateKeyEncoding: {
				type: 'pkcs8', // more secure than 'pkcs1'
				format: 'pem',
			},
		});
	} catch (cause) {
		throw new BUG(`Could not generate rsa key pair for some reason...`, { cause });
	}
}



/**
 * Generates a key pair and saves to disk if needed, else reads previously saved 
 * keys from disk
 *
 * @param options - Where to read/write the key pair from/to. See props {@link PathOptions here}
 * 
 * @throws `Error` If we're not able to read/write the key pair from/to disk. 
 * 
 * @return `{publicKey, privateKey}` - string key values ready to be used for encryption/decryption
 */
export function readWriteKeyPair(options?: PathOptions): KeyPair {
	//Parse the options to get absolute paths for both keys...
	const { publicKeyPath, privateKeyPath } = parseOptions(options);

	//If neither key exists we'll generate them...
	if (!fs.existsSync(publicKeyPath) && !fs.existsSync(privateKeyPath)) {
		const { publicKey, privateKey } = generate();
		try {
			// Save the keys to PEM files
			fs.writeFileSync(publicKeyPath, publicKey);
			fs.writeFileSync(privateKeyPath, privateKey);
			console.log(`RSA key pair generated and saved to ${publicKeyPath} and ${privateKeyPath}`);
			return { publicKey, privateKey };
		} catch (cause) {
			throw new Error(`Failed to write newly generated key pair to disk.` +
				explainParsing(options), { cause });
		}
	} else {
		return _readKeyPair(publicKeyPath, privateKeyPath)
	}

}

