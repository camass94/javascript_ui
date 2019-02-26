define(['ic/ic', 'ic/ui/module', 'global-config'], function(ic, Module, config, undefined) {

    'use strict';

    var sticky = function(el, options) {
        var _style;
        var positionInfo = [];
        var resizeTid = null;
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

        var otherModels;

        sticky.superclass.constructor.call(self, el, options);
        self.options = $.extend(defaults, self.options);


        if (!config.isMobile) {
            init();
        } else if($(".aboutlg").length && $(".aboutlg").hasClass("main") == false){
            init();
            if (config.isMobile) {
                $(el).find(".title").text($(el).find("li.on span").text()).addClass("active");
            }
        } else if($(el).has(".btn-other-models")){
            setOtherModels();
        }

        function init() {
            skickyScroll();
            if($(el).has(".btn-other-models")) {
                setOtherModels();
            }
        }

        function skickyScroll() {
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
                        if(otherModels.isOpen){
                            closeLayerBox(new Event(Event.CLICK));
                        }
                    } else {
                        _style = {
                            position: "fixed",
                            top: 0 + "px",
                            display: "block"
                        }

                        $(el).addClass("sticky-fixed");
                        $(el).find("~ .other-models").addClass("fixed").css("top", $(el).height()+"px");

                        isMoving = false;
                    }

                } else if (limitTop > scrTop) {

                    $(self.options.stickyRelative).removeClass(self.options.stickyActive);

                    _style = {
                        position: "static",
                        top: "auto" + "px",
                    }

                    $(el).removeClass("sticky-fixed");
                    $(el).find("~ .other-models").removeClass("fixed").css("top", "auto");
                }

                $(el).css(_style);

            }).one("load",function(){
                $(this).scroll();
            });

        }

        function setOtherModels(){
            //alert("setOtherModels");
            otherModels = new Object();
            otherModels.$el = $(el).find("~ .other-models");
            otherModels.isOpen = false;

            var bt = $(el).find(".btn-other-models");
            var closeBt = otherModels.$el.find(".close");

            bt.bind("click", showLayerBox);
            closeBt.bind("click", closeLayerBox);
        }

        function showLayerBox(e){
            var layerBox = otherModels.$el;
            var tabItems = layerBox.find("a");
            var tabTotal= tabItems.length;

            /* focus loop 사용안함
            tabItems.each(function(i, t){
                $(t).attr("tabIndex", i+2);
                if(i == 0){
                    $(t).focus(function(e){
                        tabItems.eq(tabTotal-1).attr("tabIndex", 1);
                    }).blur(function(e){
                        tabItems.eq(tabTotal-1).attr("tabIndex", tabTotal+1);
                    });
                }else if(i == tabTotal-1){
                    $(t).focus(function(e){
                        tabItems.eq(0).attr("tabIndex", tabTotal+2);
                    }).blur(function(e){
                        tabItems.eq(0).attr("tabIndex", 2);
                    });
                }
            });
            */

            layerBox.addClass("on");
            //tabItems.eq(0).focus();
            otherModels.isOpen = true;
            
            e.preventDefault();
        }

        function closeLayerBox(e){
            var bt = $(el).find(".btn-other-models");
            var layerBox = otherModels.$el;

            bt.focus();
            layerBox.removeClass("on");
            otherModels.isOpen = false;
            
            e.preventDefault();
        }
    }

    ic.util.inherits(sticky, Module);
    ic.jquery.plugin('sticky', sticky, '[data-sticky-target]:not(.sub-menu-tab)');

    return sticky;
});
