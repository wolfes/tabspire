/**
 * Methods for `Delete Tab` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

TS.omni.commands.push({
    'opt': 'd',
    'cmd': 'delete',
    'desc': 'Del Tab',
    'suggest': 'suggestDelete',
    'cmdName': 'deleteTab'
});

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initDeleteTab();
});

/**
 * Add deleteTab cmd listeners.
 */
TS.cmds.initDeleteTab = function() {
    TS.vent.on('cmd:omni:deleteTab:suggest', TS.cmds.suggestDeleteTab);
    TS.vent.on('cmd:omni:deleteTab:perform', TS.cmds.deleteTab);
};

/**
 * Return suggestions for Delete Tab by Name command.
 * @param {Object} msg Has params for delete named tab.
 */
TS.cmds.suggestDeleteTab = function(msg) {
    debug('suggestDeleteTab(', msg);
    var params = msg.params;
    var requestedTabName = params[0];
    var tabs = TS.controller.getTabsByFuzzyName(requestedTabName);
    var suggestions = TS.suggest.suggestItems(tabs, function(tabInfo) {
        return {
            content: 'delete ' + tabInfo.url,
            description: ('delete ' + tabInfo.name + ' -> ' +
                TS.util.encodeXml(tabInfo.url))
        };
    });
    msg.showSuggestions(suggestions);
};

/**
 * Delete tab by name (or by url if selected from suggestions).
 * @param {object} msg Has 'cmd' command object with user's input.
 */
TS.cmds.deleteTab = function(msg) {
    var cmd = msg.cmd;
    var firstParam = cmd.params[0];
    var nameOrUrl = (cmd.params.length !== 0) ? firstParam : '';
    var xmlParsedName = TS.util.decodeXml(nameOrUrl);
    debug('cmdDeleteTab: xmlParsedName', xmlParsedName,
            ', nameOrUrl:', nameOrUrl);
    if (nameOrUrl === TS.omni.NO_MATCH_MESSAGE) {
        // User entered the no match message, do nothing.
        // Pass on opening tab.
        return;
    } else if (TS.util.isUrl(xmlParsedName)) {
        // User selected from dropdown.
        // Fragile, depends on open suggest text.
        TS.dbTabs.removeTabByURL(xmlParsedName);
    } else {
        TS.controller.deleteTabByFuzzyName(nameOrUrl);
    }
};


