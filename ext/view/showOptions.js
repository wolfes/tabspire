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

  var tabElts = document.createElement('div');

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

    var tabElt = document.createElement('div');
    tabElt.className = 'named-tab';

    var nameSnip = TS.opts.snipNamedTabElt(
      tab['name'], 'named-tab-name');
    nameSnip.contentEditable = true;
    nameSnip.setAttribute('data-name', tab['name']);
    tabElt.appendChild(nameSnip);

    var titleSnip = TS.opts.snipNamedTabElt(
      title, 'named-tab-title');
    titleSnip.contentEditable = true;
    tabElt.appendChild(titleSnip);

    var urlSnip = TS.opts.snipNamedTabElt(
      url, 'named-tab-url');
    urlSnip.contentEditable = true;
    tabElt.appendChild(urlSnip);

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

/**
 * Process edit to named tab's name.
 * @param {Object} tabNameElt Element for tab name.
 */
TS.opts.changeTabName = function(tabNameElt) {
    // Step 1: Record prev and new tab name.
    var prevName = tabNameElt.getAttribute('data-name');
    var newName = tabNameElt.innerText.trim();

    // Step 2: Update data-name attrib.
    tabNameElt.setAttribute('data-name', newName);

    // Step 3: Rename tab in db.
    TS.dbTabs.renameTab(prevName, newName);
};

/**
 * Process edit to named tab's title.
 * @param {Object} tabTitleElt Element for tab title.
 */
TS.opts.changeTabTitle = function(tabTitleElt) {
  var newTitle = tabTitleElt.innerText.trim();
  var tabName = tabTitleElt.parentNode.childNodes[0].innerText;

  var namedTabs = TS.dbTabs.getNamedTabs();
  if (tabName in namedTabs) {
    namedTabs[tabName]['title'] = newTitle;
  }
  TS.dbTabs.saveNamedTabs(namedTabs);
};

/**
 * Process edit to named tab's url.
 * @param {Object} tabUrlElt Element for tab url.
 */
TS.opts.changeTabUrl = function(tabUrlElt) {
  var newUrl = tabUrlElt.innerText.trim();
  var tabName = tabUrlElt.parentNode.childNodes[0].innerText;

  var namedTabs = TS.dbTabs.getNamedTabs();
  if (tabName in namedTabs) {
    namedTabs[tabName]['url'] = newUrl;
  }
  TS.dbTabs.saveNamedTabs(namedTabs);
};

$(document).ready(function() {
  var tmplNamedTabs = TS.opts.tmplNamedTabs();
  $('#named-tabs').html(tmplNamedTabs);

  $('.named-tab-name').on('keyup blur', function(e) {
    var tabNameElt = e.currentTarget;
    TS.opts.changeTabName(tabNameElt);
  });
  $('.named-tab-title').on('keyup blur', function(e) {
    var tabTitleElt = e.currentTarget;
    TS.opts.changeTabTitle(tabTitleElt);
  });
  $('.named-tab-url').on('keyup blur', function(e) {
    var tabUrlElt = e.currentTarget;
    TS.opts.changeTabUrl(tabUrlElt);
  });
});
