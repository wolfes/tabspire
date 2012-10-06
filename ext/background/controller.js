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
 * Open a tab, or focus tab if already exists.
 * @param {object} tab The standard tab object.
 */
TS.controller.openTab = function(tab) {
    if (tab === undefined) {
        return;
    }
    var tabUrlNoHashtag = tab.url.replace(/#\s*[^//.]+$/, '');
    chrome.tabs.query({url: tabUrlNoHashtag}, function(tabs) {
        TS.controller.fetchSelectedTab(function(selectedTab) {
            if (tabs.length > 0) {
                // Tab already open, select it!.
                debug('Found existing tab', tabs[0]);
                if (selectedTab.url === 'chrome://newtab/') {
                    // Close empty tab that was made to type in tabspire.
                    chrome.tabs.remove(selectedTab.id);
                }
                // Select desired tab.
                chrome.tabs.update(tabs[0].id, {active: true});
            } else {
                // Tab
                if (selectedTab.url === 'chrome://newtab/') {
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
    chrome.tabs.getSelected(win.id, function(tab) {
        callback(tab);
    });
  });
};

