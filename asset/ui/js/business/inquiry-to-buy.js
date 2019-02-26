define(['jquery', 'chosen'], function($,chosen) {

    var $form = $('[name="inquiry-form"]');
    var localName = location.pathname.split('/')[1];

    if ($form.data('testMode')) {
        $("#productCategory", $form).on({
            change: function(e) {
                var $select  = $(e.target);

                $.ajax({
                    method: 'get',
                    url: $select.find("option:selected").data('url'),
                    dataType: 'html',
                    success: function(template) {
                        $form.find('> *:not(.business-part)').remove();
                        $(template).insertAfter($form.find('.business-part'));

                        if (!$form.find('iframe').length) {
                            $form.find('.input-wrap > span').each(function(idx, el, list) {
                                $(el).append('<span class="msg-error"></span>');
                            }).end().find('.chosen-select').chosen({
                                "disable_search": true
                            });
                            getOptions();
                        }

                        if ($form.find('.captcha-box').length) {
                            $form.captchaInit();
                        }
                    }
                });

                function getOptions() {
                    var $detailForm = $('.detail-form', $form);
                    var data = {}, el = {
                        productSolution: $('#productSolution', $detailForm),
                        inquiryType: $('#inquiryType', $detailForm),
                        country: $('#country', $detailForm),
                        companyType: $('#companyType', $detailForm),
                        industries: $('#industries', $detailForm)
                    };

                    data[$select.attr('name')] = $select.val();


                    $.ajax({
                        method: 'get',
                        url: $select.closest(".input-wrap").data('action'),
                        data: data,
                        dataType: 'json',
                        success: function(data) {
                            for (var _key in data) {
                                el[_key].find('option:not("[value=\"\"]")').remove();

                                for (var prop in data[_key]) {
                                    var option = document.createElement('option');
                                    option.value = prop;
                                    option.innerHTML = data[_key][prop];
                                    el[_key].append(option);
                                }
                            }

                            $('.chosen-select', $detailForm).val("").trigger('chosen:updated');

                            localName === 'us' && $("[data-name='industries']", $form).on({
                                change: function(e) {
                                    var els = $("[data-name='industries']", $form);
                                    var solarIndustries = $('#solarIndustries', $form);
                                    var buf = [];
                                    els.each(function(idx, el) {
                                        if ($(el).is(':checked')) buf.push(el.value);
                                    });
                                    solarIndustries.val(buf.join(","));
                                }
                            });
                        }
                    });
                }
            }
        });

        if ($("#productCategory", $form).val()) {
            $("#productCategory", $form).trigger('change');
        }
    } else {

        $("#productCategory", $form).on({
            change: function(e) {
                var $select  = $(e.target);
                var $detailForm = $('.detail-form', $form);
                var isSolar = $('#solarValue').val() === $select.val();
                var isDisplay = $('#informationDisplayValue').val() === $select.val();
                var data = {};
                var el = {
                    productSolution: $('#productSolution', $detailForm),
                    inquiryType: $('#inquiryType', $detailForm),
                    country: $('#country', $detailForm),
                    companyType: $('#companyType', $detailForm),
                    industries: $('#industries', $detailForm)
                };

                data[$select.attr('name')] = $select.val();

                localName === 'us' && (function() {
                    $('.us-pardot', $form).toggle(isDisplay);
                    $('.detail-form', $form).toggle(!isDisplay);
                    $('.captcha-box', $form).toggle(!isDisplay);
                    $('.submit-wrap', $form).toggle(!isDisplay);
                    $('.type-box', $form).toggle(!isDisplay);

                    !isDisplay && $('fieldset[type="solar"]', $form).toggle(isSolar);
                    !isDisplay && $('fieldset[type="common"]', $form).toggle(!isSolar);
                }());

                $.ajax({
                    method: 'get',
                    url: $select.closest(".input-wrap").data('action'),
                    data: data,
                    dataType: 'json',
                    success: function(data) {
                        for (var _key in data) {
                            el[_key].find('option:not("[value=\"\"]")').remove();

                            for (var prop in data[_key]) {
                                var option = document.createElement('option');
                                option.value = prop;
                                option.innerHTML = data[_key][prop];
                                el[_key].append(option);
                            }
                        }

                //        $(':input:not([type=submit],[data-name="industries"])', $detailForm).val('');
               //         $('.left-length', $detailForm).html($('#message', $detailForm).data('byteCheck'));
                        $('.chosen-select', $detailForm).val("").trigger('chosen:updated');
                    }
                });
            }
        });

        localName === 'us' && $("[data-name='industries']", $form).on({
            change: function(e) {
                var els = $("[data-name='industries']", $form);
                var solarIndustries = $('#solarIndustries', $form);
                var buf = [];
                els.each(function(idx, el) {
                    if ($(el).is(':checked')) buf.push(el.value);
                });
                solarIndustries.val(buf.join(","));
            }
        });

        if ($("#productCategory", $form).val()) {
            $("#productCategory", $form).trigger('change');
        }

    }
    /* LGEPJT-154  */
    var SSLLink = function() {
        $(".wrapper").on('click.ssllink', '[data-role="ssllink"]', function(e) {
            e.preventDefault();

            var $element = $(this);
            var pForm = document.createElement('form');
            var _pValue = $element.data('postValue');

            pForm.method = 'post';
            pForm.action = $element.attr('href');
            
            var $pForm = $(pForm);
            for (var key in _pValue) {
                var $input = $('<input />');
                $input.attr({
                    type: 'hidden',
                    name: key,
                    value: XSSfilter(_pValue[key])
                });
                $pForm.append($input)
            }
            $pForm[0].action = $pForm[0].action.replace(/^http:/, 'https:');
            $pForm.appendTo("body")[0].submit();
        });
    }();
    /* //LGEPJT-154  */
});