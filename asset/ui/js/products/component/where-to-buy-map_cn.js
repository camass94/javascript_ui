define(['global-config', 'ic/ic', 'ic/ui/module', 'mkt/scrollbar', 'mkt/infobox_cn', 'chosen'], function(globalConfig, ic, Module, scrollbar, InfoBox) {
    var proto,
        events = ic.events;

    var baidu = function(el, options) {
        var self = this;
        // Call the parent constructor
        baidu.superclass.constructor.call(self, el, options);

        self.$whereToBuy = $(".where-to-buy");
        self.$whereToBuyInfoWrap = self.$whereToBuy.find(".where-to-buy-info-wrap");
        self.$whereToBuyInfo = self.$whereToBuy.find(".where-to-buy-info");
        self.$storeSearch = self.$whereToBuy.find(".store-search");
        self.$storeMapBox = self.$whereToBuyInfo.find(".store-map-box");
        self.$storeMapContainer = self.$storeMapBox.find(".store-map-container");

        //mobile
        self.$infoList = self.$whereToBuyInfo.find(".info-list");
        self.$modalMapWrap = self.$whereToBuy.find(".modal-map-wrap");

        //brandshop
        self.$listOpen = self.$storeMapContainer.find(".store-result-open");
        self.$openCategory = self.$storeSearch.find(".open-search-category");
        
        /* PJTCNWTB-1 20171208 add*/
        self.$onlineStoreSearch = self.$whereToBuy.find(".online-store-search");
        /*// PJTCNWTB-1 20171208 add*/

        self._init();
    };
    // Inherit from Module
    ic.util.inherits(baidu, Module);
    // Alias the prototype for less typing and better minification
    proto = baidu.prototype;
    proto._defaults = {
        zoomLevel: 5,
        zoomLevelMin: 2,
        zoomLevelMax: 24,
        viewport: null,
        queryZoomLevel: 10,
        centerLatitude: null,
        centerLongitude: null,
        debug: false,
        region: "北京",
        queryType: "json",
        queryUrl: '/cn/js/wtb-cn-data.json',
        query: 'ajaxData/cnWtb.lg',
        smsUrl: 'https://www.lg.com/cn/product/smswtb.lgajax',
        superCategoryDefault: 'all',
        categoryDefault: 'all',
        infoType: true,
        searchHandler: true
    };

    proto._init = function() {
        var self = this;

        self.region = "all";
        self.city = "all";
        self.superCategory = self.options.superCategoryDefault;
        self.category = self.options.categoryDefault;
        self.center;
        self.searchPosition;
        self.activeItem;
        self.page;
        self.infobox;
        self.listOpen = false;
        self.markers = [];
        self.stores = [];
        self.storeSort;
        self.brandPage = self.$whereToBuy.hasClass("brandshop") ? true : false; 

        self.infoOptions = {
            offset: globalConfig.isMobile ? new BMap.Size(50, 35) : (self.options.infoType ? new BMap.Size(-10, 35) : new BMap.Size(-5, 35)),
            boxClass: "infoWindow",
            boxStyle: {
                width: globalConfig.isMobile ? "278px" : (self.options.infoType ? "470px" : "356px")
            },
            enableAutoPan: false
        };

        self._mapSetting();
        /* PJTCNWTB-1 20171207 add */
        self._onlineStoreSetting(true);
        /*// PJTCNWTB-1 20171207 add */
    }

    proto._mapSetting = function() {
        var self = this;
        var storeMap = document.getElementById("storeMap");
        var ctrl_nav,
            ctrl_ove,
            ctrl_sca;

        self.map = new BMap.Map(storeMap);
        ctrl_nav = new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_TOP_LEFT,
            type: BMAP_NAVIGATION_CONTROL_LARGE
        });
        /*LGECN-2310 : 20180718 modify*/
        if(!globalConfig.isMobile){
            ctrl_ove = new BMap.OverviewMapControl({
                anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
                isOpen: false
            });
        }
        /*//LGECN-2310 : 20180718 modify*/
        ctrl_sca = new BMap.ScaleControl({
            anchor: BMAP_ANCHOR_BOTTOM_LEFT
        });
        self.map.enableScrollWheelZoom();
        self.map.enableDoubleClickZoom();
        self.map.addControl(ctrl_nav);
        self.map.addControl(ctrl_ove);
        self.map.addControl(ctrl_sca);

        if(!globalConfig.isMobile){
            self.$storeSearch.find('.select').chosen();
            /* PJTCNWTB-1 20171208 add */
            self.$onlineStoreSearch.find('.select').chosen();
            /*// PJTCNWTB-1 20171208 add */
        }

        self.$storeSearch.find("[data-change='ajaxLoad']").ajaxLoad();
        self._captchaInit();
        self._eventControl();
        self._setAddress(self.region, self.city);

        self.map.addEventListener = function(event, fun) {
            if (event == "moveend" || event == "mousemove") {
                return false;
            } else {
                this['on' + event] = fun;
            }
        }
    }
    proto._setAddress = function(region, city) {
        var self = this,
            keyword;

        var option = {
            onSearchComplete: function(results) {
                if (self.searchPosition.getStatus() == BMAP_STATUS_SUCCESS) {
                    self.map.centerAndZoom(results.getPoi(0).point, 11);
                    self.center = self.map.getCenter();

                    if(self.options.searchHandler) {
                        self.page = 1;

                        if(self.brandPage) {
                            self.storeSort = 0;
                        }

                        self.$infoList.find(".store-result").remove();

                        var ajaxOptions = {
                            region: self.region,
                            city: self.city,
                            superCategory: self.superCategory,
                            category: self.category,
                            page: self.page,
                            modelId: document.location.href.split("modelId=")[1],	/* LGECN-2132 20170214 add */
                            signatureWTBUseFlag:$("body").find('[name="signatureWTBUseFlag"]').val() /* LGEGMO-2724 : 20170615 add */
                        };

                        self.mobileOptions = ajaxOptions;

                        self._pageAjax(self.options.query, ajaxOptions);
                    }

                    self.options.searchHandler = true;
                }
            }
        };
        self.searchPosition = new BMap.LocalSearch(self.map, option);

        if (typeof(region) != "undefined") {
            if (typeof(city) != "undefined") {
                if (region == "all" && city == "all") {
                    keyword = self.options.region;
                } else if (city != "all") {
                    keyword = city;
                } else {
                    keyword = region;
                }
            }
        }
        self.searchPosition.search(keyword);
    }
    proto._addMarkers = function(point, icons, itemNumber) {
        var self = this;
        var marker = new BMap.Marker(point, {
            icon: icons,
        });
        self.markers[itemNumber] = marker;
        self.map.addOverlay(marker);

        marker.addEventListener("click", function() {
            self._onItem(itemNumber);
            self._focusList(itemNumber);
        });
        marker.addEventListener("mouseover", function() {
            marker.setTop(true);
        });
        marker.addEventListener("mouseout", function() {
            marker.setTop(false);
        });
    }
    proto._setInfoWindow = function(item) {
        var self = this,
            content = "",
            store = self.stores[item];

        store.wtbName = store.wtbName == null ? "" : store.wtbName;
        store.wtbAddress = store.wtbAddress == null ? "" : store.wtbAddress;
        store.wtbPhoneNo = store.wtbPhoneNo == null ? "" : store.wtbPhoneNo;

        content += "<button type='button' class='infoWindow-close'><span class='hide'>" + wtbMsg.layerClose + "</span><i class='icon icon-light-x'></i></button>"
        content += "<span class='tail'></span>";
        content += "<div class='info-detail'>";
        content += "<div class='infowindow-wrap'>";
        content += "<strong class='store-name'>" + store.wtbName + "</strong>";
        content += "<div class='infowindow-content'><ul>"
        content += "<li><strong class='store-address'>" + wtbMsg.address + ":</strong>" + store.wtbAddress + "</li>";
        content += "<li><strong class='store-code'>" + wtbMsg.phone + ":</strong>" + store.wtbPhoneNo + "</li>";
        content += "</ul></div>";
        if (!globalConfig.isMobile && self.options.infoType) {
            content += "<a href='#' class='modal-button sms' data-item='" + item + "'>";
            content += "<span class='hide'>" + wtbMsg.openSmsLayer + "</span><i class='icon icon-wtb-phone'></i></a>";
        }
        content += "</div></div>";

        self.infobox = new BMapLib.InfoBox(self.map, content, self.infoOptions);
    }
    proto._onItem = function(item) {
        var self = this;

        if (typeof(item) == "undefined") {
            if (typeof(self.infobox) != "undefined"){
                 if(self.infobox._isOpen){
                    self.infobox.close();
                 }
            }
            self.activeItem = null;
        } else if (self.activeItem != item) {
            if (typeof(self.infobox) != "undefined"){
                 if(self.infobox._isOpen){
                    self.infobox.close();
                 }
            }
            self.activeItem = item;
            self._setInfoWindow(item);
            self.map.panTo(self.markers[item].getPosition());
            self.center = self.map.getCenter();
            self.infobox.open(self.markers[item].getPosition());
        } else if (self.activeItem == item && !self.infobox._isOpen) {
            self._setInfoWindow(item);
            if(!globalConfig.isMobile){
                self.map.panTo(self.markers[item].getPosition());
                self.center = self.map.getCenter();
            }
            self.infobox.open(self.markers[item].getPosition());
        } else if (self.activeItem == item && self.infobox._isOpen) {
            self.map.panTo(self.markers[item].getPosition());
            self.center = self.map.getCenter();
        }

        if (typeof(self.infobox) != "undefined") {
            self.$storeMapBox.find(".infoWindow-close").on("click", function() {
                self.infobox.close();
            });
            self.$storeMapBox.find(".infowindow-wrap").find(".modal-button").on("click", function(e) {
                e.preventDefault();
                var $this = $(this);
                self._openLayer($this);
            });
        }
    }
    proto._eventControl = function() {
        var self = this;

        // store sort change
        self.$storeMapBox.on("click", ".store-sort a", function(e){
            e.preventDefault();
            var $this = $(this);
            var index = $this.parent().data("index");

            self._reset();
            self.storeSort = index;
            self.page = 1;

            var ajaxOptions = {
                region: self.region,
                city: self.city,
                superCategory: self.superCategory,
                category: self.category,
                page: self.page
            };

            self._pageAjax(self.options.query, ajaxOptions);
        });

        // list-map marker active
        self.$storeMapBox.on("click", ".store-result li[data-item]", function(e) {
            if ($(e.target).parent().hasClass("modal-button") == true || globalConfig.isMobile) return;
            /* LGEGMO-1114 20160304  add */
            $(this).parent().find('li').removeClass("active");
            $(this).addClass("active");
            /*//LGEGMO-1114 20160304  add */
            
            var $this = $(this),
                item = $this.attr("data-item");            
            self._focusMap();
            self._onItem(item);
        });

        // modal layer show
        self.$whereToBuy.on("click", ".modal-button", function(e) {
            e.preventDefault();
            var $this = $(this),
                item = $this.attr("data-item");
            self.activeItem = item;
            self._openLayer($this);
        });

        // select change
        self.$whereToBuy.on("change", ".select", function(e, temp) {
            var name = $(e.target).attr("name");
            var target = $(this).data("target");

            switch (name) {
                case "region":
                    self.region = $(".select-region").val();
                    self.city = "all";
                    break;
                case "city":
                    self.city = $(".select-city").val();
                    break;
                case "superCategory":
                    if ($(".select-superCategory").val() != self.superCategory) {
                        self.superCategory = $(".select-superCategory").val();
                        self.category = "all";

                        $(".select-category").data("default", self.category);
                    }
                    break;
                case "category":
                    self.category = $(".select-category").val();
                    break;
            }

            if( typeof(target) != "undefined" && typeof(temp) == "undefined") {
                self._chosenReset($(".select[name="+target+"]"));
            }
        });

        // search store
        self.$whereToBuy.on("click", ".search-button", $.proxy(function(e) {
            e.preventDefault();

            self._reset();
            self._setAddress(self.region, self.city);
            
            self.$whereToBuy.find(".modal-wrap .btn-close").trigger("click");

            if(self.brandPage) {
                var chosenSelect = self.$whereToBuy.find(".select");
                chosenSelect.each(function(index){
                    self._chosenReset($(this));
                });

                if(globalConfig.isMobile && self.$infoList.css("display") == "none"){
                    self.$infoList.show();
                } else if(globalConfig.isMobile && self.$infoList.css("display") == "block"){
                    self.$infoList.find("li[data-index] .info-toggle-content").stop().slideUp();
                    self.$infoList.find("li[data-index]").removeClass("active");
                    self.$infoList.find(".store-result").remove();
                }
            }
        }, self));

        // open tool tip delete
        self.$whereToBuy.on("keydown", ".sms-address, .captchaVal", function() {
            if ($(this).parents(".open-tooltip")) {
                $(this).parents(".open-tooltip").removeClass("open-tooltip");
            }
        });

        // page move
        self.$storeMapBox.on("click", ".page-control > ol a", function(e) {
            e.preventDefault();
            var $this = $(this);
            self._pageMove($this);
        });

        self.$storeMapBox.on("click", ".page-control > a", function(e) {
            e.preventDefault();
            var $this = $(this);

            if ($this.hasClass("prev")) {
                self.page--;
            } else if ($this.hasClass("next")) {
                self.page++;
            }
            self._pageMove($this);
        });

        // list open / close
        self.$listOpen.on("click", function(e){
            e.preventDefault();
            self._resultOpen();
        });

        // save map center when dragend 
        self.map.addEventListener("dragend", function() {
            self.center = self.map.getCenter();
        });

        // mobile
        // content toggle
        self.$infoList.find(".btn-info-toggle").on("click", function(e) {
            e.preventDefault();
            var parent = $(this).parent();

            if (parent.find(">.info-toggle-content").is(":animated")) {
                return;
            }

            if( !self.brandPage ){
                if (parent.hasClass("active")) {
                    parent.removeClass("active");
                    parent.find(">.info-toggle-content").stop().slideUp();
                } else {
                    parent.addClass("active");
                    parent.find(">.info-toggle-content").stop().slideDown();
                }
            } else { 
                var index = parent.data("index");

                if(parent.hasClass("active")){
                    parent.find(".info-toggle-content").stop().slideUp();
                    parent.find(".store-result").remove();
                    parent.removeClass("active");
                } else {
                    self.$infoList.find("li[data-index].active .info-toggle-content").stop().slideUp();
                    self.$infoList.find("li[data-index].active").removeClass("active");
                    self.$infoList.find(".store-result").remove();

                    self._reset();
                    self.storeSort = index;
                    self.page = 1;

                    var ajaxOptions = {
                        region: self.region,
                        city: self.city,
                        superCategory: self.superCategory,
                        category: self.category,
                        page: self.page
                    };

                    self._pageAjax(self.options.query, ajaxOptions, parent);
                }
            }
        });

        // info list load more
        self.$storeMapBox.on("click", ".btn-load-more", function(e) {
            e.preventDefault();
            var $this = $(this),
                url = $this.attr("data-url");
            
            self.mobileOptions.page = ++self.page;

            self._pageAjax(url, self.mobileOptions);
        });

        // map open
        self.$storeMapBox.on("click", ".gray-map-open", function(e) {
            e.preventDefault();
            var number = $(this).parents("li[data-item]").data("item");
            var windowHeight = $(window).height();
            var activeItem = self.stores[number];
            var mapTitle = activeItem['wtbName'];
            var $info = $(this).parents("li[data-item]").html(); 
            var $mapTitle = self.$modalMapWrap.find(".map-title");
            var $mapInfo = self.$modalMapWrap.find(".map-info");
            var $storeMapView = self.$modalMapWrap.find(".store-map-view");

            $mapTitle.html(mapTitle);
            $mapInfo.html($info);
            self.$modalMapWrap.css({
                "display": "block",
                "height": windowHeight
            });

            var mapHeight = 39 + $mapTitle.outerHeight() + $mapInfo.outerHeight();

            $storeMapView.css({
                "height": "calc(100% - " + mapHeight + "px)"
            })
            $("body").css({
                "height": windowHeight,
                "overflow": "hidden"
            });


            if (typeof(self.infobox) != "undefined"){
                 if(self.infobox._isOpen){
                    self.infobox.close();
                 }
            }
            self.map.clearOverlays();
            self.map.addOverlay(self.markers[number]);
            self._onItem(number);

            setTimeout(function() {
                self.map.setCenter(self.markers[number].getPosition());
            }, 100);

            $(window).resize(function() {
                var windowHeight = $(window).height();
                var mapHeight = 39 + $mapTitle.height();

                self.$modalMapWrap.css({
                    "height": windowHeight
                });
                $storeMapView.css({
                    "height": "calc(100% - " + mapHeight + "px)"
                });
            });
        });

        // map close
        self.$modalMapWrap.find(".btn-map-close").on("click", function(e) {
            e.preventDefault();
            var documentHeight = $(document).height();
            self.$modalMapWrap.css("display", "none");
            $("body").css({
                "height": "auto",
                "overflow": "visible"
            });
        });
        
        /* PJTCNWTB-1 20171207 add  */
        self.$whereToBuy.on("click", ".online-search-button", $.proxy(function(e) {
        	e.preventDefault();
            self._onlineStoreSetting();            
        }, self));        
        /*// PJTCNWTB-1 20171207 add  */
        
    }
    
    /* PJTCNWTB-1 20171207 add  */
    proto._onlineStoreSetting = function(status){
    	var modelId = window.location.search.substring(1);
    	var $form = $('#onlineStoreForm');
    	var $storeList = $('.online-store');
    	
    	$storeList.html('');
        
    	$.ajax({
            url: $form.data('query-url'),
            data: $form.serialize() + '&' +modelId,
            dataType: 'json',
            error: function(xhr, status, error) {
                if (xhr.readyState == 0 || xhr.status == 0) {
                    return;
                } else {
                    //console.log(xhr + ', ' +  status+ ', ' + error);
                    alert(errorMsg);
                }
            },
            success: function(data) {
            	var content = '';
            	
                if (data.length) {
                	content += '<ul class="online-store-list">';
                    $.each(data, function(item) {                    	
                    	if(status && (data[item].status != 1)){
                    		if(data.length == 1){
                    			content = '<p class="no-result">没有结果</p>';
                    		}                    		
                    		return;
                    	}
                    	content += '<li>';
                    	if(data[item].status == 1){
                    		content += '<div class="thumb"><a adobe-online="online-retailer" adobe-onlinename="'+ data[item].site_name +'" href="'+ data[item].link +'" target="_blank" title="在新窗口打开"><img src="'+ data[item].image_addr +'" alt="'+ data[item].site_name +'"></a></div>';
                    	}else{
                    		content += '<div class="thumb"><img src="'+ data[item].image_addr +'" alt="'+ data[item].site_name +'"></div>';
                    	}                    	
                    	content += '<div class="retailer-name">'+ data[item].site_name +'</div>';
                    	if(data[item].status == 1){
                    		content += '<div class="btn-go-to"><a adobe-online="online-retailer" adobe-onlinename="'+ data[item].site_name +'" href="'+ data[item].link +'" class="btn" target="_blank" title="在新窗口打开">在线购买</a></div>';
                    	}else{   
                    		content += '<div class="btn-go-to"><a href="#" class="btn btn-grey" title="在新窗口打开" onclick="event.preventDefault();return false;">在线购买</a></div>';                    		           		
                    	}
                    	content += '</li>';
                    });
                    content += '</ul>';
                	
                } else {                	
                	content = '<p class="no-result">没有结果</p>';
                }
                
                $storeList.append(content);
            },
            complete: function() {            	
            }
        })
    } 
    /*// PJTCNWTB-1 20171207 add  */
    
    proto._sendSms = function(item, closeFocus) {
        var self = this,
            store = self.stores[item],
            number_pattern = /^[0-9]/,
            pattern_check = 0;
        $modalWrap = $("#sms");

        var phoneNumber = $modalWrap.find(".sms-address");
        var capachaInput = $modalWrap.find(".captchaVal");
        var marketing = $modalWrap.find(".marketing-check").is(":checked");
        var customizedCaptcha = $modalWrap.find("#LBD_VCID_customizedCaptcha").val();
        var distributorId = self.$storeMapBox.find(".offline-store-list > li[data-item=" + item + "]").data("distributor-id");

        $modalWrap.find('.open-tooltip').removeClass("open-tooltip");

        if (phoneNumber.val() != null && phoneNumber.val() != "" && phoneNumber.val().length <= 30) {
            if (!number_pattern.test(phoneNumber.val())) {
                pattern_check = 1;
                $modalWrap.find(".address-input").addClass("open-tooltip");
                return false;
            }
        } else {
            pattern_check = 1;
            $modalWrap.find(".address-input").addClass("open-tooltip");
            return false;
        }

        if (capachaInput.val() == null || capachaInput.val() == "") {
            pattern_check = 1;
            $modalWrap.find(".captchaVal").parent().addClass("open-tooltip");
            $modalWrap.find(".LBD_ReloadLink").trigger("click");
            return false;
        }

        if (pattern_check == 0) {
            $.ajax({
                url: self.options.smsUrl,
                type: "post",
                data: {
                    "storeName": store.wtbName,
                    "storeAddress": store.wtbAddress,
                    "storePhone": store.wtbPhoneNo,
                    "userPhone": phoneNumber.val(),
                    "captcha": capachaInput.val(),
                    "marketing": marketing,
                    "customizedCaptcha": customizedCaptcha,
                    "distributorId": distributorId
                },
                dataType: "jsonp",
                jsonp: "callback",
                error: function(xhr) {
                    $("html > div.page-dimmed").remove();
                    alert(errorMsg);
                },
                success: function(code) {
                    if (code.returnCode == "error") {
                        if (code.returnMessage == "check-number") {
                            $modalWrap.find(".captchaVal").parent().addClass("open-tooltip");
                            $modalWrap.find(".LBD_ReloadLink").trigger("click");
                        } else if (code.returnMessage == "countlimit") {
                            self._hideSmsLayer();
                            self._openLayer(wtbMsg.countLimit, closeFocus);
                        } else if (code.returnMessage == "totalcountlimit") {
                            self._hideSmsLayer();
                            self._openLayer(wtbMsg.smsError, closeFocus);
                        } else {
                            self._hideSmsLayer();
                            self._openLayer(wtbMsg.smsFail, closeFocus);
                        }
                    } else if (code.returnCode == "success") {
                        self._hideSmsLayer();
                        self._openLayer(wtbMsg.smsSucess, closeFocus);
                    }
                }
            });
        }
    }
    proto._queryData = function() {
        var self = this;
        var options = {
            region: self.region,
            city: self.city,
            superCategory: self.superCategory,
            category: self.category,
            page: self.page,
            modelId: document.location.href.split("modelId=")[1],	/* LGECN-2132 20170214 add */
            signatureWTBUseFlag:$("body").find('[name="signatureWTBUseFlag"]').val() /* LGEGMO-2724 : 20170615 add */
        };

        if( typeof(options) != "undefined" && typeof(self.storeSort) != "undefined"){
            options.sort = self.storeSort;
        }

        $.ajax({
            url: self.options.queryUrl,
            data: $.param(options),
            type: "post",
            dataType: self.options.queryType,
            error: function(xhr, status, error) {
                if(xhr.readyState == 0 || xhr.status == 0){
                    return;
                }else{
                    self._reset();
                    $("html > div.page-dimmed").remove();
                    alert(errorMsg);
                }
            },
            success: function(data) {
                if (data.length) {
                    $.each(data, function(item) {
                        var point = data[item].wtbAddress;
                        var icons;

                        self.stores.push(data[item]);

                        if (globalConfig.isMobile) {
                            item = item + (self.page - 1) * 5;
                            icons = new BMap.Icon("/cn/content/img/wtb/marker_bg.png", new BMap.Size(28, 34));
                        } else {
                            icons = new BMap.Icon("/cn/content/img/wtb/marker.png", new BMap.Size(28, 34), {
                                imageOffset: new BMap.Size(0, 0 - item * 34)
                            });
                        }

                        var pointGeo = new BMap.Geocoder();
                        pointGeo.getPoint(point, function(position) {
                            if (position) {
                                self._addMarkers(position, icons, item);
                            }
                        });
                    });
                } else {
                    self._reset();
                }

                if(self.brandPage){
                    if(!self.listOpen){
                        self._resultOpen();
                    }
                    self._focusMap();
                }
            
            },
            complete: function() {

            }
        });
    }
    proto._pageAjax = function(url, options, toggleContent) {
        var self = this;
        var $box = $(".store-map-wrap > li[data-index]").length ? $("li[data-index="+ self.storeSort +"]").find(".store-map-box") : self.$storeMapBox;
        var target = $box.find(".offline-store-list").length ? ".offline-store-list" : ".store-map-box";

        if( typeof(options) != "undefined" && typeof(self.storeSort) != "undefined"){
            options.sort = self.storeSort;
        }

        $.ajax({
            type: "post",
            url: url,
            data: typeof(options) != "undefined" ? options : "",
            error: function(xhr, status, error) {
                if(xhr.readyState == 0 || xhr.status == 0){
                    return;
                } else {
                    $("html > div.page-dimmed").remove();
                    alert(errorMsg);
                }
            },
            success: function(res, data) {
                var $html = $(res);

                if (!globalConfig.isMobile) {
                    $box.find(".store-result").remove();
                    $html.appendTo($box);

                    if(self.brandPage) {
                        $box.find(".store-result .styled-scroll").scrollbar();
                        self.$storeMapBox.find(".store-sort li").removeClass("active").filter("[data-index="+self.storeSort+"]").addClass("active");
                    }
                } else {
                    var targetHtml = $box.find(".offline-store-list").length ? $html.contents().filter(target).html() : $html;
                    var storeList, countLoad;
                    $(targetHtml).appendTo($(target));
                    storeList = $box.find(".offline-store-list");
                    countLoad = storeList.data("total-count") - storeList.find("> li").length;
                    if (countLoad == 0) {
                        $box.find(".btn-load-more").hide();
                    }

                    if(typeof(toggleContent) != "undefined"){
                        toggleContent.find(".info-toggle-content").stop().slideDown();
                        toggleContent.addClass("active");
                    }
                }
                self._queryData();
            }
        });
    }
    proto._pageMove = function(page) {
        var self = this;
        var url = page.data("url");

        if (typeof(page.attr("data-page")) != "undefined") {
            self.page = page.attr("data-page");
        }
        self._reset();
        self._pageAjax(url);
    }
    proto._openLayer = function(layer, closeFocus) {
        var self = this,
            modalName,
            modal,
            firstItem,
            lastItem;
        var scrollHeight = $(window).scrollTop();
        if (typeof(layer) != "string") {
            modalName = layer.clone().removeClass("modal-button").attr("class");
        } else {
            modalName = "error";
        }

        if (modalName == "category") {
            self._setCategoryLayer();
        } else if (modalName == "sms") {
            self._setSmsLayer(layer);
        } else {
            self._setError(layer);
        }

        function modalCenter(scrollHeight) {
            var _top = $(window).height() < modal.find(".modal-container").outerHeight(true) ? scrollHeight : (scrollHeight + ($(window).height() - modal.find(".modal-container").outerHeight(true)) / 2);
            modal.find(".modal-container").css("top", _top);
        }

        modal = $("#" + modalName);

        modalCenter(scrollHeight);

        firstItem = modal.find("a").filter(":first");
        lastItem = modal.find("button").filter(":last");
        modal.find(".modal-container").attr("tabindex", 0).focus();

        $(window).resize(function() {
            modalCenter(scrollHeight);
        });

        // modal close
        modal.find(".btn-close, .btn-cancle").on("click", function(e) {
            e.preventDefault();
            var category;
            if(typeof(closeFocus) == "undefined"){
                if (modal.attr("id") == "sms") {
                    modal.find("input[type=text]").val("");
                    modal.find(".open-tooltip").removeClass("open-tooltip");
                } else if( modal.attr("id") == "category" && self.brandPage){
                    self._categoryResult(modal.find(".select"));
                }
                modal.hide();
                layer.focus();
            } else{
                modal.remove();
                closeFocus.focus();
            }
        });

        // modal focus
        firstItem.off("keydown").on("keydown", function(e) {
            if (e.keyCode == 9 && e.shiftKey) {
                e.preventDefault();
                lastItem.focus();
            }
        });
        lastItem.on("keydown", function(e) {
            if (e.keyCode == 9 && !e.shiftKey) {
                e.preventDefault();
                firstItem.focus();
            }
        });
    }
    proto._hideSmsLayer = function() {
        var self = this,
        smsLayer = self.$whereToBuy.find("#sms");
        smsLayer.find("input[type=text]").val("");
        smsLayer.find(".open-tooltip").removeClass("open-tooltip");
        smsLayer.hide();
    }
    proto._setSmsLayer = function(layer) {
        var self = this,
            smsLayer = self.$whereToBuy.find("#sms");
        smsLayer.show();
        smsLayer.find(".LBD_ReloadLink").trigger("click");

        smsLayer.find(".sms-send").on("click", function(e) {
            e.preventDefault();
            self._sendSms(self.activeItem, layer);
        });
        smsLayer.find("input[type=text]").on("keydown", function(e){
            if(e.which == 13 || e.keyCode == 13){
                e.preventDefault();
                self._sendSms(self.activeItem, layer); 
            } 
        });
    }
    proto._setCategoryLayer = function() {
        var self = this,
            categoryLayer = self.$whereToBuy.find("#category");

        categoryLayer.show().find(".step4 .select").data("default", self.category);

        if ( typeof(categoryLayer.data("loading")) == "undefined") {
            categoryLayer.find(".select").chosen();
            categoryLayer.find("[data-change='ajaxLoad']").ajaxLoad();
            categoryLayer.find(".step3 .select").trigger("change", {openLayer:true});  
        }

        categoryLayer.data("loading",true);
    }
    proto._setError = function(message) {
        var self = this,
            content = "";

        content += "<div class='modal-wrap' id='error'>";
        content += "<div class='modal-container error'>";
        content += "<strong>" + wtbMsg.check + "</strong>";
        content += "<a href='#' class='btn-close'><span class='hide'>" + wtbMsg.layerClose + "</span><i class='icon icon-close'></i></a>";
        content += "<div class='modal-content'>";
        content += "<p class='sms-success'>" + message + "</p>";
        content += "</div>";
        content += "<div class='search-box'>";
        content += "<button type='button' class='btn btn-cancle'>" + wtbMsg.check + "</button>";
        content += "</div>";
        content += "</div>";
        content += "</div>";

        self.$whereToBuy.find(".container").append(content);
        $("#error").show();
    }
    proto._captchaInit = function() {
        var self = this;

        setIcon($('#customizedCaptcha_ReloadLink'), '<i class="icon icon-refresh"></i>');
        setIcon($('#customizedCaptcha_SoundLink'), '<i class="icon  icon-speaker"></i>');

        function setIcon($el, tag) {
            $el.prepend(tag).find('img').css({
                display: 'none !important'
            }).end().css({
                margin: '0 !important',
                visibility: 'visible'
            });
        }
        if (!globalConfig.isMobile) return;
        $('#customizedCaptcha_CaptchaImageDiv').css({
            width: '100%',
            height: '50px'
        });
        $('#customizedCaptcha').css({
            width: 'auto',
            height: 'auto',
            marginRight: '35px !important',
            visibility: 'visible',
            background: '#dcdcdc',
            textAlign: 'center'
        });
    }
    proto._focusMap = function() {
        if (globalConfig.isMobile) return;
        var self = this;

        $("body, html").stop().delay(150).animate({
            scrollTop: self.$storeMapContainer.offset().top - ($(window).height() - self.$storeMapContainer.height()) / 2
        }, 300);
    }
    proto._focusList = function(itemNum) {
        if (globalConfig.isMobile) return;
        var self = this;
        var $storeList = self.$storeMapBox.find(".offline-store-list");

        self.$storeMapBox.find(".store-content").stop().delay(150).animate({
            scrollTop: ($("li[data-item='" + itemNum + "']", $storeList).offset().top - $storeList.offset().top + 1)
        }, 300);
    }
    proto._resultOpen = function() {
        var self = this;
        var $resultList = self.$storeMapBox.find(".store-result");

        if (!self.listOpen) {
            self.$storeMapContainer.animate({
                "padding-right": "320px"
            }, {
                step: function() {
                    $resultList.addClass("active");
                    self.$listOpen.css("right", "-1px").find("i").removeClass("icon-triangle").addClass("icon-triangle-reverse");
                },
                complete: function() {
                    self.listOpen = true;
                    self.map.panTo(self.center);
                }
            }, 350);
        } else {
            self.$storeMapContainer.stop().animate({
                "padding-right": "0px"
            }, {
                step: function() {
                    self.$listOpen.css("right", "0px").find("i").addClass("icon-triangle").removeClass("icon-triangle-reverse");
                },
                complete: function() {
                    self.listOpen = false;
                    $resultList.removeClass("active");
                    self.map.panTo(self.center);
                }
            }, 350);
        }
    }
    proto._chosenReset = function($this) {
        if( !$this.val() || $this.val() == '' ) {
            $this.removeAttr("data-placeholder");
            $this.find("option[value='all']").attr("selected","selected");
            $this.find("option[value='']").remove();
            $this.trigger("chosen:updated");
        }
    }
    proto._categoryResult = function($select) {
        var self = this;
        var result;

        $select.each(function(index){
            if( index == 1 && ($(this).val() == "all" || $(this).val() == "") ){
                return;
            }
            result = $(this).val() != "" ? $(this).find("option:selected").html() : $(this).find("option[value='all']").html();
            
        });

        self.$openCategory.find("span").html(result)

    }
    proto._reset = function() {
        var self = this;

        self.map.clearOverlays();
        self._onItem();
        self.markers = [];
        self.stores = [];
    }

    ic.jquery.plugin('baidu', baidu, '.store-map-wrap');

    return baidu;
})
