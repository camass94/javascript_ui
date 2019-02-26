define(['global-config', 'jquery'], function(globalConfig, $) {

    'use strict';

    $(".find-a-store form").on({
        submit: function() {
            var v = $(this).find("input[name=location]");
            v.val(XSSfilter(v.val()));
            return true;
        }
    })
});
