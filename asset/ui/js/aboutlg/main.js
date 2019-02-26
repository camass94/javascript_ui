define(['global-config', 'jquery', 'chosen', 'lazyload', 'mkt/modelsticky', 'mkt/styledform', 'aboutlg/news-letters', 'aboutlg/survey'], function(globalConfig, $, chosen, lazyload, modelSticky, styledForm, newsLetter, survey) {

    'use strict';

    // Init
    var isMobile = $("body").is(".is-mobile");
    var init = function() {
        if (!isMobile && $(".chosen-select").length > 0) {
            $(".chosen-select").each(function() {
                $(this).chosen({
                    disable_search: true
                });
            });
        };

        if ($("img.lazy").length > 0) {
            $("img.lazy").each(function(){
                $(this).attr('style', '').removeClass('lazy').attr("src",$(this).data("original"));
            });
        }

        $("body").attr("data-scrollEvent","true")
    };

    init();

    // floating menu
    var fMenubox = $('.floating-menubox');
    if (fMenubox.is('div')) {
        var fMenu = fMenubox.find('.floating-menu');
        var fMenuList = fMenu.find('li');
        var fMenuLen = fMenuList.length;
        var fTop = parseInt(fMenubox.offset().top);
        var sTop = parseInt($(window).scrollTop());
        var fMenuLink = new Array();
        var pTop = new Array();
        /* LGEGMO-2927 modify */
        var limited = parseInt($(".footer-seo, .footer").offset().top);
        /*//LGEGMO-2927 modify */
        var categorySticky = $(".category-sticky").outerHeight(true);


        if($(".press-release-wrap").length || $(".press-media").length || $(".find-a-job").length || $(".news-letters").length){
            fMenu.addClass("no-animate");
            $(".wrapper").css("overflow","hidden");
        }

        if(fMenuList.length == 0){
            fMenubox.hide();
        }

        if(fMenu.hasClass("no-animate")){
            var href = location.href.split("lg.com")[1];

            fMenuList.each(function(){
                if($(this).find("a").attr("href") == href){
                    $(this).addClass("on");
                }
            })

            if($(".news-letters").length){
                var activeValue = $("[name='tabActiveIndex']").val();
                fMenuList.eq(activeValue-1).addClass("on");
            }

            if(isMobile){
                fMenu.find("ul").prepend(fMenuList.filter(".on"));
            }
        } else {
            for (var i = 0; i < fMenuLen; i++) {
                if(fMenuList.eq(i).find('a').attr('href').split('#')[1] !== undefined){
                    fMenuLink[i] = $('#' + fMenuList.eq(i).find('a').attr('href').split('#')[1]);
                }
            }
            $(window).resize(function() {
                fTop = parseInt(fMenubox.offset().top);
                sTop = parseInt($(window).scrollTop());
                for (var i = 0; i < fMenuLen; i++) {
                    pTop[i] = parseInt(fMenuLink[i].offset().top);
                }
            });
        }

        var scrollAction = function(){
            if($("body").attr("data-scrollEvent") == "true"){
                fTop = parseInt(fMenubox.offset().top - 40);
                sTop = parseInt($(window).scrollTop());
                /* LGEGMO-2927 modify */
                limited = parseInt($(".footer-seo, .footer").offset().top);
                /*//LGEGMO-2927 modify */
                categorySticky = $(".category-sticky").outerHeight(true);

                if (fTop >= sTop || limited < sTop){
                    fMenu.removeClass('floating');
                    if(fMenu.hasClass("no-animate") == false){
                        fMenuList.removeClass('on');
                    }
                } else {
                    fMenu.addClass('floating');
                }

                if(fMenu.hasClass("no-animate") == false){
                    for (var i = 0; i < fMenuLen; i++) {
                        if(fMenuLink[i] != undefined){
                            pTop[i] = parseInt(fMenuLink[i].offset().top);
                        }
                    }
                    for (var i = fMenuLen - 1; i >= 0; i--) {
                        if (pTop[i] - parseInt(fMenu.outerHeight(true)) - categorySticky - 1 < sTop) {
                            fMenuList.removeClass('on').eq(i).addClass('on');
                            break;
                        }
                        if (isMobile) {
                            if (pTop[0] > sTop) {
                                fMenuList.removeClass('on').eq(0).addClass('on');
                            }

                            if(pTop[0] == undefined){
                                fMenuList.removeClass('on').eq(0).addClass('on');
                            }
                        } else {
                            if (pTop[0] > sTop) fMenuList.removeClass('on');
                        }
                    }
                }
             }
        }

        scrollAction();

        $(window).load(function(){
            var pageUrl = location.href.split("#")[1];

            if(pageUrl){
               var scrolltop = $("#" + pageUrl).offset().top;
               var sticyHeight = $(".category-sticky").outerHeight(true) + $(".floating-menu").outerHeight(true);
                //console.log(scrolltop - sticyHeight);

                setTimeout(function(){
                    if($(window).scrollTop() == 0){
                        $(window).scrollTop(scrolltop - sticyHeight);
                    } else {
                        $(window).scrollTop(scrolltop - $(".category-sticky").outerHeight(true) - 20);
                    }
                },150);
            }
        })

        $(window).bind("scroll", function() {
            scrollAction();
        });

        fMenuList.find('a').on("click", function(e) {
            $("body").attr("data-scrollEvent","false");
            if(fMenu.hasClass("no-animate") == false && $(this).attr('href').split('#')[1] !== undefined){
                var idx = $(this).parent().index();
                var addOffset = categorySticky-10;

                //$(window).unbind("scroll");
                /* $('html, body').stop().animate({
                    scrollTop: pTop[idx]  - parseInt(fMenu.outerHeight(true)) - categorySticky + 1
                }, 500); */

                if($(".sticky-menu").hasClass("sticky-fixed")){
                    if(isMobile){
                        addOffset = 0;
                    } else {
                        addOffset = 10;
                    }
                } else {
                    if(isMobile){
                        addOffset = categorySticky;
                    } else {
                        addOffset = categorySticky-10;
                    }
                }
                setTimeout(function(){
                    if (sTop != pTop[idx] - parseInt(fMenu.outerHeight(true)) + 1) {
                        $('html, body').stop().animate({
                            scrollTop: pTop[idx] - parseInt(fMenu.outerHeight(true)) - (addOffset) + 1
                        }, 300, function(){
                            //scrollAction();
                            $("body").attr("data-scrollEvent","true");
                        });
                    }
                }, 100)

                fMenu.removeClass('open');
                e.preventDefault();
            } else {
                $("body").attr("data-scrollEvent","true");
            }

        });
        if (isMobile) {
            fMenu.find('.mobile > a').click(function() {
                fMenu.toggleClass('open');
                return false;
            });
        }
    }

    // sticky menu
    var $menu = $(".category-sticky");
    var $button = $menu.find(".open-button");

    $button.on("click", function(e){
        if($menu.find("ul").is(":visible")){
            $menu.find("ul").removeClass("active").hide();
        } else {
            $menu.find("ul").addClass("active").show();
        }
        e.preventDefault();
    })

    // History
    var historySlide = $('.history-slide');
    var historyLeftBtn = historySlide.find('.controls a.prev');
    var historyRightBtn = historySlide.find('.controls a.next');
    var historyLenth = historySlide.find('.historylist .item').length;
    historySlide.data('current', 0);
    historyLeftBtn.addClass('dimmed');
    historySlide.find('.controls a').click(function() {
        if ($(this).hasClass('dimmed')) return false;
        var c = parseInt(historySlide.data('current'));
        var me = 0;
        if ($(this).hasClass('prev')) me = c - 1;
        else me = c + 1;
        historySlide.find('.year').html(historySlide.find('.historylist .item').addClass('hide').eq(me).removeClass('hide').data('year'));
        historySlide.data('current', me);
        if (me <= 0) historyLeftBtn.addClass('dimmed');
        if (me >= historyLenth - 1) historyRightBtn.addClass('dimmed');
        if (me > 0 && me < historyLenth - 1) {
            historyLeftBtn.removeClass('dimmed');
            historyRightBtn.removeClass('dimmed');
        }
        return false;
    });
    // Jeong do
    var JDownload = $('.download-select').length == 0 ? $('.jeongdo-form .controls a.btn') : $('.download-select .controls a.btn');
    var JDsSelect = $('.download-select').length == 0 ? $('.jeongdo-form .controls select') : $('.download-select .controls select');
    JDsSelect.bind('change', function() {
        $(this).closest('.controls').find('a.btn').attr('href', $(this).val());
    });
    JDownload.click(function() {
        var n = $(this).attr("href");
        if (n == "" || n == "#") return false;
        else return true;
    });
    // Global Operations
    var GOBox = $('.global-operations');
    var GOSelect1 = GOBox.find('select').eq(0);
    var GOSelect2 = GOBox.find('select').eq(1);
    var GODownload = GOBox.find('.controls a.btn');
    var GOResult = GOBox.find('.result');
    GOSelect1.find('option').not(':first-child').removeAttr('selected');
    GOSelect1.trigger("chosen:updated");
    GOSelect2.find('option').not(':first-child').addClass('hide').removeAttr('selected');
    GOSelect2.trigger("chosen:updated");

    if(isMobile){
        if($(".clone-select").length == 0){
            GOSelect2.find("option").removeClass("hide");
            GOSelect2.clone().insertAfter(GOSelect2).addClass("clone-select").attr("style","visibility:hidden; height:0; font-size:0; position:absolute; left:-999em");
        }
    }

    GOSelect1.bind('change', function() {
        if(!isMobile){
            GOSelect2.find('option').not(':first-child').addClass('hide').removeAttr('selected');
            GOSelect2.find('option.' + $(this).val()).removeClass('hide');
            GOSelect2.trigger("chosen:updated");
        } else {
            GOSelect2.find("option").not(':first-child').remove().removeAttr('selected');
            GOSelect2.append($(".clone-select").find('option.' + $(this).val()).clone());
        }
    });

    GODownload.click(function() {
        var v1 = GOSelect1.val();
        var v2 = GOSelect2.val();
        if (v1 == 'all') {
            return false;
        } else {
            GOResult.find('table').removeClass('show');
            GOResult.find('table').find('tr').removeClass('show');
            GOResult.find('table.' + v1).addClass('show');
            if (v2 == 'all') {
                GOResult.find('table.' + v1).find('tr').addClass('show');
            } else {
                GOResult.find('table.' + v1).find('tr.' + v2).addClass('show');
            }
        }
        return false;
    });

    var windowPopup = function(){
        var btnPop = $('.open-window-popup');

        btnPop.on('click', function(e){
            e.preventDefault();
            var popUrl = $(this).data('url');

            if(!popUrl == "") {
                window.open(popUrl, 'popup','width=586,height=410,scrollbars=no');
            }
        })
    }

    windowPopup();

    var modalPopup = function(){

        var modalWrap = ""
        modalWrap += "<div class='modal-wrap'>";
        modalWrap +=    "<div class='dimm-wrap'></div>";
        modalWrap += "</div>";

        var modalLayer = $('.modal-wrap');
        var innerTarget = $('body');
        var layerBtn = $('.btn-open-layer');
        var closeBtn = $('.btn-close-layer');


        focusControl();

        layerBtn.on('click', function(e){
            var currentCon = $(this).attr('href');
            var currentLayer = $(currentCon).clone();


            e.preventDefault();

            if(currentLayer.length) {
                innerTarget.append(modalWrap);
                $('.modal-wrap').append(currentLayer);
                $('.modal-wrap').show();

                var tid;
                var _top;
                focusControl();
                clearTimeout(tid);

                $(this).addClass("active");

                tid = setTimeout(function(){
                    if($("body").hasClass("is-mobile") == false){
                       _top = $(window).height() < currentLayer.outerHeight(true) ? $(window).scrollTop() + 40 : ($(window).scrollTop() + ($(window).height() - currentLayer.outerHeight(true)) / 2);
                       $('.modal-wrap').find('.popup-layer').attr('tabindex', '0').css("top", _top).show();
                       if($("html").hasClass("pc")){
                        $(".modal-wrap").css("position", "fixed");
                        }
                       $('.modal-wrap').find('.popup-layer').focus();
                       if($("html").hasClass("pc")){
                        $(".modal-wrap").css("position", "absolute");
                        }
                    } else {
                       _top =  $(window).scrollTop() + 10;
                       $('.modal-wrap').find('.popup-layer').attr('tabindex', '0').css("top", _top).show();
                    }

                    $(e.target).addClass("active");

                    $('.btn-close-layer').on("click",function(e){
                        e.preventDefault();
                        $(this).parents('.modal-wrap').remove();
                        layerBtn.filter(".active").focus();
                        layerBtn.filter(".active").removeClass('active');
                    })

                }, 50);

            }
            else {
                alert('no layer content');
            }
        })

    }

    function focusControl() {
        var $firstElem = $('.modal-wrap').find("a, [tabindex='0']").filter(":first");
        var $lastElem = $('.modal-wrap').find("a,[tabindex='0']").filter(":last");

        $firstElem.off("keydown").on("keydown", function(e) {
            if (e.keyCode == 9 && e.shiftKey) {
                if ($('.popup-layer').is(":visible") && $(e.target).hasClass("popup-layer")) {
                    e.preventDefault();
                    $lastElem.focus();
                }
            } else if (e.keyCode == 9) {}
        });

        $lastElem.off("keydown").on("keydown", function(e) {
            if (e.keyCode == 9 && e.shiftKey) {

            } else if (e.keyCode == 9) {
                e.preventDefault();
                if ($('.popup-layer').is(":visible")) {
                    $firstElem.focus();
                }
            }
        });
    }

    modalPopup();

    /* modal layer */
    function modalAjax(el, url){
        var $el = el;
        var dataUrl = url;
        var innerTarget = $("body");
        var modalWrap = ""
            modalWrap += "<div class='modal-wrap'>";
            modalWrap +=    "<div class='dimm-wrap'></div>";
            modalWrap +=    "<div class='popup-layer'>";
            modalWrap +=    "<a class='btn-close-layer' href='#'><i class='icon icon-close'></i><span>'"+commonMsg.common['close']+"'</span></a>";
            modalWrap +=    "</div>";
            modalWrap += "</div>";

        $el.addClass("active");

        $.ajax({
            type: 'get',
            dataType: "html",
            url: dataUrl + "?layerType=true",
            success: function(data) {
                $("html > div.page-dimmed").remove();

                innerTarget.append(modalWrap);

                if($(data).filter(".find-a-job-wrap").length == 0){
                    $('.modal-wrap .popup-layer').append($(data).filter(".press-release-wrap"));
                } else {
                    $('.modal-wrap .popup-layer').append($(data).filter(".find-a-job-wrap"));
                }

                $('.modal-wrap').show();
                var tid;
                var _top;
                focusControl();
                clearTimeout(tid);
                tid = setTimeout(function(){
                    var $modalWrap = $('.modal-wrap');
                    if($("body").hasClass("is-mobile") == false){
                       _top = $(window).height() < $('.popup-layer').outerHeight(true) ? $(window).scrollTop() + 40 : ($(window).scrollTop() + ($(window).height() - $('.popup-layer').outerHeight(true)) / 2);
                       $modalWrap.find('.popup-layer').attr('tabindex', '0').css("top", _top).show();
                       if($("html").hasClass("pc")){
                        $modalWrap.css("position", "fixed");
                       }
                       $modalWrap.find('.popup-layer').focus();
                       if($("html").hasClass("pc")){
                        $modalWrap.css("position", "absolute");
                        }
                    } else {
                       _top =  $(window).scrollTop() + 10;
                       $modalWrap.find('.popup-layer').attr('tabindex', '0').css("top", _top).show();
                    }

                    $('.btn-close-layer, .btn-close',$modalWrap).one("click",function(e){
                        e.preventDefault();
                        $("body").css("overflow-y","auto");
                        $(this).parents('.modal-wrap').remove();
                        $el.filter(".active").focus();
                        $el.filter(".active").removeClass('active');
                    })

                    $("body").css("overflow-y","auto");

                }, 50);


                var applyBtn = $('[data-agree-type]');

                if(applyBtn.length){
                    agreeToggle(applyBtn);
                }
            },
            error: $.proxy(function() {
                $("html > div.page-dimmed").remove();
                $("body").css("overflow-y","auto");
                alert(errorMsg);
            })
        });
    }

    var $pressDetail = $(".press-list-area");
    var $target = $pressDetail.find(".list-title a");

    if($target.length){
        $pressDetail.on("click", ".list-title a", function(e){
            if($(this).attr("data-link-type") == null){
                e.preventDefault();

                var link = $(this);
                var url = $(this).attr("href");
                $("body").css("overflow-y","hidden");
                modalAjax(link, url);
            }
        });
    }

    var $jobDetail = $(".find-list-area");
    var $jobTarget = $jobDetail.find(".list-title a");

    if($jobTarget.length){
        $jobDetail.on("click", ".list-title a", function(e){
            e.preventDefault();
            var link = $(this);
            var url = $(this).attr("href");
            $("body").css("overflow-y","hidden");
            modalAjax(link, url);
        });
    }

    var $modalDetail = $("[data-modal-content]");
    var modalTarget = $modalDetail.data("modal-content");

    if($(modalTarget).length){
        $(modalTarget).on("click", function(){
            e.preventDefault();
            var link = $(this);
            var url = $(this).attr("href");
            $("body").css("overflow-y","hidden");
            modalAjax(link, url);
        });
    }


    //find a job search agree

    var agreeToggle = function(el){
        var $btn = $(el);
        var $layer = $(el.data("agree-type"));

        $btn.on("click", function(e){
            e.preventDefault();
            $layer.find("input[type='checkbox']").iCheck("uncheck").iCheck("update");

            $layer.parent().find('.detail-area').hide();
            $layer.show();

            styledForm($layer);

            $("[data-require-field]", $layer).each(function() {
               requireField($(this))
            });
        })

        $layer.find(".btn-close-agree").on("click", function(e){
            e.preventDefault();

            $layer.parent().find('.detail-area').show();
            $layer.hide();
        })

        var requireField = function(element) {
            var self = this;
            var $this = $(element);
            var _field = $this.data("requireField");
            var $dep = $("#" + _field, $layer)

            var intv;

            $dep.bind("keyup change", function() {
                clearTimeout(intv);
                intv = setTimeout(function() {
                    $this.prop("disabled", $dep.prop("checked") ? false : true)
                }, 100);
            });
        };
    }
});