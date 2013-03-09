/**
 * Observe Chrome Tabs Events for features to use.
 *
 * Observing last N focused tabs works like:
 * - On selection change,
 *   push newly selected tab into register,
 *   push previously selected tab from register
 *   into list of previously focused tabs,
 *   trim the list to be the right size.
 *
 * Remember last N tabs with focus per window!
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

/** List of prev. N focused tabs per window id.
 *
 * Ex: For window with id 42,
 *  tab with id 7 is currently focused,
 *  tab with id 3 was previously focused,
 *  tab with id 20 was focused prior to #3.
 * {42: [7, 3, 20], ...}
 */
TS.obsTab.focusedTabsByWindow = {};

/** The currently focused tab. */
TS.obsTab.currentlyFocusedTab = false;

/**
 * Get previously focused tabs for a window, or empty list.
 * @param {number} windowId Id of window to find prev focused tabs.
 * @return {Array} List of tabIds, or empty list.
 * @private
 */
TS.obsTab.getTabsByWindow_ = function(windowId) {
    var tabsByWindowId = TS.obsTab.focusedTabsByWindow;
    return (windowId in tabsByWindowId ?
            tabsByWindowId[windowId] : []);
};

/**
 * Helper Method for managing current/previous tab update.
 * @param {Object} activeInfo The currently active tab.
 * @private
 */
TS.obsTab.updateTabFocusChange_ = function(activeInfo) {
    var tabId = activeInfo.tabId;
    var windowId = activeInfo.windowId;
    var prevTabs = TS.obsTab.getTabsByWindow_(windowId);
    if (prevTabs.length > 0 &&
            prevTabs[0].windowId === windowId &&
            prevTabs[0].tabId === tabId) {
        // Focused tab was the last tab focused in this window, abort dup save.
        debug('Aborting updateTabFocusChange_ - same as prev. tab focused.');
        return;
    }
    // Save focused tab by prepending to window's tabs, trim list to fit.
    prevTabs = ([activeInfo].concat(prevTabs)).slice(0, 10);
    TS.obsTab.focusedTabsByWindow[windowId] = prevTabs;
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
    // Figure out selected window.
    chrome.windows.getCurrent(function(currWinInfo) {
        var currWinId = currWinInfo.id;
        var prevTabs = TS.obsTab.getTabsByWindow_(currWinId);
        if (prevTabs.length < 2) {
            debug('Abort selectPrevFocusedTab: no prev focused tabs for win.');
            return;
        }
        var tabToFocus = prevTabs.splice(1, 1)[0];
        TS.obsTab.focusedTabsByWindow[currWinId] = prevTabs;

        chrome.tabs.update(tabToFocus.tabId, {
            active: true
        });
    });
};
