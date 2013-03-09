Chrome Extension: Tabspire
==========================

What it does
------------

Tabspire lets you control Chrome in new ways!

The omnibar (address bar) lets you:

* Save/open urls by name, and remove saved named url.
* Extract/Clone tabs matching a url fragment to a new window.
* Open bookmarks via search.
* Open History entries via search.
* Send yourself a message (HTML5 Notification) in the future.
* Add/use bookmarklet scripts.
* Reload tab every n seconds.
* Reload all tabs in current window (optionally only tabs matching a url fragment).

From a tab (without focusing an input/textarea), Tabspire also lets you:

* m{char} Mark a url to a character.
* M{char} Mark a specific scroll position of a page to a character.
* '{char} Open/Focus a marked url.


Major Components
----------------

Tabspire's major components include:

* A persistent background page for controller/model logic in background/
* A content script for handling user input in a tab.
* A connection to a server for remote commands, such as from Vim & Bash.


Libraries
---------

* jQuery
* Underscore
* Backbone
* doT
* socket.io
