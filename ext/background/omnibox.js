/**
 * Chrome API Setup.
 *
 * Author: Wolfe Styke - <wstyke@gmail.com>
 */

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
    'desc': 'Add Name To Tab',
    'suggest': 'suggestAdd'
    });
TS.omni.commands.push({
    'opt': 'o',
    'cmd': 'open',
    'desc': 'Open Named Tab',
    'suggest': 'suggestOpen'
});

/*TS.omni.commands.push({
    'opt': 's',
    'cmd': 'superpowermultiply',
    'desc': 'Rabbit-Panther-Thingy!',
    'suggest': 'suggestRockets'
});*/

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
 * Bold matching text using omnibox <match>.
 * @param {string} txt The matching text to bold.
 * @return {string} The 'bolded' text.
 */
TS.omni._matchText = function(txt) {
    return '<match>' + txt + '</match>';
};

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
    debug('inputStarted');
    TS.omni.updateDefaultSuggestion('');
};
chrome.omnibox.onInputStarted.addListener(TS.omni.inputStarted);

/**
 * Return suggestions for Add command.
 * @param {string} params for add new named tab.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.omni.suggestAdd = function(params) {
    debug('suggestAdd params:', params);
    var suggestions = [];
    var name = params[0] !== undefined ? params[0] : '';
    suggestions.push({
        content: 'add ' + params.join(' '),
        description: 'Add named tab: ' + name
    });
    return suggestions;
};

/**
 * Return suggestions for Open command.
 * @param {string} params for open named tab.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.omni.suggestOpen = function(params) {
    debug('suggestOpen params:', params);
    var suggestions = [];
    var allSuggestions = [];
    var requestedTabName = params[0];
    var tabs = TS.controller.getTabsByFuzzyName(requestedTabName);
    var numTabs = tabs.length;
    for (var i = 0; i < numTabs; i++) {
        var tabInfo = tabs[i];
        suggestions.push({
            content: 'open ' + tabInfo.url,
            description: 'open ' + tabInfo.name + ' -> ' + tabInfo.url
        });
    }
    // If we have open tab suggestions, hide default suggestion.
    debug('The suggestions for suggestOpen: ', suggestions);
    if (suggestions.length > 0) {
        chrome.omnibox.setDefaultSuggestion({
           'description': 'open ' + tabs[0].name + ' -> ' + tabs[0].url
        });
        // Remove first suggestion, since we're showing it as default suggestion.
        suggestions = suggestions.splice(1);
    } else {
        chrome.omnibox.setDefaultSuggestion({
            'description': TS.omni.NO_MATCH_MSG
        });
    }
    return suggestions;
};

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
        if (text !== '' && cmdInfo.cmd.indexOf(cmdInput) === 0) {
            // The command we're looking for!
            command = cmdInfo;
            command.params = params;
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
    if (cmd === undefined) {
        TS.omni.updateDefaultSuggestion(text);
        return;
    }
    if (cmd.suggest in TS.omni) {
        suggestions = TS.omni[cmd.suggest](cmd.params);
    }
    suggest(suggestions);
};
chrome.omnibox.onInputChanged.addListener(TS.omni.inputChanged);

/**
 * Process user's input if it is a command.
 * @param {string} text The text entered in Omnibox.
 * @this TS.omni
 */
TS.omni.inputEntered = function(text) {
    var cmd = TS.omni._getCmd(text);
    switch (cmd.opt) {
        case 'a':
            debug('Lets Add This Wabbit!', cmd);
            TS.controller.fetchSelectedTab(function(tab) {
                TS.controller.addTab({
                    'name': cmd.params[0],
                    'url': tab.url
                });
            });
            break;
        case 'o':
            debug('Open This Panther!', cmd);
            var nameOrUrl = cmd.params[0];
            if (nameOrUrl === TS.omni.NO_MATCH_MESSAGE) {
                // User entered the no match message.
                // Pass on opening tab.
            } else if (TS.util.isUrl(nameOrUrl)) {
                // User selected from dropdown.
                // Fragile, depends on open suggest text.
                debug(nameOrUrl);
                TS.controller.openTab({url: nameOrUrl});
            } else {
                TS.controller.openTabByFuzzyName(cmd.params[0]);
            }
            break;
    }
};

chrome.omnibox.onInputEntered.addListener(TS.omni.inputEntered);

