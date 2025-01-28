/**
 * @module @local/util-errors/BUG
 * 
 * This class represents an error that should never occur and is a bug. 
 */
export default class BUG extends Error {

	constructor(message: string, cause?: Error | unknown) {
		super(message, { cause: cause instanceof Error ? cause : undefined });
	}
}
