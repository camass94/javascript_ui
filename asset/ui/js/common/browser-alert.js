define(['jquery'], function($) {
    'use strict';
    detectBrowser();
});

function detectBrowser() {
    var layer = $(".browser-alert-wrap"),
        cookieName = "LG4_BROWSER_ALERT",
        browser = (/MSIE 7.*Trident/.test(navigator.userAgent) || $("html").hasClass("lt-ie9")),
        hasCookie = document.cookie.indexOf(cookieName) > -1;
    if (!hasCookie && (/MSIE 7.*Trident/.test(navigator.userAgent) || $("html").hasClass("lt-ie9"))) {
        layer.prepend('<span class="browser-alert-empty" />').show();
    } else {
        layer.remove();
    };
    layer.find(".close-btn").on({
        click: function(e) {
            e.preventDefault();
            var expireDate = new Date();
            layer.addClass("hide");
            expireDate.setDate(expireDate.getDate() + 1);
            document.cookie = cookieName + "= Y" + "; expires=" + expireDate.toGMTString() + "; path=/; domain=.lg.com";
        }
    })
}
