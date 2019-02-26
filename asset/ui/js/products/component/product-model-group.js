define(['jquery','ic/ic', 'mkt/product-compare', 'products/component/microsite-template','common/smartworld'], function($,ic, cp, MicrositeTemplate,smartworld) {

	// setBVRatings
	var setBVRatings = function(e) {
        if ($('#bvReview')) {
            if (!window.$BV) return false;
            if ($BV) {
                var idx = parseInt($('body').eq(0).attr("data-bv")) + 1;
                $('body').eq(0).attr("data-bv", idx);
                var sctxt = '';
                $(this).find('.slide, li, .recommand-product-info, .current-ratings').each(function() {
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
    /*LGEGMO-3850 : 20180306 add */ 
    var isMobile = $('body').hasClass("is-mobile");
    var redotFlag, redotCall;
    var redot = function(itemIdx, redotFlag){
    		
		if(itemIdx != undefined && itemIdx != null){
			
			$('.product-lists > li ').eq(itemIdx).find('.redot').each(function() {
        		var self= $(this), _tipTitle;
        		var _tipTitle = self.attr("tootip-title");	        		
        		
        		if(redotFlag != "Y" && self.find('.js-tooltip-mnum-wrap').size() == 0){
        			var orgText = self.text().trim();
        		} else {
        			var orgText = self.find(".js-tooltip-mnum-wrap").text().trim();;
        		}
        		if(self.parents("section").hasClass("compare-view-item")){
        			self.dotdotdot({
                    	ellipsis: "\u2026\u2000",
                        watch: "window",
                        callback :  function() {
                        	if(redotFlag != "Y"){
                        		$(this).append('<a href="#info" class="info"><i class="icon icon-point"><span class="invisible">'+ _tipTitle +'</span></i></a>');
                        		modelTooltip(orgText, self);
                        	}
                        }
                    });
        			if(!self.hasClass("is-truncated") || self.find(".js-tooltip-mnum-wrap") == "0"){
        				self.find(".info").remove();
            		}
        		} else {
        			self.dotdotdot({
                        watch: "window",
                    });
        		}
            });
		}
        function modelTooltip (orgText, self){
        	var _tipNum = self.find(".js-tooltip-mnum-wrap").attr("tooltip-num");
            if(self.find('.js-tooltip-mnum-wrap').size() == 0) {
            	if(self.hasClass("is-truncated") == true){
            		$(".redot.is-truncated").each(function(i) {
            			$(this).attr("tooltip-num", i);
            			$(this).find(".info").attr("tooltip-num", i);
            			if($(this).find(".js-tooltip-mnum-wrap").length == 0){
            				
            				$(this).find(".info").after('<div class="js-tooltip-mnum-wrap" tooltip-num="'+ i +'">'+ orgText +'</div>');
            				$(this).find(".js-tooltip-mnum-wrap").append('<span class="before"></span><span class="after"></span><a href="#" class="btn-close"><i class="icon icon-close"></i><span class="hidden">'+ commonMsg.common.close +'</span></a>');
                       }
        			});
            	}
            }
            
        }
        function modelTooltipOpen (self, orgText, _tipNum){
            var _target = self.parent();
            var _sticky = _target.parents(".compare-view-item").hasClass("sticky");
              		
    		var $tipClone = _target.find(".js-tooltip-mnum-wrap").clone();
            var _width = isMobile ? "90%" : $(".show-item").width();
            var _top = isMobile ? (self.offset().top- $(document).scrollTop()) + 30: (self.offset().top- $(document).scrollTop()) + 33;
            
            var _left = isMobile ? (self.offset().left + _width)> $(window).width() ? _target.offset().left - _width/2 : 0 : _target.offset().left - _width/2;
            var _arrowleft = !isMobile ? (self.offset().left - _left) + self.width()/2 : (self.offset().left - _left) + self.width()/2 - 20;
            
            if($("body").find(".js-tooltip-mnum-wrap.clone").size() > 0){
            	$("body").find(".js-tooltip-mnum-wrap.clone").remove();
            }
            
            $("body").append($tipClone.addClass("clone"));
            
            $(".js-tooltip-mnum-wrap.clone").css({
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
            		var _left =  _target.offset().left - 30;
                    var _arrowleft = (self.offset().left - _left) + self.width()/2;
            		
                    $tipClone.css({
                        'left': _left,
                   }).find(".before, .after").css({
                       'left': _arrowleft
                   });
            		
            	}
            }
 
        }
        
        function modelTooltipClose (self, _tipNum){
        	$("body").find(".js-tooltip-mnum-wrap").removeClass("active").removeClass("top").css({'display' :'none'});
        	$(".js-tooltip-mnum-wrap.clone").remove();
        }
        $('.compare-item .redot.is-truncated').find(".info").on({
	        "mouseenter": function(e) {
	        	e.preventDefault();
	        	if(!isMobile) {
		        	var _tipNum = $(this).attr("tooltip-num");
		        	modelTooltipOpen($(this), _tipNum);
	        	}
	        },
	        "click": function(e) {
	        	e.preventDefault();
	        	if(isMobile) {
		        	var _tipNum = $(this).attr("tooltip-num");
		        	modelTooltipOpen($(this), _tipNum);
	        	}
	        },
	        "focus": function(e) {
	        	e.preventDefault();
	        	if(!isMobile) {
		        	var _tipNum = $(this).attr("tooltip-num");
		        	modelTooltipOpen($(this), _tipNum);
	        	}
	        },
	        "focusout": function(e) {
	        	e.preventDefault();
	        	if(!isMobile) {
	        		var _tipNum = $(this).attr("tooltip-num");
	            	modelTooltipClose($(this), _tipNum);
	        	} else {
	                $(".js-tooltip-mnum-wrap.clone .btn-close").trigger("click");
	            }
	    	},
	        "mouseleave": function(e) {
	        	e.preventDefault();        	
	        	if(!isMobile) {
	        		var _tipNum = $(this).attr("tooltip-num");
	            	modelTooltipClose($(this), _tipNum);
	        	} else {
	                $(".js-tooltip-mnum-wrap.clone .btn-close").trigger("click");
	            }
	        }
        });
        
        $(document).on('click', '.js-tooltip-mnum-wrap .btn-close', function(e) {
        	var _tipNum = $(this).attr("tooltip-num");
        	modelTooltipClose($(this), _tipNum);
        	return false;
        });
        
        $(window).scroll(function(e) {
        	$('.js-tooltip-mnum-wrap.clone .btn-close').trigger('click');
        });
    }
    
    $(window).resize(function(){
    	var redotFlag = "Y";
    	if(!isMobile){
    		redot(redotFlag);
    	}
    });
    /*//LGEGMO-3850 : 20180306 add */

	/* if($(".product-lists .model-group").length){  LGEPJT-337 : 20171121 remove */

		$(document).on("mouseover focus", ".product-lists .model-group a.swatch", function(e){
			e.preventDefault();

			if(!$('body').hasClass("is-mobile")) {
				var _this = $(this);
				var prod = $(_this).closest("li");
				var prodWidth = $(prod).width();
				var groupWidth = $(_this).closest(".model-group .inner").outerWidth();
				var tagWidth;
				var colorName = $(_this).text();
				var colorTag = '<em class="color-tag">' + colorName + '</em>';
				var tagArrow = '<span class="tag-arrow"></span>';

				if(!colorName == ""){
					$(".product-lists .model-group").find(".color-tag").remove().end().find(".tag-arrow").remove();
					$(_this).append(tagArrow).closest(".model-group").append(colorTag);
					$(prod).find(".color-tag").css({"min-width" : groupWidth + "px"});
					tagWidth = $(prod).find(".color-tag").outerWidth();

					if(tagWidth > prodWidth){
						$(prod).find(".color-tag").css("white-space","pre-wrap").outerWidth(prodWidth + "px");
						tagWidth = $(".color-tag").outerWidth();
					};

					/* LGEPJT-337 : 20171121 add */
					if ($(this).index() > 3 && $(this).closest('.compare-view-item').hasClass('sticky')) {
                        $(prod).find(".color-tag").css("margin-top", 22);
                    }
					/* //LGEPJT-337 : 20171121 add */

                    $(prod).find(".color-tag").css("margin-left","-" + tagWidth / 2 + "px");
				};

			};
		});
		$(document).on("mouseleave blur",".product-lists .model-group, .product-lists .model-group a.swatch", function(e){
			e.preventDefault();
			$(".product-lists .model-group .color-tag, .product-lists .model-group .tag-arrow").remove();
		});


		$(document).on("click", ".product-lists .model-group a", function(e){
			e.preventDefault();

			var _this = $(this);
			var idx = $(_this).index();
			var group = $(_this).closest(".model-group")
			var currentList = $(group).closest("li");
			var modelData = $.param({modelId : $(this).data("model-id")});
			var subModelData = $.param({subModelId : $(this).data("subModelId")}) || ''; /* LGEPJT-337 : 20171121 add */
			var form = currentList.parents('form'); /* LGEPJT-337 : 20171121 add */
			var url = $(_this).closest("form").data("model-group-url");
				url = url + "?" + modelData + "&" + subModelData; /* LGEPJT-337 : 20171121 modify */
				
			var itemIdx = _this.parents('.item').index();

			if($(_this).hasClass("active")){
				return false;
			};

			$.ajax({
				type : 'post',
				data : $(_this).closest("form").serialize(),
				url : url,
				success : function(data){
					
					$(currentList).html(data).find("img.lazy").lazyload({
						appear:function() {$(this).attr("style", "").removeClass("lazy");}
					}).end().find(".model-group a").eq(idx).addClass("active").siblings().removeClass("active");
					if($('.buynow').length > 0) {runBuyNow();} // buy now theJ
					/*LGEAR-971 20180326 add*/
					if ($(currentList).find('.obs-submit').length > 0) {
                    	ic.jquery.plugin('SmartWorld', smartworld, $(currentList).find(".obs-submit"))
                    }
					/*//LGEAR-971 20180326 add*/
					$(currentList).each(setBVRatings); // bazaar voide theJ
					/* LGEPJT-337 : 20171121 add */
					if (form.closest('.module').hasClass('m42')) {

						MicrositeTemplate.prototype.callCompare();

					} else {

						cp.updateCompareButton();

					}
					/* //LGEPJT-337 : 20171121 add */

					$(currentList).find(".model-group a").eq(idx).focus();
					$(".product-lists .model-group .color-tag, .product-lists .model-group .tag-arrow").remove();
					
					/*LGEGMO-3850 : 20180306 add*/					
					redot(itemIdx);
					/* //LGEGMO-3850 : 20180306 add */					
					//shoppilot
					if($(currentList).find(".rating-ru-box").length){
						var shoppilotId = $(currentList).find(".rating-ru-box").data("shoppilot");
						var renderListproductIds = shoppilotId.replace(/\[/g,'').replace(/\]/g,'').toLowerCase().split(', ');
						renderListingInlineRatings(renderListproductIds);
					};
				},
				error : function() {
					//console.log("ajax error");
					return false
				}
			});
		});

		$(document).ajaxStart(function() {
			var activeEl = $(this.activeElement);
			var activeItem = $(activeEl).closest("li");
			if($(activeEl).closest(".model-group").size() > 0){ /* LGEPJT-337 : 20171121 modify */
				$(activeItem).append('<div class="page-dimmed"><span>&nbsp;</span></div>');
			};
		}).ajaxComplete(function() {
			$(".product-group-list").find(".page-dimmed").remove();
		});

	/* };  LGEPJT-337 : 20171121 remove */

});