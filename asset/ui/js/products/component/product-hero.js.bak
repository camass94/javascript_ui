/* global define */

/**
 * A utility module.
 * @module common/util
 */
define(['ic/ic', 'ic/ui/module', 'jquery', 'slick-carousel'], function(ic, Module, $, slick) {
    'use strict';

    var proto,
        events = ic.events,
        $window = ic.dom.$window,
        setTime = 2500,
        duration = 1000,
        isNoTransition = $('html').is(".no-csstransitions"),
        i, l;

    var ProductHero = function(el, options) {
        var self = this;
        // Call the parent constructor
        ProductHero.superclass.constructor.call(self, el, options);

        //Desktop Nav Items
        self.$fadeShowAward = self.$('.fade-show-award').data("ran", false);
        self.$awardLogos = self.$fadeShowAward.find("img");
        self.$layerTrigger = self.$(".product-hero-layer-trigger");
        self.$layer = self.$(".product-hero-layer.awards");
        self.$carouselLocation = self.$(".with-carousel");
        self.$layerMask = $(".layer-mask");
        self.currentNavIndex = 0;

        self._init();
    };
    // Inherit from Module
    ic.util.inherits(ProductHero, Module);

    // Alias the prototype for less typing and better minification
    proto = ProductHero.prototype;

    proto._defaults = {
        //active class
        ac: 'active'
    };

    proto._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self);
        i = 1,
            l = self.$awardLogos.length;
        self.$layerTrigger.on('click', $.proxy(self._runLayerPopup, self));
        self._runFadeShowAward();
    }
    proto._runLayerCarousel = function() {
        var self = this,
            carouselLocation = self.$carouselLocation;
        if ($(".is-mobile").length > 0) {
            $(carouselLocation).slick({

                slidesToScroll: 1,
                dots: false,
                arrows: true,

                responsive: [{
                    breakpoint: 768,
                    settings: {

                        slidesToShow: 1,
                        slidesToScroll: 1,
                        dots: true,
                        arrows: true
                    }
                }]

            });
        }
    }
    proto._runFadeShowAward = function() {

        var self = this,
            showArea = self.$fadeShowAward,
            imgs = self.$awardLogos;

        if (imgs.length > 1) {
            if (showArea.data("ran") === false) {
                imgs.eq(i).css({
                    display: "block"
                });
                if (isNoTransition) {
                    imgs.eq(i).css({
                        opacity: 0
                    });
                    imgs.eq(i).delay(setTime).animate({
                        opacity: 1
                    }, duration, function() {
                        i++;
                        if (i === l) showArea.data("ran", true);
                        self._runFadeShowAward();
                    });
                    imgs.eq(i - 1).delay(setTime).animate({
                        opacity: 0
                    });

                } else {
                    setTimeout(function() {
                        imgs.eq(i).css({
                            opacity: 1
                        });
                        imgs.eq(i - 1).css({
                            opacity: 0
                        });
                        i++;
                        if (i === l) showArea.data("ran", true);
                        self._runFadeShowAward();

                    }, setTime);
                }

                //showArea.data("ran",true);
            };
        }
    };
    proto._runLayerPopup = function(e) {
            var self = this;
            var layerMask = $(".layer-mask");
            e.preventDefault();
            self.$layer.fadeIn();

            if (self.$layer.find(layerMask).length == 0) {
                $("<div class='layer-mask'></div>").appendTo(self.$layer);

            }

            if($(".is-mobile").length && $("html").data("privacy-type")){
                $(".eprivacy-cookie, .agree-cookie-wrap").prependTo(".wrapper");
            }

            if (self.$layer.data("ran") !== true) {
                self.$layer.find("a.close").on({
                    click: function(e) {
                        e.preventDefault();
                        self.$layer.fadeOut();
                        if($(".is-mobile").length && $("html").data("privacy-type")){
                            $(".eprivacy-cookie, .agree-cookie-wrap").prependTo("body");
                        }
                    }
                });
                self._runLayerCarousel();
                self.$layer.data("ran", true);
                self.$layer.find("img.lazy").lazyload();
            }
        }
        //   Create the jquery plugin and set it to auto-wire to specified selector
    ic.jquery.plugin('ProductHero', ProductHero, '.ProductHero');

    $(document).on('afterChange, swipe', '.award-list.slick-slider', function() {
        $(this).find("img.lazy").lazyload();
    });

    // awards check

    var _loadLocation = window.location.href;
    var _reLocation = _loadLocation.split('#');
    if (_reLocation[1] == 'awards' || _reLocation[1] == '/awards') {
        var _chkGutter = $('body').find('.hero-gutter-wrap').length;
        if (_chkGutter == 0) {
            return;
        } else {
            $('.product-hero-layer-trigger').trigger('click');
        }
    } else {
        return;
    }





    return ProductHero;
});
