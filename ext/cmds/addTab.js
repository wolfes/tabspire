/**
 * Methods for `Add Tab` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

/** List of commands. */
TS.cmds.all = TS.cmds.all || [];

TS.omni.registerCommand(
   'a', 'add', 'Add Tab', 'addTab'
);

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initAddTab();
});

/**
 * Add addTab cmd listeners.
 */
TS.cmds.initAddTab = function() {
    TS.vent.on('cmd:omni:addTab:suggest', TS.cmds.suggestAddTab);
    TS.vent.on('cmd:omni:addTab:perform', TS.cmds.addTab);
};

/**
 * Return suggestions for Add command.
 * @param {string} msg Msg containing cmd params.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.cmds.suggestAddTab = function(msg) {
    debug('TS.cmds.suggestAddTab(', msg);
    var params = msg.params;
    var suggestions = [];
    var name = params[0] !== undefined ? params[0] : '';
    chrome.omnibox.setDefaultSuggestion({
        'description': 'Add named tab: ' + name
    });
    var tabs = TS.controller.getTabsByFuzzyName(name);
    var suggestions = TS.suggest.suggestItems(
        tabs,
        function(tabInfo) {
            return {
                content: '',
                description: 'Saved Tab: ' + tabInfo.name
            };
        },
        true // Skip Showing Default Suggestions.
    );
    return suggestions;
};

/**
 * Add name to active tab.
 * @param {object} msg Has cmd containing user's input.
 */
TS.cmds.addTab = function(msg) {
    debug('TS.cmds.addTab(', msg);
    var cmd = msg.cmd;
    var firstParam = cmd.params[0];
    TS.tabs.getSelected(function(tab) {
        TS.controller.addTab({
            'name': firstParam,
            'url': tab.url,
            'title': tab.title,
            'favicon': tab.favIconUrl,
            'pinned': tab.pinned
        });
        TS.controller.saveActivityLog({
            action: 'addTab',
            info: {
                name: firstParam,
                url: tab.url,
                title: tab.title
            }
        });
    });
};
