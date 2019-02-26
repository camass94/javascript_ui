/**
 * Represents a panel of tabbed content.
 * @module ic/ui/tabs
 * @requires ic
 * @requires ic/ui/module
 */
define(['ic/ic', 'ic/ui/module', 'global-config'], function(ic, Module, config) {

    'use strict';

    var events = ic.events,
        proto;

    var Tabpanel = function(el, options) {
        var self = this;

        Tabpanel.superclass.constructor.call(self, el, options);

        self.$elem = $(el);
        self.$tabs = $(self.options.tabMenu);
        self.$tabPanels = $(self.options.tabTargetParent);
        self.$tabTargetElement = self.options.tabTargetElement;
        self.$tabsChild = self.$tabs.children();
        self.$tabPanelsChild = self.$tabPanels.children();
        self.$activeClass = self.options.tabActiveClass;
        self.$tabsAjax = [];
        self.$tabSelect = $(self.options.tabSelect);
        self.$tabKeyword = $(self.options.tabKeyword);

        // additiona l initialization
        self._onload();

        // Event Handlers
        self.$tabs.on(events.CLICK_EVENT, self.options.tabToggleSelector, $.proxy(self._handleEvent, self));
        self.$tabPanels.on(events.CLICK_EVENT, self.options.tabPaginationClass, $.proxy(self._handleEvent, self));
        self.$tabSelect.off("change.tab").on("change.tab", $.proxy(self.sortByChange, self));
    };

    ic.util.inherits(Tabpanel, Module);

    proto = Tabpanel.prototype;

    proto._defaults = {
        tabTargetParent: null,
        tabTargetElement: null,
        tabMenu: null,
        tabChange: true,
        tabShow: true,
        tabActiveClass: "active",
        tabPaginationClass: ".pagination a",
        tabToggleSelector: "a[data-tab]",
        productElement: ".search-prodcut-info",
        tabType: '',
        tabSelect: "[data-tab-select-url]",
        tabKeyword: null
    };

    proto._onload = function() {
        var self = this,
            idx = 0;

        if (self.$tabPanelsChild.length && self.$tabPanelsChild.length >= 1 && self.options.tabChange) {

            $.each(self.$tabsChild, function() {
                if ($(this).hasClass(self.$activeClass)) {
                    idx = $(this).index();
                }
            })

            self._change(idx);
            if (!config.isMobile) self.productDetail();

        }
    };

    proto._handleEvent = function(e) {
        var self = this,
            // idx = $(e.currentTarget).parent().index();
            tab = $(e.currentTarget).data("tab"),
            idx = $("[data-tab='" + tab + "']", self.$tabs).parent().index(),
            url = $(e.currentTarget).data("href") || $(e.currentTarget).attr("href"),
            target = $('#' + tab, self.$tabPanels),
            offsetTop = target.prev(".sorting-area").length ? target.prev(".sorting-area").offset().top : target.offset().top;

        if ($(e.currentTarget).is(self.options.tabPaginationClass)) {
            self._ajaxLoad(tab, url, function() {
                //$(self.options.tabPaginationClass, target).eq(0).focus();
                $('html, body').stop(true).animate({
                    scrollTop: offsetTop
                });
            });

        } else {
            self.options.tabShow = true;
            if (!$(e.currentTarget).parent().hasClass(self.options.tabActiveClass)) {
                self.$tabsChild.removeClass(self.$activeClass).eq(idx).addClass(self.$activeClass);
                if (url != "#") self._ajaxLoad(tab, url);
                self._change(idx);
            }
        }

        self.$elem.attr('data-active-tab', tab).data('activeTab', tab);
        //e.stopPropagation();
        e.preventDefault();
    }

    proto._change = function(idx, func) {

        var self = this;

        if (self.$tabTargetElement == null) {
            if (self.options.tabChange) self.$tabPanelsChild.hide();
            if (self.options.tabShow) self.$tabPanelsChild.eq(idx).show();
            self.$elem.trigger('tab:change');
        } else {
            self.$tabPanelsChild.eq(idx).find(self.$tabTargetElement).show()
        	/* LGECS-944 20161222 modify */
            if (lgFilter.locale == "/cn" && self.$el.hasClass("cn-repair")) {
                self.$tabPanelsChild.eq(idx).find(self.$tabTargetElement).find("input").removeAttr("disabled");
                self.$tabPanelsChild.eq(idx).siblings().find(self.$tabTargetElement).find("input").attr("disabled", "disabled");
            }
            /* //LGECS-944 20161222 modify */
            self.$tabPanelsChild.eq(idx).siblings().find(self.$tabTargetElement).hide()
            self.$elem.trigger('tab:change');
        }

    };

    if (!Array.indexOf) {
        Array.prototype.indexOf = function(obj) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == obj) {
                    return i;
                }
            }
            return -1;
        }
    }

    proto._ajaxLoad = function(tab, url, completeFunc) {
        var self = this,
            ajaxTarget = self.options.ajaxTarget;

        // Only One Check!
        if (self.$tabsAjax.length == 0) {
            if (self.$tabs.find('a').length > 0) {
                $.each(self.$tabs.find('a'), function() {
                    var thisUrl = $(this).data('href');
                    if (thisUrl != "" && thisUrl != "#") {
                        self.$tabsAjax.push($(this).data('tab'));
                    }
                });
            } else {
                self.$tabsAjax.push(tab)
            }
        }

        if (self.$tabsAjax.indexOf(tab) > -1) {

            var $target = $('#' + tab, self.$tabPanels);
            //if (self.get && self.readyState != 4) self.get.abort();
            self.get = $.get(url).done(function(contents) {
                $target.html(contents);
                $target.find("img.lazy").lazyload();
                
                /* PJTEUGDPR-1 20180122 add */
                if (self.$el.find(".validateForm").hasClass("delete-history")) {
                    self.$tabPanelsChild.find("input").iCheck({
                        checkboxClass: "styled-checkbox",
                        radioClass: "styled-radio",
                        increaseArea: "0%"
                    })
                }
                /*//PJTEUGDPR-1 20180122 add */

                if ($target.find('.selectbox').length > 0) $('.selectbox').chosen();
                $("a[data-tab='" + tab + "'] span.cnt", self.$tabs).text($target.find(".pagination .total").text() || $target.find(".pagination").data("total") || 0)

                if ($target.find(".scrollbar-outer").length > 0) $target.find(".scrollbar-outer").scrollbar();

                if (completeFunc) completeFunc()
                
                /* LGEAE-1367 20170828 add */                
                if(tab == 'videoTutorials'){
                	if (config.isMobile) {                	
                    	$('.slide-list').slick({		  
                    	  dots: true,
                    	  speed: 300,
                    	  slidesToShow: 1,
                    	  slidesToScroll: 1,
                		  touchMove : true
                		});                    
                    }else{
                    	$('.slide-list').slick({		  
                		  dots: false,
                		  infinite: false,
                		  speed: 300,
                		  slidesToShow: 4,
                		  slidesToScroll: 1,
                		  centerMode: false,
                		  variableWidth: false,
                		  vertical: true,
                		  arrows: true
                		});
                    }
                }                
                /* LGEAE-1367 20170828 add */

            }).fail(function(xhr, textStatus) {
                modalAlert(textStatus)
            });

        } else {
            return self;
        }

    }

    proto.productDetail = function() {
        var self = this;
        self.$tabPanels.off("click", ".product-model-list a");
        self.$tabPanels.on("click", ".product-model-list a", function(e) {
            e.preventDefault();
            var $this = $(this);
            var $target = $this.closest(".product-model-list").next(".product-model-info")
            var _url = $this.data("href")
            $this.parent().addClass("active").siblings("li").removeClass("active");
            $.get(_url).done(function(contents) {
                $target.html(contents);
                $target.find("img.lazy").lazyload();
            })
        })
    }

    proto.sortByChange = function(e) {
        e.preventDefault();
        var self = this;
        self._ajaxLoad(self.$elem.data('activeTab'), self.$tabSelect.data("tabSelectUrl") + ((self.$tabSelect.data("tabSelectUrl").indexOf("?") > 0 ? "&" : "?") + $("form", self.$elem).serialize()))
        if (self.$tabSelect.data("searchKeyword")) self.$tabKeyword.val($("form", self.$elem)[0][self.$tabSelect.data("searchKeyword")].value)
    }

    // even constants
    var EVENT = {
        'TAB_CHANGE': 'tab:change'
    };

    ic.jquery.plugin('tabpanel', Tabpanel, '[data-tab-target-parent]');

    return Tabpanel;

});
