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
        self.$tabAnchors = self.$('a.tab-anchor'); // = self.$('.accordion-tab'); // this anchor wrapper div is being removed.
        self.$tabsNav = self.$('.tabs-nav');
        self.$tabs = self.$tabsNav.find('li');
        self.$tabInAnchors = self.$tabsNav.find('li > a');
        /**
         * Holds the index of the active item.
         * @type {Number}
         * @default  0
         */
        self._active = 0;
        self._scrollFlag = true;

        self.$tabs.last().find('a span').css('border-right', 'none');

        // Event Handlers
        self.$el.on(events.CLICK_EVENT, '[data-toggle="tab"]', $.proxy(self._onTabClick, self)); /* Desktop Only */
        self.$el.on(events.CLICK_EVENT, '[data-toggle="accordion-tab"]', $.proxy(self._onAccordionClick, self)); /* accordion-tab Only */
        self.$el.on(events.CLICK_EVENT, 'a.tab-anchor', $.proxy(self._onAnchorClick, self));
        //window.addEventListener('resize', debounce($.proxy(self._setAnchorPositions, self), 250, false));
        if (window.addEventListener) {
            window.addEventListener('resize', debounce($.proxy(self._setAnchorPositions, self), 250, false));
        } else {
            window.attachEvent('onresize', debounce($.proxy(self._setAnchorPositions, self), 250, false));
        }
        // if ($wrapper.length > 0) {
        // $document.scroll(self._scrollHandler);
        $document.scroll(debounce($.proxy(self._onScroll, self), 10, false));
        // }


        // additional initialization
        if ($('body').hasClass('is-mobile')) {
            setTimeout($.proxy(self._initActiveMobileItem, self), 100);
        } else {
            self._initActiveItem();

            //console.log("$(\".tabs-panels img.lazy\").length::"+$(".tabs-panels img.lazy").length);
            //console.log("$(\"#features,#tech-specs,#ratings-reviews\").find(\"img.lazy\").length::"+$("#features,#tech-specs,#ratings-reviews").find("img.lazy").length);

            $(".tabs-panels img.lazy").lazyload({
                appear: function(e) {
                    $(this).attr('style', '').removeClass('lazy');
                },
                event: "tab-trigger"
            })
        }

        // create anchor positions
        setTimeout($.proxy(self._setAnchorPositions, self), 100);

        // initialize positioning of tabs
        self._fixTabsNav();
        if (oldIE) {
            setInterval($.proxy(self._fixTabsNav, self), 120);
        }
        /*PJTHEMC-9 add*/
        self.$tabPanels.find("a.open-feature").on(events.CLICK_EVENT, $.proxy(self._openFeature, self)).find("span").text(commonMsg.common.open);
		/*//PJTHEMC-9 add*/

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
        //console.log('_onTabClick', href, $anchor);

        // if (typeof(href) !== 'undefined' && href.substr(0, 1) === '#') { // if anchor
        // if ($href.length > 0) { // if anchor exists on page
        //     var position = $href.offset().top - $appHeader.height() - self.$tabsNav.height();

        //     // prevent scroll updates while animating
        //     self._scrollFlag = false;

        //     $('html, body').animate({
        //         scrollTop: position + 1
        //     }, 'fast', function() {
        //         // add back scroll updates
        //         self._scrollFlag = true;
        //     });
        // }
        // }
        //self._clickHandler(e);

        if ($(".tabs-panels").data("onLoad") === true) {
            //console.log("$(\".tabs-panels\").data(\"onLoad\")")
            self._beforeGotoAnchor($anchor);
        } else {
            //2016-01-21 제외
            $(".tabs-panels img.lazy").trigger("tab-trigger");
            //$(".tabs-panels").append("<div class='wrap_loading'><img src='/lg4-common-gp/img/ajax-loader.gif' alt=''></div>");

            if(ie.interV){
                clearInterval(ie.interV);
            }

            if (!oldIE) {
                ie.anchor = $anchor;
                ie.interV = setInterval($.proxy(self._checkLoadedImage, self), 50);
                /*$(".tabs-panels img").on({
                    load: function(e) {
                        if (self._checkLoadedImage() === true) {
                            //self._beforeGotoAnchor($anchor);
                            setTimeout(function(){self._beforeGotoAnchor($anchor)}, 500);
                        }
                    }
                });
                console.log("!oldIE");
                setTimeout(function(){self._beforeGotoAnchor($anchor)}, 500);*/
            } else {
                ie.anchor = $anchor;
                ie.interV = setInterval($.proxy(self._checkLoadedImage, self), 50);
            }
        }
        self._clickHandler(e);
    };

    proto._checkLoadedImage = function() {
        var self = this;
        //console.log("img.lazy.length::"+self._imgObj.length);
        
        if(self._imgObj.length){
            for(var i=0; i<self._imgObj.length; i++){
                /* LGEAU-2419 : 20171011 modify */
                if($(self._imgObj[i]).height() > 1 || $(self._imgObj[i]).height() == 0 || $(self._imgObj[i]).height() == 1){
                    self._imgObj.splice(i, 1);
                    i--;
                }
                /*//LGEAU-2419 : 20171011 modify */
                //console.log("$(self._imgObj["+i+"]).height()::"+$(self._imgObj[i]).height());
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
	/*PJTHEMC-9 add*/
    proto._openFeature = function(e) {
        var self = this;
        $(e.currentTarget).addClass("hide");
        var pModule = $(e.currentTarget).parent();
        var pModuleId = pModule.data("featureId");
        var navHeight = $('.stickynav').outerHeight() + $('.tabs-nav-wrapper').outerHeight();
        if ($('body').hasClass('is-mobile')) {
        	navHeight=$("#features .accordion-tab a").outerHeight();
        }
        /* LGEGMO-3176, LGEGMO-3331 : 20170706 modify */
    	var modelName= $('#ProductHero').find(".product-zoom").attr("adobe-pdp-model");
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
		/*PJTHEMC-9 add*/

    proto._onAccordionClick = function(e) {
        var self = this;
        var href = $(e.currentTarget).attr('href') ? $(e.currentTarget).attr('href') : $(e.currentTarget).find('a').attr('href');
        var $anchor = $(href)[0];
        e.preventDefault();
        self._clickMobileHandler(e);
    }

    proto._onAnchorClick = function(e) {
        var self = this;
        var id = $(e.currentTarget).attr('id');
        var $anchor = $('#' + id);

        // if (self.$tabAnchors[idx].hasClass('active')) {
        //     //remove active class.
        //     return;
        // }
        self._beforeGotoAnchor($anchor);
        self._clickHandler(e);
    };

    proto._clickMobileHandler = function(e) {
        var self = this,
            idx = self.$tabPanels.index($(e.currentTarget).parents(".tabs-panel")[0]);
        if (idx === -1) {
            idx = self.$tabAnchors.index($(e.currentTarget));
        }

        //console.log('click handler:', idx, e.currentTarget);
        //self.setMobileActive(idx);
        self._mobileChange(idx);
        e.preventDefault();
    };
    proto._clickHandler = function(e) {
        var self = this,
            idx = self.$tabs.index($(e.currentTarget).parent()[0]);

        if (idx === -1) {
            idx = self.$tabAnchors.index($(e.currentTarget));
        }

        //console.log('click handler:', idx, e.currentTarget);
        self.setActive(idx);
        e.preventDefault();
    };

    proto._beforeGotoAnchor = function($anchor) { // 여러번 실행됨... ㅠㅠ
        var position,
            self = this,
            _headerHeight = $('.app-tabs').offset().top,
            chkt = $(window).scrollTop(),
            navHeight = $('.stickynav').outerHeight() + $('.tabs-nav-wrapper').outerHeight();
        $anchor = $($anchor);
        if (chkt < _headerHeight) {
            if ($anchor.index() === 0) {
                _headerHeight = _headerHeight + 10
                $('body, html').stop().animate({
                    scrollTop: _headerHeight
                }, 'fast');
                return;
            }else{
                position = $anchor.offset().top - navHeight + 10;
                return self._GotoAnchor(position);
                /*$('body, html').stop().animate({
                    scrollTop: _headerHeight + 1
                }, 'fast',function(){
                    position = $anchor.offsetTop;
                    //console.log(position)

                    //$(window).scrollTop(_headerHeight);
                    if ($('html').hasClass('lt-ie9')) {
                        position = $anchor.offset().top - navHeight;
                    } else {
                        position = $anchor.offset().top - navHeight + 10;
                    }
                    return self._GotoAnchor(position);
                });*/
            }
            //
        } else {
            if ($('html').hasClass('lt-ie9')) {
                if ($anchor.index() == 0) {
                    position = $anchor.offset().top - navHeight + 15;
                } else {
                    position = $anchor.offset().top - navHeight;
                }
            } else {
                position = $anchor.offset().top - navHeight + 10;

            }

            return self._GotoAnchor(position);
        }
    };

    proto._GotoAnchor = function($top) {
        $('body, html').stop().animate({
            scrollTop: $top
        }, '500', function() {
            //
            //console.log("_GotoAnchor.animate.complete / $top::"+$top+"   $('body, html').scrollTop::"+$('body').scrollTop());
            //$('body, html').stop().scrollTop($top);
            //console.log("$('body, html').scrollTop::"+$('body').scrollTop());
        });
        //$('body, html').stop().scrollTop($top);
    }

    /**
     * Set the active tab, anchor, and panel.
     * @memberof! module:ic/ui/app-tabs#
     * @param {int} idx The index of the tab you want active.
     * @return {AccordionTabs} `this` object instance.
     */
    proto.setActive = function(idx) {
        var self = this;
        //console.log($(self._active).index()+"==="+idx);
        // if the item clicked is already active then do nothing
        if ($(self._active).index() === idx) {
            //console.log('setActive', 'this tab is already active. no change.', self._active, idx);
            return self;
        }

        // this will return `self`
        //console.log('setActive', 'this tab is not active. change.', self._active, idx);
        return self._change(idx);
    };

    proto.setMobileActive = function(idx) {
        var self = this;
        if ($(self._active).index() === idx)
        if (self.$tabPanels.index($('active')[0])===idx) {
            //console.log('setActive', 'this tab is already active. no change.', self._active, idx);
            return self;
        }

        // this will return `self`
        //console.log('setActive', 'this tab is not active. change.', self._active, idx);
        return self._mobileChange(idx);
    }

    /**
     * Change the active tab, anchor, and panel.
     * @memberof! module:ic/ui/app-tabs#
     * @private
     * @param  {int} idx The index of the item to set active.
     * @return {AccordionTabs} `this` object instance.
     */
    proto._mobileChange = function(idx) {
        var self = this,
            activeClass = 'active',
            $tab,
            $anchor,
            $tabPanel;

        //self.beforeChange();

        // get reference to the tab and panel we want to make active
        $tab = $(self.$tabs[idx]);
        $anchor = $(self.$tabAnchors[idx]);
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
                        //$tabPanel.find('.slick-dots button').click();
                        $tabPanel.find('.accordion-content .carousel, .accordion-content .ex-carousel').slick('setPosition');
                        /* LGEGMO-2230 ADD */
                        if( $tabPanel.find('.accordion-content .interaction-module .module-carousel').length ){
                            $tabPanel.find('.accordion-content .interaction-module .module-carousel').slick('setPosition');
                        }
                        /* //LGEGMO-2230 ADD */
                        $tabPanel.data({
                            already: true
                        })
                    }
                    /* LGEGMO-2281 ADD */
                    if( $tabPanel.is("#accessories") || $tabPanel.is("#features") ){
                        if( $tabPanel.find('.m34.interaction-module').length ){
                            $tabPanel.find('.m34.interaction-module').trigger('forceUpdate');
                        }
                    }
                    /* //LGEGMO-2281 ADD */
                })
            });

//2016-01-22 삭제
//        $tabPanel.on("click", function() {
//            if ($(this).hasClass(activeClass)) {
//                $(window).scrollTop($(this).offset().top);
//            }
//        })


        // update the active tab index
        // console.log('change', idx, self.$tabs[idx], $tab, $tab[0]);
        self._active = $tab[0]; //self._active = $anchor[0];

        //self.afterChange();

        return self;
    };
    proto._change = function(idx) {
        var self = this,
            activeClass = 'active',
            $tab,
            $anchor,
            $tabPanel;

        self.beforeChange();

        // get reference to the tab and panel we want to make active
        $tab = $(self.$tabs[idx]);
        $anchor = $(self.$tabAnchors[idx]);
        $tabPanel = $(self.$tabPanels[idx]);

        // make current active tab and panel not active
        self.$tabs.removeClass(activeClass);
        self.$tabAnchors.removeClass(activeClass);
        self.$tabPanels.removeClass(activeClass);

        // make new tab and panel active
        $tab.addClass(activeClass);
        $anchor.addClass(activeClass);
        $tabPanel.addClass(activeClass);

        // update the active tab index
        // console.log('change', idx, self.$tabs[idx], $tab, $tab[0]);
        self._active = $tab[0]; //self._active = $anchor[0];

        //self.afterChange();

        return self;
    };



    // fixes the position of the desktop tabs when scrolling within the tab group.
    proto._fixTabsNav = function() {
        /*
        var self = this;
        return debounce(function(e) {
            var scrollTop = $document.scrollTop() + $appHeader.height();
            var tabsBottom = self.$wrapper.offset().top + $appHeader.height() + self._getPanelsHeight() - self.$tabsNav.height();

            self.$tabsNav.toggleClass('fixed-top', self.$wrapper.offset().top < scrollTop && tabsBottom > scrollTop);

            if (self.$tabsNav.hasClass('fixed-top')) {
                self.$tabsNav.css({
                    'min-height': self.$tabsNav.height() + 'px',
                    //'top': $appHeader.height() + 'px'
                    'top': $('.stickynav').outerHeight() + 'px'
                });
            }
        }, 25)();
        */
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
            var scrollTop = $document.scrollTop() + $appHeader.height() + self.$tabsNav.height(); // + ($window.height() / 2);
            var navHeight = $('.stickynav').outerHeight() + 10;
            var panelTop = $this.offset().top - navHeight;
            // console.log('panel top offset', scrollTop, panelTop, self.$tabsNav.height());
            var target = $this.attr('data-id');
            var tab = self.$tabsNav.find('a[href="#' + target + '"]').parent();
            // console.log('panel active?', tab.length, scrollTop > panelTop);
            if (tab.length > 0 && scrollTop > panelTop) {
                activeTab = tab;
            }
        });

        if (activeTab) {
            // console.log(activeTab.index() +'/'+ $('.tabs-nav li.active').index());
            if (activeTab.index() != $('.tabs-nav li.active').index()) {
                self.$tabs.removeClass('active');
                if (activeTab !== false) {
                    activeTab.addClass('active');
                }
            }
        } else {
            if ($('.tabs-nav li.active').is('li')) self.$tabs.removeClass('active');
        }
        self._fixTabsNav();
    };

    // Determines position of the tab panels. Used to trigger onScroll.
    proto._setAnchorPositions = function() {
        var self = this;
        var $anchors = self.$tabAnchors;
        //var h = $appHeader.height();
        var h = $('.stickynav').outerHeight();
        $anchors.css('top', '-' + h + 'px');
    };

    proto._getPanelsHeight = function() {
        var self = this;
        var h = 0; // height;
        self.$tabAnchors.each(function() {
            h += $(this).outerHeight(true);
        });
        self.$tabPanels.each(function() {
            h += $(this).outerHeight(true);
        })
        return h;
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
            $active = self.$tabPanels.parent().find('.tabs-panel.active'); /* PJTPDP-11 modify */
        // if no items active then set the first item active
    	/*PJTHEMC-9 add*/
        if(self.$tabPanels.find(".sub-menu-mobile").length>0){
        	$("#features .accordion-content").css("min-height","auto")
        }
		/*PJTHEMC-9 add*/
        if ($active.length === 0) {
            //self.$tabPanels.find(".accordion-content").hide();
            self.$tabPanels.find('.accordion-content').hide();


            /* */
            /* ActiveMobileItem 2015-06-16 */
            /* */
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
                    //self.setMobileActive(0);
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
            // set active to 0 because it's the first index
            //self._active = 0;
        }
        //self._active = $active[0]; // set the index of the active item
    };
    proto._initActiveItem = function() {
        var self = this,
            $active = self.$tabs.find('.active');
        // if no items active then set the first item active
        if ($active.length === 0) {
            self.setActive(0);
            // set active to 0 because it's the first index
            //self._active = 0;

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
                        //console.log("index::"+y);
                    }, 400);
                } else {
                    /*
                    setTimeout(function() {
                        if (ie.interV) {
                            clearInterval(ie.interV);
                        }
                        self._GotoAnchor(0);
                    }, 1000);*/
                }
            }
        }
        //self._active = $active[0]; // set the index of the active item
    };
    /**
     * Gets called before a tab changes to active.
     * @memberof! module:ic/ui/tabs#
     * @return {void}
     */
    proto.beforeChange = function() {
        var self = this;
        self.emit('beforechange', self._active);
    };
    /**
     * Gets called after a tab has changed to active.
     * @memberof! module:ic/ui/tabs#
     * @return {void}
     */
    proto.afterChange = function() {
        var self = this;

        self.emit('afterchange', self._active);
    };

    /**
     * Returns the active index. If no items are active sets the first item active.
     * @memberof! module:ic/ui/tabs#
     * @return {int} The index of the active item.
     */
    proto.getActiveIndex = function() {
        var self = this,
            $active = self.$tabs.find('.active');
        // if no items active then set the first item active
        if ($active.length === 0) {
            self.setActive(0);
            // return 0 because it's the first index
            return 0;
        }
        return $active[0]; // return the index of the active item
    };

    proto.testFunc = function() {
        alert("testFunc");
    }

    plugin('appTabs', AccordionTabs, '.app-tabs');



    return AccordionTabs;
});
