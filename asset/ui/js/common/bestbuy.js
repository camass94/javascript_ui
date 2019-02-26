define(['global-config', 'jquery'], function(globalConfig, $) {
    'use strict';
    (function($) {
        var a = '<script src="https://commerce-ssl.bestbuy.com/static/ce/partner/scripts/ce-checkout-0_0_1.js"></script>';
        $("body").eq(0).append(a);
        //var b = '<style id="buynow-css">#bby-everywhere-ce-close-button, #bby-everywhere-ce-iframe {margin-top:'+parseInt($(window).scrollTop())+'px}</style>';
        //$("body").eq(0).append(b);
        if ($('.buynow').length > 0) {
            runBuyNow();
        }
    })(jQuery);
});

function runBuyNow() {
    $('.buynow').unbind('click').click(function() {
        //var b = '<style id="buynow-css">#bby-everywhere-ce-close-button, #bby-everywhere-ce-iframe {margin-top:'+parseInt($(window).scrollTop())+'px}</style>';
        //$("body").eq(0).append(b);
        bby.everywhere.ce.createFrame(this);
        $('#bby-everywhere-ce-close-button, #bby-everywhere-ce-iframe').css('margin-top', parseInt($(window).scrollTop()) + "px");
    });
}
