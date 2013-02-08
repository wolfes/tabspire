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
    //debug('Initialization Done!');
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
 * Get tabs info that match a url fragment.
 * @param {string} urlFragment The url fragment to match.
 * @param {function} callWithMatchingTabs Called with a dict,
 *   keys: 'ids': list of matching tab ids and 'urls'.
 */
TS.controller.getTabsByUrl = function(urlFragment, callWithMatchingTabs) {
    chrome.tabs.query({}, function(allTabs) {
        var tabIds = [];
        var matchingURLs = [];
        for (var i = 0, n = allTabs.length; i < n; i++) {
            var tab = allTabs[i];
            var url = tab.url;
            var fragmentIdx = url.toLowerCase().search(urlFragment);
            if (fragmentIdx !== -1) {
                tabIds.push(tab.id);
                matchingURLs.push(url);
            }
        }
        if (tabIds.length !== 0) {
            callWithMatchingTabs({
                'ids': tabIds,
                'urls': matchingURLs
            });
        }
    });
};

/**
 * Extract all tabs with matching urls into new window.
 * @param {string} urlFragment The url fragment to match tabs on.
 * @param {boolean} opt_closeExtractedTabs Default true, remove extracted tabs.
 */
TS.controller.extractTabsByUrl = function(urlFragment, opt_closeExtractedTabs) {
    var closeExtractedTabs = ( // Default: true
        (opt_closeExtractedTabs === undefined) || opt_closeExtractedTabs);

    var extractMethod = TS.controller.extractTabMatches;
    if (!closeExtractedTabs) {
        extractMethod = TS.controller.cloneTabMatches;
    }
    // Get all tabs with matching urls.
    TS.controller.getTabsByUrl(urlFragment, extractMethod);
};

/**
 * Clone matching tabs into a new window.
 * @param {Object} matchingInfo A dict with 'ids' and 'urls' keys.
 */
TS.controller.cloneTabMatches = function(matchingInfo) {
    chrome.windows.create({
        url: matchingInfo.urls
    });
};

/**
 * Extract matching tabs into a new window, close extracted tabs.
 * @param {Object} matchingInfo A dict with 'ids' and 'urls' keys.
 */
TS.controller.extractTabMatches = function(matchingInfo) {
    chrome.tabs.remove(matchingInfo.ids);
    TS.controller.cloneTabMatches(matchingInfo);
};

/**
 * Open first tab that matches fuzzy name match algorithm.
 * @param {string} tabName The name of the tab to open.
 */
TS.controller.openTabByFuzzyName = function(tabName) {
    if (!TS.util.isDef(tabName)) {
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
 * Reload/Open and Focus Marked Tab.
 * @param {number} markCharCode The charCode of the mark.
 * @param {?boolean} opt_reload Reload tab if true, default: false.
 */
TS.controller.reloadFocusMark = function(markCharCode, opt_reload) {
    var reloadTab = opt_reload || false;
    var markInfo = TS.dbMark.getMarkByKey(markCharCode);
    if (!TS.util.isDef(markInfo)) { return; }
    TS.controller.openTab({'url': markInfo.url}, reloadTab);
};

/**
 * Open or Reload tab that matches fuzzyTabName best.
 * @param {string} fuzzyTabName The tabname to search and destroy.
 */
TS.controller.reloadTabByFuzzyName = function(fuzzyTabName) {
    if (!TS.util.isDef(fuzzyTabName)) {
        fuzzyTabName = ''; // Open first match.
    }
    var tabs = TS.model.getTabsByFuzzyName(fuzzyTabName);
    if (tabs.length === 0) {
        return; // No tabs found.
    }
    var tabToReload = tabs[0];
    TS.controller.openTab(tabToReload, true);
    TS.controller.saveActivityLog({
        action: 'reloadTabByFuzzyName',
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
    if (!TS.util.isDef(fuzzyTabName)) {
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
    //debug('openTab -> Focusing existing tab:', tab.url);
    //debug('Reloading:', reloadIfOpen);
    TS.tabs.closeIfNewTab(selectedTab);

    var updateInfo = {active: true};
    if (reloadIfOpen) {
        updateInfo['url'] = tab.url;
    }
    chrome.tabs.update(tabs[0].id, updateInfo);
    TS.windows.focusById(tabs[0].windowId);

    // Send request to tab being focused with lastMark info.
    chrome.tabs.sendRequest(
        tabs[0].id,
        TS.dbMark.getLastOpenedMark()
    );

};

/**
 * Open a tab, or focus tab if already exists, also focus window.
 * @param {object} tab Contains attr 'url'.
 * @param {boolean} opt_reloadIfOpen Reload tab if already open.
 */
TS.controller.openTab = function(tab, opt_reloadIfOpen) {
    var reloadIfOpen = opt_reloadIfOpen || false;
    if (!TS.util.isDef(tab)) {
        return;
    }
    tab.url = TS.util.fixUrlProtocol(tab.url);
    var tabUrlNoHashtag = TS.util.removeHashtag(tab.url);
    chrome.tabs.query({url: tabUrlNoHashtag}, function(tabs) {
        TS.tabs.getSelected(function(selectedTab) {
            if (tabs.length > 0) {
                TS.controller.focusExistingTab_(
                    tab, tabs, selectedTab, reloadIfOpen);
            } else {
                if (selectedTab.url === 'chrome://newtab/') {
                    // Replace selected newtab page with opened tab url.
                    //debug('openTab -> open in place:', tab.url);
                    chrome.tabs.update(selectedTab.id, {url: tab.url});
                    TS.windows.focusById(selectedTab.windowId);
                } else {
                    //debug('openTab -> open in new tab:', tab.url);
                    chrome.tabs.create({url: tab.url}, function(newTab) {
                        TS.windows.focusById(newTab.windowId);
                    });
                }
            }
        });
    });
};

/**
 * Add activity log to db, augment with time & active tab.
 * @param {object} log The activity log to save.
 */
TS.controller.saveActivityLog = function(log) {
    // Add Timestamp if not already present.
    log.when = 'when' in log ? log.when : Date.now();
    TS.tabs.getSelected(function(tab) {
        log.activeTab = tab;
        TS.dbLogs.addLog(log);
    });
};

var digits = {
    49: 1, 50: 2, 51: 3, 52: 4, 53: 5,
    54: 6, 55: 7, 56: 8, 57: 9, 48: 0
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
            sendResponse(TS.dbMark.getLastOpenedMark());
        } else if (action === 'cmdLine.inputChanged') {
            //TODO(wstyke:10-24-2012) Divide omnibox into:
            // 1. Omnibox-specific code
            // 2. User Text Input handling code.
            // Then use (2) here.
        } else if (action === 'cmdLine.saveMark') {
            var keyCode = msg.code;
            TS.tabs.getSelected(function(tabInfo) {
                TS.dbMark.addMark(keyCode, tabInfo);
                debug('Added Mark:', keyCode, tabInfo);
            });
        } else if (action === 'cmdLine.savePosMark') {
            var keyCode = msg.code;
            TS.tabs.getSelected(function(tabInfo) {
                tabInfo.scrollX = msg.scrollX;
                tabInfo.scrollY = msg.scrollY;
                TS.dbMark.addMark(keyCode, tabInfo);
                debug('Added Mark:', keyCode, tabInfo);
            });
        } else if (action === 'cmdLine.gotoMark') {
            var markInfo = TS.dbMark.getMarkByKey(msg.code);
            debug('gotoMark:', msg.code in digits, markInfo);
            if (TS.util.isDef(markInfo)) {
                TS.dbMark.setLastOpenedMark(markInfo);
                TS.controller.openTab({
                    'url': markInfo.url
                });
            } else if (msg.code in digits) {
                //debug('Goto tab #', digits[msg.code]);
                TS.tabs.focusIndex(digits[msg.code]);
            } else if (msg.code === 39) {
                // Apostrophe: Focus last focused tab.
                TS.obsTab.selectPrevFocusedTab();
            } else if (msg.code === 34) {
                // Dbl Quote: Focus last focused window.
                TS.obsWin.focusLastWindow();
            }
        }
});
