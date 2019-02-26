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

        var stepContent = $('article.step:visible .step-content');
        var stepWrap = $('article.step:visible');
        var stepReview = $("article.step.step-review");
        var dmsAble = $("article.step:visible .dmsAble");
        var dmsAvailable = $("article.step:visible .dmsAvailable");
        var $submitModal = $('#reviewRepair');

        /* PJTBTOBCSR-138 start */
        var btbCheck = $(element).hasClass("btb-repair") ? true : false ;
        /* PJTBTOBCSR-138 end */
        init();

        function init() {

            var _this = $(el);


            // load
            stepWrap.eq(0).addClass("active done").find(">.container").slideDown();

            // Submit
            $('.step-list > article.step').each(function(idx) {
                $(this).find('form').on('submit', function(e) {
                    e.preventDefault();
                    var index = $('.step-list > article.step:visible').index($(this).closest('article'));
                    var result = stepValidate(index);
                    if (result) {
                        if (stepSubmitBefore(index)) {
                            stepSubmit(index);
                        }
                    }
                    /* LGECI-3011 20170912 add */
                    if ( (lgFilter.locale =='/ca_en' || lgFilter.locale =='/ca_fr') && $(".hiddenFlag").length == 0 && index == 0 && $(".was_mobile").length != 0 ) {
                    	function stepNum(step) {
                        	/*var step1 = $("article#step0"+ step +" .step-bar").text().trim().split(" ");
                        	step1[1] = Number(step1[1]) + 1;
                        	var step2 = step1.join(" ");
                        	$("article#step0"+ step +" .step-bar").text(step2);*/
                    		
                        	var num = $("article#step0"+ step).find($(".step-lan")).text() + " " + (step);
                        	$("article#step0"+ step +" .step-bar").text(num);
                    	}	
                    	
                    	$("article#step03").removeClass("hidden");
                    	stepNum(4);
                    	stepNum(5);
                    	/*$("article#step04 .step-bar").text("Step 4");
                    	$("article#step05 .step-bar").text("Step 5");*/
                    }
                    /* //LGECI-3011 20170912 add */
                    
                });
            });

            // Save 
            /* LGECS-710 20170411 modify*/
            $('.schedule-repair [data-stepsave-btn],.call-appointment [data-stepsave-btn]').each(function() {
                $(this).on('click', function(e) {
                    e.preventDefault();
                    /* LGECI-2884 20170531 add */
                    if((lgFilter.locale =='/ca_en' || lgFilter.locale =='/ca_fr') && $('#step01').hasClass('active')){
                    	if($('.msg-error-oow').is(':visible')){
                    		/* LGECI-2957 modify */
                    		//$(location).attr('href',$('.one-price-program').text());
                    		window.open($(".one-price-program").text(),'_one-price-program');
                    		/*//LGECI-2957 modify */
                    		return;
    	                }                    		                    
                    }                	
                	/*// LGECI-2884 20170531 add */
                    /* PJTBTOBCSR-138 start */
                    var _etarget = $(e.currentTarget);
                    var viewTarget = $(element).data("view");
                    var btbCh = $(this).closest('article').find('div[data-target]').length;
                    if(btbCheck && btbCh){
                        var form = $(this).closest('article').find('[data-target="' + viewTarget +'"] form');
                    } else {
                        var form = $(this).closest('article').find('form');
                    }
                    form.trigger('form:validate');
                    /* PJTBTOBCSR-138 end */
                });

            });
            // save validate handler
            $('.step-list > article.step').each(function(idx) {
                $(this).find('form').on('form:validate:success', function(e) {
                    e.preventDefault();
                    var index = $('.step-list > article.step:visible').index($(this).closest('article'));
                    // step validate
                    var result = stepValidate(index);
                    if (result) {
                        if (stepSubmitBefore(index)) {
                            /* LGEGMO-1615 START */
                            var repairTypeOpened = $('.repair-service-type').data('editAble');

                            // step1 save
                            if (index == 0 && repairTypeOpened) {
                                repairTabInit(index, function() {
                                    stepSave(index);
                                    stepResult(index);
                                    stepClose(index, false);
                                    
                                    var allStepSaved = true;
                                    $('.step-list > article.step:visible').each(function() {
                                        if (!$(this).data('saveData')) {
                                            allStepSaved = false;
                                        }
                                    });

                                    if (allStepSaved) {
                                        stepReview.find('.step-content').show();
                                        stepReview.addClass('active done').show();
                                    }    
                                });
                            /* LGEGMO-1615 END */
                            } else {
                                stepSave(index);
                                stepResult(index);
                                stepClose(index, true);

                                var allStepSaved = true;
                                $('.step-list > article.step:visible').each(function() {
                                    if (!$(this).data('saveData')) {
                                        allStepSaved = false;
                                    }
                                });

                                if (allStepSaved) {
                                    stepReview.find('.step-content').show();
                                    stepReview.addClass('active done').show();
                                }
                            }
                        }
                    }
                });

                $(this).find('form').on('form:validate:fail', function(e) {

                });
            });
        
            

            // Edit
            _this.find(".edit-btn").on("click", function(e) {
                var current = $('article.step:visible').index($(this).closest('article.step'));
                e.preventDefault();

                stepEditStart(current, editIdx);

            });

            // step04 edit
            _this.find(".edit-step04").on("click", function(e) {
                e.preventDefault();
                var current = $('article.step:visible').index($(this).closest('article.step'));
                $("article.step:visible .step-review").hide();
                stepChange(current, current - 1);
            });

            $(document).on('click', '[rel="stepList:submit"]', function(event) {
                event.preventDefault();
                self.submit();
            });

            // step02  reset after tip modal close
            /*
            $(document).on('click', '.close-modal', function(event) {
                var modalTitle = $(".modal-title").text();
                $(".selectbox[name='helpfulArticles']").val("").trigger("chosen:updated");
            });
             */

            // repair service type step tab change handler
            $('[data-tab-target-parent]').on('tab:change', function() {
                var repairTypeName = $(this).find('li.active').attr('data-repair-type');
                var index = $('article.step:visible').index($(this).closest('article.step'));
                // tab change step reset
                /*LGECN-2073 20160923 modify*/
                if (_this.hasClass("integration")) {
                    var i = _this.find(".repair-service-type");
                    if (i) {
                        i.find("ul.tabs > li").each(function() {
                            $(this).data("validZipCode", !1);
                            var t = $(this).find(".search-zip");
                            if (t.length) {
                                var n = $(this).find(t.attr("data-target"));
                                n.children("ul").empty()
                            }
                        }), i.find(".selectbox").not("button").each(function() {
                            $(this).val(""), $(this).trigger("chosen:updated")
                        });
                        var s = $(".repair-service-type").find(".date-choice [data-provide=datepicker]");
                        s.each(function() {
                            $(this).val("");
                            var t = $(this).closest(".warranty-type"),
                                n = $(this).data("target");
                            //!config.isMobile ? t.find("[name=" + n + "]").prop("disabled", !0).attr("disabled", !0) : typeof n != "undefined" && t.find("[name=" + n + "]").prop("disabled", !0).attr("disabled", !0).data().chosen.search_field_disabled(), t.find("[name=" + n + "]").attr("required", !1)
                                    
                            if (!config.isMobile) {
                                if(typeof n!=="undefined"){
                                    t.find('[name=' + n + ']').prop('disabled', true).attr('disabled', true).data().chosen.search_field_disabled();
                                }
                            } else {
                                t.find('[name=' + n + ']').prop('disabled', true).attr('disabled', true);
                            }

                            t.find('[name=' + n + ']').attr('required', false);
                        }), $(".repair-service-type").find(".date-choice").each(function() {
                            var t = $(this);
                            $(this).find("[data-provide=datepicker]").each(function(t) {
                                t != 0 && $(this).attr("disabled", !0)
                            })
                        })
                    }
                   
                } else {
                    stepReset(index);
                }
                /*LGECN-2073 20160923 modify*/
                // set repair service type hidden input
                $(this).closest('form').children('input:hidden').not('[name=repair-service-type]').val('');
                $(this).closest('form').children('[name=repair-service-type]').val(repairTypeName);
            });
             
                    
            // centerNodataDisableNext option button disable enable 
            $('.repair-service-type li[data-repair-type] > a').each(function() {
                if (!$('.schedule-repair').data('centerNodataDisableNext')) return;

                $(this).on('click', function() {
                    var $li = $(this).parent();
                    var serviceType = $li.attr('data-repair-type');
                    var serviceName = $li.find('.warranty-type').attr('id');

                    if (serviceName == 'realonSite' || serviceName == 'realInstallation') {
                        if ($li.data('validZipCode') != true) {
                            $li.closest('article.step').find('button[type=submit]').attr('disabled', true);
                        }
                    } else {
                        $li.closest('article.step').find('button[type=submit]').attr('disabled', false);
                    }
                });
            });
            
            // step1 supercategory change all step reset
            /* PJTBTOBCSR-138 start */
            $(".wrapper").on('change.reset','#supercategory',function(){
                $('#supercategory').data('noreset', true);
                $('#category').data('noreset', true);
                $('#subcategory').data('noreset', false);
                $('#keyword').data('noreset', false);
                $('[data-search-name=keyword]').data('noreset', false); // LGEGMO-1741
                stepReset(0);
            });

            // step1 category change all step reset
            $(".wrapper").on('change.reset','#category', function() {
                $('#supercategory').data('noreset', true);
                $('#category').data('noreset', true);
                $('#subcategory').data('noreset', true);
                $('#keyword').data('noreset', false);
                $('[data-search-name=keyword]').data('noreset', false); // LGEGMO-1741
                stepReset(0);
            });

            // step1 subcategory change all step reset
            $(".wrapper").on('change.reset','#subcategory', function() {
                $('#supercategory').data('noreset', true);
                $('#category').data('noreset', true);
                $('#subcategory').data('noreset', true);
                $('#keyword').data('noreset', false);
                $('[data-search-name=keyword]').data('noreset', false); // LGEGMO-1741
                stepReset(0);
            });

            // keyword search success handler
            $('.product-choice form').on('modelBrowser:selectedModel.search:success', function(e) {
                $('#supercategory').data('noreset', false);
                $('#category').data('noreset', false);
                $('#subcategory').data('noreset', false);
                $('#keyword').data('noreset', true);
                $('[data-search-name=keyword]').data('noreset', false); // LGEGMO-1741
                stepReset(0);
            });
            
            /* LGECI-2884 20170613 add */
            if (lgFilter.locale =="/ca_en" || lgFilter.locale =="/ca_fr") {
	            $(".wrapper").on('change.reset','#modelNumber',function(){
	                $('#supercategory').data('noreset', true);
	                $('#category').data('noreset', true);
	                $('#subcategory').data('noreset', false);
	                $('#keyword').data('noreset', false);
	                $('[data-search-name=keyword]').data('noreset', false); // LGEGMO-1741
	                stepReset(0);
	            });
            }
            /*// LGECI-2884 20170613 add */

            // model browser set model detail handler
            $('.product-choice form').on('modelBrowser:setDetail', function(e, modelData) {
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
                
                // step3 set product name
                /*LGECS-769 : 20170106 modify*/
                $('.repair-service-type .product-name, .unavailable-product .product-name, .guideforVisitingCenter .product-name').text(modelData.modelName);
                /*//LGECS-769 : 20170106 modify*/
            });
            /* PJTBTOBCSR-138 end */

            // old model browser
            if ($('.model-browser').length == 0) {
                // keyword search success handler
                $('.search-model-number').on('keyword:success', function(e) {
                    $('#keyword').data('noreset', true);
                    $('[name=categoryId]').data('noreset', false);
                    $('[name=subCateId]').data('noreset', false);
                    $(el).hasClass("integration") ? {}: stepReset(0); 
                });

                // step1 category change all step reset
                $('[name=categoryId]').on('change.reset', function() {
                    $('[name=categoryId]').data('noreset', true);
                    $('[name=subCateId]').data('noreset', true);
                    $('#keyword').data('noreset', false);
                    $(el).hasClass("integration") ? {}: stepReset(0);
                });
                // step1 subcategory change all step reset
                $('[name=subCateId]').on('change.reset', function() {
                    $('[name=categoryId]').data('noreset', true);
                    $('[name=subCateId]').data('noreset', true);
                    $('#keyword').data('noreset', false);
                    $(el).hasClass("integration") ? {}: stepReset(0);
                });
            }



            // Repair Type -> Non Real Service -> Select Reservation Date and Time init
            $(function() {
                var $nonRealDatepickerInput = $('.repair-service-type').find('.date-choice [data-provide=datepicker]');
                $nonRealDatepickerInput.each(function() {
                    $(this).on('change', function() {
                        var $warrantyDiv = $(this).closest('.warranty-type');
                        var targetSelector = $(this).data('target');
                        if (!config.isMobile) {
                        	/* LGEDE-1805 20160720 modify*/
                            if(typeof targetSelector!=="undefined"){
                                $warrantyDiv.find('[name=' + targetSelector + ']').prop('disabled', false).attr('disabled', false).data().chosen.search_field_disabled();
                            }
                            /* //LGEDE-1805 20160720 modify*/   
                        } else {
                            $warrantyDiv.find('[name=' + targetSelector + ']').prop('disabled', false).attr('disabled', false);
                        }
                        $warrantyDiv.find('[name=' + targetSelector + ']').attr('required', 'required');
                    });
                });

                $('.repair-service-type').find('.date-choice').each(function() {
                    var self = $(this);
                    /* LGEDE-1805 20160720 modify*/
                    if($(this).find('.selectbox').length){
                        $(this).find('.selectbox').eq(0).on('change', function() {
                            self.find('[data-provide=datepicker]').attr('disabled', false);
                        });
                    }else{
                        $(this).find('[data-provide=datepicker]').eq(0).on('change', function() {
                            self.find('[data-provide=datepicker]').attr('disabled', false);
                        });
                    }
                    /* //LGEDE-1805 20160720 modify*/
                });
            });
            
            /* LGEGMO-1615 START */
            // option excute handler
            // load local.js after excute option 
            $('.schedule-repair').on('optionExcute', function() {
                // onLoadPop excute
                if (!!$('.step-list').data('onloadPop')) {
                    $('.step-list').trigger('onLoadPop');
                }
            });
            /* LGEGMO-1615 END */
            zipcodeSearch();
            /* LGEGMO-1615 START */
            // set option function 
            optionInit();
            /* LGEGMO-1615 END */
            /*LGECN-2073 20160923 add*/
            if(_this.hasClass("integration")){
                
                if (_this.find('.tabs').length > 0) {
                    _this.find('.tabs').each(function() {
                        _visible_idx = 0;
                        $(this).find('> li').each(function(){
                            var _t = $(this);
                            if (_t.index() > -1 && !_t.hasClass('hide')) {
                                _visible_idx++;
                                _left = _t.find('a.tab').outerWidth() * _visible_idx - _t.find('a.tab').outerWidth() - (_visible_idx - 1);
                                _t.find('a.tab').css('left', _left);
                            }
                        })
                    });
                }
                
                $(".repair-service-type li").removeClass();
                if($("html").hasClass("ie")){
                    setTimeout(function(){
                        $(".repair-service-type li").not(".hide").eq(0).children("a[data-tab]").click()
                    },1000)
                }else{
                    $(window).load(function(){
                        $(".repair-service-type li").not(".hide").eq(0).children("a[data-tab]").click()
                    });
                }
            }    
            /*// LGECN-2073 20160923 add*/

            /* PJTBTOBCSR-138 start */
            if(btbCheck){
                _this.find('button[data-chg-aciton]').on('click', $.proxy(ChangeEvent, this));
            }
            /* PJTBTOBCSR-138 end */
            
            /* LGECI-2884 20170601 add */
            if (lgFilter.locale =="/ca_en" || lgFilter.locale =="/ca_fr") {            	
            	_this.find('#step01').on('change', 'input[name=purchasedDate]', $.proxy(oowCheck, this));
            }
            /*// LGECI-2884 20170601 add */
            
            
        }
        function repairTabInit(current, succcessCB) {   // /* LGEGMO-1615 succcessCB add */
            /* PJTBTOBCSR-138 start */
            var obj = $('.step-list > article.step:visible').eq(current);
            if(btbCheck){    
                var formEl = obj.find("div[data-target]").length > 0 ? obj.find('div[data-target="' + $(element).data('view') +'"] form') : obj.find("form");
            } else {
                var formEl = obj.find("form");
            }
            var param = formEl.serializeArray();
            /* PJTBTOBCSR-138 end */
            var addParam = (formEl.data("dependency") ? $(formEl.data("dependency")).find("form").serializeArray() : {});
            
            if (obj.data("bypass")) {
                
            } else {
                $.ajax({
                    url: obj.data("url"),
                    data: XSSfilters($.merge(param, addParam)),
                    dataType: "json",
                    //type: "get",
                    beforeSend: function(data) {

                    },
                    success: function(data) {
                        if (data.result) {
                            for (var key in data) {
                                if (key == "tab") {
                                    for (var keyname in data[key]) {
                                        /* PJTBTOBCSR-138 start */
                                        var tabEl = $(".tabs[data-tabs='" + keyname + "']", element);

                                        var idx = 0;
                                        var tabArray = data[key][keyname];
                                        tabEl.each(function(){
                                            var tabChild = $(this).children("li");
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
                                            $(this).children("li").not('.hide').eq(0).children('a[data-tab]').trigger('click');
                                        })
                                        /* PJTBTOBCSR-138 end */
                                    }
                                }
                            }

                            
                            if (obj.find("#receiptNum").length) {
                                $.modal.close();
                            }
                            
                            /* LGEGMO-1615 START */
                            // step1 model change 
                            // open repair type step
                            
                            /* PJTBTOBCSR-138 start */
                            if(btbCheck){
                                stepEditStart(2,3);
                            } else {
                            	/* LGECS-982 add start */
                            	if($('.step-list > article.step').hasClass('active')) {
                            		succcessCB();
                            	}
                            	/*//LGECS-982 add end */
                                $('.repair-service-type .edit-btn').trigger('click');
                            }
                            /* PJTBTOBCSR-138 end */
                            
                            $("html, body").stop().delay(100).animate({
                                scrollTop: $('.repair-service-type').offset().top
                            });
                            var contactInformationStepIndex = $('.step-list > article.step:visible').index($('article.contact-information'));
                            stepReset(contactInformationStepIndex);
                            succcessCB();    
                            /* LGEGMO-1615 END */
                            
                            
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

                        
                    },
                    complete: function(data) {

                    },
                    error: function(xhr, msg) {
                        modalAlert(msg);
                        
                    }
                });
            }

        }

        /**
         * stepChange 
         * @param current {Num}  step current index
         * @param next {Num}  step next index
         * @param data {JSON}  current step ajax response
         */
        function stepChange(current, next, data) {
            var currentStep = $('.step-list > article.step:visible').eq(current);
            var upNow = currentStep.height();
            var _this = $('.step-list > article.step:visible').length == next ? $('.step.step-review') : $('.step-list > article.step:visible').eq(next);
            var repairType = _this.find("[data-tabs='repairType']");

            if (data) {
                for (var key in data) {

                    if (key == "tab") {
                        for (var keyname in data[key]) {
                            /* PJTBTOBCSR-138 start */
                            var tabEl = $(".tabs[data-tabs='" + keyname + "']", element);

                            var idx = 0;
                            var tabArray = data[key][keyname];
                            tabEl.each(function(){
                                var tabChild = $(this).children("li");
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
                                $(this).children("li").not('.hide').eq(0).children('a[data-tab]').trigger('click');
                            })
                            /* PJTBTOBCSR-138 end */
                        }

                    } else if (key != "result") {
                        
                        /* LGEES-2336 : 20160415 modify */
                        var field = _this.find("form")[0][key] || $("[name='" + key + "']", element)[0];
                        var _alphaArray = [];                        
                        
                        if (typeof field !== "undefined") {
                            switch (field.tagName) {
                                case "SELECT":
                                    if ($(field).length > 0) {
                                        for (var i = field.options.length - 1; i >= 0; i--) {
                                            if (field[i].value != "" && field[i].text != "") field.remove(i);
                                        }
                                    }
                                    
                                    if (_this.find(".alphabetSort").length) {
                                        $.each(data[key],function(index,value){
                                            _alphaArray.push({
                                                sortKey:index,
                                                sortVal:value
                                            });
                                        });
                                        _alphaArray.sort(function(a, b){
                                            return(a.sortVal < b.sortVal)?-1 : (a.sortVal > b.sortVal) ? 1:0
                                        });
                                                                                
                                        for (var opt in _alphaArray) {
                                            var option = document.createElement('option');
                                            option.value = _alphaArray[opt]["sortKey"];
                                            option.text = _alphaArray[opt]["sortVal"];
                                            field.add(option);  
                                        }
                                        
                                    } else {
                                        for (var opt in data[key]) {
                                        var option = document.createElement('option');
                                            option.value = opt;
                                            option.text = data[key][opt];
                                            field.add(option);
                                        }
                                    }
                                    
                                    $(field).trigger("chosen:updated.chosen");

                                    break;
                                case "INPUT":

                                    break;
                            }
                        }
                        /*//LGEES-2336 : 20160415 modify */

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
            currentStep.find('.edit-btn').show();
            /*if (!!currentStep.data('saveData')) {
                currentStep.addClass('edit-able');
                
            }*/

            _this.find("input,select,textarea").removeClass("error");

            if (_this.length) {
                //_this.find($('.step-list > article.step:visible .step-content')).show();
                _this.find('.step-content').show();
                _this.find('.edit-btn').hide();

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
                        
                        /* LGECI-3011 20170912 add */
                        if ( (lgFilter.locale =='/ca_en' || lgFilter.locale =='/ca_fr') && _this.attr("id") == "step04" && $(".hiddenFlag").length != 0) {
                        	function stepNum(step) {
                            	/*var step1 = $("article#step0"+ step +" .step-bar").text().trim().split(" ");
                            	step1[1] = Number(step1[1]) - 1;
                            	var step2 = step1.join(" ");
                            	$("article#step0"+ step +" .step-bar").text(step2);*/
                            	
                            	var num = $("article#step0"+ step).find($(".step-lan")).text() + " " + (step-1);
                            	$("article#step0"+ step +" .step-bar").text(num);
                        	}
                        	
                        	_this.find(".ci-mobile-4step").attr("style", "display:block");
                        	$("article#step03").addClass("hidden");
                        	stepNum(4);
                        	stepNum(5);
                        	/*$("article#step04 .step-bar").text("Step 3");
                        	$("article#step05 .step-bar").text("Step 4");*/
                        	$("#policy-agree-onsite").prop("checked", true);
                        	$("article#step01").addClass("was_mobile");
                        	
                        } else {
                        	_this.find(".ci-mobile-4step").attr("style", "display:none");
                        	
                        	/* LGEBR-3712 : 20180524 add */
                        	if(lgFilter.locale =="/br" && $(".step-result").find(".model-name").attr("policyType") == "carryinMC"){
                            	$(".txt-policy.mc").css({display:'block'});
                            	$(".txt-policy.mc").prev(".txt-policy").css({display:'none'});
                            } else {
                            	$(".txt-policy.mc").prev(".txt-policy").css({display:'block'});
                            	$(".txt-policy.mc").css({display:'none'});
                            }
                        	/*//LGEBR-3712 : 20180524 add */
                        }
                        /* //LGECI-3011 20170912 add */

                        /* PJTBTOBCSR-138 start */
                        if (_this.find('.tabs').length > 0) {
                            _this.find('.tabs').each(function() {
                                _visible_idx = 0;
                                $(this).find('> li').each(function(){
                                    var _t = $(this);
                                    if (_t.index() > -1 && !_t.hasClass('hide')) {
                                        _visible_idx++;
                                        _left = _t.find('a.tab').outerWidth() * _visible_idx - _t.find('a.tab').outerWidth() - (_visible_idx - 1);
                                        _t.find('a.tab').css('left', _left);
                                    }
                                })
                            });
                        }
                        /* PJTBTOBCSR-138 end */

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

                        _this.data('editAble', true);

                        editIdx = next;
                    }
                });
                
                currentStep.addClass("edit-able edit-before");
            }

        }
        
        /**
         * stepEditStart 
         * @param current {Num}  current step index
         * @param idx {Num}  before opened step index
         */
        function stepEditStart(current, idx) {
            var currentStep = $('.step-list > article.step:visible').eq(current);
            var currentStepContent = currentStep.find($('article.step:visible .step-content'));
            var beforeCurrent = $('.step-list > article.step:visible').eq(idx);
            var repairType = currentStep.find("[data-tabs='repairType']");
            var focusField;
            var firstElement = currentStepContent.find("a:visible, input:not([disabled='disabled']), button, textarea, *[tabindex='0']").filter(':first');

            firstElement = firstElement.hasClass('chosen-single') ? firstElement.parent().find('input') : firstElement;

            //var isNextStepSaved = !!currentStep.next().data('saveData');

            var isYourProductChoice = currentStep.hasClass("product-choice");
            var isProductSymtom = currentStep.hasClass("product-symptom");
            var isRepairType = currentStep.hasClass("repair-service-type");
            var isContactInformation = currentStep.hasClass("contact-information");

            // data reset
            /*if (current == 0) {

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
            }*/

            currentStep.removeClass("edit-able");
            if (current != idx) {
                if (!!beforeCurrent.data('saveData')) {
                    beforeCurrent.addClass("edit-before");
                }
            }

            currentStep.siblings().each(function() {
                if ($(this).hasClass("edit-before")) {
                    $(this).addClass("edit-able")
                }

                if (!!$(this).data('editAble')) {
                    $(this).find('.edit-btn').show();
                }
            });

            currentStep.addClass("active done").find($('article.step:visible .step-content')).show();
            currentStep.siblings().removeClass("active done").find($('article.step:visible .step-content')).hide();
            currentStep.siblings().find("input,select,textarea").removeClass("error");
            currentStep.find('.edit-btn').hide();

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

            if (!!beforeCurrent.data('saveData')) {
                stepLoad(idx);
                if (current != idx) {
                    beforeCurrent.addClass('edit-able');
                }
            }

            $("article.step.step-review:visible").hide();
            editIdx = current;

            if (!isContactInformation && !$(el).hasClass("integration")) {
                if (!!currentStep.data('editAble') && !!currentStep.data('saveData')) {
                    currentStep.find('button[type=submit]').addClass('hidden');
                    currentStep.find('[data-stepsave-btn]').removeClass('hidden');
                }
            }


            // show next step button
            /*if (!isNextStepSaved) {
                currentStep.find('button[type=submit]').removeClass('hidden');
                currentStep.find('[data-stepsave-btn]').addClass('hidden');
            }*/

        }

        /**
         * stepClose 
         * @param current {Num}  close step index
         */
        function stepClose(current, isScroll) { // LGEGMO-1615 isScroll add
            var currentStep = $('.step-list > article.step:visible').eq(current);
            currentStep.removeClass('active done');
            if (!!currentStep.data('saveData')) {
                currentStep.addClass('edit-able');
                currentStep.find('.edit-btn').show();
            } else {
                currentStep.removeClass('edit-able');
            }
            /* LGEGMO-1615 START */
            if (!!isScroll) {
                $("html, body").stop().delay(100).animate({
                    scrollTop: currentStep.offset().top
                });    
            }
            /* LGEGMO-1615 END */
        }

        /**
         * stepSave 
         * @param current {Num}  save step index
         */
        function stepSave(current) {

            var inputArray = [];
            var currentStep = $('.step-list > article.step:visible').eq(current);
            if(btbCheck){    
                var btbcurret = currentStep.find("div[data-target]").length > 0 ? currentStep.find('div[data-target="' + $(element).data('view') +'"]') : currentStep;
            } else {
                var btbcurret = currentStep;
            }
 
            var isYourProductChoice = btbcurret.hasClass("product-choice");
            var isProductSymtom = btbcurret.hasClass("product-symptom");
            var isRepairType = btbcurret.hasClass("repair-service-type");
            var isContactInformation = btbcurret.hasClass("contact-information");

            btbcurret.find(':input').not('button').each(function() {

                if (!!$(this).data('nosave')) return;

                // checkbox
                if ($(this).is(':checkbox')) {
                    inputArray.push({
                        checked: $(this).is(':checked'),
                        obj: $(this)
                    });
                    return;
                }

                // radio
                if ($(this).is(':radio')) {
                    inputArray.push({
                        checked: $(this).is(':checked'),
                        obj: $(this)
                    });
                    return;
                }

                // select chosen
                if (!!$(this).data('chosen')) {
                    inputArray.push({
                        selectedIndex: $(this).prop('selectedIndex'),
                        value: $(this).val(),
                        optionsArray: $(this).find('option').toArray(),
                        obj: $(this)
                    });
                    return;
                }

                // select not chosen
                if (this.nodeName == 'SELECT') {
                    inputArray.push({
                        selectedIndex: $(this).prop('selectedIndex'),
                        value: $(this).val(),
                        optionsArray: $(this).find('option').toArray(),
                        obj: $(this)
                    });
                    return;
                }

                inputArray.push({
                    value: $(this).val(),
                    obj: $(this)
                });
            });
            currentStep.data('saveData', inputArray);
            
        }
        /**
         * stepLoad 
         * @param current {Num}  save step index
         */
        function stepLoad(current) {
            var currentStep = $('.step-list > article.step:visible').eq(current);
            var isYourProductChoice = currentStep.hasClass("product-choice");
            var isProductSymtom = currentStep.hasClass("product-symptom");
            var isRepairType = currentStep.hasClass("repair-service-type");
            var isContactInformation = currentStep.hasClass("contact-information");

            if (!currentStep.data('saveData')) return;

            $.each(currentStep.data('saveData'), function() {
                var self = this.obj;

                // select chosen
                if (!!this.obj.data('chosen')) {
                    if (this.value != this.obj.val()) {
                        this.obj.empty();
                        $(this.optionsArray).each(function() {
                            self.append(this);
                        });
                        this.obj.val(this.value);
                        this.obj.prop('selectedIndex', this.selectedIndex);
                        this.obj.data('chosen').results_update_field();
                    }
                    return;
                }

                // icheck checkbox radio
                if (!!this.obj.data('iCheck')) {
                    this.obj.attr('checked', this.checked);
                    if (this.checked) {
                        this.obj.iCheck("check").iCheck("update");
                    } else {
                        this.obj.iCheck("uncheck").iCheck("update");
                    }
                    return;
                }

                // not icheck checkbox radio
                if (this.obj.is(':checkbox')) {
                    this.obj.attr('checked', this.checked);
                    return;
                }

                // select not chosen
                if (this.obj[0].nodeName == 'SELECT') {
                    this.obj.empty();
                    $(this.optionsArray).each(function() {
                        self.append(this);
                    });
                    this.obj.val(this.value);
                    this.obj.prop('selectedIndex', this.selectedIndex);
                    return;
                }
                
                /* LGECI-2884 20170601 add */
                //$('.step-list > article.step:visible').eq(0).data('saveData')
                if((lgFilter.locale =='/ca_en' || lgFilter.locale =='/ca_fr') && this.obj[0].id == 'repair-purchased-date'){
                	if(this.obj[0].value != this.value){                		
                		oowCheck(this.value);
                	}else{
                	}
                }
                /*// LGECI-2884 20170601 add */
                
                this.obj.val(this.value);

            });
            //console.log('loadData', currentStep.data('saveData'));
        }
        /**
         * stepResult
         * @param current {Num}  set result step index
         */
        function stepResult(current) {
            var currentStep = $('.step-list > article.step:visible').eq(current);
            var currentStepForm = currentStep.find('div[data-target="' + $(element).data('view') +'"]');
            var resultData = currentStep.find(".step-result");
            var target = resultData.find("[data-result]");
            var targetJoin = resultData.find("[data-result-join]");
            var targetName = [];

            var targetVal;

            var isRequestRepair = $(el).hasClass('schedule-repair');
            var isYourProductChoice = currentStep.hasClass("product-choice");
            var isProductSymtom = currentStep.hasClass("product-symptom");
            /*LGECN-2073 20160923 modify*/
            if (currentStep.hasClass("repair-service-type") || ($(el).hasClass("integration") && currentStep.find(".repair-service-type").length)){ 
                var isRepairType = true;
            }else{
                var isRepairType = false;
            }
            /*//LGECN-2073 20160923 modify*/
            //var isRepairType = currentStep.hasClass("repair-service-type");
            var isContactInformation = currentStep.hasClass("contact-information");
            /* LGECS-710 20170411 add*/
            var isCallAppointment=$(el).hasClass("call-appointment");
            /* LGECS-710 20170411 add*/
            target.each(function() {
                var _this = $(this);

                /* PJTBTOBCSR-138 start */
                var targetNames = currentStepForm.length > 0 ? currentStepForm.find("[name='" + _this.data("result") + "']") : currentStep.find("[name='" + _this.data("result") + "']");
                /* PJTBTOBCSR-138 end */
                //console.log(_this.data("result"), targetNames.length);
                if (targetNames.length) {
                    if (isYourProductChoice) {
                        _this.closest('span.list').show();
                    }

                    if (isContactInformation) {
                        _this.closest('li').show();
                    }
                } else {
                    if (isYourProductChoice) {
                        _this.closest('span.list').hide();
                    }

                    if (isContactInformation) {
                        _this.closest('li').hide();
                    }
                }
                targetNames.each(function(i) {
                    // Only Active PurchaseInfo
                    var isPurchaseInput = $(this).closest('[id^=purchaseInfoType]').length ? true : false;
                    if (isPurchaseInput) {
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
                        /* LGECS-710 20170411 modify*/
                    } else if (isContactInformation&& !isCallAppointment) {
                    	/*//LGECS-710 20170411 modify*/
                        if ($(this).closest('form.validateForm').hasClass('active')) {
                            targetName = $(this)[0];
                            if (targetName.value != '') {
                                _this.closest('li').show();
                            } else {
                                _this.closest('li').hide();
                            }
                        } else {
                            targetName = false;
                            if (targetNames.length == 1) {
                                _this.closest('li').hide();
                            }
                        }
                    } else {
                        targetName = $(this)[0];
                    }

                    if ($(targetName).is(':input')) {
                        if (targetName.tagName == "SELECT") {
                            //targetVal = $(targetName).find("option:selected:not(':disabled')").text();
                            targetVal = $(targetName).find("option:selected").text();
                        } else if (targetName.tagName == "TEXTAREA") {
                            targetVal = $(targetName).val().replace(/\n/g, "<br>");

                        } else {
                            targetVal = XSSfilter(targetName.value);
                        }
                    } else {
                        targetVal = false;
                    }

                    if (isPurchaseInput) {
                        if ($(this).closest('[id^=purchaseInfoType]').hasClass('active')) {
                            _this.html(targetVal);
                        }
                    } else {
                        if (targetVal != false) {
                            if (isContactInformation) {
                                if ($(this).closest('form.validateForm').hasClass('active')) {
                                    _this.html(targetVal);
                                }
                            } else {
                                _this.html(targetVal);
                            }
                        }
                    }
                });

            });

            targetJoin.each(function(idx) {
                var _this = $(this);
                var joinName = '';

                /* PJTBTOBCSR-138 start */
                var currentForm = currentStepForm.length > 0 ? currentStepForm : currentStep;
                /* PJTBTOBCSR-138 end */

                targetName = _this.data("result-join").split("/");
                for (var i = 0; i <= targetName.length - 1; i++) {
                    var tagName;
                    if (isContactInformation && isRequestRepair) {
                        /* PJTBTOBCSR-138 start */
                        tagName = currentForm.find("form.active [name='" + targetName[i] + "']")[0];
                        /* PJTBTOBCSR-138 end */
                    } else {
                        /* PJTBTOBCSR-138 start */
                        tagName = currentForm.find("[name='" + targetName[i] + "']")[0];
                        /* PJTBTOBCSR-138 end */
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

                if (!!joinName.length) {
                    if (isContactInformation) {
                        _this.closest('li').show();    
                    }
                    _this.html(joinName);   
                } else {
                    if (isContactInformation) {
                        _this.closest('li').hide();    
                    }
                }
                
            });

            // Repair Service result
            if (isRepairType && isRequestRepair) {
                /* PJTBTOBCSR-138 start */
                var activeTab = btbCheck ? $("[data-target]:visible [data-tabs='repairType'] > li.active") : $("[data-tabs='repairType'] > li.active");
                var serviceText = activeTab.children('.tab').children().text();
                var serviceId = activeTab.find("article > div").attr('id');
                var warrantyTypeId = activeTab.find('.warranty-type').attr('id');
                var resultData = activeTab.closest("form").find(".step-result");
                /* PJTBTOBCSR-138 end */

                // Ship in Service
                if (serviceId == "shipInService") {
                    var result = '<dl><dt>' + serviceText + '</dt></dl>';
                    if($(el).hasClass("integration")){
                        resultData.find(".repair-result").html(result)
                    }else{
                        resultData.find('.inner').html(result);
                    }
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
                        if($(el).hasClass("integration")){
                            resultData.find(".repair-result").html(result)
                        }else{
                            resultData.find('.inner').html(result);
                        }
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
                        if($(el).hasClass("integration")){
                            resultData.find(".repair-result").html(result)
                        }else{
                            resultData.find('.inner').html(result);
                        }
                    }

                    // no service
                    if (!warrantyTypeId) {
                        var result = '<dl><dt>' + serviceText + '</dt><dd></dd></dl>';
                        if($(el).hasClass("integration")){
                            resultData.find(".repair-result").html(result)
                        }else{
                            resultData.find('.inner').html(result);
                        }
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

                    if($(el).hasClass("integration")){
                        resultData.find(".repair-result").html(result)
                    }else{
                        resultData.find('.inner').html(result);
                    }

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

                        if($(el).hasClass("integration")){
                            resultData.find(".repair-result").html(result)
                        }else{
                            resultData.find('.inner').html(result);
                        }
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

                        if($(el).hasClass("integration")){
                            resultData.find(".repair-result").html(result)
                        }else{
                            resultData.find('.inner').html(result);
                        }
                    }

                    // no service
                    if (!warrantyTypeId) {
                        var result = '<dl><dt>' + serviceText + '</dt><dd></dd></dl>';
                        resultData.find('.inner').html(result);
                    }
                }

            }

        }


        /**
         * stepValidate 
         * @param current {Num}  close step index
         * @return {Boolean}
         * before submit step validate
         */
        function stepValidate(current) {
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
            
            // redmine 16274 start
            // old model browser search click check 
            if ($('.choice-product').hasClass('focus-number') && keyword.length) {
                if (!$('#modelVerify').hasClass('pass')) {  
                    keyword.addClass("error").trigger("focus").siblings("span.msg-error").css({
                        bottom: keyword.outerHeight(true) + (keyword.is("[type='checkbox'],[type='radio']") ? 15 : 5)
                    }).html("<i class='icon icon-error'></i>" + keyword.data("validModelMsg")).parent("span").css("position", "relative");
                    return false
                }
            }
            // redmine 16274 end

            // start LGEGMO-1741
            if ($('.model-browser').length) {
                if (!$('.model-browser').hasClass('open')) {
                    $('#keyword').addClass("error").trigger("focus").siblings("span.msg-error").css({
                        bottom: $('#keyword').outerHeight(true) + ($('#keyword').is("[type='checkbox'],[type='radio']") ? 15 : 5)
                    }).html("<i class='icon icon-error'></i>" + $('#keyword').data("validModelMsg")).parent("span").css("position", "relative");
                    return false;
                }
            }
            // end LGEGMO-1741

            // schedule repair && repair service type
            if (isRepairType && isRequestRepair) {
                if (input.is(":visible") && input.length && !input.data("searchZipCode")) {
                    input.addClass("error").trigger("focus").siblings("span.msg-error").css({
                        bottom: input.outerHeight(true) + 5
                    }).html("<i class='icon icon-error'></i>" + input.data("validZipcodeMsg")).parent("span").css("position", "relative");

                    return false
                }

                var repairTypeActive = $("[data-tabs='repairType'] > li.active");
                var repairTypeName = repairTypeActive.data('repair-type');

                //radio checked validation
                var hasRadio = repairTypeActive.find('.warranty-type:visible').find('.dmsAble:visible [type=radio]').length > 0 ? true : false;
                var hasZipCodeInput = repairTypeActive.find('.warranty-type:visible').find('.search-zip').length > 0 ? true : false;
                var isUnavailable = repairTypeActive.find('.unavailable-product').is(':visible');
                var zipCodeInput;

                if (hasZipCodeInput) {
                    zipCodeInput = repairTypeActive.find('.warranty-type:visible').find('.search-zip');
                    var m = zipCodeInput.closest('.repair-service-type');
                    if (hasRadio) {
                        if (!repairTypeActive.find("[type=radio]:checked").length) {
                            var checkMsg;
                            if (!!zipCodeInput.attr('data-centerrequire-msg')) {
                                checkMsg = m.attr('data-centerrequire-msg');
                                modalAlert(checkMsg, true);
                            } else {
                                checkMsg = m.attr('data-centerrequire-msg');
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
            }

            return true;
        }
        /**
         * stepSubmitBefore 
         * @param {Num}  step index
         * @return {Boolean}
         * step validate after process
         */
        function stepSubmitBefore(current) {
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

            
            /**
             * step next before popup
             * @attr data-nextbefore-pop="{string}"  has rel="[modal:open]" jquery selecter
             * @example
             * <article class="step product-choice" data-nextbefore-pop="#modaltrigger">
             */
            if (!!obj.data('nextbeforePop')) {
                var $popupTrigger = $(obj.data('nextbeforePop'));
                if ($popupTrigger.length) {
                    var isAgree = $popupTrigger.data('policyAgree') == true ? true : false;
                    if (!isAgree) {
                        obj.trigger('nextBeforePop', [$popupTrigger, current]);
                        return false;
                    }
                }
            }
            

            if (isRepairType) {
                var hiddenTarget = repairType.find("li.active").data("repair-type");
                var target = $(".view-content");

                $('.contact-information').find(target).each(function() {
                    if ($(this).hasClass(hiddenTarget)) {
                        $('.contact-information').find(target).hide();
                        $(this).show();
                    }
                });
            }


            if (isRepairType) {

                var repairTypeActive = $("[data-tabs='repairType'] > li.active");
                var repairTypeName = repairTypeActive.data('repair-type');

                var hasRadio = repairTypeActive.find('.warranty-type:visible').find('.dmsAble:visible [type=radio]').length > 0 ? true : false;
                var hasZipCodeInput = repairTypeActive.find('.warranty-type:visible').find('.search-zip').length > 0 ? true : false;
                var isUnavailable = repairTypeActive.find('.unavailable-product').is(':visible');

                // contact infomation form change
                var $infomationForms = $('.contact-information').find('.contact-info form[data-contact-type]');
                if ($infomationForms.length) {
                    if ($infomationForms.filter('[data-contact-type=' + repairTypeName + ']').length) {
                        $infomationForms.hide().removeClass('active');
                        $infomationForms.filter('[data-contact-type=' + repairTypeName + ']').show().addClass('active');
                    } else {
                        $infomationForms.hide().removeClass('active');
                        $infomationForms.filter('[data-contact-type=public]').show().addClass('active');
                    }
                }

                if (repairTypeName == 'onsite') {

                    $('.schedule-repair').trigger('stepSubmitBefore:repairType:onsite', [repairTypeActive]);
                   
                }

                if (repairTypeName == 'installation') {

                    $('.schedule-repair').trigger('stepSubmitBefore:repairType:installation', [repairTypeActive]);
                    
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

            } else {
                /*var $infomationForms = $('.contact-information').find('.contact-info form[data-contact-type]');
                if ($infomationForms.length) {
                    $infomationForms.hide().removeClass('active');
                    $infomationForms.filter('[data-contact-type=public]').show().addClass('active');
                }*/

                // selected service type submit text change
                /*var $submitTexts = $submitModal.find('p[data-service-type]');
                if ($submitTexts.length > 0) {
                    $submitTexts.hide().filter('[data-service-type=common]').show();
                }*/
            }

            return true;
        }


        function stepSubmit(current) {
            var obj = $('.step-list > article.step:visible').eq(current);
            /* PJTBTOBCSR-138 start */
            var param = obj.find("form:visible").serializeArray();
            var formEl = obj.find("form:visible");
            var addParam = (formEl.data("dependency") ? $(formEl.data("dependency")).find("form:visible").serializeArray() : {});
            /* PJTBTOBCSR-138 end */
            var submitBtn = obj.find("[type='submit']");

            if (obj.data("bypass")) {
                stepChange(current, current + 1);
                stepResult(current);
                obj.data('editAble', true);
                stepSave(current);
            } else {
            	/* LGECI-2884 20170531 add */
            	if((lgFilter.locale =='/ca_en' || lgFilter.locale =='/ca_fr') && $('#step01').hasClass('active')){
                	if($('.msg-error-oow').is(':visible')){
                		/* LGECI-2957 modify */
                		//$(location).attr('href',$('.one-price-program').text());
                		//window.open($(".one-price-program").text(),'_one-price-program');
                		window.open($(".one-price-program:visible").text(),'_one-price-program');	/* LGECI-3011 20170912 add */
                		/*//LGECI-2957 modify */
                		return;
	                }                    		                    
                }            	
            	/*// LGECI-2884 20170531 add */
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
                        	if ( $(".hiddenFlag").text() == "mobile" && current == 1 ) {
                        		stepChange(current, current + 2, data);
                        	} else {
                        		stepChange(current, current + 1, data);
                        	}
                            //stepChange(current, current + 1, data);
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
                        obj.data('editAble', true);
                        stepSave(current);
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
        
        /* LGECI-2884 20170531 add */
        function oowCheck(purchasedDate){
        	var labor = $('input[name=warrantyInfoLaborForMonth]').val();
    		
    		if(labor == '0' || labor == ''){
    			$('.msg-error-oow').attr('style','display:none');
    			return;
    		}
    		if(typeof purchasedDate != 'string'){
    			purchasedDate = $('input[name=purchasedDate]').val();
    		}
    		if(purchasedDate == ''){
    			return;
    		}
    		
    		labor = Number(labor) / 12 * 365;
    		
    		var dt1 = new Date();
    		var dt2 = new Date(purchasedDate);
    		var day = 1000 * 60 * 60 * 24;
    		var diff = dt1 - dt2;
    		var gap = parseInt(diff/day);
    		var leapMonth = 0;
    		
    		for(var i=dt2.getFullYear(); i<=dt1.getFullYear(); i++){ //leapMonth
    			if(i%4==0 && i%100!=0 || i%400==0 ) {
    				if(dt1.getFullYear() == i){
        				if((dt1.getMonth()+1) > 2){
        					leapMonth++;
        				}
        			}else if(dt2.getFullYear()  == i){
        				if((dt2.getMonth()+1) <= 2){
        					leapMonth++;
        				}
        			}else{
        				leapMonth++;
        			}
    			}
    			    			
    		}
    		gap = gap - leapMonth;
    		
    		if(labor < gap){
    			/* LGECI-3011 20170912 add */
    			//$('.msg-error-oow').attr('style','display:block');
                if ( $(".hiddenFlag").text() == "mobile" ) {
                	$(".msg-error-oow.mobile").attr("style", "display:block") 
				} else {
					$('.msg-error-oow:not(.mobile)').attr('style','display:block');
				}
                /* //LGECI-3011 20170912 add */
    			// save btn hidden
    			if($('#step02 .edit-btn').is(':visible')){
    				$('#step01').find('button[type=submit]').removeClass('hidden');
                    $('#step01').find('[data-stepsave-btn]').addClass('hidden');	
    			}    			
    		}else{
    			$('.msg-error-oow').attr('style','display:none');
    			// save btn hidden
    			if($('#step02 .edit-btn').is(':visible')){
    				$('#step01').find('button[type=submit]').addClass('hidden');
                    $('#step01').find('[data-stepsave-btn]').removeClass('hidden');
    			}    			
    		}
    		
    		
    		/* LGECI-2957 add */
			var _submitBtn_ = $('#step01').find('button[type=submit]');
			$('#step01 input[data-provide=datepicker]').change(function() {
				var _title_ = (lgFilter.locale != "/ca_fr")?'When you select this button, the Step 2 will be opened':'Sélectionner ce bouton vous permet de passer à l’étape 2.';
				if($('.msg-error-oow').is(':visible')){
					_title_ = (lgFilter.locale != "/ca_fr")?'Opens in a new window':'S’ouvre dans une nouvelle fenêtre';
				}else {
					_title_ = (lgFilter.locale != "/ca_fr")?'When you select this button, the Step 2 will be opened':'Sélectionner ce bouton vous permet de passer à l’étape 2.';
				}
				_submitBtn_.attr('title',_title_);
			});
			/*//LGECI-2957 add */
        }
        /*// LGECI-2884 20170531 add */

        function stepReset(current) {
            
            var currentStep;
            var resetEl = $(".warranty-type");
            var resetData = $(".step-result");

            if (current == 0) {
                $('.step-list > article.step:visible').data('reset', true);
                currentStep = $('.step-list > article.step:visible').eq(current);
            } else {
                $('.step-list > article.step:visible').data('reset', false);
                currentStep = $('.step-list > article.step:visible').eq(current).data('reset', true);
            }

            $('.step-list > article.step:visible').each(function(idx) {
                var _this = $(this);

                var isYourProductChoice = _this.hasClass("product-choice");
                var isProductSymtom = _this.hasClass("product-symptom");
                var isRepairType = _this.hasClass("repair-service-type");
                var isContactInformation = _this.hasClass("contact-information");

                if (_this.data("reset")) {

                    if (isRepairType) {
                        _this.find(dmsAble, dmsAvailable).hide();
                        //_this.find('.unavailable-product').hide();
                    }

                    if (isContactInformation) {
                        _this.removeClass("edit-able edit-before");
                        _this.find('.edit-btn').hide();

                        if (!!_this.data('saveData')) {
                            _this.data('saveData', false);
                        }
                        return;
                    }

                    _this.removeClass("edit-able edit-before");

                    // step1
                    if (isYourProductChoice) {
                        _this.find("input").not('button').each(function() {
                            if (!!$(this).data('noreset')) {
                                return;
                            }
                            $(this).val('');
                        });
                        
                    } else {
                        /* PJTBTOBCSR-138 start */
                        _this.find("form").each(function(){
                            this.reset();
                        })
                        /* PJTBTOBCSR-138 end */
                        _this.find(".selectbox").trigger("chosen:updated");
                    }

                    _this.find(".search-wrap").each(function() {
                        if ($(this).find("ul.chosen-results").find("li").length > 0)
                            _this.find(".selectbox").trigger("chosen:updated");

                    });


                    _this.find("input[type='checkbox'], input[type='radio']").iCheck("uncheck").iCheck("update");
                    _this.find(resetData).find("[data-result], [data-result-join]").text("");
                    _this.find("input,select,textarea").removeClass("error");
                    _this.find(".zip-code-result").empty();
                    _this.closest(".dispatch-content").find("#step02 button[type=submit]").attr("disabled", "disabled");
                    /* LGECS-710 20170411 add*/
                    if($(".step-list").hasClass("call-appointment")){
                    	_this.find(".two-column.time-date .selectbox").val("").removeProp("disabled").removeAttr("disabled").trigger("chosen:updated");
					}
                    /*//LGECS-710 20170411 add*/
                    // Repair type reset
                    /* LGECN-2073 20160923 modify*/
                    if (_this.hasClass('repair-service-type') ||  _this.find(".container").hasClass("repair-service-type")) {
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
                            var $warrantyDiv = $(this).closest('.warranty-type');
                            var targetSelector = $(this).data('target');
                            if (!config.isMobile) {
                                 /* LGEDE-1805 20160720 modify*/
                                if(typeof targetSelector!=="undefined"){
                                    $warrantyDiv.find('[name=' + targetSelector + ']').prop('disabled', true).attr('disabled', true).data().chosen.search_field_disabled();
                                }
                                 /* //LGEDE-1805 20160720 modify*/  
                            } else {
                                $warrantyDiv.find('[name=' + targetSelector + ']').prop('disabled', true).attr('disabled', true);
                            }

                            $warrantyDiv.find('[name=' + targetSelector + ']').attr('required', false);
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

                    _this.find('.edit-btn').hide();

                    // save btn hidden
                    _this.find('button[type=submit]').removeClass('hidden');
                    _this.find('[data-stepsave-btn]').addClass('hidden');
                    if (!!_this.data('saveData')) {
                        _this.data('saveData', false);
                    }
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
                    /* LGEBR-2896 20160516 add*/
                    var localeAddress2Text = _input.data('localeAddress2Text');
                    var localeAddress3Text = _input.data('localeAddress3Text');
                    var localeDistanceText = _input.data('localeDistanceText');
                    var localePostalText = _input.data('localePostalText');
                    var localeListMax = _input.data('localeListMax');
                    /*//LGEBR-2896 20160516 add*/
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

                    if (!!$('.schedule-repair').data('centerNodataDisableNext') || lgFilter.locale =='/br') {
                        dmsAvailable.find(':checkbox').on('change', function(e) {
                            var isChecked = $(this).is(':checked');
                            if (isChecked) {
                                _input.closest('[data-repair-type]').data('validZipCode', true);
                                _input.closest('article.step').find('button[type=submit]').attr('disabled', false);
                            } else {
                                _input.closest('[data-repair-type]').data('validZipCode', false);
                                _input.closest('article.step').find('button[type=submit]').attr('disabled', true);
                            }
                        });
                    }

                    submit.click(function(e, url) {
                        e.preventDefault();

                        // real time search step savedata reset
                        $(this).closest('article.step').data('saveData', false);

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
                                        errs.push(target);
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

                                        /*
                                        _input.closest('[data-repair-type]').data('validZipCode', true);
                                        _input.closest('article.step').find('button[type=submit]').attr('disabled', false);
                                        */

                                        // BR
                                        if (lgFilter.locale =='/br') {
                                            _input.closest('[data-repair-type]').data('validZipCode', true);
                                            _input.closest('article.step').find('button[type=submit]').attr('disabled', false);
                                        }
                                        // GP option
                                        if (!!$('.schedule-repair').data('centerNodataDisableNext')) {
                                            _input.closest('[data-repair-type]').data('validZipCode', true);
                                            _input.closest('article.step').find('button[type=submit]').attr('disabled', false);
                                        }

                                        // real service
                                        if (isOnsiteService || isInstallationService) {
                                             /* LGEBR-2896 20160516 modify*/
                                            setRealServiceDateTime({
                                                selectBox: centerlist_target.parent().siblings(".select-datentime"),
                                                centerListBox: centerlist_target.parent(),
                                                centerlist_target: centerlist_target,
                                                centerInfoList: data,
                                                dmsAble: dmsAble,
                                                localeDisableAddText: localeDisableAddText,
                                                localePhoneText: localePhoneText,
                                                localeAddressText: localeAddressText,
                                                localeAddress2Text:localeAddress2Text,
                                                localeAddress3Text:localeAddress3Text,
                                                localeDistanceText:localeDistanceText,
                                                localePostalText:localePostalText,
                                                localeListMax:localeListMax
                                            });
                                            /* LGEBR-2896 20160516 modify*/
                                            /*
                                            $.each(data["ascList"], function(k, v) {
                                                if (v["ascId"] == '' || v["serviceEngineerCode"] == '') {
                                                    return;
                                                }

                                                if (lgFilter.locale == '/br') {
                                                    zipcode_li = "<li>";
                                                    zipcode_li += "<input type=\"radio\" class=\"center-radio-select\" data-servicecode=\"" + v["serviceEngineerCode"] + "\" name=\"" + centerlist_target.find("ul").data("radio-name") + "\" value =\"" + v["ascId"] + "\">";
                                                    zipcode_li += "<a href=" + v["centerUrl"] + " target=\"_blank\" class=\"underline\" title=\"Open New Window\" >" + v["ascName"] + "</a>";
                                                    zipcode_li += "<div><span class=\"wrap\"><strong>" + localeAddressText + " :</strong>" + v["ascAddressInfo"] + "</span>";
                                                    zipcode_li += "<span class=\"wrap\"><strong>" + localePhoneText + " :</strong>" + v["ascPhoneNo"] + "</span></div>";
                                                    zipcode_li += "</li>";
                                                    centerlist_target.find("ul").append(zipcode_li);

                                                } else {
                                                    zipcode_li = "<li>";
                                                    zipcode_li += "<input type=\"radio\" class=\"center-radio-select\" data-servicecode=\"" + v["serviceEngineerCode"] + "\" name=\"" + centerlist_target.find("ul").data("radio-name") + "\" value =\"" + v["ascId"] + "\">";
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
                                                    setRealServiceDateTimeOLD({
                                                        selectBox: centerlist_target.parent().siblings(".select-datentime"),
                                                        serviceEngineerCode: $this.attr('data-servicecode'),
                                                        centerInfoList: data.ascList,
                                                        disableAddText: localeDisableAddText
                                                    });
                                                }
                                            });
                                            */

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
                                                var $form = centerlist_target.closest('form');
                                                var $this = $(this);
                                                var idx = $this.index();
                                                if ($this.is(':checked')) {
                                                    var url = centerlist_target.find("ul").data('url');
                                                    setCarryinDateTime({
                                                        selectBox: centerlist_target.parent().siblings(".select-datentime"),
                                                        centerId: $this.serializeArray(),
                                                        url: url,
                                                        form: $form,
                                                        disableAddText: localeDisableAddText
                                                    });
                                                }

                                                // hidden input set center data
                                                $form.children('input:hidden').not('[name=repair-service-type]').val('');
                                                for (var k in data.centerList[idx]) {
                                                    $form.children('input[name=carryin' + k + ']').val(data.centerList[idx][k]);
                                                }

                                            });
                                        }

                                    } else {
                                        dmsAble.hide();
                                        dmsAvailable.show();
                                        /*
                                        _input.closest('[data-repair-type]').data('validZipCode', false);
                                        _input.closest('article.step').find('button[type=submit]').attr('disabled', true);
                                        */
                                        
                                        // BR
                                        if (lgFilter.locale =='/br') {
                                            _input.closest('[data-repair-type]').data('validZipCode', false);
                                            _input.closest('article.step').find('button[type=submit]').attr('disabled', true);
                                        }
                                        // gp option
                                        if (!!$('.schedule-repair').data('centerNodataDisableNext')) {
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

        function setRealServiceDateTimeOLD(centerData) {
            var $centerTimeSelectBox = centerData.selectBox;
            var $dateSelect = $centerTimeSelectBox.find('#realServiceDate');
            var $timeSelect = $centerTimeSelectBox.find('#realServiceTime');
            var centerInfoList = centerData.centerInfoList;
            var serviceEngineerCode = centerData.serviceEngineerCode;
            var disableAddText = centerData.disableAddText;

            $dateSelect.empty().trigger("chosen:updated");
            $timeSelect.empty().append('<option>' + $timeSelect.data('placeholder') + '</option>').trigger("chosen:updated");

            var selectedCenter = $.grep(centerInfoList, function(obj, idx) {
                return (obj.serviceEngineerCode == serviceEngineerCode);
            });


            // hidden input set center data
            $centerTimeSelectBox.closest('form').children('input:hidden').not('[name=repair-service-type]').val('');
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
                    if (this.date == self.reserveDate) {
                        isAdded = true;
                    }
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


        function setRealServiceDateTime(centerData) {
            var centerlist_target = centerData.centerlist_target;
            var dmsAble = centerData.dmsAble;
            var $centerTimeSelectBox = centerData.selectBox;
            var $centerListBox = centerData.centerListBox;
            var $dateSelect = $centerTimeSelectBox.find('#realServiceDate');
            var $timeSelect = $centerTimeSelectBox.find('#realServiceTime');
            var centerInfoList = centerData.centerInfoList['ascList'];
            var localePhoneText = centerData.localePhoneText;
            var localeAddressText = centerData.localeAddressText;
            var disableAddText = centerData.disableAddText;
            /* LGEBR-2896 20160516 add*/ 
            var localeAddress2Text = centerData.localeAddress2Text;
            var localeAddress3Text = centerData.localeAddress3Text;
            var localeDistanceText = centerData.localeDistanceText;
            var localePostalText = centerData.localePostalText;
            var localeListMax= centerData.localeListMax;
            /*//LGEBR-2896 20160516 add*/
            // set default
            $dateSelect.empty().append('<option value="">'+ $dateSelect.data('placeholder') +'</option>');
            $timeSelect.empty().append('<option value="">'+ $timeSelect.data('placeholder') +'</option>').trigger("chosen:updated");
            $centerListBox.hide();
            // hidden input set center data
            $centerTimeSelectBox.closest('form').children('input:hidden').not('[name=repair-service-type]').val('');

            // set date
            $.each(centerInfoList, function(idx) {
                if (!this.available) return;

                var $option = $('<option>'+ this.reserveDate +'</option>');
                $option.val(this.reserveDate);
                $option.data('realTimeList', this.realTimeList);

                $dateSelect.append($option);
            });   

            $dateSelect.trigger("chosen:updated");

            $dateSelect.off('change.repair').on('change.repair', function() {
                // center list reset
                $centerListBox.hide();
                centerlist_target.find("ul").empty();

                var $selectedOption = $(this).find(':selected');
                if (!!$selectedOption.val()){
                    var realTimeList = $selectedOption.data('realTimeList');
                    var distincData = arrayDistinctbyField(realTimeList, 'timeZoneDesc', 'arrayAddressList');

                    //console.log('selected realtimelist', realTimeList);
                    //console.log('arrayDistinctbyField realtimelist', distincData);

                    setTimeSelect(distincData);
                }else {
                    $timeSelect.empty().append('<option value="">'+ $timeSelect.data('placeholder') +'</option>');
                }
                // hidden input set center data
                $centerTimeSelectBox.closest('form').children('input:hidden').not('[name=repair-service-type]').val('');
                
            });

            // set time
            /* LGECI-2383 20150503 modify*/
            function setTimeSelect(realTimeList) {
                if(lgFilter.locale=="/ca_en"|| lgFilter.locale=="/ca_fr"){
                    $timeSelect.empty();
                    if(!config.isMobile){
                        $timeSelect.append('<option></option>');
                    }else{
                        $timeSelect.empty().append('<option value="">'+ $timeSelect.data('placeholder') +'</option>');
                    }
                    $timeSelect.append('<optgroup label="'+$timeSelect.data('dsmLabel')+'" class="typeDms">'+ $timeSelect.data('dsmLabel') +'</option>');
                    $timeSelect.append('<optgroup label="'+$timeSelect.data('ascLabel')+'" class="typeAsc">'+ $timeSelect.data('ascLabel') +'</option>');
                    if(config.isMobile){
                        $timeSelect.find("optgroup").addClass("hide");
                    }
                    
                }else{
                    $timeSelect.empty().append('<option value="">'+ $timeSelect.data('placeholder') +'</option>');
                }
                $.each(realTimeList, function() {
                     
                    if (!this.available) return;
                   
                    var $option = $('<option>'+ this.timeZoneDesc +'</option>');
                    $option.val(this.timeZoneDesc);
                    $option.data('centerList', this.arrayAddressList);
                    
                    if(typeof this.svcType !== "undefined"){
                        if(this.svcType =="A"){
                            $timeSelect.find(".typeAsc").append($option);
                            if(config.isMobile){
                                $timeSelect.find(".typeAsc").removeClass("hide");
                            }
                        }else if(this.svcType =="D"){
                            $timeSelect.find(".typeDms").append($option);
                            if(config.isMobile){
                                $timeSelect.find(".typeDms").removeClass("hide");
                            }
                        }else{
                            $timeSelect.append($option);
                        }
                    }else{
                        $timeSelect.append($option);
                    }
                });

                $timeSelect.trigger("chosen:updated");

                $timeSelect.off('change.repair').on('change.repair', function() {
                    var $selectedOption = $(this).find(':selected');
                    if (!!$selectedOption.val()){
                        var centerList = $selectedOption.data('centerList');
                        var distincData = arrayDistinctbyField(centerList, 'ascId', 'arrayEnginnerList');

                        //console.log('selected centerList', centerList);
                        //console.log('arrayDistinctbyField centerList', distincData);

                        setCenterList(distincData);
                    } else {
                        $centerListBox.hide();
                    }
                    // hidden input set center data
                    $centerTimeSelectBox.closest('form').children('input:hidden').not('[name=repair-service-type]').val('');
                });
            }
            /*//LGECI-2383 20150503 modify*/
            // set centerlist
            function setCenterList(centerList) {

                var centerList = $.grep(centerList, function(obj, idx) {
                    return (!!obj.available);
                });

                centerlist_target.find("ul").empty();
                /* LGEBR-2896 20160516 add*/
                var listMax=99;
                if (typeof localeListMax !== "undefined"){
                    listMax = localeListMax;
                }
                /*//LGEBR-2896 20160516 add*/
		/* LGEBR-3828 20190158 add */
                if (lgFilter.locale == '/br') {
	                centerList.sort(function(a,b){
	                	return a["ascDistance"] - b["ascDistance"];
	                })
                }
		/* //LGEBR-3828 20190158 add */
                $.each(centerList, function(k, v) {
                    if (!v["ascId"] || !v["arrayEnginnerList"].length) {
                        return;
                    }
                    /* LGEBR-2896 20160516 add*/
                    if (centerlist_target.find("ul li").length >=listMax){
                        return;
                    }
                    !config.isMobile
                   
                    /*//LGEBR-2896 20160516 add*/
                    if (lgFilter.locale == '/br') {
                        /* LGEBR-2896 20160516 modify*/
                        zipcode_li = "<li>";
                        zipcode_li += "<label><input type=\"radio\" class=\"center-radio-select\" name=\"" + centerlist_target.find("ul").data("radio-name") + "\" value =\"" + v["ascId"] + "\">";
                        zipcode_li += "<a href=" + v["centerUrl"] + " target=\"_blank\" class=\"underline name\" title=\"Nova Janela\">" + v["ascName"] + "</a></label>";
                        if(!config.isMobile){
                            zipcode_li += "<span class=\"wrap right\"><strong>" + localeDistanceText + " :</strong>" + v["ascDistance"] + "</span></div>";
                            zipcode_li += "<div><span class=\"wrap address\" style=\"width:65%;float:left\"><strong>" + localeAddressText + " :</strong>" + v["ascAddressInfo"] + "</span>";
                            zipcode_li += "<span class=\"wrap address\" style=\"float:left\"><strong>" + localeAddress2Text + " :</strong>" + v["ascAddressInfoSecond"] + "</span></div>";
                        }else{
                            zipcode_li += "<span class=\"wrap\"><strong>" + localeDistanceText + " :</strong>" + v["ascDistance"] + "</span></div>";
                            zipcode_li += "<div><span class=\"wrap address\"><strong>" + localeAddressText + " :</strong>" + v["ascAddressInfo"] + "</span>";
                            zipcode_li += "<span class=\"wrap address\"><strong>" + localeAddress2Text + " :</strong>" + v["ascAddressInfoSecond"] + "</span></div>";
                        }
                        
                        if(!config.isMobile){
                            zipcode_li += "<div><span class=\"wrap address\" style=\"width:65%;\"><strong>" + localeAddress3Text + " :</strong>" + v["ascCityName"] + " / " +v["ascStateName"] + "</span>";
                        }else{
                            zipcode_li += "<div><span class=\"wrap address\"><strong>" + localeAddress3Text + " :</strong>" + v["ascCityName"] + " / " +v["ascStateName"] + "</span>";
                        }
                        
                        zipcode_li += "<span class=\"wrap zip\"><strong>" + localePostalText + " :</strong>" + v["ascPostalCode"] + "</span></div>";
                        zipcode_li += "<div><span class=\"wrap tel\"><strong>" + localePhoneText + " :</strong>" + v["ascPhoneNo"] + "</span></div>";
                        zipcode_li += "</li>";
                       
                        
                        /*//LGEBR-2896 20160516 modify*/
                    } else if (lgFilter.locale == '/ca_en') {
                        zipcode_li = "<li>";
                        zipcode_li += "<input type=\"radio\" class=\"center-radio-select\" name=\"" + centerlist_target.find("ul").data("radio-name") + "\" value =\"" + v["ascId"] + "\">";
                        zipcode_li += "<span class=\"wrap address\"><strong>" + localeAddressText + " :</strong>" + v["ascAddressInfo"] + "</span>";
                        zipcode_li += "<span class=\"wrap tel\"><strong>" + localePhoneText + " :</strong>" + v["ascPhoneNo"] + "</span>";
                        zipcode_li += "<span class=\"wrap name red\">" + v["ascName"] + "</span>";
                        zipcode_li += "</li>";

                    } else if (lgFilter.locale == '/ca_fr') {
                        zipcode_li = "<li>";
                        zipcode_li += "<input type=\"radio\" class=\"center-radio-select\" name=\"" + centerlist_target.find("ul").data("radio-name") + "\" value =\"" + v["ascId"] + "\">";
                        zipcode_li += "<span class=\"wrap address\"><strong>" + localeAddressText + " :</strong>" + v["ascAddressInfo"] + "</span>";
                        zipcode_li += "<span class=\"wrap tel\"><strong>" + localePhoneText + " :</strong>" + v["ascPhoneNo"] + "</span>";
                        zipcode_li += "<span class=\"wrap name red\">" + v["ascName"] + "</span>";
                        zipcode_li += "</li>";

                    } else {
                        zipcode_li = "<li>";
                        zipcode_li += "<input type=\"radio\" class=\"center-radio-select\" name=\"" + centerlist_target.find("ul").data("radio-name") + "\" value =\"" + v["ascId"] + "\">";
                        zipcode_li += "<span class=\"wrap address\"><strong>" + localeAddressText + " :</strong>" + v["ascAddressInfo"] + "</span>";
                        zipcode_li += "<span class=\"wrap tel\"><strong>" + localePhoneText + " :</strong>" + v["ascPhoneNo"] + "</span>";
                        zipcode_li += "<a href=" + v["centerUrl"] + " target=\"_blank\" class=\"underline name\" title=\"Open New Window\" >" + v["ascName"] + "</a>";
                        zipcode_li += "</li>";
                    }

                    var $li = $(zipcode_li);
                    $li.find('.center-radio-select').data('centerData', v);
		    /* LGEBR-3828 20190158 modify */
                    if (lgFilter.locale == '/br'){
                    	if((k!=0 && k<=2 && v["ascDistance"] > 150) || k>2) {
                    		return false;
                    	}else if(k==0 && v["ascDistance"] >= 150){
                    		 centerlist_target.find("ul").append($li);
                    		 return false;
                    	}else{
                    		centerlist_target.find("ul").append($li);
                    	}
                    }else{
                    	centerlist_target.find("ul").append($li);
                    }
                    /* LGEBR-3828 20190158 modify */
                 
                });

                styledForm(dmsAble);

                centerlist_target.find("li .center-radio-select").on("change", function() {
                    var $this = $(this);
                    if ($this.is(':checked')) {
                        var centerData = $this.data('centerData');

                        //console.log('centerData', centerData);

                        // hidden input set center data
                        $centerTimeSelectBox.closest('form').children('input:hidden').not('[name=repair-service-type]').val('');

                        for (var k in centerData) {
                            var $input = $centerTimeSelectBox.closest('form').children('input[name=real' + k + ']');
                            if (!!$input.length) {
                                $input.val(centerData[k]);
                            }
                        }

                        // first Available enginner
                        var enginner = $.grep(centerData['arrayEnginnerList'], function(obj, idx) {
                            return (!!obj.available);
                        });

                        //console.log('first enginner', enginner[0]);

                        for (var k in enginner[0]) {
                            var $input = $centerTimeSelectBox.closest('form').children('input[name=real' + k + ']');
                            if (!!$input.length) {
                                //console.log('enginner[0][k]', enginner[0][k]);
                                //console.log('$input',$input);
                                $input.val(enginner[0][k]);
                            }
                        }

                    }
                });
                $centerListBox.show();
            }
            //arrayDistinctbyField(realTimeList, 'timeZoneDesc', 'arrayAddressList');
            function arrayDistinctbyField(array, key, mergeKey) {
                var tmpArray = [];
                
                $.each(array, function() {
                    var self = this;
                    var isAdded = false;

                    $.each(tmpArray, function() {
                        if (this[key] == self[key]) {
                            isAdded = true;
                            if (!!mergeKey && this[mergeKey] instanceof Array) {
                                
                                this[mergeKey] = $.merge(this[mergeKey], self[mergeKey]);
                            }
                        }
                    });

                    if (isAdded) return;

                    tmpArray.push(this);
                });

                return tmpArray;
            }
          
        }

        function setCarryinDateTime(centerData) {
            var $centerTimeSelectBox = centerData.selectBox;
            var $dateSelect = $centerTimeSelectBox.find('#carryinServiceDate');
            var $timeSelect = $centerTimeSelectBox.find('#carryinServiceTime');
            var disableAddText = centerData.disableAddText;
            var $form = centerData.form;
        /* LGEHK-821 : 20160518 add */                                            
            if((lgFilter.locale =='/hk' || lgFilter.locale =='/hk_en')) {
                $(".repair-service-type.active").find("button[type=submit]").prop("disabled", true);
                $(".repair-service-type.active").find("button[data-stepsave-btn]").prop("disabled", true);                
            }
            /* //LGEHK-821 : 20160518 add */

            $.ajax({
                url: centerData.url,
                data: XSSfilters(centerData.centerId),
                dataType: "json"
            }).done(function(res) {
                //console.log('carryin timedate', res);
                $dateSelect.empty().trigger('chosen:updated');
                $timeSelect.empty().append('<option>' + $timeSelect.data('placeholder') + '</option>').trigger('chosen:updated');

                var dateArray = [];
                $.each(res.carryInDateList, function() {
                    var reserveDate = this;
                    var dateObj = {
                        date: reserveDate.toString(),
                        timeList: []
                    };
                    var currentDateTimeList = $.grep(res.carryInTimeTable, function(obj, idx) {
                        return (reserveDate == obj.reserveDate);
                    });

                    dateObj.date = reserveDate;
                    dateObj.timeList = currentDateTimeList;

                    dateArray.push(dateObj);
                });

                //console.log('dateArray', dateArray);

                $.each(dateArray, function(idx) {
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

                $dateSelect.off('change').on('change', function(e) {
                    var self = $(this);
                    var selectedDateObj = [];
                    selectedDateObj = $.grep(dateArray, function(obj, idx) {
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
                            $timeSelect.append($('<option value="">'+$timeSelect.data('placeholder')+'</option>'));
                        }

                        var $option = $('<option></option>');
                        $option.val(this.timeZoneDesc);
                        if (this.available != 'AVAILABLE') {
                            $option.attr('disabled', true);
                            $option.text(this.timeZoneDesc + ' ' + disableAddText);
                        } else {
                            $option.text(this.timeZoneDesc);
                        }
                        $option.data('timeZoneCode', this.timeZoneCode);

                        $timeSelect.append($option);
                    });

                    $timeSelect.off('change').on('change', function(e) {

                        var $selectedOption = $(this).find(':selected');
                        //console.log($selectedOption.data('timeZoneCode'));
                        $form.children('input[name=carryinascTimeZoneId]').val($selectedOption.data('timeZoneCode'));
            /* LGEHK-821 : 20160518 add */                                            
                        if((lgFilter.locale =='/hk' || lgFilter.locale =='/hk_en')) {
                            $(".repair-service-type.active").find("button[type=submit]").prop("disabled", false);
                            $(".repair-service-type.active").find("button[data-stepsave-btn]").prop("disabled", false);
                        }
                        /* //LGEHK-821 : 20160518 add */

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
            /* PJTBTOBCSR-138 start */
            forms.each(function(i) {
                //business
                if(btbCheck){    
                    var _this = $(this).closest('[data-target]').size() > 0 ? $(this).closest('article.step').find("[data-target="+$(el).data("view")+"]").find("form") : $(this);
                } else {
                    var _this = $(this);
                }
                var obj = $(this).serializeArray();

                // step type check
                var isYourProductChoice = _this.closest('.step').hasClass('product-choice');
                var isProductSymtom = _this.closest('.step').hasClass('product-symptom');
                var isRepairType = _this.closest('.step').hasClass('repair-service-type');
                var isContactInfomation = _this.closest('.step').hasClass('contact-information');
                var isStep3Mc = _this.closest('.step').attr('id') == 'step03-mc' ? true : false;

                if (isRequestRepair) {
                    if (isYourProductChoice) {
                        var obj = [];
                        var modelBrowser = _this.find('.model-browser').eq(0);
                        if (modelBrowser.length) {
                            if (modelBrowser.hasClass('selectbox-on')) {
                                modelBrowser.find('.model-selectbox').find('select').each(function(idx) {
                                    if ($(this).serializeArray().length > 0) {
                                        obj.push($(this).serializeArray()[0]);
                                        var clone = $(this).clone();
                                        clone.val($(this).val());
                                        fieldObj.push(clone);
                                    }
                                });
                            }

                            if (modelBrowser.hasClass('searchbox-on')) {
                                modelBrowser.find('.model-searchbox').find('input[name=keyword]').each(function(idx) {
                                    obj.push($(this).serializeArray()[0]);
                                    var clone = $(this).clone();
                                    clone.val($(this).val());
                                    fieldObj.push(clone);
                                });
                            }    
                        } else {
                            // old model browser
                            var choiceBoxDiv = _this.find('.two-column.choice-product').eq(0);

                            if (choiceBoxDiv.hasClass('active-category')) {
                                _this.find('.select-product').find('select').each(function(idx) {
                                    if ($(this).serializeArray().length > 0) {
                                        obj.push($(this).serializeArray()[0]);
                                        var clone = $(this).clone();
                                        clone.val($(this).val());
                                        fieldObj.push(clone);
                                    }
                                });
                            }

                            if (choiceBoxDiv.hasClass('focus-number')) {
                                _this.find('.model-number').find('input[name=keyword]').each(function(idx) {
                                    obj.push($(this).serializeArray()[0]);
                                    var clone = $(this).clone();
                                    clone.val($(this).val());
                                    fieldObj.push(clone);
                                });
                            }
                        }
                        
                        var _purchaseInfoType1 = btbCheck ? $("article.step:visible [data-target="+$(el).data("view")+"]").find("#purchaseInfoType1") : $('#purchaseInfoType1');
                        var _purchaseInfoType2 = btbCheck ? $("article.step:visible [data-target="+$(el).data("view")+"]").find("#purchaseInfoType2") : $('#purchaseInfoType2');

                        if (_purchaseInfoType1.hasClass('active')) {
                            var activePurchaseInfoDataArray = _purchaseInfoType1.find('input').serializeArray();
                            fieldObj = $.merge(fieldObj, _purchaseInfoType1.find('input').clone());
                            obj = $.merge(obj, activePurchaseInfoDataArray);
                        }

                        if (_purchaseInfoType2.hasClass('active')) {
                            var activePurchaseInfoDataArray = _purchaseInfoType2.find('input').serializeArray();
                            fieldObj = $.merge(fieldObj, _purchaseInfoType2.find('input').clone());
                            obj = $.merge(obj, activePurchaseInfoDataArray);
                        }
                    }

                    // Product Symptom
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
                        var _tabRepair = btbCheck ? $("article.step:visible [data-target="+$(el).data("view")+"]").find("[data-tabs='repairType']") : $('[data-tabs="repairType"]');
                        var _repairServicetyp = btbCheck ? $("article.step:visible [data-target="+$(el).data("view")+"]").find("[name=repair-service-type]") : $('[name=repair-service-type]');

                        var activeInputArray = _tabRepair.find('li.active').find(':input').not('button').serializeArray();
                        activeInputArray.push(_repairServicetyp.serializeArray()[0]);
                        activeInputArray = $.merge(activeInputArray, _this.children('input:hidden').serializeArray());

                        _tabRepair.find('li.active').find(':input').not('button').each(function() {
                            var $this = $(this);
                            var clone = $this.clone();
                            $(clone).val($this.val());
                            fieldObj.push(clone[0]);
                        });

                        // Real time service hidden inputs
                        _this.children('input:hidden').each(function() {
                            var $this = $(this);
                            var clone = $this.clone();
                            $(clone).val($this.val());
                            fieldObj.push(clone[0]);
                        });

                        fieldObj = $.merge(fieldObj, _repairServicetyp.clone());

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
                        _this.closest('.step').find(':input').not('button').each(function() {
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
            /* PJTBTOBCSR-138 end */
            /*LGECS-1106 20170901 add */
            if(stepReview.find("[name=requestVerificationToken]").length){
                fieldObj = $.merge(fieldObj, stepReview.find("[name=requestVerificationToken]").clone());
        	}
            /*//LGECS-1106 20170901 add */
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
                        /* PJTBTOBCSR-138 start */
                        var $frmtarget = btbCheck ? $("article.step:visible [data-target="+$(el).data("view")+"] form[enctype]") : $("article.step:visible form[enctype]");

                        if ($frmtarget.length == 1) {
                            $frmtarget.eq(0).addClass('active');
                        }

                        if ($frmtarget.length > 1 && $frmtarget.hasClass('active').length == 0) {
                            $frmtarget.eq(0).addClass('active');
                        }
                        $frm = btbCheck ? $("article.step:visible [data-target="+$(el).data("view")+"] form[enctype].active", el) : $("article.step:visible form[enctype].active", el);
                        /* PJTBTOBCSR-138 end */
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
            /* LGEBR-3448 20170911 modify*/
            //if (lgFilter.locale != '/br') {
                submitBtn.spin(false);
            //}
            /* LGEBR-3448 20170911 modify*/
        }

        // option init
        function optionInit() {
            // nextBeforePop handler
            $('.step-list > article.step').each(function() {
                var self = $(this);
                $(this).on('nextBeforePop', function(e, popTrigger, current) {
                    
                    popTrigger.on('modal:ajax:complete', function(e, modal) {
                        var $modal = $(modal);
                        var $closeBtn = $modal.find('[rel="modal:close"]');
                        var $form = $modal.find('form');

                        $form.on('form:validate:success', function() {
                            popTrigger.data('policyAgree', true);
                            $closeBtn.trigger('click');
                        });

                        $form.find('[type="submit"]').on('click', function(e) {
                            e.preventDefault();
                            $form.trigger('form:validate');
                        });

                        $modal.on('modal:before-close', function() {
                            if (popTrigger.data('policyAgree')) {
                                if (stepSubmitBefore(current)) {
                                    stepSubmit(current);
                                }
                            }
                        });
                    });

                    $('.schedule-repair').trigger('nextBeforePop:beforeOpenModal', [popTrigger]);

                    popTrigger.modal();

                });
            });

            // onLoadPop handler
            $('.step-list').on('onLoadPop', function() {
                var popSelecter = $(this).data('onloadPop');
                var $popTrigger = $(popSelecter);

                if (!$popTrigger.length) return;

                // locale event trigger
                $('.schedule-repair').trigger('onLoadPop:beforeOpenModal', [$popTrigger]);

                $popTrigger.modal();
            });
        }

        /* PJTBTOBCSR-138 start */
        function ChangeEvent(e){
            var _target = $(e.currentTarget);
            var btnSelf = _target.find(".styled-radio").hasClass("checked") ? false : true;

            var modelSelected = 0;
            if ($(element).hasClass("integration")) {
                $.each($('.integration form:visible').find(".product-choice,.repair-service-type").find("select, textarea, input:not([type='hidden'], [type='checkbox'])"), function(){
                    if ($(this).val() != null && $(this).val().length != 0) {
                        modelSelected++;
                    }
                });
                modelSelected = (modelSelected == 0) ? false : true;
            } else {
                modelSelected = $("[data-target]:visible .model-browser").hasClass("open");
            }

            if(btnSelf){
                var result = modelSelected ? confirm($(".btb-repair").data("changeMsg").replace("</br>","\n")) : true;

                if(result) {
                    btbInit(e);
                    btbCheckbtn(e);
                    btbfieldRest(e);
                    if ($(element).hasClass("integration")){
                       cnOnlyRestStep();
                    } else {
                        btbRestStep();
                    }
                    ChangeArticleUrl(e);
                    if (config.isMobile) { 
                        $(window).trigger('load');
                        $(".btn-group").show();
                        $('.closebutton').trigger('click');
                        if($("form:visible .model-browser").size()>0) $("form:visible .model-browser").trigger("webkitTransitionEnd");
                    }
                    $(e.target).focus();
                    /*LGECS-769 : 20170106 add*/
                    $("body").find('.unavailable-product, .guideforVisitingCenter').hide();
                    /*//LGECS-769 : 20170106 add*/
                } else {
                    e.preventDefault();
                }
            }
            modelDeselect();
        }

        function btbCheckbtn(e){
            e.preventDefault();
            var chgAciton = $(element).data($(e.currentTarget).data("chgAciton"));
            var viewTarget = $(e.currentTarget).prop("id");
            $(e.currentTarget).siblings().find(".styled-radio").removeClass("checked");
            $(e.currentTarget).find(".styled-radio").addClass("checked");
            $(element).data("action", chgAciton);
            $(element).attr("data-view", viewTarget).data('view', viewTarget);
        }

        function btbfieldRest(e){
            var _ele = $(element);
            var viewTarget = _ele.data("view");
            var currentBox = _ele.find('.step [data-target="' + viewTarget +'"]');
            currentBox.find('#supercategory').data('noreset', false).val("");
            currentBox.find('#category').data('noreset', false);
            currentBox.find('#subcategory').data('noreset', false);
            currentBox.find('#keyword').data('noreset', false);
            currentBox.find('[name*=serviceTime-]').data('noreset', false);
            $('[data-search-name=keyword]').data('noreset', false);
            $('.repair-service-type,.contact-information,.product-symptom').data('editAble',false);
            currentBox.find("[name=serialNumber]").each(function(){
                $(this).val("");
            })
            //CN Only 
            if (_ele.hasClass("integration")){
                $('[data-tab-target-parent]').trigger('tab:change');
                $('[data-target="' + viewTarget +'"]').find(".tabs li:eq(0) a").trigger("click");
            }
        }

        function btbRestStep(e){
            var _ele = $(element);
            _ele.find(".model-browser").removeClass("open searchbox-on selectbox-on").find(".model-selectbox, .model-searchbox").show().find(".searchbox").removeClass("on");
          // _ele.find(".model-view-detail").empty();
            _ele.find("#step01 .edit-btn").trigger("click");
            _ele.find("article[id*=-mc]").hide();
            _ele.find("#step02, #step03, #step04, #step01 .btn-right").show();
            _ele.find("#step01 .step-content .active").show().siblings("[class*=-column], .unavailable-product").hide();
            stepReset(0);
            _ele.find("[data-target]:visible #keyword").prop("disabled",false);
            _ele.find("article").not("#step04").find("[data-target] form").trigger('form:validate:reset');
            _ele.find("#step01 .selectbox").each(function(){
                if(config.isMobile){
                    $(this).not("#supercategory").empty().append('<option value="">' + $(this).attr('title') + '</option>').trigger("chosen:updated");
                } else {
                    $(this).not("#supercategory").empty().append('<option value=""></option>').trigger("chosen:updated");
                }
            });
            _ele.find("#step01 input").val("");
            _ele.find(".selectbox").val("").trigger("chosen:updated");
            _ele.find("[data-provide='datepicker']").each(function(){
                $(this).val("");
                $(this).data("datepicker",false);
            });
        }

        function cnOnlyRestStep(){
            var _ele = $(element);
            _ele.find("[data-target] form").trigger('form:validate:reset');
            _ele.find(".selectbox").val("").trigger("chosen:updated");
            $("article.step:visible .step-review").hide();
            stepChange(1, 0);
            _ele.find("#step05").hide();
        }

        function ChangeArticleUrl(event) {
            var _ele = $(element);
            var articleView = (_ele.data('view') + '-url').toLowerCase();

            $.each(stepWrap, function(index){
                if ($(this).data(articleView)){
                    $(this).data('url', $(this).data(articleView)).attr('data-url', $(this).data(articleView));
                }
            });
        }

        function btbInit(e){
            // page config
            var viewTarget = $(e.currentTarget).prop("id");

            if(viewTarget == "ForBtb" && !$(".support-content").hasClass("btbInit")) {

                $.ajax({
                    url: $(".support-content").data(viewTarget.toLowerCase()+"Url"),
                    dataType: "json",
                    error: function(xhr) {
                        // console.log(xhr);
                    },
                    success: function(data) {
                        $.each(data, function(k, v) {
                            if (k == "service-policy") {
                                if (!v) $('.service-policy').hide();
                            } else {
                               $("[data-target='ForBtb']").find("." + k).find(".warranty-type").eq(v).show().siblings().remove();
                            }
                        });
                        $(".support-content").addClass("btbInit");
                    }
                });
            }
        }

        function modelDeselect(){
            $("[data-target='ForBtb'] form").on("modelBrowser:deselectModel.select modelBrowser:deselectModel.search",function(e){
                if($("#step01 .unavailable-product").is(":visible")){
                    btbfieldRest();
                    btbRestStep(); 
                }
           })
        }   
        /* PJTBTOBCSR-138 end */
    } 
    /* PJTBTOBCSR-138 end */
    ic.util.inherits(Steplist, Module);
    ic.jquery.plugin('steplist', Steplist, '.step-list');

    return Steplist;
   
});
