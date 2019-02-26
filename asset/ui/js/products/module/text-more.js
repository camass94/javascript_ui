/* global define */


define(['global-config', 'jquery'], function(globalConfig, $) {

    'use strict';

    $(".text-banner.three-column .desc button").click(function() {
        var self = $(this);

        if (self.parent().parent().is('.on')) {
            self.parent().parent().removeClass("on");
            $(this).find("i").attr("class", "icon icon-menu-plus");
        } else {
            self.parent().parent().addClass("on");
            $(this).find("i").attr("class", "icon icon-menu-minus");
        }
        return false;
    });
});
