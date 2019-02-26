define(['ic/ic', 'ic/ui/module', 'cs/modallayer'], function(ic, Module, modal, undefined) {

    'use strict';

    var findSelector = function(el, options) {
        var self = this;
        var element = $(el, self.$el);
        var defaults = {
            modalHref: element.attr('href'),
            modalUrl: null
        };

        findSelector.superclass.constructor.call(self, el, options);
        self.options = $.extend(defaults, self.options);

        element.on('click', function(e) {
            e.preventDefault();
            self.options.modalUrl = self.options.modalHref + "?" + $.param(element.closest("form").serializeArray());
            element.data({
                url: self.options.modalUrl
            }).attr("rel", "modal:open");

        }).bind($.modal.AJAX_COMPLETE, function(e) {
            $.get(self.options.modalUrl).done(function(elm) {
                var $currentModal = $(document.getElementsByClassName($(elm).attr("class")));

                $("[data-change='ajaxLoad']", $currentModal).each(function() {
                    $(this).ajaxLoad();
                });

                $("select", $currentModal).filter(':last').on("change", function(e) {
                    $("select,input,textarea", $currentModal).each(function(n) {
                        var $openerField = $("[name='" + $(this).data("openerName") + "']", self.$el.closest('form'));
                        if ($openerField.length) {
                            $openerField.val(this.value);
                            if ($(this).data("seletedView")) {
                                var $selectedView = $(this).data("seletedView");
                                if (this.options[this.selectedIndex].text != '') {
                                    self.options.modalUrl = self.options.modalHref + "?" + $.param(element.closest("form").serializeArray());

                                    $.ajax(self.options.modalUrl).done(function(html) {
                                        var $findContent = $(html).find($selectedView).html();
                                        $($selectedView, $currentModal).html('<p>' + self.options.modalUrl + '</p>' + $findContent);
                                    })
                                }
                            }
                        }
                    });
                })
            });

            return self;

        })

    };



    ic.util.inherits(findSelector, Module);

    // Create the jquery plugin and set it to auto-wire to specified selector
    ic.jquery.plugin('findSelector', findSelector, '.find-selector');

    return findSelector;

});
