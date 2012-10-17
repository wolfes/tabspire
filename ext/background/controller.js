/**
 * Controller for connecting views/server to background model.
 *
 * @author Wolfe Styke <wstyke@gmail.com>
 */
var TS = TS || {};
/**
 * Namespace: controller
 */
TS.controller = TS.controller || {};

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
 * Open a tab, or focus tab if already exists.
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
            } else {
                if (selectedTab.url === 'chrome://newtab/') {
                    // Replace selected newtab page with opened tab url.
                    chrome.tabs.update(selectedTab.id, {url: tab.url});
                } else {
                    chrome.tabs.create({url: tab.url}, function(newTab) {
                    // Callback: Let win/tab mgr know this tab now exists.
                    // May not be necessary with new chrome.tabs.query :)
                    // query only queries same window?
                    });
                }
            }
        });
    });
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
