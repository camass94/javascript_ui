define(['jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'mkt/styledform'], function($, ic, module, config, styledForm) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        proto;

    var Survey = function(el, options) {
        var self = this;

        Survey.superclass.constructor.call(self, el, options);

        self.options.onInit = $.proxy(self, 'init');
        self.options.onValidate = $.proxy(self, 'validate');
        self.options.onRequireField = $.proxy(self, 'requireField');
        self.options.onSubmit = $.proxy(self, 'submit');
        self._init();
        self._submit();
    };

    util.inherits(Survey, module);

    proto = Survey.prototype;

    proto._init = function() {
        var self = this;

        $("[data-require-field]", self.$el).each(function() {
            self._requireField($(this))
        });
    };

    proto._submit = function(){
        var self = this;

        $(self.el).on("submit", function(e){
            e.preventDefault();
            self._validate();
        });
    };

    proto._validate = function(){
        var self = this;
        var checkGroup = $(self.el).find(".radio-group");

        checkGroup.each(function(){
            var $this = $(this);

            if($this.find("textarea").length){
                if($this.find("textarea").val() == ""){
                    $this.addClass("group-error");
                    $this.find("textarea").addClass("input-error");
                } else {
                    $this.removeClass("group-error");
                    $this.find("textarea").removeClass("input-error");
                }
            } else {
                if($this.find("input:checked").length == 0){
                    $this.addClass("group-error");

                } else {
                    if($this.find("[data-require-field]").length && $this.find("[data-require-field]").prop("disabled") == false && $this.find("[data-require-field]").val() == ""){
                        $this.addClass("group-error");
                        $this.find("[data-require-field]").addClass("input-error");
                    } else {
                        $this.removeClass("group-error");
                        $this.find("[data-require-field]").removeClass("input-error");
                    }
                }
            }
        })

        if(checkGroup.filter(".group-error").length == 0){
            self._success();
        } else {
            var offset = checkGroup.filter(".group-error").eq(0).offset().top - $(".sticky-menu").outerHeight(true) - 5;
            $("html, body").animate({"scrollTop" : offset + "px"}, 300);

        }
    };

    proto._success = function(){
        var self = this;
        var dataUrl = $(self.el).data("action");
        var dataResult = $(self.el).data("result");

        $.ajax({
            type : "post",
            url : dataUrl,
            data : XSSfilter($(self.el).serialize()),
            dataType : "json",
            success : function(data){
                $("html > div.page-dimmed").remove();
                if(data.result){
                    if(data.url){
                        $.ajax({
                            type : "get",
                            url : data.url,
                            dataType : "html",
                            success : function(data){
                                $("html > div.page-dimmed").remove();
                                $(dataResult).empty().append(data);
                                $("html, body").scrollTop($(".aboutlg").offset().top + "px");
                            },

                            error: function(xhr, status, thrown) {
                                $("html > div.page-dimmed").remove();
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
        });
    };

    proto._requireField = function(element) {
        var self = this;
        var $this = $(element);
        var _field = $this.data("requireField");
        var $dep = $("#" + _field, self.$el)

        var intv;

        $dep.bind("keyup change", function() {
            //var _resetTarget = $this.closest("form").data("reset-target");
            //$(_resetTarget).html(" ");
            clearTimeout(intv);
            intv = setTimeout(function() {
                $this.prop("disabled", $dep.prop("checked") ? false : true)
            }, 100);
            //$this.val('')
        });
    };

    ic.jquery.plugin('Survey', Survey, '#surveyForm');
    return Survey;
});
