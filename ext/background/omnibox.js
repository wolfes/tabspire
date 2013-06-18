/**
 * Chrome API Setup.
 *
 * A module that lets you 'register' commands,
 * such that when the user enters text in the omnibox
 * that matches a command, this module vents the message:
 * cmd:omni:cmdName:[suggest | perform]
 * where cmdName is part of registered info,
 * and cmd is recognized by user's text matching cmd.opt.
 *
 * Author: Wolfe Styke - <wstyke@gmail.com>
 */

/**
 * Steps:
 * 1. Map input -> cmd.
 * 2. Offer cmd suggestions.
 *  Publish msg to channel "cmd:omni:cmdName:suggest"
 *  msg = {
 *    params: ...,
 *    showSuggestions: function(Array suggestions) - display in omnibox.
 * 3. Perform entered cmd.
 *  Publish msg to channel "cmd:omni:cmdName:perform"
 *  msg = {
 *    cmd: {...}
 *  }
 */

/** Tabspire Namespace */
var TS = TS || {};

/** Namespace: TS.omni */
TS.omni = TS.omni || {};

/**
 * Supported Commands.
 */
TS.omni.commands = [];

// Register command with properties and a function to identify input?

/**
 * Basic Idea: Each command has:
 * Option: 1 char, for easy typing of command.
 * Cmd: 1 word, for partial/full cmd word recognition.
 * Desc: 1-4 words, shown in Omnibox to help user complete command.
 * Suggest: Function for generating suggestions from remaining params.
 */
/**
 * Message to show to user when no results match command.
 */
TS.omni.NO_MATCH_MSG = 'No more results?  Try backspace!';

/**
 * Reset Chrome Omnibox's default suggestion.
 */
TS.omni.resetDefaultSuggestion = function() {
    TS.omni.updateDefaultSuggestion('');
};

$(document).ready(function() {
    TS.omni.resetDefaultSuggestion();
});

/**
 * Update first suggestion in Chrome Omnibox based on user's text.
 * @param {string} text The user's text in Chrome Omnibox.
 */
TS.omni.updateDefaultSuggestion = function(text) {
    var lb = '<dim>[</dim>';
    var sep = '<dim>|</dim>';
    var rb = '<dim>]</dim>';

    function match(txt) {
        return '<match>' + txt + '</match>';
    }
    var textCmd = text.split(' ')[0];

    var description = lb;
    var numCmds = TS.omni.commands.length;
    for (var i = 0; i < numCmds; i++) {
        var cmd = TS.omni.commands[i];
        var piece = cmd.opt + ': ' + cmd.desc;
        if (text !== '' && cmd.cmd.indexOf(textCmd) === 0) {
            piece = match(piece);
        }
        description += (' ' + piece + ' ');
        if (i !== numCmds - 1) {
            description += sep;
        }
    }
    description += rb;

    console.log('desc:', description);

    chrome.omnibox.setDefaultSuggestion({
      'description': description
        //content: description
      // TODO(wstyke): Fix recently added requirement for content.
    });
};

/**
 * User started typing a tabspire command in Chrome's Omnibox.
 */
TS.omni.inputStarted = function() {
    TS.omni.updateDefaultSuggestion(' ');
};
chrome.omnibox.onInputStarted.addListener(TS.omni.inputStarted);

/**
 * Setup TS.omni.bookmarks with flattened bookmark list.
 */
TS.omni.setupBookmarks = function() {
    chrome.bookmarks.getTree(function(bTree) {
        var bookmarkTypes = bTree[0].children;
        var bookmarkBar = bookmarkTypes[0];
        var otherBookmarks = bookmarkTypes[1];
        TS.omni.bookmarks = TS.omni.flattenBookmarks(bookmarkBar);
        TS.omni.bookmarks = TS.omni.bookmarks.concat(
            TS.omni.flattenBookmarks(otherBookmarks));
    });
};

$(document).ready(function() {
    TS.omni.setupBookmarks();
    setInterval(
        function() {
            TS.omni.setupBookmarks();
        }, 5 * 60 * 1000);
});

/**
 * Parse text into command and params.
 * @param {string} text The text to parse.
 * @return {object} Command The command item.
 */
TS.omni._getCmd = function(text) {
    var command;
    if (text === '') {
        return command;
    }
    var terms = text.split(' '); // ['o', 'listit']
    var cmdQuery = terms[0];
    var cmdParams = terms.splice(1);
    for (var i = 0, N = TS.omni.commands.length; i < N; i++) {
        var cmdInfo = TS.omni.commands[i];
        // Only allow for exactly matching Command Opt.
        if (cmdQuery === cmdInfo.opt) {
            // The command we're looking for: first matched cmd.
            command = cmdInfo;
            command.params = cmdParams;
            break;
        }
    }
    return command;
};

/**
 * User changed text in Chrome's omnibox.
 * @param {string} text User input in Chrome Omnibox.
 * @param {object} suggest Callback: pass suggestions to show in Omnibox.
 */
TS.omni.inputChanged = function(text, suggest) {
    cmd = TS.omni._getCmd(text);
    if (!TS.util.isDef(cmd)) {
        TS.omni.updateDefaultSuggestion(text);
        return;
    }

    if ('cmdName' in cmd) {
        // TODO(wstyke:02/20/2013): Migrate cmd.suggest to msg callback:
        // - from calling TS.suggest.methodName
        // - to sending cmd suggest message with showSuggestions callback.
        // Think hard about which is better.
        TS.vent.trigger(
            'cmd:omni:' + cmd.cmdName + ':suggest', {
                'showSuggestions': suggest,
                'params': cmd.params
        });
    }
};
chrome.omnibox.onInputChanged.addListener(TS.omni.inputChanged);

/**
 * Process user's input if it is a command.
 * @param {string} text The text entered in Omnibox.
 */
TS.omni.inputEntered = function(text) {
    var cmd = TS.omni._getCmd(text);
    debug('inputEntered cmd:', cmd);
    var optToCmd = {
        'a': TS.omni.cmdAddTab,
        'o': TS.omni.cmdOpenTab,
        'd': TS.omni.cmdDeleteTab,
        'r': TS.omni.cmdReload,
        'm': TS.omni.cmdMessageAt,
        'n': TS.omni.cmdMessageIn,
        'rw': TS.omni.reloadWindow,
        's': TS.omni.addBookmarklet,
        'u': TS.omni.useNamedBook,
        'h': TS.omni.openHistory,
        'b': TS.omni.openBookmark,
        'c': TS.omni.setClientId,
        //'C': TS.omni.setGroupId,
        'e': TS.omni.cmdExtractUrl,
        'E': TS.omni.cmdExtractUrlClones,
        ' ': TS.omni.queryAllItems  // Undocumented method for test.
    };
    if ('cmdName' in cmd) {
        var channel = 'cmd:omni:' + cmd.cmdName + ':perform';
        var msg = {'cmd': cmd};
        debug('Messaging:', channel, 'with:', msg);
        TS.vent.trigger(channel, msg);
    } else {
        debug('Using old method of calling optToCmd[cmd.opt]');
        optToCmd[cmd.opt](cmd);
    }
};

chrome.omnibox.onInputEntered.addListener(TS.omni.inputEntered);

/**
 * Get flattened list of bookmarks from Chrome's bookmark tree.
 * @param {object} bookmarkTree A Chrome Bookmark Tree.
 * @param {string} opt_prefix Optional prefix for bookmark name.
 * @return {object} bookmarks A list of flattened bookmarks.
 */
TS.omni.flattenBookmarks = function(bookmarkTree, opt_prefix) {
    opt_prefix = opt_prefix || '';
    bookmarks = [];
    for (var i = 0, n = bookmarkTree.children.length; i < n; i++) {
        var child = bookmarkTree.children[i];
        var prefix = (opt_prefix ?
                opt_prefix + '/' + child.title : child.title);
        if ('children' in child) {
            bookmarks = bookmarks.concat(
                    TS.omni.flattenBookmarks(child, prefix));
        } else {
            child.name = prefix;
            bookmarks.push(child);
        }
    }
    return bookmarks;
};

/**
 * Create, return, optionally show HTML5 Notification.
 * @param {string} opt_title The notification's title.
 * @param {string} opt_content The body text.
 * @param {string} opt_image The image src.
 * @return {object} notification The html5 notification.
 */
TS.omni.createNotification = function(
        opt_title, opt_content, opt_image) {
    var notification = webkitNotifications.createNotification(
        opt_image || '',
        opt_title || '',
        opt_content || ''
    );
    TS.controller.msg = opt_content;
    notification = webkitNotifications.createHTMLNotification(
      '../notif/notif.html'  // html url - can be relative
    );
    notification.addEventListener('click', function(e) {
        var this_ = this;
        setTimeout(function() {
            this_.cancel();
        }, 200);
    });
    return notification;
};

/**
 * Query (saved tabs, bookmarks, history) for matches.
 * @param {object} cmd The user's params.
 */
TS.omni.queryAllItems = function(cmd) {
    debug(cmd);
};
