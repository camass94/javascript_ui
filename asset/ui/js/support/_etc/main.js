/**
 * The support etc module.
 * @module support/support.etc
 */

define(['support', 'ic/ic', 'ic/ui/module', 'global-config', 'cs/forms', 'cs/styledform', 'cs/basicmotion', 'cs/videoload', 'cs/tabpanel', 'cs/modallayer', 'cs/rwdImageMaps', 'cs/history', 'support/sticky', 'common/util', 'cs/model-browser'], function(cs, ic, Module, config, Forms, styledForm, basicMotion, videoload, tabpanel, rwdImageMaps, util) {

    // Product-support Accessories pannel
    var assistenciaCarousel = function() {
        if ($('.assistencia-carousel .assistencia-item').length > 0) {
            $('.assistencia-carousel .viewport').slick({
                slidesToShow: 1,
                dots: false,
                infinite: true,
                slidesToScroll: 1,
                adaptiveHeight: true,
                prevArrow: '.assistencia-carousel .prev',
                nextArrow: '.assistencia-carousel .next'
            });
            
        }
    }
    assistenciaCarousel();

    // Software and Firmware top banner
    if (config.isMobile) {
        $('.software-info').slick({
            slidesToShow: 1,
            dots: true,
            infinite: true,
            slidesToScroll: 1,
            adaptiveHeight: true,            
            prevArrow: '.software-carousel .prev',
            nextArrow: '.software-carousel .next'
        });

        var accessoriesCheck = true;

        $('.guide-title a').on('click', function(e) {
            e.preventDefault();
            if ($(this).hasClass('on') && $(this).parent().next().find('.accessories-carousel-wrap').size() > 0 && accessoriesCheck) {
                accessoriesCheck = false;
            }
        });
        /* LGECS-1109 : 201700703 add */
        $(".software-carousel, .assistencia-carousel").find(".prev, .next").hide();
        /*//LGECS-1109 : 201700703 add */
        
        /* LGEAE-1367 20170828 add, LGESA-266 20171013 modify */
        if ($('.video-tutorials-style').length > 0){
        	$('.slide-list').slick({		  
          	  dots: true,
          	  speed: 300,
          	  slidesToShow: 1,
          	  slidesToScroll: 1,
      		  touchMove : true
      		});
        }        
        /*// LGEAE-1367 20170828 add, LGESA-266 20171013 modify */
    }else{
    	/* LGEAE-1367 20170828 add, LGESA-266 20171013 modify */
    	if ($('.video-tutorials-style').length > 0){
	        $('.slide-list').slick({		  
	  		  dots: false,
	  		  infinite: false,
	  		  speed: 300,
	  		  slidesToShow: 4,
	  		  slidesToScroll: 1,
	  		  centerMode: false,
	  		  variableWidth: false,
	  		  vertical: true,
	  		  arrows: true
	  		});
    	}
        /*// LGEAE-1367 20170828 add, LGESA-266 20171013 modify */
    }  
    // Accordion adds Class of 'on';
    toggleAccordion = function(e) {
        var _self = $(e.self);
        var _target = $(e.target);
        var _parent = _self.parent('li');

        _self.hasClass('active') ? _parent.addClass('on') : _parent.removeClass('on');
    }

    //img map
    if ($('img[usemap]').size() > 0) {
        $('img[usemap]').rwdImageMaps();
    }

    $(document).on("click change chosen:updated.chosen", "[rel|='history.push']", function(e) {

        // e.preventDefault();
        var tag = e.currentTarget.tagName;
        switch (tag) {
            case "INPUT":
                if ((this.type == "checkbox" || this.type == "radio") && this.checked && e.type == "change") {
                    // console.log("input");
                    historyPush(e, tag, e.currentTarget)
                }
                break;
            case "SELECT":
                // console.log("select");
                if (e.type == "change") historyPush(e, tag, e.currentTarget)
                break;
            case "A":
                // console.log("a");
                historyPush(e, tag, e.currentTarget)
                break;
            default:
            // console.log("default");
        }

    })

    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    function getUrlVars() {
        var vars = [],
            hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    function historyPush(e, tag, elm) {

        var $form = $(elm).closest("form");
        var isResult = false;
        if (!$form.length) {
            $form = $(".support-content form:eq(0)");
            isResult = true;
        }

        function searchformSubmit() {
            var pr = $form.serializeObject();
            //pr["search"] = getUrlVars()["search"].split("#")[0];
            // if ($("#sortby").length) {
            // $("#sortby").trigger("change");
            // } else {

            //var test = [];
            //0318
            if($(".re-search").size()>0){
                pr['search'] = $(".hidden-search").val();
            }
            History.pushState(pr, document.title, location.href.split("?")[0] + "?" + $.param(pr, true));
            //console.log(location.href.split("?")[0] + "?" + $.param(pr, true))

            $(".tab-section[data-tab-target-parent], .guide-area[data-tab-target-parent], .search-result-wrap[data-tab-target-parent]").each(function() {

                // if ($(this).data('tabMenu')) {
                //     $($(this).data('tabMenu')).find('[data-tab]').each(function() {
                //         test.push('#' + $(this).data('tab'));
                //     })
                // } else {
                //         test.push('#' + $(this).data('activeTab'));
                // }
                var $this = $(this);


                if (config.isMobile && $(this).children(".guide-area").length > 1) {

                    $this.children(".guide-area").each(function() {
                        var $anc = $("h2 > a", this);
                        if ($anc.length) {
                            var url = $anc.data("href").split("?")[0] + "?" + $.param(pr, true) + "&list=" + $anc.data("tab").substr(0, 5) + (config.isMobile ? "&symptom=" + encodeURIComponent($(".topic-accordion li.active a").data("value")) : "");
                            $anc.data("href", url);
                            $this.tabpanel('_ajaxLoad', $anc.data("tab"), url);
                            // .filter(".on").removeClass("on").trigger("click");
                        }
                    })
                } else {

                    var tab = $this.data("activeTab");
                    var url = $this.find("[data-tab='" + tab + "']").data("href");
                    if (!url) url = $("#" + tab).data("url");

                    if ($(this).is(".tab-section[data-tab-target-parent]")) {

                        $(this).find("li a[data-tab]").each(function() {
                            var tab = $(this).data("tab");
                            var url = $(this).data("href").split("?")[0] + "?" + $.param(pr, true) + "&list=" + tab.substr(0, 5) + (config.isMobile ? "&symptom=" + encodeURIComponent($(".topic-accordion li.active a").data("value")) : "");
                            $(this).data("href", url);
                            $this.tabpanel('_ajaxLoad', tab, url);

                        })

                    } else {

                        var url = $("#" + tab).data("url").split("?")[0] + "?" + $.param(pr, true) + "&list=" + tab.substr(0, 5) + (config.isMobile ? "&symptom=" + encodeURIComponent($(".topic-accordion li.active a").data("value")) : "");
                        $this.tabpanel('_ajaxLoad', tab, url);

                    }
                }

            })

            // }
        }

        var submitInterval;

        if (tag == "INPUT") {
            var $tabEl = $(elm).closest("[data-url][data-reloc]")

            if (elm.name == "symptom") {

                var $topicEl = $(elm).closest("div.topic");
                var $subTopicEl = $topicEl.next("div.sub-topic");
                var pr = $form.serializeObject();
                //0318
                if($(".re-search").size()>0){
                    pr['search'] = $(".hidden-search").val();
                }

                if ($topicEl.data("url")) {
                    $.ajax({
                        url: $topicEl.data("url"),
                        data: $.param(pr, true),
                        success: function(data) {

                            History.pushState(pr, document.title, location.href.split("?")[0] + "?" + $.param(pr, true));

                            var html = "";
                            if (_.size(data)) {
                                var cnt = 0;
                                html += "<ul class='styled-form'>\n";
                                for (var opt in data) {
                                    cnt++;
                                    html += '<li><input type="radio" name="subsymptom" value="' + opt + '" id="subTopic' + cnt + '" rel="history.push" /><label for="subTopic' + cnt + '">' + data[opt] + '</label></li>\n';
                                }
                                html += "</ul>"
                            }
                            $subTopicEl.html(html);
                            styledForm($subTopicEl);
                            clearInterval(submitInterval);
                            submitInterval = setTimeout(searchformSubmit, 200);
                        }
                    })
                }

            } else if (elm.name == "subsymptom") {

                if (config.isMobile) {

                    // e.preventDefault()
                    // e.stopPropagation();
                    // e.cancelBubble = true;
                    // console.log(e.type, e.target, e)
                    clearInterval(submitInterval);
                    submitInterval = setTimeout(searchformSubmit, 200);

                } else {

                    clearInterval(submitInterval);
                    submitInterval = setTimeout(searchformSubmit, 200);

                }


            } else if ($(elm).data("filter")) {

                var $list = $($(elm).data("filter")).children();
                var value = $(elm).val();

                if (value == "all") {
                    $list.show();
                } else {
                    $list.hide().filter("." + value).show();
                }

            } else {
                var $reloc = $(elm).closest("[data-url][data-reloc]");
                var tabid = $reloc.data('reloc');
                var url = $reloc.data("url");

                if ($reloc.length) {

                    var pr = $form.serializeObject();
                    //0318
                    if($(".re-search").size()>0){
                        pr['search'] = $(".hidden-search").val();
                    }

                    if ($tabEl.length) {
                        var addPr = "&" + elm.name + "=" + elm.value + "&" + (url.split("?")[1] || '');
                    } else {
                        var addPr = "&sort=" + elm.value + "&list=" + tabid.substr(0, 5);
                    }

                    $.ajax({
                        url: url.split("?")[0],
                        data: $.param(pr) + addPr,
                        success: function(data) {
                            $(tabid).html(data);
                            styledForm($(tabid));
                            if ($(tabid).find('.selectbox').length > 0) $('.selectbox').chosen();
                        }
                    })

                }
            }

        } else if (tag == "SELECT") {

            var $tabEl = $(elm).closest("[data-url][data-reloc]")
            if ($tabEl.length) {
                var tabid = $tabEl.data("reloc").replace("#", "");
                var url = $tabEl.data("url");
            } else {
                var $tabPanel = $(elm).closest(".search-list-wrap").prev("[data-tab-target-parent]");
                if (!$tabPanel.length) $tabPanel = $(elm).closest("[data-tab-target-parent]");
                var tabid = $(elm).data("tab");
                if (!tabid && $tabPanel.data("activeTab")) tabid = $tabPanel.data("activeTab");
                var url = $tabPanel.parent().find("[data-tab='" + tabid + "']").data("href");
                if (!url) {
                    if ($(elm).attr("id") == "sortby" || $(elm).attr("id") == "question") {
                        url = $tabPanel.parent().find("#" + tabid).data("url");
                    }
                }
            }

            var pr = $form.serializeObject();
            //0318
            if($(".re-search").size()>0){
                pr['search'] = $(".hidden-search").val();
            }
            //pr["search"] = getUrlVars()["search"].split("#")[0];

            if ($tabEl.length) {
                var addPr = "&" + elm.name + "=" + elm.value + "&" + (url.split("?")[1] || '');
            } else {
                var addPr = "&sort=" + elm.value + "&list=" + tabid.substr(0, 5) + (config.isMobile ? "&symptom=" + encodeURIComponent($(".topic-accordion li.active a").data("value")) : "");
            }

            $.ajax({
                url: url.split("?")[0],
                data: $.param(pr) + addPr,
                success: function(data) {

                    if (elm.id == "sortby") {
                        pr['sort'] = elm.value
                        History.pushState(pr, document.title, location.href.split("?")[0] + "?" + $.param(pr, true));
                    }

                    if ($tabEl.length) {
                        if ($("#" + tabid).length) {
                            $("#" + tabid).html(data);
                            if ($("#" + tabid).find('.selectbox').length > 0) $('.selectbox').chosen();
                            ic.jquery.plugin('basicMotion', basicMotion, $('[data-event]', $("#" + tabid)));
                        } else {
                            $tabEl.html(data);
                            if ($tabEl.find('.selectbox').length > 0) $('.selectbox').chosen();
                            ic.jquery.plugin('basicMotion', basicMotion, $('[data-event]', $tabEl));
                        }
                    } else {
                        $("#" + tabid).html(data);
                        if ($('#' + tabid).find('.selectbox').length > 0) $('.selectbox').chosen();
                        ic.jquery.plugin('basicMotion', basicMotion, $('[data-event]', $("#" + tabid)));
                    }
                }
            })
            // $tabPanel.tabpanel()._ajaxLoad(tabid,)
        } else
        if (tag == "A") {

            var $el = $(elm);
            var $tp = $el.closest(".topic-accordion");

            if ($el.closest(".pagination")) {
                var _link = $el.data("href");
                var _search = (_link + "?").split("?")[1];
                var _param = _search ? JSON.parse('{"' + _search.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
                    function(key, value) {
                        return key === "" ? value : decodeURIComponent(value)
                    }) : {}
                var pr = $form.serializeObject();
                //0318
                if($(".re-search").size()>0){
                    pr['search'] = $(".hidden-search").val();
                }

                pr['sort'] = $("select[rel='history.push']").val();
                pr['currentPage'] = _param['currentPage'];
                History.pushState(pr, document.title, location.href.split("?")[0] + "?" + $.param(pr, true));
            }

            if ($tp.length) {

                e.preventDefault();

                var $topicEl = $(elm).closest("li");
                var $subTopicEl = $el.next("ul.sub-topic");

                if (!$topicEl.hasClass("active")) {

                    $topicEl.siblings().each(function() {
                        if ($(this).find('a').data('value') != "") {
                            $(this).find("ul.sub-topic").slideUp(150, function() {
                                $(this).empty().parent("li").removeClass("active");
                            })
                        } else {
                            $(this).removeClass("active");
                        }
                    })

                    var pr = $form.serializeObject();
                    //0318
                    if($(".re-search").size()>0){
                        pr['search'] = $(".hidden-search").val();
                    }
                    //pr["search"] = getUrlVars()["search"].split("#")[0];
                    pr["subsymptom"] = "";

                    if ($tp.data("url") && $el.data("value") != "") {
                        $.ajax({
                            url: $tp.data("url"),
                            data: $.param(pr, true) + "&symptom=" + encodeURIComponent($("a", $topicEl).data("value")),
                            success: function(data) {
                                var html = "";
                                if (_.size(data)) {
                                    var cnt = 0;
                                    html += '<li><input type="radio" name="subsymptom" value="" id="subTopic0" rel="history.push" checked /><label for="subTopic0">' + $tp.data("allText") + "</label></li>\n";
                                    for (var opt in data) {
                                        cnt++;
                                        html += '<li><input type="radio" name="subsymptom" value="' + opt + '" id="subTopic' + cnt + '" rel="history.push" /><label for="subTopic' + cnt + '">' + data[opt] + '</label></li>\n';
                                    }
                                }

                                $subTopicEl.html(html);
                                $subTopicEl.addClass("styled-form");
                                styledForm($subTopicEl.parent());
                                $topicEl.addClass("active")
                                $subTopicEl.slideDown(function() {
                                    clearInterval(submitInterval);
                                    submitInterval = setTimeout(searchformSubmit, 100);
                                });

                            }
                        })
                    } else {
                        $topicEl.addClass("active")
                        clearInterval(submitInterval);
                        submitInterval = setTimeout(searchformSubmit, 100);
                    }

                }

            }
        }

        var param = $form.serialize();
        // console.log(param)

    }

    $(function() {
        if ($(".software-accordion .accordion li.item").length == 1) {
            $(".software-accordion .accordion li.item").eq(0).addClass("on");
            $(".software-accordion .accordion li.item").eq(0).find("> a").addClass("active");
            $(".software-accordion .accordion li.item").eq(0).find("> .accordion-box").slideDown();
        }

        if ($(".wrapper").data("related")) {
            var related_val = $(".wrapper").data("related").split(",");
            for (i = 0; i < related_val.length; i++) {
                $(".related-box").eq(related_val[i]).show();
            }
        }

        if ($(".coleta-box").length > 0) {
            $("#estados").on("change", function() {
                select_val = $(this).find("option:selected").val();
                if (select_val != "") {
                    select_text = $(this).find("option:selected").text();
                    $(".coleta-area").show();
                    $(".coleta-area").find("strong").text(select_text);
                    $(".coleta-area-list").hide();
                    $("#" + select_val).show();
                } else {
                    $(".coleta-area").hide();
                    $(".coleta-area-list").hide();
                }
            });
        }

    })

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        $document = $(document),
        $window = $(window),
        proto


    //yanbao
    (function() {
        if (!$("#yanbao-search").length) return;
        var
            $resList = $(".results-list"),
            $resDefault = $(".results-default"),
            $resNodata = $(".results-nodata"),
            $dataField = {
                contractNumber: $(".contract-number"),
                customerName: $(".customer-name"),
                modelNumber: $(".model-number"),
                startDay: $(".start-day"),
                endDay: $(".end-day")
            };
        $('#form-yanbao-search').on('form:ajax:success', function(e, context, res) {
            var isItem = false;
            for (s in $dataField) {
                var item = $.trim(res[s]);
                if (item) isItem = true;
                $dataField[s].text(item);
            }
            if (isItem) {
                $resNodata.hide();
                $resDefault.hide();
                $resList.show();
            } else {
                $resNodata.show();
                $resDefault.hide();
                $resList.hide();
            }
        });
    })();
    var product_select_scrollTop = function() {
        if (!$('body').is(".is-mobile")) {
            if ($(".search-wrap").size() > 0) {
                var searchAfter = $(".match").size();
                var selectTop = $(".search-wrap").position().top;
                if (searchAfter > 0) {
                    $("body, html").stop().animate({
                        scrollTop: selectTop - 30
                    }, '500');
                }
            }
        }
    }

    var tab_full_width = function(){
        if (!$('body').is(".is-mobile")) {
            if ($(".tab-full-width").size() > 0) {
                var $el = $('.tab-full-width');
                var $el_li = $el.find('li');
                var elCnt = $el_li.size();
                $el_li.addClass('col-'+ elCnt);
                $el_li.find('a').css('min-width', '100%');
            }
        }   
    }


    $(window).load(function() {
        product_select_scrollTop();
        tab_full_width();   
    })

    //Manuals
    var manualItems = (function () {
        if($("body").hasClass("is-mobile")) return;
        var $tooltip, $tooltipArrow, $tooltipContent, $tooltipClose;
        var init = function () {
            drawTooltip();
        }
        var viewCount = function (el, max, type) {
            var $el = $(el);
            var items = $el.text().split(',');
            var itemsView = [];
            var count = items.length;
            for (var i = 0; i < max; i++) {
                itemsView[i] = items[i];
            }
            $el.before('<span class="view">' + itemsView.join(', ') + '</span>');
            if (count > max) {
                $el.after(' <a href="#" class="red">more + ' + (count - max) + '</a>')
                $el.siblings(".red").bind("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $tooltip.removeAttr('type');
                    if(type === "os"){
                        var content = '';
                        for(var s in items){
                            if(/window/.test(items[s].toLowerCase())){
                                content+='<i class="type"><img src="/lg4-common-gp/img/support/img-manual-win.png" alt="Windows" /></i> '+items[s]+'<br>';
                            }else{
                                content+='<i class="type"><img src="/lg4-common-gp/img/support/img-manual-mac.png" alt="Mac" /></i> '+items[s]+'<br>';
                            }
                        }
                        $tooltip.attr('type','os');
                        $tooltipContent.html(content);
                    }else{
                        $tooltipContent.html(items.join(','));
                    }
                    showTooltip(this, $tooltip, $tooltipArrow);
                });
                $tooltipClose.bind("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    hideTooltip();
                });
            }
        }

        var drawTooltip = function () {
            var html = '';
            html += '<div class="manual-tooltip">';
            html += '   <div class="manual-tooltip-inner">';
            html += '       <div class="manual-tooltip-content"></div>';
            html += '       <button class="tooltip-close"><i class="icon icon-close"></i></button>';
            html += '       <span class="tooltip-arrow"></span>';
            html += '   </div>';
            html += '</div>';
            $("body").append(html);
            $tooltip = $('.manual-tooltip');
            $tooltipArrow = $('.manual-tooltip .tooltip-arrow');
            $tooltipContent = $('.manual-tooltip-content');
            $tooltipClose = $('.tooltip-close');
        }

        var setPosition = function (target, tooltip, arrow) {
            var _target = $(target);
            var _tip = $(tooltip);
            var _arrow = $(arrow);
            var _pTop = _target.offset().top;
            var _pHeight = (_target.outerHeight(true) + _tip.outerHeight(true)) - 22;
            var _minus = 125;
            var _pleft = (_target.offset().left - _minus) + _target.outerWidth(true) / 2;
            var _pRight = "auto";
            var _arrowLeft = _target.offset().left / 2;
            var _arrowRight = ($(window).width() - (_target.offset().left + _target.outerWidth()));

            if (_pleft < 0) {
                _pleft = _target.offset().left;
                _arrowRight = "auto";
                _tip.removeClass("position-right").addClass("position-left");

                if (_arrowLeft <= 20) {
                    _arrowLeft = 30;
                }
            } else if (_pleft > $(window).width() - _tip.width()) {
                _pleft = "auto";
                _pRight = 20 + "px";
                _arrowLeft = "auto";
                _tip.removeClass("position-left").addClass("position-right");
                if (_arrowRight <= 20) {
                    _arrowRight = 30;
                }
            } else {
                _tip.removeClass("position-left position-right");
                _arrowLeft = "50%";
                _arrowRight = "auto";
            }

            _tip.css({
                "top": (_pTop - _pHeight),
                "left": _pleft,
                "right": _pRight
            })

            _arrow.css({
                "left": _arrowLeft,
                "right": _arrowRight
            })

            if ($(tooltip).offset().top < $(window).scrollTop()) {
                var offsetTop = $(tooltip).offset().top - 20;
                _tip.addClass("position-top").css({
                    "top": (_pTop + _target.outerHeight(true) + 20) + "px",
                    "left": _pleft,
                    "right": _pRight
                })

            } else {
                _tip.removeClass("position-top");
            }
        }

        var showTooltip = function (target, tooltip, arrow) {
            setPosition(target, tooltip, arrow);
            $tooltip.show();
        }

        var hideTooltip = function () {
            $tooltip.hide();
            $tooltip.removeAttr('type');
        }

        return {
            init: init,
            viewCount: viewCount
        }
    })();
    $(function () {
        if($(".manuals-table").length && !$("body").hasClass("is-mobile")){
            manualItems.init();
            $(".manuals-table .language .total").each(function () {
                manualItems.viewCount(this, 2, ",");
            });
            $(".manuals-table .os .total").each(function () {
                manualItems.viewCount(this, 1, "os");
            });
        }
    });

   $(".browser-product form").on("modelBrowser:selectedModel.select modelBrowser:selectedModel.search modelBrowser:deselectModel.select modelBrowser:deselectModel.search",function(e){
        e.currentTarget.submit(); // LGEGMO-1839
   })

   ;(function($) { 




   })(jQuery);

   /* LGECS-872 */
   var tabCarousel = function(){
        var tabSlider = $('.tab-carousel .carousel');
        if(tabSlider.length > 0) {
            var tabSliderNum = tabSlider.data('slick')['slidesToShow'];
            var tabSliderTotal = tabSlider.find('> div').length;
            
            if (tabSliderNum == 1) {
                tabSliderNum = 2;
            }

            tabSliderNum >= tabSliderTotal ? tabSlider.addClass('no-controll') : tabSlider.removeClass('no-controll');
                
            $('.tab-carousel .carousel').slick({
                infinite: false,
                speed: 300,
                slidesToShow : tabSliderNum,
                slidesToScroll: 5
            });
        }
    }();
    /* LGECS-872 */

    return {};
});
