/**
 * The support repair module.
 * @module support/support.repair
 */

define(['support', 'global-config', 'cs/basicmotion', 'cs/tabpanel', 'cs/fileupload', 'cs/datepicker', 'cs/placeholder', 'cs/scrollbar', 'cs/model-browser'], function(cs, config) {

	'use strict';
	
	// Step 01 - Product Choice
	var choiceStep = $("#step01");
	var activeColumn = $(".two-column").eq(0);
	var activeCategory = "active-category";
	var focusCategory = "focus-category";
	var focusNumber = "focus-number";
	var modelLink = choiceStep.find(".warranty-info");
	var modelSelecter = choiceStep.find(".model-select");
	var modelDetail = choiceStep.find(".selected-product");
	var selectModel = choiceStep.find(".info-wrap .model-name");
	var selectImg = choiceStep.find(".product-image");
	var selectWarranty = choiceStep.find(".info");
	var warrantyInfo = choiceStep.find(".info, .warranty");
	var productNameClass = ".product-name";
	var viewClose = choiceStep.find(".afterbtn");
	var modelNum = choiceStep.find(".model-number");
	var keywordSelect = choiceStep.find(".search-model-number");
	var keyword = choiceStep.find(".model-selector input[type='text']");
	var keywordVerify = choiceStep.find(".model-verify");
	var requireModel = choiceStep.data("requireModel");

	choiceStep.data("selectedModel", false);

	$(function(){ 
		if (!config.isMobile && $(".repair-center-list").length > 0) $(".repair-center-list").scrollbar();

		var directionResult = $(".repair-direction-result");
		if (!config.isMobile && directionResult.length > 0) {
			var height = 833 - $(".repair-direction-location").height();
			directionResult.scrollbar();
			directionResult.parent().height(height);
		}

		setTimeout(function() {
			var _data = $("#select-myaddr").data("myaddr");
			if (_data) {
				/* LGEBR-3558, LGEBR-3793 : 20181002 add */
				if (lgFilter.locale =="/br" && $(".map-tab-style").length > 0) {
					$(".repair-map-search").show().find(".map-tab-style li input[type=radio]#geolocation").trigger("change").trigger("click");
					$(".repair-map-search").find("[for='geolocation']").trigger("click");
		        }
				/*//LGEBR-3558, LGEBR-3793 : 20181002 add */
				
				$("#serviceCenterZip").val(_data);				
				$("#repairForm").trigger("submit");
			}
		}, 0);

		// page config;
		if ($(".support-content").length > 0) {

			if ($(".support-content").data("url")) {
				$.ajax({
					url: $(".support-content").data("url"),
					dataType: "json",
					error: function(xhr) {
						// console.log(xhr);
					},
					success: function(data) {
						$.each(data, function(k, v) {
							if (k == "service-policy") {
								if (!v) $('.service-policy').hide();
							} else {
								$("." + k).find(".warranty-type").hide();
								$("." + k).find(".warranty-type").eq(v).show();
								$("." + k).find(".warranty-type").eq(v).siblings().remove();
							}
						});
					}
				});
			}
		}

		// Not request a repair
		if ($('.schedule-repair').length == 0) {
			// model browser set model detail handler
	        $('.product-choice form:eq(0)').on('modelBrowser:setDetail', function(e, modelData) {
	            var $resultAnchor = $(this).find('.step-result .warranty-info');
	            var $warrantyInfoSpan = $resultAnchor.find('.info-list > span');
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
		}
		

	});

	




	// old model borwser 
	if ($('.model-browser').length == 0) {

		// load : Model actived
		$(window).load(function() {
			if (modelSelecter.val()) {
				modelSelect(modelSelecter);

				//call-appointment selected Model
				choiceStep.data("selectedModel", true);
			}
            
		});

		$(".select-product", choiceStep).find("select").change(function() {
			if ($(this).hasClass("model-select")) {
				// $(activeColumn, choiceStep).removeClass(activeCategory);
				choiceStep.data("selectedModel", true);
			} else {
				var horw = (config.isMobile ? {
					"height": "0px"
				} : {
					"width": "0%"
				});
				$(modelNum, choiceStep).show();
				$(modelDetail, choiceStep).stop().animate(horw, 200, function() {
					$(activeColumn, choiceStep).removeClass(activeCategory);
				});
				if (config.isMobile) $(modelNum, choiceStep).stop().slideDown(200);
			}
			keyword.val("").siblings("span.msg-placeholder").show();
		});

		keywordSelect.not("[disabled]").on("click", function(e) {
			e.preventDefault();
			verifyModel(keyword[0], e, 'keyword');
		});

		modelSelecter.on("change chosen:updated.chosen", function(e) {
			keywordVerify.removeClass("pass fail");
			if ($(this).val()) {
				verifyModel(this, e, 'modelselect');
			} else {
				viewCloser();
			}
		});

		// change focus product
		keyword.on("change", function(e) {
			keywordVerify.removeClass("pass fail");
		}).on("focusin", function(e) {
			modelNum.addClass("on");
		}).on("focusout", function(e) {
			modelNum.removeClass("on");
		});

		// Selected product Close
		viewClose.bind("click", function(e) {
			e.preventDefault();

			modelSelecter.val("").trigger("chosen:updated");
			choiceStep.data("selectedModel", false);
			viewCloser();
		});

		if (modelSelecter.val()) {
			modelSelect(modelSelecter);
		}

		$(document).on("click focus", "a, input, select", function() {
			if (requireModel == undefined || requireModel) {
				if ($(this).parents(activeColumn).hasClass("choice-product")) {
					var targetParent = $(this).closest(".column");

					// Select category
					if (targetParent.hasClass("select-product")) {
						$(activeColumn, choiceStep).removeClass(focusNumber).addClass(focusCategory);
						keyword.removeProp("required").removeAttr("required");
						choiceStep.find(".selectbox").prop("required", true).attr("required", true);
					} else {
						// Keyword search
						$(activeColumn, choiceStep).removeClass(focusCategory).addClass(focusNumber);
						keyword.prop("required", true).attr("required", true);
						choiceStep.find(".selectbox").removeProp("required").removeAttr("required");
					}
				} else {
					$(activeColumn, choiceStep).removeClass(focusCategory, focusNumber);
				}
				if (activeColumn.hasClass(focusCategory)) {
					keyword.removeProp("required").removeAttr("required");
					choiceStep.find(".selectbox").prop("required", true).attr("required", true);
				}
			} else {
				choiceStep.data("selectedModel", true);
				choiceStep.find(".selectbox").prop("required", false).attr("required", false);
				keyword.removeProp("required").removeAttr("required");
			}
		});


	}
	
		// model select
	function modelSelect(el, e) {
		if (e) e.preventDefault();
		if (el == modelSelecter) {
			openAction(el);
		} else {

		}
	}

	function openAction(el) {
		var $this = $(el);
		if ($this.hasClass("model-select")) {
			$(activeColumn, choiceStep).addClass(activeCategory);
			var horw = (config.isMobile ? {
				"height": "260px"
			} : {
				"width": "100%"
			});
			$(modelDetail, choiceStep).stop().animate(horw, 200, function() {
				$(modelNum, choiceStep).hide();
			});
			if (config.isMobile) $(modelNum, choiceStep).stop().slideUp(200);
		} else {
			var horw = (config.isMobile ? {
				"height": "0px"
			} : {
				"width": "0%"
			});
			$(modelNum, choiceStep).show();
			$(modelDetail, choiceStep).stop().animate(horw, 200, function() {
				$(activeColumn, choiceStep).removeClass(activeCategory);
			});
			if (config.isMobile) $(modelNum, choiceStep).stop().slideDown(200);
		}
	}

	function verifyModel(el, e, contextType) {
		var $this = $(el);
		var isSelector = (el == modelSelecter[0]);

		if ($this.val()) {

			if (!isSelector) keywordSelect.spin(true);

			keyword.removeClass("error");
			$.ajax({
				url: $this.data("url"),
				data: XSSfilters($this.closest("form").serializeArray()),
				dataType: "json",
				success: function(data) {
					if (contextType == 'keyword') {
						keywordSelect.trigger('keyword:success');
					}

					if (contextType == 'modelselect') {
						keywordSelect.trigger('modelselect:success');
					}
					
					if (isSelector) {
						choiceStep.data("selectedModel", true);
						setDetail(data, $this);
					} else {
						keywordSelect.spin(false);
						if (data.errorMsg) {
							keywordVerify.removeClass("pass").addClass("fail");
							choiceStep.data("selectedModel", false);
							keywordError(data.errorMsg);
						} else {
							keywordVerify.removeClass("fail").addClass("pass");
							choiceStep.data("selectedModel", true);
							// call-appointment : search json data
							setDetail(data, $this);
						}
					}
					
				},
				error: function(xhr, textStatus) {
					if (contextType == 'keyword') {
						keywordSelect.trigger('keyword:fail');
					}

					if (contextType == 'modelselect') {
						keywordSelect.trigger('modelselect:fail');
					}

					keywordSelect.spin(false);
					choiceStep.data("selectedModel", false);
					modalAlert(textStatus);
					viewCloser();

				}

			})

			modelSelect(this, e)

		} else {

			//keywordSelect.spin(false);
			choiceStep.data("selectedModel", false);

			if (isSelector) {
				viewCloser();
			} else {
				keywordError(formerror.required.split("%title%").join(keyword.attr("title")));
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
		keyword.trigger("select");
	}

	function setDetail(data, el) {
		var $this = el;
		var imgCheck = false;
		modelLink.attr('href', data.link);
		selectModel.text(data.modelName);
		$("#step03 " + productNameClass).text(data.modelName);

		var setLazy = function() {
			var setImgFnc = function() {
				selectImg.attr({
					'data-original': data.imageUrl,
					'data-visible': false
				})
				imgCheck = true;
			}();
			if (!imgCheck) {
				setLazy();
			} else {
				selectImg.lazyload();
				$(window).trigger("resize");
			}
		}();

		if (data.warrantyInfoLabor) {
			warrantyInfo.show();
			selectWarranty.find(".warranty-info-labor").text(data.warrantyInfoLabor);
			selectWarranty.find(".warranty-info-parts").text(data.warrantyInfoParts);
		} else {
			warrantyInfo.hide();
		}

		if (data['visible']) {
			for (var cls in data['visible']) {
				$(data['visible'][cls], $this.closest(".step-list")).show();

				if (data['visible'][cls] == '#purchaseInfoType1') {
					$('#purchaseInfoType1').addClass('active');
					$('#purchaseInfoType2').removeClass('active');
				}

				if (data['visible'][cls] == '#purchaseInfoType2') {
					$('#purchaseInfoType2').addClass('active');
					$('#purchaseInfoType1').removeClass('active');
				}
			}
		}

		if (data['hidden']) {
			for (var cls in data['hidden']) {
				//email-appointment banner
				if (data['hidden'][cls] == '.banner-app') {
					$(data['hidden'][cls], $this.closest(".step-list")).hide();
				}

				$(data['hidden'][cls], choiceStep).hide();
			}
		}
		// br mc collection
		if (!!data['mc']) {
			if (data['mc']['visible']) {
				for (var cls in data['mc']['visible']) {
					$(data['mc']['visible'][cls]).show();
				}
			}

			if (data['mc']['hidden']) {
				for (var cls in data['mc']['hidden']) {
					$(data['mc']['hidden'][cls]).hide();
				}
			}
		}

		if (!!data['globalVisible']) {
			for (var cls in data['globalVisible']) {
				$(data['globalVisible'][cls]).show();
			}
		}

		if (!!data['globalHidden']) {
			for (var cls in data['globalHidden']) {
				$(data['globalHidden'][cls]).hide();
			}
		}

		openAction(el);
	}

	function viewCloser() {
		var afterFocusElm = $(activeColumn, choiceStep).find(".chosen-container").filter(":first");
		setTimeout(function() {
			var horw = (config.isMobile ? {
				"height": "0px"
			} : {
				"width": "0%"
			});
			$(modelNum, choiceStep).show();
			$(modelDetail, choiceStep).stop().animate(horw, 200, function() {
				$(activeColumn, choiceStep).removeClass(activeCategory);
			});
			if (config.isMobile) $(modelNum, choiceStep).stop().slideDown(200);
		}, 50);

		// accessibility
		afterFocusElm.addClass("chosen-container-active").find(".chosen-search input").focus();
		keyword.val("").siblings("span.msg-placeholder").show();
	};

	//select my address set
	$("#select-myaddr").on("click", function(e) {
		e.preventDefault();
		var addr = $(this).data("myaddr");
		if (addr == "") {
			alert($(this).data("msg"));
			return false;
		}
		$("#serviceCenterZip").val(addr);
	});

	//my-repair inquiry status
	$(".my-repair-inquiry-status").not("[data-active-tab=inquiryList]").on("click", "form a.link-line-in", function(e) {
		e.preventDefault();
		$(this).closest("form")[0].submit();
	})

	//inquiry-status-lgaccount
	$(".repair-signin .radio-select").each(function() {
		var radioCheckCall = $('#callAppointment');
		var radioCheckEmail = $('#emailAppointment');

		// email only
		if (radioCheckEmail.is(":checked")) $(".call-field").hide();

		var changePlaceholder = function() {
			if (radioCheckCall.is(":checked")) {
				$("#receipt").attr('placeholder', $("#receipt").attr("data-call"));
				if (!Modernizr.input.placeholder) $("#receipt").siblings("span.msg-placeholder").text($("#receipt").attr("data-call"));
			} else {
				$("#receipt").attr('placeholder', $("#receipt").attr("data-email"));
				if (!Modernizr.input.placeholder) $("#receipt").siblings("span.msg-placeholder").text($("#receipt").attr("data-email"));
			}
		}
		changePlaceholder();
		radioCheckCall.bind("change", function() {
			changePlaceholder();
		});
	});

	//contact_telephone not-supported-hotline
	$(".contact-area .btn.not-supported-hotline").bind("click", function(e) {
		var supportMsg = $(this).data("alert-msg");
		modalAlert(supportMsg, true);
	});

	//contact email inquiry type
	$("#typeOfInquiry").bind("change", function(a) {
		var inquiryVal = $(this).val();

		// for mobile
		if (inquiryVal == 0 || inquiryVal == null) {
			$(".email-appointment").hide();
		} else {
			$(".email-appointment").show();
			$('#productCheck').iCheck('uncheck').iCheck('update');
		}

		// option : model required pass
		/* 20160425 modify */
		if ($("option:selected", this).attr("data-model-pass")) {
			$("#checkRequireModel").show();
		} else {
			$("#checkRequireModel").hide();
		}
		/* //20160425 modify */
	});

	//contact email inquiry type
	$("#productCheck").bind("change", function() {
		if ($(this).is(":checked")) {
			$(".email-appointment").hide();
			$(choiceStep).attr("data-require-model", "false");
			requireModel = false;

			$(".email-appointment").find("input,select,textarea").removeClass("error");
		} else {
			$(choiceStep).removeProp("data-require-model").removeAttr("data-require-model");
			requireModel = true;

			choiceStep.find(".selectbox").prop("required", true).attr("required", true);
			keyword.prop("required", true).attr("required", true);
			$(".email-appointment").show();
		}
	});

	//contact call country
	$(".two-column.check-country .selectbox").bind("change", function() {
		$(".two-column.time-date .selectbox").attr("data-all-param", "true");
	});
	
	$(".two-column.time-date .selectbox").each(function() {
		$(this).val('').removeProp("disabled").removeAttr("disabled").trigger("chosen:updated");
	});
});