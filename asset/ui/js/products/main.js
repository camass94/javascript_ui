/**
 * The products main module.
 * @module products/products
 */
var lgFilter = {},
    XSSfilter,
    eco_i = 0;

define(['jqueryui', 'lazyload', 'mkt/touch-punch', 'mkt/e-smart-zoom-jquery', 'mkt/hero-carousel', 'mkt/call-to-action-carousel', 'mkt/text-more', 'mkt/product-lists-carousel', 'mkt/product-lists-view-more', 'mkt/product-ask', 'mkt/product-hero', 'mkt/product-stickynav', 'mkt/product-video', 'mkt/app-tabs', 'mkt/product-stepchart', 'mkt/product-lazy', 'mkt/filter', 'mkt/group-slick', 'mkt/find-a-store', 'mkt/product-compare', 'mkt/find-the-right', 'mkt/find-the-right-filter', 'mkt/product-zoom', 'mkt/site-map', 'mkt/legal', 'mkt/videoload', 'mkt/basicmotion', 'mkt/modelsticky', 'mkt/slider-select', 'mkt/product-detail', 'mkt/file-download', 'common/bestbuy', 'mkt/search-result','products/component/product-interaction', 'products/component/jquery.modal','products/component/product-model-group', 'products/component/sticky-navigation', 'products/component/microsite-template', 'products/component/product-lists-thumbnail', 'react-dotdotdot'], function() {//LGEGMO-3850 ADD	// LGEGMO-2230 ADD // LGEPJT-253 20170804 add /* LGEPJT-313 : 20171026 add */ /* LGEPJT-337 : 20171121 add */

    'use strict';

    // chosen
    var sortSelect = $('.sort select');
    if (sortSelect.is('select') && !$('body').hasClass('is-mobile') && sortSelect.length > 0) {
        sortSelect.chosen({
            disable_search: true
        });
    }

    lgFilter = {
        locale: "/" + $("html").data("countrycode"),
        productId: $("html").data("product-id")
    }

    XSSfilter = function(content) {
        return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    if ($(".ui-slider").length > 0) {
        $(".ui-slider").each(function(i) {
            if ('ontouchend' in document) {
                if ($._data(this, "events") && $._data(this, "events").touchend === undefined) {
                    //if(touchend && !$._data(this,"events").touchend && !$._data(this, "events" ).touchstart && !$._data(this, "events" ).touchmove){
                    $(this).bind({
                        touchstart: $.proxy($.ui.mouse.prototype, '_touchStart'),
                        touchmove: $.proxy($.ui.mouse.prototype, '_touchMove'),
                        touchend: $.proxy($.ui.mouse.prototype, '_touchEnd')
                    });
                };
            };
        });
    }
    /* LGEGMO-2999 : 20170329 modify */
    $(document).ajaxStart(function() {
        // show loader on start
    	/* LGEPJT-253 20170804 modify */
		var modelGroup = $(this.activeElement).closest(".model-group"); 
		if(!$(modelGroup).length){
			$("html").append('<div class="page-dimmed"><span>&nbsp;</span></div>');
		};
		/*// LGEPJT-253 20170804 modify */
    }).ajaxComplete(function() {
        // hide loader on success
        $("html > div.page-dimmed").remove()
    });
    /*//LGEGMO-2999 : 20170329 modify */
    if($("img[data-lazy]").length){
        $("img[data-lazy]").each(function(){
            $(this).attr("src", $(this).data("lazy"));
            $(this).removeAttr("data-lazy");
        })
    }
	
	$('.wrapper').on('click', '.cta-dropdown a', function(e) {

		var $parentDropdown = $(this).closest('.cta-dropdown');

		if($(this).data('sc-role') == 'dropdown'){
			e.preventDefault();
			e.stopPropagation();
			
			if($('.cta-dropdown').not($parentDropdown).hasClass('active')) $('.cta-dropdown').removeClass('active');

			if(!$parentDropdown.hasClass('active')) {
				$parentDropdown.addClass('active');
			}else{
				$parentDropdown.removeClass('active');
			}
			
			var $lastItem = $parentDropdown.find('ul li').filter(':last')
			$lastItem.on('focusout', 'a', function(){
				$parentDropdown.removeClass('active');
			});
		}
	});

	$(document).on('click', function(e){
		var target = e.target;
		if($(target).hasClass('cta-active-btn') && $(target).data('sc-role') == 'dropdown'){
			return false;
		}

		if($('.cta-dropdown').hasClass('active')) {
			$('.cta-dropdown').removeClass('active');
		}
	});

    $(document).on("click", "[rel]", function(e) {
        var $this = $(this);
        var rel = $this.attr("rel");
        switch (rel) {
            case "history.back":
                e.preventDefault();
                history.back();
                break;
            case "window.close":
                //e.preventDefault();
                window.close();
                opener.location.href = $(this).attr("href");
                break;
            case "print":
                e.preventDefault();
                window.print();
                break;
        }
    })

    $(document).ready(function(){

        $(".tab-basic").each(function(idx){
                var txt = $(this).find(".sel-txt");
                var first_txt = $(this).find("li.active");
                txt.text(first_txt.text());
            });
         $(".tab-basic li a").bind({
            click : function(e){
                e.preventDefault();

                var txt = $(this).closest(".tab-basic").find(".sel-txt");

                $(this).parent().siblings().removeClass("active");
                $(this).parent().addClass("active");


                txt.text($(this).text());

                var idx = $(this).parent().index();

                $(this).closest(".inbox").find(".tab-con").removeClass("show");
                $(this).closest(".inbox").find(".tab-con").eq(idx).addClass("show");
            }
        });

         // lazyload trigger
         //$(window).trigger('scroll');
         
         
         
         /* LGEGMO-2463 : 20161117 add */
     	if(!$('body').hasClass('is-mobile')){
     		mySearchAlignment();
     	}
         
     	function mySearchAlignment() {
     	 	if($(".my-search").find("div.filter-value").length > 0 && $(window).width() > 1024){
     		var _totalWidth = 0, _warea = 0, _aWidth, _alpha, _acWidth;
     		var _vWidth= $(".my-search").width();
     		var _vLen = $(".filter-value").find("> div").length;
     		
     		$.fn.percWidth = function(){
     			return this.outerWidth() / this.parent().outerWidth() * 100;
     		}
     		if(_vLen < 4){
     			$(".filter-value > div").each(function(i) {
     				var _aWidth = $(this).percWidth();
     				var _divPwidth = $(this).outerWidth(true);
     				_totalWidth += _aWidth;//%
     				_warea += _divPwidth;  //px
     				$(this).css({width: _aWidth + "%"});
     			}, this);
     		
     			var _aplus = (100-_totalWidth - 5)/_vLen;
     		
     			$(".filter-value > div").each(function(i) {
     				var _aWidth = $(this).percWidth();			
     				
     				if($(this).hasClass("matching")){
     					_aplus = _aplus - 3;
     				}
     				
     				var _acWidth = _aWidth + _aplus;
     				$(this).css({width : Math.floor(_acWidth) + "%"});
     				});
     				$(".filter-value").css({width :_warea + "px", display: 'inline-block', marginTop: "30px"});
     		 	} else {
     		 		$(".filter-value, .filter-value > div").removeAttr("style");
     			}
     		}		
     	}
     	/*//LGEGMO-2463 : 20161117 add */
    });

    /* PJTPDP-11 add */
    var CookieLink = function() {
        $(".wrapper").on('click.cookieLink', '[data-role="cookielink"]', function(e) {
            var $element = $(this);
            $.cookie("LG4_COLOR", $element.data('cookieValue'), {path: "/",domain:".lg.com"}); //0223
        });
    }();
    /* //PJTPDP-11 add */

    /* LGEPJT-483 add */
    $(document).on('click', '.product-lists .cta a', function( e ){        
        var $btn = $(this);
        var isAsync = !!$btn.data('async');

        // OBS Async to add cart 
        if ( isAsync ){
            e.preventDefault();
            var uri = $btn.data('uri');
            var modelId = $btn.data('modelid');
            
            $.ajax({
                url: uri,                
                type: 'POST',
                data: {sku:modelId},
                xhrFields: {
                    withCredentials: true
                },
                success:function(data){
                    var $cartCountSpan = $('.cart-count > span').eq(0);

                    if (data.result == true){
                        if (data.totalQty != null){
                            $cartCountSpan.text( parseInt(data.totalQty) );
                        }
                    } else {
                        cartAlert(data.message);
                        //cartAlert(data.errorMsg);
                    }
                }
            });
            
        }
    });
    /* //LGEPJT-483 add */

        // what I'm returning here is "global" when you require this module
    return {};
    
    
});
/* LGEPJT-483 add */
function cartAlert( text ){
    var $cartModal = $('#cartAlert');
    var $text = $cartModal.find('.text');
    var $okBtn = $cartModal.find('a.btn');
    var $closeBtn = $cartModal.find('.cart-close-modal');

    var top = $(window).scrollTop() + ( $(window).height() / 2 );

    $text.text( text );
    $cartModal.css({
        "top" : top,
        "margin-left" : '-' + $cartModal.width() / 2 + 'px',
        "margin-top" : '-' + $cartModal.height() / 2 + 'px'
    });
    $cartModal.show();

    $okBtn.off('click').on('click', function( e ){
        e.preventDefault();
        $cartModal.hide();
    });

    $closeBtn.off('click').on('click', function( e ){
        e.preventDefault();
        $cartModal.hide();
    });

    $okBtn.focus();
}
/* //LGEPJT-483 add */
