/* global define */

/**
 * Product List Carousel module.
 * @module products/prodcuts-lists-carousel
 * @requires ic/ic
 * @requires ic/ui/module
 */


define(['global-config', 'jquery', 'slick-carousel', 'common/dtm'], function(globalConfig, $, slick, dtm) {

    'use strict';

    var productCarousel = {};

    /*
    $('.product-lists.with-carousel').each(function(idx, item) {
        var carouselLocation;
        var carouselId = "product-list-carousel" + idx;
        this.id = carouselId;

        carouselLocation = "#" + carouselId + ' .carousel';
        var numberOfSlidesToShow = 3;

        if (typeof $(this).attr('data-slides-to-show') !== "undefined") {
            numberOfSlidesToShow = $(this).attr('data-slides-to-show');
        }

        // if (globalConfig.isMobile === true) {
        $(carouselLocation).slick({
            lazyLoad: 'ondemand',
            slidesToShow: numberOfSlidesToShow,
            slidesToScroll: 1,
            dots: false,
            arrows: true,
            responsive: [{
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true,
                    arrows: false,
                }
            }]
        });

        // } else {
        //     $(carouselLocation).slick({
        //         slidesToShow: numberOfSlidesToShow,
        //         slidesToScroll: 1,
        //         dots: false,
        //         arrows: true
        //     });
        // }
    });
    */
    /*LGECI-2710 : 20161214 add */
    var _BVRatingFlag = $("body").find("input[name=BVRatingFlag]");
    var setBVRatings = function(e) {
        if ($('#bvReview')) {
            if (!window.$BV) return false;
            if ($BV) {
                var idx = parseInt($('body').eq(0).attr("data-bv")) + 1;
                $('body').eq(0).attr("data-bv", idx);
                var sctxt = '';
                $(this).find('.slide, li, .recommand-product-info').each(function() {
                    var obj = $(this).find('.rating, .product-rating, .recommand-product-info');
                    var url = obj.find('a').eq(0).attr('href');
                    var pid = obj.data('modelid');
                    
                	if (!pid) return;
                    obj.removeAttr('itemprop').removeAttr('itemscope').removeAttr('itemtype').attr('id', 'productlist' + idx + '-' + pid).empty();
                    if (sctxt == "") sctxt = sctxt + "'" + pid + "':{url:'" + url + "'}";
                    else sctxt = sctxt + "," + "'" + pid + "':{url:'" + url + "'}";
                
                    
                });
                // console.log(idx +"///"+sctxt);
                if (sctxt != "") {
                    sctxt = "$BV.ui( 'rr', 'inline_ratings', {productIds : {" + sctxt + "},containerPrefix:'productlist" + idx + "'});";
                    new Function(sctxt)();
                }
            }
        }
    };
    /*//LGECI-2710 : 20161214 add */
    $('.product-lists.with-carousel').each(function(i) {
        var self = this;
        if ($(this).is(".with-ajax")) {
            $.ajax({
                type: "GET",
                timeout: 50000,
                url: $(this).data('url'),
                success: $.proxy(function(c) {
                    $(this).find(".container").append(c);
                    runCarousel($(this), i);
                    //bindDTM(); // DTM
                    
                    
                    /*LGECI-2811 : 20170626 add */
                    if(_BVRatingFlag.length && _BVRatingFlag.val() == "Y"){
                        // product list
                    	$(this).each(setBVRatings);
                    }
                    if(lgFilter.locale =="/ca_en" || lgFilter.locale =="/ca_fr"){
                		$('.product-lists li').each(function(){
                    		if($(this).find(".rating, .compare-check").length == "0") {
                    			$(this).find(".details").addClass("bundleSet");
                    		}
                    	});
                	}
                    /*//LGECI-2811 : 20170626 add */
                    
                }, this)
            });
        } else {
            runCarousel($(this), i);
        }
    });

    function runCarousel(t, i) {
        var numberOfSlidesToShow,
            mDots = true,
            mArrows = true;
        if (typeof t.attr('data-slides-to-show') !== "undefined") {
            numberOfSlidesToShow = Number(t.attr('data-slides-to-show'));
        } else {
            numberOfSlidesToShow = 3;
        }
        t.addClass("i_" + i);
        if (t.parent().is(".most-popular")) {
            mDots = true;
            mArrows = true;
        };
        /* PJTTWIN-1 20161010 add */
        if (t.hasClass("twin")) {
            t.find(".carousel").on('init', function(event, slick) {
                slick.$slideTrack.find("a").attr("tabindex", -1);
                slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
            }).slick({
                lazyLoad: 'ondemand',
                infinite: false,
                slidesToShow: numberOfSlidesToShow,
                slidesToScroll: 2,
                dots: false,
                arrows: true,
                responsive: [{
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        dots: mDots,
                        arrows: false,
                        infinite: false
                    }
                }]
            }).on('afterChange', function(event, slick, currentSlide) {
                slick.$slideTrack.find("a").attr("tabindex", -1);
                slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
            });
        } else {
            t.find(".carousel").on('init', function(event, slick) {
                slick.$slideTrack.find("a").attr("tabindex", -1);
                slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
            }).slick({
                lazyLoad: 'ondemand',
                infinite: false,
                slidesToShow: numberOfSlidesToShow,
                slidesToScroll: 1,
                dots: false,
                arrows: true,
                responsive: [{
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        dots: mDots,
                        arrows: mArrows,
                    }
                }]
            }).on('afterChange', function(event, slick, currentSlide) {
                slick.$slideTrack.find("a").attr("tabindex", -1);
                slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
            });
            /*LGECI-2811 : 20170626 modify */
            if(_BVRatingFlag.length && _BVRatingFlag.val() == "Y"){
                // product list
            	$(this).each(setBVRatings);
            }
            if(lgFilter.locale =="/ca_en" || lgFilter.locale =="/ca_fr"){
        		$('.product-lists li').each(function(){
            		if($(this).find(".rating, .compare-check").length == "0") {
            			$(this).find(".details").addClass("bundleSet");
            		}
            	});
        	}
            /*//LGECI-2811 : 20170626 modify */
        }
        /* //PJTTWIN-1 20161010 add */
    };

    $('.fe-carousel').each(function(i) {
        var numberOfSlidesToShow;
        if (typeof $(this).attr('data-slides-to-show') !== "undefined") {
            numberOfSlidesToShow = Number($(this).attr('data-slides-to-show'));
        } else {
            numberOfSlidesToShow = 3;
        }
        $(this).addClass("i_" + i);
        $(this).find(".ex-carousel").on('init', function(event, slick) {
            slick.$slideTrack.find("a").attr("tabindex", -1);
            slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
        }).slick({
            lazyLoad: 'ondemand',
            infinite: false,
            slidesToShow: numberOfSlidesToShow,
            slidesToScroll: 1,
            dots: false,
            arrows: true,
            responsive: [{
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    dots: true,
                    arrows: false,
                }
            }]
        }).on('afterChange', function(event, slick, currentSlide) {
            slick.$slideTrack.find("a").attr("tabindex", -1);
            slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
        });
    });
    $(document).on('click', 'section.product-lists .rating a', function() { // remove .recently-view
        if ($('.product').is('div')) {
            var _itemID = $('html').attr('data-product-id');
            var _thisHref = $(this).attr('data-product-id');
            if (!_itemID) {
                return;
            } else if (_itemID == _thisHref) {
                $('.product .review_points > a').trigger('click');
                return false;
            } else {
                return true;
            }
        } else {
            return;
        }
    });

    $('.fe-carousel-m25').each(function(i) {
        var numberOfSlidesToShow;
        if (typeof $(this).attr('data-slides-to-show') !== "undefined") {
            numberOfSlidesToShow = Number($(this).attr('data-slides-to-show'));
        } else {
            numberOfSlidesToShow = 3;
        }
        $(this).addClass("i_" + i);
        $(this).find(".ex-carousel").on('init', function(event, slick) {
            slick.$slideTrack.find("a").attr("tabindex", -1);
            slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
        }).slick({
            lazyLoad: 'ondemand',
            infinite: false,
            slidesToShow: numberOfSlidesToShow,
            slidesToScroll: 1,
            dots: true,
            arrows: true,
            responsive: [{
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true,
                    arrows: true,
                }
            }]
        }).on('afterChange', function(event, slick, currentSlide) {
            slick.$slideTrack.find("a").attr("tabindex", -1);
            slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
        });
    });

    var LayerSlider = function(){

        var _ = this,
            layerSlider = $('section.fe-carousel-m25'),
            layerSliderLink = layerSlider.find('div.item-image > a');

        if (layerSlider.size() > 0) {
            layerSliderLink.on('click', function(event){

                var moduleCheck = $(this).closest('div.item-image').hasClass('layer');
                var moduleUrl = $(this).attr('href');
                var moduleData = $(this).data();
                var moduleForm = $(this).closest('form');
                var XSSFilter = function(content) {
                    return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                }

                $.each(moduleData, function (key, data) {
                    moduleForm.find('input[name="'+ key +'"]').val(moduleData[key]);
                });

                moduleForm.attr('action', moduleUrl);

                var modulePath = XSSFilter(moduleForm.serialize());

                if (moduleCheck && globalConfig.isMobile == false) {

                    $("body").css("overflow-y","hidden");

                    modalAjax($(this), moduleUrl, modulePath);

                    $('.modal-press-wrap').addClass('fe-m25');

                } else {

                    moduleForm.attr('target', '_blank');
                    moduleForm.submit();

                }

                event.preventDefault();

            })
        }

    }();
    /* LGEPJT-91 */
    var b11_length = $('.module.b11 .list-carousel .inner .item').length;
    var isCenterMode = true;

    if (b11_length <= 5) isCenterMode = false;

    $('.module.b11 .img-carousel').on('init', function(event, slick) {
        slick.$slideTrack.find("a").attr("tabindex", -1);
        slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
    }).slick({
        lazyLoad: 'ondemand',
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        arrows: true,
        asNavFor: '.module.b11 .list-carousel .inner'
    }).on('afterChange', function(event, slick, currentSlide) {
        slick.$slideTrack.find("a").attr("tabindex", -1);
        slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
        if(!isCenterMode) $('.module.b11 .list-carousel .inner .item[data-slick-index='+(currentSlide)+']').find("a").trigger("click");
    })

    $('.module.b11 .list-carousel .inner').on('init', function(event, slick) {
        slick.$slideTrack.find("a").attr("tabindex", -1);
        slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
    }).slick({
        lazyLoad: 'ondemand',
        infinite: true,
        slidesToShow: 5,
        slidesToScroll: 1,
        dots: false,
        arrows: true,
        asNavFor: '.module.b11 .img-carousel',
        centerMode: isCenterMode,
        centerPadding: 0,
        focusOnSelect: true
    }).on('afterChange', function(event, slick, currentSlide) {
        slick.$slideTrack.find("a").attr("tabindex", -1);
        slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
    });

    $('.module.b11 .list-carousel .inner .item a').on('click', function() {
        if(!isCenterMode) {
            $(this).parent().addClass("slick-current ").siblings().removeClass("slick-current");

        }
        $(this).parent().trigger('click');
        return false;
    });
    /* //LGEPJT-91 */
    /*LGEGMO-2854 : 20170304 modify*/
    if(globalConfig.isMobile === true) {
		$(".accordion-tab a").on('click', function() {
			$('.module.b11').each(function() {
        		$(this).find(".slick-dots").find("[tabindex=0]").first().click();
        	});
		});        	
    }
    /*//LGEGMO-2854 : 20170304 modify*/
    return productCarousel;
});
