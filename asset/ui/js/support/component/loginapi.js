var checkRegister, registAccount;

define(['jquery', 'ic/ic', 'ic/ui/module'], function($, ic, module) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        proto;

    var loginApi = function(el, options) {
        var self = this;
        loginApi.superclass.constructor.call(self, el, options);
        self.options.onInit = $.proxy(self, 'init');
        self.options.onBuild = $.proxy(self, 'build');
        self.type = self.options.social.toUpperCase();
        self._init();
    };

    util.inherits(loginApi, module);

    proto = loginApi.prototype;

    proto._init = function() {

        var self = this;


        switch (self.type) {
        case "FACEBOOK":
            self.facebookLogin = false;
            break;
        case "WEIBO":
            self.weiboLogin = false;
            break;
        case "QQ":
            self.qqLogin = false;
            break;
        }

        self._build();

    };

    proto._build = function() {

        var self = this;

        switch (self.type) {
        case "FACEBOOK":
            self.buildFacebook();
            break;
        case "WEIBO":
            self.buildWeibo();
            break;
        case "QQ":
            self.buildQQ();
            break;
        };


        self.$el.on(events.CLICK_EVENT, function(e) {
            e.preventDefault();

            if(!self.options.onedit) {
                self.$el.spin(true);
                self.openAuthWindow();
            }else{
                if(self.$el.hasClass("connected")){
                    // SNS 계정 차단 시
                    var param = {
                        "snsType": self.type
                    };

                    $.ajax({
                        url: self.options.authUrl,
                        data: param,
                        type: "post",
                        dataType: 'json',
                        success: function(data) {
                            if (data.result&&!data.connected) {
                                self.$el.removeClass("connected")
                            } else {
                                self.$el.addClass("connected")
                            }
                        }
                    })

                }else{
                    self.openAuthWindow();
                }
            }

            registAccount = function(response, url) {
                if(self.options.ispopup){
                    self.$el.spin(false);
                    self.authWindow.close();
                    location.href = url + "?" + $.param(response), "popup-regist-" + self.types;
                } else {
                    var windowWidth = 600;
                    var windowHeight = 500;
                    self.authWindow.location.href = url + "?" + $.param(response), "popup-regist-" + self.types;
                }
            };

            checkRegister = function(token) {

                var param = {
                    "snsType": self.type,
                    "oAuthCode": token,
                    "loginSuccessUrl": self.options.loginSuccessUrl || ''
                };

                $.ajax({
                    url: self.options.authUrl,
                    data: param,
                    type: "post",
                    dataType: 'json',
                    success: function(data) {
                        if (data.result) {
                            if(!self.options.onedit){
                                if (data.modalUrl) { // privacy (with form)
                                    self.$el.data({
                                        "url": data.modalUrl,
                                        "maxWidth": 600,
                                        "postSend": true,
                                        "postData": $.extend(param,data)
                                    }).modal();
                                } else { // login
                                    if(self.options.ispopup){
                                        window.opener.location.href = '';
                                        self.authWindow.close();
                                        window.close();
                                    }else{
                                        //self.$el.spin(false);
                                        self.authWindow.close();
                                        location.reload();
                                    }
                                }
                            } else if(data.connected){
                                self.authWindow.close();
                                self.$el.addClass("connected");
                            }
                        } else {
                            if (self.options.onedit) {
                                if (data.errMsg) {
                                    modalAlert(data.errMsg, true);
                                }
                                self.authWindow.close();
                                return;
                            }

                            var url = data.url || '';
                            if (self.options.type == 'qq') {
                                data = {
                                    "snsType": self.options.type,
                                    "accessToken": data.access_token,
                                    "snsId": data.snsId,
                                    "urlInfo": data.urlInfo,
                                    "urlParam": ""
                                };
                            } else if (self.options.type == 'weibo') {
                                data = {
                                    "snsType": self.options.type,
                                    "oAuthCode": data.oAuthCode,
                                    "snsId": data.id,
                                    "urlInfo": data.urlInfo,
                                    "urlParam": ""
                                };
                            } else if (self.options.type == 'facebook') {
                                data = {
                                    "snsType": data.snsType,
                                    "oAuthCode": data.oAuthCode,
                                    "snsId": data.id,
                                    "urlInfo": data.urlInfo,
                                    "urlParam": "",
                                    "snsEmail": data.email,
                                    "snsFirstName": data.first_name,
                                    "snsLastName": data.last_name
                                };
                            }

                            registAccount(data, url);
                        }
                    },
                    error: function() {
                        self.$el.spin(false);
                        self.authWindow.close();
                    }
                })
            };
        })
    };

    proto.buildFacebook = function() {

        var self = this;
        self.openAuthWindow = function() {
            var windowWidth = 600;
            var windowHeight = 550;
            self.openWindow(self.options.windowUrl + "?" + $.param(self.options.param), windowWidth, windowHeight)
        }

    };

    proto.buildWeibo = function() {

        var self = this;
        self.openAuthWindow = function() {
            var windowWidth = 600;
            var windowHeight = 400;
            self.openWindow(self.options.windowUrl + "?" + $.param(self.options.param), windowWidth, windowHeight)
        }

    };

    proto.buildQQ = function() {

        var self = this;
        self.openAuthWindow = function() {
            var windowWidth = 600;
            var windowHeight = 400;
            self.openWindow(self.options.windowUrl + "?" + $.param(self.options.param), windowWidth, windowHeight)
        }

    };

    proto.openWindow = function(url, width, height) {
        var self = this;

        if (!self.options.ispopup) {
            window.name = 'openerWindow';
        }
        self.authWindow = open(url, "auth_window_" + self.type, "resizable=yes,scrollbars=yes,width=" + width + ",height=" + height + ",left=" + (screen.availWidth - width) / 2 + ",top=" + (screen.availHeight - height) / 2);
        self.authWindowIntv = setInterval(function() {
            if (self.authWindow.closed) {
                if(!self.options.onedit) self.$el.spin(false);
                clearInterval(self.authWindowIntv);
            }
        }, 100);
        return self;

    };

    ic.jquery.plugin('loginApi', loginApi, '.btn-sns-login');
    return loginApi;
});
