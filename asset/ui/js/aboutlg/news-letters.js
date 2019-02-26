define(['jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'chosen', 'mkt/forms', 'cs/datepicker'], function($, ic, module, config, chosen, Forms, datePicker) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        proto;

    var NewsLetters = function(el, options) {
        var self = this;

        NewsLetters.superclass.constructor.call(self, el, options);

        self.options.onInit = $.proxy(self, 'init');
        self.options.onChangeSelect = $.proxy(self, 'changeSelect');
        self.options.onUnsubcribeResult = $.proxy(self, 'unsubcribeResult');

        self._init();
        self._changeSelect();

        var localAddress = location.href.split("?")[1];
        var response = location.href.split("response=")[1];

        if(response){
            var emailId = location.href.split("emailAddress=")[1].split("&unsubscriptionMailFlag=Y")[0];
            self._unsubcribeResult(response, emailId);
        }

    };

    util.inherits(NewsLetters, module);

    proto = NewsLetters.prototype;

    proto._init = function() {
        var self = this;

        self.el = $(self.el);

        self.el.find(".selectbox").chosen({
            disable_search_threshold: 200
        });

        self.el.find("[data-change='ajaxLoad']").ajaxLoad();
    };

    proto._changeSelect = function() {
        var self = this;
        var $target = $("[data-change-button]");
        var button = $("[data-change-button]").data("changeButton");

        $(button).on('click',function(){
            if($target.val() == "" || $target.val() == null){
                $target.next(".chosen-container").find("input").focus();
            } else {
                window.open($target.val())
            }
        })
    };

    proto._unsubcribeResult = function(url, emailId){
        var replaceContent = $("#newsLetterForm");

        replaceContent.empty();

        $.ajax({
            type: "post",
            url : url,
            data :{"emailAddress":emailId, "unsubscriptionMailFlag":"Y"},
            dataType: "json",
            jsonp : "callback",
            timeout : 1000,
            success:  function (data) {
                if(data.result){
                    if(data.url){
                        $.ajax({
                            url: data.url,
                            success: function(data) {
                                $("html > div.page-dimmed").remove();
                                replaceContent.append(data);
                            },
                            error: function(xhr, status, thrown) {
                                alert(status)
                            }
                        });
                    }
                }
            },
            error: function(xhr, status, thrown) {
                $("html > div.page-dimmed").remove();
                alert(status)
            }
        })
    }

    ic.jquery.plugin('NewsLetters', NewsLetters, '.news-letters');
    return NewsLetters;
});
