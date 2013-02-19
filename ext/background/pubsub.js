/**
 * The publish-subscribe module for global event aggregation!
 *
 * Used for:
 * - Publishing commands as entered from Omnibox.
 * - Eventually... publishing similar commands as entered from quick-input UI.
 * - ???
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */

/** Tabspire Namespace */
var TS = TS || {};

/** Messaging Namespace */
TS.vent = TS.vent || {};

_.extend(TS.vent, Backbone.Events);

/**
 * Publishes document ready state change.
 */
TS.vent.publishDocumentReady = function() {
    TS.vent.trigger('document:ready');
};

$(document).ready(TS.vent.publishDocumentReady);
