define(['ic/ic', 'ic/ui/module', 'cs/modallayer', 'cs/predictive'], function(ic, Module, modal, predictiveSearch, undefined) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        $document = ic.dom.$document,
        proto;

    var productSelector = function(element, options) {

        var self = this;
        productSelector.superclass.constructor.call(self, element, options);
        self.attach();

    }

    util.inherits(productSelector, Module);
    proto = productSelector.prototype;

    proto._defaults = {
        modalMaxWidth: "630",
        modalOpener: ".category",
        modalUrl: null,
        openClass: "open",
        predictiveField: "search",
        conditionOperate: "and",
    };

    var predictiveType = function () {
        if (!$(".is-mobile").length) return;
        if ($('[data-predictive-url]').length){
           var predictiveUrl = $('[data-predictive-url]').data('predictiveUrl').split('?')[1]; 
        }

        var $serviceType = $('.service-type');

        switch (predictiveUrl) {
            case 'type=2':
                $serviceType.hide();
                break;
            case 'type=5':
                $serviceType.hide();
                break;
            default:
                break;
        }
    }();

    // add : 2016-02-23
    // LGEGMO-1803 start
    var reSearch = function(){
        var $target = $('.search-keyword');

        if(!$target.length) return;
        // LGEGMO-1839 start
        $(".re-search label,.re-search i").on("click",function(e){
            var checked = $(this).closest(".re-search").find("#re-search").prop("checked");
            var searchInp = $target.find("input#searchInpt");
            var requestSearch = $("input[name=searchChck]");
            requestSearch.val(checked);
            if(checked){
                searchInp.val("").focus();
                $(".predictive-search").hide();
            } 
        })
        // LGEGMO-1839 end
    }();
    // LGEGMO-1803 end
    // add : 2016-02-26
    var takeBackInquiry = function(){
        var $form = $('#takeBackInquiry');
        if(!$form.length) return;
        var $resultTrue = $('.guide-result');
        var $resultFalse = $('.guide-no-result');

        var searchResult = {
            seccess : function(){
                $resultTrue.show();
                $resultFalse.hide();
            },
            fail : function(){
                $resultTrue.hide();
                $resultFalse.show();
            }
        }

        if ($form.data("url")) {
            $.ajax({
                url: $form.data("url"),
                success: function (res) {
                    $form.on('click','button',function(e){
                        var targetId = e.currentTarget.id;

                        var elArray = $(this).closest('.column').find(':required');
                        var result = '';
                        $.each(elArray, function(i,el){
                            var _id = el.id;
                            result += res[_id];
                            !result.match('false') ? searchResult.seccess() : searchResult.fail();
                        });

                    });
                }
            });
        }
    }();

    proto.attach = function() {
        var self = this;
        var modalOpener = $(self.options.modalOpener, self.$el);

        modalOpener.data({
            maxWidth: self.options.modalMaxWidth,
            url: self.options.modalUrl
        }).attr("rel", "modal:open").bind($.modal.AJAX_COMPLETE, function(e) {
            var $currentModal = $("div.modal");
            var $btn = $(".category-selected", $currentModal)

            $btn.on("click", function(e) {
                e.preventDefault();
                var productSelected = false;
                var $selectedViewer = $(self.$el.data("selectViewer"), self.$el);
                var productName = $selectedViewer.data("placeholder");

                var linkTo = '';

                var form = $btn.closest("form");
                $("select,input,textarea", $currentModal).each(function(n) {
                    var $openerField = $("[name='" + $(this).data("openerName") + "']", self.$el);
                    var $openerFieldText = $("[name='" + $(this).data("openerText") + "']", self.$el);
                    if ($openerField.length) {

                        var cVal = this.value.split("^|^");
                        $openerField.val(cVal[0]);
                        $openerFieldText.val(this.options[this.selectedIndex].text);
                        if ($openerField.data("viewName")) {
                            if (this.options[this.selectedIndex].text != '') {
                                productName = this.options[this.selectedIndex].text;
                                productSelected = true;
                            }
                        }

                        if (typeof cVal[1] !== "undefined") linkTo = cVal[1];

                    }
                });

                self.$el.toggleClass("selected", productSelected);
                $selectedViewer.text(productName);

                var frm = modalOpener.closest("form")[0];
                var frmData = $(".search-wrap").find("input,select,textarea").not("[name=keyword]").serializeObject();
                if($(".re-search").size()>0){
                    frmData['search'] = $(".hidden-search").val();
                }
                if (linkTo) {
                    location.href = linkTo + "?" + $.param(frmData, true);;
                } else {
                    location.href = "?" + $.param(frmData, true);;
                }
                $.modal.close();
            })

            var requireField = ($btn.data("requireField"));

            if (requireField) {
                $("[name='" + requireField + "']", $currentModal).on("change chosen:updated.chosen", function() {
                    if (this.value) {
                        $btn.prop("disabled", false)
                    } else {
                        $btn.prop("disabled", true)
                    }
                })
            }

            return self;
        })

        $("a.btn-search", self.$el).click(function(e) {
            e.preventDefault();
            var frm = $(this).closest("form")[0];
            var keyword = frm[self.options.predictiveField];
            if ($.trim(keyword.value) != '') {
                $(keyword).removeClass("error");
                var PrM = $(".search-wrap").find("input,select,textarea").not("[name=keyword]").serializeObject();
                if(PrM["reSearch"] == "" || PrM["reSearch"] == null) {
                    PrM['search'] = keyword.value;
                } else {
                    PrM['search'] = $("input[name=searchChck]").val() == "true" ? $(".hidden-search").val() + "|" + keyword.value : keyword.value;   
                }
                location.href = "?" + $.param(PrM, true);
            } else {
                if (!$(keyword).siblings("span.msg-error").length) $(keyword).after("<span class='msg-error'></span>");
                $(keyword).addClass("error").siblings("span.msg-error").css({
                    bottom: $(keyword).outerHeight(true) + 5
                }).html("<i class='icon icon-error'></i>" + formerror.required.split("%title%").join($(keyword).attr("title"))).parent("span").css({
                    "position": "relative",
                    "display": "block"
                });
                $(keyword).focus();
            }
        })

        var predictiveElement = $("input[name='" + self.options.predictiveField + "']", self.$el);

        if (predictiveElement) {
            ic.jquery.plugin('predictive', predictiveSearch, predictiveElement);
        }

    };

    plugin('productSelector', productSelector, '.product-selector');

    return productSelector;

});
