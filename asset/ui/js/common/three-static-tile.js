define(['jquery'], function($) {
    if ($('body').hasClass('is-mobile')) {
        //mobile
        $('.homepage-content').each(function() {
            $(this).find('.play-vod').click(function() {
                $(this).parents('.hc-wrap').find('.vod-box').css('z-index', '2');

                var _vodHeight = $(this).parents('.hc-wrap').find('.wide').outerHeight(true);
                var _dataVODtype = $(this).parents('.hc-wrap').find('.play-vod').attr('data-video-type');
                var _dataVODtitle = $(this).parents('.hc-wrap').find('.play-vod').attr('data-iframe-title');
                var _dataVOD = $(this).parents('.hc-wrap').find('.play-vod').attr('data-embed-code');

                if (_dataVODtype == 'youtube') {
                    //youtube
                    $(this).parents('.hc-wrap').find('.vod-box').empty().append('<iframe width="100%" height="' + _vodHeight + '" src="https://www.youtube.com/embed/' + _dataVOD + '?rel=0&amp;showinfo=0&wmode=opaque" frameborder="0" allowfullscreen="" title="' + _dataVODtitle + '"></iframe><a href="#" title="Close Video" class="close no-underline"><i class="icon icon-video-close"></i></a>');	// LGEGMO-2881 20170518 modify
                } else if (_dataVODtype == 'bc') {
                    //brightcove
                    var _dataVODid = $(this).parents('.hc-wrap').find('.play-vod').attr('data-video-id');
                    var _dataVODaccount = $(this).parents('.hc-wrap').find('.play-vod').attr('data-account');
                    var _dataVODplayer = $(this).parents('.hc-wrap').find('.play-vod').attr('data-player');
                    /* LGEGMO-4062 */
                    $(this).parents('.hc-wrap').find('.vod-box').empty().append('<iframe width="100%" height="' + _vodHeight + '" src="https://players.brightcove.net/' + _dataVODaccount + '/' + _dataVODplayer + '_default/index.html?videoId=' + _dataVODid + '" title="' + _dataVODtitle + '" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe><a href="#" title="Close Video" class="close no-underline"><i class="icon icon-video-close"></i></a>');	// LGEGMO-2881 20170518 modify
                    /*//LGEGMO-4062 */
                } else {
                    // mp4 , webm : video
                    var _dataVODloop = $(this).parents('.hc-wrap').find('.play-vod').attr('data-video-loop');
                    var _dataVODvid = $(this).parents('.hc-wrap').find('.play-vod').attr('data-video-id');
                    var _dataVODmp4 = $(this).parents('.hc-wrap').find('.play-vod').attr('data-video-file-mp4');
                    var _dataVODwebm = $(this).parents('.hc-wrap').find('.play-vod').attr('data-video-file-webm');
                    $(this).parents('.hc-wrap').find('.vod-box').empty().append('<video preload="auto" controls ' + _dataVODloop + ' width="100%" height="' + _vodHeight + '" id="' + _dataVODvid + '" title="' + _dataVODtitle + '"><source src="' + _dataVODmp4 + '" type="video/mp4"><source src="' + _dataVODwebm + '" type="video/webm"><span>Your browser does not support the video tag.</span></video><a href="#" title="Close Video" class="close no-underline"><i class="icon icon-video-close"></i></a>');	// LGEGMO-2881 20170518 modify
                }

                $(this).parents('.hc-wrap').find('a.close').unbind('click').bind('click', function() {
                    $(this).removeAttr('style');
                    $(this).parents('.hc-wrap').find('.vod-box').empty().css('z-index', '0');
                    return false;
                });
                return false;
            });


        });
    } else {
        //web
        var baseRoot = $('.homepage-content');
        var _allWidth = baseRoot.find('.hc-wrap').width();
        var _wideWidth = baseRoot.find('.wide').outerWidth(true);
        var _imageWidth = baseRoot.find('.image-1').outerWidth(true);
        var x = Math.ceil(((_allWidth - ((_wideWidth + (_imageWidth * 2)))) / 2) + _imageWidth);
        var y = Math.ceil(((_allWidth - ((_wideWidth + (_imageWidth * 2)))) / 2));

        $(window).resize(function() {
            baseRoot.each(function() {
                var _allWidth = $(this).find('.hc-wrap').width();
                var _wideWidth = $(this).find('.wide').outerWidth(true);
                var _imageWidth = $(this).find('.image-1').outerWidth(true);
                var x = Math.ceil(((_allWidth - ((_wideWidth + (_imageWidth * 2)))) / 2) + _imageWidth);
                var y = Math.ceil(((_allWidth - ((_wideWidth + (_imageWidth * 2)))) / 2));

                if ($(this).hasClass('wide-left') == true) {

                    $(this).find('.image-1').css('right', x);
                    //$(this).find('.hc-wrap').css('padding-bottom',y);

                } else {

                    $(this).find('.image-2').css('left', x);
                    //$(this).find('.hc-wrap').css('padding-bottom',y);

                }

                if ($(this).find('.hc-wrap').hasClass('active') == true) {
                    var _a = $(this).find('.hc-wrap').width();
                    var _b = $(this).find('.image-1').width();
                    var _c = $(this).find('.wide').width();
                    var _d = $(this).find('.hc-wrap').outerWidth(true);
                    var _e = $(this).find('.hc-wrap').height();
                    var _f = $(this).find('.hc-wrap').outerHeight(true);
                    var _g = $(this).find('.image-1').height();

                    var _ca2 = _f - _e;
                    var _ca3 = (_g * 2) + _ca2;
                    var _ca4 = _g + _ca2 + 8;
                    var _ca1 = _a - (_b + _ca2) - 8;


                    $(this).find('.hc-wrap').find('.wide').width(_ca1).height(_ca3);

                    if ($(this).hasClass('wide-left') == true) {
                        $(this).find('.image-box').css('right', '0');
                        $(this).find('.image-1').css('top', _ca4);
                    } else {
                        $(this).find('.image-box').css('left', '0');
                        $(this).find('.image-2').css('top', _ca4);
                        $(this).find('.hc-wrap').height(_ca3);
                    }
                }
            });
        }).resize();

        $('.homepage-content').each(function() {

            $(this).find('.play-vod').click(function() {

                var _height = $(this).parents('.cont-box').height();
                var _btmMargin = $(this).parents('.hc-wrap').outerHeight(true);
                var _btmMargin2 = $(this).parents('.hc-wrap').find('.image-1').height();
                var _btmMargin3 = _btmMargin - _btmMargin2;
                var _caculate1 = Math.ceil((_btmMargin2 * 2) + _btmMargin3);
                var _width = $(this).parents('.hc-wrap').width();
                var _width1 = $(this).parents('.hc-wrap').find('.wide').width();
                var _width2 = $(this).parents('.hc-wrap').find('.image-1').width();
                var _width3 = $(this).parents('.hc-wrap').find('.image-2').width();
                var _reWidth = Math.ceil((_width - (_width1 + _width2 + _width3)) / 2);
                var _caculate2 = Math.ceil((_width1 + _width2) + _reWidth);
                var _animateTimer = 200;

                $(this).parent().hide();
                $(this).parents('.hc-wrap').find('.wide').stop().animate({
                        width: _caculate2,
                        height: _caculate1
                    }, _animateTimer,
                    function() {

                        $(this).find('a.close').unbind('click').bind('click', function() {
                            var _width4 = $(this).parents('.hc-wrap').width();
                            var _width5 = $(this).parents('.hc-wrap').width() * 0.4275;
                            var _width6 = $(this).parents('.hc-wrap').find('.image-1').width();
                            var _reRightC = Math.ceil(((_width4 - ((_width6 * 2) + _width5)) / 2) + _width6);
                            if ($(this).parents('.homepage-content').hasClass('wide-left') == true) {
                                $(this).parents('.hc-wrap').find('.image-1').stop().animate({
                                    right: _reRightC,
                                    top: '0'
                                }, _animateTimer);
                            } else {
                                $(this).parents('.hc-wrap').stop().animate({
                                    height: _btmMargin2 + _btmMargin3
                                }, _animateTimer, function() {
                                    $(this).css('height', 'auto');
                                });
                                $(this).parents('.hc-wrap').find('.image-2').stop().animate({
                                    left: _reRightC,
                                    top: '0'
                                }, _animateTimer);
                            }

                            $(this).parents('.hc-wrap').removeClass('active');
                            $(this).parents('.hc-wrap').find('.wide').stop().animate({
                                    width: _width * 0.4275,
                                    height: _btmMargin2
                                }, _animateTimer,
                                function() {
                                    $(this).removeAttr('style');
                                    $(this).parents('.hc-wrap').find('.vod-box').empty();
                                    $(this).parents('.hc-wrap').find('.cont-box').show();
                                });

                            return false;
                        })
                    }
                );

                var _dataVODtype = $(this).parents('.hc-wrap').find('.play-vod').attr('data-video-type');
                var _dataVODtitle = $(this).parents('.hc-wrap').find('.play-vod').attr('data-iframe-title');
                var _dataVOD = $(this).parents('.hc-wrap').find('.play-vod').attr('data-embed-code');

                if (_dataVODtype == 'youtube') {
                    //youtube
                    $(this).parents('.hc-wrap').find('.vod-box').empty().append('<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + _dataVOD + '?rel=0&amp;showinfo=0&wmode=opaque" frameborder="0" allowfullscreen="" title="' + _dataVODtitle + '"></iframe><a href="#" title="Close Video" class="close no-underline"><i class="icon icon-video-close"></i></a>');	// LGEGMO-2881 20170518 modify
                } else if (_dataVODtype == 'bc') {
                    //brightcove
                    var _dataVODid = $(this).parents('.hc-wrap').find('.play-vod').attr('data-video-id');
                    var _dataVODaccount = $(this).parents('.hc-wrap').find('.play-vod').attr('data-account');
                    var _dataVODplayer = $(this).parents('.hc-wrap').find('.play-vod').attr('data-player');
                    /* LGEGMO-4062 */
                    $(this).parents('.hc-wrap').find('.vod-box').empty().append('<iframe width="100%" height="100%" src="https://players.brightcove.net/' + _dataVODaccount + '/' + _dataVODplayer + '_default/index.html?videoId=' + _dataVODid + '" title="' + _dataVODtitle + '" allowfullscreen webkitallowfullscreen mozallowfullscreen ></iframe><a href="#" title="Close Video" class="close no-underline"><i class="icon icon-video-close"></i></a>');	// LGEGMO-2881 20170518 modify
                    /*//LGEGMO-4062 */
                } else {
                    // mp4 , webm : video
                    var _dataVODloop = $(this).parents('.hc-wrap').find('.play-vod').attr('data-video-loop');
                    var _dataVODvid = $(this).parents('.hc-wrap').find('.play-vod').attr('data-video-id');
                    var _dataVODmp4 = $(this).parents('.hc-wrap').find('.play-vod').attr('data-video-file-mp4');
                    var _dataVODwebm = $(this).parents('.hc-wrap').find('.play-vod').attr('data-video-file-webm');
                    $(this).parents('.hc-wrap').find('.vod-box').empty().append('<video preload="auto" controls ' + _dataVODloop + ' width="100%" height="100%" id="' + _dataVODvid + '" title="' + _dataVODtitle + '"><source src="' + _dataVODmp4 + '" type="video/mp4"><source src="' + _dataVODwebm + '" type="video/webm"><span>Your browser does not support the video tag.</span></video><a href="#" title="Close Video" class="close no-underline"><i class="icon icon-video-close"></i></a>');	// LGEGMO-2881 20170518 modify
                }



                if ($(this).parents('.homepage-content').hasClass('wide-left') == true) {
                    var _reHeight = $(this).parents('.hc-wrap').find('.image-1').outerHeight(true);
                    var _reHeight2 = $(this).parents('.hc-wrap').outerHeight(true);
                    var _reCaculate1 = Math.ceil(_reHeight + _btmMargin3);
                    $(this).parents('.hc-wrap').find('.image-1').stop().animate({
                        top: _reCaculate1 + 8,
                        right: 0
                    }, _animateTimer);
                } else {
                    var _reHeight = $(this).parents('.hc-wrap').find('.image-1').outerHeight(true);
                    var _reHeight2 = $(this).parents('.hc-wrap').outerHeight(true);
                    var _reCaculate1 = Math.ceil(_reHeight + _btmMargin3);
                    $(this).parents('.hc-wrap').stop().animate({
                        height: _caculate1 + _btmMargin3
                    }, _animateTimer);
                    $(this).parents('.hc-wrap').find('.image-2').stop().animate({
                        top: _reCaculate1 + 8,
                        left: 0
                    }, _animateTimer);
                }

                $(this).parents('.homepage-content').find('.hc-wrap').addClass('active');


                return false;
            });


        });

        if ($('html').hasClass('lt-ie9')) {
            baseRoot.find('.video').each(function() {
                var k = $(this).find('a.play-vod').attr('data-video-type');
                if (k == 'bc') {
                    $(this).find('a.play-vod').hide();
                }
            });
        }
    };
});
