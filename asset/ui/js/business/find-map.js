define(['global-config', 'ic/ic', 'ic/ui/module', 'mkt/find-infobox', 'mkt/scrollbar'], function(globalConfig, ic, Module, InfoBox, scrollbar) {
    var proto,
        events = ic.events;

    if($("#storeMap").length) {
        var GoogleMaps = function(el, options) {
            var self = this;
            // Call the parent constructor
            GoogleMaps.superclass.constructor.call(self, el, options);
            self.$whereToBuy = $(".find-map-wrap");
            self.$whereToBuyInfo = self.$whereToBuy.find(".find-map-info-wrap");
            self.$storeMapWrap = self.$whereToBuyInfo.find(".store-map-wrap");

            self.$storeMapBox = self.$storeMapWrap.find(".store-map-box");
            self.$mapExpand = self.$storeMapBox.find(".store-map-expand");
            self.$listOpen = self.$storeMapBox.find(".store-result-open");

            self.$resultList = self.$storeMapBox.find(".result-list");
            self.$positionContent = self.$resultList.find(".result-position");

            self.$searchForm = self.$whereToBuy.find("#searchForm");
            self.$searchInput = self.$searchForm.find(".search-input");
            self.$searchButton = self.$searchForm.find(".search-button");

            self.$storeMapSearch = $(".find-map-search");
            self.$searchContainer = $(".search-container");
            self.$storeListWrap = $(".store-list-wrap");
            self.$resultPosition = $(".result-position");
            self.$routeList = $(".direction-route");
            self.$countryCombo = self.$('#CountryCate');

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
            markerUrl: '/'+$("html").data("countrycode")+'/content/img/wtb/',
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
            self.mapExpand = self.$storeMapWrap.hasClass("expand") ? true : false;
            self.zoomHandle = false;
            self.zoomSearch = false;
            self.dragSearch = false;
            self.nearBy = false;
            self.stickyTop = $(".result-infor").size() > 0 ? $(".result-infor").offset().top : 0;

            var $repairCountry = $("#storeMapWrap").data("country").split("_")[0] || $("html").data("countrycode").split("_")[0];
            self.options.country = $repairCountry.length == 2 ? $repairCountry : self.$countryCombo.find(":selected").val();

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
                pixelOffset: globalConfig.isMobile ? new google.maps.Size(-142, -62) : new google.maps.Size(-195, -62),
                zIndex: 99,
                boxStyle: {
                    width: "385px"
                },
                infoBoxClearance: new google.maps.Size(1, 1),
                enableEventPropagation: false,
                boxClass: "infoWindow"
            };

            self._mapSetting();

        }

        proto._mapSetting = function() {
            var self = this;
            var mapBox = document.getElementById("storeMap");

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
                    position: google.maps.ControlPosition.LEFT_BOTTOM
                },
                streetViewControl: self.options.useController,
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.LEFT_TOP,   
                }
            }

            self.map = new google.maps.Map(mapBox, self.mapOptions);
            self.infoBox = new InfoBox(self.infoOptions);
            self.directionService = new google.maps.DirectionsService();
            self.directionsDisplay = new google.maps.DirectionsRenderer();
            self._eventControl();

            //self.$whereToBuy.find("input, select").removeAttr("required");

            if (!globalConfig.isMobile) {
                self.$storeListWrap.append("<p class='search-none'>" + msgcode.findmap.noResult + "</p>");
                self.$storeListWrap.scrollbar();
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

            if(self.$countryCombo.length){
                self.$countryCombo.change($.proxy(proto.comboEvent, self));
            }
        }

        proto._autocomplete = function(el) {
            var self = this;
            self.autoCompleteOption.componentRestrictions.country = self.options.country;
            self.autocomplete = new google.maps.places.Autocomplete(el, self.autoCompleteOption);
            google.maps.event.addListener(self.autocomplete, 'place_changed', function(){});
        }

        proto.comboEvent = function(e) {
            var self = this;
            var $selected = $(e.target).find(":selected");
            var code = $selected.val() || $selected.text();

            var slocation = {
                "address": $selected.text(),
                "componentRestrictions": {
                    country: code
                }
            }

            self.options.country = code;
            self.autoCompleteOption.componentRestrictions.country = code;

            self.geocoder.geocode(slocation, $.proxy(function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    self.geoResult.locations = results[results.length - 1].geometry.location;
                    self.geoResult.viewport = results[results.length - 1].geometry.viewport;
                    self.map.fitBounds(self.geoResult.viewport);
                    self.center = self.map.getCenter();
                }
            }, this));
            self._reset();
            $("#mapSearch").val("");
        }


        proto._setCountry = function(address) {
            var self = this;
            var countryValue;
            var slocation = {
                componentRestrictions: {
                    "country": address
                }
            };

            countryValue = typeof(self.$searchForm.find(".select[name='country']").val())  == "string";

            self.geocoder = new google.maps.Geocoder;
            self.geocoder.geocode(slocation, $.proxy(function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    self.geoResult.viewport = results[0].geometry.viewport;
                    self.map.fitBounds(self.geoResult.viewport);
                    self.center = self.map.getCenter();
     
                }
            }, self));
        }

        proto._search = function(country) {
            var self = this,
                address = "",
                geocoderOptions;
            var $searchEle = self.$searchForm.find("select, input");

            if(typeof(country) != "undefined"){
                if (self.$searchInput.length) {
                    self._autocomplete(self.searchAuto);
                }
                geocoderOptions = {
                    componentRestrictions: {
                        "country": self.options.country
                    }
                };
            }else if($searchEle.filter(".search-input").length){
                address = self.$searchInput.val();
                geocoderOptions = {
                    "address": address
                };
            }else {
                var lastIndex = self.$searchForm.find(".select").length - 1;

                self.$searchForm.find(".select").each(function(index){
                    var val = $(this).val();

                    if(val != 'all' && val != $(this).data("placeholder")){
                        if(index != lastIndex){
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
                } else {
                    self._reset();
                    if(!self.$resultList.hasClass("open")) self._resultOpen();
                    self._setError();
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

        //infor inner Html

        proto.setStoreInfo = function(data, self, itemNum) {
            var data = data[itemNum];
            var $this = this;
            var content = "<span class='tail'></span>"

            if (typeof(data['address']) != "string") data['address'] = "";
            if (typeof(data['dealerPhoneNo']) != "string") data['dealerPhoneNo'] = "";
            if (typeof(data['dealerEmail']) != "string") data['dealerEmail'] = "";
            if (typeof(data['dealerTime']) != "string") data['dealerTime'] = "";
            
            content += "<div>";
            content += "<div class='info-detail'>";
            content += "<div class='infowindow-wrap'>";
            content += "<div class='dealer-icon-area'>";
            if(data['useSale']){    
                content += "<i class='icon icon-dealer-sale'></i>";
            }
            if(data['useInstall']){    
                content += "<i class='icon icon-dealer-install'></i>";
            }
            if(data['useServices']){    
                content += "<i class='icon icon-dealer-service'></i>";
            }
            content += "</div>";
            content += "<strong class='dealer-name'>" + data['dealerName'] + "</strong>";
            content += "<div class='infowindow-content'>";
            content += "<div class='dealer-info'>";
            if(data['dealerPhoneNo'] != ""){
                content += "<p class='dealer-number'><i class='icon icon-dealer-phone' title='" + msgcode.findmap.phone + "'></i>" + data['dealerPhoneNo'] + "</p>";
            }
            if(data['address'] != ""){
                content += "<p class='dealer-address'><i class='icon icon-dealer-address' title='" + msgcode.findmap.address + "'></i>" + data['address'] + "</p>";
            }
            if(data['dealerEmail'] != ""){
                content += "<p class='dealer-email'><i class='icon icon-dealer-email' title='" + msgcode.findmap.email + "'></i>" + data['dealerEmail'] + "</p>";
            }
            content += "</div>";
            if(data['dealerTime'] != ""){
                content += "<div class='dealer-time'>" + data['dealerTime'] + "</div>";
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
            if (self.map.getZoom() < self.options.queryZoomLevel) {
                self.map.setZoom(self.options.queryZoomLevel);
            }
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
                    zoomLevel: self.map.getZoom()
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
                        var curBounds = new google.maps.LatLngBounds();
                        var insetMarker = 0;

                        $.each(data, function(item) {
                            var latlng = new google.maps.LatLng(data[item]['dealerLatitudeValue'], data[item]['dealerLongitudeValue']);
                            self.markerIcon.url = self.options.markerUrl + "marker_" + (parseInt(item, 10) + 101).toString().substr(1) + ".png";
                            var icon = $.extend(true, {}, self.markerIcon);
                            self.stores.push(data[item]);
                            self._addMarkers(latlng, icon, item);
                            curBounds.extend(latlng);
                            insetMarker += self.map.getBounds().contains(latlng) ? 1 : 0;
                        })

                        for (var i = 0; i < self.stores.length; i++) {
                            var store = self.stores[i];
                            for (var j in store) {
                                store[j] = store[j] == null ? "" : store[j];
                            }
                        }

                        if (insetMarker < Math.min(2, data.length)) {
                            var minBounds = new google.maps.LatLngBounds();

                            for (var k = 0; k < Math.min(2, data.length); k++) {
                                var _latlng = new google.maps.LatLng(data[k]['dealerLatitudeValue'], data[k]['dealerLongitudeValue']);
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
                                self._onItem(0);
                            }, 350);
                        } else {
                            setTimeout(function() {
                                self._onItem(0);
                            }, 350);
                        }
                        
                        self._pageMove();
                    } else {
                        self._setError();
                    }
                },
                complete: function() {
                    self.$storeMapBox.find(".search-before").remove();
                    
                    self.dragSearch = true;
                }
            })
        }

        proto._setError = function() {
            var self = this;
            var content = ""; 
            content += "<p class='search-none'>" + msgcode.findmap.noResult + "</p>";

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
                    self.$resultList.find(".pagination").find(".next").css("visibility", "visible");
                } else if (self.page == parseInt(self.stores.length / 10 + 1) || (self.stores.length % 10 == 0 && self.page == self.stores.length / 10)) {
                    self.$resultList.find(".pagination .next").css("visibility", "hidden");
                    self.$resultList.find(".pagination").find(".prev").css("visibility", "visible");
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

        //make list
        proto._setStoreList = function(data ,i) {
            var self = this;
            var content = "";

            if (typeof(data['address']) != "string") data['address'] = "";
            if (typeof(data['dealerPhoneNo']) != "string") data['dealerPhoneNo'] = "";
            if (typeof(data['dealerEmail']) != "string") data['dealerEmail'] = "";
            if (typeof(data['dealerTime']) != "string") data['dealerTime'] = "";

            if(!globalConfig.isMobile) {
                content += "<li data-item='" + i + "'>";
                content += "<div class='dealer-number'><span>" + (i + 1) + "</span>";
                if(data['useSale']){    
                    content += "<i class='icon icon-dealer-sale'></i>";
                }
                if(data['useInstall']){    
                    content += "<i class='icon icon-dealer-install'></i>";
                }
                if(data['useServices']){
                    content += "<i class='icon icon-dealer-service'></i>";
                }
                content += "</div>";
                content += "<dl><dt class='dealer-name'>" + data['dealerName'] + " &gt;</dt>";
                if(data['address'] != ""){    
                    content += "<dd class='dealer-address'><i class='icon icon-dealer-address' title='" + msgcode.findmap.address + "'></i>" + data['address'] + "</dd>";
                }
                content += "</dl></li>";
            } else {
                content += "<li data-item='" + i + "'><div class='store-content'>";
                content += "<div class='dealer-number'><span>" + (i + 1) + "</span>";
                if(data['useSale']){    
                    content += "<i class='icon icon-dealer-sale'></i>";
                }
                if(data['useInstall']){    
                    content += "<i class='icon icon-dealer-install'></i>";
                }
                if(data['useServices']){    
                    content += "<i class='icon icon-dealer-service'></i>";
                }
                content += "</div>";
                content += "<dl><dt class='dealer-name'>" + data['dealerName'] + "</dt>";
                if(data['dealerPhoneNo'] != ""){    
                   content += "<dd class='dealer-telnumber'><span><i class='icon icon-dealer-phone' title='" + msgcode.findmap.phone + "'></i></span>" + data['dealerPhoneNo'] + "</dd>";
                }
                if(data['address'] != ""){    
                    content += "<dd class='dealer-address'><span><i class='icon icon-dealer-address' title='" + msgcode.findmap.address + "'></i></span>" + data['address'] + "</dd>";
                }
                if(data['dealerEmail'] != ""){    
                    content += "<dd class='dealer-email'><span><i class='icon icon-dealer-email' title='" + msgcode.findmap.email + "'></i></span>" + data['dealerEmail'] + "</dd>";
                }
                content += "</dl>";
                if(data['dealerTime'] != ""){    
                    content += "<div class='dealer-time'>" + data['dealerTime'] + "</div>";
                }
                content += "<div class='btn-wrap'>";
                if(data['dealerPhoneNo'] != ""){
                    content += "<a href='tel:" + data['dealerPhoneNo'] + "' class='btn btn-call'>" + msgcode.findmap.call + "</a>";
                }
                content += "<a href='#' class='btn gray-map-open gray' data-item='" + i + "'>" + msgcode.findmap.see + "</a>";
                content += "</div></div></li>";

            }
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

            // search submit
            self.$searchForm.on("submit", function(e) {
                e.preventDefault();
                self._search();
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
            self.$storeListWrap.on("click", ".btn-close-info", function(e) {
                var infoCloseButton = $(e.target);
                var parents = infoCloseButton.parents("li[data-item]");
                var parent = infoCloseButton.parents(".store-info-content");
                parent.prev().find("i[class*='-down']").removeClass("hide");
                parent.prev().find("i[class*='-up']").addClass("hide");
                parents.removeClass("active");
                parent.stop().slideUp("fast");
            });


            $(window).on("scroll",function() {
                if(globalConfig.isMobile){
                    var scrollTop = $(this).scrollTop();
                    self.stickyEvent(scrollTop);
                }
            });
        }


        proto._openMap = function(number) {
            var self = this;
            var windowHeight = $(window).height();
            var activeItem = self.stores[number];
            var mapTitle = activeItem['dealerName'];
            var $modalWrap = $(".find-map-wrap").find(".modal-wrap");

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
                    self.markers[item].setOptions({zIndex: 9});
                    self.offsetCenter(self.markers[item].getPosition(), 0, -170, self.map);
                    self.setStoreInfo(self.stores, self.infoBox, item);
                    self.infoBox.open(self.map, self.markers[item]);
                } else if (self.activeItem == item && !self.infoBox.getVisible()) {
                    self.markers[item].setOptions({zIndex: 9});
                    self.infoBox.setContent(null);
                    self.offsetCenter(self.markers[item].getPosition(), 0, -170, self.map);
                    self.setStoreInfo(self.stores, self.infoBox, item);
                    self.infoBox.open(self.map, self.markers[item]);
                } else if (self.activeItem == item && self.infoBox.getVisible()) {
                    self.markers[item].setOptions({zIndex: 9});
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
                self._focusList(itemNum);
                this.setOptions({
                    zIndex: 9
                });
            });
            google.maps.event.addListener(marker, "mouseover", function(e) {
                this.setOptions({
                    zIndex: 9
                });
            });
        }

        proto._tabMove = function(tabNum, itemNum) {
            var self = this;

            if (typeof(tabNum) != "undefined"){
                if(!self.mapExpand){self._mapExpand();}
                if(!self.listOpen){self._resultOpen();}
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
                    "width": "100%"
                }, {
                    duration: 350,
                    step: function() {
                        self.$storeMapWrap.addClass("expand");
                        google.maps.event.trigger(self.map, "resize");
                    },
                    complete: function() {
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
                    "padding-right": "40%"
                }, {
                    step: function() {
                        google.maps.event.trigger(self.map, "resize");
                        self.$resultList.css({
                            "width": "40%"
                        })
                        self.$listOpen.css("right", "-1px").find("i").removeClass("icon-map-desktop-open").addClass("icon-map-desktop-close");
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
                        self.$listOpen.css("right", "0px").find("i").addClass("icon-map-desktop-open").removeClass("icon-map-desktop-close");
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
            self.$routeList.html(null);
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

        proto.stickyEvent = function(scrolltop) {
            var self = this;
            if ($(".result-infor").length) {
                var fixedTarget = $(".result-infor");
                var limitOffsetTop = (self.stickyTop + $(".store-list-wrap").height()) - fixedTarget.height();
                if (scrolltop > self.stickyTop && limitOffsetTop > scrolltop) {
                    fixedTarget.css({
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        zIndex: "100"
                    });
                } else {
                    fixedTarget.removeAttr("style");
                }
            }
        }


        //"gmap" is an instance of the google map
        ic.jquery.plugin('GoogleMaps', GoogleMaps, '.store-map-wrap');

        return GoogleMaps;
    }
})