define(['jquery'], function($) {

    var _site = $('.site-map-content');
    if ($('body').hasClass('is-mobile')) {
        _site.find('h2').each(function() {
            if ($(this).next().hasClass('depth1')) {
                $(this).find('a').css('width', '90%');
                $(this).append('<span class="tab-button"><a href="#"><i class="icon icon-menu-plus"></i></a></span>')
            }
        });

        _site.find('h3').each(function() {
            if ($(this).next().hasClass('depth2')) {
                $(this).find('a').css('width', '90%');
                $(this).append('<span class="tab-button"><a href="#"><i class="icon icon-menu-plus"></i></a></span>')
            }
        });

        $('.tab-button').click(function() {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $(this).find('i').removeClass('icon-menu-minus').addClass('icon-menu-plus');
                $(this).parent().next().stop(true, false).slideUp('fast');
            } else {
                $(this).addClass('active');
                $(this).find('i').removeClass('icon-menu-plus').addClass('icon-menu-minus');
                $(this).parent().next().stop(true, false).slideDown('fast');
            }
            return false;
        });
    }

});
