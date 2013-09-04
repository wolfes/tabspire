/**
 * Controllers for window manipulation.
 *
 * @author Wolfe Styke -- <wstyke@gmail.com>
 */

/** Project Namespace */
var TS = TS || {};

/** Module Namespace */
TS.windows = TS.windows || {};


/** Get Windows */



/** Update Windows */

/**
 * Focuses a window by its id.
 * @param {number} windowId The ID of the window to focus.
 */
TS.windows.focusById = function(windowId) {
  chrome.windows.update(windowId, {focused: true});
};
