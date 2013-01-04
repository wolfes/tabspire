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
  if (markdict === null) {
      markdict = {};
  }
  return markdict;
};

/** Nukes all stored marks. */
TS.dbMark.nukeAllmarks = function() {
    TS.dbMark.saveMark({});
};

/**
 * Save named mark dict into localStorage.
 * @param {Object} markdict Dict mapping mark name to markmarklet info.
 */
TS.dbMark.saveMark = function(markdict) {
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
    this.saveMark(markdict);
};

/**
 * Retrieve mark item by key.
 * @param {string} markKey The key of desired mark.
 * @return {object} mar Saved mark info or undefined.
 * @this TS.dbMark
 */
TS.dbMark.getMarkByKey = function(markKey) {
    var markdict = this.getAllMarks();
    return markdict[markKey];
};
