/**
 * Controllers for tab manipulation.
 *
 * @author Wolfe Styke -- <wstyke@gmail.com>
 */

/** Project Namespace */
var TS = TS || {};

/** Module Namespace */
TS.tabs = TS.tabs || {};


/** Get Tabs */

/**
 * Call continuation with list of tabs in current window.
 * @param {function} callWithCurrTabs Continuation for curr window's tabs.
 */
TS.tabs.fetchCurrentWindowTabs = function(callWithCurrTabs) {
    chrome.windows.getCurrent(function(currWindow) {
        chrome.tabs.getAllInWindow(currWindow.id, callWithCurrTabs);
    });
};

/**
 * Execute one callback depending on if any tabs match url.
 * @param {string} url The url to match.
 * @param {function} callWithTab Called with first matching tab.
 * @param {?function} opt_callFailure Called if no tabs match url.
 */
TS.tabs.getByUrl = function(url, callWithTab, opt_callFailure) {
    var callFailure = opt_callFailure || function() {};
    chrome.tabs.query({url: TS.util.removeHashtag(url)}, function(tabs) {
        if (tabs.length > 0) {
            callWithTab(tabs[0]);
        } else {
            callFailure();
        }
    });
};

/**
 * Get tab by index in window.
 * @param {number} index The index of the tab to fetch in window.
 * @param {number} winId The window id to fetch tab from.
 * @param {function} callWithTabs Called with tab at index.
 */
TS.tabs.getByIndex = function(index, winId, callWithTabs) {
    chrome.tabs.query({
        index: index,
        windowId: windowId
    }, callWithTabs);
};

/**
 * Fetch currently focused tab for callback.
 * @param {function} callWithFocusedTab Passed focused tab.
 */
TS.tabs.getSelected = function(callWithFocusedTab) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        callWithFocusedTab(tabs[0]);
    });
};

/**
 * Fetch currently selected tab's url.
 * @param {function()} callWithURL Called with current tab's URL.
 */
TS.tabs.getCurrentURL = function(callWithURL) {
  TS.tabs.getSelected(function(tab) {
    callWithURL(tab['url']);
  });
};

/** Helper Methods */

/**
 * Highlight tab at valid indexes in specified window.
 * @param {number} windowId The window to find the tab in.
 * @param {Object} indexes List of tab indexes to highlight.
 */
TS.tabs.highlightTabIndexes = function(windowId, indexes) {
    chrome.tabs.highlight({
        windowId: tab.windowId,
        tabs: indexes.filter(function(index) {
            return index >= 0;
        })
    }, debug);
};


/** Update Tabs */

/**
 * Highlight tabs matching url in same window as first matching tab.
 * @param {String} url The url to highlight.
 */
TS.tabs.highlightUrl = function(url) {
    TS.tabs.getByUrl(url, function(tab) {
        chrome.windows.get(
                tab.windowId,
                {populate: true},
                function(window) {
            var indexes = TS.util.getDictIndexes(window.tabs, 'url', url);
            TS.tabs.highlightTabs(indexes);
        });
    });
};

/**
 * Focus a tab by url.
 * @param {String} url The url to highlight.
 */
TS.tabs.focusUrl = function(url) {
    TS.tabs.getByUrl(url, function(tab) {
        TS.windows.focusById(tab.windowId);
        chrome.tabs.update(tab.id, {
            active: true
        });
    });
};

/**
 * Focus i'th tab in current window.
 * @param {number} tabIndex The tab index to focus.
 */
TS.tabs.focusIndex = function(tabIndex) {
    TS.tabs.fetchCurrentWindowTabs(function(tabList) {
        // Focus last tab if tabIndex is greater than length.
        tabIndex = Math.min(tabIndex, tabList.length);
        // tabIndex=1 selects first tab
        tabIndex = Math.max(tabIndex - 1, 0);
        var tab = tabList[tabIndex];
        TS.windows.focusById(tab.windowId);
        chrome.tabs.update(tab.id, {
            active: true
        });
    });
};

/**
 * Focus the tab that currently has focus in the focused window.
 * @param {?function} opt_callWithFocusedTab Passed focused tab.
 */
TS.tabs.focusFocusedTab = function(opt_callWithFocusedTab) {
    var callWithFocusedTab = opt_callWithFocusedTab || function() {};
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        if (tabs.length === 0) { return; }
        TS.windows.focusById(tabs[0].windowId);
        callWithFocusedTab(tabs[0]);
    });
};

/**
 * Reload a tab.
 * @param {Object} tab The tab to reload.
 *
 */

/**
 * Reload Currently Focused Tab.
 */
TS.tabs.reloadCurrent = function() {
    TS.tabs.getSelected(function(tab) {
        // Reload & Focus currently Focused Tab.
        TS.windows.focusById(tab.windowId);
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
 * Close a tab by url.
 * @param {string} url The url to find tabs to close.
 */
TS.tabs.closeByUrl = function(url) {
    chrome.tabs.getByUrl(function(tab) {
        chrome.tabs.remove(tab.id);
    });
};

/**
 * Close tab if it is a Chrome 'newtab' page.
 * @param {object} tab The tab to check for closing.
 */
TS.tabs.closeIfNewTab = function(tab) {
    if (tab.url === 'chrome://newtab/') {
        chrome.tabs.remove(tab.id);
    }
};

/**
 * Focus tab a number of indices forward of currently focused tab.
 * @param {number} indicesForward Negative indicates backwards.
 */
TS.tabs.focusTabByPosDiff = function(indicesForward) {
  TS.tabs.getSelected(function(tab) {
    chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
      for (var i = 0, n = tabs.length; i < n; i++) {
        var tab = tabs[i];
        if (tab.active) {
          // Get the correct tab index to focus.
          var focusIndex = (i + indicesForward) % tabs.length;
          if (focusIndex < 0) {
            focusIndex += tabs.length;
          }
          // Focus tab.
          var focusTab = tabs[focusIndex];
          chrome.tabs.update(focusTab.id, {
            active: true
          });
          break;
        }
      }
    });
  });
};

/**
 * Focus next tab in currently active window.
 */
TS.tabs.focusNextTab = function() {
  TS.tabs.focusTabByPosDiff(1);
};

/**
 * Focus previous tab in currently active window.
 */
TS.tabs.focusPrevTab = function() {
  TS.tabs.focusTabByPosDiff(-1);
};
