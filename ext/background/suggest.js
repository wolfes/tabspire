/**
 * Create Omnibox Suggestions for each type of command.
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
 * Show message, or default message of no-match.
 * @param {string=} opt_message Optional message to show.
 */
TS.suggest.showDefaultSuggestion = function(opt_message) {
    chrome.omnibox.setDefaultSuggestion({
        'description': opt_message || TS.suggest.NO_MATCH_MSG
    });
};

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
        TS.suggest.showDefaultSuggestion();
        return suggestions;
    }
    // Create suggestions, with first item as default suggestion.
    for (var i = 0; i < numItems; i++) {
        var suggestion = itemToSuggest(items[i]);
        if (i === 0 && !noDefault) {
            chrome.omnibox.setDefaultSuggestion({
                'description': suggestion.description
           });
        } else {
            suggestions.push(suggestion);
        }
    }
    return suggestions;
};


/**
 * Suggest all matches (saved tabs, bookmarks, history).
 * @param {object} params The user's text params.
 * @return {object} suggestions For the omnibox.
 */
TS.suggest.suggestAllItems = function(params) {
    var suggestions = [];
    var savedTabSuggestions = TS.cmds.suggestOpenTab(params);
    debug('saved tab:', savedTabSuggestions);
    var bookmarkSuggestions = TS.cmds.suggestOpenBookmarks(params);
    debug('bookmark:', bookmarkSuggestions);
    var historySuggestions = TS.cmds.suggestOpenHistory(params);
    debug('history:', historySuggestions);

    suggestions = suggestions.concat(savedTabSuggestions);
    suggestions = suggestions.concat(bookmarkSuggestions);
    suggestions = suggestions.concat(historySuggestions);

    return suggestions;
};

