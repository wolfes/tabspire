/**
 * Methods for `Reload Window` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

TS.omni.registerCommand(
   'rw', 'rwindow', 'Reload Win', 'reloadWindow'
);

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initReloadWindow();
});

/**
 * Add cmd listeners.
 */
TS.cmds.initReloadWindow = function() {
    TS.vent.on('cmd:omni:reloadWindow:suggest', TS.cmds.suggestReloadWindow);
    TS.vent.on('cmd:omni:reloadWindow:perform', TS.cmds.reloadWindow);
};

/**
 * Return suggestions for Reload command.
 * @param {Object} msg Has 'params' & 'showSuggestions' with User's input.
 */
TS.cmds.suggestReloadWindow = function(msg) {
    var params = msg.params;
    var suggestions = [];
    if (params[0] === undefined || params[0].trim() === '') {
        TS.suggest.showDefaultSuggestion(
            'Reload Window\'s Tabs: opt-url-match');
        return;
    }
    msg.showSuggestions(suggestions);
};

/**
 * Reload all/matching tabs in current window.
 * If first param provided, only reload tabs with urls matching param.
 * @param {object} msg Has cmd: the user's command.
 */
TS.cmds.reloadWindow = function(msg) {
    var cmd = msg.cmd;
    var text = cmd.params;
    var urlMatch;
    var query = '';
    if (text.length === 0) {
        query = text[0];
        urlMatch = new RegExp(query, 'i');
    }
    // Get all tabs in current window, reload tabs as directed.
    chrome.windows.getCurrent(function(gWin) {
        chrome.tabs.getAllInWindow(gWin.id, function(gTabs) {
            var matches = [];
            for (var i = 0; i < gTabs.length; i++) {
                var gTab = gTabs[i];
                // If match url param exists and we match tab's url,
                // or param doesn't exist: reload all tabs.
                if ((urlMatch && urlMatch.test(gTab.url)) ||
                        !urlMatch) {
                    chrome.tabs.update(gTab.id, {
                        url: gTab.url
                    });
                    matches.push({
                        url: gTab.url,
                        title: gTab.title
                    });
                }
            }
            TS.controller.saveActivityLog({
                action: 'rWin',
                info: {
                    query: query,
                    matches: matches
                }
            });
        });
    });
};
