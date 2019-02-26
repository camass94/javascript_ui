require(['ic/ic', 'ic/ui/module', 'global-config', 'jquery', 'jqueryui', 'jquery.cookie', 'chosen', 'lazyload', 'common/dtm','common/smartworld','react-dotdotdot'], function(ic, Module, globalConfig, $, jqueryui, cookie, chosen, lazyload, dtm,smartworld) { //LGEGMO-3850 : 20180306 modify // theJ
    'use strict';
    var filterInfo = new Array();
    var redot,redotFlag;
	var isMobile = $('body').hasClass("is-mobile");
    /*LGECI-2710 : 20161214 add */
    var _BVRatingFlag = $("body").find("input[name=BVRatingFlag]");
    var setBVRatings = function(e) {
        if ($('#bvReview')) {
            if (!window.$BV) return false;
            if ($BV) {
                var idx = parseInt($('body').eq(0).attr("data-bv")) + 1;
                $('body').eq(0).attr("data-bv", idx);
                var sctxt = '';
                $(this).find('.slide, li, .recommand-product-info').each(function() {
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
    /*LGEGMO-3850 : 20180306 add */    
    var redot = function(redotFlag){  	
        if($(".redot").length > 0){
        	if(redotFlag == undefined && redotFlag == null){
        		$(".redot").each(function() {
            		var self= $(this), _tipTitle;
            		var _tipTitle = self.attr("tootip-title");
            		if(redotFlag != "Y" && self.find('.js-tooltip-mnum-wrap').size() == "0"){
            			var orgText = self.text().trim();
            		} else {
            			var orgText = self.find(".js-tooltip-mnum-wrap").text().trim();
            		}
            		if(self.parents("section").hasClass("compare-view-item")){
            			self.dotdotdot({
                        	ellipsis: "\u2026\u2000",
                            watch: "window",
                            callback :  function() {
                            	if(redotFlag != "Y"){
                            		
                            		$(this).append('<a href="#info" class="info"><i class="icon icon-point"><span class="invisible">'+ _tipTitle +'</span></i></a>');
                            		modelTooltip(orgText, self);
                            		
                            		if(!$(this).hasClass("is-truncated")){
                            			$(this).find(".info").remove();
                            		}
                            	}
                            }
                        });
            			if(!self.hasClass("is-truncated")){
            				self.find(".info").remove();
                		}
            		} else {
            			self.dotdotdot({
                            watch: "window",
                        });
            		}
                });
        	}
        	
        }
        function modelTooltip (orgText, self){
        	var tooltipmnum = $(".tooltipmnum-wrap"),
        		tooltipMnumWrap = null,
        		_tipNum = self.find(".js-tooltip-mnum-wrap").attr("tooltip-num");
        	
            if(self.find('.js-tooltip-mnum-wrap').size() == 0) {
            	if(self.hasClass("is-truncated") == true){
            		$(".redot.is-truncated").each(function(i) {
            			$(this).attr("tooltip-num", i);
            			$(this).find(".info").attr("tooltip-num", i);
            			if($(this).find(".js-tooltip-mnum-wrap").length == 0){
            				$(this).find(".info").after('<div class="js-tooltip-mnum-wrap" tooltip-num="'+ i +'">'+ orgText +'</div>');
            				$(this).find(".js-tooltip-mnum-wrap").append('<span class="before"></span><span class="after"></span><a href="#" class="btn-close"><i class="icon icon-close"></i><span class="hidden">'+ commonMsg.common.close +'</span></a>');
                       }
        			});
            		
            		tooltipMnumWrap = $('.js-tooltip-mnum-wrap');
            	}
            }
            
        }
        
        
        function modelTooltipOpen (self, orgText, _tipNum){
            var _target = self.parent();
            var _sticky = _target.parents(".compare-view-item").hasClass("sticky");
           		
    		var $tipClone = _target.find(".js-tooltip-mnum-wrap").clone();
            var _width = isMobile ? "90%" : $(".show-item").width();
            var _top = isMobile ? (self.offset().top- $(document).scrollTop()) + 30: (self.offset().top- $(document).scrollTop()) + 33;
            
            var _left = isMobile ? (self.offset().left + _width)> $(window).width() ? _target.offset().left - _width/2 : 0 : _target.offset().left - _width/2;
            var _arrowleft = !isMobile ? (self.offset().left - _left) + self.width()/2 : (self.offset().left - _left) + self.width()/2 - 20;
            
            if($("body").find(".js-tooltip-mnum-wrap.clone").size() > 0){
            	$("body").find(".js-tooltip-mnum-wrap.clone").remove();
            }
            
            $("body").append($tipClone.addClass("clone"));
            
            $(".js-tooltip-mnum-wrap.clone").css({
                'left': _left,
                'top': _top,
                'width':_width,
                'display' :'block'
           }).addClass("active").find(".before, .after").css({
               'left': _arrowleft
           });
            
            if(!_sticky){
            	var _top = (self.offset().top - $(document).scrollTop()) - ($tipClone.outerHeight(true) + 10);
            	$tipClone.addClass("top").css({'top': _top});
            	
            	if(!isMobile){
            		var _left =  _target.offset().left -30;
                    var _arrowleft = (self.offset().left - _left) + self.width()/2;
            		
                    $tipClone.css({
                        'left': _left,
                   }).find(".before, .after").css({
                       'left': _arrowleft
                   });
            		
            	}
            }
        }
        
        function modelTooltipClose (self, _tipNum){
        	$("body").find(".js-tooltip-mnum-wrap").removeClass("active").removeClass("top").css({'display' :'none'});
        	$(".js-tooltip-mnum-wrap.clone").remove();
        }
        
        $(document).on({
        	mouseenter: function (e) {
        		e.preventDefault();
	        	if(!isMobile) {
		        	var _tipNum = $(this).attr("tooltip-num");
		        	modelTooltipOpen($(this), _tipNum);
	        	}
            },
            click: function (e) {
            	e.preventDefault();
	        	if(isMobile) {
		        	var _tipNum = $(this).attr("tooltip-num");
		        	modelTooltipOpen($(this), _tipNum);
	        	}
            },
            focus: function (e) {
            	e.preventDefault();
	        	if(!isMobile) {
		        	var _tipNum = $(this).attr("tooltip-num");
		        	modelTooltipOpen($(this), _tipNum);
	        	}
            },
            focusout: function (e) {
            	e.preventDefault();
	        	if(!isMobile) {
	        		var _tipNum = $(this).attr("tooltip-num");
	            	modelTooltipClose($(this), _tipNum);
	        	} else {
	                $(".js-tooltip-mnum-wrap.clone .btn-close").trigger("click");
	            }
            },
            mouseleave: function (e) {
            	e.preventDefault();        	
	        	if(!isMobile) {
	        		var _tipNum = $(this).attr("tooltip-num");
	            	modelTooltipClose($(this), _tipNum);
	        	} else {
	                $(".js-tooltip-mnum-wrap.clone .btn-close").trigger("click");
	            }
            },
        }, '.redot.is-truncated .info');
        /*$('.compare-item .redot.is-truncated').find(".info").on({
	        "mouseenter": function(e) {
	        	e.preventDefault();
	        	if(!isMobile) {
		        	var _tipNum = $(this).attr("tooltip-num");
		        	modelTooltipOpen($(this), _tipNum);
	        	}
	        },
	        "click": function(e) {
	        	e.preventDefault();
	        	if(isMobile) {
		        	var _tipNum = $(this).attr("tooltip-num");
		        	modelTooltipOpen($(this), _tipNum);
	        	}
	        },
	        "focus": function(e) {
	        	e.preventDefault();
	        	if(!isMobile) {
		        	var _tipNum = $(this).attr("tooltip-num");
		        	modelTooltipOpen($(this), _tipNum);
	        	}
	        },
	        "focusout": function(e) {
	        	e.preventDefault();
	        	if(!isMobile) {
	        		var _tipNum = $(this).attr("tooltip-num");
	            	modelTooltipClose($(this), _tipNum);
	        	} else {
	                $(".js-tooltip-mnum-wrap.clone .btn-close").trigger("click");
	            }
	    	},
	        "mouseleave": function(e) {
	        	e.preventDefault();        	
	        	if(!isMobile) {
	        		var _tipNum = $(this).attr("tooltip-num");
	            	modelTooltipClose($(this), _tipNum);
	        	} else {
	                $(".js-tooltip-mnum-wrap.clone .btn-close").trigger("click");
	            }
	        }
        });*/
        
        $(document).on('click', '.js-tooltip-mnum-wrap .btn-close', function(e) {
        	var _tipNum = $(this).attr("tooltip-num");
        	modelTooltipClose($(this), _tipNum);
        	return false;
        });
        
        $(window).scroll(function(e) {
        	$('.js-tooltip-mnum-wrap.clone .btn-close').trigger('click');
        	
        });
    }
    
    $(window).resize(function(){
    	var redotFlag = "Y";
    	if(!isMobile){
    		redot(redotFlag);
    	}
    	
    });
    /*//LGEGMO-3850 : 20180306 add */
    /*//LGECI-2710 : 20161214 add */
    (function($) {
        var lgFilter = {
                locale: $("html").data("countrycode"),
                compareLoc: $("html").data("compareloc"),
                compareCategory: ($("html").data("compare-category")),
                clearFilterCookie: false,
                msgs: {},
                onCompareClick: function() {
                    var e = lgFilter.compare.pageCategory();
                    var d = $(this).data("product-id");

                    if (lgFilter.compare.isin((d), e)) {
                        lgFilter.compare.remove((d), e);
                        $('input.compare[data-product-id="' + d + '"]').prop("checked", false).next().removeClass('hide');
                        $('input.compare[data-product-id="' + d + '"]').parent().next('.compare_y').addClass('hide');
                    } else {
                        if (lgFilter.compare.count(e) < 10) {
                            lgFilter.compare.add((d), e);

                            $('input.compare[data-product-id="' + d + '"]').parent().next('.compare_y').removeClass('hide');
                        } else {
                            //lgFilter.showError("comparelimit")
                        }
                    }
                    lgFilter.updateCompareButton();
                },
                updateCompareButton: function(d) {
                    var e = lgFilter.compare.count(lgFilter.compare.pageCategory());
                    $(".compare-state").off("click").on("click", function(b) {
                        b.preventDefault();
                        if (lgFilter.compare.get(lgFilter.compareCategory).length) {
                            window.location = lgFilter.compareLoc
                        }
                    }).find("span").text(e);

                    $(".compare-clear").off("click").on("click", function(b) {
                        b.preventDefault();

                        var e = lgFilter.compare.pageCategory();
                        var copyArr = JSON.parse(JSON.stringify(lgFilter.compare.get(lgFilter.compareCategory)));

                        for (var i = 0; i < copyArr.length; i++) {
                            var cid = decodeURIComponent(copyArr[i]);
                            var $el = $('input.compare[data-product-id="' + cid + '"]');

                            if (!$el.length) {
                                lgFilter.compare.remove((cid), e);
                            } else {
                                $el.trigger('change');
                            }
                        }
                        lgFilter.updateCompareButton();
                    })


                    if (lgFilter.compare.get(lgFilter.compareCategory).length) {
                        $('.product-grid-header .compare-clear').removeClass('hide');
                    } else {
                        $('.product-grid-header .compare-clear').addClass('hide');
                    }

                    $('.compare_y em').text(e);
                    $('.product-grid-header .compare-state span').text("(" + e + ")");


                    $('input.compare').prop("checked", false);

                    for (var i = 0; i < lgFilter.compare.get(lgFilter.compareCategory).length; i++) {
                        /* 140429 modify */
                        var cid = decodeURIComponent(lgFilter.compare.get(lgFilter.compareCategory)[i]);
                        var $el = $('input.compare[data-product-id="' + cid + '"]');
                        var $compareEl = $('a.remove-btn[data-product-id="' + cid + '"]');
                        if ($el.parents(".compare-check").hasClass("no-cookies") == false) {
                            $el.next().addClass('hide');
                            $el.parent().next('.compare_y').removeClass('hide');
                            $el.prop("checked", true);
                            $compareEl.show().prev().hide();
                            $compareEl.addClass('onItem');
                            $el.parent().next('.compare_y').find('a').attr('href', lgFilter.compareLoc);
                        } else {
                            e = 0;
                            $('.product-grid-header .compare-clear').addClass('hide');
                            $('.compare_y em').text(e);
                            $('.product-grid-header .compare-state span').text("(" + e + ")");
                        }
                    }

                    if (lgFilter.compare.count(lgFilter.compareCategory) >= 10) {
                        $("input.compare:not(:checked)").attr("disabled", "disabled");
                    } else {
                        $("input.compare:not(:checked)").removeAttr("disabled")
                        $("input.compare:checked").removeAttr("disabled")
                    }
                },
                compare: {
                    CARTS: "LG4_COMPARE_CART",
                    pageCategory: function() {
                        return lgFilter.compareCategory
                    },
                    get: function(e) {
                        var g = this._cObjGet()[e];
                        if (!g) {
                            g = []
                        } else {
                            var f = g.length;
                            while (f--) {
                                if (g[f] == "") {
                                    g.splice(f, 1)
                                }
                            }
                        }
                        return g
                    },
                    add: function(j, k, g) {
                        var h = this.get(k);
                        if (g == null) {
                            h.unshift(j)
                        } else {
                            h.splice($.inArray(g, h), 1, j)
                        }
                        var f = this._cObjGet();
                        f[k] = h;
                        this._cObjSet(f)
                    },
                    remove: function(h, j) {
                        var k = this._cObjGet();
                        var g = this.get(j);
                        var l = g.length;
                        while (l--) {
                            if (g[l] == h) {
                                g.splice(l, 1)
                            }
                        }
                        k[j] = g;
                        this._cObjSet(k)
                    },
                    isin: function(h, j) {
                        var k = this._cObjGet();
                        var g = this.get(j);
                        var l = g.length;
                        while (l--) {
                            if (g[l] == h) {
                                return true
                            }
                        }
                        return false
                    },
                    empty: function(d) {
                        var e = this._cObjGet();
                        delete e[d];
                        this._cObjSet(e)
                    },
                    count: function(c) {
                        return this.get(c).length
                    },
                    view_add: function(e) {
                        var g = this._cArrGetViews();
                        var f = g.length;
                        while (f--) {
                            if (g[f] == e) {
                                g.splice(f, 1)
                            }
                        }
                        g.unshift(e);
                        while (g.join(",").length > 1024) {
                            g.pop()
                        }
                        this._cArrSetViews(g)
                    },
                    view_remove: function(e) {
                        var g = this._cArrGetViews();
                        var f = g.length;
                        while (f--) {
                            if (g[f] == e) {
                                g.splice(f, 1)
                            }
                        }
                        this._cArrSetViews(g)
                    },
                    view_clear: function() {
                        this._cArrSetViews([])
                    },
                    view_get: function() {
                        return this._cArrGetViews()
                    },
                    view_count: function() {
                        return this._cArrGetViews().length
                    },
                    _cObjGet: function() {
                        var h = {};
                        var k = this._cGet(this.CARTS);
                        var g;
                        if (k) {
                            g = k.split(",")
                        } else {
                            g = []
                        }
                        for (var l in g) {
                            var j = g[l];
                            h[j.split("=")[0]] = j.split("=")[1].split("|")
                        }
                        return h
                    },
                    _cObjSet: function(h) {
                        var f = [];
                        for (var g in h) {
                            var j = h[g];
                            f.push(g + "=" + j.join("|"))
                        }
                        this._cSet(this.CARTS, f.join(","))
                    },
                    _cSet: function(k, j, h) {
                        if (h) {
                            var l = new Date();
                            l.setTime(l.getTime() + (h * 24 * 60 * 60 * 1000));
                            var g = "; expires=" + l.toGMTString()
                        } else {
                            var g = ""
                        }

                        document.cookie = encodeURIComponent(k) + "=" + encodeURIComponent(j) + g + "; path=/; domain=.lg.com"
                    },
                    _cGet: function(l) {
                        var j = decodeURIComponent(l) + "=";
                        var c = decodeURIComponent(document.cookie).split(";");
                        for (var k = 0; k < c.length; k++) {
                            var h = c[k];
                            while (h.charAt(0) == " ") {
                                h = h.substring(1, h.length)
                            }
                            if (h.indexOf(j) == 0) {
                                return h.substring(j.length, h.length)
                            }
                        }
                        return null
                    },
                    _cDel: function(c) {
                        this._cSet(c, "", -1)
                    }
                },
                filter: {
                    CARTS: "LG4_FILTER_CART",
                    page: 1,
                    pageCategory: function() {
                        return lgFilter.compareCategory
                    },
                    get: function(e) {
                        var g = this._cObjGet()[e];
                        if (!g) {
                            g = []
                        } else {
                            var f = g.length;
                            while (f--) {
                                if (g[f] == "") {
                                    g.splice(f, 1)
                                }
                            }
                        }
                        return g
                    },
                    add: function(j, k, g) {
                        var h = this.get(k);
                        if (g == null) {
                            h.unshift(j)
                        } else {
                            h.splice($.inArray(g, h), 1, j)
                        }
                        var f = this._cObjGet();
                        f[k] = h;
                        this._cObjSet(f)
                    },
                    remove: function(h, j) {
                        var k = this._cObjGet();
                        var g = this.get(j);
                        var l = g.length;
                        while (l--) {
                            if (g[l] == h) {
                                g.splice(l, 1)
                            }
                        }
                        k[j] = g;
                        this._cObjSet(k)
                    },
                    isin: function(h, j) {
                        var k = this._cObjGet();
                        var g = this.get(j);
                        var l = g.length;

                        while (l--) {
                            if (g[l] == h) {
                                return true
                            }
                        }
                        return false
                    },
                    count: function(c) {
                        return this.get(c).length
                    },/* LGEAU-2348 : 20170809 add */
    				empty: function(d) {
    					var e = this._cObjGet();
    					delete e[d];
    					this._cObjSet(e)
    				},/*//LGEAU-2348 : 20170809 add */
                    _cObjGet: function() {
                        var h = {};
                        var k = this._cGet(this.CARTS);
                        var g;
                        if (k) {
                            g = k.split(",")
                        } else {
                            g = []
                        }
                        for (var l in g) {
                            var j = g[l];
                            h[j.split("=")[0]] = j.split("=")[1].split("|")
                        }
                        return h
                    },
                    _cObjSet: function(h) {
                        var f = [];
                        for (var g in h) {
                            var j = h[g];
                            f.push(g + "=" + j.join("|"))
                        }
                        this._cSet(this.CARTS, f.join(","))
                    },
                    _cSet: function(k, j, h) {
                        if (h) {
                            var l = new Date();
                            l.setTime(l.getTime() + (h * 24 * 60 * 60 * 1000));
                            var g = "; expires=" + l.toGMTString()
                        } else {
                            var g = ""
                        }

                        document.cookie = encodeURIComponent(k) + "=" + encodeURIComponent(j) + g + "; path=/; domain=.lg.com"
                    },
                    _cGet: function(l) {
                        var j = decodeURIComponent(l) + "=";
                        var c = decodeURIComponent(document.cookie).split(";");
                        for (var k = 0; k < c.length; k++) {
                            var h = c[k];
                            while (h.charAt(0) == " ") {
                                h = h.substring(1, h.length)
                            }
                            if (h.indexOf(j) == 0) {
                                return h.substring(j.length, h.length)
                            }
                        }
                        return null
                    },
                    _cDel: function(c) {
                        this._cSet(c, "", -1)
                    }
                },
                compareLOCK: {
                    LOCK: "LG4_COMPARE_LOCK",
                    pageCategory: function() {
                        return lgFilter.compareCategory
                    },
                    get: function(e) {
                        var g = this._cObjGet()[e];
                        if (!g) {
                            g = []
                        } else {
                            var f = g.length;
                            while (f--) {
                                if (g[f] == "") {
                                    g.splice(f, 1)
                                }
                            }
                        }
                        return g
                    },
                    add: function(j, k, g) {
                        var h = this.get(k);
                        if (g == null) {
                            h.unshift(j)
                        } else {
                            h.splice($.inArray(g, h), 1, j)
                        }
                        var f = this._cObjGet();
                        f[k] = h;
                        this._cObjSet(f)
                    },
                    remove: function(h, j) {
                        var k = this._cObjGet();
                        var g = this.get(j);
                        var l = g.length;
                        while (l--) {
                            if (g[l] == h) {
                                g.splice(l, 1)
                            }
                        }
                        k[j] = g;
                        this._cObjSet(k)
                    },
                    isin: function(h, j) {
                        var k = this._cObjGet();
                        var g = this.get(j);
                        var l = g.length;
                        while (l--) {
                            if (g[l] == h) {
                                return true
                            }
                        }
                        return false
                    },
                    empty: function(d) {
                        var e = this._cObjGet();
                        delete e[d];
                        this._cObjSet(e)
                    },
                    count: function(c) {
                        return this.get(c).length
                    },
                    view_add: function(e) {
                        var g = this._cArrGetViews();
                        var f = g.length;
                        while (f--) {
                            if (g[f] == e) {
                                g.splice(f, 1)
                            }
                        }
                        g.unshift(e);
                        while (g.join(",").length > 1024) {
                            g.pop()
                        }
                        this._cArrSetViews(g)
                    },
                    view_remove: function(e) {
                        var g = this._cArrGetViews();
                        var f = g.length;
                        while (f--) {
                            if (g[f] == e) {
                                g.splice(f, 1)
                            }
                        }
                        this._cArrSetViews(g)
                    },
                    view_clear: function() {
                        this._cArrSetViews([])
                    },
                    view_get: function() {
                        return this._cArrGetViews()
                    },
                    view_count: function() {
                        return this._cArrGetViews().length
                    },
                    _cObjGet: function() {
                        var h = {};
                        var k = this._cGet(this.LOCK);
                        var g;
                        if (k) {
                            g = k.split(",")
                        } else {
                            g = []
                        }
                        for (var l in g) {
                            var j = g[l];
                            h[j.split("=")[0]] = j.split("=")[1].split("|")
                        }
                        return h
                    },
                    _cObjSet: function(h) {
                        var f = [];
                        for (var g in h) {
                            var j = h[g];
                            f.push(g + "=" + j.join("|"))
                        }
                        this._cSet(this.LOCK, f.join(","))
                    },
                    _cSet: function(k, j, h) {
                        if (h) {
                            var l = new Date();
                            l.setTime(l.getTime() + (h * 24 * 60 * 60 * 1000));
                            var g = "; expires=" + l.toGMTString()
                        } else {
                            var g = ""
                        }
                        document.cookie = encodeURIComponent(k) + "=" + encodeURIComponent(j) + g + "; path=/; domain=.lg.com"
                    },
                    _cGet: function(l) {
                        var j = decodeURIComponent(l) + "=";
                        var c = decodeURIComponent(document.cookie).split(";");
                        for (var k = 0; k < c.length; k++) {
                            var h = c[k];
                            while (h.charAt(0) == " ") {
                                h = h.substring(1, h.length)
                            }
                            if (h.indexOf(j) == 0) {
                                return h.substring(j.length, h.length)
                            }
                        }
                        return null
                    },
                    _cDel: function(c) {
                        this._cSet(c, "", -1)
                    }
                }
            }
            //init
        lgFilter.updateCompareButton();
        redot(); //LGEGMO-3850 : 20180306 add

        var checkedOptions = {};
        var filterForm = $('form.filter').length ? $("form.filter") : $('form[data-filter-form]');
        var _mTotalCount = $('.product-grid-header').length ? $('.product-grid-header').find('.total span').text() : filterForm.attr("data-total-count");
        var _countNumber = filterForm.data("view-length") == null ? 6 : filterForm.data("viewLength");
        var moreButton = $('.more-item').length > 0 ? '.more-item' : filterForm.data("moreButton");

        $.fn.extend({
                productFilter: function() {
                    var me = this;
                    me.form = $(me);
                    me.filter = me.form.find('.filterField');
                    me.grid = me.form.find('.grid');
                    //lgFilter.clearFilterCookie = false;
                    
                    var rtobj = {
                        init: function() {
                            var isDeskTop = !$('body').hasClass('is-mobile');
                            var c = lgFilter.filter.pageCategory();

                            /*
                        if (typeof mysearchFilter == 'undefined') {} else {
                            var $b = mysearchFilter[lgFilter.compareCategory];
                            var $el = filterForm;
                            var i = 0;
                            for(var key in $b){
                                $el.find('li input').eq(i).attr('name',$b[key]).val($b[key]);
                                i++;
                            }
                        }
                         */

                            //if(me.form.data('search-category')){
                            // init checkbox for start my search
                            me.filter.find('input').each(function() {
                                if ($(this).prop("checked")) {
                                    $(this).prop("checked", false);
                                }
                            });
                            // init slider for start my search
                            if ($('.findTheRightFilter').is('section')) {
                                me.form.find('input[type=hidden]').each(function() {
                                    if ($(this).attr('name') == 'sizeMin' || $(this).attr('name') == 'sizeMax' || $(this).attr('name') == 'priceMin' || $(this).attr('name') == 'priceMax') {
                                        //$(this).val('');
                                    }
                                });
                            }

                            //if(me.form.find('.sort-select').val())
                            //}
                            // -- COLOR CHIP SCRIPTS --
                            // if (!$('body').hasClass("is-mobile")) { // DESKTOP ONLY
                            //     var targets = me.filter.find('label.swatch, label.swatch input');
                            //     targets.bind({
                            //         'focus': $.proxy(function(e) {
                            //             var item = $(e.currentTarget).is("label") ? $(e.currentTarget).find("input[type='checkbox']") : $(e.currentTarget),
                            //                 label = item.parent("label"),
                            //                 colorName = item.data("colorname"),
                            //                 colorTag = '<span class="color-tag">' + colorName + '</span>';
                            //             if (label.find("span.color-tag")[0]) label.find(".color-tag").remove();
                            //             label.append(colorTag);
                            //         }),
                            //         'blur': $.proxy(function(e) {
                            //             var item = $(e.currentTarget).is("label") ? $(e.currentTarget) : $(e.currentTarget).parent("label");
                            //             item.find(".color-tag").remove();
                            //         })
                            //     });
                            //     if (!('ontouchend' in document)) {
                            //         targets.bind({
                            //             'mouseenter': $.proxy(function(e) {
                            //                 var item = $(e.currentTarget).is("label") ? $(e.currentTarget).find("input[type='checkbox']") : $(e.currentTarget);
                            //                 item.trigger("focus");
                            //             }),
                            //             'mouseleave': $.proxy(function(e) {
                            //                 var item = $(e.currentTarget).is("label") ? $(e.currentTarget).find("input[type='checkbox']") : $(e.currentTarget);
                            //                 item.trigger("blur");
                            //             })
                            //         })
                            //     } else {
                            //         targets.bind({
                            //             'click': $.proxy(function(e) {
                            //                 $(e.currentTarget).trigger("focus");
                            //             })
                            //         })
                            //     }
                            // }


                            if (!$('body').hasClass("is-mobile")) { // DESKTOP ONLY
                                var targets = me.filter.find('label.swatch');
                                targets.on({
                                    'mouseenter': function(e) {
                                        var item = $(e.currentTarget).find('input'),
                                            label = $(e.currentTarget),
                                            colorName = item.data("colorname"),
                                            colorTag = '<span class="color-tag">' + colorName + '</span>';

                                        if (label.find("span.color-tag")[0]) label.find(".color-tag").remove();
                                        label.append(colorTag);
                                    },
                                    'mouseleave': function(e) {
                                        $(e.currentTarget).find(".color-tag").remove();
                                    }
                                });
                            }


                            me.filter.find('input, .slide-box select, checkbox, radio').bind('change', $.proxy(function(e) {
                                var chkT;
                                var item = $(e.currentTarget);
                                var itemAttr = "";
                                var cookieVal = "";

                                if (!me.form.data('search-category')) {
                                    if (e.currentTarget.type == 'checkbox' || e.currentTarget.type == 'radio') {
                                        if (item.prop("checked")) {
                                            //console.log('checked');
                                            itemAttr = "checked";
                                            if (isDeskTop || me.form.data('search-category')) {
                                                if (!lgFilter.clearFilterCookie && me.form.data('search-category')) {
                                                    lgFilter.filter._cSet(lgFilter.filter.CARTS, '');
                                                    lgFilter.clearFilterCookie = true;
                                                }
                                                //lgFilter.filter.add((item[0].name+":"+item.val()), c);
                                                lgFilter.filter.add((item.val()), c); // add cookie
                                            }

                                            var colorW, colorS;
                                            (item.parent().prevAll('legend:first').find('a').length > 0) ? colorW = document.getElementById(item.parent().prevAll('legend:first').attr('id')).childNodes[0].nodeValue: colorW = $.trim(item.parent().prevAll('legend:first').text());

                                            if ($(e.currentTarget).parent().hasClass('swatch')) {
                                                var colorS = item.data("colorname");
                                                if (isDeskTop) {
                                                    checkOptionDraw(colorS, item);
                                                    //$(e.target).parent().trigger("mouseleave");
                                                } else {
                                                    var label = $(e.currentTarget).parent('label.swatch'),
                                                        labels = me.filter.find("label.swatch"),
                                                        colorTag = '<span class="color-tag">' + colorS + '</span>';
                                                    if (!me.filter.find("span.color-tag")[0]) {
                                                        $(colorTag).insertAfter(labels.eq(labels.length - 1));
                                                    } else {
                                                        me.filter.find("span.color-tag").text(colorS);
                                                    }
                                                }
                                                item.attr('title', item.attr('title').replace("{color}", colorS));
                                            } else {
                                                if (isDeskTop) {
                                                    checkOptionDraw(item.next().text(), item);
                                                }
                                            }

                                            //if(colorS) {
                                            //  chkT = 'Select'+ ' ' + colorS; /* 20140519 choyearang modify */
                                            //  item.attr('title',chkT);
                                            //}
                                        } else {
                                            //console.log('not checked');
                                            itemAttr = "";
                                            if (isDeskTop) {
                                                if ($(e.currentTarget).parent().hasClass('swatch')) {
                                                    var colorS = item.data("colorname");
                                                    checkOptionDraw(colorS, item);
                                                } else {
                                                    checkOptionDraw(item.next().text(), item);
                                                }
                                                // lgFilter.filter.remove((item[0].name+":"+item.val()), c);
                                                lgFilter.filter.remove((item.val()), c);
                                            } else {
                                                me.filter.find("span.color-tag").remove();
                                            }
                                        }

                                        if (item.parent().hasClass('swatch')) {
                                            if (item.parent().hasClass('active')) {
                                                item.parent().removeClass('active');
                                            } else {
                                                item.parent().addClass('active');
                                            }
                                        }
                                    } else {

                                        itemAttr = "selected";
                                        (item.find('option[value=' + item.val() + ']').is(':selected')) ? itemAttr = 'selected': itemAttr = '';

                                        item.addClass('change');

                                        // 151112 slider-select cookie
                                        if (item.data('index') >= 0) {

                                            if (isDeskTop || me.form.data('search-category')) {
                                                if (!lgFilter.clearFilterCookie && me.form.data('search-category')) {
                                                    lgFilter.filter._cSet(lgFilter.filter.CARTS, '');
                                                    lgFilter.clearFilterCookie = true;
                                                }

                                                var capacity = null,
                                                    copyArr = JSON.parse(JSON.stringify(lgFilter.filter.get(lgFilter.compareCategory))),
                                                    slide = item.parents('.slide-box').find('.slide-bar'),
                                                    inputBox = slide.data('input').split(','),
                                                    slideText = slide.data('name');

                                                for (var i = 0; i < copyArr.length; i++) {
                                                    if (copyArr[i].indexOf(slideText) != -1) {
                                                        lgFilter.filter.remove(copyArr[i], c);
                                                    }
                                                }

                                                if (slide.hasClass('zero') == false) {

                                                    $.each(inputBox, function(index) {

                                                        var inputValue = $.trim(this);

                                                        lgFilter.filter.add((inputValue + ':' + $('input[name="' + inputValue + '"]').val()), c);

                                                        lgFilter.clearFilterCookie = true;

                                                    });

                                                }

                                                if (isDeskTop) {
                                                    var n = slide.data("slidername");
                                                    var slideBox = item.parents('.slide-box');
                                                    if (slide.data('double')) {
                                                        checkOptionDraw(n, $.trim(slideBox.find('.first-unit').text()) + "-" + $.trim(slideBox.find('.last-unit').text()), true, slide);
                                                    } else {
                                                        checkOptionDraw(n, $.trim(slideBox.find('.first-unit').text()), true, slide);
                                                    }
                                                }

                                            }
                                        }

                                    }
                                }

                                var d = item.val();

                                if (isDeskTop || me.form.data('search-category')) {
                                    this.applyFilter();
                                    $(window).trigger('resize');
                                }

                            }, this));


                            if (!me.form.data('search-category')) { // no - start my search
                                this.setCookieFilter();
                            }

                            me.grid.on('change', '.compare-check input.compare', lgFilter.onCompareClick);
                            me.grid.on('click', '.compare-check a', function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location = lgFilter.compareLoc
                            });
                            me.form.find('.sort-select').bind('change', function() {
                                var _this = this;
                                var top = 0;

                                $('.sort-select').each(function() {
                                    $(this).removeAttr('name');
                                    var siblingItem = this;
                                    if (_this !== siblingItem) {
                                        $(siblingItem).val($(_this).find(':selected').val()).trigger("chosen:updated");
                                        //console.log($(_this).find(':selected').val() +" === "+$(siblingItem).val())
                                    }
                                })
                                $(_this).attr('name', 'sort');


                                if($("body").hasClass("is-mobile") == false){
                                    if($(".sub-section-head").length){
                                        top = $(".sub-section-head").outerHeight(true);
                                    }

                                    if($(".promotion-tab").length){
                                        top = $(".promotion-tab").outerHeight(true) + 50;
                                    }

                                    $("html, body").animate({
                                        scrollTop: $(filterForm).offset().top - top
                                    }, 500);
                                }

                                /* LGEPJT-337 : 20171121 add */
                                if($("body").hasClass("is-mobile")) {
                                    stickRefindEvt();
                                }

                                rtobj.applyFilter();
                            });

                            me.form.on('click', '.page-controls a', function() {
                                var _ank = $(this);
                                var url = _ank.attr('data-uri');
                                var top = 0;

                                if (!url) {
                                    return false;
                                }

                                rtobj.reload(url);

                                if($(".sub-section-head").length){
                                    top = $(".sub-section-head").outerHeight(true);
                                }

                                if($(".promotion-tab").length){
                                    top = $(".promotion-tab").outerHeight(true) + 50;
                                }

                                $("html, body").animate({
                                    scrollTop: $(filterForm).offset().top - top
                                }, 500);

                                return false;
                            })

                            $("[data-ajax-parent]").on('click', '[data-ajax-tab] a', function() {
                                var _ank = $(this);
                                var url = _ank.attr('data-uri');

                                $(this).parent("li").siblings().removeClass("active");
                                $(this).parent("li").addClass("active");

                                if (!url) {
                                    return false;
                                }

                                rtobj.reload(url);

                                $("html, body").animate({
                                    scrollTop: $("[data-ajax-parent]").offset().top - 20
                                }, 500);

                                return false;
                            })

                            // enter key not action
                            me.grid.find("input, select, checkbox, radio").on('keydown', $.proxy(function(b) {
                                if (b.keyCode == 13) {
                                    return false;
                                };
                            }, this));
                        },
                        checkFilter: function() {
                            if (filterInfo.length > 0) {
                                var c = lgFilter.filter.pageCategory();
                                for (var i in filterInfo) {
                                    var filterValues = filterInfo[i]["facetValues"];
                                    for (var j in filterValues) {

                                        var _enable = filterValues[j]["enable"];
                                        var _value = filterValues[j]["facetValueId"];
                                        var _chkfilter = $('*[value="' + _value + '"]');

                                        if (_chkfilter.get(0)) {
                                            if (_chkfilter.get(0).tagName.toLowerCase() == "select") {
                                                if (_enable == "N") {
                                                    _chkfilter.css('display', 'none');
                                                    lgFilter.filter.add(_chkfilter.attr('value'), c);
                                                } else {
                                                    _chkfilter.css('display', 'block');
                                                }
                                            } else {
                                                if (!_chkfilter.is(':checked')) {
                                                    if (_enable == "N") {
                                                        _chkfilter.attr('disabled', 'disabled').css('cursor', 'default').parent().addClass('disabled');
                                                        $.cookie(_chkfilter.attr('value'), '', -1);
                                                        lgFilter.filter.remove(_chkfilter.attr('value'), c);
                                                    } else {
                                                        _chkfilter.removeAttr('disabled').css('cursor', 'pointer').parent().removeClass('disabled');
                                                    }
                                                } else {

                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                this.clear();
                            }

                            return false;
                        },
                        setCookieFilter: function() {
                            var formSubmit = false;
                            /* LGEAU-2348 : 20170809 add */
                            if (document.location.search != "") {
                                var _chKVal = document.location.search.substring(1).split("&");
                                $.each(_chKVal, function(index, value) {
                                    var _this;
                                    me.filter.find("input, select, checkbox, radio").each($.proxy(function() {
                                        var _thisVal =$(this).val();
                                        if(_thisVal == value.split("=")[1]){
                                            lgFilter.filter.empty(lgFilter.filter.pageCategory());
                                            for (index = 0; index < _chKVal.length; index++) {                                        
                                                lgFilter.filter.add(_chKVal[index].split("=")[1], lgFilter.filter.pageCategory());
                                            }
                                        }
                                    }));
                                });
                            }
    						/*//LGEAU-2348 : 20170809 add */
                            me.filter.find('input, select, checkbox, radio').each($.proxy(function(idx, el) {
                                var c = lgFilter.filter.pageCategory();

                                var key = $(el).attr('value');

                                var getVal = lgFilter.filter.isin((key), c);

                                if (getVal) {
                                    formSubmit = true;
                                    //$(el).attr('checked','checked');
                                    $(el).prop('checked', true);
                                    if ($(el).parent().hasClass('swatch')) {
                                        var colorS = $(el).data("colorname");
                                        checkOptionDraw(colorS, $(el));
                                        $(el).parent().addClass('active');
                                    } else {
                                        checkOptionDraw($(el).next().text(), $(el));
                                    }
                                }

                            }, this));

                            if (!lgFilter.clearFilterCookie && lgFilter.filter.get(lgFilter.compareCategory).length > 0) {
                                lgFilter.clearFilterCookie = true;
                            }

                            var sliderCookie;
                            var screenTxt = $('.screen .first-unit');
                            var screenTxt2 = $('.screen .last-unit');
                            var priceTxt = $('.budget .first-unit');
                            var priceTxt2 = $('.budget .last-unit');
                            /* LGEAU-2214 20170317 add */
                            var spec1Txt = $('.spec1 .first-unit');
                            var spec1Txt2 = $('.spec1 .last-unit');
                            var spec2Txt = $('.spec2 .first-unit');
                            var spec2Txt2 = $('.spec2 .last-unit');
                            var spec3Txt = $('.spec3 .first-unit');
                            var spec3Txt2 = $('.spec3 .last-unit');
                            /* //LGEAU-2214 20170317 add */

                            for (var i = 0; i < lgFilter.filter.get(lgFilter.compareCategory).length; i++) {

                                sliderCookie = decodeURIComponent(lgFilter.filter.get(lgFilter.compareCategory)[i]);

                                if (sliderCookie.indexOf('size') != -1) {

                                    //$('input[name=sizeMin]').val(sliderCookie.split(':')[1]);
                                    formSubmit = true;
                                    setTimeout(function() {
                                        var slide = $('.screen .slide-bar');
                                        var n = $('.screen .slide-bar').data("slidername");
                                        if (n) {
                                            if (slide.data('double')) {
                                                checkOptionDraw(n, $.trim(screenTxt.text()) + "-" + $.trim(screenTxt2.text()), true)
                                            } else {
                                                checkOptionDraw(n, $.trim(screenTxt.text()), true)
                                            }
                                        }
                                    }, 150)
                                }
                                if (sliderCookie.indexOf('sizeMax') != -1) {
                                    //$('input[name=sizeMax]').val(sliderCookie.split(':')[1])
                                    formSubmit = true;
                                    setTimeout(function() {
                                        var slide = $('.screen .slide-bar');
                                        var n = $('.screen .slide-bar').data("slidername");
                                        if (n) {
                                            if (slide.data('double')) {
                                                checkOptionDraw(n, $.trim(screenTxt.text()) + "-" + $.trim(screenTxt2.text()), true)
                                            } else {
                                                checkOptionDraw(n, $.trim(screenTxt.text()), true)
                                            }
                                        }
                                    }, 150)
                                }
                                if (sliderCookie.indexOf('priceMin') != -1) {
                                    //$('input[name=priceMin]').val(sliderCookie.split(':')[1])
                                    formSubmit = true;
                                    setTimeout(function() {
                                        var slide = $('.budget .slide-bar');
                                        var n = $('.budget .slide-bar').data("slidername");
                                        if (n) {
                                            if (slide.data('double')) {
                                                checkOptionDraw(n, $.trim(priceTxt.text()) + "-" + $.trim(priceTxt2.text()), true)
                                            } else {
                                                checkOptionDraw(n, $.trim(priceTxt.text()), true)
                                            }
                                        }
                                    }, 150)
                                }
                                if (sliderCookie.indexOf('priceMax') != -1) {
                                    //$('input[name=priceMax]').val(sliderCookie.split(':')[1])
                                    formSubmit = true;
                                    setTimeout(function() {
                                        var slide = $('.budget .slide-bar');
                                        var n = $('.budget .slide-bar').data("slidername");
                                        if (n) {
                                            if (slide.data('double')) {
                                                checkOptionDraw(n, $.trim(priceTxt.text()) + "-" + $.trim(priceTxt2.text()), true)
                                            } else {
                                                checkOptionDraw(n, $.trim(priceTxt.text()), true)
                                            }
                                        }
                                    }, 150)
                                }
                                
                                /* LGEAU-2214 20170317 add */
                                if (sliderCookie.indexOf('specMin1') != -1) {
                                    formSubmit = true;
                                    setTimeout(function() {
                                        var slide = $('.spec1 .slide-bar');
                                        var n = $('.spec1 .slide-bar').data("slidername");
                                        if (n) {
                                            if (slide.data('double')) {
                                                checkOptionDraw(n, $.trim(spec1Txt.text()) + "-" + $.trim(spec1Txt2.text()), true)
                                            } else {
                                                checkOptionDraw(n, $.trim(spec1Txt.text()), true)
                                            }
                                        }
                                    }, 150)
                                }
                                if (sliderCookie.indexOf('specMax1') != -1) {
                                    formSubmit = true;
                                    setTimeout(function() {
                                        var slide = $('.spec1 .slide-bar');
                                        var n = $('.spec1 .slide-bar').data("slidername");
                                        if (n) {
                                            if (slide.data('double')) {
                                                checkOptionDraw(n, $.trim(spec1Txt.text()) + "-" + $.trim(spec1Txt2.text()), true)
                                            } else {
                                                checkOptionDraw(n, $.trim(spec1Txt.text()), true)
                                            }
                                        }
                                    }, 150)
                                }
                                
                                if (sliderCookie.indexOf('specMin2') != -1) {
                                    formSubmit = true;
                                    setTimeout(function() {
                                        var slide = $('.spec2 .slide-bar');
                                        var n = $('.spec2 .slide-bar').data("slidername");
                                        if (n) {
                                            if (slide.data('double')) {
                                                checkOptionDraw(n, $.trim(spec2Txt.text()) + "-" + $.trim(spec2Txt2.text()), true)
                                            } else {
                                                checkOptionDraw(n, $.trim(spec2Txt.text()), true)
                                            }
                                        }
                                    }, 150)
                                }
                                if (sliderCookie.indexOf('specMax2') != -1) {
                                    formSubmit = true;
                                    setTimeout(function() {
                                        var slide = $('.spec2 .slide-bar');
                                        var n = $('.spec2 .slide-bar').data("slidername");
                                        if (n) {
                                            if (slide.data('double')) {
                                                checkOptionDraw(n, $.trim(spec2Txt.text()) + "-" + $.trim(spec2Txt2.text()), true)
                                            } else {
                                                checkOptionDraw(n, $.trim(spec2Txt.text()), true)
                                            }
                                        }
                                    }, 150)
                                }
                                
                                if (sliderCookie.indexOf('specMin3') != -1) {
                                    formSubmit = true;
                                    setTimeout(function() {
                                        var slide = $('.spec3 .slide-bar');
                                        var n = $('.spec3 .slide-bar').data("slidername");
                                        if (n) {
                                            if (slide.data('double')) {
                                                checkOptionDraw(n, $.trim(spec3Txt.text()) + "-" + $.trim(spec3Txt2.text()), true)
                                            } else {
                                                checkOptionDraw(n, $.trim(spec3Txt.text()), true)
                                            }
                                        }
                                    }, 150)
                                }
                                if (sliderCookie.indexOf('specMax3') != -1) {
                                    formSubmit = true;
                                    setTimeout(function() {
                                        var slide = $('.spec3 .slide-bar');
                                        var n = $('.spec3 .slide-bar').data("slidername");
                                        if (n) {
                                            if (slide.data('double')) {
                                                checkOptionDraw(n, $.trim(spec3Txt.text()) + "-" + $.trim(spec3Txt2.text()), true)
                                            } else {
                                                checkOptionDraw(n, $.trim(spec3Txt.text()), true)
                                            }
                                        }
                                    }, 150)
                                }
                                /* //LGEAU-2214 20170317 add */
                            }

                            refineDragbar();

                            if (!$('.add-to-compare').length && formSubmit) {
                                this.applyFilter();
                            }
                        },
                        applyFilter: function(c) {
                            c = c ? "&" + c : "";
                            if ($('input[name=page]').length > 0) {
                                $('input[name=page]').remove();
                            }
                            var XSSFilter = function(content) {
                                return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                            }
                            me.form.find('input, select').each(function() {
                                this.value = XSSFilter(this.value);
                                this.name = XSSFilter(this.name);
                            })

                            var uri = me.form.attr('action') + '?' + me.form.serialize() + c;

                            this.reload(uri);
                        },
                        applyFilterMore: function(url, page, limit) {
                            var XSSFilter = function(content) {
                                return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                            }
                            me.form.find('input, select').each(function() {
                                this.value = XSSFilter(this.value);
                                this.name = XSSFilter(this.name);
                            })
                            var pageNum = page;
                            if (pageNum <= limit) {
                                var b = url + '?' + me.form.serialize();
                                var mlistTarget = $('.product-lists').length > 0 ? '.product-lists' : me.form.data("ajax-target");
                                
                                $.ajax({
                                    url: b,
                                    type: "post",
                                    success: $.proxy(function(res, data) {
                                        var $b = $(res);
                                        var mlistHtml = $('.product-lists').length > 0 ? $b.find(mlistTarget).html() : $b.contents().filter(mlistTarget).html();

                                        if ($(".promotion .board-wrap").length) {
                                            $($b.find('.board-list').html()).appendTo($('.board-list'));
                                        } else {
                                            //console.log(222, $b, $b.find('.product-lists').html());
                                            $(mlistHtml).appendTo(me.form.find(mlistTarget));

                                            lgFilter.updateCompareButton();
                                            
                                            if ($('.buynow').length > 0) {
                                                runBuyNow();
                                            } // buy now theJ
                                            /*LGECI-2710, LGECI-2811 : 20170626 modify */
                                            if(_BVRatingFlag.length && _BVRatingFlag.val() == "Y"){
                                            	// product list
                                            	$('.product-lists').each(setBVRatings); // bazaar voide theJ
                                            }
                                            if(lgFilter.locale =="ca_en" || lgFilter.locale =="ca_fr"){
                                        		$('.product-lists li').each(function(){
                                            		if($(this).find(".rating, .compare-check").length == "0") {
                                            			$(this).find(".details").addClass("bundleSet");
                                            		}
                                            	});
                                        	}
                                            /*//LGECI-2710, LGECI-2811 : 20170626 modify */
                                            redot();//LGEGMO-3850
                                            /* LGEAR-920 20171025*/
                                            if ($('.obs-submit').length > 0) {
                                            	ic.jquery.plugin('SmartWorld', smartworld, ".obs-submit")
                                            }
                                            /*//LGEAR-920 20171025*/
                                        }

                                        setTimeout(function(){
                                            $("img.lazy").lazyload({
                                                appear: function() {
                                                    $(this).attr('style', '').removeClass('lazy');
                                                }
                                            });
                                        },50);
                                        
                                        

                                    }, this),
                                    error: $.proxy(function() {
                                        $("html > div.page-dimmed").remove();
                                        alert(errorMsg);
                                    })
                                });
                            }
                            if (pageNum == limit) {
                                $(moreButton).hide();
                            }
                        },
                        reload: function(b, _callback) {
                            if (this.loading) {
                                return;
                            }

                            var totalTarget = me.form.find('.product-grid-header');
                            var listTarget = $('.product-list-wrap').length ? '.product-list-wrap' : filterForm.data("list-target");

                            $.ajax({
                                url: b,
                                type: "post",
                                success: $.proxy(function(res, data) {

                                    this.loading = true;

                                    var $b = $(res);
                                    var listHtml = $('.product-list-wrap').length ? $b.find(listTarget) : $b.filter(listTarget);
                                    
                                    /*LGECI-2710, LGECI-2811 : 20170626 modify */
                                    if(_BVRatingFlag.length && _BVRatingFlag.val() == "Y"){
                                    	// product list
                                    	//$('.product-lists').each(setBVRatings); // bazaar voide theJ
                                    	$('.product-lists').each(setBVRatings);
                                    }
                                    if(lgFilter.locale =="ca_en" || lgFilter.locale =="ca_fr"){
                                		$('.product-lists li').each(function(){
                                    		if($(this).find(".rating, .compare-check").length == "0") {
                                    			$(this).find(".details").addClass("bundleSet");
                                    		}
                                    	});
                                	}
                                    /*//LGECI-2710, LGECI-2811 : 20170626 modify */
                                    
                                    //total
                                    if (totalTarget.length) {
                                        var t = totalTarget.find('.total span.check-singular').data("plural");
                                        totalTarget.find('.total span.count').text($b.find('.total').text()) // need total only
                                        me.form.find('.result .total').text($b.find('.total').text()) // need total only
                                        if (Number($b.find('.total').text()) <= 1) {
                                            t = totalTarget.find('.total span.check-singular').data("singular");
                                        }
                                        totalTarget.find('.total span.check-singular').text(t);
                                        me.form.find('.result .check-singular').text(t)
                                    } else {
                                         if($b.find('.total').length){

                                            me.form.attr('data-total-count', $b.find('.total').text());
                                            //console.log("total", $b.find('.total').length, me.form.data('total-count'));
                                         }
                                    }

                                    //pages
                                    me.form.find('.page-controls .pages').html($b.find('.pages').html())

                                    //product list
                                    me.form.find(listTarget).html(listHtml.html());

                                    if (!$b.find('ul').length) {
                                        me.form.find(listTarget).addClass('no-result');
                                    } else {
                                        me.form.find(listTarget).removeClass('no-result');
                                    }

                                    var listWrap = $('.response .product-grid');
                                    //listWrap.find('.compare_y em').text(compareCount)
                                    //$('.product-grid-header .compare-state span').text("("+compareCount+")")
                                    $b.filter("script").each(function() {
                                        $.globalEval(this.text || this.textContent || this.innerHTML || "")
                                    });
                                    /* filter realtime search : parkjeongmi 20120919 S */
                                    if (typeof filters != "undefined" && filters.length >= 0) {
                                        filterInfo = filters;
                                        this.checkFilter();
                                    }
                                    /* filter realtime search : parkjeongmi 20120919 E */
                                    if ($('div.add-to-compare').length) {
                                        //$('.btn-center').
                                        if (parseInt($b.find('.total').text()) < 1) {
                                            $('.btn-center').find('a:eq(0)').addClass('disable');
                                            $('.btn-center').find('a:eq(1)').addClass('disable');
                                            $('.btn-center').find('a:eq(2)').addClass('disable');
                                        } else {
                                            if (parseInt($b.find('.pages .active').text()) < 2) {
                                                $('.btn-center').find('a:eq(0)').addClass('disable');
                                            } else {
                                                $('.btn-center').find('a:eq(0)').removeClass('disable');
                                            }
                                            if (parseInt($b.find('.pages .active').text()) == parseInt($b.find('.total').text())) {
                                                $('.btn-center').find('a:eq(1)').addClass('disable');
                                            } else {
                                                $('.btn-center').find('a:eq(1)').removeClass('disable');
                                            }
                                            $('.btn-center').find('a:eq(2)').removeClass('disable');
                                        }
                                    }
                                    if ($('.findTheRightFilter').is('section')) {
                                        if (parseInt($b.find('.total').text()) == 0) {
                                            $('.matching-btn a').unbind('click').bind('click', function(b) {
                                                b.preventDefault();
                                                return false;
                                            }).addClass('hide');
                                        } else {
                                            $('.matching-btn a').off('click').removeClass('hide').on('click', function() {
                                                var c = lgFilter.filter.pageCategory();
                                                var copyArr = JSON.parse(JSON.stringify(lgFilter.filter.get(lgFilter.compareCategory)));

                                                checkedOptions = {};

                                                lgFilter.filter._cSet(lgFilter.filter.CARTS, '');

                                                filterForm.find('input, select').each(function(idx) {
                                                    var chkT;
                                                    var item = $(this);
                                                    var itemAttr = "";
                                                    var cookieVal = "";
                                                    var d = item.val();

                                                    if (item.is('input[type=checkbox]')) {
                                                        if (item.prop("checked")) {
                                                            itemAttr = "checked";

                                                            var colorW, colorS;
                                                            (item.parent().prevAll('legend:first').find('a').length > 0) ? colorW = document.getElementById(item.parent().prevAll('legend:first').attr('id')).childNodes[0].nodeValue: colorW = $.trim(item.parent().prevAll('legend:first').text());

                                                            if (item.parent().hasClass('swatch')) {
                                                                colorS = item.data("colorname");
                                                            } else {
                                                                colorS = item.next('span').text();
                                                            }

                                                            if (!lgFilter.clearFilterCookie && me.form.data('search-category')) {
                                                                lgFilter.filter._cSet(lgFilter.filter.CARTS, '');
                                                                lgFilter.clearFilterCookie = true;
                                                            }

                                                            for (var i = 0; i < copyArr.length; i++) {
                                                                if (copyArr[i].indexOf(item.val()) != -1) {
                                                                    lgFilter.filter.remove(copyArr[i], c);
                                                                }
                                                            }

                                                            // chkT = 'Select'+ ' ' + colorS; /* 20140519 choyearang modify */
                                                            // item.attr('title',chkT);
                                                            checkOptionDraw(colorS, item);
                                                            lgFilter.filter.add((d), c);
                                                        }
                                                    } else if (item.is('select')) {

                                                        var itemAttr;
                                                        (item.find('option[value=' + item.val() + ']').is(':selected')) ? itemAttr = 'selected': itemAttr = '';

                                                        // 151112 slider-select cookie
                                                        if (item.data('index') >= 0) {

                                                            var capacity = null,
                                                                slide = item.parents('.slide-box').find('.slide-bar'),
                                                                inputBox = slide.data('input').split(','),
                                                                slideText = slide.data('name');

                                                            if (slide.hasClass('zero') == false) {

                                                                $.each(inputBox, function(index) {

                                                                    var inputValue = $.trim(this);
                                                                    var inputCookie = inputValue + ':' + $('input[name="' + inputValue + '"]').val();

                                                                    for (var i = 0; i < copyArr.length; i++) {
                                                                        if (copyArr[i].indexOf(inputCookie) != -1) {
                                                                            lgFilter.filter.remove((copyArr[i]), c);
                                                                        }
                                                                    }

                                                                    lgFilter.filter.add((inputCookie), c);

                                                                    lgFilter.clearFilterCookie = true;

                                                                });

                                                            }


                                                            var n = slide.data("slidername");
                                                            var slideBox = item.parents('.slide-box');

                                                            if (slide.data('double')) {
                                                                checkOptionDraw(n, $.trim(slideBox.find('.first-unit').text()) + "-" + $.trim(slideBox.find('.last-unit').text()), true, slide);
                                                            } else {
                                                                checkOptionDraw(n, $.trim(slideBox.find('.first-unit').text()), true, slide);
                                                            }

                                                        }
                                                    }

                                                });

                                                // DTM
                                                var dtm = '';
                                                // Desktop
                                                if ($('.my-search .m-search-select').is('div')) { // TV
                                                    $('.my-search .search-area > div').not('.matching').each(function(i) {
                                                        var _this = $(this);
                                                        if (i != 0) dtm = dtm + ':';
                                                        if (_this.hasClass('screen')) {
                                                            dtm = dtm + $.trim(_this.find('.slide-box .img .img-text').text());
                                                        } else if (_this.hasClass('budget')) {
                                                            dtm = dtm + $.trim(_this.find('.slide-box .first-unit').text()) + "-" + $.trim(_this.find('.slide-box .last-unit').text());
                                                        } else if (_this.hasClass('viewing')) {
                                                            var n = '';
                                                            _this.find('.check-list li label.on').each(function(j) {
                                                                var _this2 = $(this);
                                                                if (j != 0) n = n + ",";
                                                                n = n + $.trim(_this2.text());
                                                            });
                                                            dtm = dtm + n;
                                                        }
                                                    });
                                                } else if ($('.my-search .washers-search-area').is('div')) { // Washer
                                                    $('.my-search .washers-search-area > div').not('.matching').each(function(i) {
                                                        var _this = $(this);
                                                        if (i != 0) dtm = dtm + ':';
                                                        if (_this.hasClass('screen')) {
                                                            dtm = dtm + $.trim(_this.find('.slide-box .slide-bar .text').text());
                                                        } else if (_this.hasClass('budget')) {
                                                            dtm = dtm + $.trim(_this.find('.slide-box .first-unit').text()) + "-" + $.trim(_this.find('.slide-box .last-unit').text());
                                                        } else if (_this.hasClass('washers-choice')) {
                                                            var n = '';
                                                            _this.find('.washers-list li label.on').each(function(j) {
                                                                var _this2 = $(this);
                                                                if (j != 0) n = n + ",";
                                                                n = n + $.trim(_this2.text());
                                                            });
                                                            dtm = dtm + n;
                                                        }
                                                    });
                                                } else if ($('.my-search .refrigerators-search-area').is('div')) { // refrigerators
                                                    $('.my-search .refrigerators-search-area > div').not('.matching').each(function(i) {
                                                        var _this = $(this);
                                                        if (i != 0) dtm = dtm + ':';
                                                        if (_this.hasClass('viewing')) {
                                                            var n = '';
                                                            _this.find('.check-list li label.on').each(function(j) {
                                                                var _this2 = $(this);
                                                                if (j != 0) n = n + ",";
                                                                n = n + $.trim(_this2.text());
                                                            });
                                                            dtm = dtm + n;
                                                        } else if (_this.hasClass('refrigerators-choice')) {
                                                            var n = '';
                                                            _this.find('.refrigerators-list li label.on').each(function(j) {
                                                                var _this2 = $(this);
                                                                if (j != 0) n = n + ",";
                                                                n = n + $.trim(_this2.find('.list-text').text());
                                                            });
                                                            dtm = dtm + n;
                                                        }
                                                    });
                                                }
                                                // Mobile
                                                if ($('.m-my-search .m-search-select').is('div')) { // TV
                                                    $('.m-my-search .m-search-select > div').not('.matching').each(function(i) {
                                                        var _this = $(this);
                                                        if (i != 0) dtm = dtm + ':';
                                                        if (_this.hasClass('m-screen')) {
                                                            if ($.trim(_this.find('.m-slide-box .m-img .m-img-text').text())) dtm = dtm + $.trim(_this.find('.m-slide-box .m-img .m-img-text').text());
                                                            else dtm = dtm + $.trim(_this.find('.m-slide-box .m-slide-bar .m-text').text());
                                                        } else if (_this.hasClass('m-budget')) {
                                                            dtm = dtm + $.trim(_this.find('.m-slide-box .m-first-unit').text()) + "-" + $.trim(_this.find('.m-slide-box .m-last-unit').text());
                                                        } else if (_this.hasClass('m-viewing')) {
                                                            var n = '';
                                                            _this.find('.m-check-list li label.on').each(function(j) {
                                                                var _this2 = $(this);
                                                                if (j != 0) n = n + ",";
                                                                n = n + $.trim(_this2.text());
                                                            });
                                                            dtm = dtm + n;
                                                        } else if (_this.hasClass('m-refrigerators-choice')) {
                                                            var n = '';
                                                            _this.find('.m-refrigerators-list li label.on').each(function(j) {
                                                                var _this2 = $(this);
                                                                if (j != 0) n = n + ",";
                                                                n = n + $.trim(_this2.find('.m-list-text').text());
                                                            });
                                                            dtm = dtm + n;
                                                        } else if (_this.hasClass('m-washers-choice')) {
                                                            var n = '';
                                                            _this.find('.m-washers-list li label.on').each(function(j) {
                                                                var _this2 = $(this);
                                                                if (j != 0) n = n + ",";
                                                                n = n + $.trim(_this2.text());
                                                            });
                                                            dtm = dtm + n;
                                                        }
                                                    });
                                                }
                                                // alert(dtm);
                                                sendEvent('start-my-search', dtm);
                                            });
                                        }
                                        $('.matching-count, .m-matching-count').text($b.find('.total').text());
                                    }

                                    if ($(".promotion").length) {
                                        me.form.html($b);
                                    }
                                    //this.setCompareCookie();
                                    this.currentPage = 0;
                                    lgFilter.updateCompareButton();
                                    if ($('.buynow').length > 0) {
                                        // runBuyNow();
                                    } // buy now theJ

                                    setTimeout(function(){
                                        $("img.lazy").lazyload({
                                            appear: function() {
                                                $(this).attr('style', '').removeClass('lazy');
                                            }
                                        });
                                    },50);

                                    if (_callback) {
                                        _callback.call();
                                    }
                                    this.loading = false;
                                    lgFilter.filter.page = 1;

                                    if ($('body').hasClass('is-mobile')) {
                                        var _mTotalCount = $('.product-grid-header').length ? $('.product-grid-header').find('.total span').text() : me.form.attr("data-total-count");
                                        var _countNumber = me.form.data("view-length") == null ? 6 : me.form.data("viewLength");
                                        var page_limit = Math.ceil(parseInt(_mTotalCount) / _countNumber)

                                        //console.log(_mTotalCount, _countNumber);

                                        if (page_limit > 1) {
                                            $(moreButton).show();
                                            //console.log("show");
                                        } else {
                                            $(moreButton).hide();
                                            //console.log("hide");
                                        }
                                    }
                                    
                                    /*LGECI-2710, LGECI-2811 : 20170626 modify */
                                    if(_BVRatingFlag.length && _BVRatingFlag.val() == "Y"){
                                    	// product list
                                    	$('.product-lists').each(setBVRatings);              	
                                    }
                                    if(lgFilter.locale =="ca_en" || lgFilter.locale =="ca_fr"){
                                		$('.product-lists li').each(function(){
                                    		if($(this).find(".rating, .compare-check").length == "0") {
                                    			$(this).find(".details").addClass("bundleSet");
                                    		}
                                    	});
                                	}
                                    /*//LGECI-2710, LGECI-2811 : 20170626	 modify */
                                    redot(); // LGEGMO-3850 : 20180306 add
                                }, this),
                                error: $.proxy(function() {
                                    $("html > div.page-dimmed").remove();
                                    alert(errorMsg);
                                })
                            });
                        },
                        clear: function() {
                            me.filter.find('input[type="checkbox"], input[type="radio"]').each($.proxy(function(idx, el) {
                                $(el).removeAttr("checked").parent().not(".swatch").removeClass("red");
                                $(el).removeAttr("checked").parent().removeClass("active");
                                $(el).removeAttr('disabled').css('cursor', 'pointer').parent().removeClass('disable').css('cursor', 'pointer');
                            }, this));

                            this.applyFilter();
                        }
                    }
                    return rtobj;
                }
            })
            //sub category filter
        if (filterForm.is('form')) {
            setTimeout(function() {
                var formFilter = filterForm.productFilter();
                formFilter.init();
            }, 150);
        }

        // chosen
        // if ($('.sort select').is('select') && !$('body').hasClass('is-mobile')) {
        //     console.log('sdfsdf')
        //     $('.sort select').chosen({
        //         disable_search_threshold: 10
        //     });
        // }

        // if ($('.refind-your-search .refind-apply-btn select').is('select')) {
        //     $('.refind-your-search .refind-apply-btn select').chosen({
        //         disable_search_threshold: 10
        //     });
        // };

        if ($(".refind-your-search label.swatch").length > 0) {
            $(".refind-your-search label.swatch").each(function(i) {
                var checkbox = $(this).find("input[type='checkbox']");
                if (checkbox.length > 0 && checkbox.attr("title").indexOf("{color}")) {
                    var colorS = checkbox.data("colorname");
                    checkbox.attr('title', checkbox.attr('title').replace("{color}", colorS));
                };
            });
        };

        //add comma
        function formatCommas(numString) {
            var re = /,|\s+/g;
            numString = numString.replace(re, "");
            re = /(-?\d+)(\d{3})/;
            while (re.test(numString)) {
                numString = numString.replace(re, "$1,$2");
            }
            return numString;
        }
        /*
            checkOptionDraw
            @param options String
            @param _val String
        */

        function rtOptions(o, idx) {
            var d = null;
            for (var i = 0; i < o.length; i++) {
                if (i == idx) {
                    var a = $.map(o[i], function(k, v) {
                        d = [v, k];
                    });
                }
            };
            return d;
        }

        function remakeArr(o) {
            var idx = 0;
            var tmp = [];
            var rturnArr = [];
            var str;
            var end = optionsLen(o) - 1;

            $.each(o, function(key, value) {
                key = key + " ";
                //console.log(idx, end)
                if (idx == end) {
                    str = "'" + key + "'" + ":" + '"' + value + '"';
                } else {
                    str = "'" + key + "'" + ":" + '"' + value + '",';
                }
                if (key.toLowerCase().indexOf('min') != -1) {
                    rturnArr.push(str)
                }
                tmp.push(str)
                idx++;
            })

            //tmp = JSON.parse(JSON.stringify(tmp));
            $.each(tmp, function(idx) {
                if (tmp[idx].split(':')[0].toLowerCase().indexOf('min') == -1) {
                    rturnArr.push(tmp[idx])
                }
            })
            rturnArr = "{" + rturnArr.join('') + "}";
            rturnArr = JSON.parse(JSON.stringify(rturnArr));
            rturnArr = eval("(" + rturnArr + ")");
            return rturnArr;
        }

        function jsonObjCheck(o) {
            var k = 0;
            var i = 0;
            var remake = false;
            for (var key in o) {
                if (!remake && k == 0 && key != "min") {
                    o = remakeArr(o);
                    remake = true;
                }
                k++;
            }
            return o;
        }

        function optionsLen(o) {
            var i = 0;
            for (var key in o) {
                i++;
            }
            return i;
        }

        function findOptionIdx(arraytosearch, valuetosearch) {
            // console.log(o+", "+val)
            // var i= 0;

            // for (var key in o){
            //  if(o[key] == val){
            //      return i;
            //  }
            //  i++;
            // }
            var b = null;
            for (var i = 0; i < arraytosearch.length; i++) {
                $.each(arraytosearch[i], function(s, t) {
                    if (valuetosearch != 0 && valuetosearch == t) {
                        b = i;
                    }
                });
            }
            return b;
        }

        function findOptionKey(arraytosearch, valuetosearch) {
            var b = null;
            for (var i = 0; i < arraytosearch.length; i++) {
                $.each(arraytosearch[i], function(t, s) {
                    if (valuetosearch == t) {
                        b = s;
                    }
                });
            }

            return b;
        }

        function checkOptionDraw(options, _val, isSlider, zero) {
            if ($('.refind-your-search').hasClass("discontinued")) return false; //theJ
            var target = $('.apply-filters');
            var closeTxt = '';
            if (target.data('title-close')) closeTxt = target.data('title-close');
            var tempHtml = '<span>{value} <a href="#" title="' + closeTxt + '"><i class="icon icon-close"></i></a></span>';
            var tempHtmlEtc = '<span class="etc">{value} <a href="#"><i class="icon icon-close"></i>' + closeTxt + '</a></span>';
            var _arr = [];
            options = $.trim(options);

            if(!isSlider && !_val.data("colorname")){
                options = _val.val()+"|"+options;
            }

            if (checkedOptions[options]) {
                if (isSlider) {
                    if ($(zero).hasClass('zero')) {
                        var deleteIdx = 0;
                        $.each(checkedOptions, function(key, value) {
                            //console.log(checkedOptions, deleteIdx)
                            if (options == key) {
                                //console.log(3)
                                target.find('span').eq(deleteIdx).remove();
                                return false;
                            }
                            deleteIdx++;
                        })
                        delete checkedOptions[options];
                    } else {
                        checkedOptions[options] = _val;
                    }
                } else {
                    delete checkedOptions[options];
                }
                for (var key in checkedOptions) {
                    if (typeof checkedOptions[key] !== 'object') {
                        _arr.push(tempHtml.replace('{value}', key + ":" + checkedOptions[key]));
                    } else {
                        if(checkedOptions[key].data("colorname")){
                            _arr.push(tempHtml.replace('{value}', key));
                        }else{
                            _arr.push(tempHtml.replace('<span>{value}', "<span data-filter-value=\""+checkedOptions[key].val()+"\">"+key.split("|")[1]));
                        }
                    }
                }
                target.html(_arr.join(''))
            } else {
                if (isSlider) {
                    if ($(zero).hasClass('zero')) {} else {
                        checkedOptions[options] = _val;
                    }
                } else {
                    checkedOptions[options] = _val;
                }
                for (var key in checkedOptions) {
                    if (typeof checkedOptions[key] !== 'object') {
                        _arr.push(tempHtml.replace('{value}', key + ":" + checkedOptions[key]));
                    } else {
                        if(checkedOptions[key].data("colorname")){
                            _arr.push(tempHtml.replace('{value}', key));
                        }else{
                            _arr.push(tempHtml.replace('<span>{value}', "<span data-filter-value=\""+checkedOptions[key].val()+"\">"+key.split("|")[1]));
                        }
                    }
                }
                target.html(_arr.join(''));
            }
            target.find('a').unbind();
            target.find('a').click(function(e) { //delete icon click
                var _optionVal = $.trim($(this).parents('span').text());
                var etc = false;
                /* LGEIS-1873 20160511 add */
                if ( _optionVal.indexOf(":") > -1 ) {
                    var isFilter = $("div.slide-bar[data-slidername='"+_optionVal.split(":")[0]+"']").parents(".filter-range"); //필터링 끈 원본필터    
                }
                /*var isSize = $(".screen .slide-bar").data("slidername");
                var isPrice = $(".budget .slide-bar").data("slidername");*/            
                /* //LGEIS-1873 20160511 add */
                e.preventDefault();
                if ($(this).parents('span:eq(0)').is('.etc')) {
                    etc = true;
                }
                $(this).parents('span').remove();

                var formFilter = filterForm.productFilter();
                /* LGEIS-1873 20160511 add */
                if (isFilter != undefined) {              
                //if (_optionVal.indexOf(isSize) != -1 || _optionVal.indexOf(isPrice) != -1) {
                    //no description
                    var dragEl = isFilter.find('.slide-bar');
                    var priceTxt = isFilter.find('.first-unit');
                    var priceTxt2 = isFilter.find('.last-unit');
                    var inpPriceMin = isFilter.next('input.inputMin');
                    var inpPriceMax = inpPriceMin.next('input.inputMax');
                    var options = dragbarVal.priceOption;
                    var len = optionsLen(options) - 1;

                    inpPriceMin.removeClass('changed');
                    inpPriceMax.removeClass('changed');
                    var copyArr = JSON.parse(JSON.stringify(lgFilter.filter.get(lgFilter.compareCategory)));
                    var c = lgFilter.filter.pageCategory();
                    for (var i = 0; i < copyArr.length; i++) {
                    	/* LGEAU-2214 20170317 add */
                        if (copyArr[i].indexOf(inpPriceMin.attr("name")) != -1 || copyArr[i].indexOf(inpPriceMax.attr("name")) != -1) {
                        	lgFilter.filter.remove(copyArr[i], c);
                        }
                        /*if (copyArr[i].indexOf('priceMin') != -1 || copyArr[i].indexOf('priceMax') != -1) {
                            lgFilter.filter.remove(copyArr[i], c);
                        }*/
                        /* //LGEAU-2214 20170317 add */
                    }
                    /*if (_optionVal.indexOf(isPrice) != -1) {
                        var dragEl = $('.budget .slide-bar');
                        var priceTxt = $('.budget .first-unit');
                        var priceTxt2 = $('.budget .last-unit');
                        var inpPriceMin = $('input[name=priceMin]');
                        var inpPriceMax = $('input[name=priceMax]');
                        var options = dragbarVal.priceOption;
                        var len = optionsLen(options) - 1;

                        inpPriceMin.removeClass('changed');
                        inpPriceMax.removeClass('changed');
                        var copyArr = JSON.parse(JSON.stringify(lgFilter.filter.get(lgFilter.compareCategory)));
                        var c = lgFilter.filter.pageCategory();
                        for (var i = 0; i < copyArr.length; i++) {
                            if (copyArr[i].indexOf('priceMin') != -1 || copyArr[i].indexOf('priceMax') != -1) {
                                lgFilter.filter.remove(copyArr[i], c);
                            }
                        }
                    } else {
                        var dragEl = $('.screen .slide-bar');
                        var screenTxt = $('.screen .first-unit');
                        var screenTxt2 = $('.screen .last-unit');
                        var inpSizeMin = $('input[name=sizeMin]');
                        var inpSizeMax = $('input[name=sizeMax]');
                        var options = dragbarVal.selectOption;
                        var len = optionsLen(options) - 1;

                        inpSizeMin.removeClass('changed');
                        inpSizeMax.removeClass('changed');

                        var copyArr = JSON.parse(JSON.stringify(lgFilter.filter.get(lgFilter.compareCategory)));
                        var c = lgFilter.filter.pageCategory();
                        for (var i = 0; i < copyArr.length; i++) {
                            if (copyArr[i].indexOf('sizeMin') != -1 || copyArr[i].indexOf('sizeMax') != -1) {
                                lgFilter.filter.remove(copyArr[i], c);
                            }
                        }
                    }*/                   
                    /* //LGEIS-1873 20160511 add */  

                    dragEl.trigger('slideDefault');
                    delete checkedOptions[_optionVal.split(':')[0]];

                    var dragName = $('[data-name="' + _optionVal.split(':')[0].toLowerCase() + '"]').data('dragbar');
                    $('div.sort-box[name="' + dragName + '"]').find('select').removeClass('change');

                    //$(this).sliderSetting(_optionVal.split(':')[0].toLowerCase());

                    if(globalConfig.isMobile) {
                        formFilter.applyFilter();
                    }
                } else {
                    if (etc) {
                        _optionVal = 'Show Just ' + _optionVal;
                    }else if($(this).parents('span').data("filter-value")){
                        _optionVal = $(this).parents('span').data("filter-value") + "|" + _optionVal;
                    }
                    checkedOptions[_optionVal].get(0).checked = false;
                    checkedOptions[_optionVal].trigger('change');
                    if ($('body').hasClass('is-mobile')) {
                        formFilter.applyFilter();
                        var c = lgFilter.filter.pageCategory();
                        lgFilter.filter.remove($(checkedOptions[_optionVal]).attr('value'), c);
                    }
                    delete checkedOptions[_optionVal];
                }
                return false;
            })
        }
        /*
            refineDragbar
            @param options String
        */

        function refineDragbar() {
            //if($('.refind-your-search .column1').length>0 && $('.refind-your-search .column1 input[type="checkbox"]').get(0)){
            if ($('.refind-your-search .column1').length > 0) {
                var thisForm = $('.refind-your-search .column1 input')[0];
                var viewAll = ($("html").data("compare-category"));
                var formEl = filterForm;

                //console.log(thisForm)
                thisForm = thisForm ? thisForm.form : $('.refind-your-search input')[0].form;

                //dragBar setting
                var screenType = 'selectOption';
                /* model */
                var dragtarget = $('.screen .slide-bar');
                var screenTxt = $('.screen .first-unit');
                var screenTxt2 = $('.screen .last-unit');
                var priceTxt = $('.budget .first-unit');
                var priceTxt2 = $('.budget .last-unit');
                var dagtarget2 = $('.budget .slide-bar');

                /* hidden input model */
                var inpSizeMin = $('input[name=sizeMin]');
                var inpSizeMax = $('input[name=sizeMax]');
                var inpPriceMin = $('input[name=priceMin]');
                var inpPriceMax = $('input[name=priceMax]');

                /* screen */
                var formFilter = filterForm.productFilter();
                var isDeskTop = !$('body').hasClass('is-mobile');
                if (!dragtarget[0] && !dagtarget2[0] && !$('.refind-your-search .column1 input')[0]) {
                    return false;
                }
            }
        }

        //refine fixed
        function refineFixed() {
            var hei = false;
            $('.refind-apply-btn .refine').unbind('click').click(function() { // 2015-06-10 change class
                $('.sticky-wrap').removeClass('hide');
                $('.column1').removeClass('hide');
                $('.column2').addClass('hide');

                var holder = $('.compare-view-item-holder');
                var target = $('.sticky-wrap');

				$('section.refind-your-search').addClass("filter-open"); /* LGEPJT-366 add 2018-12-12 */

                /* LGEPJT-337 modify */
                if (!hei) {
                    hei =  ($(".refind-apply-answer-holder").size()>0) ? $(".refind-apply-answer-holder").offset().top  : $('.refind-apply-answer-btn').offset().top;
                    $(window).scroll(function() {
                        hei =  ($(".refind-apply-answer-holder").size()>0) ? $(".refind-apply-answer-holder").offset().top : $('.refind-apply-answer-btn').offset().top;
                        if (!$('.sticky-wrap').is('.hide')) {
                            if ($(window).scrollTop() > hei && $(window).scrollTop() < hei + $('section.refind-your-search').outerHeight() - (target.hasClass('sticky')?target.outerHeight()+2:40)) { /* LGEPJT-366 modify 2018-12-12 */
                                holder.addClass('on');
                                target.addClass('sticky');
                            } else {
                                holder.removeClass('on');
                                target.removeClass('sticky');
                            }
                        }
                    });
                }
                
                if (!$(".sticky-wrap").hasClass("sticky")) {
                    var $stiHeight = $(".refind-apply-answer-btn").outerHeight();
                    if($('section.refind-your-search').size()>0){
                        $('html, body').stop(true).animate({ scrollTop: $('section.refind-your-search').offset().top - $stiHeight + 1 }, 300);  
                    }
                } else {
                    if($('section.refind-your-search').size()>0){
                       $('html, body').stop(true).animate({ scrollTop: $('section.refind-your-search').offset().top  + 1 }, 300); 
                    }
                }
                /*// LGEPJT-337 modify */

                return false;
            })

            //active
            $('.refind-apply-answer-btn a:eq(0)').click(function() {
                    var formFilter = filterForm.productFilter();
                    var c = lgFilter.filter.pageCategory();

                    checkedOptions = {};
                    $('.apply-filters').html('');

                    $('fieldset.form').find('input, select').each($.proxy(function(idx, el) {
                        var chkT;
                        var item = $(el);
                        var itemAttr = "";
                        var cookieVal = "";
                        var d = item.val();

                        if (item.is('input[type=checkbox]')) {
                            if (item.prop("checked")) {
                                itemAttr = "checked";

                                var colorW, colorS;
                                (item.parent().prevAll('legend:first').find('a').length > 0) ? colorW = document.getElementById(item.parent().prevAll('legend:first').attr('id')).childNodes[0].nodeValue: colorW = $.trim(item.parent().prevAll('legend:first').text());

                                if (item.parent().hasClass('swatch')) {
                                    colorS = item.data("colorname");
                                } else {
                                    colorS = item.next('span').text();
                                }

                                if (!lgFilter.clearFilterCookie && filterForm.data('search-category')) {
                                    lgFilter.filter._cSet(lgFilter.filter.CARTS, '');
                                    lgFilter.clearFilterCookie = true;
                                }

                                var copyArr = JSON.parse(JSON.stringify(lgFilter.filter.get(lgFilter.compareCategory)));

                                for (var i = 0; i < copyArr.length; i++) {
                                    if (copyArr[i].indexOf(item.val()) != -1) {
                                        lgFilter.filter.remove(copyArr[i], c);
                                    }
                                }

                                // chkT = 'Select'+ ' ' + colorS; /* 20140519 choyearang modify */
                                // item.attr('title',chkT);
                                checkOptionDraw(colorS, item);
                                lgFilter.filter.add((d), c);
                            }
                        } else if (item.is('select') && item.hasClass('change')) {

                            var itemAttr;
                            (item.find('option[value=' + item.val() + ']').is(':selected')) ? itemAttr = 'selected': itemAttr = '';

                            // 151112 slider-select cookie
                            if (item.data('index') >= 0) {

                                var capacity = null,
                                    copyArr = JSON.parse(JSON.stringify(lgFilter.filter.get(lgFilter.compareCategory))),
                                    slide = item.parents('.slide-box').find('.slide-bar'),
                                    inputBox = slide.data('input').split(','),
                                    slideText = slide.data('name');

                                for (var i = 0; i < copyArr.length; i++) {
                                    if (copyArr[i].indexOf(slideText) != -1) {
                                        lgFilter.filter.remove(copyArr[i], c);
                                    }
                                }

                                if (slide.hasClass('zero') == false) {

                                    $.each(inputBox, function(index) {

                                        var inputValue = $.trim(this);

                                        lgFilter.filter.add((inputValue + ':' + $('input[name="' + inputValue + '"]').val()), c);

                                        lgFilter.clearFilterCookie = true;

                                    });

                                }


                                var n = slide.data("slidername");
                                var slideBox = item.parents('.slide-box');

                                if (slide.data('double')) {
                                    checkOptionDraw(n, $.trim(slideBox.find('.first-unit').text()) + "-" + $.trim(slideBox.find('.last-unit').text()), true, slide);
                                } else {
                                    checkOptionDraw(n, $.trim(slideBox.find('.first-unit').text()), true, slide);
                                }

                            }
                        }

                        //$.cookie(item.attr('value'), cookieVal, 1);
                    }, this));

                    // $('input[type=hidden]').each(function() {
                    //     var item = $(this);

                    //     if (item.is('.changed')) {
                    //         if (item.attr('name').indexOf('size') != -1) { //size

                    //             var screenTxt = $('.screen .first-unit');
                    //             var screenTxt2 = $('.screen .last-unit');
                    //             var n = $('.screen .slide-bar').data("slidername");
                    //             checkOptionDraw(n, $.trim(screenTxt.text()) + "-" + $.trim(screenTxt2.text()), true);
                    //         } else { //price
                    //             var priceTxt = $('.budget .first-unit');
                    //             var priceTxt2 = $('.budget .last-unit');
                    //             var n = $('.budget .slide-bar').data("slidername");
                    //             checkOptionDraw(n, $.trim(priceTxt.text()) + "-" + $.trim(priceTxt2.text()), true);
                    //         }
                    //     }
                    // });

                    formFilter.applyFilter();

                    $('.sticky-wrap').addClass('hide');
                    $('.column1').addClass('hide');
                    $('.column2').removeClass('hide');

					$('section.refind-your-search').removeClass("filter-open"); /* LGEPJT-366 add 2018-12-12 */

                    /* LGEPJT-337 : 20171121 add */
                    if($("body").hasClass("is-mobile")) {
                        stickRefindEvt();
                    }

                    return false;
                })
                //cancel
            $('.refind-apply-answer-btn a:eq(1)').click(function() {
                $('.sticky-wrap').addClass('hide');
                $('.column1').addClass('hide');
                $('.column2').removeClass('hide');
				$('section.refind-your-search').removeClass("filter-open"); /* LGEPJT-366 add 2018-12-12 */
                $('input[type=hidden]').removeClass('changed');
                if ($(".slide-bar").length > 0) {
                    var dragEl = $('.budget .slide-bar');
                    var priceTxt = $('.budget .first-unit');
                    var priceTxt2 = $('.budget .last-unit');
                    var inpPriceMin = $('input[name=priceMin]');
                    var inpPriceMax = $('input[name=priceMax]');
                    var options = dragbarVal.priceOption;
                    var len = optionsLen(options) - 1;
                    inpPriceMin.removeClass('changed');
                    inpPriceMax.removeClass('changed');
                    dragEl.trigger('slideDefault');

                    var dragEl = $('.screen .slide-bar');
                    var screenTxt = $('.screen .first-unit');
                    var screenTxt2 = $('.screen .last-unit');
                    var inpSizeMin = $('input[name=sizeMin]');
                    var inpSizeMax = $('input[name=sizeMax]');
                    var options = dragbarVal.selectOption;
                    var len = optionsLen(options) - 1;
                    inpSizeMin.removeClass('changed');
                    inpSizeMax.removeClass('changed');
                    dragEl.trigger('slideDefault');
                }

                /* LGEPJT-337 : 20171121 add */
                if($("body").hasClass("is-mobile")) {
                    stickRefindEvt();
                }

                return false;
            })
        }
        // 2015-05-18
        /* Compare Slide */
        // 2015-06-03
        function compareSlide() {
            var _wrap = $('.compare-view-item .item-view');
            var slideTarget = _wrap.find('.item-list');
            var targetSub = $('.compare-item-info .info-cont-view');
            var technical = $('.compare-item-info .info-technical .info-cont-list'); /* LGEPJT-337 : 20171121 add */
            var viewport = _wrap.find('.view-cont');
            var prevBtn = _wrap.find('.view-control .btn-prev');
            var nextBtn = _wrap.find('.view-control .btn-next');
            var distance = slideTarget.find('> li').eq(0).outerWidth();
            var ulWidth = slideTarget.find('> li').length * distance;
            var liLength = slideTarget.find('> li').length;
            var maxPos = ulWidth - viewport.width();
            var liIndex = 0;
            var speed = 400;

            slideTarget.data({"liLength":liLength, "liIndex":liIndex});

            var resizeSlide = function() {
                var viewportWidth = viewport.width(),
                    contTitel = $('.compare-item-info .info-list'),
                    contWrap = $('.compare-item-info .info-list .info-cont'),
                    nowPos = parseInt(slideTarget.css('margin-left')),
                    ulWidth = slideTarget.find('> li').length * distance,
                    viewportCom = 620;

                liLength = slideTarget.find('> li').length;

                /*
                contTitel.each(function(index){
                    var contWrapH = contTitel.eq(index).height();
                    contWrap.eq(index).css('min-height', contWrapH + 'px');
                });
                */
                if (_wrap.hasClass('view-lock')) {
                    viewportCom = 615;
                }
                if (viewportWidth > 401) {
                    if (viewportWidth < viewportCom) {
                        if (liLength >= 4) {
                            var marginL;
                            marginL = parseInt(-(ulWidth - (distance * 3)));
                        } else {
                            var marginL = 0;
                            prevBtn.css('display', 'none');
                            nextBtn.css('display', 'none');
                        }

                        if (nowPos < marginL) {
                            slideTarget.stop().animate({
                                'margin-left': marginL
                            }, speed)
                            targetSub.stop().animate({
                                'margin-left': marginL
                            }, speed)
                        } else if (nowPos == marginL) {
                            nextBtn.css('display', 'none');
                        } else {
                            if (liLength < 4) {
                                nextBtn.css('display', 'none');
                            } else {
                                nextBtn.css('display', '');
                            }
                        }
                    } else {
                        if (liLength >= 5) {
                            var marginL;
                            marginL = parseInt(-(ulWidth - (distance * 4)));
                        } else {
                            var marginL = 0;
                            prevBtn.css('display', 'none');
                            nextBtn.css('display', 'none');
                        }

                        if (nowPos < marginL) {
                            slideTarget.stop().animate({
                                'margin-left': marginL
                            }, speed)
                            targetSub.stop().animate({
                                'margin-left': marginL
                            }, speed)
                        } else if (nowPos == marginL) {
                            nextBtn.css('display', 'none');
                        } else {
                            if (liLength < 5) {
                                nextBtn.css('display', 'none');
                            } else {
                                nextBtn.css('display', '');
                            }
                        }
                    }
                } else {
                    var marginL;
                    marginL = parseInt(-(ulWidth - (distance * 2)));
                    if (liLength < 2) {
                        var marginL = 0;
                        prevBtn.css('display', 'none');
                        nextBtn.css('display', 'none');
                    }
                    if (nowPos < marginL) {
                        slideTarget.stop().animate({
                            'margin-left': marginL
                        }, speed)
                        targetSub.stop().animate({
                            'margin-left': marginL
                        }, speed)
                    } else if (nowPos == marginL) {
                        nextBtn.css('display', 'none');
                    }
                    if (nowPos > marginL) {
                        if (liLength < 3) {
                            nextBtn.css('display', 'none');
                            prevBtn.css('display', 'none');
                        } else {
                            nextBtn.css('display', '');
                            if (nowPos < 0) {
                                prevBtn.css('display', '');
                            }
                        }
                    } else {
                        if (liLength < 3) {
                            nextBtn.css('display', 'none');
                            prevBtn.css('display', 'none');
                        }
                    }
                }
            }

            //resizeSlide();

            //length view
            var t = $('.compare-count span.check-singular').data("plural");
            if (liLength <= 1) {
                t = $('.compare-count span.check-singular').data("singular");
            }

            // if ($('body').hasClass('is-mobile')) {
            //     $('.compare-count strong span.count').text(liLength); // 2015-06-01
            //     $('.compare-count span.check-singular').text(t);
            // } else {
            //     $('.compare-count strong span.count').text(liLength); // 2015-06-01
            //     $('.compare-count span.check-singular').text(t);
            // }

            //slideTarget.css('width', ulWidth + 'px');
            function setTabfocus() {
                var nowPos = parseInt(slideTarget.css('margin-left'));
                var viewportWidth = viewport.width(),
                    viewportStart = Math.abs(Math.ceil(nowPos / distance)),
                    viewportRange = Math.ceil(viewportWidth / distance),
                    viewportEnd = viewportStart + viewportRange;
                slideTarget.find("li.item").removeClass("show-item").find("a").attr("tabindex", -1);
                slideTarget.find("li.item").each(function(i) {
                    if (i >= viewportStart && i < viewportEnd) {
                        $(this).addClass("show-item").find("a").removeAttr("tabindex");
                    }
                });
            }

            prevBtn.click(function() {
                var nowPos = parseInt(slideTarget.css('margin-left'));
                if (nowPos != 0 && !slideTarget.is(':animated')) {
                    slideTarget.stop().animate({
                        'margin-left': nowPos + distance
                    }, speed, function() {
                        var lengthViewport = Math.round(parseInt(viewport.width()) / distance); //liLength
                        // alert(lengthViewport +"/"+  (slideTarget.find('> li').length))
                        if (getCompareIndex() + lengthViewport < slideTarget.find('> li').length && lengthViewport < slideTarget.find('> li').length) {
                            nextBtn.css('display', '');
                        }else{
                            nextBtn.css('display', 'none');
                        }
                        if (nowPos >= -distance) {
                            prevBtn.css('display', 'none');
                        }
                        setTabfocus();
                    })
                    targetSub.stop().animate({
                        'margin-left': nowPos + distance
                    }, speed);

                    setCompareIndex(getCompareIndex()-1);
                };
                return false;
            })

            nextBtn.click(function() {
                viewport = _wrap.find('.view-cont');
                liLength = slideTarget.find('> li').length;
                ulWidth = slideTarget.find('> li').length * distance;

                var nowPos = parseInt(slideTarget.css('margin-left')),
                    maxPos = -(ulWidth - viewport.width() - distance + liLength);

                if (_wrap.hasClass('view-lock')) {
                    maxPos = -(ulWidth - viewport.width() - (distance * 2) + liLength);
                }
                if (nowPos >= maxPos && !slideTarget.is(':animated')) {
                    slideTarget.stop().animate({
                        'margin-left': nowPos - distance
                    }, speed, function() {
                        if (prevBtn.css('display') == 'none') {
                            prevBtn.css('display', '');
                        }
                        if (nowPos <= maxPos + distance) {
                            nextBtn.css('display', 'none');
                        }
                        setTabfocus();
                    })
                    targetSub.stop().animate({
                        'margin-left': nowPos - distance
                    }, speed)



                    setCompareIndex(getCompareIndex()+1);
                }
                return false;
            })

            var resizeTimer;

            /* LGEGMO-1741 */
            var cachedWidth = viewport.width();
            /* LGEGMO-1741 */



            $(window).resize(function() {
                /* LGEGMO-1741 */
                var newWidth = viewport.width();

                if(cachedWidth == newWidth){
                    return false;
                }
                cachedWidth = newWidth;
                /* LGEGMO-1741 */

                if(globalConfig.isMobile) {
                    resizeSlide();
                    compareNextBtn();
                }
                clearTimeout(resizeTimer)
                resizeTimer = setTimeout(function() {
                    //console.log("$(window).width()::"+$(window).width()+"  screen.width::"+screen.width);
                    var window_changed = $(window).width() != screen.width;
                    if (window_changed) {
                        compareNextBtn();
                        setTabfocus();
                    }
                }, 50)
                /* LGEPJT-337 : 20171121 add */
                distance = slideTarget.find('> li').eq(0).outerWidth();
                liIndex = 0;
                //prevBtn.css('display', 'none'); //bm remove
                //nextBtn.css('display', ''); //bm remove
                slideTarget.stop().animate({'margin-left' : 0}, 400);
                targetSub.stop().animate({'margin-left' : 0}, 400);
                specsModeChange(true);
                /* //LGEPJT-337 : 20171121 add */
            });

            // //2015-06-03

            //REMOVE EVENT
            $(document).on("click", ".item-list .item-uitls li:last-child a", function(){ /* LGEPJT-337 : 20171121 modify */
                var pid = $(this).data('product-id'); //theJ
                var target = $(this).parents('.item');
                var _idx = target.index();
                var item = $(this);
                //  delete product in list - theJ
                $('.add-to-compare .column2 .response ul.product-lists li').each(function() {
                    var mypid;
                    var my = $(this).find('.copy-area .details .cta-button a');
                    if (my.hasClass('onItem') & my.hasClass('remove-btn')) {
                        mypid = my.data('product-id');
                        if (pid == mypid) {
                            my.parent().find('a.add-btn').css('display', 'inline-block');
                            my.parent().find('a.remove-btn').css('display', 'none');
                        }
                    }
                });

                // focus setting
                var next = target.next()[0] ? target.next()[0] : target.prev()[0];
                if (next) {
                    var nextIndex = $(next).index();
                    setTimeout(function(){$(next).find('.item-uitls li:last-child a').focus()}, 450);
                } else {
                    $('.compare-view-left .change-btn').focus();
                }

                liLength = slideTarget.find('> li').length;
                /*if(liLength < 3){
                    slideTarget.find('.item-uitls').hide();
                    return false;
                }*/
                target.addClass('hide');
                $('.info-cont-view').each(function() {
                    $(this).find('ul').eq(_idx).addClass('hide')
                })
                target.remove();
                $('.info-cont-view').find('ul.hide').remove();

                if (target.is('.item-lock')) {
                    $('.compare-view-item .compare-item .item-view').removeClass('view-lock');
                    $('.compare-item-info .info-cont').removeClass('cont-lock');
                }

                var e = lgFilter.compare.pageCategory();

                var d = item.data("product-id");

                lgFilter.compare.remove((d), e);
                //length view
                var t = $('.compare-count span.check-singular').data("plural");
                if (liLength - 1 <= 1) {
                    t = $('.compare-count span.check-singular').data("singular");
                }

                if ($('body').hasClass('is-mobile')) {
                    $('.compare-count strong span.count').text(liLength - 1);
                    $('.compare-count span.check-singular').text(t);
                } else {
                    $('.compare-count strong span.count').text(liLength - 1);
                    $('.compare-count span.check-singular').text(t);
                }

                //resizeSlide(); // 2015-06-03

                //if(liLength == 0){
                if (liLength <= 1) {
                    $('.compare-item-info').remove();
                    $(window).unbind('scroll');
                }
                $('.accordion-control .choice-control dd:not(.selected)').eq(0).trigger('click');

                //console.log("REMOVE::"+ _idx);
                //console.log("lock 한 것이 있고, 마지막것이 아니며, remove _idx 가 .item-lock 한 li 보다 뒤면 인덱스 하나 빠짐 : nextIndex-1");
                var lockIndex = slideTarget.find('>li.item-lock').index();
                if(lockIndex > -1 && _idx > lockIndex && _idx < slideTarget.find('> li').length){
                    compareNextBtn(nextIndex-1);
                }else{
                    compareNextBtn(nextIndex);
                }
                
                return false;
            })

            $('.item-uitls').find('li:first-child a').each(function() {
                for (var k = 0; k < lgFilter.compareLOCK.get(lgFilter.compareCategory).length; k++) {
                    var modelID = lgFilter.compareLOCK.get(lgFilter.compareCategory)[k];
                    if ($(this).data('product-id') == modelID) {
                        compareLock($(this).parents('li.item').index());
                    }
                }
            });
            setTabfocus();
        }

		/* LGEPJT-337 : 20171121 add */
		function setHeight(){
			var itemWrap = $('.compare-view-item .item-view .item-list');
			var wrapHeight = $(itemWrap).outerHeight();
			var itemHeight = $(itemWrap).find('.item:first-child').outerHeight();

			$(itemWrap).height(itemHeight + "px");
		};
		/* //LGEPJT-337 : 20171121 add */

        // liIndex setter getter
        function setCompareIndex(index){
            var slideTarget = $('.compare-view-item .item-view .item-list');
            var liLength = slideTarget.data("liLength");
            var liIndex = slideTarget.data("liIndex");

            if(index >= 0 && index < liLength) slideTarget.data("liIndex", index);
            //console.log("liIndex::"+slideTarget.data("liIndex"));
        }

        function getCompareIndex(){
            var slideTarget = $('.compare-view-item .item-view .item-list');
            var index = parseInt(slideTarget.data("liIndex"));
            return index;
        }

        // //2015-05-18
        // 2015-05-22
        function compareNextBtn(nextIndex) {
            var _wrap = $('.compare-view-item .item-view');
            var slideTarget = _wrap.find('.item-list');
            var slideTarget2 = $('.compare-item-info .info-cont .info-cont-view');
            var viewport = _wrap.find('.view-cont');
            var liLength = slideTarget.find('> li:not(".item-lock")').length;
            var prevBtn = _wrap.find('.view-control .btn-prev');
            var nextBtn = _wrap.find('.view-control .btn-next');
            var viewportWidth = viewport.width();
            var wLeft = parseInt(parseInt(slideTarget.css('margin-left')) * -1);
            var distance = parseInt(slideTarget.find('> li').eq(0).outerWidth());
            var cLeft = Math.round(wLeft / distance);
            var c = "none";
            var n = Math.round(parseInt(viewport.width()) / distance);
            var nextIndex = nextIndex ? nextIndex : 0;  //삭제되기 전의 li 인덱스
            

            //console.log("compareNextBtn::::  nextIndex::"+nextIndex);

            if(liLength <= 0){
                prevBtn.css("display", "none");
                nextBtn.css("display", "none");
                return false;
            }
            var tgPos;
            var tgIndex;

            if(liLength - nextIndex >= n){
                tgIndex = Math.max(nextIndex - 1, 0);
            } else{
                tgIndex = Math.max(liLength - n, 0);
            }

            tgPos = tgIndex * distance * -1;

            slideTarget.stop().animate({
                'margin-left': tgPos
            }, 400);
            slideTarget2.stop().animate({
                'margin-left': tgPos
            }, 400);

            function setButton(){
                prevBtn.css("display", "block");
                nextBtn.css("display", "block");

                if(tgIndex <= 0){
                    prevBtn.css("display", "none");
                }
                if(tgIndex + n >= liLength){
                    nextBtn.css("display", "none");
                }
            }
            
            setButton();
            setCompareIndex(tgIndex);

            
            // if one, remove unlock
            if (liLength < 2) {
                $('.compare-view-item .compare-item .view-cont .item-list .item.item-lock .item-uitls li').eq(0).find('a').trigger('click');
            }
        }
        // //2015-05-22
        // 2015-05-17
        //Compare lock
        function compareLock(thisIndex) {

            var _wrap = $('.compare-view-item .compare-item .item-view'),
                list = _wrap.find('.item'),
                contWrap = $('.compare-item-info .info-list .info-cont'),
                contList = contWrap.find('.info-cont-list'),
                contTitel = $('.compare-item-info .info-list');
            var lock = list.parent().data('change-text').split('|')[0];
            var unlock = list.parent().data('change-text').split('|')[1];

            _wrap.addClass('view-lock');
            contWrap.addClass('cont-lock');
            /* 2015-06-03 */
            if (list.length == 1) {
                _wrap.addClass('view-lock-one');
                contWrap.addClass('cont-lock-one');
                contTitel.each(function(index) {
                    var contWrapH = contTitel.eq(index).height();
                    contWrap.eq(index).css('min-height', contWrapH + 'px');
                });
            }
            /* //2015-06-03 */
            list.find('.item-uitls > li').removeClass('hide');
            list.removeClass('item-lock').find('.item-uitls > li:first-child a').text(lock);
            contList.removeClass('info-cont-lock');
            list.eq(thisIndex).addClass('item-lock').find('.item-uitls > li:first-child a').text(unlock);
            //list.eq(thisIndex).find('.item-uitls > li:last-child').addClass('hide');
            contWrap.each(function() {
                $(this).find('.info-cont-list').eq(thisIndex).addClass('info-cont-lock');
            });
        }
        //Compare unlock
        function compareUnLock() {
            var _wrap = $('.compare-view-item .compare-item .item-view'),
                list = _wrap.find('.item'),
                contWrap = $('.compare-item-info .info-list .info-cont'),
                contList = contWrap.find('.info-cont-list');
            var lock = list.parent().data('change-text').split('|')[0];

            _wrap.removeClass('view-lock');
            contWrap.removeClass('cont-lock');
            //list.find('.item-uitls > li').removeClass('hide');
            list.removeClass('item-lock').find('.item-uitls > li:first-child a').text(lock);
            contList.removeClass('info-cont-lock');
        }
        // //2015-05-17

        /* Technical Specifications toggle action */
        function technicalExpand() {
            var allView = $('.compare-item-info .all-view');
            var allClose = $('.compare-item-info .all-close');
            var anker = $('.compare-item-info .info-list-title a');
            var inCont = $('.compare-item-info .info-technical');
            var fontIcon = inCont.find('.info-list-title i.icon');

            allView.unbind();
            allClose.unbind();
            anker.unbind();

            allView.click(function() {
                $(this).hide();
                allClose.show().focus();
                anker.addClass('hidden-title');
                anker.removeClass('view-title');
                inCont.removeClass('techmical-hidden');
                fontIcon.removeClass('icon-tab-plus');
                fontIcon.addClass('icon-tab-minus');
                if ($('.refind-your-search').hasClass('hide')) {
                    $("html, body").animate({
                        scrollTop: 290 + parseInt($('.info-summary').height())
                    }, 500);
                }
                return false;
            })
            allClose.click(function() {
                $(this).hide();
                allView.show().focus();
                anker.addClass('view-title');
                anker.removeClass('hidden-title');
                inCont.addClass('techmical-hidden');
                fontIcon.removeClass('icon-tab-minus');
                fontIcon.addClass('icon-tab-plus');
                if ($('.refind-your-search').hasClass('hide')) {
                    $("html, body").animate({
                        scrollTop: 290 + parseInt($('.info-summary').height())
                    }, 500);
                }

                return false;
            })
            anker.click(function() {
                $(this).toggleClass('hidden-title').toggleClass('view-title');
                $(this).parents('.info-technical').toggleClass('techmical-hidden');
                $(this).find('i.icon').toggleClass('icon-tab-plus').toggleClass('icon-tab-minus');

                var hideStat = $('.compare-item-info .info-list-title .view-title').length;

                if (hideStat == anker.length) {
                    if (allClose.is(':visible')) {
                        allClose.hide();
                        allView.show();
                    }

                } else {
                    if (allView.is(':visible')) {
                        allClose.show();
                        allView.hide();
                    }
                }

                return false;
            })
                //allView.trigger('click');//2015-05-20
        }

        function specsModeChange(reinit) {
            if ($('body').hasClass('is-mobile')) {

                var HeitSync = function() { /* LGEPJT-337 : 20171121 modify */
					/* LGEPJT-337 : 20171121 remove
                    $('.info-summary .info-title').each(function() {
                        var titleUL = $(this);
                        var len = titleUL.find('li').length;
                        var maxHeight = 0;
                        var liGroup = [];
                        for (var i = 0; i < len; i++) {
                            maxHeight = 0;
                            liGroup.push(titleUL.find('li').eq(i))
                            maxHeight = titleUL.find('li').eq(i).innerHeight();
                            titleUL.next().find('.info-cont-list').each(function(idx) {
                                var descUL = $(this);
                                var hei = descUL.find('li').eq(i).innerHeight()
                                liGroup.push(descUL.find('li').eq(i))
                                if (maxHeight < hei) {
                                    maxHeight = hei;
                                }
                            })
                            $.each(liGroup, function(idx) {
                                if (maxHeight < 56) {
                                    maxHeight = 56;
                                }
                                $(this).css('height', maxHeight + 'px');
                            })
                            liGroup = [];
                        }
                        $(this).find('li').wrapInner('<span>');
                    }) //LGEPJT-337 : 20171121 remove */

                    $('.info-technical .info-title').each(function() {
                        var titleUL = $(this);
                        var len = titleUL.find('li').length;
                        var maxHeight = 0;
                        var liGroup = [];
                        /* LGEPJT-337 : 20171121 add */
                        if (reinit) {
                            titleUL.find('li').css('height', '');
                            titleUL.next().find('.info-cont-list li').css('height', '');
                        }
                        /* //LGEPJT-337 : 20171121 add */
                        for (var i = 0; i < len; i++) {
                            maxHeight = 0;
                            titleUL.next().find('.info-cont-list').each(function(idx) {
                                var descUL = $(this);
                                var hei = descUL.find('li').eq(i).innerHeight()
                                liGroup.push(descUL.find('li').eq(i))
                                if (maxHeight < hei) {
                                    maxHeight = hei;
                                }
                            })
                            $.each(liGroup, function(idx) {
                                if (maxHeight < 56) {
                                    maxHeight = 56;
                                }
                                var $titHei =  (titleUL.find("li").eq(i).outerHeight() - 30 > 0 ) ? titleUL.find("li").eq(i).outerHeight() - 30 : 0 ; /* LGEPJT-337 : 20171127 add */
                                $(this).css('height', maxHeight + 'px');
                                $(this).css('marginTop', $titHei);/* LGEPJT-337 : 20171127 add */
                            })
                            titleUL.find('li').eq(i).css('margin-bottom', maxHeight - 30); /* LGEPJT-337 : 20171121 modify */
                            liGroup = [];
                        }
                    })
                }
                HeitSync(); 
                /* //LGEPJT-337 : 20171121 modify */
                var selectionAnker = $('.accordion-control .choice-control dd:not(.selected)').eq(2);
                var checkLen = $('.info-technical input[type=checkbox]:checked').length;

                var disableLink = function() {

                    if (!checkLen) {
                        selectionAnker.addClass('disabled');
                    } else {
                        selectionAnker.removeClass('disabled');
                    }
                }
                disableLink();

                //style set
                var paddingLeft = $(".accordion-control .choice-control dt").width();
                $(".accordion-control .choice-control dd:nth-child(2) ~ ").css("padding-left", paddingLeft+"px");


                $('.accordion-control .choice-control dd:not(.selected)').click(function() {
                    if (!checkLen && $(this).index() == 4) {
                        return false;
                    }
                    $('.accordion-control .choice-control dd.selected a').text($(this).text());
                    $('.accordion-control .choice-control dd.selected').removeClass('clicked').siblings('dd').addClass('hide');

                    switch ($(this).index()) {
                        case 2:
                            $(this).parents('.compare-item-info').removeClass().addClass('compare-item-info mode-all');
                            $(this).parents('.compare-item-info').find('.diff').removeClass('diff');
                            $('.compare-item-info .info-technical').removeClass('hide');
                            break;
                        case 3:
                            $('.info-cont-view').each(function() {
                                var wrap = $(this);
                                $(this).find('ul:eq(0) li').each(function(_idx) {
                                    if ($(this).find('img').length) {
                                        var oldTxt = $(this).find('img').attr('alt');
                                    } else {
                                        var oldTxt = $(this).text();
                                    }
                                    wrap.find('ul').each(function() {
                                        var _ul = $(this);
                                        if (_ul.find('li').eq(_idx).find('img').length) {
                                            var _text = _ul.find('li').eq(_idx).find('img').attr('alt');
                                        } else {
                                            var _text = _ul.find('li').eq(_idx).text();
                                        }

                                        if (oldTxt != _text) {
                                            wrap.find('ul:eq(0)').find('li').eq(_idx).addClass('diff');
                                        }
                                        oldTxt = _text;
                                    })
                                })
                                wrap.find('ul:eq(0) li.diff').each(function() {
                                    var delIdx = $(this).index();
                                    wrap.find('ul').not(':eq(0)').each(function() {
                                        $(this).find('li').eq(delIdx).addClass('diff')
                                    })
                                })
                            })

                            $(this).parents('.compare-item-info').removeClass().addClass('compare-item-info mode-differences');
                            $('.compare-item-info .info-technical').removeClass('hide');
                            break;
                        case 4:
                            $(this).parents('.compare-item-info').find('.diff').removeClass('diff');
                            $(this).parents('.compare-item-info').removeClass().addClass('compare-item-info mode-selection');
                            $('.compare-item-info .info-technical').each(function() {
                                if (!$(this).find('ul.info-title li.on').length) {
                                    $(this).addClass('hide');
                                }
                            });
                            $("html, body").animate({
                                scrollTop: 370 + parseInt($('.info-summary').height())
                            }, 500);
                            return false;
                            break;
                    }
                    return false;
                })
                $('.accordion-control .choice-control dd.selected').click(function() {
                        if ($(this).is('.clicked')) {
                            $(this).removeClass('clicked').siblings('dd').addClass('hide');
                        } else {
                            $(this).addClass('clicked').siblings('dd').removeClass('hide');
                        }
                        return false;
                    })
                    //selection
                $('.info-technical input[type=checkbox]').click(function() {
                    var target = $(this).parents('li:eq(0)');
                    var idx = target.index();
                    if (target.is('.on')) {
                        target.removeClass('on');
                        checkLen--;
                        $(this).parents('.info-title').next().find('ul').each(function() {
                            $(this).find('li').eq(idx).removeClass('on');
                        })
                    } else {
                        target.addClass('on');
                        checkLen++;
                        $(this).parents('.info-title').next().find('ul').each(function() {
                            $(this).find('li').eq(idx).addClass('on');
                        })
                    }
                    if (!$(this).parents('.info-technical').find('ul.info-title li.on').length) {
                        if ($('.compare-item-info').is('.mode-selection')) {
                            $(this).parents('.info-technical').addClass('hide');
                        }
                    } else {
                        if ($('.compare-item-info').is('.mode-selection')) {
                            $(this).parents('.info-technical').removeClass('hide');
                        }
                    }
                    if (checkLen) {
                        selectionAnker.removeClass('disabled');
                    } else {
                        selectionAnker.addClass('disabled');
                    }
                })
            } else {

                var HeitSync = function(callback) { 
                    /* LGEPJT-337 : 20171121 modify */

                    $('.info-title').each(function() {
                        var titleUL = $(this);
                        var len = titleUL.find('li').length;
                        var maxHeight = 0;
                        var liGroup = [];
						/* LGEPJT-337 : 20171121 add */
                        if (reinit) {
                            titleUL.find('li').css('height', '');
                            titleUL.next().find('.info-cont-list li').css('height', '');
                        }
                        /* //LGEPJT-337 : 20171121 add */
                        for (var i = 0; i < len; i++) {
                            maxHeight = 0;
                            liGroup.push(titleUL.find('li').eq(i))
                            maxHeight = titleUL.find('li').eq(i).innerHeight();
                            titleUL.next().find('.info-cont-list').each(function(idx) {
                                var descUL = $(this);
                                var hei = descUL.find('li').eq(i).innerHeight()
                                liGroup.push(descUL.find('li').eq(i))
                                if (maxHeight < hei) {
                                    maxHeight = hei;
                                }
                            })

                            $.each(liGroup, function(idx) {
                                if (maxHeight < 56) {
                                    maxHeight = 56;
                                }

                                $(this).css('height', maxHeight + 'px');
                            })
                            liGroup = [];
                        }
                    })

                }

                HeitSync(); 
                /* LGEPJT-337 : 20171121 modify */
                var selectionAnker = $('.accordion-control .choice-control dd').eq(2);
                var checkLen = $('.info-technical input[type=checkbox]:checked').length;
                var disableLink = function() {
                    if (!checkLen) {
                        selectionAnker.addClass('disabled');
                    } else {
                        selectionAnker.removeClass('disabled');
                    }
                }
                disableLink();
                $('.accordion-control .choice-control dd').click(function() {
                        if (!checkLen && $(this).index() == 3) {
                            return false;
                        }
                        $(this).addClass('clicked').siblings('dd').removeClass('clicked');

                        switch ($(this).index()) {
                            case 1:
                                $(this).parents('.compare-item-info').find('.diff').removeClass('diff');
                                $(this).parents('.compare-item-info').removeClass().addClass('compare-item-info mode-all');
                                $('.compare-item-info .info-technical').removeClass('hide');
                                break;
                            case 2:
                                $('.info-cont-view').each(function() {
                                    var wrap = $(this);
                                    $(this).find('ul:eq(0) li').each(function(_idx) {
                                        if ($(this).find('img').length) {
                                            var oldTxt = $(this).find('img').attr('alt');
                                        } else {
                                            var oldTxt = $(this).text();
                                        }
                                        wrap.find('ul').each(function() {
                                            var _ul = $(this);
                                            if (_ul.find('li').eq(_idx).find('img').length) {
                                                var _text = _ul.find('li').eq(_idx).find('img').attr('alt');
                                            } else {
                                                var _text = _ul.find('li').eq(_idx).text();
                                            }

                                            if (oldTxt != _text) {
                                                wrap.find('ul:eq(0)').find('li').eq(_idx).addClass('diff');
                                            }
                                            oldTxt = _text;
                                        })
                                    })
                                    wrap.find('ul:eq(0) li.diff').each(function() {
                                        var delIdx = $(this).index();
                                        wrap.find('ul').not(':eq(0)').each(function() {
                                            $(this).find('li').eq(delIdx).addClass('diff')
                                        })
                                    })
                                })

                                $(this).parents('.compare-item-info').removeClass().addClass('compare-item-info mode-differences');
                                $('.compare-item-info .info-technical').removeClass('hide');
                                break;
                            case 3:
                                $(this).parents('.compare-item-info').find('.diff').removeClass('diff');
                                $(this).parents('.compare-item-info').removeClass().addClass('compare-item-info mode-selection');
                                $('.compare-item-info .info-technical').each(function() {
                                    if (!$(this).find('ul.info-title li.on').length) {
                                        $(this).addClass('hide')
                                    }
                                });
                                if ($('.compare .add-to-compare .refind-your-search').hasClass('hide')) $("html, body").animate({
                                    scrollTop: 290 + parseInt($('.info-summary').height())
                                }, 500);
                                return false;
                                break;
                        }
                        return false;
                    })
                    //selection
                $('.info-technical input[type=checkbox]').click(function() {
                    var target = $(this).parents('li:eq(0)');
                    var idx = target.index();
                    if (target.is('.on')) {
                        target.removeClass('on');
                        checkLen--;
                        $(this).parents('.info-title').next().find('ul').each(function() {
                            $(this).find('li').eq(idx).removeClass('on');
                        })
                    } else {
                        target.addClass('on');
                        checkLen++;
                        $(this).parents('.info-title').next().find('ul').each(function() {
                            $(this).find('li').eq(idx).addClass('on');
                        })
                    }
                    if (!$(this).parents('.info-technical').find('ul.info-title li.on').length) {
                        if ($('.compare-item-info').is('.mode-selection')) {
                            $(this).parents('.info-technical').addClass('hide');
                        }
                    } else {
                        if ($('.compare-item-info').is('.mode-selection')) {
                            $(this).parents('.info-technical').removeClass('hide');
                        }
                    }
                    if (checkLen) {
                        selectionAnker.removeClass('disabled');
                    } else {
                        selectionAnker.addClass('disabled');
                    }
                })
            }
        }

        function compareSticky(hei) {
            var posSync = function() {
                if ($('.compare-item-info').length) {
                    var compareOffset = $('.compare-item-info').offset();
                    $('.compare-view-item').css('margin-left', compareOffset.left);
                    //$('.accordion-control.sticky').css('margin-left',compareOffset.left);
                }
            }
            posSync();
            $(window).resize(function() {
                posSync();
            })
            var holder = $('.compare-view-item-holder');
            var target = $('.compare-view-item');
            if (!$('body').hasClass('is-mobile')) {
                var specholder = $('.accordion-control-holder');
                var listholder = $('.compare-view-item-holder');
                var specArea = $('.accordion-control');
                var specTop = 0;
                if (specArea.is('div')) {
                    specTop = specArea.offset().top;
                }
            }

            $(window).scroll(function() {
                var appHeaderOffsetTop = $(".appHeader").length ? $(".appHeader").offset().top : 0; /* LGEPJT-337 : 20171121 modify */
                if (!$('.refind-your-search').is(':visible')) {

                    if ($(window).scrollTop() > hei + appHeaderOffsetTop) { /* LGEPJT-337 : 20171121 modify */
                        holder.addClass('on');
                        target.addClass('sticky');

						/* LGEPJT-337 : 20171121 add */
                        if (!$('body').hasClass('is-mobile')) {
                            specholder.addClass('on');
                            specArea.addClass('sticky');
                        }
                        /* //LGEPJT-337 : 20171121 add */

                        if (target.find('.item-list > li').length == 0 || target.find('.item-list').length == 0) {
                            target.add(holder).hide();
                        } else {
                            target.add(holder).show();
                        }
                    } else {
                        holder.removeClass('on');
                        target.hide().removeClass('sticky').show();
						/* LGEPJT-337 : 20171121 add */
                        if (!$('body').hasClass('is-mobile')) {
                            specholder.removeClass('on');
                            specArea.removeClass('sticky');
                        }
                        /* //LGEPJT-337 : 20171121 add */
                    }
					/* LGEPJT-337 : 20171121 remove
                    if (!$('body').hasClass('is-mobile')) {
                        if ($(window).scrollTop() > specTop - target.outerHeight()) {

                            if (listholder.hasClass("on")) {
                                specholder.addClass('on');
                                specArea.addClass('sticky');
                            }
                        } else {
                            specholder.removeClass('on');
                            specArea.removeClass('sticky');
                        }
                    }
					//LGEPJT-337 : 20171121 remove */
                }
            })
        }

        //RWD helper
        function GIOs(a, b, c, d, i) {
            var bwStep = d - c,
                contStep = b - a,
                per = bwStep / contStep,
                y, rt, xx;
            per = per.toString();
            xx = (per.indexOf('.') != -1) ? eval(per.substr(0, per.indexOf('.') + 5)) : eval(per);
            y = a + i / xx;
            y = y.toString();
            rt = (y.indexOf('.') != -1) ? y.substr(0, y.indexOf('.')) : y;
            return eval(rt);
        }
        if ($('body').hasClass('is-mobile')) {
            // mobile - mySearch-m.js (GIO)

            //START MY SEARCH
            (function($) {
                $.fn.mySearchBox = function() {
                    var _this = $(this);
                    if (!_this.length) {
                        return false;
                    }
                    //var thisForm = _this.find('input[type="checkbox"]').get(0).form;
                    var thisForm =_this.closest("form");
                    
                    var searchStep = 0;

                    _this.find('input[type="checkbox"]').each(function() {
                        this.checked = false;
                        //var c = $(this).is(":checked") ? "on" : "";
                        $(this).parent().attr("class", "");
                    })

                    /* get Count */
                    _this.find('input[type="checkbox"]').change(function() {
                        var c = $(this).is(":checked") ? "on" : "";
                        $(this).parent().attr("class", c);
                        //$(thisForm).applyFilter();
                    })
                    if (typeof dragbarVal != "undefined") {
                        //dragBar setting
                        // 2015-05-22
                        var screenType = 'selectOption';
                        var screenImgW = 0;
                        var screenTextL = 0;
                        var formFilter = filterForm.productFilter();
                        var priceOption = dragbarVal.priceOption;

                        if (screenType != 'compare-refrigerators') {
                            /* model */
                            var dragtarget = _this.find('.m-screen .m-slide-bar');
                            var screenBubble;
                            var screenTxt = _this.find('.m-screen .m-text');
                            var screenImg = _this.find('.m-screen .m-img-text');
                            var priceBubble;
                            var priceBubble2;
                            var priceTxt = _this.find('.m-budget .m-first-unit');
                            var priceTxt2 = _this.find('.m-budget .m-last-unit');
                            var priceBar = _this.find('.m-budget .m-bar-bg');
                            var dagtarget2 = _this.find('.m-budget .m-slide-bar');

                            /* hidden input model */
                            var inpSizeMin = $(thisForm).find('input[name=sizeMin]');
                            var inpSizeMax = $(thisForm).find('input[name=sizeMax]');
                            var inpPriceMin = $(thisForm).find('input[name=priceMin]');
                            var inpPriceMax = $(thisForm).find('input[name=priceMax]');
                        }
                    }

                    // //2015-05-22
                    //skip
                    _this.find('.m-search-view-control .m-prev').click(function() {
                        searchStep--;
                        if (searchStep == 0) { //min
                            $(this).hide();
                        } else {
                            _this.find('.m-search-view-control .m-next').show();
                        }
                        _this.find('.m-view-index span').eq(searchStep).addClass('m-selected').siblings().removeClass('m-selected');
                        _this.find('.m-search-select > div').eq(searchStep).show().siblings().hide();
                        return false;
                    })
                    _this.find('.m-search-view-control .m-next').click(function() {
                        searchStep++;
                        if (searchStep == 2) { //max
                            $(this).hide();
                        } else {
                            _this.find('.m-search-view-control .m-prev').show();
                        }
                        _this.find('.m-view-index span').eq(searchStep).addClass('m-selected').siblings().removeClass('m-selected');
                        _this.find('.m-search-select > div').eq(searchStep).show().siblings().hide();
                        return false;
                    });
                    // formFilter.applyFilter();
                }
            })(jQuery);

        } else {
            // desktop - mySearch.js (GIO)
            //START MY SEARCH
            (function($) {
                $.fn.mySearchBox = function() {
                    var _this = $(this);
                    if (!_this.length) {
                        return false;
                    }
                    //var thisForm = _this.find('input[type="checkbox"]').get(0).form;
                    var thisForm =_this.closest("form");
                    
                    /* checkbox focus 150517 */
                    _this.find('input[type="checkbox"]').focusin(function() {
                        $(this).parent().addClass('focus');
                    });
                    _this.find('input[type="checkbox"]').focusout(function() {
                        $(this).parent().removeClass('focus');
                    });

                    var formFilter = filterForm.productFilter();
                    //  formFilter.init();
                    /* get Count */
                    _this.find('input[type="checkbox"]').each(function() {
                        this.checked = false;
                        //var c = $(this).is(":checked") ? "on" : "";
                        $(this).parent().attr("class", "");
                    });
                    _this.find('input[type="checkbox"]').change(function() {
                        // $(this).parent().toggleClass('on');

                        var c = $(this).is(":checked") ? "on" : "";
                        $(this).parent().attr("class", c);
                        //formFilter.applyFilter();
                    })

                    //dragBar setting
                    // //2015-05-22
                    var screenType = 'selectOption';
                    var screenImgW = 0;
                    var screenTextL = 0;

                    if (typeof dragbarVal != "undefined") {

                        var formFilter = filterForm.productFilter();

                    }
                    //2015-05-22
                    //formFilter.applyFilter();
                }

                $.fn.extend({
                    bwEventBind: function(opt) {
                        var _this = $(this);
                        var bwUIFn2 = {
                            bwVal: function() {
                                return $(window).width()
                            },
                            areaSta: opt.d ? opt.d : 1000,
                            areaEnd: opt.e ? opt.e : 1900
                        }
                        if (!opt.f) {
                            opt.f = function() {}
                        };
                        if (!opt.s) {
                            opt.s = function() {}
                        };
                        var csMet = function(tval) {
                            var ret, origName = jQuery.camelCase(opt.c),
                                hooks = jQuery.cssHooks[origName];
                            var _name = jQuery.cssProps[origName] || origName;
                            //animate: function( prop, speed, easing, callback ) {
                            var tmp = {};
                            tmp[_name] = tval;
                            _this.stop().animate(tmp, {
                                duration: 150,
                                step: opt.s,
                                complete: opt.f
                            })
                        }
                        var rtVal = GIOs(opt.a, opt.b, bwUIFn2.areaSta, bwUIFn2.areaEnd, bwUIFn2.bwVal() - bwUIFn2.areaSta);
                        if (bwUIFn2.bwVal() > bwUIFn2.areaSta && bwUIFn2.bwVal() < bwUIFn2.areaEnd) csMet(rtVal);
                        else if (bwUIFn2.bwVal() < bwUIFn2.areaSta) csMet(opt.a);
                        else if (bwUIFn2.bwVal() > bwUIFn2.areaEnd) csMet(opt.b);
                    }
                })
            })(jQuery);
        }

        // compare
        if ($('.add-to-compare').is('div')) {
			setHeight(); /* LGEPJT-337 : 20171121 add */

            if ($('body').hasClass('is-mobile')) {
                compareSlide();
                compareNextBtn();
                technicalExpand();
                specsModeChange();
                setTimeout(function() {
                    compareSticky(400);
                }, 100);
                //back btn
                $('.add-to-compare .back-btn').click(function(e) {
                        e.preventDefault();
                        if (document.referrer == "" || document.referrer.indexOf("lg.com") == -1) {
                            window.location = decodeURIComponent(lgFilter.compareCategory);
                        } else {
                            window.history.back();
                        }
                    })
                    // after page load, click selections link  - hsad / theJ
                setTimeout(function() {
                    $('.accordion-control .choice-control dd').eq(2).find('a').trigger('click');
                }, 300);
            } else {
                // after page load, click selections link  - hsad / theJ
                setTimeout(function() {
                    $('.accordion-control .choice-control dd').eq(1).find('a').trigger('click');
                }, 300);
                //drag bar
                refineDragbar();

                var formEl = filterForm;
                var url = formEl.attr('action');
                var formFn = formEl.productFilter();

                var e = lgFilter.compare.pageCategory();
                var nowLen = lgFilter.compare.count(e);
                var originLen = lgFilter.compare.count(e);

                //add list show
                $('.compare-view-left .change-btn').click(function() {
                        //console.log(lgFilter.compare.get(lgFilter.compareCategory))
                        if (nowLen < 0) {
                            nowLen = lgFilter.compare.count(e);
                        }
                        if (originLen != lgFilter.compare.count(e)) {
                            nowLen = nowLen - (originLen - lgFilter.compare.count(e));
                        }
                        if (lgFilter.compare.count(e) > 10) {
                            /* 2015-06-02 */
                            $('.alert-popup').css({
                                'display': 'block',
                                'margin-top': $('.alert-popup').outerHeight() / -2 + 'px',
                                'margin-left': $('.alert-popup').outerWidth() / -2 + 'px'
                            });
                            $('.alert-popup .alert-text').text('Compare is only available up to 10');
                            $('.alert-popup .alert-close, .alert-popup .alert-btn').click(function() {
                                $(this).parents('.alert-popup').css('display', 'none');
                                return false;
                            });
                            return false;
                        }
                        /* //2015-06-02 */

                        formFn.applyFilter();

                        $(this).addClass('hide');
                        $('.refind-your-search').removeClass('hide');


                        $('.compare-view-item-holder, .accordion-control-holder').removeClass('on');
                        $('.compare-view-item, .accordion-control').removeClass('sticky');
                        $(window).scrollTop(0);
                        $($(".add-to-compare form.filter .column1").find("label input")[0]).focus();
                        return false;
                    })
                    //back btn
                $('.add-to-compare .back-btn').click(function(e) {
                    e.preventDefault();
                    if (document.referrer == "" || document.referrer.indexOf("lg.com") == -1) {
                        window.location = decodeURIComponent(lgFilter.compareCategory);
                    } else {
                        window.history.back();
                    }
                })

                //add list hide
                $('.add-to-compare .close-btn').click(function() {
                    $('.refind-your-search').addClass('hide');
                    $('.change-btn').removeClass('hide').focus();
                    return false;
                })
                var addCompareQuee = [];
                var removeCompareQuee = [];
                var _callback = function() {
                    $.each(addCompareQuee, function() {
                        var d = this;
                        $('.product-lists .cta-button a.add-btn[data-product-id=' + d + ']').hide();
                        $('.product-lists .cta-button a.remove-btn[data-product-id=' + d + ']').show();
                    })
                    $.each(removeCompareQuee, function() {
                        var d = this;
                        $('.product-lists .cta-button a.add-btn[data-product-id=' + d + ']').show();
                        $('.product-lists .cta-button a.remove-btn[data-product-id=' + d + ']').hide();
                    })
                }
                var checkCompItem = function() {
                        var e = lgFilter.compare.pageCategory();
                        $('.product-lists .cta-button a.remove-btn:visible').each(function() {
                            var item = $(this);
                            var d = item.data('product-id')
                            if (lgFilter.compare.isin((d), e)) {} else {
                                if ($.inArray((d), addCompareQuee) == -1) {
                                    addCompareQuee.push((d))
                                }
                            }
                        })
                        $('.product-lists .cta-button a.add-btn:visible').each(function() {
                            var item = $(this);
                            var d = item.data('product-id');
                            if (lgFilter.compare.isin((d), e)) {
                                if ($.inArray((d), removeCompareQuee) == -1) {
                                    removeCompareQuee.push((d))
                                }
                            }
                        })
                    }
                    //prev btn
                $('.add-to-compare .btn-center a').eq(0).click(function() {
                        if ($(this).is('.disable')) {
                            return false;
                        };
                        var total = parseInt($('.product-list-wrap .pager .total').text());
                        var nowPage = parseInt($('.product-list-wrap .pager .pages .active').text());
                        checkCompItem();
                        nowPage--;
                        var url = $('.product-list-wrap .pager .pages a').eq(nowPage - 1).attr('data-uri');
                        formFn.reload(url, _callback);
                        return false;
                    })
                    //next btn
                $('.add-to-compare .btn-center a').eq(1).click(function() {
                        if ($(this).is('.disable')) {
                            return false;
                        };
                        var total = parseInt($('.product-list-wrap .pager .total').text());
                        var nowPage = parseInt($('.product-list-wrap .pager .pages .active').text());
                        checkCompItem();
                        nowPage++;
                        var url = $('.product-list-wrap .pager .pages a').eq(nowPage - 1).attr('data-uri');
                        formFn.reload(url, _callback);

                        return false;
                    })
                    //add btn
                $('.add-to-compare .btn-center a').eq(2).click(function(a) {
                        var e = lgFilter.compare.pageCategory();
                        a.preventDefault();
                        checkCompItem();

                        $.each(addCompareQuee, function() {
                            var d = this;
                            lgFilter.compare.add((d), e);
                        })
                        $.each(removeCompareQuee, function() {
                            var d = this;
                            lgFilter.compare.remove((d), e);
                        })

                        addCompareQuee = [];
                        removeCompareQuee = [];
                        //refresh
                        location.reload();
                    })
                    //add to compare btn



                $('.add-to-compare').on('click', '.cta-button a', function() {
                    var checkMax = 10;
                    var isFull = (nowLen >= 10);

                    // var t = $('.compare-count span.check-singular').data("plural");
                    // if(nowLen <= 1) {
                    //  t = $('.compare-count span.check-singular').data("singular");
                    // }

                    // if($('body').hasClass('is-mobile')) {
                    //  $('.compare-count strong span.count').text(nowLen); // 2015-06-01
                    //  $('.compare-count span.check-singular').text(t);
                    // }else{
                    //  $('.compare-count strong span.count').text(nowLen); // 2015-06-01
                    //  $('.compare-count span.check-singular').text(t);
                    // }
                    if ($(this).hasClass('add-btn')) {
                        var t = $(this);
                        if (nowLen >= checkMax) {
                            /* 2015-06-02 */
                            $('.alert-popup').css({
                                'display': 'block',
                                'margin-top': $('.alert-popup').outerHeight() / -2 + 'px',
                                'margin-left': $('.alert-popup').outerWidth() / -2 + 'px'
                            });
                            $('.alert-popup .alert-close, .alert-popup .alert-btn a').click(function() {
                                $(this).parents('.alert-popup').css('display', 'none');
                                t.focus();
                                return false;
                            });
                            $('.alert-popup .alert-btn a').focus();
                            /* //2015-06-02 */
                            return false;
                        } else {
                            $(this).css('display', 'none');
                            $(this).siblings('.btn').css('display', '').removeClass('checked').focus();
                            nowLen++;
                        }
                    } else { //remove
                        nowLen--;
                        $(this).css('display', 'none');
                        $(this).addClass('checked');
                        $(this).siblings('.btn').css('display', '').focus();
                    }
                    //console.log(nowLen +">="+ checkMax);
                    return false;
                })
                compareSlide();
                compareNextBtn();
                technicalExpand();
                specsModeChange();
                if ($('.product-lists li').length == 0) {

                    return false;
                } else {
                    setTimeout(function() {
                        compareSticky(259);
                    }, 100);
                }
            }
        }

        // COMPARE LOCK
        $(document).on('click', '.item-area .item-uitls li:first-child > a', function() { /* LGEPJT-337 : 20171121 modify */
            var _wrap = $('.compare-view-item .compare-item .item-view'),
                index = $('.item-area .item-uitls li:first-child > a').index(this);

            var e = lgFilter.compare.pageCategory();
            var d = $(this).data("product-id");

            if ($(this).parents('.item').hasClass('item-lock')) {
                compareUnLock();
                lgFilter.compareLOCK.remove((d), e);
            } else {
                compareLock(index);
                lgFilter.compareLOCK.add((d), e, true);
            }
            return false;
        });
        // start my search
        if ($('.findTheRightFilter').is('section') && $('.no-cookies').length == 0) {
            if ($('body').hasClass('is-mobile')) {
                $('.m-my-search-box').mySearchBox();
            } else {
                $('.my-search-box').mySearchBox();
            }
        }

        // start my search Height
        if ($('.my-search-box').length > 0) {
            var mySearchFunc = function(){
                var maxHeight = 0;
                $(".my-search-box p.search-sub-title").height("auto").each(function(){
                    return maxHeight = Math.max(maxHeight,$(this).height());
                }).each(function(){
                    $(this).height(maxHeight);
                })
            };

            mySearchFunc();

            $(window).resize(mySearchFunc);
        }

        // filter
        if (filterForm.is('section') || filterForm.is('div') || filterForm.is('form')) {
            // load more
            if ($('body').hasClass('is-mobile') && $('.m-my-search-box').length == 0 && moreButton != null ) {
                $(document).on("click", moreButton, function(b) {
                    var page_limit = Math.ceil(parseInt(_mTotalCount) / _countNumber);
                    b.preventDefault();
                    var formFilter = filterForm.productFilter();
                    var url = $(this).data('ajax-url');
                    lgFilter.filter.page++;
                    if (!$('input[name=page]').length) {
                        $('<input type="hidden" name="page" value="' + lgFilter.filter.page + '">').appendTo(filterForm);
                    } else {
                        $('input[name=page]').attr('value', lgFilter.filter.page)
                    }
                    formFilter.applyFilterMore(url, lgFilter.filter.page, page_limit);
                    return false;

                })
            }

            if ($('.filter').hasClass("discontinued")) return false; //theJ

            if ($('body').hasClass('is-mobile')) {
                refineDragbar();
                refineFixed();
                //  load more
            } else {
                //refineDragbar();
                (function($) {
                    function refindRWD() { //
                        if ($(".add-to-compare").length > 0) return false;
                        var targetA = $('.refind-your-search .column2');
                        var targetB = $('.refind-your-search .column2 .response ul.product-lists li');
                        var targetC = $('.refind-your-search .column1');

                        /* setOption */
                        var Aoptions = {
                            a: 458,
                            b: 880,
                            c: 'width',
                            d: 768,
                            e: 1200
                        }
                        var Boptions = {
                            a: 20,
                            b: 110,
                            c: 'margin-right',
                            d: 1024,
                            e: 1200
                        }
                        var Coptions = {
                            a: 40,
                            b: 70,
                            c: 'margin-right',
                            d: 768,
                            e: 1200
                        }
                        if ($(window).width() < 1004) {
                            Boptions.a = 45;
                            Boptions.d = 768;
                            Boptions.e = 1024;
                        } else {
                            Boptions.a = 20;
                            Boptions.d = 1024;
                            Boptions.e = 1200;
                        }
                        targetA.bwEventBind(Aoptions);
                        targetB.bwEventBind(Boptions);
                        targetC.bwEventBind(Coptions);
                    }
                    //refindRWD();
                    var timerId;
                    $(window).resize(function() {
                        //clearTimeout(timerId);
                        //timerId = setTimeout(function(){refindRWD()},150)
                    })
                    $(document).ready(function() {
                        //technicalExpand();
                        //refindRWD();
                    });

                })(jQuery);
            }
        }

        $('.choice-control dd a.icon').on('mouseenter focus', function() {
            $(this).next('.tooltop').css({
                'display': 'block',
                /* LGEGMO-1700 */
                // 'left': $(this).position().left - 200
                /* LGEGMO-1700 */
            });
        });

        $('.choice-control dd a.icon').on('mouseleave blur', function() {
            $(this).next('.tooltop').css('display', '');
        });

        /* //2015-06-10 */

        // 2015-06-19  //
        /*
        if ( !$('body').hasClass('is-mobile')) {
            var AppendHTML1 = '<i class="icon icon-triangle-down"></i>';
            $('.model-color a').hover(function(){
                var t = $(this).attr('data-disclaimer');
                var AppendHTML2 = '<span class="disclaimer-box">'+t+'</span>';
                $(this).append(AppendHTML1);
                $('.model-color').append(AppendHTML2);

            },function(){
                $('.model-color .disclaimer-box').remove();
                $('.model-color .icon-triangle-down').remove();
            });
        }
        */
        
        /* LGEJP-1877 : 20180203 add */
        /* LGEUS-9001, LGEUS-10042 : 20180102 modify */
		var tooltipInfo = $(".tooltip-info-wrap"), 
			tooltipInfoWrap = null, 
			timeflag = true;
		
		
        /* tooltip init */
		if(lgFilter.locale =="jp") {
	        if(tooltipInfo.size() > 0 && $('.js-tooltip-info-wrap').size() == 0) {
	        	
	        	tooltipInfo.each(function(i) {
	    			$(this).attr("tooltip-num", i);
	    			$(this).prepend('<div class="js-tooltip-info-wrap" tooltip-num="'+ i +'"></div>');
	    		});
	            
	            tooltipInfoWrap = $('.js-tooltip-info-wrap');
	        }
	        /* tooltip event */
	        tooltipInfo.find('>a.icon').on({"mouseenter click": function(e) {
	        		timeflag = false;
	        		tooltipInfoWrap.empty().removeAttr('style');
	        		var tooltip = $(this).next(".tooltop").clone();
	        		tooltipInfo.removeClass('active');
	        		
	        		$(this).parents('.tooltip-info-wrap').addClass('active');
	        		
	        		tooltipInfoWrap.append(tooltip); 		
	        		tooltipInfo.each(function() {
	        			if($(this).hasClass("active")){
	        				tooltipInfoWrap.empty();
	        				$(this).find(tooltipInfoWrap).append(tooltip);
	        			}
	        		});        		
	        		
	        		$(".tooltip-info-wrap").removeClass("mark");
	    			$(this).parents(".tooltip-info-wrap").addClass("mark");
	                var _markPosition = ($(this).offset().top - $(document).scrollTop())- (tooltipInfoWrap.find('.tooltop').height()+55);
	                var _tipNum = $(this).siblings(".js-tooltip-info-wrap").attr("tooltip-num");
	                var _left = !$('body').hasClass("is-mobile") ? ($(this).offset().left > 200) ? $(this).offset().left - 200 : 0 : 0;
	               
	                $(this).siblings(".js-tooltip-info-wrap").css({
	    				'left': _left,
						'top': _markPosition
	    			}).find(".tooltop").append('<span class="before"></span><span class="after"></span><a href="#" class="btn-close"><i class="icon icon-close"></i><span class="hidden">close</span></a>');
	    			
	        		showhidetooltips($(this), _markPosition, _tipNum);
	        		
	        		tooltipInfoWrap.find('.before, .after').css({
	                    left: ($(this).offset().left > 200) ? '50%':$(this).offset().left-10
	                });       		
	        		
	        		if(e.type == "click") {
	        			tooltipInfoWrap.find("a").first().focus();
	        		};
	        		
	        		tooltipInfoWrap.find(".btn-close").click(function() {
	                	tooltipInfoWrap.empty();
	                	tooltipInfo.filter('.active').find('a').focus();
	                	
	                    //$(window).unbind("scroll");
	                    tooltipInfo.filter(".active").removeClass("mark").find("a").focus();
	                	return false;
	                });
	        		
	        		if(!$('body').hasClass("is-mobile")){
	        			$(document).on("click", "body" , function(e) {
	            			tooltipInfoWrap.find(".btn-close").trigger("click");
	                    });
	        		}        		
	        		
	                return false;
	            },
	            "focus": function(e) {
	                tooltipInfoWrap.empty().removeAttr('style');
	                tooltipInfo.removeClass('active');
	            },
	            "focusout": function(e) {
	            	if(!globalConfig.isMobile) {
	            		removetooltips(e.type);
	            	}
	        	},
	            "mouseleave": function(e) {
	            	if(!globalConfig.isMobile) {
	            		removetooltips(e.type);
	            	}
	            }
	        });
		}
		
        function removetooltips(type) {
        	if(type == "mouseleave") {
                timeflag = false;
                var time = 1000;
                var _timeout = setTimeout(function() {
                     if(timeflag) {
                          tooltipInfoWrap.empty().removeAttr('style');
                          tooltipInfo.removeClass('active');
                     }
                },time);
                tooltipInfoWrap.find('.tooltop').on({
                     mouseenter: function(e) {
                          timeflag = false;
                          clearTimeout(_timeout);
                     },
                     mouseleave: function(e) {
                          e.preventDefault();
                          tooltipInfoWrap.empty().removeAttr('style');
                          tooltipInfo.removeClass('active');
                     }
                });
           }else {
        	   
           }
        }
        
        function showhidetooltips(e, _markPosition, _tipNum) {
            var _showBoolean;
            
            $(window).scroll(function(e) {
            	e.preventDefault();
            	var sticky = $(".category").find(".sticky-wrap"),
		    		activeMark = $('.tooltip-info-wrap.active.mark');
		    		
            	if(activeMark.length){
            		var	onTooltip = activeMark.find(".js-tooltip-info-wrap"),
			    		onTooltipPos = activeMark.offset().top,
			    		onTooltipHeight = onTooltip.height() + 13,
			    		activeMarkPos = ($('.tooltip-info-wrap.active.mark').offset().top - $(document).scrollTop())- (onTooltipHeight);
            	}
            	
                if((onTooltipPos >= document.documentElement.scrollTop) && onTooltipPos <= document.documentElement.scrollTop + $(window).height()){
                	activeMarkPos > -10 ? _showBoolean = true : _showBoolean = false;
                }else{                	
                	activeMarkPos < onTooltipPos - onTooltipHeight ? _showBoolean = false : _showBoolean = true;
                }
                
                clearTimeout($.data(this, 'scrollTimer'));
                $.data(this, 'scrollTimer', setTimeout(function() {
                    _showBoolean? $(".js-tooltip-info-wrap").show().css({'top': activeMarkPos}):$(".js-tooltip-info-wrap").hide().css({'top': activeMarkPos});
                }, 100));
            });
            
            $(window).resize(function(){
            	if($('.tooltip-info-wrap.active.mark').length) {
            		$('.tooltip-info-wrap.active.mark').find(".btn-close").trigger("click");
            	}
            });
        }
		/*//LGEUS-9001, LGEUS-10042 : 20180102 modify */
		/*//LGEJP-1877 : 20180206 add */

        function checkSliderValue(o, ui) {
            if (!o) return false;
            var v = o.slider("option", "values");
            var min = o.slider("option", "min");
            var max = o.slider("option", "max");
            var c = v[0] == v[1];
            var r;

            if (!c) r = ui.value;
            else if ($(ui.handle).index() == 4 && v[1] == min) { //min
                r = min + 1;
                ui.values[1] = r;
            } else if ($(ui.handle).index() == 3 && v[0] == max) { //max
                r = max - 1;
                ui.values[0] = r;
            } else {
                r = ui.value;
            }
            o.slider("option", "values", ui.values);
            return r;
        }

        // function objHasValue(a, b){
        //  var c = false;
        //  $.each(a, function(i,t){
        //      if(b == t) c = true;
        //  })
        //  return c;
        // }

        function objHasValue(arraytosearch, valuetosearch) {
            var b = false;
            for (var i = 0; i < arraytosearch.length; i++) {
                $.each(arraytosearch[i], function(s, t) {
                    if (valuetosearch == t) {
                        b = true;
                    }
                });
            }
            return b;
        }

        function findObject(obj, value, name) {

            var b = false;

            for (var key in obj) {
                if (value.toString() == obj[key][name].toString()) {
                    b = true;
                }
            }

            return b;

        }
        /* LGEPJT-337 : 20171121 add  */
        function stickRefindEvt (){
            if($(".sticky-top-holder").size()>0){
                $('html, body').stop(true).scrollTop($(".sticky-top-holder").offset().top + 1 );
            }
        }
    })(jQuery);
});
