The Background Page
===================

The Omnibox
-----------

The omnibox signals each change to its text and query submission when the user
prefixes their query by the letter designated in the extension's
manifest.json file, currently set to 't', followed by a space.

Callbacks are provided for displaying suggestions in the omnibox dropdown,
and for recieving the text of a submitted query from the user.

### Omnibox Commands

`background/omnibox.js` responds to the Omnibox's events by:

* categorizing the user's input into one of the available commands
* publishing a 'suggest' or 'perform' message for that command.

The 'suggest' message payload has two main keys:

* The command info entered by the user in the omnibox.
* A callback to call with a list of omnibox suggestions to show the user.

The 'perform' message payload has one main key:

* the command info entered by the user in the omnibox.

### Command Modules

Command modules live in `cmds/*`.

A command module consists of 3 parts:
* Registration of command information.
* Handling command suggestion requests.
* Handling command performance requests.


LocalStorage Model Persistence
------------------------------

A list of localStorage backed model information:

* Tabs
* Marks
* Booklets
* Flags
* Logs

### Tabs
Stores saved tabs by name.

### Marks
Stores saved marks.

### Booklets
Stores saved bookmarked scripts => bookmarklets => booklets.

### Flags
Stores misc information.  Examples:
* Which server to connect with.
* Whether to log debug messages.

### Logs
Stores activity logs.  Examples:
* Interactions with omnibar (ie: opening named tabs).
* Interactions with page macros (ie: saving/using marks).


Socket.IO Connection Module
---------------------------

`io.js` handle connection to cmdsync server:

* Connecting to server.
* Registering a ClientID.
* Registering handlers for server commands.


Chrome Window/Tab Interaction Observation
-----------------------------------------

The user's interactions with Tabs & Windows tracked by:

* `background/obs_tab.js`
* `background/obs_window.js`

In general, these allow for commands requiring history, ex:

* Focus previously focused tab / window.
