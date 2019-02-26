define(['global-config', 'ic/ic', 'ic/ui/module', 'mkt/find-infobox_cn', 'mkt/scrollbar'], function(globalConfig, ic, Module, InfoBox, scrollbar) {
    var proto,
        events = ic.events;

    if ($("#storeMap").length) {
        var BaiduMaps = function(el, options) {
            var self = this;
            // Call the parent constructor
            BaiduMaps.superclass.constructor.call(self, el, options);
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
            self.$startInput = $(".start-input");

            self._init();
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
            queryZoomLevel: 16,
            region: "北京",
            queryUrl: '',
            queryType: "json",
            markerUrl: '/us/content/img/wtb/',
            unitMetric: false,
            selfSearch: false,
            defaultZoom: 0,
            debug: false,
            searchHandler: true
        };

        proto._init = function() {
            var self = this;
            self.geoResult = {};
            self.markers = [];
            self.stores = [];
            self.page;
            self.center;
            self.activeItem;
            self.pointLat;
            self.pointLng;
            self.listOpen = false;
            self.openDirection = false;
            self.check = false;
            self.mapExpand = self.$storeMapWrap.hasClass("expand") ? true : false;
            self.zoomHandle = false;
            self.zoomSearch = false;
            self.dragSearch = false;
            self.stickyTop = $(".result-infor").size() > 0 ? $(".result-infor").offset().top : 0;
            self.searchPosition;

            self.markerIcon = {
                size: '',
                anchor: ''
            };

            self.infoOptions = {
                offset: globalConfig.isMobile ? new BMap.Size(50, 35) : (self.options.infoType ? new BMap.Size(-10, 35) : new BMap.Size(-5, 35)),
                boxClass: "infoWindow",
                boxStyle: {
                    width: globalConfig.isMobile ? "278px" : (self.options.infoType ? "470px" : "356px")
                },
                enableAutoPan: false
            };
            self._mapSetting();
        }

        proto._mapSetting = function() {
            var self = this;
            var mapBox = document.getElementById("storeMap");
            var ctrl_nav,
                ctrl_ove,
                ctrl_sca;

            self.keyword = document.getElementById("mapSearch");
            self.mapOptions = {
                zoom: self.options.zoomLevel,
                zoomLevel: self.options.zoomLevel,
                minZoom: self.options.zoomLevelMin,
                maxZoom: self.options.zoomLevelMax
            }

            self.map = new BMap.Map(mapBox, self.mapOptions);
            ctrl_nav = new BMap.NavigationControl({
                anchor: BMAP_ANCHOR_TOP_LEFT,
                type: BMAP_NAVIGATION_CONTROL_LARGE
            });
            if (!globalConfig.isMobile) {
                ctrl_ove = new BMap.OverviewMapControl({
                    anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
                    isOpen: true
                });
            }
            ctrl_sca = new BMap.ScaleControl({
                anchor: BMAP_ANCHOR_BOTTOM_LEFT
            });

            self.map.enableScrollWheelZoom(true);
            self.map.enableDoubleClickZoom();
            self.map.addControl(ctrl_nav);
            self.map.addControl(ctrl_ove);
            self.map.addControl(ctrl_sca);
            self._eventControl();

            self.map.addEventListener = function(event, fun) {
                if (event == "moveend" || event == "mousemove") {
                    return false;
                } else {
                    this['on' + event] = fun;
                }
            }

            //self.$whereToBuy.find("input, select").removeAttr("required");

            if (!globalConfig.isMobile) {
                self.$storeListWrap.append("<p class='search-none'>" + msgcode.findmap.noResult + "</p>");
                self.$storeListWrap.scrollbar();
                $(".buy-online").find(".styled-scroll").scrollbar();
                self.$whereToBuy.find('.select').chosen();
            }

            if (self.$searchInput.length) {
                self._autocomplete(self.keyword);
            }

            if (self.$whereToBuy.find("select[data-change=ajaxLoad]").length) {
                $("[data-change='ajaxLoad']").ajaxLoad();
            }
            self._setCountry();
        }

        proto._autocomplete = function(element) {
            var self = this;
            self.autoComplete = new BMap.Autocomplete({
                "input": element,
                "location": self.map
            });

            self.autoComplete.addEventListener("onhighlight", function(e) {
                var str = "";
                var _value = e.fromitem.value;
                var value = "";
                if (e.fromitem.index > -1) {
                    value = _value.province + _value.city + _value.district + _value.street + _value.business;
                }
                str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

                value = "";
                if (e.toitem.index > -1) {
                    _value = e.toitem.value;
                    value = _value.province + _value.city + _value.district + _value.street + _value.business;
                }
                str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
            });

            var myValue;
            self.autoComplete.addEventListener("onconfirm", function(e) { //鼠标点击下拉列表后的事件
                var _value = e.item.value;
                myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
            });
        }

        proto._setCountry = function() {
            var self = this,
                keyword;
            var option = {
                onSearchComplete: function(results) {
                    if (self.searchPosition.getStatus() == BMAP_STATUS_SUCCESS) {
                        self.map.centerAndZoom(results.getPoi(0).point, 11);
                        self.center = self.map.getCenter();
                        self.options.searchHandler = true;
                    }
                }
            };
            self.searchPosition = new BMap.LocalSearch(self.map, option);
            keyword = self.options.region;
            self.searchPosition.search(keyword);
        }

        //search event
        proto._search = function(country) {
            var self = this,
                address = self.$searchInput.val();

            self.geocoder = new BMap.Geocoder();

            self.geocoder.getPoint(address, $.proxy(function(point) {
                if (point) {
                    self.geoResult.locations = point;
                    self.center = self.map.getCenter();
                    self.map.centerAndZoom(self.geoResult.locations, self.options.zoomLevel);
                    self.geocoder.getLocation(self.geoResult.locations, $.proxy(function(location) {
                        self.pointLat = location.point.lat;
                        self.pointLng = location.point.lng;
                        self._queryData();
                    }, this));
                } else {
                    if (!self.listOpen) {
                        self._resultOpen();
                    }
                }
            }, this));
        }

        //infor inner Html

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
                    lat: self.pointLat,
                    lng: self.pointLng,
                    zipCode: self.options.country,
                    zoomLevel: self.map.getZoom()
                }),
                dataType: self.options.queryType,
                error: function(xhr, status, error) {
                    if (xhr.readyState == 0 || xhr.status == 0) {
                        return;
                    } else {
                        self._setError();
                        $("html > div.page-dimmed").remove();
                        alert(errorMsg);
                    }
                },
                success: function(data) {
                    if (data.length) {
                        var content = "";

                        $.each(data, function(item) {
                            var point = data[item].address;
                            var icons;
                            self.stores.push(data[item]);
                            if (globalConfig.isMobile) {
                                item = item + (self.page - 1) * 5;
                            } 
                            icons = new BMap.Icon("/lg4-common-biz-gp/img/map/marker_" + (parseInt(item, 10) + 101).toString().substr(1) + ".png", new BMap.Size(28, 34));
                            var pointGeo = new BMap.Geocoder();
                            pointGeo.getPoint(point, function(position) {
                                if (position) {
                                    self._addMarkers(position, icons, item);
                                }
                            });
                        })
                        setTimeout(function() {
                            self._onItem(0);
                        }, 350);
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
 
                for (var i = (self.page - 1) * 10;(i <= self.page * 10 - 1) && (i <= self.stores.length - 1); i++) {
                    var data = self.stores[i];
                    content += self._setStoreList(data, i);
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
        proto._setStoreList = function(data, i) {
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

            // save map center when dragend 
            self.map.addEventListener("dragend", function() {
                self.center = self.map.getCenter();
            });

            // search by cateogry - input box focus event

            self.$storeMapSearch.find(".search-input").on("focusin", function() {
                if (!self.mapExpand) self._mapExpand();
                $(this).parent('.input-box').addClass('active');
            }).on("focusout", function() {
                $(this).parent('.input-box').removeClass('active');
            });

            // store list item click
            self.$resultList.on("click", "li[data-item]", function() {
                var number = $(this).data("item");
                self._onItem(number);
                self.$storeListWrap.find("li[data-item]").removeClass("active").filter("[data-item=" + number + "]").addClass("active");
                if (!self.mapExpand) self._mapExpand();
            });

            // search submit
            self.$searchForm.on("submit", function(e) {
                e.preventDefault();
                self._search();
            });

            // map expand, unexpand
            self.$mapExpand.find(">a").on("click", function(e) {
                e.preventDefault();
                self._mapExpand();
            });

            // result list open, close
            self.$listOpen.on("click", function(e) {
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

            if (typeof(self.infobox) != "undefined") {
                if (self.infobox._isOpen) {
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

        proto._tabMove = function(tabNum, itemNum) {
            var self = this;

            if (typeof(tabNum) != "undefined") {
                if (!self.mapExpand) { self._mapExpand(); }
                if (!self.listOpen) { self._resultOpen(); }
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

        proto._setInfoWindow = function(item) {
            var self = this,
                content = "",
                data = self.stores[item];

            if (typeof(data['address']) != "string") data['address'] = "";
            if (typeof(data['dealerPhoneNo']) != "string") data['dealerPhoneNo'] = "";
            if (typeof(data['dealerEmail']) != "string") data['dealerEmail'] = "";
            if (typeof(data['dealerTime']) != "string") data['dealerTime'] = "";

            content += "<button type='button' class='infoWindow-close'><span class='hide'>" + msgcode.findmap.close + "</span><i class='icon icon-light-x'></i></button>"
            content += "<span class='tail'></span>";
            content += "<div class='styled-scroll scrollbar-outer minimum'>";
            content += "<div class='info-detail'>";
            content += "<div class='infowindow-wrap'>";
            content += "<div class='dealer-icon-area'>";
            if (data['useSale']) {
                content += "<i class='icon icon-dealer-sale'></i>";
            }
            if (data['useInstall']) {
                content += "<i class='icon icon-dealer-install'></i>";
            }
            if (data['useServices']){
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

            self.infobox = new BMapLib.InfoBox(self.map, content, self.infoOptions);
        }


        proto._mapExpand = function() {
            if (globalConfig.isMobile) {
                return;
            }
            var self = this;
            var $storeMapContainer = self.$storeMapBox.find(".store-map-container");

            if (!self.mapExpand) {
                $storeMapContainer.stop().animate({
                    "width": "100%"
                }, {
                    duration: 350,
                    step: function() {
                        self.$storeMapWrap.addClass("expand");

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
                    },
                    complete: function() {
                        self.mapExpand = false;
                        self.map.panTo(self.center);
                    }
                });
            }
        }

        proto._resultOpen = function() {
            if (globalConfig.isMobile) {
                return;
            }
            var self = this;
            var $storeMapContainer = self.$storeMapBox.find(".store-map-container");

            if (!self.listOpen) {
                $storeMapContainer.animate({
                    "padding-right": "40%"
                }, {
                    step: function() {
                        self.$resultList.css({"width": "40%"});
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

        proto._reset = function() {
            var self = this;
            self._onItem();
            self.stores = [];
            self.markers = [];
            self.page = 1;

            self.map.clearOverlays();

            self.$startInput.val("");
            self.openDirection = false;

            self.$storeListWrap.find(".store-list").remove();
            self.$storeListWrap.find(".search-none").remove();
            self.$resultList.find(".pagination > ol").html(null);
            self.$resultPosition.removeClass("con-over");
            self._tabMove();

            if (globalConfig.isMobile) $(".btn-load-more").css("display", "none");
        }

        //"gmap" is an instance of the google map
        ic.jquery.plugin('BaiduMaps', BaiduMaps, '.store-map-wrap');

        return BaiduMaps;
    }
})
