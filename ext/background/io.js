/**
 * IO controller for connection to cmdsync server.
 *
 * @author Wolfe Styke -- <wstyke@gmail.com
 */

/** Project Namespace */
var TS = TS || {};

/** Module Namespace */
TS.io = TS.io || {};

/**
 * Upload new opt_clientId or existing stored client id to the server.
 * @param {?string} opt_clientId The new client id. Default: saved clientId.
 * @param {?string} opt_oldClientId The previous client id.
 */
TS.io.uploadClientId = function(opt_clientId, opt_oldClientId) {
    var clientId = opt_clientId || localStorage.getItem('clientId');
    var oldClientId = opt_oldClientId || clientId;
    if (!TS.util.isDef(clientId)) {
        debug('Client Id Missing.');
        return;
    }
    TS.io.port.emit('id:register', {
        'socketId': clientId,
        'oldSocketId': clientId
    });
};

/**
 * Set client's id for server communication from vimspire.
 * @param {string} clientId The id to be known by on server.
 */
TS.io.setClientId = function(clientId) {
    if (clientId.search('/') !== -1) {
        debug('Client Id is Invalid. Cannot contain slash "/".');
        return;
    }
    // Register new, unregister old if applicable.
    TS.io.uploadClientId(
        clientId, localStorage.getItem('clientId'));
    localStorage.setItem('clientId', clientId);
};

/**
 * Connect socket to server and setup listeners.
 */
TS.io.setupSocket = function() {
    var serverHost = (TS.dbFlags.getFlag('localSettings') ?
            'http://localhost:3000' : 'cmdsync.com:3000');

    TS.io.port = io.connect(serverHost, {
        'max reconnection attempts': Infinity
    });

    TS.io.port.socket.on('reconnecting', function(delay) {
       TS.io.port.socket.reconnectionDelay = 5 * 60 * 1000;
    });
    TS.io.port.socket.on('reconnect', function() {
        TS.io.uploadClientId();
    });
    // Starts reconnecting engines.
    TS.io.port.socket.reconnect();

    // Register clientId with server on restarting app.
    var clientId = localStorage.getItem('clientId');
    debug('Connecting to', serverHost, 'with clientId:', clientId);
    if (clientId && clientId !== '') {
        TS.io.port.emit('id:register', {
            'socketId': clientId
        });
    }
    // Connect incoming messages.
    TS.io.port.on('search:normal', function(data) {
        debug('search:normal', data);
        TS.controller.openSearchTab({
            'query': 'query' in data ? data.query : '',
            'lucky': false
        });
    });
    TS.io.port.on('search:lucky', function(data) {
        TS.controller.openSearchTab({
            'query': 'query' in data ? data.query : '',
            'lucky': true
        });
    });
    TS.io.port.on('tab:openByName', function(data) {
        debug('tab:openByName', data);
        if (!('name' in data)) {
            return;
        }
        TS.controller.openTabByFuzzyName(data['name']);
    });
    TS.io.port.on('tab:openByURL', function(data) {
        debug('tab:openByURL', data);
        TS.controller.openTab({
            'url': data.url
        });
    });
    TS.io.port.on('tab:reloadByName', function(data) {
        debug('tab:reloadByName', data);
        TS.controller.reloadTabByFuzzyName(
            'tabName' in data ? data.tabName : '');
    });
    TS.io.port.on('tab:reloadByURL', function(data) {
        debug('tab:reloadByURL', data);
        TS.controller.openTab({
            'url': 'url' in data ? data.url : ''
        }, true);
    });
    TS.io.port.on('tab:reloadCurrent', function(data) {
        debug('tab:reloadCurrent', data);
        TS.tabs.reloadCurrent();
    });
    TS.io.port.on('tab:reloadFocusMark', function(data) {
        debug('tab:reloadFocusMark', data);
        var charCodeMark = data.mark.charCodeAt(0);
        TS.controller.reloadFocusMark(charCodeMark, true);
    });
    TS.io.port.on('tab:focusMark', function(data) {
        debug('tab:focusMark', data);
        var charCodeMark = data.mark.charCodeAt(0);
        TS.controller.reloadFocusMark(charCodeMark, false);
    });
    TS.io.port.on('tab:highlightMark', function(data) {
        debug('tab:highlightMark', data);
        // TODO:(wstyke:01-16-2013): Unimplemented on tab/vim-spire + server.
        var charCodeMark = data.mark.charCodeAt(0);
        TS.controller.highlightMark(charCodeMark);
    });
    TS.io.port.on('window:focusCurrent', function(data) {
        debug('window:focusCurrent', data);
        // TODO:(wstyke:01-16-2013): Unimplemented on server/vimspire.
        TS.tabs.focusFocusedTab();
    });
    TS.io.port.on('room:msg:recieve', function(data) {
        debug('room:msg:recieve', data);
    });
};
