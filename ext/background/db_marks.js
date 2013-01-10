/**
 * Tab Mark Storage and Retrieval.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */

var TS = TS || {};

/**
 * Namespace: dbMark.
 */
TS.dbMark = TS.dbMark || {};

/**
 * Return dict of marks: keys to tab info objects.
 * @return {Object} markdict Dict mapping mark key to tab info.
 */
TS.dbMark.getAllMarks = function() {
  var markdict = JSON.parse(localStorage.getItem('markdict'));
  return (markdict === null) ? {} : markdict;
};

/** Nukes all stored marks. */
TS.dbMark.nukeAllmarks = function() {
    TS.dbMark.saveMarks({});
};

/**
 * Save named mark dict into localStorage.
 * @param {Object} markdict Dict mapping mark name to markmarklet info.
 */
TS.dbMark.saveMarks = function(markdict) {
    localStorage.setItem('markdict', JSON.stringify(markdict));
};

/**
 * Add a new uniquely named mark to TS.dbMark.
 * @param {number} keyCode The keycode for this mark.
 * @param {Object} tabInfo Dict with tab info for this mark.
 * @this TS.dbMark
 */
TS.dbMark.addMark = function(keyCode, tabInfo) {
    var markdict = this.getAllMarks();
    if (markdict[keyCode] !== undefined) {
        // Name already saved to a mark.
        // Skip saving?
    }
    markdict[keyCode] = tabInfo;
    this.saveMarks(markdict);
};

/**
 * Retrieve mark item by key.
 * @param {string} markKey The key of desired mark.
 * @return {?object} Saved mark info or null.
 * @this TS.dbMark
 */
TS.dbMark.getMarkByKey = function(markKey) {
    var markdict = this.getAllMarks();
    return (markKey in markdict) ? markdict[markKey] : null;
};
