define(['ic/ic', 'ic/ui/module', 'common/util', 'cs/modallayer', 'cs/predictive', 'cs/tabpanel'], function(ic, Module, util, modal, predictiveSearch, tabPanel, undefined) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        $document = $(document),
        $window = $(window),
        $wrapper = $('.wrapper'),
        proto;

    // LGEGMO-1803 start
    var ModelBrowser = function(el, options) {

        var self = this;

        // constructor
        ModelBrowser.superclass.constructor.call(self, el, options);

        self.classname = {
            selectbox: ".model-selectbox",
            searchbox: ".model-searchbox",
            modelselect: ".select-model",
            modelsearch: ".search-model",
            keywordbox: ".searchbox",
            closebutton: ".closebutton",
            modelpopup: ".model-pop-wrap"
        }

        // selectors
        self.$wrapper = $(el);
        self.$selectBox = self.$wrapper.find(self.classname.selectbox);
        self.$searchBox = self.$wrapper.find(self.classname.searchbox);
        self.$searchBtnGroup = $(".btn-group",self.$searchBox); //LGEGMO-1839 add
        self.$closebutton = self.$wrapper.find(self.classname.closebutton);
        self.$modelselect = self.$selectBox.find(self.classname.modelselect);
        self.$modelsearch = self.$searchBox.find(self.classname.modelsearch);
        self.$keywordbox = self.$searchBox.find(self.classname.keywordbox);
        self.$predictiveElement = $("input[name='" + self.options.predictiveField + "']", self.$searchBox);
        self.$validateElement = $("input[name='" + self.options.validateField + "']", self.$searchBox);
        //self.$hiddenElement = $("input[data-search-name='" + self.options.predictiveField + "']", self.$searchBox);
        self.$closeWrapper = self.$closebutton.parent();       
        // status/flag variable
        self._activeBox = null; // "select" or "search"
        self._modelSelected = false;
        self._progressing = false;
        
        self._focusable = "fieldset, input, a, select, button";
        self._modelUrl = self.$wrapper.data("modelUrl");
        self._modelSearchUrl = self.$wrapper.data("modelSearchUrl");

        self.delaySet = null;
        self.keyword = self.$predictiveElement.val() || "";
        self.keywordTimer = null;

        // event handlers
        self.$selectBox.on("focus", self._focusable, $.proxy(self._checkActiveBox, self));
        self.$searchBox.on("focus", self._focusable, $.proxy(self._checkActiveBox, self));
        self.$closebutton.on("click", $.proxy(self.collapseBox, self, this));
        self.$modelselect.on("change", $.proxy(self._getInformation, self, this));
        self.$modelsearch.on("click", $.proxy(self._openModal, self, this));
        //self.$predictiveElement.on("keydown", $.proxy(self._detectKeyword, self, this));
        
        self.$predictiveElement.on("keyup", function(e){
            if(!e.keyCode == 13) self.$predictiveElement.removeClass("error");
        });
        //  LGEGMO-1820 end
        
        $(".predictive-search").find(".search-result-number").on("click", "a", function(e){
            self.$modelsearch.trigger("click");
            return false;
        });
        
        if (self.$predictiveElement && self.options.usePredictive) {
            ic.jquery.plugin('predictive', predictiveSearch, self.$predictiveElement);
        }

        //selected model get information
        if (self.$modelselect.find(':selected').val() && !self.options.pageChange) {
            self._activeBox = 'select';
            self.$activeBox = self.$selectBox;

            setTimeout(function() {
                self.$selectBox.find(self._focusable).trigger('focus');
                self.$modelselect.trigger('change');
            }, 1000);
        }
        /*LGECS-798 20160824 add*/
    	if ($("body").hasClass("is-mobile")) {
            	self.$predictiveElement.on("keyup blur", $.proxy(self._detectKeyword, self, this));
            	if(self.$wrapper.hasClass("search-wrap")){
            		self.$searchBoxInitHeight= self.$searchBox.outerHeight();
            		self.$closeWrapper.css("top", self.$searchBoxInitHeight-30);
            	}else{
	            	$(window).load(function(){
	            		self.$searchBoxInitHeight= self.$searchBox.outerHeight();
	            		self.$closeWrapper.css("top", self.$searchBoxInitHeight-30);
	            	})
            	}
            	$("#typeOfInquiry").one("change", function(a) {
            		setTimeout(function() {
	            		self.$searchBoxInitHeight= self.$searchBox.outerHeight();
	            		self.$closeWrapper.css("top", self.$searchBoxInitHeight-30);
            		},10);
            	})
            }
    	/*//LGECS-798 20160824 add*/
        //run after load
        if (self.options.pageChange) $.proxy(self.checkEmptyData, self)();

        // set Observer
        self._bindObserver();
	
    }

    // inherits
    util.inherits(ModelBrowser, Module);
    proto = ModelBrowser.prototype;

    proto._defaults = {
        usePredictive: true,
        predictiveField: "keyword",
        validateField: "keyword",
        keywordMinLength: 2
    };

    proto.checkEmptyData = function() {
        var self = this;
        // console.log("checkEmptyData");
        /*
        if ( (self.$modelselect.val() || self.$modelsearch.val()) && (self.$wrapper.hasClass("selectbox-on") || self.$wrapper.hasClass("searchbox-on") ) )  {
            self.$wrapper.addClass("open");
        } 
        */
        /* LGEGMO-1839 start */
        if (self.$modelselect.val() && self.$wrapper.hasClass("selectbox-on")) {
            self._activeBox = "select";
            //self.$wrapper.addClass("open");
            self.expandBox();
        } else if (self.$predictiveElement.val() && self.$wrapper.hasClass("searchbox-on")) {
            self._activeBox = "search";
            //self.$wrapper.addClass("open");
            self.expandBox();
        }
        /* LGEGMO-1839 end */
    }

    proto._detectKeyword = function(el, e) {
        var self = this;
	/*LGECS-798 20160824 add*/
        
	setTimeout(function() {
        	if(e.type=="blur"){
        		self.$closeWrapper.css("z-index","16")
        	}else{
		        if($(e.currentTarget).val().length>=1){
		        	 self.$closeWrapper.css("z-index","0")
		        }else{
		        	self.$closeWrapper.css("z-index","16")
		        }
        	}
        }, 10);
	/* //LGECS-798 20160824 add*/
        /*self.keyword = self.$predictiveElement.val();

        if (self.$wrapper.hasClass("open")) {
            self.keywordTimer = setTimeout(function() {
                if (self.$predictiveElement.val() != self.keyword) {
                    self.$closebutton.trigger({
                        type: "click",
                        kewordChange: true
                    });
                }
            }, 0);
        }*/

    }

    /*
    proto.checkEmptyData = function() {
        var self = this;
        if (self.$modelselect.val() || self.$modelsearch.val()) {
            // console.log("init expand.")
            self._activeBox = self.$modelselect.val() ? "select" : "search";
            self.expandBox();
        } else if (self.$wrapper.hasClass("open")) {
            // console.log("init collapse.")
            self.collapseBox(false);
        }
    }
    */

    proto._bindObserver = function() {
        var self = this;
        // View My registered product select after
        self.$wrapper.on('modelBrowser:selectRegisteredProduct:after', function(e) {
            self._activeBox == "search";
            var param = {};
            param[self.options.validateField] = self.$predictiveElement.val();
            self._getInformation(param, e);
        });
    }

    proto._predicitiveCancel = function() {
        var self = this;
        self.$predictiveElement.trigger('predictive:suggest:cancel');
    }

    proto._checkActiveBox = function(e) {
        var self = this;
        var $el = $(e.currentTarget);
        // console.log("$el : ", $el);
        var _targetBox = ($el.parents(self.classname.selectbox).length) ? "select" : "search";
        self.$keywordbox.removeClass("on")
        if (self._activeBox != _targetBox && self._modelSelected) {
            self.reset();
        } //else if (!self._progressing) {
        else {        
            self._activeBox = _targetBox;
            self.$activeBox = (self._activeBox == "search") ? self.$searchBox : self.$selectBox;
            self._activationBox(self._activeBox);

            if (self._activeBox == "search" || $el.is("input")) {
                self.$keywordbox.addClass("on")
            }
        }
        // console.log("box:", self._activeBox);
    }

    proto._activationBox = function(type) {
        var self = this;
        self.$wrapper.removeClass("selectbox-on searchbox-on").addClass(type + "box-on");

        if (type == 'select') {
            //self.$predictiveElement.removeAttr('required');
            self.$predictiveElement.removeAttr('required');
            self.$selectBox.find("select").attr('required', 'required');

        } else if (type == 'search') {
            //self.$predictiveElement.attr('required', 'required');
            if(!self._modelSelected) self.$predictiveElement.attr('required', 'required');
            self.$selectBox.find("select").removeAttr('required');
        }

        return self;
    }

    proto._getInformation = function(f, e) {
        var self = this,
            modelName;
        
        if (self._activeBox == "select") {
            self.$predictiveElement.attr("disabled", true);
        } else {
            self.$predictiveElement.removeAttr('required').removeClass("error");//LGEGMO-1869 modify
        }
        if (self.options.pageChange) {
            if (self._activeBox == "search") {
                modelName = e.clickTarget ? f.keyword : f.modelNum ? f.modelNum : f[self.options.validateField] ? f[self.options.validateField] : self.$predictiveElement.val();
                self.$predictiveElement.val(modelName);
                self.$validateElement.val(modelName);
            }
        }
        self._modelSelected = true;
        self.$wrapper.closest("form").trigger("modelBrowser:selectedModel." + self._activeBox);
        if (!self.options.pageChange) {
            // LGEGMO-1820 start
            // e.preventDefault();
            if (self._activeBox == "select" && $.trim(self.$modelselect.val()) != '') {
                var _param = self.$selectBox.find("fieldset").serialize() ||
                             self.$selectBox.find("select").each(function(idx,ele){
                                _param+= $.param($(ele))+"&"
                             });
                self.ajaxCall(self._modelUrl, _param, "json");
            } else if(self._activeBox == "select" && $.trim(self.$modelselect.val()) == ''){
                self.reset(true);
            } else if (self._activeBox == "search") {
                var _param = e.clickTarget ? $.param(f) : f;
                self.ajaxCall(self._modelSearchUrl, _param, "json", function(data) {
                    self.$predictiveElement.val(data.modelName);
                    self.$validateElement.val(data.modelName);
                });
            }
            // LGEGMO-1820 end
        }
    }

    proto._setInformation = function(_data, _callback) {
        var self = this;
        /* LGELV-140  20161011 add */
        var _warranty_title =$('.model-view-detail .info-wrap .warranty').eq(0).text().length>0 ? $('.model-view-detail .info-wrap .warranty').eq(0).text():"Warranty Information";//LGEBR-3044 20160801 add
        var _detail_title_labor = $('.model-view-detail .info-wrap .info').eq(0).text().substring(0,$('.model-view-detail .info-wrap .info').eq(0).text().indexOf("/")).length > 0 ? $('.model-view-detail .info-wrap .info').eq(0).text().substring(0,$('.model-view-detail .info-wrap .info').eq(0).text().indexOf("/")): "Labor ";
        var _detail_title_parts = $('.model-view-detail .info-wrap .info').eq(0).text().substring($('.model-view-detail .info-wrap .info').eq(0).text().indexOf("/")+1).length > 0 ? $('.model-view-detail .info-wrap .info').eq(0).text().substring($('.model-view-detail .info-wrap .info').eq(0).text().indexOf("/")+1) : "Parts";
        /*//LGELV-140  20161011 add */
        self._modelSelected = true;
        
        var modelAnchor = '';
        /* LGECS-1313 : 20181129 modify */
        var _registerProduct = $("body").find("#registerProduct").size() > 0 ? true : false;
        
        if(_registerProduct){
        	modelAnchor += '<a href=\"' + _data.link + '\" target=\"_self\">';
        } else {
        	modelAnchor += '<a href=\"' + _data.link + '\" target=\"_blank\">';
        }
        /*//LGECS-1313 : 20181129 modify */        
        
        modelAnchor += '    <span class="blank"></span>';
        modelAnchor += '    <span class="vert-content">';
        modelAnchor += '        <img src=\"' + _data.imageUrl + '\" width=\"170\" height=\"130\" alt=\"No Image\" class=\"model-view-image\">';
        modelAnchor += '        <span class=\"model-info\">';
        
        /* LGECS-1313 : 20181129 modify */
        if(_registerProduct){
        	modelAnchor += '            <strong class=\"model-info-name\">' + _data.modelName + '</strong>';
        } else {
        	modelAnchor += '            <strong class=\"model-info-name\">' + _data.modelName + '</strong> <i class=\"icon icon-new-window-2\"></i>';
        }
        /*//LGECS-1313 : 20181129 modify */
        
        if (lgFilter.locale =="/jp" && (_data.warrantyInfoLabor ==null && _data.warrantyInfoParts ==null)) {
        	/* LGEJP-1609 20170119 add */
        	modelAnchor += '            <span class=\"model-info-warranty\">'+ $("input[name=inpNullMessage]").val() +'</span>';
        	/* //LGEJP-1609 20170119 add */
        } else {
            /* LGEBR-3044 20160801 modify */
            modelAnchor += '            <span class=\"model-info-warranty\">' + _warranty_title + '</span>';
            if(lgFilter.locale =="/br" && (_data.warrantyInfoLabor ==null || _data.warrantyInfoParts ==null)){
                if(_data.warrantyInfoLabor ==null && _data.warrantyInfoParts ==null){
                    modelAnchor += '            <span class=\"model-info-detail\">Detalhes</span>';
                }else if(_data.warrantyInfoParts ==null){
                    modelAnchor += '            <span class=\"model-info-detail\">Labor <span class=\"model-info-labor\">' + _data.warrantyInfoLabor + '</span></span>';
                }else{
                    modelAnchor += '            <span class=\"model-info-detail\">Parts <span class=\"model-info-parts\">' + _data.warrantyInfoParts + '</span></span>';
                }        	
            } else if (lgFilter.locale =="/jp") {
            	/* LGEJP-1609 20170119 add */
            	if (_data.warrantyInfoLabor ==null) {
            		modelAnchor += '            <span class=\"model-info-detail\">' + _detail_title_parts + '<span class=\"model-info-parts\">' + _data.warrantyInfoParts + '</span></span>';
            	} else if (_data.warrantyInfoParts ==null) {
            		modelAnchor += '            <span class=\"model-info-detail\">' + _detail_title_labor + '<span class=\"model-info-labor\">' + _data.warrantyInfoLabor + '</span></span>';
            	}
            	/* //LGEJP-1609 20170119 add */
            }else{
            	/* LGELV-140  20161011 modify */
            	//modelAnchor += '            <span class=\"model-info-detail\">Labor <span class=\"model-info-labor\">' + _data.warrantyInfoLabor + '</span> / Parts <span class=\"model-info-parts\">' + _data.warrantyInfoParts + '</span></span>';
            	if(lgFilter.locale =="/lv" || lgFilter.locale =="/th"){
            		modelAnchor += '            <span class=\"model-info-detail\">' + _detail_title_labor + '<span class=\"model-info-labor\">' + _data.warrantyInfoLabor + '</span></span>';
            	}else{
            		modelAnchor += '            <span class=\"model-info-detail\">' + _detail_title_labor + '<span class=\"model-info-labor\">' + _data.warrantyInfoLabor + '</span> / '+  _detail_title_parts + '<span class=\"model-info-parts\">' + _data.warrantyInfoParts + '</span></span>';
            	}
            	/*//LGELV-140  20161011 modify */
            	
            	/* LGECI-3011 20170912 add */
            	if( (lgFilter.locale =="/ca_en" || lgFilter.locale =="/ca_fr") && _data.superCategory != undefined ) {
            		if (_data.superCategory.toLowerCase() == "mobile" || _data.superCategory.toLowerCase() == "mobiles") {
                		modelAnchor += '<span class=\"hidden hiddenFlag\">mobile</span>' ;
            		} else {
            			$("span.hidden.hiddenFlag").remove();
            		}
            	}
            	/* //LGECI-3011 20170912 add */
            }
            /*//LGEBR-3044 20160801 modify */        	
        }

        modelAnchor += '        </span>';
        modelAnchor += '    </span>';
        modelAnchor += '</a>';
        var $modelAnchor = $(modelAnchor);

        $modelAnchor.find('.model-view-image').on('error', function() {
            this.src = _data.errorImageUrl;
        });

        self["$" + self._activeBox + "Box"].children(".model-view-detail").empty().append($modelAnchor);
        /* LGEAU-2293 modify */
        if (!self.$wrapper.hasClass("open")) {
        	self.expandBox();
        }else {
        	self._setCompatibleMsg();
        }
        /*//LGEAU-2293 modify */
        if (typeof _callback == "function") _callback();

        // set infomation
        self.$wrapper.closest("form").trigger("modelBrowser:setDetail", [_data]);
        if(self._activeBox == "search") {
            self.$predictiveElement.focus();
        }
        /* LGEBR-3169 20160928 add*/
        if (lgFilter.locale =='/br' && $('#policypopbr').hasClass('hidden') ) {
        	var popType="" ;
            
        	if(_data.csMobileModelFlag =="Y"){
                popType = "mc";
        	}else{
                for (var f in _data.repairServiceType) {
                    if(_data.repairServiceType[f] =="onsite"){
                        popType = "onsite";
                    }
                    /* LGEBR-3355 20180205 add */
                    if(_data.repairServiceType[f] =="carryin"){
                        popType = "carryin";
                        
                        /* LGEBR-3712 : 20180524 add */
                        _data.isMobile == "Y" ? $(".step-result").find(".model-name").attr("policyType", "carryinMC") : $(".step-result").find(".model-name").removeAttr("policyType");
                        /*//LGEBR-3712 : 20180524 add */
                    }
                    /*// LGEBR-3355 20180205 add */
                }
                (popType=="")?popType = "common":null;
        	}
            $('#policypopbr').attr("data-service-type", popType);
        }
        /*//LGEBR-3169 20160928 add*/
        
        /* LGECI-2884 20170601 add */
        if (lgFilter.locale =="/ca_en" || lgFilter.locale =="/ca_fr") {
        	$('input[name=warrantyInfoLaborForMonth]').val(_data.warrantyInfoLaborForMonth);
        	$('.msg-error-oow').attr('style','display:none');
        }
        /*// LGECI-2884 20170601 add */
    }


    proto._openModal = function(_el, e) {
        var self = this;
        //console.log("e : ", e);
        var keyword = self.$predictiveElement.val().trim();
        var exceptCharacter = self.$predictiveElement.data("exceptCharacter") || predictiveSearch.prototype._defaults.exceptCharacter;
        if (keyword.length > self.options.keywordMinLength - 1 || 
           $.inArray(keyword.substr(0, 1).toLowerCase(), exceptCharacter.toLowerCase().split('')) > -1) {
            var url = self.$searchBox.data("modalUrl");
            self.$predictiveElement.removeClass("error").siblings("span.msg-error").text('');
            
            if (e.clickTarget) {//predictive button click
                var _this = $(e.clickTarget);
                var productName = _this.find(".model-name").text();
                if (!self.$predictiveElement.data("arrowControl")) {
                    self._getInformation({
                        "keyword": productName,
                        "category": _this.find(".category-name").text(),
                        "product": _this.find(".product-name").text()
                    }, e);
                    //e.preventDefault(); // LGEGMO-1820
                }
            } else {
                var countUrl = self.$searchBox.data("countUrl"),
                    param = self.options.validateField+"="+self.$predictiveElement.val(); //self.$searchBox.find("fieldset").serialize();

                self.ajaxCall(countUrl, param, "json", function(data) {
                    self._progressing = false;
                    if (typeof data === "object") {
                        if (data["count"] == 1) {
                            self._getInformation({
                                "modelNum" : data["modelNum"] || self.$predictiveElement.val()
                            }, e);
                        } else if (data["count"] > 1) {
                            self.$wrapper.data({
                                "url": url.split("?")[0] + "?" + (url.split("?")[1] ? url.split("?")[1] + "&" : "") + param,
                                "maxWidth": 745
                            }).one("modal:ajax:complete", $.proxy(self.modelLoader, self)).modal();
                        } else {
                            var msg = self.$predictiveElement.data("notFoundMsg");
                            self.$predictiveElement.addClass("error").focus().siblings("span.msg-error")
                                .html('<i class="icon icon-error"></i>' + msg);
                            $(".predictive-search").hide();
                        }
                    }
                }, true);

            }

        } else {
            self.$predictiveElement.addClass("error").focus().siblings("span.msg-error")
                .html('<i class="icon icon-error"></i>' + formerror.required.split("%title%").join(self.$predictiveElement.attr("title")));
        }

        if (e) e.preventDefault();
    }

    proto.modelLoader = function() {
        var self = this;
        var _target = $(self.classname.modelpopup).data('responseLocation');
        $(self.classname.modelpopup).on("change", ".load-model", function() {
            var _this = $(this)
                // console.log("ajax selectbox");
            if (_this.val()) {
                self._setModelList(_this.val(), _target);
            }
        }).on("click", ".model-paging", function(e) {
            var _this = $(this);
            e.preventDefault();
            self._setModelList(_this.data('href'), _target);
            // console.log("ajax paging");
        }).on("click", "a.select-product", function(e) {
            var _this = $(this);
            e.preventDefault();
            // var productName = self.options.pageChange ? _this.data('setData')['modelNum'] : _this.find(".model-name").text();

            self._getInformation(_this.data('setData'), e);
            $.modal.close();
            // console.log("get detail");
        })
    }

    proto._setModelList = function(data, target) {
        var self = this;
        self.ajaxCall(data, '', '', function(_response) {
            $(target).html(_response);
        });
    }

    proto.reset = function(_inset) {
        var self = this;
        self.collapseBox(_inset);
    }
    
    /* LGEAU-2293 add */
    proto._setCompatibleMsg = function() {
    	var self = this.$el;
        var chkAU =  (lgFilter.locale == "/au") ? true:false,
        	chkMsg = ($('input[name=win10CompatibleMessage]').val()!= undefined) ? true:false;
        
        var _model_wrapper = self.find('.model-view-detail');
        var _model_support_agent = (chkMsg)?$('input[name=win10CompatibleMessage]').val():'';
        
        _model_wrapper.find('.model-support-agent').remove();
        if(chkAU && chkMsg) {
        	_model_wrapper.append('<span class=\"model-support-agent\">'+ _model_support_agent +'</span>');
        }
    }
    /*//LGEAU-2293 add */

    proto.expandBox = function() {
        // console.log("expand Box");
        var self = this;
        
        
        if ($("body").hasClass("is-mobile")) {
            $.proxy(self.expandBoxMobile, self)();
            /*
            var _activeBoxHeight = self._activeBox == "select" ?
                self.$selectBox.outerHeight() + self.$selectBox.children(".model-view-detail").outerHeight() :
                477 + (self.$searchBox.children(".model-view-detail").outerHeight() - 282);
            
            self.$wrapper.css("height", _activeBoxHeight);
            */
        }
        
        self.$wrapper.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(e) {
            if (typeof self.delaySet == "number") clearInterval(self.delaySet)
            self.delaySet = setTimeout($.proxy(self.hideDeactive, self, self._activeBox), 100);
        }).addClass("open");
        
        /* LGEAU-2293 add */
        self._setCompatibleMsg();
        /*//LGEAU-2293 add */
    }

    proto.collapseBox = function(_inset, e) {
        // console.log("collapse Box", _inset, e);
        var self = this;
        //var _hasValue = self.$modelselect.val() || self.$modelsearch.val();
        
        if (self._activeBox == "search") {
            self.$predictiveElement.attr('required', 'required');
        }

        if (e) {
            if(e.originalEvent){
                self.$predictiveElement.val("");
                self.$validateElement.val("");
            }
        }

        if (_inset != 1) {
            self.$modelselect.val('').trigger("chosen:updated");
            self.$modelsearch.val('');
        }
        
        self._modelSelected = false;

        /*
        if (!self.options.pageChange || !_hasValue) {
            self.$wrapper.removeClass("open");
        }
        */

        // console.log("modelBrowser:deselectModel." +[self._activeBox]);
        if (self.options.pageChange) {
            // console.log("event onebind");
            /* LGEGMO-1839 start */
            if ($("body").hasClass("is-mobile")) {
                $.proxy(self.collapseBoxMobile, self)();
            }
            /* LGEGMO-1839 end */
            self.$wrapper.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(evt) {
                if ((e.kewordChange && self.options.preventReload) && self._activeBox == "search") {
                    return
                }
                self.$wrapper.closest("form").trigger("modelBrowser:deselectModel." + self._activeBox);
            }).removeClass("open");
        } else {
            // console.log("no event onebind");
            if ($("body").hasClass("is-mobile")) {
                $.proxy(self.collapseBoxMobile, self)();
            }
            
            self.$wrapper.removeClass("open");
            self.$wrapper.closest("form").trigger("modelBrowser:deselectModel." + self._activeBox);
        }
        self.hideDeactive(_inset);
        
        if (e) e.preventDefault();
    }
    
    /* LGEGMO-1839 start */
    proto.expandBoxMobile = function(){
        var self = this;
        self.$selectBoxHeight = self.$selectBox.outerHeight();

        /*LGECS-798 20160824 modify*/
        if(self._activeBox == "search"){
        	self.$searchBtnGroup.hide();
            	self.$searchBoxHeight = self.$searchBox.outerHeight();
            self.$wrapperHeight = self.$wrapper.height();
            self.$wrapper.css("height", self.$wrapperHeight);
            
            self.$closeWrapper.css("top", self.$searchBoxHeight+210);
            /*self.$searchBox.css({
                "position" : "absolute",
                "top" : self.$selectBoxHeight
            });

            self.expandMobileTimer = setTimeout(function(){
                self.$searchBox.css({
                    "top" : 0
                });
            },0);*/
        } else {
            //self.$selectBox.css({});
            self.$closeWrapper.css("top", 0);
            self.$wrapper.css("height", self.$selectBoxHeight+320);
	    self.$selectBox.css({
                "position" : "absolute",
                "top" : self.$searchBox.outerHeight()
              });
            self.expandMobileTimer = setTimeout(function(){
            	 self.$selectBox.css({
                     "top" : 0
                 });
            },0)
        }
        /*//LGECS-798 20160824 modify*/
    }
    
    proto.collapseBoxMobile = function(){
        var self = this;
	/*LGECS-798 20160824 modify*/
        if(self._activeBox == "search"){
        	 self.$wrapper.css("height", "auto");
        	 self.$closeWrapper.css("top", self.$searchBoxInitHeight-30);
            self.$wrapper.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(e) {
                //self.$wrapper.css("height", "auto");
                /*self.$searchBox.css({
                    "position" : "static"
                });*/
                self.$searchBtnGroup.show();
            });
            /*self.$searchBox.css({
                "top" : self.$selectBoxHeight
            });*/
        } else {
        	self.$closeWrapper.css("top", self.$searchBoxInitHeight-30);
            self.$selectBox.css({
                "top" : self.$searchBox.outerHeight()
            });
            self.$wrapper.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(e) {
            	self.$wrapper.css("height", "auto");
                self.$selectBox.css({
                    "position" : "static"
                });              
            });
        }
	/*//LGECS-798 20160824 modify*/
    }
    /* LGEGMO-1839 end */
    proto.hideDeactive = function(_type) {
        var self = this;
        //console.log("@", typeof _type, _type)
        if (typeof _type == "string" && _type != null && self.$wrapper.hasClass("open")) {
            if (_type == "search") {
                self.$selectBox.hide();
            } else {
                self.$searchBox.hide();
            }
        } else {
            self.$selectBox.show();
            self.$searchBox.show();
            self.$predictiveElement.attr("disabled", false);
        }
    }

    proto.initDom = function(obj, state, action) {
        // console.log("action", obj, state, action);

        var self = this;
        var domArr = obj[state];
        if (!Array.isArray(domArr)) return

        for (var cls in domArr) {

            if (state == "visible") {

                $(domArr[cls], self.$wrapper.closest("form"))[action]();

                if (domArr[cls] == '#purchaseInfoType1') {
                    $('#purchaseInfoType1').addClass('active');
                    $('#purchaseInfoType2').removeClass('active');

                } else if (domArr[cls] == '#purchaseInfoType2') {
                    $('#purchaseInfoType2').addClass('active');
                    $('#purchaseInfoType1').removeClass('active');

                }
            } else if (state == "hidden") {

                $(domArr[cls], self.$wrapper.closest("form"))[action]();

                if (domArr[cls] == '.banner-app') {
                    if (domArr[cls] == '.banner-app') {
                        $(domArr[cls], self.$wrapper.closest(".step-list")).hide();
                    }
                }
            } else if (state == "globalVisible") {

                $(domArr[cls])[action]();

            } else if (state == "globalHidden") {

                $(domArr[cls])[action]();

            }
        }
    }

    proto.ajaxCall = function(_url, _param, _type, _callback, _preventSet) {
        //console.log( _param );
        //console.log( (typeof _param == "object") ? $.param(_param) : _param );
        
        var self = this;
        var response = $.ajax({
            url: _url,
            data: (typeof _param == "object") ? $.param(_param) : _param,
            dataType: _type,
            beforeSend: function() {
                self._progressing = true;
            },
            success: function(_data, _testStatus, _jqXHR) {
                // console.log("ajax Success", _data);
                if(!_preventSet) self.$wrapper.closest("form").trigger("modelBrowser:selectedModel." + self._activeBox + ":success");
                if (typeof _data === "object" && !_preventSet) {
                    self._setInformation(_data);

                    if (_data['visible']) self.initDom(_data, 'visible', "show");
                    if (_data['hidden']) self.initDom(_data, 'hidden', "hide");
                    if (!!_data['mc']) {
                        if (_data['mc']['globalVisible']) {
                            self.initDom(_data['mc'], 'globalVisible', "show");
                        }
                        if (_data['mc']['globalHidden']) {
                            self.initDom(_data['mc'], 'globalHidden', "hide");
                        }
                    }
                    if (!!_data['globalVisible']) self.initDom(_data, 'globalVisible', "show");
                    if (!!_data['globalHidden']) self.initDom(_data, 'globalHidden', "hide");

                }
                if (typeof _callback == "function") _callback(_data);
            },
            error: function(_jqXHR, _textStatus, _errorThrown) {
                self.$wrapper.closest("form").trigger("modelBrowser:selectedModel." + self._activeBox + ":error");
            },
            complete: function() {
                self._progressing = false;
            }
        })
    }

    plugin('modelBrowser', ModelBrowser, '.model-browser');
    return ModelBrowser;

});