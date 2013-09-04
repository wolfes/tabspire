/**
 * Methods for `Add Window` command.
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
    'opt': 'A',
    'cmd': 'AddWin',
    'desc': 'Add Win',
    'suggest': 'suggestAddWin',
    'cmdName': 'addWin'
});

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initAddWin();
});

/**
 * Add addWin cmd listeners.
 */
TS.cmds.initAddWin = function() {
    TS.vent.on('cmd:omni:addWin:suggest', TS.cmds.suggestAddWin);
    TS.vent.on('cmd:omni:addWin:perform', TS.cmds.addWin);
};

/**
 * Return suggestions for Add Window command.
 * @param {string} msg Msg containing cmd params.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.cmds.suggestAddWin = function(msg) {
    debug('TS.cmds.suggestAddWin(', msg);
    var params = msg.params;
    var suggestions = [];
    var name = params[0] !== undefined ? params[0] : '';
    chrome.omnibox.setDefaultSuggestion({
        'description': 'Add named window: ' + name
    });
    var windows = TS.controller.getWinByFuzzyName(name);
    var suggestions = TS.suggest.suggestItems(
        windows,
        function(winInfo) {
            return {
                content: '',
                description: 'Saved Window: ' + winInfo.name
            };
        },
        true // Skip Showing Default Suggestions.
    );
    return suggestions;
};


/**
 * Add name to active window.
 * @param {object} msg Has cmd containing user's input.
 */
TS.cmds.addWin = function(msg) {
    debug('TS.cmds.addWin(', msg);
    var cmd = msg.cmd;
    var firstParam = cmd.params[0];
    chrome.windows.getCurrent({'populate': true}, function(winInfo) {
      winInfo['name'] = firstParam;
      TS.dbWin.upsertNamedWindow(winInfo);
      TS.controller.saveActivityLog({
          action: 'addWin',
          info: {
              name: firstParam
          }
      });
    });
};
