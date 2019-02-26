define(['jquery'], function($) {
    'use strict';
});

function sendEvent(linkname, triggerName) {
    digitalData.eventData = {
        linkName: linkname, //link name is the name of the link being clicked the by the visitor
        eventAction: triggerName //this will be the event triggered - link click
    }
    _satellite.track('sendEvent');
}

$(document).off('click.scEvent').on("click.scEvent", "a[data-sc-item], button[data-sc-item]", function() {
    if ($(this).data('sc-item') && $(this).data('sc-item') != "undefined" && (!$(this).data('has-sc') || $(this).data('has-sc') != 1)) {
        var n = $(this).data('sc-item');
        var v = "";
        if ($(this).data('sc-value') && $(this).data('sc-value') != "undefined") v = $(this).data('sc-value');
        $(this).data('has-sc', 1);
        sendEvent(n, v);
    }
})
