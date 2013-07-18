/**
 * Methods for `Message At` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

TS.omni.commands.push({
    'opt': 'm',
    'cmd': 'message',
    'desc': 'MsgAt',
    'suggest': 'suggestMessage',
    'cmdName': 'msgAt'
});

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initMessageAt();
});

/**
 * Add cmd listeners.
 */
TS.cmds.initMessageAt = function() {
    TS.vent.on('cmd:omni:msgAt:suggest', TS.cmds.suggestMessageAt);
    TS.vent.on('cmd:omni:msgAt:perform', TS.cmds.messageAt);
};

/**
 * Return suggestions for MessageAt command.
 * @param {string} msg Has 'params', 'showSuggestions'.
 */
TS.cmds.suggestMessageAt = function(msg) {
    var params = msg.params;
    var suggestions = [];
    if (params[0] === undefined || params[0].trim() === '') {
        TS.suggest.showDefaultSuggestion(
            'Message At: hour:minute Message...');
        return;
    }
    msg.showSuggestions(suggestions);
};

/**
 * Compute milliseconds to target hour and minute later today from now.
 * @param {number} targetHour An hour later today.
 * @param {number} targetMin A minute of that hour later today.
 * @return {number} msecToTime The number of milliseconds until the time.
 */
TS.cmds.msecToTime = function(targetHour, targetMin) {
    var currDate = new Date();
    var currHour = currDate.getHours();
    var currMin = currDate.getMinutes();
    var currSec = currDate.getSeconds();
    var currMSec = currDate.getMilliseconds();

    var isTomorrow = ((targetHour < currHour) ||
            ((targetHour === currHour) && (targetMin < currMin)));
    var minToMsg = 0;
    if (isTomorrow) {
        // Message for tomorrow.
        debug('Un-implemented: msg for tomorrow');
    } else {
        // Message for later today.
        minToMsg += (targetHour - currHour) * 60;
        minToMsg += (targetMin - currMin);
    }
    var msecToTime = (minToMsg * 60 * 1000) - (currSec * 1000 + currMSec);
    return msecToTime;
};

/**
 * Set notification for a military time.
 * @param {object} msg The broadcast message for this cmd.
 *   'cmd': The command object augmented with user's input.
 */
TS.cmds.messageAt = function(msg) {
    var cmd = msg.cmd;
    var time = cmd.params[0];
    var msg = cmd.params.splice(1).join(' ');

    var hourMin = time.split(':');
    var targetHour = parseInt(hourMin[0], 10);
    var targetMin = parseInt(hourMin[1], 10);
    var msecToMsg = TS.cmds.msecToTime(targetHour, targetMin);

    //var minutesAgo = msecToMsg / (60 * 1000)
    //var title = minutesAgo < 60 ? "" : "";

    TS.tabs.getSelected(function(tab) {
        debug('Setting up msgAt notification for seconds delay:', msecToMsg);
        TS.omni.createNotification(
            'From ' + (msecToMsg / (3600 * 1000) + ' hours ago:',
            msg,
            '../img/tabscape24.png',
            msecToMsg);
        TS.controller.saveActivityLog({
            action: 'msgAt',
            info: {
                msg: msg,
                delay: msecToMsg,
                activeTab: tab
           }
        });
    });
};

