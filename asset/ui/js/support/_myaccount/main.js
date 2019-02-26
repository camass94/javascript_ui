/**
 * The support myaccount module.
 * @module support/support.myaccount
 */

define(['support', 'global-config', 'cs/datepicker', 'cs/basicmotion', 'cs/btnActivation', 'slick-carousel', 'cs/btnBVreview', 'lazyload', 'cs/model-browser'], function(cs, config) {

    var openerEl = $(".btn-set-email");
    var callBackEl = $("#emailReceiveCheck");

    if (openerEl.length) {
        openerEl.bind($.modal.AJAX_COMPLETE, function() {
            var openerTarget = $("#communicationsPreferences");

            openerTarget.find("button[type='submit']").on("click", function(e) {
                e.preventDefault();
                var _this = $(this);

                $.ajax({
                    url: openerTarget.data("action"),
                    dataType: "json",
                    data: openerTarget.serialize(),
                    beforeSend: function() {
                        _this.spin(true);
                    },
                    success: function(data) {
                        if (data.result) {

                            if (openerTarget.find("input[type='checkbox']:checked").length > 0) {
                                callBackEl.iCheck("check");
                            } else {
                                callBackEl.iCheck("uncheck");
                            }

                            $.modal.close();

                        } else {
                            $.modal.close();
                        }
                    },
                    complete: function(data) {
                        _this.spin(true).spin(false)
                    },
                    error: function(xhr, textStatus) {
                        modalAlert(textStatus)
                    }
                });

            })
        });
    }

    var $isEnoughInfo = $('input[name="isEnoughInfo"]');

    if ($isEnoughInfo.length && $isEnoughInfo.val() == 'false') {
        getMoreInformation();
    }

    function getMoreInformation() {
        var msg = $('input[name="lackMessage"]').val();
        var _url = $('input[name="lackUrl"]').val();
        modalAlert(msg, true, _url).on("modal:close", function() {location.href = _url;});
    }

    var register = $("#registerProduct");
    var activeColumn = register.find(".two-column").eq(0);
    var activeCategory = "active-category";
    var focusCategory = "focus-category";
    var focusNumber = "focus-number";
    var modelLink = register.find(".warranty-info");
    var modelSelector = register.find(".model-select");
    var modelDetail = register.find(".selected-product");
    var selectModel = register.find(".info-wrap .model-name");
    var selectImg = register.find(".product-image");
    var selectWarranty = register.find(".info");
    var warrantyInfo = register.find(".info, .warranty");
    var viewClose = register.find(".afterbtn");
    var modelNum = register.find(".model-number");
    var keywordSelect = register.find(".search-model-number");
    var keyword = register.find(".model-selector input[type='text']");
    var keywordVerify = modelNum.find(".model-verify");
    var purchaseInfo = register.find("#purchaseInfo");
    var submitBtn = register.find("button.btn[type='submit']");
    var $form = register.find(".validateForm");

    purchaseInfo.prop("disabled", false);
    $("select, :input", purchaseInfo).prop("disabled", true);

    function modelSelect(el, e) {
        if (e) e.preventDefault();
        if (el == modelSelector) {
            openAction(el);
        }
    }

    $form.on('modelBrowser:setDetail', activation);
    $form.on('modelBrowser:selectedModel.select', deActivation);
    $form.on('modelBrowser:selectedModel.search', deActivation);
    $form.on('modelBrowser:selectedModel.select:error', deActivation);
    $form.on('modelBrowser:selectedModel.search:error', deActivation);
    $form.on('modelBrowser:deselectModel.select', deActivation);
    $form.on('modelBrowser:deselectModel.search', deActivation);
    $form.on('submit', submitHandler);


    function openAction(el) {
        var $this = $(el);
        if ($this.hasClass("model-select")) {
            $(activeColumn, register).addClass(activeCategory);
            var horw = (config.isMobile ? {
                "height": "260px"
            } : {
                "width": "100%"
            });
            $(modelDetail, register).stop().animate(horw, 200, function() {
                $(modelNum, register).hide();
                activation(el);
            });
            if (config.isMobile) $(modelNum, register).stop().slideUp(200);
        } else {
            var horw = (config.isMobile ? {
                "height": "0px"
            } : {
                "width": "0%"
            });
            $(modelNum, register).show();
            $(modelDetail, register).stop().animate(horw, 200, function() {
                $(activeColumn, register).removeClass(activeCategory);
            });
            if (config.isMobile) $(modelNum, register).stop().slideDown(200);
        }
    }

    function verifyModel(el, e) {

        var $this = $(el);
        var isSelector = (el == modelSelector[0]);

        if ($this.val()) {
            if (!isSelector) keywordSelect.spin(true);
            keyword.removeClass("error");
            $.ajax({
                url: $this.data("url"),
                data: XSSfilters($this.closest("form").serializeArray()),
                dataType: "json",
                success: function(data) {
                    if (isSelector) {
                        activation();
                        register.data("selectedModel", true);
                        setDetail(data, $this);
                    } else {
                        keywordSelect.spin(false);
                        if (data.errorMsg) {
                            deActivation();
                            keywordVerify.removeClass("pass").addClass("fail");
                            register.data("selectedModel", false);
                            keywordError(data.errorMsg);
                        } else {
                            activation();
                            _satellite.track('my-account-register-enter-model');
                            keywordVerify.removeClass("fail").addClass("pass");
                            register.data("selectedModel", true);
                        }
                    }
                },
                error: function(xhr, textStatus) {
                    deActivation();
                    keywordSelect.spin(false);
                    register.data("selectedModel", false);
                    modalAlert(textStatus);
                    viewCloser();
                }
            });
            modelSelect(this, e);
        } else {
            deActivation();

            keywordSelect.spin(false);
            register.data("selectedModel", false);

            if (isSelector) {
                viewCloser();
            } else {
                keywordError(formerror.required.split("%title%").join(keyword.attr("title")))
            }

        }
    }

    function keywordError(msg) {
        keyword.addClass("error").siblings("span.msg-error").css({
            bottom: keyword.outerHeight(true) + 5
        }).html("<i class='icon icon-error'></i>" + msg).parent("span").css({
            "position": "relative",
            "display": "block"
        });
        keyword.trigger("select")
    }

    function setDetail(data, el) {
        var $this = el;

        modelLink.attr('href', data.link);
        selectModel.text(data.modelName);
        selectImg.attr('src', data.imageUrl);
        selectImg.attr("data-original", data.imageUrl);

        if (data.warrantyInfoLabor) {
            warrantyInfo.show();
            selectWarranty.find(".warranty-info-labor").text(data.warrantyInfoLabor);
            selectWarranty.find(".warranty-info-parts").text(data.warrantyInfoParts);
        } else {
            warrantyInfo.hide();
        }

        if (data['visible']) {
            for (var cls in data['visible']) {
                $(data['visible'][cls], register).show();
            }
        }

        if (data['hidden']) {
            for (var cls in data['hidden']) {
                $(data['hidden'][cls], register).hide();
            }
        }

        if ($this.hasClass("model-select")) {
            $(activeColumn, register).addClass(activeCategory);
            var horw = (config.isMobile ? {
                "height": "260px"
            } : {
                "width": "100%"
            });
            $(modelDetail, register).stop().animate(horw, 200, function() {
                $(modelNum, register).hide();
            });
            if (config.isMobile) $(modelNum, register).stop().slideUp(200);
        } else {
            var horw = (config.isMobile ? {
                "height": "0px"
            } : {
                "width": "0%"
            });
            $(modelNum, register).show();
            $(modelDetail, register).stop().animate(horw, 200, function() {
                $(activeColumn, register).removeClass(activeCategory);
            });
            if (config.isMobile) $(modelNum, register).stop().slideDown(200);
        }
    }

    keywordSelect.not("[disabled]").on("click", function(e) {
        e.preventDefault();
        verifyModel(keyword[0], e);
    });

    // function(e) {
    //     $(".select-product .selectbox", register).val('').removeProp("disabled").removeAttr("disabled").trigger("chosen:updated");
    //     modelSelect($(this));
    //     e.preventDefault();
    // })

    modelSelector.on("change chosen:updated.chosen", function(e) {
        keywordVerify.removeClass("pass fail");
        if ($(this).val()) {
            _satellite.track('my-account-register-select-model');
            verifyModel(this, e);
        }else {
            viewCloser();
        }
    });

    keyword.on("change", function(e) {
        keywordVerify.removeClass("pass fail");
        if (register.data('selectedModel')) {
            deActivation();
            register.data('selectedModel', false)
        }
    }).on("focusin", function(e) {
        modelNum.addClass("on")
    }).on("focusout", function(e) {
        modelNum.removeClass("on")
    });

    viewClose.bind("click", function(e) {
        e.preventDefault();
        modelSelector.val("").trigger("chosen:updated");
        register.data("selectedModel", false);
        viewCloser();
        deActivation();
    });

    function submitHandler(e) {
        e.preventDefault();
        var _this = $(this);
        var sendBV = function(data) {
            $BV.SI.trackTransactionPageView(data);
        };

        submitBtn.spin(true, {}, _submit);

        function _submit() {
            _this.ajaxSubmit({
                url: _this.data("action"),
                type: "post",
                // cache: false,
                async: false,
                dataType: "text",
                // contenttype: false,
                processData: true,
                timeout: 300000,
                success: function(data) {
                    data = data ? $.parseJSON(data) : data;
                    if (data.result) {
                        /*LGECS-729 20160704 modify*/
                        if (window.$BV && data.BVKey) {sendBV(data.BVKey);}

                        if(data.goUrl&& typeof(data.goUrl)!=="undefined"){
                            location.href = data.url;
                        }else{
                             modalAlert(data.message, true).on("modal:close", function() {location.href = data.url;});
                        }
                        /*//LGECS-729 20160704 modify*/
                    } else {
                        if(data.error){
                            if(typeof(data.error)==="object"){
                                var errs = [];
                                for (var f in data.error) {
                                    var target = $("form", register).length ? $("form", register)[0][f] : register.closest("form")[0][f];
                                    $(target).addClass("error").siblings("span.msg-error").css({
                                        bottom: $(target).outerHeight(true) + ($(target).is("[type='checkbox'],[type='radio']") ? 15 : 5)
                                    }).html("<i class='icon icon-error'></i>" + data.error[f]).parent("span").css({
                                        "position": "relative",
                                        "display": "block"
                                    });
                                    errs.push(target)
                                }
                                errs[0].focus();
                                submitBtn.spin(false);
                            }else{
                                errorAlert(data.error);
                            }
                        }else{
                            errorAlert("error");
                        }
                    }
                },
                error: function(xhr, errorText) {
                    errorAlert(errorText);
                }
            });
        }
    }

    function errorAlert(msg) {
        modalAlert(msg);
        submitBtn.spin(false);
    }

    function activation(el) {
        submitBtn.removeAttr("disabled");
        $('select, :input:not(.btn-cancel)', purchaseInfo).prop("disabled", false).trigger("chosen:updated");
    }

    function deActivation() {
        submitBtn.attr("disabled", true);
        $('select, :input:not(.btn-cancel)', purchaseInfo).prop("disabled", true).trigger("chosen:updated");
    }

    function viewCloser() {
        var afterFocusElm = $(activeColumn, register).find(".chosen-container").filter(":first");
        setTimeout(function() {
            var horw = (config.isMobile ? {
                "height": "0px"
            } : {
                "width": "0%"
            });
            $(modelNum, register).show();
            $(modelDetail, register).stop().animate(horw, 200, function() {
                $(activeColumn, register).removeClass(activeCategory);
            });
            if (config.isMobile) $(modelNum, register).stop().slideDown(200);
        }, 50);

        // accessibility
        afterFocusElm.addClass("chosen-container-active").find(".chosen-search input").focus();
        keyword.val("").siblings("span.msg-placeholder").show();
        selectImg.attr('src','');
    }

    if (modelSelector.val()) {
        modelSelect(modelSelector);
    }

    $('a[rel="modal:open"]', purchaseInfo).click(function(e) {
        e.preventDefault();
        $(this).modal();
    });

    $(".wrapper").on("click focus", "a, input, select", function(e) {
        if ($(this).parents(activeColumn).hasClass("choice-product")) {
            var targetParent = $(this).closest(".column");

            // Select category
            if (targetParent.hasClass("select-product")) {
                $(activeColumn, register).removeClass(focusNumber).addClass(focusCategory);
                keyword.removeProp("required").removeAttr("required");
                register.find(".selectbox").prop("required", true).attr("required", true);
            } else {
                // Keyword search
                $(activeColumn, register).removeClass(focusCategory).addClass(focusNumber);
                keyword.prop("required", true).attr("required", true);
                register.find(".selectbox").removeProp("required").removeAttr("required")
            }
        } else {
            $(activeColumn, register).removeClass(focusCategory, focusNumber);
        }

        if (activeColumn.hasClass(focusCategory)) {
            keyword.removeProp("required").removeAttr("required");
            register.find(".selectbox").prop("required", true).attr("required", true);
        }
    });

    /* LGECS-670 20161011 add */
    $(".reminder").on("click", "a.btn", function(e) {
        var reminder = $(this).parents("form.reminder");
        e.preventDefault();
        if ( $(this).hasClass("later") ){
            $.ajax({
                url: reminder.data("action"),
                dataType: "json",
                success: function(response){
                    if (response.result == true) {
                        location.href = $("input[name=loginSuccessUrl]").val();
                    }
                }
            });
        } else if ( $(this).hasClass("now") ) {
            reminder.submit();
        }
    });

    $(".btn-black.cancel").on("click", function(e) {
        e.preventDefault();
        $(this).parents("form").attr("action", $("input[name=cancelUrl]").val()).submit();
    });

    $(window).resize(function(){
        if ($(".wrapper.support").hasClass("change-password")) {
            $(".wrapper.support .modal-content").css({
                left: ($(window).width() - $(".wrapper.support .modal-content").innerWidth()) / 2,
                top: ($(window).height() - $(".wrapper.support .modal-content").outerHeight()) / 2
            });
        }
    });
    /* //LGECS-670 20161011 add */

    // if (!config.isMobile) $(".fb-area").find("input[type='number']").attr("type", "text").data("rule","number");
    //if (lg.locale == "/us" && $(".register-product").length) registerOnlyUS.init($(".register-product"));
    // what I'm returning here is "global" when you require this module

    /* PJTBTOBCSR-138 20161027 add */
    var componyInformation = $("fieldset.company-information");
    $(function() {
        if (componyInformation.length) {
            var $form = componyInformation.closest("form");
            var fields = $(":input:not('button'):not('[readonly]'):not('[type=hidden]')", componyInformation);
            var isBusinessMode = $("#businessMode").val() ? $("#businessMode").val().toString() === "true" : false;
            var requiredFields = componyInformation.find(":input[required]");

            if (isBusinessMode) {
                var isFirstEmpty = true;

                componyInformation.find('[do=toggle]').click();

                /* PJTBTOBCSR-251 20161122 modified */
                setTimeout(function () {
                    requiredFields.each(function (idx, el) {
                        var _el = $(el);
                        if (!_el.val() && isFirstEmpty) {
                            isFirstEmpty = false;
                            _el.hasClass('selectbox') ?
                                _el.siblings('.chosen-container').find(':input').focus() :
                                _el.focus();
                            $('html, body').scrollTop(_el.offset().top-50) //PJTBTOBCSR-251
                        }
                        return _el.attr("must-required", true);
                    });
                }, 300);
                /* /PJTBTOBCSR-251 20161122 modified */
            }

            $form.on("form:validated", function(e, count) {
                if (!count || requiredFields.index($form.find(":input.error").first()) == -1) return;

                !componyInformation.find('.item').hasClass('active') &&
                componyInformation.find('[do=toggle]').click() &&
                setTimeout(function() {
                    componyInformation.find('.error:eq(0)').focus();
                }, 300);
            });

            fields.on('change', function(e) {
                var result = false;
                fields.each(function(idx, field) {
                    if ($.trim(field.value)) {
                        result = true;
                        return false;
                    }
                });

                $("[name='hasCompanyInfo']", componyInformation).val(result);
            });
        }
    })
    /* //PJTBTOBCSR-138 20161027 add */
    
    /* PJTEUGDPR-1 20180122 add */
    function deleteCheck(_this){
    	if ($(".delete-history .btn-delete").hasClass("disabled")) {
    		$(".delete-history .btn-delete").removeClass("disabled")
		}
    	if (_this.prop("checked") == true) {
    		if (_this.closest("form").data("responseloc") == "repairList") {
    			_this.val(_this.closest("tbody").find(".link-line-in").data("post-value").customerClaimId)
    		} else if (_this.closest("form").data("responseloc") == "inquiryList") {
    			if (_this.closest("tbody").find(".link-line").length > 0) {
    				_this.val(_this.closest("tbody").find(".link-line").data("post-value").receiptNumber)
    			} else {
    				_this.val(_this.closest("tbody").find(".link-line-in").data("post-value").receiptNumber)
    			}
    		}
    	} else {
    		_this.val("");
    	}
    }
    
    $(document).on("change", ".delete-check input:checkbox", function(e){
    	deleteCheck($(this));
    });

    $(document).on("click", ".check-cover", function(e){
        var find_input = $(".delete-check input:checkbox");
        var check_action = $(".delete-check span.styled-checkbox");
        var check_all = $(".check-wrap span.styled-checkbox");
        
        if ($(".check-wrap span.styled-checkbox").hasClass("checked")) {
        	check_all.removeClass("checked");
            find_input.each(function(){
            	$(this).prop("checked", false);
            	$(this).parents(".delete-check").find("span.styled-checkbox").removeClass("checked");
    			deleteCheck($(this));
    		})
        } else {
        	check_all.addClass("checked");
            find_input.each(function(){
            	$(this).prop("checked", true);
            	$(this).parents(".delete-check").find("span.styled-checkbox").addClass("checked");
    			deleteCheck($(this));
    		})
        }
    });
    
    $(document).on("change", "#check-all", function(e) {
        $(".check-cover").trigger("click")
    });
    
    $(document).on("click", ".delete-history .btn-delete", function(e) {
        e.preventDefault();
        if ($(this).hasClass("disabled")) {
        	return
    	}
        var dataArray = [];
        $(".delete-check input:checked").each(function(d){
            dataArray.push($(this).val())
            //console.log(dataArray)
        });
		
        var checkNum = $("input[name=checkNum]");
        jQuery.unique(dataArray);
        //alert(dataArray)
        checkNum.val(dataArray.join(','))
        $.ajax({
            url: $(".delete-history").attr("data-delete-url"),
            type: "post",
            dataType: "json",
            data: {
            	"checkNum": checkNum.val(),
            	"requestVerificationToken": $("input[name=requestVerificationToken]").val()
            },
            success: function(response) {
            	if (response.result == true && response.goUrl) {
            		location.href=response.url;
            	} else if (response.result == true && !response.goUrl) {
            		window.location.reload(true);
            	} else if (response.result == false) {
                    alert($("input[name=gdrp-error-msg]").val())
                    window.location.reload(true)
            	}
            }, error: function(response) {
                alert($("input[name=gdrp-error-msg]").val())
                window.location.reload(true)
            }
        })
    });
    
    var gdrpForm = $(".gdrp-submit");
    var gdrpSubmit = gdrpForm.find(".btn-area .btn");
    gdrpForm.find("input[type=checkbox]").on("change", function(e){
        if (gdrpSubmit.hasClass("disabled")) {
        	gdrpSubmit.removeClass("disabled");
        }
    });
    
    gdrpForm.find("input[type=checkbox]").on("focusin", function(e) {
        $(this).parent("span").addClass("focus");
    });
    
    gdrpForm.find("input[type=checkbox]").on("focusout", function(e) {
        $(this).parent("span").removeClass("focus");
    });
    
    gdrpSubmit.on("click", function(e) {
    	e.preventDefault();
    	if ($(this).hasClass("disabled")) {
    		return
		}
        $.ajax({
            url: gdrpForm.attr("data-action"),
            type: "post",
            dataType: "json",
            data: gdrpForm.serialize(),
            success: function(response) {
            	if (response.result == true && response.goUrl) {
            		location.href=response.url;
            	} else if (response.result == true && !response.goUrl) {
            		window.location.reload(true);
            	} else if (response.result == false) {
                    alert($("input[name=gdrp-error-msg]").val());
                    window.location.reload(true);
            	}
            }, error: function(response) {
                alert($("input[name=gdrp-error-msg]").val());
                window.location.reload(true);
            }
        })
    })
    /*//PJTEUGDPR-1 20180122 add */
    

    return {};
});
