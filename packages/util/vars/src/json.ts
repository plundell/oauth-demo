/**
 * @module helpers/json
 * 
 * Contains functions which make it easier to work with JSON and typescript.
 * 
 * Based on:
 * @see https://hackernoon.com/mastering-type-safe-json-serialization-in-typescript
 */

export type JSONPrimitive = string | number | boolean | null;

/**
 * @type JSONValue - A value which is compatible with JSON and can be serialized
 */
export type JSONValue = JSONPrimitive | JSONValue[] | {
    [key: string]: JSONValue;
};

/**
 * @type JSONCompatible - This is a recursive mapper which _converts a generic type into a JSON compatible version_. 
 * 
 * @usage ```
 * type StateProperties = JSONCompatible<{
 *      referer: string;
 *      expiration: ()=> number; //not JSON compatible
 * }>;
 * //^this doesn't show up as an error, however...
 * 
 * const state: StateProperties = {
 *      referer: "https://example.com",
 *      expiration: () => Date.now() //...this does!
 * };
 * //The actual type of StateProperties["expiration"] is 'never'
 * ```
 */
export type JSONCompatible<T> = unknown extends T ? never : {
    [P in keyof T]:
    T[P] extends JSONValue ? T[P] :
    T[P] extends NotAssignableToJson ? never :
    JSONCompatible<T[P]>;
};

export type NotAssignableToJson =
    | bigint
    | symbol
    | Function;


/**
 * Pass a value to this at design time to have TypeScript check that
 * it's JSON compatible. It doesn't actually do anything.
 * 
 * @template T A type which is compatible with JSON
 * @param value A value which is compatible with JSON
 * @returns The same value, unchanged, but TypeScript knows it is JSON compatible
 */
export function toJsonValue<T>(value: JSONCompatible<T>): JSONValue {
    return value;
}


/**
 * A JSON.stringify wrapper which prompts TypeScript to run design-time 
 * typechecks on the value to ensure that it's JSON compatible
 * 
 * @template T A type which is compatible with JSON
 * @param value A value which is compatible with JSON
 * @returns The serialized value, ie. a string
 */
export function typeSafeStringify<T>(data: JSONCompatible<T>): string {
    return JSON.stringify(data);
}



/**
 * A JSON.parse wrapper which optionally runs a validator on the deserialized value
 * and returns a typed value.
 * 
 * @template T Optional.A type which is compatible with JSON and returned by the validator
 * @param json A string which is a valid JSON document
 * @param validator Optional. A function which takes a JSONValue and returns a typed value
 * 
 * @returns The deserialized value, optionally validated
 */
export function typedParse(json: string): JSONValue;
export function typedParse<T extends JSONValue>(json: string, validator: (raw: JSONValue) => T): T;
export function typedParse<T extends JSONValue>(json: string, validator?: (raw: JSONValue) => T): JSONValue | T {
    const raw = JSON.parse(json) as JSONValue;
    if (validator)
        return validator(raw);
    else
        return raw;
}



// export function parseObject

export default typeSafeStringify;
