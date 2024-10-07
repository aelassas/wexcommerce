/**
 * Format a number.
 *
 * @export
 * @param {number} x
 * @param {string} language ISO 639-1 language code
 * @returns {string}
 */
export declare const formatNumber: (x: number, language: string) => string;
/**
 * Format price
 *
 * @param {number} price
 * @param {string} currency
 * @param {string} language ISO 639-1 language code
 * @returns {boolean}
 */
export declare const formatPrice: (price: number, currency: string, language: string) => string;
/**
 * Capitalize a string.
 *
 * @export
 * @param {string} str
 * @returns {string}
 */
export declare const capitalize: (str: string) => string;
/**
 * Join two url parts.
 *
 * @param {?string} [part1]
 * @param {?string} [part2]
 * @returns {string}
 */
export declare const joinURL: (part1?: string, part2?: string) => string;
/**
 * Clone an object or array.
 *
 * @param {*} obj
 * @returns {*}
 */
export declare const clone: (obj: any) => any;
/**
 * Clone an array.
 *
 * @export
 * @template T
 * @param {T[]} arr
 * @returns {(T[] | undefined | null)}
 */
export declare const cloneArray: <T>(arr: T[]) => T[] | undefined | null;
/**
 * Removes a start line terminator character from a string.
 *
 * @export
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export declare const trimStart: (str: string, char: string) => string;
/**
 * Removes a leading and trailing line terminator character from a string.
 *
 * @export
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export declare const trimEnd: (str: string, char: string) => string;
/**
 * Removes a stating, leading and trailing line terminator character from a string.
 *
 * @export
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export declare const trim: (str: string, char: string) => string;
/**
 * Trim carriage return.
 *
 * @param {string} str
 * @returns {string}
 */
export declare const trimCarriageReturn: (str: string) => string;
/**
 * Get date-fns format.
 *
 * @param {string} language
 * @returns {("eee d LLLL yyyy, kk:mm" | "eee, d LLLL yyyy, kk:mm")}
 */
export declare const getDateFormat: (language: string) => "eee d LLLL yyyy, kk:mm" | "eee, d LLLL yyyy, kk:mm";
