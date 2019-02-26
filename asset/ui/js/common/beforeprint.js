define(['jquery'], function($) {
    'use strict';


    (function() {
        var beforePrint = function() {
            //alert('Functionality to run before printing.');
            /*
			if($('#content > .compare').is('div') && !$('body').hasClass('is-mobile')) {
				$('.compare-view-item .compare-view-left .print-btn').trigger('click');
				return false;
			}*/

            // PDP 
            if ($('.product').is('div')) {
                $('.product .stickynav').removeClass('float');
                $('.product .tabs-nav-wrapper').removeClass('float').removeAttr('style');
            }
            $('img.lazy').each(function() {
                if ($(this).data('original') && $(this).data('original') != "") {
                    $(this).attr('src', $(this).data('original')).removeClass('lazy');
                }
            });
            if ($('.compare').is('div')) {
                $('.compare-view-item.sticky').removeClass('sticky');
                $('.compare-view-item-holder.on').removeClass('on');
                $('.info-title > li, .info-cont-list li').each(function() {
                    var n = parseInt($(this).outerHeight()) + 44;
                    if (!$(this).data('defaultSize')) $(this).css('height', n).data('defaultSize', n);
                    else $(this).css('height', $(this).data('defaultSize'));
                });
            }
        };
        var afterPrint = function() {
            // alert('Functionality to run after printing');
        };

        if (window.matchMedia) {
            var mediaQueryList = window.matchMedia('print');
            mediaQueryList.addListener(function(mql) {
                if (mql.matches) {
                    beforePrint();
                } else {
                    afterPrint();
                }
            });
        }
        window.onbeforeprint = beforePrint;
        window.onafterprint = afterPrint;
    }());

});
