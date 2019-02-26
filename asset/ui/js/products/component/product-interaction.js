/* global define */

define(['ic/ic',
    'ic/ui/module',
    'common/util',
    'common/debounce',
    'lazyload',
    'slick-carousel',
    'global-config'
    ], function(ic, Module, util, debounce, lazyload, slick, globalConfig) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        $document = $(document),
        $window = $(window),
        $wrapper = $('.wrapper'),
        oldIE = false,
        ie = {
            interV: null,
            anchor: false
        },
        proto;

    if ($('html').is('.lt-ie9')) {
        $document = $window;
        oldIE = true;
    }

    var interaction = function(el, options) {
        var self = this;

        // Call the parent constructor
        interaction.superclass.constructor.call(self, el, options);

        self.$wrapper = $(el);
        /* LGEPJT-254 20170804 modify */
        self.moduleType = ['m30', 'm31', 'm32', 'm33', 'm34','m39','m40']; // class name    // LGEGMO-2281 Modify
        /* //LGEPJT-254 20170804 modify */
        if (self.$wrapper.is("." + self.moduleType.join(', .'))) self._initialize();

    };

    util.inherits(interaction, Module);
    proto = interaction.prototype;

    proto._initialize = function() {
        var self = this;
        self._module = '';
        self._elements = {};
        while (self._module = self.moduleType.pop())
            if (self.$wrapper.hasClass(self._module)) break;

        switch (self._module) {
        	/* LGEGMO-2230 Modify Start */
            case 'm30':
                self._elements.cta = $(self.options.ctaElement, self.$wrapper);
                self._elements.bgImg = $('.background-image .bg-block > img',self.$wrapper);
                self._elements.ctaImg = self._elements.cta.find('img').eq(0);

                (function(){
                    var loadCount = 0;
                    var bgSrc = self._elements.bgImg.attr('src');
                    var btnSrc = self._elements.ctaImg.attr('src');
                    var w = {
                        bg : 0,
                        btn :0
                    }

                    loadImg( 'bg', bgSrc );
                    loadImg( 'btn', btnSrc );

                    function loadImg( type, src ){
                        var img = new Image();
                        img.onload = function(){
                            loadCount+=1;

                            w[type] = img.width;

                            if( loadCount >= 2 ){
                                self._elements.cta.css('width', (w.btn * 100 / w.bg)+'%' );
                            }
                        }
                        img.src = src;
                    }

                })();

                self._elements.cta.css({
                    "top": self.options.ctaPosTop,
                    "left": self.options.ctaPosLeft
                });

                self.m30_eventHandler();
                self.$wrapper.addClass("initialized");

                break;
            /* //LGEGMO-2230 Modify End */
            case 'm31':

                var id = "video_" + parseInt(Math.random() * 1000000);
                self.$img = $('.thumb-area > img:visible', self.$wrapper);
                self.$video = $('.video-area .video-asset', self.$wrapper);
                self.$videoElement = $('<video id="' + id + '" ' + (self.$video.data("videoLoop") ? "loop" : "") + ' width="100%" height="100%" title="' + self.$video.data("videoAltText") + '"><source src="' + self.$video.data("videoFileWebm") + '" type="video/webm" /><source src="' + self.$video.data("videoFileMp4") + '" type="video/mp4"/></video>');

                if ( !globalConfig.isMobile ) {
                    self.$videoElement.appendTo(self.$video);
                    self.$videoElement[0].load();
                    self.m31_videoController();
                }

                self.$wrapper.addClass("initialized");

                break;

            case 'm32':

                self.$slider = $(".module-carousel", self.$wrapper).slick({
                    dots: false,
                    arrows: false,
                    speed: 0,
                    draggable: false
                });

                self.m32_buttonHandler();
                self.$wrapper.addClass("initialized");

                break;

            case 'm33':

                var slickOption = (function(){
                    var base = {
                        dots: true,
                        fade:true,
                        draggable: false
                    };
                    return self.options.effect ? base : $.extend(base,{speed:0});
                })();
                self.$slider = $(".module-carousel", self.$wrapper).slick(slickOption).on("afterChange", function() {
                    self.$wrapper.find(".lazy").lazyload();
                }).trigger("afterChange");

                self.$wrapper.addClass("group-carousel initialized");

                break;

            /*  LGEGMO-2281 ADD */
			case 'm34':

                self.$slider = $(".thumb-list", self.$wrapper).slick({
                    dots: false,
                    arrows: true,
                    draggable: false,
                    lazyLoad: 'ondemand',
                    infinite: false,
                    slidesToShow: 3,
                    slidesToScroll: 1,

                    responsive: [{
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2,
                            dots: true,
                            arrows: false
                        }
                    }]
                });
                self.itemLength = $('.thumb-list__item', self.$wrapper).length || 0;

                self.m34_thumbHandler();
                self.m34_videoHandler();
                self.m34_textHeightResizeHandler();

                $(window).on('resize.m34_textHeightResizeHandler', self.m34_textHeightResizeHandler.bind( self ) );
                self.$wrapper.on('forceUpdate',function(){
                    self.m34_textHeightResizeHandler();
                    self.$slider.slick('setPosition');
                }).addClass("initialized");

                break;
            /*  //LGEGMO-2281 ADD */

            /* LGEPJT-254 20170804 add */
            case 'm39' :
            var $el = this.$el;
            $el.on("click",function(e){
                e.preventDefault();
                var modalCls = self.modalWrapScroll();
                var $this = $(e.target).closest("a");
                if($this.closest("div").hasClass("no-cookies") ){
                    return;
                }
                if($this.is("[data-m39playBtn]")){
                    var data = $this.data();
                    var html = '';
                    html += '<div class="modal-wrap m39-media interaction-module">';
                    html += '	<div class="va-md">';
                    html += '	    <div class="close-wrap">';
                    html += '		    <a href="#close-modal" rel="modal:close" class="custom-close-modal">'+data.closeText+'</a>';
                    html += '	    </div>';
                    html += '	    <div class="slide-wrap">';
                    if(data.src) {
                        html += '		<img src="'+data.src+'" alt="">';
                    } else {
                        html += '		<img src="/lg4-common-gp/img/signature/bg_signature_modal.png" alt="">';
                    }
                    html += '	    </div>';
                    html += '   </div>';
                    html += '</div>';

                    if(modalCls){
                        $(".wrapper").addClass(modalCls);
                    }
                    $(html).modal({showClose:false} );

                    var $m39=$(".m39-media");
                    var $modal = $m39.closest(".jquery-modal");                        
                    $modal.addClass("signature");
                    if(data.videoType){
                        self.makeVideoPlayer($this, $m39.find(".slide-wrap"));
                    }
                    $modal.on("keydown", "a, button, input", function(e) {
                        var $btns = $modal.find("a, button, input");
                        var index = $btns.index( $(this) );
                        if($btns.length>1){
                            if(index == 0){
                                if(e.keyCode == 9 && e.shiftKey){
                                    e.preventDefault();
                                    $btns.eq($btns.length-1).focus();
                                }
                            } else if(index == $btns.length-1 ){
                                if(e.keyCode == 9 && !e.shiftKey){
                                    e.preventDefault();
                                    $btns.eq(0).focus();
                                }
                            }
                        } else {
                            if(e.keyCode == 9) {
                                e.preventDefault();
                                $btns.eq(0).focus();
                            }
                        }
                    });
                    $modal.find("a, button, input").eq(0).focus();

                    var ts;
                    $modal.on("touchstart", function(e) {
                        ts = e.originalEvent.touches[0].clientY;
                    });

                    $modal.on("touchmove",function(e){
                        var te = e.originalEvent.changedTouches[0].clientY;
                        if (ts > te) {
                            if($modal.scrollTop() >= $m39.outerHeight() - $modal.outerHeight()){
                                e.preventDefault();
                            }
                        } else {
                            if($modal.scrollTop() <= 0){
                                e.preventDefault();
                            }
                        }
                    });

                    $(document).one("modal:close", function(e){
                        $('.modal-wrap.modal.m39-media').remove();
                        $modal.off("keydown touchstart touchmove");
                        $this.focus();
                        if(modalCls){
                            $(".wrapper").removeClass(modalCls);
                        }
                    });
                }
                else if($this.is("[data-m39playbtnmoblie]") || $this.is(".btn-play-m")){
                    $this.closest(".slick-list").addClass("playing");
                    self.makeVideoPlayer($this);
                }
            });

            $el.find(".slide-wrap").on('init beforeChange ',function(event, slick, currentSlide, nextSlide){
                if(currentSlide != nextSlide){
                    var iframe = $el.find(".iframe_wrap");
                    if(iframe.length){
                        iframe.remove();
                    }
                }
            });
            
            var setSlickMobile = function(){
               $el.find(".slide-wrap").slick({
                    dots: true,
                    adaptiveHeight : true,
                    lazyLoad: 'ondemand'
                });
            }
            setSlickMobile();
            break;
            case 'm40' :
            var $el = this.$el;
            $el.find("[data-m40btnSignature]").on("click",function(e){
                e.preventDefault();
                var modalCls = self.modalWrapScroll();
                var $this = $(this);
                var moduleType = $this.closest(".m40").data("moduleType") || "m40a";
                if($this.hasClass('no-data')){
                    return;
                }
                var isMobile = $('body').hasClass('is-mobile');
                // var data = window[$this.attr("href")][ (isMobile && moduleType == "m40b") ? ($this.index()+2)%3 : $this.index() ];
                var data = window[$this.data("m40btnsignature")][ (isMobile && moduleType == "m40b") ? ($this.index()+2)%3 : $this.index() ];
				
				/* LGEGMO-3666 : 20180109 modify */
                var html = '<div class="modal-wrap m40-media interaction-module">';
                    html += '    <div class="close-wrap">';
                    html += '        <a href="#close-modal" rel="modal:close" class="custom-close-modal">'+$this.data("closeText") +'</a>';
                    html += '    </div>';
                    if(data.item.length){
                        html += '<div class="slide-wrap">';
                        for(var i=0,len=data.item.length; i<len; i++){
                            var d = data.item[i];
                            var dMetaBlank = (d.metaDescription == null && d.metaEmbedUrl == null  && d.metaUploadDate == null  && d.metaName == null  && d.metaThumbnailUrl == null) || (d.metaDescription == "" && d.metaEmbedUrl == ""  && d.metaUploadDate == ""  && d.metaName == ""  && d.metaThumbnailUrl == "") ? true : false;
                            
                            html += '   <div '+ (d.contentId ? 'data-news-url="'+d.contentId+'"' : '')  +(window["privacyChk"] == "N" ? ' class="no-cookies" data-eprivacy-category="Social Media" data-eprivacy-type="tooltip" data-target=".jquery-modal" data-top-absolute="Y" title="Open layer"' : '' )+'>';
                            if(!d.videoType){
                                html += '<img src="'+d.src+'" alt="'+d.alt+'"/>';
                            } else {
                                html += '<div class="side" itemprop="video" itemscope itemtype="https://schema.org/VideoObject">';
                                html += '   <a href="'+d.adobeSignatureVideo+'" class="btn_player" data-m40playBtn ';
                                html += '       data-video-type="'+d.videoType+'"';
                                html += '       data-embed-code="'+d.embedCode+'"';
                                html += '       data-video-id="'+d.videoId+'"';
                                html += '       data-account="'+d.account+'"';
                                html += '       data-player="'+d.player+'"';
                                html += '       data-autoplay="'+(d.autoplay || true)+'"';
                                html += '       data-iframe-title="'+d.iframeTitle+'"';
                                /* LGEGMO-3528 20171114 modify */
                                html += '       adobe-click="video-click"';
                                /*html += '       adobe-signature-video="'+d.adobeSignatureVideo+'"';*/
                                html += '       adobe-video="'+d.adobeSignatureVideo+'"';
                                /*// LGEGMO-3528 20171114 modify */
                                html += '       title="'+d.videoTitle+'"';
                                html += '   >';
                                html += '   <i class="btn-play"></i>';
                                html += '   </a>';
                                
                                if(dMetaBlank == false){
                                	html += '	<span itemprop="description">'+d.metaDescription+'</span>';
                                    html += '	<meta itemprop="embedURL" content="'+d.metaEmbedUrl +'" />';
                                    html += '	<meta itemprop="uploadDate" content="'+d.metaUploadDate+'" />';
                                    html += '   <img src="'+d.src+'" alt="'+d.alt+'"/>';
                                    html += '   <span itemprop="name">'+d.metaName+'</span>';
                                    html += '	<meta itemprop="thumbnailUrl" content="'+d.metaThumbnailUrl+'" />';
                                } else {
                                	html += '   <img src="'+d.src+'" alt="'+d.alt+'"/>';
                                }
                                html += '</div>';
                            }
                            if(!d.contentId){
                                html += '<div class="text-wrap">';
                                html += '    <h1 class="tit center">'+d.title+'</h1>';
                                html += '    <div class="pa center">'+d.text+'</div>';
                                html += '</div>';
                            }
                            html += '   </div>';
                        }
                        html += '</div>';
                    }
                    html += '</div>';
				/*//LGEGMO-3666 : 20180109 modify */
                if(modalCls){
                    $(".wrapper").addClass(modalCls);
                }
                $(html).modal({showClose:false});

                var $m40 = $(".m40-media");
                var $modal = $m40.closest(".jquery-modal");
                var $slick = $m40.find(".slide-wrap");
                var $createdSlick = null;

                $modal.addClass("signature").hide();

                var getNewsData = function(url,cb){
                    $.ajax({
                        'dataType' : 'html',
                        'url' : url,
                        'success' : function(res){
                            if(cb) cb(res);
                        }
                    })
                }
                
                var createSlick = function(){
                    $modal.show();
                    $createdSlick = $slick.slick({
                        dots: true,
                        adaptiveHeight : true,
                        lazyLoad: 'ondemand'
                    });

                    $modal.on("keydown", "a, button, input", function(e) {
                        var $btns = $modal.find("a, button, input");
                        var index = $btns.index( $(this) );
                        if($btns.length>1){
                            if(index == 0){
                                if(e.keyCode == 9 && e.shiftKey){
                                    e.preventDefault();
                                    $btns.eq($btns.length-1).focus();
                                }
                            } else if(index == $btns.length-1 ){
                                if(e.keyCode == 9 && !e.shiftKey){
                                    e.preventDefault();
                                    $btns.eq(0).focus();
                                }
                            }
                        } else {
                            if(e.keyCode == 9) {
                                e.preventDefault();
                                $btns.eq(0).focus();
                            }
                        }
                    });
                    $modal.find("a, button, input").eq(0).focus();
                    var $slickList = $modal.find(".slick-list");
                    $slickList.append("<div class='dim-grad'></div>");
                    if(isMobile){
                        $slickList.css({
                            "min-height" : (
                                $modal.outerHeight()
                                -$modal.find(".close-wrap").outerHeight()
                                -parseInt($m40.css("padding-top").split("px")[0])
                                -parseInt($m40.css("margin-top").split("px")[0])
                                -parseInt($m40.css("padding-bottom").split("px")[0])
                                -parseInt($m40.css("margin-bottom").split("px")[0])
                                -80
                            )+"px"
                        })
                    }
                }

                var slickRefresh = function(){
                    if( $createdSlick ) {
                        $slick.slick('setPosition');
                    }
                    if( $('body').hasClass("is-mobile") ){
                        var $textWrap = $modal.find(".text-wrap");
                        if($modal[0].scrollHeight - $modal.outerHeight() > 15){
                            $textWrap.removeClass("no-pd");
                        }  else { 
                            $textWrap.addClass("no-pd");
                        }
                    }
                }

                //gp&ar에는 모든 images 로드시 refresh되는 기능을 개선하였음. 20170822
                // var img = $modal.find(".slide-wrap img").eq(0); 
                var slickItem = $modal.find(".slide-wrap").children();
                var firstSlickItem = slickItem.eq(0);
                // var nImg = new Image();
                var newUrl = firstSlickItem.data()['newsUrl'];

                var checkImageLoad = function($images){
                    if($images.length){
                        var unloadedImages = $images.length;
                        var timer;
                        var setTimer = function(ele){
                            timer = setTimeout(function(){
                                // console.log("이미지로드완료 되지 않음 : ", ele);
                                slickRefresh();
                            },500)
                        }
                        $images.each(function(i,ele){
                            var newImage = new Image();
                            var thisImage = $(this);
                            newImage.onload = function(){
                                // console.log("이미지로드완료 : ", ele, " 넘버 : ", i);
                                clearTimeout(timer);
                                unloadedImages--;
                                if(!unloadedImages){
                                    // console.log("모든 이미지로드완료");
                                    slickRefresh();
                                } else {
                                    setTimer(ele);
                                }
                            }
                            newImage.src = thisImage.attr("src");
                        });
                    }
                }

                if(newUrl){
                    getNewsData(newUrl,function(data){
                        firstSlickItem.append(data);
                        createSlick();
                        checkImageLoad($modal.find(".slide-wrap img"));
                    });
                } else {
                    createSlick();
                    checkImageLoad($modal.find(".slide-wrap img"));
                }
                // nImg.onload = function() {
                //     if( $createdSlick ) {
                //         $slick.slick('setPosition');
                //     }
                // }
                // nImg.src = img.attr("src");

                $("[data-m40playBtn]").on("click",function(e){
                    e.preventDefault();
                    if($(this).closest(".slick-slide").hasClass("no-cookies")){
                        return
                    }
                    self.makeVideoPlayer($(this));
                });

                $slick.on('init ',function(event, slick){
                    slickRefresh();
                });

                $slick.on('beforeChange',function(event, slick, currentSlide,nextSlide){
                    $modal.find(".text-wrap").removeClass("no-pd");
                    if(currentSlide != nextSlide){
                        var iframe = $modal.find(".iframe_wrap");
                        if(iframe.length){
                            iframe.remove();
                        }
                        $modal.scrollTop(0);
                        
                    }
                });

                $slick.on('afterChange',function(event, slick, currentSlide){
                    var currentItem = slickItem.eq(currentSlide);
                    var newUrl = currentItem.data()['newsUrl'];
                    if(newUrl && !currentItem.find(".text-wrap").length ){
                        getNewsData(newUrl,function(data){
                            currentItem.append(data);
                            checkImageLoad(currentItem.find("img"));
                            // setTimeout(function(){
                            //     slickRefresh();
                            // },50);
                        });
                    }
                });

                var ts;
                $modal.on("touchstart", function(e) {
                    ts = e.originalEvent.touches[0].clientY;
                });

                $modal.on("touchmove",function(e){
                    var te = e.originalEvent.changedTouches[0].clientY;
                    if (ts > te) {
                        if($modal.scrollTop() >= $m40.outerHeight() - $modal.outerHeight()){
                            e.preventDefault();
                        }
                    } else {
                        if($modal.scrollTop() <= 0){
                            e.preventDefault();
                        }
                    }
                });

                $(document).one("modal:close", function(e){
                    $('.modal-wrap.modal.m40-media').remove();
                    $modal.off("keydown touchstart touchmove");
                    $this.focus();
                    if(modalCls){
                        $(".wrapper").removeClass(modalCls);
                    }
                });
            });
            break;
            /* //LGEPJT-254 20170804 add */
        }

    }

    proto.m30_eventHandler = function() {
        var self = this;
        var $toggleEl = $(self.options.toggleElement, self.$wrapper);

        self._elements.cta.on("click.interaction", function(e) {

            e.preventDefault();

            var $cta = $(this);

            $cta.toggleClass("on", !$toggleEl.is(":visible"))
            $toggleEl.stop().fadeToggle((self.options.effect ? 500 : 0), function() {
                $cta.toggleClass("on", $toggleEl.is(":visible"))
            })

        });
        return false;
    }

    proto.m31_videoController = function() {
        var self = this;
        var $controllEl = $(self.options.videoController, self.$wrapper)

        $controllEl.on("click.interaction", "a.play", function(e) {

            e.preventDefault();

            if(!globalConfig.isMobile) self.$videoElement[0].load();
            self.$videoElement.stop().fadeIn(300, function() {
                if (globalConfig.isMobile) {
                    self.canvasVideo.play();
                } else {
                    self.$videoElement[0].play();
                }
            });

        }).on("click.interaction", "a.stop", function(e) {

            e.preventDefault();

            if (globalConfig.isMobile) {
                self.canvasVideo.pause();
                self.$videoElement[0].load();
                self.canvasVideo.drawFrame(0);
            } else {
                self.$videoElement[0].pause();
            }
            self.$videoElement.stop().fadeOut(300);

        });

        self.$videoElement.on("playing", function() {
            $controllEl.addClass("playing");
            if (!globalConfig.isMobile) $controllEl.find("a:visible")[0].focus();
        }).on("pause", function() {
            $controllEl.removeClass("playing");
            if (!globalConfig.isMobile) $controllEl.find("a:visible")[0].focus();
        }).on("ended", function() {
            self.$videoElement.stop().fadeOut(300);
        })

        self.$videoElement[0].load();

        return false;
    }

    proto.m32_buttonHandler = function() {
        var self = this;
        var $buttonEl = $(self.options.slideButtonElement, self.$wrapper);

            $buttonEl.on("click.interaction", "a", function(e) {

                e.preventDefault();

                var $el = $(this);
                self.$slider.slick("slickGoTo", $el.data("callSlide"));
                $buttonEl.removeClass("on");
                $el.parents($buttonEl).addClass("on")

        })

        self.$slider.on("afterChange", function(event, slick, currentSlide, nextSlide) {
            $buttonEl.removeClass("on").eq(currentSlide).addClass("on")
            self.$wrapper.find(".lazy").lazyload();
        })

        return false;
    }

    /*  LGEGMO-2281 ADD */
	proto.m34_thumbHandler = function() {
        var self = this,
            $videoItems = $('.video-item',self.$wrapper);

        _changeVideoItem( 0 );

		if( self.itemLength < 2 ){
        	self.$wrapper.find(".thumb-list").hide();
        }

        self.$wrapper.on('click','.thumb-list__anchor',function(e){
            e.preventDefault();
            var $li = $(this).closest('.thumb-list__item');
            if( $li.hasClass('is-active') ){
                return false;
            }
            $li.addClass('is-active').siblings().removeClass('is-active')
            _changeVideoItem( $li.index() );
            
            /* LGEGMO-2491 : 20161128 add */
            var _scrollT = $(".video-item.is-active .video-item__title").offset().top - 20;
            $(window).scrollTop(_scrollT);
            /*//LGEGMO-2491 : 20161128 add */
        });

        function _changeVideoItem ( itemIdx ){
            $videoItems.find('iframe.video-item__iframe').remove();
			$videoItems.find('a.close').remove();
            $videoItems.eq( itemIdx )
                        .show()
                        .addClass('is-active')

                        .siblings()
                        .hide()
                        .removeClass('is-active');
        }

        return false;
    };

    proto.m34_textHeightResizeHandler = function(){
    	var self = this,
	    	$items = $('.video-item',self.$wrapper),
	    	h = { title : 0, subTitle : 0 };

    	$items.each(function(){
    		var $this = $(this),
    			titleH, subTitleH;

    		$this.hasClass('is-active') || $this.addClass('is-invisible');
    		titleH = parseInt( $this.find('.video-item__title').removeAttr('style').height(),10);
			subTitleH = parseInt( $this.find('.video-item__subtitle').removeAttr('style').height(),10);

    		h.title = titleH > h.title ? titleH : h.title;
    		h.subTitle = subTitleH > h.subTitle ? subTitleH : h.subTitle;
    	});

		$items.removeClass('is-invisible');
		$items.find('.video-item__title').height( h.title );
		$items.find('.video-item__subtitle').height( h.subTitle );

    	return false;
    };

    proto.m34_videoHandler = function() {
        var self = this;

        self.$wrapper.on('click','.video-item__button',function(e){
            e.preventDefault();
            $(this).closest('.no-cookies').length || _makeVideoPlayer( $(this) );
        });

        self.$wrapper.on('click','a.close',function(){
            $(this).closest('.video-item__stage').find(".video-item__button").focus();
            $('iframe.video-item__iframe', self.$wrapper).remove();
            $('a.close', self.$wrapper).remove();
            return false;
        });

        function _makeVideoPlayer( $anchor ){
            var _default = {
                videoType : '',
                embedCode : '',
                iframeTitle : '',

                videoId : '',
                account : '',
                player : 'default'
            }
            var _data = $.extend( {}, _default, $anchor.data() ),
                _html = '';


            // youtube Type
            /* LGEGMO-2530, LGEGMO-4109 : 20180502 modify*/
            /* LGEGMO-4062 */
            if (!globalConfig.isMobile){
            	if( _data.videoType === 'youtube' && _data.embedCode ){
                    _html = '<iframe tabindex="-1" class="video-item__iframe" src="https://www.youtube.com/embed/' + _data.embedCode + '?rel=0&showinfo=0&wmode=opaque&autoplay=1" frameborder="0" allowfullscreen title="' + _data.iframeTitle + '"></iframe><a href="#" title="Close" class="close no-underline"><i class="icon icon-video-close"></i></a>';
                } else if( _data.videoType === 'bc') {
                    _html = '<iframe tabindex="-1" class="video-item__iframe" src="https://players.brightcove.net/' + _data.account + '/' + _data.player + '_default/index.html?videoId=' + _data.videoId + '&autoplay=true" title="' + _data.iframeTitle + '" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe><a href="#" title="Close" class="close no-underline"><i class="icon icon-video-close"></i></a>';
                } else {
                    console.error('undefined _ video type ');
                }
            } else {
            	if( _data.videoType === 'youtube' && _data.embedCode ){
                    _html = '<iframe tabindex="-1" class="video-item__iframe" src="https://www.youtube.com/embed/' + _data.embedCode + '?rel=0&showinfo=0&wmode=opaque" frameborder="0" allowfullscreen title="' + _data.iframeTitle + '"></iframe><a href="#" title="Close" class="close no-underline"><i class="icon icon-video-close"></i></a>';
                } else if( _data.videoType === 'bc') {
                    _html = '<iframe tabindex="-1" class="video-item__iframe" src="https://players.brightcove.net/' + _data.account + '/' + _data.player + '_default/index.html?videoId=' + _data.videoId + '" title="' + _data.iframeTitle + '" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe><a href="#" title="Close" class="close no-underline"><i class="icon icon-video-close"></i></a>';
                } else {
                    console.error('undefined _ video type ');
                }
            }
            /*//LGEGMO-4062 */
            
            /*//LGEGMO-2530, LGEGMO-4109 : 20180502 modify*/

            _html && $anchor.after( _html )
                .siblings('iframe.video-item__iframe')
                .one('load',function(){
                    $(this).addClass('is-loaded')
                }).focus();
            //_data.iframeTitle && sendEvent('video-info', _data.iframeTitle); // DTM //LGEGMO-3768 : 20180111 remove
            $('iframe.video-item__iframe', self.$wrapper).focus();
        }

        return false;
    }
    /*  //LGEGMO-2281 ADD */
    /* LGEGMO-4062 */
    proto.makeVideoPlayerHTML = function(_data){
        var _html = '';
        if( _data.videoType === 'youtube' && _data.embedCode ){
            _html = '<div class="iframe_wrap"><iframe tabindex="0" class="video-item__iframe" src="https://www.youtube.com/embed/' + _data.embedCode + '?'+(_data.autoplay? 'autoplay=1&':'')+'rel=0&showinfo=0&wmode=opaque" frameborder="0" allowfullscreen title="' + _data.iframeTitle + '"></iframe> <a href="javascript:;" class="close-video" title="close video"></a> </div>';
        } else if( _data.videoType === 'bc') {
            _html = '<div class="iframe_wrap"><iframe tabindex="0" class="video-item__iframe" src="https://players.brightcove.net/' + _data.account + '/' + _data.player + '_default/index.html?'+(_data.autoplay?'autoplay=true&':'')+'videoId=' + _data.videoId + '" title="' + _data.iframeTitle + '" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe> <a href="javascript:;" class="close-video" title="close video"></a> </div>';
        } else {
            console.error('undefined _ video type ');
        }
        return _html;
    };
    /*//LGEGMO-4062 */
    proto.makeVideoPlayer = function($anchor, target) {
        var self = this;
        var _data = $.extend({
            videoType : '',
            embedCode : '',
            iframeTitle : '',
            videoId : '',
            account : '',
            player : 'default',
            autoplay : true
        }, $anchor.data() ),
            _html = '';
        _html = self.makeVideoPlayerHTML(_data);
        if(!target){
            _html && $anchor.after( _html )
                .siblings('iframe.video-item__iframe')
                .one('load',function(){
                    $(this).addClass('is-loaded')
                }).focus();
            //_data.iframeTitle && sendEvent('video-info', _data.iframeTitle); // DTM //LGEGMO-3768 : 20180111 remove
            $('iframe.video-item__iframe', self.$wrapper).focus();
            $anchor.parent().find(".close-video").on("click",function(){
                $anchor.next('.iframe_wrap').remove();
                $anchor.closest(".slick-list").removeClass("playing");
                return false;
            })
        } else {
            _html && target.append( _html )
                .siblings('iframe.video-item__iframe')
                .one('load',function(){
                    $(this).addClass('is-loaded')
                }).focus();
            //_data.iframeTitle && sendEvent('video-info', _data.iframeTitle); // DTM //LGEGMO-3768 : 20180111 remove
            $('iframe.video-item__iframe', self.$wrapper).focus();
            target.find(".close-video").on("click",function(){
                target.find('.iframe_wrap').remove();
                return false;
            })
        }
    }

    proto.modalWrapScroll = function() {
        if($('body').hasClass('is-mobile')){
            return false;
        }
        // var wrap = $(".wrapper");
        // if(wrap.prop("scrollHeight") <= wrap.prop("clientHeight")){
        //     return false;
        // }

        var ua = navigator.userAgent.toLowerCase();
        if( ua.indexOf ('msie') != -1 || ua.indexOf('trident') != - 1 ) {
            var version = 11 ;
            var _ua = /msie ([0-9]{1,}[\.0-9]{0,})/.exec ( ua );
            if(_ua){
                version = parseInt (_ua[1]);
            }
            var classNames = '';
            classNames += ' ie-modal';
            classNames += ' ie' + version;
            for(var i=version+1; i<= 11; i++ ) {
                classNames +=  ' lt-ie' + i;
            }
            return classNames;
        } else if(ua.indexOf("chrome") != -1){
            return 'chrome-modal'
        } else if(ua.indexOf("firefox") != -1){
            return 'ff-modal'
        } else {
            return "chrome-modal"
        }

    }
    /* //LGEPJT-254 20170804 add */
    plugin('interaction', interaction, '.interaction-module');

    return interaction;

});