/**
 * Observe Chrome Tabs Events.
 *
 * Observing last N focused tabs works like:
 * - On selection change,
 *   push newly selected tab into register,
 *   push previously selected tab from register
 *   into list of previously focused tabs,
 *   trim the list to be the right size.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */

/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.obsTab = TS.obsTab || {};

/** @const Number N of previously focused tabs to remember.*/
TS.obsTab.prevTabsMax = 10;

/** Buffer of previous N focused tabs. */
TS.obsTab.prevFocusedTabs = [];

/** The currently focused tab. */
TS.obsTab.currentlyFocusedTab = false;

/**
 * Helper Method for managing current/previous tab update.
 * @param {Object} activeInfo The currently active tab.
 * @private
 */
TS.obsTab.updateTabFocusChange_ = function(activeInfo) {
    if (TS.obsTab.currentlyFocusedTab !== false) {
        TS.obsTab.prevFocusedTabs = ([
            TS.obsTab.currentlyFocusedTab
        ].concat(TS.obsTab.prevFocusedTabs)).slice(0, 10);
    }
    TS.obsTab.currentlyFocusedTab = activeInfo;
};

/**
 * Observes Chrome Tab selection changes.
 * @param {Object} activeInfo Has keys tabId and windowId.
 */
TS.obsTab.selectionChange = function(activeInfo) {
    TS.obsTab.updateTabFocusChange_(activeInfo);
};
chrome.tabs.onActivated.addListener(TS.obsTab.selectionChange);

/**
 * Focus previously focused tab.
 */
TS.obsTab.selectPrevFocusedTab = function() {
    var lastActiveTabInfo = TS.obsTab.prevFocusedTabs.shift();
    if (lastActiveTabInfo === undefined) {
        return;
    }
    chrome.tabs.update(lastActiveTabInfo.tabId, {
        active: true
    });
};

