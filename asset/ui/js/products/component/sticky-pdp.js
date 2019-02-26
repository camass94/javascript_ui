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


    var StickyPdp = function(el, options) {
        var _ = this;

        // Call the parent constructor
        StickyPdp.superclass.constructor.call(_, el, options);

        // selectors
        _.$window = $(window);
        _.$wrapper = $(el);
        _.$TwinWrapper = $(_.$wrapper.data("stickyTwin"));
        _.$tab = _.$wrapper.find('a');
        _.$stickyTarget = null;
        _.CloneHeight = _.$TwinWrapper.not(".sticky").outerHeight();
        _.$wrapperHeight = _.$wrapper.outerHeight();

        // Default Option
        _.d = {
            group : _.$wrapper.data('stickyGroup'),
            firstTop : _.$wrapper.offset().top,
            method : ['siblings', 'closest'],
            activeClass : 'on',
            stickyClass : 'sticky',
            topHolder : 'sticky-top-holder', 
            topHolderTarget : '.sticky-top-holder', 
        };

        _.d = $.extend({}, options, _.d, _.$wrapper.data());
        _.init();
        
    };

    util.inherits(StickyPdp, Module);
    proto = StickyPdp.prototype;


    // Init
    proto.init = function() {
        var _ = this;
        
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

        $(window).load(function(){
            _.action(); 
            runInit();
        })

        if($(".sub-menu").length){
            $(".move-top").addClass("sub-menu").show();
        }else{
            $(".move-top").show();
        }

        function runInit(){
            // Event Handlers
            _.$window.on('scroll.StickyPdp', $.proxy(_.action, _));
            _.$window.on('resize.StickyPdp', $.proxy(_.resize, _));

        }
    }


    proto.resize = function(){
        var _ = this;

        _.$wrapper.removeClass(_.d.stickyClass);
        _.action();

    }

    proto.makeElement = function(){
        var _ = this;

        if(!_.$wrapper.prev().hasClass(_.d.topHolder)) {
            _.$wrapper.before(_.$stickAreaDiv);
        }
        if(!_.$TwinWrapper.next().hasClass("clone")) {
            _.$TwinWrapper.next('.clone').remove().end().after(_.$TwinWrapper.clone().height(_.CloneHeight).hide().addClass('clone').empty());
        }
    }


    proto.action = function(){

        var _ = this;
        var currentTop = _.$window.scrollTop();

        _.makeElement();

        _.d.firstTop = _.$wrapper.prev(_.d.topHolderTarget).offset().top; 
        _.CloneHeight = _.$TwinWrapper.not(".sticky").outerHeight();
        _.$wrapperHeight = _.$wrapper.outerHeight();

        if( _.$TwinWrapper.next('.clone').outerHeight() != _.CloneHeight ){
            _.$TwinWrapper.next('.clone').css("height",_.CloneHeight);
        }

        if (currentTop > _.d.firstTop) {
            _.$TwinWrapper.next('.clone').show();
            _.$wrapper.addClass(_.d.stickyClass);
            _.$TwinWrapper.not(".clone").addClass("sticky");
            if(!_.$wrapper.hasClass("none")) $(".tabs-panels").addClass("float");
            if($(".sub-menu").length){
                $("#features").find("img.lazy").lazyload().trigger("appear");
                $(".sub-menu").removeClass("hide");
            }
        } else {
            _.$TwinWrapper.next('.clone').hide();
            _.$wrapper.removeClass(_.d.stickyClass);  
            _.$TwinWrapper.not(".clone").removeClass("sticky");
            if(!_.$wrapper.hasClass("none")) $(".tabs-panels").removeClass("float");
            if($(".sub-menu").length){
                $(".sub-menu").addClass("hide");
            }
        }

    }

    var sticky = function(el, options) {
        var _style;
        var positionInfo = [];
        var stickyObj = [];
        var tid = null;
        var resizeTid = null;
        var currentIdx = 1;
        var oldTopPos = 0;
        var isMoving = false;

        var defaults = {
            stickyRelative: null,
            stickyEnd: null,
            activeClass: "active",
            stickyActive: "fixed"
        };
        var stickyArea = $("[data-sticky-area]");
        var _areaLength = stickyArea.length;

        sticky.superclass.constructor.call(self, el, options);
        self.options = $.extend(defaults, self.options);
        if($(self.options.stickyEnd).length==0){
            self.options.stickyEnd='footer';
        }

        stickyArea.each(function(index, element) {
            stickyObj[index] = new StickyMotion($(element), index);
        });

        init();

        function init() {
            $(window).load(function() {
                $("body").data("eventtype", "load");
            })

            skickyScroll();
            $(el).find('li a').each(function(index, element) {
                $(element).on("click", function(event) {
                    event.preventDefault();
                    $('body').data('eventtype', 'skickyClick');
                    currentIdx = index + 1;
                    stickyObj[currentIdx - 1].scroll();
                    changeIndicator();

                    //return false
                });
            });

        }

        function StickyMotion(element, index) {
            function scroll() {
                if ($('html, body').not(":animated")) {
                    $(window).unbind("scroll.substicky"); 
                    $('html, body').stop(true).animate({
                        scrollTop: element.offset().top -($('.improve-info-wrap').outerHeight() + $('.pdp-improve-tab-wraper').outerHeight())
                    }, {
                        duration: 300,
                        complete: function() {
                            isMoving = true;
                            skickyScroll();
                        }
                    });
                }
            }

            function positionInfo() {
                return {
                    offsetTop: element.offset().top
                };
            }

            return {
                scroll: scroll,
                position: positionInfo
            };
        }

        function skickyScroll() {
            $(window).bind("scroll.substicky", function(event) { 
                if (isMoving = true) $("body").data("eventtype", "scroll");

                var scrTop = $(this).scrollTop();
                var limitTop = $(self.options.stickyRelative).offset().top;
                var limitBottom = $(self.options.stickyEnd).offset().top - 110;

                positionInfo = [];

                for (var i = 0; i < _areaLength; i++) {
                    positionInfo.push(stickyObj[i].position());
                }

                if (limitTop <= scrTop) {
                    if (limitBottom < scrTop) {
                        _style = {
                            display: "none"
                        }
                    } else {
                        _style = {
                            position: "fixed",
                            bottom: 0 + "px",
                            display: "block"
                        }

                        $(self.options.stickyRelative).addClass(self.options.stickyActive);

                        clearTimeout(tid);
                        tid = setTimeout(function() {
                            // scroll down

                            if (oldTopPos < scrTop) {
                                
                                if (positionInfo[0].offsetTop < scrTop) {
                                    for (var i = 1, Len = _areaLength; i < Len; i++) {
                                        if (positionInfo[i].offsetTop > scrTop) {
                                            currentIdx = i + 1;
                                            break;
                                        }
                                    }
                                } else {
                                    currentIdx = 1;
                                }
                  
                                oldTopPos = scrTop;

                            } else {
          
                                // scroll up
                                if (positionInfo[0].offsetTop < scrTop) {
                                    for (var i = 1, Len = _areaLength; i < Len; i++) {
                                        if (positionInfo[i].offsetTop > scrTop) {
                                            currentIdx = i + 1;
                                            break;
                                        }
                                    }
                                } else {
                                    currentIdx = 1;
                                }

                                oldTopPos = scrTop;
                            }

                            oldTopPos = scrTop;

                        }, 10);

                        
                       changeIndicator();

                        isMoving = false;
                        $(el).addClass('active')
                    }

                } else if (limitTop > scrTop) {
                    if ($(".support.home").length) {
                        $(el).find('li').removeClass(self.options.activeClass);
                    }

                    $(self.options.stickyRelative).removeClass(self.options.stickyActive);

                    _style = {
                        position: "static",
                        top: "auto" + "px",
                    }

                    clearTimeout(tid);
                    $(el).removeClass('active')
                }

                $(el).css(_style);

            });

        }

        function changeIndicator() {
            if ($("body").data("eventtype") != "load") {
                $(el).find('li').eq(currentIdx - 1).addClass(self.options.activeClass).siblings().removeClass(self.options.activeClass);
            }
        }
    }

    ic.util.inherits(sticky, Module);
    ic.jquery.plugin('sticky', sticky, '.sub-menu-pdptab');


    plugin('StickyPdp', StickyPdp, '[data-sticky-pdp]');

    return StickyPdp;
});