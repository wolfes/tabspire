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
 * Retrieve tabs that fuzzy-match name.
 * @param {string} queryName The name of the desired tab.
 * @return {array} tabs The list of matching tabs.
 */
TS.model.getTabsByFuzzyName = function(queryName) {
    var tabs = [];
    var tabdict = TS.model.getNamedTabs();
    if (queryName === undefined) {
        for (var name in tabdict) {
            tabs.push(tabdict[name]);
        }
        return tabs;
    }
    for (var name in tabdict) {
        var tab = tabdict[name];
        // Condense first 3 cases:
        // rankOrder = 1, rankPos = -10, 0, 1+
        if (tab.name.search(queryName) !== -1) {
            tab.rankOrder = 1;
            // Rank = Position of queryName in the tab's name.
            // Lower is better
            tab.rankPos = tab.name.search(queryName);
            if (tab.name === queryName) {
                tab.rankPos = -10; // Sort Exact Match to front.
            }
            debug(1, tab.rankPos, tab.name);
        } else {
            // Fuzzy Match: by folders, then by entire string.
            // Redundent folder matching with query anywhere?
            escTabName = TS.util.escapeRegExp(queryName);
            tabFolders = tab.name.split('/');
            fuzzyNameRegExp = new RegExp(
                    escTabName.split('').join('.*'));
            for (var i = 0; i < tabFolders.length; i++) {
                // Fuzzy Match within a folder name.
                if (fuzzyNameRegExp.test(tabFolders[i])) {
                    tab.rankOrder = 2;
                    tab.rankPos = i;
                    debug(4, tab.name, queryName);
                    break;
                }
            }
            if (tab.rankPos === undefined &&
                    fuzzyNameRegExp.test(tab.name)) {
                // Fuzzy Match.
                tab.rankOrder = 3;
                tab.rankPos = tab.name.search(queryName[0]);
                debug(5, tab.name, queryName);
            }
        }
        if (tab.rankOrder !== undefined && tab.rankPos !== undefined) {
            tabs.push(tab);
        }
    }
    // Order tabs by rank: Order then Position.
    function sortTabs(a, b) {
        return ((a.rankOrder !== b.rankOrder) ?
                a.rankOrder > b.rankOrder :
                a.rankPos > b.rankPos);
    }
    tabs.sort(sortTabs);
    return tabs;
};

/**
 * Remove tab by name.
 * @param {string} tabName The name of the tab to delete.
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
