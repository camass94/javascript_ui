define(['global-config', 'ic/ic', 'ic/ui/module', 'cs/infobox', 'slick-carousel', 'jqueryui','mkt/touch-punch'], function(globalConfig, ic, Module, InfoBox, Slick, jqueryui) { //LGEBR-3558 : 20180122 modify	
	var proto,
        events = ic.events;

    var GoogleMaps = function(el, options) {
        var self = this;
        // Call the parent constructor
        GoogleMaps.superclass.constructor.call(self, el, options);
        self.$repairCenter = $(".repair-service-center");
        self.$repairSection = self.$('.repair-map-information');
        self.$repairTitle = self.$('.repair-informaiton-title a');
        self.$repairDetail = self.$('.repair-informaiton-detail');
        self.$repairStoreList = self.$("#repairCenterResult");
        self.$repairTabmenu = self.$('.map-store-distance');
        self.$searchInput = self.$('#serviceCenterZip');
        self.$productSelect = self.$('#repairProduct');
        self.$searchBtn = self.$('#serviceCenterSubmit');
        self.$repairForm = self.$('#repairForm');
        self.$resultLocation = self.$('.repair-map-location');
        self.$directionsForm = self.$('#directionForm');
        self.$repairMapArea = self.$('#repairMap');
        self.$expandaleMap = self.$('.map-expend');
        self.$countryCombo = self.$('#countryList');
        
        /* LGEAE-1297 20170530 add */
        self.$accessCountry = self.$('input[name=accessCountry]');
        /* // LGEAE-1297 20170530 add */
        
        // if ($(".map-store-distance").length > 0) self._basic();
        // else self._init();
        /* LGEBR-3558 : 20180122 add */
        self.$mySearch = self.$('.my-location-button'); 
        self.$distanceRange = self.$('.distance-range');
        /* //LGEBR-3558 : 20180122 add */
        self._basic();
    };

    // Inherit from Module
    ic.util.inherits(GoogleMaps, Module);

    // Alias the prototype for less typing and better minification
    proto = GoogleMaps.prototype;
    /* LGEBR-3308 20171102 add */
    proto._defaults = {
        country: null,
        zoomLevel: 5,
        zoomLevelMin: 2,
        zoomLevelMax: 24,
        viewport: null,
        countryRestriction: true,
        queryZoomLevel: 10,
        queryUrl: '/uk/support/_response/repair-data.json',
        queryType: "json",
        unitMetric: false,
        useDirection: false,
        centerLatitude: null,
        centerLongitude: null,
        useController: false,
        debug: false,
        unit: 'Mile', // metric(Km), imperial(Mile)
        distance: 25,
        distance_opt: "5,10,25,50",
        unitMetric: false,
        travelMode: google.maps.TravelMode.DRIVING
    };
    /* //LGEBR-3308 20171102 add */

    proto._basic = function() {
        var self = this;
        /* LGEGMO-1679 */
        var $repairCountry = $("#repairCenter").data("country").split("_")[0] || $("html").data("countrycode").split("_")[0];
        self.options.country = $repairCountry.length == 2 ? $repairCountry : self.$countryCombo.find(":selected").val();
        /* LGEGMO-1679 */
        
        if(self.options.country=="fr" && self.$directionsForm.length && self.$repairCenter.attr("data-center-map") == "Y" ){
            $(".repair-map-section").hide();
           return false;
        }
        
        self.options.unit = self.$repairForm.children("[name=distanceType]").val() == "mi" ? "Mile" : "Km";
        if (self.options.unit == "Km") self.options.unitMetric = true;
        if ($(".map-store-distance").length > 0) {
        	self.options.distance = self.$repairForm.children("[name=distance_init]").val();
        }
        self._init();
    }

    proto._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self);
        self.geoResult = {};
        self.markers = [];
        self.activeItem;
        self.searchHandle = false;
        self.openDirection = false;
        self.distance = self.options.distance;
        self.afterControl = false;
        self.openDirection = self.options.useDirection;
        self.noDataTxt = "";
        
        /* LGEGMO-1679 */
        if(self.options.country == "string" ){
            switch(self.options.country.toLowerCase()){
                case "br" :
                    self.noDataTxt = "Não há dados. Por favor, tente novamente para inserir o código postal";
                    break;
                case "es" :
                    self.noDataTxt = "No hay SAT cercanos. Introduce otra dirección o aumenta la distancia para buscar.";
                    break;
                case "gr" :
                    self.noDataTxt = "Δεν βρέθηκαν δεδομένα. Παρακαλούμε δοκιμάστε να εισάγετε έναν άλλο Τ.Κ. ή διεύθυνση.";
                case "it" :
                    self.noDataTxt = "Nessun dato. Riprova inserendo il CAP.";
                    break;
                default :
                    self.noDataTxt = "There is no data. Please retry to enter zip code";
                    break;
            }
        }
        /* LGEGMO-1679 */
        /* LGEBR-3046, LGEBR-2903, LGEBR-3558 : 20180122 modify */
        if (lgFilter.locale =="/br") {        	
        	if($(".slide-bar").find(".ui-slider-handle").length == 0) {
        		$(".slide-bar").hide();
        		self.$distanceRange.css('border-bottom',"1px solid ##e5e5e5");
        	}        	
        	// $("[name=searchSuperCategoryId]").prop("required",false).removeAttr("required"); LGEBR-3793
        	/* LGEBR-3762 20180827 modify */	
        	// if (!globalConfig.isMobile) {
        		self.$searchBtn.hide();
        		if(self.$distanceRange.length){
        			$(".repair-service-center").addClass("expand-map-search");
        		}
        		if(!globalConfig.isMobile && ($("html").hasClass("tablet") || ($(window).width() > 767, $(window).width() <= 1280))){
            		$(".repair-map-section").addClass("tablet-mode-map");
            		$(".tablet-mode-map").find(".map-expend").removeClass("hidden");
            	}
            // }
	       /* LGEBR-3762 20180827 modify */	
        }
        /* //LGEBR-3046, LGEBR-2903, LGEBR-3558 : 20180122 modify */
        self.timing = {
            queryTimeout: null
        };

        self.markerIcon = {
            size: new google.maps.Size(34, 46),
            anchor: new google.maps.Point(17, 46)
        }
        self.mapSetting();
        self.$repairDetail.stop().hide();
        self.$repairTitle.find("span").removeClass("on");
        
        self.$repairTabmenu.on('click', "li a", function() {
            $.proxy(self.distanceHandler, self);
        });
        
        if(self.$countryCombo.length){
            self.$countryCombo.change($.proxy(proto.comboEvent, self));
        }        
    }
    
    proto.comboEvent = function(e) {
        /* LGEGMO-1741 */
        var self = this;
        var $selected = $(e.target).find(":selected");
        var code = $selected.val() || $selected.text();
        /* LGEHK-847 : 20160629 modify */
        if(lgFilter.locale =="/hk" || lgFilter.locale =="/hk_en"){
        	$("#serviceCenterZip").val($selected.text());
        }
        /* LGEGMO-3154 20170426 modify */
		/* LGEEG-287 20170405 modify */
        if($(e.target).attr("name")=="stepCity"){
        	if($selected.val()==""||$selected.val()==null){
        		code=$("#repairCenter").data("country").split("_")[0]
        	}else if(code=="Others"){
        			self.$searchInput.prop("required",true).attr("required","required");
        		return;
        	}
        	self.$searchInput.prop("required",false).removeAttr("required");
        	var slocation = {
    	            "address" : code,
    	            "region" : $("#repairCenter").data("country").split("_")[0]
    	        }
        	code =$("#repairCenter").data("country").split("_")[0];
        }else{
	        var slocation = {
	        		 "address" : $selected.text(),	
	                 "region":code
	        }
        }
	   /* LGEEG-287 20170405 modify */
        /* LGEGMO-3154 20170426 modify */
        
        if(!(lgFilter.locale =="/hk" || lgFilter.locale =="/hk_en")){
        	self.keyword.value = "";
        }
        /* //LGEHK-847 : 20160629 modify */
        self.options.country = code;
        self.autoComplete.setComponentRestrictions({
            country: code
        });
        
        self.geocoder.geocode(slocation, $.proxy(function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                self.geoResult.locations = results[results.length-1].geometry.location;
                self.geoResult.viewport = results[results.length-1].geometry.viewport;
                self.map.fitBounds(self.geoResult.viewport);
                self.center = self.map.getCenter();
            }
        }, this));
        
        self.reset();
        self.$repairDetail.stop().hide();
        self.afterControl = false;
        self.$repairForm.trigger("countryChange");
        /* LGEGMO-1741 */
     }
        
    proto.mapSetting = function() {
        var self = this;
        self.mapDiv = document.getElementById("repairMap");
        self.keyword = document.getElementById("serviceCenterZip");
        self.locaitonKey = document.getElementById("repairOrigin");
        
        self.mapOptions = {
            zoom: self.options.zoomLevel,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: self.options.useController,
            
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            },
            panControl: self.options.useController,
            panControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            zoomControl: self.options.useController,

            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            scaleControl: self.options.useController,
            scaleControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            streetViewControl: self.options.useController,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            minZoom: self.options.zoomLevelMin,
            maxZoom: self.options.zoomLevelMax
        }
               
        self.infoOptions = {
            disableAutoPan: true,
            alignBottom: true,
            pixelOffset: new google.maps.Size(-162, -54),
            zIndex: 99,
            boxStyle: {
                width: "320px"
            },
            infoBoxClearance: new google.maps.Size(1, 1),
            enableEventPropagation: true,
            boxClass: "infoWindow"
        };

        self.map = new google.maps.Map(self.mapDiv, self.mapOptions);
        self.infoBox = new InfoBox(self.infoOptions);
        self.directionService = new google.maps.DirectionsService();
        self.directionsDisplay = new google.maps.DirectionsRenderer();
        self.mapControl();

        self.center = self.map.getCenter();

        if (!self.openDirection) {

            self.setCountry(self.options.country);
            self.autoZipcode(self.keyword);
        } else {
            // self.options.centerLatitude = $("[name=ascLatitudeValue]").val();
            // self.options.centerLongitude =
			// $("[name=ascLongitudeValue]").val();

            var pos = new google.maps.LatLng(self.options.centerLatitude, self.options.centerLongitude);
            self.setCountry(pos);
            self.map.setZoom(13);
            self.addMarkers(pos);
            
            self.autoZipcode(self.locaitonKey);
            /* LGEBR-3177 20161215 modify */
            if(lgFilter.locale=="/br" && ($("#repairOrigin").val()!==""||$("#repairOrigin").val()!==null)){
            	setTimeout($.proxy(self.setDirectionPanel, self),200)
            }else{
            	$.proxy(self.setDirectionPanel, self);
            }
            /* //LGEBR-3177 20161215 modify */
            /* LGEBR-3308 20171102 add */
            $('#mode-selector').find("input[type='radio']").on("change", $.proxy(function(e) {
        	    	switch($(this).attr("id")){
        		 	   case "changemode-walking" :
        		 		  self.options.travelMode='WALKING'
        		            break;
        		 	   case "changemode-transit" :
        		 		  self.options.travelMode='TRANSIT'
        		            break;
        		 	   case "changemode-driving" :
        		 		  self.options.travelMode='DRIVING'
        		            break;
        		 } 
        	    	setTimeout($.proxy(self.setDirectionPanel, self),200)
               }));
	       /* //LGEBR-3308 20171102 add */
        }
    };
   
    /* LGEBR-3558 : 20180122 add */
    proto._mySearch = function() {
        var self = this;
        
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
                        /*
						 * google.maps.event.removeListener(zoomListener);
						 * self.zoomHandle = false; self.zoomSearch = false;
						 */
                        self.map.fitBounds(viewport);
                        self.center = self.map.getCenter();
                        // self.queryData();
                        /*
						 * zoomListener =
						 * google.maps.event.addListener(self.map, "idle",
						 * function(){ setTimeout(function(){ self.zoomHandle =
						 * true; google.maps.event.removeListener(zoomListener); },
						 * 500); });
						 */
                    }
                }, self));
            });
        }
    }
    /* //LGEBR-3558 : 20180122 add */
    // autocomplet input
    proto.autoZipcode = function(element) {
        var self = this;
        var zipCountry = self.$countryCombo.length ? self.$countryCombo.find(":selected").val() : self.options.country
        self.autoCompleteOption = {
            componentRestrictions: {
                country: zipCountry
            }
        };
        
        self.autoComplete = new google.maps.places.Autocomplete(element, self.autoCompleteOption);
        
        google.maps.event.addListener(self.autoComplete, 'place_changed', $.proxy(function(e) {
            var place = self.autoComplete.getPlace();
            // self.$searchBtn.click();
            
        }, self));
        
    }

    proto.mapControl = function() {
        var self = this;
        // drag event
        google.maps.event.addListener(self.map, 'dragend', $.proxy(function(e) {
            self.center = self.map.getCenter();
            if (!self.openDirection) {
                if (self.afterControl) {
                    self.getStore(); // self.getStore(true);
                    self.setRestrictionByGeocode(self.center)
                }
            }
            google.maps.event.trigger(self.map, "resize");

        }, self));
      // gps event
        self.$repairCenter.delegate(".repair-gps", "click change", $.proxy(function(e) { // LGEBR-3793 : 20181002modify
                var self = this;
                e.preventDefault();
                /* LGEBR-3558 : 20180122 modfy */
                if (!self.openDirection) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                    	var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                			self.gpsCenter = pos;

                        self.geocoder.geocode({
                            'latLng': pos,
                            "region": self.options.country
                        }, $.proxy(function(results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                            	var geom = results[0].geometry,
		                			address = results[0].formatted_address,
		                            viewport = geom.viewport;
                            	               				
                            	$("#serviceCenterZip").val(address);
                            	self.map.fitBounds(viewport);
                            	self.center = self.map.getCenter();
                            }
                        }, this));
                    });
                } else {
                    navigator.geolocation.getCurrentPosition(function(position) {
                    	var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            				self.gpsCenter = pos;
                        self.geocoder.geocode({
                            'latLng': pos
                        }, $.proxy(function(results, status) {                            
                            if (status == google.maps.GeocoderStatus.OK) {
                            	var geom = results[0].geometry,
		                			address = results[0].formatted_address,
		                            viewport = geom.viewport;
                            	$("#repairOrigin").val(address);
                            	self.map.fitBounds(viewport);
                            	self.center = self.map.getCenter();
                            }
                        }, this));
                    })
                }
                /* //LGEBR-3558 : 20180122 modfy */
            }, self))
            
            // gps event
        /*
		 * self.$repairCenter.delegate("a.repair-gps", "click",
		 * $.proxy(function(e) { var self = this; e.preventDefault(); if
		 * (!self.openDirection) {
		 * navigator.geolocation.getCurrentPosition(function(position) { var pos =
		 * new google.maps.LatLng(position.coords.latitude,
		 * position.coords.longitude); self.gpsCenter = pos;
		 * 
		 * self.geocoder.geocode({ 'latLng': pos }, $.proxy(function(results,
		 * status) { if (status == google.maps.GeocoderStatus.OK) {
		 * self.directionsAddress = results[0].formatted_address;
		 * document.getElementById("serviceCenterZip").value =
		 * self.directionsAddress; } }, this)); }); } else {
		 * navigator.geolocation.getCurrentPosition(function(position) { var pos =
		 * new google.maps.LatLng(position.coords.latitude,
		 * position.coords.longitude);
		 * 
		 * self.geocoder.geocode({ 'latLng': pos }, $.proxy(function(results,
		 * status) { if (status == google.maps.GeocoderStatus.OK) {
		 * self.directionsAddress = results[0].formatted_address;
		 * document.getElementById("repairOrigin").value =
		 * self.directionsAddress; } }, this)); }) } }, self))
		 */
            
            // layer toggle event
        self.$repairTitle.on('click', $.proxy(layerToggleHandler, self));
        self.$expandaleMap.on('click', $.proxy(self.mapExpand, self));
        // tab toggle event
        self.$repairTabmenu.find("li a").on('click', $.proxy(self.distanceHandler, self));
        
        self.$repairForm.off("submit").on('submit', $.proxy(self.searchAddress, self));
        self.$directionsForm.off("submit").on('submit', $.proxy(self.setDirectionPanel, self));
    }
    
    /* LGEBR-3046 : 20160811 modify */    
    proto.queryData = function() {
        var self = this;
        
        /* LGEAE-1297 20170602 add */
        var latitude = self.map.getCenter().lat();
        var longitude = self.map.getCenter().lng();
        if (lgFilter.locale == '/ae' && self.$searchInput.val() == ''
        	&& self.$accessCountry.val() == self.$countryCombo.find(":selected").val()) {
        	latitude = self.latitude;
        	longitude = self.longitude;
        }
        /* // LGEAE-1297 20170602 add */
        self.dataque = self.$repairForm.serialize() + "&" + $.param({
	        /* LGEAE-1297 20170602 modify */
            searchLatitudeValue: latitude,
            searchLongitudeValue: longitude,
            /* // LGEAE-1297 20170602 modify */
            ascPostalCode: self.zipcode,
            ascDistance: self.distance
        });
        /*LGEBR-3793 : 20181002 remove*/
        /*if (lgFilter.locale =="/br") {
        	$("[name=searchSuperCategoryId]").prop("required",false).removeAttr("required");
        }*/
        /*//LGEBR-3793 : 20181002 remove*/
        self.center = self.map.getCenter();
        self.clearMarker();
        $.ajax({
            url: self.options.queryUrl,
            data: XSSfilter(self.dataque),
            dataType: self.options.queryType,
            error: function(xhr) {
                self.reset();
                self.$repairTabmenu.find("li[data-distance=" + self.distance + "]").addClass("active").siblings("li").removeClass("active");
            
                self.setErrorList();
                // alert(xhr);
            },
            success: function(data) {
                self.map.process = true;
                self.markers = [];
                self.stores = [];
                /*LGEBR-3812 add : 20181113*/
                var _searchByList = $("#repairCenter").attr("data-current-active-tab")=="Search-by-list"?true:false;
                /*//LGEBR-3812 add : 20181113*/
                
                if (data.length) {
                    var curBounds = new google.maps.LatLngBounds();
                    var insetMarker = 0;
                    
                    // list reset
                    self.reset();
                    self.$repairTabmenu.find("li[data-distance=" + self.distance + "]").addClass("active").siblings("li").removeClass("active");
                    
                    $.each(data, function(item) {
                        var latlng = new google.maps.LatLng(data[item]['ascLatitudeValue'], data[item]['ascLongitudeValue']);
                        self.markerIcon.url = "/uk/content/img/support/repair/marker_" + (parseInt(item, 10) + 101).toString().substr(1) + ".png";
                        var curMarker = $.extend(true, {}, self.markerIcon);
                        self.addMarkers(latlng, curMarker, item);
                        self.stores.push(data[item]);
                        self.setRepairList(data, item);
                        curBounds.extend(latlng);
                        insetMarker += self.map.getBounds().contains(latlng) ? 1 : 0;
                    })

                    /* LGERU-3477 20171117 add */
                    if (lgFilter.locale == "/ru") {
                        $(".repair-map-information").addClass("first-store");
                    }
                    /* //LGERU-3477 20171117 add */

                    self.zoom = self.map.getZoom();
                    // self.offsetCenter(self.markers[0].getPosition(), 180, 0,
					// self.map); //marker 01 center
                    
                    /* LGEBR-3558 : 20180122 add */
                    var disLv = $("[name=inputDistance]").attr("data-current-distance");
                    if(lgFilter.locale == '/br'){
                    	/*LGEBR-3812 add : 20181113*/
                    	if(_searchByList) {
                    		var optionsArr = (function (){
                          		var arr = [];
                         		for (var key in dragbarVal.selectOption){
                         			arr.push(Number(dragbarVal.selectOption[key]["title"]));
                         		}
                         		return arr;
                         	})();
                    		var target = data[data.length-1]["calcDistance"];
                    		var near = 0;
                    		for(var i = 0;i < optionsArr.length; i++) {
                    			if(target>optionsArr[i]) { near=i+1;}
                    		}
                    		disLv = (target!=null) ? String((near>=optionsArr.length-1)?4:near) : disLv;
                        }
                    	/*//LGEBR-3812 add : 20181113*/
                    	switch(disLv){
                            case "1" :
                            	disLv = 10;
                                break;
                            case "2" :
                            	disLv = 9;
                                break;
                            case "3" :
                            	disLv = 8;
                            	// self.map.setZoom(8);
                                break;
                            case "4" :
                            	disLv = 7;
                            	// self.map.setZoom(7);
                                break;
                        }
                    }
                    /* //LGEBR-3558 : 20180122 add */
                    
                    if (self.searchHandle && insetMarker < Math.min(2, data.length)) {
                        var minBounds = new google.maps.LatLngBounds();
                        for (var k = 0; k < Math.min(2, data.length); k++) {
                            var _latlng = new google.maps.LatLng(data[k]['ascLatitudeValue'], data[k]['ascLongitudeValue']);
                            minBounds.extend(_latlng);
                        }
                        setTimeout(function() {
                            google.maps.event.addListenerOnce(self.map, 'bounds_changed', function(event) {
                                
                            	if (self.map.getZoom() > 17) {
                                    self.map.setZoom(17);
                                } else if(disLv != undefined){
                                	self.map.setZoom(disLv);
                                }
                            });
                            var _latlng = new google.maps.LatLng(self.map.getCenter().lat(), self.map.getCenter().lng());
                            minBounds.extend(_latlng);
                            self.map.fitBounds(minBounds);
                            if(globalConfig.isMobile && lgFilter.locale == '/br'){
                            	self.onItem();
                            } else {
                            	self.onItem(0);
                            }
                        }, 350);
                    } else {
                    	if(disLv != undefined){
                        	self.map.setZoom(disLv);
                        }
                    	if(globalConfig.isMobile && lgFilter.locale == '/br'){
                        	self.onItem();
                        } else {
                        	self.onItem(0);
                        }
                    }
                    
                    
                    
                    if (globalConfig.isMobile) {
                    	/* LGECS-1142 : 20170905 add */
                        var $liList = $(".repair-informaiton-detail .map-store-distance").find("li");
                        var liListArray = $liList.map(function(){
                            return $(this).height();
                        }) 
                        Math.max.apply(Math , liListArray); 
                        
                        if(Math.max.apply(Math , liListArray) > 40){
                        	$liList.parents("div.map-store-distance").addClass("overH");
                        }                        
                        /* //LGECS-1142 : 20170905 add */
                        self.slickEvent(self.$repairStoreList);
                        
                        /* LGEBR-3558 : 20180122 add */
                    	if(lgFilter.locale == '/br'){
                    		setTimeout(function() {
                    			self.onItem();
                        		self.infoBox.close();
                    		}, 350);
                    	}/* LGEBR-3558 : 20180122 add */
                    }
                    /*LGEBR-3793 : 20181002 remove*/
                    /*if (lgFilter.locale =="/br") {
                    	$("[name=searchSuperCategoryId]").prop("required",false).removeAttr("required");
                    }*/
                    /*//LGEBR-3793 : 20181002 remove*/
                    
                } else {
                	// console.log("!data.length");
                	if (lgFilter.locale =="/br") {
                		$("[name=searchSuperCategoryId]").prop("required",true).attr("required","required");
                	}
                    self.reset();
                    self.$repairTabmenu.find("li[data-distance=" + self.distance + "]").addClass("active").siblings("li").removeClass("active");
                    self.setErrorList();
                }
                /* LGEBR-3558 : 20180122 add */
                /* LGEBR-3762 20180827 modify */
            	if (lgFilter.locale =="/br") {
            	/* //LGEBR-3762 20180827 modify */
            		$(".slide-bar").show();
            		self.$distanceRange.removeAttr("style");
            		/*LGEBR-3812 add : 20181113*/
            		(_searchByList) ? self.$distanceRange.hide().siblings().find(".storeDistance").hide() : self.$distanceRange.show().siblings().find(".storeDistance").show();
            		/*//LGEBR-3812 add : 20181113*/
            		
            		var _disVal = $('[name=inputDistance]').attr("data-current-distance");
            		var _range = $(".slide-bar").attr("data-double");
                	if(self.$distanceRange.length > 0){
                		if (typeof dragbarVal != "undefined") {
                			 var optionsLen = function (o){
                          		var i = 0;
                         		for (var key in o){
                         			i++;
                         		}
                         		return i;
                         	} 
                			var target = self.$distanceRange,
                				dragEl = target.find('.slide-bar'),
                            	options = dragbarVal.selectOption,
                            	len = optionsLen(options) - 1,
                            	defaultMin = $('[name=inputDistance]').attr("data-current-distance");

                			$(".distance-range .slide-bar").slider({
                				// range: "min", or range: true,
                				range: _range,
                				value: defaultMin,
                				min: 0,
                				max: len,
								step : 1,
								// values: [defaultMin, _disVal], //range : true
                				create: function() {
                					$(".slide-text").text(self.distance + self.options.unit);
                				},
                				
                                slide: function(event, ui) {
                                	if(ui.value == 0) {
                                        return false;
                                    }

                                	$('[name=inputDistance]').attr("data-current-distance", ui.value);
                                    $(".slide-text").text(dragbarVal.selectOption[ui.value].title + self.options.unit);
                                },
                                stop: function(event, ui) {
                                	self.distanceHandler(event);
                                }
                			});
                			
                			if(_range == "false" && dragEl.find(".state-default-disable").length == 0){
                				dragEl.append("<span class='state-default-disable'></span>")
                            }
                        
                		}			
                	}
            	}
            	/* //LGEBR-3558 : 20180122 add */
                self.map.process = false;
            },
            complete: function() {
                // self.searchHandle = false;
            }
        })
    }
    /* //LGEBR-3046 : 20160811 modify */
    proto.getStore = function(force) {
        var self = this;
        clearTimeout(self.timing.queryTimeout);
        if (!self.infoBox.getVisible() || force) {
            self.reset();
            self.timing.queryTimeout = setTimeout($.proxy(self.queryData, self), 200);
        }
    }

    proto.setCountry = function(address) {
        var self = this;
        self.geocoder = new google.maps.Geocoder;
        /* LGEGMO-1679 */
        var slocation = self.openDirection ? {
            "location": address
        } : {
        	/* LGEGMO-3154 20170426 modify */	
            "address": address,
            "region" : self.options.country
            /* LGEGMO-3154 20170426 modify */	
        };
        /* LGEGMO-1679 */
        /*
		 * if(typeof address == "string" ){
		 * switch(address.substring(0,2).toLowerCase()){ case "es" : slocation = {
		 * location : {lat: 40.5, lng: -3.7} } break; case "rs" : slocation = {
		 * location : {lat: 43.4, lng: 19.5} } break; case "id" : slocation = {
		 * location : {lat: 0.26, lng: 114.88} } break; case "ca" : slocation = {
		 * location : {lat: 62.42, lng: -125.90} } break; } }
		 */

        self.geocoder.geocode(slocation, $.proxy(function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
            	/* LGEES-2564 20161019 modify */
                if (lgFilter.locale =="/es") {
                    self.geoResult.locations = results[0].geometry.location;
                    self.geoResult.viewport = results[0].geometry.viewport;
                } else {
                    self.geoResult.locations = results[results.length-1].geometry.location;
                    self.geoResult.viewport = results[results.length-1].geometry.viewport;                    
                }
                /* //LGEES-2564 20161019 modify */

                self.map.fitBounds(self.geoResult.viewport);
                self.center = self.map.getCenter();
                
                if (self.openDirection) {
                    self.offsetCenter(self.geoResult.locations, 0, 0, self.map);
                } else {
                    self.offsetCenter(self.geoResult.locations, 220, -100, self.map);
                }
                if (globalConfig.isMobile) self.offsetCenter(self.geoResult.locations, 100, -80, self.map);
                
                if(self.$countryCombo.length){
                    self.$countryCombo.trigger("change");
                }
                
            }            
        }, this));
    }


    proto.addMarkers = function(latlng, marker, itemNum) {
        var self = this;
        var bounds = new google.maps.LatLngBounds();
        var currMarker = self;

        var marker = new google.maps.Marker({
            map: self.map,
            icon: marker,
            draggable: false,
            position: latlng,
            zIndex: 1
        });

        marker.setVisible(true);
        self.markers.push(marker);

        google.maps.event.addListener(marker, "click", function(e) {
            self.infoBox.open(self.map, this);
            self.onItem(itemNum);
            self.focusList(itemNum);
        });

        google.maps.event.addListener(marker, 'mouseover', function() {
            this.setOptions({
                zIndex: 9
            });
        })
    };

    // moving map after markerk click
    proto.offsetCenter = function(latlng, offsetx, offsety, map) {
        var self = this;
        var scale = Math.pow(2, map.getZoom());
        var worldCoordinateCenter = map.getProjection().fromLatLngToPoint(latlng);
        var pixelOffset = new google.maps.Point((offsetx / scale) || 0, (offsety / scale) || 0);
        var worldCoordinateNewCenter = new google.maps.Point(worldCoordinateCenter.x - pixelOffset.x, worldCoordinateCenter.y + pixelOffset.y);
        var newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
        map.panTo(newCenter);
    }

    // map infoBox panel make
    proto.setStoreInfo = function(self, itemNum) {

        var data = self.stores[itemNum];
        var content = "<span class='tail'></span>"
        /* LGEBR-2902 20160805 modify */
        var phoneTxt = self.options.country == "br" ? "Fone 1" : "Phone";
        var fax = data['ascFaxNo'] == null ? "" : data['ascFaxNo'] ;
        /* //LGEBR-2902 20160805 modify */
        /* LGEBR-3444 add */
        var faxTxt = ($('input[name="msgfaxTxt"]').size() > 0 &&  $('input[name="msgfaxTxt"]').val() !== undefined && $('input[name="msgfaxTxt"]').val() !== null) ? $('input[name="msgfaxTxt"]').val():"Fax";
        /* //LGEBR-3444 add */
        /* LGERU-3331 add */
        var operationTimeDesc = (data['operationTimeDesc'] == null) ? "" : data['operationTimeDesc'] ;
        /* //LGERU-3331 add */
        
        /*
		 * LGEIS-1916 20160509 add, LGEGR-705 20160608
		 * modify,LGECZ-720,LGESK-274 20160630 modify
		 */
        if( typeof $('input[name="msgphoneTxt"]').val() !==undefined && $('input[name="msgphoneTxt"]').val() !==null){
        	phoneTxt = $('input[name="msgphoneTxt"]').val();
    	}
        /*
		 * //LGEIS-1916 20160509 add, LGEGR-705 20160608
		 * modify,LGECZ-720,LGESK-274 20160630 modify
		 */

        if (typeof(data['address']) != "string") data['address'] = "";
        if (typeof(data['ascPhoneNo']) != "string") data['ascPhoneNo'] = "";
        content += "<div class='wetkit-scroller'>"
        content += "<div class='infowindow-wrap'>"
        /* LGEBR-2902 20160805 add */
        if (lgFilter.locale =="/br") {
            content += "<div class='repair-thumb'><img src='"+ data['longitude'] +"' alt='' /></div>";
        }
        /* //LGEBR-2902 20160805 add */        	
        content += "<dl>";
        /* LGEGMO-4062 */
        content += "<dt><a href='javascript:goProviderDetail(\"" + "https://" + document.domain + data['ascUrl'] + "\",\"" + data['ascLatitudeValue'] + "\",\"" + data['ascLongitudeValue'] + "\",\"" + data['ascPostalCode'] + "\",\"" + this.zipcode + "\",\"" + document.getElementById('repairProduct').value + "\",\"" + "" + "\",\"" + data['dmsFlag'] + "\")'>" + data['ascName'] + "</a></dt>"; // warrenty value delete

        /* //LGEGMO-4062 */
        content += "<dd class='repair-address'>" + data['address'] + "</dd>";
        /* LGERU-3331 add, LGEUA-947 20171017 add */
        if (lgFilter.locale =="/ru" || lgFilter.locale =="/ua") {
        	content += "<dd class='repair-operationTime'>" + operationTimeDesc + "</dd>";
        }
        /* //LGERU-3331 add, LGEUA-947 20171017 add */
        /* LGEPH-352 , LGEBR-2902 , LGEES-2644 : 20170102 modify */
        /* LGEBR-3444 20170718 modify */
        if (lgFilter.locale =="/br") {
            content += "<dd class='repair-city-state'>" + data['cityName'] + " - " + data['stateName'] + "</dd>";
            content += "<dd class='repair-phonenumber'> "+phoneTxt+" : " + data['ascPhoneNo'] + "</dd>";
            content += "<dd class='repair-faxnumber'> "+faxTxt+": " + fax + "</dd>";
        } else if (lgFilter.locale !=="/ph" && lgFilter.locale !=="/es" ){
	        content += "<dd class='repair-phonenumber'> "+phoneTxt+" : " + data['ascPhoneNo'] + "</dd>";
		} else if (lgFilter.locale =="/es" ){
			content += "<dd class='repair-city-state'>" + data['cityName'] + "</dd>";
		}
        /* //LGEBR-3444 20170718 modify */
		/* //LGEPH-352 , LGEBR-2902 , LGEES-2644 : 20170102 modify */
        
        /* LGERU-3367 20170907 add */
        if(lgFilter.locale =="/ru" && data['evaluationPointNo'] != null && data['evaluationPointNo'] !==undefined ){
    		var evaluationHiddenTxt = 'звезды';
    		if(data['evaluationPointNo'] == 0 || data['evaluationPointNo'] == 1){
    			evaluationHiddenTxt = 'звезда';
    		}
    		content += '<dd class="repair-evaluationPointNo"> Рейтинг : ';        		
    		content += '<span class="grade star'+ data['evaluationPointNo'] +'"><i class="icon icon-star"></i><i class="icon icon-star"></i><i class="icon icon-star"></i><i class="icon icon-star"></i><i class="icon icon-star"></i>';
    		content += '<span class="blind">'+ data['evaluationPointNo'] + ''+ evaluationHiddenTxt +'</span></span>';
    		content += "</dd>";
    	}
        /* // LGERU-3367 20170907 add */
        
        content += "</dl>";
        /* LGEBR-2902 20160805 add */
        /* LGEBR-3177 20161215 modify */
        /* LGEGMO-4062 */
        if (lgFilter.locale =="/br") {// document.location.origin
            content += "<a href='https://" + document.domain + data['ascUrl'] +'?repairOrigin='+self.$searchInput.val()+"'>Como chegar</a>"; 
        }
        /* //LGEGMO-4062 */
        /* //LGEBR-3177 20161215 modify */
        /* //LGEBR-2902 20160805 add, LGEBR-2902 20160805 modify */
        content += "</div>"
        content += "</div>"

        self.infoBox.setContent(content);
    }

    proto.searchAddress = function(e) {
        var self = this,
            address = self.$searchInput.val();
        /*LGEBR-3812 add : 20181113*/
        var _searchByList = $("#repairCenter").attr("data-current-active-tab")=="Search-by-list"?true:false;
        /*//LGEBR-3812 add : 20181113*/
		 /* LGEEG-287 20170405 modify */
        if(self.$repairForm.find(".selectbox[name='stepCity']").length){
        	if(address==""||address==null||_searchByList){/*//LGEBR-3812 modify : 20181113*/
        		if(lgFilter.locale == '/br') {
        			address = self.$repairForm.find(".selectbox[name='stepCity']").val() +" "+ self.$repairForm.find(".selectbox[name='stepState']").val();
        		} else {
        			address = self.$repairForm.find(".selectbox[name='stepCity']").val();
        		}
        		
        	}else{
        		self.$repairForm.find(".selectbox[name='stepCity']").find("option:last-child").prop("selected", true).trigger("chosen:updated");
        	}
        	self.options.country = $("#repairCenter").data("country").split("_")[0];
        }
        /* //LGEEG-287 20170405 modify */
        self.geocoder = new google.maps.Geocoder;
        e.preventDefault();
        
        self.$repairForm.trigger("localRepairSearch");
        if(self.$repairForm.data("resultType") == "text") return
        
        /* LGEAE-1297 20170530 add */
        if (lgFilter.locale == '/ae' && self.$searchInput.val() == '' && self.$accessCountry.val() == self.$countryCombo.find(":selected").val()) {
        	    if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                    	self.latitude = position.coords.latitude;
                        self.longitude = position.coords.longitude;
                        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    	self.geocoder.geocode({
                            "location": latLng
                        }, $.proxy(function(results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                var geom = results[0].geometry,
                                    location = geom.location,
                                    address = results[0].formatted_address,
                                    viewport = geom.viewport;
                                self.center = self.map.getCenter();
                                self.results = results[0].address_components;
                                self.zipcode;                                
                                for (var i = self.results.length - 1; i > -1; i--) {
                                    self.address = self.results[i];
                                    if (self.address.types[0] == "postal_code") {
                                        self.zipcode = self.address.long_name;
                                        break;
                                    }
                                }
                                var markerOptions = {
                                    position: location,
                                    title: address,
                                    animation: google.maps.Animation.DROP
                                };

                                self.$resultLocation.text(address);
                                self.map.fitBounds(viewport);
                                self.afterSearch();
                                self.afterControl = true;
                            } else {
                                self.reset();
                                self.setErrorList();
                                self.afterControl = false;
                            }
                            self.$repairForm.trigger("afterSearchAddress");
                        }, self));
                    });
                }
        /* // LGEAE-1297 20170530 add */
        } else{
        	if (lgFilter.locale == '/ae' && self.$searchInput.val() == '' && self.$accessCountry.val() != self.$countryCombo.find(":selected").val()) {
        		address = self.$countryCombo.find(":selected").data('capital');
        	}         	var geocodeOpt = {
                "address": address,
                "region": self.options.country
            };
            
            if(self.options.componentRestrictions){
                geocodeOpt.componentRestrictions = {
                    country: self.options.country
                }
            }
            
            self.geocoder.geocode(geocodeOpt, function(results, status) {
            	 
                if (status == google.maps.GeocoderStatus.OK) {
                    var geom = results[0].geometry,
                        location = geom.location,
                        address = results[0].formatted_address,
                        viewport = geom.viewport;
                    self.center = self.map.getCenter();
                    self.results = results[0].address_components;
                    self.zipcode;
                    /* LGEAE-1297 20170530 add */
                    self.latitude = location.lat;
                    self.longitude = location.lng;
                    /* // LGEAE-1297 20170530 add */
                    for (var i = self.results.length - 1; i > -1; i--) {
                        self.address = self.results[i];
                        if (self.address.types[0] == "postal_code") {
                            self.zipcode = self.address.long_name;
                            break;
                        }
                    }
                    var markerOptions = {
                        position: location,
                        title: address,
                        animation: google.maps.Animation.DROP
                    };

                    self.$resultLocation.text(address);
                    self.map.fitBounds(viewport);
                    self.afterSearch();
                    self.afterControl = true;
                } else {
                    self.reset();
                    self.setErrorList();
                    self.afterControl = false;
                }
                self.$repairForm.trigger("afterSearchAddress"); /*
																 * repairmap
																 * LGEGMO-1741
																 * modi
																 */
            });
        }        
    };

    proto.afterSearch = function() {
        var self = this;
        self.reset();
        self.searchHandle = true;
        if (self.map.getZoom() < self.options.queryZoomLevel) {
            self.map.setZoom(self.options.queryZoomLevel);
        } else {
        	self.distance = self.distance || self.options.distance;
        }
        self.getStore();
		/* LGETH-609 : 20161019 add */
        if($("body").find("[name=inHomeServiceCate]").length){
        	var _srchCateId = $('#repairProduct').find("option:selected").val();
        	cateSelect(_srchCateId);
        	
			function cateSelect(_srchCateId) {
				var _trimVal = $("[name=inHomeServiceCate]").val().replace(/ /gi, '');
		        var useCateId = _trimVal.split(',');
		        var useCateIdArr = [];
		        var i;

		        for (i =0; i < useCateId.length; i++) {
		        	useCateIdArr.push(useCateId[i])
		        }
		        
		        if (useCateIdArr.lastIndexOf(_srchCateId) > -1) {
		        	$(".popup-data-btn").trigger("click");
		        }
			}
			
        }
        /* //LGETH-609 : 20161019 add */
    }

    proto.focusList = function(item, callback) {
        if (globalConfig.isMobile) return;
        $(".repair-center-list", self.$repairForm).stop().delay(150).animate({
            "scrollTop": ($("li[data-item='" + item + "']", "#repairCenterResult").offset().top - $("#repairCenterResult").offset().top + 1)
        }, 300, callback);
    }

    proto.onItem = function(item) {
        var self = this;
        $("li", "#repairCenterResult").removeClass("on").filter("li[data-item='" + item + "']").addClass("on");
        if (typeof(self.infoBox) != "undefined") {
            if (typeof(item) == "undefined") {
                self.infoBox.close();
                self.activeItem = null;
            } else if (self.activeItem != item) {
                
        		self.infoBox.close();
                self.activeItem = item;
                if (!globalConfig.isMobile) {
                    self.offsetCenter(self.markers[item].getPosition(), 220, -100, self.map);
                } else {
                    self.offsetCenter(self.markers[item].getPosition(), 0, -100, self.map);
                }
                self.setStoreInfo(self, item);
                self.infoBox.open(self.map, self.markers[item]);
        
                
            } else if (self.activeItem == item && !self.infoBox.getVisible()) {
                self.infoBox.Content(null);
                self.offsetCenter(self.markers[item].getPosition(), 220, -100, self.map);
                self.setStoreInfo(self, item);
                self.infoBox.open(self.map, self.markers[item]);
            }
        }
    }
    
    proto.setDirectionPanel = function(e) {
        var self = this;
		/* LGEBR-3177 20161215 modify */
        if(e!==undefined){
        	e.preventDefault();
        }
        /* //LGEBR-3177 20161215 modify */
        self.directKeyword = document.getElementById("repairOrigin");
        self.directResult = document.getElementById('directionResult');
        self.autoZipcode(self.directKeyword);
        var unit = self.options.unitMetric ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL;
        var centerLocation = new google.maps.LatLng(self.options.centerLatitude, self.options.centerLongitude);
	/* LGEBR-3308 20171102 modify */
        var request = {
            origin: self.directKeyword.value,
            destination: centerLocation,
            travelMode: self.options.travelMode,
            unitSystem: unit
        };
       
        self.directionsDisplay.setMap(self.map);
        self.directionsDisplay.setPanel(self.directResult);

        self.directionService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                self.openDirection = true;
                $(self.directResult).find(".repair-error-list").hide();
                $(self.directResult).find(".suggest, #mode-selector").show();
                self.directionsDisplay.setDirections(response);
                for (var i = 0; i < self.markers.length; i++) {
                    self.markers[i].setVisible(false);
                }
                self.infoBox.close();
            } else {
                self.directionsDisplay.setMap(null);
                self.directionsDisplay.setPanel(null);
                if(lgFilter.locale !== '/br'){
                	$(self.directResult).find(".suggest").hide();
                }
                $("#directionResult .repair-error-list").show();
            }
            $(self.directResult).find(".suggest a").addClass("active");
        });
	/* //LGEBR-3308 20171102 modify */
	        
 

    }

    // query string ascPostalCode make
    proto.setRestrictionByGeocode = function(loc) {
        var self = this;
        self.geocoder.geocode({
            'location': loc
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                self.results = results[0].address_components;
                for (var i = self.results.length - 1; i > -1; i--) {
                    self.address = self.results[i];
                    if (self.address.types[0] == "postal_code") {
                        self.zipcode = self.address.long_name;
                        break;
                    }
                }

            }
        });
    }

    proto.clearMarker = function(map) {
        var self = this;
        for (var i = 0; i < self.markers.length; i++) {
            self.markers[i].setMap(null);
        }
        self.markers = [];
    }

    proto.setRepairList = function(data, itemNum) {
        var self = this;
        var data = data[itemNum];
        var content;

        /* LGEBR-2902 20160805 modify */
        var phoneTxt = self.options.country == "br" ? "Fone 1" : "Phone";
        var fax = data['ascFaxNo'] == null ? "" : data['ascFaxNo'];     
        /* //LGEBR-2902 20160805 modify */
        /* LGEBR-3558 : 20180122 add */
        var repairCenterText= $('input[name=repairCenterText]');
        var distanceTxt = (repairCenterText > 0 &&  repairCenterText.attr("data-distance-text") !== undefined && repairCenterText.attr("data-distance-text") !== null) ? repairCenterText.attr("data-distance-text"):"Distância";
        var detailTxt = (repairCenterText > 0 &&  repairCenterText.attr("data-detail-text") !== undefined && repairCenterText.attr("data-detail-text") !== null) ? repairCenterText.attr("data-detail-text"):"Como chegar";
        /* LGEBR-3558 : 20180122 add */
        /* LGEBR-3444 add */
        var faxTxt = ($('input[name="msgfaxTxt"]').size() > 0 &&  $('input[name="msgfaxTxt"]').val() !== undefined && $('input[name="msgfaxTxt"]').val() !== null) ? $('input[name="msgfaxTxt"]').val():"Fax";
        /* //LGEBR-3444 add */
        /* LGERU-3331 add */
        var operationTimeDesc = (data['operationTimeDesc'] == null) ? "" : data['operationTimeDesc'] ;
        /* //LGERU-3331 add */
        
        /*
		 * LGEIS-1916 20160509 add, LGEGR-705 20160608
		 * modify,LGECZ-720,LGESK-274 20160630 modify
		 */
        if( typeof $('input[name="msgphoneTxt"]').val() !==undefined && $('input[name="msgphoneTxt"]').val() !==null){
        	phoneTxt = $('input[name="msgphoneTxt"]').val();
    	}
        /*
		 * //LGEIS-1916 20160509 add, LGEGR-705 20160608
		 * modify,LGECZ-720,LGESK-274 20160630 modify
		 */
        
        if (typeof(data['address']) != "string") data['address'] = "";
        if (typeof(data['ascPhoneNo']) != "string") data['ascPhoneNo'] = "";
        
        /* LGEBR-3558 : 20180122 add */
        if (typeof(data['address2']) != "string") data['address2'] = "";
        if (typeof(data['address3']) != "string") data['address3'] = "";
        /* //LGEBR-3558 : 20180122 add */
        
        /* LGEAU-2599 : 20180724 add */
        if(lgFilter.locale == "/au" && data["directServiceFlag"] == "Y") {
        	content = "<li class='directService'><dl>";
        	content += "<dt><a href='"+ data['directServiceUrl'] +"' title='Opens in a new window' target='_blank' class='icon-link' adobe-click='lg-direct-service-map'><span>" + data['directServiceTitle'] + "</span> <i class='icon icon-new-window-2'></i></a></dt>";	/*LGEAU-2659 20181001 modify*/
        	content += "<dd class='repair-address'>" + data['directServiceName'] + "</dd>";
        	content += "<dd class='repair-phonenumber'>" + data['directServicePhone'] + "</dd>";
        	content += "</dl>";
        	content += "</li>";
        	content += "<li data-item='" + itemNum + "'>";
        }else {
        	content = "<li data-item='" + itemNum + "'>";
        }
        /* //LGEAU-2599 : 20180724 add */
        content += "<div class='icon-marker store'><span>" + (itemNum + 1) + "</span></div>";
        content += "<dl>";
        /* LGEBR-2902, LGEBR-3558 : 20180122 modify */
        /* LGEGMO-4062 */    
        if (lgFilter.locale == "/br") {
            content += "<dt><a href='javascript:goProviderDetail(\"" + "https://" + document.domain + data['ascUrl'] + "\",\"" + data['ascLatitudeValue'] + "\",\"" + data['ascLongitudeValue'] + "\",\"" + data['ascPostalCode'] + "\",\"" + self.zipcode + "\",\"" + document.getElementById('repairProduct').value + "\",\"" + "" + "\",\"" + data['dmsFlag'] + "\")' class='icon-link'><span>" + data['ascName'] + "</span> <i class='icon icon-new-window-2'></i></a></dt>"; // warrenty
																																																																																																																					// value
																																																																																																																					// delete
            content += "<dd class='repair-address'>" + data['address1'] + "&nbsp;" + data['address2']+ "</dd>";
            if(data['address3'] != ""){
            	content += "<dd class='repair-district'>" + data['address3'] + "</dd>";
            }
            
            // <span class='storeDistance'>"+ data['calcDistance'] +"Km</span>
        } else {
            content += "<dt><a href='javascript:goProviderDetail(\"" + data['ascUrl'] + "\",\"" + data['ascLatitudeValue'] + "\",\"" + data['ascLongitudeValue'] + "\",\"" + data['ascPostalCode'] + "\",\"" + self.zipcode + "\",\"" + document.getElementById('repairProduct').value + "\",\"" + "" + "\",\"" + data['dmsFlag'] + "\")' class='icon-link'><span>" + data['ascName'] + "</span> <i class='icon icon-new-window-2'></i></a></dt>"; // warrenty
																																																																																																													// value
																																																																																																													// delete
            content += "<dd class='repair-address'>" + data['address'] + "</dd>";
        }
        /* //LGEGMO-4062 */
        /* //LGEBR-2902, LGEBR-3558 : 20180122 modify */
        
        /* LGERU-3331 add, LGEUA-947 20171017 add */
        if (lgFilter.locale =="/ru" || lgFilter.locale =="/ua") {
        	content += "<dd class='repair-operationTime'>" + operationTimeDesc + "</dd>";
        }
        /* //LGERU-3331 add, LGEUA-947 20171017 add */
        /* LGEBR-2902, LGEES-2644 : 20170102 modify */
        if (lgFilter.locale == "/br") {
            content += "<dd class='repair-city-state'>" + data['cityName'] + " - " + data['stateName'] + "</dd>";
        } else if(lgFilter.locale == "/es") {
        	content += "<dd class='repair-city-state'>" + data['cityName'] + "</dd>";
        }
        /* //LGEBR-2902, LGEES-2644 : 20170102 modify */
		/* LGEPH-352, LGEES-2644 : 20170102 modify */
		if(lgFilter.locale !=="/ph" && lgFilter.locale !=="/es" ){
	        content += "<dd class='repair-phonenumber'> "
	        
	        data['phone'] ? content+=data['phone'] : content+=phoneTxt;
	        
	        content +=" : " + data['ascPhoneNo'];
	        content += "</dd>";
		}
		/* LGEPH-352, LGEES-2644 : 20170102 modify */
		
        /* LGEBR-3177 20161215 modify */
		/* LGEBR-3444,LGEBR-3558 : 20180122 modify */
		/* LGEGMO-4062 */
        if (lgFilter.locale == "/br") {
            content += "<dd class='repair-faxnumber'> "+faxTxt+": " + fax + "</dd>";
            if(self.$searchInput.val() == ""){
            	content += "<dd class='repair-detail'><span class='storeDistance'>"+ distanceTxt +" : " + data['calcDistance'] + "Km</span><a class='btn' href='https://" + document.domain + data['ascUrl'] + "?repairOrigin=" + data['cityName'] + " - " + data['stateName'] +"'>"+ detailTxt +"</a></dd>"
            } else {
            	content += "<dd class='repair-detail'><span class='storeDistance'>"+ distanceTxt +" : " + data['calcDistance'] + "Km</span><a class='btn' href='https://" + document.domain + data['ascUrl'] + "?repairOrigin=" + self.$searchInput.val() + "'>"+ detailTxt +"</a></dd>"
            }            
        }
        /* //LGEGMO-4062 */
        /* //LGEBR-3444,LGEBR-3558 : 20180122 modify */
        /* //LGEBR-3177 20161215 modify */	
        
        /* LGERU-3367 20170907 add */
        if (lgFilter.locale =="/ru" && data['evaluationPointNo'] != null && data['evaluationPointNo'] !==undefined) {
        	var evaluationHiddenTxt = 'звезды';
        	if(data['evaluationPointNo'] == 0 || data['evaluationPointNo'] == 1){
        		evaluationHiddenTxt = 'звезда';
        	}
    		content += '<dd class="repair-evaluationPointNo"> Рейтинг : ';        		
    		content += '<span class="grade star'+ data['evaluationPointNo'] +'"><i class="icon icon-star"></i><i class="icon icon-star"></i><i class="icon icon-star"></i><i class="icon icon-star"></i><i class="icon icon-star"></i>';
    		content += '<span class="blind">'+ data['evaluationPointNo'] + ''+ evaluationHiddenTxt +'</span></span>';
    		content += "</dd>";
        }
        /* // LGERU-3367 20170907 add */
        
        content += "</dl>";
        content += "</li>";
        self.$repairStoreList.append(content);
    }

    proto.setErrorList = function() {
        var self = this;
 
        if (self.$searchInput.val() != "" 
        	|| (lgFilter.locale == '/ae' && self.$searchInput.val() == '') // LGEAE-1297 20170609 add
        	|| (lgFilter.locale == '/br' && self.$searchInput.val() == '')) {  // LGEBR-3558 20180122 add /* LGEBR-3762 20180827 modify */
            // self.reset();
            var content;
            content = "<li class='error-list'>";
            content += "<div class='repair-error-list'>";
            
            self.options.noDataTxt ? content += self.options.noDataTxt : content += self.noDataTxt
            // content += self.options.noDataTxt;
            // content += self.noDataTxt;
            
            content += "</div>";
            content += "</li>";
            /* LGEAE-1298 20170616 add */
            if(self.$repairDetail.find($(".telephone-box")).length){
            	content +=$(".telephone-box").html();
            }
            /* //LGEAE-1298 20170616 add */
            self.$repairStoreList.append(content);
            

			/* LGEBR-2901, LGEBR-3046 : 20160811 modify */
            if (lgFilter.locale == "/br") {
                var selectType = $('#repairProduct').find("option:selected").attr("data-service-type");
                var popUrl;
                /*LGEBR-3812 add : 20181128*/
                var serviceTab = ($("#repairCenter").attr("data-current-active-tab")=="Search-by-list")? "&service-tab="+$("#repairCenter").attr("data-current-active-tab"):"";
                /*//LGEBR-3812 add : 20181128*/
                if ( selectType == null || selectType == "" ) {
                        popUrl = $(".poopup-url").attr("data-url") + serviceTab;
                        $(".popup-data-btn").attr("href", popUrl).trigger("click");
                } else {
                    if ( (selectType == "MC") || selectType == "CI" || (selectType == "IH") ) {
                        popUrl = $(".poopup-url").attr("data-url") + selectType + serviceTab;
                        $(".popup-data-btn").attr("href", popUrl).trigger("click");
                    }                
                }
            }
            /* //LGEBR-2901, LGEBR-3046 : 20160811 modify */
        }
    }

    // center distance tap event
    /* LGEBR-3558 : 20180122 modify */
    proto.distanceHandler = function(e) {
        var self = this;
        var target = $(e.target),
        	brDis = target.parent().find(".slide-text").text(),
        	sd = brDis.replace(/[^0-9]/gi, ''), // Replace everything that is
												// not a number with nothing
        	number = parseInt(sd, 10);
        
        if (self.afterControl) {
        	if(brDis.length > 0){
        		self.distance = number;
            } else {
            	self.distance = target.parent().data("distance");
            }
        	
            // self.getStore(true);
            self.searchAddress(e);
            e.preventDefault();
        }
    }
    /* //LGEBR-3558 : 20180122 modify */
    proto.reset = function() {
        var self = this;
        self.clearMarker();
        self.onItem();
        self.activeItem = null;

        if (typeof(self.infoBox) != "undefined") self.infoBox.close();
        self.infoBox.setContent(null);
        self.directionsDisplay.setMap(null);
        self.directionsDisplay.setPanel(null);
        self.$repairStoreList.removeClass().html(null);
        self.$repairDetail.stop().show();
        self.$repairTitle.find("span").addClass("on");
        self.$repairDetail.find("li").removeClass("active");
        if (globalConfig.isMobile) self.$repairStoreList.next(".pagination").hide();
    }

    proto.resizing = function() {
        var self = this;
        self.center = self.map.getCenter();
        google.maps.event.trigger(self.map, "resize");
        self.map.setCenter(self.center);
    }

    // mobile only map size
    
    /* LGEBR-2903 : 20161024 modify */
    proto.mapExpand = function(e) {
        var self = this;
        var tHeight = self.$repairMapArea.height();
        var wHeight = window.innerHeight;
        var tabletmode = self.$repairMapArea.parent(".tablet-mode-map");
        self.zoom = self.map.getZoom();
        e.preventDefault();
        
        if (tHeight == 180 || (tabletmode && tHeight < 250)) { 
            self.$repairMapArea.stop().animate({
                "height": "100%"
            }, 300, function() {
                $(e.target).addClass("on");
                self.$repairMapArea.parent().addClass("full");
                self.resizing();

            });
        } else {
        	var _height = tabletmode ? 250 : 180;        	
            self.$repairMapArea.stop().animate({
                "height": _height
            }, 300, function() {
                $(e.target).removeClass("on");
                self.$repairMapArea.parent().removeClass("full");
                self.resizing();
            });
        }
    }
    /* //LGEBR-2903 : 20161024 modify */
    
    // mobile only list paging
    proto.slickEvent = function(ele) {
        ele.on('init reInit afterChange', function(event, slick, currentSlide, nextSlide) {
            var i = (currentSlide ? currentSlide : 0) + 1;
            $(".end-page").text("/ " + slick.slideCount);
            $(".current-page").text(i);
        });
        
        ele.slick({
            adaptiveHeight: true,
            slide: "li",
            infinite: false,
            dots: false,
            speed: 500,
            rows: 3,
            slidesPerRow: 1,
            prevArrow: ".pagination .prev",
            nextArrow: ".pagination .next"
        }).next(".pagination").show();
    }

    var layerToggleHandler = function(e) {
        var self = this;
        e.preventDefault();
        self.$repairDetail.stop().slideToggle("fast");
        self.$repairTitle.find("span").toggleClass("on");
    }
    
    
    /* LGEBR-3046, LGEBR-3558, LGEBR-3793 : 20181002 modify */
    if (lgFilter.locale == "/br") {
    	$(".repair-map-search").hide();
    	if(window.location.search.indexOf("modelCode") > -1){
			$(".repair-map-search").show();
    	}
    	$("[name=searchSuperCategoryId]").prop("required",true).attr("required", "required");
    	
    	$("[name=stepState]").prop("required",true).attr("required", "required");
	    $(document).on("change", "select[name=searchSuperCategoryId]", function() {
	    	var _this = $(this);
	    	var _superCategory = $("select[name=searchSuperCategoryId]").val();
	    	var url = _this.attr("data-url") + "&searchSuperCategoryId=" + _superCategory;
	    	
	    	$.ajax({
	            url: url,
	            error: function(XMLHttpRequest, textStatus, errorThrown) {
	            	// console.log(textStatus);
	            },
	            success: $.proxy(function(data) {
	                var self = this;	
	                var $result = $("[name=searchCategoryId]");
	                $result.find("option").each(function(index) {
	                	if(index != 0) {
                			$(this).remove();
                   		}
               		});
	                if (_.size(data)) {
	                   var data = data.locateRepairCenter;
	                   $result.find("option").each(function() {
	                	   if(!$(this).attr("data-service-type") && $(this).val().length != 0) {
		                  		$(this).remove();
		                  	}
		               		$result.attr("id", "repairProduct");
	                		$("select[name=searchSubCate]").removeAttr("id");
	              		});
						
	                   var _placeholer = $("select[name=searchSubCate]").attr("data-placeholder");
	                    $("select[name=searchSubCate]").prop("disabled",true).attr("disabled","disabled");
	                    $("select[name=searchSubCate]").find("option").each(function(index) {
		                	if(index != 0) {
	                			$(this).remove();
	                   		}
	               		});

						$("select[name=searchSubCate]").trigger("chosen:updated.chosen");
						
						for (var key in data) {
	                    	var option = document.createElement("option");
	                        var sType = document.createAttribute("data-service-type");
	                        
	                        option.setAttributeNode(sType);
	                        option.value = Object.keys(data[key])[0];
	                        option.text = data[key][Object.keys(data[key])[0]];
	                        option.sType = data[key].dataServiceType;
	                    	option.setAttribute("data-service-type", option.sType);
	                        $result.append(option);
	                    }
						$result.prop("disabled",false).removeAttr("disabled");
	                    $result.trigger("chosen:updated.chosen");
	                }
	                
	            }, self)
	        });
	    });	    
	    $(document).on("change", "select[name=searchCategoryId]", function() {
	    	var _this = $(this);
	    	var _superCategory = $("select[name=searchSuperCategoryId]").val();
	    	var _category = $("select[name=searchCategoryId]").val();
	    	var url = _this.attr("data-url") + "&searchCategoryId=" + _category;
	    	
	        $.ajax({
	            url: url,
	            error: function(XMLHttpRequest, textStatus, errorThrown) {
	            	// console.log(textStatus);
	            },
	            success: $.proxy(function(data) {
	                var self = this;
	                var $result = $("[name=searchSubCate]");
	                $result.find("option").each(function(index) {
	                	if(index != 0) {
                			$(this).remove();
                   		}
               		});
	                if (_.size(data) && data.visible_flag =="true") {
	                	var data = data.subCate;
	                	$("select[name=searchCategoryId]").find("option").each(function() {            		

	                		$("select[name=searchCategoryId]").removeAttr("id");
	                		$result.attr("id", "repairProduct");
	               		});
	                	
	                	for (var key in data) {
	                    	var option = document.createElement("option");
	                        var sType = document.createAttribute("data-service-type");
	                        
	                        option.setAttributeNode(sType);
	                        option.value = Object.keys(data[key])[0];
	                        option.text = data[key][Object.keys(data[key])[0]];
	                        option.sType = data[key].dataServiceType;
	                    	option.setAttribute("data-service-type", option.sType);
	                        $result.append(option);
	                    }

						$result.prop("disabled",false).removeAttr("disabled");
	                    $result.trigger("chosen:updated.chosen");
	                    
	                    
	                } else {
	                	$result.prop("disabled",true).attr("disabled","disabled");
	                	$result.find("option").each(function() {
	                		if(!$(this).attr("data-service-type") && $(this).val().length != 0) {
	                   			$(this).remove();
	                   		}
	               		});
	                	$("select[name=searchCategoryId]").attr("id", "repairProduct");
	            		$("select[name=searchSubCate]").removeAttr("id");

	                	$result.trigger("chosen:updated.chosen");
	                	$(".repair-map-search").show();
	                	return false;
	                }
	            }, self)
	        });	        
	    });
	    
	    $(document).on("change", "select[name=searchSubCate]", function() {
	    	var _this = $(this);
	    	var _thisVal = $(this).val();
	    	
	    	if(_thisVal != ""){
	    		$(".repair-map-search").show();
	    	}
	    });
	    $(document).on("change", "select[name=stepState]", function() {
            var _this = $(this);            
            var _productParam = XSSfilters(_this.parents(".warranty-status-section").find("select").serializeArray());
            var url = _this.attr("data-url") + "&" + _productParam;
            
            $.ajax({
                url: url,
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    // console.log(textStatus);
                },
                success: $.proxy(function(data) {
                    var self = this;    
                    var $result = $("[name=stepCity]");
                    
                    if (_.size(data)) {
                        var data = data.locateRepairCenter;
                    }
                    $result.find("option").each(function(index) {
                        if(index != 0) {
                            $(this).remove();
                        }
                    });

                    $("select[name=stepCity]").trigger("chosen:updated.chosen");                        
                    for (var key in data) {
                        var option = document.createElement("option");
                        option.value = data[key][Object.keys(data[key])[0]];
                        option.text = data[key][Object.keys(data[key])[0]];
                        $result.append(option);
                    }
                    $result.prop("disabled",false).removeAttr("disabled");
                    $result.trigger("chosen:updated.chosen");
                }, self)
            });
        });
        
        $(document).on("change", ".map-tab-style li input[type=radio]", function() {
        	var activeTab = $(this).attr('data-tab');
        	
        	$(".repair-map-search").find("li").removeClass('active');
			$('.repair-map-search-content > div').hide();
			$(this).parents("li").addClass('active');
			$('#' + activeTab).show();
			
			$(".repair-map-search-content, #serviceCenterSubmit").show();
        	$("[name=searchPostalCode]").val("");
        	$("[name=stepState]").val("").trigger("chosen:updated.chosen");        	
            $("[name=stepCity]").val("").trigger("chosen:updated.chosen");
            $("[name=stepCity]").prop("disabled",true).attr("disabled", "disabled");
            
            if(!globalConfig.isMobile){
            	activeTab == "Search-by-list" ? $("#serviceCenterSubmit").attr('style', 'bottom: 0 !important;') : $("#serviceCenterSubmit").attr('style', 'bottom: 3rem!important; position: absolute;'); 
            }
            
            /* LGEBR-3812 modify : 20181113 */
            $("#repairCenter").attr("data-current-active-tab",activeTab)
            /*//LGEBR-3812 modify : 20181113 */
        });
	}
    /* //LGEBR-3046, LGEBR-3558, LGEBR-3793 : 20181002 modify */
    /* LGEBR-2903 : 20161024 modify */
    if (!globalConfig.isMobile && lgFilter.locale =="/br") {
    	$(window).on("resize", function(event) {
        	if($("html").hasClass("tablet") || ($(window).width() > 767, $(window).width() <= 1280)){
        		$(".repair-map-section").addClass("tablet-mode-map");
        		$(".repair-map-section").find(".map-expend").removeClass("hidden");                
        	} else {       		
        		$(".repair-map-section").removeClass("tablet-mode-map");
        		$(".repair-map-section").find(".map-expend").addClass("hidden");
        	}
        });
    }
    /* //LGEBR-2903 : 20161024 modify */
    
    // "gmap" is an instance of the google map
    ic.jquery.plugin('GoogleMaps', GoogleMaps, '.repair-service-center');

    return GoogleMaps;

})