/**
 * The toggle radio module.
 * @module support/component/
 * @requires ic/ic
 * @requires ic/ui/module
 */
define(['jquery', 'ic/ic', 'ic/ui/module'], function($, ic, Module) {

    'use strict';
    //console.log('btnActivation.js');

    var self;
    var button;
    var proto = BtnActivation.prototype;
    var response;



    function BtnActivation(el) {
        button = el;
        self = this;
        self.init();
    }

    proto.init = function() {
        $(button).bind('click', this.mouseEventHandler);
    };

    proto.mouseEventHandler = function(e) {
        //
        switch (e.type) {
            case "click":
                button = $(e.currentTarget);
                //target.toggleClass("active").hasClass("active") ? target.attr("title", "Change to inactive") : target.attr("title", "Change to active");

                self.send({
                    activation: $(e.currentTarget).hasClass("active") ? "inactive" : "active",
                    id: $(e.currentTarget).data("id")
                }, $(e.currentTarget).data("url"));
                break;
        }
    };

    proto.send = function($data, $url) {
        //var status = $data.status;
        jQuery.ajax({
            type: "GET",
            url: String($url),
            data: $data,
            dataType: "html",
            success: function($response) {
                response = jQuery.parseJSON(String($response));
                self.setButton();
            },
            error: function(xhr, status, error) {
                alert(error);
            }
        });
    }

    proto.setButton = function() {
        switch (response.result) {
            case "active":
                $(button).addClass("active").attr("title", "Change to inactive");
                break;
            case "inactive":
                $(button).removeClass("active").attr("title", "Change to active");
                break;
            case "error":
                alert(response.errormsg);
                break;
        }
    }

    proto.destroy = function() {
        //
    };



    // Create the jquery plugin and set it to auto-wire to specified selector
    ic.jquery.plugin('btnActivation', BtnActivation, '.btn-activation');

    return BtnActivation;
});
