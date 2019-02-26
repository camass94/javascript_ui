/**
 * The support common module.
 * @module support/support
 */
var XSSfilter;

define(['jquery', 'global-config', 'lazyload', 'cs/styledform', 'cs/forms', 'cs/dropdown', 'cs/droplist', 'cs/scrollbar', 'support/product-selector', 'support/model-selector', 'cs/placeholder', 'cs/modallayer', 'cs/basicmotion', 'call-to-action/call-to-action-carousel', 'slick-carousel', 'cs/predictive', 'cs/spin', 'support/sticky', 'cs/printshiv', 'cs/ajaxform'], function($, config, lazyload) {

    //'use strict';

    if ($("[data-change='ajaxLoad']").length > 0) {
        $("[data-change='ajaxLoad']").ajaxLoad();
    }

    if ($("img.lazy").length > 0) {
        $("img.lazy").lazyload();
    }


    // what I'm returning here is "global" when you require this module

    if (!config.isMobile) {
        $(".quick-close").click(function(e) {
            document.cookie = "quickHidden=true;domain=.lg.com;path=/;expires=";
            $(".quick-menu").hide();
            return false;
        });

        var windowWidth = $(window).width();

        var value = document.cookie;
        var parts = value.split("quickHidden=")[1];

        if (parts) {
            var flag = parts.split(";")[0];
            if (flag == "true") {
                $(".quick-menu").hide();
            }
        }

        if ($(".survey .inner-scroll").length > 0) $(".survey .inner-scroll").scrollbar();

        if ($(".quick-menu").length) {

            $(window).resize(function() {
                if ($(this).width() >= 1281) {
                    $(this).trigger("scroll");
                }
            });

            $(window).scroll(function() {
                if ($(window).width() >= 1281) {

                    var scrTop = $(this).scrollTop();
                    var winHeight = $(window).height();
                    /* LGEGMO-2927 modify */
                    var limitBottom = $(".footer-seo, .footer").length ? $(".footer-seo, .footer").offset().top : $("#appFooter").offset().top;
                    /*//LGEGMO-2927 modify */
                    var elmHeight = $('.quick-menu').height();
                    var gap = (winHeight - elmHeight) / 2;

                    var _style = {
                        position: "fixed",
                        top: gap + "px"
                    };

                    if ((scrTop + elmHeight + gap) < limitBottom) {
                        if ($('.wrapper.support').hasClass('home')) {
                            if ($("#app-my-lg").size() > 0) {
                                var limitTop = $("#app-my-lg").offset().top + $("#app-my-lg").height();
                            }
                        } else {
                            if ($(".support-title").size() > 0) {
                                var limitTop = $(".support-title").offset().top + $(".support-title").height();
                            } else {
                                var limitTop = $(".container").offset().top;
                            }
                        }
                        if (gap > (limitTop - scrTop)) {
                            _style = {
                                position: "fixed",
                                top: gap + "px"
                            }
                        } else {
                            _style = {
                                position: "fixed",
                                top: limitTop + "px"
                            }
                        }

                    } else if ((scrTop + elmHeight + gap) > limitBottom) {

                        _style = {
                            position: "fixed",
                            top: (limitBottom - (scrTop + elmHeight)) + "px"
                        }

                    }

                    $('.quick-menu').css(_style);

                    // console.log("scrollTop:" + scrTop, "\nwindowHeight:" + winHeight, "\nlimitTop:" + limitTop, "\nlimitBottom:" + limitBottom, "\nelmHeight:" + elmHeight, "\ngap:" + gap)
                }
            });

            $(window).resize();

        }


    } else {

        $(".quick-menu").addClass("active");
        $(".quick-menu").find("ul").css({
            display: "flex",
            display: "-webkit-flex"
        });

        $(".quick-btn").bind("click", function(e) {
            if (!$(".quick-menu").hasClass("active")) {
                $(this).siblings("ul").css("display", "flex");
                $(".quick-menu").addClass("active");
            } else {
                $(".quick-menu").removeClass("active");
            }

            e.preventDefault();
        });

        (function($, window) {
            var $win = $(window);
            var defaults = {
                gap: 0,
                horizontal: false,
                isFixed: $.noop
            };

            var supportSticky = function(elem) {
                var prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'],
                    prefix;
                while (prefix = prefixes.pop()) {
                    elem.style.cssText = 'position:' + prefix + 'sticky';
                    if (elem.style.position !== '') return true;
                }
                return false;
            };

            $.fn.fixer = function(options) {
                options = $.extend({}, defaults, options);
                var hori = options.horizontal,
                    cssPos = 'top';

                return this.each(function() {
                    var style = this.style,
                        $this = $(this),
                        $parent = $this.parent().parent();

                    if (supportSticky(this)) {
                        style[cssPos] = options.gap + 'px';
                        return;
                    }

                    $win.on('scroll', function() {
                        var scrollPos = $(this).scrollTop();
                        var elemSize = $this.outerHeight();
                        var parentPos = $parent.offset()[cssPos],
                            parentSize = $parent.outerHeight();
                        if ($this.is('.on')) {
                            if (scrollPos >= parentPos - options.gap && (parentSize + parentPos - options.gap) >= (scrollPos + elemSize)) {
                                style.position = 'fixed';
                                style[cssPos] = options.gap + 'px';
                                options.isFixed();
                            } else if (scrollPos < parentPos) {
                                style.position = 'absolute';
                                style[cssPos] = 0;
                                style.height = '57px';
                            } else {
                                style.position = 'absolute';
                                style.height = '57px';
                                style[cssPos] = parentSize - elemSize + 'px';
                            }
                        } else {
                            if (scrollPos) {
                                style.position = 'absolute';
                            }
                        }
                    });
                });
            };
        }(jQuery, this));

        $('.link-area h2 a,.product-support-box h2 a').fixer({});

        $(".home").on("click",".sub-title a", function(){
            $(window).trigger("scroll");
        })
    }


    // new-quick-menu
    (function(){

        var browserSize = $(window).width();
        var $btnIcon = $('.new-quick-btn .icon');
        var $quickBtn = $('.new-quick-btn');
        var $quickMenu = $('[data-menu-type="new"]');
        var posiSet = function() {
            $('.moveBanner').css('right',$('.new-quick-menu').width()-171);
        };// LGEES-2426 20160623
        var posiSetClose = function() {
            $('.moveBanner').css('right',$('#appFooter').width()-220)
        };// LGEES-2426 20160623

        if (!config.isMobile && $quickMenu.length) {

            var menuActivate = function() {
                $quickMenu.addClass("active").find('ul').animate({width:'100%'},150);
                /* LGEES-2426 20160623 add*/               
                if(lgFilter.locale =="/es" && $('.moveBanner').length>0){ 
                	setTimeout(posiSet, 400);
                	$('.moveBanner').removeClass("bottom");
                };
                $(window).resize(function(){
                	($('.new-quick-menu').width()==1)? setTimeout(posiSetClose, 400):setTimeout(posiSet, 400);
                });
                /*//LGEES-2426 20160623 add*/
            };

            var menuDeactivate = function() {
                $quickMenu.find('ul').stop().animate({width:0},150, function() {
                    $quickMenu.removeClass("active");
                });
                /* LGEES-2426 20160623 add*/
                if(lgFilter.locale =="/es" && $('.moveBanner').length>0){
                	$('.moveBanner').addClass("bottom");
                }
                /*//LGEES-2426 20160623 add*/
            };

            if (browserSize <= 1599) {
                $quickMenu.removeClass('pc')
            }

            menuActivate();

            $(window).resize(function(){
                var windowSize = $(this).width();
                if (windowSize >= 1600) {
                    $quickMenu.addClass('pc')
                } else {
                    $quickMenu.removeClass('pc')
                }
            });

            $quickBtn.bind("click", function(e) {

                if (!$quickMenu.hasClass("active")) {
                    menuActivate();
                } else {
                    menuDeactivate();
                }

                e.preventDefault();
            });

        } else {

            if ($quickMenu.length) {
                $quickMenu.addClass("active");
                /* LGEES-2426 20160623 add*/
                if(lgFilter.locale =="/es" && $('.moveBanner').length>0) {
                	setTimeout(posiSet, 400);
                };
                $(window).resize(function(){
                	setTimeout(posiSet, 400);
                });
                /* LGEES-2426 20160623 add*/
                $quickBtn.bind("click", function(e) {
                    $quickMenu.toggleClass('active');
                    /* LGEES-2426 20160623 add*/
                    if(lgFilter.locale =="/es" && $('.moveBanner').length>0) { 
        	            $('.moveBanner').toggleClass("bottom");     
                    };
                    $(window).resize(function(){
                    	($('.new-quick-menu').width()==1)? setTimeout(posiSetClose, 400):setTimeout(posiSet, 400);
                    });
                    /*//LGEES-2426 20160623 add*/
                    e.preventDefault();
                });

            }
        }
    })();

    $(document).on("click", "[rel]", function(e) {
        var $this = $(this);
        var rel = $this.attr("rel");
        switch (rel) {
            case "history.back":
                e.preventDefault();
                history.back();
                break;
            case "window.close":
                //e.preventDefault();
                window.close();
                window.opener.location.href = $(this).attr("href");
                break;
            case "opener.redirect":
                e.preventDefault();
                window.close();
                window.opener.location.href = $(this).attr("href");
                break;
            case "print":
                e.preventDefault();
                window.print();
                break;
        }
    });



    // Quick Path SubCategory
    quickPath = {
        options: {
            boolean: true,
            support: null,
            opener: null,
            model: null,
            subCategory: null,
            productBtn: null,
            needBtn: null
        },
        init: function() {
            var self = this;
            self.action = '';
            self.options.support = $('.support.home');
            self.options.opener = $(".model-select", self.options.support);

            if (self.options.opener.length > 0) {

                self.options.opener.on($.modal.AJAX_COMPLETE, function() {

                    self.options.model = $('#quickPath', self.options.support);
                    self.options.subCategory = $('select', self.options.model); //selectbox
                    self.options.productBtn = $('.product-btn', self.options.model); //Product button
                    self.options.needBtn = $('.sub-category-btn', self.options.model); //Need button
                    self.options.submitBtn = $('button.category-selected', self.options.support);

                    self.options.subCategory.on('change', $.proxy(self.QuickChange, self));

                    if (!self.options.submitBtn.attr('disabled')) {
                        //self.options.submitBtn.attr('disabled', 'disabled');
                    }

                    $('#quickPath').on('keyup', function(event) {
                        event.stopPropagation();
                        if (event.which == 13) {
                            return false;
                        }
                    });

                    self.actionElement = $("#quickPath .quick-action");
                    self.actionElementChild = $("a", self.actionElement);
                    self.actionElementChild.on("click", function(e) {
                        e.preventDefault();
                        self.actionElementChild.removeClass("on");
                        self.action = $(e.target).attr("href");
                        $(e.target).addClass("on");
                        self.options.submitBtn.removeAttr('disabled');
                    });

                    self.actionElementChild.on("keydown", function(e) {

                        e.preventDefault();

                        var idx = $(this).parent().index();
                        var max = self.actionElementChild.size();

                        switch (e.keyCode) {
                            case 9:
                                if (e.shiftKey) {
                                    self.options.needBtn.focus();
                                } else {
                                    self.options.submitBtn.attr('disabled') ? $('a.close-modal').focus() : self.options.submitBtn.focus();
                                }
                                break;
                            case 13:
                                self.actionElementChild.removeClass('on').eq(idx).addClass('on');
                                self.options.submitBtn.removeAttr('disabled');
                                break;
                            case 38:
                                if (idx == 0) idx = 1;
                                self.actionElementChild.eq(idx - 1).focus();
                                break;
                            case 40:
                                if (idx == max) idx = max - 1;
                                self.actionElementChild.eq(idx + 1).focus();
                                break;
                            default:
                                break;
                        }
                    });

                    $(document).on("submit", "#quickPath", function(e) {
                        //if (self.action == "") self.action = $('#quickPath').attr('action');
                        location.href = self.action + "?" + $(this).serialize();
                        e.preventDefault();
                    });

                });

            }
        },
        MotionFunc: function(e) {
            var self = this;

            if (self.options.boolean == true) {
                self.options.boolean = false;

                $('[data-multi-motion]').each(function() {
                    if ($(this).is($(e.self)) == false) {
                        $(this).disabled(false);
                        $(this).click();
                        self.options.boolean = true;
                    }
                });

                self.QuickDisabled();
                self.QuickAccessibility($(e.self));
            }
        },
        QuickDisabled: function() {
            var self = this;
            self.options.productBtn.disabled(false);
            self.options.needBtn.disabled(true);

            self.QuickChange();

            if (self.options.needBtn.hasClass('on') == false) {
                self.options.productBtn.disabled(true);
                self.options.submitBtn.attr('disabled', 'disabled');
            }
        },
        QuickAccessibility: function(target) {
            var self = this;

            $(target).focus();
        },
        QuickChange: function(e) {
            var self = this;
            var optionCheck = true;

            //Load select value all choose
            if (e && $(e.currentTarget).hasClass('quick-sub-category')) {
                self.options.needBtn.disabled(false);
                self.options.needBtn.click();
            }

            //Toggle
            self.options.model.find('select').each(function() {
                if ($(this).val().length == 0) {
                    optionCheck = false;
                }
            });

            if (optionCheck == true) {
                self.options.needBtn.disabled(false);
                self.actionElementChild.removeClass('on');
            } else {
                self.options.needBtn.disabled(true);
            }
        }
    };
    quickPath.init();

    // View my registered product
    /* PJTBTOBCSR-138 start */
    registerProduct = function() {
        var opener = $('a[data-product-target]');
        if (opener.length > 0) {
            opener.on($.modal.AJAX_COMPLETE, function(e) {
                var registerProduct = $('.my-registered-product'); //modal
                var target = $(e.currentTarget).data('product-target'); //input
                var selectBtn = $('a[data-submit]', registerProduct); //select
                var isRequestRepair = $(this).closest('.wrapper').find('.schedule-repair').length ? true : false; //request repair page check

                selectBtn.on('click', function(e) {
                    e.preventDefault();
                    var value = $(this).data('value');
                    var target_value = target.split(",");
                    var split_value = value.split(",");

                    var opt = $(this).data('submit');

                    if (isRequestRepair) {
                        if (target_value.length > 1) {
                            for (i = 0; i < split_value.length; i++) {
                                if ($('form:visible #purchaseInfoType1').find(target_value[i]).length > 0) {
                                    $('form:visible #purchaseInfoType1').find(target_value[i]).val(split_value[i]);
                                    $('form:visible #purchaseInfoType2').find(target_value[i]).val(split_value[i]);
                                } else {
                                    $('form:visible').find(target_value[i]).val(split_value[i]);
                                }
                            }
                        } else {
                            $(target).val(split_value[0]);
                        }
                    } else {
                        if (target_value.length > 1) {
                            for (i = 0; i < split_value.length; i++) $('form:visible').find(target_value[i]).val(split_value[i]);
                        } else $(target).val(split_value[0]);
                    }

                    $.modal.close();
                    $('form:visible').find(target_value[0]).focus();

                    if (opt) {
                        $(target).parents('form').submit();
                    } else {
                        /* LGEGMO-1803 start */
                        if(target_value[target_value.length - 1] != ".searchbox input"){
                            $('form:visible').find(target_value[target_value.length - 1]).trigger("keywordChange");
                        }
                        /* LGEGMO-1803 end */

                        if (isRequestRepair) {
                            $('form:visible [id^=purchaseInfoType]').find('input').data('noreset', true);
                            if ($('.model-browser').length) {
                                $('form:visible .model-browser').trigger('modelBrowser:selectRegisteredProduct:after');
                            } else {
                                $(".step-list .search-model-number").trigger("click");
                            }
                        } else {
                            if ($('.model-browser').length) {
                                $('form:visible .model-browser').trigger('modelBrowser:selectRegisteredProduct:after');
                            } else {
                                $(".step-list .search-model-number").trigger("click");
                            }
                        }
                    }
                });
            });
        }
    }();
    /* PJTBTOBCSR-138 end */

    var slickCarousel = (function(len) {
        if (!len) return;
        
        /* LGECI-2824 modify */
        /*LGEAU-2564 modify : 20180723*/
        var checkCA = (lgFilter.locale =="/ca_en" || lgFilter.locale =="/ca_fr" || $('.support-home-carousel').size()>0)?true:false;
        /*//LGEAU-2564 modify : 20180723*/
        if (checkCA && $('.support.home')) {
        	$('.slick-carousel .viewport').on('init', function(event, slick){
                slick.$slideTrack.find("a").attr("tabindex", -1);
                slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
            }).slick({
                lazyLoad: 'ondemand',
                slidesToShow: 1,
                slidesToScroll: 1,
                dots: true,
                arrows: true,
                responsive: [{
                    breakpoint: 768,
                    settings: {
                        dots: true,
                        arrows: false
                    }
                }]
            }).on('afterChange', function(event, slick, currentSlide){
                slick.$slideTrack.find("a").attr("tabindex", -1);
                slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
            });
        }else {
        	$('.slick-carousel .viewport').slick({
        		slidesToShow: 1,
        		dots: len > 1 ? true : false,
        				infinite: true,
        				nav: len > 1 ? true : false,
						slidesToScroll: 1,
						adaptiveHeight: true,
						prevArrow: '.slick-carousel .prev',
						nextArrow: '.slick-carousel .next'
        	});
        }
        /*//LGECI-2824 modify */
    }($('.slick-carousel .slick-item').length));
    
    return {};
});

var modalAlert = function(con, flag, link) {
    if (flag) {
        var modalAlert = $('#modalAlert'),
            modalText = modalAlert.find('.alert-text'),
            modalBtn = modalAlert.find('.btn');

        if (link) modalBtn.attr({
            "rel": "",
            "href": link
        });

        modalAlert.removeAttr("rel");
        modalText.html(con);
        modalAlert.modal();

        return modalAlert;
    } else {
        alert(con)
    }
};

var modalConfirm = function(con, flag, link) {
    if (flag) {
        var modalConfirm = $('#modalConfirm'),
            modalText = modalConfirm.find('.confirm-text'),
            modalBtn = modalConfirm.find('.btn-confirm');

        if (link) modalBtn.attr({
            "rel": "",
            "href": link
        });

        modalConfirm.removeAttr("rel");
        modalText.html(con);
        modalConfirm.modal();

        return modalConfirm;
    } else {
        alert(con)
    }
};

var XSSfilters = function(obj) {
    $.each(obj, function(index, field) {
        field.value = XSSfilter(field.value);
    });
    return $.param(obj)
};

/* LGECS-692 20160614 add*/
$(document).ready(function(){
    if ( $("input.get-time").length ) {
        var banner = $(".new-banner.web");
        var bannerM = $(".new-banner.mobile");
        var bannerUl = banner.children("ul");
        var bannerClose = $(".close-banner");
        var isMobile = $("body").hasClass("is-mobile");
        var thisLocale = $("input.get-time").attr("data-locale");
        var a, b, c;


        function loading() {
            size();
            /*LGEIN-1806 20181001 add*/
            if ($(".jquery-modal").length && lgFilter.locale == "/in"){
            	return;
            }
            /*//LGEIN-1806 20181001 add*/
            banner.removeClass("hidden");
            a = $(".new-move-top a").offset().left;
            b = bannerUl.outerWidth();
            c = a - b;

            banner.css({
                left: a,
                width: 0,
                height: 0,
                marginTop: bannerUl.outerHeight()
            });

            banner.animate({
                left: c,
                width: bannerUl.outerWidth(),
                height: bannerUl.outerHeight() ,
                marginTop: 0
            }, 400, function() {
                banner.attr("style", "left:" + c + "px");
            });
            
            $("#min_10").attr("checked", false);	/* LGEBR-3318 20171012 add */

            
        }


        function loadingM() {
        	/*LGEIN-1806 20181001 add*/
        	if ($(".jquery-modal").length && lgFilter.locale == "/in"){
            	return;
            }
        	/*//LGEIN-1806 20181001 add*/
            bannerM.removeClass("hidden");
            bannerM.animate({
                bottom: 0
            }, 300);
            
            $("#min_10").attr("checked", false);	/* LGEBR-3318 20171012 add */
        }


        function closeM() {
            bannerM.animate({
                bottom: -170
            }, 300, function() {
                bannerM.addClass("hidden");
            });     
            
        }


        function mobileRotate () {
            if(window.matchMedia("(orientation: portrait)").matches){
                bannerM.removeClass("landscape");
            }else if(window.matchMedia("(orientation: landscape)").matches){
                bannerM.addClass("landscape");
            }
        }


        function setCookie(cName, cValue, cDay){
            var expire = new Date();
            expire.setDate(expire.getDate() + cDay);
            var cookies = cName + '=' + escape(cValue) + '; path=/ ';
            if(typeof cDay != 'undefined') cookies += ';expires=' + expire.toGMTString() + ';';
            document.cookie = cookies;
        }
        
        /* LGEBR-3318 20171012 add */
        function setCookieMinutes(cName, cValue, cMinutes){
            var expire = new Date();
            expire.setMinutes(expire.getMinutes() + Number(cMinutes));
            var deleteMinutes = expire.getMinutes();
            var cookies = cName + '=' + escape(deleteMinutes) + '; path=/ ';
            if(typeof cMinutes != 'undefined') cookies += ';expires=' + expire.toGMTString() + ';';
            document.cookie = cookies;
        }
        /*//LGEBR-3318 20171012 add */


        function getCookie(cName) {
            cName = cName + '=';
            var cookieData = document.cookie;
            var start = cookieData.indexOf(cName);
            var cValue = '';
            if(start == -1){
                if ( isMobile ) {
                    setTimeout(function(){
                        loadingM();
                    }, $(".get-time").val() );  
                } else {
                    setTimeout(function(){
                        loading();
                    }, $(".get-time").val() );                  
                }

            }
            return unescape(cValue);
        }
        
        /* LGEBR-3318 20171012 add */
        function getCookieMinutes(cName) {
            cName = cName + '=';
            var cookieData = document.cookie;
            var start = cookieData.indexOf(cName);
            var cValue = '';
            
            if(start != -1){
                start += cName.length;
                var end = cookieData.indexOf(';', start);
                if(end == -1)end = cookieData.length;
                cValue = cookieData.substring(start, end);

                var now = new Date();
                var nowMinutes = now.getMinutes();
                var delay = (cValue - nowMinutes /*+ 1*/) * 60000;		//LGEPA-833 20180906 modify
                //var cookieMinutes = cValue.slice(":")[1];
                //var delay = (cookieMinutes - nowMinutes - 1) * 60000;
                
                if ( isMobile ) {
                    setTimeout(function(){
                        loadingM();
                    }, delay );  
                } else {
                    setTimeout(function(){
                        loading();
                    }, delay );                  
                } 
            }
            return unescape(cValue);
        }
        /*//LGEBR-3318 20171012 add */


        function size(){
            if ($(window).width() > 1280) {
                banner.addClass("large");
                banner.removeClass("small midium");
            } else if ($(window).width() > 1024) {
                banner.addClass("midium");
                banner.removeClass("small large");
            } else {
                banner.addClass("small");
                banner.removeClass("large midium");
            }       
        }


        if ( isMobile ) {
            mobileRotate();
        }
        
        /* LGEBR-3318 20171012 add */
        //getCookie("LG_Survey" + thisLocale);
        if (document.cookie.indexOf("LG_Survey_Minutes" + thisLocale) > -1) {		//LGEPA-833 20180906 modify
        	getCookieMinutes("LG_Survey_Minutes" + thisLocale)
        } else {
        	getCookie("LG_Survey" + thisLocale);
        }
        /*//LGEBR-3318 20171012 add */


        $(".noMore").change(function(){
            setCookie('LG_Survey' + thisLocale, 'LG_Survey_Popup', 1);
            setTimeout(function(){
                $(".close-banner").trigger("click");
            }, 200);    
        });
        
        /* LGEBR-3318 20171012 add */
        $(".min_10").change(function(){
        	setCookieMinutes('LG_Survey_Minutes' + thisLocale, "", $(".get-minute").val());
            setTimeout(function(){
                $(".close-banner").trigger("click");
            }, 200, getCookieMinutes("LG_Survey_Minutes" + thisLocale));
        });
        /* //LGEBR-3318 20171012 add */


        $(".close-banner").bind("click", function(e){
            e.preventDefault();
            if ( isMobile ) {
                closeM();
            } else {
                banner.addClass("hidden");
            }
        });
        
        /* LGEIN-1744 : 20180709 add */
        $(".new-banner").on("click change", '[rel="modal:open"]', function(e) {
            e.preventDefault();
            if (!(e.type == "click" && e.currentTarget.tagName == "SELECT")) {
                if (!(e.currentTarget.tagName == "SELECT" && e.currentTarget.value == "")) $(this).modal();
                /*LGEIN-1806 20181001 add*/
                if(lgFilter.locale == "/in"){
                	bannerClose.trigger("click")
                }
                /*LGEIN-1806 20181001 add*/
                e.preventDefault();
            }
        });
        /* LGEIN-1744 : 20180709 add */

        $(window).resize(function(){
            if ( isMobile ) {
                mobileRotate();
            } else {
                size();

                a = $(".new-move-top a").offset().left;
                b = bannerUl.outerWidth();
                c = a - b;  

                banner.css({
                    left: c
                });                         
            }        
        }); 
    }
});
/* //LGECS-692 20160614 add*/