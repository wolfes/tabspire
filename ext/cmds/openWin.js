/**
 * Methods for `Open Win` command.
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
  'opt': 'O',
  'cmd': 'OpenWin',
  'desc': 'Open Win',
  'suggest': 'suggestOpen',
  'cmdName': 'openWin'
});

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
  TS.cmds.initOpenWin();
});

/**
 * Add openWin cmd listeners.
 */
TS.cmds.initOpenWin = function() {
  TS.vent.on('cmd:omni:openWin:suggest', TS.cmds.suggestOpenWin);
  TS.vent.on('cmd:omni:openWin:perform', TS.cmds.openWin);
};

/**
 * Return suggestions for Open command.
 * @param {!Object} msg The message event info.
 */
TS.cmds.suggestOpenWin = function(msg) {
  var params = msg.params;
  var requestedWinName = params[0];
  var windows = TS.dbWin.getWinByFuzzyName(requestedWinName);
  if (windows.length === 0 &&
      (requestedWinName === undefined || requestedWinName.trim() === '')) {
    TS.suggest.showDefaultSuggestion('Open Window: the/window/name');
  }
  debug('suggOpenWin', windows);
  var suggestions = TS.suggest.suggestItems(windows, function(winInfo) {
    return {
      content: 'OpenWin ' + winInfo.name,
      description: 'Open Window: ' + winInfo.name
    };
  });
  msg.showSuggestions(suggestions);
};

/**
 * Open window by name (or by url if selected from suggestions).
 * @param {!Object} msg The message from pubsub with cmd.
 * @return {boolean} Returns false if fails to find window to open.
 */
TS.cmds.openWin = function(msg) {
  var cmd = msg.cmd;
  debug('ts.cmds.openWin(...)');

  var windowName = cmd.params[0];
  var windows = TS.dbWin.getWinByFuzzyName(windowName);
  if (windows.length === 0) {
    return false;
  }

  var windowToOpen = windows[0];
  TS.controller.openWindowFromInfo(windowToOpen);
};

