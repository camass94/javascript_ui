define(['global-config', 'ic/ic', 'ic/ui/module', 'slick-carousel'], function(globalConfig, ic, Module, Slick) {
    
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
        self.$searchBtn = self.$('#serviceCenterSubmit');
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
        zoomLevel: 10,
        zoomLevelMin: 2,
        zoomLevelMax: 24,
        viewport: null,
        countryRestriction: true,
        queryZoomLevel: 16,
        queryUrl: '/uk/support/_response/repair-data-baidu.json',
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
        self.options.country = $("#select-myaddr").data("myaddr") || "cn";
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
        self.markerIcon = {
            size: '', //new google.maps.Size(34, 46),
            anchor: '' //new google.maps.Point(17, 46)
        }
        self.mapSetting();
        self.$repairDetail.stop().hide();
        self.$repairTitle.find("span").removeClass("on");

        self.$repairTabmenu.on('click', "li a", function() {
            $.proxy(self.distanceHandler, self);
        });
        
        $(window).on("keyup",function(e){
            if(e.keyCode == "13"){
                if($("#repairOrigin").is(":focus")){
                    $("#getDirections").trigger('click');
                } else if ($("#serviceCenterZip").is(":focus")){
                    self.$searchBtn.trigger('click');
                }
            }
        });
        
    }
    
    proto.mapSetting = function() {
        var self = this;
        self.mapDiv = document.getElementById("repairMap");
        self.keyword = document.getElementById("serviceCenterZip");
        self.locaitonKey = document.getElementById("repairOrigin");

        self.mapOptions = {
            zoom: self.options.zoomLevel,
            zoomLevel: self.options.zoomLevel,
            minZoom: self.options.zoomLevelMin,
            maxZoom: self.options.zoomLevelMax
        }

        self.infoOptions = {
            disableAutoPan: true,
            alignBottom: true,
            pixelOffset: {
                "width" : -162,
                "height" : -54
            },
            zIndex: 99,
            boxStyle: {
                width: "320px"
            },
            infoBoxClearance: {
                "width" : 1,
                "height" : 1
            },
            enableEventPropagation: true,
            boxClass: "infoWindow"
        };
        
        self.map = new BMap.Map(self.mapDiv,self.mapOptions);
        self.map.centerAndZoom(new BMap.Point(116.4035,39.915),self.options.zoomLevel); 
        self.map.enableScrollWheelZoom(true);
        //self.map.addControl(new BMap.MapTypeControl());
        
        self.map.addEventListener = function(event, fun) {
            if (event == "moveend" || event == "mousemove") {
                return false;
            } else {
                this['on' + event] = fun;
            }
        }
        
        self.infoBox = {
            open : function(markerText, pt){
                var infoWindow = new BMap.InfoWindow(markerText, {width:320});  
                self.map.openInfoWindow(infoWindow,pt);
                //self.map.centerAndZoom(pt, 14);
                self.map.setCenter(pt);
            }
        }
        self.mapControl();
        if (!self.openDirection) {
            self.setCountry(self.options.country);
            self.autoZipcode(self.keyword);
        } else {
            self.repairOrigin = document.getElementById("repairOrigin");
            self.directionResult = document.getElementById('directionResult');
            self.$suggest = $(self.directionResult).find(".suggest");
            self.$repairErrorList =  $(self.directionResult).find(".repair-error-list");
            self.markerCss = {
                origin : {background:"url(http://api0.map.bdimg.com/images/dest_markers.png) no-repeat"},
                destination : {background:"url(http://api0.map.bdimg.com/images/dest_markers.png) no-repeat 0 -34px"}
            }
            $(self.directionResult).append("<div id='directionResultRoute' style='margin-right:10px;'/>");
            self.autoZipcode(self.locaitonKey);
            self.reset();
        }
        
    };

    //autocomplet input
    proto.autoZipcode = function(element) {
        var self = this;
        
        self.autoComplete = new BMap.Autocomplete({
            "input" : element
            ,"location" : self.map
        });
        
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
        });
        
        var myValue;
        self.autoComplete.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
            var _value = e.item.value;
            myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
        });
        
    }

    proto.mapControl = function() {
        var self = this;
        //layer toggle event
        self.$repairTitle.on('click', $.proxy(layerToggleHandler, self));
        self.$expandaleMap.on('click', $.proxy(self.mapExpand, self));
        
        //tab toggle event
        self.$repairTabmenu.find("li a").on('click', $.proxy(self.distanceHandler, self));

        self.$repairForm.off("submit").on('submit', $.proxy(self.searchAddress, self));
        self.$directionsForm.off("submit").on('submit', $.proxy(self.setDirectionPanel, self));
        
        //gps event
        self.geolocation = new BMap.Geolocation();
        self.$repairCenter.on("click", "a.repair-gps", $.proxy(function(e) {
            var self = this;
            e.preventDefault();
            self.geolocation.getCurrentPosition(function(r){
                if(this.getStatus() == BMAP_STATUS_SUCCESS){
                    var mk = new BMap.Marker(r.point);
                    self.map.addOverlay(mk);
                    self.map.panTo(r.point);
                    var point = new BMap.Point(r.point.lng,r.point.lat);
                    self.map.centerAndZoom(point,12);
                    self.geocoder.getLocation(self.geoResult.locations, $.proxy(function(location) {
                        var addComp = location.addressComponents;
                        var address = "";
                        for(var add in addComp){
                            if(add == "province") continue
                            address = addComp[add] ? addComp[add] +" " + address : address
                        }
                        if (!self.openDirection) {
                            document.getElementById("serviceCenterZip").value = address
                       } else {
                            document.getElementById("repairOrigin").value = address
                       }
                    }, this));        
                }    
            },{enableHighAccuracy: true})

        }, self))
        //layer toggle event
        
        
        
    }

    proto.queryError = function(){
        var self = this;
        self.reset();
        self.$repairTabmenu.find("li[data-distance=" + self.distance + "]").addClass("active").siblings("li").removeClass("active");
        self.setErrorList();
    }
    proto.queryData = function() {
        var self = this;
        self.dataque = self.$repairForm.serialize() + "&" + $.param({
            //searchLatitudeValue: self.map.getCenter().lat,
            //searchLongitudeValue: self.map.getCenter().lng,
            //ascPostalCode: self.location.addressComponents.city,
            ascProvince: self.location.addressComponents.province,
            ascPostalCode: self.zipcode,
            ascDistance: self.distance
        });
        self.center = self.map.getCenter();
        //self.options.queryUrl = "/uk/support/_response/repair-data-baidu.json"; //have to delete
        $.ajax({
            url: self.options.queryUrl,
            data: XSSfilter(self.dataque),
            dataType: self.options.queryType,
            error: function(xhr) {
                self.queryError();
            },
            success: function(data) {
                var dataLen = data.length;
                self.map.process = true;
                self.markers = [];
                self.stores = [];
                
                if (dataLen) {
                    //list reset
                    self.reset();
                    self.$repairTabmenu.find("li[data-distance=" + self.distance + "]").addClass("active").siblings("li").removeClass("active");
                    
                    var searchPoint = new BMap.Point(self.geoResult.locations.lng,self.geoResult.locations.lat);
                    var compareDistance = self.options.unit == "Mile" ? self.distance*1609.344 : self.distance*1000;
                    var index = 0;
                    var newData = [];
                    
                    var setPoint = function(item){ 
                        if(dataLen == item) { // LGECN-2093 : 20160811 modify
                            setMarker();
                            return;
                        }
                        if(data[item].ascLatitudeValue && data[item].ascLongitudeValue){
                            getDistanceBetween(item,data[item].ascLongitudeValue, data[item].ascLatitudeValue);
                        } else {
                            self.geocoder.getPoint(data[item]["address"], $.proxy(function(point) {//asynchronous
                                if(point){
                                    getDistanceBetween(item,point.lng,point.lat);
                                } else {
                                    index+=1;
                                    setPoint(index);
                                }
                            }, this));
                        }
                    }
                    var getDistanceBetween = function(item,lng,lat){
                        var pt = new BMap.Point(lng, lat);
                        var betweenDistance = (self.map.getDistance(searchPoint,pt)).toFixed(4);
                                                
                        if(compareDistance >= betweenDistance){ //asynchronous
                            data[item].pt = pt;
                            data[item].distance = betweenDistance;
                            newData.push(data[item]);
                        }
                        index+=1;
                        setPoint(index);
                    }
                    var setMarker = function(){
                    	if(newData.length){
                            var a,b;
                            for(var i=0; i<newData.length; i++){
                                a = newData[i];
                                for(var x=i+1; x<newData.length; x++){
                                    b = newData[x];
                                    if( parseInt(a.distance) > parseInt(b.distance)){
                                        newData[i] = b;
                                        newData[x] = a;
                                        a = newData[i]
                                    }   
                                }  
                            }
                            self.setRepairLists(newData);
                            $.each(newData,function(idx,data){
                                self.markerIcon.url = "/cn/content/img/support/repair/marker_" + (parseInt(idx, 10) + 101).toString().substr(1) + ".png";
                                self.stores.push(data);
                                var myIcon = new BMap.Icon(self.markerIcon.url, new BMap.Size(34, 46));
                                var marker = new BMap.Marker(data.pt,{icon:myIcon});
                                var markerText = "<div><a class='highlight' href='javascript:goProviderDetail(\"" + data['address'] + "\",\"" +  data['ascUrl'] + "\",\"" + data['ascLatitudeValue'] + "\",\"" + data['ascLongitudeValue'] + "\",\"" + data['ascPostalCode'] + "\",\"" + this.zipcode + "\",\"" + document.getElementById('repairProduct').value + "\",\"" + "" + "\",\"" + data['dmsFlag'] + "\")'>" + data['ascName'] + "</a>";
                                
                                markerText += "<br>"+data['address']+"<br>Phone : "+data['ascPhoneNo']+"</div>";

                                
                                self.markers.push(marker);
                                self.map.addOverlay(marker);
                                (function(idx){
                                    marker.addEventListener("click",function(e){
                                        self.infoBox.open(markerText, data.pt);
                                        self.onItem(idx);
                                        self.focusList(idx);
                                    });
                                })(idx);
                                if(idx == 0 ){
                                    self.map.centerAndZoom(data.pt, 14);
                                    self.infoBox.open(markerText, data.pt);
                                    self.onItem(idx);
                                    self.focusList(idx);
                                }
                                if(idx==newData.length-1){
                                    if (globalConfig.isMobile) {
                                        self.slickEvent(self.$repairStoreList);
                                    }
                                }
                            })
                        } else {
                            self.queryError();
                        }
                    }
                    setPoint(index);
                    
                } else {
                    self.queryError();
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
        
        self.reset();
        self.timing.queryTimeout = setTimeout($.proxy(self.queryData, self), 200);
    }

    proto.setCountry = function(address) {
        var self = this;
        self.geocoder = new BMap.Geocoder();
        
        self.geocoder.getPoint(address, $.proxy(function(point) {
            if (point) {
                self.geoResult.locations = point;
                self.center = self.map.getCenter();
                self.map.centerAndZoom(self.geoResult.locations, self.options.queryZoomLevel);

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
    }


    //moving map after markerk click
    proto.offsetCenter = function(latlng, offsetx, offsety, map) {
        var self = this;
        var scale = Math.pow(2, map.getZoom());
        
        var worldCoordinateCenter = latlng; //map.getProjection().fromLatLngToPoint(latlng);
        var pixelOffset = new BMap.Point((offsetx / scale) || 0, (offsety / scale) || 0);
        var worldCoordinateNewCenter = new BMap.Point(worldCoordinateCenter.lng - pixelOffset.x, worldCoordinateCenter.lat + pixelOffset.y);
        //var newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
        //map.panTo(newCenter);
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
        content += "<dt><a href='javascript:goProviderDetail(\"" + data['address'] + "\",\"" + data['ascUrl'] + "\",\"" + data['ascLatitudeValue'] + "\",\"" + data['ascLongitudeValue'] + "\",\"" + data['ascPostalCode'] + "\",\"" + this.zipcode + "\",\"" + document.getElementById('repairProduct').value + "\",\"" + "" + "\",\"" + data['dmsFlag'] + "\")'>" + data['ascName'] + "</a></dt>"; // warrenty value delete
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
        e.preventDefault();
        
        self.geocoder = new BMap.Geocoder();
        
        //console.log("address : ", address);
        //console.log("self.geocoder : ",self.geocoder);
        
        self.geocoder.getPoint(address, $.proxy(function(point) {
            if (point) {
                self.geoResult.locations = point;
                self.center = self.map.getCenter();
                self.map.centerAndZoom(self.geoResult.locations, self.options.zoomLevel);
                self.geocoder.getLocation(self.geoResult.locations, $.proxy(function(location) {
                    self.location = location;
                    self.$resultLocation.text(address);
                    self.afterSearch();
                    self.afterControl = true;
                    
                }, this));
                //console.log("self.geoResult.locations 2 : ", self.geoResult.locations);
            } else {
                self.reset();
                self.setErrorList();
                self.afterControl = false;
            }
        }, this));
    };

    proto.afterSearch = function() {
        var self = this;
        self.reset();
        self.searchHandle = true;
        
        if (self.map.getZoom() < self.options.queryZoomLevel) {
            self.map.setZoom(self.options.queryZoomLevel);
        } else {
            self.distance = self.options.distance;
            self.getStore();
        }
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
                self.activeItem = null;
            } else if (self.activeItem != item) {
                self.activeItem = item;
                if (!globalConfig.isMobile) {
                    self.offsetCenter(self.markers[item].getPosition(), 220, -100, self.map);
                } else {
                    self.offsetCenter(self.markers[item].getPosition(), 0, -100, self.map);
                }
                self.infoBox.open(self.map, self.markers[item]);
            } else if (self.activeItem) {
                self.offsetCenter(self.markers[item].getPosition(), 220, -100, self.map);
            }
        }
        
    }

    proto.setDirectionPanel = function(e) {
        var self = this;
        e.preventDefault();

        var options = {
            renderOptions: {
                map: self.map,
                panel: "directionResultRoute",
                autoViewport: true
            },
            onSearchComplete: function(results){
                if (driving.getStatus() === 0){
                    self.$suggest.show();
                    self.$repairErrorList.hide();
                    setTimeout(function() {
                        self.$repairMapArea.find(".BMap_Marker.BMap_noprint").css(self.markerCss.origin);
                        self.$repairMapArea.find(".BMap_Marker.BMap_noprint").last().css(self.markerCss.destination);
                    },100);
                } else {
                    self.reset();
                    self.$suggest.hide();
                    self.$repairErrorList.show();
                }
            }
        }
        
        var driving = new BMap.DrivingRoute(self.map, options);
        self.geocoder.getPoint(self.repairOrigin.value,function(point){
            if(point){
                self.geocoder.getPoint(self.options.centerAddr,function(point2){
                    if(point2){
                        self.map.clearOverlays();
                        driving.search(point, point2);
                    } else{
                        self.reset();
                        self.$suggest.hide();
                        self.$repairErrorList.show();
                    }
                })
            } else{
                self.reset();
                self.$suggest.hide();
                self.$repairErrorList.show();
            }
        })
        
        //self.map.clearOverlays();
        //var driving = new BMap.DrivingRoute(self.map, options);
        //driving.search(request.origin, request.destination);
        
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

    proto.setRepairList = function(data,i) {
        var self = this;
        var content = "";
        
        if (typeof(data['address']) != "string") data['address'] = "";
        if (typeof(data['ascPhoneNo']) != "string") data['ascPhoneNo'] = "";
        content += "<li data-item='" + i + "'>";
        content += "<div class='icon-marker store'><span>" + (i + 1) + "</span></div>";
        content += "<dl>";
        content += "<dt><a href='javascript:goProviderDetail(\"" + data['address'] + "\",\"" + data['ascUrl'] + "\",\"" + data['ascLatitudeValue'] + "\",\"" + data['ascLongitudeValue'] + "\",\"" + data['ascPostalCode'] + "\",\"" + self.zipcode + "\",\"" + document.getElementById('repairProduct').value + "\",\"" + "" + "\",\"" + data['dmsFlag'] + "\")' class='icon-link'><span>" + data['ascName'] + "</span> <i class='icon icon-new-window-2'></i></a></dt>"; // warrenty value delete
        content += "<dd class='repair-address'>" + data['address'] + "</dd>";
        content += "<dd class='repair-phonenumber'> Phone : " + data['ascPhoneNo'] + "</dd>";
        content += "</dl>";
        content += "</li>";
        self.$repairStoreList.append(content);
    }
    
    proto.setRepairLists = function(datas) {
        var self = this;
        var content = "";
        
        for(var i=0; i<datas.length; i++){
            var data = datas[i];
            if (typeof(data['address']) != "string") data['address'] = "";
            if (typeof(data['ascPhoneNo']) != "string") data['ascPhoneNo'] = "";
            content += "<li data-item='" + i + "'>";
            content += "<div class='icon-marker store'><span>" + (i + 1) + "</span></div>";
            content += "<dl>";
            content += "<dt><a href='javascript:goProviderDetail(\"" + data['address'] + "\",\"" + data['ascUrl'] + "\",\"" + data['ascLatitudeValue'] + "\",\"" + data['ascLongitudeValue'] + "\",\"" + data['ascPostalCode'] + "\",\"" + self.zipcode + "\",\"" + document.getElementById('repairProduct').value + "\",\"" + "" + "\",\"" + data['dmsFlag'] + "\")' class='icon-link'><span>" + data['ascName'] + "</span> <i class='icon icon-new-window-2'></i></a></dt>"; // warrenty value delete
            content += "<dd class='repair-address'>" + data['address'] + "</dd>";
            content += "<dd class='repair-phonenumber'> 电话号码 : " + data['ascPhoneNo'] + "</dd>";
            content += "</dl>";
            content += "</li>";
        }
        
        
        self.$repairStoreList.html(content);
    }

    proto.setErrorList = function() {
        var self = this;
        //console.log("error");
        if (self.$searchInput.val() != "") {
            // self.reset();
            var content;
            content = "<li class='error-list'>";
            content += "<div class='repair-error-list'>没有数据，请重新输入地址</div>";
            content += "</li>";
            self.$repairStoreList.html(content);
        }
    }

    //center distance tap event
    proto.distanceHandler = function(e) {
        var self = this;
        var target = $(e.target);
        
        
        if (self.afterControl) {
            self.distance = target.parent().data("distance");
            self.getStore(true);
            e.preventDefault();
        }
    }

    proto.reset = function() {
        var self = this;

        if (!self.openDirection) {
            self.markers = [];
            self.map.clearOverlays();

            self.onItem();
            self.activeItem = null;

            self.$repairStoreList.removeClass().html(null);
            self.$repairDetail.stop().show();
            self.$repairTitle.find("span").addClass("on");
            self.$repairDetail.find("li").removeClass("active");

            if (globalConfig.isMobile) self.$repairStoreList.next(".pagination").hide();
        } else {
            self.map.clearOverlays();
            self.setCountry(self.options.centerAddr);
            self.geocoder.getPoint(self.options.centerAddr, $.proxy(function (point) {
                self.map.centerAndZoom(point, 14);
                var myIcon = new BMap.Icon("/cn/content/img/support/repair/marker_default.png", new BMap.Size(25, 37));
                var marker = new BMap.Marker(point,{icon:myIcon});
                self.map.addOverlay(marker); // 将标注添加到地图中
            }, this));
        }        
    } 

    proto.resizing = function() {
        var self = this;
        self.center = self.map.getCenter();
        //google.maps.event.trigger(self.map, "resize");
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
