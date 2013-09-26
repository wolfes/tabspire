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
    chrome.browserAction.onClicked.addListener(function(tab) {
       //TS.controller.openTab({'url': 'http://github.com/wolfes/tabspire'});
       TS.gCmd.openCurrentURL();
    });
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
    TS.dbTabs.addNamedTab(tab);
};

/**
 * Open a tab by name.
 * @param {string} tabName The name of a tab.
 */
TS.controller.openTabByName = function(tabName) {
    var tab = TS.dbTabs.getTabByName(tabName);
    TS.controller.openTab(tab);
};

/**
 * Open first tab that matches fuzzy name match algorithm.
 * @param {string} tabName The name of the tab to open.
 */
TS.controller.openTabByFuzzyName = function(tabName) {
    if (!TS.util.isDef(tabName)) {
        tabName = ''; // Open first match.
    }
    var tabs = TS.dbTabs.getTabsByFuzzyName(tabName);
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
 * Get tabs info that match a url fragment.
 * @param {string} urlFragment The url fragment to match.
 * @param {function} cbMatchingTabs Called with a dict,
 *   keys: 'ids': list of matching tab ids and 'urls'.
 */
TS.controller.getTabsByUrl = function(urlFragment, cbMatchingTabs) {
    chrome.tabs.query({}, function(allTabs) {
        var matchingTabs = [];
        for (var i = 0, n = allTabs.length; i < n; i++) {
            var tab = allTabs[i];
            if (tab.url.toLowerCase().search(urlFragment) !== -1) {
                matchingTabs.push(tab);
            }
        }
        cbMatchingTabs(TS.controller.createTabMatchInfo(matchingTabs));
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
 * TODO(wstyke:02/08/2013): Instead of remove and create tabs,
 * add new window, then move old tabs to new window, preserve tab openerId.
 * @param {Object} matchingInfo A dict with 'ids' and 'urls' keys.
 */
TS.controller.extractTabMatches = function(matchingInfo) {
    chrome.tabs.remove(matchingInfo.ids);
    TS.controller.cloneTabMatches(matchingInfo);
};

/**
 * Get all tabs that were opened from this tab, recursively.
 * @param {Object} tab A chrome tab.
 * @param {function} cbTabChildren Callback takes children tab list.
 */
TS.controller.getChildrenOfTab = function(tab, cbTabChildren) {
    chrome.tabs.query({}, function(openTabs) {
        var childTabs = {};
        var childTabList = [tab];
        childTabs[tab.id] = tab;
        var numTabs = openTabs.length;
        var unexpandedChildren = true;
        while (unexpandedChildren) {
            // Expand with children of previously known children.
            unexpandedChildren = false;
            for (var i = 0; i < numTabs; i++) {
                var openTab = openTabs[i];
                var openTabId = openTab.id;
                var parentId = openTab.openerTabId;
                if (parentId in childTabs && !(openTabId in childTabs)) {
                    childTabs[openTabId] = openTab;
                    childTabList.push(openTab);
                    unexpandedChildren = true;
                }
            }
        }
        cbTabChildren(childTabList);
    });
};

/**
 * Create tabMatchInfo dictionary with keys: 'ids', 'urls', 'tabs'.
 * @param {Array} tabList List of tabs to create match info for.
 * @return {Object} tabMatchInfo Has keys [ids, urls, tabs] mapping to lists.
 */
TS.controller.createTabMatchInfo = function(tabList) {
    var tabMatchInfo = {
        'ids': _.pluck(tabList, 'id'),
        'urls': _.pluck(tabList, 'url'),
        'tabs': tabList
    };
    return tabMatchInfo;
};

/**
 * Extract tabs that were opened by currently focused tab.
 */
TS.controller.extractChildTabs = function() {
    // @TODO(wstyke:02-08-2013): Refactor this!
    TS.tabs.getSelected(function(sourceTab) { // The focused tab.
        TS.controller.getChildrenOfTab(sourceTab, function(childTabs) {
            var tabMatchInfo = TS.controller.createTabMatchInfo(childTabs);
            TS.controller.extractTabMatches(tabMatchInfo);
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
    var tabs = TS.dbTabs.getTabsByFuzzyName(fuzzyTabName);
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
    var tabs = TS.dbTabs.getTabsByFuzzyName(fuzzyTabName);
    if (tabs.length === 0) {
        return; // No matching tabs to delete.
    }
    var tabToDelete = tabs[0];
    TS.dbTabs.removeNamedTab(tabToDelete.name);
};

/**
 * Get list of tabs that fuzzy-match the name.
 * @param {string} tabName The desired name.
 * @return {array} The matching tabs.
 */
TS.controller.getTabsByFuzzyName = function(tabName) {
    return TS.dbTabs.getTabsByFuzzyName(tabName);
};

/**
 * Get list of windows that fuzzy-match the name.
 * @param {string} winName The desired name.
 * @return {array} The matching windows.
 */
TS.controller.getWinByFuzzyName = function(winName) {
    return TS.dbWin.getWinByFuzzyName(winName);
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
 * @param {boolean} opt_reloadIfOpen Reload tab if already open, default: false.
 */
TS.controller.openTab = function(tab, opt_reloadIfOpen) {
    var reloadIfOpen = opt_reloadIfOpen || false;
    if (!TS.util.isDef(tab)) {
        // Input Validation.
        return;
    }
    tab.url = TS.util.fixUrlProtocol(tab.url);
    var tabUrlNoHashtag = TS.util.removeHashtag(tab.url);
    chrome.tabs.query({url: tabUrlNoHashtag}, function(matchTabs) {
        TS.tabs.getSelected(function(selectedTab) {
            TS.controller.openTab_(tab, selectedTab, matchTabs, reloadIfOpen);
        });
    });
};

/**
 * Open tab url: focus existing tab, replace newtab, or open new tab.
 * @param {Object} tab The tab with url to open.
 * @param {Object} selectedTab The currently selected tab in Chrome.
 * @param {Array} matchTabs A list of open tabs matching tab's url.
 * @param {boolean} reloadIfOpen Reload tab if already open.
 * @private
 */
TS.controller.openTab_ = function(tab, selectedTab, matchTabs, reloadIfOpen) {
    if (matchTabs.length > 0) {
        // debug('openTab: Focusing existing tab with same url.');
        TS.controller.focusExistingTab_(
            tab, matchTabs, selectedTab, reloadIfOpen);
    } else {
        if (selectedTab.url === 'chrome://newtab/') {
            //debug('openTab: Replacing newtab with url:', tab.url);
            chrome.tabs.update(selectedTab.id, {url: tab.url});
            TS.windows.focusById(selectedTab.windowId);
        } else {
            //debug('openTab: Open in new tab:', tab.url);
            chrome.tabs.create({url: tab.url}, function(newTab) {
                TS.windows.focusById(newTab.windowId);
            });
        }
    }
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
        // debug(msg, sender);
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
            //debug('gotoMark:', msg.code in digits, markInfo);
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

/**
 * Open a window with chrome windowInfo object.
 * @param {Object} windowInfo Chrome's window info object, with 'tabs'.
 */
TS.controller.openWindowFromInfo = function(windowInfo) {
  // 1. Create window for tabs.
  debug('controller.openWindowFromInfo(', windowInfo);
  var windowUrls = [];
  var windowTabs = windowInfo['tabs'];
  for (var i = 0, n = windowTabs.length; i < n; i++) {
    windowUrls.push(windowTabs[i]['url']);
  }
  TS.controller.focusWin(windowInfo, function(success) {
    debug('focusWin cb:', success);
    if (!success) {
      // No existing window to focus, create new window.
      chrome.windows.create({
          url: windowUrls
      });
    }
  });
  // Add tabs to window.
};

/**
 * Focus window if present and returns boolean success.
 * @param {Object} winInfo Chrome window info object.
 * @param {function(boolean)} cont Called with success or failure.
 */
TS.controller.focusWin = function(winInfo, cont) {
  // Get all windows, populated with tabs.
  // Check each window, focus first with all of winInfo's tab urls.
  // Failing that, return success=false.
  var requiredUrls = {};
  var winTabs = winInfo['tabs'];
  for (var i = 0, n = winTabs.length; i < n; i++) {
    requiredUrls[winTabs[i]['url']] = true;
  }
  chrome.windows.getAll({'populate': true}, function(windows) {
    var foundWindow = false;
    for (var i = 0, n = windows.length; i < n; i++) {
      if (foundWindow) {
        break; // We found our window, stop search.
      }
      var win = windows[i];
      var winTabs = win.tabs;
      // Check window for matching tabs.
      var tabUrls = {};
      for (var j = 0, m = winTabs.length; j < m; j++) {
        tabUrls[winTabs[j].url] = true;
      }
      debug(requiredUrls, tabUrls);
      var hasRequiredTabs = TS.controller.hasRequiredKeys(
        requiredUrls, tabUrls);
      if (hasRequiredTabs) {
        // Focus this window, stop our search.
        debug('Found window to focus.');
        TS.windows.focusById(windows[i].id);
        foundWindow = true;
        break;
      }
    }
    cont(foundWindow);
  });
};

/**
 * Checks if a dict has all required keys from another dict.
 * @param {Object} requiredKeys Dict with required keys.
 * @param {Object} keys The dict with keys to check.
 * @return {boolean} Whether keys dict has all keys in requiredKeys dict.
 *
 */
TS.controller.hasRequiredKeys = function(requiredKeys, keys) {
  for (key in requiredKeys) {
    if (!(key in keys)) {
      return false;
    }
  }
  return true;
};
