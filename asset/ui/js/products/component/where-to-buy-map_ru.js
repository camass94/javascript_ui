define(['global-config', 'ic/ic', 'ic/ui/module', 'mkt/scrollbar', 'chosen'], function(globalConfig, ic, Module, scrollbar) {
    var proto,
        events = ic.events;

    var YandexMaps = function(el, options) {
        var self = this;
        // Call the parent constructor
        YandexMaps.superclass.constructor.call(self, el, options);
        self.$whereToBuy = $(".where-to-buy");
        self.$searchForm = self.$whereToBuy.find("#searchForm");
        self.$storeMapSearch = self.$searchForm.find(".store-map-search");

        self.$whereToBuyInfo = self.$whereToBuy.find(".where-to-buy-info");
        self.$storeMapWrap = self.$whereToBuyInfo.find(".store-map-wrap");
        self.$storeMapBox = self.$storeMapWrap.find(".store-map-box");
        self.$storeMapContainer = self.$storeMapBox.find(".store-map-container");
        self.$storeMap = self.$storeMapContainer.find(".store-map");
        self.$listOpen = self.$storeMap.find(".store-result-open");

        self._init();
    };

    // Inherit from Module
    ic.util.inherits(YandexMaps, Module);

    // Alias the prototype for less typing and better minification
    proto = YandexMaps.prototype;
    proto._defaults = {
        zoomLevel: 5,
        zoomLevelMin: 2,
        zoomLevelMax: 24,
        queryZoomLevel: 10,
        queryUrl: '/uk/support/_response/wtb-data.json',
        query: ''
    };

    proto._init = function() {
        var self = this;
        self.markers = [];
        self.stores = [];
        self.page;
        self.center;
        self.activeItem;
        self.listOpen = true;
        self.markerOptions = {
            iconLayout:'default#imageWithContent',
            iconImageHref: '/ru/content/img/wtb/marker_bg.png',
            iconImageSize: [28, 34],
            iconImageOffset: [-16, -27],
            zIndexHover: 700,
            visible:true,
            balloonCloseButton:true,
            balloonOffset: globalConfig.isMobile ? [-139, -280] : [-179, -235],
            balloonLayout: "",
            balloonContentLayout: ""
        };
        self._mapSetting();
    }
    proto._mapSetting = function() {
        var self = this;
        self.mapBox = document.getElementById("storeMap");
        ymaps.ready(init);

        function init () {
            var balloonLayout;

            self.map = new ymaps.Map(self.mapBox, {
                    center: [55.75131,37.584613], 
                    zoom: 15,
                    controls: ['zoomControl', 'fullscreenControl']
            });

            balloonLayout = ymaps.templateLayoutFactory.createClass(
                "<div class='infoWindow'>"+
                "<button type='button' id='infoWindowClose'><span class='hide'>layer close</span><i class='icon icon-light-x'></i></button>"+
                "<span class='tail'></span>"+
                "<div class='styled-scroll scrollbar-outer minimum'>"+
                "<div class='info-detail'>"+
                "<div class='infowindow-wrap'>"+
                "$[[options.contentLayout]]"+
                "</div></div></div></div>", {
                    build: function(){
                        this.constructor.superclass.build.call(this);
                        this._$element = $(".infoWindow", this.getParentElement());
                        this._$element.find("#infoWindowClose").on("click", $.proxy(this.onCloseClick, this));
                        this._$element.find(".styled-scroll").scrollbar();
                    },
                    onCloseClick: function() {
                        this.events.fire('userclose');
                    }
                }
            )
            self.page = 1;
            self.center = self.map.getCenter();
            self.markerOptions.balloonLayout = balloonLayout;
            self._pageAjax();
            self._eventControl();
            self.$storeMapContainer.find(".styled-scroll").scrollbar();
        }
    }
    proto._eventControl = function() {
        var self = this;

        /* PC */
        /* list open, close */
        self.$listOpen.on("click", function(e){
            e.preventDefault();
            self._resultOpen();
        });

        /* store list click */
        self.$storeMapContainer.on("click", ".store-list > li", function(){
            var item = $(this).data("item");

            self.map.panTo(self.markers[item].geometry.getCoordinates());
            
            if(!self.markers[item].balloon.isOpen()){
                self.markers[item].balloon.open()
            }
        });

        /* paging */
        self.$storeMapBox.on("click", ".pagination > ol a", function(e) {
            e.preventDefault();
            var url = $(this).data("url");
            self.page = $(this).data("page");
            self._pageAjax(url);
        });
        /* paging */
        self.$storeMapBox.on("click", ".pagination > a", function(e) {
            e.preventDefault();
            var url = $(this).data("url");        
            if ($(this).hasClass("prev")) {
                self.page--;
            } else if ($(this).hasClass("next")) {
                self.page++;
            }
            self._pageAjax(url);
        });

        /* MOBILE */
        /* map open */
        self.$storeMapBox.on("click", ".gray-map-open", function(e){
            e.preventDefault();
            var $this = $(this);
            var item = $this.parents("li[data-item]").data("item");
            self._openMap(item);
        });
    
        /* mobile paging */
        self.$storeMapBox.on("click", ".btn-load-more", function(e){
            e.preventDefault();
            var url = $(this).data("url");
            self.page++;
            self._pageAjax(url);
        });

    }
    proto._openMap = function(number) {
        var self = this;
        var windowHeight = $(window).height();
        var activeItem = self.stores[number];
        var mapTitle = activeItem['wtbName'];
        var $modalWrap = self.$whereToBuy.find(".modal-wrap");

        $modalWrap.find(".map-title").html(mapTitle);
        $modalWrap.css({
            "display": "block",
            "height": windowHeight
        });

        var mapHeight = 39 + $modalWrap.find(".map-title").height();

        $modalWrap.find(".store-map-view").css({
            "height": "calc(100% - " + mapHeight + "px)"
        });
        $("body").css({
            "height": windowHeight,
            "overflow": "hidden"
        });

        for (var i = 0; i < self.markers.length; i++) {
            if (self.markers[i].options.get("visible")) {
                self.markers[i].options.set("visible",false);
            }
            self.markers[number].options.set("visible",true);
        }

        if(!self.markers[number].balloon.isOpen()){
            self.markers[number].balloon.open()
        }

        self.map.setCenter(self.markers[number].geometry.getCoordinates());

        if (self.map.getZoom() < self.options.queryZoomLevel) {
            self.map.setZoom(self.options.queryZoomLevel);
        }

        self.map.container.fitToViewport();

        $(window).resize(function() {
            var windowHeight = $(window).height();
            var mapHeight = 39 + $(".map-title").height();

            $modalWrap.css({
                "height": windowHeight
            });
            $modalWrap.find(".store-map-view").css({
                "height": "calc(100% - " + mapHeight + "px)"
            })

            self.map.container.fitToViewport();
        });

        $modalWrap.find(".btn-close").on("click", function(e){
            e.preventDefault();
            $modalWrap.css("display", "none");
            $("body").css({
                "height": "auto",
                "overflow": "visible"
            });
        });
    }
    proto._pageAjax = function(url) {
        var self = this;
        var target = self.$storeMapBox.find(".store-list").length ? ".store-list" : ".store-box";

        $.ajax({
            type: "GET",
            url: typeof(url) != "undefined" ? url : self.options.query,
            data: {page: self.page},
            error: function(xhr) {
                $("html > div.page-dimmed").remove();
                alert(errorMsg);
            },
            success: function(con) {
                var $html = $(con);

                if(!globalConfig.isMobile) {
                    self.$storeMapContainer.find(".result-list").remove();
                    $html.appendTo(self.$storeMapContainer);
                    self.$storeMapContainer.find(".styled-scroll").scrollbar();
                } else {
                    var storeList, countLoad;
                    var targetHtml = self.$storeMapBox.find(".store-list").length ? $html.contents().filter(target).html() : $html;
                    $(targetHtml).appendTo($(target));
                    storeList = self.$storeMapBox.find(".store-list");
                    countLoad = storeList.data("total-count") - storeList.find("> li").length;
                    if (countLoad == 0) self.$storeMapBox.find(".btn-load-more").hide();
                }
                self._queryData();
            }
        });
    }
    proto._queryData = function() {
        var self = this;

        self._mapReset();

        $.ajax({
            url: self.options.queryUrl,
            data: {page: self.page},
            dataType: "json",
            error: function(xhr) {
                $("html > div.page-dimmed").remove();
                alert(errorMsg);
            },
            success: function(data) {
                if(data.length) {
                    self._setStoreInfo();
                    $.each(data, function(item) {
                        var point = new ymaps.geometry.Point([data[item].wtbLatitudeValue, data[item].wtbLongitudeValue]); 
                        self.stores.push(data[item]);
                        self._addMarkers(point, data[item]);
                    });
                }
            }
        });
    }
    proto._addMarkers = function(point, data) {
        var self = this;
        var marker = new ymaps.Placemark(point, {
            iconContent: "<span class='marker-number'>" + (self.markers.length + 1) + "</span>",
            name: data.wtbName,
            address: data.address,
            time: data.wtbTime,
            phone: data.wtbPhoneNo
        }, self.markerOptions);

        self.map.geoObjects.add(marker);
        self.markers.push(marker);
        marker.events.add('click', function() {
            self.map.panTo(marker.geometry.getCoordinates());
        });
    }
    proto._setStoreInfo = function() {
        var self = this;
        var balloonContent = ymaps.templateLayoutFactory.createClass(
            "<strong class='store-name'>{{ properties.name }}</strong>"+
            "<div class='infowindow-content'>"+
            "<div class='info-inner'>"+
            "<p class='store-address'>{{ properties.address }}</p>"+
            "<p class='store-phonenumber'>Телефон : <span>{{ properties.phone }}</span></p>" +
            "<p class='store-open-time'>Время работы : <span>{{ properties.time }}</span></p>"+
            "</div></div>"
        )
        self.markerOptions.balloonContentLayout = balloonContent;
    }
    proto._resultOpen = function() {
        var self = this;
        var $resultList = self.$storeMapBox.find(".result-list");

        if (!self.listOpen) {
            self.$storeMapContainer.animate({
                "padding-right": "320px"
            }, {
                step: function() {
                    self.map.container.fitToViewport();
                    self.$listOpen.css("right", "-1px").find("i").removeClass("icon-triangle").addClass("icon-triangle-reverse");
                    //$resultList.css({"width": "320px"})
                },
                complete: function() {
                    self.map.container.fitToViewport();
                    self.listOpen = true;
                    $resultList.addClass("open");
                }
            });
        } else {
            self.$storeMapContainer.stop().animate({
                "padding-right": "0px"
            }, {
                step: function() {
                    self.map.container.fitToViewport();
                    self.$listOpen.css("right", "0px").find("i").addClass("icon-triangle").removeClass("icon-triangle-reverse");
                    $resultList.removeClass("open");
                },
                complete: function() {
                    self.map.container.fitToViewport();
                    self.listOpen = false;
                    //$resultList.css({"width": "0px"})
                }
            });
        }
    }
    proto._mapReset = function() {
        var self = this;
        
        self.markerOptions.balloonContentLayout = "";

        if(!globalConfig.isMobile){
            for(var i=0; i<self.markers.length; i++){
                self.markers[i].setParent(null);
            }
            self.markers = [];
            self.stores = [];
        }
    }

    ic.jquery.plugin('YandexMaps', YandexMaps, '.store-map-wrap');

    return YandexMaps;
})
