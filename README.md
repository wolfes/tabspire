tabspire
========

A command line for your Chrome address bar.

Name the tabs you want at your fingertips to re-open or re-focus later.

More info: http://wstyke.com/tabspire



+ (10-12-2012) Bookmarklets
+ (10-13-2012) Show matching tab names on tab add.
  (10-17-2012)
+ Activity logging (all the logs!)
+ HTML5 Notifications with links to site where notif was made.
+ (11-13-2012) History Search (basic str.search method)
+ (11-15-2012) Open Chrome Bookmarks (and bookmarklets) by name/url match.
- Add fuzzy match for history and bookmarks.
+ (11-15-2012) Bookmark Name now includes parent folder names
	name: folder1/folder2/bookmark_name

Pending Feature Ideas:

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
