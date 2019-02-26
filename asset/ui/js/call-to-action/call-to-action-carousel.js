/* global define */

/**
 * CAll To Action Carousel module.
 * @module call-to-action-carousel
 */
define(['jquery', 'slick-carousel'], function($, slick) {

    'use strict';

    var ctaCarousel = {};

    $('.call-to-action.with-carousel').on('init', function(event, slick) {
        try{
            slick.$slideTrack.find("a").attr("tabindex", -1);
            slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
        }catch(e){
            //
        }
    }).slick({
        //speed: 300,
        dots: true
    }).on('afterChange', function(event, slick, currentSlide) {
        try{
            slick.$slideTrack.find("a").attr("tabindex", -1);
            slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
        }catch(e){
            //
        }
    });

    function setChildCarousel(slick){
        //
        var curIndex = slick.currentSlide;
        var interval;
        slick.$slides.each(function(i){
            var slide = slickAslick-carouselides.eq(i);
            var childCarousel = slide.find(".carousel-child");
            if(curIndex == i){
                ////curSlide.css("border", "2px solid red")
                setTabindex(childCarousel, true);
            }else{
                setTabindex(childCarousel, false);
            }
        });

        function setTabindex(childCarousel, flag){
            //console.log("setTabindex");
            if(childCarousel.data("isLoaded") == true){
                if(flag){
                    childCarousel.find(".slick-list").attr("tabindex", 0);
                    childCarousel.find("button").attr("tabindex", 0);
                }else{
                    childCarousel.find(".slick-list").attr("tabindex", -1);
                    childCarousel.find("button").attr("tabindex", -1);
                }
                return false;
            }else{
                setTimeout(function(){
                    setTabindex(childCarousel, flag);
                }, 200);
                return false;
            }

        }
    }

    $('.module.with-carousel').each(function(i) {
        var numberOfSlidesToShow;
        if (typeof $(this).attr('data-slides-to-show') !== "undefined") {
            numberOfSlidesToShow = Number($(this).attr('data-slides-to-show'));
        } else {
            numberOfSlidesToShow = 3;
        }
        $(this).addClass("i_" + i);
        if($(this).hasClass("m26") == false){
            $(this).find(".carousel").on('init', function(event, slick) {
                //alert(slick.$slides.length);
                //slick.$slides.css("border", "2px solid red");
                //alert(slick.$slider.get(0).className);
                try{
                    slick.$slideTrack.find("a").attr("tabindex", -1);
                    slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");

                    if(slick.$slider.hasClass("carousel")){
                        setChildCarousel(slick);
                    }
                }catch (e){
                    //
                }
            }).slick({
                lazyLoad: 'ondemand',
                slidesToShow: numberOfSlidesToShow,
                slidesToScroll: 1,
                dots: false,
                arrows: true,
                pauseOnHover : false,
                responsive: [{
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        dots: true,
                        arrows: true
                    }
                }]
            }).on('afterChange', function(event, slick, currentSlide) {
                try{
                    slick.$slideTrack.find("a").attr("tabindex", -1);
                    slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");

                    if(slick.$slider.hasClass("carousel")){
                        setChildCarousel(slick);
                    }
                }catch(e){
                    //
                }
            });
        }
    })

    // carousel childe slick, tocush move false type
    $('.with-carousel-child').each(function(i) {
        var slickToShow;
        if (typeof $(this).attr('data-slides-to-show') !== "undefined") {
            slickToShow = Number($(this).attr('data-slides-to-show'));
        } else {
            slickToShow = 4;
        }

        $(this).find(".carousel-child").on('init', function(event, slick) {
            try{
                $(this).data("isLoaded", true);
                $(this).find(".slick-list").attr("tabindex", -1);
                $(this).find("button").attr("tabindex", -1);
            }catch (e){
                //
            }
        }).slick({
            lazyLoad: 'ondemand',
            slidesToShow: 4,
            slidesToScroll: 1,
            dots: false,
            arrows: true,
            swipe: false,
            useCSS: false,
            accessibility: false,
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

        $(this).find(".carousel-child").find("[data-lazy]").each(function(){
            $(this).attr("src",$(this).attr("data-lazy"));
            $(this).removeAttr("data-lazy");
        })
    })

    $('.product-lists .item-tech .with-carousel').each(function(i) {
        $(this).find(".carousel").on('init', function(event, slick) {
            slick.$slideTrack.find("a").attr("tabindex", -1);
            slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
        }).slick({
            dots: false
        }).on('afterChange', function(event, slick, currentSlide) {
            slick.$slideTrack.find("a").attr("tabindex", -1);
            slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
        });
    });


    //STOCK LIST
    $('.module.stock-list-ajax').each(function(i) {
        //URI
        //"https://plrss-data.where-to-buy.co/feeds/plrss/v1/" + productName
        //var uri = "https://plrss-data.where-to-buy.co/feeds/plrss/v1/65EF950V?type=jsonp&authorizationToken=Z58QH8nvuxDQlHRDCC7M4XE+jWA21a0F2r4Pg2srfawK7ss8vy90wRAHr1IJ6qQuwrSx8fbLol+PL3lRyLFPi1MeE5gJMmZB7JV/jrQ7egA=&tag=brandsite";
        var uri = $(this).data("url");
        var buttonText = $(this).data("button-text") ? $(this).data("button-text") : "Visit Store";
	 /*LGECZ-708 20160802 modify*/
        var titleText = $(this).data("title-text") ? $(this).data("title-text") : "open new window";
        /* //LGECZ-708 20160802 modify*/
        var $stockList = $(this);
        var $container = $(this).find(".container");
                
        /* LGEBR-2871 20160325 add*/
        if(lgFilter.locale =="/br" && typeof $('#msgCodeBtntext').val() !==undefined && $('#msgCodeBtntext').val() !==null){
        	var _buttonText = $('#msgCodeBtntext').val();
        	buttonText = $(this).data("button-text") ? $(this).data("button-text") : _buttonText;
    	}
        
		/* LGEPH-468 20180927 add */
		function errorDrawItems(xhr) {
			if ($stockList.data("no-response")) {
				var content = "<p class='no-result align-center'>" + $stockList.data("no-response") + "</p>";
				$container.append(content);
			}
		}
		/*//LGEPH-468 20180927 add */
        
        /*//LGEBR-2871 20160325 add*/
        function drawItems($JSON){
        	var displayName = $stockList.data("display-name");	//LGETH-820 20181102 modify
            //console.log("##response##\n" + $JSON.last_updated);
            /* LGELT-71,LGEEE-77 20161011 modify */
            if (lgFilter.locale == "/lv"||lgFilter.locale == "/lt"||lgFilter.locale == "/ee") {
                var retailersData = $JSON.shops;
            } else {
                var retailersData = $JSON.products[0].retailers;
            }
            /* //LGELT-71,LGEEE-77  20161011 modify */
            var items = [];
            
            $.each( retailersData, function( i, obj ) {
                if(obj.instock != "false"){
                	/* LGETH-820 20181102 modify */
                	var innerStr = "<div class=\"slide\"><div class=\"slide-inner\"><div class=\"copy-area\"><p class=\"image\">"+
                    "<a href=\""+ obj.deeplink_url +"\" class=\"img-link\" title=\""+ titleText +"\" target=\"_blank\" adobe-online=\"online-retailer\" adobe-onlinename=\"" + obj.name + "\">";
                    if (displayName == true) {
                    	innerStr += "<img src=\""+ obj.logo_url +"\" alt=\""+ obj.display_name +"\" data-preload=\"true\"></a></p><p class=\"desc\" itemprop=\"name\">";
                    } else {
                    	innerStr += "<img src=\""+ obj.logo_url +"\" alt=\""+ obj.name +"\" data-preload=\"true\"></a></p><p class=\"desc\" itemprop=\"name\">";
                    }
                    innerStr += "<a itemprop=\"url\" href=\""+ obj.deeplink_url +"\" class=\"btn\" title=\""+titleText+"\" target=\"_blank\" adobe-online=\"online-retailer\" adobe-onlinename=\"" + obj.name + "\">"+buttonText+"</a></p></div></div></div>";
                    /*//LGETH-820 20181102 modify */
                    items.push( innerStr );
                }
            });
            if(items.length){
                $( "<div/>", {
                    "class": "carousel light-background",
                    "data-prev-text": "prev",
                    "data-next-text": "next",
                    html: items.join( "" )
                }).appendTo( $container );

                setStockListCarousel($stockList);
             /*LGECZ-708 20160802 modify*/
            }else if(!items.length && typeof $stockList.data("noResultMsg")!=="undefined"){
            	var content = "<p class='no-result align-center'>" + $stockList.data("noResultMsg") + "</p>";
                $container.append(content);
            }
            /*//LGECZ-708 20160802 modify*/
        }

        if(!uri) return false;
        $.ajax({
            type: "GET",
            url: String(uri),
            data: null,
            dataType: "jsonp",
            timeout: 5000,
            success: function($response) {
                //var response = jQuery.parseJSON(String($response));
                //drawItems(jQuery.parseJSON(String($response)));
            	console.log($response)
                drawItems($response);
            },
            error: function(xhr){
                //alert(errorMsg);
            	errorDrawItems(xhr);	/* LGEPH-468 20180927 add */
            }
            
        });
    })


    function changeStr(originStr, startStr, endStr, subStr){
        var result = "";
        var startNum = originStr.indexOf(startStr);
        var endNum = originStr.indexOf(endStr) + endStr.length;
        var changeStr = originStr.substring(startNum, endNum);

        result = originStr.replace(changeStr, subStr);
        return result;
    }

    //alert(changeStr("qwerty", "qw", "rt", "xx"));


    function setStockListCarousel(stockList){
        var numberOfSlidesToShow;
        if (typeof $(stockList).attr('data-slides-to-show') !== "undefined") {
            numberOfSlidesToShow = Number($(stockList).attr('data-slides-to-show'));
        } else {
            numberOfSlidesToShow = 3;
        }
        $(stockList).find(".carousel").on('init', function(event, slick) {
            try{
                slick.$slideTrack.find("a").attr("tabindex", -1);
                slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
            }catch (e){
                //
            }
        }).slick({
            lazyLoad: 'ondemand',
            slidesToShow: numberOfSlidesToShow,
            slidesToScroll: 1,
            dots: false,
            arrows: true,
            pauseOnHover : false,
            accessibility: false,
            responsive: [{
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true,
                    arrows: true
                }
            }]
        }).on('afterChange', function(event, slick, currentSlide) {
            try{
                slick.$slideTrack.find("a").attr("tabindex", -1);
                slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
            }catch(e){
                //
            }
        });
    }


    // Module M26
    var m26 = $(".module.m26");
    var tabElem = m26.find(".filter-tab li");
    var elemSelect = m26.find(".filter-tab select");
    var tabTarget = m26.find(".carousel");

    targetActive(0);

    tabElem.find(">a").on("click",function(e){
        var idx = $(this).parent().index();

        tabElem.removeClass("active");
        $(this).parent().addClass("active");

        targetActive(idx);
        e.preventDefault();
    })

    elemSelect.on("change", function(e){
        var idx = $(this).find("option:selected").index();
        targetActive(idx);
        e.preventDefault();
        console.log(11)
    })

    function targetActive(idx){
        var numberOfSlidesToShow;

        if (typeof tabTarget.eq(idx).parents(".with-carousel").attr('data-slides-to-show') !== "undefined") {
            numberOfSlidesToShow = Number(tabTarget.eq(idx).parents(".with-carousel").attr('data-slides-to-show'));
        } else {
            numberOfSlidesToShow = 3;
        }

        tabTarget.each(function(){
            if($(this).hasClass("slick-slider")){
                $(this).slick("unslick");
            }
        })

        tabTarget.removeClass("active").hide();
        tabTarget.eq(idx).addClass("active").show();

        tabTarget.eq(idx).slick({
            lazyLoad: 'ondemand',
            slidesToShow: numberOfSlidesToShow,
            slidesToScroll: 1,
            dots: false,
            arrows: true,
            pauseOnHover : false,
            responsive: [{
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true,
                    arrows: true
                }
            }]
        })
    }
    
    /* LGECS-794 20160818 add */
    var tallestLi_long = 0;
    var tallestLi_basic = 0; 
    	$('.mobile_multi .cal_size_1 .carousel-inner a,.mobile_multi .cal_size_2 .carousel-inner a').each(function(){    		 
            if($(this).find('dl').height() > tallestLi_long){tallestLi_long = $(this).height();}
        }).css('height',tallestLi_long + 65 +'px');
    	$('.mobile_multi .cal_size_3 .carousel-inner a,.mobile_multi .cal_size_4 .carousel-inner a').each(function(){    		
            if($(this).find('dl').height() > tallestLi_basic){tallestLi_basic = $(this).height();}
        }).css('height',tallestLi_basic + 65 +'px');    	

    $('.mobile_multi .carousel-inner').each(function(){	
		if($(this).find('a').length==2 || $(this).find('a').length==1){
			var _paddval = $('.call-to-action.with-carousel').height()/2 - $(this).find('a').height()/2;
		    $(this).find('a').css('padding-top',_paddval);
		}
	});
/* LGECS-794 //20160818 add */

    return ctaCarousel;
});
