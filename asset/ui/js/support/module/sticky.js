define(['ic/ic', 'ic/ui/module', 'global-config', 'lazyload'], function(ic, Module, config, lazyload) {

    'use strict';

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


        stickyArea.each(function(index, element) {
            stickyObj[index] = new StickyMotion($(element), index);
        });

        if (!config.isMobile) {
            init();
        }

        function init() {
            $(window).load(function() {
                $("body").data("eventtype", "load");
                $(self.options.stickyRelative).height($(el).outerHeight(true));
            });

            window.onresize = function() {
                $(self.options.stickyRelative).height($(el).outerHeight(true));
            };

            skickyScroll();

            $(el).find('li a').each(function(index, element) {
                $(element).on("click", function(event) {
                    event.preventDefault();
                    $('body').data('eventtype', 'skickyClick');
                    currentIdx = index + 1;

                    stickyObj[currentIdx - 1].scroll();
                    changeIndicator();

                    return false
                });
            });

        }

        function StickyMotion(element, index) {
            function scroll() {
                if ($('html, body').not(":animated")) {
                    $(window).unbind("scroll");
                    $('html, body').stop(true).animate({
                        scrollTop: element.offset().top - $(el).outerHeight(true)
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
                    offsetTop: element.offset().top,
                    height: element.outerHeight(true) - $(el).outerHeight(true)
                };
            }

            return {
                scroll: scroll,
                position: positionInfo
            };
        }

        function skickyScroll() {
            $("img.lazy").lazyload();

            $(window).bind("scroll", function(event) {
                if (isMoving = true) $("body").data("eventtype", "scroll");

                var scrTop = $(this).scrollTop();
                var limitTop = $(self.options.stickyRelative).offset().top;
                var limitBottom = $(self.options.stickyEnd).offset().top;

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
                            top: 0 + "px",
                            display: "block"
                        }

                        $(self.options.stickyRelative).addClass(self.options.stickyActive);
                        $(self.options.stickyRelative).height($(el).outerHeight(true));

                        clearTimeout(tid);
                        tid = setTimeout(function() {
                            // scroll down
                            if (oldTopPos < scrTop) {
                                if (positionInfo[0].offsetTop + positionInfo[0].height < scrTop) {
                                    for (var i = 1, Len = _areaLength; i < Len; i++) {
                                        if (positionInfo[i].offsetTop + positionInfo[i].height > scrTop) {
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
                                if (positionInfo[0].offsetTop + positionInfo[0].height < scrTop) {
                                    for (var i = 1, Len = _areaLength; i < Len; i++) {
                                        if (positionInfo[i].offsetTop + positionInfo[i].height > scrTop) {
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

                    $(self.options.stickyRelative).height("auto");

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
    ic.jquery.plugin('sticky', sticky, '[data-sticky-target]');

    return sticky;
});
