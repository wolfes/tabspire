/**
 * Create Suggestions for each type of command.
 *
 * Used by:
 *  TS.omni: Get suggestions to show in Chrome's omnibox.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */

/** Tabspire Namespace */
var TS = TS || {};

/** Suggest Namespace */
TS.suggest = TS.suggest || {};

/** Message when no suggestions found. */
TS.suggest.NO_MATCH_MSG = 'No more results?  Try backspace!';

/**
 * Suggest items using content and desc fns.
 * @param {array} items List of items to show.
 * @param {function} itemToSuggest Creates suggestion for item.
 * @param {boolean} opt_noDefault Do not show default suggestion.
 * @return {array} suggestions The suggestions for Chrome's Omnibox.
 */
TS.suggest.suggestItems = function(items, itemToSuggest, opt_noDefault) {
    var suggestions = [];
    var noDefault = opt_noDefault || false;
    var numItems = items.length;
    // If no items, display standard error.
    if (numItems === 0 && !opt_noDefault) {
        chrome.omnibox.setDefaultSuggestion({
            'description': TS.suggest.NO_MATCH_MSG
        });
        return suggestions;
    }
    // Create suggestions, with first item as default suggestion.
    for (var i = 0; i < numItems; i++) {
        var suggestion = itemToSuggest(items[i]);
        if (i === 0 && !noDefault) {
            chrome.omnibox.setDefaultSuggestion({
                description: suggestion.description
           });
        } else {
            suggestions.push(suggestion);
        }
    }
    return suggestions;
};

/**
 * Return suggestions for Add command.
 * @param {string} params for add new named tab.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.suggest.suggestAdd = function(params) {
    var suggestions = [];
    var name = params[0] !== undefined ? params[0] : '';
    chrome.omnibox.setDefaultSuggestion({
        'description': 'Add named tab: ' + name
    });
    var tabs = TS.controller.getTabsByFuzzyName(name);
    var suggestions = TS.suggest.suggestItems(
        tabs,
        function(tabInfo) {
            return {
                content: '',
                description: 'Saved Tab: ' + tabInfo.name
            };
        },
        true // Skip Showing Default Suggestions.
    );
    return suggestions;
};

/**
 * Return suggestions for Delete Tab by Name command.
 * @param {string} params for delete named tab.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.suggest.suggestDelete = function(params) {
    var requestedTabName = params[0];
    var tabs = TS.controller.getTabsByFuzzyName(requestedTabName);
    var suggestions = TS.suggest.suggestItems(tabs, function(tabInfo) {
        return {
            content: 'delete ' + tabInfo.url,
            description: ('delete ' + tabInfo.name + ' -> ' +
                TS.util.encodeXml(tabInfo.url))
        };
    });
    return suggestions;
};

/**
 * Return suggestions for Open command.
 * @param {string} params for open named tab.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.suggest.suggestOpen = function(params) {
    var requestedTabName = params[0];
    var tabs = TS.controller.getTabsByFuzzyName(requestedTabName);
    var suggestions = TS.suggest.suggestItems(tabs, function(tabInfo) {
        return {
            content: 'open ' + tabInfo.url,
            description: ('open ' + tabInfo.name + ' -> ' +
                TS.util.encodeXml(tabInfo.url))
        };
    });
    return suggestions;
};

/**
 * Return suggestions for Reload command.
 * @param {string} params User's input for reload.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.suggest.suggestReload = function(params) {
    var suggestions = [];
    return suggestions;
};

/**
 * Return suggestions for MessageAt command.
 * @param {string} params User's input for message.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.suggest.suggestMessage = function(params) {
    var suggestions = [];
    return suggestions;
};

/**
 * Return suggestions for Extract command.
 * @param {string} params User's input for message.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.suggest.suggestExtraction = function(params) {
    var suggestions = [];
    return suggestions;
};

/**
 * Suggest all matches (saved tabs, bookmarks, history).
 * @param {object} params The user's text params.
 * @return {object} suggestions For the omnibox.
 */
TS.suggest.suggestAllItems = function(params) {
    var suggestions = [];
    /*
    var query = params[0];
    var savedTabs = TS.model.getNamedTabs();
    var bookmarkMatches = 1;
    var historyMatches = 1;
    var allItems = [];
    allItems = allItems.concat(savedTabs);
    allItems = allItems.concat(bookmarkMatches);
    allItems = allItems.concat(historyMatches);
    */
    var savedTabSuggestions = TS.suggest.suggestOpen(params);
    debug('saved tab:', savedTabSuggestions);
    var bookmarkSuggestions = TS.suggest.suggestChromeBookmarks(params);
    debug('bookmark:', bookmarkSuggestions);
    var historySuggestions = TS.suggest.suggestHistory(params);
    debug('history:', historySuggestions);

    suggestions = suggestions.concat(savedTabSuggestions);
    suggestions = suggestions.concat(bookmarkSuggestions);
    suggestions = suggestions.concat(historySuggestions);

    return suggestions;
};

/**
 * Return suggestions for history search matches.
 * @param {string} params User's input for search.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.suggest.suggestHistory = function(params) {
    var suggestions = [];
    var query = params[0];
    var queryRegExp = new RegExp(query, 'i');

    var history = TS.omni.history;
    var numHistory = history.length;
    for (var i = 0; i < numHistory; i++) {
        var site = history[i];
        if (queryRegExp.test(site.url) ||
                queryRegExp.test(site.title)) {
            suggestions.push({
                content: 'h ' + TS.util.encodeXml(site.url),
                description: 'Open ' + TS.util.encodeXml(site.title)
            });
        }
    }
    return suggestions;
};

/**
 * Return suggestions for Chrome's bookmark matches.
 * @param {string} params User's input for search.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.suggest.suggestChromeBookmarks = function(params) {
    // TODO(wstyke:11-14-2012): Fully un-tree-ify bookmark tree.
    // There are still children within the bookmark list...
    // Name the children via "parentFolderName/bookmarkName".
    var suggestions = [];
    var query = new RegExp(params[0], 'i');
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
    return suggestions;
};


/**
 * Return suggestions for bookmarks to use.
 * @param {string} params User's input for bookmark.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.suggest.suggestBookmarks = function(params) {
    var suggestions = [];
    var requestedBookName = params[0];
    var books = TS.dbBook.getBooksByFuzzyName(requestedBookName);
    var suggestions = TS.suggest.suggestItems(books, function(bookInfo) {
        return {
            content: 'use ' + bookInfo.name,
            description: 'use ' + bookInfo.name + ' bookmarket'
        };
    });
    return suggestions;
};
