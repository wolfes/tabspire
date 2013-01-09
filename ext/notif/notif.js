/**
 * Notifaction JS
 *
 * @author Wolfe Styke - <wstyke@gmail.com>
 */

var TS = TS || chrome.extension.getBackgroundPage().TS;

function loadPage() {
    var msg = TS.controller.msg;
    document.getElementById('msg').innerHTML = msg.msg;
    document.getElementById('srcTab').setAttribute('href', msg.url);
    document.getElementById('srcTab').innerHTML = msg.title;

    $('a').live('click', function(e) {
        var openUrl = e.target.href;
        chrome.extension.sendMessage({
            action: 'openTab',
            url: openUrl
        });
    });
}

$(document).ready(loadPage);
