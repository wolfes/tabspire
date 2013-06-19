/**
 * Methods for `Open Bookmark` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

// Add command for: Bookmark Fuzzy Search
TS.omni.commands.push({
    'opt': 'b',
    'cmd': 'bookmarkOpen',
    'desc': 'Open Bookmark',
    'suggest': 'suggestChromeBookmarks',
    'cmdName': 'openBookmark'
});

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initOpenBookmark();
});

/**
 * Add cmd listeners.
 */
TS.cmds.initOpenBookmark = function() {
    TS.vent.on('cmd:omni:openBookmark:suggest', TS.cmds.suggestOpenBookmarks);
    TS.vent.on('cmd:omni:openBookmark:perform', TS.cmds.openBookmark);
};

/**
 * Return suggestions for Chrome's bookmark matches.
 * @param {Object} msg The broadcast msg.
 *  {string} params User's input for search.
 */
TS.cmds.suggestOpenBookmarks = function(msg) {
    // TODO(wstyke:11-14-2012): Fully un-tree-ify bookmark tree.
    // There are still children within the bookmark list...
    // Name the children via "parentFolderName/bookmarkName".
    var params = msg.params;
    var suggestions = [];
    var query = new RegExp(params[0], 'i');

    if (params[0] === undefined || params[0].trim() === '') {
        TS.suggest.showDefaultSuggestion(
            'Open Bookmark: bookmark-name');
        return;
    }

    var bookmarks = TS.omni.bookmarks;
    for (var i = 0, n = bookmarks.length; i < n; i++) {
        var bookmark = bookmarks[i];
        if (!('url' in bookmark && 'title' in bookmark)) {
            continue;
        }
        if (query.test(bookmark.name)) {
            suggestions.push(bookmark);
        }
    }
    suggestions = TS.suggest.suggestItems(suggestions, function(bmark) {
        return {
            'description': 'b ' + TS.util.encodeXml(bmark.name), //.title
            'content': 'b ' + TS.util.encodeXml(bmark.url)
        };
    });
    msg.showSuggestions(suggestions);
};

/**
 * Open Chrome Bookmark
 * @param {object} msg
 *   {object} cmd The user's command info.
 */
TS.cmds.openBookmark = function(msg) {
    var cmd = msg.cmd;
    var url = TS.util.decodeXml(cmd.params[0]);
    if (url.search('javascript:') === 0) {
        // Use bookmarklet bookmark.
        debug('openBookmark - activating bookmarklet');
        chrome.tabs.executeScript(
            // null -> Execute in current tab.
            null, { code: unescape(url.substr(11)) }
        );
        TS.controller.saveActivityLog({
            action: 'openBookmark',
            info: {
                bookmarkType: 'bookmarklet',
                openUrl: url
            }
        });
    } else if (TS.util.isUrl(url)) {
        // Open tab.
        debug('openBookmark - opening bookmark');
        TS.controller.openTab({url: url});
        TS.controller.saveActivityLog({
            action: 'openBookmark',
            info: {
                bookmarkType: 'bookmark',
                openUrl: url
            }
        });
    } else {
        debug('Open Bookmark - Not a Url');
        // TODO(wstyke:11-15-2012) Move dup code to controller.
        var query = new RegExp(cmd.params[0], 'i');
        var bookmarks = TS.omni.bookmarks;
        for (var i = 0, n = bookmarks.length; i < n; i++) {
            var bookmark = bookmarks[i];
            if (!('url' in bookmark && 'title' in bookmark)) {
                continue;
            }
            if (query.test(bookmark.name)) {
                cmd.params[0] = bookmark.url;
                TS.omni.openBookmark(cmd);
                break;
            }
        }
    }
};

