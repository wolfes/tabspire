/**
 * Websocket module for connecting to nspire request routing server.
 *
 * @author Wolfe Styke -- <wstyke@gmail.com>
 */

/** Project Namespace */
var TS = TS || {};

/** Module Namespace */
TS.io = TS.io || {};

/** Base Server API url. */
TS.io.BASE_URL = 'ws://cmdsync.com:3000/tabspire/api/0/';

/** Base Test Server API url. */
TS.io.BASE_TEST_URL = 'ws://localhost:3000/tabspire/api/0/';

/** Attempt websocket reconnection every N seconds. */
TS.io.WAIT_BEFORE_RECONNECTING = 10 * 1000;

/** Heartbeat Timer for checking connection */
TS.io.reconnectTimer;

/**
 * Start heartbeat to ensure connection stays open.
 */
TS.io.startSocketHeartbeat = function() {
  //if (TS.io.port.readyState === TS.io.port.CLOSED) {
     //Attempt to reconnect immediately if possible.
    //TS.io.setupSocket();
  //}
  // Then continue attempting to reconnect if closed.
  clearInterval(TS.io.reconnectTimer);
  TS.io.reconnectTimer = setInterval(function() {
    if (TS.io.port.readyState === TS.io.port.CLOSED) {
      TS.io.setupSocket();
    }
  }, TS.io.WAIT_BEFORE_RECONNECTING);
};

/**
 * Set up socket with a given private client id.
 * @param {string} clientId Alphabetic string to identify this connection.
 */
TS.io.setClientId = function(clientId) {
  if (clientId.search('/') !== -1) {
    debug('Client ID invalid.  Cannot contain slashes.');
    return;
  }
  localStorage.setItem('clientId', clientId);
  TS.io.setupSocket(clientId);
};

/**
 * Join the group with specified id.
 * TODO(wstyke:6-21-2013): Consider storing more than last joined group name.
 * @param {string} groupName The name of the group to join.
 */
TS.io.joinGroupById = function(groupName) {
  if (groupName.trim() === '') {
    return;
  }

  TS.dbFlags.setFlag('lastGroupName', groupName);

  var baseSocketUrl = (
    TS.dbFlags.getFlag('localSettings') ?
    TS.io.BASE_TEST_URL : TS.io.BASE_URL);
  var connectUrl = baseSocketUrl + groupName + '/join-group';

  TS.io.port = new WebSocket(connectUrl);
  //TODO(wstyke): Consider using routeIncomingGroupRequest handler.
  TS.io.port.onmessage = TS.io.routeIncomingPrivateRequest;
  TS.io.port.onopen = function() {
    debug('Connected!');
  };

};

/**
 * Create websocket to server for receiving requests sent to clientId.
 * @param {string} clientId Alphabetic string to identify this connection.
 */
TS.io.setupSocket = function(clientId) {
  var clientId = clientId || localStorage.getItem('clientId') || '';
  if (clientId.trim() === '') {
    debug('Client ID is empty string.  Aborting setting up socket.');
    return;
  }

  TS.io.registerCommands();

  var baseSocketUrl = (
    TS.dbFlags.getFlag('localSettings') ?
    TS.io.BASE_TEST_URL : TS.io.BASE_URL);
  var connectUrl = baseSocketUrl + clientId + '/join-private';
  debug('Connecting to:', connectUrl);

  TS.io.port = new WebSocket(connectUrl);
  TS.io.port.onmessage = TS.io.routeIncomingPrivateRequest;
  TS.io.port.onopen = function() {
    debug('Connected!');
  };

  TS.io.startSocketHeartbeat();
  TS.io.port.onclose = function() {
    // Restart socket reconnect heartbeat.
    // Recreate websocket connection when current socket closes.
    debug('WebSocket Disconnected.');
    TS.io.startSocketHeartbeat();
  };
  localStorage.setItem('clientId', clientId);
};

/**
 * Route an incoming private request from nspire server.
 * @param {Object} request Request from nspire server.
 */
TS.io.routeIncomingPrivateRequest = function(request) {
  var requestData = JSON.parse(request.data);
  debug('Route Incoming Private Request:', requestData);
  // Publish the incoming command request.
  if (requestData.hasOwnProperty('command') &&
      requestData.hasOwnProperty('command-data')) {
    TS.vent.trigger(
      'nspire:' + requestData.command,
      requestData['command-data']);
  }
};

/**
 * Boolean flag indicating whether command listeners have been registered.
 */
TS.io.commandsRegistered = false;

/**
 * Register handlers for command requests published on vent.
 */
TS.io.registerCommands = function() {
  if (TS.io.commandsRegistered) {
    return;
  }
  TS.io.commandsRegistered = true;

  TS.vent.on('nspire:openGoogleSearch', function(data) {
    TS.controller.openSearchTab({
      'query': 'query' in data ? data.query : '',
      'lucky': false
    });
  });

  TS.vent.on('nspire:openTabByName', function(data) {
    if (!('tabName' in data)) {
      return;
    }
    TS.controller.openTabByFuzzyName(data['tabName']);
  });

  TS.vent.on('nspire:reloadTabByName', function(data) {
    TS.controller.reloadTabByFuzzyName(
      'tabName' in data ? data.tabName : '');
  });

  TS.vent.on('nspire:reloadCurrentTab', function(data) {
    TS.tabs.reloadCurrent();
  });

  TS.vent.on('nspire:openURL', function(data) {
    TS.controller.openTab({
      'url': data.url
    });
  });

  TS.vent.on('nspire:focusMark', function(data) {
    var charCodeMark = data.markChar.charCodeAt(0);
    TS.controller.reloadFocusMark(charCodeMark, false);
  });

  TS.vent.on('nspire:reloadFocusMark', function(data) {
    var charCodeMark = data.markChar.charCodeAt(0);
    TS.controller.reloadFocusMark(charCodeMark, true);
  });

  TS.vent.on('nspire:reloadCurrentTab', function(data) {
    TS.tabs.reloadCurrent();
  });

  TS.vent.on('nspire:focusCurrentWindow', function(data) {
    TS.tabs.focusFocusedTab();
  });

  TS.vent.on('nspire:highlightMark', function(data) {
    // TODO:(wstyke:01-16-2013): Unimplemented on tab/vim-spire + server.
    var charCodeMark = data.mark.charCodeAt(0);
    TS.controller.highlightMark(charCodeMark);
  });

  TS.vent.on('nspire:focusNextTab', function(data) {
    TS.tabs.focusNextTab();
  });
  TS.vent.on('nspire:focusPrevTab', function(data) {
    TS.tabs.focusPrevTab();
  });
  TS.vent.on('nspire:focusLastTab', function(data) {
    TS.obsTab.selectPrevFocusedTab();
  });
  TS.vent.on('nspire:focusLastWindow', function(data) {
    TS.obsWin.focusLastWindow();
  });
};
