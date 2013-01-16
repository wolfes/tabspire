/**
 * Bookmarklet Storage and Retrieval.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */

var TS = TS || {};
/**
 * Namespace: dbBook.
 */
TS.dbBook = TS.dbBook || {};

/**
 * Return dict of bookmarklet names to bookmarklet info objects.
 * @return {Object} bookdict Dict mapping name to bookmarklet.
 */
TS.dbBook.getNamedBooks = function() {
    var bookdict = localStorage.getItem('bookdict');
    return TS.util.isDef(bookdict) ? JSON.parse(bookdict) : {};
};

/**
 * Nukes all Book info.
 */
TS.dbBook.nukeAllBooks = function() {
    TS.dbBook.saveNamedBooks({});
};

/**
 * Save named book dict into localStorage.
 * @param {Object} bookdict Dict mapping book name to bookmarklet info.
 */
TS.dbBook.saveNamedBooks = function(bookdict) {
    localStorage.setItem('bookdict', JSON.stringify(bookdict));
};

/**
 * Add a new uniquely named book to TS.dbBook.
 * @param {Object} data Dict with book name and book info.
 * @this TS.dbBook
 */
TS.dbBook.addNamedBook = function(data) {
    var bookdict = this.getNamedBooks();
    bookdict[data.name] = data;
    this.saveNamedBooks(bookdict);
};

/**
 * Retrieve book item by name.
 * @param {string} bookName The name of desired book.
 * @return {object} book Saved book or undefined.
 * @this TS.dbBook
 */
TS.dbBook.getBookByName = function(bookName) {
    var bookdict = this.getNamedBooks();
    return bookdict[bookName];
};

/**
 * Get bookmarklets using fuzzy name matching.
 * @param {string} queryName The requested name.
 * @return {object} Bookmarklets matching requested name.
 */
TS.dbBook.getBooksByFuzzyName = function(queryName) {
    var bookdict = TS.dbBook.getNamedBooks();
    return TS.dbUtil.getMatchesByFuzzyName(bookdict, queryName);
};
