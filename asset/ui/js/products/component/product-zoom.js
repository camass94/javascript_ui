/*
 * Hero Zoom
 * 2015-06-16
 */
var clear;
define(['jquery', 'ic/ic', 'ic/ui/module', 'mkt/e-smart-zoom-jquery', 'slick-carousel'], function($, ic, Module, smart, slick) {

    'use strict';

    var proto,
        events = ic.events;

    var zoomTrigger = function(el, options) {
        var self = this;
        // Call the parent constructor
        zoomTrigger.superclass.constructor.call(self, el, options);
        self.$base = self.$el.find(".bottom-module-wrap");
        self.$carousel = self.$base.find(".hero-carousel-arrow");
        self.$zoomBtn = self.$el.find(".tools_wrap .product-zoom");
        self.$layer = self.$el.find(".product-hero-layer.zoom-area");

        self._init();
    };
    ic.util.inherits(zoomTrigger, Module);
    proto = zoomTrigger.prototype;
    proto._defaults = {
        //active class
        ac: 'active',
        c: null,
        t: null
    };
    proto._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self);
        self.$slick = self.$carousel.slick('getSlick');
        self.$carousel.on('afterChange', $.proxy(self._detectLargerImg, self));
        self.$zoomBtn.on('click', $.proxy(self._showLayer, self));
        self.options.t = self.$zoomBtn.data("closetitle")
        self._detectLargerImg();

        if ($(".hero-type-b").length) {
            self.$base = $(".hero-type-b");
        }
    }

    proto._detectLargerImg = function(event, slick, currentSlide, nextSlide) {
        var self = this;
        slick = slick ? slick : self.$slick;
        currentSlide = currentSlide ? currentSlide : 0;
        self.options.c = $(slick.$slidesCache[currentSlide]);
        if (self.options.c.find("img").data("largeimg")) {
            self.$zoomBtn.removeClass("disabled").addClass("enabled");
            self.options.c = self.options.c.find("img").data("largeimg");
        } else {
            self.$zoomBtn.addClass("disabled").removeClass("enabled");;
        }
    }

    proto._showLayer = function(e) {
        var self = this,
            a = $(e.currentTarget),
            t = self.$layer.find(".zoom-target");

        e.preventDefault();
        if ($(e.currentTarget).is(".disabled")) return false;
        //if (t.attr("src") !== self.options.c) {
            //self.$layer.remove();
        self.$base.append(self._appendLayer());
        self.$layer = self.$el.find(".product-hero-layer.zoom-area");
        t = self.$layer.find("#zoom-target");
        //}
        
        setTimeout(function(){
            t.smartZoom({
                'containerClass': 'zoomableContainer'
            });
        }, 50);

        self.$layer.fadeIn();
        self.$layer.find("a.close").unbind().on({
            click: function(e) {
                e.preventDefault();
                t.smartZoom('destroy');
                self.$layer.fadeOut();
                self.$layer.remove();
                a.removeClass("disabled").focus();
            }
        });
        self.$layer.find("a.close").focus();
        a.addClass("disabled");
    }

    proto._appendLayer = function() {
        var self = this,
            html = [],
            h = -1;
        html[++h] = '<div class="product-hero-layer zoom-area">';
        html[++h] = '   <div class="product-hero-layer-inner">';
        html[++h] = '       <div class="zoom-wrap"><img class="zoom-target" id="zoom-target" src="' + self.options.c + '"/></div>';
        html[++h] = '       <a href="#" class="close" title="' + self.options.t + '"><i class="icon icon-close"></i></a>';
        html[++h] = '   </div>';
        html[++h] = '</div>';

        return html.join("");
    }
    if (!$("body").hasClass("is-mobile")) {
        ic.jquery.plugin('zoomTrigger', zoomTrigger, '#ProductHero');
    }
    return zoomTrigger;

});
