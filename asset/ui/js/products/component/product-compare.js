define(['global-config', 'jquery', 'ic/ic', 'ic/ui/module'], function(globalConfig, $, ic, Module) {

    'use strict';

    if ($('.product').is('div') || $('.where-to-buy').is('section')) {
        lgFilter = {
                locale: "/" + $("html").data("countrycode"),
                productId: $("html").data("product-id"),
                compare: $("html").data("compareloc").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            }
            //console.log(lgFilter.category);
        if ($('.return-to-compare-button').is('div')) {
            $('.return-to-compare-button a').attr('href', lgFilter.compare);
        }
        if ($('.where-to-buy .copy-area .back .btn').is('a')) {
            $('.where-to-buy .copy-area .back a.btn').attr('href', lgFilter.compare);
        }
    }

    var cp = {
        compareLoc: $("html").data("compareloc"),
        compareCategory: $("html").data("compare-category"),
        msgs: {},
        onCompareClick: function() {
            var e = cp.compare.pageCategory();
            var d = $(this).data("product-id");
            if (cp.compare.isin(encodeURIComponent(d), e)) {
                cp.compare.remove(encodeURIComponent(d), e);
                $('input.compare[data-product-id="' + d + '"]').prop("checked", false).next().removeClass('hide');
                $('input.compare[data-product-id="' + d + '"]').parent().next('.compare_y').addClass('hide');
            } else {
                if (cp.compare.count(e) < 10) {
                    cp.compare.add(encodeURIComponent(d), e);
                    $('input.compare[data-product-id="' + d + '"]').next().removeClass('hide');
                    $('input.compare[data-product-id="' + d + '"]').parent().next('.compare_y').removeClass('hide');
                } else {
                    //cp.showError("comparelimit")
                }
            }
            cp.updateCompareButton();
        },
        updateCompareButton: function(d) {
            var e = cp.compare.count(cp.compare.pageCategory());

            $(".compare-state").off("click").on("click", function(b) {
                b.preventDefault();
                if (cp.compare.get(cp.compareCategory).length) {
                    window.location = cp.compareLoc
                }
            }).find("span").text(e);

            $('.compare_y em').text(e);
            $('.product-grid-header .compare-state span').text("(" + e + ")");

            for (var i = 0; i < cp.compare.get(cp.compareCategory).length; i++) {
                /* 140429 modify */
                var cid = decodeURIComponent(cp.compare.get(cp.compareCategory)[i]);
                var $el = $('input.compare[data-product-id="' + cid + '"]');
                var $compareEl = $('a.remove-btn[data-product-id="' + cid + '"]');
                $el.next().addClass('hide');
                $el.parent().next('.compare_y').removeClass('hide');
                $el.prop("checked", true);
                $compareEl.show().prev().hide();
                $compareEl.addClass('onItem');
                $el.parent().next('.compare_y').find('a').attr('href', cp.compareLoc);
            }
            if (cp.compare.count(cp.compareCategory) >= 10) {
                $("input.compare:not(:checked)").attr("disabled", "disabled");
            } else {
                $("input.compare:not(:checked)").removeAttr("disabled")
                $("input.compare:checked").removeAttr("disabled")
            }

        },
        compare: {
            CARTS: "LG4_COMPARE_CART",
            pageCategory: function() {
                return cp.compareCategory
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
                this.set(c, "", -1)
            }
        },
        compareLOCK: {
            LOCK: "LG4_COMPARE_LOCK",
            pageCategory: function() {
                return cp.compareCategory
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
                this.set(c, "", -1)
            }
        }
    };


    if ($("html").data("compareloc") && encodeURIComponent($("html").data("compare-category"))) {
        $("body").on('change', '.compare-check.static input.compare', cp.onCompareClick);
    };
    return cp;
});
