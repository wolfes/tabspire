/**
 * Methods for `Reload Tab` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

TS.omni.commands.push({
    'opt': 'r',
    'cmd': 'reload',
    'desc': 'Reload Tab',
    'suggest': 'suggestReload',
    'cmdName': 'reloadTab'
});

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initReloadTab();
});

/**
 * Add reloadTab cmd listeners.
 */
TS.cmds.initReloadTab = function() {
    TS.vent.on('cmd:omni:reloadTab:suggest', TS.cmds.suggestReloadTab);
    TS.vent.on('cmd:omni:reloadTab:perform', TS.cmds.reloadTab);
};

/**
 * Return suggestions for Reload Tab command.
 * @param {Object} msg Has 'params' & 'showSuggestions' with User's input.
 */
TS.cmds.suggestReloadTab = function(msg) {
    debug('suggestReloadTab(', msg);
    var params = msg.params;
    var suggestions = [];
    msg.showSuggestions(suggestions);
};

/**
 * Act on reload command from user.
 * @param {object} msg Has 'cmd'
 * the command object augmented with user's input.
 */
TS.cmds.reloadTab = function(msg) {
    debug('reloadTab(', msg);
    var cmd = msg.cmd;
    var firstParam = cmd.params[0];
    var reloadTime = parseInt(firstParam, 10);
    if (reloadTime > 0) {
        TS.tabs.getSelected(function(tab) {
            var tabId = tab.id;
            TS.controller.saveActivityLog({
                action: 'rTab',
                info: {
                    delay: reloadTime * 1000
                }
            });
            TS.omni.tabId = setInterval(function() {
                chrome.tabs.get(tab.id, function(recentTab) {
                    // recentTab is undefined
                    // if reloaded tab is closed
                    if (!TS.util.isDef(recentTab)) {
                        clearInterval(TS.omni.tabId);
                        return;
                    }
                    chrome.tabs.update(tab.id, {
                        // tab.url = reload original tab
                        // recentTab.url = reload new tab.
                        url: tab.url
                    });
                });
            }, reloadTime * 1000);
        });
    }
};
