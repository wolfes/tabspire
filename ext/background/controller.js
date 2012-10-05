/**
 * @filedesc Controller for connecting views/server to background model.
 *
 * @author Wolfe Styke <wstyke@gmail.com>
 */

var TS = TS || {};
TS.controller = TS.controller || {};


TS.controller.addTab = function(tabInfo) {
  TS.model.addNamedTab(tabInfo);
};

