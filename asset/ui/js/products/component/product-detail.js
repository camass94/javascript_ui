define(['global-config', 'jquery'], function(globalConfig, $) {
    'use strict';

    //tech-spec tooltip
    var btnTooltip = $('.btn-download-more');
    var tooltipWrap = $('.btn-tooltip-wrap');
    var conTooltip = $('.download-tooltip');
    var tooltipClose = $('.tooltip-close');
    var firstElem = $('.download-tooltip').find("a").filter(":first");
    var lastElem = $('.download-tooltip').find("a").filter(":last");

    btnTooltip.on('click', function(e) {
        e.preventDefault();

        if (tooltipWrap.hasClass('active')) {
            tooltipWrap.removeClass('active');
        } else {
            tooltipWrap.addClass('active');
        }

    });


    firstElem.off("keydown").on("keydown", function(e) {
        if (e.keyCode == 9 && e.shiftKey) {
            if (conTooltip.is(":visible") && $(e.target).hasClass("tooltip-close") == false) {
                e.preventDefault();
                lastElem.focus();
            }
        } else if (e.keyCode == 9) {}
    });

    lastElem.on("keydown", function(e) {
        if (e.keyCode == 9 && e.shiftKey) {} else if (e.keyCode == 13 && conTooltip.is(":visible")) {
            tooltipWrap.removeClass('active');
            btnTooltip.focus();
        } else if (conTooltip.is(":visible")) {
            e.preventDefault();
            firstElem.focus();
        }
    });

    tooltipClose.on('click', function(e) {
        e.preventDefault();
        tooltipWrap.removeClass('active');
        btnTooltip.focus();
    });

    //review tab
    var ratingReview = $('.ratingreview');
    var reviewTab = ratingReview.find('.review-tab-tit li a');
    var reviewTabCon = ratingReview.find('.review-tab-con');

    if (reviewTab.parent("li").length == 1) {
        var hrefId = reviewTab.attr("href");

        reviewTab.parent("li").addClass("active");
        reviewTabCon.hide();
        ratingReview.find(hrefId).show();
    }

    reviewTab.on('click', function(e) {
        var hrefId = $(this).attr("href");

        e.preventDefault();
        $(this).parent().addClass('active').siblings().removeClass('active');
        reviewTabCon.hide();
        ratingReview.find(hrefId).show();
    });

    // modal layer
    var $opener = $(".modal-open");
    var $innerTarget = $("body");
    var $modalLayer = $(".modal-layer");
    var $modalClose = $(".close-modal");
    var $firstElem = $('.modal-layer').find("a").filter(":first");
    var $lastElem = $('.modal-layer').find("a").filter(":last");

    $opener.on("click", function(e) {
        var _top = ($(window).scrollTop() + ($(window).height() - $innerTarget.find(".modal-layer").outerHeight(true)) / 2)

        $modalLayer.css("top", _top).attr("tabindex", "0").show().focus();
        e.preventDefault();
    })

    $modalClose.on("click", function(e) {
        $modalLayer.hide();
        $opener.focus();
        e.preventDefault();
    });

    $firstElem.off("keydown").on("keydown", function(e) {
        if (e.keyCode == 9 && e.shiftKey) {
            if ($modalLayer.is(":visible") && $(e.target).hasClass("close-modal") == false) {
                e.preventDefault();
                $lastElem.focus();
            }
        } else if (e.keyCode == 9) {}
    });

    $lastElem.off("keydown").on("keydown", function(e) {
        if (e.keyCode == 9 && e.shiftKey) {

        } else if (e.keyCode == 9) {
            e.preventDefault();
            if ($modalLayer.is(":visible")) {
                $firstElem.focus();
            }
        }
    });

    var $btnVideoPop = $('.product-video, [data-type="iframe"]');
    var $innerTarget = $('body');
    var $modalWrap = $('.modal-wrap');
    var $popWrap = $('.popuup-wrap');
    var $btnCloseLayer = $('.btn-modal-close');

    var ModalVideo = function(url, iframetitle, iframeClass, width, height) {
        var $modalWrap = $('.modal-wrap');
        var $iframeHref = url;
        var $iframeTitle = iframetitle;
        var $closeTitle = commonMsg.common["close"];
        var modalClass = iframeClass;
        
    /*PJTUSCON-9 modify*/
        if(iframeClass=="modal-3d-type"){
            var modalWidth = width;
            var modalHeight = height;
        }else{
            var modalWidth = width + 60;
            var modalHeight = height + 60;
        }
    /* //PJTUSCON-9 modify*/
        var content = "";
        
        /* LGEUK-1566 20180105 add */
        if(iframeClass == 'modal-product-viedo'){
        	content += '<div class="modal-wrap modal-product-viedo">';
        }else{
        	content += '<div class="modal-wrap">';
        }
        /*// LGEUK-1566 20180105 add */
        content += '<div class="modal-dimm"></div>';
        content += '<div class="popup-wrap" tabindex="0">';
        content += '<iframe id="modalVideo" src="' + $iframeHref + '" title="' + $iframeTitle + '" scrolling="auto" frameborder="0" style="overflow:auto; width:100%; height:100%"></iframe>';
        content += '<a href="#" class="btn-modal-close"><span>' + $closeTitle + '</span>';
        content += '</div>';
        content += '</div>';

        if ($modalWrap.length == 0) {
            $innerTarget.append(content);
            
            if(modalClass){
                $(".modal-wrap").addClass(modalClass);
            }
            /*PJTUSCON-9 modify*/
            if(modalWidth){
                if(iframeClass=="modal-3d-type"){
                    $(".popup-wrap").css({width : modalWidth});
                }else{
                    $(".popup-wrap").css({width : modalWidth, marginLeft : - modalWidth/2});
                }
            }
            /* //PJTUSCON-9 modify*/
            if(modalHeight){
                $(".popup-wrap").css("height",modalHeight);
            }

            var closeTop = parseInt($('.btn-modal-close').css('top'));
            closeTop = closeTop > 0 ? closeTop : -(closeTop);
            var popHeight = $innerTarget.find(".popup-wrap").outerHeight(true)+closeTop;

            var _top = $(window).height() < popHeight ? $(window).scrollTop() + 100 : ($(window).scrollTop() + ($(window).height() - $innerTarget.find(".popup-wrap").outerHeight(true)) / 2)+closeTop;

            $(".popup-wrap").css("top", _top).show();
            $(".modal-wrap").css("position", "fixed");
            $(".popup-wrap").focus();
            $(".modal-wrap").removeAttr("style");
            LayerFocus($(".modal-wrap"));
            /*PJTUSCON-9 modify*/
            $(window).resize(function(){
                if($(".modal-wrap").hasClass("modal-3d-type")){
                    $(".popup-wrap").css({
                        width:iframeSize().w,
                        height:iframeSize().h
                    })
                }   
            });
            /* //PJTUSCON-9 modify*/
            
            /* CNXSUPPORT-218 : 20160526 add */
            var brt = $iframeHref.substring($iframeHref.indexOf('?')+1, $iframeHref.indexOf('='));
            if(brt == "videoId"){
            	setTimeout(function(){
            		var modalWidth = $(".popup-wrap").outerWidth();
            		var _iframe = $("iframe#modalVideo");
            		var videoWidth = _iframe.contents().find('object').width() + 110;
                	
                	_iframe.parent(".popup-wrap").css({maxWidth : "1040px"});
                	if(modalWidth < videoWidth) {
                		_iframe.parent(".popup-wrap").css({height:"660px",padding:"50px",left:"45%",width : videoWidth});
                	}
            	}, 3000);           	
            }
            /*//CNXSUPPORT-218 : 20160526 add */
        }
    }

    function LayerFocus(el){
        var $modalWrap = $(el);
        var $firstElem = $modalWrap.find("a, [tabindex='0']").filter(":first");
        var $lastElem = $modalWrap.find("a, [tabindex='0']").filter(":last");

        $firstElem.off("keydown").on("keydown", function(e) {
            if (e.keyCode == 9 && e.shiftKey) {
                if ($modalWrap.is(":visible")) {
                    e.preventDefault();
                    $lastElem.focus();
                }
            } else if (e.keyCode == 9) {}
        });

        $lastElem.off("keydown").on("keydown", function(e) {
            if (e.keyCode == 9 && e.shiftKey) {

            } else if (e.keyCode == 9) {
                if ($modalWrap.is(":visible")) {
                    e.preventDefault();
                    $firstElem.focus();
                }
            }
        });
    }
        /*PJTUSCON-9 add*/
    function iframeSize(){
        var w;
        var h;
        if($(window).width() < 940) {
            w=$(window).width();
            h=900*$(window).width()/1600;
        }else{
            w=940;
            h = 900*940/1600;
        }
        return {'w': w,'h': h};
    }
    /*PJTUSCON-9 add*/
    

    $btnVideoPop.on('click', function(e) {
        if(!globalConfig.isMobile){
            e.preventDefault();
            $(this).addClass("active");
        /*PJTUSCON-9 modify*/
            var iframeClass;
            var width;
            var height;
            var url;
            if($(this).hasClass("product-video")){
                url = $(this).attr("data-href");
                /* LGEUK-1566 20171116 add */
                if($(this).data('video-type') == 'bc'){
                	var $anchor = $(this),
                    defaults = {
                        videoType : '',
                        iframeTitle : '',
                        embedCode : '',

                        videoId : '',
                        account : '',
                        player : 'default'
                    },
                    options = $.extend( null, defaults, $anchor.data() );
                	/* LGEGMO-4062 */
                	url = 'https://players.brightcove.net/' + options.account + '/' + options.player + '_default/index.html?videoId=' + options.videoId;
                	/*//LGEGMO-4062 */
                	iframeTit = options.iframeTitle;
                	
                }
                iframeClass = 'modal-product-viedo';
                /*// LGEUK-1566 20171116 add */
            }else if($(this).hasClass("product-3d")) {
                url = $(this).attr("data-href");
                iframeClass ='modal-3d-type';
                width =iframeSize().w;
                height = iframeSize().h;
            } else {
                iframeClass = 'modal-cta-type';
                width = $(this).data("width");
                height = $(this).data("height");
                url = $(this).attr("href");
            }
        /* //PJTUSCON-9 modify*/
            var iframeTit = $(this).data("iframe-title");

            ModalVideo(url, iframeTit, iframeClass, width, height);
        }
    });

    $(document).on('click', '.btn-modal-close', function(e) {
        e.preventDefault();
        $(this).parents(".modal-wrap").remove();
        $btnVideoPop.each(function(){
            if($(this).hasClass("active")){
                $(this).focus();
                $(this).removeClass("active");
            }
        })
    }); 
         /*PJTUSCON-9 add*/
        $(document).ready(function(){
            var blockLength=0;
            if($(".ProductHero").hasClass("hero-type-b")){
                $btnVideoPop.parents("ul.tools").parent().find("li").each(function(){
                if($(this).find("a").css("display")=="block"){
                    blockLength++;
                }
                });
                if(blockLength>=3){
                    $btnVideoPop.parents("ul.tools").find(".product-3d").css("display","block").parent().css("display","table-row");
                    $btnVideoPop.parents("div.tools_wrap").css("height","50px");
                }else{
                    $btnVideoPop.parents("ul.tools").find(".product-3d").css("display","block").parent().css("display","block");
                }
                $(window).resize(function(){
                    if(blockLength>=3){
                        if($(window).width()<1024){
                            $(".hero-type-b").find(".product-3d").parent().css("display","table-cell")
                        }else{
                            $(".hero-type-b").find(".product-3d").parent().css("display","table-row")
                        }
                    }
                })
            }
            
            /* LGEGMO-3176, LGEGMO-3394 : 20170731 modify */
            var $productHero = $('#ProductHero');
        	var modelName= $productHero.find(".product-zoom").attr("adobe-pdp-model");
        	$productHero.find(".slick-dots li").each(function(index){
        		var _idx = index;
        		$(this).find("> button").attr("adobe-click", "pdp-carousel-slide-click").attr("adobe-pdp-model", modelName).attr("adobe-gallery-order", _idx);
        	});

        	$productHero.find(".slick-arrow").attr("adobe-click", "pdp-carousel-arrow-click").attr("adobe-pdp-model", modelName);
            /*//LGEGMO-3176, LGEGMO-3394 : 20170731 modify */
	/*LGEGMO-3997  20180703 add*/
            $(".module.b07").each(function(){
            	if($(this).find("thead th").length==3){
            		$(this).addClass("col3");
            	}
            })
            /*//LGEGMO-3997  20180703 add*/
        });
        /* //PJTUSCON-9 add*/

    /* LGEGMO-2230 ADD */
    $(function(){
        var $productHero = $('#ProductHero');

        if( !$productHero.hasClass('signature-hero') ){
            return false;
        }

        var heroTitle = $productHero.find('.text-block > h2'),
            videoLayerClass = 'ly-signature-video',
            videoLayerIframeClass = videoLayerClass+'__iframe', 
            videoLayerCloseClass = videoLayerClass+'__close',
            _focusEl = null;


        $productHero.on('click','.product-video--signature',function(e){
            e.preventDefault();
            if( !$(this).closest('.no-cookies').length ){
                makeVideoPlayer( this );
                $productHero.find('.'+videoLayerClass).focus();
                _focusEl = this;
              //sendEvent('video-info', heroTitle); // DTM //LGEGMO-3768 : 20180111 remove
            }
        });

        $productHero.on('keydown', '.'+videoLayerClass,function(e){
            if( e.shiftKey && e.keyCode == 9 ){
                e.preventDefault();
                $productHero.find('.'+videoLayerCloseClass).focus();
            }
        });

        $productHero.on('keydown', '.'+videoLayerCloseClass,function(e){
           if( !e.shiftKey && e.keyCode == 9 ){
                e.preventDefault();
                $productHero.find('.'+videoLayerClass).focus();
            }
        });

        $productHero.on('click', '.'+videoLayerCloseClass,function(e){
            e.preventDefault();
            deleteVideoPlayer( $(this).closest( '.'+videoLayerClass ) );

            if( _focusEl ){
                $( _focusEl ).focus();
                _focusEl = null;
            }
        });

        function makeVideoPlayer( self ){

            var $anchor = $( self ),
                defaults = {
                    videoType : '',
                    iframeTitle : '',
                    embedCode : '',

                    videoId : '',
                    account : '',
                    player : 'default'
                },
                options = $.extend( null, defaults, $anchor.data() );


                var html = '<div class="'+videoLayerClass+'" tabindex="-1">'+ returnVideoCode( options ) +'<a href="#" title="'+commonMsg.common["close"]+'" class="no-underline '+videoLayerCloseClass+'"><i class="icon icon-close"></i></a></div>';
                $productHero.find('.'+videoLayerClass).remove();
                $productHero.append( html );
        }

        function deleteVideoPlayer( $layer ){
            $layer.find('iframe').attr('src','about:blank').one('load',function(){
                $layer.remove();
            });
        }
        /* LGEGMO-4062 */
        function returnVideoCode( opts ){
            var _iframe = '';
            if( opts.videoType == 'youtube' ){
                _iframe = '<iframe class="'+videoLayerIframeClass+'" width="100%" height="100%" src="https://www.youtube.com/embed/' + opts.embedCode + '?rel=0&showinfo=0&wmode=opaque" frameborder="0" allowfullscreen title="' + opts.iframeTitle + '"></iframe>';
            } else {
                _iframe = '<iframe class="'+videoLayerIframeClass+'" src="https://players.brightcove.net/' + opts.account + '/' + opts.player + '_default/index.html?videoId=' + opts.videoId + '" title="' + opts.iframeTitle + '" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe>';
            }

            return _iframe;
        }
        /*//LGEGMO-4062 */
        
    });
    /* //LGEGMO-2230 ADD */
});
