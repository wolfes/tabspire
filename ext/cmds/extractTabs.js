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
TS.omni.commands.push({
    'opt': 'e',
    'cmd': 'extract',
    'desc': 'Extract Tabs',
    'suggest': 'suggestExtraction',
    'cmdName': 'extractTabs'
});
// Add command to extract all tabs with matching urls
// into new window, keeping original tabs open.
TS.omni.commands.push({
    'opt': 'E',
    'cmd': 'extractClones',
    'desc': 'Clone Tabs',
    'suggest': 'suggestExtraction',
    'cmdName': 'cloneTabs'
});

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
    TS.vent.on('cmd:omni:cloneTabs:suggest', TS.cmds.suggestExtractTabs);
    TS.vent.on('cmd:omni:cloneTabs:perform', TS.cmds.extractTabClones);
};

/**
 * Return suggestions for MessageAt command.
 * @param {string} msg Has 'params', 'showSuggestions'.
 */
TS.cmds.suggestExtractTabs = function(msg) {
    var params = msg.params;
    var suggestions = [];
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
