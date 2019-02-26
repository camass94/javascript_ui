/* global define */

/**
 * CAll To Action Carousel module.
 * @module call-to-action-carousel
 */
define(['global-config', 'jquery'], function(globalConfig, $) {

    'use strict';

    var readMore = {};

    var minimizeContent = function() {
        $('.read-more').each(function(idx, item) {

            var minimized_elements = $('p.minimize');

            var charactersToShow = 100;


            if (typeof $(this).attr('data-characters-to-show') !== "undefined") {
                charactersToShow = $(this).attr('data-characters-to-show');
            }

            minimized_elements.each(function() {
                var t = $(this).html();
                if (t.length < charactersToShow) return;

                $(this).html(
                    t.slice(0, charactersToShow) + '<span>... </span><a href="#" class="read-more">READ MORE</a>' +
                    '<span style="display:none;">' + t.slice(charactersToShow, t.length)
                );

            });
            $(minimized_elements).nextAll().hide();

            $('a.read-more', minimized_elements).click(function(event) {
                event.preventDefault();
                $(this).hide().prev().hide();
                $(this).next().show();
                $(minimized_elements).nextAll().show();

            });
        });
    };

    if (globalConfig.isMobile) {
        minimizeContent();
    }

    return readMore;
});
