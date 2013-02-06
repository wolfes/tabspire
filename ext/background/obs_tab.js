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
 * Helper Method for managing current/previous tab update.
 * @param {Object} activeInfo The currently active tab.
 * @private
 */
TS.obsTab.updateTabFocusChange_ = function(activeInfo) {
    var tabId = activeInfo.tabId;
    var windowId = activeInfo.windowId;
    /*
    if (TS.obsTab.currentlyFocusedTab !== false) {
        TS.obsTab.prevFocusedTabs = ([
            TS.obsTab.currentlyFocusedTab
        ].concat(TS.obsTab.prevFocusedTabs)).slice(0, 10);
    }
    TS.obsTab.currentlyFocusedTab = activeInfo;
    */
    // Get previously focused tabs for this window.
    var prevTabs = [];
    if (windowId in TS.obsTab.focusedTabsByWindow) {
        prevTabs = TS.obsTab.focusedTabsByWindow[windowId];
    }
    if (prevTabs.length > 0 &&
            prevTabs[0].windowId === windowId &&
            prevTabs[0].tabId === tabId) {
        // Focused tab was the last focused tab in this window, abort saving.
        debug('Aborting updateTabFocusChange_ - same as prev. focused tab.');
        return;
    }
    // Save prepended focused tab.
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
    /*
    var lastActiveTabInfo = TS.obsTab.prevFocusedTabs.shift();
    if (lastActiveTabInfo === undefined) {
        return;
    }
    */
    // Figure out selected window.
    chrome.windows.getCurrent(function(currWinInfo) {
        var currWinId = currWinInfo.id;
        if (!(currWinId in TS.obsTab.focusedTabsByWindow)) {
            // No previously focused tabs for this window.
            debug('Abort selectPrevFocusedTab: no prev focused tabs for win.');
            return;
        }
        var prevTabs = TS.obsTab.focusedTabsByWindow[currWinId];
        if (prevTabs.length < 2) {
            // Only one tab ever focused in this window,
            // can't focus previous tab.
            return;
        }
        var tabToFocus = prevTabs.splice(1, 1)[0];
        TS.obsTab.focusedTabsByWindow[currWinId] = prevTabs;

        chrome.tabs.update(tabToFocus.tabId, {
            active: true
        });

    });
};

