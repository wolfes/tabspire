/**
 * Methods for `Message In` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

TS.omni.commands.push({
    'opt': 'n',
    'cmd': 'notify',
    'desc': 'NotifyIn',
    'suggest': 'suggestMessage',
    'cmdName': 'msgIn'
});

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initMessageIn();
});

/**
 * Add cmd listeners.
 */
TS.cmds.initMessageIn = function() {
    TS.vent.on('cmd:omni:msgIn:suggest', TS.cmds.suggestMessageIn);
    TS.vent.on('cmd:omni:msgIn:perform', TS.cmds.messageIn);
};

/**
 * Return suggestions for MessageIn command.
 * @param {string} msg Has 'params', 'showSuggestions'.
 */
TS.cmds.suggestMessageIn = function(msg) {
    var params = msg.params;
    var suggestions = [];
    msg.showSuggestions(suggestions);
};


/**
 * Set Notification for n minutes in the future! ms accuracy!
 * @param {object} msg The broadcast message for this command.
 *   cmd: The command object augmented with user's input.
 */
TS.cmds.messageIn = function(msg) {
    var cmd = msg.cmd;
    var minToMsg = (parseInt(cmd.params[0]));
    var msg = cmd.params.splice(1).join(' ');
    var date = new Date();
    var currMSec = date.getSeconds() * 1000 + date.getMilliseconds();
    var msecToMsg = (minToMsg * 60 * 1000) - currMSec;
    var timeAgo = minToMsg === 1 ? ' minute ago...' : ' minutes ago...';

    TS.tabs.getSelected(function(tab) {
        var notification = TS.omni.createNotification(
            'From ' + minToMsg + timeAgo, // Title
            {'msg': msg, 'url': tab.url, 'title': tab.title}
        );
        setTimeout(function() {
            notification.show();
        }, msecToMsg);
        TS.controller.saveActivityLog({
            action: 'msgIn',
            info: {
                msg: msg,
                delay: msecToMsg,
                activeTab: tab
            }
        });
    });
};


