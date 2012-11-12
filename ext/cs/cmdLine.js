/**
 * Command Line Content Script
 * Author: Wolfe Styke - <wstyke@gmail.com>
 */

/**
 * Msg Passing Ideas:
 * Views are trees, above ground.
 * Models are the roots, just below ground.
 * Controllers live in the planet core.
 *
 * Views talk to ___ via ___:
 *   self.model via tight coupling.
 *   other.models via well.
 *   all.controllers via well.
 *
 * Models talk to ___ via ___:
 *  self.views via vent.
 *  other.views via vent.
 *  other.models via NO!!
 *  all.controllers via duct
 *
 * Controllers talk to ___ via ___:
 *  model via
 *
 *  Views tell their models about user events,
 *    demand feedback: n>2 diff demands require same feedback?
 *    wait for feedback: n>2 demands can get same feedback w/o #handlers
 *  Models
 *    reply to their view's requests,
 *    publish updates for all views
 *
 */

/** CmdLine Namespace */
var CL = CL || {};
/** View's Vent, called well because it's from outside to inside. */
var well = well || _.extend({}, Backbone.Events);
/** Model Vent to surface */
var vent = vent || _.extend({}, Backbone.Events);
/** Controller Vent: duct for between underground models */
var duct = duct || _.extend({}, Backbone.Events);


/**
 * Initialize command line code.
 *
 */
CL.init = function() {
  debug('cmdLine-2');

  box = document.createElement('div');
  box.setAttribute('id', 'cmdLineBox');
  box.style.position = 'fixed';
  box.style.top = '0px';
  box.style.left = '0px';
  box.style.right = '0px';
  box.style.bottom = 'auto';
  box.style.height = '30px';
  box.style.padding = '2px 5px';
  box.style.backgroundColor = '#58D';

  input = document.createElement('input');
  input.setAttribute('id', 'cmdLine');
  input.style.width = '400px';
  input.style.fontSize = '16px';
  box.appendChild(input);


  /*document.body.appendChild(box);
  setTimeout(function() {
    document.getElementById('cmdLine').focus();
  }, 25);
  $('#cmdLine').live('keyup', function(e) {
    // KeyUp gives you 'after char entered' text.
    var text = e.target.value;
    chrome.extension.sendMessage({
        action: 'cmdLine.inputChanged',
        text: text
    });
  });*/
};
$(document).ready(function() {
  CL.init();
});
