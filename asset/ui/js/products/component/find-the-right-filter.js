/*
 * find the right filter
 * 2015-06-16
 */
define(['jquery', 'ic/ic', 'ic/ui/module', 'mkt/find-the-right', 'mkt/product-compare', 'chosen', 'common/dtm'], function($, ic, Module, findTheRight, cp, chosen, dtm) {

    'use strict';

    var ftr,
        events = ic.events,
        isMobile = $("body").is(".is-mobile");


    var findTheRightFilter = function(el, options) {
        var self = this;
        self._defaults.filters = filters;
        // Call the parent constructor
        findTheRightFilter.superclass.constructor.call(self, el, options);
        self.$form = self.$el.find("form");
        self.$stepBox = self.$form.find(".step-box");
        self.$select = self.$form.find(".step-box .sort select");
        self.$input = self.$form.find(".step-box input[type='checkbox'], .step-box input[type='radio']");
        self.$values = self.$form.find(".step-box input[type='hidden']");
        self.$sortBy = self.$form.find("*[name='sort']");
        self.$nextSubmit = self.$form.find(".next-button button.submit, .next-button button.skip-nav");
        self.$resetButton = self.$form.find(".next-button button.reset");
        self.$resultArea = self.$form.find(".result");
        self.$recommended = self.$resultArea.find(".recommand-item");
        self.$otherMatches = self.$resultArea.find(".other-matches-item-list");
        self.$mobileViewResult = self.$form.find(".flow-chart ul > li:last-child a");
        self.$mobileFlowSubmit = self.$form.find(".step-flow-contents .step-box").find("button.submit, button.skip-nav");
        if (!isMobile) self.$pageControls = self.$resultArea.find(".page-controls .pages");
        else self.$pageControls = self.$resultArea.find(".view-more");
        self._defaults.sort = self.$sortBy.val();
        self._init();
    };
    ic.util.inherits(findTheRightFilter, Module);
    ftr = findTheRightFilter.prototype;
    ftr._defaults = {
        //active class
        ac: 'active',
        data: null,
        disabledData: null,
        activateTrigger: null,
        filters: null,
        sort: null,
    };
    ftr._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self);
        if (!isMobile) {
            self.$nextSubmit.on('click', $.proxy(self._formApplyTrigger, self));
            self.$sortBy.on('change', $.proxy(self._pageTrigger, self));
        } else {
            //self.$mobileViewResult.on('click', $.proxy(self._formApplyTrigger, self));
            self.$mobileFlowSubmit.on('click', $.proxy(self._formApplyTrigger, self));
        };
        self.$stepBox.each(function(i) {
            if ((i + 1) < self.$stepBox.length) {
                $(this).find("button.reset").remove();
            };
        });

        self.$pageControls.find('a').on('click', $.proxy(self._pageTrigger, self));
        self.$select.on('change', $.proxy(self._inputActivation, self));
        self.$input.on('change', $.proxy(self._inputActivation, self));
        self.$values.on('change', $.proxy(self._inputActivation, self));
        self.$resetButton.on('click', $.proxy(self._formResetTrigger, self));
        self.$resultArea.find('.compare-check input.compare').unbind();
        self.$resultArea.find('.compare-check input.compare').on('change', cp.onCompareClick);
        self.$values.filter("input[name=rangeMin], input[name=rangeMax]").val(null);
        self.options.data = self.$form.serialize();
        self.$sortBy.chosen({
            disable_search_threshold: 10
        });
        self._inputActivation(false);
        /* if ($('.buynow').length > 0) {
            runBuyNow();
        }*/
        // $('.other-matches-item-list, .recommand-item').each(setBVRatings);
        cp.updateCompareButton();
        //self._filterAction();
        //console.log(self._callAjax(0));
    };
    ftr._reinit = function() {
        var self = this;
        if (!isMobile) self.$pageControls = self.$resultArea.find(".page-controls .pages");
        else self.$pageControls = self.$resultArea.find(".view-more");
        self.$recommended = self.$resultArea.find(".recommand-item");
        //self.$otherMatches = self.$resultArea.find(".result");
        self.$pageControls.find('a').unbind().on('click', $.proxy(self._pageTrigger, self));
        self.$select.unbind('change', $.proxy(self._inputActivation, self)).on('change', $.proxy(self._inputActivation, self));
        self.$input.unbind('change', $.proxy(self._inputActivation, self)).on('change', $.proxy(self._inputActivation, self));
        self.$values.unbind('change', $.proxy(self._inputActivation, self)).on('change', $.proxy(self._inputActivation, self));
        //self.$resultArea.on('change','.compare-check input.compare', cp.onCompareClick);
        self.$resultArea.find('.compare-check input.compare').unbind().on('change', cp.onCompareClick);
        cp.updateCompareButton();
        if ($('.buynow').length > 0) {
            runBuyNow();
        }
        //$('.other-matches-item-list, .recommand-item').each(setBVRatings);

    }
    ftr._callAjax = function(type) {
        type = type ? type : 0;
        var self = this,
            a = null,
            url = self.$form[0].action,
            //d = self.$form.serialize()+"&"+"callType="+type;
            d = (type == 2 ? self.$form.serialize() : self.options.data) + "&" + "callType=" + type;
        d = d.replace(/&?[^=&]+=(&|$)/g, '&');
        $.ajax({
            url: url,
            type: "post",
            async: false,
            data: d,
            success: function(b) {
                a = b;
            },
            error: $.proxy(function(d, b, c) {
                // console.log(d.status, c);
                return false
            }),
        });
        return a;
    }
    ftr._formApplyTrigger = function(e) {
        var self = this;
        if (self.options.data != self.$form.serialize()) {

            var i, prev, next, f;
            f = self.$form.serialize();
            if (!isMobile) { //if desktop
                i = self.$stepBox.filter(".active").index() + 1;
                prev = self.$stepBox.slice(0, i);
                next = self.$stepBox.slice(i, self.$stepBox.length);
                next.attr("data-count", 0).each(function(i) {
                    $(this).find("input[type=checkbox], input[type=radio]").removeAttr("checked").parents(".check").removeClass("check");
                    if (!$(this).find(".price-box")[0]) {
                        $(this).find('.btn.submit').hide();
                        $(this).find('.skip-nav').show();
                    };
                });
            } else {
                if (!$(e.currentTarget).parents(".flow-chart")[0] && !$(e.currentTarget).parents(".step-box").is(".submit")) {
                    i = self.$stepBox.filter(".active").index();
                    next = self.$stepBox.slice(i, self.$stepBox.length);
                    next.attr("data-count", 0).each(function(i) {
                        $(this).find("input[type=checkbox], input[type=radio]").removeAttr("checked").parents(".check").removeClass("check");
                        if (!$(this).find(".price-box")[0]) {
                            $(this).find('.btn.submit').hide();
                            $(this).find('.skip-nav').show();
                        };
                    });
                }
            }
            self.options.activateTrigger = f != self.$form.serialize();
            if (self.options.data != self.$form.serialize()) {
                self.$form[0].page.value = 1;
                if (!isMobile) self.$form[0].pagePosition.value = 1;
                self.options.data = self.$form.serialize();
                self._filterAction();
            }
        }
    }
    ftr._formResetTrigger = function(e) {
        var self = this;
        e.preventDefault();
        self.$select.unbind('change', $.proxy(self._inputActivation, self));
        self.$input.unbind('change', $.proxy(self._inputActivation, self));
        self.$values.unbind('change', $.proxy(self._inputActivation, self));
        self.$input.each(function(i) {
            $(this).removeAttr("checked").parents(".check").removeClass("check");
            /* LGEGMO-1700 */
            $(this).removeAttr("disabled").parents(".checkbox-tile").removeClass("disable");
            /* LGEGMO-1700 */
        });
        self.$form.find(".price-slider").each(function(i) {
            $('input[name=rangeMax], input[name=rangeMin]').val(null);
            $(this).trigger('slideDefault');
        });
        self.$form.find(".slide-bar").each(function(i) {
            var d = $(this).parents(".step-box").data("default");
            $(this).trigger('slideDefault');
        });
        if (!isMobile) {
            $('input[name=page], input[name=pagePosition]').val(1);
            $('select[name=sort]').val(self._defaults.sort).trigger("chosen:updated");
            $("body, html").animate({
                scrollTop: 0
            }, 700, "easeOutCubic");
        } else {
            self.$form.find(".flow-chart > ul > li:eq(0) a").click();
        };
        //self.options.data = self.$form.serialize().replace(/(page=).*?(&|$)/,'$1' + 1 + '$2');; // reset form data
        self.options.data = self.$form.serialize();
        self.$form.find('.btn.submit').hide();
        self.$form.find('.skip-nav').show();
        self.$stepBox.attr("data-count", 0);
        self.$stepBox.eq(0).attr("data-count", 1);
        self._inputActivation(false);
        self._filterAction();
    }
    ftr._pageTrigger = function(e) {
        var self = this,
            sortCheck = false,
            t = e.currentTarget;
        e.preventDefault();
        if (!isMobile && $(t).parent(".pages")[0]) { // desktop Page
            self.$form[0].page.value = $(e.currentTarget).data("page");
            self.$form[0].pagePosition.value = $(e.currentTarget).data("pageposition");
        } else if (!isMobile && $(t).parents(".sort")[0]) { // desktop Page
            self.$form[0].page.value = 1;
            self.$form[0].pagePosition.value = 1;
            sortCheck = true;
        } else { // mobile
            self.$form[0].page.value++;
        };
        self.options.data = self.options.data.replace(/(page=).*?(&|$)/, '$1' + self.$form[0].page.value + '$2');
        if (!isMobile) self.options.data = self.options.data.replace(/(pagePosition=).*?(&|$)/, '$1' + self.$form[0].pagePosition.value + '$2');
        if (!isMobile && $(t).parents(".sort")[0]) self.options.data = self.options.data.replace(/(sort=).*?(&|$)/, '$1' + self.$form[0].sort.value + '$2');
        if (!isMobile) $("html, body").animate({
            scrollTop: self.$otherMatches.parent("div").offset().top
        }, 500);
        self._filterAction(true, sortCheck);
    }
    ftr._filterAction = function(listReload, sortCheck) {
        var self = this,
            n = listReload ? 3 : 1,
            b = self._callAjax(n),
            $b = $(b);

        if ($b.filter(".no-result-contents").length == 0) { // if has-result
            if (self.$resultArea.find(".no-result-contents").length > 0) {
                self.$resultArea.find(".step-contents").show();
                self.$resultArea.find(".no-result-contents").remove();
            }
            self.$pageControls.parent(".page-controls").show();
            if (!listReload || (listReload && sortCheck)) {
                self.$recommended.html($b.filter(".recommand-item").html());
            };
            if (!isMobile) self.$pageControls.html($b.filter(".pages").html());
            else self.$pageControls.html($b.filter(".view-more").html());
            if (isMobile && listReload) {
                self.$otherMatches.append($b.filter(".other-matches-item-list").html());
            } else {
                self.$otherMatches.html($b.filter(".other-matches-item-list").html());
            };

            if ($b.filter(".other-matches-item-list").find('li').length == 0) {
                self.$otherMatches.closest('div.other-matches-item').hide();
            } else {
                self.$otherMatches.closest('div.other-matches-item').show();
            }

        } else { // if no-result
            self.$resultArea.find(".step-contents").hide();
            if (self.$resultArea.find(".no-result-contents").length == 0) {
                self.$resultArea.append($b.filter(".no-result-contents").clone());
            }
        };

        if (!listReload && self.options.activateTrigger) {
            $b.filter("script").each(function() {
                $.globalEval(this.text || this.textContent || this.innerHTML || "");
            });
            self._defaults.disabledData = filters;
            self._inputActivation(true);
        }

        // DTM
        var dtm = "";
        var checkDtm = 0;
        $('.step-flow-contents .step-box').not('.start').each(function(i) {
            var _this = $(this);
            if (i != 0) dtm = dtm + ':';
            if (_this.find('.slide-box.screen').is('div')) { // tv sizes
                if (dtm + _this.find('.slide-box.screen .img .img-text').text() != 'All') checkDtm = 1;
                dtm = dtm + _this.find('.slide-box.screen .img .img-text').text();
            } else if (_this.find('.price-box').is('div')) { // prices
                if (_this.find('.price-box .min-price').text() != '$' + _this.find('.price-range .range-box .min-range').text() || _this.find('.price-box .max-price').text() != '$' + _this.find('.price-range .range-box .max-range').text()) {
                    checkDtm = 1;
                    dtm = dtm + _this.find('.price-range .range-box').text();
                }
            } else { // else
                var n = "";
                _this.find('.checkbox-wrap .checkbox-tile.check').each(function(j) {
                    var _this2 = $(this);
                    if (j == 0) n = n + _this2.find('.option-text').html();
                    else n = n + ',' + _this2.find('.option-text').text();
                });
                if (n != "") checkDtm = 1;
                dtm = dtm + n;
            }
            //alert(checkDtm);
        });
        if (checkDtm == 1) {
            //alert(dtm);
            sendEvent('find-the-right', dtm);
        }

        self._reinit();
    }
    ftr._inputActivation = function(call) {
        var self = this,
            l, c;
        if (call && typeof filters != "undefined" && filters.length >= 0) {
            if (self._defaults.disabledData) {
                filters = self._defaults.disabledData;
                self._defaults.disabledData = null;
            } else {
                var b = self._callAjax(2),
                    $b = $(b);
                $b.filter("script").each(function() {
                    $.globalEval(this.text || this.textContent || this.innerHTML || "");
                });
            }

        } else {
            filters = self._defaults.filters;
        }

        for (var n in filters) {
            var d = filters[n].facetValues;
            for (var i in d) {
                var a = d[i].enable == "Y" ? true : false;

                if (a) {
                    $('*[type="checkbox"][value="' + d[i].facetValueId + '"]').removeAttr("disabled").parents(".checkbox-tile").removeClass("disable");
                } else {
                    $('*[type="checkbox"][value="' + d[i].facetValueId + '"]').attr("disabled", true).parents(".checkbox-tile").addClass("disable");
                }
            }
        }

        self.$stepBox.each(function() {
            //console.log()
            if (!$(this).find(".slide-bar")[0] && $(this).find(".checkbox-tile").length == $(this).find(".checkbox-tile.disable").length) {
                $(this).find('.btn.submit').hide();
                $(this).find('.skip-nav').show();
            };
        })



    }


    ic.jquery.plugin('findTheRightFilter', findTheRightFilter, '.find-the-right');
    return findTheRightFilter;

});
