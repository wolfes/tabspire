/**
 * Database for storing flags.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */

/** Flag Database Namespace */
var TS.dbFlags = TS.dbFlags || {};

/** @const {string} Database Name */
TS.dbFlags.DB_NAME = 'flags';

/**
 * Fetch all flags.
 * @return {object} Dictionary of flags.
 */
TS.dbFlags.getAll = function() {
    var flags = JSON.parse(localStorage.getItem(TS.dbFlags.DB_NAME));
    return flags === null ? {} : flags;
};

/**
 * Save all flags, overwriting existing flags.
 * @param {object} flags Dictionary of flags to save.
 */
TS.dbFlags.saveAll = function(flags) {
    localStorage.setItem(
        TS.dbFlags.DB_NAME,
        JSON.stringify(flags)
    );
};

/**
 * Set flag with name to value in database, optionally overwriting.
 * @param {string} name The name of the flag.
 * @param {string|boolean|Object} value The value of the flag.
 */
TS.dbFlags.setFlag = function(name, value) {
    var flags = TS.dbFlags.getAll();
    flags[name] = value;
    TS.dbFlags.saveAll(flags);
};

/**
 * Get a flag's value by name.
 * @param {string} flagName The name of the flag to fetch.
 * @return {string|boolean|
 */
