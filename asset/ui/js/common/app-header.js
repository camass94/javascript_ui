/**
 * The app header module.
 * @module common/app-header
 * @requires ic/ic
 * @requires ic/ui/module
 */
define(['jquery', 'ic/ic', 'ic/ui/module'], function($, ic, Module) {

    'use strict';

    var proto,
        events = ic.events,
        $window = ic.dom.$window,
        tabletNav = $('.inner-category ul.primary-nav-list > li.primary-nav-part'),
        lengthTabletNav = tabletNav.length,
        isTabletNav = 0;


    var AppHeader = function(el, options) {
        var self = this;

        // Call the parent constructor
        AppHeader.superclass.constructor.call(self, el, options);

        //Desktop Nav Items
        self.$primaryNavLinks = $('#appHeader .primary-nav-link').data('open', false);
        self.$navLinks = $("#appHeader .primary-nav .primary-nav-list");
        self.$primaryNavSkip = self.$navLinks.find(".skip-button a");
        self.$searchTakeover = self.$('.search-takeover');
        self.$primaryNavSearch = self.$('.primary-nav-search');
        self.$closeNav = self.$('.close-button');
        self.$searchInput = self.$searchTakeover.find('input');
        self.$searchCloseBtn = self.$('.primary-nav-search-close');
        self.currentNavIndex = 0;
        self.$searchSubmitButton = self.$('.search-box button');
        self.$cookieNotice = $('.cookie-notice');
        self.$cookieNoticeButton = $('.cookie-notice-close');
        /*LGEAU-2264 : 20170516 add*/
        self.$primaryNavOpen = $('#appHeader .primary-nav-open');
        /*//LGEAU-2264 : 20170516 add*/
        self._init();
    };

    // Inherit from Module
    ic.util.inherits(AppHeader, Module);

    // Alias the prototype for less typing and better minification
    proto = AppHeader.prototype;

    proto._defaults = {
        //active class
        ac: 'active'
    };

    proto._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self);
        
        /* LGEGMO-3452 20170824 add */
    	//self.$primaryNavLinks.on('click', $.proxy(self._primaryNavFocusHandler, self));
        /* LGERU-2848, LGEAU-2264 : 20170516 modify */ 			
        /*if($("html").data("countrycode") =='ru' || $("html").data("countrycode") =='au'){
        	self.$primaryNavLinks.on('mouseover', $.proxy(self._primaryNavFocusHandler, self));
        	self.$primaryNavOpen.on('mouseover', $.proxy(self._primaryNavFocusHandler, self));
        }*/
        /*//LGERU-2848, LGEAU-2264 : 20170516 modify */
    	self.$primaryNavLinks.on('mouseover', $.proxy(self._primaryNavFocusHandler, self));
    	self.$primaryNavOpen.on('mouseover', $.proxy(self._primaryNavFocusHandler, self));
        self.$primaryNavLinks.on("keydown", function(e){
            if (e.keyCode == "13") {
            	/* LGEPJT-483 modify */
                if (e.currentTarget.target == "_self"){
                    $(e.currentTarget).trigger("click");
                } else {
                    self._primaryNavFocusHandler(e);
                }
                /* //LGEPJT-483 modify */
            }
        });
        self.$primaryNavOpen.on("keydown", function(e){
            if (e.keyCode == "13") {
            	$(this).trigger("click");
            }
        });
        /* //LGEGMO-3452 20170824 add */
        self.$primaryNavSearch.on('click', $.proxy(self._positionSearch, self));
        self.$primaryNavSearch.on('focus', $.proxy(self._primaryNavSearchFocus, self));
		self.$searchInput.on('focus', $.proxy(self._primaryNavInputFocus, self));
		self.$primaryNavSkip.on('click', $.proxy(self._primaryNavSkipAction, self));
        self.$closeNav.on('click', $.proxy(self._primaryNavCloseTrigger, self));
        self.$searchCloseBtn.on('click', $.proxy(self._closeSearch, self));
        self.$searchCloseBtn.on('focus', $.proxy(self._closeSearchFocus, self));
        self.$cookieNoticeButton.on('click', $.proxy(self._cookieClose, self));

        /* Tablet Only */
        // click tablet control button
        $('.tablet-sub-control').attr('data-shift', 0);
        $('.tablet-sub-control a').click(function() {
            var p = $(this).parent();
			var activeLi = $('.inner-category ul.primary-nav-list > li.primary-nav-part.active');
			var activeIndex;
            if(p.hasClass('dimmed')) {
                return false;
            } else {
                var n = parseInt($('.tablet-sub-control').attr('data-shift'));
                if(p.hasClass('prev')) { // prev
                    n = n - 1;
                } else { // next
                    n = n + 1;
                }
                tabletNav.each(function() {
                    var i = $(this).index();
					activeIndex = activeLi.index();
                    if(i<n || i>n+3) $(this).removeClass("show-tablet").addClass("hide-tablet");
                    else $(this).addClass("show-tablet").removeClass("hide-tablet");
                });
				(p.hasClass('prev')) ? activeIndex = activeIndex - 1 : activeIndex = activeIndex + 1;
                $('.tablet-sub-control').attr('data-shift', n);
				tabletNav.removeClass('active');
				tabletNav.eq(activeIndex).addClass('active');
                if(n<=0) {
                    $('.tablet-sub-control .prev').addClass('dimmed').find("a").attr("tabindex",-1);
                    $('.tablet-sub-control .next').removeClass('dimmed').find("a").removeAttr("tabindex");
                } else if (n>=lengthTabletNav-4) {
                    $('.tablet-sub-control .prev').removeClass('dimmed').find("a").removeAttr("tabindex");
                    $('.tablet-sub-control .next').addClass('dimmed').find("a").attr("tabindex",-1);
                } else {
                    $('.tablet-sub-control .prev').removeClass('dimmed').find("a").removeAttr("tabindex");
                    $('.tablet-sub-control .next').removeClass('dimmed').find("a").removeAttr("tabindex");
                }
            }
        });
        /* Tablet Nav Init */
        self._initTabletNav();
        
        /* LGEDE-2018 20170420 add */
        if($('.signature-inline').length > 0){
        	if(navigator.userAgent.indexOf('Chrome/') != -1 && navigator.userAgent.indexOf('Mac') != -1){        		
        		var standardVer = 5702987133;
        		var chromeVersion = navigator.userAgent.substring(navigator.userAgent.indexOf('Chrome/'), navigator.userAgent.indexOf('Safari/')).trim().split('/')[1];
        		if(chromeVersion.length == 12){
        			chromeVersion = chromeVersion + '0'
        		}
        		chromeVersion = Number(chromeVersion.replace(/[.]/g,''));
        		if(standardVer > chromeVersion){
        			var style = 'top: 28px !important';
        			if(lgFilter.locale == '/gr'){
        				style = 'top: 31px !important';
        			}
        			$('.appHeader .primary-nav ul.primary-nav-list > li.signature-inline > a i').attr('style', style);
        		}
        	}
        }
        /* LGEDE-2018 20170420 add */
        
        /* LGEPJT-483 add */
        self._initCartCount();
        /* //LGEPJT-483 add */
    }

    function setCookie(key, value) {
        var expires = new Date();
        expires.setTime(expires.getTime() + (90 * 24 * 60 * 60 * 1000));
        document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
    }

    function getCookie(key) {
        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue ? keyValue[2] : null;
    }

    if (getCookie('cookiesaccepted') + '' !== 'true') {
        $('body').addClass('cookie-check');
    }

    proto._initTabletNav = function(){
        var self = this;
        if($(self.el).find(".outer-category.primary-nav-link").css("display") == 'none') return false;
        var lengthTabletNav = $('.inner-category ul.primary-nav-list > li.primary-nav-part').length;
        $('.tablet-sub-control').attr('data-shift',0);
        if(lengthTabletNav > 4){
            isTabletNav = 0;
            tabletNav.each(function(i) {
                if(i<isTabletNav || i>isTabletNav+3) $(this).removeClass("show-tablet").addClass("hide-tablet");
                else $(this).addClass("show-tablet").removeClass("hide-tablet");
            });
            $('.tablet-sub-control .prev').addClass('dimmed').find("a").attr("tabindex",-1);
            $('.tablet-sub-control .next').removeClass('dimmed').find("a").removeAttr("tabindex");
            $('.inner-category').addClass('over-length');
        }else {
            $('.tablet-sub-control').hide();
        };
    }

    proto._cookieClose = function(e) {
        var self = this;
        setCookie('cookiesaccepted', 'true');
        self.$cookieNotice.slideUp();
        e.preventDefault();
    };

    proto._handleEvent = function(e) {
        var self = this;
        e.preventDefault();
    };

    proto._primaryNavSearchFocus = function(e) {
        var self = this;
        if ($('.primary-nav').css('display') != 'none') { // search
        } else { // close
            $('a.primary-nav-search-close').focus();
        }
    }

    proto._primaryNavInputFocus = function(e) {
        var self = this,
			$navPart = self.$navLinks.find('li.primary-nav-part'),
			$rightNavPart = $('.right-side-nav .primary-nav-part');

		if (!$('.nav-wrapper').hasClass('opened')) return false;

        if ($navPart.hasClass('active')) $navPart.removeClass("active");
        if ($rightNavPart.hasClass('active')) $rightNavPart.removeClass("active");

		self._initTabletNav();
	}

    proto._positionSearch = function(e) {
    	e.preventDefault();	/* LGEGMO-3452 20170824 add */
        var self = this,
            searchBoxWidth = self.$searchInput.outerWidth(),
			isBizLen = $('.search-item').next().length,
            $navLinks = $(self.el).find("li.primary-nav-part");

        $('.right-side-nav .primary-nav-part, .primary-nav, .primary-nav-search').css({
            'visibility': 'hidden', // thetheJ
            'pointer-events': 'none'
        });
        $('.primary-nav-search .icon-search').css({
            'visibility': 'hidden'
        });
        $('.right-side-nav .primary-nav-link, .primary-nav-open, .primary-nav .primary-nav-link, .app-meganav').removeClass('active');
        $('.primary-nav-open').next().show().find('.icon').removeClass('hide');

        self.$searchTakeover.css('left', self.$primaryNavSearch.offset().left - self.$searchTakeover.outerWidth() + (parseInt(self.$primaryNavSearch.css('padding-right')) / 2) + (parseInt(self.$primaryNavSearch.css('padding-left')) / 2) + 5).addClass(this.options.ac);
		if(isBizLen == 0) self.$searchTakeover.css('margin-left', '-100px');
        // focus
        self.$searchTakeover.find('.search-box input[type=search]').focus();
    }


    proto._closeSearch = function(e) {
        var self = this;
        $('.right-side-nav .primary-nav-part, .primary-nav, .primary-nav-search').css({
            //'display': 'block', // thetheJ
            'visibility': 'visible',
            'pointer-events': 'auto'
        });

        $('.primary-nav').css({
            'display' : 'table-cell'
        });

        $('.primary-nav-search .icon-search').css({
            'visibility': 'visible'
        });

        $('.primary-nav-open').next().hide();
        self.$searchTakeover.removeClass(this.options.ac);
		self.$primaryNavSearch.focus();
        e.preventDefault();
    };

    proto._primaryNavSkipAction = function(e){
        e.preventDefault();
        var self = this,
            isTablet = $(self.el).find(".outer-category.primary-nav-link").css("display") != "none",
            _target = e.currentTarget,
            $targetLi = $(_target).parents("li.primary-nav-part"),
            $nextLi = $targetLi.eq(0).next("li");

        if(!isTablet || (isTablet && !$targetLi.parents(".inner-category")[0])){
            $targetLi.removeClass("active");
        }

        if($nextLi.hasClass("hide-tablet") && isTablet){
            $(".tablet-sub-control .next a").click();
        }else if(!$nextLi[0]) {
            if($targetLi.parents(".inner-category")[0]){
                $targetLi.removeClass("active");
                $nextLi = $targetLi.eq(1).next("li");
            }else {
                $nextLi = $targetLi.parents(".primary-nav").next();
                $nextLi.find("a").eq(0).focus();
                return false;
            }
		/* LGEGMO-2230 ADD  */
        } else if($targetLi.next()) {
            $targetLi.next().find("a:visible").eq(0).focus();
            return false;
		/* //LGEGMO-2230 ADD  */
        }
        $nextLi.find("a.primary-nav-link, a.primary-nav-open").focus();
    };
    
    /* LGEGMO-3452 20170824 add */
    proto._clickHandler = function(e) {
        e.preventDefault();
        
        var self = this,
        _target = e.currentTarget,
        $target = $(_target);
        
        if ($target.hasClass("outer-category") || $target.parent().hasClass("skip-button") || $target.parent().hasClass("close-button")) {
            return;
        } else if ($target.hasClass("primary-nav-link") && $target.attr("data-url")) {
            location.href = $target.attr("data-url")
        } else {
        	if ($target.attr("target") == "_blank") {
        		if (e.originalEvent != undefined) {
        			window.open($target.attr("href"));
        		}
            } else {
                location.href = $target.attr("href");
            }
        }
        
        /*if ($target.attr("href").indexOf("#") != -1) {
            return;
        } else {
            if ($target.attr("target") == "_blank") {
                window.open($target.attr("href"));
            } else {
                location.href = $target.attr("href");
            }
            
        }*/

        /*if ($("html").hasClass("tablet")) {		//tablet
        	if ($target.hasClass("primary-nav-link")) {
            	return;
        	} else {
        		location.href = $target.attr("href");
        	}
        } else {		//pc
            if ($target.hasClass("outer-category")) {
            	return;
            } else if ($target.hasClass("primary-nav-link") && $target.attr("data-url")) {
            	location.href = $target.attr("data-url");
            } else {
        		location.href = $target.attr("href");
        	}
        }*/
    }
    /* //LGEGMO-3452 20170824 add */

    proto._primaryNavFocusHandler = function(e) {
        e.preventDefault();
        var self = this,
            isTablet = $(self.el).find(".outer-category.primary-nav-link").css("display") != "none",
            _target = e.currentTarget,
            $target = $(_target),
			navType = $target.data('nav-type') ? $target.data('nav-type') + '-based' : 'text-based',
            $navLinks = $(self.el).find("li.primary-nav-part"),
            $currentLink = $target.parents("li.primary-nav-part"),
            $megaMenu = $target.parent("li.primary-nav-part").find('.meganav-menu'),
            $a = $currentLink.find("a");

        $a.unbind('focus blur', $.proxy(self._checkNavLinksFocus, self)).bind('focus blur', $.proxy(self._checkNavLinksFocus, self));
        $(self.el).unbind('mouseleave').bind('mouseleave', $.proxy(self._checkNavLinksFocus, self));
        $navLinks.removeClass("active");

        if($currentLink.hasClass("hide-tablet") && isTablet) {
            var s = $currentLink.index() < $currentLink.parent().find("li.show-tablet").eq(0).index() ? ".prev a" : ".next a";
            $(".tablet-sub-control "+s).click();
        }
        if($target.hasClass("outer-category")){
            $(self.el).find(".inner-category li.primary-nav-part").eq(0).addClass("active");
            self._initTabletNav();
        }
        $currentLink.addClass("active");
        /* LGEGMO-3452 20170824 add */
        $a.unbind('click', $.proxy(self._clickHandler, self)).bind('click', $.proxy(self._clickHandler, self));
        /* //LGEGMO-3452 20170824 add */
        /* LGECI-3360 20180928 add */
        if ( $currentLink.children("a").hasClass("carouselFlag") && $(e.fromElement).is($currentLink.find(".container.category-nav")) ) {
            return;
        }
        /*//LGECI-3360 20180928 add */
        
		if(!isTablet){
			(navType == 'image-based') ? $megaMenu.parent().addClass('imaged'): $megaMenu.parent().removeClass('imaged');
			$megaMenu.find('.' + navType).show();

			$megaMenu.find('.slick-initialized').slick('unslick');
			$megaMenu.find('.carrier-slider').on('init', function(event, slick) {
				slick.$slideTrack.find("a").attr("tabindex", -1);
				slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
			}).slick({
				infinite: false,
				lazyLoad: 'ondemand',
				slidesToShow: 5,
				slidesToScroll: 1,
				arrows: true
			}).on('afterChange', function(event, slick, currentSlide) {
				slick.$slideTrack.find("a").attr("tabindex", -1);
				slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
			});
			$megaMenu.find('.right-slider').on('init', function(event, slick) {
				slick.$slideTrack.find("a").attr("tabindex", -1);
				slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
			}).slick({
				dots: true,
				infinite: true,
				speed: 300,
				slidesToShow: 1
			}).on('afterChange', function(event, slick, currentSlide) {
				slick.$slideTrack.find("a").attr("tabindex", -1);
				slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
			});
		}
    };

    proto._checkNavLinksFocus = function(e) {
        var self = this,
            $navLinks = $(self.el).find("li.primary-nav-part"),
            $currentLink = $(e.currentTarget).parents("li.primary-nav-part");

        if(e.type == "mouseleave"){
            $(self.el).find("li.primary-nav-part").removeClass("active");
            self._initTabletNav();
        }else {
            $currentLink.each(function(i){
                if(e.type == "blur"){
                    //$(this).removeClass("active");
                }else if (e.type == "focus"){
                    //$(this).addClass("active");
                }
            });
        }
    };

    proto._primaryNavCloseTrigger = function(e) {
        var self = this,
            isTablet = $(self.el).find(".outer-category.primary-nav-link").css("display") != "none",
            $focusNav = $(self.el).find("li.primary-nav-part.active"),
            $focusNavAnchor = null;
        //focusNav = $(self.el).find("li.primary-nav-part.active a").eq(0);
        $(self.el).find("li.primary-nav-part").removeClass("active");
        if (!isTablet && $focusNav.parents(".inner-category")[0]) {
            $focusNavAnchor = $focusNav.eq(1);
        } else {
            $focusNavAnchor = $focusNav.eq(0);
        }
        $focusNav.removeClass("active")
        $focusNavAnchor.find("a").eq(0).focus();
        self._initTabletNav();
    }

    var _updateScroll = function() {
        //todo
    };

    var _onCollapse = function() {
        //todo
    };
    /* LGEPJT-483 add */
    proto._initCartCount = function(e) {
        var isMobile = $('body').hasClass('is-mobile');

        var cartInfoUri = isMobile ? $('.app-my-lg').data('obsinfourl') : $('#app-my-lg').data('obsinfourl');
        
        if (!!cartInfoUri  == false){
            return;
        }
        $.ajax({
            url:cartInfoUri,            
            xhrFields: {
                withCredentials: true
            },
            success:function(data){                
                var $cartCountSpan = $('.cart-count > span').eq(0);

                if (data.totalQty != null){
                    $cartCountSpan.text( parseInt(data.totalQty) );
                } else {
                    $cartCountSpan.text('0');
                }
            }
        });
    }
    /* //LGEPJT-483 add */

    $(window).on("resize", function(event) {
        $('#appHeader .primary-nav-link.active').removeClass('active');
        if ($('html').hasClass('no-touch')) {
            if ($('.search-menu').hasClass('active')) {
                $('.primary-nav').css({
                    //'display': 'block',
                    'visibility': 'visible',
                    'pointer-events': 'auto'
                });
				$('.right-side-nav .primary-nav-part, .primary-nav, .primary-nav-search').css({
					'visibility': 'visible', // thetheJ
					'pointer-events': 'auto'
				});
                $('.primary-nav-search .icon-search').css({
                    'visibility': 'visible'
                });
                // $('.primary-nav-biz').show().next().hide();
                $('.primary-nav-open').next().hide();
                if(!$('.nav-wrapper').hasClass('opened')) $('.search-takeover').removeClass('active');
                $('.search-menu-btn .icon-search').removeClass('hide');
                $('.search-menu-btn .icon-close').addClass('hide');
            }
        }
    });


    //cookie layer close function
    /*
    $('.cookie-notice-close').click(function() {
        $(this).parent().parent().hide();
        return false;
    });
    */

    /*
    move app-header-mobile.js - 2015-05-21 phoebe
    $('#appHeaderMobile .mobile-nav-hamburger').click(function(){
        var v_height = parseInt($(window).height());
        var v_heightF = v_height-55;
        $('.mobile-flyout-body-wrapper').css('height',v_heightF).css('position','absolute').css('right','0').css('width','85%').css('overflow','auto').css('-webkt-overflow-scrolling','touch');
        $('html').css('overflow','hidden').css('position','fixed').css('width','100%');
        $('#mobileFlyoutNav').css('overflow','auto');
    });

    $('#mobileFlyoutNav .mobile-flyout-header .hamburger a').click(function(){
        $('html').css('overflow','auto').css('position','static').css('width','auto');
    });
    */

    //   Create the jquery plugin and set it to auto-wire to specified selector
    ic.jquery.plugin('appHeader', AppHeader, '.appHeader');

    return AppHeader;

});
