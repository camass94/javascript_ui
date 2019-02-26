/* global define */

/**
 * A module representing a Dog.
 * @module common/dog
 * @requires  common/util
 * @requires  common/animal
 */
define(['ic/ic', 'ic/ui/module', 'common/util', 'common/debounce', 'lazyload'], function(ic, Module, util, debounce, lazyload) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        $document = $(document),
        $window = $(window),
        $appHeader = $('.appHeader'),
        $wrapper = $('.wrapper'),
        oldIE = false,
        ie = {
            interV: null,
            anchor: false
        },
        proto;

    if ($('html').is('.lt-ie9')) {
        $document = $window;
        oldIE = true;
    }

    var AccordionTabs = function(el, options) {
        var self = this;

        // Call the parent constructor
        AccordionTabs.superclass.constructor.call(self, el, options);

        // selectors
        self.$wrapper = $(el);
        self.$tabPanels = self.$wrapper.find('.tabs-panel');
        self.$tabsNav = self.$wrapper.find('.tabs-nav');
        self.$tabs = self.$tabsNav.find('li');
        self.$tabInAnchors = self.$tabsNav.find('li > a');
        self._active = 0;
        self._scrollFlag = true;

        self.$tabs.last().find('a span').css('border-right', 'none');

        self.$TabWrap = $(self.$wrapper.data("tabWrapper"));
        self.$StickWrap = $(self.$wrapper.data("stickyWidth"));
        self._newTab = (self.$TabWrap) ? true : false;

        // Event Handlers
        self.$el.on(events.CLICK_EVENT, '[data-toggle="tab"]', $.proxy(self._onTabClick, self)); /* Desktop Only */
        self.$el.on(events.CLICK_EVENT, '[data-toggle="accordion-tab"]', $.proxy(self._onAccordionClick, self)); /* accordion-tab Only */

        $document.scroll(debounce($.proxy(self._onScroll, self), 10, false));

        // additional initialization
        if ($('body').hasClass('is-mobile')) {
            setTimeout($.proxy(self._initActiveMobileItem, self), 100);
        } else {
            
            self._initActiveItem();
            self.$wrapper.find('.tabs-panels img.lazy').lazyload({
                appear: function(e) {
                    $(this).attr('style', '').removeClass('lazy');
                },
                event: "tab-trigger"
            })

            self._controlSpec();
            if(self.$tabPanels.find(".first-unit").length>0){
                self._supportLiheight(self.$tabPanels.find(".first-unit"));
            }
        }

        // create anchor positions
        self.$tabPanels.find("a.open-feature").on(events.CLICK_EVENT, $.proxy(self._openFeature, self)).find("span").text(commonMsg.common.open);
        self._imgObj = $("#features,#tech-specs,#ratings-reviews").find("img.lazy");
    };

    // util.inherits(AccordionTabs, Tabs);
    util.inherits(AccordionTabs, Module);
    proto = AccordionTabs.prototype;

    // overwrite default tabs event handler
    proto._onTabClick = function(e) {
        var self = this;
        var href = $(e.currentTarget).attr('href') ? $(e.currentTarget).attr('href') : $(e.currentTarget).find('a').attr('href');
        var $anchor = $(href)[0];
        e.preventDefault();

        if ($(".tabs-panels").data("onLoad") === true) {
            self._beforeGotoAnchor($anchor);
        } else {
            $(".tabs-panels img.lazy").trigger("tab-trigger");

            if(ie.interV){
                clearInterval(ie.interV);
            }

            if (!oldIE) {
                ie.anchor = $anchor;
                ie.interV = setInterval($.proxy(self._checkLoadedImage, self), 50);
            } else {
                ie.anchor = $anchor;
                ie.interV = setInterval($.proxy(self._checkLoadedImage, self), 50);
            }
        }
        self._clickHandler(e);
    };

    proto._checkLoadedImage = function() {
        var self = this;

        if(self._imgObj.length){
            for(var i=0; i<self._imgObj.length; i++){
                /* LGEAU-2419 : 20171011 modify */
                if($(self._imgObj[i]).height() > 1 || $(self._imgObj[i]).height() == 0 || $(self._imgObj[i]).height() == 1){
                    self._imgObj.splice(i, 1);
                    i--;
                }
                /*//LGEAU-2419 : 20171011 modify */
            }
        }else{
            $(".tabs-panels").data({
                onLoad: true
            }).find(".wrap_loading").remove();
            if (ie.interV) {
                clearInterval(ie.interV);
                setTimeout(function(){
                    self._beforeGotoAnchor(ie.anchor)
                }, 400);
            }
        }
    }

    proto._openFeature = function(e) {
        var self = this;
        $(e.currentTarget).addClass("hide");
        var pModule = $(e.currentTarget).parent();
        var pModuleId = pModule.data("featureId");
        var navHeight = (self._newTab) ? self.$TabWrap.outerHeight() + self.$StickWrap.outerHeight() : $('.stickynav').outerHeight() + $('.tabs-nav-wrapper').outerHeight();

        if ($('body').hasClass('is-mobile')) {
            navHeight=$("#features .accordion-tab a").outerHeight();
        }
        /* LGEGMO-3176, LGEGMO-3331 : 20170706 modify */
        var modelName= $('.pdp-improve-visual-img').attr("adobe-pdp-model");
        var child = pModule.parent().find(".module[data-parent-id='" + pModuleId + "']");
        var childLength = pModule.parent().find(".module[data-parent-id='" + pModuleId + "']").length;
        var openFeatureText = pModule.find(".open-feature-text").text();
        var closeTopButton = '<a class="close-feature" href="#" adobe-click="pdp-arrow-feature-close-click" adobe-pdp-model="'+ modelName +'" adobe-pdp-feature-text="'+ openFeatureText +'"><i class="icon icon-arrow-feature-close-btn"></i><span>'+commonMsg.common.close+'</span></a>';
        /*//LGEGMO-3176, LGEGMO-3331 : 20170706 modify */
        pModule.find(".open-feature-text").addClass("hide");
        if (pModule.data("child")) {
            child.height("auto");
            if (pModule.parent().find(".module[data-parent-id='" + pModuleId + "']").length) {
                pModule.parent().find(".module[data-parent-id='" + pModuleId + "']").each(function(i) {
                    if (i == 0) {
                        $(this).prepend(closeTopButton);
                    } else if (i == childLength - 1) {
                        $(this).append(closeTopButton);
                        $(this).find(".close-feature").addClass("last");
                        $(this).find(".close-feature i").removeClass("icon-arrow-feature-open-btn").addClass("icon-arrow-feature-close-btn");
                    }
                    
                    /* LGEGMO-3331 : 20170706 modify */
                    $(this).find(".close-feature").css({height: "40px", width: "70px", position: "absolute", left:"48%"});
                    $(this).find(".close-feature.last").css({bottom:"0"});
                    /*//LGEGMO-3331 : 20170706 modify */
                })
            }

            pModule.parent().find(".module[data-parent-id='" + pModuleId + "']").removeClass("hide");
            $('body, html').stop().animate({
                scrollTop: pModule.offset().top + pModule.height() - navHeight
            }, 'slow')
            child.find("a.close-feature").click(function(e) {
                child.find("a.close-feature").remove();
                if(child.find(".video-asset .video-content").length){
                    child.find(".video-asset").hide().empty();
                }
                e.preventDefault();

                child.stop().animate({
                    height: 0
                }, 'slow', function() {
                    child.addClass("hide");
                    pModule.find(".open-feature").removeClass("hide");
                    pModule.find(".open-feature-text").removeClass("hide");
                });
                $('body, html').stop().animate({
                    scrollTop: pModule.offset().top - navHeight
                }, 'slow')

            })
        }
        e.preventDefault();
    }
    

    proto._onAccordionClick = function(e) {
        var self = this;
        var href = $(e.currentTarget).attr('href') ? $(e.currentTarget).attr('href') : $(e.currentTarget).find('a').attr('href');
        var $anchor = $(href)[0];
        e.preventDefault();
        self._clickMobileHandler(e);
    }

    proto._clickMobileHandler = function(e) {
        var self = this,
            idx = self.$tabPanels.index($(e.currentTarget).parents(".tabs-panel")[0]);

        self._mobileChange(idx);
        e.preventDefault();
    };
    proto._clickHandler = function(e) {
        var self = this,
            idx = self.$tabs.index($(e.currentTarget).parent()[0]);

        self.setActive(idx);
        e.preventDefault();
    };

    proto._beforeGotoAnchor = function($anchor) {
        var position,
        self = this,
        _headerHeight = self.$wrapper.offset().top,
        chkt = $(window).scrollTop(),
        navHeight = (self._newTab) ? self.$TabWrap.outerHeight() + self.$StickWrap.outerHeight() : $('.stickynav').outerHeight() + $('.tabs-nav-wrapper').outerHeight();
        $anchor = $($anchor);

        if(self.$StickWrap.hasClass("sticky")){
            if ($anchor.index() === 0) {
                position = $anchor.offset().top - navHeight + 2;
            } else {
               position = $anchor.offset().top - navHeight; 
            }
        } else {
            position = $anchor.offset().top - (self.$TabWrap.outerHeight() - 2);
        }

        return self._GotoAnchor(position);
    };

    proto._GotoAnchor = function($top) {
        $('body, html').stop().animate({
            scrollTop: $top
        }, '500', function() {

        });
    }


    proto.setActive = function(idx) {
        var self = this;

        if ($(self._active).index() === idx) {
            return self;
        }
        return self._change(idx);
    };

    proto.setMobileActive = function(idx) {
        var self = this;
        if ($(self._active).index() === idx)
        if (self.$tabPanels.index($('active')[0])===idx) {
            return self;
        }
        return self._mobileChange(idx);
    }

    proto._mobileChange = function(idx) {
        var self = this,
            activeClass = 'active',
            $tab,
            $tabPanel;

        $tab = $(self.$tabs[idx]);
        $tabPanel = $(self.$tabPanels[idx]);

        $tabPanel.toggleClass(activeClass).find('.accordion-content').toggle(
            function() {
                $(this).animate({
                    height: 0,
                    width: "100%"
                }, 10, function(){
                    $(this).prev(".accordion-tab").find("[data-toggle]").removeAttr("style");
                });
            },
            function() {
                $(this).prev(".accordion-tab").find("[data-toggle]").removeAttr("style");
                $(this).animate({
                    height: "auto"
                }, 10, function() {
                    if ($tabPanel.is("#accessories") || $tabPanel.is("#features") && $tabPanel.data("already") !== true) {
                        $tabPanel.find('.accordion-content .carousel, .accordion-content .ex-carousel').slick('setPosition');
                        if( $tabPanel.find('.accordion-content .interaction-module .module-carousel').length ){
                            $tabPanel.find('.accordion-content .interaction-module .module-carousel').slick('setPosition');
                        }
                        $tabPanel.data({
                            already: true
                        })
                    }
                    if( $tabPanel.is("#accessories") || $tabPanel.is("#features") ){
                        if( $tabPanel.find('.m34.interaction-module').length ){
                            $tabPanel.find('.m34.interaction-module').trigger('forceUpdate');
                        }
                    }
                })
            }
        );

        self._active = $tab[0];

        return self;
    };

    proto._change = function(idx) {
        var self = this,
            activeClass = 'active',
            $tab,
            $tabPanel;

        self.beforeChange();

        // get reference to the tab and panel we want to make active
        $tab = $(self.$tabs[idx]);
        $tabPanel = $(self.$tabPanels[idx]);

        // make current active tab and panel not active
        self.$tabs.removeClass(activeClass);
        self.$tabPanels.removeClass(activeClass);
        // make new tab and panel active
        $tab.addClass(activeClass);
        $tabPanel.addClass(activeClass);

        // update the active tab index
        self._active = $tab[0];
        return self;
    };


    // When the user scrolls, check if the new position should cause a state change.
    proto._onScroll = function() {
        var self = this;
        var activeTab = false;

        if (!self._scrollFlag) {
            return;
        }

        self.$tabPanels.each(function(n, e) {
            var $this = $(this);
            var scrollTop = $document.scrollTop() + $appHeader.height() + self.$tabsNav.height();
            var navHeight = self.$TabWrap.outerHeight() + self.$StickWrap.outerHeight() ;

            var panelTop = $this.offset().top;
            var target = $this.attr('data-id');

            var tab = self.$tabsNav.find('a[href="#' + target + '"]').parent();
            if (tab.length > 0 && scrollTop > panelTop) {
                activeTab = tab;
            }

        });

        if (activeTab) {
            if (activeTab.index() != $('.tabs-nav li.active').index()) {
                self.$tabs.removeClass('active');
                if (activeTab !== false) {
                    activeTab.addClass('active');
                }
            }
        } else {
            if ($('.tabs-nav li.active').is('li')) self.$tabs.removeClass('active');
        }

    };


    /**
     * Initializes the cached active index. If no items are active sets the
     * first item active.
     * @memberof! module:ic/ui/tabs#
     * @private
     * @return {void}
     */
    proto._initActiveMobileItem = function() {
        var self = this,
            $active = self.$tabPanels.parent().find('.tabs-panel.active');

        if(self.$tabPanels.find(".sub-menu-mobile").length>0){
            $("#features .accordion-content").css("min-height","auto")
        }

        if ($active.length === 0) {

            self.$tabPanels.find('.accordion-content').hide();

            if ($('html').attr('data-product-id').length != 0) {
                var _hashCheck = window.location.href;
                var _reHref = _hashCheck.split('#');
                var y;
                var x;
                var _reHref2 = _hashCheck.split('/');
                var _reHrefHypen = _hashCheck.split('-');
                _reHrefHypen.reverse();
                _reHref2.reverse();
                var _reHref3 = _reHref2[0];
                if (_reHref[1] == undefined && _reHref3 != 'reviews' && _reHrefHypen[0] != 'reviews') {
                     if(self.$tabPanels.find(".sub-menu-mobile").length>0){
                        self.setMobileActive(0);
                     }
                } else {
                    if (_reHref[1] == 'reviews' || _reHref[1] == '/reviews' || _reHref3 == 'reviews' || _reHrefHypen[0] == 'reviews') {
                        $('.tabs-panels > div').each(function() {
                            x = $(this).attr('data-id');
                            if (x == 'ratings-reviews') {
                                y = $(this).index();
                                self.setMobileActive(y);
                            }
                        });
                        setTimeout(function() {
                            $('html, body').scrollTop(($('.tabs-panels > div').eq(y).offset().top) + 22)
                        }, 50);
                    }
                }
            }
        }
    };

    proto._initActiveItem = function() {
        var self = this,
            $active = self.$tabs.find('.active');

        if ($active.length === 0) {
            self._onScroll();
            if ($('html').attr('data-product-id').length != 0) {

                var _hashCheck = window.location.href;
                var _reHref = _hashCheck.split('#');
                var _reHref2 = _hashCheck.split('/');
                var _reHrefHypen = _hashCheck.split('-');
                _reHrefHypen.reverse();
                _reHref2.reverse();
                var _reHref3 = _reHref2[0];
                if (_reHref[1] == 'reviews' || _reHref[1] == '/reviews' || _reHref3 == 'reviews' || _reHrefHypen[0] == 'reviews') {
                    $(".tabs-panels img.lazy").trigger("tab-trigger");
                    setTimeout(function() {
                        var y;
                        $('.tabs-nav li').each(function() {
                            var x = $(this).find('a').attr('href').split('#');
                            if (x[1] == 'ratings-reviews') {
                                y = $(this).index();
                            }
                        });
                        $('.tabs-nav li').eq(y).find('a').trigger('click');
                    }, 400);
                } else {

                }
            }
        }
    };

    proto.beforeChange = function() {
        var self = this;
        self.emit('beforechange', self._active);
    };

    proto.afterChange = function() {
        var self = this;

        self.emit('afterchange', self._active);
    };

    proto._controlSpec = function(a) {
        $(".tech_spec_wrap.spec_toggle").find(".specToggle").click(function(){
            setTimeout(function() {
                if($(".tech_spec_wrap.spec_toggle:not('.center')").find(".specToggle.on").length===0){
                    $(".tech_spec_wrap .all-view").show();
                    $(".tech_spec_wrap .all-close").hide();
                }else if($(".tech_spec_wrap.spec_toggle:not('.center')").find(".specToggle.on").length ==$(".tech_spec_wrap.spec_toggle:not('.center')").find(".specToggle").length ){
                    $(".tech_spec_wrap .all-view").hide();
                    $(".tech_spec_wrap .all-close").show();
                }
            },100);
        })
        $(".tech_spec_wrap .all-view").click(function(e){
            e.preventDefault();
            $(".tech_spec_wrap.spec_toggle").each(function(){
                if(!$(this).find(".specToggle").hasClass("on")){
                    $(this).find(".specToggle").click();
                }
            })
            $(this).hide();
            $(".tech_spec_wrap .all-close").show();
        });

        $(".tech_spec_wrap .all-close").click(function(e){
            e.preventDefault();
            $(".tech_spec_wrap.spec_toggle").each(function(){
                if($(this).find(".specToggle").hasClass("on")){
                    $(this).find(".specToggle").click();
                }
            })
            $(this).hide();
            $(".tech_spec_wrap .all-view").show();
        })
        
    }

    proto._supportLiheight = function(a) {
        var liHeight=0;
        a.find("li").each(function(){
            if(liHeight<$(this).outerHeight())
                liHeight=$(this).outerHeight();
        })
        a.find("li").css("height",liHeight);
    }

    plugin('pdpTabs', AccordionTabs, '.pdp-tabs');


    return AccordionTabs;
});
