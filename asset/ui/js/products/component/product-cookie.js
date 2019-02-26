/* global define */


define(['global-config', 'jquery'], function(globalConfig, $) {
    lgCommon = {
        locale: "/" + $("html").data("countrycode"),
        productId: $("html").data("product-id")
    }
    if ($('.product').is('div')) {
        var views = "LG4_RECENTLY_VIEW";

        function view_add(e) {
            var g = cArrGetViews();
            var f = g.length;
            while (f--) {
                if (g[f] == e) {
                    g.splice(f, 1)
                }
            }
            g.unshift(e);
            while (g.length > 12) {
                g.pop();
            }
            cArrSetViews(g);
        }

        function remove(h, j) {
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
        }

        function cArrGetViews() {
            var c = cGet(views);
            if (c) {
                a = c.split("|")
            } else {
                a = []
            }
            return a
        }

        function cArrSetViews(c) {
            if (c) {
                /* SMG-5098 ePrivacy Cookie : parkjeongmi modify */
                //if (typeof defaultCookie != "undefined" && defaultCookie.toUpperCase() == "OFF" && typeof ecViewFlag != "undefined" && ecViewFlag == false && (getCookies(countryCd + '_' + ecViewCate) == '' || getCookies(countryCd + '_' + ecViewCate) == 'N')) {} else {
                cSet(views, c.join("|"));
                //}
                /* //SMG-5098 ePrivacy Cookie : parkjeongmi modify */
            }
        }

        function cSet(k, j, h) {
            if (h) {
                var l = new Date();
                l.setTime(l.getTime() + (h * 24 * 60 * 60 * 1000));
                var g = "; expires=" + l.toGMTString()
            } else {
                var g = ""
            }

            document.cookie = encodeURIComponent(k) + "=" + encodeURIComponent(j) + g + "; path=/; domain=.lg.com"
        }

        function cGet(l) {
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
        }
        if (lgCommon.productId) {
            view_add(encodeURIComponent(lgCommon.productId));
        }
    }
});
