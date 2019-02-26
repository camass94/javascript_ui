require(['jquery'], function($) {
	var setBVRatings = function(e) {
        if ($('#bvReview')) {
            if (!window.$BV) return false;
            if ($BV) {
                var idx = parseInt($('body').eq(0).attr("data-bv")) + 1;
                $('body').eq(0).attr("data-bv", idx);
                var sctxt = '';
                $(this).find('.slide, li, .recommand-product-info, .current-ratings').each(function() {		/* LGEPJT-253 20170804 modify */
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
    /* LGECI-2710 : 20161214 modify */
    var _BVRatingFlag = $("body").find("input[name=BVRatingFlag]");
    if(_BVRatingFlag.length && _BVRatingFlag.val() != "" && _BVRatingFlag.val() == "Y"){
    	$('body').eq(0).attr("data-bv", 0);
    }
    if ($('.product').is('div') && ($('#BVRRContainer').is('div') || $('#BVQAContainer').is('div'))) {
        var pid = $('html').data('product-id');
        var contentMode = "";
        var isButtonClick = false;

        if (!window.$BV) return false;
        if ($BV) {        	
			if(_BVRatingFlag.length && _BVRatingFlag.val() != "" && _BVRatingFlag.val() == "Y"){
				var jsHTML = '<script type="text/javascript">$BV.configure(\'global\', { productId : \''+pid+'\' });</script>';
				$("body").eq(0).append(jsHTML);
				$('.stickynav .review_points, .stickynav-m .review_points').removeAttr('itemprop').removeAttr('itemscope').removeAttr('itemtype').attr('id', 'BVRRSummaryContainer').empty();
				if($('#BVRRContainer').is('div')) {
					 $BV.ui( 'rr', 'show_reviews', {
						doShowContent : function () { 
						  // If the container is hidden (such as behind a tab), put code here to make it visible 
						  //(open the tab).
						  $("#bvReview .reviewToggle").removeClass("on"); /* LGEFR-1676 : 20180412 add */
						  if($('body').hasClass('is-mobile')) {
							// mobile
							/*
							$('#BVRRSummaryContainer *').unbind();
							$('#BVRRSummaryContainer a.bv-rating-stars-container').unbind().bind('click', function() {
								sendEvent('review'); // DTM
								$('.tabs-panels .tabs-panel').removeClass('active');
								$('#ratings-reviews').addClass('active');
								$('.accordion-content').hide();
								$('#ratings-reviews .accordion-content').show();
								$('html, body').scrollTop($('#ratings-reviews').offset().top);
								return false;
							});
							*/
							$('.tabs-panels .tabs-panel').removeClass('active');
							$('#ratings-reviews').addClass('active');
							$('.accordion-content').hide();
							$('#ratings-reviews .accordion-content').show();
							$('html, body').scrollTop($('#ratings-reviews').offset().top);
							//$('#BVRRSummaryContainer a.bv-rating-stars-container').trigger('click');
						  } else {
							// desktop
							/* LGEFR-1676 : 20180412 add */
							$('#ratings-reviews').addClass('active');
							$("#bvReview .reviewToggle").trigger('click');
							$('html, body').scrollTop($('#bvReview').offset().top);
							/*//LGEFR-1676 : 20180412 add */
							 
							/*
							$('#BVRRSummaryContainer *').unbind();
							$('#BVRRSummaryContainer a.bv-rating-stars-container').unbind().bind('click', function() {
								sendEvent('review'); // DTM
								$('.product .tabs ul.tabs-nav li').each(function() {
									if($(this).find('a').attr('href') == "#ratings-reviews") {
										$(this).find('a').trigger("click");
										return false;
									}
								});
								return false;
							});
							*/
							//$('#BVRRSummaryContainer a.bv-rating-stars-container').trigger('click');
						  }
						}
					  });
				}
				if($('#BVQAContainer').is('div')) {
					 $BV.ui( 'qa', 'show_questions', {
						doShowContent : function () { 
						  // If the container is hidden (such as behind a tab), put code here to make it visible
						  //(open the tab).
						}
					  });
				}
			} else {
				if ($('#BVRRContainer').is('div')) {
	                if ($('#bvReview').hasClass('bvReviewMobile')) {
	                    $BV.configure("global", {
	                        allowSamePageSubmission: true,
	                        displayType: "mobile",
	                        
	                        doScrollSubmission:function(){
	                            return false;
	                        },
	                        doShowSubmission:function(){
	                            //console.log("configure :: doShowSubmission");

	                            contentMode = "subMission";

	                            if($('a[href="#BVRRWidgetID"]').length){
	                                $('a[href="#BVRRWidgetID"]').trigger('click');

	                            }else if($('a[href="#bvReview"]').length){//최초 작성일때의 동작
	                                $("#ratings-reviews").addClass("active");
	                                $('#ratings-reviews .accordion-content').show();
	                                $('a[href="#bvReview"]').trigger('click');
	                                $('div#BVRRContainer').hide();
	                                $('div#BVSubmissionContainer').show();
	                            }
	                            
	                        },
	                        //COOKIE :: bvReturnPosition = PRR/1214m-en_au/MD05194122/BVRRWidgetID
	                        onSubmissionReturn:function(){
	                            //console.log("onSubmissionReturn");
	                            $('div#BVRRContainer').show();
	                            $('div#BVSubmissionContainer').hide();

	                            contentMode = "showContent";
	                        }
	                    });

	                    $BV.ui("rr", "show_reviews", {
	                        productId: pid,
	                        onEvent: function(json) {
	                            //console.log("onEvent.eventSource:: " + json.eventSource);
	                            if(json.eventSource == "Display"){
	                                if(isButtonClick){
	                                    setTimeout(function(){
	                                        $(window).scrollTop($('#ratings-reviews').offset().top);
	                                    }, 30);
	                                }else{
	                                    isButtonClick = true;
	                                }
	                            }
	                        },
	                        doShowContent: function(){
	                            //console.log("doShowContent");
	                            //console.log("isButtonClick::" + isButtonClick);
	                        	/* LGECI-2583,LGECI-2710 : 20161214 modify */
	                        	/*if(lgFilter.locale !="/ca_en"&&lgFilter.locale !="/ca_fr"){
		                            if(!isButtonClick){
		                                return false;
		                            }
	                        	}*/
	                        	/*//LGECI-2583,LGECI-2710 : 20161214 modify */
	                            
	                            $('.tabs-panels .tabs-panel').removeClass('active');
	                            $('#ratings-reviews').addClass('active');
	                            $('.accordion-content').hide();
	                            $('#ratings-reviews .accordion-content').show();

	                            $('a[href="#bvReview"]').trigger('click');

	                            //$(window).scrollTop($('#ratings-reviews').offset().top);
	                            
	                            if(contentMode == "subMission"){
	                                $('div#BVRRContainer').hide();
	                                $('div#BVSubmissionContainer').show();
	                            }
	                            contentMode = "showContent";

	                            setTimeout(function(){
	                                $(window).scrollTop($('#ratings-reviews').offset().top);
	                            }, 30);
	                            
	                        }
	                    });

	                    $('a[href="#Expert-review"]').click(function(e){
	                        $('div#bvReview').hide();
	                    });
	                    $('a[href="#bvReview"]').click(function(e){
	                        $('div#bvReview').show();
	                        $('div#BVRRContainer').show();
	                    });
	                } else {
	                    $BV.configure("global", {
	                        allowSamePageSubmission: true,
	                        doShowSubmission: function() {
	                            //$('li.reviews').click();
	                            $('div#BVRRSummaryContainer, div#BVRRContainer').hide();
	                            document.getElementById('BVSubmissionContainer').scrollIntoView();
	                            return false;
	                        },
	                        onSubmissionReturn: function() {
	                            $('div#BVRRSummaryContainer, div#BVRRContainer').show();
	                        },
	                        doScrollSubmission: function() {
	                            return false;
	                        }
	                    });

	                    $BV.ui("rr", "show_reviews", {
	                        productId: pid,
	                        doShowContent: function() {
	                            $('div#BVRRSummaryContainer, div#BVRRContainer').show();
	                            /* LGECI-2583,LGECI-2710 : 20161214 modify */
	                            /*if(lgFilter.locale =="/ca_en"||lgFilter.locale =="/ca_fr"){
	                            	$('a[href="#ratings-reviews"]').click();
	                            }*/
	                            /* LGECI-2583,LGECI-2710 : 20161214 modify */
	                        }
	                    });

	                }
	            }
			}
			
            
        }
    }
    if(_BVRatingFlag.length && _BVRatingFlag.val() != "" && _BVRatingFlag.val() == "Y"){
    	// product list
    	/*LGECI-2811 : 20170626 modify */
    	!$('.product-lists').not(".with-carousel").each(setBVRatings);
    	/*//LGECI-2811 : 20170626 modify */
    	// wtb 
    	if($('.where-to-buy').is('section')) {
    		if (!window.$BV) return false;
    		if($BV) {
    			var obj = $('.where-to-buy .product-area .details .rating');
    			var pid = obj.data('modelid');
    			var url = obj.find('a').eq(0).attr('href');
    			if(!pid) return;
    			obj.removeAttr('itemprop').removeAttr('itemscope').removeAttr('itemtype').attr('id', 'productlist-'+pid).empty();
    			var sctxt = "$BV.ui( 'rr', 'inline_ratings', {productIds : {'"+pid+"':{url:'"+url+"'}},containerPrefix:'productlist'});";
    			new Function(sctxt)();
    		}
    	}
    	
    	/*if(_BVRatingFlag.length && _BVRatingFlag.val() == "Y"){
        	// product list
        	$('.product-lists').each(setBVRatings); // bazaar voide theJ
        }*/
    }
    /*//LGECI-2710 : 20161214 modify */
    /*LGECI-2811 : 20170626 add */
    if(lgFilter.locale =="/ca_en" || lgFilter.locale =="/ca_fr"){
		$('.product-lists li').each(function(){
    		if($(this).find(".rating, .compare-check").length == "0") {
    			$(this).find(".details").addClass("bundleSet");
    		}
    	});
	}
    /*//LGECI-2811 : 20170626 add */
    
    
    
    // if ($('html').data('bvGp')) {

    // } else {
    //     $('body').eq(0).attr("data-bv", 0);
    //     if ($('.product').is('div') && ($('#BVRRContainer').is('div') || $('#BVQAContainer').is('div'))) {
    //         var pid = $('html').data('product-id');
    //         if (!window.$BV) return false;
    //         if ($BV) {
    //             var jsHTML = '<script type="text/javascript">$BV.configure(\'global\', { productId : \'' + pid + '\' });</script>';
    //             $("body").eq(0).append(jsHTML);
    //             if (pid) {
    //                 $('.stickynav .review_points, .stickynav-m .review_points').removeAttr('itemprop').removeAttr('itemscope').removeAttr('itemtype').attr('id', 'BVRRSummaryContainer').empty();;
    //                 if ($('#BVRRContainer').is('div')) {
    //                     $BV.ui('rr', 'show_reviews', {
    //                         doShowContent: function() {
    //                             // If the container is hidden (such as behind a tab), put code here to make it visible 
    //                             //(open the tab).
    //                             if ($('body').hasClass('is-mobile')) {
    //                                 // mobile
    //                                 /*
    //                             $('#BVRRSummaryContainer *').unbind();
    //                             $('#BVRRSummaryContainer a.bv-rating-stars-container').unbind().bind('click', function() {
    //                                 sendEvent('review'); // DTM
    //                                 $('.tabs-panels .tabs-panel').removeClass('active');
    //                                 $('#ratings-reviews').addClass('active');
    //                                 $('.accordion-content').hide();
    //                                 $('#ratings-reviews .accordion-content').show();
    //                                 $('html, body').scrollTop($('#ratings-reviews').offset().top);
    //                                 return false;
    //                             });
    //                             */
    //                                 $('.tabs-panels .tabs-panel').removeClass('active');
    //                                 $('#ratings-reviews').addClass('active');
    //                                 $('.accordion-content').hide();
    //                                 $('#ratings-reviews .accordion-content').show();
    //                                 $('html, body').scrollTop($('#ratings-reviews').offset().top);
    //                                 //$('#BVRRSummaryContainer a.bv-rating-stars-container').trigger('click');
    //                             } else {
    //                                 // desktop
    //                                 /*
    //                             $('#BVRRSummaryContainer *').unbind();
    //                             $('#BVRRSummaryContainer a.bv-rating-stars-container').unbind().bind('click', function() {
    //                                 sendEvent('review'); // DTM
    //                                 $('.product .tabs ul.tabs-nav li').each(function() {
    //                                     if($(this).find('a').attr('href') == "#ratings-reviews") {
    //                                         $(this).find('a').trigger("click");
    //                                         return false;
    //                                     }
    //                                 });
    //                                 return false;
    //                             });
    //                             */
    //                                 //$('#BVRRSummaryContainer a.bv-rating-stars-container').trigger('click');
    //                             }
    //                         }
    //                     });
    //                 }
    //                 if ($('#BVQAContainer').is('div')) {
    //                     $BV.ui('qa', 'show_questions', {
    //                         doShowContent: function() {
    //                             // If the container is hidden (such as behind a tab), put code here to make it visible
    //                             //(open the tab).
    //                         }
    //                     });
    //                 }
    //             }
    //         }
    //     }
    //     // product list
    //     $('.product-lists').each(setBVRatings);
    //     // wtb setBVRatings
    //     if ($('.where-to-buy').is('section')) {
    //         if (!window.$BV) return false;
    //         if ($BV) {
    //             var obj = $('.where-to-buy .product-area .details .rating');
    //             var pid = obj.data('modelid');
    //             var url = obj.find('a').eq(0).attr('href');
    //             if (!pid) return;
    //             obj.removeAttr('itemprop').removeAttr('itemscope').removeAttr('itemtype').attr('id', 'productlist-' + pid).empty();
    //             var sctxt = "$BV.ui( 'rr', 'inline_ratings', {productIds : {'" + pid + "':{url:'" + url + "'}},containerPrefix:'productlist'});";
    //             new Function(sctxt)();
    //         }
    //     }
    // }

	return setBVRatings;		/* LGEPJT-253 20170804 add */
});
