/**
 * The app header module.
 * @module common/app-header
 * @requires ic/ic
 * @requires ic/ui/module
 */
define(['ic/ic', 'ic/ui/module'], function(ic, Module) {

    'use strict';

    var proto,
        events = ic.events,
        $window = ic.dom.$window;

    var AppHeaderMobile = function(el, options) {
        var self = this;
        // Call the parent constructor
        AppHeaderMobile.superclass.constructor.call(self, el, options);

        //Mobile Nav Items
        self.$primaryMobileNavLinks = self.$('.primary-nav-link');
        self.$mobileFlyoutNav = $('#mobileFlyoutNav').css('min-width', $window.innerWidth() - 50);;
        self.$backToMainMenuLink = $('.main-menu-link').on('click', $.proxy(_backToMainMenu, self));
        self.$mobilePrimaryNavLink = $('.nav-section-link').not('.main-menu-link').on('click', $.proxy(_mobilePrimaryNavHandler, self));
        self.$navSubListItem = $('.nav-sub-list-item');

        self._init();
    };

    // Inherit from Module
    ic.util.inherits(AppHeaderMobile, Module);

    // Alias the prototype for less typing and better minification
    proto = AppHeaderMobile.prototype;

    proto._defaults = {
        //active class
        ac: 'active'
    };

    proto._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self),
            w_height = parseInt($(window).height()),
            cookieHeight = 0;

        self.$backToMainMenuLink.parent().addClass('hide');
        
        /* LGEDE-2193 20180220 add */
        $(".nav-section-link").each(function() {
            var href = $(this).attr('href')
            if(href != '#') {
                $(this).attr({
                    'data-link': href,
                    'href': ($(this).siblings('.nav-sub-list').size()>0)?'#':href
                });
            }
        })
        /*//LGEDE-2193 20180220 add */

        //open and close the mobile nav
        $('.mobile-nav-hamburger, .mobile-flyout-header .hamburger').on('click', function(e) {
            self.$primaryMobileNavLinks.find('.icon-search').removeClass('hide').end().find('.icon-close').addClass('hide');
            self.$mobileFlyoutNav.toggleClass(self.options.ac);
            $('.search-takeover').removeClass('active');

            if ($(this).hasClass('mobile-nav-hamburger')) {
                naviSetting();
            } else {
                $('html').css('overflow', 'auto').css('position', 'static').css('width', 'auto');
            }

        });

        var cachedWidth = $(window).width();
        $(window).bind('resize', function () {
            var newWidth = $(window).width();
            if ($("#mobileFlyoutNav").hasClass("active") && cachedWidth != newWidth) {
                cachedWidth = newWidth;
                naviSetting();
            }
        })

        function naviSetting() {
            var w_height = $(window).height();
            var v_heightF = w_height - 55;

            if ($('.agree-cookie-wrap').length) {
                var cookieHeight = $('.agree-cookie-wrap').outerHeight(true);
                v_heightF = v_heightF - cookieHeight;

                $('#mobileFlyoutNav').css("top", cookieHeight);
            }

            if($(".eprivacy-cookie").length) {
                var cookieHeight = $('.eprivacy-cookie').outerHeight(true);
                v_heightF = v_heightF - cookieHeight;
                $('#mobileFlyoutNav').css("top", cookieHeight);
            }

            $('.mobile-flyout-body-wrapper').css('height', v_heightF).css('position', 'absolute').css('right', '0').css('width', '85%'); //.css('-webkt-overflow-scrolling','touch');
            $('html').css('overflow', 'hidden').css('position', 'fixed').css('width', '100%');
            $('#mobileFlyoutNav').css('overflow', 'auto');
        }

        $(document).on("click", ".agree-cookie-close", function(e){
            if ($("#mobileFlyoutNav").hasClass("active")) {
                naviSetting();
            }
        });

        $(document).on("click", ".cookies-close-btn", function(e){
            if ($("#mobileFlyoutNav").hasClass("active")) {
                setTimeout(function(){
                    naviSetting();
                },10);
            }
        });

        $('.nav-sub-list-item').on('click', function(e) {
            var $target = $(e.currentTarget);
           
            if ($target.attr('target') == '_blank') return;
            if ($target.data('sc-item') == 'sub-category-link') return false;
            $('.nav-sub-list-item').not($target).addClass('hide');
            /* LGEIN-1441 20160719 add*/
            if($target.hasClass("active") && $target.data("link")){
            	location.href=$target.data("link");
            }
	    /* //LGEIN-1441 20160719 add*/
            $target.addClass(self.options.ac).find('.icon-arrow-next').addClass('hide').end().next().toggleClass('hide');
            $target.parent().parent().parent().find('.nav-section-link').removeClass(self.options.ac).end().find(".nav-section-link").addClass("return-state-wrap").find('.icon-gnb-left').removeClass('hide').addClass('return-state');
	    /* LGEIN-1441 20160719 add*/
            if($target.data("link")){
            	$target.css("pointer-events","auto")
            	/* LGEDE-2193 20180220 add */
                if($target.find(".icon-gnb-right").size()<=0) {
                    $target.append('<i class="icon icon-gnb-right"></i>');
                }else {
                    $target.find('.icon-gnb-plus').siblings('.icon-gnb-right').removeClass('hide');
                    $target.next('ul').find('.icon-gnb-plus').siblings('.icon-gnb-right').addClass('hide');
                }
                /* LGEDE-2193 20180220 add */
            }
	    /* //LGEIN-1441 20160719 add*/
        });

        $('.nav-sub-accordion').on('click', function(e) {
            var $tar = $(e.currentTarget);
            if ($tar.next().length == 0) {
                return //no accordion ul present
            }
            if ($tar.find('.icon-gnb-plus').hasClass('hide')) {
                $tar.find('.icon-gnb-plus').removeClass('hide').end().find('.icon-gnb-minus').addClass('hide').end().next().removeClass('active');
            } else {
                $tar.find('.icon-gnb-plus').addClass('hide').end().find('.icon-gnb-minus').removeClass('hide').end().next().addClass('active');
            }
        });

        self.$('.search-menu-btn').on('click', function(e) {
            $('.search-menu').toggleClass('active');
            $(e.currentTarget).find('.icon-search').toggleClass('hide').end().find('.icon-close').toggleClass('hide');
            var n = parseInt($(window).width()) - 96;
            if ($('body').hasClass('is-mobile')) {
                $('.search-takeover').css('width', n);
                $('.appHeader .search-menu .search-box').css('width', '100%');
            }
        });
      
        
        /*LGEGMO-4114 20180525 add*/
        var pathName =location.pathname;
        if($("html").data("pageLabel")=="ProductDetailPage"){
    		pathName = pathName.substring(0,pathName.lastIndexOf("/"))
    	}
        $(".mobile-flyout-body-wrapper").find("a").each(function(e){  
        	var _Href,_Link;
        	if($(this).attr("href").indexOf(location.origin)>=0){
        		_Href = $(this).attr("href").replace(location.origin,"")
        	}else{
        		_Href = $(this).attr("href")
        	}
        	if($(this).data("link")!==undefined && $(this).data("link").indexOf(location.origin)>=0){
        		_Link = $(this).data("link").replace(location.origin,"")
        	}else{
        		_Link = $(this).data("link")
        	}
	   		 if(_Href ==pathName ||_Link == pathName){
	   	   			$(this).addClass("retain");
	   			 if(!$(this).hasClass("nav-section-link")){
	        		$(this).parents(".mobile-nav-section").find(".nav-section-link").click();
	        		if($(this).hasClass("nav-sub-accordion")){
	        			$(this).parents("ul").siblings(".nav-sub-list-item").click(); 
	        		}
	        		if($(this).hasClass("nav-accordion-item")){
					$(this).parents(".nav-sub-list").click(); 
	        			$(this).parents("ul").siblings(".nav-sub-list-item").click();
	        			$(this).parents(".nav-sub-accordion-ul").each(function(){
	        				$(this).siblings(".nav-sub-accordion").click();
	        				$(this).siblings(".nav-accordion-item").click();
	        			})
	        		}
	   			 }
	        		 return false;
	        	}
	   })
        //$(".mobile-flyout-body-wrapper").find(".retain:eq(0)").parents(".mobile-nav-section").find(".nav-section-link").click()
        //$(".mobile-flyout-body-wrapper").find(".nav-sub-accordion.retain:eq(0)").parents("ul").siblings(".nav-sub-list-item").click(); 
        /*//LGEGMO-4114 20180525 add*/
    }

    var _backToMainMenu = function(e) {
        var self = this;
        //Hide the back to main menu button
        $(e.currentTarget).parent().addClass('hide');
        //Restore all primary nav items to default and collapse all nav-sub-lists
        self.$mobilePrimaryNavLink.parent().removeClass(this.options.ac).removeClass('hide');
        self.$mobilePrimaryNavLink.next().removeClass(this.options.ac)
            .end().find('.icon').removeClass('hide');

        self.$mobilePrimaryNavLink.find('.icon-gnb-left').removeClass('return-state').parent().removeClass('return-state-wrap');

        $('.nav-sub-list ul').removeClass(self.options.ac);
        self.$mobilePrimaryNavLink.parent().removeClass(self.options.ac);
        self.$navSubListItem.removeClass(self.options.ac).removeClass('hide').find('.icon').removeClass('hide').end().next().addClass('hide');
        self.$navSubListItem.next('ul').find('.nav-sub-accordion .icon').removeClass('hide').end().next().addClass('hide');
        /* LGEDE-2193 20180220 add */
        self.$navSubListItem.find('.icon-gnb-plus').siblings('.icon-gnb-right').addClass('hide');
        self.$mobilePrimaryNavLink.find('.icon-gnb-plus').siblings('.icon-gnb-right').addClass('hide');
        /* LGEDE-2193 20180220 add */
    }

    var _mobilePrimaryNavHandler = function(e) {
        var self = this,
            $tar = $(e.currentTarget)
        /* LGEIS-2093 20160927 modify*/
        if(($tar.not(".return-state-wrap").parent().hasClass("active") && $tar.data("link"))|| ($tar.hasClass("promotion")&&$tar.data("link"))){
        	location.href=$tar.data("link");
        	return;
        }
        /* //LGEIS-2093 20160927 modify*/
        if ($tar.find('.icon-gnb-left').hasClass('return-state')) {
            //return up one level
            $tar.parent().addClass('active');
            $tar /*.addClass('active')*/ .removeClass("return-state-wrap").find('.icon-gnb-left').removeClass('return-state');
            $tar.next().find('.nav-sub-list-item').removeClass(this.options.ac).removeClass('hide').find('.icon').removeClass('hide').end().next('ul').addClass('hide');
            /* LGEDE-2193 20180220 add */
            if($tar.data("link")) {
                $tar.find('.icon-gnb-plus').siblings('.icon-gnb-right').removeClass('hide');
                $tar.next('ul').find('.icon-gnb-plus').siblings('.icon-gnb-right').addClass('hide');
            }
            /*//LGEDE-2193 20180220 add */
            return;
        }

        self.$mobilePrimaryNavLink.not($tar).parent().addClass('hide');

        $tar.parent().addClass(this.options.ac);
        
        /* LGEGMO-2599 20170120 modify */
        $tar.find('.icon:not(.icon-gnb-signature)').addClass('hide').end().next().addClass(this.options.ac);
        /*// LGEGMO-2599 20170120 modify */
        self.$backToMainMenuLink.parent().removeClass('hide');
        /* LGEDE-2193 20180220 add */
        if($tar.data("link")) {
            if($tar.find(".icon-gnb-right").size()<=0) {
                $tar.append('<i class="icon icon-gnb-right"></i>');
            }else {
                $tar.find('.icon-gnb-plus').siblings('.icon-gnb-right').removeClass('hide');
                $tar.next('ul').find('.icon-gnb-plus').siblings('.icon-gnb-right').addClass('hide');
            }
        }
        /*//LGEDE-2193 20180220 add */
    };

    // Create the jquery plugin and set it to auto-wire to specified selector
    ic.jquery.plugin('appHeaderMobile', AppHeaderMobile, '.appHeader');

    return AppHeaderMobile;
});
