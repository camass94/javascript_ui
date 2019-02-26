define(['global-config', 'ic/ic', 'ic/ui/module', 'mkt/infobox', 'mkt/scrollbar', 'chosen', 'cs/tabpanel'], function(globalConfig, ic, Module, InfoBox, scrollbar, Tabpanel) {
    var proto,
        events = ic.events;

    // buy online - instock
    /* LGEGMO-1666 */
    $(".buy-online .stock-list-ajax, .buy-online.stock-list-ajax").each(function(){
        var $stock = $(this);
        var url = $stock.data("url");
        var local = $stock.hasClass("stock-list-local");
        var stockError = function(){
            var content = "<p class='no-result'>" + wtbMsg.noOnlineResult + "</p>";
            $stock.append(content);
        }
        if(!local){
            var stockList = function(data) {
                var content = "";
                var product = data.products[0];
                var retailer = product.retailers;
                var countryCode = document.getElementsByTagName("html")[0].getAttribute("data-countrycode");
                var titleText = wtbMsg.onllineTitle ? wtbMsg.onllineTitle : "open new window";
                content += "<ul class='store-list styled-scroll scrollbar-outer minimum'>";
                $.each(retailer, function(item){
                    if(retailer[item].instock != 'false') {
                        content += "<li data-item-retailer='"+retailer[item].name+"' data-item-product='"+product.model_code+"'>";
                        /* LGEES-2387 20160510 modify */
                        if (lgFilter.locale == "/es") {
                            content += "<div class='thumb'><a title='"+titleText+"' adobe-online='online-retailer' adobe-onlinename='"+ retailer[item].name +"' data-url='"+retailer[item].deeplink_url+"' href='#' onclick='clickGA($(this)); return false;'><img src='"+retailer[item].logo_url+"' alt='"+ retailer[item].name +"'></a></div>";
                        } else {
                        	/* LGETH-820 20181102 modify */
                        	if ($stock.data("display-name") == true) {
                        		content += "<div class='thumb'><a target='_blank' title='"+titleText+"' adobe-online='online-retailer' adobe-onlinename='"+ retailer[item].name +"' href='"+retailer[item].deeplink_url+"'><img src='"+retailer[item].logo_url+"' alt='"+ retailer[item].display_name +"'></a></div>";       
                        	} else {
                        		content += "<div class='thumb'><a target='_blank' title='"+titleText+"' adobe-online='online-retailer' adobe-onlinename='"+ retailer[item].name +"' href='"+retailer[item].deeplink_url+"'><img src='"+retailer[item].logo_url+"' alt='"+ retailer[item].name +"'></a></div>";       
                        	}
                        	/*//LGETH-820 20181102 modify */
                        }
                        /* //LGEES-2387 20160510 modify */
                        /* LGEZA-514 20170912 modify */
                        if (/*lgFilter.locale == "/za" || lgFilter.locale == "/sg" ||*/ $stock.data("display-name") == true) {  /* //LGESG-1040 20181004 modify, LGETH-820 20181102 modify */	
                        	content += "<div class='retailer-name'>"+retailer[item].display_name+"</div>";
                        } else {
                        	content += "<div class='retailer-name'>"+retailer[item].name+"</div>";
                        }
                        /*//LGEZA-514 20170912 modify */
                        /* LGEBR-2818 20160310 modify */
                        if (typeof wtbMsg.buyOnline !== 'undefined' && wtbMsg.buyOnline !== 'null' ){
                            /* LGEES-2387 20160510 modify */
                            if (lgFilter.locale == "/es") {
                                content += "<div class='btn-go-to'><a title='"+titleText+"' adobe-online='online-retailer' adobe-onlinename='"+ retailer[item].name +"' data-url='"+retailer[item].deeplink_url+"' href='#' class='btn' onclick='clickGA($(this)); return false;'>" + wtbMsg.buyOnline + "</a></div>";
                            } else {
                                content += "<div class='btn-go-to'><a target='_blank' title='"+titleText+"' adobe-online='online-retailer' adobe-onlinename='"+ retailer[item].name +"' href='"+retailer[item].deeplink_url+"' class='btn'>" + wtbMsg.buyOnline + "</a></div>";
                            }  
                            /* //LGEES-2387 20160510 modify */ 
                        }else{
                         content += "<div class='btn-go-to'><a target='_blank' title='"+titleText+"' adobe-online='online-retailer' adobe-onlinename='"+ retailer[item].name +"' href='"+retailer[item].deeplink_url+"' class='btn'>Buy Online</a></div>";
                        }
                        /* LGEBR-2818 20160310 modify */
                        content += "</li>";
                    }
                });

                if( $(content).contents().length){
                    content += "</ul>";
                    $stock.append(content);
                } else {
                    stockError();
                }

                if(!globalConfig.isMobile){
                    $('.where-to-buy-info.col2 .buy-online .styled-scroll').scrollbar();
                }
            }
        } else {
            var modelCode = url.split("=")[1];
            var stockList = function(data) {
                var content = "";
                var products = data.shops;
                
                content += "<ul class='store-list styled-scroll scrollbar-outer minimum'>";
                $.each(products, function(item){
                    content += "<li data-item-retailer='"+products[item].name+"' data-item-product='"+ modelCode +"'>";
                    content += "<div class='thumb'><a target='_blank' title='open new window' adobe-online='online-retailer' adobe-onlinename='"+ products[item].name +"' href='"+products[item].deeplink_url+"'><img src='"+products[item].logo_url+"'></a></div>";
                    content += "<div class='retailer-name'>"+products[item].name+"</div>";
                    /* LGEBR-2818 20160310 modify */
                    if (typeof wtbMsg.buyOnline !== 'undefined' && wtbMsg.buyOnline !== 'null' ){
                     content += "<div class='btn-go-to'><a target='_blank' title='open new window' adobe-online='online-retailer' adobe-onlinename='"+ products[item].name +"' href='"+products[item].deeplink_url+"' class='btn'>" + wtbMsg.buyOnline + "</a></div>";
                    }else{
                     content += "<div class='btn-go-to'><a target='_blank' title='open new window' adobe-online='online-retailer' adobe-onlinename='"+ products[item].name +"' href='"+products[item].deeplink_url+"' class='btn'>Buy Online</a></div>";
                    }
                    /* LGEBR-2818 20160310 modify */
                    content += "</li>";
                });

                if( $(content).contents().length){
                    content += "</ul>";
                    $stock.append(content);
                } else {
                    stockError();
                }

                if(!globalConfig.isMobile){
                    $('.where-to-buy-info.col2 .buy-online .styled-scroll').scrollbar();
                }
            }
        }

        $.ajax({
            url: url,
            type: "GET",
            data: null,
            dataType: "jsonp",
            timeout: 5000,
            error: function(xhr, status, error) {
                stockError();
                $("html > div.page-dimmed").remove();
                //alert(error);
            },
            success: function(data) {
                stockList(data);
            }
        });  
    });
    /* LGEGMO-1666 */


    // mobile online, offline store toggle
    $(".where-to-buy").find(".btn-info-toggle").on("click", function(e) {
        e.preventDefault();
        var parent = $(this).parents('li');

        if (parent.find(">.info-toggle-content").is(":animated")) {
            return;
        }

        if (parent.hasClass("active")) {
            parent.removeClass("active");
            parent.find(">.info-toggle-content").stop().slideUp();
        } else {
            parent.addClass("active");
            parent.find(">.info-toggle-content").stop().slideDown();
        }
    });

    if($("#storeMap").length) {
        var GoogleMaps = function(el, options) {
            var self = this;
            // Call the parent constructor
            GoogleMaps.superclass.constructor.call(self, el, options);
            self.$whereToBuy = $(".where-to-buy");
            self.$whereToBuyInfo = self.$whereToBuy.find(".where-to-buy-info");
            self.$storeMapWrap = self.$whereToBuyInfo.find(".store-map-wrap");

            self.$storeMapBox = self.$storeMapWrap.find(".store-map-box");
            self.$mapExpand = self.$storeMapBox.find(".store-map-expand");
            self.$listOpen = self.$storeMapBox.find(".store-result-open");

            self.$resultList = self.$storeMapBox.find(".result-list");
            self.$positionContent = self.$resultList.find(".result-position");
            self.$directionContent = self.$resultList.find(".result-directions");

            self.$searchForm = self.$whereToBuy.find("#searchForm");
            self.$searchInput = self.$searchForm.find(".search-input");
            self.$searchButton = self.$searchForm.find(".search-button");
            self.$mySearch = self.$searchForm.find(".my-location-button");
            self.$nearByToggle = self.$searchForm.find(".near-by-toggle");

            self.$storeMapSearch = $(".store-map-search");
            self.$searchContainer = $(".search-container");
            self.$storeSearchCategory = $(".store-search-category");
            
            self.$storeListWrap = $(".store-list-wrap");
            
            self.$resultPosition = $(".result-position");
            self.$destinationStore = $(".destination-store");
            self.$directionInputBox = $(".direction-input-box");
            self.$startInput = $(".start-input");
            self.$routeList = $(".direction-route");
            self._init();
        };

        // Inherit from Module
        ic.util.inherits(GoogleMaps, Module);

        // Alias the prototype for less typing and better minification
        proto = GoogleMaps.prototype;
        proto._defaults = {
            country: null,
            zoomLevel: 5,
            zoomLevelMin: 2,
            zoomLevelMax: 24,
            queryZoomLevel: 10,
            queryUrl: '',
            queryType: "json",
            markerUrl: '/us/content/img/wtb/',
            unitMetric: false,
            selfSearch: false,
            defaultZoom: 0,
            debug: false
        };
        
        proto._init = function() {
            var self = this;
            self.geoResult = {};
            self.markers = [];
            self.stores = [];
            self.page;
            self.center;
            self.activeItem;
            self.listOpen = false;
            self.openDirection = false;
            self.check = false;
            self.brand = self.$whereToBuy.hasClass("brandshop");
            self.mapExpand = self.$storeMapWrap.hasClass("expand") ? true : false;
            self.zoomHandle = false;
            self.zoomSearch = false;
            self.dragSearch = false;
            self.nearBy = false;
            /* LGETR-1095 20170125 add */
            if (lgFilter.locale == "/tr") {
            	if ($("body").hasClass("is-mobile")) {
                	self.brand = false;
            	} else {
                	self.brand = true;
            	}
            }
            /* //LGETR-1095 20170125 add */

            self.markerIcon = {
                size: new google.maps.Size(34, 46),
                anchor: new google.maps.Point(17, 46)
            };
            self.autoCompleteOption = {	
                componentRestrictions: {
                	country: self.options.country
                }
            };
            self.infoOptions = {
                disableAutoPan: true,
                alignBottom: true,
                pixelOffset: globalConfig.isMobile ? new google.maps.Size(-142, -62) : new google.maps.Size(-262, -62),
                zIndex: 99,
                boxStyle: {
                    width: "520px"
                },
                infoBoxClearance: new google.maps.Size(1, 1),
                enableEventPropagation: globalConfig.isMobile ? false : true,
                boxClass: "infoWindow"
            };

            self._mapSetting();
        }
        
        proto._mapSetting = function() {
            var self = this;
            var mapBox = document.getElementById("storeMap");
            
            /* LGEGMO-1666 */
            self.mapOptions = {
                zoom: self.options.zoomLevel,
                minZoom: self.options.zoomLevelMin,
                maxZoom: self.options.zoomLevelMax,
                mapTypeId: google.maps.MapTypeId.ROADMAP, // google map type
                scaleControl: true,
                zoomControl: self.options.useController,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_TOP
                },
                mapTypeControl: self.options.useController,
                mapTypeControlOptions: {
                    position: google.maps.ControlPosition.LEFT_TOP
                },
                streetViewControl: self.options.useController,
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.LEFT_TOP,   
                }
            }
            /* LGEGMO-1666 */

            self.map = new google.maps.Map(mapBox, self.mapOptions);
            self.infoBox = new InfoBox(self.infoOptions);
            self.directionService = new google.maps.DirectionsService();
            self.directionsDisplay = new google.maps.DirectionsRenderer();
            self._eventControl();

            // WTB, brandshop, category quarter..
            self.$whereToBuy.find("input, select").removeAttr("required");
            if (!globalConfig.isMobile) {
                self.$storeListWrap.append("<p class='search-none'>" + wtbMsg.noResult + "</p>");
                self.$storeListWrap.scrollbar();
                $(".buy-online").find(".styled-scroll").scrollbar();
                self.$whereToBuy.find('.select').chosen();
            }
            
            if (self.$searchInput.length) {
                self.searchAuto = document.getElementById("mapSearch");
                self._autocomplete(self.searchAuto);
            }

            if(self.$whereToBuy.find("select[data-change=ajaxLoad]").length){
            	$("[data-change='ajaxLoad']").ajaxLoad();
            }
            self._setCountry(self.options.country);
        }
        proto._autocomplete = function(el) {
            var self = this;
            /* LGEJO-400 : 20160805 modify */
            if(lgFilter.locale == "/levant_en"){
	        	self.$searchForm.find(".select[name='country']").on("change", function() {
	            	self.options.country = $(this).val();
	            	if(self.$searchForm.find(".wtb-country").length){
	
	            		self.autoCompleteOption.componentRestrictions.country = self.options.country;
	            		/*LGEES-2865 20180403 add*/
	            		self.autocomplete.setOptions(self.autoCompleteOption)
	                     /*//LGEES-2865 20180403 add*/
	                }
	            });
            }else{
            	self.autoCompleteOption.componentRestrictions.country = self.options.country;
            }
            /*//LGEJO-400 : 20160805 modify */
            self.autocomplete = new google.maps.places.Autocomplete(el, self.autoCompleteOption);
            google.maps.event.addListener(self.autocomplete, 'place_changed', function(){});
        }
        proto._setCountry = function(address) {
            var self = this;
            var countryValue;
            var slocation = {
                      /*LGEGMO-3154 20170426 modify*/	
            		"address":address,
            		  /*LGEES-2865 20180403 add*/	
            		componentRestrictions: {
                    	"country": self.options.country
                    }
            			/*//LGEES-2865 20180403 add*/	
            		/*LGEGMO-3154 20170426 modify*/	
            };
            
            countryValue = typeof(self.$searchForm.find(".select[name='country']").val())  == "string";

            self.geocoder = new google.maps.Geocoder;
            self.geocoder.geocode(slocation, $.proxy(function(results, status) {
            	
                if (status == google.maps.GeocoderStatus.OK) {
                    self.geoResult.viewport = results[0].geometry.viewport;
                    self.map.fitBounds(self.geoResult.viewport);
                    self.center = self.map.getCenter();
                    
                    zoomListener = google.maps.event.addListener(self.map, "idle", function(){
                        if(self.options.defaultZoom != 0){
                            self.map.setZoom(self.options.defaultZoom);
                            self.center = self.map.getCenter();    
                        }
                        setTimeout(function(){
                            self.zoomHandle = true;
                            self.zoomSearch = true;
                            google.maps.event.removeListener(zoomListener);
                        }, 1000);
                    });
                    
                    if (self.$whereToBuy.hasClass("base") && self.options.selfSearch) {
                        self._mySearch();
                    } else if (countryValue && !self.$whereToBuy.hasClass("utility")) {  
                    	self._queryData();
                    }
                }
            }, self));
        }
        proto._mySearch = function() {
            var self = this;

            if (self.$storeMapSearch.find(".input-box").hasClass("disabled")) {return;}

            self.geocoder = new google.maps.Geocoder;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    self.geocoder.geocode({
                        "location": latLng,
                        "region": self.options.country
                    }, $.proxy(function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var geom = results[0].geometry,
                                address = results[0].formatted_address,
                                viewport = geom.viewport;
                            self.$searchInput.val(address);
                            google.maps.event.removeListener(zoomListener);
                            self.zoomHandle = false;
                            self.zoomSearch = false;
                            self.map.fitBounds(viewport);
                            self.center = self.map.getCenter();
                            self._queryData();
                            zoomListener = google.maps.event.addListener(self.map, "idle", function(){
                                setTimeout(function(){
                                    self.zoomHandle = true;
                                    self.zoomSearch = true;
                                    google.maps.event.removeListener(zoomListener);
                                }, 500);
                            });
                        }
                    }, self));
                });
            }
        }
        proto._search = function(country) {
       
            var self = this,
                address = "",
                geocoderOptions;
            var $searchEle = self.$searchForm.find("select, input");
            /* LGEGMO-1700 */
            if(typeof(country) == "undefined" || self.$whereToBuy.hasClass("utility")){
                self._selectCategory();
                if(!self.check){
                    return;
                }
            }
            /* LGEGMO-1700 */

			if(typeof(country) != "undefined"){
                if (self.$searchInput.length) {
                    self._autocomplete(self.searchAuto);
                }
                
                
                geocoderOptions = {
	                 /*LGEGMO-3154 20170426 modify*/	
                		"address":self.options.country,
                		 /*LGEES-2865 20180403 add*/	
                		componentRestrictions: {
                        	"country": self.options.country
                        }
                			/*//LGEES-2865 20180403 add*/	
                		/*LGEGMO-3154 20170426 modify*/	                   
                };
                if($searchEle.filter(".select[name='stepCity']").length){
                	address= $(".select[name='stepCity']").val();
                	 geocoderOptions = {
                             "address": address,
                             "region": self.options.country
                         };
                }
            }else if($searchEle.filter(".search-input").length){
	    	/* LGEEG-287 20170425 modify*/
            	if(self.$searchForm.find(".select[name='stepCity']").length){
	            	if(self.$searchInput.val()==""||self.$searchInput.val()==null){
	            		address= $(".select[name='stepCity']").val();
	            		if(address=="Others"){
	            			self.$searchInput.parents("li[class*=step]").addClass("open-tooltip")
	            			return;
	            		}
	                	 geocoderOptions = {
	                             "address": address,
	                             "region": self.options.country
	                         };
	            	}else{
	            		self.$searchForm.find(".select[name='stepCity']").find("option:last-child").prop("selected", true).trigger("chosen:updated");
	            		address = self.$searchInput.val();
		                geocoderOptions = {
		                    "address": address,
		                    "region": self.options.country
		                };
	            	}
            	}else{
	                address = self.$searchInput.val();
	                geocoderOptions = {
	                    "address": address
	                };
            	}
		    /* //LGEEG-287 20170425 modify*/
            }else {
                var lastIndex = self.$searchForm.find(".select").length - 1;

                self.$searchForm.find(".select").each(function(index){
                    var val = $(this).val();

                    if(val != 'all' && val != $(this).data("placeholder")){
                        /* LGEGMO-1666 */
                        if(index != lastIndex){
                        /* LGEGMO-1666 */
                            address += $(this).val() + " ";
                        }else{
                            address += $(this).val();
                        }
                    }
                });

                geocoderOptions = {
                    "address": address
                };
            }

            if(address == 'null' || address == null) return;

            self.geocoder = new google.maps.Geocoder;
            self.geocoder.geocode(geocoderOptions, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var geom = results[0].geometry,
                        viewport = geom.viewport;
                    self.zoomHandle = false;
                    self.zoomSearch = false;
                    self.map.fitBounds(viewport);
                    self.center = self.map.getCenter();
                    self.$searchForm.find(".open-tooltip").removeClass("open-tooltip");
                    self._queryData();
                
                    zoomListener = google.maps.event.addListener(self.map, "idle", function(){
                        setTimeout(function(){
                            self.zoomHandle = true;
                            self.zoomSearch = true;
                            google.maps.event.removeListener(zoomListener);
                        }, 500);
                    });
                }
            });

        }
        proto.offsetCenter = function(latlng, offsetx, offsety, map) {
            var self = this;
            var scale = Math.pow(2, map.getZoom());
            var worldCoordinateCenter = map.getProjection().fromLatLngToPoint(latlng);
            var pixelOffset = new google.maps.Point((offsetx / scale) || 0, (offsety / scale) || 0);
            var worldCoordinateNewCenter = new google.maps.Point(worldCoordinateCenter.x - pixelOffset.x, worldCoordinateCenter.y + pixelOffset.y);
            var newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
            self.map.panTo(newCenter);
            self.center = self.map.getCenter();
        }
        proto.setStoreInfo = function(data, self, itemNum) {
            var data = data[itemNum];
            var content = "<span class='tail'></span>"

            if (typeof(data['address']) != "string") data['address'] = "";
            if (typeof(data['wtbPhoneNo']) != "string") data['wtbPhoneNo'] = "";

            content += "<div class='styled-scroll scrollbar-outer minimum'>";
            content += "<div class='info-detail'>";
            content += "<div class='infowindow-wrap'>";
            content += "<strong class='store-name'>" + data['wtbName'] + "</strong>";
            content += "<div class='infowindow-content'>";
            content += "<div class='info-left'>";
            content += "<p class='store-address'>" + data['address'] + "</p>";
            if(data['wtbPhoneNo'] != ""){
                content += "<p class='store-phonenumber'>" + wtbMsg.telephone + ": " + data['wtbPhoneNo'] + "</span></p>";
            }
            content += "</div>";
            content += "<div class='info-right'><dl><dt>" + wtbMsg.category + "</dt>";
            for (var i = 0; i < data['ProductCode'].length; i++) {
                content += "<dd class='store-category'>" + data['ProductCode'][i] + "</dd>";
            }
            content += "</dl></div></div>";
            if (!globalConfig.isMobile) {
                content += "<div class='store-direction'><button type='button' data-item='" + itemNum + "' class='btn direction_button'>" + wtbMsg.direction + "</button></div>";
            }
            content += "</div></div></div></div>";

            self.setContent(content);

            if (!globalConfig.isMobile) {
                setTimeout(function() {
                    $(".infoWindow").find(".styled-scroll").scrollbar();
                }, 10);
            }
        }
        proto._queryData = function() {
            var self = this;
            /* LGEGMO-1666 */
            // 160429 query zoom level
	            if (self.map.getZoom() < self.options.queryZoomLevel) {
	                self.map.setZoom(self.options.queryZoomLevel);
	            }
            /* LGEGMO-1666 */

            if (!self.listOpen) {
                self._resultOpen();
            }

            self._reset();

            $.ajax({
                url: self.options.queryUrl,
                data: self.$searchForm.serialize() + "&" + $.param({
                    lat: self.map.getCenter().lat(),
                    lng: self.map.getCenter().lng(),
                    zipCode: self.options.country,
                    zoomLevel: self.map.getZoom(),
                    brand: self.brand
                }),
                dataType: self.options.queryType,
                error: function(xhr, status, error) {
                    if(xhr.readyState == 0 || xhr.status == 0){
                        return;
                    }else{
                        self._setError();
                        $("html > div.page-dimmed").remove();
                        alert(errorMsg);
                    }
                },
                success: function(data) {

                    if (data.length) {
                        var content = "";

                        $.each(data, function(item) {
                            var latlng = new google.maps.LatLng(data[item]['wtbLatitudeValue'], data[item]['wtbLongitudeValue']);

                            self.markerIcon.url = self.options.markerUrl + "marker_" + (parseInt(item, 10) + 101).toString().substr(1) + ".png";
                            var icon = $.extend(true, {}, self.markerIcon);

                            self.stores.push(data[item]);
                            self._addMarkers(latlng, icon, item);
                        })

                        for (var i = 0; i < self.stores.length; i++) {
                            var store = self.stores[i];
                            for (var j in store) {
                                store[j] = store[j] == null ? "" : store[j];
                            }
                        }
                        
                        self._pageMove();
                    } else {
                        self._setError();
                    }
                },
                complete: function() {
                    self.$storeMapBox.find(".search-before").remove();
                    
                    if (!globalConfig.isMobile && self.$whereToBuy.hasClass("brandshop")) {
                        $("html, body").stop().delay(150).animate({
                            scrollTop: self.$storeMapWrap.offset().top - ($(window).height() - self.$storeMapWrap.height()) / 2
                        }, 300);
                    }
                    self.dragSearch = true;
                    if(!globalConfig.isMobile && self.nearBy) self.nearBy = false;
                }
            })
        }
        proto._setError = function() {
            var self = this;
            var content = ""; 

            if(self.nearBy){
                content += "<p class='search-none'>" + wtbMsg.noNearBy + "</p>";
            }else{
                content += "<p class='search-none'>" + wtbMsg.noResult + "</p>";
            }

            if (globalConfig.isMobile) {
                self.$storeListWrap.prepend(content);
            } else {
                self.$storeListWrap.last().append(content);
            }
        }
        proto._setPagination = function(curPage, total) {
            var self = this,
                content = "";
            pageTotal = parseInt(total % 10) == 0 ? parseInt(total / 10) : parseInt(total / 10) + 1;

            self.$resultList.find(".pagination > ol").html(null);
            self.$resultPosition.removeClass("con-over");

            if (pageTotal > 1 && total != 0) {
                self.$resultPosition.addClass("con-over");

                var firstPage = curPage - (curPage % 5) + 1;
                if (curPage % 5 == 0 && curPage != 0) {
                    firstPage -= 5;
                }

                for (var i = firstPage; i <= firstPage + 4; i++) {
                    if (i == pageTotal + 1) {
                        break;
                    }
                    if (i == curPage) {
                        content += "<li class='active'><strong data-page='" + i + "' title='current page'>" + i + "</strong></li>"
                    } else {
                        content += "<li><a href='#' data-page='" + i + "'>" + i + "</a></li>"
                    }
                }
                self.$resultList.find(".pagination > ol").append(content);
            }
        }
        proto._pageMove = function() {
            var self = this,
                content = "<ul class='store-list'>";

            self.$storeListWrap.find(".store-list, .search-none").remove();

            for (var i = 0; i < self.markers.length; i++) {
                if (self.markers[i].getVisible())
                    self.markers[i].setVisible(false);
            }

            if (!globalConfig.isMobile) {

                if (self.page < 2) {
                    self.$resultList.find(".pagination .prev").css("visibility", "hidden");
                } else if (self.page == parseInt(self.stores.length / 10 + 1) || (self.stores.length % 10 == 0 && self.page == self.stores.length / 10)) {
                    self.$resultList.find(".pagination .next").css("visibility", "hidden");
                } else {
                    self.$resultList.find(".pagination").find(".prev, .next").css("visibility", "visible");
                }

                for (var i = (self.page - 1) * 10; (i <= self.page * 10 - 1) && (i <= self.stores.length - 1); i++) {
                    var data = self.stores[i];

                    content += self._setStoreList(data, i);

                    if (!self.markers[i].getVisible()) {
                        self.markers[i].setVisible(true);
                    }
                }
                content += "</ul>";

                self._setPagination(self.page, self.stores.length);
                self._onItem();
                self.$storeListWrap.last().append(content);
            } else {

                if (self.stores.length > 5) {
                    self.$storeListWrap.find(".btn-load-more").css("display", "block");
                }

                for (var i = 0; i < self.page * 5; i++) {
                    if (self.stores.length == i) {
                        self.$storeListWrap.find(".btn-load-more").hide();
                        break;
                    }
                    var data = self.stores[i];

                    content += self._setStoreList(data, i);
                }
                content += "</ul>";
                self.$storeListWrap.prepend(content);
            }
        }
        proto._setStoreList = function(data ,i) {
            var self = this;
            var content = "";
            /*LGEAE-1653 add : 20190107*/
            var trackingAttr = (lgFilter.locale == "/ae")?"adobe-click='offline-retailer' adobe-value='"+data['wtbName']+"'":"";
        	/*//LGEAE-1653 add : 20190107*/
            
            /*LGEAE-1653 modify : 20190107*/
            if(!globalConfig.isMobile) {
                content += "<li data-item='" + i + "'>";
                content += "<div class='store-number' "+trackingAttr+"><span>" + (i + 1) + "</span></div>";
                content += "<dl><dt class='store-name' "+trackingAttr+">" + data['wtbName'] + "</dt>";
                content += "<dd class='store-address' "+trackingAttr+">" + data['address'] + "</dd>";
                content += "<dd class='store-direction'><button type='button'";
                content += " data-item='" + i + "' class='btn direction_button' "+trackingAttr+">" + wtbMsg.direction + "</button></dd>";
                content += "</dl></li>";
            } else {
                content += "<li data-item='" + i + "'><div class='store-content'>";
                content += "<div class='store-number'><span>" + (i + 1) + "</span></div>";
                content += "<dl><dt class='store-name'>" + data['wtbName'] + "</dt>";
                content += "<dd class='store-distance'>" + wtbMsg.distance + ": " + data['distance'] + "M</dd>";
                content += "<dd class='store-address'>" + data['address'] + "</dd>";
                if(data['wtbPhoneNo'] != ""){    
                    content += "<dd class='store-phonenumber'><a href='tel:" + data['wtbPhoneNo'] + "' "+trackingAttr+">" + data['wtbPhoneNo'] + "</a></dd>";
                }
                content += "<dd class='store-url'><a href='" + data['wtbUrl'] + "' target='_blank' title='new open window' "+trackingAttr+">" + data['wtbUrl'] + "</a></dd>";
                content += "</dl><div class='btn-wrap'>";
                content += "<a href='#' class='btn-store-toggle'>" + wtbMsg.shopInfo + "<i class='icon icon-triangle-down'></i><i class='icon icon-triangle-up hide'></i></a>";
                content += "<div class='right-box'>";
                if(data['wtbPhoneNo'] != ""){
                    content += "<a href='tel:" + data['wtbPhoneNo'] + "' class='btn btn-call' "+trackingAttr+">" + wtbMsg.call + "</a>";
                }
                content += "<a href='#' class='btn gray-map-open gray' data-item='" + i + "' "+trackingAttr+">" + wtbMsg.see + "</a>";
                content += "</div></div></div>";
                content += "<div class='store-info-content'>";
                content += "<ul class='info-content-list'>";
                if (lgFilter.locale == "/in") {
                	/* LGEIN-1708 20171215 modify */
                	if (data['wtbName'] != "") {
                        content += "<li><p><strong class='store-name'>" + wtbMsg.name + ":</strong>" + data['wtbName'] + "</p></li>";
                	}
                	if (data['address'] != "") {
                        content += "<li><p><strong class='store-address'>" + wtbMsg.address + ":</strong>" + data['address'] + "</p></li>";
                	}
                	if (data['wtbCeo'] != "") {
                        content += "<li><p><strong class='person'>" + wtbMsg.ceo + ":</strong>" + data['wtbCeo'] + "</p></li>";
                	}
                	if (data['weeklyOffName'] != "") {
                		content += "<li><p><strong class='weekly'>" + wtbMsg.weeklyOffName + ":</strong>" + data['weeklyOffName'] + "</p></li>";
                	}
                	if (data['wtbTime'] != "") {
                		content += "<li><p><strong class='timing'>" + wtbMsg.time + ":</strong>" + data['wtbTime'] + "</p></li>";
                	}
                	if (data['wtbPhoneNo'] != "") {
                        content += "<li><p><strong class='contact-number'>" + wtbMsg.contactNumber + ":</strong>" + data['wtbPhoneNo'] + "</p></li>";		
                	}
                	if (data['ProductCode'] != "") {
                        content += "<li><p><strong class='available'>" + wtbMsg.products + ":</strong>" + data['ProductCode'] + "</p></li>";
                	}
                	/*//LGEIN-1708 20171215 modify */
                } else {
                    content += "<li><p><strong class='store-name'>" + wtbMsg.name + ":</strong>" + data['wtbName'] + "</p></li>";
                    content += "<li><p><strong class='store-address'>" + wtbMsg.address + ":</strong>" + data['address'] + "</p></li>";
                    content += "<li><p><strong class='person'>" + wtbMsg.ceo + ":</strong>" + data['wtbCeo'] + "</p></li>";
                    content += "<li><p><strong class='timing'>" + wtbMsg.time + ":</strong>" + data['wtbTime'] + "</p></li>";
                    content += "<li><p><strong class='contact-number'>" + wtbMsg.contactNumber + ":</strong>" + data['wtbPhoneNo'] + "</p></li>";
                    content += "<li><p><strong class='available'>" + wtbMsg.products + ":</strong>" + data['ProductCode'] + "</p></li>";
                }
                content += "</ul>";
                content += "<button type='button' class='btn-close-info'><span class='hide'>" + wtbMsg.close + "</span><i class='icon icon-pagenav-up-light'></i></button>";
                content += "</div></li>";
            }
            /*//LGEAE-1653 modify : 20190107*/
            return content;
        }
        proto._eventControl = function() {
            var self = this;

            // search by cateogry - input box focus event
            
            self.$storeMapSearch.find(".search-input").on("focusin", function() {
                if (!self.mapExpand) self._mapExpand();
                $(this).parent('.input-box').addClass('active');
            }).on("focusout", function(){
                $(this).parent('.input-box').removeClass('active');
            });

            self.$storeMapSearch.on("click", '.chosen-single', function(e){
                e.preventDefault();
                if (!self.mapExpand) self._mapExpand();
            });

            // store list item click
            self.$resultList.on("click", "li[data-item]", function() {
                var number  = $(this).data("item");
                self._onItem(number);
                self.$storeListWrap.find("li[data-item]").removeClass("active").filter("[data-item="+number+"]").addClass("active");
                if(!self.mapExpand) self._mapExpand();
            });

            // direction button click
            self.$storeMapWrap.on("click", ".direction_button", function(e){
                e.preventDefault();
                var $this = $(this);
                var itemNum = $this.data("item");
                self._tabMove(1, itemNum);
            });

            // location, direction, store info tab move
            $(".result-tab").find(">li>a").on("click", function(e){
                e.preventDefault();
                var $this = $(this);
                var tabNum = $this.parent().index();
                self._tabMove(tabNum);
            });

            // my position search
            self.$mySearch.on("click", $.proxy(self._mySearch, self));

            // near by toggle click
            $(".near-button").on("click", function(){
                var $this = $(this);
                var $select = self.$searchForm.find(".select");
                var $state = $select.filter("[name='state']");
                var $city = $select.filter("[name='city']");
                var $location = $select.filter("[name='location']")

                self.nearBy = self.nearBy ? false : true;

                if(self.nearBy){

                    if(globalConfig.isMobile) {
                        $this.addClass("active");
                        $state.data("default", $state.val());
                        $city.data("default", $city.val());
                        $location.data("default", $location.val());
                        $select.prop("disabled",true);
                    }

                    $select.find("option").prop("selected",false);
                    $select.find("option:first-child").prop("selected", true);

                    if(!globalConfig.isMobile){
                        $select.trigger('chosen:updated');
                        self._mySearch();
                    }
                }else if(!self.nearBy && globalConfig.isMobile){
                    $this.removeClass("active");

                    $.each($select, function(idx){
                        var $this = $(this);

                        if(idx == 0){
                            $this.prop("disabled", false);
                            if( $this.data("default") && ($this.data("placeholder") != $this.data("default")) && ($this.data("default") != 'null') ){
                                $state.find("option[value='" + $state.data("default") + "']").prop("selected",true);
                                $this.trigger("change");
                            }
                        } else if($this.data("default") && ($this.data("placeholder") != $this.data("default"))){
                            $this.prop("disabled", false);
                        }
                    });
                }
            });

            // search submit
            self.$searchForm.on("submit", function(e) {
                e.preventDefault();
                if(!self.nearBy){
                    self._search();
                }else{
                    self._mySearch();
                }
                /*LGEAR-900*/
                if(lgFilter.locale == "/ar") {
                    dataLayer.push({'event':'busquedaLocal','locacion': self.$searchInput.val()});
                }
                /*//LGEAR-900*/
            });
            self.$searchForm.find(".select[name='country'],.select[name='stepCity']").on("change", function() {
            	if($(this).attr('name')=='country'){
            		self.options.country = $(this).val();
            	}
                /* LGEJO-400 : 20160805 modify */   
            
                if(lgFilter.locale == "/levant_en" && self.$searchForm.find(".wtb-country").length){
                	$(this).parents("#storeMapWrap").attr("data-country", self.options.country);
                	self._setCountry(self.options.country);
                } else {
                	if(!($(this).attr('name')=='stepCity' && $(this).val()=='Others') ){
                		self._search(self.options.country);
                	}
                }
                /*//LGEJO-400 : 20160805 modify */
            });
            $(".search-step").find(">li .select").on("change", function() {

                var $parent = $(this).parents("li[class*='step']");
                var $temp;

                if (globalConfig.isMobile) {
                    $parent.next().find(".select").removeAttr("disabled");
                }
                /*LGEEG-287 20170426 add*/
                if(self.$searchForm.find(".select[name='stepCity']").length){
                	self.$searchInput.parents("li[class*=step]").removeClass("open-tooltip")
                	self.$searchInput.val("")
                }
                /*LGEEG-287 20170426 add*/
                /* LGEJO-400 : 20160805 modify */
                if ($parent.nextAll("li[class*='step']").length > 0) {
                	$temp = $parent.next("li[class*='step']");
                    var stepLength = $parent.nextAll("li[class*='step']").length; 
                	if ($temp.find(".store-map-search.select-search").length) {
                        $temp.find(".select").removeAttr("disabled").trigger('chosen:updated');
                        if(stepLength == 1){
                        	self._search(self.options.country);
                        }
                    } else {
                        $temp.find(".input-box").removeClass("disabled");
                        $temp.find(".input-box input").removeAttr("disabled");
                    }

                }
                /*//LGEJO-400 : 20160805 modify */
            });

            // map infobox click, touch controll
            self.$whereToBuy.on("mouseenter touchmove", ".infoWindow", $.proxy(self._controllable, self)).on("mouseleave touchend", ".infoWindow", $.proxy(self._controllable, self));

            // map infobox close button click controll
            google.maps.event.addListener(self.infoBox, "closeclick", function() {
                self._controllable();
            });

            // map drag search controll
            google.maps.event.addListener(self.map, "dragend", function() {
                if (globalConfig.isMobile) {return;}
                self.center = self.map.getCenter();

                if (!self.openDirection && !self.infoBox.getVisible()) {
                    if (!self.mapExpand) {
                        self._mapExpand();
                    }
                    if(self.dragSearch){
                        self._queryData();
                    }
                }
            });

            // map zoom search controll
            self.zoomEvent = google.maps.event.addListener(self.map, "zoom_changed", function() {
                if (globalConfig.isMobile) {return;}

                if (self.zoomHandle && !self.openDirection && !self.infoBox.getVisible()) {    
                    if (!self.mapExpand) {
                        self._mapExpand();
                    }

                    if (self.map.getZoom() < self.options.queryZoomLevel) {
                        self.dragSearch = false;
                    } else if (!self.dragSearch && self.zoomSearch && self.map.getZoom() >= self.options.queryZoomLevel) {
                        self.dragSearch = true;
                        self._queryData();
                    }
                }
            });

            // direction input box delete click
            $(".direction-input-box").find(".delete").on("click", $.proxy(function(e) {
                self._clearDirection();
                self._onItem(self.activeItem);
                for (var i = 0; i < self.markers.length; i++) {
                    if (self.markers[i].getVisible()) {
                        self.markers[i].setVisible(false);
                    }
                }
                self.markers[self.activeItem].setVisible(true);
                self.openDirection = true;
            }, self));

            // map expand, unexpand
            self.$mapExpand.find(">a").on("click", function(e){
                e.preventDefault();
                self._mapExpand();
            });

            // result list open, close
            self.$listOpen.on("click", function(e){
                e.preventDefault();
                self._resultOpen();
            });
            
            // store sort (all, brand)
            $(".store-brand").find(">a").on("click", function(e) {
                e.preventDefault();
                if ($(this).hasClass('active')) {return;}

                self.page = 1;
                self.brand = !self.brand;
                $(this).addClass("active").siblings("a").removeClass("active");
                self._queryData();
            });

            // pagingnation move
            self.$resultList.find(".pagination").on("click", "ol>li>a", function(e) {
                e.preventDefault();
                var $curPage = $(this);
                self.page = parseInt($curPage.data("page"));
                self._pageMove();
            }).on("click", ".prev", function(e) {
                e.preventDefault();
                self.page -= 1;
                self._pageMove();
            }).on("click", ".next", function(e) {
                e.preventDefault();
                self.page += 1;
                self._pageMove();
            })

            //mobile
            // mobile store list load more
            self.$storeListWrap.find(".btn-load-more").on("click", function(e) {
                e.preventDefault();
                ++self.page;
                self._pageMove();
            });

            // mobile map open, close, resize
            self.$storeListWrap.on("click", ".gray-map-open", function(e) {
                e.preventDefault();
                var $this = $(this);
                var number = $this.parents("li[data-item]").data("item");
                self._openMap(number);
            });
            
            // mobile see store info 
            self.$storeListWrap.on("click", ".btn-store-toggle", function(e) {
                e.preventDefault();
                var infoButton = $(e.target);
                var parents = infoButton.parents("li[data-item]");
                var parent = infoButton.parents(".store-content").next();

                if (parent.is(":animated")) {
                    return;
                }

                if (infoButton.find(">i[class*='-down']").hasClass("hide")) {
                    infoButton.find(">i[class*='-down']").removeClass("hide");
                    infoButton.find(">i[class*='-up']").addClass("hide");
                    parents.removeClass("active");
                    parent.stop().slideUp("fast");
                } else {
                    infoButton.find(">i[class*='-down']").addClass("hide");
                    infoButton.find(">i[class*='-up']").removeClass("hide");
                    parents.addClass("active");
                    parent.stop().slideDown("fast");
                }
            }).on("click", ".btn-close-info", function(e) {
                var infoCloseButton = $(e.target);
                var parents = infoCloseButton.parents("li[data-item]");
                var parent = infoCloseButton.parents(".store-info-content");
                parent.prev().find("i[class*='-down']").removeClass("hide");
                parent.prev().find("i[class*='-up']").addClass("hide");
                parents.removeClass("active");
                parent.stop().slideUp("fast");
            });
        }
        proto._openMap = function(number) {
            var self = this;
            var windowHeight = $(window).height();
            var activeItem = self.stores[number];
            var mapTitle = activeItem['wtbName'];
            var $modalWrap = $(".where-to-buy").find(".modal-wrap");

            $modalWrap.find(".map-title").html(mapTitle);
            $modalWrap.css({
                "display": "block",
                "height": windowHeight
            });

            var mapHeight = 39 + $(".map-title").height();

            $modalWrap.find(".store-map-view").css({
                "height": "calc(100% - " + mapHeight + "px)"
            })
            $("body").css({
                "height": windowHeight,
                "overflow": "hidden"
            });

            for (var i = 0; i < self.markers.length; i++) {
                if (self.markers[i].getVisible) {
                    self.markers[i].setVisible(false);
                }
                self.markers[number].setVisible(true);
            }

            google.maps.event.trigger(self.map, "resize");

            if (self.map.getZoom() < self.options.queryZoomLevel) {
                self.map.setZoom(self.options.queryZoomLevel);
            }

            self._onItem(number);

            $(window).resize(function() {
                var windowHeight = $(window).height();
                var mapHeight = 39 + $(".map-title").height();

                $modalWrap.css({
                    "height": windowHeight
                });
                $modalWrap.find(".store-map-view").css({
                    "height": "calc(100% - " + mapHeight + "px)"
                })

                google.maps.event.trigger(self.map, "resize");
            });

            $modalWrap.find(".btn-close").on("click", function(e) {
                e.preventDefault();
                $modalWrap.css("display", "none");
                $("body").css({
                    "height": "auto",
                    "overflow": "visible"
                });
            });  
        }
        proto._selectCategory = function() {
            var self = this;
	    /* LGEEG-287 20170328 modify*/
            var $searchTag = self.$searchForm.find("input.search-input:not(.nonValid), select.select");
	    /* //LGEEG-287 20170328 modify*/
            var index = $searchTag.length;

/*
$select.find("option").prop("selected",false);
$select.find("option:first-child").prop("selected", true);*/

            function validataCheck($el) {
                if (!$el.val() || $el.val() == $el.attr("placeholder") || $el.val() == "") { return false;} 
                else { return true; }
            }
            function tooltipCheck($el, event) {
                var tgName = $el[0].tagName;
                var $elParent = $el.parents("li[class*=step]").length > 0 ? $el.parents("li[class*=step]") : $el.parents(".store-map-search");
                var changeCheck = validataCheck($el);

                if(tgName == "INPUT"){
                    switch(event.type){
                        case "focusin":
                            if( !$elParent.hasClass("open-tooltip") && !validataCheck($el) ){
                                $elParent.addClass("open-tooltip");
                            }
                            break;
                        case "focusout":
                                $elParent.removeClass("open-tooltip");
                            break;
                    }
                } else if(tgName == "SELECT"){
                    switch(event.type){
                        case "focusin":
                            if( !validataCheck($el) ){
                                $elParent.addClass("open-tooltip");
                            }
                            break;
                        case "focusout":
                            if(!validataCheck($el)){
                                $elParent.removeClass("open-tooltip");
                            }
                            break;
                        case "change":
                            $elParent.removeClass("open-tooltip");
                            break;
                    }
                }
            }

            $searchTag.each(function(idx){
                var $this = $(this);
                var tagName = $this[0].tagName;

                if(typeof(tagName) == "string"){
                    self.check = validataCheck($this);

                    if(!self.check){
                        if(index > 1){
                            $this.parents("li[class*=step]").addClass("open-tooltip");
                        } else if(index == 1){
                        	/* LGEEG-287 20170425 modify*/
                        	if($this.attr("name")=="stepCity"){
                        		$this.parents("li[class*=step]").addClass("open-tooltip");
                        	}
                        	/* LGEEG-287 20170425 modify*/
                            $this.parents(".store-map-search").addClass("open-tooltip");
                        }

                        if(tagName == "INPUT"){
                            $this.focus();
                        }else if(tagName == "SELECT"){
                            $this.parent().find("input").focus();
                        }
                        return false;
                    }
                }           
            });

            $searchTag.filter("input").on("focusin focusout", function(event){
                var $this = $(this); 
                tooltipCheck($this, event);
            });
            
            $searchTag.filter("select").on("change focusin focusout", function(event){
                var $this = $(this);
                tooltipCheck($this, event);
            });

            self.$searchForm.find(".chosen-drop input").on("focusin focusout", function(event){
                var $this = $(this).parents(".chosen-container").siblings("select");
                tooltipCheck($this, event);
            });
        }
        proto._onItem = function(item) {
            var self = this;

            $("li", ".result-position").removeClass("active").filter("li[data-item='" + item + "']").addClass("active");
            if (typeof(self.infoBox) != "undefined") {
                if (typeof(item) == "undefined") {
                    self.infoBox.close();
                    self.activeItem = null;
                } else if (self.activeItem != item) {
                    self.infoBox.close();
                    self.activeItem = item;
                    self.offsetCenter(self.markers[item].getPosition(), 0, -170, self.map);
                    self.setStoreInfo(self.stores, self.infoBox, item);
                    self.infoBox.open(self.map, self.markers[item]);
                } else if (self.activeItem == item && !self.infoBox.getVisible()) {
                    self.infoBox.setContent(null);
                    self.offsetCenter(self.markers[item].getPosition(), 0, -170, self.map);
                    self.setStoreInfo(self.stores, self.infoBox, item);
                    self.infoBox.open(self.map, self.markers[item]);
                } else if (self.activeItem == item && self.infoBox.getVisible()) {
                    self.offsetCenter(self.markers[item].getPosition(), 0, -170, self.map);
                }
            }
        }
        proto._addMarkers = function(latlng, icon, itemNum) {
            var self = this;
            var markerOption = {
                map: self.map,
                icon: icon,
                draggable: false,
                position: latlng,
                zIndex: 1
            };

            var marker = new google.maps.Marker(markerOption);

            self.markers.push(marker);
            marker.setVisible(true);

            google.maps.event.addListener(marker, "click", function(e) {
                self._onItem(itemNum);
                self._setShopInfo();
                self._focusList(itemNum);
            });
            google.maps.event.addListener(marker, "mouseover", function(e) {
                this.setOptions({
                    zIndex: 9
                });
            });
        }
        proto._setDirection = function(item) {
            var self = this;
            var startInput = document.getElementById("startInput");
            var content = "";

            self.$directionContent.find(".search-none").remove();
            self.$routeList.html(null);
            self.$destinationStore.html(null);

            if (self.openDirection) {
                var data = self.stores[item];

                for (var i = 0; i < self.markers.length; i++) {
                    if (self.markers[i].getVisible()) {
                        self.markers[i].setVisible(false);
                    }
                }

                self.markers[item].setVisible(true);

                $(".direction-input-box").css("display", "block");
                $(".direction-route").last().scrollbar();
                content += "<li data-item='" + item + "'>";
                content += "<div class='store-number'><span>" + (parseInt(item) + 1) + "</span></div>";
                content += "<dl><dt class='store-name'>" + data['wtbName'] + "</dt>";
                content += "<dd class='store-address'>" + data['address'] + "</dd>";
                content += "</dl></li>";
                self.$destinationStore.append(content);

                self.directionAutocomplete = new google.maps.places.Autocomplete(startInput, self.autoCompleteOption);

                google.maps.event.addListener(self.directionAutocomplete, 'place_changed', $.proxy(function(e) {
                    var routeList = document.getElementById("directionRoute");
                    var unit = self.options.unitMetric ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL;
                    var origin = self.directionAutocomplete.getPlace();
                    var destination = self.markers[self.activeItem].getPosition();

                    if(typeof(origin) == "undefined"){
                        return;
                    }
                    var directionRoute = {
                        origin: origin.geometry.location,
                        destination: destination,
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: unit
                    };
                    if (self.directionsDisplay) {
                        self.directionsDisplay.setMap(self.map);
                        self.directionsDisplay.setPanel(routeList);
                    }

                    self.directionService.route(directionRoute, function(response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            self.directionsDisplay.setDirections(response);
                            for (var i = 0; i < self.markers.length; i++) {
                                if (self.markers[i].getVisible())
                                    self.markers[i].setVisible(false);
                            }
                            var height = $(".result-directions").outerHeight(true) - $(".direction-input-box").outerHeight(true) - $(".destination-store").outerHeight(true);
                            $(".direction-route").css("height",height);
                            self.infoBox.close();
                        } else {
                            self.directionsDisplay.setMap(null);
                            self.directionsDisplay.setPanel(null);
                        }
                    });
                }, self));
            } else {
                content += "<p class='search-none'>" + wtbMsg.noArrival + "</p>";
                $(".direction-input-box").css("display", "none");
                self.$routeList.append(content);
            }
        }
        proto._setShopInfo = function() {
            var self = this,
                content,
                store;

            if (self.activeItem != null) {
                data = self.stores[self.activeItem];
                content = "<div class='store-info-content'>";
                content += "<ul class='info-content-list'>";
                if (lgFilter.locale == "/in") {
                	/* LGEIN-1708 20171215 modify */
                    if(data['wtbName'] != ""){
                        content += "<li><p><strong class='store-name'>" + wtbMsg.name + ":</strong>" + data['wtbName'] + "</p></li>";
                    }
                    if(data['address'] != ""){
                        content += "<li><p><strong class='store-address'>" + wtbMsg.address + ":</strong>" + data['address'] + "</p></li>";
                    }
                    if(data['wtbCeo'] != ""){
                        content += "<li><p><strong class='person'>" + wtbMsg.ceo + ":</strong>" + data['wtbCeo'] + "</p></li>";
                    }
                    if(data['weeklyOffName'] != ""){
                        content += "<li><p><strong class='weekly'>" + wtbMsg.weeklyOffName + ":</strong>" + data['weeklyOffName'] + "</p></li>";
                    }
                    if(data['wtbTime'] != ""){
                        content += "<li><p><strong class='timing'>" + wtbMsg.time + ":</strong>" + data['wtbTime'] + "</p></li>";
                    }
                    if(data['wtbPhoneNo'] != ""){
                        content += "<li><p><strong class='contact-number'>" + wtbMsg.contactNumber + ":</strong>" + data['wtbPhoneNo'] + "</p></li>";
                    }
                    if(data['ProductCode'] != ""){
                        content += "<li><p><strong class='available'>" + wtbMsg.products + ":</strong>" + data['ProductCode'] + "</p></li>";
                	}
                    /*//LGEIN-1708 20171215 modify */
                } else {
                    content += "<li><p><strong class='store-name'>" + wtbMsg.name + ":</strong>" + data['wtbName'] + "</p></li>";
                    content += "<li><p><strong class='store-address'>" + wtbMsg.address + ":</strong>" + data['address'] + "</p></li>";
                    content += "<li><p><strong class='person'>" + wtbMsg.ceo + ":</strong>" + data['wtbCeo'] + "</p></li>";
                    content += "<li><p><strong class='timing'>" + wtbMsg.time + ":</strong>" + data['wtbTime'] + "</p></li>";
                    content += "<li><p><strong class='contact-number'>" + wtbMsg.contactNumber + ":</strong>" + data['wtbPhoneNo'] + "</p></li>";
                    content += "<li><p><strong class='available'>" + wtbMsg.products + ":</strong>" + data['ProductCode'] + "</p></li>";
                }
                content += "</ul></div>";
            } else {
                content = "<p class='search-none'>" + wtbMsg.noShopInfo + "</p>";
            }
            $(".result-info").html(content);
        }
        proto._tabMove = function(tabNum, itemNum) {
            var self = this;

            if (typeof(tabNum) != "undefined"){
                if(typeof(itemNum) != "undefined"){
                    if(!self.mapExpand){self._mapExpand();}
                    if(!self.listOpen){self._resultOpen();}
                    self.openDirection = true;
                    self._setDirection(itemNum);
                } else {
                    switch(tabNum){
                        case 0:
                            if (self.openDirection) {
                                self._clearDirection();
                                self._onItem(self.activeItem);
                            }
                            break;
                        case 1:
                            if (!self.openDirection){self._setDirection();}
                            break;
                        case 2:
                            self._setShopInfo();
                            break;
                    }
                }
            } else {
                tabNum = 0;
            }

            $(".result-tab").find(">li").removeClass("active");
            $(".result-tab").find(">li").eq(tabNum).addClass("active");
            $(".result-content").removeClass("active");
            $(".result-content").eq(tabNum).addClass("active");
        }
        proto._focusList = function(itemNum) {
            if (globalConfig.isMobile) return;
            $(".store-list-wrap").stop().delay(150).animate({
                scrollTop: ($("li[data-item='" + itemNum + "']", ".store-list").offset().top - $(".store-list").offset().top + 1)
            }, 300);
        }
        proto._controllable = function(event) {
            var self = this;
            var controll = typeof(event) != "undefined" ? (event.type == "mouseenter" || event.type == "touchmove" ? false : true) : true;
            self.map.setOptions({
                draggable: controll,
                scrollwheel: controll,
                disableDoubleClickZoom: (controll ? false : true)
            });
        }
        proto._mapExpand = function() {
            if(globalConfig.isMobile){return;}
            var self = this;
            var $storeMapContainer = self.$storeMapBox.find(".store-map-container");

            if (!self.mapExpand) {
                $storeMapContainer.stop().animate({
                    "width": "200%"
                }, {
                    duration: 350,
                    step: function() {
                        self.$storeMapWrap.addClass("expand");
                        google.maps.event.trigger(self.map, "resize");
                    },
                    complete: function() {
                        $(".buy-online").addClass("disabled");
                        self.mapExpand = true;
                        self.map.panTo(self.center);
                    }
                });
            } else {
                $storeMapContainer.stop().animate({
                    "width": "100%"
                }, {
                    duration: 350,
                    step: function() {
                        $(".buy-online").removeClass("disabled");
                        self.$storeMapWrap.removeClass("expand");
                        google.maps.event.trigger(self.map, "resize");
                    },
                    complete: function() {
                        self.mapExpand = false;
                        self.map.panTo(self.center);
                    }
                });
            }
        }
        proto._resultOpen = function() {
            if(globalConfig.isMobile){return;}
            var self = this;
            var $storeMapContainer = self.$storeMapBox.find(".store-map-container");

            if (!self.listOpen) {
                $storeMapContainer.animate({
                    "padding-right": "320px"
                }, {
                    step: function() {
                        google.maps.event.trigger(self.map, "resize");
                        self.$resultList.css({
                            "width": "320px"
                        })
                        self.$listOpen.css("right", "-1px").find("i").removeClass("icon-triangle").addClass("icon-triangle-reverse");
                    },
                    complete: function() {
                        self.listOpen = true;
                        self.$resultList.addClass("open");
                        self.map.panTo(self.center);
                    }
                }, 350);
            } else {
                $storeMapContainer.stop().animate({
                    "padding-right": "0px"
                }, {
                    duration: 350,
                    step: function() {
                        google.maps.event.trigger(self.map, "resize");
                        self.$resultList.removeClass("open");
                        self.$listOpen.css("right", "0px").find("i").addClass("icon-triangle").removeClass("icon-triangle-reverse");
                    },
                    complete: function() {
                        self.listOpen = false;
                        self.$resultList.css({
                            "width": "0px"
                        })
                        self.map.panTo(self.center);
                    }
                }, 350);
            }
        }
        proto._reset = function() {
            var self = this;
            self._clearMarkers();
            self._onItem();
            self.stores = [];
            self.page = 1;

            if (typeof(self.infoBox) != "undefined") self.infoBox.close();
            self.infoBox.setContent(null);
            self.directionsDisplay.setMap(null);
            self.directionsDisplay.setPanel(null);
            self.$startInput.val("");
            self.$routeList.html(null);
            self.$destinationStore.html(null);
            self.directionsDisplay.directions = null;
            self.openDirection = false;
            
            self.$storeListWrap.find(".store-list").remove();
            self.$storeListWrap.find(".search-none").remove();        
            self.$resultList.find(".pagination > ol").html(null);
            self.$resultPosition.removeClass("con-over");
            self._tabMove();

            if (globalConfig.isMobile) $(".btn-load-more").css("display", "none");
        }
        proto._clearMarkers = function() {
            var self = this;
            for (var i = 0; i < self.markers.length; i++) {
                self.markers[i].setVisible(false);
                self.markers[i].setMap(null);
            }
            self.markers = [];
        }
        proto._clearDirection = function() {
            if (globalConfig.isMobile){return;}
            var self = this;

            for (var i = (self.page - 1) * 10; i < self.page * 10; i++) {
                if (self.stores.length == i) {
                    break;
                }
                if (!self.markers[i].getVisible()) {
                    self.markers[i].setVisible(true);
                }
            }
            if (typeof(self.directionsDisplay) != "undefined") {
                self.directionsDisplay.setMap(null);
                self.directionsDisplay.setPanel(null);
                self.directionsDisplay.directions = null;
                self.$startInput.val("");
                google.maps.event.trigger(self.map, "resize");

                if (self.map.getZoom() < self.options.queryZoomLevel && self.openDirection) {
                    self.map.setZoom(self.options.queryZoomLevel);
                }
                self.openDirection = false;
            }
        }

        //"gmap" is an instance of the google map
        ic.jquery.plugin('GoogleMaps', GoogleMaps, '.store-map-wrap');

        return GoogleMaps;
    }
})
