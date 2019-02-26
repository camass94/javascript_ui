/* global define */

/**
 * A module representing a Dog.
 * @module common/dog
 * @requires  common/util
 * @requires  common/animal
 */
define(['ic/ic', 'ic/ui/module', 'common/util', 'chosen', 'global-config', 'slick-carousel-pdp', 'mkt/scrollbar', 'common/social-likes', 'mkt/panzoom', 'mkt/hammer','common/smartworld'], function(ic, Module, util, chosen, globalConfig, slickpdp, scrollbar, socialLike, panzoom, hammer, smartworld) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        $document = $(document),
        $window = $(window),
        proto;


    var PDPImproveMobile = function(el, options) {
        var _ = this;

        // Call the parent constructor
        PDPImproveMobile.superclass.constructor.call(_, el, options);

        // selectors
        _.$window = $(window);
        _.$wrapper = $(el);
        _.$modelJson = groupModelInfo["subModelInfo"];
        

        // Default Option
        _.d = {
            activeClass : 'on',
            stickyClass : 'sticky',
            hideClass : 'hide'
        };

        _.options = $.extend({}, options, _.d); //, _.$form.data();

        _.setting();
        _.eventHandler();
        _.init();

    };

    util.inherits(PDPImproveMobile, Module);
    proto = PDPImproveMobile.prototype;



    proto.setting = function(){
        var _ = this;

        _.$sticky = _.$wrapper.find('.pdp-improve-sticky');
        _.$stickyWtb = _.$sticky.find('.improve-sticky-wtb');
        _.$navi = _.$sticky.find('.improve-sticky-nav');
        _.$naviBtn = _.$sticky.find('.improve-sticky-btn > a');
        _.$mainVisual = _.$wrapper.find('.improve-visual-carousel');
        _.$mainVisualCount = _.$wrapper.find('.improve-visual-count');
        _.$notice = _.$wrapper.find('.improve-notice');
        _.$award = $('.improve-award-carousel');
        _.$gallery = $('.improve-gallery-carousel');
        _.$galleryNav = $('.improve-gallery-nav');
        _.$galleryZoomBtn = $('.improve-gallery-button');

    }


    proto.eventHandler = function(flag){
        var _ = this;

        if (flag != false) {
            // Event Handlers
            _.$wrapper.on('click', '[rel="improve:nav"]', $.proxy(_.improveNav, _)); // Navigation Toggle Button
            _.$navi.on('click', 'a', $.proxy(_.imrpoveNavGo, _)); // Navigation Anchor Button
            _.$sticky.on('click', '[rel="wtb:dropdown"]', $.proxy(_.improveDropdown, _)); // WTB Dropdown
            _.$wrapper.on('click', '[rel="sibling:toggle"]', $.proxy(_.improveSibling, _)); // Sibling Group Layer
            $('[rel="color:change"]').on('click', $.proxy(_.setColorGroup, _)); // Color Group

            _.$window.load(function(){
                _.$window.on('scroll.improve', $.proxy(_.improveScroll, _));
                _.$window.on('resize.improve', $.proxy(_.improveResize, _));
                _.$window.trigger('scroll.improve');
                _.anchorInit();
            });
        }

        $('[rel="modal:toggle"]').off('click.improve').on('click.improve', $.proxy(_.improveModal, _)); // Modal Layer
        $('[rel="modal:close"]').off('click.improve').on('click.improve', $.proxy(_.improveModalClose, _)); // Modal Layer

    }


    proto.init = function(){
        var _ = this;

        socialLike();
        _.improveCarousel();        
        _.stickyWidth();
        _.$wrapper.find('.improve-layer-content').scrollbar();
        
        /* LGESK-330 : 20180410 add */
        if(_.$wrapper.find('.capFirstLetter')) {        	
        	$('.capFirstLetter').each(function(){
        		var capStr =  $.trim($(this).text());
                $(this).css("text-transform", "none");
                $(this).text(capStr.charAt(0).toUpperCase() + capStr.slice(1));
            });
        }
        /*//LGESK-330 : 20180410 add */
    }


    proto.anchorInit = function(){
        var _ = this;

        if ($('html').attr('data-product-id').length != 0) {

            var _hashCheck = window.location.href;
            var _reHref = _hashCheck.split('#');
            var y;
            var x;
            var _reHref2 = _hashCheck.split('/');
            var _reHrefHypen = _hashCheck.split('-');
            _reHrefHypen.reverse();
            _reHref2.reverse();
            var _reHref3 = _reHref2[0];

            if (_reHref[1] == undefined && _reHref3 != 'reviews' && _reHrefHypen[0] != 'reviews') {
                    
            } else {

                if (_reHref[1] == 'reviews' || _reHref[1] == '/reviews' || _reHref3 == 'reviews' || _reHrefHypen[0] == 'reviews') {

                    setTimeout(function() {
                        $('html, body').stop(true).scrollTop(($('.tabs-panels > div[data-id="ratings-reviews"]').offset().top) - 42)
                    }, 50);
                     
                }
            }
        }
    }


    proto.improveScroll = function(){
        var _ = this;

        _.improveSticky();
        _.improveNotice();
    }


    proto.improveResize = function(){
        var _ = this;

        _.improveSticky();
    }



    proto.improveNotice = function(){
        var _ = this;


        $.each(_.$notice, function(i){

            var notice = $(this);
            var noticeTop = notice.offset().top - notice.outerHeight(true);

            if (notice.css('display') != 'none') {


                setTimeout(function(){

                    notice.fadeOut(function(){
                        notice.remove();
                    });

                }, 800) /* PJTPDP-23 20180314 modify*/

            };

        })


    }


    proto.improveCarousel = function(flag){
        var _ = this;

        if (flag != false) {

            _.$award.slickpdp({
                slidesToShow: 1,
                arrows: false,
                dots : true,
                adaptiveHeight: true
            });

        }
        
        _.$mainVisual.slickpdp({
            slidesToShow: 1,
            arrows: false,
            dots : false,
            adaptiveHeight: true
        });
        
        _.$mainVisual.on({
            'setPosition' : function (event, slick, currentSlide, nextSlide) {
                $($(this).data('countTarget')).find('strong').text(slick.slideCount);
            },
            'init reInit afterChange' : function (event, slick, currentSlide, nextSlide) {

                $($(this).data('countTarget')).find('em').text(slick.currentSlide + 1);

            }
        });
        
        _.$gallery.slickpdp({
            slidesToShow: 1,
            arrows: false,
            dots : false,
            infinite : true,
            adaptiveHeight: true,
            cssEase : 'linear',
            speed : 200,
            waitForAnimate : false
        }).on({
            'setPosition' : function (event, slick, currentSlide, nextSlide) {
                
                $($(this).data('countTarget')).find('strong').text(slick.slideCount);
                _.$galleryNav.find('.slide').removeClass('slick-on').eq(slick.currentSlide).addClass('slick-on');

            },
            'afterChange' : function (event, slick, currentSlide, nextSlide) {

                $($(this).data('countTarget')).find('em').text(slick.currentSlide + 1);
                _.$galleryNav.slickpdp('slickGoTo', slick.currentSlide);
                _.$galleryNav.find('.slide').removeClass('slick-on').eq(slick.currentSlide).addClass('slick-on');

            }
        });
        
        var slideMax = 0;

        $.each(_.$galleryNav.find('.slide'), function(i){
            slideMax += $(this).outerWidth(true);

        })
		
        _.$galleryNav.slickpdp({
            slidesToShow: 4,
            slidesToScroll: 4,
            arrows: true,
            dots : false,
            infinite : false,
            variableWidth: true,
            adaptiveHeight: true,
            cssEase : 'linear',
            speed : 200,
            responsive: [
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 7,
                    slidesToScroll : 7
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 6,
                    slidesToScroll : 6
                  }
                },
                {
                  breakpoint: 430,
                  settings: {
                    slidesToShow: 5,
                    slidesToScroll : 5
                  }
                },
                {
                  breakpoint: 330,
                  settings: {
                    slidesToShow: 4,
                    slidesToScroll : 4
                  }
                }
            ]
        }).on({
            'setPosition' : function (event, slick, currentSlide, nextSlide) {

                _.$galleryNav.find('.slick-track').width(slideMax);

            }
        });


        _.$galleryNav.find('.slide a').on('click', function(event){
            event.preventDefault();
            var idx = $(event.currentTarget).closest('.slick-slide').index();

            _.$gallery.slickpdp('slickGoTo', idx);

        });

        _.bindPanZoom();

    }


    proto.improveNav = function(event){
        var _ = this;

        event.preventDefault();

        if (!_.$navi.hasClass(_.d.activeClass)) {

            _.$naviBtn.addClass(_.d.activeClass);

            _.$navi.addClass(_.d.activeClass);
            

        } else {

            _.$naviBtn.removeClass(_.d.activeClass);

            _.$navi.removeClass(_.d.activeClass);

        }

    }



    proto.imrpoveNavGo = function(event){
        var _ = this;

        _.$wrapper.find('a[rel="improve:nav"]').trigger('click');

    }


    proto.improveSticky = function(event){
        var _ = this;

        // event.preventDefault();

        if (_.$window.scrollTop() >= _.$wrapper.offset().top) {

            _.$sticky.addClass(_.d.stickyClass);


        } else {

            _.$sticky.removeClass(_.d.stickyClass);
            
            if (_.$navi.hasClass(_.d.activeClass)) {
            
                _.$wrapper.find('a[rel="improve:nav"]').trigger('click');

            }

        }

    }


    proto.improveDropdown = function(event){
        var _ = this;
        var target = $($(event.currentTarget).data('wtbTarget'));

        event.preventDefault();

        if (target.css('display') == 'none') {

            target.stop(true).slideDown();

        } else {

            target.stop(true).slideUp();

        }

    }



    proto.improveSibling = function(event){
        var _ = this;
        var target = $('#' + $(event.currentTarget).data('id'));

        event.preventDefault();

        if (!target.hasClass(_.d.activeClass)) {

            if (!target.parent().is('body')) {

                target.appendTo('body');

            }

            if (target.find('.improve-layer-content.colors li').length > 5 || target.find('.improve-layer-content.sizes li').length > 10) {

                target.find('.improve-layer-content').addClass('limit');

            }

            target.addClass(_.d.activeClass);

        } else {

            target.removeClass(_.d.activeClass);

        }

    }



    proto.improveModal = function(event){
        var _ = this;
        var self = $(event.currentTarget);
        var targetId = $(event.currentTarget).data('id');
        var target = $('#' + targetId);

        event.preventDefault();

        if (!target.hasClass(_.d.activeClass)) {

            if (!target.parent().is('body')) {

                target.appendTo('body');

            }

            if (target.data('modalType') == 'iframe') {

                var template = $(target.data('template')).html();
                var iframeWrap = target.find(target.data('templateTarget'));
                var iframe = $(template).clone();
                var url = XSSfilter(self.attr('href'));

                iframeWrap.empty();
                $(iframe).attr('src', url);
                iframeWrap.append(iframe);

            }

            target.addClass(_.d.activeClass).css({
                'top' : _.$window.scrollTop(),
                'height' : _.$window.height()
            });
            
            if (_.$award.length > 0) { _.$award.slickpdp('setPosition'); }
            if (_.$gallery.length > 0) { _.$gallery.slickpdp('setPosition'); }
            if (_.$galleryNav.length > 0) { _.$galleryNav.slickpdp('setPosition'); }
            if (target.find('.improve-notice').length > 0) { 
                target.find('.improve-notice').show(); 
                _.improveNotice();
            }

            // set current index to gallery
            if (targetId === 'improve-gallery'){
        		var mainVisualCurrentIdx = _.$mainVisual.slickpdp('slickCurrentSlide');
        		_.$gallery.slickpdp('slickGoTo', mainVisualCurrentIdx, true);

        		_.$gallery.find('.slick-slide a').each(function(){
        			var $img = $(this).find('img');

                    if ( $img.height() > $img.parents('.slick-slide').height() ){
                        $img.height( $img.parents('.slick-slide').height() );

                        $img.css({
                            'width': 'auto'
                        });
                    }
        		});
        	}

        } else {

            target.removeClass(_.d.activeClass);

        }
    }



    proto.improveModalClose = function(event){
        var _ = this;
        var target = $('.improve-modal-layer, .improve-sibling-layer');

        if(event != undefined ) { event.preventDefault(); }

        // when close gallery
        if (target.filter('.on').attr('id') === 'improve-gallery'){

        	var galleryCurrentIdx = _.$gallery.slickpdp('slickCurrentSlide');

        	_.$mainVisual.slickpdp('slickGoTo', galleryCurrentIdx, true);

        }

        if (target.filter('.on').hasClass('improve-sibling-layer')){

            $('html, body').scrollTop(0);

        }

        target.removeClass(_.d.activeClass);

    }


    proto.imageCheck = function(target){
        var _ = this;
        var src = '';

        $.each(target.find('img'), function(index){


            if (target.data('imageType') == 'small') {

                src = $(this).attr('src');

            } else {

                if (target.hasClass('improve-visual-carousel')) {

                    if ($(this).data('largeImage') != '' && $(this).data('largeImage') != undefined) {

                        src = $(this).data('largeImage');

                    } else {

                        src = $(this).data('zoomImage')
                    }

                } else {

                    if ($(this).data('zoomImage') != '' && $(this).data('zoomImage') != undefined) {

                        src = $(this).data('zoomImage');

                    } else {

                        src = $(this).data('largeImage')
                        
                    }

                }

            }

            $(this).attr('src', src);

        })
         
    }


    proto.setColorGroup = function(event) {
        var _ = this;
        var self = $(event.currentTarget);
        var subModel = $(event.currentTarget).data("subModelId");

        event.preventDefault();

        self.closest("li").addClass(_.d.activeClass).siblings().removeClass(_.d.activeClass);

        if(_.$modelJson[subModel]){
            $.map(_.$modelJson[subModel] , function(val, key) {
                var dataSelect = $("[data-sub-model-info="+key+"]");
                /* LGEPJT-483 add */
                if (key == 'color'){
                    $("[adobe-pdp-color]").attr("adobe-pdp-color", val);
                }
                /* //LGEPJT-483 add */

                if (val === null) {

                    dataSelect.hide();
                    /* LGEPJT-483 add modify */
                    if (key == 'suggestPrice' || key == 'promotionPrice' || key == 'obsGpPrice') {
                        dataSelect.closest('[data-sub-model-info*=Flag]').hide();
                    }
                    
                    if (key == 'suggestPoint' || key == 'promotionPoint' || key == 'obsGpPoint') {
                        dataSelect.parent().hide();
                    }
                    /* //LGEPJT-483 add modify */

                } else if (typeof val === "string"){

                    dataSelect.show();
                    dataSelect.html(val);
                    /* LGEPJT-483 add modify */
                    if (key == 'suggestPoint' || key == 'promotionPoint' || key == 'obsGpPoint') {
                        dataSelect.parent().show();
                    }
                    /* //LGEPJT-483 add modify */
                    
                } else if (typeof val === 'object'){
                    //galleryImg
                    if(val.length){
                        
                        dataSelect.each(function(index){

                            var template = $($(this).data('template')).html();
                            var len = val.length;

                            $(this).slickpdp('unslick');
                            $(this).empty();

                            for (var i = 0; i < len; i++) {
                                var slide = $(template).clone();
                                $(slide).find("img").attr(val[i]);
                                $(this).append(slide);
                            }

                            _.imageCheck($(this))
                        })


                        setTimeout(function(){
                            _.setting();
                            _.improveCarousel(false);
                            _.eventHandler(false);
                        }, 1000)

                    } else {

                        if (Object.keys(val).length > 0) {

                            $.each(Object.keys(val), function(k, value){

                                if(val[value] != null){

                                    if (key == 'buyNow' && value == 'url') {

                                        dataSelect.data(val);
                                        plugin('SmartWorld', smartworld, ".obs-submit");

                                    } else {

                                        dataSelect.attr(val);
                                    }

                                    if (key == "whereToBuyLocal" || key == "whereToBuyOnline" || key == "whereToBuyDistributors") {

                                        dataSelect.parent().removeClass('hide');

                                    }
                                    
                                    /* LGEPJT-483 add */  
                                    if ( key == 'newAddToCart' ){                                                            
                                        dataSelect.attr('data-uri', val['obsuri']);
                                        dataSelect.attr('data-modelid', val['modelid']);
                                        dataSelect.attr('adobe-value', val['modelid']);                                                                  
                                        dataSelect.show();
                                    }
                                    /* //LGEPJT-483 add */

                                    dataSelect.parent().show();

                                } else {

                                    if (key == "whereToBuyLocal" || key == "whereToBuyOnline" || key == "whereToBuyDistributors") {

                                        dataSelect.parent().addClass('hide');

                                    }

                                    dataSelect.parent().hide();

                                }

                            })

                        } else {

                            dataSelect.parent().hide();

                        }
                        
                    }
                } else if (typeof val === 'boolean') {
                    var dataWrap = dataSelect.parent();

                    if(val) {
                        dataSelect.show();

                        if (dataWrap.hasClass('improve-sibling-price') && key == 'promotionFlag') {

                            dataWrap.addClass('promotion');

                        } 
                        /* LGEPJT-483 OBS add */
                        if (dataWrap.hasClass('improve-sibling-price') && key == 'obsGpFlag') {

                            dataWrap.addClass('promotion');

                        } 
                        /* //LGEPJT-483 OBS add */
                    } else {
                        dataSelect.hide();

                        if (dataWrap.hasClass('improve-sibling-price') && key == 'promotionFlag') {

                            dataWrap.removeClass('promotion');

                        }
                        /* LGEPJT-483 OBS add */
                        if (dataWrap.hasClass('improve-sibling-price') && key == 'obsGpFlag') {

                            dataWrap.removeClass('promotion');

                        } 
                        /* //LGEPJT-483 OBS add */
                    }
                }                
            });
            
        }

        if ($(".cta-dropdown").size() > 0) {
            
            $('#wtb-dropdown').hide();

            if($(".cta-dropdown .dropdown-content li.hide").size() == $(".cta-dropdown .dropdown-content li").length){
                $('.improve-sticky-wtb').hide();
                $(".cta-dropdown").hide();
            } else {
                $('.improve-sticky-wtb').show();
                $(".cta-dropdown").show();
            }

        }


        _.improveModalClose();
        _.stickyMSRP();
        _.stickyWidth();

    }


    proto.stickyWidth = function(){
        var _ = this;

        if (_.$stickyWtb.css('display') == 'none' || _.$stickyWtb.length == 0) {

            _.$sticky.addClass('no-wtb');

        } else {

            _.$sticky.removeClass('no-wtb');

        }
    }


    proto.stickyMSRP = function(){
        var _ = this;
        var order = ['suggestFlag', 'promotionFlag'];
        var number = [];

        _.$sticky.find('.sticky-price:visible').each(function(){
            number.push($.inArray($(this).data('subModelInfo'), order));
        });
        
        var idx = number[0];

        for(var i=0; i < number.length; i++) {
            idx = Math.min(idx, number[i]);
        }

        _.$sticky.find('.sticky-price[data-sub-model-info="' + order[idx] +'"]').siblings('.sticky-price').hide();

    }


    proto.bindPanZoom = function(){
    	var _ = this;
    	var zoomInBtn = _.$galleryZoomBtn.find('.zoom-in');
    	var zoomOutBtn = _.$galleryZoomBtn.find('.zoom-out');

    	var $galleryImages = _.$gallery.find('a');

        $galleryImages.panzoom("destroy");

		$galleryImages.panzoom({
            //$zoomIn: zoomInBtn,
            //$zoomOut: zoomOutBtn,
            transition: true,
            panOnlyWhenZoomed: true,
            linearZoom: true,
            exponential: false,
            contain: false,
            minScale: 1,
            animate: true,
            maxScale: 4,
            increment: 0.4
        });

        $galleryImages.each(function(){
        	var galleryImage = $(this);

			galleryImage.off('click').on('click', function(e){
				e.preventDefault();
			});

        	new Hammer(this).off('doubletap').on('doubletap', function(e){
        		var option = galleryImage.panzoom('option');
	            var currentScale = galleryImage.panzoom('getMatrix')[0];

	            if ( currentScale < 4 ){
	                galleryImage.panzoom('zoom', 4, {
	                    animate: true
	                });
	            } else {
	            	galleryImage.panzoom('reset');
	                /*galleryImage.panzoom('zoom', 1, {
	                    animate: true
	                });*/
	            }
        	});
        });

        zoomInBtn.off('click.panzoom').on('click.panzoom', function( e ){        	
            var currentSlide = _.$gallery.find('.slick-active a');

			currentSlide.panzoom('zoom', false, {
				increment: 0.4,
				animate: true	
			});
        });

        zoomOutBtn.off('click.panzoom').on('click.panzoom', function( e ){        	
            var currentSlide = _.$gallery.find('.slick-active a');

        	if ( currentSlide.panzoom('getMatrix')[0] === '1' ){
        		currentSlide.panzoom('reset');
        	} else {
        		currentSlide.panzoom('zoom', true, {
					increment: 0.4,
					animate: true
				});
        	}
        });

        _.$gallery.off('afterChange.panzoom').on('afterChange.panzoom', function (event, slick, currentSlide, nextSlide) {
        	$galleryImages.panzoom('reset');
            
        });

        $('[rel="modal:close"]').off('click.panzoom').on('click.panzoom', function(){
            $galleryImages.panzoom('reset');

            $galleryImages.find('img').css({
                'height': 'auto',
                'width': '100%'
            });
        });
    };

    /* LGEPJT-483 add */
    $(document).on('click', '.pdp-improve-wrap .pdp-improve-sibling .improve-sibling-cta .cta-button a', function( e ){        
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
                        $cartCountSpan.text(data.totalQty);
                    } else {
                        cartAlert(data.message);
                    }
                }
            });
            
        }
    });
    /* //LGEPJT-483 add */


    if (globalConfig.isMobile) {

        plugin('PDPImproveMobile', PDPImproveMobile, '.pdp-improve');

    }

    return PDPImproveMobile;
});