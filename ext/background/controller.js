/**
 * Controller for connecting views/server to background model.
*
 * @author Wolfe Styke <wstyke@gmail.com>
 */
var TS = TS || {};

/** Whether to use local settings. */
TS.localSettings = false;

/** Namespace: controller */
TS.controller = TS.controller || {};

/** The message for next notification. */
TS.controller.msg = '';

/**
 * Set client's id for server communication from vimspire.
 * @param {string} clientId The id to be known by on server.
 */
TS.controller.setClientId = function(clientId) {
    if (clientId.search('/') !== -1) {
        // Invalid client id contains '/'.
        debug('Client Id is Invalid: has /');
        return;
    }

    // Register new, unregister old if applicable.
    var oldClientId = localStorage.getItem('clientId');
    TS.io.emit('id:register', {
        'socketId': clientId,
        'oldSocketId': oldClientId || ''
    });
    localStorage.setItem('clientId', clientId);
};

/**
 * Upload existing clientId to server.  Useful after reconnect.
 */
TS.controller.uploadClientId = function() {
    var clientId = localStorage.getItem('clientId');
    TS.io.emit('id:register', {
        'socketId': clientId || '',
        'oldSocketId': clientId || ''
    });
};

/**
 * Connect socket to server and setup listeners.
 */
TS.controller.setupSocket = function() {
    var serverHost = (TS.localSettings ?
            'http://localhost:3000' : 'cmdsync.com:3000');

    TS.io = io.connect(serverHost, {
        'max reconnection attempts': Infinity
    });

    TS.io.socket.on('reconnecting', function(delay) {
       TS.io.socket.reconnectionDelay = 5 * 60 * 1000;
    });
    TS.io.socket.on('reconnect', function() {
        TS.controller.uploadClientId();
    });
    // Starts reconnecting engines...
    TS.io.socket.reconnect();

    // Register clientId with server on restarting app.
    var clientId = localStorage.getItem('clientId');
    debug('Connecting to', serverHost, 'with clientId:', clientId);
    if (clientId && clientId !== '') {
        TS.io.emit('id:register', {
            'socketId': clientId
        });
    }

    TS.io.on('tab:openByName', function(data) {
        debug('tab:openByName', data);
        if (!('name' in data)) {
            return;
        }
        TS.controller.openTabByFuzzyName(data['name']);
    });
    TS.io.on('search:normal', function(data) {
        debug('search:normal', data);
        TS.controller.openSearchTab({
            'query': 'query' in data ? data.query : '',
            'lucky': false
        });
    });
    TS.io.on('search:lucky', function(data) {
        TS.controller.openSearchTab({
            'query': 'query' in data ? data.query : '',
            'lucky': true
        });
    });
    TS.io.on('tab:openByURL', function(data) {
        debug('tab:openByURL', data);
        TS.controller.openTab({
            'url': data.url
        });
    });
    TS.io.on('tab:reloadByName', function(data) {
        debug('tab:reloadByName', data);
        TS.controller.reloadTabByFuzzyName(
            'tabName' in data ? data.tabName : '');
    });
    TS.io.on('tab:reloadByURL', function(data) {
        debug('tab:reloadByURL', data);
        TS.controller.openTab({
            'url': 'url' in data ? data.url : ''
        }, true);
    });
    TS.io.on('tab:reloadCurrent', function(data) {
        debug('tab:reloadCurrent', data);
        TS.controller.reloadCurrentTab();
    });
    TS.io.on('tab:reloadFocusMark', function(data) {
        debug('tab:reloadFocusMark', data);
        var charCodeMark = data.mark.charCodeAt(0);
        TS.controller.reloadFocusMark(charCodeMark);
    });
};

/**
 * Initialization
 */
$(document).ready(function() {
    TS.controller.setupSocket();
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
 * Returns msg for notification.
 * @return {string} The message.
 */
TS.controller.getMsg = function() {
    return TS.controller.msg;
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
 */
TS.controller.reloadFocusMark = function(markCharCode) {
    var markInfo = TS.dbMark.getMarkByKey(markCharCode);
    if (markInfo === null) { return; }
    TS.controller.openTab({'url': markInfo.url}, true);
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
};

/**
 * Open a tab, or focus tab if already exists, also focus window.
 * @param {object} tab Contains .url attr.
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

chrome.extension.onMessage.addListener(
    function(msg, sender, sendResponse) {
        debug(msg, sender);
        var action = msg.action;
        if (action === 'openTab') {
            TS.controller.openTab({
                url: msg.url
            });
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
        } else if (action === 'cmdLine.gotoMark') {
            var markInfo = TS.dbMark.getMarkByKey(msg.code);
            if (msg.code in digits && markInfo === undefined) {
                //debug('Goto tab #', digits[msg.code]);
            }
            TS.controller.openTab({
                'url': markInfo.url
            });
        }
});
