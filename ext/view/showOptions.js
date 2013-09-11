/**
 * Options page general script, misc code to be extracted into modules.
 *
 * @author Wolfe Styke -- <wstyke@gmail.com>
 */

/** Project Namespace */
var TS = TS || {};

/** Module Namespace */
TS.opts = TS.opts || {};

/**
 * Gets named tab data.
 * @return {Object} namedTabs The named tab data..
 */
TS.opts.getNamedTabs = function() {
  return TS.dbTabs.getNamedTabs();
};

/**
 * Render named tabs into template.
 * @return {Object} namedTabsTmpl HTML elements representing named tabs.
 */
TS.opts.tmplNamedTabs = function() {
  var namedTabs = TS.dbTabs.getNamedTabs();
  console.log(namedTabs);

  var tabElts = document.createElement('ul');

  var namedTabList = [];
  for (var tabName in namedTabs) {
    var tab = namedTabs[tabName];
    if ('url' in tab) {
      namedTabList.push(tab);
    }
  }
  namedTabList.sort(function(tabA, tabB) {
    return tabA['name'] > tabB['name'] ? 1 :
      tabA['name'] < tabB['name'] ? -1 : 0;
  });

  for (var i = 0, n = namedTabList.length; i < n; i++) {
    var tab = namedTabList[i];

    var title = tab['title'];
    var titleElipses = title && title.length > 60 ? '...' : '';
    title = title ? title.substr(0, 60) + titleElipses : '';

    var url = tab['url'];
    var urlElipses = url && url.length > 50 ? '...' : '';
    url = url ? url.substr(0, 50) + titleElipses : '';

    var tabElt = document.createElement('li');
    tabElt.className = 'named-tab';

    tabElt.appendChild(TS.opts.snipNamedTabElt(
      tab['name'], 'named-tab-name'));

    tabElt.appendChild(TS.opts.snipNamedTabElt(
      title, 'named-tab-title'));

    tabElt.appendChild(TS.opts.snipNamedTabElt(
      url, 'named-tab-url'));

    tabElts.appendChild(tabElt);
  }

  return tabElts;
};

/**
 * Create a snippet part of named tab element.
 * @param {string} text Text for tab element.
 * @param {string} className The className for this snippet..
 * @return {Object} namedTabSnip The snippet for namedTabElt..
 */
TS.opts.snipNamedTabElt = function(text, className) {
    var namedTabSnip = document.createElement('span');
    namedTabSnip.innerText = text;
    namedTabSnip.className = className;
    return namedTabSnip;
};

$(document).ready(function() {
  console.log('Loading...');
  var tmplNamedTabs = TS.opts.tmplNamedTabs();
  $('#named-tabs').html(tmplNamedTabs);
  console.log('Done.');
});
