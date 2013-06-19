tabspire
========

A command line for your Chrome address bar.

Name the tabs you want at your fingertips to re-open or re-focus later.

Provides Chrome API Remote Control w/ Vimspire.


Omnibox Commands
================


Named Tab Manipulation
----------------------

### Add Tab: `t a name/of/tab`

### Open Tab: `t o name/tab`
- Fuzzy search enabled!

### Delete Tab: `t d name/tab`
- Fuzzy Search enabled!

General Tab Manipulation
-------------------------

### Open Bookmark: `t b bookmark-name`
- Fuzzy Search Bookmarks: folder1/folder2/bookmark-name.

### Open History: `t h url-or-title-query`

### Extract Tab: `t e url-fragment`
- Extracts all tabs in current window matching url-fragment into new window.

### Clone Tab: `t E url-fragment`
- Like Extract Tabs, but leaves original tabs unaffected.

### Reload Tab: `t r number-of-seconds`
- Reloads current tab every number-of-seconds.

### Reload All Tabs in Current Window: `t rw`


Timed Reminders
---------------

### Message At: `t m 13:30 At half past one in the afternoon tell me...`
- Use Military Time.

### Notify In: `t n 30 In thirty minutes tell me to...`
- Notify in takes a number of minutes to wait before notification.


Bookmarklet Manipulation
------------------------

- Experimental, ymmv.

### Add Bookmarklet: `t s bookmarklet-script`

### Use Bookmarklet: `t u bookmarklet-script`


Client Identity Management
--------------------------

### Setting Client ID: `t c your-client-id`
- Set your private client id for Vimspire to send you messages.

### Joining Named Groups: `t C your-group-name`
- Currently Experimental.
- Join a multi-client group for sharing commands.


New Ideas
=========

* Save / Load "Named" set of marks.
  'Default' marks:apply when not over-ridden by loaded named marks.
  'Clojure' marks: learning clojure.
  'Spire' marks: tab/n/vim-spire work.
  ...


Inner Workings
==============

Where to determine which cmd?
-----------------------------

* Omnibox controller figures out which cmd
	publishes to that cmd's channel to be performed by cmds/...
* Alt. Input controller figures out which cmd
* -> publishes to that cmd's channel to be performed by cmds/...
* Extract cmd-recognition logic from both controllers


"Extraction" - ADDED

* `t e reddit` extracts all tabs with urls containing `reddit`.
* `t E reddit` clones matching tabs into new window.
* TS.controller.extractTabsByUrl(string urlFragment, boolean closeExtractedTabs)
* Extract all urls containing 'youtube' into a newly created window,
* removing them from their old window.
* `t d tabName` deletes saved tab with matching name.

Vim-Like Commands from any Tab

* Esc -- Clear special command input.  ie: `,{char} <Esc> '{char}`.
* m{char} -- Mark current tab's url with {char}.
* M{char} -- Mark current tab's url and scrollX/Y position with {char}.
* '{char} -- Goto url with mark {char}, optionally scroll to saved position.
* '' -- Goto last focused tab in same window.
* '" -- Goto last focused window.


Todos: Features
--------------
	showMark -> to switch selected tab, without focusing browser.
	Clear Number / All Marks.
	Added Mark (tab + scroll position) !!.
		m{char} - mark: url
		M{char} - mark: url + scrollPos
			!FIXME! Clean this up, hackity hackity... ...cleaning...

Create flash-pages.
	t p
		Create New FlashPage (HTML Page)
			Question div - contenteditable=true
			Answer div - contenteditable=true
		Store json blob in new db.
	t q
		Quiz me!
		Show questions
			"Show Answer" -> "I got this!", "Was Close", "Totally Forgot"
	Periodic System-Pushed HTML5 Notif. Quiz Questions

More info: http://wstyke.com/tabspire

Release Notes
============
v2.0.0.0 - Updated WebSocket module to connect to new Clojure nspire server.
v1.0.1.0 - Added `t e urlFragment` & `t E urlFragment`:
- Extract/clone tabs with urls matching urlFragment into a new window..
v1.0.0.0 - Added `''` and `'"`: focus prev. focused tab(in same window)/window.
v0.9.9 - Added reloadCurrentTab + reloadFocusMark + focusMark.
v0.9.8 - Added Mark Tab `ma` and Goto Tab `'a` like in Vim.
v0.9.6 - Added delete tab by name/url with 't d tabName'.
v0.9.5 - Added infinite socket.io reconnect every 5 mins.
v0.9.4 - Added support for openURL
v0.9.3 - Added support for saving client id locally & on cmdsync.com:3000.

Release Info
============
+ (06-18-2013) v2.0.0.0 with websocket upgrades for clojure nspire server.
+ (02-06-2013) Improved "Focus Last Focused Tab"
  to remember the previous N focused tab PER WINDOW ID
  --> focus last focused tab in same window..
+ (02-05-2013) Added marks:
  '' to focus last focused tab, and
  '" to focus last focused window.
+ (01-17-2013) Added window.focusCurrent method to focus Chrome App via remote.
-	Added tabs.js and windows.js for modular controls.
+ (01-16-2013) Refactoring tab control into background/tabs.js.
+ (01-14-2013) Added Mark & Goto (Tab URL + scrollX/Y).
+ (01-11-2013) Added TS.controller.focusTabIndex, focus i'th tab in curr window.
+ (01-10-2013) Added TS.controller.setLocalSettings(boolean useLocalSettings).
	Enables one-method switching between local and remote server,
	using persistent dbFlag storage.
+ (01-09-2013) Added dbFlags for persistent flag storage in localStorage.
+ (01-09-2013) Added reloadFocusMark method for remote-controlling marks.
+ (01-03-2013) Mark + Goto (ma + 'a)
+ (12-05-2012) Added Reload Tab By Name.
+ (12-04-2012) Added Delete Tab By Name.  Infinite reconnect.
+ (12-03-2012) Added openURL
+ (11-27-2012) Added Open GoogleSearch in Tab.
+ (11-15-2012) Bookmark Name now includes parent folder names
	name: folder1/folder2/bookmark_name
+ (11-15-2012) Open Chrome Bookmarks (and bookmarklets) by name/url match.
- Add fuzzy match for history and bookmarks.
+ (10-13-2012) Show matching tab names on tab add.
+ (11-13-2012) History Search (basic str.search method)
+ (10-12-2012) Bookmarklets
+ (10-17-2012)
- Activity logging (all the logs!)
- HTML5 Notifications with links to site where notif was made.

Bugs
====

Catastrophic
- None
Major
- None
Minor
- None
Cosmetic
- None

Feature Ideas
=============

- Figure out: Copy to Clipboard (it exists!).

- chrome.pageCapture to save all pages in window at once.
- Badges for completing X actions of each type: 1, 3, 10, 30, 100, 300, ...

- Delete named tab, named bookmarklet, named anything...
	"t d name"
- Default Behavior -?- Open from bookmarked, history, ...?
- Paste current window's tab urls into notification.

- Remember last 5 commands for each command type that makes sense.
-- Suggest these commands when user begins "t o"

- Assign bookmarklets to be run on tabname's opening.

In Progress
- Refactor searchX into
	getItemsX
	createSuggestionsForX
