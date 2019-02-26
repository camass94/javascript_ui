/* global define */


define(['jquery', 'touchswipe', 'lazyload'], function($, swipe, lazyload) {

    'use strict';

    $(document).ready(function() {
        // web
        var _stepChart = $('.step-up-chart');
        var _stepChartM = $('.step-up-chart-m');
        var _stepFlag = false;
        var _chkMobile = $('body').hasClass('is-mobile');

        _stepChart.find('button.expand-button').click(function() {

            if (_stepFlag == false) {
                _stepFlag = true;
                $(this).find('i').removeClass().addClass('icon icon-tab-minus');
                /* LGEES-2647 20170102 modify */
                $(this).find('span').text($(this).attr("data-collapse"));
                /* //LGEES-2647 20170102 modify */
                _stepChart.find('.expand-area').show();
            } else {
                _stepFlag = false;
                $(this).find('i').removeClass().addClass('icon icon-tab-plus');
                /* LGEES-2647 20170102 modify */
                $(this).find('span').text($(this).attr("data-expand"));
                /* //LGEES-2647 20170102 modify */
                _stepChart.find('.expand-area').hide();
            }
        });

        // mobile
        if (_chkMobile == true) {
            // init
            var _chkW = $('.chart-section').outerWidth();
            var _chkL = $('.chart-section th').length;
            var _chkH = $('.chart-table tr').height();
            var _chkWW = $('.step-up-chart-m').width();
            var _stepFlagM = false;
            var asd;
            var chkScroll = null;
            var chkScrollFlag = 1;
            var ace = new Array();

            if($('.product-spec-list td').length <= 0){
                _stepChartM.find(".hidden-chart-table").hide();
                return false;
            }

            // button action
            $('.chart-toggle').click(function() {
                var _reH = _stepChartM.find('.chart-table tr').height();
                _reH = Math.floor(_reH);
                $('.item-list tr').height(_reH);
                $('.product-spec-list tr').height(_reH);


                if ($(".chart-section").attr('data-check') == '1') {
                    _stepFlagM = false;
                    $(".chart-table").swipe('option', 'allowPageScroll', 'auto');
                    var _chkWW = $('.step-up-chart-m').width();
                    $('.item-list, .chart-scroll-box').removeClass('active');
                    $('.chart-toggle').show();
                    $('.hidden-chart-table').stop().animate({
                        'left': (_chkWW * 0.80)
                    }, 200);
                    $('.item-list tr').each(function(e) {
                        asd = $(this).height();
                        $('.chart-section tbody tr').eq(e).height(asd);
                    });
                    $(".chart-section").attr('data-check', '1');
                    commonAction()
                }
                if (_stepFlagM == false) {
                    _stepFlagM = true;
                    var a = $('.step-up-chart-m').width();
                    var b = Math.floor(a * 0.55);
                    var c = a * 0.45;
                    _stepChartM.find('.chart-scroll-box').width(b);
                    $('.item-list, .chart-scroll-box').addClass('active');
                    _stepChartM.find('.hidden-chart-table').stop().animate({
                        'left': c
                    }, 200);
                    $(this).hide();
                }

            });


            // swipe action
            $(".chart-table").swipe({

                swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
                    // check swipe direction

                    if (direction == 'left') {
                        $('.chart-toggle').trigger('click');
                        $(this).swipe('option', 'allowPageScroll', 'auto');
                        $('.chart-toggle').hide();
                        $('.chart-scroll-box').scroll(function() {
                            chkScroll = $('.chart-scroll-box').scrollLeft();
                            if (chkScroll <= 0) {
                                _stepFlagM = false;
                                chkScrollFlag = 0;
                                $(".chart-section").attr('data-check', '0');
                                $('.chart-toggle').show();
                                $(".chart-table").swipe('option', 'allowPageScroll', 'vertical');
                                var _chkWW = $('.step-up-chart-m').width();
                                $('.item-list, .chart-scroll-box').removeClass('active');
                                $('.hidden-chart-table').stop().animate({
                                    'left': (_chkWW * 0.80)
                                }, 200);
                                setTimeout(function() {
                                    _stepChartM.find('td').each(function(e) {
                                        var x = $(this).outerHeight(true);
                                        ace.push(x);
                                        ace.sort(compNumberReverse);

                                        function compNumberReverse(a, b) {
                                            return b - a;
                                        }

                                    });

                                    $('.product-spec-list tr, .item-list tbody tr').height(ace[0]);
                                    commonAction();
                                }, 100);
                            } else {
                                chkScrollFlag = 1;
                                $(".chart-section").attr('data-check', '1');
                                $('.chart-toggle').hide();
                            }

                        });
                    }
                    $('.chart-scroll-box').scroll(function() {
                        chkScroll = $('.chart-scroll-box').scrollLeft();

                        if (chkScroll <= 0) {
                            chkScrollFlag = 0;
                            $(".chart-section").attr('data-check', '1');

                        } else {
                            chkScrollFlag = 1;
                            $(".chart-section").attr('data-check', '0');


                        }

                    });

                },
                allowPageScroll: "vertical",
                threshold: 50,
                excludedElements: "label, input, select, textarea, .noSwipe",
                click: function(event, target) {
                    $(target).click();
                }
            });

            // mobile orientation action
            $(window).on("orientationchange", function() {
                // init 
                ace = [];
                var a = $('.step-up-chart-m').width();
                var b = Math.floor(a * 0.55);
                $('.item-list tbody tr, .product-spec-list tr').removeAttr('style');
                $('.chart-scroll-box').width(b);
                $('.hidden-chart-table').css('left', (a * 0.80) + 'px');
                if (_stepFlagM == true) {
                    var a = $('.step-up-chart-m').width();
                    var b = Math.floor(a * 0.55);
                    $('.chart-scroll-box').width(b);
                    $('.hidden-chart-table').css('left', (a * 0.45) + 'px');
                }

                setTimeout(function() {
                    _stepChartM.find('td').each(function(e) {
                        var x = $(this).outerHeight(true);
                        ace.push(x);
                        ace.sort(compNumberReverse);

                        function compNumberReverse(a, b) {
                            return b - a;
                        }

                    });

                    $('.product-spec-list tr, .item-list tbody tr').height(ace[0]);
                    commonAction();
                }, 100);

            });
        }

        function commonAction() {
            setTimeout(function() {
                var _chkMHeight = _stepChartM.find('.item-list tr').height();
                var _fixTop = 14;
                var _fixHeight = _chkMHeight + _fixTop;
                _stepChartM.find('.chart-toggle').css('margin-top', (_fixHeight));
            }, 200)
            if ($(window).width() > 462) {
                setTimeout(function() {
                    var _chkMHeight = _stepChartM.find('.item-list tr').height();
                    var _fixTop = 34;
                    var _fixHeight = _chkMHeight + _fixTop;
                    _stepChartM.find('.chart-toggle').css('margin-top', (_fixHeight));
                }, 200)
            }
        }
    });


});
