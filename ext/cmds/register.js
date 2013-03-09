/**
 * Methods for registering command information.
 * Defines command info, suggestion generator, and actual command.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */


/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.cmds = TS.cmds || {};

/** Localstorage Key for commands info */
TS.cmds.dbName = 'cmds';

/**
 * Register a command via a cmdInfo object.
 * @param {Object} cmdInfo Contains command information.
 *  {string} opt The short name of the command to match on user input.
 *  {string} cmd The long name of the command to match on user input.
 *  {string} desc A short description of the command.
 *  {string} suggest Deprecated, used by old suggestion schema.
 *  {string} cmdName The name of the command to publish.
 * @return {boolean} Success of command registration.
 */
TS.cmds.register = function(cmdInfo) {
    // Store command in local storage.
    var cmdsInfo = TS.cmds.getStoredCmds();
    if (cmdInfo.cmdName in cmdsInfo) {
        debug('This command already registered.');
        return false;
    }
    cmdsInfo[cmdInfo.cmdName] = cmdInfo;
    TS.cmds.setStoredCmds(cmdsInfo);
    TS.omni.cmds.push(cmdInfo);
    return true;
};

/**
 * Get stored list of commands from localstorage.
 * @return {Object} A map of cmdName to cmdInfo.
 */
TS.cmds.getStoredCmds = function() {
    return JSON.parse(localStorage.getItem(TS.cmds.dbName));
};

/**
 * Store commands in localStorage.
 * @param {Object} cmdsInfo Map of cmdName to cmdInfo.
 */
TS.cmds.setStoredCmds = function(cmdsInfo) {
    localStorage.setItem(TS.cmds.dbName, JSON.stringify(cmdsInfo));
};
