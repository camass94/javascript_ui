define(['jquery', 'ic/ic', 'ic/ui/module','cs/styledform', 'global-config', 'cs/maskedinput'], function($, ic, module, styledForm, config, masked) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        proto;

    var Forms = function(el, options) {
        var self = this;

        Forms.superclass.constructor.call(self, el, options);
        self.options.onInit = $.proxy(self, 'init');
        self.options.onBuild = $.proxy(self, 'build');
        self.options.onReInit = $.proxy(self, 'reInit');
        self.options.onValidation = $.proxy(self, 'validation');

        self._init();
    };

    util.inherits(Forms, module);

    proto = Forms.prototype;

    proto._defaults = {
        action: "",
        type: "get",
        async: true,
        focus: false,
        event: "change",
        responseloc: "self",
        msgElement: "span",
        msgClass: "msg-error",
        selectList: "[data-selected]"
    };

    proto._init = function(a, b) {
        var self = this;

        self.emit('init');

        self.$el = self.el.tagName == 'FORM' ? $(self.el) : $("form", self);
        self.$el.attr("action", self.options.action);
        /* LGECS-861 : 20160601 add */
        if(lgFilter.locale=="/br") {
            self.$el.find('input[type="number"], input[data-rule="number"]').on('keyup', function(e) {
                var _self = this;
                var regexp = /^\d+$/;
                var szKor = this.value;
                if($(this).attr("maxlength") != undefined && $(this).attr("name") == "addrnumber"){
                    if (regexp.test(szKor) != true) {
                        _self.value = _self.value.slice(0,_self.value.length-1);
                    }

                    if (_self.value.length >= _self.maxLength) {
                        _self.value = _self.value.slice(0, _self.maxLength);
                    }
                }
            });
        }
        /*//LGECS-861 : 20160601 add */

        self.$el.find('input[type="number"]').on('keyup', function() {
            var _self = this;
            if (_self.value.length >= _self.maxLength) {
                _self.value = _self.value.slice(0, _self.maxLength);
            }
        });

        if (self.$el.attr("method") != '') {
            self.options.type = self.$el.attr("method")
        } else {
            self.$el.attr("method", self.options.type);
        }
        if (self.options.responseloc == "self") {
            self.options.responseloc = self;
        } else {
            self.options.responseloc = "#" + self.options.responseloc;
        }
      
        if (self.options.selectList) {
            self.selectList();
        }
        self._build();
        self._bindDelegate();
        
        
    };

    proto._build = function() {
        var self = this;
        self.blnSubmit = false;

        /* LGECI-2381 : 20160516 add */
        var isandroid = (/android/i).test(navigator.userAgent); //android

        if(isandroid && (lgFilter.locale == "/ca_en" || lgFilter.locale == "/ca_fr")) {
            $("[data-rule='caPostCheck']").bind('keyup keypress paste', function(e){
                var $this = $(this);
                var code = e.keyCode ? e.keyCode : e.which;
                var _inputZip = $this.val();
                $this.attr("maxlength","7");

                if(_inputZip.charAt(3) != " " && _inputZip.length >= 6){
                    var sStr =_inputZip.substr(0,3);
                    var eStr = _inputZip.substr(3,3);

                    $this.val(sStr+ " " +eStr);
                }

                if($this.val().length >= 7){
                    e.preventDefault();
                    return false;
                }

                if(e.type == "paste"){
                    var pastedData = e.originalEvent.clipboardData.getData('text');

                    var sStr = pastedData.substr(0,3);
                    var eStr = pastedData.substr(3,3);
                    if(pastedData.charAt(3) != " "){
                        $this.val(sStr+ " " +eStr);
                    }
                }

            });
        }
        /*//LGECI-2381 : 20160516 add */

        self.$el.on("click", 'button[type="submit"], .submit', $.proxy(function(e) {
            e.preventDefault();
            
            var target = $(e.target);
            self.emit('build');
            self.blnSubmit = true;
            /* LGEJP-1849 201711201 add */
        	if(lgFilter.locale=='/jp') {            		
        		var totalByte = 0;
                var message = $('#firstName').val() + $('#lastName').val();
                var limitByte = 98;
                if(message.length != undefined){
                	for(var i =0; i < message.length; i++) {
                        var currentByte = message.charCodeAt(i);
                        if(currentByte > 128) totalByte += 2;
            			else totalByte++;
                    }
                    if(totalByte > limitByte) {
                    	alert( '文字数がオーバーしています。32文字以下で入力してください。');
                    	$('#firstName').focus();
                    	return false;
                    }
                }
        	}
        	/*// LGEJP-1849 201711201 add */
        	
        	/* LGEBR-3598 : 20180319 add*/
        	if(lgFilter.locale=='/br' && target.parents("form").attr("id") == "forgotForm-email-select") {
        		var selectEmail =  $.trim(target.text());
        		var selectEmailOrder = $.trim(target.attr("data-email"));
        		var targetForm = target.parents("form");
        		
        		targetForm.find("[name=returnEmailData]").val(selectEmail);
        		targetForm.find("[name=returnEmailOrder]").val(selectEmailOrder);
        		/* LGECS-1278 20180713 add */
        		targetForm.append($("input[name=LBD_VCID_customizedCaptcha]").clone());
        		targetForm.append($("input[name=getInstanceId]").clone());
        		targetForm.append($("input[name=getCodeCollection]").clone());
        		targetForm.append($("input[name=captchaCodeTextBox]").clone().addClass("hidden"));
        		/*//LGECS-1278 20180713 add */
        	}
        	/*//LGEBR-3598 : 20180319 add*/
            if (!self.validateForm()) {
                if (self.options.async) {
                    var targetCallback = target.data("callback");
                    if (targetCallback) {
                        if (targetCallback == "modal:open") {
                            var keyword = target.parents("form").find(".model-selector input[type='text']");
                            if (keyword.length) {
                                var obj = $("#step01");
                                if (!obj.data("selectedModel")) {
                                    keyword.addClass("error").trigger("focus").siblings("span.msg-error").css({
                                        bottom: keyword.outerHeight(true) + 5
                                    }).html("<i class='icon icon-error'></i>" + keyword.data("validModelMsg")).parent("span").css({
                                        "position": "relative",
                                        "display": "block"
                                    });
                                    return false
                                }
                            }

                            /* LGEGMO-1839 start, LGEGMO-1897 star */
                            if ($('.model-browser:visible').length) {
                                if (!$('.model-browser').hasClass('open')) {
                                    $('#keyword').addClass("error").trigger("focus").siblings("span.msg-error").css({
                                          bottom: $('#keyword').outerHeight(true) + ($('#keyword').is("[type='checkbox'],[type='radio']") ? 15 : 5)
                                    }).html("<i class='icon icon-error'></i>" + $('#keyword').data("validModelMsg")).parent("span").css("position", "relative");
                                    return false;
                                }
                            }
                            /* LGEGMO-1839 start, LGEGMO-1897 end */

                            target.modal();
                        } else {
                            call(targetCallback);
                        }
                    } else {
                        if (!target.is("[rel]")) {
			/*LGEUK-1647 20180920 modify*/
                            if (self.$el.closest(".step-list:not(.aboutEmailAddCs) .step").length) {
                            	self.$el.closest(".step-list .step form").trigger("submit", e);
                            } else if (self.$el.closest(".register-product").length) {
                                self.$el.closest(".register-product .step form").trigger("submit", e);
                            } else if (self.$el.closest(".repair-service-center").length && !self.$el.is("#captcha-box")) {
                                self.$el.closest(".repair-service-center > form").trigger("submit", e);
                            } else if (self.$el.closest(".dispatch-status").length) {
                                self.$el.closest(".dispatch-status form").trigger("submit", e);
                            } else if (self.$el.closest(".selfevent").length) {
                                self.$el.closest(".selfevent form").trigger("submit", e);
                            } else {
                                self.submitForm();
                                if (target.prop("disabled") == false) {
                                    target.prop("disabled", true);  //LGEGMO-1741
                                }
                            }
                        }
                    }
                } else {
                    self.$el[0].submit();
                }
                /*LGECS-729 20160704 modify*/
            }else{
                if(target.attr('rel')=='stepList:submit'&& typeof target.attr('rel') !=="undefined"){
                    return false;
                }
            }
            /*//LGECS-729 20160704 modify*/
        }, self));

        self.$el.on("click", 'button[type="reset"], .reset', $.proxy(function(e) {
            e.preventDefault();
            self.resetForm();
        }, self));

        if (self.options.event == "change") {
            self.$el.on("change", "input,select,textarea", $.proxy(function(e) {
                if (self.blnSubmit) {
                    //e.preventDefault();
                    // step1 model selecter skip
                    if (!$(e.target).hasClass('model-select')) {
                        self.validateForm();
                    }
                }
            }, this))
        }

        self.$el.on("focus", "input,select,textarea", function(e) {
        	 
            var _st = setTimeout($.proxy(function() {
                var _el = $(this).parent().find(".msg-error") || $(this).closest("span").find(".msg-error") || $(this).closest("span").siblings(".msg-error");
                if (_el.length && _el.is(":visible")) {
                    var _top = _el.offset().top;
                    if (_top < $(window).scrollTop()) {
                        $('html,body').animate({
                            scrollTop: config.isMobile ? $(this).offset().top - 50 : (_el.offset().top - 10)
                        }, 300);
                    }
                }
            }, this), 200)
        });

        $("input[type!='hidden'],select,textarea", self.$el).each(function(n) {
            var $this = $(this);
            var msgbox = $this.siblings(self.options.msgElement + "." + self.options.msgClass);

            if (!msgbox.length && !$this.parent(".styled-checkbox, .styled-radio").length) {
                msgbox = $("<" + self.options.msgElement + " />").addClass(self.options.msgClass).insertAfter($this);
            } else {
                msgbox = $("<" + self.options.msgElement + " />").addClass(self.options.msgClass).appendTo($this.parent(".styled-checkbox, .styled-radio").parent("span"));
            }
        });

        $('select.selectbox[readonly]', self.$el).each(function(idx, el) {
            var $this = $(el);
            $this.prop('disabled', true);
            $this.on('chosen:ready', function() { $this.prop('disabled', false) });
        });

        $('[checked-action]', self.$el).each(function(idx, el) {
            var $this = $(el);
            return $this[$this.attr('checked-action')]($this);
        });

        $('[data-blur-action]', self.$el).on('blur', function(e) {
            var $this = $(e.target);
            return $this[$this.data('blurAction')]($this);
        });
        /*LGERU-3614 20180618 modify*/
        $('[data-blur-validate]', self.$el).on('blur', function(e) {
            var $this = $(e.target);
            var types =$this.data('blurValidate');   
                var typeArray = types.split(",");
                $.each(typeArray, function(idx, type) {
                	if(type=="match"){
                		var validate = self.validation[type]($this,$this.data("match"));	
                	}else if(type =="minlength"){
                		var validate = self.validation[type]($this,$this.attr("minlength"));
                	}else{
                		var validate = self.validation[type]($this);
                	}
                    if (validate !== true) {
                        $this.addClass("error").siblings(self.options.msgElement + "." + self.options.msgClass).css({
                            bottom: $this.outerHeight(true) + 5
                        }).html("<i class='icon icon-error'></i>" + validate).parent("span").css({
                            "position": "relative",
                            "display": "block"
                        });
                        if($this.data("validateFocus")){
                        	//$this.focus()
                        	 $this.addClass("msgFocus").parent("span").addClass("focus")
                        }
                        return false;
                    }else if(validate ==true){
                    	$this.removeClass("error msgFocus").parent("span").removeClass("focus")
                    }
                });
        });
        /*//LGERU-3614 20180618 modify*/

        $('[data-masked-type]', self.$el).each(function() {
            var maskedType = $(this).attr('data-masked-type');

            switch (maskedType) {
                case 'BRMobile':
                    // LGEBR-3013 : 20160509 modify
                    $(this).one("click", function() {
                        $(this).mask("(99)99999-9999");
                    });
                    if ($(this).attr("inputmode") == "numeric") {$(this).attr("type", "tel");}
                    /*$(this).on("blur", function() {
                     var last = $(this).val().substr( $(this).val().indexOf("-") + 1,3);
                     if( last.length == 3 ) {
                     var move = $(this).val().substr( $(this).val().indexOf("-") - 1, 1 );
                     var lastfour = move + last;
                     var first = $(this).val().substr( 0, 8 );
                     console.log(lastfour)
                     $(this).val( first + '-' + lastfour );
                     }
                     });*/
                    break;
                case 'AAA AAA':
                    /*LGECI-2381 : 20160516 add*/
                    if(lgFilter.locale=="/ca_en" || lgFilter.locale=="/ca_fr"){
                        if(isandroid){
                            $("[data-rule='caPostCheck']").each(function() {
                                $(this).unmask();
                            });
                        } else {
                            $("[data-rule='caPostCheck']").each(function() {
                                $(this).mask("AAA AAA");
                            });
                        }
                    } else{
                        $(this).mask("AAA AAA");
                    }
                    /*//LGECI-2381 : 20160516 add*/
                    break;
                default:
                    var placeHolder = $(this)[0].hasAttribute('masked-holder') ? $(this).attr('masked-holder') : maskedType.replace(/0|9|A|\*/g, "_");// LGECI-2381 : 20160516 modify
                    $(this).mask(maskedType, {placeholder: placeHolder});
                    break;
            }
        });

        /* LGECI-2381 : 2060719 add */
        $('select.selectbox[readonly]', self.$el).each(function() {
            var $this = $(el);

        });
        /*//LGECI-2381 : 2060719 add */

        $('.captcha', self.$el).each(function(idx, el) {
            $(el).captchaInit();
        });

        $("[data-require-field]", self.$el).each(function() {
            $(this).requireField(self)
        });

        $("[data-modify-rule-target]", self.$el).each(function() {
            $(this).modifyRule(self)
        });

        $("[data-toggle-field]", self.$el).each(function() {
            $(this).toggleField(self)
        });

        $('[data-radio-enable-switch]', self.$el).each(function() {
            $(this).radioSwitch();
        });

        $('[data-check-enable-switch]', self.$el).each(function() {
            $(this).checkboxSwitch();
        });

        $('[data-check-disable-switch]', self.$el).each(function() {
            $(this).checkboxDisableSwitch();
        });

        self.$el.on("keydown", "input[data-byte-check], textarea[data-byte-check]", $.proxy(function(e) {
            var tgField = e.currentTarget;
            var byteLimit = parseInt($(tgField).data("byte-check"));
            var currentLength = tgField.value.length;
            var available = [33,34,35,36,37,38,39,40,27,9,8, 45,46];
            if (currentLength >= byteLimit && !(available.indexOf(e.keyCode)+1)) {
                e.preventDefault();
            }
        }, this));

        self.$el.on("keyup", "input[data-byte-check], textarea[data-byte-check]", $.proxy(function(e) {
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
                    tgField.value = tgField.value.slice(0, byteLimit);
                    strLen = i;
                    break;
                } else {
                    byteTotal = tmpByte;
                }
            }

            $("strong[name=" + tgField.name + "]").text(Math.max(0, byteLimit-byteTotal));
        }, this));

        self.$el.on("change", ".visibleControll", function(e) {
            $(this).visibleControll(self.$el, $(this).data('type'))
        });

        self.$el.find('.visibleControll').each(function() {
            $(this).visibleControll(self.$el, $(this).data('type'))
        });

        // element[data-event][data-operate='{"fld1":"val1"}'], input[name='fld1']
        self.$el.find("[data-event]").each(function() {
            var _this = $(this);
            var _event = _this.data("event").split(":");
            _this.on(_event[0], function() {
                var _oper = _this.data("operate");
                for (var a in _oper) {
                    self.$el[0][a].value = _this.is(":" + _event[1]) ? _oper[a] : '';
                }
            })
        });

        /* PJTBTOBCSR-138 20161027 add */
        //business
        self.$el.on("form:validate:reset", $.proxy(function(e) {
            e.preventDefault();
            self.resetForm();
            self.blnSubmit = false;
        }, self));
        /* //PJTBTOBCSR-138 20161027 add */
    };

    proto._bindDelegate = function() {
        var self = this;

        /* PJTBTOBCSR-138 20161027 modify */
        // validate
        self.$el.on(FORM_EVENT.VALIDATE, function(e, args1) {
            var result = self.validateForm();
            if (result == 0) {
                self.$el.trigger(FORM_EVENT.VALIDATE_SUCCESS, args1);
            } else {
                self.$el.trigger(FORM_EVENT.VALIDATE_FAIL, args1);
            }
        });
        /* //PJTBTOBCSR-138 20161027 modify */
    };

    proto.reInit = function() {
        var self = this;
        self.emit('reInit');
    };

    proto.resetForm = function() {
        var self = this;

        self.$el[0].reset();
        self.$el.find(".selectbox").removeClass("error").trigger("chosen:updated");
        self.$el.find("input[type='checkbox'], input[type='radio']").iCheck("uncheck").iCheck("update");

        //byteCheck reset
        var byteCheck = self.$el.find('input[data-byte-check],textarea[data-byte-check]');
        if (byteCheck.size() > 0) {
            byteCheck.each(function(index, value) {
                self.$el.find("strong[name=" + $(this).attr('name') + "]").text($(this).data('byte-check'))
            })
        }
    };

    proto.submitForm = function(url) {
        var self = this;
        self.submitBtn = self.$el.find('[type="submit"]');
        self.submitBtn.spin(true);
        var pagecall = false;

        self.msgError = self.$el.parent().prev(".msg-error-match");
        if (!self.msgError.length) self.msgError = self.$el.children(".msg-error-match");
        if (!self.msgError.length) self.msgError = self.$el.closest('.field').prev(".msg-error-match");
        self.msgError.hide();

        if (self.$el.find("[data-tab-select-url]").length) {
            self.$el.find("[data-tab-select-url]").val("").find("option:first-child").prop("selected", true).trigger("chosen:updated");
        }

        /* LGECI-2329, LGECS-1047 : 20170413 modify */
        if(self.$el.attr('id') && self.$el.attr('id').match('surveyFormCA')){
            var _msg, scsItemId, categoryId, itemTitleName, itemServiceTypeName, delimiterCode, videoId, surveyDevice, surveyBrowser, surveyBrowserVersion,surveyUrl,answer_0101,q2_contents_answer,answer_01, answer_0101, q2_contents_answer, answer_0301,answer_030101,
            lgajaxFlag, requestVerificationToken, answer_030102, euGdprFlag;	// PJTEUGDPR-1 20180122 add
            scsItemId= $('input:hidden[name="scsItemId"]').val();
            categoryId= $('input:hidden[name="categoryId"]').val();
            itemTitleName= $('input:hidden[name="itemTitleName"]').val();
            itemServiceTypeName= $('input:hidden[name="itemServiceTypeName"]').val();
            delimiterCode= $('input:hidden[name="delimiterCode"]').val();
            videoId= $('input:hidden[name="videoId"]').val();
            surveyDevice= $('input:hidden[name="surveyDevice"]').val();
            surveyBrowser= $('input:hidden[name="surveyBrowser"]').val();
            surveyBrowserVersion= $('input:hidden[name="surveyBrowserVersion"]').val();
            surveyUrl= $('input:hidden[name="surveyUrl"]').val();
            answer_01= $('input[name="answer_01"]:radio:checked').val();
            answer_0101= $('input[name="answer_0101"]:radio:checked').val();
            q2_contents_answer= $('textarea[name="q2_contents_answer"]').val();
            answer_0301= $('input[name="answer_0301"]:radio:checked').val();
            answer_030101= $('input[name="answer_030101"]').val();
            lgajaxFlag = $('input[name="lgajaxFlag"]').val();
            requestVerificationToken = $('input[name="requestVerificationToken"]').val();
            /* PJTEUGDPR-1 20180122 add */
            answer_030102= $('input[name="answer_030102"]').val();
            euGdprFlag = $('input[name="euGdprFlag"]').val();
            /*//PJTEUGDPR-1 20180122 add */
            
            $.ajax({
                url: url || self.options.action,
                type: self.options.type,
                //type: "get",
                //data: XSSfilters(i.$el.serializeArray()),
                data: {
                    "scsItemId" : scsItemId,
                    "categoryId" : categoryId,
                    "itemTitleName" : itemTitleName,
                    "itemServiceTypeName" : itemServiceTypeName,
                    "delimiterCode" : delimiterCode,
                    "videoId" : videoId,
                    "surveyDevice" : surveyDevice,
                    "surveyBrowser" : surveyBrowser,
                    "surveyBrowserVersion" : surveyBrowserVersion,
                    "surveyUrl" : surveyUrl,
                    "answer_01" : answer_01,
                    "answer_0101" : answer_0101,
                    "q2_contents_answer" : q2_contents_answer,
                    "answer_0301" : answer_0301,
                    "answer_030101" : answer_030101,
                    "lgajaxFlag" : lgajaxFlag,
                    "requestVerificationToken" : requestVerificationToken,
                    /* PJTEUGDPR-1 20180122 add */
                    "answer_030102" : answer_030102,
                    "euGdprFlag" : euGdprFlag
                    /*//PJTEUGDPR-1 20180122 add */
                },
                dataType: "jsonp",
                jsonp : "callback",
                beforeSend: function() {
                    self.$el.addClass("process")
                },
                success: function(data) {
                    _msg = data;

                    try {
                        data = $.parseJSON(data);
                    } catch (err) {
                        data = data;
                    }
                    if (self.options.responseloc != self) {

                        var tgEl = $(self.options.responseloc);
                        var tgTop = tgEl.offset().top;
                        var winTop = $(window).scrollTop();
                        
                        if(data.url && typeof data.url != "undefined"){
                        	location.href = data.url;
                        } else {
                        	tgEl.empty().append(data);
                        }
                        
                        tgEl.find('.selectbox').chosen();
                        
                        
                        var innerForm = $("form", tgEl);

                        if (tgEl.find("input[type='checkbox']").length || tgEl.find("input[type='radio']").length) {
                            styledForm(tgEl.parents("div"));
                        }

                        if (innerForm) {
                            ic.jquery.plugin('Forms', Forms, innerForm);
                        }

                        if (winTop > tgTop) {
                            $("html, body").stop().animate({
                                "scrollTop": (tgTop - 50) + "px"
                            });
                        }

                    }

                },
                complete: function(n) {
                    self.blnSubmit = false;
                    self.$el.removeClass("process");
                    if (!pagecall) self.submitBtn.spin(false);
                    if(_msg.returnMessage!= ""){
                    	$('.content-feedback .on-feedback').html("<div class='message'>"+ _msg.returnMessage +"</div>");
                    }
                              
                },
                error: function(xhr, status, thrown) {
                    self.submitBtn.spin(false);
                    modalAlert(status)
                }
            })
            /*//LGECS-1047 : 20170413 modify */
	    /*LGEUK-1647 20180920 add*/
        }else if(self.$el.attr('id') && self.$el.attr('id').match('aboutEmailAddCs')){
        	if(lgFilter.locale == "/sg"){
        		self.options.action=self.$el.data("action");
        	}
        	self.$el.ajaxSubmit({
                url: url || self.options.action,
                type: self.options.type,
                data: XSSfilters(self.$el.serializeArray()),
                beforeSend: function() {
                    self.$el.addClass("process");
                },
                success: function(data) {
                	try {
                        data = $.parseJSON(data);
                    } catch (err) {
                        data = data;
                    }
                   
                    if (self.options.responseloc != self) {
	                    if(data.url && typeof data.url != "undefined"){
	                    	location.href = data.url;
	                    }
                    }else{
                    	if (data.form) {
                            self.postSubmit(data.url, data.form, self.options.responseLocation);
                        }else{ 
		                    if (data.error) {
		                        var errs = [];
		                        for (var f in data.error) {
		                            var target = self.$el[0][f];
		                            //var target = self.$el.find("input:not([type=hidden])").eq(0)[0];
		
		                            $(target).addClass("error").siblings(self.options.msgElement + "." + self.options.msgClass).css({
		                                bottom: $(target).outerHeight(true) + 5
		                            }).html("<i class='icon icon-error'></i>" + data.error[f]).parent("span").css({
		                                "position": "relative",
		                                "display": "block"
		                            });
		
		                            errs.push(target);
		
		                            if (f === 'captchaCodeTextBox') {
		                            	customizedCaptcha.ReloadImage();
		                            }
		                        }
		
		                        errs[0].focus();
		                        self.submitBtn.spin(false);
		                    }
                        }
                    }
                },
                complete: function() {
                    self.blnSubmit = false;
                    self.$el.removeClass("process");
                    if (!pagecall) self.submitBtn.spin(false);
                },
                error: function(xhr, status, thrown) {
                    self.submitBtn.spin(false);
                    modalAlert(status)
                }
        	})
		/*//LGEUK-1647 20180920 modify*/
        }else{
           $.ajax({
                url: url || self.options.action,
                type: self.options.type,
                data: XSSfilters(self.$el.serializeArray()),

                //method: "post",
                //dataType: "json",

                beforeSend: function() {
                    self.$el.addClass("process");
                },
                success: function(data) {
                    // if (self.submitBtn.data("scItem") && typeof _satellite == "object") _satellite.track(self.submitBtn.data("scItem"));
                    try {
                        data = $.parseJSON(data);
                    } catch (err) {
                        data = data;
                    }

                    if (self.options.responseloc != self) {
                        var tgEl = $(self.options.responseloc);
                        var tgTop = tgEl.offset().top;
                        var winTop = $(window).scrollTop();

                        /* LGECS-1047 : 20170413 modify */
                        if(data.url && typeof data.url != "undefined"){
                        	location.href = data.url;
                        } else {
                        	tgEl.empty().append(data);
                        }
                        /*//LGECS-1047 : 20170413 modify */
                        
                        tgEl.find('.selectbox').chosen();

                        var innerForm = $("form", tgEl);

                        if (tgEl.find("input[type='checkbox']").length || tgEl.find("input[type='radio']").length) {
                            styledForm(tgEl.parents("div"));
                        }

                        if (innerForm) {
                            ic.jquery.plugin('Forms', Forms, innerForm);
                        }

                        if (winTop > tgTop) {
                            $("html, body").stop().animate({
                                "scrollTop": (tgTop - 50) + "px"
                            });
                        }
                    } else {
                        if (data.responseLocation) {
                            self.options.responseLocation = data.responseLocation
                        }
                        if (data.form) {
                            self.postSubmit(data.url, data.form, self.options.responseLocation);
                        } else if (data.result) {
                            if (data.action) {
                                if (data.action.ajax) {
                                    self.submitForm(data.action.url);
                                } else {
                                    var form = document.createElement("form");
                                    form.method = "post";
                                    form.action = data.action.url;

                                    $.each(self.$el.serializeArray(), function(i, fld) {
                                        var input = document.createElement('input');
                                        input.setAttribute("type", "hidden");
                                        input.setAttribute("name", fld.name);
                                        input.setAttribute("value", XSSfilter(fld.value));
                                        form.appendChild(input);
                                    });
                                    /*LGETR-1061 20161128 add*/
                                    if(data.serviceRepairNo){
                                    	$(form).find("[name=receipt-number]").val(data.serviceRepairNo);
                                    }
                                    /*//LGETR-1061 20161128 add*/
                                    self.submitBtn.spin(false);
                                    self.submitBtn.spin(true);
                                    $(form).hide().appendTo("body")[0].submit(); //.submit();
                                }
                            } else if (data.hasOwnProperty('url')) {
                                if (self.options.responseLocation == "replace") {
                                    location.replace(data.url);
                                } else {
                                    if (self.options.responseLocation == "parent") {
                                        parent.location.href = data.url;
                                    } else if (self.options.responseLocation == "opener") {
                                        var url = data.url ? data.url : '';
                                        window.opener.location.href = url;
                                        window.close();
                                    } else if (data.modalText) {
                                        var url = data.url || "";
                                        modalAlert(data.modalText, true, url);
                                    } else if (!data.url && self.options.responseLocation == "modal" && data.modalUrl) {
                                        $("#forgotForm .btn-submit").data("url", data.modalUrl).modal();
                                        self.submitBtn.spin(false);
                                    } else {
                                        /* [s] 20151209 / omniture */
                                        if (self.$el.is("#agreeForm")) {
                                            _satellite.track('track-repair-service-sign-in');
                                        }
                                        /* LGECS-670 20160909 add */
                                        if (data.passwordReminderFlag != undefined || data.tempPasswordFlag != undefined) {
                                            self.$el.attr("action", data.url);
                                            self.$el.append('<input type="hidden" name="tempPasswordFlag" value="'+data.tempPasswordFlag+'" />');
                                            self.$el.submit();
                                        } else if (self.$el.hasClass("change-password")) {
                                            $(".success-show").removeClass("hidden");
                                            $(".wrapper.support .modal-content").css({
                                                left: ($(window).width() - $(".wrapper.support .modal-content").innerWidth()) / 2,
                                                top: ($(window).height() - $(".wrapper.support .modal-content").outerHeight()) / 2
                                            });
                                        } else {
                                            location.href = data.url;
                                        }
                                        /* //LGECS-670 20160909 add */
                                        /* [e] 20151209 / omniture */
                                    }
                                    if (self.$el.is("#dispatchSignin")) {
                                        _satellite.track('repair-dispatch-portal-sign-in');
                                    }
                                }
                                pagecall = true;
                            } else if (data.modalUrl && self.options.responseLocation == "modal") {
                                $("#forgotForm .btn-submit").data("url", data.modalUrl).modal();
                                self.submitBtn.spin(false);
                                if (window.opener && self.$el.is('#forgotForm')) {
                                    var itv = setInterval(function() {
                                        var _el = $('.modal-content .certification a.btn');
                                        if (_el.attr('rel')) { return clearInterval(itv); }
                                        _el.attr('rel', 'opener.redirect');
                                    }, 50);
                                }
                            } else if (self.$el.is("#signinForm") && self.options.ispopup) { // sign-in
                                window.opener.location.reload();
                                window.close();
                            } else if (data.dispatchResult) {
                                if (data.dispatchUrl != undefined && self.options.responseLocation == "modal") {
                                    self.$el.find("button[type=submit]").data("url", data.dispatchUrl).modal();
                                    self.submitBtn.spin(false);
                                } else if (data.dispatchTxt != undefined && self.options.responseLocation == "modal") {
                                    modalAlert(data.dispatchTxt, true);
                                    self.submitBtn.spin(false);
                                } else if (self.$el.attr("id") == "dispatchPassword") {
                                    var alertMessage = "Your password has been changed successfully \nPlease Sign-In by using your new password.";
                                    modalAlert(alertMessage, true);
                                    $.modal.close();
                                }
                            } else if (data.modalText) {
                                var url = data.url || "";
                                modalAlert(data.modalText, true, url);
                            } else if (data.validate) {
                                if (self.$el.parent().hasClass('email_send')) {
                                    var alertMessage = self.$el.closest('.email_send').find('.text-success').text();
                                    modalAlert(alertMessage, true).on('click', function(){
                                        self.$el.find('[rel="email:close"]').trigger('click');
                                        self.resetForm();
                                    });
                                }
                            }
                        } else {
                            if (self.$el.is("#signinForm")) { //sign-in
                                self.msgError.show();
                                // LGEGMO-1975 start
                                if (config.isMobile && self.msgError.size() > 0) {
                                    var msgErrorTop = self.msgError.offset().top
                                    $(window).scrollTop(msgErrorTop);
                                }
                                // LGEGMO-1975 end
                                /* LGECS-669 add */
                                if(data.error != undefined && data.error.returnAuthMsg =="N"){
                                    $(".msg-error-match .basic").css('display','none');
                                    $(".msg-error-match .rock-msg").html(data.error.returnMsg).css('display','block');
                                    $('.btn-find-pw').trigger('click');
                                }else{
                                    $(".msg-error-match .rock-msg").empty().css('display','none');
                                    $(".msg-error-match .basic").css('display','block');
                                }
                                /* //LGECS-669 add */
                            } else if (self.$el.is("#dispatchSignin")) {
                                modalAlert("Login failed. Please try again.", true);
                            } else if (self.$el.is("#trackRepair") || self.$el.is("#trackRepair2")) {
                                if (data.error) {
                                    //var errorMsg = self.$el.data("errorMsg");
                                    var errs = [];
                                    var target = self.$el.find("input:not([type=hidden])").eq(0)[0];
                                    //var target = self.$el[0][0];

                                    modalAlert(data.error, true);

                                    /*
                                    $(target).addClass("error").siblings(self.options.msgElement + "." + self.options.msgClass).css({
                                        bottom: $(target).outerHeight(true) + 5
                                    }).html("<i class='icon icon-error'></i>" + data.error).parent("span").css({
                                        "position": "relative",
                                        "display": "block"
                                    });
                                    */

                                    errs.push(target);
                                    /* LGEGMO-1700 start */
                                    //errs[0].focus();
                                    /* LGEGMO-1700 end */
                                    self.submitBtn.spin(false);
                                }
                            } else if (data.validate) {
                                if (self.$el.parent().hasClass('email_send')) {
                                    var alertMessage = self.$el.closest('.email_send').find('.text-failure').text();
                                    modalAlert(alertMessage, true).on('click', function(){
                                        self.$el.find('[rel="email:close"]').trigger('click');
                                        self.resetForm();
                                    });
                                }
                            } else if(data.modalText){
                                modalAlert(data.modalText, true);
                            } else {
                                if (data.error) {
                                    var errs = [];

                                    /* LGEPJT-483 add modfiy */
                                    var isMobile = $('body').hasClass('is-mobile');
                                    /* LGEPJT-483 add */
                                    $('#obsErrorPanel').remove();
                                    /* //LGEPJT-483 add */
                                    if (data.isObs != undefined && data.isObs == true && isMobile == false){

                                        for (var f in data.error) {
                                            var target = self.$el[0][f];

                                            var $obsErrorDiv = $('<div id="obsErrorPanel"></div>');

                                            $obsErrorDiv.append('<i class="icon icon-error" style="margin-right:10px;"></i>' + data.error[f]);
                                            $obsErrorDiv.css({
                                                'display':'block',
                                                'color': '#a50034',
                                                'margin-top': '10px',
                                                'font-size': '1.8rem'
                                            });
    
                                            $(target).after($obsErrorDiv);
    
                                            errs.push(target);
                                        }
                                    } else {
                                        for (var f in data.error) {
                                            var target = self.$el[0][f];
                                            //var target = self.$el.find("input:not([type=hidden])").eq(0)[0];
    
                                            $(target).addClass("error").siblings(self.options.msgElement + "." + self.options.msgClass).css({
                                                bottom: $(target).outerHeight(true) + 5
                                            }).html("<i class='icon icon-error'></i>" + data.error[f]).parent("span").css({
                                                "position": "relative",
                                                "display": "block"
                                            });
    
                                            errs.push(target);
    
                                            if (f === 'captchaCodeTextBox') {
                                                $('#customizedCaptcha_ReloadLink').click();
                                            }
                                        }    
                                    }
                                    /* //LGEPJT-483 add modfiy */  

                                    errs[0].focus();
                                    self.submitBtn.spin(false);
                                }
                            }

                        }

                        if (!!data) {
                            self.$el.trigger(FORM_EVENT.AJAX_SUCCESS, [self, data]);
                        }

                    }
                },
                complete: function() {
                    self.blnSubmit = false;
                    self.$el.removeClass("process");
                    if (!pagecall) self.submitBtn.spin(false);
                },
                error: function(xhr, status, thrown) {
                    self.submitBtn.spin(false);
                    modalAlert(status)
                }
            })
        }
        /*//LGECI-2329 20160602 modify */

    };

    proto.validateForm = function() {
        var self = this;

        self.emit('validateForm');
        self.$el.trigger('validateForm');

        var fldCount = 0;
        var errCount = 0;

        $("input,select,textarea", self.$el).each($.proxy(function(idx, elm) {
            var fld = $(elm);
            var fldStyleForm = fld.parent(".styled-checkbox, .styled-radio");
            var valid = [];
            var types;

            /* PJTBTOBCSR-138 20161027 add */
            if (fld.attr('ignore')) return;
            /* PJTBTOBCSR-138 20161027 add */

            function appendType(type) {
                var _type = typeof type == 'string' ? {
                    type: type
                } : type;

                valid.push(_type);
            }

            fld.removeClass("error");
            fldStyleForm.parent("span").removeClass("error");

            var required = fld.prop("required") || fld.attr("required") || (fld.val() && fld.data("validate") == "enter") || fld.data("match");
            var fldVisible = fld[0].tagName === "SELECT" && fld.next(".chosen-container").length ? fld.next().is(":visible") : fld.is(":visible");

            /* PJTBTOBCSR-138 */
            if (fld.attr('must-required')) { fldVisible = true; }
            /* //PJTBTOBCSR-138 */

            if (required && fldVisible && fld.attr("type") != "hidden" && fld.prop("disabled") == false) {

                fldCount++;
                var maxLength = fld.attr("maxlength");
                var minLength = fld.attr("minlength");

                if (maxLength && maxLength != '' && maxLength > 0 && fld.data("error-type") != "between" && fld.data("error-type") != "length" && fld.data("error-type") != "keywords") {
                    appendType({
                        type: "maxlength",
                        length: parseInt(maxLength)
                    })
                }
                if (minLength && minLength != '' && minLength > 0 && fld.data("error-type") != "between" && fld.data("error-type") != "length" && fld.data("error-type") != "keywords") {
                    appendType({
                        type: "minlength",
                        length: parseInt(minLength)
                    })
                }

                if (elm.nodeName == "INPUT") {
                    types = fld.data("rule") || fld.attr("type");
                } else {
                    types = elm.nodeName.toLowerCase();
                }

                if (types.indexOf(",") > -1) {
                    var typeArray = types.split(",");
                    $.each(typeArray, function(idx, type) {
                        return valid.push({
                            type: $.trim(type)
                        });
                    });
                } else if (self.validation[types]) {
                    /* LGECS-670 20160909 add */
                    if (elm.className == "new-password") {
                        appendType("newpassword")
                    } else {
                        appendType(types)
                    }
                    /* //LGECS-670 20160909 add */
                }

                if (required) {
                    appendType('required');
                }

                if (fld.data("match")) {
                    appendType({
                        type: "match",
                        field: fld.data("match")
                    })
                }

                if (fld.data("newpassword")) {
                    appendType("newpassword")
                }

                if (fld.data("error-type")) {
                    if (fld.data("error-type") == "between") {
                        appendType({
                            type: fld.data("error-type"),
                            length: parseInt(minLength) + "-" + parseInt(maxLength)
                        })
                    } else if (fld.data("error-type") == "length") {
                        appendType({
                            type: fld.data("error-type"),
                            length: parseInt(maxLength)
                        })
                    } else if (fld.data("error-type") == "keywords") {
                        appendType({
                            type: fld.data("error-type"),
                            length: parseInt(minLength)
                        })
                    } else {
                        appendType({
                            type: fld.data("error-type")
                        })
                    }
                }

                var validCount = valid.length;
                while (validCount--) {
                    var currentValid = valid.pop();
                    var validate;
                    if (currentValid.length) {
                        validate = self.validation[currentValid.type].apply(this, [fld, currentValid.length])
                    } else if (currentValid.field) {
                        validate = self.validation[currentValid.type].apply(this, [fld, currentValid.field])
                    } else {
                        validate = self.validation[currentValid.type].apply(this, [fld])
                    }
                    if (validate != true) {
                        if (!fldStyleForm.length) {
                            fld.addClass("error").siblings(self.options.msgElement + "." + self.options.msgClass).css({
                                bottom: fld.outerHeight(true) + 5
                            }).html("<i class='icon icon-error'></i>" + validate).parent("span").css({
                                "position": "relative",
                                "display": "block"
                            });
                        } else {
                            fldStyleForm.parent("span").addClass("error").find(self.options.msgElement + "." + self.options.msgClass).css({
                                bottom: fldStyleForm.parent("span").outerHeight(true) + 5
                            }).html("<i class='icon icon-error'></i>" + validate).parent("span").css({
                                "position": "relative",
                                "display": "inline-block"
                            });
                        }
                        break;
                    }
                }
            }
        }, this));

        if ($(":focus").is("input,select,textarea")) {
            // $(":focus", self.$el).focus();
        } else {
            var $errEl = self.$el.find(".error").eq(0);
            if ($errEl.hasClass("selectbox") && !$errEl.is(":visible")) {
                $errEl.next().find("input").focus();
            } else if ($errEl.find(".styled-checkbox, .styled-radio").length) {
                $errEl.find(".styled-checkbox input, .styled-radio input").focus().parent().addClass('focus');
            } else {
                $errEl.focus();
            }
        }

        /* PJTBTOBCSR-138 */
        self.$el.trigger('form:validated', [self.$el.find(".error").length]);
        /* //PJTBTOBCSR-138 */

        return self.$el.find(".error").length;
    };

    proto.postSubmit = function(url, frm, loc) {
        var hasOpener = (loc == "opener") && !this.$el.is('#signinForm');

        var form = document.createElement("form");
        form.method = "post";
        form.action = url;

        if (hasOpener) {
            form.target = "openerWindow";
        }

        $.each(frm, function(key, value) {
            var input = document.createElement('input');
            input.setAttribute("type", "hidden");
            input.setAttribute("name", key);
            input.setAttribute("value", XSSfilter(value));
            form.appendChild(input);
        });

        $(form).hide().appendTo("body")[0].submit();
        if (hasOpener) window.close();
    };

    proto.validation = {
        email: function(a) {
            var b = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;      // LGEDE-1833 20160624 modify
            if (b.test(a.val()) || (!a.attr("required") && !a.is("[required]")) && (!a.val() || a.val() == a.attr("placeholder"))) {
                return true
            } else {
            	/*LGERU-3614 20180618 modify*/
            	if(a.data("emailMsg")!==undefined && a.data("emailMsg")!==null){
            		return (a.data("emailMsg"))
            	}else{
            		return ("" + formerror["email"]).split("%title%").join(a.attr("title"))
            	}
            	/*LGERU-3614 20180618 modify*/
            }
        },
        onlyAlphabet: function(a) {
            var b = /^[a-zA-Z]*$/;
            if (b.test(a.val()) || (!a.attr("required") && !a.is("[required]")) && (!a.val() || a.val() == a.attr("placeholder"))) {
                return true
            } else {
            	return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        isText: function(a) {
            var b = /^[a-zA-Z0-9]*$/;
            if (b.test(a.val())) {
                return true;
            } else {
                return ("" + formerror["invalid"]).split("%title%").join(a.attr("title"))
            }
        },
        onlyCharacters: function(a) {
            var regexp = /^[0-9~`!@#$%^&*()_+-=]*$/;
            var regtemp = true;
            for (var i = 0; i < a.val().length; i++) {
                (regexp.test(a.val().charAt(i))) ? regtemp = false: null;
            }
            if (regtemp) {
                return true
            } else if (a.val() == "") {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"));
            } else {
                if (a.data('validmsg')) {
                    return a.data('validmsg');
                } else {
                    return ("" + formerror["required"]).split("%title%").join(a.attr("title"));
                }

            }
        },
        tel: function(a) {
            var b = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
            if (b.test(a.val()) || (!a.attr("required") && !a.is("[required]")) && (!a.val() || a.val() == a.attr("placeholder"))) {
                return true
            } else {
                return ("" + formerror["tel"]).split("%title%").join(a.attr("title"))
            }
        },
        text: function(a) {
            if (!a.val() || a.val() != a.attr("placeholder")) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        password: function(a) {
            if (!a.val() || a.val() != a.attr("placeholder")) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        file: function(a) {
            if (a.val() || (!a.attr("required") && !a.is("[required]"))) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        filetype: function(d, e) {
            var b = e.split("|");
            if (d.val() || (!d.attr("required") && !d.is("[required]"))) {
                var c = d.val().substr(d.val().lastIndexOf(".") + 1).toLowerCase();
                var a = b.length;
                while (a--) {
                    if (c == b[a]) {
                        return true
                    }
                }
                return ("" + formerror["filetype"]).split("%title%").join(d.attr("title")).split("%types%").join(b.join(", "))
            } else {
                return true
            }
        },
        match: function(a, b) {
            if (a.val() != a.attr("placeholder") && a.val() == $('[name="' + b + '"]', a.closest("form")).val()) {
                return true
            } else {
            	/* LGEJP-1579 20161220 add */
                if (lgFilter.locale == "/jp" && a.hasClass("jpPassword")) {
                    return ("" + formerror["jpPwMatch"])
                } else {
                	return ("" + formerror["match"]).split("%title%").join(a.attr("title")).split("%target_title%").join($('[name="' + b + '"]').attr("title"))
                }
                /* //LGEJP-1579 20161220 add */
            }
        },
        minlength: function(a, b) {
            if (!a.val() || a.val() == a.attr("placeholder") || a.val().length >= b) {
                return true
            } else {
                if (a.data('validmsg')) {
                    return a.data('validmsg');
                } else {
                	/* LGEJP-1579 20161220 add */
                    if (lgFilter.locale == "/jp" && a.attr("id") == "confirmPassword") {
                        return ("" + formerror["jpPwMin"])
                    } else if(lgFilter.locale == "/ru" && a.attr("id") == "contactPhone" && a.data("blurValidate")!==undefined ){
                    	return (a.data("numberMsg"))
                    }else{
                    	return ("" + formerror["minlength"]).split("%title%").join(a.attr("title")).split("%target%").join(b).split("%used%").join(a.val().length)
                    }
                    /* //LGEJP-1579 20161220 add */
                }
            }
        },
        maxlength: function(a, b) {
            if (!a.val() || a.val() == a.attr("placeholder") || a.val().length <= b) {
                return true
            } else {
                return ("" + formerror["maxlength"]).split("%title%").join(a.attr("title")).split("%target%").join(b).split("%used%").join(a.val().length)
            }
        },
        textarea: function(a) {
            if (a.val() && a.val() != a.attr("placeholder")) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        checkbox: function(a) {
            if (a.prop("checked") || (!a.attr("required") && !a.is("[required]"))) {
                return true
            } else {
                if (a.data('validmsg')) {
                    return a.data('validmsg');
                } else {
                    return ("" + formerror["checkbox"]).split("%title%").join(a.attr("title"));
                }

            }
        },
        radio: function(a) {
            if ($('input[name="' + a.attr("name") + '"]:checked').val() || !a.attr("required")) {
                return true
            } else {
                return ("" + formerror["radio"]).split("%title%").join(a.attr("title"))
            }
        },
        select: function(a) {
            //if (a.val() || (!a.attr("required") && !a.is("[required]")) || !a.find("option[value!='']").length) {
            if (a.val() || (!a.attr("required") && !a.is("[required]"))) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        number: function(a) {
            var b = /^\s*\d+\s*$/;
            if (b.test(a.val().replace(/\(|\)|\-/g, ''))) {
            	/* LGEVN-307 20161125 add */
                if (lgFilter.locale == "/vn" && a.attr("name") == "contactMobilePhone") {
                    var num = 0;
                    if ( a.val().indexOf(0) == 0 ) {
                        for (var i=0; i<a.val().length; i++) {
                            if ( a.val()[i] == 0 ) {
                            	num++;
                            } else {
                                break;
                            }
                        }
                        if (num == a.val().length) return ("" + formerror.number).split("%title%").join(a.attr("title"))
                    }
                    var a_value = a.val().substring(num, a.val().length);
                    a.val(Number(a_value));               
                }            	
                /* //LGEVN-307 20161125 add */
                return true
            } else {
            	/*LGERU-3614 20180618 modify*/
            	if(a.data("numberMsg")!==undefined && a.data("numberMsg")!==null){
            		return (a.data("numberMsg"))
            	}else{
            		return ("" + formerror["number"]).split("%title%").join(a.attr("title"))
            	}
            	/*//LGERU-3614 20180618 modify*/
            }
        },
        noRepeatNum: function(a) {
            var c = '123456789012345678909876543210';
            var d = /^1{10}|2{10}|3{10}|4{10}|5{10}|6{10}|7{10}|8{10}|9{10}|0{10}$/;
            var _val = a.val().replace(/-|\(|\)/g, '');

            if (c.indexOf(_val) < 0 && !d.test(_val)) {
                return true;
            } else {
                return ("" + formerror["noRepeatNum"]).split("%title%").join(a.attr("title"));
            }
        },
        date: function(a) {
            if (a.val() || (!a.attr("required") && !a.is("[required]"))) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        required: function(a) {
            var _val = $.trim(a.val());
            if (_val || (!a.attr("required") && !a.is("[required]")) || (!a.find("option[value!='']").length && a[0].tagName == "SELECT")) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        between: function(a, b) {
            var l = b.split("-");
            if (!a.val() || a.val() == a.attr("placeholder") || (a.val().length >= parseInt(l[0]) && a.val().length <= parseInt(l[1]))) {
                return true
            } else {
                return ("" + formerror["between"]).split("%title%").join(a.attr("title")).split("%target%").join(b)
            }
        },
        incorrect: function(a) {
            return ("" + formerror["incorrect"]).split("%title%").join(a.attr("title"))
        },
        length: function(a, b) {
            if (!a.val() || a.val() == a.attr("placeholder") || a.val().length == b) {
                return true
            } else {
                return ("" + formerror["length"]).split("%title%").join(a.attr("title")).split("%target%").join(b)
            }
        },
        invalid: function(a) {
            return ("" + formerror["invalid"]).split("%title%").join(a.attr("title"))
        },
        already: function(a) {
            return ("" + formerror["already"])
        },
        keywords: function(a, b) {
            if (!a.val() || a.val() == a.attr("placeholder") || a.val().length >= b) {
                return true
            } else {
                return ("" + formerror["keywords"]).split("%title%").join(a.attr("title")).split("%target%").join(b)
            }
        },
        newpassword: function(b) {
            /* LGECS-670 20160909 add */
            if (b.val() && b.val() != b.attr("placeholder")) {
                var isValid = false;
                var char1 = /(abc)|(bcd)|(cde)|(def)|(efg)|(fgh)|(ghi)|(hij)|(ijk)|(jkl)|(klm)|(lmn)|(mno)|(nop)|(opq)|(pqr)|(qrs)|(rst)|(stu)|(tuv)|(uvw)|(vwx)|(wxy)|(xyz)|(qwer)|(wert)|(erty)|(rtyu)|(tyui)|(yuio)|(uiop)|(asdf)|(sdfg)|(dfgh)|(fghj)|(ghjk)|(hjkl)|(zxcv)|(xcvb)|(cvbn)|(vbnm)|(ABC)|(BCD)|(CDE)|(DEF)|(EFG)|(FGH)|(GHI)|(HIJ)|(IJK)|(JKL)|(KLM)|(LMN)|(MNO)|(NOP)|(OPQ)|(PQR)|(QRS)|(RST)|(STU)|(TUV)|(UVW)|(VWX)|(WXY)|(XYZ)|(QWER)|(WERT)|(ERTY)|(RTYU)|(TYUI)|(YUIO)|(UIOP)|(ASDF)|(SDFG)|(DFGH)|(FGHJ)|(GHJK)|(HJKL)|(ZXCV)|(XCVB)|(CVBN)|(VBNM)|(zyx)|(yxw)|(xwv)|(wvu)|(vut)|(uts)|(tsr)|(srq)|(rqp)|(qpo)|(pon)|(onm)|(nml)|(mlk)|(lkj)|(kji)|(jih)|(ihg)|(hgf)|(gfe)|(fed)|(edc)|(dcb)|(cba)|(poiu)|(oiuy)|(iuyt)|(uytr)|(ytre)|(trew)|(rewq)|(lkjh)|(kjhg)|(jhgf)|(hgfd)|(gfds)|(fdsa)|(mnbv)|(nbvc)|(bvcx)|(vcxz)|(ZYX)|(YXW)|(XWV)|(WVU)|(VUT)|(UTS)|(TSR)|(SRQ)|(RQP)|(QPO)|(PON)|(ONM)|(NML)|(MLK)|(LKJ)|(KJI)|(JIH)|(IHG)|(HGF)|(GFE)|(FED)|(EDC)|(DCB)|(CBA)|(POIU)|(OIUY)|(IUYT)|(UYTR)|(YTRE)|(TREW)|(REWQ)|(LKJH)|(KJHG)|(JHGF)|(HGFD)|(GFDS)|(FDSA)|(MNBV)|(NBVC)|(BVCX)|(VCXZ)|(012)|(123)|(234)|(345)|(456)|(567)|(678)|(789)|(890)|(987)|(876)|(765)|(654)|(432)|(321)|(210)/;
                var filter1 = /^[a-zA-Z]+$/;   //臾몄옄留?
                var filter2 = /^[\~\!\@\#\$\%\^\&\*\(\)\_\-\+\|\{\}\[\]\,\.\/\?]+$/;   //?뱀닔臾몄옄留?
                var filter3 = /^[0-9]+$/;  //?レ옄留?
                var filter4 = /^[a-zA-Z\~\!\@\#\$\%\^\&\*\(\)\_\-\+\|\{\}\[\]\,\.\/\?]+$/;
                var filter5 = /^[0-9\~\!\@\#\$\%\^\&\*\(\)\_\-\+\|\{\}\[\]\,\.\/\?]+$/;
                var filter6 = /^[a-zA-Z0-9]+$/;
                var filter = /^[a-zA-Z0-9\~\!\@\#\$\%\^\&\*\(\)\_\-\+\|\{\}\[\]\,\.\/\?]+$/;

                if (char1.test(b.val())) {
                    return ("" + formerror.password3);          //?곗냽臾몄옄
                }

                if (b.val().length < 10) {
                    if (filter1.test(b.val())) {           //臾몄옄留?
                        return ("" + formerror.password8);
                    }
                    if (filter2.test(b.val())) {
                        return ("" + formerror.password8);  //?뱀닔臾몄옄留?
                    }
                    if (filter3.test(b.val())) {
                        return ("" + formerror.password8);  //?レ옄留?
                    }
                    if (filter4.test(b.val())) {
                        return ("" + formerror.password8);  //臾몄옄+?뱀닔臾몄옄
                    }
                    if (filter5.test(b.val())) {
                        return ("" + formerror.password8);  //?レ옄+?뱀닔臾몄옄
                    }
                    if (filter6.test(b.val())) {
                        return ("" + formerror.password10);    //臾몄옄+?レ옄
                    }
                    if (filter.test(b.val())) {
                        if (b.val().length < 8) {
                            return ("" + formerror.password8);
                        } else {
                            isValid = true;
                        }
                    }

                    if (isValid == true) {
                        return true;
                    } else {
                        return ("" + formerror.notsymbols); //遺덊뿀?뱀닔臾몄옄
                    }
                } else {
                    if (filter1.test(b.val())) {             //臾몄옄留?
                        return ("" + formerror.password10);
                    }
                    if (filter2.test(b.val())) {
                        return ("" + formerror.password10);  //?뱀닔臾몄옄留?
                    }
                    if (filter3.test(b.val())) {
                        return ("" + formerror.password10);  //?レ옄留?
                    }
                    if (filter4.test(b.val())) {
                        return ("" + formerror.password10);  //臾몄옄+?뱀닔臾몄옄
                    }
                    if (filter5.test(b.val())) {
                        return ("" + formerror.password10);  //?レ옄+?뱀닔臾몄옄
                    }
                    if (filter6.test(b.val())) {
                        isValid = true;                      //臾몄옄+?レ옄
                    }
                    if (filter.test(b.val())) {
                        isValid = true;
                    }

                    if (isValid == true) {
                        return true;
                    } else {
                        return ("" + formerror.notsymbols);  //遺덊뿀?뱀닔臾몄옄
                    }
                }
            }
            /* //LGECS-670 20160909 add */
        },
        postcode: function(a) {
            var b = /^[a-zA-Z0-9]/;
            if (b.test(a.val())) {
                return true
            } else {
                return ("" + formerror["postcode"]).split("%title%").join(a.attr("title"))
            }
        },
        cpf: function(el) {
            var cpfNum = el.val().replace(/[^\d]/g, "");
            var numbers, modulus, multiplied, tmp, mod;
            var verifierDigit, sendErr;

            verifierDigit = function(numbers) {
                numbers = numbers.split("");
                modulus = numbers.length + 1;
                multiplied = [];
                tmp = 0;

                $.each(numbers, function(idx, number) {
                    multiplied.push(parseInt(number, 10) * (modulus - idx));
                });

                $.each(multiplied, function(idx, number) {
                    tmp += number;
                });

                mod = tmp % 11;
                return (mod < 2 ? 0 : 11 - mod);
            };

            sendErr = function() {
                return ("" + formerror["invalid"]).split("%title%").join(el.attr("title"));
            };

            numbers = cpfNum.substr(0, 9);
            numbers += verifierDigit(numbers);
            numbers += verifierDigit(numbers);

            if (cpfNum.length !== 11) {
                return sendErr();
            }
            if (numbers.substr(-2) !== cpfNum.substr(-2)) return sendErr();

            return true;
        },
        cnpj: function(el) {
            var cnpjNum = el.val().replace(/[^\d]/g, "");
            var numbers, verifierDigit, sendErr;

            verifierDigit = function(numbers) {
                var numArr = numbers.split("");
                var idx = 2,
                    sum = 0,
                    buffer = [],
                    mod;
                var length, j, i;

                length = j = numArr.length;

                for (i = 0; i < length; i++) {
                    buffer.unshift(parseInt(numArr[i], 10));
                }

                while (j--) {
                    sum += parseInt(numArr[j], 10) * idx;
                    idx = (idx === 9) ? 2 : idx + 1;
                }

                mod = sum % 11;
                return (mod < 2 ? 0 : 11 - mod);
            };

            sendErr = function() {
                return ("" + formerror["invalid"]).split("%title%").join(el.attr("title"));
            };

            numbers = cnpjNum.substr(0, 12);
            numbers += verifierDigit(numbers);
            numbers += verifierDigit(numbers);

            if (!cnpjNum || cnpjNum.length !== 14) return sendErr();
            if (numbers.substr(-2) !== cnpjNum.substr(-2)) return sendErr();

            return true;
        },
        ukPostCheck: function(el) {

            if (!!el.data('validCountryTarget')) {
                var selectedCountry = $('[name=' + el.data('validCountryTarget') + ']').val();
                if (selectedCountry != 'GB') return true;
            } else {
                if (this.el.country.value != 'GB') return true;
            }
            /* LGEUK-1423 20170220 modify */
            var rege = /^[A-Za-z0-9]{1,4}\s{1}[A-Za-z0-9]{3}$/;            
            if (rege.test(el.val())) {
                return true
            } else {
                return ("" + formerror["invalid"]).split("%title%").join(el.attr("title"))
            }
            /*for (var b = "[ABCDEFGHIJKLMNOPRSTUWYZ]",
                    c = "[ABCDEFGHKLMNOPQRSTUVWXY]",
                    d = "[ABCDEFGHJKPMNRSTUVWXY]",
                    e = "[ABEHMNPRVWXY]",
                    f = "[ABDEFGHJLNPQRSTUWXYZ]",
                    g = [new RegExp("^(" + b + "{1}" + c + "?[0-9]{1,2})(\\s*)([0-9]{1}" + f + "{2})$", "i"),
                        new RegExp("^(" + b + "{1}[0-9]{1}" + d + "{1})(\\s*)([0-9]{1}" + f + "{2})$", "i"),
                        new RegExp("^(" + b + "{1}" + c + "{1}?[0-9]{1}" + e + "{1})(\\s*)([0-9]{1}" + f + "{2})$", "i"),
                        new RegExp("^(BF1)(\\s*)([0-6]{1}[ABDEFGHJLNPQRST]{1}[ABDEFGHJLNPQRSTUWZYZ]{1})$", "i"),
                        /^(GIR)(\s*)(0AA)$/i, /^(BFPO)(\s*)([0-9]{1,4})$/i, /^(BFPO)(\s*)(c\/o\s*[0-9]{1,3})$/i,
                        /^([A-Z]{4})(\s*)(1ZZ)$/i,
                        /^(AI-2640)$/i
                    ],
                    h = 0; h < g.length; h++) {
                if (g[h].test(el.val())) {
                    return true
                } else {
                    return ("" + formerror["invalid"]).split("%title%").join(el.attr("title"))
                }
            }*/
            /*// LGEUK-1423 20170220 modify */
        },
        nlPostCheck: function(el) {
            var targetEl;
            if (!!el.data('validCountryTarget')) {
                targetEl = $('[name=' + el.data('validCountryTarget') + ']')[0];
            } else {
                targetEl = this.el.country;
            }

            if (targetEl.value == 'BE' || targetEl.value == false ) {
                var rege = /^[1-9]{1}[0-9]{3}$/i;
                if (rege.test(el.val())) {
                    return true;
                } else {
                    return "Geldig Postcode is verplicht."

                }
            } else if (targetEl.value == 'NL') {
                var rege = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i;
                if (rege.test(el.val())) {
                    return true;
                } else {
                    return "vul 4 cijfers gevolgd door een spatie en twee hoofdletters"
                }
            } else {

            }
        }, /*LGECI-2381 : 20160726 add*/
        caPostCheck: function(el) {
            var regexp = new RegExp(/^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i);
            var postal = el.val().toString().trim();

            if (regexp.test(postal.toString())) {
                return true;
            } else {
                if (el.data('valid-rule-msg')) {
                    return el.data('valid-rule-msg');
                } else {
                    return ("" + formerror["required"]).split("%title%").join(el.attr("title"));
                }
            }
        },/*//LGECI-2381 : 20160726 add*/
        imei: function(a) {
            /* LGESK-255, LGECZ-689 20160621 add */
            var etal = /^[0-9]{15}$/;
            var checkIMEI = $("input[name=checkIMEI]");

            if (!etal.test(a.val())) {
                checkIMEI.val("N");
                return true;
            }

            var sum = 0; var mul = 2; var l = 14;
            for (var i = 0; i < l; i++) {
                var digit = a.val().substring(l-i-1,l-i);
                var tp = parseInt(digit,10)*mul;
                if (tp >= 10)
                     sum += (tp % 10) +1;
                else
                     sum += tp;
                if (mul == 1)
                     mul++;
                else
                     mul--;
            }
            var chk = ((10 - (sum % 10)) % 10);
            if (chk != parseInt(a.val().substring(14,15),10)) {
                checkIMEI.val("N");
                return true;
            }

            checkIMEI.val("Y");
            return true;
            /* //LGESK-255, LGECZ-689 20160621 add */
        },
        /* LGEHU-1143 20170904 add */
        huMobile: function(a) {
            var b = /^[0-9|\+0-9]+$/;
            if (a.val() == "+36") {
            	return ("" + formerror["huMobile"]).split("%title%").join(a.attr("title"));
            } else if (b.test(a.val())) {
                return true
            } else {
                return ("" + formerror["huMobile"]).split("%title%").join(a.attr("title"));
            }
        },
        /* //LGEHU-1143 20170904 add */
        /* LGECI-2980 20170818 add */
        receipt: function(el) {
        	var etal = /^(CN|RN)+([A-Za-z0-9]{0,14}?)$/;
            var etal2 = /^[0-9]{15}$/;
            
            if (!etal.test(el.val().toUpperCase()) && !etal2.test(el.val().toUpperCase())) {               
            	return ("" + formerror["invalid"]).split("%title%").join(el.attr("title"))
            }
            return true;
        },
        /*// LGECI-2980 20170818 add */
		/* LGEBR-3598 : 20180319 add */
        brForgotPW: function(a) {
        	//email
            var b = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
            var n = /^\s*\d+\s*$/;
            var cpfFlagInput = a.closest("form").find("input[name=cpfFlag]");
            
            if (b.test(a.val()) || (!a.attr("required") && !a.is("[required]")) && (!a.val() || a.val() == a.attr("placeholder"))) {
            	cpfFlagInput.val("N");
                return true;
            } else if (!b.test(a.val())) {
            //cpf
            	var cpfNum = a.val().replace(/[^\d]/g, "");
            	var numbers, modulus, multiplied, tmp, mod;
                var verifierDigit, sendErr;
            	
            	verifierDigit = function(numbers) {
                    numbers = numbers.split("");
                    modulus = numbers.length + 1;
                    multiplied = [];
                    tmp = 0;

                    $.each(numbers, function(idx, number) {
                        multiplied.push(parseInt(number, 10) * (modulus - idx));
                    });

                    $.each(multiplied, function(idx, number) {
                        tmp += number;
                    });

                    mod = tmp % 11;
                    return (mod < 2 ? 0 : 11 - mod);
                };
                
                sendErr = function() {
                    return ("" + formerror["invalid"]).split("%title%").join(a.attr("title"));
                };
                
                numbers = cpfNum.substr(0, 9);
                numbers += verifierDigit(numbers);
                numbers += verifierDigit(numbers);

                if (cpfNum.length !== 11) {
                    return sendErr();
                }
                if (numbers.substr(-2) !== cpfNum.substr(-2)) return sendErr();
                
                cpfFlagInput.val("Y");
                return true;
            } else {
            	return ("" + formerror["invalid"]).split("%title%").join(a.attr("title"));
            }
            
        },/*//LGEBR-3598 : 20180319 add */
        emailCaptcha: function(a) {	/* LGECS-1283 20180713 add */   
        	var $thisForm = a.closest(".validateForm");
        	var errMsg = "";
        	if (a.closest(".validateForm").hasClass("addCaptchaEmail")) {
                $.ajax({
                    url: $thisForm.attr("data-captcha-url"),
                    type: $thisForm.attr("method"),
                    async: false,
                    data: {
                        "LBD_VCID_customizedCaptcha" : $("input[name=LBD_VCID_customizedCaptcha]").val(),
                        "getInstanceId" : $("input[name=getInstanceId]").val(),
                        "getCodeCollection" : $("input[name=getCodeCollection]").val(),
                        "captchaCodeTextBox" : $("input[name=captchaCodeTextBox]").val()
                    },
                    dataType: "json",
                    beforeSend: function() {
                    	$thisForm.addClass("process")
                    },
                    success: function(data) {
                        if (data.result) {
                        	$thisForm.addClass("success");
                        } else if (data.error) {
                        	$thisForm.removeClass("success");
                        	errMsg = data.error.captchaCodeTextBox;
                        }
                    },
                    complete: function(data) {
                    	$thisForm.removeClass("process");
                    }
                })
                if ($thisForm.hasClass("success")) {
                    return true;  
                } else {
                	$("#customizedCaptcha_ReloadLink").trigger("click");
                    return ("" + errMsg);
                }
            }        	
        },	/*//LGECS-1283 20180713 add */
        /* LGEIS-2466 20190108 add */
        keywordCheck : function(a){
        	var keyword = $('input[name=keyword]');
        	if(keyword.val() == null){
        		return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
        	}else if(keyword.val() != a.val()){
        		return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
        	}else{
        		return true;
        	}
        }
        /*// LGEIS-2466 20190108 add */
        
    };

    proto.selectList = function() {
        var self = this;

        $(self.options.selectList, self.$el).bind("change", function() {
            var _this = $(this);

            _this.each(function() {
                if (_this.prop("checked") == true) {
                    var valCheck = _this.data("selected").split(":");

                    if ($(valCheck[0]).length) {
                        $(valCheck[1]).slideUp();
                        $(valCheck[0]).slideDown();

                        $(valCheck[0]).find('[data-checked]').bind('change', function() {
                            var targetContent = $(this).data('checked');
                            var checkResult = $(this).prop("checked") ? false : true;
                            $('[name="' + targetContent + '"]', valCheck[0]).attr('disabled', checkResult);
                        })
                    } else {
                        $(valCheck[1]).slideUp();
                        $(valCheck[0]).slideDown();
                    }
                }
            })
        })
    };

    jQuery.prototype.visibleControll = function(frm, type) {
        // select.visibleControll (selectbox, show/hide)
        //  - option[target] -> span[rel]
        // ul.visibleControll (radio, enable/disable)
        //  - li > input.vc-item[target] -> input[rel]
        var _frm = frm;
        var _this = $(this);
        var _type = type;
        var _reserve = _this.data('reserve') || false;
        var optionItems = (_type == 'permitted') ? $('.vc-item', _this) : $('option[data-target]', _this);
        var selectedItem = optionItems.filter(":selected, :checked");
        var selectedTarget = selectedItem.data("target");

        optionItems.each(function() {
            var thisTarget = $(this).data("target");
            var $thisEl = $('[rel="' + thisTarget + '"]', _frm);
            var $thisRmEl = $('[remove-target="' + thisTarget + '"]', _frm);

            if (thisTarget == selectedTarget) {
                if (_type == "permitted") {
                    $thisEl.attr({
                        "disabled": _reserve,
                        "required": "required"
                    }).prop({
                        "disabled": _reserve,
                        "required": "required"
                    });
                    $thisRmEl.show().find('.checked').removeClass('checked').find("input").prop("checked", false);
                } else {
                    $thisEl.show();
                }
            } else {
                if (_type == "permitted") {
                    $thisEl.val('').attr({
                        "disabled": !_reserve,
                        "required": ""
                    }).prop({
                        "disabled": !_reserve,
                        "required": ""
                    });
                    $thisRmEl.hide();
                } else {
                    $thisEl.hide();
                }
            }
        })
    };

    jQuery.prototype.requireField = function(self) {
        var $this = $(this);
        var _field = $this.data("requireField");
        var $dep = $("[name='" + _field + "']", self.$el);

        var intv;

        $dep.bind("keyup change", function() {
            var _resetTarget = $this.closest("form").data("reset-target");
            $(_resetTarget).html(" ");
            clearTimeout(intv);
            intv = setTimeout(function() {
                $this.prop("disabled", $dep.val() ? false : true)
            }, 100);
            $this.val('')
        });
    };

    jQuery.prototype.modifyRule = function(self) {
        var $this = $(this);
        var visibleTarget = $this.data("modifyRuleVisible");
        var _field = $this.data("modifyRuleTarget");
        var $dep = $("[name='" + _field + "']", self.$el);

        if (visibleTarget) {
            if ($dep.is(":checked")) {
                $(visibleTarget).show();
            } else {
                $(visibleTarget).hide();
            }
        }

        $dep.bind("change", function() {
            if ($dep.is(":checked")) {
                $this.prop("required", true).attr("required", true);
                $(visibleTarget).show();
            } else {
                $this.removeProp("required").removeAttr("required");
                $(visibleTarget).hide();
            }
        });
    };

    jQuery.prototype.toggleField = function(self) {
        var $this = $(this);
        var $toggleTarget = $($this.data("toggleField"));

        var result = function() {
            if ($this.prop("checked")) {
                $toggleTarget.show();
                $this.attr('required', 'required');
            } else {
                $toggleTarget.hide();
                $this.attr('required', '');
            }
        };

        result();

        $this.on('change', function() {
            result();
        });

    };

    jQuery.prototype.either = function($el) {
        $(':input', $el).on('change', function(e) {
            var $this = $(e.target);
            var checkedValue = !$this.is(':checked') && $this.attr('off') == 'on';

            if (!$('[name='+$this.attr("name")+']:checked').length) {
                checkedValue = true;
            }

            $('[name='+$this.attr('rel')+']')
            .prop('checked', checkedValue)
            .parent().toggleClass('checked', checkedValue);
        });
    };

    jQuery.prototype.cep = function($el) {
        $.ajax({
            type: 'post',
            url: $el.data('url'),
            data: {
                zipCode: $el.val()
            },
            dataType: 'json',
            success: function(data) {
                if (!data.result) return;
                delete data.result;
                $.each(data, function(key, val) {
                    //$('[id="' + key + '"]').val(val).prop('readonly', true);
                    $('[id="' + key + '"]').val(val);
                });
            }
        });
    };

    jQuery.prototype.captchaInit = function() {
        toggleIcon($('#customizedCaptcha_SoundLink', this), '<i class="icon icon-speaker"></i>');
        toggleIcon($('#customizedCaptcha_ReloadLink', this), '<i class="icon icon-refresh"></i>');

        function toggleIcon($el, tag) {
            $el
                .prepend(tag)
                .find('img').css({
                    width: 0,
                    height: 0
                }).end()
                .css({
                    margin: '0',
                    visibility: 'visible'
                });
        }
        // check mobile
        if (!config.isMobile) return;

        // run only mobile
        $('#customizedCaptcha_CaptchaImageDiv', this).css({
            width: 'auto',
            height: '50px',
            background: '#dcdcdc',
            marginRight: '35px'
        });
        $('#customizedCaptcha', this).css({
            width: 'auto',
            height: 'auto',
            visibility: 'visible',
            textAlign: 'center'
        });
    };

    jQuery.prototype.radioSwitch = function() {
        $(this).on('change', function() {
            var $this = $(this);
            var isChecked = $this.is(':checked');
            if (isChecked) {
                var enableTarget = $this.data('enable-target').split(',');
                var disableTarget = $this.data('disable-target').split(',');

                $.each(enableTarget, function() {
                    var target = $.trim(this);
                    $this.closest('form').find(target).attr('disabled', false).val('');
                });

                $.each(disableTarget, function() {
                    var target = $.trim(this);
                    var $target = $this.closest('form').find(target);
                    if ($target.is(':checkbox') && $target.is(':checked')) {
                        if (!!$target.iCheck) {
                            $target.iCheck("uncheck").iCheck("update");
                        } else {
                            $target.get(0).checked = false;
                        }
                    }
                    $this.closest('form').find(target).attr('disabled', true).val('');
                });
            }
        });
    };

    jQuery.prototype.checkboxSwitch = function() {
        $('[data-check-enable-switch]').each(function() {
            $(this).on('change', function() {
                var $this = $(this);
                var enableTarget = $this.data('enable-target').split(',');
                var isChecked = $this.is(':checked');

                $.each(enableTarget, function() {
                    var target = $.trim(this);
                    if (isChecked) {
                        $this.closest('form').find(target).attr('disabled', false).val('');
                    } else {
                        $this.closest('form').find(target).attr('disabled', true).val('');
                    }
                });
            });
        });
    };

    jQuery.prototype.checkboxDisableSwitch = function() {
        $('[data-check-disable-switch]').each(function() {
            $(this).on('change', function() {
                var $this = $(this);
                var enableTarget = $this.data('disable-target').split(',');
                var isChecked = $this.is(':checked');

                $.each(enableTarget, function() {
                    var target = $.trim(this);
                    if (isChecked) {
                        $this.closest('form').find(target).attr('disabled', true).val('');
                    } else {
                        $this.closest('form').find(target).attr('disabled', false).val('');
                    }
                });
            });
        });
    };

    // Event constants
    var FORM_EVENT = {
        'AJAX_SUCCESS': 'form:ajax:success',
        'VALIDATE': 'form:validate',
        'VALIDATE_SUCCESS': 'form:validate:success',
        'VALIDATE_FAIL': 'form:validate:fail'
    };

    ic.jquery.plugin('Forms', Forms, '.validateForm');
    return Forms;

});
