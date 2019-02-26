define(['ic/ic','ic/ui/module','global-config', 'jquery', 'common/social-likes', 'common/dtm'], function(ic,Module,globalConfig, $, socialLikes, dtm) {
    'use strict';

    // sticky - star
    $('.app-tabs .review_points a').click(function() {

        if (!$(this).hasClass('other-link')) {

            if ($('body').hasClass('is-mobile')) {
                $('.tabs-panels .tabs-panel').removeClass('active');
                $('#ratings-reviews').addClass('active');
                $('.accordion-content').hide();
                $('#ratings-reviews .accordion-content').show();
                $('html, body').scrollTop($('#ratings-reviews').offset().top)

            } else {
                var a;
                $('.tabs-nav-wrapper ul li').each(function() {
                    if ($(this).find('a i').hasClass('icon-reviews')) {
                        a = $(this);
                    }
                });
                a.find('a').trigger('click');
            }
            // DTM
            /*
            var ratings = 0;
            var reviews = 0;
            if($(this).find('>span')) {
                var n = $(this).find('>span');
                if(n.attr('itemprop')=='reviewCount' && n.attr('content')) {
                    reviews = n.attr('content');
                }
            }
            if($(this).find('.points_wrap>meta')) {
                var n = $(this).find('.points_wrap>meta');
                if(n.attr('itemprop')=='ratingValue' && n.attr('content')) {
                    ratings = n.attr('content');
                }
            }
            */
            //alert(ratings+":"+reviews);
            //sendEvent('review', ratings+":"+reviews);
            sendEvent('review');
            return false;

        }
        
    });
	if($(".sub-menu").length){
		$(".move-top").addClass("sub-menu").show();
	}else{
		$(".move-top").show();
	}
    // print
    $('.stickynav .print a').click(function() {
        window.print();
        return false;
    });
    
    if (globalConfig.isMobile) {
        $(".app-tabs .tabs-panel:last").after("<div class='tabs-panel-last'></div>");
    }

    $(window).bind("scroll",function() {
        if ($('.stickynav').length > 0 && !globalConfig.isMobile) {
            stickyNav();
            //if ($('.product_share').css('display') != "none") $('.product_share .close a').trigger('click');
        } else {
            var scrollTop = $(this).scrollTop();
            skickyMobile(scrollTop);
        }
    }).scroll();

    function stickyNav() {
        /* PJTTWIN-1 20161010 add */
        if ($('.stickynav').hasClass('noSticky')) return;
        /* //PJTTWIN-1 20161010 add */
        var _headerHeight = $('.app-tabs').offset().top;
        var _navH = 100;
        var _navHie8 = 100;
        //var _navH = $('.stickynav').outerHeight();
        //var _tabsH = $('.tabs-nav-wrapper').outerHeight();
        var chkt = $(window).scrollTop();
        if (chkt >= _headerHeight && !$('.stickynav').hasClass('float')) {
        	if($(".sub-menu").length){
        		$("#features").find("img.lazy").lazyload().trigger("appear");
        	}
        	$(".sub-menu").removeClass("hide");
            $('.stickynav').addClass('float');
            $('.tabs-nav-wrapper').addClass('float');
            $('.tabs-panels').addClass('float');
            //$('.tabs').css('padding-top', (_navH + _tabsH) + 'px')
            $('.tabs-nav').css('top', 'auto !important');
            if ($('html').hasClass('lt-ie9')) {
                $('.tabs-nav-wrapper').css('position', 'fixed').css('top', 100 + 'px').css('width', '100%').css('z-index', '999');
            } else {
                $('.tabs-nav-wrapper').css('position', 'fixed').css('top', _navH + 'px').css('width', '100%').css('z-index', '999');
            }
        }
        if (chkt < _headerHeight && $('.stickynav').hasClass('float')) {
        	$(".sub-menu").addClass("hide");
            $('.stickynav').removeClass('float');
            $('.tabs-nav-wrapper').removeClass('float');
            $('.tabs-panels').removeClass('float');
            $('.tabs-nav-wrapper').css('position', 'relative').css('top', '0px');
            //$('.tabs').css('padding-top', '0')
            $('.tabs-nav').css('top', '0');
        }
    }

    function skickyMobile(scrolltop) {
        if (globalConfig.isMobile) {
            if ($(".app-tabs .tabs-panel.active").length) {
                $(".app-tabs .tabs-panel.active").each(function() {
                    var fixedTarget = $(this);
                    var limitOffsetTop = $(this).next(".tabs-panel").length ? $(this).next(".tabs-panel").offset().top : $(".tabs-panel-last").offset().top;
                    var offsetTop = fixedTarget.offset().top;

                    if (offsetTop < scrolltop && limitOffsetTop > scrolltop) {
                        $(this).find(".accordion-tab:not(.sub-menu-mobile)").find("a[data-toggle]").css({
                            position: "fixed",
                            top: "0",
                            width: "100%",
                            zIndex: "100"
                        });
                    } else {
                        $(this).find("a[data-toggle]").removeAttr("style");
                    }
                })
            }
        }
    }
    /* PJTHEMC-9 add*/
    var sticky = function(el, options) {
        var _style;
        var positionInfo = [];
        var stickyObj = [];
        var tid = null;
        var resizeTid = null;
        var currentIdx = 1;
        var oldTopPos = 0;
        var isMoving = false;

        var defaults = {
            stickyRelative: null,
            stickyEnd: null,
            activeClass: "active",
            stickyActive: "fixed"
        };
        var stickyArea = $("[data-sticky-area]");
        var _areaLength = stickyArea.length;

        sticky.superclass.constructor.call(self, el, options);
        self.options = $.extend(defaults, self.options);
        if($(self.options.stickyEnd).length==0){
        	self.options.stickyEnd='footer';
        }

        stickyArea.each(function(index, element) {
            stickyObj[index] = new StickyMotion($(element), index);
        });

        if (!globalConfig.isMobile) {
            init();
        }

        function init() {
            $(window).load(function() {
                $("body").data("eventtype", "load");
                $(self.options.stickyRelative).height($(el).outerHeight(true));
            })

            window.onresize = function() {
                $(self.options.stickyRelative).height($(el).outerHeight(true));
            }

            skickyScroll();
            $(el).find('li a').each(function(index, element) {
                $(element).on("click", function(event) {
                    event.preventDefault();
                    $('body').data('eventtype', 'skickyClick');
                    currentIdx = index + 1;

                    stickyObj[currentIdx - 1].scroll();
                    changeIndicator();

                    return false
                });
            });

        }

        function StickyMotion(element, index) {
            function scroll() {
                if ($('html, body').not(":animated")) {
                    $(window).unbind("scroll");
                    $('html, body').stop(true).animate({
                        scrollTop: element.offset().top -($('.stickynav:not(.noSticky)').outerHeight() + $('.tabs-nav-wrapper').outerHeight())
                    }, {
                        duration: 300,
                        complete: function() {
                            isMoving = true;
                            skickyScroll();
                            $(window).scroll(function() {
                                if($('.stickynav').length>0) stickyNav();
                            })
                        }
                    });
                }
            }

            function positionInfo() {
                return {
                    offsetTop: element.offset().top,
                    height: element.outerHeight(true) -($('.stickynav:not(.noSticky)').outerHeight() + $('.tabs-nav-wrapper').outerHeight())
                };
            }

            return {
                scroll: scroll,
                position: positionInfo
            };
        }

        function skickyScroll() {
            $(window).bind("scroll", function(event) {
                if (isMoving = true) $("body").data("eventtype", "scroll");

                var scrTop = $(this).scrollTop();
                var limitTop = $(self.options.stickyRelative).offset().top;
                var limitBottom = $(self.options.stickyEnd).offset().top-($('.stickynav:not(.noSticky)').outerHeight() + $('.tabs-nav-wrapper').outerHeight());

                positionInfo = [];

                for (var i = 0; i < _areaLength; i++) {
                    positionInfo.push(stickyObj[i].position());
                }

                if (limitTop <= scrTop) {
                    if (limitBottom < scrTop) {
                        _style = {
                            display: "none"
                        }
                    } else {
                        _style = {
                            position: "fixed",
                            bottom: 0 + "px",
                            display: "block"
                        }

                        $(self.options.stickyRelative).addClass(self.options.stickyActive);
                        $(self.options.stickyRelative).height($(el).outerHeight(true));

                        clearTimeout(tid);
                        tid = setTimeout(function() {
                            // scroll down
                            if (oldTopPos < scrTop) {
                                if (positionInfo[0].offsetTop + positionInfo[0].height < scrTop) {
                                    for (var i = 1, Len = _areaLength; i < Len; i++) {
                                        if (positionInfo[i].offsetTop + positionInfo[i].height > scrTop) {
                                            currentIdx = i + 1;
                                            break;
                                        }
                                    }
                                } else {
                                    currentIdx = 1;
                                }

                                oldTopPos = scrTop;

                            } else {
                                // scroll up
                                if (positionInfo[0].offsetTop + positionInfo[0].height < scrTop) {
                                    for (var i = 1, Len = _areaLength; i < Len; i++) {
                                        if (positionInfo[i].offsetTop + positionInfo[i].height > scrTop) {
                                            currentIdx = i + 1;
                                            break;
                                        }
                                    }
                                } else {
                                    currentIdx = 1;
                                }

                                oldTopPos = scrTop;
                            }

                            oldTopPos = scrTop;

                        }, 10);

                        changeIndicator();

                        isMoving = false;
                        $(el).addClass('active')
                    }

                } else if (limitTop > scrTop) {
                    if ($(".support.home").length) {
                        $(el).find('li').removeClass(self.options.activeClass);
                    }

                    $(self.options.stickyRelative).removeClass(self.options.stickyActive);

                    _style = {
                        position: "static",
                        top: "auto" + "px",
                    }

                    $(self.options.stickyRelative).height("auto");

                    clearTimeout(tid);
                    $(el).removeClass('active')
                }

                $(el).css(_style);

            });

        }

        function changeIndicator() {
            if ($("body").data("eventtype") != "load") {
                $(el).find('li').eq(currentIdx - 1).addClass(self.options.activeClass).siblings().removeClass(self.options.activeClass);
            }
        }
    }
    ic.util.inherits(sticky, Module);
    ic.jquery.plugin('sticky', sticky, '.sub-menu-tab[data-sticky-target]');

    return sticky;
    
});
function imgAppear(e){
	$(e.target).find("img.lazy").lazyload().trigger("appear");
	$(e.target).find('.carousel').slick('setPosition');
};
/*//PJTHEMC-9 add*/