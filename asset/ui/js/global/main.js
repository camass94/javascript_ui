/**
 * The global main module.
 * @module global/global
 */
var lgFilter = {},
    isDevice,
    XSSfilter,
    msgJson,
    commonMsg,
    errorMsg,
    wtbMsg;


define(['common/preload', 'common/msg', 'ic/ic', 'ic/ui/module', 'global-config', 'jquery.cookie', 'slick-carousel', 'common/dtm', 'common/app-header', 'common/app-header-mobile', 'common/app-header-search', 'common/read-more' /* footer - seo text area */
        // ,'common/form-element' /* footer - cookie */
        , 'common/social-likes' /* share js */ , 'common/social-likes-share', 'common/popup', 'common/ecommerce' // mini cart
        , 'common/skip-to-content', 'common/three-static-tile', 'common/sign-in', 'common/beforeprint', 'browser-alert', 'common/glossary', 'common/tooltip', 'common/language', 'common/smartworld'
        /* LGEPJT-304 : 20171026 modify */
        , 'common/search-log'
        /* //LGEPJT-304 : 20171026 modify */
    ],
    function() {
        'use strict';
        lgFilter = {
            locale: "/" + $("html").data("countrycode"),
            productId: $("html").data("product-id")
        }

        var isDevice = {
            Android: function() {
                return navigator.userAgent.match(/Android/i)
            },
            BlackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i)
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i)
            },
            Opera: function() {
                return navigator.userAgent.match(/Opera Mini/i)
            },
            Windows: function() {
                return navigator.userAgent.match(/IEMobile/i)
            },
            pcDevice: function() {
                return !(isDevice.Android() || isDevice.BlackBerry() || isDevice.iOS() || isDevice.Opera() || isDevice.Windows())
            },
            any: function() {
                return (isDevice.Android() || isDevice.BlackBerry() || isDevice.iOS() || isDevice.Opera() || isDevice.Windows())
            }
        }

        if (navigator.userAgent.indexOf('Mac') != -1) {
            $("html").addClass("mac");
        }

        if (navigator.userAgent.match(/Trident\/7\./)) {
            $('html').addClass('ie11');
        }

        if (isDevice.any()) {
            if (screen.width > 767 && screen.width <= 1280) {
                $("html").addClass("tablet")
            }
        } else {
            $("html").addClass("pc");
        }

        XSSfilter = function(content) {
            return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        };

        $('.wrapper').on("click", ".sign-out", signOut);

        // page load
        var pageReady = setInterval(function() {
            if (document.readyState != "loading") {
                clearInterval(pageReady);
                $('.page-dimmed').remove();
            }
        }, 100);

        var languageSelect = $('#app-lg-lang select')
        if (languageSelect.is('select') && languageSelect.length > 0) {
            languageSelect.chosen({
                disable_search: true
            });
        }

        //Object.keys() ie8
        var countrySelect = $('.language-select-area .select');
        if (countrySelect.is('select') && countrySelect.length > 0 && $(".wrapper.support").length <= 0) {
            countrySelect.chosen({
                disable_search: true
            });
        }

        if (!Object.keys) Object.keys = function(o) {
            if (o !== Object(o))
                throw new TypeError('Object.keys called on a non-object');
            var k = [],
                p;
            for (p in o)
                if (Object.prototype.hasOwnProperty.call(o, p)) k.push(p);
            return k;
        };

        var postLink = function() {

            $(".wrapper").on('click.postLink', '[data-role="postlink"]', function(e) {
                e.preventDefault();
                var $element = $(this);
                if ($element.data("form-target") && $element.attr("rel") == "window:open") {
                    pForm = $("form[name='" + $element.data("form-target") + "']");
                    newWindow("about:blank", $element.data("w"), $element.data("h"), $element.data("form-target"));
                    pForm.attr("target", $element.data("form-target"));
                    pForm.attr("action", $element.attr('href'));
                    pForm.attr("method", "post");
                    pForm.submit();
                } else {
                    var pForm = document.createElement('form');
                    var _pValue = $element.data('postValue');

                    pForm.method = 'post';
                    pForm.action = $element.attr('href');

                    var $pForm = $(pForm);
                    for (var key in _pValue) {
                        var $input = $('<input />');
                        $input.attr({
                            type: 'hidden',
                            name: key,
                            value: XSSfilter(_pValue[key])
                        });
                        $pForm.append($input)
                    }

                    var targetName = "signinpop";
                    if ($element.attr("rel") == "window:open") {
                        newWindow({"href":pForm.action}, $element.data("w"), $element.data("h"), targetName);
                        pForm.setAttribute("target", targetName);
                    } else if ($element.attr("rel") == "window:blank") {
                        window.open("", targetName);
                        pForm.setAttribute("target", targetName);
                    }

                    $pForm.appendTo("body")[0].submit();
                    //$pForm.remove(); //add
                }
            });

        }();

        var surveyLink = function() {
            $(document).on('click.surveyLink', 'a.surveyLink', function(e) {
                e.preventDefault();

                var $element = $(this);
                var x = screen.width / 2 - $element.data("w") / 2 + screenX;
                var y = screen.height / 2 - $element.data("h") / 2 + screenY;
                var linkurl = $element.attr("href");

                if ($('body').hasClass('is-mobile')) {
                    window.open(linkurl, '');
                } else {
                    window.open(linkurl, '', 'scrollbars=yes, height=' + $element.data("h") + ',width=' + $element.data("w") + ',left=' + x + ',top=' + y);
                }
            });
        }()
        

    }, signOut = function(e) {
        var $elm = $(e.target);
        $.ajax({
            url: $elm.data('url'),
            type: 'post',
            cache: false,
            success: function(rtn) {
                if (rtn.successFlag) {
					window.location.href = $elm.data('return');
                } else {
                    alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                }
            },
            error: function(request, status, error) {
                alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            }
        })
		e.preventDefault();
    });


function newWindow(url, winW, winH, winname) {
    if (!winname || winname == "undefined") winname = "";
    var left = typeof window.screenLeft != "undefined" ? window.screenLeft : screen.left;
    var top = typeof window.screenTop != "undefined" ? window.screenTop : screen.top;
    var x = screen.width / 2 - winW / 2 + screenX;
    var y = screen.height / 2 - winH / 2 + screenY;

    if (url == "about:blank") linkurl = url;
    else linkurl = url.href;

    window.name = 'openerWindow';
    window.open(linkurl, winname, 'resizable=yes,scrollbars=yes,height=' + winH + ',width=' + winW + ',left=' + x + ',top=' + y);
}
