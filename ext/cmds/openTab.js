/**
 * Methods for `Open Tab` command.
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

TS.omni.commands.push({
    'opt': 'o',
    'cmd': 'open',
    'desc': 'Open Tab',
    'suggest': 'suggestOpen',
    'cmdName': 'openTab'
});

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initOpenTab();
});

/**
 * Add openTab cmd listeners.
 */
TS.cmds.initOpenTab = function() {
    TS.vent.on('cmd:omni:openTab:suggest', TS.cmds.suggestOpenTab);
    TS.vent.on('cmd:omni:openTab:perform', TS.cmds.openTab);
};

/**
 * Return suggestions for Open command.
 * @param {!Object} msg The message event info.
 */
TS.cmds.suggestOpenTab = function(msg) {
    var params = msg.params;
    var requestedTabName = params[0];
    if (requestedTabName === undefined || requestedTabName.trim() === '') {
        TS.suggest.showDefaultSuggestion(
            'Open Tab: the/tab/name');
        return;
    }
    var tabs = TS.controller.getTabsByFuzzyName(requestedTabName);
    var suggestions = TS.suggest.suggestItems(tabs, function(tabInfo) {
        return {
            content: 'open ' + tabInfo.url,
            description: ('open ' + tabInfo.name + ' -> ' +
                TS.util.encodeXml(tabInfo.url))
        };
    });
    msg.showSuggestions(suggestions);
};

/**
 * Open tab by name (or by url if selected from suggestions).
 * @param {!Object} msg The message from pubsub with cmd.
 */
TS.cmds.openTab = function(msg) {
    var cmd = msg.cmd;
    debug('ts.cmds.openTab called');

    var firstParam = cmd.params[0];
    var nameOrUrl = (cmd.params.length !== 0) ? firstParam : '';
    var xmlParsedName = TS.util.decodeXml(nameOrUrl);
    if (nameOrUrl === TS.omni.NO_MATCH_MESSAGE) {
        // User entered the no match message, do nothing.
        // Pass on opening tab.
        return;
    } else if (TS.util.isUrl(xmlParsedName)) {
        // User selected from dropdown.
        // Fragile, depends on open suggest text.
        TS.controller.openTab({url: xmlParsedName});
    } else {
        TS.controller.openTabByFuzzyName(nameOrUrl);
    }
};
