/* global define */

/**
 * A module representing a Dog.
 * @module common/dog
 * @requires  common/util
 * @requires  common/animal
 */
define(['ic/ic', 'ic/ui/module', 'common/util'], function(ic, Module, util) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        $document = $(document),
        $window = $(window),
        proto;



    var tooltipLayer = function(el, options) {
        var _ = this;

        // Call the parent constructor
        tooltipLayer.superclass.constructor.call(_, el, options);

        // selectors
        _.$wrapper = $(el);
        _.$target = $('#' + _.$wrapper.attr('aria-describedby'));
        _.$targetClose = _.$target.find('[rel="tooltip:close"]');
        _.$tooltipClass = 'tooltip-box-layer';

        _.defaults = {
            event: 'click',
            position: true
        }

        // Default Option
        _.options = $.extend({}, options, _.defaults, _.$wrapper.data());

        _.init();

    };

    // util.inherits(AccordionTabs, Tabs);
    util.inherits(tooltipLayer, Module);
    proto = tooltipLayer.prototype;


    // Init
    proto.init = function() {
        var _ = this,
            eventName = (_.options.event == 'click') ? 'click' : 'mouseenter mouseleave focusin focusout';

        _.$target.addClass(_.$tooltipClass).hide();
        _.$wrapper.on(eventName, $.proxy(_.action, _));
        _.$targetClose.on('click', $.proxy(_.action, _));
        $(window).resize($.proxy(_.hide, _));

    }

    proto.action = function(event){
        var _ = this;

        if (event.type == 'mouseenter' || event.type == 'focusin') {

            _.show();

        } else if (event.type == 'mouseleave' || event.type == 'focusout') {

            _.hide();

        } else {

            event.preventDefault();
            (_.$target.hasClass('show')) ? _.hide() : _.show();

        }

    }

    proto.show = function(){
        var _ = this;

        _.$target.addClass('show');
        _.accessibility();

        if (_.options.position) {
            _.$target.appendTo('body')
            _.position();
        }

    }

    proto.hide = function(){
        var _ = this;

        _.$target.removeClass('show').hide();

    }

    proto.position = function(){
        var _ = this,
            windowWidth = $(window).width(),
            tooltipTop = _.$wrapper.offset().top,
            tooltipLeft = _.$wrapper.offset().left,
            tooltipWidth = _.$target.outerWidth(true),
            tooltipHeight = _.$target.outerHeight(true),
            tooltipTotalLeft; // result of position left

            if (tooltipLeft - (tooltipWidth / 2) < 0) {

                tooltipTotalLeft = 0;

            } else {

                tooltipTotalLeft = tooltipLeft - (tooltipWidth / 2);

                if (windowWidth < tooltipTotalLeft + tooltipWidth) {

                    tooltipTotalLeft = windowWidth - tooltipWidth;

                }

            }

        _.$target.css({
            top : tooltipTop - tooltipHeight,
            left : tooltipTotalLeft
        }).show();

    }

    proto.accessibility = function(){
        var _ = this,
            firstElement = _.$target.find("a, input:not([disabled='disabled']), select, button, textarea, *[tabindex='0'], iframe").filter(':first'),
            lastElement = _.$target.find("a, input:not([disabled='disabled']), select, button, textarea, iframe").filter(':last'),
            closeElement = _.$target.find(_.$targetClose);

        _.$wrapper.off('keydown').on('keydown', function (b) {
            if(b.keyCode == 9 && b.shiftKey) {
            } else if (b.keyCode == 9) {
                if (firstElement.length > 0 && _.$target.hasClass('show')) {
                    b.preventDefault();
                    firstElement.focus();
                }
            }
        });

        firstElement.off('keydown').on('keydown', function (b) {
            console.log(234234)
            if(b.keyCode == 9 && b.shiftKey) {
                b.preventDefault();
                lastElement.focus();
            }
        });

        lastElement.off('keydown').on('keydown', function (b) {
            if(b.keyCode == 9 && b.shiftKey) {
                if (firstElement.attr('class') == lastElement.attr('class')) {
                    b.preventDefault();
                    $(this).focus();
                }
            } else if (b.keyCode == 9) {
                b.preventDefault();
                firstElement.focus();
            }
        });

        closeElement.on('click', function (b) {
            b.preventDefault();
            _.$wrapper.focus();
        });
    }


    plugin('tooltipLayer', tooltipLayer, '.tooltip-btn');


    return tooltipLayer;
});
