/**
 * Controller for parsing strings into commands.
 *
 * @author Wolfe Styke <wstyke@gmail.com>
 */
var TS = TS || {};
/**
 * Namespace: parseCmd
 */
TS.cmds = TS.cmds || {};


/**
 * Basic Idea: Each command has:
 * Option: 1 char, for easy typing of command.
 * Cmd: 1 word, for partial/full cmd word recognition.
 * Desc: 1-4 words, shown in Omnibox to help user complete command.
 * Suggest: Function for generating suggestions from remaining params.
 */
TS.cmds.commands.push({
    'opt': 'a',
    'cmd': 'add',
    'desc': 'Add Tab',
    'suggest': 'suggestAdd'
    });
TS.cmds.commands.push({
    'opt': 'o',
    'cmd': 'open',
    'desc': 'Open Tab',
    'suggest': 'suggestOpen'
});
TS.cmds.commands.push({
    'opt': 'r',
    'cmd': 'reload',
    'desc': 'Reload Tab',
    'suggest': 'suggestReload'
});
TS.cmds.commands.push({
    'opt': 'm',
    'cmd': 'message',
    'desc': 'MsgAt',
    'suggest': 'suggestMessage'
});
TS.cmds.commands.push({
    'opt': 'n',
    'cmd': 'notify',
    'desc': 'NotifyIn',
    'suggest': 'suggestMessage'
});
TS.cmds.commands.push({
    'opt': 'rw',
    'cmd': 'rwindow',
    'desc': 'Reload Win',
    'suggest': 'suggestMessage'
});
TS.cmds.commands.push({
    'opt': 'b',
    'cmd': 'bookmarklet',
    'desc': 'Add Bookmarklet',
    'suggest': 'suggestMessage'
});
TS.cmds.commands.push({
    'opt': 'u',
    'cmd': 'usebook',
    'desc': 'Use Book',
    'suggest': 'suggestBookmarks'
});


/**
 * Parse text into command and params.
 * @param {string} text The text to parse.
 * @return {object} Command The command item.
 */
TS.cmds.parseCmd = function(text) {
    var command;
    if (text === '' || typeof(text) !== 'string') {
        return command;
    }
    var terms = text.split(' ');    // ['o', 'listit']
    var cmdInput = terms[0];        // First term is command.
    var params = terms.splice(1);   // Other terms are params.
    var numCommands = TS.cmds.commands.length;
    for (var i = 0; i < numCommands; i++) {
        var cmdInfo = TS.cmds.commands[i];
        if (cmdInfo.opt === cmdInput ||
                cmdInfo.cmd.indexOf(cmdInput) === 0) {
            // We have a command!
            command = cmdInfo;
            command.params = params;
            break;
        }
    }
    return command;
};






