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
 * Initialization
 */
$(document).ready(function() {
    debug('Initializing...');
    TS.io = io.connect(TS.localSettings ?
        'http://localhost:3000' : 'cmdsync.com:3000');

    // Register clientId with server on restarting app.
    var clientId = localStorage.getItem('clientId');
    debug('Prev clientId: ', clientId);
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
};

/**
 * Initialization
 */
$(document).ready(function() {
    debug('Initializing...');
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
 * Open a tab, or focus tab if already exists, also focus window.
 * @param {object} tab Contains .url attr.
 */
TS.controller.openTab = function(tab) {
    if (tab === undefined) {
        return;
    }
    // Remove hashtag at end of url (stemming).
    var tabUrlNoHashtag = tab.url.replace(/#\s*[^//.]+$/, '');
    chrome.tabs.query({url: tabUrlNoHashtag}, function(tabs) {
        TS.controller.fetchSelectedTab(function(selectedTab) {
            if (tabs.length > 0) {
                // Tab already open, select it!.
                TS.controller.closeNewTab(selectedTab);
                // Select desired tab.
                chrome.tabs.update(tabs[0].id, {active: true});
                TS.controller.focusWindowById(tabs[0].windowId);
            } else {
                if (selectedTab.url === 'chrome://newtab/') {
                    // Replace selected newtab page with opened tab url.
                    chrome.tabs.update(selectedTab.id, {url: tab.url});
                    TS.controller.focusWindowById(selectedTab.windowId);
                } else {
                    chrome.tabs.create({url: tab.url}, function(newTab) {
                    // Callback: Let win/tab mgr know this tab now exists.
                    // May not be necessary with new chrome.tabs.query :)
                    // query only queries same window?
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
  chrome.windows.getCurrent(function(win) {
    chrome.tabs.query({
        windowId: win.id,
        active: true
    }, function(tabs) {
        callback(tabs[0]);
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
    TS.controller.fetchSelectedTab(function(tab) {
        log.activeTab = tab;
        TS.dbLogs.addLog(log);
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
        } else if (action === 'cmdLine.inputChanged') {
            //TODO(wstyke:10-24-2012) Divide omnibox into:
            // 1. Omnibox-specific code
            // 2. User Text Input handling code.
            // Then use (2) here.
            //
        }
});
