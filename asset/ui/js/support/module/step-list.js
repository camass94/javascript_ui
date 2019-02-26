define(['jquery', 'ic/ic', 'ic/ui/module', 'cs/tabpanel', 'cs/ajaxform', 'cs/styledform', 'global-config'], function($, ic, Module, Tabpanel, Forms, styledForm, config) {

    var Steplist = function(el, options) {
        var self = this;
        var element = el;
        var editIdx = 0;
        var diff = 0;
        var downNow = 0;
        var defaults = {
            stepTarget: null,
            stepIndex: null,
            stepWrap: '.step',
            stepContent: '.step-content',
            async: false
        };

        Steplist.superclass.constructor.call(self, el, options);
        self.options = $.extend(defaults, self.options);

        var countryCode = lgFilter.locale;
        // .step-list data-product-select-reset option flag 
        var isProductSelectReset = !!$('.step-list.schedule-repair').data('productSelectReset');

        var stepContent = $('article.step:visible .step-content');
        var stepWrap = $('article.step:visible');
        var reviewEl = $("article.step:visible .step-review");
        var dmsAble = $("article.step:visible .dmsAble");
        var dmsAvailable = $("article.step:visible .dmsAvailable");
        var $submitModal = $('#reviewRepair');

        init();

        function init() {
            var _this = $(el);

            // load
            /*LGEAU-2708 20181120 add*/
            stepWrap.eq(0).not(".not-slideDown").addClass("active done").find(">.container").slideDown();
            if (stepWrap.eq(0).hasClass('not-slideDown')) {
            	var obj = stepWrap.eq(0);
                var param = obj.find("form").serializeArray();
                var addParam = {};
                var submitBtn = obj.find("[type='submit']");
                
	            submitBtn.spin(true);
	
	            $.ajax({
	                url: obj.data("url"),
	                data: XSSfilters($.merge(param, addParam)),
	                dataType: "json",
	                success: function(data) {
                        if (data.error) {
                            alert(data.error.caseNumber);
                            obj.find(".edit-btn").trigger("click");
                            $("#caseNumber").val("").focus();
                            $(window).scrollTop(obj.offset().top);
                        }
	                },
	                complete: function(data) {
	                    submitBtn.spin(false);
	                },
	                error: function(xhr, msg) {
	                    modalAlert(msg);
	                    submitBtn.spin(false);
	                }
	            }); 
            }
            /*//LGEAU-2708 20181120 add*/

            // Submit
            $('.step-list > article.step').each(function(idx) {
                $(this).find('form').on('submit', function(e) {
                    e.preventDefault();
                    var index = $('.step-list > article.step:visible').index($(this).closest('article'));
                    stepSubmit(index);
                });
            });


            // Edit
            _this.find(".edit-btn").on("click", function(e) {
                var current = $('article.step:visible').index($(this).closest('article.step'));
                e.preventDefault();

                if ($(el).hasClass("document-attachment")) {
                    var isfile = false;
                    $("input[type='file']").each(function() {
                        if ($(this).val()) {
                            isfile = true;
                        }
                    });
                    if (isfile) {
                        $("#caseNumberEdit").modal();
                        $("#caseNumberEdit [type='submit'].btn").on("click", function() {
                            $("input[type='file']").each(function() {
                                $(this).val("");
                                $(this).siblings("input").val("");
                            });
                            $.modal.close();
                            stepEditStart(current, editIdx);
                        });
                    } else {
                        stepEditStart(current, editIdx);
                    }
                } else {
                    stepEditStart(current, editIdx);
                }
            });

            // step04 edit
            _this.find(".edit-step04").on("click", function(e) {
                e.preventDefault();
                var current = $('article.step:visible').index($(this).closest('article.step'));
                $("article.step:visible .step-review").hide();
                stepChange(current, current - 1);
            });

            zipcodeSearch();
            
            $(document).on('click', '[rel="stepList:submit"]', function(event) {
                event.preventDefault();
                //LGEIS-2099 : 20161006 add Start
                if(_this.find(".email-appointment") && !$("#productCheck").is(":checked") && _this.find(".model-searchbox").css("display") == "block"){
                	var _input = $(this).parents("form").find("[name=keyword]");
                    if (_input.val() == "") {
                    	_input.closest("div").find("input[name=search]").addClass("error").trigger("focus").siblings("span.msg-error").css({
                            bottom: _input.closest("div").find("input[name=search]").outerHeight(true) + 5
                        }).html("<i class='icon icon-error'></i>" + _input.closest("div").find("input[name=search]").data("validModelMsg")).parent("span").css("position", "relative");
                        return false;
                    } else {
                        _input.removeClass("error");
                        self.submit();
                    }
                } else {
                	self.submit();
                }
              //LGEIS-2099 : 20161006 add End
            });


            // step02  reset after tip modal close
            $(document).on('click', '.close-modal', function(event) {
                var modalTitle = $(".modal-title").text();
                $(".selectbox[name='helpfulArticles']").val("").trigger("chosen:updated");
            });


            // Product select step reset
            $(function() {
                if (isProductSelectReset) {
                    var productSelectStep = $('.step-list > article.step:visible').eq(0);
                    $('.choice-product .select-product [name=categoryId]').on('change.stepReset', function() {
                        stepReset(productSelectStep);
                    });
                }

            });

            // model browser set model detail handler
            $('.product-choice form:eq(0)').on('modelBrowser:setDetail', function(e, modelData) {
                var $resultAnchor = $(this).find('.step-result .warranty-info');
                var $warrantyInfoSpan = $resultAnchor.find('.info-list > span.list').first();

                $resultAnchor.attr('href', modelData.link);
                $resultAnchor.find('.product-image').attr('src', modelData.imageUrl);
                $resultAnchor.find('.model-name').text(modelData.modelName);

                if (!!modelData.warrantyInfoLabor) {
                    $resultAnchor.find('.warranty-info-labor').text(modelData.warrantyInfoLabor);
                    $resultAnchor.find('.warranty-info-parts').text(modelData.warrantyInfoParts);
                    $warrantyInfoSpan.show();
                } else {
                    $resultAnchor.find('.warranty-info-labor').text('');
                    $resultAnchor.find('.warranty-info-parts').text('');
                    $warrantyInfoSpan.hide();
                }
            });

            // Repair Type -> Non Real Service -> Select Reservation Date and Time
            $(function() {
                var $nonRealDatepickerInput = $('.repair-service-type').find('.date-choice [data-provide=datepicker]');
                $nonRealDatepickerInput.each(function() {
                    $(this).on('change', function() {
                        var targetSelector = $(this).data('target');
                        if (!config.isMobile) {
                            $('[name=' + targetSelector + ']').prop('disabled', false).attr('disabled', false).data().chosen.search_field_disabled();
                        } else {
                            $('[name=' + targetSelector + ']').prop('disabled', false).attr('disabled', false);
                        }

                        $('[name=' + targetSelector + ']').attr('required', 'required');

                    });
                });

                $('.repair-service-type').find('.date-choice').each(function() {
                    var self = $(this);
                    $(this).find('.selectbox').eq(0).on('change', function() {
                        self.find('[data-provide=datepicker]').attr('disabled', false);
                    });
                });
            });

        }

        function stepChange(current, next, data) {
            var currentStep = $('.step-list > article.step:visible').eq(current);
            var upNow = currentStep.height();
            var _this = $('.step-list > article.step:visible').length == next ? $('.step.step-review') : $('.step-list > article.step:visible').eq(next);
            var repairType = _this.find("[data-tabs='repairType']");

            if (data) {
                for (var key in data) {

                    if (key == "tab") {
                        for (var keyname in data[key]) {
                            var tabEl = $(".tabs[data-tabs='" + keyname + "']", element);
                            var tabChild = tabEl.children("li");

                            var idx = 0;
                            var tabArray = data[key][keyname];

                            tabChild.each(function() {
                                $(this).removeAttr("class");
                                if ($.inArray($(this).data(keyname), tabArray) > -1) {
                                    //idx += 1;
                                    //console.log("keyname : ", $(this).data(keyname))
                                    //$(this).addClass("tab" + ("00" + idx).substr(idx.toString().length)).filter(".tab01").addClass("active")
                                    //    .children('.tab-panel').show();

                                } else {
                                    $(this).addClass("hide").children('.tab-panel').hide();
                                }

                            });

                            tabChild.not('.hide').eq(0).children('a[data-tab]').trigger('click');
                        }

                    } else if (key != "result") {

                        var field = _this.find("form")[0][key] || $("[name='" + key + "']", element)[0];
                        if (typeof field !== "undefined") {
                            switch (field.tagName) {
                                case "SELECT":
                                    if ($(field).length > 0) {
                                        for (var i = field.options.length - 1; i >= 0; i--) {
                                            if (field[i].value != "" && field[i].text != "") field.remove(i);
                                        }
                                    }
                                    for (var opt in data[key]) {
                                        var option = document.createElement('option');
                                        option.value = opt;
                                        option.text = data[key][opt];
                                        field.add(option);
                                    }
                                    $(field).trigger("chosen:updated.chosen");
                                    break;
                                case "INPUT":

                                    break;
                            }
                        }

                    }

                    if (data['visible']) {
                        for (var cls in data['visible']) {
                            $(data['visible'][cls], _this.closest(".step-list")).show();
                        }
                    }

                    if (data['hidden']) {
                        for (var cls in data['hidden']) {
                            $(data['hidden'][cls], _this.closest(".step-list")).hide();
                        }
                    }

                }
            }

            currentStep.removeClass("active done").find($('.step-list > article.step:visible .step-content')).hide();
            _this.find("input,select,textarea").removeClass("error");

            if (_this.length) {
                _this.find($('.step-list > article.step:visible .step-content')).show();
                _this.addClass("active").removeClass("edit-able edit-before").find(">.container").delay(100).slideDown({
                    step: function(now) {
                        if (now != 0 && now < 10) {
                            downNow = now;
                            diff = _this.height() - (upNow + downNow);
                        }
                    },

                    complete: function() {
                        if (_this.hasClass('step-review')) {
                            $("html, body").stop().delay(100).animate({
                                scrollTop: currentStep.offset().top
                            });
                        } else {
                            $("html, body").stop().delay(100).animate({
                                scrollTop: $('.step-list > article.step:visible').index(_this) <= $('.step-list > article.step:visible').length - 1 ? _this.offset().top : _this.prev().offset().top
                            });
                        }


                        if (_this.find('.tabs').length > 0) {
                            _visible_idx = 0;
                            _this.find('.tabs > li').each(function() {
                                var _t = $(this);
                                if (_t.index() > -1 && !_t.hasClass('hide')) {
                                    _visible_idx++;
                                    _left = _t.find('a.tab').outerWidth() * _visible_idx - _t.find('a.tab').outerWidth() - (_visible_idx - 1);
                                    _t.find('a.tab').css('left', _left);
                                }
                            });
                        }

                        $(".selectbox", _this).each(function() {
                            $(this).filter(":not([data-width])").chosen("destroy").chosen("set_up_html");
                        })

                        _this.show().addClass("done")

                        var firstElement = _this.find("a:visible, input:not([disabled='disabled']), button, textarea, *[tabindex='0']").filter(':first');
                        firstElement = firstElement.hasClass('chosen-single') ? firstElement.parent().find('input') : firstElement;

                        if (repairType.length) {
                            $(repairType).find("> li.active a:first").focus();

                            $(repairType).find(".search-wrap").each(function() {
                                if ($(this).find("ul.chosen-results").find("li").length > 0)
                                    $(repairType).find(".selectbox").trigger("chosen:updated");

                            });
                        } else {
                            firstElement.focus();
                        }
                    }
                });

                stepEditable(current);
            }


        }

        function stepEditable(current) {
            var currentStep = $('.step-list > article.step:visible').eq(current);

            currentStep.addClass("edit-able edit-before");
            current = editIdx;
        }


        function stepEditStart(current, idx) {
            var currentStep = $('.step-list > article.step:visible').eq(current);
            var currentStepContent = currentStep.find($('article.step:visible .step-content'));
            var beforeCurrent = $('.step-list > article.step:visible').eq(idx);
            var repairType = currentStep.find("[data-tabs='repairType']");
            var focusField;
            var firstElement = currentStepContent.find("a:visible, input:not([disabled='disabled']), button, textarea, *[tabindex='0']").filter(':first');

            firstElement = firstElement.hasClass('chosen-single') ? firstElement.parent().find('input') : firstElement;

            // data reset
            if (current == 0 && !isProductSelectReset) {

                stepReset(current);

            } else {
                currentStep.removeClass("edit-able");
                if (current != idx) {
                    beforeCurrent.addClass("edit-before");
                }

                currentStep.siblings().each(function() {
                    if ($(this).hasClass("edit-before")) {
                        $(this).addClass("edit-able")
                    }
                })
            }

            currentStep.addClass("active done").find($('article.step:visible .step-content')).show();
            currentStep.siblings().removeClass("active done").find($('article.step:visible .step-content')).hide();
            currentStep.siblings().find("input,select,textarea").removeClass("error");

            if (repairType.length) {
                $(repairType).find("li.active a:first").focus();
            } else {
                var selectField = currentStep.find(".choice-product");
                if (current == 0 && selectField) {
                    if (selectField.hasClass("focus-category") || selectField.hasClass("active-category")) {
                        focusField = selectField.find(".select-product");
                        focusField.find("a:first").parent().find('input').focus();
                    } else if (selectField.hasClass("focus-number")) {
                        focusField = selectField.find(".model-selector");
                        focusField.find('input:first').focus();
                    }
                } else {
                    firstElement.focus();
                }
            }

            $("article.step:visible .step-review").hide();
        }

        function stepResult(current) {
            var currentStep = $('.step-list > article.step:visible').eq(current)
            var resultData = currentStep.find(".step-result");
            var target = resultData.find("[data-result]");
            var targetJoin = resultData.find("[data-result-join]");
            var targetName = [];

            var targetVal;

            var isRequestRepair = $(el).hasClass('schedule-repair');
            var isYourProductChoice = currentStep.hasClass("product-choice");
            var isProductSymtom = currentStep.hasClass("product-symptom");
            var isRepairType = currentStep.hasClass("repair-service-type");
            var isContactInformation = currentStep.hasClass("contact-information");


            target.each(function() {
                var _this = $(this);

                var targetNames = currentStep.find("[name='" + _this.data("result") + "']");

                targetNames.each(function(i) {
                    // Only Active PurchaseInfo
                    var isPurchaseInput = $(this).closest('[id^=purchaseInfoType]').length ? true : false;
                    if (isPurchaseInput && isRequestRepair) {
                        if ($(this).closest('[id^=purchaseInfoType]').hasClass('active')) {
                            targetName = $(this)[0];
                            if (targetName.value != '') {
                                _this.closest('span.list').show();
                            } else {
                                _this.closest('span.list').hide();
                            }
                        } else {
                            targetName = false;
                            if (targetNames.length == 1) {
                                _this.closest('span.list').hide();
                            }
                        }
                    } else if (isContactInformation && isRequestRepair) {
                        if ($(this).closest('form.validateForm').hasClass('active')) {
                            targetName = $(this)[0];
                        } else {
                            targetName = false;
                        }
                    } else {
                        targetName = $(this)[0];
                    }

                    if ($(targetName).is(':input')) {
                        if (targetName.tagName == "SELECT") {
                            targetVal = $(targetName).find("option:selected:not(':disabled')").text();
                        } else if (targetName.tagName == "TEXTAREA") {
                            targetVal = $(targetName).val().replace(/\n/g, "<br>");

                        } else {
                            targetVal = XSSfilter(targetName.value);
                        }
                    } else {
                        targetVal = "";
                    }

                    if (targetVal.length) {
                    	/* LGECI-3078 20171228 add */
                    	if (lgFilter.locale == "/ca_en" || lgFilter.locale == "/ca_fr") {
                            if (targetVal.indexOf("CNN") != -1) {
                                $("span.cnn").removeClass("hidden");
                                $("span.rnn").addClass("hidden");
                            } else {
                                $("span.rnn").removeClass("hidden");
                                $("span.cnn").addClass("hidden");
                            }                    		
                    	}
                    	/* LGECI-3078 20171228 add */
                        _this.html(targetVal);
                    }
                });

            });

            targetJoin.each(function(idx) {
                var _this = $(this);
                var joinName = '';

                targetName = _this.data("result-join").split("/");

                for (var i = 0; i <= targetName.length - 1; i++) {
                    var tagName;
                    if (isContactInformation && isRequestRepair) {
                        tagName = currentStep.find("form.active [name='" + targetName[i] + "']")[0];
                    } else {
                        tagName = currentStep.find("[name='" + targetName[i] + "']")[0];
                    }

                    if ($(tagName).is(':input')) {
                        if (tagName.tagName == "SELECT") {
                            targetVal = $(tagName).find("option:selected").text() + " ";
                        } else {
                            targetVal = XSSfilter(tagName.value) + " ";
                        }

                        joinName += targetVal;
                    }
                }

                _this.html(joinName);
            });

            // Repair Service result
            if (isRepairType && isRequestRepair) {
                var activeTab = $("[data-tabs='repairType'] > li.active");
                var serviceText = activeTab.children('.tab').children().text();
                var serviceId = activeTab.children('article').children('div').attr('id');
                var warrantyTypeId = activeTab.find('.warranty-type').attr('id');

                // Ship in Service
                if (serviceId == "shipInService") {
                    var result = '<dl><dt>' + serviceText + '</dt></dl>';
                    resultData.find('.inner').html(result);
                }

                // On site Service
                if (serviceId == "onSiteService") {
                    // real
                    if (warrantyTypeId == "realonSite") {
                        var warrantyBox = activeTab.find('.warranty-type');
                        var selectedCenter = warrantyBox.find('.center-list').find('.center-radio-select:checked');
                        var selectedDateTimes = warrantyBox.find('.select-reservation select');
                        var selectedDates = selectedDateTimes.filter(':even');
                        var selectedTimes = selectedDateTimes.filter(':odd');

                        var result = '';
                        if (selectedDates.find('option:selected').text() == '') {
                            result = '<dl><dt>' + serviceText + '</dt></dl>';
                        } else {
                            result = '<dl><dt>' + serviceText + ' &gt; </dt>';
                            result += '<dd>' + selectedDates.find('option:selected').text() + ' &gt; </dd>';
                            result += '<dd>' + selectedTimes.find('option:selected').text() + '</dd>';
                            result += '</dl>';
                        }

                        resultData.find('.inner').html(result);
                    }

                    // non real
                    if (warrantyTypeId == "nonRealonSite") {
                        var warrantyBox = activeTab.find('.warranty-type');
                        var selectedDates = warrantyBox.find('.date-choice .two-column input.text');
                        var selectedTimes = warrantyBox.find('.date-choice .two-column select');

                        var result = '<dl><dt>' + serviceText + ' &gt; </dt><dd>';

                        $.each(selectedDates, function(idx) {
                            if ($(this).val().length == 0) {
                                return;
                            }
                            result += $(this).val() + ' &gt;';
                            result += selectedTimes.eq(idx).find('option:selected').text();
                            if (idx != selectedDates.length - 1) {
                                result += '<br>';
                            }
                        });

                        result += '</dd></dl>';

                        resultData.find('.inner').html(result);
                    }

                }

                // carry in service
                if (serviceId == "carryInService") {
                    var selectedCenter = activeTab.find('.center-list').find('.center-radio-select:checked');
                    var selectedDateTimes = activeTab.find('.select-reservation select');
                    var selectedDates = selectedDateTimes.filter(':even');
                    var selectedTimes = selectedDateTimes.filter(':odd');

                    var result = '<dl><dt>' + serviceText + ' &gt; </dt>';
                    result += '<dd>' + selectedDates.find('option:selected').text() + ' &gt; </dd>';
                    result += '<dd>' + selectedTimes.find('option:selected').text() + '</dd>';
                    result += '</dl>';

                    resultData.find('.inner').html(result);

                }

                // Installation Service
                if (serviceId == "installationService") {
                    // real
                    if (warrantyTypeId == "realInstallation") {
                        var warrantyBox = activeTab.find('.warranty-type');
                        var selectedCenter = warrantyBox.find('.center-list').find('.center-radio-select:checked');
                        var selectedDateTimes = warrantyBox.find('.select-reservation select');
                        var selectedDates = selectedDateTimes.filter(':even');
                        var selectedTimes = selectedDateTimes.filter(':odd');

                        var result = '';
                        if (selectedDates.find('option:selected').text() == '') {
                            result = '<dl><dt>' + serviceText + '</dt></dl>';
                        } else {
                            result = '<dl><dt>' + serviceText + ' &gt; </dt>';
                            result += '<dd>' + selectedDates.find('option:selected').text() + ' &gt; </dd>';
                            result += '<dd>' + selectedTimes.find('option:selected').text() + '</dd>';
                            result += '</dl>';
                        }

                        resultData.find('.inner').html(result);
                    }

                    // non real
                    if (warrantyTypeId == "nonRealInstallation") {
                        var warrantyBox = activeTab.find('.warranty-type');
                        var selectedDates = warrantyBox.find('.date-choice .two-column input.text');
                        var selectedTimes = warrantyBox.find('.date-choice .two-column select');

                        var result = '<dl><dt>' + serviceText + ' &gt; </dt><dd>';

                        $.each(selectedDates, function(idx) {
                            if ($(this).val().length == 0) {
                                return;
                            }
                            result += $(this).val() + ' &gt;';
                            result += selectedTimes.eq(idx).find('option:selected').text();
                            if (idx != selectedDates.length - 1) {
                                result += '<br>';
                            }
                        });

                        result += '</dd></dl>';

                        resultData.find('.inner').html(result);
                    }
                }

            }

        }






        function stepSubmit(current) {
            var obj = $('.step-list > article.step:visible').eq(current);
            var repairType = obj.find("[data-tabs='repairType']");
            var param = obj.find("form").serializeArray();
            var formEl = obj.find("form");
            var addParam = (formEl.data("dependency") ? $(formEl.data("dependency")).find("form").serializeArray() : {});
            var submitBtn = obj.find("[type='submit']");
            var input = $("#zip-code", element);
            var keyword = obj.find(".model-selector input[type='text']");

            var isRequestRepair = $(el).hasClass('schedule-repair');
            var isRepairType = obj.hasClass("repair-service-type");

            // BR policy option
            var hasPolicyAgree = $('#policypopbr').length ? true : false;
            var isAgree = true;
            // BR policy option open layer
            if (current == 0 && hasPolicyAgree) {
                var purchaseDay = $('[id^=purchaseInfoType].active [name=purchasedDate]').data('startdate');
                isAgree = $('#policypopbr').data('policyAgree') == true ? true : false;
                if (!isAgree) {
                    $('#policypopbr').on('modal:ajax:complete', function(e, modal) {
                        var $modal = $(modal);
                        var $closeBtn = $modal.find('[rel="modal:close"]');

                        $modal.find('#brpopform [type=submit]').on('click', function(e) {
                            e.preventDefault();
                            var isChecked = $modal.find('#readPolicy').is(':checked');
                            if (isChecked) {
                                $closeBtn.trigger('click');
                            }
                        });

                        $modal.on('modal:before-close', function() {
                            var isChecked = $modal.find('#readPolicy').is(':checked');
                            if (isChecked) {
                                $('#policypopbr').data('policyAgree', true);
                                stepSubmit(current);
                            }
                        });
                    });
                    if (purchaseDay == '-457d') {
                        var url = $('#policypopbr').data('popExtend');
                        $('#policypopbr').attr('href', url);
                    } else if (purchaseDay == '-367d') {
                        var url = $('#policypopbr').data('popUrl');
                        $('#policypopbr').attr('href', url);
                    }
                    $('#policypopbr').modal();
                    return;
                }
            }

            if (current == 0 && keyword.length) {
                if (!obj.data("selectedModel")) {
                    keyword.addClass("error").trigger("focus").siblings("span.msg-error").css({
                        bottom: keyword.outerHeight(true) + (keyword.is("[type='checkbox'],[type='radio']") ? 15 : 5)
                    }).html("<i class='icon icon-error'></i>" + keyword.data("validModelMsg")).parent("span").css("position", "relative");
                    return false
                }
            }

            /* LGEGMO-1839 start */
            if ($('.model-browser').length) {
            	
                if (!$('.model-browser').hasClass('open')) {
                    $('#keyword').addClass("error").trigger("focus").siblings("span.msg-error").css({
                        bottom: $('#keyword').outerHeight(true) + ($('#keyword').is("[type='checkbox'],[type='radio']") ? 15 : 5)
                    }).html("<i class='icon icon-error'></i>" + $('#keyword').data("validModelMsg")).parent("span").css("position", "relative");
                    return false;
                }
            }
            /* LGEGMO-1839 end */

            if (repairType.length) {
                if (input.is(":visible") && input.length && !input.data("searchZipCode")) {
                    input.addClass("error").trigger("focus").siblings("span.msg-error").css({
                        bottom: input.outerHeight(true) + 5
                    }).html("<i class='icon icon-error'></i>" + input.data("validZipcodeMsg")).parent("span").css("position", "relative");

                    return false
                }

                var hiddenTarget = repairType.find("li.active").data("repair-type");
                var target = $(".view-content");

                $('.contact-information').find(target).each(function() {
                    if ($(this).hasClass(hiddenTarget)) {
                        $('.contact-information').find(target).hide();
                        $(this).show();
                    }
                })
            }


            if (isRepairType && isRequestRepair) {

                var repairTypeActive = $("[data-tabs='repairType'] > li.active");
                var repairTypeName = repairTypeActive.data('repair-type');

                //radio checked validation
                var hasRadio = repairTypeActive.find('.warranty-type:visible').find('.dmsAble:visible [type=radio]').length > 0 ? true : false;
                var hasZipCodeInput = repairTypeActive.find('.warranty-type:visible').find('.search-zip').length > 0 ? true : false;
                var isUnavailable = repairTypeActive.find('.unavailable-product').is(':visible');

                if (hasZipCodeInput) {
                    if (hasRadio) {
                        if (!repairTypeActive.find("[type=radio]:checked").length) {
                            var checkMsg;
                            if (!!obj.attr('data-centerrequire-msg')) {
                                checkMsg = obj.attr('data-centerrequire-msg');
                                modalAlert(checkMsg, true);
                            } else {
                                checkMsg = 'article data-centerrequire-msg is empty';
                                modalAlert(checkMsg, true);
                            }
                            return false;
                        }
                    } else {
                        if (!isUnavailable) {
                            var checkMsg;
                            if (!!obj.attr('data-centerclick-msg')) {
                                checkMsg = obj.attr('data-centerclick-msg');
                                modalAlert(checkMsg, true);
                            } else {
                                checkMsg = 'article data-centerclick-msg is empty';
                                modalAlert(checkMsg, true);
                            }
                            return false;
                        }
                    }

                }

                // contact infomation form change
                if (repairTypeName == 'carryin') {
                    var $infos = $('.contact-information').find('.contact-info [data-contact-type]');
                    $infos.filter('[data-contact-type=public]').closest('form').hide().removeClass('active');
                    $infos.filter('[data-contact-type=carryin]').closest('form').show().addClass('active');
                }


                if (repairTypeName == 'onsite') {
                    // BR realtime service contact information zipcode input
                    if (lgFilter.locale == '/br') {
                        var zipCodeInput = repairTypeActive.find('.warranty-type:visible').find('.search-zip .input-text input');
                        if (zipCodeInput.length) {
                            var zipcodeValue = repairTypeActive.find('.warranty-type:visible').find('.search-zip .input-text input').val();
                            $('article.step.contact-information:visible').find('#zipcode').val(zipcodeValue).trigger('focusout');
                        }
                    }

                    if (lgFilter.locale == '/cn') {
                        var placeholder = $('.contact-information #contactDescription').attr('data-placeholder-onsite');
                        $('.contact-information #contactDescription').attr('placeholder', placeholder);
                    }
                }

                if (repairTypeName == 'installation') {
                    // BR realtime service contact information zipcode input
                    if (lgFilter.locale == '/br') {
                        var zipCodeInput = repairTypeActive.find('.warranty-type:visible').find('.search-zip .input-text input');
                        if (zipCodeInput.length) {
                            var zipcodeValue = repairTypeActive.find('.warranty-type:visible').find('.search-zip .input-text input').val();
                            $('article.step.contact-information:visible').find('#zipcode').val(zipcodeValue).trigger('focusout');
                        }
                    }

                    if (lgFilter.locale == '/cn') {
                        var placeholder = $('.contact-information #contactDescription').attr('data-placeholder-installation');
                        $('.contact-information #contactDescription').attr('placeholder', placeholder);
                    }
                }

                // real time service file transfer disable
                if (repairTypeName == 'onsite' || repairTypeName == 'installation') {
                    // real time
                    if (hasZipCodeInput) {
                        $('article.step').find('input[type=file]').each(function() {
                            $(this).attr('disabled', true);
                            var inColumnDiv = $(this).parent().parent().hasClass('file-upload');
                            if (inColumnDiv) {
                                $(this).closest('.column').hide();
                            }
                        });
                    } else { // non real time
                        $('article.step').find('input[type=file]').each(function() {
                            $(this).attr('disabled', false);
                            var inColumnDiv = $(this).parent().parent().hasClass('file-upload');
                            if (inColumnDiv) {
                                $(this).closest('.column').show();
                            }
                        });
                    }
                } else {
                    $('article.step').find('input[type=file]').each(function() {
                        $(this).attr('disabled', false);
                        var inColumnDiv = $(this).parent().parent().hasClass('file-upload');
                        if (inColumnDiv) {
                            $(this).closest('.column').show();
                        }
                    });
                }

                // selected service type submit text change
                var $submitTexts = $submitModal.find('p[data-service-type]');
                var hasCommonText = !!$submitTexts.filter('[data-service-type=common]').length;
                var hasSelectedServiceText = !!$submitTexts.filter('[data-service-type=' + repairTypeName + ']').length;
                if (hasSelectedServiceText) {
                    $submitTexts.hide();
                    $submitTexts.filter('[data-service-type=' + repairTypeName + ']').show();
                } else {
                    if (hasCommonText) {
                        $submitTexts.hide();
                        $submitTexts.filter('[data-service-type=common]').show();
                    }
                }

            } else if (isRequestRepair) {
                var $infos = $('.contact-information').find('.contact-info [data-contact-type]');
                $infos.filter('[data-contact-type=public]').closest('form').show().addClass('active');
                $infos.filter('[data-contact-type=carryin]').closest('form').hide().removeClass('active');
                // selected service type submit text change
                var $submitTexts = $submitModal.find('p[data-service-type]');
                if ($submitTexts.length > 0) {
                    $submitTexts.hide().filter('[data-service-type=common]').show();
                }
            }

            if (obj.data("bypass")) {
                stepChange(current, current + 1);
                stepResult(current);
            } else {
                submitBtn.spin(true);

                $.ajax({
                    url: obj.data("url"),
                    data: XSSfilters($.merge(param, addParam)),
                    dataType: "json",
                    //type: "get",
                    beforeSend: function(data) {

                    },
                    success: function(data) {
                        if (data.result) {
                            stepChange(current, current + 1, data);
                            if (obj.find("#receiptNum").length) {
                                $.modal.close();
                            }
                        } else {
                            if (data.error) {
                                var errs = [];

                                if (obj.closest(".dispatch-content").length) {
                                    $.modal.close();
                                    modalAlert(data.error, true);
                                    return;
                                }

                                for (var f in data.error) {
                                    var target = $("form", obj).length ? $("form", obj)[0][f] : obj.closest("form")[0][f];
                                    $(target).addClass("error").siblings("span.msg-error").css({
                                        bottom: $(target).outerHeight(true) + 5
                                    }).html("<i class='icon icon-error'></i>" + data.error[f]).parent("span").css({
                                        "position": "relative",
                                        "display": "block"
                                    });
                                    errs.push(target)
                                }
                                errs[0].focus();
                            }
                        }

                        stepResult(current);

                    },
                    complete: function(data) {
                        submitBtn.spin(false);
                    },
                    error: function(xhr, msg) {
                        modalAlert(msg);
                        submitBtn.spin(false);
                    }
                });
            }


        }

        function stepReset(current) {

            var currentStep = $('.step-list > article.step:visible').eq(current);
            var resetEl = $(".warranty-type");
            var resetData = $(".step-result");

            currentStep.removeClass("edit-able edit-before");
            $(dmsAble, dmsAvailable).hide();
            $('.unavailable-product').hide()

            $('.step-list > article.step:visible').each(function(idx) {
                var _this = $(this);

                if (isProductSelectReset) {
                    if (_this.hasClass('product-choice')) {
                        _this.removeClass("edit-able edit-before");
                        return;
                    }
                }

                if (_this.data("reset")) {
                    _this.removeClass("edit-able edit-before");
                    _this.find("form")[0].reset();
                    _this.find(".search-wrap").each(function() {
                        if ($(this).find("ul.chosen-results").find("li").length > 0)
                            _this.find(".selectbox").trigger("chosen:updated");

                    });


                    _this.find(".selectbox").trigger("chosen:updated");
                    _this.find("input[type='checkbox'], input[type='radio']").iCheck("uncheck").iCheck("update");
                    _this.find(resetData).find("[data-result], [data-result-join]").text("");
                    _this.find("input,select,textarea").removeClass("error");
                    _this.find(".zip-code-result").empty();
                    _this.closest(".dispatch-content").find("#step02 button[type=submit]").attr("disabled", "disabled");

                    // call appointment date reset
                    _this.find(".two-column.time-date .selectbox").val("").removeProp("disabled").removeAttr("disabled").trigger("chosen:updated");

                    // Repair type reset
                    if (_this.hasClass('repair-service-type')) {
                        _this.find('ul.tabs > li').each(function() {
                            $(this).data('validZipCode', false);
                            var $searchzipDiv = $(this).find('.search-zip');
                            if ($searchzipDiv.length) {
                                var $target = $(this).find($searchzipDiv.attr('data-target'));
                                $target.children('ul').empty();
                            }
                        });

                        //Non Real service Select Reservation Date and Time reset
                        var $nonRealDatepickerInput = $('.repair-service-type').find('.date-choice [data-provide=datepicker]');
                        $nonRealDatepickerInput.each(function() {
                            $(this).val('');
                            var targetSelector = $(this).data('target');
                            if (!config.isMobile) {
                                $('[name=' + targetSelector + ']').prop('disabled', true).attr('disabled', true).data().chosen.search_field_disabled();
                            } else {
                                $('[name=' + targetSelector + ']').prop('disabled', true).attr('disabled', true);
                            }

                            $('[name=' + targetSelector + ']').attr('required', false);
                        });

                        $('.repair-service-type').find('.date-choice').each(function() {
                            var self = $(this);
                            $(this).find('[data-provide=datepicker]').each(function(idx) {
                                if (idx != 0) {
                                    $(this).attr('disabled', true);
                                }
                            });
                        });

                    }
                } else {
                    _this.removeClass("edit-able edit-before");
                }

            });
        }





        function zipcodeSearch() {
            var input = $("[name^='zipCode']", element);

            if (input.length) {
                input.each(function() {
                    var _input = $(this);
                    var div = $(this).closest(".search-zip");
                    var submit = $("button.btn", div);
                    var centerlist_target = div.next().find(div.data("target"));
                    var dmsAble = div.siblings(".dmsAble");
                    var dmsAvailable = div.siblings(".dmsAvailable");
                    var localePhoneText = _input.data('localePhoneText');
                    var localeAddressText = _input.data('localeAddressText');
                    var localeDisableAddText = _input.data('localeDisableAddText');
                    var isCarryInService = $(this).closest('li[data-repair-type]').data('repair-type') == 'carryin' ? true : false;
                    var isOnsiteService = $(this).closest('li[data-repair-type]').data('repair-type') == 'onsite' ? true : false;
                    var isInstallationService = $(this).closest('li[data-repair-type]').data('repair-type') == 'installation' ? true : false;

                    input.data("searchZipCode", false);

                    input.change(function() {
                        input.data("searchZipCode", false);
                    });
                    // carryin country selectbox
                    if (_input.closest('.search-zip.carry-in').find('#carryincountry').length) {
                        _input.closest('.search-zip.carry-in').find('#carryincountry').on('change', function(e) {
                            _input.val($(this).val());
                            submit.trigger('click');
                        });
                    }

                    submit.click(function(e, url) {
                        e.preventDefault();
                        if (_input.is("[type=text]") && _input.val() == "") {
                            _input.addClass("error").trigger("focus").siblings("span.msg-error").css({
                                bottom: input.outerHeight(true) + 5
                            }).html("<i class='icon icon-error'></i>" + _input.data("validModelMsg")).parent("span").css("position", "relative");
                            return false
                        } else {
                            _input.removeClass("error");
                        }

                        var addParam = (div.data("dependency") ? $(div.data("dependency")).find("form").serializeArray() : {});

                        submit.spin(true);

                        $.ajax({
                            url: !!url ? url : div.data("url"),
                            data: XSSfilters($.merge(_input.serializeArray(), addParam)),
                            dataType: "json",
                            beforeSend: function() {},
                            success: function(data) {

                                if (data.error) {

                                    _input.data("searchZipCode", false);

                                    var errs = [];
                                    for (var f in data.error) {
                                        var target = input.closest("form")[0][f];
                                        $(target).addClass("error").siblings("span.msg-error").css({
                                            bottom: $(target).outerHeight(true) + 5
                                        }).html("<i class='icon icon-error'></i>" + data.error[f]).parent("span").css({
                                            "position": "relative",
                                            "display": "block"
                                        });
                                        errs.push(target)
                                    }

                                    submit.spin(false);
                                    errs[0].focus();

                                } else {

                                    _input.data("searchZipCode", true);
                                    if (data.result) {
                                        dmsAvailable.hide();
                                        dmsAble.show();
                                        centerlist_target.find("ul").children().remove();
                                        centerlist_target.parent().next().hide();

                                        if (lgFilter.locale == '/br') {
                                            _input.closest('[data-repair-type]').data('validZipCode', true);
                                            _input.closest('article.step').find('button[type=submit]').attr('disabled', false);
                                        }

                                        // real service
                                        if (isOnsiteService || isInstallationService) {
                                            $.each(data["ascList"], function(k, v) {
                                                if (v["ascId"] == '' || v["serviceEngineerCode"] == '') {
                                                    return;
                                                }

                                                if (lgFilter.locale == '/br') {
                                                    zipcode_li = "<li>";
                                                    zipcode_li += "<input type=\"radio\" class=\"center-radio-select\" name=\"" + centerlist_target.find("ul").data("radio-name") + "\" value =\"" + v["ascId"] + "\">";
                                                    zipcode_li += "<a href=" + v["centerUrl"] + " target=\"_blank\" class=\"underline\" title=\"Open New Window\" >" + v["ascName"] + "</a>";
                                                    zipcode_li += "<div><span class=\"wrap\"><strong>" + localeAddressText + " :</strong>" + v["ascAddressInfo"] + "</span>";
                                                    zipcode_li += "<span class=\"wrap\"><strong>" + localePhoneText + " :</strong>" + v["ascPhoneNo"] + "</span></div>";
                                                    zipcode_li += "</li>";
                                                    centerlist_target.find("ul").append(zipcode_li);

                                                } else {
                                                    zipcode_li = "<li>";
                                                    zipcode_li += "<input type=\"radio\" class=\"center-radio-select\" name=\"" + centerlist_target.find("ul").data("radio-name") + "\" value =\"" + v["ascId"] + "\">";
                                                    zipcode_li += "<span class=\"wrap\"><strong>" + localeAddressText + " :</strong>" + v["ascAddressInfo"] + "</span>";
                                                    zipcode_li += "<span class=\"wrap\"><strong>" + localePhoneText + " :</strong>" + v["ascPhoneNo"] + "</span>";
                                                    zipcode_li += "<a href=" + v["centerUrl"] + " target=\"_blank\" class=\"underline\" title=\"Open New Window\" >" + v["ascName"] + "</a>";
                                                    zipcode_li += "</li>";
                                                    centerlist_target.find("ul").append(zipcode_li);
                                                }

                                            });
                                            styledForm(dmsAble);

                                            centerlist_target.find("li .center-radio-select").on("change", function() {
                                                var $this = $(this);
                                                if ($this.is(':checked')) {
                                                    setRealServiceDateTime({
                                                        selectBox: centerlist_target.parent().siblings(".select-datentime"),
                                                        centerId: $this.val(),
                                                        centerInfoList: data.ascList,
                                                        disableAddText: localeDisableAddText
                                                    });
                                                }
                                            });

                                        }

                                        if (isCarryInService) {
                                            //console.log('carryin addr', data);
                                            $.each(data.centerList, function(k, v) {
                                                zipcode_li = "<li>";
                                                zipcode_li += "<input type=\"radio\" class=\"center-radio-select\" name=\"" + centerlist_target.find("ul").data("radio-name") + "\" value =\"" + v["ascId"] + "\">";
                                                zipcode_li += "<span class=\"wrap\"><strong>" + localeAddressText + " :</strong>" + v["ascAddr1"] + v["ascAddr2"] + "</span>";
                                                zipcode_li += "<span class=\"wrap\"><strong>" + localePhoneText + " :</strong>" + v["ascPhoneNo"] + "</span>";
                                                zipcode_li += "<a href=" + v["centerUrl"] + " target=\"_blank\" class=\"underline\" title=\"Open New Window\" >" + v["ascName"] + "</a>";
                                                zipcode_li += "</li>";
                                                centerlist_target.find("ul").append(zipcode_li);
                                            });

                                            styledForm(dmsAble);

                                            centerlist_target.find("li .center-radio-select").on("change", function() {
                                                var $this = $(this);
                                                var idx = $this.index();
                                                if ($this.is(':checked')) {
                                                    var url = centerlist_target.find("ul").data('url');
                                                    setCarryinDateTime({
                                                        selectBox: centerlist_target.parent().siblings(".select-datentime"),
                                                        centerId: $this.serializeArray(),
                                                        url: url,
                                                        disableAddText: localeDisableAddText
                                                    });
                                                }

                                                // hidden input set center data
                                                centerlist_target.closest('form').children('input:hidden').val('');
                                                for (var k in data.centerList[idx]) {
                                                    centerlist_target.closest('form').children('input[name=carryin' + k + ']').val(data.centerList[idx][k]);
                                                }

                                            });
                                        }

                                    } else {
                                        dmsAble.hide();
                                        dmsAvailable.show();

                                        if (lgFilter.locale == '/br') {
                                            _input.closest('[data-repair-type]').data('validZipCode', false);
                                            _input.closest('article.step').find('button[type=submit]').attr('disabled', true);
                                        }
                                    }

                                    submit.spin(false);
                                    submit.focus();

                                }

                            },
                            error: function(xhr, errorText) {
                                self.error(errorText);
                                submit.spin(false);
                            }

                        })

                        e.preventDefault();
                    })
                })
            }
        }

        function setRealServiceDateTime(centerData) {
            var $centerTimeSelectBox = centerData.selectBox;
            var $dateSelect = $centerTimeSelectBox.find('[name=serviceDate-real-non]');
            var $timeSelect = $centerTimeSelectBox.find('[name=serviceTime-real-non]');
            var centerInfoList = centerData.centerInfoList;
            var centerId = centerData.centerId;
            var disableAddText = centerData.disableAddText;

            $dateSelect.empty();
            $timeSelect.empty().trigger("chosen:updated");

            var selectedCenter = $.grep(centerInfoList, function(obj, idx) {
                return (obj.ascId == centerId);
            });
            // hidden input set center data
            $centerTimeSelectBox.closest('form').children('input:hidden').val('');
            for (var k in selectedCenter[0]) {
                if (k != 'realTimeList') {
                    $centerTimeSelectBox.closest('form').children('input[name=real' + k + ']').val(selectedCenter[0][k]);
                }
            }

            var availableDateArray = [];

            $.each(selectedCenter[0].realTimeList, function(idx) {
                var self = this;
                var dateObj = {
                    date: self.reserveDate,
                    timeList: []
                };

                var isAdded = false;
                $.each(availableDateArray, function() {
                    isAdded = (this.date == self.reserveDate) ? true : false;
                });

                if (isAdded) return;

                var currentDateArray = $.grep(selectedCenter[0].realTimeList, function(obj, idx) {
                    return (obj.reserveDate == self.reserveDate);
                });

                $.each(currentDateArray, function(idx) {
                    if (this.available == 'AVAILABLE') {
                        dateObj.timeList.push({
                            'timeZoneDesc': this.timeZoneDesc,
                            'timeZoneId': this.timeZoneId,
                            'available': true
                        });
                    } else {
                        dateObj.timeList.push({
                            'timeZoneDesc': this.timeZoneDesc + disableAddText,
                            'timeZoneId': this.timeZoneId,
                            'available': false
                        });
                    }
                });

                availableDateArray.push(dateObj);
            });

            //console.log('availableDateArray', availableDateArray);

            $.each(availableDateArray, function(idx) {
                if (idx == 0) {
                    var option = document.createElement('option');
                    option.value = '';
                    option.text = $dateSelect.data('placeholder');
                    $dateSelect.append(option);
                }
                var option = document.createElement('option');
                option.value = this.date;
                option.text = this.date;
                $dateSelect.append(option);
            });

            $dateSelect.on('change', function(e) {
                var self = $(this);
                var selectedDateObj = [];
                selectedDateObj = $.grep(availableDateArray, function(obj, idx) {
                    return (self.val() == obj.date);
                });
                $timeSelect.empty();
                if (selectedDateObj.length == 0) {
                    var option = document.createElement('option');
                    option.value = '';
                    option.text = $timeSelect.data('placeholder');
                    $timeSelect.append(option);
                    $timeSelect.trigger("chosen:updated");
                    return;
                }

                //console.log('timeList', selectedDateObj[0].timeList);

                $.each(selectedDateObj[0].timeList, function(idx) {
                    if (idx == 0) {
                        var option = document.createElement('option');
                        option.value = '';
                        option.text = $timeSelect.data('placeholder');
                        $timeSelect.append(option);
                    }
                    var option = document.createElement('option');
                    option.value = this.timeZoneDesc;
                    option.text = this.timeZoneDesc;
                    $(option).data('timeZoneId', this.timeZoneId);
                    if (!this.available) {
                        $(option).attr('disabled', true);
                    }

                    $timeSelect.append(option);
                });

                $timeSelect.trigger("chosen:updated");
            });
            $timeSelect.off('change').on('change', function() {
                var timeZoneId = $(this).find('option:selected').data('timeZoneId');
                $centerTimeSelectBox.closest('form').find('input:hidden[name=realtimeZoneId]').val(timeZoneId);
            });
            $dateSelect.trigger("chosen:updated");
            $centerTimeSelectBox.show();
        }

        function setCarryinDateTime(centerData) {
            var $centerTimeSelectBox = centerData.selectBox;
            var $dateSelect = $centerTimeSelectBox.find('[name=serviceDate-carryin-non]');
            var $timeSelect = $centerTimeSelectBox.find('[name=serviceTime-carryin-non]');
            var disableAddText = centerData.disableAddText;

            $.ajax({
                url: centerData.url,
                data: XSSfilters(centerData.centerId),
                dataType: "json"
            }).done(function(res) {
                //console.log('carryin timedate', res);
                $dateSelect.empty();
                $timeSelect.empty();

                var availableDateArray = [];

                $.each(res.carryInTimeTable, function(idx) {
                    var self = this;
                    var dateObj = {
                        date: self.reserveDate,
                        timeList: []
                    };

                    var isAdded = false;
                    $.each(availableDateArray, function() {
                        isAdded = (this.date == self.reserveDate) ? true : false;
                    });

                    if (isAdded) return;

                    if (this.available != 'AVAILABLE') {
                        this.timeZoneDesc = {
                            'timeZoneDesc': this.timeZoneDesc + disableAddText,
                            'available': false
                        };
                    } else {
                        this.timeZoneDesc = {
                            'timeZoneDesc': this.timeZoneDesc,
                            'available': true
                        };
                    }

                    dateObj.timeList.push(this.timeZoneDesc);
                    availableDateArray.push(dateObj);
                });

                //console.log('availableDateArray', availableDateArray);

                $.each(availableDateArray, function(idx) {
                    if (idx == 0) {
                        var option = document.createElement('option');
                        option.value = '';
                        option.text = $dateSelect.data('placeholder');
                        $dateSelect.append(option);
                    }
                    var option = document.createElement('option');
                    option.value = this.date;
                    option.text = this.date;
                    $dateSelect.append(option);
                });

                $dateSelect.on('change', function(e) {
                    var self = $(this);
                    var selectedDateObj = [];
                    selectedDateObj = $.grep(availableDateArray, function(obj, idx) {
                        return (self.val() == obj.date);
                    });
                    $timeSelect.empty();
                    if (selectedDateObj.length == 0) {
                        var option = document.createElement('option');
                        option.value = '';
                        option.text = $timeSelect.data('placeholder');
                        $timeSelect.append(option);
                        $timeSelect.trigger("chosen:updated");
                        return;
                    }

                    //console.log('timeList', selectedDateObj[0].timeList);

                    $.each(selectedDateObj[0].timeList, function(idx) {
                        if (idx == 0) {
                            var option = document.createElement('option');
                            option.value = '';
                            option.text = $timeSelect.data('placeholder');
                            $timeSelect.append(option);
                        }
                        var option = document.createElement('option');
                        option.value = this.timeZoneDesc;
                        option.text = this.timeZoneDesc;
                        if (!this.available) {
                            $(option).attr('disabled', true);
                        }
                        $timeSelect.append(option);
                    });
                    $timeSelect.trigger("chosen:updated");
                });
                $dateSelect.trigger("chosen:updated");
                $centerTimeSelectBox.show();

            }).fail(function(xhr, errorText) {
                self.error(errorText);
            });
        }

        self.submit = function(e) {
            var _this = $(el);
            var fieldData = [];
            var fileData = [];
            var fieldObj = [];
            var submitBtn = $("[rel='stepList:submit']");

            var isRequestRepair = $(el).hasClass('schedule-repair');

            submitBtn.spin(true);
            var forms = isRequestRepair ? $("article.step:visible form", el) : $("form", el);
            forms.each(function(i) {
                var obj = $(this).serializeArray();

                // step type check
                var isYourProductChoice = $(this).closest('.step').hasClass('product-choice');
                var isProductSymtom = $(this).closest('.step').hasClass('product-symptom');
                var isRepairType = $(this).closest('.step').hasClass('repair-service-type');
                var isContactInfomation = $(this).closest('.step').hasClass('contact-information');
                var isStep3Mc = $(this).closest('.step').attr('id') == 'step03-mc' ? true : false;

                if (isRequestRepair) {
                    if (isYourProductChoice) {
                        var obj = [];
                        var choiceBoxDiv = $(this).find('.two-column.choice-product').eq(0);

                        if (choiceBoxDiv.hasClass('active-category')) {
                            $(this).find('.select-product').find('select').each(function(idx) {
                                if ($(this).serializeArray().length > 0) {
                                    obj.push($(this).serializeArray()[0]);
                                    var clone = $(this).clone();
                                    clone.val($(this).val());
                                    fieldObj.push(clone);
                                }
                            });
                        }

                        if (choiceBoxDiv.hasClass('focus-number')) {
                            $(this).find('.model-number').find('input[name=keyword]').each(function(idx) {
                                obj.push($(this).serializeArray()[0]);
                                var clone = $(this).clone();
                                clone.val($(this).val());
                                fieldObj.push(clone);
                            });
                        }

                        if ($('#purchaseInfoType1').hasClass('active')) {
                            var activePurchaseInfoDataArray = $('#purchaseInfoType1').find('input').serializeArray();
                            fieldObj = $.merge(fieldObj, $('#purchaseInfoType1').find('input').clone());
                            obj = $.merge(obj, activePurchaseInfoDataArray);
                        }

                        if ($('#purchaseInfoType2').hasClass('active')) {
                            var activePurchaseInfoDataArray = $('#purchaseInfoType2').find('input').serializeArray();
                            fieldObj = $.merge(fieldObj, $('#purchaseInfoType2').find('input').clone());
                            obj = $.merge(obj, activePurchaseInfoDataArray);
                        }
                    }

                    // Product Symtom
                    if (isProductSymtom) {
                        $(this).find('select').each(function(idx) {
                            if ($(this).serializeArray().length > 0) {
                                obj.push($(this).serializeArray()[0]);
                                var clone = $(this).clone();
                                clone.val($(this).val());
                                fieldObj.push(clone);
                            }
                        });
                        $(this).closest('.step').find(':input').not('button').each(function() {
                            var $this = $(this);
                            var clone = $this.clone();
                            $(clone).val($this.val());
                            fieldObj.push(clone[0]);
                        });
                    }

                    // Repair type active service check
                    if (isRepairType) {
                        var activeInputArray = $('[data-tabs="repairType"]').find('li.active').find(':input').not('button').serializeArray();
                        activeInputArray.push($('[name=repair-service-type]').serializeArray()[0]);
                        activeInputArray = $.merge(activeInputArray, $(this).children('input:hidden').serializeArray());

                        $('[data-tabs="repairType"]').find('li.active').find(':input').not('button').each(function() {
                            var $this = $(this);
                            var clone = $this.clone();
                            $(clone).val($this.val());
                            fieldObj.push(clone[0]);
                        });

                        // Real time service hidden inputs
                        $(this).children('input:hidden').each(function() {
                            var $this = $(this);
                            var clone = $this.clone();
                            $(clone).val($this.val());
                            fieldObj.push(clone[0]);
                        });

                        fieldObj = $.merge(fieldObj, $('[name=repair-service-type]').clone());

                        obj = activeInputArray;

                    }

                    // Contact Information active Form check
                    if (isContactInfomation) {
                        if ($(this).closest('form').hasClass('active')) {


                        } else {
                            return;
                        }
                    }

                    // BR step3 MC
                    if (isStep3Mc) {
                        $(this).closest('.step').find(':input').not('button').each(function() {
                            var $this = $(this);
                            var clone = $this.clone();
                            $(clone).val($this.val());
                            fieldObj.push(clone[0]);
                        });
                    }

                }

                for (var fld in obj) {
                    fieldData.push(obj[fld]);
                }
            })

            if ($(el).hasClass('schedule-repair')) {
                self.options.async = false;
            }

            if (self.options.async) {
                $.ajax({
                    url: _this.data("action"),
                    type: "post",
                    data: XSSfilters(fieldData),
                    async: false,
                    success: function(data) {
                        if (data.result) {
                            if (data.form) {
                                self.postSubmit(data.url, data.form);
                            } else if (data.url) {
                                if (_this.closest(".dispatch-content").length) {
                                    _satellite.track('dispatch-portal-request-repair-finish-submit');
                                }
                                location.href = data.url;
                            }
                        } else {
                            if (_this.closest(".dispatch-content").length) {
                                modalAlert(data.error, true);
                                $("#modalAlert").attr("rel", "schedule");
                                $("[rel='schedule']").on("click", "[rel='modal:close']", function() {
                                    $("#step01 .edit-btn").trigger("click");
                                    submitBtn.spin(false);
                                })
                            } else {
                                self.error(data.error);
                            }
                        }
                    },
                    complete: function(data) {
                        //submitBtn.spin(false);
                    },
                    error: function(xhr, err) {
                        if (_this.closest(".dispatch-content").length) {
                            modalAlert("System Error.  Please try again", true);
                            $("#modalAlert").attr("rel", "system");
                            $("[rel='system']").on("click", "[rel='modal:close']", function() {
                                submitBtn.spin(false);
                            })
                        } else {
                            self.error(err);
                        }
                    }
                })

            } else {
                var isUpload = false;

                if ($(el).hasClass('schedule-repair')) {
                    if ($("article.step:visible form", el).find("input[type='file']:enabled").length) isUpload = true;
                } else {
                    if ($("form", el).find("input[type='file']").length) isUpload = true;
                }



                if (isUpload || $(el).hasClass('schedule-repair')) {

                    var $frm;
                    var origin;

                    // request repair 
                    if ($(el).hasClass('schedule-repair')) {
                        if ($("article.step:visible form[enctype]").length == 1) {
                            $("article.step:visible form[enctype]").eq(0).addClass('active');
                        }

                        if ($("article.step:visible form[enctype]").length > 1 && $("article.step:visible form[enctype].active").length == 0) {
                            $("article.step:visible form[enctype]").eq(0).addClass('active');
                        }


                        $frm = $("article.step:visible form[enctype].active", el);
                        origin = $frm;
                        $(".tmpfld-", $frm).remove();
                        $.each(fieldObj, function() {
                            origin.append($(this).addClass("tmpfld-").hide());
                        });
                    } else {
                        $frm = $("form[enctype]", el);
                        origin = $frm;
                        $(".tmpfld-", el).remove();

                        $("form", el).not(origin).each(function() {
                            $("input,select,textarea", this).each(function() {
                                $d = $(this).clone().addClass("tmpfld-").val($(this).val()).hide();
                                origin.append($d);
                            });
                        });
                    }


                    $frm.ajaxSubmit({
                        url: _this.data("action"),
                        type: "post",
                        cache: false,
                        // async: true,
                        dataType: "text",
                        // contentType: false,
                        processData: true,
                        // data: formData,
                        beforeSend: function() {

                        },
                        success: function(data) {
                            XSSfilters(fieldData);
                            data = $.parseJSON(data);
                            if (data.result) {
                                if (data.form) {
                                    self.postSubmit(data.url, data.form);

                                } else if (data.url) {
                                    location.href = data.url;
                                }
                            } else {
                                self.error(data.error);
                            }
                        },
                        complete: function(data) {
                            //submitBtn.spin(false);
                        },
                        error: function(xhr, errorText) {

                            self.error(errorText);
                        }
                    })
                } else {

                    var form = document.createElement("form");
                    form.method = "get";
                    form.action = _this.data("action");

                    $.each(fieldData, function(i, fld) {
                        var input = document.createElement('input');
                        input.setAttribute("type", "hidden");
                        input.setAttribute("name", fld.name);
                        input.setAttribute("value", XSSfilter(fld.value));
                        form.appendChild(input);
                    });


                    if (_.size(fieldData)) form.submit();

                }
            }

        }

        self.postSubmit = function(url, frm) {

            var form = document.createElement("form");
            form.method = "post";
            form.action = url;

            $.each(frm, function(key, value) {
                var input = document.createElement('input');
                input.setAttribute("type", "hidden");
                input.setAttribute("name", key);
                input.setAttribute("value", XSSfilter(value));
                form.appendChild(input);
            });

            // form.submit();
            $(form).hide().appendTo("body")[0].submit(); //.submit();

        }

        self.error = function(msg, e) {
            var submitBtn = $('[rel="stepList:submit"]');
            modalAlert(msg);
            /* LGEBR-3259 modify */
            if (lgFilter.locale != '/br' || $(document).find('.email-appointment').size() > 0) {
                submitBtn.spin(false);
            }
            /*//LGEBR-3259 modify */
        }

    }

    ic.util.inherits(Steplist, Module);
    ic.jquery.plugin('steplist', Steplist, '.step-list');

    return Steplist;

});
