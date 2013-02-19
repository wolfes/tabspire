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

TS.cmds.all.push({
    'opt': 'o',
    'cmd': 'open',
    'desc': 'Open Tab',
    'suggest': 'suggestOpen'
});

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.vent.on('document:ready', TS.cmds.initOpenTab);
    TS.vent.on('cmd:suggest:omni:openTab', TS.cmds.suggestOpenTab);
    TS.vent.on('cmd:perform:omni:openTab', TS.cmds.openTab);
});

/**
 * Add openTab cmd listeners.
 */
TS.cmds.initOpenTab = function() {
    debug('addOpenTabListeners');
};

/**
 * Return suggestions for Open command.
 * @param {string} params for open named tab.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.cmds.suggestOpenTab = function(params) {
    var requestedTabName = params[0];
    var tabs = TS.controller.getTabsByFuzzyName(requestedTabName);
    var suggestions = TS.suggest.suggestItems(tabs, function(tabInfo) {
        return {
            content: 'open ' + tabInfo.url,
            description: ('open ' + tabInfo.name + ' -> ' +
                TS.util.encodeXml(tabInfo.url))
        };
    });
    return suggestions;
};

/**
 * Open tab by name (or by url if selected from suggestions).
 * @param {object} msg The message from pubsub with cmd.
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
