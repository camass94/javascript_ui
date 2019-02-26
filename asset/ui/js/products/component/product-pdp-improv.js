/* global define */

/**
 * A utility module.
 * @module common/util
 */
define(['jquery', 'ic/ic', 'ic/ui/module','mkt/sticky-pdp', 'slick-carousel-pdp', 'global-config', 'mkt/panzoom','common/smartworld'], function($, ic, Module,StickyPdp,slickpdp, globalConfig, panzoom, smartworld) {
    'use strict';
    var proto,
        events = ic.events,
        $window = ic.dom.$window,
        setTime = 2500,
        duration = 1000,
        isNoTransition = $('html').is(".no-csstransitions"),
        i, l;
    var isSliding = false;

    var ProductPdp = function(el, options) {
        var self = this;
        // Call the parent constructor
        ProductPdp.superclass.constructor.call(self, el, options);

        //Desktop Nav Items
        self.$thumbNail = self.$(".pdp-improve-gallery-nav");
        self.$heroImg = self.$(".pdp-improve-visual-img");
        self.$info = self.$el.find(".improve-info-wrap");
        self.$layer = self.$(".product-hero-layer.gallery");
        self.currentNavIndex = 0;
        self.$view = self.$el.find(".pdp-improve-visual-view");
        self.$tabs = self.$el.find('.tabs.app-tabs');
        self.imgH = self.$view.find(".pdp-improve-visual-img img").height();
        self.$gallayer = $("#pdpGallery");
        self.$colorPicker = self.$el.find('.colors .picker-wrap a.color-v2');

        self.subModelJson = groupModelInfo["subModelInfo"];

        self.isRunGalleryCarousel = false;
        self.isMcProduct = false;

         // guk
        //self.$zoomContorller = self.$(".hero-zoom-btn"); // guk

        var isDisplayType = false;
        if(Object.keys(groupModelInfo).length > 0) {
            isDisplayType = (groupModelInfo!==undefined && groupModelInfo.basicInfo.displayType=="3")?true:false;
        }
        if(isDisplayType&&self.imgH<=620 ) {
            self.$view.find(".pdp-improve-visual-img .improv-visual-img-wrap").addClass('re-size'); //guk
        }

        $(document).ready(function() {
            self._init();
            self._resizing();
        });
        
    };
    ic.util.inherits(ProductPdp, Module);

    proto = ProductPdp.prototype;

    proto._defaults = {
        ac: 'active'
    };

    proto._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self);
        i = 1, l = 9;
        
        /* LGESK-330 : 20180410 add */
        if(self.$el.find('.capFirstLetter')) {        	
        	$('.capFirstLetter').each(function(){
        		var capStr =  $.trim($(this).text());
                $(this).css("text-transform", "none");
                $(this).text(capStr.charAt(0).toUpperCase() + capStr.slice(1));
            });
        }
        /*//LGESK-330 : 20180410 add */

        self.$thumbNail.on('click',"li:not(.gallery-more) a" ,$.proxy(self._runGalleryActive, self));
        self.$thumbNail.on('click',".gallery-more a" ,$.proxy(self._runGalleryPopup, self));
    /*    self.$thumbNail.on('click',"li a" ,$.proxy(self._runGalleryPopup, self));*/
        self.$heroImg.on('click',".improv-visual-img-wrap" ,$.proxy(self._runGalleryPopup, self));

        self.$el.on('click',".product-awards" ,$.proxy(function(e){
            e.preventDefault();
            self._pdpLayerPopup("pdpAword",".product-hero-layer.awards",e);
        }, self));

        self.$colorPicker.on('click', $.proxy(self._setColorGroup, self));
        
        self._setInfo();
        self._etcEvent();

        // gallery carousel image data set 
        if ( !!groupModelInfo.subModelInfo ){
            self.isMcProduct = true;
            var currentSubModelId = self.$colorPicker.filter('.active').eq(0).data('subModelId');
            self.selectedSubModelJSON = groupModelInfo.subModelInfo[currentSubModelId];
        } else {
            var productImageData = groupModelInfo.basicInfo.galleryImg;
            self.isMcProduct = false;            
            self.selectedSubModelJSON = {
                galleryImg : productImageData
            };
        }
        
        self._pdpMakeLayerPopup("pdpGallery",".product-hero-layer.gallery");
        self._bindGalleryCarousel();


        $(window).on("resize.pdpResize",function(){
            self._resizing();
        })
        
        /* LGERU-3559 20180719 add */
        $(".obs_information a.obs_icon").on("mouseenter focus", function() {
            $(this).next(".obs_tooltip").css({
                display: "block"
            }); 
    		$(this).addClass('hover');
    	});        
    	$(".obs_information a.obs_icon").on("mouseleave blur", function() {
    		$(this).next(".obs_tooltip").css("display", "");
    		$(this).removeClass('hover');
    	});
    	/*// LGERU-3559 20180719 add */    	
    }


    proto._setInfo = function() {
        var self = this;
        self._chkCookie();
        self._pdpSlick();

        $('.move-top').hide();

        if($('.review_points').size() == 0) {
            $(".info-text-top h1 ,.info-text-top h2").addClass("none_reviews");
        }

        if($('.rating-ru-sticky').html() == "") {
            $(".info-text-top h1 ,.info-text-top h2").addClass("none_reviews");
            $(".review_points").hide();
        }

        if(self.$el.find('.color-picker')) {
            self._toolTip();
        }
    }
    proto._toolTip = function(){
        var self = this;
        self.$el.append('<span class="color-tag"><span class="color-tail"></span></span>');

        self.$el.find('.color-picker').on({
            "mouseenter hover": function(e){ 
                e.preventDefault();
                
                var name = $(this).find('.color-name');
                var left = $(this).offset().left;
                var top = $(this).offset().top;
                $('.color-tag').find("span").not(".color-tail").remove();
                $('.color-tag').append(name.html());

                $(this).addClass("hover").closest(".picker-wrap").siblings().find("a").removeClass("hover");

                var cehckTop = top + ($(this).height()) + 2;
                var TopValue = cehckTop - $(".pdp-improve").offset().top;
               
               if(self.$info.offset().left+self.$info.width()>left+$('.color-tag').outerWidth()){
                    left = left;
               } else {
                    if(self.$info.offset().left+self.$info.width()<left+$(this).width()+($('.color-tag').outerWidth()/2)) {
                        left = left - $('.color-tag').outerWidth()+$(this).width();
                    }else {
                        var colorLeft = left-self.$info.offset().left ;
                        var colorTagWidth = $('.color-tag').outerWidth()/2;
                        var colorCal = (310 - (colorLeft + colorTagWidth))/2;
                        left = left - colorCal;
                    }
               }
               var tailLeft = parseInt($(this).offset().left - left) + 30 ;
                $('.color-tag').css({
                    left: left
                    ,top: TopValue
                    ,position: 'absolute'
                }).show();
                $(".color-tag .color-tail").css("left",tailLeft);
            }
        });

        self.$el.find('.color-picker').on({
            "mouseleave":function(e){ 
                e.preventDefault();
                $(this).removeClass("hover");
                $('.color-tag').hide();
            }
        });

     
    }

    proto._resizing = function() {
        var self = this;
        if (self.$info.hasClass('sticky')) return false;

        self.viweHeight = $(window).outerHeight();
        self.navHeight = $(".pdp-improve-wrap").offset().top;
        self.stickyHeight = $(".pdp-improve-tab-wraper").outerHeight();
        self.calHeight = self.viweHeight-self.navHeight-self.stickyHeight;
        /*LGEIN-1866 : 20190109 add*/
        self.calHeight < 430 ? self.calHeight = 430 : self.calHeight;
        /*//LGEIN-1866 : 20190109 add*/
        
        if($(".pdp-improve-fb").size() < 1){
            $(".pdp-improve-wrap").prepend("<div class='pdp-improve-fb'></div>");
        }
        
        if($(window).outerWidth() < 1600 && $(window).outerWidth() > 1279){
            $(".pdp-improve-wrap").css("min-height",self.calHeight);
            $(".pdp-improve-fb").css("height",self.calHeight);
        } else {
            $(".pdp-improve-wrap").removeAttr("style");
            $(".pdp-improve-fb").removeAttr("style");
        }
        
    }

    proto._makeGalleryCarousel = function( idx ){
        var self = this;
        var layerGalleryNavWrap = $('.hero-carousel-nav');        
        var layerGalleryNavUl = $('<ul></ul>');
        var layerGalleryNavUlSecond = $('<ul></ul>');
        var templateLi = $('#galleryLi').html();

        var currentImageSrc = self.selectedSubModelJSON.galleryImg[idx];
        var defaultZoomImageSrc;

        var zoomImage = $('.hero-carousel-view .zoom-wrap img').attr('src', '');

        // make Navi Image       
        layerGalleryNavWrap.children('ul').remove();       

        $.each( self.selectedSubModelJSON.galleryImg, function( i ){
            var imgSrcData = this;
            var $templateLi = $(templateLi);
            var $anchorTag = $templateLi.find('a');

            // current nav add class
            if ( idx === i ) {
                $templateLi.addClass('active');
            }
            
            $anchorTag.attr('data-carousel-idx', imgSrcData['data-carousel-idx']);
            $anchorTag.attr('data-large-image', imgSrcData['data-large-image']);
            $anchorTag.attr('data-zoom-image', imgSrcData['data-zoom-image']);
            $anchorTag.attr('adobe-thumb-order' , i + 1);
            $anchorTag.attr('adobe-pdp-color' , self.selectedSubModelJSON.color);
            $templateLi.find('img').attr({
                'src': imgSrcData.src,
                'alt': imgSrcData.alt
            });

            if ( i < 10 ){
                layerGalleryNavUl.append($templateLi);
            } else{
                layerGalleryNavUlSecond.append($templateLi);    
            }
        });

        layerGalleryNavWrap.append(layerGalleryNavUl);

        if (self.selectedSubModelJSON.galleryImg.length > 10){
            layerGalleryNavWrap.append(layerGalleryNavUlSecond);
        } else {
            layerGalleryNavUl.addClass('center');
        }

        // set current zoom image
        if ( !!currentImageSrc['data-zoom-image'] ) {
            defaultZoomImageSrc = currentImageSrc['data-zoom-image'];
        } else {
            defaultZoomImageSrc = currentImageSrc['data-large-image'];
        }

        zoomImage.attr({
            'src': defaultZoomImageSrc,
            'alt': currentImageSrc.alt.replace("thumbnail ","")/* LGEGMO-4267 20180802 modify */
        });
    }

    proto._bindGalleryCarousel = function(idx) {
        var self = this;

        var isImageLoading = false;
        var isDragzoomTarget = false;

        var layerView = $(".hero-carousel-view");
        var layerGalleryNav = $(".hero-carousel-nav");
     
        var zoomWrap = layerView.find('.zoom-wrap');       
        var zoomTarget = layerView.find('img.zoom-target');
        var zoomPlusBtn = $('.hero-zoom-btn .hero-zoom-plus');
        var zoomMinusBtn = $('.hero-zoom-btn .hero-zoom-minus');

        var selectedSubModelJSON = self.selectedSubModelJSON;

        var zoomInstance = zoomTarget.panzoom({
            $zoomIn: zoomPlusBtn,
            $zoomOut: zoomMinusBtn,
            transition: true,
            panOnlyWhenZoomed: true,
            linearZoom: true,
            exponential: false,
            contain: false,
            minScale: 1,
            animate: true,
            maxScale: 2,
            increment: 0.2
        });

        zoomTarget.on( 'load', function(e){                        
            zoomInstance.panzoom('reset');
            zoomTarget.removeClass('out');
            isImageLoading = false;
        });

        layerGalleryNav.on('click', 'li a' , function(e){
            e.preventDefault();
            // when zoom image is loading cancel event
            //if (!!isImageLoading) return;

            isImageLoading = true;

            var _this = $(this);
            var $img = _this.find('img');

            layerGalleryNav.find('li').removeClass('active');
            _this.parents('li').addClass('active');

            if ( !!_this.data().zoomImage ){
                zoomTarget.attr({
                    'src':_this.data().zoomImage,
                    'alt':$img.attr('alt').replace("thumbnail ","")/* LGEGMO-4267 20180802 modify */
                });   
            } else {
                zoomTarget.attr({
                    'src':_this.data().largeImage,
                    'alt':$img.attr('alt').replace("thumbnail ","")/* LGEGMO-4267 20180802 modify */
                });
            }
        });

        zoomTarget.on('panzoomzoom', function(e, panzoom, scale, opts) {
            if ( scale == opts.minScale ){
                panzoom.reset();
            }

            if ( scale == opts.maxScale ){
                zoomTarget.addClass('out');
            } else {
                zoomTarget.removeClass('out');
            }
        });

        // mousewheel bind
        zoomInstance.parent().on('mousewheel.focal', function( e ) {
            e.preventDefault();
            var delta = e.delta || e.originalEvent.wheelDelta;
            var isFirefox = false;
            var zoomOut;

            if (!!delta === false) {
                delta = e.originalEvent.detail;
                isFirefox = true;
            }

            if ( isFirefox ){
                zoomOut = delta > 0 ? true : false;
            } else {
                zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
            }
            
            zoomInstance.panzoom('zoom', zoomOut, {
              increment: 0.2,
              animate: true
              //focal: e
            });
        });

        zoomTarget.on('zoomClick', function(e){
            e.preventDefault();

            var option = zoomInstance.panzoom('option');
            var currentScale = zoomInstance.panzoom('getMatrix')[0];

            if ( currentScale < 2 ){
                zoomInstance.panzoom('zoom', 2.0, {
                    animate: true
                });
            } else {
                zoomInstance.panzoom('zoom', 1.0, {
                    animate: true
                });
            }
        });

        // drag,click 
        var mouseStartPos;
        var mouseEndPos;
        zoomTarget.on('mousedown', function(e){
            mouseStartPos = [e.pageX, e.pageY];
        });
      
        zoomTarget.on('mouseup', function(e){
            mouseEndPos = [e.pageX, e.pageY];

            // if minScale trigger click
            if ( zoomTarget.panzoom('getMatrix')[0] === '1' ){
                zoomTarget.trigger('zoomClick');
                return;   
            }

            if ( mouseStartPos[0] == mouseEndPos[0] && mouseStartPos[1] == mouseEndPos[1] ){
                zoomTarget.trigger('zoomClick');
            }
        });

        $('html').on( 'click.gallery', '#pdpGallery a.btn-pdp-modal-close', function(){
            zoomInstance.panzoom('reset');
        });
    }

    proto._runGalleryPopup = function(e) {
        e.preventDefault();

        var self = this;
        var target = e.target;
        var layerBtn;

        if ( $(e.target).is('img') ) {
            layerBtn = $(e.target);            
        } else {
            layerBtn = $(e.target).find('img');
        }

        if ( $(e.target).is('span') ) {
            layerBtn = $(e.target).siblings('img');
        }

        self.currentNavIndex = (layerBtn.data('carouselIdx')==undefined)?0:layerBtn.data('carouselIdx');
        
        layerBtn.closest("li").addClass("active").siblings().removeClass("active");
        
        self._makeGalleryCarousel( self.currentNavIndex );
        self._pdpLayerPopup("pdpGallery",".product-hero-layer.gallery", e );
        
    }

    proto._chkCookie = function() {
        var self = this
        , localeCode = $("html").data("countrycode") + "_";

        function getCookie(cKey) {
            var allcookies = document.cookie;
            var cookies = allcookies.split("; ");
            for (var i = 0; i < cookies.length; i++) {
                var keyValues = cookies[i].split("=");
                if (keyValues[0] == cKey) {
                    return unescape(keyValues[1]);
                }
            }
            return "";
        }
    }


    proto._isRunning = function(f) {
        if(f) {
            if(!$('html').hasClass('isRunning')) {
                $('html').append("<div class='page-dimmed'></div>");
                $('html').addClass('isRunning');
            }
        }else {
            $("html > div.page-dimmed").remove();
            $('html').removeClass('isRunning');
        }
    }


    proto._setColorGroup = function(e) {
        var self = this;

        e.preventDefault();
        var isActive = ($(e.currentTarget).hasClass("active")) ? true : false ;
        var subModel = $(e.currentTarget).data("subModelId");
        $(e.currentTarget).closest(".picker-wrap").addClass("active").siblings().removeClass("active");

        $(".improv-visual-img-wrap").attr("adobe-thumb-order",1).find("img").data('carouselIdx',0).attr("data-carousel-idx",0);

        if(self.subModelJson[subModel] && !isActive){
            self._isRunning(true);
            $(e.currentTarget).closest(".picker-wrap").addClass("active").siblings().removeClass("active");
            $(e.currentTarget).closest(".picker-wrap").siblings().find("a").removeClass("active");
            $(e.currentTarget).addClass("active");

            $.map(self.subModelJson[subModel] , function(val, key) {
                var dataSelect = $("[data-sub-model-info="+key+"]")

                if(val === null){
                    dataSelect.hide();
                    /* LGEPJT-483 modify */
                    if (key == 'suggestPrice' || key == 'promotionPrice' || key == 'obsGpPrice') {
                        dataSelect.closest('[data-sub-model-info*=Flag]').hide();
                    }
                    /* //LGEPJT-483 modify */

                } else {
                    if(typeof val === "string"){
                        dataSelect.show();
                         /* LGEPJT-483 modify */
                        if (key == 'suggestPoint' || key == 'promotionPoint' || key == 'obsGpPoint') {
                            dataSelect.find("sup").html(val);
                            dataSelect.find("span").html(val);
                         /* //LGEPJT-483 modify */
                        /* LGERU-3559 20180717 add*/
                        } else if(key == 'obsPrice') {
                        	if(val == null || val == ''){
                				$('.obs_information').addClass('hide').find('.price span').attr('content', val);                				
                			}else{
                				$('.obs_information').removeClass('hide').find('.price span').attr('content', val); 
                			}
                        	dataSelect.html(val); 
                        /*// LGERU-3559 20180717 add*/
			/*LGERU-3644 20180713 add*/
                        } else if(key == 'mpn') {
                            $(".improve-info-title").data("mpn",val).attr("data-mpn",val);
                            /*//LGERU-3644 20180713 add*/
                        } else {
                           dataSelect.html(val); 
                        }
                    } else if (typeof val === 'object'){
                        
                        if(val.length){
                            
                            var temLi = $('#galleryLi').html();
                            var i;
                            var liLength = val.length;
                            
                            dataSelect.each(function(){
                                $(this).find("li").remove();
                                for (i = 0; i < liLength; i++) {
                                    var makeli = $(temLi).clone();
                                    $(makeli).find("img").attr(val[i]);
                                    $(this).append(makeli);
                                }
                                $(this).find("li:eq(0)").addClass("active");
                                if ($(this).hasClass('pdp-improve-gallery')) {
                                    if (liLength > 5) {
                                        $(this).find("li:eq(4)").addClass("gallery-more").find("a").append("<span class='count'>+"+(liLength-4)+"</span>");
                                        $(this).find("li:gt(4)").remove();
                                    }
                                }
                            })
                        } else {

                            if(Object.keys(val).length>1){
                                if(key == "tool3D") {
                                    if(val["unity3d"] == true && val["data-href"] != null) {
                                        dataSelect.data("href",val["data-href"] ).attr("data-href",val["data-href"]).show();
                                    } else if(val["unity3d"] == false && val["data-3d-video-href"] != null) {
                                        dataSelect.data("href",val["data-3d-video-href"]).attr("data-href",val["data-3d-video-href"]).show();
                                    } else {
                                        dataSelect.hide();
                                    }
                                } else if(key == 'newAddToCart'){
                                    /* LGEPJT-483 */                      
                                    dataSelect.show().addClass('data-active');
                                    dataSelect.attr('data-uri', val['obsuri']);
                                    dataSelect.attr('data-modelid', val['modelid']);
                                    dataSelect.attr('adobe-value', val['modelid']);                                                                  
                                    /* //LGEPJT-483 */
                                } else {
                                    dataSelect.attr(val).show();
                                }
                            } else {

                                if(val[Object.keys(val)] == null) {
                                    if(key == "whereToBuy" || key == "whereToBuyLocal" || key == "whereToBuyOnline" || key == "whereToBuyDistributors" ){
                                        dataSelect.removeClass("data-active");
                                    } else {
                                        dataSelect.hide().removeClass("data-active");
                                    }
                                } else {
                                    if(key == "whereToBuy" || key == "whereToBuyLocal" || key == "whereToBuyOnline" || key == "whereToBuyDistributors" ){
                                        dataSelect.attr(val).addClass("data-active");
                                    } else if(key == 'buyNow' && Object.keys(val) =="url") {
                                        dataSelect.data(val).show();
                                        ic.jquery.plugin('SmartWorld', smartworld, ".obs-submit");
                                    } else {
                                        dataSelect.attr(val).show().addClass("data-active");
                                    }
                                }
                            }
                        }
                    } else if (typeof val === 'boolean') {

                        if(key == "suggestFlag"){
                            if(val) {
                                dataSelect.show(); 
                            } else {
                                dataSelect.hide(); 
                            }
                        } else if(key == "promotionFlag"){
                            if(val) {
                                $(".price-default").addClass("promotion-before");
                                dataSelect.show(); 
                            } else {
                                $(".price-default").removeClass("promotion-before");
                                dataSelect.hide(); 
                            }
                        }
                        /* LGEPJT-483 add */
                        if (key == "obsGpFlag"){
                            if(val) {
                                $(".price-default").addClass("promotion-before");
                                dataSelect.show();
                            } else {
                                $(".price-default").removeClass("promotion-before");
                                dataSelect.hide(); 
                            }
                        }
                        /* //LGEPJT-483 add */
                    }
                }
            });

            $("[adobe-pdp-color]").attr("adobe-pdp-color",self.subModelJson[subModel].color);
        }
        /*LGEGMO-4094 20180426 modify*/
        
        if($(".cta-button .dropdown-content li a.data-active").size() == 0){
        	$(".improve-info-options .cta-button .dropdown-content").parents(".cta-button").hide();
        	//$(".improve-info-options .cta-button").hide();
        } else {
        	$(".improve-info-options .cta-button .dropdown-content").parents(".cta-button").show();
            //$(".improve-info-options .cta-button").show();
        }
        /*//LGEGMO-4094 20180426 modify*/
        self.selectedSubModelJSON = self.subModelJson[subModel];

        self._isRunning(false);
    }


    proto._pdpSlick = function(e){
        var carouselUl = $('.with-carousel-picker');
        /*LGEIN-1684 : 20180615 modify*/
        var numberOfSlidesToShow;
        if (lgFilter.locale == "/in" && carouselUl.attr('data-slides-to-show')!=undefined) {
        	//numberOfSlidesToShow = Number(carouselUl.attr('data-slides-to-show'));
            numberOfSlidesToShow = Math.floor(carouselUl.width()/carouselUl.find(".picker-wrap").width());
        } else {
            numberOfSlidesToShow = 5;
        }
        carouselUl.data("slidesToShow",numberOfSlidesToShow);
        if(!carouselUl.hasClass("slick-slider")){
            /* PJTPDP-23 20180314 add*/
            var idx = carouselUl.find(".picker-wrap.active").index() + 1;
            if($(window).outerWidth() < 1440) {
            	var slideview = idx - numberOfSlidesToShow - 1;
            } else {
                var slideview = idx - numberOfSlidesToShow;
            }
            if(slideview < 0) {
                slideview = 0;
            }
            /* //PJTPDP-23 20180314 add*/
            carouselUl.slickpdp({
                slidesToShow: numberOfSlidesToShow ,slidesToScroll: 1,infinite:false,variableWidth: true,
                initialSlide:slideview, /* //PJTPDP-23 20180314 modify */
                responsive: [
                    {
                        breakpoint: 1440,
                        settings: {
                            slidesToShow: numberOfSlidesToShow - 1,
                        }
                    }
                ]
            });
        }
        /*//LGEIN-1684 : 20180615 modify*/
    }

    proto._runGalleryActive = function(e) {
        var self = this;
         e.preventDefault();
        var idx = $(e.currentTarget).parent("li").index();
        var $galleryLager = $(e.currentTarget).find("img").attr('data-large-image');
  
        $(e.currentTarget).parent("li").addClass('active').siblings().removeClass('active');

        self.$heroImg.find("img").attr({
            'src':$galleryLager
        }).data('carouselIdx',idx).attr("data-carousel-idx",idx);

        self.$heroImg.find("a").attr("adobe-thumb-order",idx+1);
        
        /* LGERU-3424 add */
        /*if($("html").data("countrycode") == "ru"){*/ /* LGEGMO-4267 20180802 remove*/

            var titVal = ($(e.currentTarget).find("img").attr("title") == undefined) ? "" : $(e.currentTarget).find("img").attr("title");
            var altVal = ($(e.currentTarget).find("img").attr("alt") == undefined) ? "" : $(e.currentTarget).find("img").attr("alt").replace("thumbnail ","");/* LGEGMO-4267 20180802 modify */

            self.$heroImg.find("img").attr({
                'alt':altVal,
                "title":titVal
            })
        /*}*//* LGEGMO-4267 20180802 remove*/
        /* //LGERU-3424 add */
    }

    proto._etcEvent = function(){
        var self = this;

        self.$el.find('a.pdp-360-view').on('click', function(e) {
            e.preventDefault();
            self._pdpiframePopup("pdp360View",e);
        });
        /* PJTPDP-23 20180326 modify */
        self.$el.find('a.pdp-product-video').on('click', function(e) {
            e.preventDefault();
            self._pdpVideoPopup("pdpVideo",".product-hero-layer.video",e);
        });
        /* //PJTPDP-23 20180326 modify */
        self.$el.find('a.pdp-product-3d').off("click").on('click', function(e) {
            e.preventDefault();
            self._pdpiframePopup("pdp3dView",e);
        });


        $(window).scroll(function() {
            if($(this).scrollTop() == 0) {
                $('.move-top').hide()
            }else {
                $('.move-top').show();
            }
        });

        $('.improv-visual-img-wrap').on({
            'mouseover' : function(e) {
                $('#gallery-tooltip0').find('.tooltip-des').text($('.thumb').parents('li.active').find('img').attr('alt').replace("thumbnail ","")); /* LGEGMO-4267 20180802 modify */
                $('#gallery-tooltip0').css("top",e.pageY - 100);
            }
        });

        self.$el.on('click','.review_points > a',function(e) {
         //   e.preventDefault();
            if (!$(this).hasClass('other-link')) {
                var a;
                $('.pdp-improve-tab-wraper ul li').each(function() {
                    if ($(this).find('a i').hasClass('icon-reviews')) {
                        a = $(this);
                    }
                });
                a.find('a').trigger('click');
                return false;
            }
        });

    }

    proto._pdpMakeLayerPopup = function(id,view){
        var self = this;

        var layerTem = $("#pdpModalTemplate").html();
        var layerContent = $(layerTem);
        layerContent.attr("id",id);
        layerContent.hide();

        self.$layerPop = $("#"+id);
        var $layerClone = ($(view).find(".product-hero-layer-inner").size()>0) ? $(view).find(".product-hero-layer-inner") :  $(view);

        if(self.$layerPop.size()<1){
            
            $("body").append(layerContent);
            self.$layerPop = $("#"+id);
            if($(".signature-hero").size()>0) self.$layerPop.addClass("signature");
            self.$layerContentWrap = self.$layerPop.find(".pdp-popup-wrap");
            self.$layerContentWrap.prepend($layerClone);
            if(self.$layerPop.find("img.lazy").size()>0) self.$layerPop.find("img.lazy").lazyload();
        }

    }

    proto._pdpLayerPopup = function(id,view,e){
        var self = this;

        e.preventDefault();
        var layerTem = $("#pdpModalTemplate").html();
        var layerContent = $(layerTem);
        layerContent.attr("id",id);

        self.$layerPop = $("#"+id);
        var $layerClone = ($(view).find(".product-hero-layer-inner").size()>0) ? $(view).find(".product-hero-layer-inner") :  $(view);
        self.$layerbtn = $(e.currentTarget);

        if(self.$layerPop.size()<1){
             
            $("body").append(layerContent);
            self.$layerPop = $("#"+id);
          //  if($(".signature-hero").size()>0) self.$layerPop.addClass("signature");
            self.$layerContentWrap = self.$layerPop.find(".pdp-popup-wrap");
            self.$layerContentWrap.prepend($layerClone);
            if(self.$layerPop.find("img.lazy").size()>0) self.$layerPop.find("img.lazy").lazyload();
        } else {
            self.$layerPop.show();
        }

        var viewHeight = $(window).height();
        var contHeight = self.$layerPop.find(".pdp-popup-wrap").outerHeight();
        if(viewHeight > contHeight){
            var popTop = (viewHeight - contHeight) /2
            var vrTop = $(window).scrollTop() + popTop ;
        } else {
            var vrTop = $(window).scrollTop();
        }
        
        self.$layerPop.find(".pdp-popup-wrap").css("top",vrTop);
        self.$layerPop.find(".pdp-popup-wrap").focus();
       
        self.$layerPop.find("a.btn-pdp-modal-close").off('click').on({
            click: function(e) {
                e.preventDefault();
                $(this).closest(".pdp-modal-wrap").hide();
                self.$layerbtn.focus();
            }
        });

        self.$layerPop.find("a,button").filter(":first").on('keydown',function(e){
            if( e.shiftKey && e.keyCode == 9 ){
                e.preventDefault();
                self.$layerPop.find('a.btn-pdp-modal-close').focus();
            }
        });

        self.$layerPop.on('keydown', 'a.btn-pdp-modal-close',function(e){
           if( !e.shiftKey && e.keyCode == 9 ){
                e.preventDefault();
                self.$layerPop.find(".product-hero-layer-inner a ,.product-hero-layer-inner button").filter(":first").focus();
            }
        });
    
    }

    proto._pdpiframePopup = function(id,e){
        var self = this;

        e.preventDefault();
        var layerTem = $("#pdpModalTemplate").html();
        var layerContent = $(layerTem);
        layerContent.attr("id",id);
        self.$layerPop = $("#"+id);
        var vrUrl = XSSfilter($(e.currentTarget).attr('data-href'));
        var vrTitle = XSSfilter($(e.currentTarget).data('iframe-title'));
        var $layerClone = "<iframe id='modal_"+id+"' frameborder='0' src='"+vrUrl+"' title='"+vrTitle+"' scrolling='auto'></iframe>";
        self.$layerbtn = $(e.currentTarget);

        $("body").append(layerContent);
        self.$layerPop = $("#"+id);
     //   if($(".signature-hero").size()>0) self.$layerPop.addClass("signature");
        self.$layerContentWrap = self.$layerPop.find(".pdp-popup-wrap");
        self.$layerContentWrap.prepend($layerClone);
        var viewHeight = $(window).height();
        var contHeight = self.$layerContentWrap.outerHeight();
        if(viewHeight > contHeight){
            var popTop = (viewHeight - contHeight) /2
            var vrTop = $(window).scrollTop() + popTop ;
        } else {
            var vrTop = $(window).scrollTop();
        }
        self.$layerContentWrap.css("top",vrTop);
        self.$layerContentWrap.focus();
       
        self.$layerPop.find("a.btn-pdp-modal-close").on({
            click: function(e) {
                e.preventDefault();
                self.$layerPop.remove();
                self.$layerbtn.focus();
            }
        });

        self.$layerPop.on('keydown',function(e){
            if( e.shiftKey && e.keyCode == 9 ){
                e.preventDefault();
                self.$layerPop.focus();
            }
        });

        self.$layerPop.on('keydown', 'a.btn-pdp-modal-close',function(e){
           if( !e.shiftKey && e.keyCode == 9 ){
                e.preventDefault();
                self.$layerPop.focus();
            }
        });

    }

    /* PJTPDP-23 20180326 add */
    proto._pdpVideoPopup = function(id,view,e){
        var self = this;

        e.preventDefault();
        var layerTem = $("#pdpModalTemplate").html();
        var layerContent = $(layerTem);
        layerContent.attr("id",id);

        self.$layerPop = $("#"+id);
        var $layerClone = ($(view).find(".product-hero-layer-inner").size()>0) ? $(view).find(".product-hero-layer-inner").clone() :  $(view).clone();
        self.$layerbtn = $(e.currentTarget);

        if(self.$layerPop.size()<1){
            $("body").append(layerContent);
            self.$layerPop = $("#"+id);
            self.$layerContentWrap = self.$layerPop.find(".pdp-popup-wrap");
            self.$layerContentWrap.prepend($layerClone);
           
            $(".pdp-popup-wrap .pdp-video-wrap").slickpdp({
                dots: true,slidesToShow: 1,slidesToScroll: 1,infinite:false
            });

            $('.pdp-popup-wrap .pdp-video-slide .visuals').each(function() {
                if (!$(this).attr('data-video-type')) return;
                var vtype = XSSfilter($(this).attr('data-video-type'));
                var obj = $(this);
                if (vtype == 'youtube') {
                    // youtube
                    var videoCode = obj.attr('data-embed-code'),
                        alt = obj.attr('data-iframe-title'),
                        html;
                    html = '<div class="hero_video"><div><iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + videoCode + '?rel=0&showinfo=0&wmode=opaque" frameborder="0" allowfullscreen title="' + alt + '"></iframe></div></div>';
                } else {
                    // bc
                    var videoId = XSSfilter(obj.attr('data-video-id')),
                        accountId = XSSfilter(obj.attr('data-account')),
                        player = obj.attr('data-player') != null ? obj.attr('data-player') : 'default',
                        alt = obj.attr('data-iframe-title');
                    html;
                    /* LGEGMO-4062 */
                    html = '<div class="hero_video"><div><iframe src="https://players.brightcove.net/' + accountId + '/' + player + '_default/index.html?videoId=' + videoId + '" title="' + alt + '" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe></div></div>';
                    /*//LGEGMO-4062 */
                }
                obj.empty().append(html);
            });
        } 

        var viewHeight = $(window).height();
        var contHeight = self.$layerPop.find(".pdp-popup-wrap").outerHeight();
        if(viewHeight > contHeight){
            var popTop = (viewHeight - contHeight) /2
            var vrTop = $(window).scrollTop() + popTop ;
        } else {
            var vrTop = $(window).scrollTop();
        }
        
        self.$layerPop.find(".pdp-popup-wrap").css("top",vrTop);
        self.$layerPop.find(".pdp-popup-wrap").focus();
       
        self.$layerPop.find("a.btn-pdp-modal-close").off('click').on({
            click: function(e) {
                e.preventDefault();
                $(this).closest(".pdp-modal-wrap").remove();
                self.$layerbtn.focus();
            }
        });
        self.$layerPop.find("a,button").filter(":first").on('keydown',function(e){
            if( e.shiftKey && e.keyCode == 9 ){
                e.preventDefault();
                self.$layerPop.find('a.btn-pdp-modal-close').focus();
            }
        });

        self.$layerPop.on('keydown', 'a.btn-pdp-modal-close',function(e){
           if( !e.shiftKey && e.keyCode == 9 ){
                e.preventDefault();
                self.$layerPop.find(".product-hero-layer-inner a ,.product-hero-layer-inner button").filter(":first").focus();
            }
        });
    
    }
    /* //PJTPDP-23 20180326 add */
    
    /* LGERU-3559 20180719 add */
	var isMobile = globalConfig.isMobile;
	function obsModelTooltipOpen(self, orgText, _tipNum){
        var _target = self.parent();
        var _sticky = _target.parents(".wrapper").hasClass("sticky");
       		
		var $tipClone = _target.find(".obs-js-tooltip-mnum-wrap").clone();
        var _width = isMobile ? "90%" : $(".show-item").width();
        var _top = isMobile ? (self.offset().top- $(document).scrollTop()) + 30: (self.offset().top- $(document).scrollTop()) + 33;
        
        var _left = isMobile ? (self.offset().left + _width)> $(window).width() ? _target.offset().left - _width/2 : 0 : _target.offset().left - _width/2;
        var _arrowleft = !isMobile ? (self.offset().left - _left) + self.width()/2 : (self.offset().left - _left) + self.width()/2 - 20;
        
        if($("body").find(".obs-js-tooltip-mnum-wrap.clone").size() > 0){
        	$("body").find(".obs-js-tooltip-mnum-wrap.clone").remove();
        }
        
        $("body").append($tipClone.addClass("clone"));
        
        $(".obs-js-tooltip-mnum-wrap.clone").css({
            'left': _left,
            'top': _top,
            'width':_width,
            'display' :'block'
       }).addClass("active").find(".before, .after").css({
           'left': _arrowleft
       });
        
        if(!_sticky){
        	var _top = (self.offset().top - $(document).scrollTop()) - ($tipClone.outerHeight(true) + 10);
        	$tipClone.addClass("top").css({'top': _top});
        	
        	if(!isMobile){
        		var _left =  _target.offset().left -30;
                var _arrowleft = (self.offset().left - _left) + self.width()/2;
        		
                $tipClone.css({
                    'left': _left,
               }).find(".before, .after").css({
                   'left': _arrowleft
               });
        		
        	}
        }
    }
	function obsModelTooltipClose(self, _tipNum){
    	$("body").find(".obs-js-tooltip-mnum-wrap").removeClass("active").removeClass("top").css({'display' :'none'});
    	$(".obs-js-tooltip-mnum-wrap.clone").remove();
    }
	$('.is-mobile .obs_information .obs_info').on({
    	mouseenter: function (e) {
    		e.preventDefault();
        	if(!isMobile) {
	        	var _tipNum = $(this).attr("tooltip-num");
	        	obsModelTooltipOpen($(this), _tipNum);
        	}
        },
        click: function (e) {
        	e.preventDefault();
        	if(isMobile) {
	        	var _tipNum = $(this).attr("tooltip-num");
	        	obsModelTooltipOpen($(this), _tipNum);
        	}
        },
        focus: function (e) {
        	e.preventDefault();
        	if(!isMobile) {
	        	var _tipNum = $(this).attr("tooltip-num");
	        	obsModelTooltipOpen($(this), _tipNum);
        	}
        },
        focusout: function (e) {
        	e.preventDefault();
        	if(!isMobile) {
        		var _tipNum = $(this).attr("tooltip-num");
        		obsModelTooltipClose($(this), _tipNum);
        	} else {
                $(".obs-js-tooltip-mnum-wrap.clone .btn-close").trigger("click");
            }
        },
        mouseleave: function (e) {
        	e.preventDefault();        	
        	if(!isMobile) {
        		var _tipNum = $(this).attr("tooltip-num");
        		obsModelTooltipClose($(this), _tipNum);
        	} else {
                $(".obs-js-tooltip-mnum-wrap.clone .btn-close").trigger("click");
            }
        },
    });
    $(window).scroll(function(e) {
    	$('.obs-js-tooltip-mnum-wrap.clone .btn-close').trigger('click');
    });    
	$(document).on('click', '.obs-js-tooltip-mnum-wrap .btn-close', function(e) {
    	var _tipNum = $(this).attr("tooltip-num");
    	obsModelTooltipClose($(this), _tipNum);
    	return false;
    });        
    /*// LGERU-3559 20180719 add */

    /* LGEPJT-483 add */
    $(document).on('click', '.improve-info-wrap .btn_wrap a', function( e ){        
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

    
    if (!globalConfig.isMobile) {

        //   Create the jquery plugin and set it to auto-wire to specified selector
        ic.jquery.plugin('ProductPdp', ProductPdp, '.pdp-improve');

    }

    return ProductPdp;
    
});
