if (parent == self) {

	var convertToFrame = function() {
		var ev = document.createEvent("HTMLEvents");
		var ifrm = document.createElement("iframe"); // iframe element
		var mpoEl = document.getElementById("mpoLoad"); // anchor
		var parentEl = mpoEl.parentNode;

		ifrm.name = mpoEl.getAttribute("data-iframe-name");
		ifrm.id = mpoEl.getAttribute("data-iframe-id");
		ifrm.src = mpoEl.href;
		ifrm.scrolling = "no";
		ifrm.width = "100%";
		ifrm.frameBorder = 0;

		parentEl.replaceChild(ifrm, mpoEl);
		ev.initEvent('scroll', true, false);

		window.onscroll = function() {
			mpoContent.window.dispatchEvent(ev);
		}
	}();

} else {

	var lastIframeHeight = 0;

	function adjustHeight(){
		var height = $('body').outerHeight(true);
		if(lastIframeHeight!=height) {
			$("body", parent.document).find("#mpo-content").height(height);
			lastIframeHeight = height;
			parent.document.documentElement.scrollTop++;	// ie
			parent.document.documentElement.scrollTop--;
			parent.document.body.scrollTop++;	// chrome
			parent.document.body.scrollTop--;
		}
	}

	$(window).on("ready resize scroll", adjustHeight);

	$(document).on("ajaxComplete", adjustHeight).on("click",".btn-show-hide[data-target]",function(e){
	    $target = $("#"+$(this).data("target"))
	    $targetWrap = $target.is(":visible")?$target.closest(".row-wrap"):$(e.target).closest(".row-wrap");
	    parent.$("html:not(:animated),body:not(:animated)").animate({scrollTop:$targetWrap.offset().top+$("body", parent.document).find("#mpo-content").offset().top},500)
	}).on("click","#hero-area .hero img",function(e){
        $(this).closest(".hero").find("a.button")[0].click();
    }); //.on("load", "img", adjustHeight);
	setInterval(adjustHeight, 500);

	// $("a[target='_self'], a:not([target])").attr("target", "_parent");

	var ePrivacyCookie;

	/* eprivacy cookies */
	$(function(){
		var privacyMsgJson = "/" + document.getElementsByTagName("html")[0].getAttribute("data-countrycode") + "/" + "js/eprivacy-msg.json",
			privacyType = document.getElementsByTagName("html")[0].getAttribute("data-privacy-type"),
			privacyMsgs,
			privacyInfo,
			cookieJson,
			isHttps = (location.href.indexOf("https") > -1) ? 1 : 0,
			full = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''),
			elem = ".no-cookies, .no-cookies a, .no-cookies button, .no-cookies span",
			noCookie = '.no-cookies',
			tooltip = '.no-cookies-tooltips',
			wrapper = 'body',
			mobileNav = '#mobileFlyoutNav',
			getData = function(jsonUrl, type) {
				$.ajax({
					type: 'get',
					url: jsonUrl,
					async: false,
					dataType: "json",
					success: function(data) {
						if (typeof data === "string") {
							data = jQuery.parseJSON(data);
						}
						if (type == "msgs") {
							privacyMsgs = data._set_cookies;
						} else {
							privacyInfo = data;
						}
					}
				});
			}

		if (isHttps) {
			cookieJson = full + document.getElementsByTagName("html")[0].getAttribute("data-privacy-cookieInfo");
		} else {
			cookieJson = document.getElementsByTagName("html")[0].getAttribute("data-privacy-cookieInfo");
		}

		function setCookies(cName, cValue, cDay) {
			var expire = new Date();
			expire.setDate(expire.getDate() + cDay);
			cookies = cName + '=' + escape(cValue) + '; path=/ ';
			if (typeof cDay != 'undefined') cookies += ';expires=' + expire.toGMTString() + ';';

			if (!$.browser.msie && cName == "indexCountry") {
				var domain = "";
				document.cookie = cookies + ((expire == null) ? "" : ("; expire=" + expire.toGMTString())) + ((domain == null) ? "" : ("; domain=" + domain));
			} else if ($.browser.msie && cName == "indexCountry") {
				document.cookie = cookies += ';expires=' + expire.toGMTString() + ';' + ((domain == null) ? "" : ("; domain=" + domain));
			} else {
				document.cookie = cookies + ' domain=.lg.com;';
			}
		}

		function getCookies(cName) {
			cName = cName + '=';
			var cookieData = document.cookie;
			var start = cookieData.indexOf(cName);
			var cValue = '';
			if (start != -1) {
				start += cName.length;
				var end = cookieData.indexOf(';', start);
				if (end == -1) end = cookieData.length;
				cValue = cookieData.substring(start, end);
			}
			return unescape(cValue);
		}

		if (privacyType) {
			$.browser = {};
			$.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit /.test(navigator.userAgent.toLowerCase());
			$.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
			$.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
			$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());

			/* get Message/Category Info */
			getData(privacyMsgJson, "msgs");

			if (privacyType == "agree") {

			} else {
				getData(cookieJson, "cookieinfo");

				ePrivacyCookie = {
					init: function() {
						this.build();
					},
					build: function() {
						if (elem.length) {

							var unbindClick = $(".hero-thumb-list .rwd-carousel > ul li, .hero-thumb-list .rwd-carousel > ul li a, a.play-video");

							$(unbindClick, "#container").unbind("click");
							/*LGEIS-1901 20160601 modify*/
							$(".wrapper").off("click", elem).on("click", elem, function(e) {
							/*//LGEIS-1901 20160601 modify*/
								e.preventDefault();
								e.stopPropagation();

								if ($(this).data("eprivacyType") == "tooltip" || $(this).closest(noCookie).data("eprivacyType") == null) {
									/* create Tooltip Message */
									if ($(this).closest(noCookie).hasClass("on") && $(tooltip).length) {
										$(this).closest(noCookie).removeClass("on");
										$(tooltip).remove();
										$(this).removeAttr("aria-describedby");
									} else {
										$(noCookie).removeClass("on");
										$(this).closest(noCookie).addClass("on");
										ePrivacyCookie.msgInsert($(this).closest(noCookie));

										var _target = $(this);
										var _tip = $(tooltip);
										var _arrow = $(tooltip).find(".cookie-arrow");
										var _pTop = _target.offset().top;
										var _pHeight = (_target.outerHeight(true) + _tip.outerHeight(true)) + 20;
										var _minus = 140;
										var _pleft = (_target.offset().left - _minus) + _target.outerWidth(true) / 2;
										var _pRight = "auto";
										var _arrowLeft = _target.offset().left / 2;
										var _arrowRight = ($(window).width() - (_target.offset().left + _target.outerWidth()));

										_target.attr("aria-describedby", "no-cookie-msg");

										if (_pleft < 0) {
											if (_target.offset().left > 60 && $(wrapper).hasClass("is-mobile")) {
												_pleft = 7;
											} else {

											}

											_arrowRight = "auto";
											_tip.removeClass("position-right").addClass("position-left");

											if (_arrowLeft <= 20) {
												_arrowLeft = 30;
											}
										} else if (_pleft > $(window).width() - _tip.width()) {
											_pleft = "auto";
											_pRight = 7 + "px";
											_arrowLeft = "auto";
											_tip.removeClass("position-left").addClass("position-right");
											if (_arrowRight <= 20) {
												_arrowRight = 30;
											}
										} else {
											_tip.removeClass("position-left position-right");
											_arrowLeft = "50%";
											_arrowRight = "auto";
										}

										_tip.css({
											"top": (_pTop - _pHeight),
											"left": _pleft,
											"right": _pRight
										})

										_arrow.css({
											"left": _arrowLeft,
											"right": _arrowRight
										})

										if ($(tooltip).offset().top < $(window).scrollTop()) {
											var offsetTop = $(tooltip).offset().top - 20;
											_tip.addClass("position-top").css({
												"top": (_pTop + _target.outerHeight(true) + 20) + "px",
												"left": _pleft,
												"right": _pRight
											})

										} else {
											_tip.removeClass("position-top");
										}

										if ($(".iv-popup-wrap").find(".no-cookies").length) {
											_tip.css("z-index", "1000000002");

										}
									}
								} else {
									$(tooltip).remove();
								}

								ePrivacyCookie.msgAccessFocus();

								return false;
							});
						}

						$(document).on('click', ".iv-popup-wrap .iv-close", function(e) {
							$(tooltip).remove();
						})

						/* tooltip hide */
						$(window).bind("resize scroll", function() {
							$(tooltip).remove();
						})

						$(document).on('click', 'button.cookies-tooltip-close', function(e) {
							e.preventDefault();
							$(noCookie).filter(".on").find("*").focus()
							$(tooltip).remove();
						});
					},
					privacyMsgs: {},
					privacyInfo: {},
					msgInsert: function(el) {
						var ecCategory = $(el).attr('data-eprivacy-category');

						if ($(wrapper).find(tooltip).length == 0) {
							switch (ecCategory) {
								case "Analysis of Site":
									$(wrapper).append('<div class="no-cookies-tooltips" id="no-cookie-msg"><div tabindex="0"><strong>' + privacyMsgs._Explicit_Change_Setting + '</strong>' + privacyMsgs._Explicit_msg_tooltips_Analysis + '<button class="cookies-tooltip-close"><img src="/lg4-common-gp/img/common/layer_close_for_ie7.png" alt="close"></button></div><span class="cookie-arrow"></span></div>');
									break;
								case "Improvements":
									$(wrapper).append('<div class="no-cookies-tooltips" id="no-cookie-msg"><div tabindex="0"><strong>' + privacyMsgs._Explicit_Change_Setting + '</strong>' + privacyMsgs._Explicit_msg_tooltips_Improvements + '<button class="cookies-tooltip-close"><img src="/lg4-common-gp/img/common/layer_close_for_ie7.png" alt="close"></button></div><span class="cookie-arrow"></span></div>');
									break;
								case "Social Media":
									$(wrapper).append('<div class="no-cookies-tooltips" id="no-cookie-msg"><div tabindex="0"><strong>' + privacyMsgs._Explicit_Change_Setting + '</strong>' + privacyMsgs._Explicit_msg_tooltips_SocialMedia + '<button class="cookies-tooltip-close"><img src="/lg4-common-gp/img/common/layer_close_for_ie7.png" alt="close"></button></div><span class="cookie-arrow"></span></div>');
									break;
								case "Advertising":
									$(wrapper).prepend('<div class="no-cookies-tooltips" id="no-cookie-msg"><div tabindex="0"><strong>' + privacyMsgs._Explicit_Change_Setting + '</strong>' + privacyMsgs._Explicit_msg_tooltips_Advertising + '<button class="cookies-tooltip-close"><img src="/lg4-common-gp/img/common/layer_close_for_ie7.png" alt="close"></button></div><span class="cookie-arrow"></span></div>');
									break;
								default:
									break;
							}
						}
					},

					msgAccessFocus: function() {
						var firstElem = $(tooltip).find("*[tabindex='0'], button").filter(":first");
						var lastElem = $(tooltip).find("*[tabindex='0'], button").filter(":last");

						$(elem).off("keydown").on("keydown", function(b) {
							if (b.keyCode == 9 && b.shiftKey) {} else if (b.keyCode == 9) {
								if ($(tooltip).length) {
									b.preventDefault();
									firstElem.focus();
								}
							}
						});

						firstElem.off("keydown").on("keydown", function(b) {
							if (b.keyCode == 9 && b.shiftKey) {
								if ($(tooltip).length && $(b.target).hasClass("cookies-tooltip-close") == false) {
									b.preventDefault();
									lastElem.focus();
								}
							} else if (b.keyCode == 9) {}
						});

						lastElem.off("keydown").on("keydown", function(b) {
							if (b.keyCode == 9) {
								if ($(tooltip).length) {
									b.preventDefault();
									firstElem.focus();
								}
							}
						});
					},

					getePrivacyCookie: function() {},

					addTabBtn: function() {}
				}

				ePrivacyCookie.init();
			}
		}

		var $shareLoad = $(".shareload");
		if ($shareLoad.length) {
			var url = $shareLoad.data("url");
			$.ajax({
				type: "GET",
				timeout: 50000,
				url: url,
				success: $.proxy(function(con) {

					$shareLoad.html(con);
					$('.social-likes').socialLikes();

					if(typeof(naviReSize) == "function") naviReSize()

				}, this)
			});
		}

	});

    function mpoWrapAlign(overlay) {

        var documentWidth = $(window).width();
        var documentHeight = $(window).height();

        if (documentWidth > 720) {
            documentWidth = 720;
        }
        overlay.width(documentWidth - 30);
        overlay.css({
            left: (($(window).width() - documentWidth) / 2) + "px"
        });

        var setHeight = parseInt(overlay.width() * 9 / 16);
        var docHeight = documentHeight - 55;

        if(setHeight > docHeight) {
            overlay.height(setHeight - 55);
        } else {
            overlay.height(setHeight);
        }

        overlay.css({'margin-top': parseInt(window.innerHeight/2*-1 + (parent.window.innerHeight - $('.mpo-pop-wrap').height()) / 2 + parent.document.body.scrollTop - $("body", parent.document).find("#mpo-content").offset().top)});

        $("iframe", overlay).css({
                width: overlay.width() - 6,
                height: overlay.height() - 20
            }
        );
        return
    }

}
