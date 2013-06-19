/**
 * Methods for `Open History` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

// Add command for: History Fuzzy Search
TS.omni.commands.push({
    'opt': 'h',
    'cmd': 'history',
    'desc': 'Search History',
    'suggest': 'suggestHistory',
    'cmdName': 'openHistory'
});

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.setupHistory();
    setInterval(
        function() {
            TS.cmds.setupHistory();
        }, 5 * 60 * 1000);

    TS.cmds.initOpenHistory();
});

/**
 * Setup TS.cmds.historyList with list of sites visited from user history.
 */
TS.cmds.setupHistory = function() {
    chrome.history.search({
        'text': '', 'maxResults': 1000},
        function(history) {TS.cmds.historyList = history;});
};


/**
 * Add cmd listeners.
 */
TS.cmds.initOpenHistory = function() {
    TS.vent.on('cmd:omni:openHistory:suggest', TS.cmds.suggestOpenHistory);
    TS.vent.on('cmd:omni:openHistory:perform', TS.cmds.openHistory);
};

/**
 * Return suggestions for history search matches.
 * @param {Object} msg The broadcast message.
 *  {string} params: User's input for search.
 *  {function} showSuggestions Use to show suggestions in omnibox.
 */
TS.cmds.suggestOpenHistory = function(msg) {
    var params = msg.params;
    var suggestions = [];
    var query = params[0];
    var queryRegExp = new RegExp(query, 'i');

    if (query === undefined || query.trim() === '') {
        TS.suggest.showDefaultSuggestion(
            'Open History: url-or-title-query');
        return;
    }

    var history = TS.cmds.historyList;
    var numHistory = history.length;
    for (var i = 0; i < numHistory; i++) {
        var site = history[i];
        if (queryRegExp.test(site.url) ||
                queryRegExp.test(site.title)) {
            suggestions.push({
                content: 'h ' + TS.util.encodeXml(site.url),
                description: 'Open ' + TS.util.encodeXml(site.title)
            });
        }
    }
    msg.showSuggestions(suggestions);
};

/**
 * Open url from History.
 * @param {object} cmd The user's command info.
 */
TS.cmds.openHistory = function(cmd) {
    var url = cmd.params[0];
    url = TS.util.decodeXml(url);
    if (TS.util.isUrl(url)) {
        TS.controller.openTab({url: url});
        TS.controller.saveActivityLog({
            action: 'openHistory',
            info: {
               openUrl: url
            }
        });
    } else {
        debug('Open History - Not a Url');
    }
};
