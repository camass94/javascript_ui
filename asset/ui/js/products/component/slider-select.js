/* global define */

/**
 * A module representing a Dog.
 * @module common/dog
 * @requires  common/util
 * @requires  common/animal
 */
define(['ic/ic', 'ic/ui/module', 'common/util', 'jqueryui', 'jquery.cookie'], function(ic, Module, util) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        $document = $(document),
        $window = $(window),
        proto,
        slideTarget = '.slide-bar';


    var sliderSelect = function(el, options) {
        var _ = this;

        // Call the parent constructor
        sliderSelect.superclass.constructor.call(_, el, options);

        // selectors
        _.$wrapper = $(el);

        /* LGEPJT-337 20171121 add */
        if (window[_.options.dragbar.split('.')[0]] == undefined) {

            _.$dragbarVal = dragbarVal[_.options.dragbar];

        } else {

            _.$dragbarVal = window[_.options.dragbar.split('.')[0]][_.options.dragbar.split('.')[1]];

        }
        /* //LGEPJT-337 20171121 add */

        // Default Option
        _.defaults = {
            dragName: _.$dragbarVal, /* LGEPJT-337 20171121 modify */
            dragLen: _.$dragbarVal.length, /* LGEPJT-337 20171121 modify */
            selectBox: $('div[name="' + _.options.dragbar + '"]'),
            slideCookie: _.$wrapper.closest('form').data('searchCategory'),
            slideFixed: {
                values: [0, _.$dragbarVal.length - 1], /* LGEPJT-337 20171121 modify */
                value: 0
            },
            slideOption: {
                range: false,
                min: 0,
                max: _.$dragbarVal.length - 1, /* LGEPJT-337 20171121 modify */
                value: 0,
                start: $.proxy(_.sliderStart, _),
                slide: $.proxy(_.sliderSlide, _),
                stop: $.proxy(_.sliderStop, _),
                create: $.proxy(_.sliderCreate, _)
            }
        };

        _.options = $.extend({}, options, _.defaults, _.$wrapper.data());

        _.init();

        // Event Handlers
        _.options.selectBox.find('select').on('change', $.proxy(_.sliderSlide, _));
        _.$wrapper.on('slidestop slideDefault', $.proxy(_.sliderUpdate, _));

    };

    // util.inherits(AccordionTabs, Tabs);
    util.inherits(sliderSelect, Module);
    proto = sliderSelect.prototype;


    // Init
    proto.init = function() {
        var _ = this;

        _.sliderCookie();
        _.sliderSet();

    }


    proto.sliderSet = function() {
        var _ = this,
            setOption,
            setValue = _.sliderDefault();

        if (_.options.double) {

            setOption = {
                range: true,
                value: setValue[0],
                values: setValue
            }

        } else {

            setOption = {
                value: setValue
            }

        }

        $.extend(_.options.slideOption, setOption);

        _.$wrapper.slider(_.options.slideOption);
        _.sliderZero();

    }


    proto.sliderCreate = function(event, ui) {
        var _ = this;

        $.extend(ui, _.options.slideOption);

        _.sliderField(ui);
        _.sliderUpdate(event, ui);
        _.sliderBubble();
        _.sliderInput();
        _.sliderText();
        _.sliderImage();

    }


    proto.sliderCookie = function() {

        var _ = this,
            inputName = _.options.input.split(','),
            cookie = $.cookie('LG4_FILTER_CART');

        if (cookie != undefined && !_.options.slideCookie) {

            $.each(cookie.split('|'), function(index) {

                for (var i = 0; i < inputName.length; i++) {

                    if (this.indexOf($.trim(inputName[i])) != -1) {

                        _.$wrapper.closest('form').find('input[name="' + $.trim(inputName[i]) + '"]').val(this.split(':')[1]);

                    }

                }

            })

        } else {

            for (var i = 0; i < inputName.length; i++) {

                _.$wrapper.closest('form').find('input[name="' + $.trim(inputName[i]) + '"]').val('');

            }

        }

    }


    proto.sliderZero = function() {
        var _ = this,
            zero = (_.options.double) ? _.options.slideFixed.values : _.options.slideFixed.value,
            value = (_.options.double) ? _.options.slideOption['values'] : _.options.slideOption['value'];

        (zero.toString() === value.toString()) ? _.$wrapper.addClass('zero'): _.$wrapper.removeClass('zero');

    }


    proto.sliderDefault = function() {
        var _ = this,
            inputName = _.options.input.split(','),
            temp = [],
            inputValue = [];


        for (var i = 0; i < inputName.length; i++) {

            var value = _.$wrapper.closest('form').find('input[name="' + $.trim(inputName[i]) + '"]').val();

            temp.push(value);

        }

        if (_.options.double) {

            $.each(temp, function(index) {

                var tempValue = Number(_.findObject(_.options.dragName, temp[index], 'value'));

                isNaN(tempValue) ? inputValue = [0, _.options.dragName.length - 1] : inputValue[index] = tempValue;

            });



        } else {

            var tempValue = Number(_.findObject(_.options.dragName, temp, 'value'));

            inputValue = isNaN(tempValue) ? 0 : tempValue;

        }

        return inputValue;
    }


    proto.sliderField = function(ui) {
        var _ = this,
            value = (_.options.double) ? ui.values.length : 1,
            select = _.options.selectBox.find('select'),
            inputName = _.options.input.split(',');

        $('option', select).remove();

        for (var i = 0; i < value; i++) {

            $.each(_.$dragbarVal, function(index) { /* LGEPJT-337 20171121 modify */

                var selectCon = _.$dragbarVal[index].title; /* LGEPJT-337 20171121 modify */
                var option = $('<option />').attr('value', index).text(selectCon);

                if (_.options.double && (i == 0 && index == _.$dragbarVal.length - 1 || i == value - 1 && index == 0)) { /* LGEPJT-337 20171121 modify */
                    option.attr('disabled', true);
                }

                select.eq(i).attr('data-index', i).append(option);

            });

        };

        $('<span class="bubble"><span></span></span>').appendTo(_.$wrapper.find('.ui-slider-handle'));

    }


    proto.sliderUpdate = function(event, ui) {
        var _ = this;

        // Reset
        if (ui == undefined) {
            var resetValue = (_.options.double) ? {
                values: _.options.slideFixed.values.slice(0)
            } : {
                value: _.options.slideFixed.value
            };

            ui = $.extend(ui, _.options.slideOption, resetValue);
        }

        var value = (_.options.double) ? _.checkSliderValue(ui.values) : [ui.value];

        $.each(_.options.selectBox.find('select'), function(index) {

            $(this).val(value[index]).trigger('change', ui, true);
            $(this).trigger("chosen:updated");

        });

    }


    proto.sliderReset = function(event) {
        var _ = this,
            el = _.options.slideOption,
            option = _.$wrapper.slider('option');

        _.$wrapper.slider(el);

        if (option.start) option.start(event, el);
        if (option.stop) option.stop(event, el);
    }


    proto.sliderBubble = function() {
        var _ = this,
            value = (_.options.double) ? _.options.slideOption.values : new Array(_.options.slideOption.value.toString());

        _.options.slideBubble = _.$wrapper.find('.bubble span');
        /* LGEIN-1512 20160922 add */
        _.options.slideBubbleText = $(".slide-bar span.text");
        if(value.length == 1)_.options.slideBubbleText.eq(0).text(_.options.dragName[value[0]].title);
        /*//LGEIN-1512 20160922 add */

        for (var i = 0; i < value.length; i++) {

            _.options.slideBubble.eq(i).text(_.options.dragName[value[i]].title);

        }

    }


    proto.sliderInput = function(el) {
        var _ = this,
            inputName = _.options.input.split(','),
            inputValue;

        for (var i = 0; i < inputName.length; i++) {

            if (_.options.double) {

                inputValue = _.options.dragName[_.options.slideOption.values[i]].value[0];

            } else {

                inputValue = _.options.dragName[_.options.slideOption.value].value[i];

            }

            _.$wrapper.closest('form').find('input[name="' + $.trim(inputName[i]) + '"]').val(inputValue);

        }

    };


    proto.sliderText = function(el) {
        var _ = this,
            textTotal, idx,
            select = _.options.selectBox.find('select'),
            text = {
                single: _.options.singleText,
                double: {
                    min: _.options.minText,
                    max: _.options.maxText
                }
            };

        if (!Object.keys) Object.keys = function(o) {
            if (o !== Object(o))
                throw new TypeError('Object.keys called on a non-object');
            var k = [],
                p;
            for (p in o)
                if (Object.prototype.hasOwnProperty.call(o, p)) k.push(p);
            return k;
        }


        for (var i = 0; i < select.length; i++) {

            textTotal = (_.options.double) ? text.double[Object.keys(text.double)[i]] : text.single;

            $.each(textTotal.split(','), function(index, value) {

                idx = (_.options.double) ? _.options.slideOption.values[i] : _.options.slideOption.value;

                _.$wrapper.closest('.slide-box').find($.trim(this)).text(_.options.dragName[idx].img);

            });

        }

    }


    proto.sliderImage = function(el) {
        var _ = this,
            sizeMin = 70,
            sizeMax = 110,
            size = [],
            distance = (sizeMax - sizeMin) / (_.options.dragLen - 1);

        for (var i = 0; i < _.options.dragLen; i++) {

            if (i == 0) {

                size[i] = sizeMin;

            } else if (i == _.options.dragLen - 1) {

                size[i] = sizeMax;

            } else {

                size[i] = Math.round(size[i - 1] + distance);

            }
        }


        _.$wrapper.closest('.slide-box').find(_.options.img).css({

            fontSize: size[_.options.slideOption.value]

        })

    }


    proto.sliderStart = function(event, ui) {
        var _ = this;

    }


    proto.sliderSlide = function(event, ui, check) {
        var _ = this,
            select = event.currentTarget;

        if (select.nodeName == 'SELECT') {

            _.options.slideOption.value = select.selectedIndex;

            if (_.options.double) {

                $.each(_.options.selectBox.find('select'), function(index) {

                    _.options.slideOption.values[index] = Number($(this).val());

                });

            }

        }


        $.extend(_.options.slideOption, ui);

        if (!check) _.sliderReset(event);
        _.sliderZero();
        _.sliderBubble();
        _.sliderInput();
        _.sliderText();
        _.sliderImage();

    }


    proto.sliderStop = function(event, ui) {
        var _ = this;
    }


    proto.findObject = function(obj, value, name) {
        var _ = this;

        for (var key in obj) {
            if (value.toString() == obj[key][name].toString()) {
                return key
            }
        }

    }


    proto.checkSliderValue = function(value){
        var _ = this;

        if (value[0] == _.options.slideOption.max) {

            value[0] = _.options.slideOption.max - 1;

        } else if (value[value.length - 1] == _.options.slideOption.min) {

            value[value.length - 1] = _.options.slideOption.min + 1;

        }

        return value;
    }


    plugin('sliderSelect', sliderSelect, slideTarget);


    return sliderSelect;
});
