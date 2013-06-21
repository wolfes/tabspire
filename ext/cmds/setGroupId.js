/**
 * Methods for `Set Group Id` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

// Add command to set id for server.
TS.omni.commands.push({
    'opt': 'C',
    'cmd': 'groupId',
    'desc': 'Set Group Id',
    'suggest': 'suggestMessage',
    'cmdName': 'setGroupId'
});

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initSetGroupId();
});

/**
 * Add cmd listeners.
 */
TS.cmds.initSetGroupId = function() {
    TS.vent.on('cmd:omni:setGroupId:suggest', TS.cmds.suggestSetGroupId);
    TS.vent.on('cmd:omni:setGroupId:perform', TS.cmds.joinGroupId);
};

/**
 * Return suggestions for 'Set Group Id' command.
 * @param {string} msg Has 'params', 'showSuggestions'.
 */
TS.cmds.suggestSetGroupId = function(msg) {
    var params = msg.params;
    var suggestions = [];
    TS.suggest.showDefaultSuggestion(
        'Join Group Name: group-name-no-slashes');
    msg.showSuggestions(suggestions);
};

/**
 * Join group on server.
 * @param {object} msg The broadcast cmd msg.
 *  {object} cmd The user's command.
 */
TS.cmds.joinGroupId = function(msg) {
    var cmd = msg.cmd;
    var newGroupName = cmd.params[0];
    //TS.io.setClientId(newId);
    TS.io.joinGroupById(newGroupName);
};
