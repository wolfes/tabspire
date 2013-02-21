/**
 * Chrome API Setup.
 *
 * Author: Wolfe Styke - <wstyke@gmail.com>
 */

/**
 * Restructure these into their parts:
 *
 * Parse Input for which Suggestion or Command is intended.
 *
 * Gather Relevant Items.
 *
 * Make Suggestions or Do Command.
 */

/** Tabspire Namespace */
var TS = TS || {};

/** Namespace: TS.omni */
TS.omni = TS.omni || {};

/**
 * Supported Commands.
 */
TS.omni.commands = [];

/**
 * Basic Idea: Each command has:
 * Option: 1 char, for easy typing of command.
 * Cmd: 1 word, for partial/full cmd word recognition.
 * Desc: 1-4 words, shown in Omnibox to help user complete command.
 * Suggest: Function for generating suggestions from remaining params.
 */
TS.omni.commands.push({
    'opt': 'a',
    'cmd': 'add',
    'desc': 'Add Tab',
    'suggest': 'suggestAdd'
});
TS.omni.commands.push({
    'opt': 'd',
    'cmd': 'delete',
    'desc': 'Del Tab',
    'suggest': 'suggestDelete'
});
TS.omni.commands.push({
    'opt': 'o',
    'cmd': 'open',
    'desc': 'Open Tab',
    'suggest': 'suggestOpen',
    'cmdName': 'openTab'
});
TS.omni.commands.push({
    'opt': 'rw',
    'cmd': 'rwindow',
    'desc': 'Reload Win',
    'suggest': 'suggestMessage'
});
TS.omni.commands.push({
    'opt': 'r',
    'cmd': 'reload',
    'desc': 'Reload Tab',
    'suggest': 'suggestReload'
});
TS.omni.commands.push({
    'opt': 'm',
    'cmd': 'message',
    'desc': 'MsgAt',
    'suggest': 'suggestMessage'
});
TS.omni.commands.push({
    'opt': 'n',
    'cmd': 'notify',
    'desc': 'NotifyIn',
    'suggest': 'suggestMessage'
});
TS.omni.commands.push({
    'opt': 's',
    'cmd': 'script',
    'desc': 'Add Script',
    'suggest': 'suggestMessage'
});
TS.omni.commands.push({
    'opt': 'u',
    'cmd': 'usebook',
    'desc': 'Use Book',
    'suggest': 'suggestBookmarks'
});
// Add command for: History Fuzzy Search
TS.omni.commands.push({
    'opt': 'h',
    'cmd': 'history',
    'desc': 'Search History',
    'suggest': 'suggestHistory'
});
// Add command for: Bookmark Fuzzy Search
TS.omni.commands.push({
    'opt': 'b',
    'cmd': 'bookmarkOpen',
    'desc': 'Open Bookmark',
    'suggest': 'suggestChromeBookmarks'
});
// Add command to set id for server.
TS.omni.commands.push({
    'opt': 'c',
    'cmd': 'clientId',
    'desc': 'Set Client Id',
    'suggest': 'suggestMessage'
});
// Add command to extract all tabs with matching urls
// into new window.
TS.omni.commands.push({
    'opt': 'e',
    'cmd': 'extract',
    'desc': 'Extract Tabs',
    'suggest': 'suggestExtraction'
});
// Add command to extract all tabs with matching urls
// into new window, keeping original tabs open.
TS.omni.commands.push({
    'opt': 'E',
    'cmd': 'extractClones',
    'desc': 'Clone Tabs',
    'suggest': 'suggestExtraction'
});
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

    chrome.omnibox.setDefaultSuggestion({
        description: description
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
 * Get bookmarks matching bookmarkName.
 * @param {string} bookmarkName The queried name.
 * @return {object} bookmarks List of bookmarks matching query.
 */
TS.omni._getMatchingBookmarks = function(bookmarkName) {
    // UNUSED -- refactor
    var bookmarks = TS.db.getBookmarksByFuzzyName(bookmarkName);
    return bookmarks;
};


/**
 * Setup TS.omni.history with list of sites visited from user history.
 */
TS.omni.setupHistory = function() {
    chrome.history.search({
        'text': '', 'maxResults': 1000},
        function(history) {TS.omni.history = history;});
};

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
    TS.omni.setupHistory();
    TS.omni.setupBookmarks();
    setInterval(
        function() {
            TS.omni.setupHistory();
            TS.omni.setupBookmarks();
        }, 5 * 60 * 1000);
});

/**
 * Parse text into command and params.
 * @param {string} text The text to parse.
 * @return {object} Command The command item.
 */
TS.omni._getCmd = function(text) {
    var terms = text.split(' '); // ['o', 'listit']
    var cmdInput = terms[0];
    var params = terms.splice(1);
    var command;
    for (var i = 0, N = TS.omni.commands.length; i < N; i++) {
        var cmdInfo = TS.omni.commands[i];
        //if (text !== '' && cmdInfo.cmd.indexOf(cmdInput) === 0) {
        // Only allow matching Command Opt.
        if (text !== '' && cmdInput.search(cmdInfo.opt) === 0) {
            // The command we're looking for - (first matched cmd)!
            command = cmdInfo;
            command.params = params;
            break;
        }
    }
    if (!command && cmdInput.length > 1) {
        // No recognized command, query all item command.
        command = {
            opt: ' ',
            cmd: ' ',
            desc: 'Suggest All',
            suggest: 'suggestAllItems',
            params: terms
        };
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
    } else if (cmd.suggest in TS.suggest) {
        suggestions = TS.suggest[cmd.suggest](cmd.params);
        suggest(suggestions);
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
        'e': TS.omni.cmdExtractUrl,
        'E': TS.omni.cmdExtractUrlClones,
        ' ': TS.omni.queryAllItems
    };
    optToCmd[cmd.opt](cmd);
};

chrome.omnibox.onInputEntered.addListener(TS.omni.inputEntered);

/**
 * Add name to active tab.
 * @param {object} cmd The command object with user's input.
 */
TS.omni.cmdAddTab = function(cmd) {
    var firstParam = cmd.params[0];
    TS.tabs.getSelected(function(tab) {
        TS.controller.addTab({
            'name': firstParam,
            'url': tab.url,
            'title': tab.title,
            'favicon': tab.favIconUrl,
            'pinned': tab.pinned
        });
        TS.controller.saveActivityLog({
            action: 'addTab',
            info: {
                name: firstParam
            }
        });
    });
};

/**
 * Open tab by name (or by url if selected from suggestions).
 * @param {object} cmd The command object with user's input.
 */
TS.omni.cmdOpenTab = function(cmd) {
   // log this cmd's source?
   var msg = {'cmd': cmd};
   TS.vent.trigger('cmd:omni:openTab:perform', msg);
/*
    var firstParam = cmd.params[0];
    var nameOrUrl = (cmd.params.length !== 0) ? firstParam : '';
    var xmlParsedName = TS.util.decodeXml(nameOrUrl);
    if (nameOrUrl === TS.omni.NO_MATCH_MESSAGE) {
        // User entered the no match message, do nothing.
        // Pass on opening tab.
        return;
    } else if (TS.util.isUrl(xmlParsedName)) c{
        // User selected from dropdown.
        // Fragile, depends on open suggest text.
        TS.controller.openTab({url: xmlParsedName});
    } else {
        TS.controller.openTabByFuzzyName(nameOrUrl);
    }
*/
};

/**
 * Delete tab by name (or by url if selected from suggestions).
 * @param {object} cmd The command object with user's input.
 */
TS.omni.cmdDeleteTab = function(cmd) {
    var firstParam = cmd.params[0];
    var nameOrUrl = (cmd.params.length !== 0) ? firstParam : '';
    var xmlParsedName = TS.util.decodeXml(nameOrUrl);
    debug('cmdDeleteTab: xmlParsedName', xmlParsedName,
            ', nameOrUrl:', nameOrUrl);
    if (nameOrUrl === TS.omni.NO_MATCH_MESSAGE) {
        // User entered the no match message, do nothing.
        // Pass on opening tab.
        return;
    } else if (TS.util.isUrl(xmlParsedName)) {
        // User selected from dropdown.
        // Fragile, depends on open suggest text.
        TS.model.removeTabByURL(xmlParsedName);
    } else {
        TS.controller.deleteTabByFuzzyName(nameOrUrl);
    }
};

/**
 * Act on reload command from user.
 * @param {object} cmd The command object augmented with user's input.
 */
TS.omni.cmdReload = function(cmd) {
    var firstParam = cmd.params[0];
    var reloadTime = parseInt(firstParam, 10);
    if (reloadTime > 0) {
        TS.tabs.getSelected(function(tab) {
            var tabId = tab.id;
            TS.controller.saveActivityLog({
                action: 'rTab',
                info: {
                    delay: reloadTime * 1000
                }
            });
            TS.omni.tabId = setInterval(function() {
                chrome.tabs.get(tab.id, function(recentTab) {
                    // recentTab is undefined
                    // if reloaded tab is closed
                    if (!TS.util.isDef(recentTab)) {
                        clearInterval(TS.omni.tabId);
                        return;
                    }
                    chrome.tabs.update(tab.id, {
                        // tab.url = reload original tab
                        // recentTab.url = reload new tab.
                        url: tab.url
                    });
                });
            }, reloadTime * 1000);
        });
    }
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
 * Set notification for a military time.
 * @param {object} cmd The command object augmented with user's input.
 */
TS.omni.cmdMessageAt = function(cmd) {
    var time = cmd.params[0];
    var msg = cmd.params.splice(1).join(' ');

    var hourMin = time.split(':');
    var targetHour = parseInt(hourMin[0], 10);
    var targetMin = parseInt(hourMin[1], 10);

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
    var msecToMsg = (minToMsg * 60 * 1000) - (currSec * 1000 + currMSec);

    TS.tabs.getSelected(function(tab) {
        var notification = TS.omni.createNotification(
            time + ' hours says:',
            {'msg': msg, 'url': tab.url, 'title': tab.title}
        );
        setTimeout(function() {
            notification.show();
        }, msecToMsg);
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

/**
 * Set Notification for n minutes in the future! ms accuracy!
 * @param {object} cmd The command object augmented with user's input.
 */
TS.omni.cmdMessageIn = function(cmd) {
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

/**
 * Reload all/matching tabs in current window.
 * If first param provided, only reload tabs with urls matching param.
 * @param {object} cmd The user's command.
 */
TS.omni.reloadWindow = function(cmd) {
    var text = cmd.params;
    var urlMatch;
    var query = '';
    if (text.length === 0) {
        query = text[0];
        urlMatch = new RegExp(query, 'i');
    }
    // Get all tabs in current window, reload tabs as directed.
    chrome.windows.getCurrent(function(gWin) {
        chrome.tabs.getAllInWindow(gWin.id, function(gTabs) {
            var matches = [];
            for (var i = 0; i < gTabs.length; i++) {
                var gTab = gTabs[i];
                // If match url param exists and we match tab's url,
                // or param doesn't exist: reload all tabs.
                if ((urlMatch && urlMatch.test(gTab.url)) ||
                        !urlMatch) {
                    chrome.tabs.update(gTab.id, {
                        url: gTab.url
                    });
                    matches.push({
                        url: gTab.url,
                        title: gTab.title
                    });
                }
            }
            TS.controller.saveActivityLog({
                action: 'rWin',
                info: {
                    query: query,
                    matches: matches
                }
            });
        });
    });
};

/**
 * Save bookmarklet by name.
 * @param {object} cmd The user's command.
 */
TS.omni.addBookmarklet = function(cmd) {
    var text = cmd.params;
    var bookName = text[0];
    var bookScript = cmd.params.splice(1).join(' ');
    var bookmarklet = {
        name: bookName,
        script: bookScript
    };
    TS.dbBook.addNamedBook(bookmarklet);

    TS.controller.saveActivityLog({
        action: 'addBook',
        info: {
            name: bookName,
            script: bookScript
        }
    });
};

/**
 * Execute named bookmarklet in current tab.
 * @param {object} cmd The user's command.
 */
TS.omni.useNamedBook = function(cmd) {
    var bookName = cmd.params[0];
    var bookmarklet = TS.dbBook.getBooksByFuzzyName(bookName);
    if (bookmarklet) {
        bookmarklet = bookmarklet[0];
        chrome.tabs.executeScript(
            // null -> Execute in current tab.
            null, { code: bookmarklet.script }
        );
    }
    TS.controller.saveActivityLog({
        action: 'useBook',
        info: {
            query: bookName,
            name: bookmarklet.name
        }
    });
};

/**
 * Open url from History.
 * @param {object} cmd The user's command info.
 */
TS.omni.openHistory = function(cmd) {
    var url = cmd.params[0];
    url = TS.util.decodeXml(url);
    if (TS.util.isUrl(url)) {
        TS.controller.openTab({url: url});
        TS.controller.saveActivityLog({
            action: 'openHistory',
            info: {
               openUrl: url
            }
        });
    } else {
        debug('Open History - Not a Url');
    }
};

/**
 * Open Chrome Bookmark
 * @param {object} cmd The user's command info.
 */
TS.omni.openBookmark = function(cmd) {
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

/**
 * Set client id for server.
 * @param {object} cmd The user's command.
 */
TS.omni.setClientId = function(cmd) {
    var newId = cmd.params[0];
    TS.io.setClientId(newId);
};

/**
 * Extract all tabs matching url fragment into new window.
 * @param {object} cmd The user's command.
 */
TS.omni.cmdExtractUrl = function(cmd) {
    var urlFragment = cmd.params[0];
    TS.controller.extractTabsByUrl(urlFragment);
};

/**
 * Clones all tabs matching url fragment into new window,
 * @param {object} cmd The user's command.
 */
TS.omni.cmdExtractUrlClones = function(cmd) {
    var urlFragment = cmd.params[0];
    TS.controller.extractTabsByUrl(urlFragment, false);
};

/**
 * Query (saved tabs, bookmarks, history) for matches.
 * @param {object} cmd The user's params.
 */
TS.omni.queryAllItems = function(cmd) {
    debug(cmd);
};
