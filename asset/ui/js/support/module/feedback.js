define(['ic/ic', 'ic/ui/module', 'global-config'], function(ic, Module, globalConfig) { //LGECI-3112 20171113 add

    'use strict';

    var feedback = function(el, option) {
    	if ($("#surveyForm").length > 0 || $("#surveyFormCA").length > 0) { //LGECI-2329 20160602 modify
            var isie = (/msie/i).test(navigator.userAgent); //ie
            var isie6 = (/msie 6/i).test(navigator.userAgent); //ie 6
            var isie7 = (/msie 7/i).test(navigator.userAgent); //ie 7
            var isie8 = (/msie 8/i).test(navigator.userAgent); //ie 8
            var isie9 = (/msie 9/i).test(navigator.userAgent); //ie 9
            var isfirefox = (/firefox/i).test(navigator.userAgent); //firefox
            var isapple = (/applewebkit/i).test(navigator.userAgent); //safari,chrome
            var isopera = (/opera/i).test(navigator.userAgent); //opera
            var isios = (/(ipod|iphone|ipad)/i).test(navigator.userAgent); //ios
            var isipad = (/(ipad)/i).test(navigator.userAgent); //ipad
            var isandroid = (/android/i).test(navigator.userAgent); //android
            var device;
            if (isie7 || isie8 || isie9) {
                isie6 = false;
            }
            if (isie9) {
                isie = false;
            }

            var divice;
            if ( /*isapple || */ isios || isandroid) {
                divice = "Mobile";
            } else if (isipad) {
                divice = "Tablet";
            } else {
                divice = "Pc";
            }

            document.getElementById('divice').value = divice;


            //check browser
            var a = navigator.userAgent.toLowerCase();
            var b, v;
            if (a.indexOf("safari/") > -1) {
                b = "safari";
                var s = a.indexOf("version/");
                var l = a.indexOf(" ", s);
                v = a.substring(s + 8, l);
            }
            if (a.indexOf("chrome/") > -1) {
                b = "chrome";
                var ver = /[ \/]([\w.]+)/.exec(a) || [];
                v = ver[1];
            }
            if (a.indexOf("firefox/") > -1) {
                b = "firefox";
                var ver = /(?:.*? rv:([\w.]+)|)/.exec(a) || [];
                v = ver[1];
            }
            if (a.indexOf("opera/") > -1) {
                b = "opera";
                var ver = /(?:.*version|)[ \/]([\w.]+)/.exec(a) || [];
                v = ver[1];
            }
            if ((a.indexOf("msie") > -1) || (a.indexOf(".net") > -1)) {
                b = "ie";
                var ver = /(?:.*? rv:([\w.]+))?/.exec(a) || [];
                if (ver[1])
                    v = ver[1];
                else {
                    var s = a.indexOf("msie");
                    var l = a.indexOf(".", s);
                    v = a.substring(s + 4, l);
                }
            }

            document.getElementById('browser').value = b;
            document.getElementById('version').value = v;
        }


        var surveyForm = $('.survey').find('#surveyForm');
        var startBtn = $('.survey').find('.start').find('.start-box');
        var total_page = $("#total-page");
        var total_page_cnt = total_page.data("total");
        total_page.text(total_page_cnt);
        $(".progress").find(".bar").find(".cell").remove();
        for (var i = 0; i < total_page_cnt; i++) {
            $(".progress").find(".bar").append("<span class=\"cell\"></span>");
        }

        $(".btn-next").text(surveyForm.data("next-btn"));
        $(".btn-prev").text(surveyForm.data("prev-btn"));
        $(".btn-close").text(surveyForm.data("close-btn"));

        var step;
        $("#surveyForm").submit(function() {
        	/*//LGECS-1131 20170727*/
        	var ti= surveyForm.find(".steps.active").attr("id");
            jQuery.ajax({
                url: surveyForm.data('action'),
                data: $("#surveyForm").serialize(),
                dataType:"json"
            }).success(function(data) {
            	if(data.hasOwnProperty("goUrl")){
                	location.href = data.url;
            	}else if(data.status=="success"){
            		$('#' + ti).removeClass('active').removeAttr('tab-index');
            		surveyForm.hide();
                    surveyForm.closest('.survey-wrap').children('.end').addClass('active').show();
                    
                    /* LGECI-3112 20171113 add */
                    if(globalConfig.isMobile && $(".modal-survey").size() > 0 && (lgFilter.locale == '/ca_en' || lgFilter.locale == '/ca_fr')){
                    	var surveyTop = $(".modal-survey").offset().top - 20;
                        $(window).scrollTop(surveyTop);
                    }else{
                    	var surveyTop = $(".modal-survey").offset().top - 150;
                        $(window).scrollTop(surveyTop);
                    }
                    /*// LGECI-3112 20171113 add */
                }
            	
            })
        	/*//LGECS-1131 20170727*/
            return false;
        });

        var init_progress = surveyForm.find('.progress');
        if (init_progress.find('.highlight').text() == total_page_cnt) {
            surveyForm.find('.btn-center').find('.btn-next').text(surveyForm.data("complete-btn"));
        } else {
            surveyForm.find('.btn-center').find('.btn-next').text(surveyForm.data("next-btn"));
        };
        //7555 0422
        if($(".survey-link").size() > 0){
           $(".survey-link").on($.modal.AJAX_COMPLETE, function() {
                if($(".modal-survey").size() > 0){
                    var surveyTop = $(".modal-survey").offset().top - 20;
                    $(window).scrollTop(surveyTop);
                }
            }) 
        }
        //7555 0422

        if($("#surveyForm").is(".surveystep")){
            surveyForm.find('.btn-prev').hide();
            surveyForm.find('.active').attr('tabindex', 0).focus();
            $(".progress").find(".cell").eq(0).addClass("on");
        }

        startBtn.on('click', 'a.btn', function(e) {
            e.preventDefault();
            var $this = $(this);
            surveyForm.find('.btn-prev').hide();
            $this.closest('.step').hide().next(surveyForm).show();
            surveyForm.find('.active').attr('tabindex', 0).focus();
            $(".progress").find(".cell").eq(0).addClass("on");
        });
	/*LGECO-557 20181213 add*/
        var checkFieldFunc = function(a,f){
        	
        	/*var answerName=surveyForm.find("input[value="+a+"]").attr("name");
        	var labelName=surveyForm.find("input[value="+a+"]").attr("id");*/
        	
        	var answerName=surveyForm.find("#"+a+"").attr("name");
        	var labelName=a;
        	var valueName=surveyForm.find("#"+a+"").val();
        	if(f){
        	$("input[name="+answerName+"]").attr("disabled",true).prop("checked", false).parent().removeClass("checked").addClass("disabled");
        	surveyForm.find("input[value="+valueName+"]").attr("disabled",false).parent().removeClass("disabled")
        	surveyForm.find("label[for="+labelName+"]").trigger("click");
        	if(surveyForm.find("input[value="+valueName+"]").hasClass("mandatory")){
        		surveyForm.find("input[value="+valueName+"]").closest('li').find('.text').parent().addClass("required").addClass("validaion")
            }
        	return false;
        	}else{
        		$("input[name="+answerName+"]").attr("disabled",false).prop("checked", false).parent().removeClass("disabled");
        		if(surveyForm.find("input[value="+valueName+"]").hasClass("mandatory")){
            		surveyForm.find("input[value="+valueName+"]").closest('li').find('.text').parent().removeClass("validaion").removeClass("error")
                }
        	}
        }
	/*//LGECO-557 20181213 add*/
        /* LGECS-789 : 20160708 modify */
	/*LGECO-557 20181213 modify*/
        surveyForm.find('input[type="radio"], span.styled-radio').on('change click', function(e) {
        	e.preventDefault();
            if (this.checked) {
            	var mandatory =surveyForm.find(".mandatory");
            	var mandatoryName =surveyForm.find(".mandatoryRadio").attr("name");
            	//var radioArray = mandatory.data("check-radio").split(",");
            	
                var myId = $(this).closest('li').find('.text').length;
                var $this = $(this);
                $this.hasClass("mandatoryRadio")
                if (myId > 0) {
                	$this.closest('ul').find('.text').attr('disabled', true).val('');
                    $this.closest('li').find('.text').attr('disabled', false);
                } else {
                    $this.closest('ul').find('.text').attr('disabled', true).val('');
                }
                if(!$this.hasClass("mandatory")){
                	var mandatoryId = mandatory.attr("id");
	                if($this.hasClass("mandatoryRadio")){
	                	checkFieldFunc(mandatoryId,true) 
	                }else if(!$this.hasClass("mandatoryRadio") && $this.attr("name")==mandatoryName){
	                	checkFieldFunc(mandatoryId,false)
	                }else{
	                	return;
	                }
                }
               /* if(!$this.hasClass("mandatory")){
	                mandatory.each(function(){
	            		var mandatoryId = $(this).attr("id");
	            		var radioArray = mandatory.data("check-radio").split(",");
	            		if($.inArray($this.attr("id"),radioArray)>-1){
	                    	checkFieldFunc(mandatoryId,true)     	
	                    }else{
	                    	checkFieldFunc(mandatoryId,false)
	                    }
	            		
	            	})
            	}*/
                
                /*if($this.data("checked-field") != undefined){
                	var checkField = $this.data("checked-field");
                	checkFieldFunc(checkField)
                }*/
                /*if($this.data("required-field") != undefined){
                	var requiredField = $this.data("required-field");
                	surveyForm.find("input[value="+requiredField+"]").parent().addClass("required");
                }*/
            }
        });
	/* //LGECO-557 20181213 modify*/
        /*//LGECS-789 : 20160708 modify */
        surveyForm.on("keyup", "textarea[data-byte-check]", $.proxy(function(e) {
            var tgField = e.currentTarget;
            var byteLimit = parseInt($(tgField).data("byte-check"));
            var byteTotal = 0;
            var tmpByte = 0;
            var strLen = 0;
            var c;

            for (var i = 0; i < tgField.value.length; i++) {
                c = escape(tgField.value.charAt(i));
                if (c.length == 1) {
                    tmpByte++;
                } else if (c.indexOf("%u") != -1) {
                    tmpByte += 2;
                } else {
                    tmpByte++;
                }
                if (tmpByte > byteLimit) {
                    strLen = i;
                    break;
                } else {
                    byteTotal = tmpByte;
                }
            }

            if (strLen) {
                tgField.value = tgField.value.substring(0, strLen);
            }

            $("span[name=" + tgField.name + "]").text(Math.max(0, byteLimit - byteTotal));
        }, this));

        surveyForm.find('.btn-center').on('click', 'a', function(e) {
            e.preventDefault();
            /*LGECI-3225 add : 20180417*/
            if($(this).parents().hasClass('extra')) {
            	return window.open(this.href);
            }
            /*//LGECI-3225 add : 20180417*/
            step = surveyForm.find('.steps');
            var btn = $(this);
	    /*LGECO-557 20181213 modify*/
            var ti, nextStep, reqField, location, answer_box,reqFieldText;
	    /*//LGECO-557 20181213 modify*/
            step.each(function() {
                if ($(this).hasClass('active')) {
                    ti = $(this).attr('id');
                    return ti;
                };
            });
            if (btn.hasClass('btn-next')) {
                answer_box = $('#' + ti).find('.answer-list');
                
                if (answer_box) {
                    reqField = $('#' + ti).find('ul.required, div.required');
		    /*LGECO-557 20181213 modify*/
                    reqFieldText = $('#' + ti).find('span.required');
		    /* //LGECO-557 20181213 modify*/
                    if (reqField.length > 0) {
                        reqField.each(function() {
                            if ($(this).find('.checked').length > 0 || $(this).find("textarea").val() || $(this).find('select').val()) { //LGECI-3112 20171113 add
                                $(this).removeClass('required-field').prev('.question-text').removeClass('required-field')
                                nextStep = $('#' + ti).next('.steps').attr('id');
                                return nextStep;
                            } else {
                                nextStep = ti;
                                $(this).addClass('required-field').prev('.question-text').addClass('required-field');
                                $('#' + nextStep).find('.error-msg')[0].focus();
                                return nextStep;
                            };
                        });
			/*LGECO-557 20181213 add*/
                        reqFieldText.each(function(i){
                        	if($(this).find('input:text').prop("disabled") || !$(this).hasClass("validaion")){
                        		$(this).removeClass("error")
                        		return;
                        	}
                        	if($(this).find('input:text').val() && !$(this).find('input:text').prop("disabled")){
                        		$(this).removeClass("error").parents(".answer-list").prev('.question-text').removeClass('required-field')
                        		nextStep = $('#' + ti).next('.steps').attr('id');
                                return nextStep;
                        	}else{
                        		nextStep = ti;
                        		$(this).addClass("error").parents(".answer-list").prev('.question-text').addClass('required-field')
                        		 $('#' + nextStep).find('.error-msg')[0].focus();
                                return nextStep;
                        	}
                        })
			/*LGECO-557 20181213 add*/
                        if ($('#' + ti).find('.required-field').length > 0) {
                            nextStep = ti;
                            $('#' + nextStep).find('.required-field .error-msg')[0].focus();
                            return nextStep;
                        }
                    } else {
                        nextStep = $('#' + ti).next('.steps').attr('id');
                    }
                }
            } else if ($(this).hasClass('btn-prev')) {
                nextStep = $('#' + ti).prev('.steps').attr('id');
            };

            if ($('#' + nextStep).index() > 1) {
                surveyForm.find('.btn-prev').show();
            } else if ($('#' + nextStep).index() == 1) {
                surveyForm.find('.btn-prev').hide();
            };

            if ($('#' + nextStep).index() <= 0) {
            	/*//LGECS-1131 20170727*/
                //$('#' + ti).removeClass('active').removeAttr('tab-index');
                //surveyForm.hide();
                //surveyForm.closest('.survey-wrap').children('.end').addClass('active').show();
            	/*//LGECS-1131 20170727*/
                btn.submit();
            } else {
                $('#' + ti).removeClass('active').removeAttr('tab-index');
                $('#' + nextStep).addClass('active');
                surveyForm.find('.btn-center').find('.btn-next').attr('data-sc-item', 'support-feedback-pop-up-finish-' + nextStep);
            };
            if (surveyForm.find('.progress').length > 0) {
                var progress = surveyForm.find('.progress');
                //progress.removeClass(ti).addClass(nextStep);
                /*//LGECS-1131 20170727*/
                if ($('#' + nextStep).index() > 0) {
	                progress.find(".cell").removeClass("on");
	                progress.find(".cell:lt(" + $('#' + nextStep).index() + ")").addClass("on");
	                progress.find('.highlight').text($('#' + nextStep).index());
                }
                /*//LGECS-1131 20170727*/
            };
            //if (surveyForm.find('.progress').hasClass('step6')) {
            if (progress.find('.highlight').text() == total_page_cnt) {
                surveyForm.find('.btn-center').find('.btn-next').text(surveyForm.data("complete-btn"));
            } else {
                surveyForm.find('.btn-center').find('.btn-next').text(surveyForm.data("next-btn"));
            };

            surveyForm.closest('.survey-wrap').find('.active').attr('tabindex', 0).focus();

        });
        
        /* LGECI-3112 20171113 add */
        if(globalConfig.isMobile && $(".modal-survey").size() > 0 && (lgFilter.locale == '/ca_en' || lgFilter.locale == '/ca_fr')){
        	var surveyTop = $(".modal-survey").offset().top - 20;
            $(window).scrollTop(surveyTop);
        }
        /*// LGECI-3112 20171113 add */
    }

    ic.util.inherits(feedback, Module);
    ic.jquery.plugin('feedback', feedback, '.survey');

    return feedback;
});
