var TS = TS || {};
/**
 * Utility Methods.
 */
TS.util = TS.util || {};

/**
 * Debug toggle boolean.
 */
TS.DEBUG = true;

function debug() {
    // Only global function, for ease of typing.
    if (TS.DEBUG) {
        console.log.apply(console, arguments);
    }
}

/**
 * Returns true if urlString looks like a url.
 * TODO(wstyke:10-06-12): Improve this with regexp.
 * @param {string} urlString The string to check.
 * @return {boolean} isUrl True if urlString is a url.
 */
TS.util.isUrl = function(urlString) {
    var isUrl = false;
    if (urlString.search('http://') === 0 ||
            urlString.search('https://') === 0 ||
            urlString.search('chrome://') === 0) {
        return true;
    }
    return isUrl;
};

/**
 * Escape RegExp special chars from a string.
 * @param {string} text The unescaped string.
 * @return {string} The string with escaped RegExp special chars.
 */
TS.util.escapeRegExp = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};
