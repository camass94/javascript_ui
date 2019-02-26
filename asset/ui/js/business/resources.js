define(['global-config', 'jquery', 'common/dtm', 'chosen', 'lazyload'], function(globalConfig, $, dtm, chosen, lazyload) {
    'use strict';

    if (!$('body').hasClass('is-mobile') && $(".chosen-select").length > 0) {
        $(".chosen-select").each(function() {
            $(this).chosen({
                disable_search: true
            });
        });
    };

    var scriptFilter = function(content) {
        return content.replace(/<script>/g, "&lt;script&gt;").replace(/<\/script>/g, "&lt;\/script&gt;");
    };

    if ($('.resources-toolbox').is('div')) {
        var resources = $('.resources'),
            resourceName = '.filter-selectbox',
            resourceTool = resources.find('.resources-toolbox .sortby'),
            resourceList = resources.find('.resources-list-sortby'),
            resourceSelect = resourceTool.find(resourceName),
            resourceMajor =  resourceSelect.filter('.major'),
            resourceSub =  resourceSelect.filter('.sub'),
            resourceModel =  resourceSelect.filter('.model'),
            resourceBtn = resourceTool.find('.btn'),
            resourceForm = resourceTool.closest('form');

        var resourceCall = function(parameter){
            var len = $.map(parameter.data, function(n, i) { return i; }).length;
            var thisSelect = $(parameter.obj).parents(resourceName);
            var nextSelect = thisSelect.next(resourceName);
            var nextAllSelect = thisSelect.nextAll(resourceName);
            var errorMsg = resourceTool.find('.no-model');

            nextAllSelect.addClass('hide');
            resourceBtn.removeClass('disable');
            errorMsg.addClass('hide');

            resourceList.find('#noResult').removeClass('hide');
            resourceList.find('#downloadBox').empty().addClass('hide');

            if (parameter.data.typeCheck == "true") {
                return false;
            } else {
                if(nextSelect.hasClass('hide') && len > 0) {
                    nextSelect.removeClass('hide');
                } else if(nextSelect.is(resourceModel)) {
                    resourceBtn.addClass('disable');
                    errorMsg.removeClass('hide');
                }
            }
        }

        var resourceSubmit = function(event){
            event.preventDefault();

            if (!resourceBtn.hasClass('disable')) {
                resourceList.find('#noResult').addClass('hide');
                resourceList.find('#downloadBox').removeClass('hide');

                var url = resourceForm.attr('action') + '?' + resourceForm.serialize();
                var majorSelctType = resourceMajor.find('option:selected').data('type');

                if (majorSelctType) {
                    url += ('&type=' + majorSelctType);
                }

                // Ajax
                $.ajax({
                    url: url,
                    success: function(b) {
                        //$b = $(b);
                        var fb = scriptFilter(b);
                        resourceList.find('#downloadBox').html(fb);
                        if ($("#downloadBox img.lazy").length > 0) {
                            $("#downloadBox img.lazy").each(function() {
                                $(this).lazyload();
                            });
                        };
                    },
                    error: $.proxy(function() {
                        resourceList.find('#noResult').removeClass('hide');
                        resourceList.find('#downloadBox').addClass('hide');
                    }),
                });

            } else {
                resourceList.find('#noResult').removeClass('hide');
                resourceList.find('#downloadBox').addClass('hide');
            }
        }

        resourceTool.find("[data-change='ajaxLoad']").ajaxLoad(resourceCall);
        resourceForm.on('submit', resourceSubmit);
    }
});
