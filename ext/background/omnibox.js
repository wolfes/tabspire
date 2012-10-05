/**
 * @filedesc Chrome API Setup.
 *
 * Author: Wolfe Styke - <wstyke@gmail.com>
 */

var TS = TS || {};
TS.omni = TS.omni || {};

TS.omni.commands = [{
		'opt': 'a',
		'cmd': 'add',
		'desc': 'Add Name To Tab',
		'fn': 'suggestAdd'
	},{
		'opt': 'o', 
		'cmd': 'open',
		'desc': 'Open Named Tab',
		'fn': 'suggestOpen'
	},{
		'opt': 'z', 
		'cmd': 'z',
		'desc': 'z',
		'fn': 'suggestZ'
	}];

TS.omni.resetDefaultSuggestion = function() {
  TS.omni.updateDefaultSuggestion("");
};
$(document).ready(function() {
  TS.omni.resetDefaultSuggestion();
});


/**
 * Update first suggestion in Chrome Omnibox based on user's text.
 * @param {string} text The user's text in Chrome Omnibox.
 */
TS.omni.updateDefaultSuggestion = function(text) {
  var lb = '<dim>[</dim>';
  var sep = '<dim>|</dim>';
  var rb = '<dim>]</dim>';
  
  function match(txt) {
    return '<match>' + txt + '</match>';
  }
	
	var textCmd = text.split(' ')[0];
  
  var description = lb;
  var numCmds = TS.omni.commands.length;
  for (var i = 0; i < numCmds; i++) {
    var cmd = TS.omni.commands[i];
    var piece = cmd.opt + ': ' + cmd.desc;
    if (text !== '' && cmd.cmd.indexOf(textCmd) === 0) {
      piece = match(piece);
    }
    description += (' ' + piece + ' ');
    if (i !== numCmds - 1) {
      description += sep;
    }
  }
  description += rb;
  
  chrome.omnibox.setDefaultSuggestion({
    description: description
  });
};


/**
 * User started typing a tabspire command in Chrome's Omnibox.
 */
TS.omni.inputStarted = function() {
  TS.omni.updateDefaultSuggestion("");
};
chrome.omnibox.onInputStarted.addListener(TS.omni.inputStarted);

/**
 * Return suggestions for Add command.
 * @param {string} params
 */
TS.omni.suggestAdd = function(params) {
	var suggestions = [];
	var name = params[0] !== undefined ? params[0] : "";
	suggestions.push({
			content: 'add ' + params.join(' '),
			description: 'Add named tab: ' + name
 	});
	return suggestions;
};

/**
 * Return suggestions for Open command.
 * @param {string} params
 */
TS.omni.suggestOpen = function(params) {
	var suggestions = [];
	var tabdict = TS.model.getNamedTabs();
	for (var name in tabdict) {
		var tabInfo = tabdict[name];
		suggestions.push({
			content: 'open ' + tabInfo.url,
 			description: 'Open: ' + tabInfo.name + ' -> ' + tabInfo.url
		});
	}
	return suggestions;
};





/**
 * User changed text in Chrome's omnibox.
 */
TS.omni.inputChanged = function(text, suggest) {	
	TS.omni.updateDefaultSuggestion(text);
  var terms = text.split(' '); // ["o", "listit"]
	var textCmd = terms[0];
	var params = terms.splice(1);

	var suggestions = [];
  var numCmds = TS.omni.commands.length;
  for (var i = 0; i < numCmds; i++) {
    var cmd = TS.omni.commands[i];
		if (text === '' || cmd.cmd.indexOf(textCmd) !== 0) {
			continue; // Entered text does not match this command.
		}
		suggestions = TS.omni[cmd.fn](params);
		break;
	}
	suggest(suggestions);
};
chrome.omnibox.onInputChanged.addListener(TS.omni.inputChanged);

/**
 * User entered input in Chrome's omnibox.
 */
TS.omni.inputEntered = function() {
  

};
chrome.omnibox.onInputEntered.addListener(TS.omni.inputEntered);


