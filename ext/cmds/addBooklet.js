/**
 * Methods for `Add Booklet` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

TS.omni.registerCommand(
   's', 'script', 'Add Script', 'addBooklet'
);

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initAddBooklet();
});

/**
 * Add cmd listeners.
 */
TS.cmds.initAddBooklet = function() {
    TS.vent.on('cmd:omni:addBooklet:suggest', TS.cmds.suggestAddBooklet);
    TS.vent.on('cmd:omni:addBooklet:perform', TS.cmds.addBooklet);
};

/**
 * Return suggestions for AddBooklet command.
 * @param {string} msg Broadcast message.
 *  params: User's input.
 *  showSuggestions: Callback with suggestions.
 */
TS.cmds.suggestAddBooklet = function(msg) {
    var params = msg.params;
    var suggestions = [];
    msg.showSuggestions(suggestions);
};

/**
 * Save bookmarklet by name.
 * @param {object} msg The broadcast message.
 *   cmd: The user's command.
 */
TS.cmds.addBooklet = function(msg) {
    var cmd = msg.cmd;
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
