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
TS.omni.commands.push({
    'opt': 'r',
    'cmd': 'reload',
    'desc': 'Reload Tab Every',
    'suggest': 'suggestReload'
});
TS.omni.commands.push({
    'opt': 'm',
    'cmd': 'message',
    'desc': 'Message At:',
    'suggest': 'suggestMessage'
});
TS.omni.commands.push({
    'opt': 'n',
    'cmd': 'notify',
    'desc': 'Notify In:',
    'suggest': 'suggestMessage'
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
    TS.omni.updateDefaultSuggestion(' ');
};
chrome.omnibox.onInputStarted.addListener(TS.omni.inputStarted);

/**
 * Return suggestions for Add command.
 * @param {string} params for add new named tab.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.omni.suggestAdd = function(params) {
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
    var suggestions = [];
    var requestedTabName = params[0];
    var tabs = TS.controller.getTabsByFuzzyName(requestedTabName);
    var numTabs = tabs.length;
    // If no tabs found, notify user.
    if (numTabs === 0) {
        chrome.omnibox.setDefaultSuggestion({
            'description': TS.omni.NO_MATCH_MSG
        });
        return suggestions;
    }
    // List found tabs, with first tab shown as default suggestion.
    for (var i = 0; i < numTabs; i++) {
        var tabInfo = tabs[i];
        var suggestion = {
            content: 'open ' + tabInfo.url,
            description: ('open ' + tabInfo.name + ' -> ' +
                TS.util.encodeXml(tabInfo.url))
        };
        if (i === 0) {
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
 * Return suggestions for Reload command.
 * @param {string} params User's input for reload.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.omni.suggestReload = function(params) {
    var suggestions = [];

    return suggestions;
};

/**
 * Return suggestions for MessageAt command.
 * @param {string} params User's input for message.
 * @return {array} suggestions For Chrome's Omnibox.
 */
TS.omni.suggestMessage = function(params) {
    var suggestions = [];
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
    var firstParam = cmd.params[0];
    switch (cmd.opt) {
        case 'a':
            // Add Named Tab Command.
            debug('Lets Add This Wabbit!', cmd);
            TS.controller.fetchSelectedTab(function(tab) {
                TS.controller.addTab({
                    'name': firstParam,
                    'url': tab.url
                });
            });
            break;
        case 'o':
            // Open Tab Command.
            var nameOrUrl = (cmd.params.length !== 0) ? firstParam : '';
            debug('Open This Panther: ', nameOrUrl, cmd);
            if (nameOrUrl === TS.omni.NO_MATCH_MESSAGE) {
                // User entered the no match message.
                // Pass on opening tab.
            } else if (TS.util.isUrl(TS.util.decodeXml(nameOrUrl))) {
                // User selected from dropdown.
                // Fragile, depends on open suggest text.
                TS.controller.openTab({url: TS.util.decodeXml(nameOrUrl)});
            } else {
                TS.controller.openTabByFuzzyName(nameOrUrl);
            }
            break;
        case 'r':
            // Reload Tab Every Command.
            TS.omni.cmdReload(cmd);
            break;
        case 'm':
            // MessageAt Command.
            TS.omni.cmdMessageAt(cmd);
            break;
        case 'n':
            TS.omni.cmdMessageIn(cmd);
            break;
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
         TS.controller.fetchSelectedTab(function(tab) {
             var tabId = tab.id;
             TS.omni.tabId = setInterval(function() {
                 chrome.tabs.get(tab.id, function(recentTab) {
                     // recentTab is undefined
                     // if reloaded tab is closed
                     if (recentTab === undefined) {
                         clearInterval(TS.omni.tabId);
                         debug('Reloading tab: ');
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

    var minutesToMsg = 0;
    if (isTomorrow) {
        // Message for tomorrow.
        debug('Un-implemented: msg for tomorrow');
    } else {
        // Message for later today.
        minutesToMsg += (targetHour - currHour) * 60;
        minutesToMsg += (targetMin - currMin);
    }
    var msecToMsg = (minutesToMsg * 60 * 1000) - (currSec * 1000 + currMSec);
    setTimeout(function() {
        var notification = webkitNotifications.createNotification(
            '',
            'Tabspire Message!',
            msg
        );
        notification.show();
        debug(msg);
    }, msecToMsg);
};

/**
 * Set Notification for n minutes in the future! ms accuracy!
 * @param {object} cmd The command object augmented with user's input.
 */
TS.omni.cmdMessageIn = function(cmd) {
    var time = cmd.params[0];
    var msg = cmd.params.splice(1).join(' ');

    debug(time);
    debug(msg);

    var date = new Date();
    var currMSec = date.getSeconds() * 1000 + date.getMilliseconds();
    var msecToMsg = parseInt(time, 10) * 60 * 1000;
    var msecToMsg = msecToMsg - currMSec;
    debug(currMSec, msecToMsg);
    setTimeout(function() {
        var notification = webkitNotifications.createNotification(
            '',
            'Tabspire Message!',
            msg
        );
        notification.show();
        debug(msg);
    }, msecToMsg);
};

chrome.omnibox.onInputEntered.addListener(TS.omni.inputEntered);

