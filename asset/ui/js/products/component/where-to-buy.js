var clear;

define(['jquery', 'ic/ic', 'ic/ui/module'], function($, ic, Module) {

    'use strict';


    var proto,
        events = ic.events,
        isMobile = $("body").is(".is-mobile");

    var runWhereToBuy = function(el, options) {
        var self = this;
        // Call the parent constructor
        runWhereToBuy.superclass.constructor.call(self, el, options);

        self.$priceSpider = self.$el.find(".ps_LayoutContainerWrapperStyle");
        self.$tabs = self.$el.find(".tab-buttons");
        self._init();
    };
    ic.util.inherits(runWhereToBuy, Module);
    proto = runWhereToBuy.prototype;
    proto._defaults = {
        //active class
        ac: 'active'
    };
    proto._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self);

        $(window).on('resize', $.proxy(self._resizePs, self));
        self.$tabs.find("a").on('click', $.proxy(self._triggerTab, self));
        if (isMobile) {
            clear = setInterval($.proxy(self._set, self), 500);
        };
        // attatch event
        //self.$major.on('eventName', $.proxy(self._functionName, self));
    }
    proto._set = function() {
        var self = this;

        if (self.$priceSpider) {
            self.$priceSpider = self.$el.find(".ps_LayoutContainerWrapperStyle");
            self.$tabs.find("ul li").eq(0).addClass("active");
            self.$priceSpider.find(".ps_Column").eq(0).addClass("active");
            clearInterval(clear);
        }
    }
    proto._resizePs = function() {
        var self = this,
            w = self.$priceSpider.find("td.ps_Left").outerWidth();
        self.$priceSpider = self.$el.find(".ps_LayoutContainerWrapperStyle");
        self.$priceSpider.find(".MicrosoftMap").css({
            width: w - 20
        });
    }
    proto._triggerTab = function(e) {
        var self = this,
            t = $(e.currentTarget);
        t.parents("ul").find(".active").removeClass("active");
        self.$priceSpider.find(".ps_Column").removeClass("active");
        t.parent().addClass("active");
        self.$priceSpider.find(".ps_Column").eq(t.parent().index()).addClass("active");
    }
    ic.jquery.plugin('runWhereToBuy', runWhereToBuy, '.where-to-buy');
    return runWhereToBuy;

});
