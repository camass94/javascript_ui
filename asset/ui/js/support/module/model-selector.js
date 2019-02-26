define(['ic/ic', 'ic/ui/module', 'cs/modallayer', 'cs/predictive'], function(ic, Module, modal, predictiveSearch, undefined) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        $document = ic.dom.$document,
        proto;

    var modelSelector = function(element, options) {
        var self = this;
        modelSelector.superclass.constructor.call(self, element, options);
        self.attach();

    }

    util.inherits(modelSelector, Module);
    proto = modelSelector.prototype;

    proto._defaults = {
        modalMaxWidth: "630",
        modalOpener: ".category",
        modalUrl: null,
        openClass: 'open',
        predictiveField: "keyword"
    };

    proto.attach = function() {
        var self = this;
        var modalOpener = $(self.options.modalOpener, self.$el);

        modalOpener.data({
            maxWidth: self.options.modalMaxWidth,
            url: self.options.modalUrl
        }).attr("rel", "modal:open").bind($.modal.AJAX_COMPLETE, function() {
            var $currentModal = $("div.modal");
            var $submitEl = $(".model-selected", $currentModal);

            $("select", $currentModal).change(function(n) {
                var selectIdx = $("select", $currentModal).length - 1;
                var selectedIdx = $("select", $currentModal).index($(this));

                if (this.name != 'os') $("[name='os']", $currentModal).val('').trigger("chosen:updated.chosen");

                if (selectIdx == selectedIdx && $("select", $currentModal).eq(selectIdx).val() != '' && $("select", $currentModal).not(":disabled")) {
                    $submitEl.removeClass("disabled").prop("disabled", false);
                } else {
                    $submitEl.addClass("disabled").prop("disabled", true);
                }
            });

            $submitEl.on("click", function(e) {
                var targetForm = $(this).closest("form");
                e.preventDefault();

                if (targetForm.data("action")) {

                    $.ajax({
                        url: targetForm.data("action"),
                        type: "get",
                        data: XSSfilter(targetForm.serialize()),
                        success: function(data) {
                            if (data.result) {
                                //location.href = data.url + "?" + targetForm.serialize();
                                if (data.os) {
                                    $(".pc-suite-down").find(".model").html("for '" + data.model + "'");
                                    $(".pc-suite-down .link").show();
                                    $(".pc-suite-down .link").find("a").html(data.os);
                                    $(".pc-suite-down .link").find("a").attr("href", data.download_fn);
                                } else {
                                    $(".model-selector").addClass("selected");
                                    $(".model-selector > a").html(data.model);
                                }
                                $.modal.close();
                            } else {
                                self.error(data.error);
                            }
                        },
                        error: function(xhr, err) {
                            self.error(err)
                        }
                    })

                } else {
                    location.href = "?" + targetForm.serialize();
                }



                /*var productSelected = false;
                var $selectedViewer = $(self.$el.data("selectViewer"), self.$el);
                var productName = $selectedViewer.data("placeholder");
                 $("select,input,textarea", $currentModal).each(function(n) {
                    var $openerField = $("[name='" + $(this).data("openerName") + "']", self.$el);
                    var $targetBtn = $(e.target);
                    if ($openerField.length) {
                        $openerField.val(this.value);
                        if ($openerField.data("viewName")) {
                            if (this.options[this.selectedIndex] != undefined && this.options[this.selectedIndex].text != '') {
                                productName = this.options[this.selectedIndex].text;
                                productSelected = true;
                            }
                        }
                    }
                });

                self.$el.toggleClass("selected", productSelected);
                $selectedViewer.text(productName);

                //$.modal.close(); */

            })
        })

        var predictiveElement = $("input[name='" + self.options.predictiveField + "']", self.$el);
        ic.jquery.plugin('predictive', predictiveSearch, predictiveElement);

        return self;
    };

    plugin('modelSelector', modelSelector, '.model-selector');

    return modelSelector;

});
