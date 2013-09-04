/**
 * Stores Saved Window Info.
 * Stored in localStorage as JSON array of dict saved window info items.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */

/**
 * Project Namespace.
 */
var TS = TS || {};

/**
 * Activity Log Database Namespace.
 */
TS.dbWin = TS.dbWin || {};

/**
 * Name of activity log database in local storage.
 */
TS.dbWin.DB_NAME = 'windict';

/**
 * Return dict of window name to window info.
 * @return {Object} windict Dict mapping name to window info.
 *
 */
TS.dbWin.getNamedWindows = function() {
  var windict = JSON.parse(localStorage.getItem(TS.dbWin.DB_NAME));
  return windict === null ? {} : windict;
};

/**
 * Nuke all named windows.
 */
TS.dbWin.nukeAllWins = function() {
  TS.dbWin.saveNamedWindows({});
};

/**
 * Save named windows dictionary.
 * @param {Object} windict Dict from win names to win info.
 */
TS.dbWin.saveNamedWindows = function(windict) {
  localStorage.setItem(TS.dbWin.DB_NAME, JSON.stringify(windict));
};

/**
 * Add a namedWindowInfo object to stored named windows.
 * @param {Object} namedWindowInfo Named window information.
 * - Contains keys: name:str + chrome window info.
 * @param {boolean=} overwrite Overwrite existing named window, default false.
 * @return {boolean} Returns true if save was successful.
 */
TS.dbWin.addNamedWindow = function(namedWindowInfo, overwrite) {
  var overwrite = overwrite || false;
  var windict = TS.dbWin.getNamedWindows();
  var name = namedWindowInfo.name;
  if (!overwrite && (windict[name] !== undefined)) {
    // Name already saved, and we're not overwriting it.
    return false;
  }
  windict[name] = namedWindowInfo;
  TS.dbWin.saveNamedWindows(windict);
  return true;
};

/**
 * Add a namedWindowInfo object to stored named windows.
 * @param {Object} namedWindowInfo Named window information.
 * - Contains keys: name:str, tabs:list<obj>.
 * @return {boolean} Returns true if upsert was successful.
 */
TS.dbWin.upsertNamedWindow = function(namedWindowInfo) {
  return TS.dbWin.addNamedWindow(namedWindowInfo, true);
};

/**
 * Retrieve a window info item by name.
 * @param {string} winName The target window's name.
 * @return {Object} The window or undefined.
 */
TS.dbWin.getWinByName = function(winName) {
  return TS.dbWin.getNamedWindows()[winName];

};

/**
 * Retrieve windows that fuzzy-match name.
 * @param {string} queryName The name of the desired window.
 * @return {array} win The list of matching windows.
 */
TS.dbWin.getWinByFuzzyName = function(queryName) {
  var windict = TS.dbWin.getNamedWindows();
  var win = TS.dbUtil.getMatchesByFuzzyName(windict, queryName);
  return win;
};

/**
 * Remove saved window by name.
 * @param {string} winName The named window to remove.
 */
TS.dbWin.removeNamedWin = function(winName) {
  var windict = TS.dbWin.getNamedWindows();
  delete windict[winName];
  TS.dbWin.saveNamedWindows(windict);
};
