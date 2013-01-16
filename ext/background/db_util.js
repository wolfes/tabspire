/**
 * Util Methods for DB.
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */

/**
 * Global Project Namespace.
 */
var TS = TS || {};
/**
 * Database Utility Namespace.
 */
TS.dbUtil = TS.dbUtil || {};

/**
 * Given objects having names, return items matching queryName.
 * @param {object} itemDict Maps names to items.
 * @param {string} queryName The name of the desired match.
 * @return {array} matches The list of matches.
 */
TS.dbUtil.getMatchesByFuzzyName = function(itemDict, queryName) {
    var matches = [];
    if (!TS.util.isDef(queryName)) {
        for (var name in itemDict) {
            matches.push(itemDict[name]);
        }
        debug('queryName is undefined');
        return matches;
    }
    for (var name in itemDict) {
        var match = itemDict[name];
        // Condense first 3 cases:
        // rankOrder = 1, rankPos = -10, 0, 1+
        if (match.name.search(queryName) !== -1) {
            match.rankOrder = 1;
            // Rank = Position of queryName in the match's name.
            // Lower is better
            match.rankPos = match.name.search(queryName);
            if (match.name === queryName) {
                match.rankPos = -10; // Sort Exact Match to front.
            }
            //debug(1, match.rankPos, match.name);
        } else {
            // Fuzzy Match: by folders, then by entire string.
            // Redundent folder matching with query anywhere?
            escMatchName = TS.util.escapeRegExp(queryName);
            matchFolders = match.name.split('/');
            fuzzyNameRegExp = new RegExp(
                    escMatchName.split('').join('.*'));
            for (var i = 0; i < matchFolders.length; i++) {
                // Fuzzy Match within a folder name.
                if (fuzzyNameRegExp.test(matchFolders[i])) {
                    match.rankOrder = 2;
                    match.rankPos = i;
                    //debug(2, match.name, queryName);
                    break;
                }
            }
            if (!TS.util.isDef(match.rankPos) &&
                    fuzzyNameRegExp.test(match.name)) {
                // Fuzzy Match.
                match.rankOrder = 3;
                match.rankPos = match.name.search(queryName[0]);
                //debug(3, match.name, queryName);
            }
        }
        if (match.rankOrder !== undefined && match.rankPos !== undefined) {
            matches.push(match);
        }
    }
    // Order matches by rank: Order then Position.
    function sortMatches(a, b) {
        return ((a.rankOrder !== b.rankOrder) ?
                a.rankOrder > b.rankOrder :
                (a.rankPos !== b.rankPos ?
                 a.rankPos > b.rankPos :
                 a.name.length > b.name.length));
    }
    matches.sort(sortMatches);
    return matches;
};

