/**
 * Model: Saved tab info with persistant storage.
 *
 * Author: Wolfe Styke - <wstyke@gmail.com>
 */

var TS = TS || {};
/**
 * Namespace: model.
 */
TS.model = TS.model || {};


/**
 * Return dict of tab names to saved tab info objects.
 * @return {Object} tabdict Dict mapping name to tab info.
 */
TS.model.getNamedTabs = function() {
  var tabdict = JSON.parse(localStorage.getItem('tabdict'));
  if (tabdict === null) {
      tabdict = {};
  }
  return tabdict;
};

/**
 * Nukes all tab info.
 */
TS.model.nukeAllTabs = function() {
    TS.model.saveNamedTabs({});
};

/**
 * Save named tab dict into localStorage.
 * @param {Object} tabdict Dict mapping tab name to tab info object.
 */
TS.model.saveNamedTabs = function(tabdict) {
    localStorage.setItem('tabdict', JSON.stringify(tabdict));
};


/**
 * Add a new uniquely named tab to TS.model.
 * @param {Object} data Dict with tab name and tab info.
 * @return {boolean} true if save worked.
 * @this TS.model
 */
TS.model.addNamedTab = function(data) {
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
 * @this TS.model
 */
TS.model.getTabByName = function(tabName) {
    var tabdict = this.getNamedTabs();
    return tabdict[tabName];
};


/**
 * Removes tab info for the specified named tab.
 * @param {string} tabName The name of the saved tab to delete.
 * @this TS.model
 */
TS.model.removeNamedTab = function(tabName) {
    var tabdict = this.getNamedTabs();
    if (name in tabdict) {
        delete tabdict[name];
    }
    this.saveNamedTabs(tabdict);
};




/**
 * Unused.
 */
TS.model.a = function() {

};


/**
 * Unused.
 */
TS.model.a = function() {

};
