define(['global-config', 'jquery', 'common/dtm'], function(globalConfig, $, dtm) {

	'use strict';

	var isMobile = 0;
	if ($('body').hasClass('is-mobile')) {
		isMobile = 1;
	}

    function videoStop(myid) {
        var v = $('#' + myid);
        //var v = document.getElementById(myid);
        v.get(0).pause();
        v.get(0).currentTime = 0;
        return false;
    }

    function videoPlay(myid,loop) {
        var v = document.getElementById(myid);
        v.play();
        bindEnd(myid);
        if(loop != 1){
            $(v).parent().css({zIndex:6});
        }
    }
    /* LGEGMO-3331 : 20170706 modify */
    function bindEnd(myid) {
        var v = document.getElementById(myid);
        $("#" + myid).unbind('ended').bind('ended', function() {
            $("html").stop().animate({
                "null": 1
            }, 500).promise().done(function() {
                v.pause();
                v.currentTime = 0;
                $("#" + myid).parents(".module").find('a.play').css('visibility', 'visible');
                $("#" + myid).parents(".module").find('a.stop').css('visibility', 'hidden');
                
				$("#" + myid).parent().attr('style', '').closest('.video-asset').css('z-index', '-1');
            });
        });
        // $(this).css({visibility:"visible"});        
    }
    /*//LGEGMO-3331 : 20170706 modify */
    function appendVideo(myid, myvideo_mp4, myvideo_webm, loop, obj, title) {
        var t = "";
        loop = loop == 1 ? "loop" : "";
        t = t + '<video '+loop+' width="100%" height="100%" id="' + myid + '" title="'+title+'"><source src="' + myvideo_webm + '" type="video/webm" /><source src="' + myvideo_mp4 + '" type="video/mp4" /></video>';
        obj.empty().append(t);
        if(loop != "loop"){
            $("#" + myid).closest('.module').find("a.stop").remove();
        }
        $("#" + myid).load();
    }
    /*LGEGMO-2628 : 20170221 modify*/
    if(isMobile==0){
        $('.background-animation .video-asset').each(function() {
        	if($(this).attr('data-video-type') !="bc"){
        		appendVideo($(this).attr('data-video-id'), $(this).attr('data-video-file-mp4'), $(this).attr('data-video-file-webm'), $(this).attr("data-video-loop"), $(this), $(this).attr('data-video-alt-text'));
        	}
        	
            $(this).css({
                'position': 'absolute',
                'left': '0',
                'top': '0',
                'width': '100%',
                'height': '100%',
                'overflow': 'hidden',
                'background' : '#000000'
            });
            /* CNXSUPPORT-61 : 20160229 add */
            if($(this).attr("data-video-loop") == 0 || $(this).attr("data-video-loop") == null){
            	$(this).css({'zIndex' : '-1'});
            } else {
            	$(this).css({'zIndex' : '2'});
            }
            /*//CNXSUPPORT-61 : 20160229 add */
        });
    }
    
	if ($('html').hasClass('no-video')) {
		$('.background-animation .video-asset').remove();
	}

	if($(".background-animation").find(".no-cookies").length == 0){
		/* LGEGMO-3331, LGESA-314 : 20180108 modify*/
		$(document).on('click', '.background-animation a.play', function(e) {
	        var v = $(this).closest('.background-animation').find('.video-asset').attr('data-video-id'),
            loop = $(this).closest('.background-animation').find('.video-asset').attr('data-video-loop');
	        
	        if($(this).closest('.background-animation').find('.video-asset').attr('data-video-type') =="bc"){
	        	var obj = $(this).closest('.background-animation').find('.video-asset');
	        	var tit = $(this).find('.text-block h3').text();
	        	var txtView = obj.attr('data-text-view');
	        	
	    		var videoId = obj.attr('data-video-id'),
				accountId = obj.attr('data-account'),
				player = obj.attr('data-player') != null ? obj.attr('data-player') : 'default',
				alt = obj.attr('data-iframe-title'),
				videoCode = obj.attr('data-embed-code'),
				html;				
				/* LGEGMO-4062 */
				var html = '<div class="video-content"><iframe src="https://players.brightcove.net/' + accountId + '/' + player + '_default/index.html?videoId=' + videoId + '&autoplay=true" title="' + alt + '" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe><a href="#" title="'+commonMsg.common["close"]+'" class="close no-underline"><i class="icon icon-video-close"></i></a></div>';	// LGEGMO-2881 20170518 modify
				/*//LGEGMO-4062 */
				obj.empty().append(html);
	
				//obj.show().css({zIndex: "2"});
	    		txtView == "hide" ? obj.css({zIndex: "3"}) : obj.css({zIndex: "2"});
	    		
				obj.find('.video-content').attr('tabIndex', -1).focus();
				obj.parents(".module").find('a.play, a.stop').css('visibility', 'hidden');
				obj.focus();
				obj.parents(".module.m02").find(".text-block").css({height: '90%',top: '10%', paddingTop:0});
				
				obj.find("a.close").unbind('click').on({
					click: function(e) {	
						obj.empty().hide();
						obj.closest('.feature-module .column').find('.text-block').attr('style', '');
						obj.closest('.feature-module .column').find('.video-thumb').attr('style', '');
						obj.parents(".module").find('a.play').css('visibility', 'visible');
						obj.parents(".module.m02").find(".text-block").css({height: '90%',top: '10%', paddingTop:0});
						$(this).focus();
						return false;
					}
				});
	        } else {
	        	videoPlay(v,loop);
		        $(this).css({visibility:"hidden"});
		        $(this).parents('.background-animation').find('a.stop').css({visibility:"visible"}).focus();
	        }
	        
	        return false;
		});
		/*//LGEGMO-3331, LGESA-314 : 20180108 modify*/

		$('.background-animation a.stop').unbind('click').bind('click', function() {
	        var v = $(this).closest('.background-animation').find('.video-asset').attr('data-video-id');
	        videoStop(v);
	        $(this).css({visibility:"hidden"});
	        $(this).parents('.background-animation').find('a.play').css({visibility:"visible"}).focus();
	        return false;
	    });
	    
	    $('.background-animation').find("a.close").unbind('click').on({
			click: function(e) {
				var obj = $(this).parents('.background-animation').find('.video-asset');
				
				obj.empty().hide();
				obj.closest('.feature-module .column').find('.text-block').attr('style', '');
				obj.closest('.feature-module .column').find('.video-thumb').attr('style', '');
				obj.parents(".module").find('a.play').css('visibility', 'hidden');
				$(this).focus();
			}
		});
    }
	/*//LGEGMO-2628 : 20170221 modify*/
	$(document).on('click', '.module .see-video', function(e) {
		e.preventDefault();
		var _this = $(this);
		var obj = $(this).closest('.module').find('.video-asset');
		var tit = $(this).closest('.module').find('.text-block h3').text();
		//alert(tit);
		if (obj.attr('data-video-type') == 'youtube') {
			var videoCode = obj.attr('data-embed-code'),
				alt = obj.attr('data-iframe-title');
				/*PJTHEMC-1 modify*/
	            if(!$(this).closest('.module').hasClass('m36')&&!$(this).closest('.module').hasClass('m37')){
	                if (isMobile == 0 || $(this).closest('.module').hasClass('m01')) {
	                    $(this).closest('.module').find('.text-block').hide();
	                }
	                $(this).closest('.module').find('.video-thumb').hide();
	            }else{
	            	if(isMobile == 0 && $(this).closest('.module').height()<670){
	            		$(this).closest('.module').height("670")
	            	}
	            }
			//sendEvent('video-info', tit); // DTM
			//var html = '<iframe width="560" height="315" src="https://www.youtube.com/embed/BivPPWI0q7Q" frameborder="0" allowfullscreen></iframe>';
			/*LGEGMO-2530, LGEGMO-4109 : 20180502 modify*/
			if (isMobile == 0 && $(this).closest('.module').hasClass('m29')) {
				var html = '<div class="video-content"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + videoCode + '?rel=0&showinfo=0&wmode=opaque&autoplay=1" frameborder="0" allowfullscreen title="' + alt + '"></iframe><a href="#" title="Close" class="close no-underline"><i class="icon icon-video-close"></i></a></div>';
			} else {
				var html = '<div class="video-content"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + videoCode + '?rel=0&showinfo=0&wmode=opaque" frameborder="0" allowfullscreen title="' + alt + '"></iframe><a href="#" title="'+commonMsg.common["close"]+'" class="close no-underline"><i class="icon icon-video-close"></i></a></div>';	// LGEGMO-2881 20170518 modify
			}
			/*//LGEGMO-2530, LGEGMO-4109 : 20180502 modify*/
			/*LGEGMO-3196 20170718 modify*/
			if(_this.data("modalPopup")){
				ModalVideo($(this).closest('.module'),html);
			}else{
			obj.empty().append(html);
			obj.show();
			obj.find('.video-content').attr('tabIndex', -1).focus();
			obj.find("a.close").unbind('click').on({
				click: function(e) {
					e.preventDefault();
					obj.empty().hide();
					obj.closest('.module').find('.text-block').attr('style', '');
					obj.closest('.module').find('.video-thumb').attr('style', '');
					_this.focus();
					if(obj.closest('.module').hasClass('m36')||obj.closest('.module').hasClass('m37')){
                    	obj.closest('.module').height("auto");
                    }
				}
			});
			}
/*//LGEGMO-3196 20170718 modify*/
		} else {
			var videoId = obj.attr('data-video-id'),
				accountId = obj.attr('data-account'),
				player = obj.attr('data-player') != null ? obj.attr('data-player') : 'default',
				alt = obj.attr('data-iframe-title'),
				html;
				if(!$(this).closest('.module').hasClass('m36')&&!$(this).closest('.module').hasClass('m37')){
	                if (isMobile == 0 || $(this).closest('.module').hasClass('m01')) {
	                    $(this).closest('.module').find('.text-block').hide();
	                }
	                $(this).closest('.module').find('.video-thumb').hide();
                }else{
                	if(isMobile == 0 && $(this).closest('.module').height()<670){
                		$(this).closest('.module').height("670")
                	}
                }
				/* //PJTHEMC-1 modify*/
			if ($('html').hasClass('lt-ie9')) {
				$(this).closest('.module').find('.text-block').show();
				return;
			}
			//sendEvent('video-info', tit); // DTM
			//html = '<div class="video-content"><video data-video-id="3811035969001" data-account="1432358930001" data-player="default" data-embed="default" class="video-js" controls></video><a href="#" class="close no-underline"><i class="icon icon-close"></i></a></div>'
			/*LGEGMO-2530, LGEGMO-4109 : 20180502 modify*/
			/* LGEGMO-4062 */
			if (isMobile == 0 && $(this).closest('.module').hasClass('m29')) {
				html = '<div class="video-content"><iframe src="https://players.brightcove.net/' + accountId + '/' + player + '_default/index.html?videoId=' + videoId + '&autoplay=true" title="' + alt + '" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe><a href="#" title="Close" class="close no-underline"><i class="icon icon-video-close"></i></a></div>';
			} else {
				html = '<div class="video-content"><iframe src="https://players.brightcove.net/' + accountId + '/' + player + '_default/index.html?videoId=' + videoId + '" title="' + alt + '" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe><a href="#" title="'+commonMsg.common["close"]+'" class="close no-underline"><i class="icon icon-video-close"></i></a></div>';	// LGEGMO-2881 20170518 modify
			}
			/*//LGEGMO-4062 */
			/*//LGEGMO-2530, LGEGMO-4109 : 20180502 modify*/
			/*LGEGMO-3196 20170718 modify*/
			if(_this.data("modalPopup")){
				ModalVideo($(this).closest('.module'),html);
			}else{
			obj.empty().append(html);
			obj.show();
			obj.find('.video-content').attr('tabIndex', -1).focus();
			obj.find("a.close").unbind('click').on({
				click: function(e) {
					e.preventDefault();
					obj.empty().hide();
					obj.closest('.module').find('.text-block').attr('style', '');
					obj.closest('.module').find('.video-thumb').attr('style', '');
					_this.focus();
					/*PJTHEMC-1 add*/
                    if(obj.closest('.module').hasClass('m36')||obj.closest('.module').hasClass('m37')){
                    	obj.closest('.module').height("auto");
                    }
                    /* //PJTHEMC-1 add*/
				}
			});
			}
			/*//LGEGMO-3196 20170718 modify*/
		}
	});

	// is url validation
	function validUrl(str) {
	  var pattern = new RegExp('http[s]?:\/\/(www.)?[A-z0-9]+[.][A-z0-9]+(\/?)[\w?=;&]*');

	  if(!pattern.test(str)) {
		return false;
	  } else {
		return true;
	  }
	}

	$('.feature-module .column .see-video').on({
		click: function(e) {
			e.preventDefault();
			var videoCode;
			var videoId;
			var _this = $(this);
			var obj = $(this).closest('.feature-module .column').find('.video-asset');
			var tit = $(this).closest('.feature-module .column').find('.text-block h3').text();
			var alt = obj.attr('data-iframe-title');
			var html;
			//var check = new RegExp('http[s]?:\/\/(www.)?[A-z0-9]+[.][A-z0-9]+(\/?)[\w?=;&]*');

			if (obj.attr('data-video-type') == 'youtube') {
				videoCode = obj.attr('data-embed-code');

				$(this).closest('.feature-module .column').find('.video-thumb').hide();
				//sendEvent('video-info', tit); // DTM

				if(validUrl(videoCode)) {
					// not video id
					html = '<div class="video-content"><iframe width="100%" height="100%" src="' + videoCode + '?rel=0&showinfo=0&wmode=opaque" frameborder="0" allowfullscreen title="' + alt + '" style="background:#000"></iframe><a href="#" title="'+commonMsg.common["close"]+'" class="close no-underline"><i class="icon icon-video-close"></i></a></div>';			// LGEGMO-2881 20170518 modify
				} else {
					html = '<div class="video-content"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + videoCode + '?rel=0&showinfo=0&wmode=opaque" frameborder="0" allowfullscreen title="' + alt + '"></iframe><a href="#" title="'+commonMsg.common["close"]+'" class="close no-underline"><i class="icon icon-video-close"></i></a></div>';	// LGEGMO-2881 20170518 modify
				}

				obj.empty().append(html);
				obj.show();
				obj.find('.video-content').attr('tabIndex', -1).focus();
				obj.find("a.close").unbind('click').on({
					click: function(e) {
						e.preventDefault();
						obj.empty().hide();
						obj.closest('.feature-module .column').find('.text-block').attr('style', '');
						obj.closest('.feature-module .column').find('.video-thumb').attr('style', '');
						_this.focus();
					}
				});
			} else {
				var videoId = obj.attr('data-video-id'),
					accountId = obj.attr('data-account'),
					player = obj.attr('data-player') != null ? obj.attr('data-player') : 'default';

				$(this).closest('.feature-module .column').find('.video-thumb').hide();
				if ($('html').hasClass('lt-ie9')) {
					$(this).closest('.feature-module .column').find('.text-block').show();
					return;
				}
				//sendEvent('video-info', tit); // DTM
				//html = '<div class="video-content"><video data-video-id="3811035969001" data-account="1432358930001" data-player="default" data-embed="default" class="video-js" controls></video><a href="#" class="close no-underline"><i class="icon icon-close"></i></a></div>'
				/* LGEGMO-4062 */
				html = '<div class="video-content"><iframe src="https://players.brightcove.net/' + accountId + '/' + player + '_default/index.html?videoId=' + videoId + '" title="' + alt + '" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe><a href="#" title="'+commonMsg.common["close"]+'" class="close no-underline"><i class="icon icon-video-close"></i></a></div>';	// LGEGMO-2881 20170518 modify
				/*//LGEGMO-4062 */
				obj.empty().append(html);
				obj.show();
				obj.find('.video-content').attr('tabIndex', -1).focus();
				obj.find("a.close").unbind('click').on({
					click: function(e) {
						e.preventDefault();
						obj.empty().hide();
						obj.closest('.feature-module .column').find('.text-block').attr('style', '');
						obj.closest('.feature-module .column').find('.video-thumb').attr('style', '');
						_this.focus();
					}
				});
			}
		}
	});

	// hero
	$('.ProductHero').find('.slide .visuals').each(function() {
		if (!$(this).attr('data-video-type')) return;
		var vtype = $(this).attr('data-video-type');
		var obj = $(this);
		if (vtype == 'youtube') {
			// youtube
			var videoCode = obj.attr('data-embed-code'),
				alt = obj.attr('data-iframe-title'),
				html
			html = '<div class="hero_video"><div><iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + videoCode + '?rel=0&showinfo=0&wmode=opaque" frameborder="0" allowfullscreen title="' + alt + '"></iframe></div></div>';
		} else {
			// bc
			var videoId = obj.attr('data-video-id'),
				accountId = obj.attr('data-account'),
				player = obj.attr('data-player') != null ? obj.attr('data-player') : 'default',
				alt = obj.attr('data-iframe-title');
			html;
			/* LGEGMO-4062 */
			html = '<div class="hero_video"><div><iframe src="https://players.brightcove.net/' + accountId + '/' + player + '_default/index.html?videoId=' + videoId + '" title="' + alt + '" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe></div></div>';
			/*//LGEGMO-4062 */
		}
		obj.empty().append(html);
	});
	/*LGEGMO-3196 20170718 add*/
	var ModalVideo = function(obj,iframeHtml) {
		var $modalWrap = $('.feature-popup-wrap');
		var content = "";
		var navHeight = $('.stickynav').outerHeight() + $('.tabs-nav-wrapper').outerHeight();

		var $scrollTop =obj.offset().top-navHeight;
		var $modalHeight = $(window).height()-navHeight
		if(isMobile==1){
			$scrollTop =obj.offset().top-$(".tabs-panel.active a").outerHeight();
			$modalHeight = $modalHeight-$(".tabs-panel.active a").outerHeight()
		}
		var $modalWidth = $(".tabs-nav-wrapper .tabs-nav").width();
		
		
        content += '<div class="feature-popup-wrap" tabindex="0">';
        content += iframeHtml;
        content += '</div>';
        //if ($modalWrap.length == 0) {
        	obj.append(content);

            $(".feature-popup-wrap .video-content").css({
            	width:$modalWidth,
            	height:$modalHeight
            })
            obj.css({
            	height:$modalHeight
            })
        	$('body, html').stop().animate({
        		scrollTop: $scrollTop
                //scrollTop: obj.offset().top-navHeight
            }, 'slow')
            obj.find("a.close").unbind('click').on({
				click: function(e) {
					e.preventDefault();
					obj.find('.feature-popup-wrap').remove();
					obj.find('.text-block').attr('style', '');
					obj.find('.video-thumb').attr('style', '');
					obj.attr('style', '');
						
				}
			});
        //}
	}
	/*LGEGMO-3196 20170718 add*/


});
