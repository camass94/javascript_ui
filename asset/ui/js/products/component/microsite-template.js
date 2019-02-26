/* global define */

/**
 * A module representing a Dog.
 * @module common/dog
 * @requires  common/util
 * @requires  common/animal
 */
define(['ic/ic', 'ic/ui/module', 'common/util', 'chosen', 'global-config', 'mkt/product-compare', 'mkt/slider-select', 'products/component/sticky-navigation'], function(ic, Module, util, chosen, globalConfig, cp, sliderSelect, StickyNavigation) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        $document = $(document),
        $window = $(window),
        proto;


    var MicrositeTemplate = function(el, options) {
        var _ = this;

        // Call the parent constructor
        MicrositeTemplate.superclass.constructor.call(_, el, options);

        // selectors
        _.$wrapper = $(el);
        _.$form = _.$wrapper.find('form.model-implementation');
        _.$filter = _.$wrapper.find('.md-model-filter');
        _.$search = _.$wrapper.find('.md-model-search');
        _.$grid = _.$wrapper.find('.product-grid');

        // Default Option
        _.d = {
            formType : 'POST'
            ,formAction : _.$form.attr('action')
            ,filterUrl : _.$form.data('filterUrl')
            ,filterName : _.$form.data('filterName')
            ,filterParents : _.$form.data('filterParents')
            ,category : _.$form.data('category')
            ,compareloc : _.$form.data('compareloc')
            ,activeClass : 'on'
        };

        _.options = $.extend({}, options, _.d, _.$form.data());

        // Event Handlers
        _.filterBVrating();
        _.$form.on('click', 'a[rel="filter:toggle"]', $.proxy(_.filterToggle, _)); // Filter Toggle Button
        _.$form.on('click', 'a[rel="filter:apply"], a[rel="filter:more"]', $.proxy(_.filterApply, _)); // Filter Apply / More Button
        _.$form.on('click', 'a[rel="filter:reset"]', $.proxy(_.filterReset, _)); // Filter Reset Button
        _.$form.on('change', 'select[rel="filter:sort"]', $.proxy(_.filterApply, _)); // Filter Sort Select
        _.$form.on('change mouseleave mouseenter focusin focusout', 'label [type="checkbox"]', $.proxy(_.labelActive, _)); // Lable of Color Swatch in Filter 
        
    };

    util.inherits(MicrositeTemplate, Module);
    proto = MicrositeTemplate.prototype;


    proto.filterBVrating = function(){
        var _ = this;

        _.$BVRatingFlag = _.$form.find("input[name^=BVRatingFlag]");

        // if(_.$BVRatingFlag.length && _.$BVRatingFlag.val() != "" && _.$BVRatingFlag.val() == "Y"){

        //     !_.$form.find('.product-lists').not(".with-carousel").each(setBVRatings);

        // }

    }


    proto.filterToggle = function(event){
        var _ = this;

        event.preventDefault();

        if (_.$filter.css('display') == 'none') {

            if (_.$filter.children().length == 0) {

                $.ajax({
                    url: _.d.filterUrl,
                    data: XSSfilter(_.$form.serialize()),
                    type: _.d.formType,
                    success: function(res) {
                        _.$filter.html(res);
                    },
                    error: function () {
                        return false
                    }
                }).done(function(){

                    ic.jquery.plugin('sliderSelect', sliderSelect, _.$filter.find('.slide-bar'));
                    if (!globalConfig.isMobile) {
                        _.$filter.stop(true).slideDown('fast');
                    } else {
                        ic.jquery.plugin('StickyNavigation', StickyNavigation, _.$filter.find('[data-sticky]'));
                    }
                    // success ->  complete
                    if (globalConfig.isMobile) {
                        $('html, body').stop(true).animate({ scrollTop : _.$form.offset().top + 1 }, 300);
                    }

                })
            } else {

                if (!globalConfig.isMobile) {
                    _.$filter.stop(true).slideDown('fast');
                }
            }

            if (globalConfig.isMobile) {

                _.$filter.show();
                _.$filter.siblings('div').hide();
                _.$filter.closest(".microsite-content").siblings().hide();
                _.$wrapper.siblings().hide();

            } else {

                _.$search.addClass(_.d.activeClass);

            }

        } else {

            if (globalConfig.isMobile) {

                _.$filter.hide();
                _.$filter.siblings('div').show();
                _.$filter.closest(".microsite-content").siblings().show();
                _.$wrapper.siblings().show();

            } else {

                _.$filter.stop(true).slideUp('fast');
                _.$search.removeClass(_.d.activeClass);

            }

            $(event.currentTarget).focus();
        }

        // success ->  complete
        if (globalConfig.isMobile) {
            $('html, body').stop(true).animate({ scrollTop : _.$form.offset().top + 1 }, 300);
        }

    }


    proto.filterApply = function(event){
        var _ = this;
        var formData = _.$form.serialize();
        var flagMore = false;
        var order;

        event.preventDefault();

        if ($(event.currentTarget).attr('rel') == 'filter:more') {

            formData += "&" + $.param({ page : 'all'});
            flagMore = true;

        }

        if ($(event.currentTarget).attr('rel') == 'filter:apply') {

            _.filterToggle(event);

        }

        $.ajax({
            url: _.d.formAction,
            data: XSSfilter(formData),
            type: _.d.formType,
            success: function(res) {

                if (flagMore) {
                    
                    order = _.$grid.find('.product-lists li').length;
                    _.$grid.find('.product-lists').append($(res).find('.product-lists').html());
                    _.$grid.find('.md-model-more').hide();

                } else {
                    
                    _.$grid.html($(res).filter('.product-grid').html());

                } 

                _.$grid.find('img.lazy').lazyload({appear:function() {$(this).attr('style', '').removeClass('lazy');}});

                _.filterBVrating();
                if(_.$BVRatingFlag.length && _.$BVRatingFlag.val() == "Y"){
                    // product list
                    _.$grid.each(setBVRatings);
                }

                if ($('.buynow').length > 0) {runBuyNow();} 
                if (_.d.category != undefined) { micrositeCompare(); };
                    


                $(res).filter("script").each(function () {
                    $.globalEval(this.text || this.textContent || this.innerHTML || "");
                });

                _.filterChange();

            },
            error: function () {
                return false
            }

        }).done(function(){
            // success ->  done
            if (flagMore) {
                _.$grid.find('.product-lists li').eq(order).find('a, input, button, select').first().focus();
            } else {
                _.$grid.find('a, input, button, select').first().focus();
                $('html, body').stop(true).animate({ scrollTop : _.$form.offset().top + 1 }, 300);
            }    
        })

    }


    proto.filterChange = function(){
        var _ = this;

        var filterInfo = window[_.d.filterName];

        if(filterInfo.length > 0) { 
            for (var i in filterInfo) {
                var filterValues = filterInfo[i]["facetValues"];
                for(var j in filterValues) {
                    
                    var _enable = filterValues[j]["enable"];
                    var _value = filterValues[j]["facetValueId"];
                    var _chkfilter = _.$filter.find('*[value="' + _value + '"]');

                    if(_chkfilter.get(0)) {
                        if(!_chkfilter.is(':checked')) {
                            if(_enable == "N") {
                                _chkfilter.prop('disabled', true).css('cursor','default').parent().addClass('disabled');
                            } else {
                                _chkfilter.prop('disabled', false).css('cursor','pointer').parent().removeClass('disabled');
                            }
                        }
                    }
                }
            }
        } else {
            
            _.$form.find('a[rel="filter:reset"]').trigger('click');

        }
    }


    proto.filterReset = function(event){
        var _ = this;

        event.preventDefault();

        _.$filter.find('input').prop('checked', false).prop('disabled', false);
        _.$filter.find('select:not(.sort-select)').prop('selectedIndex', 0);
        _.$filter.find('label').removeClass('active disabled');
        _.$filter.find('.slide-bar').trigger('slideDefault');
        _.$filter.find('.color-tag').hide();

    }


    proto.labelActive = function(event){
        var _ = this;
        var label = $(event.currentTarget).parent('label');
        var swatch = label.closest('.swatch-box');

        if (event.type == 'change') {

            if (label.hasClass('active')) {

                label.removeClass('active');

                if (globalConfig.isMobile) {

                    swatch.find('.color-tag').hide();

                }

            } else {

                label.addClass('active');

                if (globalConfig.isMobile) {

                     swatch.find('.color-tag').text($(event.currentTarget).attr('title')).show();

                }

            }
        }

        if (!globalConfig.isMobile) {

            if (event.type == 'mouseleave') {

                $.each(label.parent().find('input'), function(){

                    $(this).trigger('blur');

                })

            }
        }

        
    }

    proto.callCompare = function(event){
        var _ = this;

        micrositeCompare();
        
    }


    plugin('MicrositeTemplate', MicrositeTemplate, '.m42');

    // setBVRatings
    function setBVRatings(e) {
        if ($('#bvReview')) {
            if (!window.$BV) return false;
            if ($BV) {
                var idx = parseInt($('body').eq(0).attr("data-bv")) + 1;
                $('body').eq(0).attr("data-bv", idx);
                var sctxt = '';
                $(this).find('.slide, li, .recommand-product-info, .current-ratings').each(function() {
                    var obj = $(this).find('.rating, .product-rating, .recommand-product-info');
                    var url = obj.find('a').eq(0).attr('href');
                    var pid = obj.data('modelid');
                    if (!pid) return;
                    obj.removeAttr('itemprop').removeAttr('itemscope').removeAttr('itemtype').attr('id', 'productlist' + idx + '-' + pid).empty();
                    if (sctxt == "") sctxt = sctxt + "'" + pid + "':{url:'" + url + "'}";
                    else sctxt = sctxt + "," + "'" + pid + "':{url:'" + url + "'}";
                });
                // console.log(idx +"///"+sctxt);
                if (sctxt != "") {
                    sctxt = "$BV.ui( 'rr', 'inline_ratings', {productIds : {" + sctxt + "},containerPrefix:'productlist" + idx + "'});";
                    new Function(sctxt)();
                }
            }
        }
    };

    function micrositeCompare(){
        var _ = this;
        var wrapper = $('.m42 .model-implementation');
        var category = new Array();

        $.each(wrapper, function(i){

            if (category.indexOf($(this).data('category')) < 0) {

                category.push($(this).data('category'));

            }

        });

        function onCompareClick(event) {

            var target = $(event.currentTarget);
            var e = target.closest('form').data('category');
            var d = $(this).data("product-id");
            var form = wrapper.filter('[data-category="' + target.closest('form').data('category') +'"]');
            
            if (cp.compare.isin((d), e)) {
                cp.compare.remove((d), e);
                form.find('input.compare[data-product-id="' + d + '"]').prop("checked", false).next().removeClass('hide');
                form.find('input.compare[data-product-id="' + d + '"]').parent().next('.compare_y').addClass('hide');
            } else {
                if (cp.compare.count(e) < 10) {
                    cp.compare.add((d), e);
                    form.find('input.compare[data-product-id="' + d + '"]').parent().next('.compare_y').removeClass('hide');
                } else {
                    //cp.showError("comparelimit")
                }
            }
            updateCompareButton();
        }

        function updateCompareButton() {

            $.each(category, function(i){

                var form = wrapper.filter('[data-category="'+ category[i] +'"]');

                var e = cp.compare.count(category[i]);
            
                form.find('.compare_y em').text(e);

                for (var j = 0; j < cp.compare.get(category[i]).length; j++) {
                    var cid = decodeURIComponent(cp.compare.get(category[i])[j]);
                    var $el = form.find('input.compare[data-product-id="' + cid + '"]');

                    $el.next().addClass('hide');
                    $el.parent().next('.compare_y').removeClass('hide');
                    $el.prop("checked", true);
                    $el.parent().next('.compare_y').find('a').attr('href', form.data('compareloc'));
                }

                if (cp.compare.count(category[i]) >= 10) {
                    form.find("input.compare:not(:checked)").attr("disabled", "disabled");
                } else {
                    form.find("input.compare:not(:checked)").removeAttr("disabled")
                    form.find("input.compare:checked").removeAttr("disabled")
                }

            })
        }

        updateCompareButton();
        wrapper.find('.compare-check input.compare').off('change').on('change', onCompareClick);

    }

    // Microsite Template Page Uses Functions
    function pieceFunc(){
        var _ = this;

        _.d = {
            url : location.href,
            stickyClass : 'sticky',
            activeClass : 'on'
        }

        _.init = function(){
            var _ = this;
            
            _.chosenSelect();
            _.loadFunc();
        }


        // loadFunc : Total Function
        _.loadFunc = function(){
            var _ = this;

            if (globalConfig.isMobile) {

                if ($('.microsite-carousel').size() > 0) {

                    var mcallEvt1 = $.Deferred();
                    var mcallEvt2 = $.Deferred();
                     
                    $.when(mcallEvt1).done(mcallEvt2);
                     
                    mcallEvt1.resolve($('.microsite-carousel').slick());
                    mcallEvt2.resolve($('.microsite-carousel').slick('slickGoTo', $('.microsite-carousel').find('.slick-slide.on').index() - 1));
                }

            }else{
            	/* LGEGMO-3925 20180312 add */            	
            	var $micrositeSlide = $('.microsite-carousel .inner-slide');
            	if( $micrositeSlide.length > 4 ){
	            	$('.microsite-carousel').on('init', function(event, slick) {
	                    slick.$slideTrack.find("a").attr("tabindex", -1);
	                    slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");	                    
	                }).slick({		  
		      	  		dots: false,
		      	  		infinite: true,
		      	  		slidesToShow: 4	      	  		  
	      	  		}).on("afterChange", function(event, slick, currentSlide) {
		      	  		slick.$slideTrack.find("a").attr("tabindex", -1);
		                slick.$slideTrack.find("*[aria-hidden='false']").find("a").removeAttr("tabindex");
	      	        });	            	
            	}            	
            	/* LGEGMO-3925 20180312 add */
            }

        }


        // Chosen Selct (Use: Sort)
        _.chosenSelect = function(){
            var _ = this;

            var sortSelect = $('.sort select');

            if (sortSelect.is('select') && !$('body').hasClass('is-mobile') && sortSelect.length > 0) {
                
                sortSelect.chosen({
                    disable_search: true
                });
            }
        }

        return this;
     
    };

    // This Function Uses in Microsite Template Page
    if ($('.microsite-temp').size() > 0) {
        
        micrositeCompare();
        new pieceFunc().init();

    }

    return MicrositeTemplate;
});