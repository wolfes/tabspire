/**
 * Bookmarklet Storage and Retrieval.
 * Author: Wolfe Styke <wstyke@gmail.com>
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
  var bookdict = JSON.parse(localStorage.getItem('bookdict'));
  if (bookdict === null) {
      bookdict = {};
  }
  return bookdict;
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
 * @return {boolean} true if save worked.
 * @this TS.dbBook
 */
TS.dbBook.addNamedBook = function(data) {
    var bookdict = this.getNamedBooks();
    if (bookdict[data.name] !== undefined) {
        // Name already saved to a book.
        // Skip saving?
        //return false;
    }
    bookdict[data.name] = data;
    this.saveNamedBooks(bookdict);
    return true;
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
    var books = [];
    var bookDict = TS.dbBook.getNamedBooks();

    if (queryName === undefined) {
        for (var name in bookDict) {
            bookss.push(bookDict[name]);
        }
        return books;
    }
    for (var name in bookDict) {
        var book = bookDict[name];
        if (book.name.search(queryName) !== -1) {
            book.rankOrder = 1;
            // Rank = Position of queryName in the book's name.
            // Lower is better
            book.rankPos = book.name.search(queryName);
            if (book.name === queryName) {
                book.rankPos = -10; // Sort Exact Match to front.
            }
            debug(1, book.rankPos, book.name);
        } else {
            // Fuzzy Match: by folders, then by entire string.
            // Redundent folder matching with query anywhere?
            escBookName = TS.util.escapeRegExp(queryName);
            bookFolders = book.name.split('/');
            fuzzyNameRegExp = new RegExp(
                    escBookName.split('').join('.*'));
            if (book.rankPos === undefined &&
                    fuzzyNameRegExp.test(book.name)) {
                // Fuzzy Match.
                book.rankOrder = 3;
                book.rankPos = book.name.search(queryName[0]);
                debug(5, book.name, queryName);
            }
        }
    }
    return books;
};



