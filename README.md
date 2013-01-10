tabspire
========

A command line for your Chrome address bar.

Name the tabs you want at your fingertips to re-open or re-focus later.

Add:
	showMark -> to switch selected tab, without focusing browser.


More info: http://wstyke.com/tabspire

v0.9.9 - Added reloadCurrentTab + reloadFocusMark + focusMark.
v0.9.8 - Added Mark Tab `ma` and Goto Tab `'a` like in Vim.
v0.9.6 - Added delete tab by name/url with 't d tabName'.
v0.9.5 - Added infinite socket.io reconnect every 5 mins.
v0.9.4 - Added support for openURL
v0.9.3 - Added support for saving client id locally & on cmdsync.com:3000.

+ (01-10-2013) Added TS.controller.setLocalSettings(boolean useLocalSettings).
	Enables one-method switching between local and remote server,
	using persistent flag storage.
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
  (10-17-2012)
+ Activity logging (all the logs!)
+ HTML5 Notifications with links to site where notif was made.

Pending Feature Ideas:

CATASTROPHIC

MAJOR
- Figure out: Copy to Clipboard (it exists!).

MINOR

COSMETIC


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
