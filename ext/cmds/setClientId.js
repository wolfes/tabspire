/**
 * Methods for `Set Client Id` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

// Add command to set id for server.
TS.omni.registerCommand(
   'c', 'clientId', 'Set Client Id', 'setClientId'
);

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initSetClientId();
});

/**
 * Add cmd listeners.
 */
TS.cmds.initSetClientId = function() {
    TS.vent.on('cmd:omni:setClientId:suggest', TS.cmds.suggestSetClientId);
    TS.vent.on('cmd:omni:setClientId:perform', TS.cmds.setClientId);
};

/**
 * Return suggestions for MessageAt command.
 * @param {string} msg Has 'params', 'showSuggestions'.
 */
TS.cmds.suggestSetClientId = function(msg) {
    var params = msg.params;
    TS.suggest.showDefaultSuggestion(
        'Set Client ID: client-id-no-slashes');
    var suggestions = [];
    msg.showSuggestions(suggestions);
};

/**
 * Set client id for server.
 * @param {object} msg The broadcast cmd msg.
 *  {object} cmd The user's command.
 */
TS.cmds.setClientId = function(msg) {
    var cmd = msg.cmd;
    var newId = cmd.params[0];
    TS.io.setClientId(newId);
};
