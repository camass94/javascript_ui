define(['global-config', 'jquery'], function(globalConfig, $) {
    'use strict';

    var _footerRoot = $('.footer-content');
    _footerRoot.find('.expand-button a').click(function() {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $(this).find('.icon-menu-plus').removeClass('hide');
            $(this).find('.icon-menu-minus').addClass('hide');
            $(this).parent().next().stop(true, false).slideUp('fast');
        } else {
            $(this).addClass('active');
            $(this).find('.icon-menu-plus').addClass('hide');
            $(this).find('.icon-menu-minus').removeClass('hide');
            $(this).parent().next().stop(true, false).slideDown('fast');
            $(this).parents('.expand-footer-wrap').find('.expand-button').prev().each(function() {
                var fixHL = $(this).height();
                $(this).parent().find('.expand-button').css('height', fixHL).css('line-height', fixHL + 'px');
                $(this).parent().find('.expand-button a').css('height', fixHL).css('line-height', fixHL + 'px');
            });
            $(this).parents('.expand-footer-wrap').find('li').each(function() {
                var countSpan = $(this).find('>span').length;
                if (countSpan == 1) {
                    $(this).find('>span>a').css('width', '100%');
                }
            });
        }
        return false;
    });


    $(window).resize(function() {
        _footerRoot.find('.expand-footer-wrap').find('.expand-button').prev().each(function() {
            var fixHL = $(this).height();
            $(this).parent().find('.expand-button').css('height', fixHL).css('line-height', fixHL + 'px');
            $(this).parent().find('.expand-button a').css('height', fixHL).css('line-height', fixHL + 'px');
        });
        _footerRoot.find('.expand-footer-wrap').find('li').each(function() {
            var countSpan = $(this).find('>span').length;
            if (countSpan == 1) {
                $(this).find('>span>a').css('width', '100%');
                $(this).find('>span').css('width', '100%');
            }
        });
    }).resize();
});
