/**
 * User Activity Logging Database.
 * Stored in localStorage as JSON array of dict log info items.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */

/**
 * Project Namespace.
 */
var TS = TS || {};

/**
 * Activity Log Database Namespace.
 */
TS.dbLogs = TS.dbLogs || {};

/**
 * Name of activity log database in local storage.
 */
TS.dbLogs.DB_NAME = 'actlogs';

/**
 * Returns all parsed activity logs.
 * @return {array} logs The stored activity log items.
 */
TS.dbLogs.getAllLogs = function() {
    var logs = localStorage.getItem(TS.dbLogs.DB_NAME);
    return TS.util.isDef(logs) ? logs : [];
};

/**
 * Save array of activity logs.
 * @param {array} logs The activity logs to save in database.
 */
TS.dbLogs.saveAllLogs = function(logs) {
    if (TS.util.isDef(logs)) {
        localStorage.setItem(
            TS.dbLogs.DB_NAME,
            JSON.stringify(logs));
    }
};

/**
 * Better escape that nuclear blast on a rabbit-panther-thingy!
 */
TS.dbLogs.nukeAllLogs = function() {
    TS.dbLogs.saveAllLogs([]);
};

/**
 * Add activity log to database.
 * @param {object} log The activity log to add.
 */
TS.dbLogs.addLog = function(log) {
    var logs = TS.dbLogs.getAllLogs();
    logs.push(log);
    TS.dbLogs.saveAllLogs(logs);
};

