/**
 * Methods for `Extract Tabs` command.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

// Add command to extract all tabs with matching urls
// into new window.
TS.omni.registerCommand(
  'e', 'extract', 'Extract Tabs', 'extractTabs'
);
// Add command to extract all tabs with matching urls
// into new window, keeping original tabs open.
TS.omni.registerCommand(
  'E', 'extractClones', 'Clone Tabs', 'cloneTabs'
);

/**
 * Initialize command listeners.
 */
$(document).ready(function() {
    TS.cmds.initExtractTabs();
});

/**
 * Add cmd listeners.
 */
TS.cmds.initExtractTabs = function() {
    // Extract & Remove
    TS.vent.on('cmd:omni:extractTabs:suggest', TS.cmds.suggestExtractTabs);
    TS.vent.on('cmd:omni:extractTabs:perform', TS.cmds.extractTabs);
    // Extract & Clone
    TS.vent.on('cmd:omni:cloneTabs:suggest', TS.cmds.suggestCloneTabs);
    TS.vent.on('cmd:omni:cloneTabs:perform', TS.cmds.extractTabClones);
};

/**
 * Return suggestions for ExtractTabs command.
 * @param {string} msg Has 'params', 'showSuggestions'.
 */
TS.cmds.suggestExtractTabs = function(msg) {
    var params = msg.params;
    var suggestions = [];
    if (params[0] === undefined || params[0].trim() === '') {
        TS.suggest.showDefaultSuggestion(
            'Extract Tabs: url-fragment');
        return;
    }
    msg.showSuggestions(suggestions);
};

/**
 * Return suggestions for CloneTabs command.
 * @param {string} msg Has 'params', 'showSuggestions'.
 */
TS.cmds.suggestCloneTabs = function(msg) {
    var params = msg.params;
    var suggestions = [];
    if (params[0] === undefined || params[0].trim() === '') {
        TS.suggest.showDefaultSuggestion(
            'Clone Tabs: url-fragment');
        return;
    }
    msg.showSuggestions(suggestions);
};

/**
 * Extract all tabs matching url fragment into new window.
 * @param {Object} msg The broadcast message.
 *  {Object} cmd The user's command.
 */
TS.cmds.extractTabs = function(msg) {
    var cmd = msg.cmd;
    var urlFragment = cmd.params[0];
    TS.controller.extractTabsByUrl(urlFragment);
};

/**
 * Clones all tabs matching url fragment into new window,
 * @param {Object} msg The broadcast message.
 *  {Object} cmd The user's command.
 */
TS.cmds.extractTabClones = function(msg) {
    var urlFragment = cmd.params[0];
    TS.controller.extractTabsByUrl(urlFragment, false);
};
