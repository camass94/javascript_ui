/**
 * Hero Carousel module.
 * @module hero/hero-carousel
 */
define(['jquery', 'slick-carousel'], function($, slick) {

    'use strict';

    var carousel = {};

    $('.hero-carousel').slick({
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 300,
        dots: true,
        arrows: false,
        pauseOnHover: true,
        pauseOnDotsHover: true
    });

    $('.hero-carousel-arrow').slick({
        //autoplay: true,
        lazyLoad: 'ondemand',
        autoplaySpeed: 3000,
        speed: 300,
        dots: true,
        arrows: true,
        pauseOnHover: true,
        pauseOnDotsHover: true
    });
    /*
	$('.hero-carousel-arrow .slide').each(function() {
		var video_url = $(this).find('.visuals').attr('data-video-url');
		if(video_url) {
			var html = '',
				url = video_url.split("/");
			url = url[url.length-1];
			html = '<div class="hero_video"><div><iframe width="100%" height="100%" src="https://www.youtube.com/embed/'+url+'" frameborder="0" allowfullscreen></iframe></div></div>';
			$(this).find('.visuals').append(html);
		}
	});
	*/

    //console.log('hero-carousel');

    // 360 vr 
    $('a.product-360-view').on('click', function() {
        var vrUrl = XSSfilter($(this).data('href'));
        var vrTitle = XSSfilter($(this).data('iframe-title'));
        var vrHeight = parseInt($(document).outerHeight()) - 1 + 201;
        $('body').append('<div class="view360 fade open" tabindex="0" id="view360" style="height:' + vrHeight + 'px;"><div class="payload"><iframe id="modalFrm" frameborder="0" src="' + vrUrl + '" title="' + vrTitle + '" scrolling="auto"></iframe><a href="#" class="close" title="click to close"><i class="icon icon-close"></i></a></div></div>')
        $('#view360').focus();
        $('#view360 a.close').unbind('click').click(function() {
            $("#view360").remove();
            $('a.product-360-view').focus();
            return false;
        });
        return false;
    });

    return carousel;
});
