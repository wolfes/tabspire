/**
 * Observe Chrome Windows Events.
 *
 * Observing last N focused windows works like:
 *  On selection change,
 *   push newly selected window into register,
 *   push previously selected window from register
 *   into list of previously focused windows,
 *   trim the list to be the right size.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */

/** Tabspire Namespace */
var TS = TS || {};

/** Module Namespace */
TS.obsWin = TS.obsWin || {};


/** @const Number N of previously focused windowIds to remember.*/
TS.obsWin.prevWinsMax = 10;

/** Buffer of previous N focused window ids. */
TS.obsWin.prevFocusedWins = [];

/** The currently focused windowId. */
TS.obsWin.currentlyFocusedWin;

/**
 * Helper Method for managing current/previous window update.
 * @param {number} activeWinId Currently active window's id.
 * @private
 */
TS.obsWin.updateWindowFocusChange_ = function(activeWinId) {
    if (activeWinId === undefined || activeWinId === -1) {
        // Active Win Id is -1 when Chrome loses focus.
        return;
    }
    if (TS.obsWin.currentlyFocusedWin !== undefined) {
        TS.obsWin.prevFocusedWins = ([
            TS.obsWin.currentlyFocusedWin
        ].concat(TS.obsWin.prevFocusedWins)).slice(0, TS.obsWin.prevWinsMax);
    }
    TS.obsWin.currentlyFocusedWin = activeWinId;
};

/**
 * Observes Chrome Window selection changes.
 * @param {number} windowId The selected windowId.
 */
TS.obsWin.selectionChange = function(windowId) {
    TS.obsWin.updateWindowFocusChange_(windowId);
};
chrome.windows.onFocusChanged.addListener(TS.obsWin.selectionChange);

/**
 * Focus previously focused window.
 */
TS.obsWin.focusLastWindow = function() {
    var lastActiveWindowId = TS.obsWin.prevFocusedWins.shift();
    if (lastActiveWindowId === undefined) {
        return;
    }
    chrome.windows.update(lastActiveWindowId, {
        focused: true
    });
};
