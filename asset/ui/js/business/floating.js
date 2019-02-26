define(['common/msg', 'ic/ic', 'ic/ui/module', 'global-config', 'slick-carousel', 'lazyload'], function(msg, ic, icm, gc, slick, lazyload) {
    'use strict';

    var isMobile = $("body").is(".is-mobile");
    var isProduct = false; // except pdp page
    if ($('.product').is('div')) isProduct = true;

    // floating menu (desktop)
    var fMenubox = $('.floating-menubox');
    /* LGEGMO-2927 modify */
    var footerBox = $('.footer-seo, .footer');
    /*//LGEGMO-2927 modify */
    if (fMenubox.is('div')) {

        var fMenu = fMenubox.find('.floating-menu');
        var fMenuList = fMenu.find('li');
        var fMenuLen = fMenuList.length;
        var fTop = parseInt(fMenubox.offset().top);
        var sTop = parseInt($(window).scrollTop());
        var footerTop = parseInt(footerBox.offset().top);
        var fMenuLink = new Array();
        var pTop = new Array();
        var FlazyImg = $(".floating-menubox").parent().find("img.lazy");
        var Flazyevt;

        for (var i = 0; i < fMenuLen; i++) {
            fMenuLink[i] = $('#' + fMenuList.eq(i).find('a').attr('href').split('#')[1]);
        }
        $(window).resize(function() {
            fTop = parseInt(fMenubox.offset().top);
            sTop = parseInt($(window).scrollTop());
            for (var i = 0; i < fMenuLen; i++) {
                pTop[i] = parseInt(fMenuLink[i].offset().top);
            }
            $(window).trigger("scroll");
        });

        var bindScroll = function() {
            $(window).scroll(function() {
                fTop = parseInt(fMenubox.offset().top);
                sTop = parseInt($(window).scrollTop());
                footerTop = parseInt(footerBox.offset().top);
                if (fTop >= sTop || sTop >= footerTop) fMenu.removeClass('floating');
                else fMenu.addClass('floating');
                for (var i = 0; i < fMenuLen; i++) {
                    pTop[i] = parseInt(fMenuLink[i].offset().top);
                }

                for (var i = fMenuLen - 1; i >= 0; i--) {
                    if (pTop[i] - parseInt(fMenu.css('height')) - 1 < sTop) {
                        fMenuList.removeClass('on').eq(i).addClass('on');
                        if (!isMobile) { // fix hash error
                            var my = fMenuList.eq(i).find('a').attr('href').split('#')[1];
                            $('#' + my).css('height', 'auto').removeAttr('style');
                        }
                        break;
                    }
                    if (isMobile) {
                        if (pTop[0] > sTop) fMenuList.removeClass('on').eq(0).addClass('on');
                    } else {
                        if (pTop[0] > sTop) fMenuList.removeClass('on');
                        $('.module-group').css('height', 'auto').removeAttr('style');
                    }
                }
            });
        }

        fMenuList.find('a').click(function() {
            var isHash = $(this).attr('data-isHash');
            var idx = $(this).parent().index();
            var mybox = $(this).attr('href').split('#')[1];

            $('html, body').stop().animate({
                scrollTop: pTop[idx] - parseInt(fMenu.css('height')) + 1
            }, 500);

            fMenu.removeClass('open');

            return false;
        });

        var detectHash = function() {
            var hash = window.location.hash;
            if ($(hash).is('div')) {
                if (fMenubox.is('div')) {
                    var fMenu = fMenubox.find('.floating-menu');
                    var fMenuList = fMenu.find('li');
                    fMenuList.each(function() {
                        var n = $(this).find('a').attr('href').split('#')[1];
                        //  // fix hash error
                        $('#' + n).css('height', '500px').css('overflow', 'hidden');
                        $('.module-group').css('height', '500px').css('overflow', 'hidden');
                    });
                    $(hash).css('height', 'auto').removeAttr('style');
                    setTimeout(function() {
                        $('html, body').stop().animate({
                            scrollTop: $(hash).offset().top - parseInt(fMenu.css('height')) + 1
                        }, 0).promise().done(function() {
                            fMenu.addClass('floating').find('a[href=' + hash + ']').parent().addClass('on');
                            bindScroll();
                        });
                    }, 500);
                }
            } else {
                bindScroll();
                $(".floating-menubox .floating-menu").find("a[href='" + hash + "']").trigger("click");
            }
        };

        window.onhashchange = detectHash;
        if (window.location.hash && (!isProduct | fMenubox.is('div'))) {
            detectHash();
        }

        var _checkLoadedImage = function() {
            var _imgObj = $(".floating-menubox").parent().find("img.lazy");
            if(_imgObj.length){
                for(var i=0; i<_imgObj.length; i++){
                    if($(_imgObj[i]).height() > 1 || $(_imgObj[i]).height() == 0){
                        _imgObj.splice(i, 1);
                        i--;
                    }
                }
            }else{
                $(".swrap_loading").remove();
                if (Flazyevt) {
                    clearInterval(Flazyevt);
                    if (!window.location.hash) bindScroll();
                    $(window).trigger("scroll");
                }
            }
        }

        var _lazyCheck = function(){
            FlazyImg.trigger("tab-trigger");
            $("body").append("<div id='swrap_loading' class='swrap_loading'><span>&nbsp;</span></div>");
            Flazyevt = setInterval(_checkLoadedImage, 500);
        }

        FlazyImg.lazyload({
            appear: function(e) {
                $(this).attr('style', '').removeClass('lazy');
            },
            event: "tab-trigger"
        });

        _lazyCheck();

    }
    // accordion tab (mobile)
    if (!isProduct && isMobile) {
        var accTab = $('.accordion-tab');
        var isClose = accTab.hasClass('hide-all');
        if (isClose == true) {
            accTab.each(function(idx) {
                var tid = $(this).find('a').attr('href').split('#')[1];
                var obj = $('#' + tid);
                obj.hide();
                $(this).find('.icon-tab-plus').show();
                $(this).find('.icon-tab-minus').hide();
            });
        } else {
            accTab.each(function(idx) {
                if (idx != 0) {
                    var tid = $(this).find('a').attr('href').split('#')[1];
                    var obj = $('#' + tid);
                    obj.hide();
                    $(this).find('.icon-tab-plus').show();
                    $(this).find('.icon-tab-minus').hide();
                    $(window).trigger('resize');
                    $(window).trigger("scroll");
                }
            });
        }
        accTab.find('a').click(function() {
            var tid = $(this).attr('href').split('#')[1];
            var obj = $('#' + tid);
            if (obj.css('display') != 'none') {
                obj.stop().css({
                    opacity: 1
                }).animate({
                    opacity: 0
                }, 300).promise().done(function() {
                    obj.hide();
                });
                $(this).find('.icon-tab-plus').css('display','inline-block');
                $(this).find('.icon-tab-minus').css('display','none');
            } else {
                obj.stop().css({
                    opacity: 0
                }).show().animate({
                    opacity: 1
                }, 500);
                $(this).find('.icon-tab-plus').css('display','none');
                $(this).find('.icon-tab-minus').css('display','inline-block');
                obj.find('img.lazy').each(function() {
                    $(this).attr('src', $(this).data('original'));
                });
                $(window).trigger('resize');
                $(window).trigger("scroll");
                $('.with-carousel .carousel').slick('setPosition');
                // Slick.cleanUpEvents();
                $('html, body').stop().delay(100).animate({
                    scrollTop: obj.offset().top - 42
                }, 500);
                obj.find('.slick-slide').resize();
            }
            return false;
        });

        var detectHash = function() {
            var hash = window.location.hash;
            if ($(hash).css("display") == "none") {
                var f = $(".accordion-tab a").eq(0),
                    fHash = f.attr("href");
                $(fHash).hide();
                f.find('.icon-tab-plus').css('display','inline-block');
                f.find('.icon-tab-minus').css('display','none');
                setTimeout(function() {
                    $(".content-box-wrap").find("a[href='" + hash + "']").trigger("click");
                }, 500);
            }
        };
        window.onhashchange = detectHash;
        if (window.location.hash && (!isProduct)) {
            detectHash();
        }
    }
});
