/**
 * Module for sending and receiving group commands.
 *
 * @author Wolfe Styke -- <wstyke@gmail.com>
 */

/** Project Namespace */
var TS = TS || {};

/** Module Namespace */
TS.gCmd = TS.gCmd || {};

/** Channel Type for group commands. */
TS.gCmd.GROUP_CHANNEL_TYPE = 'group';

/** Almost gauranteed unique user id for a group. */
TS.gCmd.uuid = parseInt(Math.random() * 100000000, 10);

/**
 * Send a command to a group by name.
 * @param {Object} cmd Contains command info:
 *  groupName: String. Target group name. Currently ignored,
 *  the group your socket signed up for is used instead.
 *  cmd: String.  Server cmd.
 *  command: String. Receiving Client cmd.
 *  command-data: Optional object with command-specific info.
 */
TS.gCmd.sendToGroup = function(cmd) {
  // Send message to server.
  cmd['channel-type'] = TS.gCmd.GROUP_CHANNEL_TYPE;
  cmd['sender-uuid'] = TS.gCmd.uuid;
  cmd['group-name'] = TS.dbFlags.getFlag('lastGroupName');
  TS.io.groupPort.send(JSON.stringify(cmd));
};

/**
 * Send current group message to open current URL.
 */
TS.gCmd.openCurrentURL = function() {
  TS.tabs.getCurrentURL(function(currentUrl) {
    debug('openCurrentURL:', currentUrl);
    TS.gCmd.sendToGroup({
      'cmd': 'group-broadcast',
      'command': 'openURL',
      'command-data': {'url': currentUrl}
    });
  });
};
