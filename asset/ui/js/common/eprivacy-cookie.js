require(['jquery'], function($) {
    /* variables initializve */
	/*LGEFR-1800 20190103 modify*/
	 $(window).load(function(){
    /*//LGEFR-1800 20190103 modify*/
    var privacyMsgJson = "/" + document.getElementsByTagName("html")[0].getAttribute("data-countrycode") + "/" + "js/eprivacy-msg.json",
        privacyType = document.getElementsByTagName("html")[0].getAttribute("data-privacy-type"),
        privacyController = document.getElementsByTagName("html")[0].getAttribute("data-eprivacy-controller"),
        privacyMsgs,
        privacyInfo,
        cookieJson,
        isHttps = (location.href.indexOf("https") > -1) ? 1 : 0,
        full = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''),
        elem = ".no-cookies a, .no-cookies button, .no-cookies input, .no-cookies label, .no-cookies .iCheck-helper",
        eprivacy = '.eprivacy-cookie',
        privacy = '.agree-cookie',
        noCookie = '.no-cookies',
        tooltip = '.no-cookies-tooltips',
        cookieMask = '.cookie-mask',
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

    function getCookie(cKey) {
        var allcookies = document.cookie;
        var cookies = allcookies.split("; ");
        for (var i = 0; i < cookies.length; i++) {
            var keyValues = cookies[i].split("=");
            if (keyValues[0] == cKey) {
                return unescape(keyValues[1]);
            }
        }
        return "";
    }
    if (privacyType) {
        var localeCode = $("html").data("countrycode") + "_";

        $.browser = {};
        $.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit /.test(navigator.userAgent.toLowerCase());
        $.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
        $.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
        $.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());

        /* get Message/Category Info */
        getData(privacyMsgJson, "msgs");

        if (privacyType == "agree") {
            //alert("agree");
            //alert(privacyController);
        	/* LGERU-3275 : 20170614 modify */
            if(getCookie(localeCode+"agreeCookie") != 'Y' && privacyController == null) {
            	if($("html").data("countrycode") == "ru"){
            		$(wrapper).prepend('<div class="agree-cookie-wrap"><div class="agree-cookie"><span>' + privacyMsgs._Implicit_comment + '</span>' + '<a href="#" class="agree-cookie-close"><i class="icon icon-close"></i><span>' + privacyMsgs._Implicit_closeText + '</span></a>' + '</div></div>');
            	} else {
            		$(wrapper).prepend('<div class="agree-cookie-wrap"><div class="agree-cookie"><span>' + privacyMsgs._Implicit_comment + '</span>' + '<a href="' + privacyMsgs._Implicit_url + '">' + privacyMsgs._Implicit_urlText + '</a>' + '<a href="#" class="agree-cookie-close"><i class="icon icon-close"></i><span>' + privacyMsgs._Implicit_closeText + '</span></a>' + '</div></div>');
            	}
            }
            /* LGERU-3275 : 20170614 modify */

            $(privacy).find('a.agree-cookie-close').bind('click', function(e) {
                var date = new Date();
                /* LGERU-3275 : 20170614 modify */
                if($("html").data("countrycode") == "ru"){
                	date.setDate(date.getDate() + 365*50);
                } else {
                	date.setDate(date.getDate() + 365);
                }
                /*//LGERU-3275 : 20170614 modify */
                
                document.cookie = localeCode+"agreeCookie=Y;path=/;expires=" + date.toGMTString() + ";"
                $(privacy).remove();
                e.preventDefault();
            });
        } else {
            getData(cookieJson, "cookieinfo");

            var _globalTempAnalysis = "Y";
            var _globalTempImprovements = "Y";
            var _globalTempSocialMedia = "Y";
            var _globalTempAdvertising = "Y";
            var defaultCookie = document.getElementsByTagName("html")[0].getAttribute("data-default-cookie");

            if (defaultCookie.toUpperCase() == "OFF") {
                _globalTempAnalysis = "";
                _globalTempImprovements = "";
                _globalTempSocialMedia = "";
                _globalTempAdvertising = "";
            }

            var _globalOpenFlag = "true";
            var ePrivacyCookie = {
                init: function() {
                    this.disBtnAnalysis = "";
                    this.disBtnImprovements = "";
                    this.disBtnSocialMedia = "";
                    this.disBtnAdvertising = "";
                    /*LGEGR-835 20190114 add*/
                    this.disBtnStrictlyNecessay="";
                    /*//-835 20190114 add*/
                    this.build();
                },
                build: function() {
                    /* Countrycode */
                    this.countrycode = privacyInfo.Countrycode;

                    /* set button disabled var */
                    if (privacyInfo["Analysis of Site Enabled"] == "N") {
                        this.disBtnAnalysis = "disabled";
                    }
                    if (privacyInfo["Improvements Enabled"] == "N") {
                        this.disBtnImprovements = "disabled";
                    }
                    if (privacyInfo["Social Media Enabled"] == "N") {
                        this.disBtnSocialMedia = "disabled";
                    }
                    if (privacyInfo["Advertising Enabled"] == "N") {
                        this.disBtnAdvertising = "disabled";
                    }
                    /*LGEGR-835 20190114 add*/
                    if (privacyInfo["Strictly necessary Enabled"] == "N") {
                        this.disBtnStrictlyNecessay = "disabled";
                    }
                    /*//LGEGR-835 20190114 add*/
                    /* strict mode */
                    //if (privacyType == "strict") {
                    $("<div class='cookie-mask'></div>").appendTo(wrapper);
                    //}

                    /* Layer Popup Set Cookie Value */
                    this.getePrivacyCookie();

                    $(".no-cookies input.compare").off("change").unbind("change").on("change", function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                    });

                    //console.log(elem);
                    /* LGEPJT-254 20170804 modify */
                    $("body").off("click", elem).on("click", elem, function(e) {
                    /* //LGEPJT-254 20170804 modify */
                        e.stopPropagation();
                        e.preventDefault();
                        /* LGEPJT-254 20170804 add */
                        var dataSet = $(this).closest(noCookie).data();
                        /* //LGEPJT-254 20170804 add */
                        if ($(this).data("eprivacyType") == "tooltip" || $(this).closest(noCookie).data("eprivacyType") == "tooltip") {
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
                                var _pHeight = (_target.outerHeight(true) + _tip.outerHeight(true)) - 5;
                                var _minus = $(wrapper).hasClass("is-mobile") ? 125 : 205;
                                var _pleft = (_target.offset().left - _minus) + _target.outerWidth(true) / 2;
                                var _pRight = "auto";
                                var _arrowLeft = _target.offset().left / 2;
                                var _arrowRight = ($(window).width() - (_target.offset().left + _target.outerWidth()));

                                _target.attr("aria-describedby", "no-cookie-msg");
                                /* LGEPJT-254 20170804 add */
                                if(dataSet["noBtn"]=="y"){
                                    _pTop += _target.outerHeight(true)/2
                                }
                                /* //LGEPJT-254 20170804 add */
                                if (_pleft < 0) {
                                    if (_target.offset().left > 60 && $(wrapper).hasClass("is-mobile")) {
                                        _pleft = 20;
                                    } else {

                                        if (_target.find(".icon-video-play").length || _target.find(".icon-video-stop").length) {
                                            _pleft = 20;
                                        } else {
                                            _pleft = _target.offset().left;
                                        }
                                    }

                                    _arrowRight = "auto";
                                    _tip.removeClass("position-right").addClass("position-left");

                                    if (_arrowLeft <= 20) {
                                        _arrowLeft = 30;
                                    }
                                } else if (_pleft > $(window).width() - _tip.width()) {
                                    _pleft = "auto";
                                    _pRight = 20 + "px";
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

                                if (_target.find(".icon-video-play").length || _target.find(".icon-video-stop").length) {
                                    _pleft = _pleft + (_target.find(".icon").outerWidth() / 4) - 2;
                                }

                                if ($(".wrapper").hasClass("home") && _target.find("span.img").length) {
                                    _pHeight = _tip.outerHeight(true) - 5;
                                }

                                /* LGEPJT-254 20170804 add */
                                if(dataSet["noBtn"]=="y"){
                                    _pHeight =  70 + _tip.outerHeight(true);
                                }
                                /* LGEPJT-254 20170804 add */

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
                                    /* LGEPJT-254 20170804 add */
                                    if(dataSet["noBtn"]=="y"){
                                        _pTop -= _target.outerHeight(true)-35
                                    }
                                    /* //LGEPJT-254 20170804 add */
                                    _tip.addClass("position-top").css({
                                        "top": (_pTop + _target.outerHeight(true) + 20) + "px",
                                        "left": _pleft,
                                        "right": _pRight
                                    })

                                } else {
                                    _tip.removeClass("position-top");
                                }
                                /* LGEPJT-254 20170804 add */
                                if(dataSet.target == ".jquery-modal" && dataSet.topAbsolute){
                                    _tip.addClass("position-top").css({
                                        "top" : (_target.parent().outerHeight(true)/2
                                        +$(".jquery-modal .close-wrap").outerHeight(true)
                                        +parseInt($(".jquery-modal .modal-wrap").css("padding-top").split("px")[0])
                                        +50)+'px'
                                    })
                                }
                                /* //LGEPJT-254 20170804 add */
                            }
                        } else {
                            $(tooltip).remove();
                            ePrivacyCookie.cookieView();
                        }

                        $(".scroll-content, .styled-scroll").on("scroll", function(){
                            if($(this).find(".no-cookies").length){
                                $(tooltip).remove();
                            }
                        })

                        ePrivacyCookie.msgAccessFocus();
                    }).find(elem).unbind("click");

                    /* tooltip hide */
                    $(window).bind("resize scroll", function() {
                        $(tooltip).remove();
                    })

                    $(document).on('click', '.ec-tab-group .ec-tab-group-ul', function(e) {
                        e.preventDefault();
                        if ($(this).hasClass('openCookies')) {} else {
                            $(eprivacy).find('div.all-setting').show();
                            $(eprivacy).find('.cookies-close-btn').show();
                            $(eprivacy).find('div.ec-tab-group').css({
                                'visibility': 'hidden',
                                'height': '0'
                            });

                            if ($("body").hasClass("is-mobile")) {
                                if ($(mobileNav).hasClass("active")) {
                                    $(mobileNav).removeClass("active");
                                    $("html").removeAttr("style");
                                }
                            }
                            
                            /*PJTBTOBINS-1 : 20170322 add*/
                            /*var display =  $(eprivacy).find('.all-setting').css("display");
                        	if(display == "block"){
                        		$(wrapper).find(".eprivacy-cookie").css({position: "relative"});
                        	}*/
                        	/*//PJTBTOBINS-1 : 20170322 add*/
                        }
                    });

                    $(document).on('click', 'button.open-cookie-layer', function(e) {
                        e.preventDefault();
                        if ($(this).hasClass('openCookies')) {
                            $(this).removeClass('openCookies active');
                            $('.setting-detail').slideUp(250, function() {
                                $(this).empty().remove();
                            });

                            if ($("body").hasClass("is-mobile")){
                                if(privacyType == "strict" && _globalOpenFlag !== "false"){
                                } else {
                                    $(cookieMask).hide();
                                }
                            }
                        } else {
                        	
                            $(this).addClass('openCookies active');
                            ePrivacyCookie.getePrivacyCookie();
                            ePrivacyCookie.addCookieInfo();

                            if ($("body").hasClass("is-mobile")){
                                $(cookieMask).height($("body").height()).show();
                                if ($(mobileNav).hasClass("active")) {
                                    $(mobileNav).removeClass("active");
                                    $("html").removeAttr("style");
                                }
                            }
                        }
                    });

                    $(document).on('click', 'button.all-cookies-save', function(e) {
                        e.preventDefault();
                        $(this).addClass("on");

                        _globalTempAnalysis = "Y";
                        _globalTempImprovements = "Y";
                        _globalTempSocialMedia = "Y";
                        _globalTempAdvertising = "Y";

                        ePrivacyCookie.setePrivacyCookie();
                        setCookies(ePrivacyCookie.countrycode + "_eCookieOpenFlag", 'false', 1);
                        location.reload(true);
                    });

                    // event save button
                    $(document).on('click', 'button.save.eprivacy.on', function(e) {
                        e.preventDefault();
                        ePrivacyCookie.setePrivacyCookie();
                        setCookies(ePrivacyCookie.countrycode + "_eCookieOpenFlag", 'false', 1);
                        location.reload(true);
                    });

                    //close cookie setting layer
                    $(document).on('click', '.cookies-close-btn', function(e) {
                        e.preventDefault();
                        if (privacyType == "strict") {
                            /* //LGEFR-1095 20141201 modify */
                        	/*LGEFR-1800 20190103 modify*/
                        	if(ePrivacyCookie.countrycode =="FR" && $(cookieMask).css('display')!="block"){
                        		$(this).hide();
                                if ($("body").hasClass("is-mobile")){
                                    $(cookieMask).removeAttr("style").hide();
                                }

                                ePrivacyCookie.removeCookieInfo();
		                    }else{
		                            $(this).addClass("on");
		
		                            _globalTempAnalysis = "Y";
		                            _globalTempImprovements = "Y";
		                            _globalTempSocialMedia = "Y";
		                            _globalTempAdvertising = "Y";
		
		                            if(ePrivacyCookie.countrycode =="FR"){
		                            	ePrivacyCookie.setePrivacyCookie(1);
		                            }else{
		                            	ePrivacyCookie.setePrivacyCookie();
		                            }
		                            setCookies(ePrivacyCookie.countrycode + "_eCookieOpenFlag", 'false', 1);
		                            location.reload(true);
		                    }
                        } else {
                            $(this).hide();
                            if ($("body").hasClass("is-mobile")){
                                $(cookieMask).removeAttr("style").hide();
                            }

                            ePrivacyCookie.removeCookieInfo();
                        }
                        /*//LGEFR-1800 20190103 modify*/

                    });

                    //event option choose
                    $(document).on('click', '.detail-option-key button.eprivacy', function(e) {
                        e.preventDefault();
                        if (!$(this).hasClass('disabled')) {
                            $cookies_name = $(this).parent().parent().attr('class');
                            $cookies_name = $cookies_name.split(' ');
                            $cookies_name = $cookies_name[1];
                            $cookies_value = '';

                            if ($(this).hasClass('set-on')) {
                                $cookies_value = 'N';
                                $(this).hide();
                                $(this).siblings(".set-off").show().focus();

                            } else if ($(this).hasClass('set-off')) {
                                $cookies_value = 'Y';
                                $(this).hide();
                                $(this).siblings(".set-on").show().focus();
                            } else {
                                $cookies_value = '';
                            }

                            if ($('button.save.eprivacy.disabled').hasClass('disabled')) {
                                $('button.save.eprivacy.disabled').prop('disabled', false).removeClass('disabled');
                            }

                            ePrivacyCookie.seteCookieVal($cookies_name, $cookies_value);
                        }


                    });

                    /* mobile only */
                    $(document).on('click', '.detail-option-key button.desc-toggle', function(e) {
                        e.preventDefault();
                        var $desc = $(this).siblings("p");

                        $(this).removeClass("on").siblings("button.desc-toggle").addClass("on");
                        if ($(this).hasClass("desc-open")) {
                            $desc.slideDown();
                        } else {
                            $desc.slideUp();
                        }
                    });

                    $(document).on('click', 'button.cookies-tooltip-close', function(e) {
                        e.preventDefault();
                        $(noCookie).filter(".on").find("*").focus()
                        $(tooltip).remove();
                    });

                    $(".brandshop .store-map-search").find("button.search-button").on("click", function() {
                        var srollTarget = $("#whereToBuyInfo").find(".no-cookies");
                        $("body").stop().delay(150).animate({
                            scrollTop: srollTarget.offset().top - srollTarget.height()
                        }, 300);
                    });
                },
                privacyMsgs: {},
                privacyInfo: {},
                msgInsert: function(el) {
                    var ecCategory = $(el).attr('data-eprivacy-category');

                    if ($(wrapper).find(tooltip).length == 0) {
                        switch (ecCategory) {
                            case "Analysis of Site":
                                $(wrapper).append('<div class="no-cookies-tooltips" id="no-cookie-msg"><div tabindex="0"><strong>' + privacyMsgs._Explicit_Change_Setting + '</strong>' + privacyMsgs._Explicit_msg_tooltips_Analysis + '<button class="cookies-tooltip-close"><i class="icon icon-close"></i></button></div><span class="cookie-arrow"></span></div>');
                                break;
                            case "Improvements":
                                $(wrapper).append('<div class="no-cookies-tooltips" id="no-cookie-msg"><div tabindex="0"><strong>' + privacyMsgs._Explicit_Change_Setting + '</strong>' + privacyMsgs._Explicit_msg_tooltips_Improvements + '<button class="cookies-tooltip-close"><i class="icon icon-close"></i></button></div><span class="cookie-arrow"></span></div>');
                                break;
                            case "Social Media":
                                $(wrapper).append('<div class="no-cookies-tooltips" id="no-cookie-msg"><div tabindex="0"><strong>' + privacyMsgs._Explicit_Change_Setting + '</strong>' + privacyMsgs._Explicit_msg_tooltips_SocialMedia + '<button class="cookies-tooltip-close"><i class="icon icon-close"></i></button></div><span class="cookie-arrow"></span></div>');
                                break;
                            case "Advertising":
                                $(wrapper).prepend('<div class="no-cookies-tooltips" id="no-cookie-msg"><div tabindex="0"><strong>' + privacyMsgs._Explicit_Change_Setting + '</strong>' + privacyMsgs._Explicit_msg_tooltips_Advertising + '<button class="cookies-tooltip-close"><i class="icon icon-close"></i></button></div><span class="cookie-arrow"></span></div>');
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
                cookieView: function() {
                    ePrivacyCookie.addTabBtn();
                    $("html:not(:animated),body:not(:animated)").animate({
                        scrollTop: $(wrapper).offset().top
                    }, 500, function() {
                        $(eprivacy).find('div.all-setting').show();
                        $(eprivacy).find('.cookies-close-btn').show();
                        $(eprivacy).find('div.ec-tab-group').css({
                            'visibility': 'hidden',
                            'height': '0'
                        });

                        if ($("body").hasClass("is-mobile")) {
                            if ($(mobileNav).hasClass("active")) {
                                $(mobileNav).removeClass("active");
                            }
                            $(cookieMask).height($("body").height()).show();
                        }
                    });


                },
                addTabBtn: function() {
                    if ($(wrapper).find(eprivacy).size() == 0 && $(wrapper).hasClass("video-iframe") == false && privacyController == null) {
                        var $set_Explicit_body_button = '';
                        $set_Explicit_body_button = $set_Explicit_body_button + '<div class="eprivacy-cookie">';
                        $set_Explicit_body_button = $set_Explicit_body_button + '<div class="all-setting">';
                        $set_Explicit_body_button = $set_Explicit_body_button + '<p>' + privacyMsgs._Explicit_Main_Description + '</p>';
                        $set_Explicit_body_button = $set_Explicit_body_button + '<p class="btns-cookie">';
                        /*LGEFR-1800 20190103 modify*/
                        if (privacyType != "strict" || ePrivacyCookie.countrycode =="FR") {
                            $set_Explicit_body_button = $set_Explicit_body_button + '<button class="eprivacy all-cookies-save">' + privacyMsgs._Explicit_All_Check + '</button>';
                        }
                        /*//LGEFR-1800 20190103 modify*/
                        $set_Explicit_body_button = $set_Explicit_body_button + '<button class="eprivacy open-cookie-layer">' + privacyMsgs._Explicit_Change_Setting + '<i class="icon icon-triangle-down"></i><i class="icon icon-triangle-up"></i></button>';
                        $set_Explicit_body_button = $set_Explicit_body_button + '</p>';
                        $set_Explicit_body_button = $set_Explicit_body_button + '</div>';
                        $set_Explicit_body_button = $set_Explicit_body_button + '<div class="ec-tab-group">';
                        $set_Explicit_body_button = $set_Explicit_body_button + '<div class="ec-tab-group-ul">';
                        $set_Explicit_body_button = $set_Explicit_body_button + '<button class="ec-tab-button">' + privacyMsgs._Explicit_Button_Txt + '<i class="icon icon-triangle-up"></i></button>';
                        $set_Explicit_body_button = $set_Explicit_body_button + '</div>';
                        $set_Explicit_body_button = $set_Explicit_body_button + '</div>';
                        $set_Explicit_body_button = $set_Explicit_body_button + '<button class="cookies-close-btn"><i class="icon icon-close"></i></button>';
                        $set_Explicit_body_button = $set_Explicit_body_button + '</div>';

                        $(wrapper).prepend($set_Explicit_body_button);
                    }
                },
                addCookieInfo: function() {
                	
                    if ($(eprivacy).find('.setting-detail').size() == 0) {

                        var $set_Explicit_body = "";
                        var $set_each_part = "";
						/*LGEGR-835 20190114 add*/
						var $firstEmt="";
                        var	$secondEmt="";
                        var	$thirdEmt="";
                        var	$fourthEmt="";
						/*//LGEGR-835 20190114 add*/
                        $.each(privacyInfo, function($key, $var) {
                            if ($var == 'LGCOM_ANALYSIS_OF_SITE' || $var == 'LGCOM_IMPROVEMENTS' || $var == 'LGCOM_SOCIAL_MEDIA' || $var == 'LGCOM_ADVERTISING' || $var =="LGCOM_STRICTLY_NECESSARY") {
                                var _str_on = '';
                                var _str_off = '';
                                var _tempSiteTitle = '';
                                var _tempSite = '';
                                var _tempDescription = '';
                                var _btnDisabled = '';

                                switch ($var) {
                                    case 'LGCOM_ANALYSIS_OF_SITE':
                                        if (_globalTempAnalysis == 'Y') {
                                            _str_on = 'on';
                                        } else if (_globalTempAnalysis == 'N') {
                                            _str_off = 'on';
                                        } else {
                                            _str_off = 'on';
                                        }
                                        _tempSiteTitle = privacyMsgs._Explicit_Title_ANALYSIS;
                                        (_globalTempAnalysis) ? _tempSite = " : " + _globalTempAnalysis: null;
                                        _tempDescription = privacyMsgs._Explicit_Desc_LGCOM_ANALYSIS_OF_SITE;
                                        if (ePrivacyCookie.disBtnAnalysis == "disabled") {
                                            _str_on = '';
                                            _str_off = '';
                                            _btnDisabled = " " + ePrivacyCookie.disBtnAnalysis;
                                        }
                                        break;

                                    case 'LGCOM_IMPROVEMENTS':
                                        if (_globalTempImprovements == 'Y') {
                                            _str_on = 'on';
                                        } else if (_globalTempImprovements == 'N') {
                                            _str_off = 'on';
                                        } else {
                                            _str_off = 'on';
                                        }
                                        _tempSiteTitle = privacyMsgs._Explicit_Title_IMPROVEMENTS;
                                        (_globalTempImprovements) ? _tempSite = " : " + _globalTempImprovements: null;
                                        _tempDescription = privacyMsgs._Explicit_Desc_LGCOM_IMPROVEMENTS;
                                        if (ePrivacyCookie.disBtnImprovements == "disabled") {
                                            _str_on = '';
                                            _str_off = '';
                                            _btnDisabled = " " + ePrivacyCookie.disBtnImprovements;
                                        }
                                        break;

                                    case 'LGCOM_SOCIAL_MEDIA':
                                        if (_globalTempSocialMedia == 'Y') {
                                            _str_on = 'on';
                                        } else if (_globalTempSocialMedia == 'N') {
                                            _str_off = 'on';
                                        } else {
                                            _str_off = 'on';
                                        }
                                        _tempSiteTitle = privacyMsgs._Explicit_Title_SOCIAL_MEDIA;
                                        (_globalTempSocialMedia) ? _tempSite = " : " + _globalTempSocialMedia: null;
                                        _tempDescription = privacyMsgs._Explicit_Desc_LGCOM_SOCIAL_MEDIA;
                                        if (ePrivacyCookie.disBtnSocialMedia == "disabled") {
                                            _str_on = '';
                                            _str_off = '';
                                            _btnDisabled = " " + ePrivacyCookie.disBtnSocialMedia;
                                        }
                                        break;

                                    case 'LGCOM_ADVERTISING':
                                        if (_globalTempAdvertising == 'Y') {
                                            _str_on = 'on';
                                        } else if (_globalTempAdvertising == 'N') {
                                            _str_off = 'on';
                                        } else {
                                            _str_off = 'on';
                                        }
                                        _tempSiteTitle = privacyMsgs._Explicit_Title_ADVERTISING;
                                        (_globalTempAdvertising) ? _tempSite = " : " + _globalTempAdvertising: null;
                                        _tempDescription = privacyMsgs._Explicit_Desc_LGCOM_ADVERTISING;
                                        if (ePrivacyCookie.disBtnAdvertising == "disabled") {
                                            _str_on = '';
                                            _str_off = '';
                                            _btnDisabled = " " + ePrivacyCookie.disBtnAdvertising;
                                        }
                                        break;
                                        /*LGEGR-835 20190114 add*/
                                    case 'LGCOM_STRICTLY_NECESSARY':
                                        _tempSiteTitle = privacyMsgs._Explicit_Title_STRICTLY_NECESSARY;
                                        _tempDescription = privacyMsgs._Explicit_Desc_LGCOM_STRICTLY_NECESSARY;
                                        if (ePrivacyCookie.disBtnStrictlyNecessay == "disabled") {
                                            _btnDisabled = " " + ePrivacyCookie.disBtnStrictlyNecessay;
                                        }
                                        break;
                                        /*//LGEGR-835 20190114 add*/
                                    default:

                                }
                                if (_btnDisabled == '') {
                                	 /*LGEGR-835 20190114 modify*/
                                    $set_each_part = $set_each_part + '<dl class="detail-option-key ' + $var + '">';
                                    $set_each_part = $set_each_part + '<dt>' + _tempSiteTitle + '</dt>';
                                    $set_each_part = $set_each_part + '<dd>';
                                    if($var !="LGCOM_STRICTLY_NECESSARY"){
	                                    $set_each_part = $set_each_part + '<button data-comp="on" class="set-on  eprivacy ' + _str_on + _btnDisabled + '"><span>' + privacyMsgs._Explicit_Button_on + '</span></button> ';
	                                    $set_each_part = $set_each_part + '<button data-comp="off" class="set-off  eprivacy ' + _str_off + _btnDisabled + '"><span>' + privacyMsgs._Explicit_Button_off + '</span></button> ';
                                    }
                                    $set_each_part = $set_each_part + '<p>';
                                    $set_each_part = $set_each_part + _tempDescription;
                                    $set_each_part = $set_each_part + '</p>';
	                                $set_each_part = $set_each_part + '<button class="desc-open desc-toggle on"><i class="icon icon-menu-plus"></i><span>' + privacyMsgs._Explicit_Button_on + '</span></button> ';
	                                $set_each_part = $set_each_part + '<button class="desc-close desc-toggle"><i class="icon icon-menu-minus"></i><span>' + privacyMsgs._Explicit_Button_off + '</span></button> ';
                                    $set_each_part = $set_each_part + '</dd>';
                                    $set_each_part = $set_each_part + '</dl>';
                                    /*LGEGR-835 20190114 add*/
	                                    if($var == 'LGCOM_STRICTLY_NECESSARY'&& ePrivacyCookie.countrycode =="GR"){
	                                    	$firstEmt = $set_each_part;
	                                		$set_each_part='';
	                                	}else if($var == 'LGCOM_ANALYSIS_OF_SITE'&& ePrivacyCookie.countrycode =="GR"){
	                                		$secondEmt = $set_each_part;
	                                		$set_each_part='';
	                                	}else if($var == 'LGCOM_IMPROVEMENTS'&& ePrivacyCookie.countrycode =="GR"){
	                                		$thirdEmt = $set_each_part;
	                                		$set_each_part='';
	                                	}else if($var == 'LGCOM_ADVERTISING'&& ePrivacyCookie.countrycode =="GR"){
	                                		$fourthEmt = $set_each_part;
	                                		$set_each_part='';
	                                	}else if($var == 'LGCOM_SOCIAL_MEDIA'&& ePrivacyCookie.countrycode =="GR"){
	                                		$set_each_part='';
	                                	}
                                	}
                                /*LGEGR-835 20190114 modify*/
                            } else {
                                $set_each_part = $set_each_part + '';
                            }

                        });

                        $set_Explicit_body = '';
                        $set_Explicit_body = $set_Explicit_body + '<div class="setting-detail">';
                        $set_Explicit_body = $set_Explicit_body + '<div class="detail-wrap">';
                        $set_Explicit_body = $set_Explicit_body + '<p class="desc">';
                        $set_Explicit_body = $set_Explicit_body + privacyMsgs._Explicit_Description;
                        $set_Explicit_body = $set_Explicit_body + '</p>';
                        $set_Explicit_body = $set_Explicit_body + '<div class="detail-option">';
                        /*LGEGR-835 20190114 modify*/
                        if(ePrivacyCookie.countrycode =="GR"){
                        	$set_Explicit_body = $set_Explicit_body + $firstEmt + $secondEmt + $thirdEmt + $fourthEmt;
                        }else{
                        	$set_Explicit_body = $set_Explicit_body + $set_each_part;
                        }
                        /* //LGEGR-835 20190114 modify*/
                        $set_Explicit_body = $set_Explicit_body + '</div>';

                        var _btnDisSave = "";
                        if (_globalTempAnalysis == "" && _globalTempImprovements == "" && _globalTempSocialMedia == "" && _globalTempAdvertising == "") {
                            _btnDisSave = " disabled";
                        }

                        $set_Explicit_body = $set_Explicit_body + '<div class="detail-copy">';
                        $set_Explicit_body = $set_Explicit_body + '<button class="save eprivacy on ' + _btnDisSave + '">' + privacyMsgs._Explicit_Button_Save + '</button>';
                        $set_Explicit_body = $set_Explicit_body + '</div>';
                        $set_Explicit_body = $set_Explicit_body + '</div>';
                        $set_Explicit_body = $set_Explicit_body + '</div>';

                        $($set_Explicit_body).insertBefore($('.eprivacy-cookie').find('div.ec-tab-group'));

                        $('.detail-wrap').find('button.disabled').each(function() {
                            $(this).prop('disabled', true);
                        });

                        $('.setting-detail').slideDown(250, function() {
                            $('.setting-detail .detail-wrap').css({
                                'visibility': 'visible',
                                'height': 'auto'
                            });

                            $('.setting-detail').slideDown(150, function() {
                                $('.eprivacy-cookie').find('div.ec-tab-group').css('visibility', 'hidden');
                            });
                        });

                        $(eprivacy).find('div.all-setting').show();
                        $(eprivacy).find('.cookies-close-btn').show();
                    }

                },

                removeCookieInfo: function() {
                    $('.ec-tab-group .ec-tab-group-ul, button.open-cookie-layer, a.cookies-close').removeClass('openCookies active');
                    $('.setting-detail').hide().empty().remove()

                    $(eprivacy).find('div.all-setting').hide();
                    $(eprivacy).find('div.ec-tab-group').css({
                        'visibility': 'visible',
                        'height': 'auto'
                    });
                    /*PJTBTOBINS-1 : 20170322 add*/
                    /*if($(eprivacy).hasClass("business")){delete
                    	$(eprivacy).find('div.ec-tab-group').css({'position' : 'absolute', 'text-align':'center', 'background': 'none', 'width': '100%'});
                    	$(eprivacy).find('div.ec-tab-group .ec-tab-button').css({'float' : 'none'});
                    }*/
                    /*PJTBTOBINS-1 : 20170322 add*/
                    setCookies(ePrivacyCookie.countrycode + "_eCookieOpenFlag", 'false', 1);
                    return false;
                },

                seteCookieVal: function($key, $var) {
                    if ($key == "LGCOM_ANALYSIS_OF_SITE") {
                        if ($var == "Y") {
                            _globalTempAnalysis = "Y";
                            $(".detail-option-key.LGCOM_ANALYSIS_OF_SITE button.set-on").show();
                            $(".detail-option-key.LGCOM_ANALYSIS_OF_SITE button.set-off").hide();
                        } else if ($var == "N") {
                            _globalTempAnalysis = "N";
                            $(".detail-option-key.LGCOM_ANALYSIS_OF_SITE button.set-on").hide();
                            $(".detail-option-key.LGCOM_ANALYSIS_OF_SITE button.set-off").show();
                        } else {
                            $(".detail-option-key.LGCOM_ANALYSIS_OF_SITE button.set-on").show();
                            $(".detail-option-key.LGCOM_ANALYSIS_OF_SITE button.set-off").hide();
                        }
                    }

                    if ($key == "LGCOM_IMPROVEMENTS") {
                        if ($var == "Y") {
                            _globalTempImprovements = "Y";
                            $(".detail-option-key.LGCOM_IMPROVEMENTS button.set-on").show();
                            $(".detail-option-key.LGCOM_IMPROVEMENTS button.set-off").hide();
                        } else if ($var == "N") {
                            _globalTempImprovements = "N";
                            $(".detail-option-key.LGCOM_IMPROVEMENTS button.set-on").hide();
                            $(".detail-option-key.LGCOM_IMPROVEMENTS button.set-off").show();
                        } else {
                            $(".detail-option-key.LGCOM_ANALYSIS_OF_SITE button.set-on").show();
                            $(".detail-option-key.LGCOM_ANALYSIS_OF_SITE button.set-off").hide();
                        }

                    }

                    if ($key == "LGCOM_SOCIAL_MEDIA") {
                        if ($var == "Y") {
                            _globalTempSocialMedia = "Y";
                            $(".detail-option-key.LGCOM_SOCIAL_MEDIA button.set-on").show();
                            $(".detail-option-key.LGCOM_SOCIAL_MEDIA button.set-off").hide();
                        } else if ($var == "N") {
                            _globalTempSocialMedia = "N";
                            $(".detail-option-key.LGCOM_SOCIAL_MEDIA button.set-on").hide();
                            $(".detail-option-key.LGCOM_SOCIAL_MEDIA button.set-off").show();
                        } else {
                            $(".detail-option-key.LGCOM_ANALYSIS_OF_SITE button.set-on").show();
                            $(".detail-option-key.LGCOM_ANALYSIS_OF_SITE button.set-off").hide();
                        }
                    }

                    if ($key == "LGCOM_ADVERTISING") {
                        if ($var == "Y") {
                            _globalTempAdvertising = "Y";
                            $(".detail-option-key.LGCOM_ADVERTISING button.set-on").show();
                            $(".detail-option-key.LGCOM_ADVERTISING button.set-off").hide();
                        } else if ($var == "N") {
                            _globalTempAdvertising = "N";
                            $(".detail-option-key.LGCOM_ADVERTISING button.set-on").hide();
                            $(".detail-option-key.LGCOM_ADVERTISING button.set-off").show();
                        } else {
                            $(".detail-option-key.LGCOM_ANALYSIS_OF_SITE button.set-on").show();
                            $(".detail-option-key.LGCOM_ANALYSIS_OF_SITE button.set-off").hide();
                        }
                    }
                },
                setePrivacyCookie: function(cDay) {
                	var expireDay=365;
                    if(cDay!= undefined){
                    	expireDay=cDay
                    }
                    $.each(privacyInfo, function($key, $var) {
                        var _tempKey = ePrivacyCookie.countrycode + "_" + $var;
                        
                        if ($var == "LGCOM_ANALYSIS_OF_SITE") {
                            if (_globalTempAnalysis == "Y") {
                                setCookies(_tempKey, 'Y', expireDay);
                            } else if (_globalTempAnalysis == "N") {
                                setCookies(_tempKey, 'N', expireDay);
                            }
                        }

                        if ($var == "LGCOM_IMPROVEMENTS") {
                            if (_globalTempImprovements == "Y") {
                                setCookies(_tempKey, 'Y', expireDay);
                            } else if (_globalTempImprovements == "N") {
                                setCookies(_tempKey, 'N', expireDay);
                            }
                        }

                        if ($var == "LGCOM_SOCIAL_MEDIA") {
                            if (_globalTempSocialMedia == "Y") {
                                setCookies(_tempKey, 'Y', expireDay);
                            } else if (_globalTempSocialMedia == "N") {
                                setCookies(_tempKey, 'N', expireDay);
                            }
                        }

                        if ($var == "LGCOM_ADVERTISING") {
                            if (_globalTempAdvertising == "Y") {
                                setCookies(_tempKey, 'Y', expireDay);
                            } else if (_globalTempAdvertising == "N") {
                                setCookies(_tempKey, 'N', expireDay);
                            }
                        }
                    });
                },
                getePrivacyCookie: function() {
                    var _tmpGetANALYSIS = getCookies(this.countrycode + "_LGCOM_ANALYSIS_OF_SITE");
                    var _tmpGetIMPROVEMENTS = getCookies(this.countrycode + "_LGCOM_IMPROVEMENTS");
                    var _tmpGetSOCIAL_MEDIA = getCookies(this.countrycode + "_LGCOM_SOCIAL_MEDIA");
                    var _tmpGetADVERTISING = getCookies(this.countrycode + "_LGCOM_ADVERTISING");
                    var _tmpOpenFlag = getCookies(this.countrycode + "_eCookieOpenFlag");

                    if (_tmpGetANALYSIS == "Y") {
                        _globalTempAnalysis = "Y";
                        /* dtm */
                        _satellite.setCookie("sat_track", "true");

                    } else if (_tmpGetANALYSIS == "N") {
                        _globalTempAnalysis = "N";
                        /* dtm */
                        _satellite.setCookie("sat_track", "false");
                    } else {
                        (defaultCookie.toUpperCase() == "OFF") ? _globalTempAnalysis = "": _globalTempAnalysis = "Y";
                    }

                    if (_tmpGetIMPROVEMENTS == "Y") {
                        _globalTempImprovements = "Y";
                    } else if (_tmpGetIMPROVEMENTS == "N") {
                        _globalTempImprovements = "N";
                        setCookies("LG4_COMPARE_CART", "", "");
                        setCookies("LG4_FILTER_CART", "", "");
                        setCookies("LG4_RECENTLY_VIEW", "", "");
                        setCookies(this.countrycode + "_csEmailAddr", "", "")
                        $('.slide-bar').trigger('slideDefault');
                    } else {
                        (defaultCookie.toUpperCase() == "OFF") ? _globalTempImprovements = "": _globalTempImprovements = "Y";
                    }

                    if (_tmpGetSOCIAL_MEDIA == "Y") {
                        _globalTempSocialMedia = "Y";
                    } else if (_tmpGetSOCIAL_MEDIA == "N") {
                        _globalTempSocialMedia = "N";
                    } else {
                        (defaultCookie.toUpperCase() == "OFF") ? _globalTempSocialMedia = "": _globalTempSocialMedia = "Y";
                    }

                    if (_tmpGetADVERTISING == "Y") {
                        _globalTempAdvertising = "Y";
                    } else if (_tmpGetADVERTISING == "N") {
                        _globalTempAdvertising = "N";
                    } else {
                        (defaultCookie.toUpperCase() == "OFF") ? _globalTempAdvertising = "": _globalTempAdvertising = "Y";
                    }

                    if (_tmpOpenFlag == "false") {
                        _globalOpenFlag = _tmpOpenFlag;
                    }
                }
            }

            ePrivacyCookie.init();
            ePrivacyCookie.addTabBtn();
            if (_globalOpenFlag === "false") {
                $(eprivacy).find('div.all-setting').hide();
                $(eprivacy).find('.cookies-close-btn').hide();
                $(eprivacy).find('div.ec-tab-group').css({
                    'visibility': 'visible',
                    'height': 'auto'
                });
            } else {
                if (privacyType == "strict") {
                    $(cookieMask).height($("body").height()).show();
                }

                if(privacyType == "strict" && $("body").hasClass("is-mobile") == false){
                    $(eprivacy).find('.cookies-close-btn').bind("keydown",function(e){
                        if (e.keyCode == 9 && e.shiftKey) {

                        } else if (e.keyCode == 9) {
                            e.preventDefault();
                            $(eprivacy).find("a, button").filter(":first").focus();
                        }
                    })

                    $(eprivacy).find("a, button").filter(":first").bind("keydown",function(e){
                        if (e.keyCode == 9 && e.shiftKey) {
                            e.preventDefault();
                            $(eprivacy).find('.cookies-close-btn').focus();
                        }
                    });
                }
            }

            $(wrapper).addClass("eprivacy-check");
            
            /*PJTBTOBINS-1 : 20170322 add*/
	            if($("body").find(".b2b-b2c-choice").length > 0){
	            	$(wrapper).find(".eprivacy-cookie").addClass("business");            	
		            if($(".eprivacy-cookie.business")){
		            	 var windowWidth = $(window).width(), _totalWidth = 0, liwidth = 0,
		 	    		_btn = $(".ec-tab-button").width(),
		 	    		_btnPos = (windowWidth - _btn)/2;
		             
		 		    	$(".b2b-b2c-choice > ul li").each(function(i) {
		 		  			var liwidth = $(this).outerWidth(true);
		 		  			_totalWidth += liwidth;
		 		  		}, this);
		 		    	var btnPos = function() {
		 		    		var windowWidth = $(window).width(),
		 					_halfW = windowWidth/2 - _btn,
		 					_elTotal = _totalWidth - 14,
		 					_btnPos = (windowWidth - _btn)/2;
		 		    		
		 		    		$(".ec-tab-group").css({left : _btnPos});
		 		    		if(_halfW < _elTotal){
		 		    			$(".ec-tab-group").css({left:(windowWidth-(_totalWidth+_btn))/2});
		 		    			if(windowWidth < 767) {
		 		        			$(".ec-tab-group").css({left:""});
		 		        		}
		 		    		}
		 		    	}
		 		    		btnPos();
		 		    	$(window).resize(function() {
		 		    		btnPos();
		 				});
		            }   
	            }
            /*//PJTBTOBINS-1 : 20170322 add*/
        }
    }
	});
});
