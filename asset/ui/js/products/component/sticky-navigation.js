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


    var StickyNavigation = function(el, options) {
        var _ = this;

        // Call the parent constructor
        StickyNavigation.superclass.constructor.call(_, el, options);

        // selectors
        _.$window = $(window);
        _.$wrapper = $(el);
        _.$tab = _.$wrapper.find('a');
        _.$stickyTarget = null;

        // Default Option
        _.d = {
            group : _.$wrapper.data('stickyGroup'),
            firstTop : _.$wrapper.offset().top,
            method : ['siblings', 'closest'],
            activeClass : 'on',
            stickyClass : 'sticky',
            topHolder : 'sticky-top-holder', /* LGEPJT-337 171121 add */
            topHolderTarget : '.sticky-top-holder', /* LGEPJT-337 171121 add */
        };

        _.d = $.extend({}, options, _.d, _.$wrapper.data());

        _.init();
        
    };

    util.inherits(StickyNavigation, Module);
    proto = StickyNavigation.prototype;


    // Init
    proto.init = function() {
        var _ = this;

        /* LGEPJT-337 171121 modify */
        _.$stickTopOption = {
            class:_.d.topHolder
        }

        if(_.$wrapper.hasClass("refind-apply-btn")){
            _.$refindTopOption = {
                style : "margin-top:20px"
            }
           $.extend(_.$stickTopOption,_.$refindTopOption); 
        }
        _.$stickAreaDiv = $('<div />', _.$stickTopOption);

        _.$wrapper.next('.clone').remove().end().before(_.$stickAreaDiv).after(_.$wrapper.clone().hide().addClass('clone').removeAttr('data-sticky'));
        _.$wrapper.next('.clone').find('a').removeAttr('data-hash');
        /* LGEPJT-337 171121 modify */

        if (_.d.stickyLoad) {

            $(window).load(function(){

                /* LGEPJT-337 171121 add */
                if(!_.$wrapper.prev().hasClass(_.d.topHolder)) {
                    _.$wrapper.before(_.$stickAreaDiv);
                }

                if(!_.$wrapper.next().hasClass("clone")) {
                    _.$wrapper.after(_.$wrapper.clone().hide().addClass('clone').removeAttr('data-sticky'));
                    _.$wrapper.next('.clone').find('a').removeAttr('data-hash');
                }
                /* //LGEPJT-337 171121 add */

                _.$wrapper.removeClass(_.d.stickyClass);
                _.d.firstTop = _.$wrapper.prev(_.d.topHolderTarget).offset().top; /* LGEPJT-337 171121 modify */

                /*  $(window).trigger('scroll.StickyNavigation'); LGEPJT-337 171121 deleted */
                _.action(); /* LGEPJT-337 171121 add */
                runInit();

            })

        } else {

            runInit();

        }

        function runInit(){

            $.each(_.d.method, function(i){

                if (_.$wrapper[_.d.method[i]](_.d.group).length > 0) {

                    _.$stickyTarget = _.$wrapper[_.d.method[i]](_.d.group);

                }

            });

            // Event Handlers
            _.$window.on('scroll.StickyNavigation', $.proxy(_.action, _));
            _.$window.on('resize.StickyNavigation', $.proxy(_.resize, _));
            _.$tab.on('click.StickyNavigation', $.proxy(_.stickyGo, _));

        }
    }


    proto.resize = function(){
        var _ = this;

        if ($('.group-carousel').size() > 0) {

            $(".group-carousel").one('setPosition', function(event){

                var slickComp = setInterval(function(){

                    if (event.type == 'setPosition') {

                        clearInterval(slickComp);

                        _.$wrapper.next('.clone').hide();
                        _.$wrapper.removeClass(_.d.stickyClass);
                        _.d.firstTop = _.$wrapper.prev(_.d.topHolderTarget).offset().top;
                        _.action();

                    }

                }, 50);
                        
            });
            
        } else {

            _.$wrapper.next('.clone').hide();
            _.$wrapper.removeClass(_.d.stickyClass);
            _.d.firstTop = _.$wrapper.prev(_.d.topHolderTarget).offset().top; /* LGEPJT-337 171121 modify */
            _.action();

        }

    }


    proto.action = function(){

        var _ = this;
        var currentTop = _.$window.scrollTop();
        // var tabBoxTop = _.$stickyTarget.offset().top + _.$stickyTarget.outerHeight(true); LGEPJT-337 delete
        /* LGEPJT-337 171121 add */
        if(!_.$wrapper.prev().hasClass(_.d.topHolder)) {
            _.$wrapper.before(_.$stickAreaDiv);
        }

        if(!_.$wrapper.next().hasClass("clone")) {
            _.$wrapper.after(_.$wrapper.clone().hide().addClass('clone').removeAttr('data-sticky'));
            _.$wrapper.next('.clone').find('a').removeAttr('data-hash');
        }
        /* //LGEPJT-337 171121 add */

        _.d.firstTop = _.$wrapper.prev(_.d.topHolderTarget).offset().top; /* LGEPJT-337 171121 modify */
        
        if (currentTop > _.d.firstTop) { // && currentTop < tabBoxTop
            _.$wrapper.next('.clone').show();
            _.$wrapper.addClass(_.d.stickyClass);
        
        } else {
            _.$wrapper.next('.clone').hide();
            _.$wrapper.removeClass(_.d.stickyClass);  
        }

        for (var i=0; i < _.$tab.length; i++) {

            if ($($(_.$tab[i]).attr('href')).length > 0) {

                var currentTab = $($(_.$tab[i]).attr('href'));
                var tabTop = currentTab.offset().top;
                var tabHeight = currentTab.outerHeight(true);
                var activeTab = _.$wrapper.find('li').eq(i);

                currentTop >= tabTop && currentTop < (tabTop + tabHeight) ? activeTab.addClass(_.d.activeClass) : activeTab.removeClass(_.d.activeClass);

            }
        }

    }


    proto.stickyGo = function(event){
        var _ = this;

        var target = $(event.currentTarget);
        event.preventDefault();

        if ($(target.attr('href')).length > 0) {

            $('html, body').stop(true).animate({ scrollTop : $(target.attr('href')).offset().top + 2 }, 300);

        }

    }


    plugin('StickyNavigation', StickyNavigation, '[data-sticky]');

    return StickyNavigation;
});