define(['ic/ic', 'ic/ui/module', 'jquery.cookie'], function(ic, Module) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        dom = ic.dom,
        $window = dom.$window,
        isIE8 = dom.$html.hasClass('lt-ie9'),
        proto;

    var predictiveSearch = function(el, options) {
        var self = this;
        predictiveSearch.superclass.constructor.call(self, el, options);
        self.$wrapper = $(el);
        self.$suggested = $(el).parent().siblings(self.options.suggestedElement) || $(el).siblings(self.options.suggestedElement);
        self.$predictived = $(el).parent().siblings(".predictive-search:not(" + self.options.suggestedElement + ")") || $(el).siblings(".predictive-search:not(" + self.options.suggestedElement + ")");
        self.$searchBtn = $(el).parents('form').find('.btn-search');
        self.$searchResult = $("ul.search-result.recent-keyword", self.$suggested);
        self.$cookieName = self.options.cookieName;
        self.$cookieObj = [];
        self.$scrollTarget;
        self.cookieUsing = $(el).parents('form').find("input[name='search']").data("default-cookie");
        self._init();
    };

    util.inherits(predictiveSearch, Module);
    proto = predictiveSearch.prototype;
    proto._defaults = {
        // recentKeyword: 5,
        // suggestedKeyword: 5,
        suggestedElement: ".recent-suggested-type",
        predictiveUrl: '',
        predictiveLength: 2,
        exceptCharacter: "gd", // 'g' or 'd'
        requestDelay: 100,
        arrowControl: false,
        scope: null, // PJTBTOBCSR-138
        extractElement: ".model-name",
        iePlaceHolder: "span.msg-placeholder"
    };

    proto._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self);
        self.$el.on('focusin', $.proxy(self._focusIn, self));
        self.$el.on('focusout', $.proxy(self._focusOut, self));
        self.$el.on('keyup', $.proxy(self._keyUp, self));   //LGEGMO-1839
        self.$el.on('keydown', $.proxy(self._keyDown, self));
        self.$suggested.on('focusout', 'a', $.proxy(self._focusOut, self));
        self.$predictived.on('focusout', 'a', $.proxy(self._focusOut, self));

        self.$suggested.on('click', 'a', $.proxy(self._put, self, true));
        /*LGEES-2683 : 20170216 modify*/
        self.$predictived.on('click mousedown', 'a', $.proxy(self._put, self, false));
        /*//LGEES-2683 : 20170216 modify*/
        self._bindObserver();

        if (self.$cookieName) {
            self.$searchBtn.on('click', $.proxy(self.cookieSet, self));
            self.$searchResult.on('click', 'a.close', $.proxy(self.cookieDeleteList, self));
        }

        // self.state = '';
        self.focusing = false;
        self.keyword = '';
        var debouncedFocusIn = ic.util.debounce(function(e) {
            self._handleEvent(e);
        }, 3);
        var debouncedFocusOut = ic.util.debounce(function(e) {
            self._handleEvent(e);
        }, 10);
        var debouncedKeyUp = ic.util.debounce(function(e) {
            self._handleEvent(e);
        }, 5);
        var debouncedKeyDown = ic.util.debounce(function(e) {
            self._handleEvent(e);
        }, 5);
        $window.on('focusin', (isIE8) ? eventHandler : debouncedFocusIn);
        $window.on('focusout', (isIE8) ? eventHandler : debouncedFocusOut);
        $window.on('keyup', (isIE8) ? eventHandler : debouncedKeyUp);
        $window.on('keydown', (isIE8) ? eventHandler : debouncedKeyDown);
        self.$el.attr("autocomplete", "off");

        if (self.$suggested.find("ul.suggested").find("li").length == 0) {
            self.$suggested.find("ul.suggested").next().show();
        }
        /*LGECS-798 20160824 modify*/
        self.$el.closest(".model-selector, .model-browser").find(".scrollbar-outer").scrollbar();
        /*//GECS-798 20160824 modify*/
    };

    proto._handleEvent = function(e) {
        var self = this;
        // if (e.type == 'focusin') self._focusIn(e);
        // if (e.type == 'focusout') self._focusOut(e);
        e.preventDefault();
    };

    proto._bindObserver = function() {
        var self = this;
        self.$el.on('predictive:suggest:cancel', function() {
            clearInterval(self.reqInterval);
            self.focusing = false;
            self.$predictived.hide();
            self.$suggested.hide();
        });
    };

    proto._focusIn = function(e) {
        var self = this;
        self.showSuggested();
    };

    proto._focusOut = function(e) {
        var self = this;
        self.hideSuggested();
        self.hidePredictived();
    };

    proto._keyUp = function(e) {
        var self = this;
        if (self.keyword != self.$el.val()) {
            self.keyword = $.trim(self.$el.val());
            self._changed(e);
        }
        // console.log("key");
        // self.hideSuggested()
    };

    proto._keyDown = function(e) {
        var self = this;
        if (e.keyCode == 13) {
            e.preventDefault();
            $(e.currentTarget).parent().siblings("a, button").trigger("click");
            self.$predictived.hide();
            self.$suggested.show();
        }
        // console.log("key");
    };

    proto._changed = function(e) {
        var self = this;
        clearInterval(self.reqInterval);
        if (self.keyword != '' && (self.keyword.length >= self.options.predictiveLength || $.inArray(self.keyword.substr(0, 1).toLowerCase(), self.options.exceptCharacter.toLowerCase().split('')) > -1)) {
            if (self.focusing) {
                self.focusing = false
            } else {
                self.reqInterval = setTimeout($.proxy(self.getPredictive, this, self.keyword), self.options.requestDelay);
            }
        } else {
            self.$predictived.hide();
            self.$suggested.show();
        }
        // console.log(self.keyword.length)
    };

    /* start LGEGMO-1741 */
    proto._put = function(isSuggested, e) {
        var self = this;
        if ($(e.currentTarget).attr("href") == "#") {

            if (isSuggested) {

                self.$el.val($.trim($(e.target).text()));
                if (self.$el.siblings(self.options.iePlaceHolder)) {
                    self.$el.siblings(self.options.iePlaceHolder).hide();
                }
                //console.log(self.$el.parent().siblings("a, button"))
                // self.$el.parent().siblings("a, button").trigger("click");

            } else if (!self.options.arrowControl) {
                e.preventDefault(); // LGEGMO-1820
                self.$predictived.hide();
            }

        }

        self.$el.parent().siblings("a, button").trigger({
            type: "click",
            clickTarget: e.currentTarget
        });

    };
    /* end LGEGMO-1741 */

    proto.showSuggested = function() {
        var self = this;
        self.cookieMakeList();
        self.$suggested.show();
    };

    proto.hideSuggested = function(isPredictive) {
        var self = this;
        setTimeout($.proxy(function() {
            if ((!self.$suggested.find(":focus").length && !self.$el.is(":focus")) || isPredictive) {
                self.$suggested.hide();
            }
        }, this), 100)
    };

    proto.showPredictived = function() {
        var self = this;
        self.$predictived.show();
    };

    proto.hidePredictived = function() {
        var self = this;
        setTimeout($.proxy(function() {
            if (!self.$predictived.find(":focus").length) {
                self.$predictived.hide();
            }
        }, this), 100)
    };

    proto.getPredictive = function(keyword) {
        var self = this;

        if (typeof self.predictiveRequest != "undefined") self.predictiveRequest.abort();
        /* LGEGMO-1955 start */
        /*
         if (self.$el.closest("form").find("input[name=superCategoryId]").size() > 0) {
         var PredScate = self.$el.closest("form").find("input[name=superCategoryId]").val();
         var Predcate = self.$el.closest("form").find("input[name=categoryId]").val();
         var parmas = {
         "keyword": XSSfilter(keyword),
         "superCategoryId": XSSfilter(PredScate),
         "categoryId": XSSfilter(Predcate),
         }
         } else {
         var parmas = {
         "keyword": XSSfilter(keyword)
         }
         }
         */

        var parmas = self.$el.closest("form").serialize();
        /* LGEGMO-1955 end */

        /* PJTBTOBCSR-138 start */
        if (self.options.scope) {
            parmas = {};
            $.each(self.$el.data("url").split("?"), function(idx, param) {
                parmas[param.split("=")[0]] = param.split("=")[1];
            });
            $.each(self.$el.closest(self.options.scope).find(":input:not('button')"), function(idx, el) {
                parmas[$(el).attr('name')] = el.value;
            });
        }
        /* //PJTBTOBCSR-138 start */

        self.predictiveRequest = $.ajax({
            url: self.options.predictiveUrl,
            data: parmas,
            success: $.proxy(function(data) {
                this.setPredictive(data);
            }, self)
        })
    };

    proto.setPredictive = function(resultData) {
        var self = this;
        var $result = $("ul.search-result", self.$predictived);
        var $resultLink = $result.parents(self.$predictived).find(".search-result-number a");
        var $resultText = $result.parents(self.$predictived).find(".search-result-number span");

        $result.each(function(n) {
            var $this = $(this);

            if (!$this.data("templete")) {
                $this.data("templete", $this.html()).empty();
            }

            var data = resultData[$this.data("result")];

            $this.empty();

            if (_.size(data)) {
                if ($this.data("result") == "predictive") self.$predictived.removeClass("noresult");
                for (var k in data) {
                    $this.append(function() {
                        var inHTML = $this.data("templete");
                        for (var d in data[k]) {
                            inHTML = inHTML.replace("%" + d.toString() + "%", data[k][d]);
                        }
                        return inHTML;
                    })
                }
                if (_.size(data) == 0) {
                    $(".search-result-number").hide();
                }
            } else {
                if ($this.data("result") == "predictive") {
                    self.$predictived.addClass("noresult");
                    $(".search-result-number").hide();
                }
            }
            if (resultData["link"] == "" || resultData["linkText"] == "" || !resultData["predictive"].length) {
                $(".search-result-number").hide();
            } else {
                if (resultData["link"] && resultData["linkText"]) {
                    $resultLink.attr("href", resultData["link"]).find("strong").text(resultData["linkText"]);
                    $(".search-result-number").show();
                }

                if (resultData["resultText"]) {
                    $resultText.text(resultData["resultText"]);
                }
            }

        });

        if (self.options.arrowControl) {
            $("a", self.$predictived).attr("tabIndex", -1).click(function(e) {
                e.preventDefault();
                self.$el.val($.trim($(this).find(self.options.extractElement).text())).focus();
            });
            self.$el.off("keydown", self.keyControl).on("keydown", $.proxy(self.keyControl, this));
            $result.off("mouseenter", ">li", self.hoverAction).on("mouseenter", ">li", self.hoverAction);
        }

        // $resultLink.attr("href", document.URL + resultData.link)
        self.showPredictived();
        self.hideSuggested(true);
    };

    proto._resultFocus = function(childs, dir, e) {
        var self = this;
        var idx = childs.filter(".on").index();
        if (idx > -1) {
            if (idx + dir > childs.length - 1) idx = -1;
            childs.removeClass("on").eq(idx + dir).addClass("on");
        } else {
            childs.removeClass("on").first().addClass("on");
        }
        idx = childs.filter(".on").index();
        if (idx > -1) {
            self.focusing = true;
            self.$el.val($.trim(childs.eq(idx).find(self.options.extractElement).text()));

            self.$scrollTarget = $('.scrollbar-outer > div', self.$predictived);
            if (self.$scrollTarget) {
                var scrollActive = self.$scrollTarget.find('li.on'),
                    scrollMax = parseInt(self.$scrollTarget.height(), 10),
                    scrollVisibleTop = self.$scrollTarget.scrollTop(),
                    scrollVisibleBottom = scrollMax + scrollVisibleTop,
                    scrollHighTop = (scrollActive.length > 0 ? scrollActive.position().top : 0) + self.$scrollTarget.scrollTop(),
                    scrollHighBottom = scrollHighTop + scrollActive.outerHeight();

                if (scrollHighBottom >= scrollVisibleBottom) {
                    return self.$scrollTarget.scrollTop((scrollHighBottom - scrollMax) > 0 ? scrollHighBottom - scrollMax : 0);
                } else if (scrollHighTop < scrollVisibleTop) {
                    return self.$scrollTarget.scrollTop(scrollHighTop);
                }
            }
        }
    };

    proto.keyControl = function(e) {
        var self = this;
        var $result = $("ul.search-result", self.$predictived);
        var $resultChild = $result.children();
        var dir = (e.keyCode == 38 ? -1 : e.keyCode == 40 ? 1 : 0);
        if (Math.abs(dir) && self.$predictived.is(":visible")) {
            e.preventDefault();
            self._resultFocus($resultChild, dir, e)
        }
    };

    proto.hoverAction = function(e) {
        var self = this;
        [];
        var $result = $("ul.search-result", self.$predictived);
        var $resultChild = $result.children();
        $resultChild.removeClass("on");
        $(e.target).closest(">li", $result).addClass("on")
    };

    proto.cookieSet = function(e) {
        var self = this;
        var regExp = self.$el.val().replace(/\s|　/gi, '');

        if (regExp != "") {
            if ($.cookie(self.$cookieName)) {
                self.$cookieObj = $.cookie(self.$cookieName).split('|');

                for (var i = 0; i < self.$cookieObj.length; i++) {
                    if (escape(XSSfilter(self.$el.val())) == self.$cookieObj[i]) {
                        self.$cookieObj.splice(i, 1);
                    }
                }
                self.$cookieObj.push(escape(XSSfilter(self.$el.val())));

                if (self.$cookieObj.length > 5) {
                    self.$cookieObj.shift();
                }
            } else {
                self.$cookieObj.push(escape(XSSfilter(self.$el.val())));
            }


            if (self.cookieUsing == "on") {
                $.cookie(self.$cookieName, self.$cookieObj.join('|'), {
                    path: '/'
                })
            }
        }
    };

    proto.cookieMakeList = function() {
        var self = this;
        var $resultEmpty = $("p.not-result.recent-keyword", self.$suggested);
        var $denyCookie = $(".no-cookies", self.$suggested);
        if (self.cookieUsing == "on") {
            if (self.$cookieName) {
                if ($.cookie(self.$cookieName) == undefined || $.cookie(self.$cookieName) == '') {
                    self.$searchResult.hide();
                    $resultEmpty.show();
                    $denyCookie.hide();
                } else {
                    $resultEmpty.hide();
                    $denyCookie.hide();
                    self.$searchResult.empty().show();
                    self.$cookieObj = $.cookie(self.$cookieName).split('|');
                    for (var i = 0; i < self.$cookieObj.length; i++) {
                        /* LGECS-850 20161012 modify */
                        self.$searchResult.prepend('<li><a href="#" adobe-click="type-num-key"><strong class="product-name">' + unescape(self.$cookieObj[i]) + '</strong></a><a href="#" class="close icon-close"><span>clear the search keyword</span></a></li>')
                        /*//LGECS-850 20161012 modify */
                    }
                }
            }
        } else {
            $resultEmpty.hide();
            self.$searchResult.empty().hide();
            //$.removeCookie(self.$cookieName, {
            //    path: '/'
            // });
            $denyCookie.show();
        }
    };

    proto.cookieDeleteList = function(e) {
        var self = this;

        e.preventDefault();

        self.$suggested.show();

        self.$cookieObj = $.cookie(self.$cookieName).split('|');

        for (var i = 0; i < self.$cookieObj.length; i++) {
            if ($(e.currentTarget).parent().index() == i) {
                self.$cookieObj.splice((self.$cookieObj.length - 1) - i, 1);
            }
        }

        self.$searchResult.empty();
        for (var j = 0; j < self.$cookieObj.length; j++) {
            self.$searchResult.prepend('<li><a href="#"><strong class="product-name">' + unescape(self.$cookieObj[j]) + '</strong></a><a href="#" class="close icon-close"><span>clear the search keyword</span></a></li>')
        }
        $.cookie(self.$cookieName, self.$cookieObj.join('|'), {
            path: '/'
        });
        self.$el.focus();
    };


    /*proto._moveCursorToEnd = function(el) {
     if (typeof el.selectionStart == "number") {
     el.selectionStart = el.selectionEnd = el.value.length;
     } else if (typeof el.createTextRange != "undefined") {
     el.focus();
     var range = el.createTextRange();
     range.collapse(false);
     range.select();
     }
     }*/

    return predictiveSearch;

});
