/*
 * find the right
 * 2015-06-16
 */
require(['global-config', 'jquery', 'jqueryui', 'jquery.cookie'], function(globalConfig, $, jqueryui, cookie) {
    'use strict';

    var _releaseCheck = $('section').hasClass('find-the-right');
    listMargin();

    // !! 2015-06-17 Screen Size 정의가 변경되어 아래 변수들 변경됨
    // !! 임시로 변경된 사항이기 때문에 개발 환경에 맞춰 수정하셔야합니다.
    // Find the right TVs category - Which screen size is best for you? 영역 관련 arrays
    // 모든 연관되는 Array의 length는 모두 갯수가 맞아야 합니다.
    // 영역 왼쪽 모니터 이미지에 노출되는 사이즈 텍스트
    //var settingDistance = ['5´','5´-7´','7´-10´','10´+']; // 영역 슬라이더 이동 시 handle 상단에 노출되는 텍스트
    //var settingName = ["FIND_FD00000003_SPEC_SP00042476_5_32_FD00000012_OR","FIND_FD00000003_SPEC_SP00042476_5-7_32_55_FD00000014_OR","FIND_FD00000003_SPEC_SP00042476_7-10_55_65_FD00000016_OR","FIND_FD00000003_SPEC_SP00042476_10_65_FD00000019_OR"]; // 실제 Find the right에 사용되는 파라메터의 name을 설정


    if (_releaseCheck == true) {
        var _root = $('.find-the-right');
        _root.find('.step-box').attr('data-count', 0);
        _root.find(".step-flow-contents > div").eq(0).attr('data-count', 1);
        if ($('body').hasClass('is-mobile')) {
            var sizeSliderDefault = 0;
            /* 2015-06-23 */
            if (typeof dragbarVal.selectOption == 'undefined') {

            } else {
                var dragTargetSelect = _root.find('.slide-bar');
                if (dragTargetSelect.length > 0 && dragbarVal.selectOption) {
                    dragTargetSelect.on('slidechange', function() {
                        dragTargetSelect.parents('.step-box').attr('data-count', '1');
                        dragTargetSelect.parents('.step-box').find('.btn').show();
                        dragTargetSelect.parents('.step-box').find('.skip-nav').hide();
                    });
                }
            }

            _root.find('.step-flow-contents input').each(function() {
                if ($(this).attr('disabled')) {
                    $(this).parent().parent().addClass('disable');
                }

                $(this).click(function() {
                    if ($(this).parents('.checkbox-wrap').hasClass('tile-button') || $(this).parents('.checkbox-wrap').hasClass('big-tile-button')) {
                        if ($(this).parent().parent().hasClass('check')) {
                            $(this).removeAttr('checked');
                            $(this).parent().parent().removeClass('check');
                        } else {
                            $(this).attr('checked', 'checked');
                            $(this).parent().parent().addClass('check');
                        }
                    } else {
                        return;
                    }

                    $(this).parents('.checkbox-wrap > div').each(function() {
                        var a = $(this).parent().find('.check').length;
                        $(this).parents('.step-box').attr('data-count', a);
                        if ($(this).parents('.step-box').attr('data-count') > 0) {
                            $(this).parents('.checkbox-wrap').parent().find('.btn').show();
                            $(this).parents('.checkbox-wrap').parent().find('.skip-nav').hide();
                        } else {
                            $(this).parents('.checkbox-wrap').parent().find('.btn').hide();
                            $(this).parents('.checkbox-wrap').parent().find('.skip-nav').show();
                        }
                    });
                });

                $(this).focus(function(e) {
                    $(e.currentTarget).parent("label").addClass("focus").trigger("mouseenter");
                });
                $(this).blur(function(e) {
                    $(e.currentTarget).parent("label").removeClass("focus").trigger("mouseenter");
                });
            });



            var _htmlCheck = '<i class="icon icon-check"></i>';
            var _htmlPass = '<i class="icon icon-circle-blank"></i>';
            var _htmlOn = '<i class="icon icon-circle"></i>';

            _root.find('.next-button').each(function() {
                $(this).find('.submit, .skip-nav').click(function() {
                    var x = $(this).parents('.step-box').index();
                    _root.find('.step-flow-contents > div').hide().removeClass("active");
                    _root.find('.step-flow-contents > div').eq(x + 1).show().addClass("active");
                    _root.find('.flow-chart ul').find('li').eq(x + 1).addClass('on');
                    _root.find('.flow-chart ul').find('li').eq(x + 1).find('.flow-icon').empty().append(_htmlOn);

                    if ($(this).parents('.step-box').attr('data-count') == 0) {
                        _root.find('.flow-chart ul').find('li').eq(x).removeAttr('class');
                        _root.find('.flow-chart ul').find('li').eq(x).addClass('pass');
                        _root.find('.flow-chart ul').find('li').eq(x).find('.flow-icon').empty().append(_htmlPass);
                    } else {
                        _root.find('.flow-chart ul').find('li').eq(x).removeAttr('class');
                        _root.find('.flow-chart ul').find('li').eq(x).addClass('checked');
                        _root.find('.flow-chart ul').find('li').eq(x).find('.flow-icon').empty().append(_htmlCheck);
                    }

                    if ($(this).parents('.step-box').hasClass('submit')) {
                        //_root.find(".other-slide").get(0).slick.setPosition();
                    }
                    $(window).scrollTop(0);
                    return false;
                });
            });

            var _resetSlider1 = _root.find('.slide-bar');
            var _resetSlider2 = _root.find('.price-slider');
            /*

                        _root.find('.back-to-start button').click(function(){
                            _root.find('.step-box').attr('data-count',0);
                            _root.find(".step-flow-contents > div").eq(0).attr('data-count',1);

                            _root.find('.step-flow-contents > div').hide();
                            _root.find('.step-flow-contents > div').eq(0).show();
                            _root.find('.flow-chart ul').find('li').removeAttr('class');
                            _root.find('.flow-chart ul').find('li').eq(0).addClass('on');
                            _root.find('.flow-chart ul').find('li').find('.flow-icon').empty().append(_htmlOn);
                            _resetSlider1.slider("option","value", 1);
                            _resetSlider1.slider("option","step", 1);

                            _root.find('.next-button a').show();
                            _root.find('.next-button button').hide();
                            _root.find('.start button').show();
                            $('#screenValue').val(settingValue[1]);
                            $('#screenValue').attr('name',settingName);
                            //$('#screenValue').attr('name',settingName[1]);
                            if(PriceRange){
                                _root.find('.min-pointer .range-wrap span').text('$'+formatCommas(PriceRange[0]+"")).parent().hide();
                                _root.find('.max-pointer .range-wrap span').text('$'+formatCommas(PriceRange[PriceRange.length-1]+"")).parent().hide();
                                _root.find('.range-box .min-range').text(formatCommas(PriceRange[0]+""));
                                _root.find('.range-box .max-range').text(formatCommas(PriceRange[PriceRange.length-1]+""));
                                _root.find('.price-box .min-price').text('$'+formatCommas(PriceRange[0]+""));
                                _root.find('.price-box .max-price').text('$'+formatCommas(PriceRange[PriceRange.length-1]+""));
                                _resetSlider2.slider("values", [0 ,PriceRange[PriceRange.length-1]]);
                                $('#range-max').val(PriceRange[PriceRange.length-1]);
                                $('#range-min').val(PriceRange[0]);
                            }
                            _root.find('.step-flow-contents input').each(function(){
                                $(this).removeAttr('checked');
                                $(this).parent().parent().removeClass('check');
                            });
                            $(window).scrollTop(0);
                            return false;
                        });
            */
            _root.find('.step-flow-contents label').each(function() {
                if ($(this).find('span.option-text').attr('data-disclaimer')) {
                    $(this).append('<a href="#" class="info-icon"></a>');
                }
                $(this).on({
                    click: function(e) {
                        //e.preventDefault();
                        if ($(e.target).hasClass("info-icon")) {
                            var targetC = e.currentTarget;
                            e.preventDefault();
                            var _dText = $(this).find('span.option-text').attr('data-disclaimer');
                            var _dTitle = $(this).find("span.option-text").text();
                            if (_dText == undefined) {
                                return;
                            }
                            if (!$("body").find(".dimmed .disclaimer")[0]) {
                                $("body").append('<div class="dimmed" style="height:' + $("body").outerHeight() + 'px"><div class="disclaimer"><p class="title">' + _dTitle + '</p><p>' + _dText + '</p><a href="#"><i class="icon icon-close"></i></a></div></div>');
                                $("body").find(".dimmed .disclaimer a").on({
                                    click: function(e) {
                                        e.preventDefault();
                                        $("body").find(".dimmed").hide();
                                        targetC.focus();
                                    }
                                })
                            } else {
                                $("body").find(".dimmed .disclaimer").find("p").text(_dText);
                                $("body").find(".dimmed .disclaimer").find("p.title").text(_dTitle);
                                $("body").find(".dimmed").show();

                            }
                            $(".dimmed .disclaimer").css({
                                top: $(window).scrollTop() + 130
                            });
                            $("body").find(".dimmed .disclaimer a").focus();
                            //console.log($("body").scrollTop())
                        }
                    }
                });
            });

            _root.find('.flow-chart ul').find('li').click(function() {
                var _stepIndex = $(this).index();
                _root.find('.step-flow-contents > div').removeClass("active").hide();
                _root.find('.step-flow-contents > div').eq(_stepIndex).addClass("active").show();
                _root.find('.flow-chart ul').find('li').removeAttr('class');
                _root.find('.flow-chart ul').find('li .flow-icon').empty().append(_htmlOn);

                for (var i = 0; i <= _stepIndex; i++) {
                    var j = _root.find('.step-flow-contents > div').eq(i).attr('data-count');
                    if (j == 0) {
                        _root.find('.flow-chart ul').find('li').eq(i).removeAttr('class');
                        _root.find('.flow-chart ul').find('li').eq(i).addClass('pass');
                        _root.find('.flow-chart ul').find('li').eq(i).find('.flow-icon').empty().append(_htmlPass);
                    } else {
                        _root.find('.flow-chart ul').find('li').eq(i).removeAttr('class');
                        _root.find('.flow-chart ul').find('li').eq(i).addClass('checked');
                        _root.find('.flow-chart ul').find('li').eq(i).find('.flow-icon').empty().append(_htmlCheck);
                    }
                }

                _root.find('.flow-chart ul').find('li').eq(_stepIndex).removeAttr('class');
                _root.find('.flow-chart ul').find('li').eq(_stepIndex).addClass('on');
                _root.find('.flow-chart ul').find('li').eq(_stepIndex).find('.flow-icon').empty().append(_htmlOn);
                $(window).scrollTop(0);
                return false;
            });
            _root.find('.flow-chart ul').find('li').last().click(function() {
                //_root.find(".other-slide").get(0).slick.setPosition();
                $(window).scrollTop(0);
                return false;
            });

            if (typeof dragbarVal.priceOption == 'undefined') {

            } else {
                var dragTargetPrice = _root.find('.price-slider');
                if (dragTargetPrice.length > 0 && dragbarVal.priceOption) {

                    dragTargetSelect.on('slidechange', function() {
                        dragTargetPrice.parents('.step-box').attr('data-count', '1');
                        dragTargetPrice.parents('.step-box').find('.btn').show();
                        dragTargetPrice.parents('.step-box').find('.skip-nav').hide();
                    });

                    _root.find('.price-slider a').append('<div class="range-wrap"><span></span><i class="icon icon-triangle-down-2"></i></div>')
                    _root.find('.price-slider a').eq(0).addClass('min-pointer');
                    _root.find('.price-slider a').eq(1).addClass('max-pointer');
                    $('input[name=rangeMax]').val(null);
                    $('input[name=rangeMin]').val(null);

                    _root.find('.step-box').last().addClass('submit');
                    _root.find('.step-box.submit a, .step-box.submit button').click(function() {

                    });

                    _root.find('.price-slider a').each(function() {

                        /*
                        $(this).mousedown(function(e){
                            console.log(e.currentTarget)
                            if ($(this).hasClass('max-pointer'))
                            {
                                $(this).parent().find('.range-wrap').hide();
                                $(this).find('.range-wrap').show();

                            } else {
                                $(this).parent().find('.range-wrap').hide();
                                $(this).find('.range-wrap').show();

                            }
                        });
                        */
                        $('body').mouseup(function() {
                            $(this).find('.range-wrap').hide();
                        });
                    });


                }
            }
            _root.find('.step-flow-contents > div').hide();
            _root.find('.step-flow-contents > div').eq(0).show();
        } else {

            var sizeSliderDefault = 0;
            _root.find(".step-flow-contents > div").append('<div class="dimmed-over-layer"></div>');
            _root.find(".step-flow-contents > div").eq(0).find('.dimmed-over-layer').remove();
            _root.find('.next-button').css('visibility', 'hidden');
            _root.find('.next-button.start').css('visibility', 'visible');
            /* 2015-06-23 */
            if (typeof dragbarVal.selectOption == 'undefined') {

            } else {

                var dragbarSelect1 = _root.find('.screen .slide-bar');
                if (dragbarSelect1.length > 0 && dragbarVal.selectOption) {
                    dragbarSelect1.on('slidechange', function() {
                        dragbarSelect1.parents('.step-box').attr({
                            'data-count': '1',
                            'data-default': sizeSliderDefault
                        }).find('.btn').show().end().find('.skip-nav').hide();
                    });
                }
            }
            $(window).resize(function() {
                var _initWidthset = _root.find('.screen .slide-bar').width();
                _root.find('.screen .ui-slider-handle .size-wrap span').width(_initWidthset).css('margin-left', (_initWidthset / 2) * -1 + 'px');

            }).resize();
            if (typeof dragbarVal.priceOption == 'undefined') {

            } else {
                var dragbarFind = $('.find-the-right .price-slider');
                if (dragbarFind.length > 0 && dragbarVal.priceOption) {

                    dragbarFind.on('slidechange', function() {
                        dragbarFind.parents('.step-box').attr('data-count', '1');
                        dragbarFind.parents('.step-box').find('.btn').show();
                        dragbarFind.parents('.step-box').find('.skip-nav').hide();
                    });

                    _root.find('.price-slider a').eq(0).addClass('min-pointer');
                    _root.find('.price-slider a').eq(1).addClass('max-pointer');


                    _root.find('.price-slider a').each(function() {

                        /*
                        $(this).mousedown(function(){
                            if ($(this).hasClass('max-pointer'))
                            {
                                $(this).parent().find('.range-wrap').hide();
                                $(this).find('.range-wrap').show();

                            } else {
                                $(this).parent().find('.range-wrap').hide();
                                $(this).find('.range-wrap').show();

                            }
                        });
                        */
                        $('body').mouseup(function() {
                            $(this).find('.range-wrap').hide();
                        });
                    });
                }

            }


            var _htmlCheck = '<i class="icon icon-check"></i>';
            var _htmlPass = '<i class="icon icon-circle-blank"></i>';
            var _htmlOn = '<i class="icon icon-circle"></i>';
            var _monitorInit = $('.icon-monitor').width();


            _root.find('.screen').find('.img-text').width(_monitorInit);
            $('.step-box').attr('data-count', 0);
            $(".step-flow-contents > div").eq(0).attr('data-count', 1);




            var _overflow2 = $("#header").height();
            var _overflow3 = $("#app-my-lg").height();

            var n;
            var m = new Array();
            var rootSC = _root.find('.flow-chart ul');
            var rootDiv = $(".step-flow-contents > div");
            $(".step-flow-contents > div").each(function(e) {
                n = parseInt($(this).offset().top);
                m.push(n);
            });
            _root.find('.flow-chart ul li a').click(function() {
                _root.attr('data-readyScroll', 0);
                if ($(this).parent().hasClass('on')) {
                    return false;
                }
                var dragTargetSelectIndex = $(this).parent().index();
                var pt = $('.find-the-right .step-flow-contents > div').eq(dragTargetSelectIndex).offset().top;
                $('body,html').stop(true, false).animate({
                    scrollTop: (pt + 70) + 'px'
                }, 200, function() {
                    for (var i = dragTargetSelectIndex; i <= m.length - 1; i++) {
                        rootSC.find('li').eq(i).find('.flow-icon').empty().append(_htmlOn);
                        rootSC.find('li').eq(i).removeClass('on').removeClass('checked').removeClass('pass');
                    }
                    _root.attr('data-readyScroll', 1).trigger('scroll');
                });
                return false;
            });

            _root.find('.next-button').each(function() {
                $(this).find('.submit, .skip-nav').click(function() {
                    var x = $(this).parents('.step-box').index();
                    var pt = $('.find-the-right .step-flow-contents > div').eq(x + 1).offset().top;
                    $('body,html').stop(true, false).animate({
                        scrollTop: (pt + 70) + 'px'
                    }, 400);
                    return false;
                });
            });
            _root.attr('data-readyScroll', 1);
            $(window).scroll(function() {
                if (_root.attr('data-readyScroll') == 1) {
                    setTimeout(function() {
                        rootDiv.each(function(e) { //e=index
                            if ($(window).scrollTop() > m[e] - 150) {
                                rootSC.find('li').removeClass('on');
                                rootSC.find('li').eq(e).find('.flow-icon').empty().append(_htmlOn);
                                rootSC.find('li').eq(e).addClass('on');

                                rootDiv.find('.dimmed-over-layer').remove();
                                rootDiv.removeClass("active").append('<div class="dimmed-over-layer"></div>');
                                rootDiv.eq(e).addClass("active").find('.dimmed-over-layer').remove();
                                rootDiv.find('.next-button').css('visibility', 'hidden');
                                rootDiv.eq(e).find('.next-button').css('visibility', 'visible');

                                if (e == 0) {
                                    rootSC.find('li').eq(e + 1).find('.flow-icon').empty().append(_htmlOn);
                                    rootSC.find('li').eq(e + 1).removeClass('on').removeClass('checked').removeClass('pass');
                                    return;
                                } else {
                                    rootSC.find('li').eq(e - 1).addClass('checked');
                                    rootSC.find('li').eq(e - 1).find('.flow-icon').empty().append(_htmlCheck);
                                }

                                if ($(this).parent().find(' > div').eq(e - 1).attr('data-count') == 0) {

                                    rootSC.find('li').eq(e - 1).addClass('pass');
                                    rootSC.find('li').eq(e - 1).find('.flow-icon').empty().append(_htmlPass);
                                }

                                for (var i = e; i <= m.length - 1; i++) {
                                    rootSC.find('li').eq(e + i).find('.flow-icon').empty().append(_htmlOn);
                                    rootSC.find('li').eq(e + i).removeClass('on').removeClass('checked').removeClass('pass');
                                }
                            }

                        });
                        _root.attr('data-readyScroll', 1);
                    }, 200);

                    _root.attr('data-readyScroll', 0);
                }

                if ($(window).scrollTop() > 160) {
                    if (!_root.find('.flow-chart').hasClass('float')) {
                        var ph = parseInt(_root.find('.flow-chart ul').height());
                        _root.find('.flow-chart .bg-pillar').height(ph - 15).css('top', '18px');
                        _root.find('.flow-chart').addClass('float');
                        _root.find('.step-flow-contents').addClass('float');
                        _root.find('.step-flow-contents').removeClass('start');
                    }
                } else {
                    if (_root.find('.flow-chart').hasClass('float')) {
                        _root.find('.flow-chart').removeClass('float');
                        _root.find('.step-flow-contents').removeClass('float');
                        _root.find('.flow-chart .bg-pillar').removeAttr('style');
                        _root.find('.step-flow-contents').addClass('start');

                    }
                }

                if ($(window).scrollTop() == 0) {
                    rootDiv.find('.dimmed-over-layer').remove();
                    rootDiv.append('<div class="dimmed-over-layer"></div>');
                    rootDiv.eq(0).find('.dimmed-over-layer').remove();
                    rootSC.find('li').removeClass('on').removeClass('checked').removeClass('pass');
                    rootSC.find('li').find('.flow-icon').empty().append(_htmlOn);
                    rootSC.find('li').eq(0).addClass('on');
                    rootDiv.find('.next-button').css('visibility', 'hidden');
                    rootDiv.eq(0).find('.next-button').css('visibility', 'visible');
                }
                var _overflow1 = $("#content").height();
                var _overflow4 = _overflow1 + _overflow2 + _overflow3;
                if ($(window).scrollTop() > _overflow4 - 500) {
                    if (_root.find('.flow-chart').css('display') != "none") {
                        _root.find('.flow-chart').hide();
                    }
                } else {
                    if (_root.find('.flow-chart').css('display') == "none") {
                        _root.find('.flow-chart').show();
                    }
                }
            }).scroll();

            _root.find('.step-flow-contents input').each(function() {
                if ($(this).attr('disabled')) {
                    $(this).parent().parent().addClass('disable');
                }

                $(this).click(function() {
                    if ($(this).parents('.checkbox-wrap').hasClass('tile-button') || $(this).parents('.checkbox-wrap').hasClass('big-tile-button')) {
                        if ($(this).parent().parent().hasClass('check')) {
                            $(this).removeAttr('checked');
                            $(this).parent().parent().removeClass('check');
                        } else {
                            $(this).attr('checked', 'checked');
                            $(this).parent().parent().addClass('check');
                        }
                    } else {
                        return false;
                    }

                    $(this).parents('.checkbox-wrap > div').each(function() {
                        var a = $(this).parent().find('.check').length;
                        $(this).parents('.step-box').attr('data-count', a);
                        if ($(this).parents('.step-box').attr('data-count') > 0) {
                            $(this).parents('.checkbox-wrap').parent().find('.btn.submit').show();
                            $(this).parents('.checkbox-wrap').parent().find('.skip-nav').hide();
                        } else {
                            $(this).parents('.checkbox-wrap').parent().find('.btn.submit').hide();
                            $(this).parents('.checkbox-wrap').parent().find('.skip-nav').show();
                        }
                    });

                });

            });

            _root.find('.step-flow-contents label').each(function() {
                if ($(this).find('span.option-text').attr('data-disclaimer')) {
                    $(this).append('<p class="info-icon"></p>');
                }
                $(this).bind("mouseenter", function() {
                    var _dText = $(this).find('span.option-text').attr('data-disclaimer');
                    if (_dText == undefined) {
                        return;
                    }

                    $('.checkbox-wrap .icon-triangle-up').remove();
                    $('.checkbox-wrap .disclaimer').remove();
                    var dh = $(this).outerHeight(true) + 16;
                    $(this).append('<i class="icon icon-triangle-up"></i>');
                    var a = $(this).parent().index();

                    if ($(window).width() < 1203 && $(window).width() > 917) {
                        var k = a % 3;
                        if (k == 0) {
                            $(this).parent().append('<div class="disclaimer" style="left:' + 0 + 'px; top:' + dh + 'px; width:' + $('.checkbox-wrap').width() + 'px; z-index:999"><p>' + _dText + '</p></div>');
                        } else {
                            $(this).parent().append('<div class="disclaimer" style="left:' + ((k * 215) * -1) + 'px; top:' + dh + 'px; width:' + $('.checkbox-wrap').width() + 'px; z-index:999"><p>' + _dText + '</p></div>');
                        }
                    } else if ($(window).width() < 916) {
                        var k = a % 2;
                        if (k == 0) {
                            $(this).parent().append('<div class="disclaimer" style="left:' + 0 + 'px; top:' + dh + 'px; width:' + $('.checkbox-wrap').width() + 'px; z-index:999"><p>' + _dText + '</p></div>');
                        } else {
                            $(this).parent().append('<div class="disclaimer" style="left:' + ((k * 215) * -1) + 'px; top:' + dh + 'px; width:' + $('.checkbox-wrap').width() + 'px; z-index:999"><p>' + _dText + '</p></div>');
                        }
                    } else {
                        var k = a % 4;
                        $(this).parent().append('<div class="disclaimer" style="left:' + ((k * 215) * -1) + 'px; top:' + dh + 'px; width:' + $('.checkbox-wrap').width() + 'px; z-index:999"><p>' + _dText + '</p></div>');
                    }
                });
                $(this).bind("mouseleave", function() {
                    $('.checkbox-wrap .icon-triangle-up').remove();
                    $('.checkbox-wrap .disclaimer').remove();
                });
                $(this).find("input").focus(function(e) {
                    $(e.currentTarget).parent("label").addClass("focus").trigger("mouseenter");
                });
                $(this).find("input").blur(function(e) {
                    $(e.currentTarget).parent("label").removeClass("focus").trigger("mouseleave");
                });
            });
        }
    }

    function formatCommas(numString) {

        var re = /,|\s+/g;
        numString = numString.replace(re, "");
        re = /(-?\d+)(\d{3})/;
        while (re.test(numString)) {
            numString = numString.replace(re, "$1,$2");
        }
        return numString;
    }

    function listMargin() {
        var _root = $('.find-the-right');
        _root.find('.other-matches-item ul li:nth-child(3n)').css('margin-right', '0');
    }

    function checkSliderValue(o, ui) {
        if (!o) return false;
        var v = o.slider("option", "values");
        var min = o.slider("option", "min");
        var max = o.slider("option", "max");
        var c = v[0] == v[1];
        var r;

        if (!c) r = ui.value;
        else if ($(ui.handle).index() == 2 && v[1] == min) { //min
            r = min + 1;
            ui.values[1] = r;
        } else if ($(ui.handle).index() == 1 && v[0] == max) { //max
            r = max - 1;
            ui.values[0] = r;
        } else {
            r = ui.value;
        }
        o.slider("option", "values", ui.values);
        return r;
    }

    function rtOptions(o, idx) {
        var d = null;
        for (var i = 0; i < o.length; i++) {
            if (i == idx) {
                var a = $.map(o[i], function(k, v) {
                    d = [v, k];
                });
            }
        };
        return d;
    }

    function optionsLen(o) {
        var i = 0;
        for (var key in o) {
            i++;
        }
        return i;
    }
});
