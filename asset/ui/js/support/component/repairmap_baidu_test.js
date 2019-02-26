define(['global-config', 'ic/ic', 'ic/ui/module', 'slick-carousel'], function(globalConfig, ic, Module, Slick) {
//define(['global-config', 'ic/ic', 'ic/ui/module', 'cs/infobox_baidu', 'slick-carousel'], function(globalConfig, ic, Module, InfoBox, Slick) {
    
    var proto,
        events = ic.events;

    var BaiduMaps = function(el, options) {
        var self = this;
        // Call the parent constructor
        BaiduMaps.superclass.constructor.call(self, el, options);
        self.$repairCenter = $(".repair-service-center");
        self.$repairSection = self.$('.repair-map-information');
        self.$repairTitle = self.$('.repair-informaiton-title a');
        self.$repairDetail = self.$('.repair-informaiton-detail');
        self.$repairStoreList = self.$("#repairCenterResult");
        self.$repairTabmenu = self.$('.map-store-distance');
        self.$searchInput = self.$('#serviceCenterZip');
        self.$productSelect = self.$('#repairProduct');
        //self.$searchBtn = self.$('#serviceCenterSubmit');
        self.$repairForm = self.$('#repairForm');
        self.$resultLocation = self.$('.repair-map-location');
        self.$directionsForm = self.$('#directionForm');
        self.$repairMapArea = self.$('#repairMap');
        self.$expandaleMap = self.$('.map-expend');

        self._basic();
    };

    // Inherit from Module
    ic.util.inherits(BaiduMaps, Module);

    // Alias the prototype for less typing and better minification
    proto = BaiduMaps.prototype;
    proto._defaults = {
        country: null,
        zoomLevel: 5,
        zoomLevelMin: 2,
        zoomLevelMax: 24,
        viewport: null,
        countryRestriction: true,
        queryZoomLevel: 10,
        queryUrl: '/gp/support/_response/repair-data-cn.json',
        queryType: "json",
        unitMetric: false,
        useDirection: false,
        centerLatitude: null,
        centerLongitude: null,
        useController: false,
        debug: false,
        unit: 'Mile', //metric(Km), imperial(Mile)
        distance: 25,
        distance_opt: "5,10,25,50",
        unitMetric: false
    };

    proto._basic = function() {
        var self = this;
        self.options.country = $("#select-myaddr").data("myaddr") || "北京";
        var $repairForm = $("[name=repairForm]");
        self.options.unit = $repairForm.children("[name=distanceType]").val() == "mi" ? "Mile" : "Km";
        if (self.options.unit == "Km") self.options.unitMetric = true;
        if ($(".map-store-distance").length > 0) {
            self.options.distance = $repairForm.children("[name=distance_init]").val();
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

        self.timing = {
            queryTimeout: null
        };
        /*
        self.markerIcon = {
            size: new google.maps.Size(34, 46),
            anchor: new google.maps.Point(17, 46)
        }
        */
        self.mapSetting();
        self.$repairDetail.stop().hide();
        self.$repairTitle.find("span").removeClass("on");

        self.$repairTabmenu.on('click', "li a", function() {
            $.proxy(self.distanceHandler, self);
        });
    }
    
    proto.mapSetting = function() {
        var self = this;
        self.mapDiv = document.getElementById("repairMap");
        self.keyword = document.getElementById("serviceCenterZip");
        self.locaitonKey = document.getElementById("repairOrigin");

        self.mapOptions = {
            zoom: self.options.zoomLevel,
            /*
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
            */
            minZoom: self.options.zoomLevelMin,
            maxZoom: self.options.zoomLevelMax
        }
/**
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
        };**/
        
        self.map = new BMap.Map(self.mapDiv,self.mapOptions);
        self.map.centerAndZoom(new BMap.Point(116.4035,39.915),8); 
        self.map.enableScrollWheelZoom(true);
        //console.log("self.map : ",self.map);
        self.map.addControl(new BMap.MapTypeControl());

        //self.map = new google.maps.Map(self.mapDiv, self.mapOptions);
        //self.infoBox = new InfoBox(self.infoOptions);
        //self.directionService = new google.maps.DirectionsService();
        //self.directionsDisplay = new google.maps.DirectionsRenderer();
        self.mapControl();

        //self.center = self.map.getCenter();

        if (!self.openDirection) {
            self.setCountry(self.options.country);
            self.autoZipcode(self.keyword);
        } else {
            /*
            var pos = new google.maps.LatLng(self.options.centerLatitude, self.options.centerLongitude);
            self.setCountry(pos);
            self.map.setZoom(13);
            self.addMarkers(pos);

            self.autoZipcode(self.locaitonKey);
            $.proxy(self.setDirectionPanel, self);
            */
        }
        
    };

    //autocomplet input
    proto.autoZipcode = function(element) {
        var self = this;
        
        self.autoComplete = new BMap.Autocomplete({
            "input" : element
            ,"location" : self.map
        });
        
        /*
        function G(id) {
            return document.getElementById(id);
        }
        */
        
        self.autoComplete.addEventListener("onhighlight", function(e) {
            var str = "";
            var _value = e.fromitem.value;
            var value = "";
            if (e.fromitem.index > -1) {
                value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
            }    
            str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

            value = "";
            if (e.toitem.index > -1) {
                _value = e.toitem.value;
                value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
            }    
            str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
            //G("searchResultPanel").innerHTML = str;
        });
        
        var myValue;
        self.autoComplete.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
            var _value = e.item.value;
            myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
            
            //G("searchResultPanel").innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
        });
        
    }

    proto.mapControl = function() {
        var self = this;
        //drag event
        
        /*
        google.maps.event.addListener(self.map, 'dragend', $.proxy(function(e) {
            self.center = self.map.getCenter();
            if (!self.openDirection) {
                if (self.afterControl) {
                    self.getStore();
                    self.setRestrictionByGeocode(self.center)
                }
            }
            google.maps.event.trigger(self.map, "resize");

        }, self));
        */
        
        //gps event
        self.$repairCenter.delegate("a.repair-gps", "click", $.proxy(function(e) {
            var self = this;
            e.preventDefault();
            if (!self.openDirection) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    self.gpsCenter = pos;

                    self.geocoder.geocode({
                        'latLng': pos
                    }, $.proxy(function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            self.directionsAddress = results[0].formatted_address;
                            document.getElementById("serviceCenterZip").value = self.directionsAddress;
                        }
                    }, this));
                });
            } else {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    self.geocoder.geocode({
                        'latLng': pos
                    }, $.proxy(function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            self.directionsAddress = results[0].formatted_address;
                            document.getElementById("repairOrigin").value = self.directionsAddress;
                        }
                    }, this));
                })
            }
        }, self))
        //layer toggle event
        
        self.$repairTitle.on('click', $.proxy(layerToggleHandler, self));
        self.$expandaleMap.on('click', $.proxy(self.mapExpand, self));
        //tab toggle event
        self.$repairTabmenu.find("li a").on('click', $.proxy(self.distanceHandler, self));

        self.$repairForm.off("submit").on('submit', $.proxy(self.searchAddress, self));
        self.$directionsForm.off("submit").on('submit', $.proxy(self.setDirectionPanel, self));

    }


    proto.queryData = function() {
        var self = this;

        self.center = self.map.getCenter();
        self.dataque = self.$repairForm.serialize() + "&" + $.param({
            searchLatitudeValue: self.center["lat"],
            searchLongitudeValue: self.center["lng"],
            ascPostalCode: self.zipcode,
            ascDistance: self.distance
        });

        //console.log("self.distance : ", self.distance);

        self.map.clearOverlays();

        $.ajax({
            url: self.options.queryUrl,
            data: XSSfilter(self.dataque),
            dataType: self.options.queryType,
            error: function(xhr) {
                self.reset();
                self.$repairTabmenu.find("li[data-distance=" + self.distance + "]").addClass("active").siblings("li").removeClass("active");
                self.setErrorList();
                //alert(xhr);
            },
            success: function(data) {
                self.map.process = true;
                self.markers = [];
                self.stores = [];
                if (data.length) {
                    //var curBounds = new google.maps.LatLngBounds();
                    var insetMarker = 0;
                    //list reset
                    //self.reset();
                    self.$repairTabmenu.find("li[data-distance=" + self.distance + "]").addClass("active").siblings("li").removeClass("active");

                    $.each(data, function(item) {
                        //var latlng = new google.maps.LatLng(data[item]['ascLatitudeValue'], data[item]['ascLongitudeValue']);
                        var marker_url = "/gp/content/img/support/repair/marker_" + (parseInt(item, 10) + 101).toString().substr(1) + ".png";
                        var marker_icon = new BMap.Icon(marker_url,new BMap.Size(34,46));
                        
                        var marker = new BMap.Marker(new BMap.Point(data[item]['ascLongitudeValue'], data[item]['ascLatitudeValue']), {icon:marker_icon});
                        var marker_text = "<span class='highlight'>"+data[item]['ascName']+"</span><br>"+data[item]['address']+"<br>Phone : "+data[item]['ascPhoneNo'];
                        self.map.addOverlay(marker);
                        addClickHandler(marker_text, marker);

                        var opts = {
                            width:320
                        };
                        if(item==0) {
                            self.map.setCenter(data[item]['ascLongitudeValue'], data[item]['ascLatitudeValue']);
                            var infoWindow = new BMap.InfoWindow(marker_text,opts);  
                            self.map.openInfoWindow(infoWindow,new BMap.Point(data[item]['ascLongitudeValue'], data[item]['ascLatitudeValue'])); 
                        }


                        function addClickHandler(content,marker){
                            marker.addEventListener("click",function(e){
                                openInfo(content,e);
                            });
                        }

                        function openInfo(content,e) {
                            var p = e.target;
                            var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
                            var infoWindow = new BMap.InfoWindow(content, opts);  
                            self.map.openInfoWindow(infoWindow,point);                            
                        }
                        
                    })

                    /*
                    self.zoom = self.map.getZoom();
                    // self.offsetCenter(self.markers[0].getPosition(), 180, 0, self.map); //marker 01 center

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
                                }
                            });
                            var _latlng = new google.maps.LatLng(self.map.getCenter().lat(), self.map.getCenter().lng());
                            minBounds.extend(_latlng);
                            self.map.fitBounds(minBounds);
                            self.onItem(0);
                        }, 350);
                    } else {
                        self.onItem(0);
                    }
                    if (globalConfig.isMobile) {
                        self.slickEvent(self.$repairStoreList);
                    }
                    */
                } else {
                    //self.reset();
                    self.$repairTabmenu.find("li[data-distance=" + self.distance + "]").addClass("active").siblings("li").removeClass("active");
                    self.setErrorList();
                }
                self.map.process = false;
            },
            complete: function() {
                self.searchHandle = false;
            }
        })
    }


    proto.getStore = function(force) {
        var self = this;
        clearTimeout(self.timing.queryTimeout);
        self.map.clearOverlays();
        self.timing.queryTimeout = setTimeout($.proxy(self.queryData, self), 200);
        /*if (!self.infoBox.getVisible() || force) {
            self.reset();
            self.timing.queryTimeout = setTimeout($.proxy(self.queryData, self), 200);
        }*/
    }

    proto.setCountry = function(address) {
        var self = this;
        
        self.geocoder = new BMap.Geocoder();
        //var slocation = self.openDirection ? {"location": address} : {"address": address};
        
        self.geocoder.getPoint(address, $.proxy(function(point) {
            if (point) {
                self.geoResult.locations = point;
                //aself.geoResult.viewport = results[0].geometry.viewport;
                //self.map.fitBounds(self.geoResult.viewport);
                self.center = self.map.getCenter();

                if (self.openDirection) {
                    self.offsetCenter(self.geoResult.locations, 0, 0, self.map);
                } else {
                    self.offsetCenter(self.geoResult.locations, 220, -100, self.map);
                }
                if (globalConfig.isMobile) {
                    self.offsetCenter(self.geoResult.locations, 100, -80, self.map);
                }
            }
        }, this));
        
        /*
        self.geocoder = new google.maps.Geocoder;
        var slocation = self.openDirection ? {"location": address} : {"address": address};
        self.geocoder.geocode(slocation, $.proxy(function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                self.geoResult.locations = results[0].geometry.location;
                self.geoResult.viewport = results[0].geometry.viewport;
                self.map.fitBounds(self.geoResult.viewport);
                self.center = self.map.getCenter();

                if (self.openDirection) {
                    self.offsetCenter(self.geoResult.locations, 0, 0, self.map);
                } else {
                    self.offsetCenter(self.geoResult.locations, 220, -100, self.map);
                }
                if (globalConfig.isMobile) self.offsetCenter(self.geoResult.locations, 100, -80, self.map);
            }
        }, this));
        */
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

    //moving map after markerk click
    proto.offsetCenter = function(latlng, offsetx, offsety, map) {
        /*
        var self = this;
        var scale = Math.pow(2, map.getZoom());
        
        var worldCoordinateCenter = latlng; //map.getProjection().fromLatLngToPoint(latlng);
        var pixelOffset = new BMap.Point((offsetx / scale) || 0, (offsety / scale) || 0);
        var worldCoordinateNewCenter = new BMap.Point(worldCoordinateCenter.lng - pixelOffset.x, worldCoordinateCenter.lat + pixelOffset.y);
        //var newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
        //map.panTo(newCenter);
        */
    }

    //map infoBox panel make
    proto.setStoreInfo = function(data, self, itemNum) {

        var data = data[itemNum];
        var content = "<span class='tail'></span>"
        if (typeof(data['address']) != "string") data['address'] = "";
        if (typeof(data['ascPhoneNo']) != "string") data['ascPhoneNo'] = "";
        content += "<div class='wetkit-scroller'>"
        content += "<div class='infowindow-wrap'>"
        content += "<dl>";
        content += "<dt><a href='javascript:goProviderDetail(\"" + data['ascUrl'] + "\",\"" + data['ascLatitudeValue'] + "\",\"" + data['ascLongitudeValue'] + "\",\"" + data['ascPostalCode'] + "\",\"" + this.zipcode + "\",\"" + "document.getElementById('repairProduct').value" + "\",\"" + "" + "\",\"" + data['dmsFlag'] + "\")'>" + data['ascName'] + "</a></dt>"; // warrenty value delete
        content += "<dd class='repair-address'>" + data['address'] + "</dd>";
        content += "<dd class='repair-phonenumber'> Phone : " + data['ascPhoneNo'] + "</dd>";
        content += "</dl>";
        content += "</div>"
        content += "</div>"

        self.setContent(content);
    }

    proto.searchAddress = function(e) {
        var self = this,
            address = self.$searchInput.val();

        self.geocoder = new BMap.Geocoder();

        e.preventDefault();
        
        self.geocoder.getPoint(address, $.proxy(function(point) {
            if (point) {
                self.geoResult.locations = point;
                //aself.geoResult.viewport = results[0].geometry.viewport;
                //self.map.fitBounds(self.geoResult.viewport);
             //   self.center = self.map.getCenter();
                self.map.clearOverlays();

                self.map.centerAndZoom(new BMap.Point(point["lng"],point["lat"]),self.options.zoomLevel);
                self.$resultLocation.text(address);
                //self.map.fitBounds(viewport);
                //self.afterSearch();
                

                self.searchHandle = true;
                self.afterControl = true;

                self.getStore();
                /*

                if (self.openDirection) {
                    self.offsetCenter(self.geoResult.locations, 0, 0, self.map);
                } else {
                    self.offsetCenter(self.geoResult.locations, 220, -100, self.map);
                }
                if (globalConfig.isMobile) {
                    self.offsetCenter(self.geoResult.locations, 100, -80, self.map);
                }
                */

            } else {
              //  self.reset();
                self.setErrorList();
                self.afterControl = false;
            }
        }, this));
        return
    };

    proto.afterSearch = function() {
        var self = this;
        self.map.clearOverlays();
        //self.reset();
        self.searchHandle = true;
        /*
        if (self.map.getZoom() < self.options.queryZoomLevel) {
            self.map.setZoom(self.options.queryZoomLevel);
        } else {
            self.distance = self.options.distance;
            self.getStore();
        }*/
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
                self.setStoreInfo(self.stores, self.infoBox, item);
                self.infoBox.open(self.map, self.markers[item]);
            } else if (self.activeItem == item && !self.infoBox.getVisible()) {
                self.infoBox.Content(null);
                self.offsetCenter(self.markers[item].getPosition(), 220, -100, self.map);
                self.setStoreInfo(self.stores, self.infoBox, item);
                self.infoBox.open(self.map, self.markers[item]);
            }
        }
    }

    proto.setDirectionPanel = function(e) {
        var self = this;
        e.preventDefault();
        self.directKeyword = document.getElementById("repairOrigin");
        self.directResult = document.getElementById('directionResult');
        self.autoZipcode(self.directKeyword);
        var unit = self.options.unitMetric ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL;
        var centerLocation = new google.maps.LatLng(self.options.centerLatitude, self.options.centerLongitude);

        var request = {
            origin: self.directKeyword.value,
            destination: centerLocation,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: unit
        };

        self.directionsDisplay.setMap(self.map);
        self.directionsDisplay.setPanel(self.directResult);

        self.directionService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                self.openDirection = true;
                $(self.directResult).find(".repair-error-list").hide();
                $(self.directResult).find(".suggest").show();
                self.directionsDisplay.setDirections(response);
                for (var i = 0; i < self.markers.length; i++) {
                    self.markers[i].setVisible(false);
                }
                self.infoBox.close();
            } else {
                self.directionsDisplay.setMap(null);
                self.directionsDisplay.setPanel(null);
                $(self.directResult).find(".suggest").hide();
                $("#directionResult .repair-error-list").show();
            }
            $(self.directResult).find(".suggest a").addClass("active");
        });

    }

    //query string ascPostalCode make
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
        if (typeof(data['address']) != "string") data['address'] = "";
        if (typeof(data['ascPhoneNo']) != "string") data['ascPhoneNo'] = "";
        content = "<li data-item='" + itemNum + "'>";
        content += "<div class='icon-marker store'><span>" + (itemNum + 1) + "</span></div>";
        content += "<dl>";
        content += "<dt><a href='javascript:goProviderDetail(\"" + data['ascUrl'] + "\",\"" + data['ascLatitudeValue'] + "\",\"" + data['ascLongitudeValue'] + "\",\"" + data['ascPostalCode'] + "\",\"" + self.zipcode + "\",\"" + document.getElementById('repairProduct').value + "\",\"" + "" + "\",\"" + data['dmsFlag'] + "\")' class='icon-link'><span>" + data['ascName'] + "</span> <i class='icon icon-new-window-2'></i></a></dt>"; // warrenty value delete
        content += "<dd class='repair-address'>" + data['address'] + "</dd>";
        content += "<dd class='repair-phonenumber'> Phone : " + data['ascPhoneNo'] + "</dd>";
        content += "</dl>";
        content += "</li>";
        self.$repairStoreList.append(content);
    }

    proto.setErrorList = function() {
        var self = this;
        if (self.$searchInput.val() != "") {
            // self.reset();
            var content;
            content = "<li class='error-list'>";
            content += "<div class='repair-error-list'>There is no data. Please retry to enter zip code</div>";
            content += "</li>";
            self.$repairStoreList.append(content);
        }
    }

    //center distance tap event
    proto.distanceHandler = function(e) {
        var self = this;
        var target = $(e.target);
        
        
        /*
        if (self.afterControl) {
            self.distance = target.parent().data("distance");
            self.getStore(true);
            e.preventDefault();
        }
        */
    }

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

    //mobile only map size
    proto.mapExpand = function(e) {
        var self = this;
        var tHeight = self.$repairMapArea.height();
        var wHeight = window.innerHeight;

        self.zoom = self.map.getZoom();
        e.preventDefault();
        if (tHeight == 180) {
            self.$repairMapArea.stop().animate({
                "height": "100%"
            }, 300, function() {
                $(e.target).addClass("on");
                self.$repairMapArea.parent().addClass("full");
                self.resizing();

            });
        } else {
            self.$repairMapArea.stop().animate({
                "height": 180
            }, 300, function() {
                $(e.target).removeClass("on");
                self.$repairMapArea.parent().removeClass("full");
                self.resizing();

            });
        }

    }

    //mobile only list paging
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


    //"gmap" is an instance of the google map
    ic.jquery.plugin('BaiduMaps', BaiduMaps, '.repair-service-center');

    return BaiduMaps;
})
