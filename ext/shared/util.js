var TS = TS || {};
/**
 * Utility Methods.
 */
TS.util = TS.util || {};

/**
 * Debug toggle boolean.
 */
TS.DEBUG = false;

function debug() {
    // Only global function, for ease of typing.
    if (TS.DEBUG) {
        console.log.apply(console, arguments);
    }
}

/**
 * Return true if value is defined.
 * @param {any} value The value to check.
 * @return {boolean} Is true if value isn't undefined or null.
 */
TS.util.isDef = function(value) {
    return (value !== undefined && value !== null);
};

/**
 * Returns true if urlString looks like a url.
 * TODO(wstyke:10-06-12): Improve this with regexp.
 * @param {string} urlString The string to check.
 * @return {boolean} isUrl True if urlString is a url.
 */
TS.util.isUrl = function(urlString) {
    var isUrl = false;
    if (urlString.search('http') === 0 ||
            urlString.search('https') === 0 ||
            urlString.search('chrome') === 0) {
        return true;
    }
    return isUrl;
};

/**
 * Fixes urls without a leading (http/https/chrome/file).
 * @param {string} url The url to fix.
 * @return {string} url The fixed url.
 */
TS.util.fixUrlProtocol = function(url) {
    if ((url.search('chrome:') !== 0) &&
            (url.search('http') !== 0) &&
            (url.search('file:') !== 0)) {
        url = 'http://' + url;
    }
    return url;
};

/**
 * Remove hashtag at end of url for stemming purposes.
 * @param {string} url The url to remove hashtags from.
 * @return {string} The url sans hashtag.
 */
TS.util.removeHashtag = function(url) {
    return url.replace(/#\s*[^//.]+$/, '');
};

/**
 * Escape RegExp special chars from a string.
 * @param {string} text The unescaped string.
 * @return {string} The string with escaped RegExp special chars.
 */
TS.util.escapeRegExp = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

var xml_special_to_escaped_one_map = {
    '&': '&amp;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;'
};

var escaped_one_to_xml_special_map = {
    '&amp;': '&',
    '&quot;': '"',
    '&lt;': '<',
    '&gt;': '>'
};

/**
 * Encode a string to xml acceptable format.
 * @param {string} string The string to encode.
 * @return {string} The xml-encoded string.
 */
TS.util.encodeXml = function(string) {
    return string.replace(/([\&"<>])/g, function(str, item) {
        return xml_special_to_escaped_one_map[item];
    });
};

/**
 * Decode a string from xml acceptable format.
 * @param {string} string The string to decode.
 * @return {string} The regular string.
 */
TS.util.decodeXml = function(string) {
    return string.replace(/(&quot;|&lt;|&gt;|&amp;)/g,
        function(str, item) {
            return escaped_one_to_xml_special_map[item];
        });
};
