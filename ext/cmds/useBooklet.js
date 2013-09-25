/**
 * Methods for `Use Booklet` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

TS.omni.registerCommand(
   'u', 'usebook', 'Use Book', 'useBooklet'
);

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initUseBooklet();
});

/**
 * Add cmd listeners.
 */
TS.cmds.initUseBooklet = function() {
    TS.vent.on('cmd:omni:useBooklet:suggest', TS.cmds.suggestUseBooklet);
    TS.vent.on('cmd:omni:useBooklet:perform', TS.cmds.useBooklet);
};


/**
 * Return suggestions for bookmarks to use.
 * @param {string} msg The broadcast msg.
 *  params: User's input for bookmark.
 */
TS.cmds.suggestUseBooklet = function(msg) {
    var params = msg.params;
    var suggestions = [];
    var requestedBookName = params[0];
    var books = TS.dbBook.getBooksByFuzzyName(requestedBookName);
    var suggestions = TS.suggest.suggestItems(books, function(bookInfo) {
        return {
            content: 'use ' + bookInfo.name,
            description: 'use ' + bookInfo.name + ' bookmarket'
        };
    });
    msg.showSuggestions(suggestions);
};

/**
 * Execute named bookmarklet in current tab.
 * @param {object} msg The broadcast message.
 *  cmd: The user's command.
 */
TS.cmds.useBooklet = function(msg) {
    var cmd = msg.cmd;
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

