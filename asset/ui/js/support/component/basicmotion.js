/**
 * The basic motion module.
 * @module support/component/
 * @requires ic/ic
 * @requires ic/ui/module
 */
define(['jquery', 'ic/ic', 'ic/ui/module'], function($, ic, Module) {

    'use strict';
    // console.log('basicmotion.js');

    var BasicMotion = function(el, options) {
        var self = this;
        var element = el;
        var defaults = { //속성 이름은 고정, 값의 디폴트
            event: "click", //Listener Event :String
            target: null, //Selector :Sting
            actionParent: null, //Selector of parent :Sting
            toggle: null, //data-toggle attr only
            toggleGroup: null,
            activeClass: "active", //className :String
            activeText: null, //self change inner text :String
            addAttr: null, //add attributes at data-target - ※ex) class:addedClass1 addedClass2, data-custom-attr:cus1 cus2
            addText: null, //add <span> text at data-target
            transition: null, //"show", "hide", "fadeIn", "fadeOut", "slideDown", "slideUp" .. :jquery function String
            transitionSpeed: 400, // milisecond :int or "fast", "slow" : String
            focus: null, //focus target after activation
            fn: null, //execute function
            callBack: null, //excute function param["self"], param["target"]
            disabled: false
        };
        BasicMotion.superclass.constructor.call(self, el, options);
        self.options = $.extend(defaults, self.options);

        init();


        function init() {
            //alert(self.options.motionEvent);
            self.event = self.options.event;
            self.toggle = self.options.toggle != null ? true : false;
            self.addAttr = self.options.addAttr != null ? self.options.addAttr.split(/,\s*/g) : null;
            self.originText = self.options.activeText != null ? $(element).html() : null;

            $(element).on(self.event, onEventHandler);

            //groupItems
            /*
            if (self.options.toggleGroup && self.options.motionParent) {
                self.groupItems = $(self.options.toggleGroup).find(self.options.motionParent);
                for (var i = 0; i < self.groupItems.length; i++) {
                    self.groupItems.eq(i).data("parent-index", i);
                }
            }*/
        }

        function isActive() {
            return $(element).hasClass(self.options.activeClass);
        }

        function eventAction(isAct) {

            var targetElement = self.options.actionParent ? $(element).parents(self.options.actionParent + ":first").find(self.options.target) : self.options.target;

            if (self.toggle && isAct) {

                //active class
                if (self.options.activeClass) {
                    $(element).removeClass(self.options.activeClass);
                }


                //active text
                if (self.originText != null) {
                    $(element).html(self.originText);
                }

                //add-attr
                var addAttr = function() {
                    if (self.addAttr) {
                        for (var i = 0; i < self.addAttr.length; i++) {
                            var aArr = self.addAttr[i].split(":");
                            var name = aArr[0];
                            var val = aArr[1];

                            if (name == "class") {
                                $(targetElement).removeClass(val);
                            } else {
                                if ($(targetElement).attr(name)) {
                                    var tgAttr = $(targetElement).attr(name).split(/\s+/g);
                                    extendArr(tgAttr, val.split(/\s+/g), "separate");
                                    if (tgAttr.length) {
                                        $(targetElement).attr(name, tgAttr.join(" "));
                                    } else {
                                        $(targetElement).removeAttr(name);
                                    }
                                }
                            }
                        }
                    }
                }

                //transition
                if (self.options.transition) {
                    $(targetElement)[parseToggle(self.options.transition)](self.options.transitionSpeed, addAttr);
                } else {
                    addAttr();
                }


                //add-text
                if (self.options.addText) {
                    $(targetElement).has("span.active-text").length ? $(targetElement).find("span.active-text").remove() : null;
                }

                //focus

                //fn
                if (self.options.fn) {
                    eval(self.options.fn);
                }

                //callback
                if (self.options.callBack) {
                    var paramStr = self.options.callBack.substr(self.options.callBack.indexOf("("));
                    var fnStr = self.options.callBack.replace(paramStr, "");
                    var params = {
                        "self": el,
                        "target": targetElement
                    };
                    var fnArray = fnStr.split(".");
                    switch (fnArray.length) {
                        case 1:
                            window[fnArray[0]](params);
                            break;
                        case 2:
                            window[fnArray[0]][fnArray[1]](params);
                            break;
                        case 3:
                            window[fnArray[0]][fnArray[1]][fnArray[2]](params);
                            break;
                    }
                }

            } else {

                //active class
                if (self.options.activeClass) {
                    $(element).addClass(self.options.activeClass);
                }



                //active text
                if (self.originText != null) {
                    var htmlStr = "";
                    var hasText = false;
                    $(element).contents().each(function() {
                        if (this.nodeType == 3) {
                            if (!hasText) {
                                htmlStr += self.options.activeText;
                                hasText = true;
                            }
                        } else {
                            htmlStr += this.outerHTML;
                        }
                    })
                    $(element).html(htmlStr);
                }


                //transition
                if (self.options.transition) {
                    $(targetElement)[self.options.transition](self.options.transitionSpeed);
                }

                //add-attr
                if (self.addAttr) {
                    for (var i = 0; i < self.addAttr.length; i++) {
                        var aArr = self.addAttr[i].split(":");
                        var name = aArr[0];
                        var val = aArr[1];

                        if (name == "class") {
                            $(targetElement).addClass(val);
                        } else {
                            if ($(targetElement).attr(name)) {
                                var tgAttr = $(targetElement).attr(aArr[0]).split(/\s+/g);
                                extendArr(tgAttr, aArr[1].split(/\s+/g), "merge");
                                $(targetElement).attr(aArr[0], tgAttr.join(" "));
                            } else {
                                $(targetElement).attr(aArr[0], aArr[1]);
                            }
                        }
                        //targetElement.attr(aArr[0], targetElement.attr(aArr[0]) ? $.extend(targetElement.attr(aArr[0]).split(/\s+/g), aArr[1].split(/\s+/g)).join(" ") : aArr[1]);
                    }
                }

                //add-text
                if (self.options.addText) {
                    $(targetElement).has("span.active-text").length ? null : $(targetElement).append('<span class="active-text">' + self.options.addText + '</span>');
                }

                //focus
                if (self.options.focus) {
                    var focusElement = self.options.actionParent ? $(element).parents(self.options.actionParent + ":first").find(self.options.focus) : self.options.focus;
                    $(focusElement).focus();
                }

                //fn
                if (self.options.fn) {
                    eval(self.options.fn);
                }

                //callback
                if (self.options.callBack) {
                    var paramStr = self.options.callBack.substr(self.options.callBack.indexOf("("));
                    var fnStr = self.options.callBack.replace(paramStr, "");
                    var params = {
                        "self": el,
                        "target": targetElement
                    };
                    var fnArray = fnStr.split(".");
                    switch (fnArray.length) {
                        case 1:
                            window[fnArray[0]](params);
                            break;
                        case 2:
                            window[fnArray[0]][fnArray[1]](params);
                            break;
                        case 3:
                            window[fnArray[0]][fnArray[1]][fnArray[2]](params);
                            break;
                    }
                }

            } //ELSE END
        }


        function extendArr(a, b, c) {
            var aLen = a.length;
            for (var i = 0; i < b.length; i++) {
                var tmp;
                for (var j = 0; j < aLen; j++) {
                    if (c == null || c == "merge") {
                        if (b[i] == a[j]) {
                            tmp = null;
                            break;
                        } else {
                            tmp = b[i];
                        }
                    } else if (c == "separate") {
                        if (b[i] == a[j]) {
                            a.splice(j, 1);
                            j = Math.max(0, j - 1);
                            break;
                        }
                    }
                }
                if (c == null || c == "merge") {
                    tmp ? a.push(tmp) : null;
                }
            }
        }

        function parseToggle(type) {
            var p = {
                "show": "hide",
                "hide": "show",
                "fadeIn": "fadeOut",
                "fadeOut": "fadeIn",
                "slideUp": "slideDown",
                "slideDown": "slideUp"
            };
            if (p[type]) {
                return p[type];
            } else {
                return type;
            }
        }


        //EVENT HANDLER
        function onEventHandler(e) {
            e.preventDefault();

            if ($(element).data('disabled') == false || $(element).data('disabled') == undefined) eventAction(isActive());

        }

        function triggerOtherEventHandler(e) {
            toggleAction(false);
        }


        //UTIL
        function findHighestZIndex(elem) {
            var elems = document.getElementsByTagName(elem);
            var highest = 0;
            for (var i = 0; i < elems.length; i++) {
                var zindex = document.defaultView.getComputedStyle(elems[i], null).getPropertyValue("z-index");
                if ((zindex > highest) && (zindex != 'auto')) {
                    highest = zindex;
                }
            }
            return parseInt(highest);
        }


        // disabeld Reload
        $.fn.disabled = function(boolean) {
            $(this).data('disabled', boolean);
        }


    }; //END BasicMotion



    ic.util.inherits(BasicMotion, Module);

    // Create the jquery plugin and set it to auto-wire to specified selector
    ic.jquery.plugin('basicMotion', BasicMotion, '[data-event]');

    return BasicMotion;
});
