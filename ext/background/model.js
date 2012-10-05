/**
 * @filedesc Model for read/write of 
 * saved tab information in persistant storage.
 *
 * Author: Wolfe Styke - <wstyke@gmail.com>
 */

var TS = TS || {};
TS.model = TS.model || {};


/**
 * Return dict of tab names to saved tab info objects.
 * @returns {Object} tabdict Dict mapping name to tab info.
 */
TS.model.getNamedTabs = function() {
  var tabdict = JSON.parse(localStorage.getItem('tabdict'));
  if (tabdict === null) {
      tabdict = {};
  }
  return tabdict;
};

/**
 * Save named tab dict into localStorage.
 * @param {Object} tabdict Dict mapping tab name to tab info object.
 */
TS.model.saveNamedTabs = function(tabdict) {
    localStorage.setItem('tabdict',
			 JSON.stringify(tabdict));
};


/**
 * Add a new uniquely named tab to TS.model.
 * @param {Object} data Dict with tab name and tab info.
 * @returns {boolean} true if save worked.
 */
TS.model.addNamedTab = function(data) {
    var tabdict = this.getNamedTabs();
    if (tabdict[data.name] !== undefined) {
			debug("TS.model.addNamedTab: Cannot add tab", data.name, 
						", name already used.");
			return false;
    }
    tabdict[data.name] = data;
    this.saveNamedTabs(tabdict);
    return true;
};

/**
 * Removes tab info for the specified named tab.
 * @param {string} tabName The name of the saved tab to delete.
 */
TS.model.removeNamedTab = function(tabName) {
    var tabdict = this.getNamedTabs();
    if (name in tabdict) {
	delete tabdict[name];
    }
    this.saveNamedTabs(tabdict);
};




/**
 * 
 * @param {}
 * @returns {}
 */
TS.model.a = function() {

};


/**
 * 
 * @param {}
 * @returns {}
 */
TS.model.a = function() {

};