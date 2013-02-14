/**
 * Remote control for Chrome Tabs API.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */

var TS = TS || {};

/** Namespace: rTabs */
TS.rTabs = TS.rTabs || {};

/**
 * Methods to support.
 *
 * create
 * get
 * getAllInWindow
 * getCurrent
 * getSelected
 *
 * insertCSS
 * update
 * move
 *
 * remove
 */

/**
 * Methods maybe not to support... at least at first.
 *
 * captureVisibleTab
 * connect
 * detectLanguage
 * executeScript
 * sendRequest
 */


/**
 * Create a new tab with specified properties.
 * @param {Object} tabProperties Properties for new tab.
 *  windowId ( optional integer )
 *    Adds tab to this window, or current window.
 *  index ( optional integer )
 *    Place tab at index in window.
 *  url ( optional string )
 *    Url to open: 'http://' for absolute, else relative, default NewTab Page.
 *  active ( optional boolean )
 *    Whether window should select tab, default: true.
 *  pinned ( optional boolean )
 *    Whether to pin tab, default: false.
 *  openerTabId ( optional integer )
 *    ID of tab that opened this tab (opener tab must be in same window).
 */
TS.rTabs.create = function(tabProperties) {
    chrome.tabs.create(tabProperties, function() {});
};

/**
 *
 *
 */
TS.rTabs.get = function() {};

/**
 *
 *
 */
TS.rTabs.getAllInWindow = function() {};

/**
 *
 *
 */
TS.rTabs.getCurrent = function() {};

/**
 *
 *
 */
TS.rTabs.getSelected = function() {};

/**
 *
 *
 */
TS.rTabs.insertCSS = function() {};

/**
 *
 *
 */
TS.rTabs.update = function() {};

/**
 *
 *
 */
TS.rTabs.move = function() {};

/**
 *
 *
 */
TS.rTabs.remove = function() {};

