/**
 * The toggle radio module.
 * @module support/component/
 * @requires ic/ic
 * @requires ic/ui/module
 */
define(['jquery', 'ic/ic', 'ic/ui/module'], function($, ic, Module) {

    'use strict';
    //console.log('btnBVreview.js');
    var proto = BtnBVreview.prototype;
    var response;



    function BtnBVreview(el) {
        var self = this;
        self.button = el;
        self.init();
    }

    proto.init = function() {
        var self = this;
        $(this.button).bind('click', this.mouseEventHandler);
    };

    proto.mouseEventHandler = function(e) {
        //
        switch (e.type) {
            case "click":
                var bt = $(e.currentTarget);
                var productId = bt.data("product-id");
                try {
                    $BV.ui("rr", "submit_review", {
                        productId: productId,
                        userToken: "ltbfep3jz40e4etn004twpx7n",
                        allowSamePageSubmission: true
                    }, e);
                } catch (err) {
                    alert(err.message);
                }
                break;
        }
    };

    proto.destroy = function() {
        //
    };



    // Create the jquery plugin and set it to auto-wire to specified selector
    ic.jquery.plugin('btnBVreview', BtnBVreview, '[rel="bv:review"]');

    return BtnBVreview;
});
