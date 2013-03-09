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
 * Create input textarea floating at top of screen.
 */
CL.createInput = function() {
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
  /*
  document.body.appendChild(box);
  setTimeout(function() {
    document.getElementById('cmdLine').focus();
  }, 10);

  $('#cmdLine').live('keyup', function(e) {
    // KeyUp gives you 'after char entered' text.
    var text = e.target.value;
    chrome.extension.sendMessage({
        action: 'cmdLine.inputChanged',
        text: text
    });
  });

  */
};

/**
 * Initialize command line code.
 *
 */
CL.init = function() {
    CL.createInput();
    CL.checkMark();
};

/**
 * Check if this tab was opened via mark,
 * and whether it needs to have any special effects.
 */
CL.checkMark = function() {
    chrome.extension.sendMessage({
        action: 'cmdLine.checkMark'
    }, function(data) {
        //debug('checkMark cb:', data);
        if (!TS.util.isDef(data)) {
            return;
        }
        if (data.url !== window.location.href) {
            return; // Request is for another url.
        }
        if ('scrollX' in data && 'scrollY' in data) {
            window.scrollTo(data.scrollX, data.scrollY);
        }
    });
};

/**
 * Map from key to keyCode.
 */
CL.keyCodes = {
    ESC: 27,
    APOSTROPHE: 39,
    m: 109,
    M: 77
};

$(document).live('keyup', function(e) {
    // Reset previous keys if user hits ESC.
    if (e.keyCode === CL.keyCodes.ESC) {
        CL.clearKeys();
    }
});

$(document).live('keypress', function(e) {
    var invalidTags = {
        'INPUT': false,
        'TEXTAREA': false
    };
    if (e.target.tagName in invalidTags) {
        return;
    }
    CL.registerKeys(e);
    CL.checkKeysForCommand();
});

/**
 * ' = 39
 * m = 109
 */
CL.checkKeysForCommand = function() {
    var keys = CL.previousKeys_;
    dd = keys;

    // Try mark using:  m<mark-letter>
    if (keys.length === 2 && keys[0].charCode === CL.keyCodes.m) {
        var markCode = keys[1].charCode;
        //debug('Save Mark Code:', markCode);
        chrome.extension.sendMessage({
            action: 'cmdLine.saveMark',
            code: markCode
        });
        CL.clearKeys();
    }
    // Try markPos using:  M<mark-letter>
    if (keys.length === 2 && keys[0].charCode === CL.keyCodes.M) {
        var markCode = keys[1].charCode;
        //debug('Save Mark Code:', markCode);
        chrome.extension.sendMessage({
            action: 'cmdLine.savePosMark',
            code: markCode,
            scrollX: window.scrollX,
            scrollY: window.scrollY
        });
        CL.clearKeys();
    }
    // Try goto using: '<mark-letter>
    if (keys.length === 2 && keys[0].charCode === CL.keyCodes.APOSTROPHE) {
        var markCode = keys[1].charCode;
        //debug('Goto Mark Code:', markCode);

        chrome.extension.sendMessage({
            action: 'cmdLine.gotoMark',
            code: markCode
        });
        CL.clearKeys();
        setTimeout(CL.checkMark, 10);
    }
};

chrome.extension.onRequest.addListener(function(data) {
    //debug('data from onRequest:', data);
    if (!TS.util.isDef(data)) {
        return;
    }
    console.log('chrome.extension.onRequest.addListener(data:', data);
    if ('scrollX' in data && 'scrollY' in data) {
        window.scrollTo(data.scrollX, data.scrollY);
    }
});

/** @private Private list of previously pressed keys. */
CL.previousKeys_ = [];
/** @private Timeout id for unregistering keystrokes. */
CL.unregisterTimer_ = null;
/** @private Timeout time till unregistration occurs. */
CL.unregisterTime_ = 2 * 1000;

/**
 * Register sequences of key presses, looking for matching cmd patterns.
 * @param {Object} keyEvent The key press event, from jQuery.
 */
CL.registerKeys = function(keyEvent) {
    //debug('keyPress:', keyEvent),
    CL.previousKeys_.push(keyEvent);
    //debug(CL.previousKeys_);
    CL.resetUnregisterKeys();
};

/** Set Timeout to unregister recorded keystrokes. */
CL.resetUnregisterKeys = function() {
    clearTimeout(CL.unregisterTimer_);
    CL.unregisterTimer_ = setTimeout(function() {
        CL.clearKeys();
    }, CL.unregisterTime_);
};

/** Clear keys after command performed */
CL.clearKeys = function() {
    CL.previousKeys_ = [];
};

$(document).ready(function() {
  CL.init();
});
