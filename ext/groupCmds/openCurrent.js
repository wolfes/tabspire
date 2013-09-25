/**
 * Methods for `Group: Open Current Tab` command.
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
  'opt': 'G',
  'cmd': 'GroupShare',
  'desc': 'Send to Group',
  'suggest': 'suggestGroupShare',
  'cmdName': 'groupShare'
});

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
  TS.cmds.initGroupShare();
});

/**
 * Add openWin cmd listeners.
 */
TS.cmds.initGroupShare = function() {
  TS.vent.on('cmd:omni:groupShare:suggest', TS.cmds.suggestGroupShare);
  TS.vent.on('cmd:omni:groupShare:perform', TS.cmds.groupShare);
};

/**
 * Return suggestions for Group Share command.
 * @param {!Object} msg The message event info.
 */
TS.cmds.suggestGroupShare = function(msg) {
  msg.showSuggestions([]);
};

/**
 * Open window by name (or by url if selected from suggestions).
 * @param {!Object} msg The message from pubsub with cmd.
 */
TS.cmds.groupShare = function(msg) {
  TS.gCmd.openCurrentURL();
};
