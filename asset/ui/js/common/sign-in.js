define(['jquery', 'ic/ic', 'ic/ui/module'], function($, ic, Module) {
    'use strict';


    var signIn,
        events = ic.events;

    var setSignIn = function(el, options) {
        var self = this;
        // Call the parent constructor
        setSignIn.superclass.constructor.call(self, el, options);
        self._init();
    };
    ic.util.inherits(setSignIn, Module);
    signIn = setSignIn.prototype;
    signIn._defaults = {
        //active class
        ac: 'active'
    };
    signIn._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self),
            loginCode = "LG4_LOGIN_" + $('html').data('countrycode').toUpperCase(),
            d = {}

            //function setCookie(cname, cvalue, exdays) {
            //    var d = new Date();
            //    d.setTime(d.getTime() + (exdays*24*60*60*1000));
            //    var expires = "expires="+d.toUTCString();
            //    document.cookie = cname + "=" + cvalue + "; " + expires;
            //}

        //d = self._callAjax();
        var ck = self._getCookie(loginCode);

        if (ck == "" || ck == "Y" || self.$el.data('login') == 'Y') {
        	
            var url = self.options.uri;
            /*LGECS-1072 20170529 add*/
            if(typeof url=="undefined"){
            	return;
            }
            /*LGECS-1072 20170529 add*/
            $.ajax({
                url: url,
                type: "post",
                dataType: "json",
                success: function(d) {
                    if (d.loginFlag == "N") {
                        self.$el.find(".flag-true").remove();
						self.$el.find(".flag-false").css('display','block');
                        if ($("body.is-mobile")[0]) {
                            $("#mobileFlyoutNav .mobile-login-form").remove();
                        }
                    } else if (d.loginFlag == "Y") {
                        self.$el.find(".flag-false").remove();
						self.$el.find(".flag-true").css('display','block');
                        self.$el.find("span.first-name").text(d.firstName);
                        self.$el.find("span.last-name").css('display','none');

                        /** email appointment, call appointment **/
                        if ($("body").find(".step-list").length > 0) {
                            //$("body").find(".step-list").find("#firstName").val(d.firstName);
                            //$("body").find(".step-list").find("#lastName").val(d.lastName);

                            /*
                            $("body").find(".step-list").find("#aboutEmail").val(d.email);
                            $("body").find(".step-list").find("#aboutEmailConfirm").val(d.email);
                            $("body").find(".step-list").find("#emailAddress").val(d.email);
                            $("body").find(".step-list").find("#contactTelePhone").val(d.phone);
                            $("body").find(".step-list").find("#contactMobilePhone").val(d.mphone);
                            */
                        }
                    };
                },
                error: $.proxy(function(ddd, b, c) {
                    // console.log(d.status, c);
                    return false;
                }),
            });
        } else if (ck == "N" || self.$el.data('login') == 'N') {
            d.loginFlag = "N";
            //console.log('call "N"');
            self.$el.find(".flag-true").remove();
            if ($("body.is-mobile")[0]) {
                $("#mobileFlyoutNav .mobile-login-form").remove();
            }
        }
        self.$el.addClass("active");
    }

    signIn._getCookie = function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";

    }

    ic.jquery.plugin('setSignIn', setSignIn, '.mylg-status');
    ic.jquery.plugin('setSignIn', setSignIn, '.signin-inner');
    return setSignIn;
});
