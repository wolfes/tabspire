/**
 * Controller for connecting views/server to background model.
*
 * @author Wolfe Styke <wstyke@gmail.com>
 */
var TS = TS || {};

/** Namespace: controller */
TS.controller = TS.controller || {};

/**
 * Set localSettings flag & connect to server.
 * @param {boolean} useLocalSettings True means use local settings.
 */
TS.controller.setLocalSettings = function(useLocalSettings) {
    // Force value into boolean to be consistent.
    TS.dbFlags.setFlag('localSettings', useLocalSettings === true);
    // Re-setup socket to use possibly different server.
    TS.io.setupSocket();
};

/**
 * Initialization
 */
$(document).ready(function() {
    TS.io.setupSocket();
    debug('Initialization Done!');
});

/**
 * Open new tab with search query (google search).
 * @param {object} searchInfo The query and params for search.
 */
TS.controller.openSearchTab = function(searchInfo) {
    var queryURL = 'http://www.google.com/#';
    if (!('query' in searchInfo)) {
        debug('No \'query\' in searchInfo for openSearchTab.');
        return;
    }
    if ('lucky' in searchInfo && searchInfo.lucky) {
        // TODO(wstyke:11-27-2012) Implement lucky search.
        queryURL = queryURL + 'q=' + searchInfo.query;
    } else {
        queryURL = queryURL + 'q=' + searchInfo.query;
    }
    TS.controller.openTab({
        'url': queryURL
    });
};

/**
 * Add a tab to tabspire.
 * @param {object} tab Contains 'url' and 'name'.
 */
TS.controller.addTab = function(tab) {
    TS.model.addNamedTab(tab);
};

/**
 * Open a tab by name.
 * @param {string} tabName The name of a tab.
 */
TS.controller.openTabByName = function(tabName) {
    var tab = TS.model.getTabByName(tabName);
    TS.controller.openTab(tab);
};

/**
 * Open first tab that matches fuzzy name match algorithm.
 * @param {string} tabName The name of the tab to open.
 */
TS.controller.openTabByFuzzyName = function(tabName) {
    if (tabName === undefined) {
        tabName = ''; // Open first match.
    }
    var tabs = TS.model.getTabsByFuzzyName(tabName);
    if (tabs.length >= 1) {
        var tab = tabs[0];
        TS.controller.openTab(tab);
        TS.controller.saveActivityLog({
            action: 'openTab',
            info: {
                query: tabName,
                title: tab.name,
                url: tab.url
            }
        });
    }
};

/**
 * Reload Currently Focused Tab.
 */
TS.controller.reloadCurrentTab = function() {
    TS.controller.fetchSelectedTab(function(tab) {
        // Reload & Focus currently Focused Tab.
        chrome.tabs.update(tab.id, {
            active: true,
            url: tab.url
        });
        // Record Activity.
        TS.controller.saveActivityLog({
            action: 'reloadCurrentTab',
            info: {
                title: tab.title,
                url: tab.url
            }
        });
    });
};

/**
 * Reload/Open and Focus Marked Tab.
 * @param {number} markCharCode The charCode of the mark.
 * @param {?boolean} opt_reload Reload tab if true, default: false.
 */
TS.controller.reloadFocusMark = function(markCharCode, opt_reload) {
    var reloadTab = opt_reload || false;
    var markInfo = TS.dbMark.getMarkByKey(markCharCode);
    if (markInfo === null) { return; }
    TS.controller.openTab({'url': markInfo.url}, reloadTab);
};

/**
 * Open or Reload tab that matches fuzzyTabName best.
 * @param {string} fuzzyTabName The tabname to search and destroy.
 */
TS.controller.reloadTabByFuzzyName = function(fuzzyTabName) {
    if (fuzzyTabName === undefined) {
        fuzzyTabName = ''; // Open first match.
    }
    var tabs = TS.model.getTabsByFuzzyName(fuzzyTabName);
    if (tabs.length === 0) {
        return; // No tabs found.
    }
    var tabToReload = tabs[0];
    TS.controller.openTab(tabToReload, true);
    TS.controller.saveActivityLog({
        action: 'reloadTab',
        info: {
            query: fuzzyTabName,
            title: tabToReload.name,
            url: tabToReload.url
        }
    });
};

/**
 * Delete the first tab that matches fuzzy name search.
 * @param {string} fuzzyTabName The tabname to search and destroy.
 */
TS.controller.deleteTabByFuzzyName = function(fuzzyTabName) {
    if (fuzzyTabName === undefined) {
        fuzzyTabName = ''; // Open first match.
    }
    var tabs = TS.model.getTabsByFuzzyName(fuzzyTabName);
    if (tabs.length === 0) {
        return; // No matching tabs to delete.
    }
    var tabToDelete = tabs[0];
    TS.model.removeNamedTab(tabToDelete.name);
};

/**
 * Get list of tabs that fuzzy-match the name.
 * @param {string} tabName The desired name.
 * @return {array} The matching tabs.
 */
TS.controller.getTabsByFuzzyName = function(tabName) {
    return TS.model.getTabsByFuzzyName(tabName);
};

/**
 * Close tab if it is a Chrome 'newtab' page.
 * @param {object} tab The tab to check for closing.
 */
TS.controller.closeNewTab = function(tab) {
    if (tab.url === 'chrome://newtab/') {
        chrome.tabs.remove(tab.id);
    }
};

/**
 * Focus a tab that is already open in Chrome,
 * and close currently selected tab if it is a newtab.
 * @param {Object} tab The tab with the url to focus.
 * @param {Object} tabs The focused tab list.
 * @param {Object} selectedTab The tab currently focused..
 * @param {boolean} reloadIfOpen Reload tab if it is already open.
 * @private
 */
TS.controller.focusExistingTab_ = function(
        tab, tabs, selectedTab, reloadIfOpen) {
    debug('openTab -> Focusing existing tab:', tab.url);
    debug('Reloading:', reloadIfOpen);
    TS.controller.closeNewTab(selectedTab);

    var updateInfo = {active: true};
    if (reloadIfOpen) {
        updateInfo['url'] = tab.url;
    }
    chrome.tabs.update(tabs[0].id, updateInfo);
    TS.controller.focusWindowById(tabs[0].windowId);

    // Send request to tab being focused with lastMark info.
    chrome.tabs.sendRequest(
        tabs[0].id,
        TS.lastMark
    );

};

/**
 * Open a tab, or focus tab if already exists, also focus window.
 * @param {object} tab Contains attr 'url'.
 * @param {boolean} opt_reloadIfOpen Reload tab if already open.
 */
TS.controller.openTab = function(tab, opt_reloadIfOpen) {
    var reloadIfOpen = opt_reloadIfOpen || false;
    if (tab === undefined) {
        return;
    }
    tab.url = TS.util.fixUrlProtocol(tab.url);
    var tabUrlNoHashtag = TS.util.removeHashtag(tab.url);
    chrome.tabs.query({url: tabUrlNoHashtag}, function(tabs) {
        TS.controller.fetchSelectedTab(function(selectedTab) {
            if (tabs.length > 0) {
                TS.controller.focusExistingTab_(
                    tab, tabs, selectedTab, reloadIfOpen);
            } else {
                if (selectedTab.url === 'chrome://newtab/') {
                    // Replace selected newtab page with opened tab url.
                    debug('openTab -> open in place:', tab.url);
                    chrome.tabs.update(selectedTab.id, {url: tab.url});
                    TS.controller.focusWindowById(selectedTab.windowId);
                } else {
                    debug('openTab -> open in new tab:', tab.url);
                    chrome.tabs.create({url: tab.url}, function(newTab) {
                        TS.controller.focusWindowById(newTab.windowId);
                    });
                }
            }
        });
    });
};
/**
 * Focuses a window by its id.
 * @param {number} windowId The ID of the window to focus.
 */
TS.controller.focusWindowById = function(windowId) {
    chrome.windows.update(windowId, {focused: true});
};

/**
 * Fetch currently focused tab for callback.
 * @param {function} callback Passed focused tab.
 */
TS.controller.fetchSelectedTab = function(callback) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        callback(tabs[0]);
    });
};

/**
 * Add activity log to db, augment with time & active tab.
 * @param {object} log The activity log to save.
 */
TS.controller.saveActivityLog = function(log) {
    // Add Timestamp if not already present.
    log.when = 'when' in log ? log.when : Date.now();
    TS.controller.fetchSelectedTab(function(tab) {
        log.activeTab = tab;
        TS.dbLogs.addLog(log);
    });
};

var digits = {
    49: 1, 50: 2, 51: 3, 52: 4, 53: 5,
    54: 6, 55: 7, 56: 8, 57: 9, 48: 0
};

/**
 * Call continuation with list of tabs in current window.
 * @param {function} callWithCurrTabs Continuation for curr window's tabs.
 */
TS.controller.cbCurrWindowTabs = function(callWithCurrTabs) {
    chrome.windows.getCurrent(function(currWindow) {
        chrome.tabs.getAllInWindow(currWindow.id, callWithCurrTabs);
    });
};

/**
 * Focus i'th tab in current window.
 * @param {number} tabIndex The tab index to focus.
 */
TS.controller.focusTabIndex = function(tabIndex) {
    TS.controller.cbCurrWindowTabs(function(tabList) {
        // Focus last tab if tabIndex is greater than length.
        tabIndex = Math.min(tabIndex, tabList.length);
        // tabIndex=1 selects first tab
        tabIndex = Math.max(tabIndex - 1, 0);
        var tab = tabList[tabIndex];
        chrome.tabs.update(tab.id, {
            active: true
        });
    });
};

chrome.extension.onMessage.addListener(
    function(msg, sender, sendResponse) {
        debug(msg, sender);
        var action = msg.action;
        if (action === 'openTab') {
            TS.controller.openTab({
                url: msg.url
            });
        } else if (action === 'cmdLine.checkMark') {
            sendResponse(TS.lastMark);
        } else if (action === 'cmdLine.inputChanged') {
            //TODO(wstyke:10-24-2012) Divide omnibox into:
            // 1. Omnibox-specific code
            // 2. User Text Input handling code.
            // Then use (2) here.
        } else if (action === 'cmdLine.saveMark') {
            var keyCode = msg.code;
            TS.controller.fetchSelectedTab(function(tabInfo) {
                TS.dbMark.addMark(keyCode, tabInfo);
                debug('Added Mark:', keyCode, tabInfo);
            });
        } else if (action === 'cmdLine.savePosMark') {
            var keyCode = msg.code;
            TS.controller.fetchSelectedTab(function(tabInfo) {
                tabInfo.scrollX = msg.scrollX;
                tabInfo.scrollY = msg.scrollY;
                TS.dbMark.addMark(keyCode, tabInfo);
                debug('Added Mark:', keyCode, tabInfo);
            });
        } else if (action === 'cmdLine.gotoMark') {
            debug('gotoMark:', msg.code);
            var markInfo = TS.dbMark.getMarkByKey(msg.code);
            debug('gotoMark:', msg.code in digits, markInfo);
            if (msg.code in digits && markInfo === null) {
                //debug('Goto tab #', digits[msg.code]);
                TS.controller.focusTabIndex(digits[msg.code]);
            }
            TS.lastMark = markInfo;
            TS.controller.openTab({
                'url': markInfo.url
            });

        }
});
