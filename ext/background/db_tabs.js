/**
 * Stores Saved Tab Info.
 * Stored in localStorage as JSON array of dict saved tab info items.
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
TS.dbTabs = TS.dbTabs || {};

/**
 * Name of activity log database in local storage.
 */
TS.dbTabs.DB_NAME = 'tabdict';

/**
 * Return dict of tab names to saved tab info objects.
 * @return {Object} tabdict Dict mapping name to tab info.
 */
TS.dbTabs.getNamedTabs = function() {
  var tabdict = JSON.parse(localStorage.getItem(TS.dbTabs.DB_NAME));
  if (tabdict === null) {
      tabdict = {};
  }
  return tabdict;
};

/**
 * Nukes all tab info.
 */
TS.dbTabs.nukeAllTabs = function() {
    TS.dbTabs.saveNamedTabs({});
};

/**
 * Save named tab dict into localStorage.
 * @param {Object} tabdict Dict mapping tab name to tab info object.
 */
TS.dbTabs.saveNamedTabs = function(tabdict) {
    localStorage.setItem(TS.dbTabs.DB_NAME, JSON.stringify(tabdict));
};

/**
 * Add a new uniquely named tab to TS.model.
 * @param {Object} data Dict with tab name and tab info.
 * @return {boolean} true if save worked.
 * @this TS.model
 */
TS.dbTabs.addNamedTab = function(data) {
    var tabdict = this.getNamedTabs();
    if (tabdict[data.name] !== undefined) {
        // Name already saved to a tab.
        return false;
    }
    tabdict[data.name] = data;
    this.saveNamedTabs(tabdict);
    return true;
};

/**
 * Retrieve tab item by name.
 * @param {string} tabName The name of desired tab.
 * @return {object} tab Saved tab or undefined.
 */
TS.dbTabs.getTabByName = function(tabName) {
    var tabdict = TS.dbTabs.getNamedTabs();
    return tabdict[tabName];
};

/**
 * Retrieve tabs that fuzzy-match name.
 * @param {string} queryName The name of the desired tab.
 * @return {array} tabs The list of matching tabs.
 */
TS.dbTabs.getTabsByFuzzyName = function(queryName) {
    var tabdict = TS.dbTabs.getNamedTabs();
    var tabs = TS.dbUtil.getMatchesByFuzzyName(tabdict, queryName);
    return tabs;
};

/**
 * Remove tab by name.
 * @param {string} tabName The name of the tab to delete.
 */
TS.dbTabs.removeNamedTab = function(tabName) {
    debug('TS.dbTabs.removeNamedTab(', tabName, ')');
    var tabdict = TS.dbTabs.getNamedTabs();
    delete tabdict[tabName];
    TS.dbTabs.saveNamedTabs(tabdict);
};

/**
 * Remove tab by url.
 * @param {string} url The url to delete from saved tabs.
 */
TS.dbTabs.removeTabByURL = function(url) {
    var tabdict = TS.dbTabs.getNamedTabs();
    for (name in tabdict) {
        debug('Considering deleting tab named:', name);
        if (tabdict[name].url === url) {
            debug('Model is removing tab with name:', name);
            delete tabdict[name];
        }
    }
    TS.dbTabs.saveNamedTabs(tabdict);
};

/**
 * Rename tab from previous to new name.
 * @param {string} prevName The old tab name.
 * @param {string} newName The new tab name.
 */
TS.dbTabs.renameTab = function(prevName, newName) {
  var namedTabDict = TS.dbTabs.getNamedTabs();
  if (prevName in namedTabDict) {
    var tab = _.clone(namedTabDict[prevName]);
    delete namedTabDict[prevName];
    tab['name'] = newName;
    namedTabDict[newName] = tab;
  }
  TS.dbTabs.saveNamedTabs(namedTabDict);
};

