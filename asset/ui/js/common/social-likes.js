//define([], function() {
/**
 * Social Likes
 * http://sapegin.github.com/social-likes
 *
 * Sharing buttons for Russian and worldwide social networks.
 *
 * @requires jQuery
 * @author Artem Sapegin
 * @copyright 2014 Artem Sapegin (sapegin.me)
 * @license MIT
 */

/*global define:false, socialLikesButtons:false */

(function(factory) { // Try to register as an anonymous AMD module
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function($, undefined) {

    'use strict';
    
    /* LGEHK-1076 : 20180713 add */
    var lgFilter = {
        locale: "/" + $("html").data("countrycode")
    }
    /*//LGEHK-1076 : 20180713 add */
    
    var prefix = 'social-likes';
    var classPrefix = prefix + '__';
    var openClass = prefix + '_opened';
    var protocol = location.protocol === 'https:' ? 'https:' : 'http:';
    var isHttps = protocol === 'https:';

    /**
     * Buttons
     */
    var services = {
        facebook: {
            counterUrl: "https://graph.facebook.com/fql?q=SELECT+total_count+FROM+link_stat+WHERE+url%3D%22{url}%22&callback=?",
            convertNumber: function(e) {
                return e.data[0].total_count
            },
            popupUrl: "https://www.facebook.com/sharer/sharer.php?u={url}",
            popupWidth: 600,
            popupHeight: 500
        },
        facebookLike: {
            iframeUse: true,
            iframeUrl: 'https://www.facebook.com/plugins/like.php',
            iframeSet: {
                src: {
                    href: '{url}',
                    send: false,
                    layout: 'button',
                    show_faces: false,
                    action: 'like',
                    colorscheme: 'light',
                    height: 23
                },
                style: {
                    height: '20px'
                }
            }
        },
        twitter: {
            counterUrl: 'https://cdn.syndication.twimg.com/widgets/followbutton/info.json?url={url}',
            convertNumber: function(data) {
                return data.count;
            },
            popupUrl: 'https://twitter.com/intent/tweet?url={shorturl}&text={title}&counturl={url}',
            //popupUrl: 'https://twitter.com/intent/tweet?url={shorturl}&text={title}',
            popupWidth: 600,
            popupHeight: 450,
            click: function() {
                // Add colon to improve readability
                // alert(this.options.shorturl);
                if (!/[\.\?:\-–—]\s*$/.test(this.options.title)) this.options.title += ':';
                return true;
            }
        },
        mailru: {
            counterUrl: protocol + '//connect.mail.ru/share_count?url_list={url}&callback=1&func=?',
            convertNumber: function(data) {
                for (var url in data) {
                    if (data.hasOwnProperty(url)) {
                        return data[url].shares;
                    }
                }
            },
            popupUrl: protocol + '//connect.mail.ru/share?share_url={url}&title={title}',
            popupWidth: 550,
            popupHeight: 360
        },
        /*vkontakte: {
            counterUrl: 'https://vk.com/share.php?act=count&url={url}&index={index}',
            counter: function(jsonUrl, deferred) {
                var options = services.vkontakte;
                if (!options._) {
                    options._ = [];
                    if (!window.VK) window.VK = {};
                    window.VK.Share = {
                        count: function(idx, number) {
                            options._[idx].resolve(number);
                        }
                    };
                }

                var index = options._.length;
                options._.push(deferred);
                $.getScript(makeUrl(jsonUrl, {
                        index: index
                    }))
                    .fail(deferred.reject);
            },
            popupUrl: protocol + '//vk.com/share.php?url={url}&title={title}',
            popupWidth: 550,
            popupHeight: 330
        },*/
        linkedin: {
            scriptUse: true,
            direction: 'right',
            scriptCon: function(widget) {
                var script;
                script = '<script src="//platform.linkedin.com/in.js" type="text/javascript"> lang: en_US</script>';

                if (this.direction == 'right') {
                    script += '<script type="IN/Share" data-url="' + this.paramUrl + '" data-counter="' + this.direction + '"></script>';
                } else {
                    script += '<script type="IN/Share" data-url="' + this.paramUrl + '"></script>';
                }
                
                widget.append(script);
            }
        },
        /*odnoklassniki: {
            // HTTPS not supported
            counterUrl: isHttps ? undefined : 'http://connect.ok.ru/dk?st.cmd=extLike&ref={url}&uid={index}',
            counter: function(jsonUrl, deferred) {
                var options = services.odnoklassniki;
                if (!options._) {
                    options._ = [];
                    if (!window.ODKL) window.ODKL = {};
                    window.ODKL.updateCount = function(idx, number) {
                        options._[idx].resolve(number);
                    };
                }

                var index = options._.length;
                options._.push(deferred);
                $.getScript(makeUrl(jsonUrl, {
                        index: index
                    }))
                    .fail(deferred.reject);
            },
            popupUrl: 'http://connect.ok.ru/dk?st.cmd=WidgetSharePreview&service=odnoklassniki&st.shareUrl={url}',
            popupWidth: 550,
            popupHeight: 360
        },*/
        odnoklassniki: {
            callback: true,
            renderHtml: function(widget, d, id, did, st) {
                var div = $('<div>', {
                    'id': 'ok_shareWidget'
                });
                widget.append(div);
                var js = d.createElement("script");
                js.src = "https://connect.ok.ru/connect.js";
                js.onload = js.onreadystatechange = function() {
                    if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
                        if (!this.executed) {
                            this.executed = true;
                            setTimeout(function() {
                                OK.CONNECT.insertShareWidget(id, did, st);
                            }, 0);
                        }
                    }
                };
                d.documentElement.appendChild(js);
            }
        },
        plusone: {
            // HTTPS not supported yet: http://clubs.ya.ru/share/1499
            counterUrl: isHttps ? undefined : 'http://share.yandex.ru/gpp.xml?url={url}',
            counter: function(jsonUrl, deferred) {
                var options = services.plusone;
                if (options._) {
                    // Reject all counters except the first because Yandex Share counter doesn’t return URL
                    deferred.reject();
                    return;
                }

                if (!window.services) window.services = {};
                window.services.gplus = {
                    cb: function(number) {
                        if (typeof number === 'string') {
                            number = number.replace(/\D/g, '');
                        }
                        options._.resolve(parseInt(number, 10));
                    }
                };

                options._ = deferred;
                // $.getScript(makeUrl(jsonUrl))
                //  .fail(deferred.reject);
                $.ajax({
                    url: makeUrl(jsonUrl),
                    dataType: 'jsonp',
                    success: function(number){
                        if (typeof number === 'string') {
                            number = number.replace(/\D/g, '');
                        }
                        options._.resolve(parseInt(number, 10));
                    }
                })
                .fail(deferred.reject);
            },
            popupUrl: 'https://plus.google.com/share?url={url}',
            popupWidth: 700,
            popupHeight: 500
        },
        pinterest: {
            counterUrl: protocol + '//api.pinterest.com/v1/urls/count.json?url={url}&callback=?',
            convertNumber: function(data) {
                return data.count;
            },
            popupUrl: protocol + '//pinterest.com/pin/create/button/?url={url}&description={title}',
            popupWidth: 630,
            popupHeight: 270
        },
        /*
        linkedin: {
            counterUrl: 'http://www.linkedin.com/countserv/count/share?url={url}',
            counter: function(jsonUrl, deferred) {
                var options = socialLikesButtons.linkedin;
                if (!options._) {
                    options._ = {};
                    if (!window.IN) window.IN = {
                        Tags: {}
                    };
                    window.IN.Tags.Share = {
                        handleCount: function(params) {
                            var jsonUrl = options.counterUrl.replace(/{url}/g, encodeURIComponent(params.url));
                            options._[jsonUrl].resolve(params.count);
                        }
                    };
                }
                options._[jsonUrl] = deferred;
                $.getScript(jsonUrl)
                    .fail(deferred.reject);
            },
            popupUrl: 'http://www.linkedin.com/shareArticle?mini=false&url={url}&title={title}',
            popupWidth: 650,
            popupHeight: 500
        },*/
        /*qzone: {
            popupUrl: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={url}&title={title}',
            counter: false,
            buttonImage: true,
            popupWidth: 650,
            popupHeight: 500
        },*/
        /*weibo: {
            iframeUse: true,
            iframeUrl: 'http://hits.sinajs.cn/A1/weiboshare.html',
            iframeSet: {
                src: {
                    url: '{url}',
                    type: '1',
                    count: '',
                    appkey: '',
                    pic: '',
                    ralateUid: '',
                    rnd: new Date().valueOf()
                },
                style: {
                    width: '32px',
                    height: '32px'
                }
            }
        },*/
        qzone: {
            iframeUse: true,
            /* LGEGMO-4062 */
            iframeUrl: 'https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_likeurl',
            /*//LGEGMO-4062 */
            iframeSet: {
                src: {
                    url: '{url}',
                    showcount: '1',
                    /*����?������??,?�ƣ�'1'����?�ƣ�'0' */
                    desc: '',
                    /*��?��������(ʦ?)*/
                    summary: '',
                    /*��������(ʦ?)*/
                    title: '',
                    /*����??(ʦ?)*/
                    site: '',
                    /*����?�� ����???(ʦ?)*/
                    pics: '',
                    /*����?������?(ʦ?)*/
                    style: '202'
                },
                style: {
                    width: '58px',
                    height: '24px'
                }
            }
        },
        weibo: {
            iframeUse: true,
            //iframeUrl: 'http://service.weibo.com/staticjs/weiboshare.html',
            iframeUrl: lgFilter.locale +'/wieboshare.htm', //LGEHK-1076 : 20180713 modify
            iframeSet: {
                src: {
                    url: '{url}',
                    type: 2,
                    language: 'zh_cn',
                    searchPic: 'true'
                },
                style: {
                    width: '60px',
                    height: '24px'
                }
            }
        },
        /*delicious: {
            popupUrl: 'https://delicious.com/post?url={url}&title={title}',
            counter: false,
            popupWidth: 650,
            popupHeight: 500
        },*/
        delicious: {
            callback: true,
            paramUrl: '',
            renderHtml: function(widget) {
                var url2 = "https://delicious.com/save?v=5&provider={your-company}&noui&jump=close&url=" + encodeURIComponent(this.paramUrl) + "&title=" + encodeURIComponent(document.title);
                var link = $("<a href='#' />");
                var img = $('<img>', {
                    src: "/lg4-common-gp/img/global/share/delicious-sns.png",
                    height: "38",
                    width: "38",
                    alt: "Delicious"
                });

                link.on('click', function(e) {
                    e.preventDefault();
                    window.open(url2, 'delicious', 'toolbar=no,width=550,height=550');
                });

                link.append(img);
                widget.append(link);
            }
        },
        /*vk: {
            scriptUse: true,
            direction: 'right',
            scriptCon: function(widget) {
                var script;
                script = '<script type="text/javascript" src="http://vk.com/js/api/share.js?93" charset="windows-1251"></script>';
                script += '<script type="text/javascript">;
                script += 'VK.Share.button(false,{type: "round", text: "Share", eng: 1});';
                script += '</script>';
                widget.append(script);
            }
        }*/
        vk: {
            scriptUse: true,
            scriptCon: function(widget) {
                var div = $('<div>', {
                    'id': 'vk_like'
                });
                widget.append(div);
                $.getScript("https://vkontakte.ru/js/api/openapi.js", function() {
                    VK.init({
                        apiId: 3267939,
                        onlyWidgets: true
                    });
                    VK.Widgets.Like('vk_like', {
                        type: "button",
                        height: 20
                    });
                });
            }
        }
    };

    /**
     * Counters manager
     */
    var counters = {
        promises: {},
        fetch: function(service, url, extraOptions) {
            if (!counters.promises[service]) counters.promises[service] = {};
            var servicePromises = counters.promises[service];

            if (!extraOptions.forceUpdate && servicePromises[url]) {
                return servicePromises[url];
            } else {
                var options = $.extend({}, services[service], extraOptions);
                var deferred = $.Deferred();
                var jsonUrl = options.counterUrl && makeUrl(options.counterUrl, {
                    url: url
                });

                if (jsonUrl && $.isFunction(options.counter)) {
                    options.counter(jsonUrl, deferred);
                } else if (options.counterUrl) {
                    $.getJSON(jsonUrl)
                    .done(function(data) {
                        try {
                            var number = data;
                            if ($.isFunction(options.convertNumber)) {
                                number = options.convertNumber(data);
                                //console.log(number);
                            }
                            deferred.resolve(number);
                        } catch (e) {
                            deferred.reject();
                        }
                    })
                    .fail(deferred.reject);
                } else {
                    deferred.reject();
                }

                servicePromises[url] = deferred.promise();
                return servicePromises[url];
            }
        }
    };


    /**
     * jQuery plugin
     */
    $.fn.socialLikes = function(options) {
        return this.each(function() {
            var elem = $(this);
            var instance = elem.data(prefix);
            if (instance) {
                if ($.isPlainObject(options)) {
                    instance.update(options);
                }
            } else {
                instance = new SocialLikes(elem, $.extend({}, $.fn.socialLikes.defaults, options, dataToOptions(elem)));
                elem.data(prefix, instance);
            }
        });
    };

    $.fn.socialLikes.defaults = {
        url: window.location.href.replace(window.location.hash, ''),
        title: document.title,
        counters: true,
        zeroes: true,
        wait: 500, // Show buttons only after counters are ready or after this amount of time
        timeout: 10000, // Show counters after this amount of time even if they aren’t ready
        popupCheckInterval: 500,
        singleTitle: 'Share'
    };

    function SocialLikes(container, options) {
        this.container = container;
        this.options = options;
        this.init();
    }

    SocialLikes.prototype = {
        init: function() {
            // Add class in case of manual initialization
            this.container.addClass(prefix);

            this.single = this.container.hasClass(prefix + '_single');

            this.initUserButtons();

            this.countersLeft = 0;
            this.number = 0;
            this.container.on('counter.' + prefix, $.proxy(this.updateCounter, this));

            var buttons = this.container.children();

            this.makeSingleButton();

            this.buttons = [];
            buttons.each($.proxy(function(idx, elem) {
                var button = new Button($(elem), this.options);
                this.buttons.push(button);
                if (button.options.counterUrl) this.countersLeft++;
            }, this));

            if (this.options.counters) {
                this.timer = setTimeout($.proxy(this.appear, this), this.options.wait);
                this.timeout = setTimeout($.proxy(this.ready, this, true), this.options.timeout);
            } else {
                this.appear();
            }
        },
        initUserButtons: function() {
            if (!this.userButtonInited && window.socialLikesButtons) {
                $.extend(true, services, socialLikesButtons);
            }
            this.userButtonInited = true;
        },
        makeSingleButton: function() {
            if (!this.single) return;

            var container = this.container
            container.addClass(prefix + '_vertical');
            container.wrap($('<div>', {
                'class': prefix + '_single-w'
            }));
            container.wrapInner($('<div>', {
                'class': prefix + '__single-container'
            }));
            var wrapper = container.parent();

            // Widget
            var widget = $('<div>', {
                'class': getElementClassNames('widget', 'single')
            });
            var button = $(template(
                '<div class="{buttonCls}">' +
                '<span class="{iconCls}"></span>' +
                '{title}' +
                '</div>', {
                    buttonCls: getElementClassNames('button', 'single'),
                    iconCls: getElementClassNames('icon', 'single'),
                    title: this.options.singleTitle
                }
            ));
            widget.append(button);
            wrapper.append(widget);

            widget.on('click', function() {
                console.log(234)
                var activeClass = prefix + '__widget_active';
                widget.toggleClass(activeClass);
                if (widget.hasClass(activeClass)) {
                    container.css({
                        left: -(container.width() - widget.width()) / 2,
                        top: -container.height()
                    });
                    showInViewport(container);
                    closeOnClick(container, function() {
                        widget.removeClass(activeClass);
                    });
                } else {
                    container.removeClass(openClass);
                }
                return false;
            });

            this.widget = widget;

        },
        update: function(options) {
            if (!options.forceUpdate && options.url === this.options.url) return;

            // Reset counters
            this.number = 0;
            this.countersLeft = this.buttons.length;
            if (this.widget) this.widget.find('.' + prefix + '__counter').remove();

            // Update options
            $.extend(this.options, options);
            for (var buttonIdx = 0; buttonIdx < this.buttons.length; buttonIdx++) {
                this.buttons[buttonIdx].update(options);
            }
        },
        updateCounter: function(e, service, number) {
            if (number) {
                this.number += number;

                if (this.single) {
                    this.getCounterElem().text(this.number);
                }
            }

            this.countersLeft--;
            if (this.countersLeft === 0) {
                this.appear();
                this.ready();
            }
        },
        appear: function() {
            this.container.addClass(prefix + '_visible');
        },
        ready: function(silent) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.container.addClass(prefix + '_ready');
            if (!silent) {
                this.container.trigger('ready.' + prefix, this.number);
            }
        },
        getCounterElem: function() {
            var counterElem = this.widget.find('.' + classPrefix + 'counter_single');
            if (!counterElem.length) {
                counterElem = $('<span>', {
                    'class': getElementClassNames('counter', 'single')
                });
                this.widget.append(counterElem);
            }
            return counterElem;
        }
    };


    function Button(widget, options) {
        this.widget = widget;
        this.options = $.extend({}, options);
        this.detectService();

        if (this.service) {
            this.init();
        }
    }

    Button.prototype = {
        init: function() {
            this.detectParams();
            var count = $(this.widget).data('count');
            var returnVar = this.setCounter(this, count);

            if (services[this.service].iframeUse) {
                this.iframeMake();
            } else if (services[this.service].scriptUse) {
                this.scriptMake();
            } else if (services[this.service].callback) {
                var options = returnVar;
                var shorturl = $(this.widget).data('shorturl'),
                    url = shorturl ? shorturl : this.options.url;
                if (this.service == 'delicious') services[this.service].paramUrl = url;
                services[this.service].renderHtml(this.widget, document, "ok_shareWidget", url, options);
            } else {
                this.initHtml();
                if (services[this.service].counter != false) {
                    setTimeout($.proxy(this.initCounter, this), 0);
                } else if (services[this.service].buttonImage) {
                    var image = $('<img />').attr({
                        src: this.widget.data('image'),
                        alt: this.widget.find('a').attr('title')
                    })
                    this.widget.find('a').append(image)
                }
            }
        },

        setCounter: function(self, count) {
            var service = self.service;
            if (service == 'weibo') {
                count ? self.options.iframeSet["src"].count = '1' : self.options.iframeSet["src"].count = '0';
                // if (!count) self.options.iframeSet["style"].width = '65px';
            } else if (service == 'qzone') {
                count ? self.options.iframeSet["src"].showcount = '1' : self.options.iframeSet["src"].showcount = '0';
                if (!count) self.options.iframeSet["style"].width = '30px';
            } else if (service == 'facebookLike') {
                count ? self.options.iframeSet["src"].layout = 'button_count' : self.options.iframeSet["src"].layout = 'button';
                if (!count) self.options.iframeSet["style"].width = '52px';
            } else if (service == 'linkedin') {
                count ? self.options.direction = 'right' : self.options.direction = 'no';
            } else if (service == 'odnoklassniki') {
                var options = count ? "{width:145,height:30,st:'rounded',sz:20,ck:1}" : "{width:145,height:30,st:'rounded',sz:20,ck:1,nc:1}";
                return options;
            } else {
                count ? self.options.counters = true : self.options.counters = false;
            }
        },

        update: function(options) {
            $.extend(this.options, {
                forceUpdate: false
            }, options);
            this.widget.find('.' + prefix + '__counter').remove(); // Remove old counter
            this.initCounter();
        },

        detectService: function() {
            var service = this.widget.data('service');
            if (!service) {
                // class="facebook"
                var node = this.widget[0];
                var classes = node.classList || node.className.split(' ');
                for (var classIdx = 0; classIdx < classes.length; classIdx++) {
                    var cls = classes[classIdx];
                    if (services[cls]) {
                        service = cls;
                        break;
                    }
                }
                if (!service) return;
            }
            this.service = service;
            $.extend(this.options, services[service]);
        },

        detectParams: function() {
            var data = this.widget.data();

            // Custom page counter URL or number
            if (data.counter) {
                var number = parseInt(data.counter, 10);
                if (isNaN(number)) {
                    this.options.counterUrl = data.counter;
                } else {
                    this.options.counterNumber = number;
                }
            }

            // Custom page title
            if (data.title) {
                this.options.title = data.title;
            }

            // Custom page URL
            if (data.url) {
                this.options.url = data.url;
            }
            // theJ
            if (data.shorturl) {
                this.options.shorturl = data.shorturl;
            } // else {
            //  if (data.url) {
            //      this.options.shorturl = data.url;
            //  }
            //}
            if (data.count) {
                this.options.count = data.count;
            }
        },

        scriptMake: function() {
            var options = this.options;
            var widget = this.widget;

            var shortUrl = $(widget).data('shorturl'),
                url = shortUrl ? shortUrl : this.options.url;
            this.options.paramUrl = url;

            options.scriptCon(widget);
        },

        iframeMake: function(event) {
            var options = this.options;
            var widget = this.widget;

            var iframe = $('<iframe>', {
                'title': widget.text(),
                'frameborder': 0,
                'scrolling': 'no',
                'allowtransparency': true
            });

            var _this = options.iframeSet;
            var iframeSet = {
                src: function(key) {
                    return makeUrl(options.iframeUrl + '?' + decodeURIComponent($.param($.extend(widget.data(), options.iframeSet[key]))), {
                        url: (options.shorturl) ? options.shorturl : options.url
                    });
                },
                style: function(key) {
                    var defaultCss = []
                    var temp = $.extend({
                        overflow: 'hidden',
                        border: 'none'
                    }, options.iframeSet[key]);
                    for (var property in temp) {
                        defaultCss.push(property.toString() + ':' + temp[property])
                    }
                    return defaultCss.join(';')
                }
            }
            $.each(options.iframeSet, function(key, value) {
                iframe.attr(key, iframeSet[key](key));
            });


            widget.empty().append(iframe);
        },

        initHtml: function() {

            var options = this.options;
            var widget = this.widget;

            // Old initialization HTML
            var a = widget.find('a');
            if (a.length) {
                this.cloneDataAttrs(a, widget);
            }

            // Button
            var button = $('<a>', {
                'class': this.getElementClassNames('button'),
                'text': '',
                'href': '#none',
                'title': widget.text()
            });
            if (options.clickUrl) {

                var url = makeUrl(options.clickUrl, {
                    url: (options.shorturl) ? options.shorturl : options.url,
                    shorturl: (options.shorturl) ? options.shorturl : options.url,
                    title: options.title
                });
                var link = $('<a>', {
                    href: url
                });
                this.cloneDataAttrs(widget, link);
                widget.replaceWith(link);
                this.widget = widget = link;
            } else {
                widget.on('click', $.proxy(this.click, this));
            }

            widget.removeClass(this.service);
            widget.addClass(this.getElementClassNames('widget'));

            // Icon
            button.prepend($('<span>', {
                'class': this.getElementClassNames('icon')
            }));

            widget.empty().append(button);
            this.button = button;
        },

        initCounter: function() {
            if (this.options.counters) {
                //console.log(this.options.counters);
                if (this.options.counterNumber) {
                    this.updateCounter(this.options.counterNumber);
                } else {
                    var extraOptions = {
                        counterUrl: this.options.counterUrl,
                        forceUpdate: this.options.forceUpdate
                    };
                    counters.fetch(this.service, this.options.url, extraOptions)
                        .always($.proxy(this.updateCounter, this));
                }
            }
        },

        cloneDataAttrs: function(source, destination) {
            var data = source.data();
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    destination.data(key, data[key]);
                }
            }
        },

        getElementClassNames: function(elem) {
            return getElementClassNames(elem, this.service);
        },

        updateCounter: function(number) {
            number = parseInt(number, 10) || 0;

            var params = {
                'class': this.getElementClassNames('counter'),
                'text': number
            };
            if (!number && !this.options.zeroes) {
                params['class'] += ' ' + prefix + '__counter_empty';
                params.text = '';
            }
            //console.log(params);
            var counterElem = $('<span>', params);
            this.widget.append(counterElem);

            this.widget.trigger('counter.' + prefix, [this.service, number]);
        },

        click: function(e) {
            var options = this.options;
            var process = true;
            if (options.click) {
                process = options.click.call(this, e);
            }
            if (process) {
                var url = makeUrl(options.popupUrl, {
                    url: (options.shorturl) ? options.shorturl : options.url,
                    shorturl: (options.shorturl) ? options.shorturl : options.url,
                    title: options.title
                });

                //console.log(options.popupUrl)
                url = this.addAdditionalParamsToUrl(url);
                this.openPopup(url, {
                    width: options.popupWidth,
                    height: options.popupHeight
                });
            }
            return false;
        },

        addAdditionalParamsToUrl: function(url) {
            var params = $.param($.extend(this.widget.data(), this.options.data));
            var urlOri = url.split('?')[1].split('&');
            var option = $.extend(this.widget.data(), this.options.data);

            Array.prototype.remove = function(index) {
                this.splice(index, 1);
                return this;
            };

            if (!Object.keys) Object.keys = function(o) {
                if (o !== Object(o))
                    throw new TypeError('Object.keys called on a non-object');
                var k = [],
                    p;
                for (p in o)
                    if (Object.prototype.hasOwnProperty.call(o, p)) k.push(p);
                return k;
            }

            $.each(Object.keys(option), function(index) {

                for (var i = 0; i < urlOri.length; i++) {
                    if (this == urlOri[i].split('=')[0]) {
                        urlOri.remove(i);
                    }
                }

            })

            if ($.isEmptyObject(params)) return url;
            var glue = url.indexOf('?') === -1 ? '?' : '&';
            var urlTotal = url.replace(url.split('?')[1], urlOri.join('&'));

            return urlTotal + glue + params;
        },

        openPopup: function(url, params) {
            var left = Math.round(screen.width / 2 - params.width / 2);
            var top = 0;
            if (screen.height > params.height) {
                top = Math.round(screen.height / 3 - params.height / 2);
            }

            var win = window.open(url, 'sl_' + this.service, 'left=' + left + ',top=' + top + ',' +
                'width=' + params.width + ',height=' + params.height + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');
            if (win) {
                win.focus();
                this.widget.trigger('popup_opened.' + prefix, [this.service, win]);
                var timer = setInterval($.proxy(function() {
                    if (!win.closed) return;
                    clearInterval(timer);
                    this.widget.trigger('popup_closed.' + prefix, this.service);
                }, this), this.options.popupCheckInterval);
            } else {
                //location.href = url;
                win = window.open(url, 'sl_' + this.service, 'left=' + left + ',top=' + top + ',' +
                    'width=' + params.width + ',height=' + params.height + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');
            }
        }
    };


    /**
     * Helpers
     */

    // Camelize data-attributes
    function dataToOptions(elem) {
        function upper(m, l) {
            return l.toUpper();
        }
        var options = {};
        var data = elem.data();
        for (var key in data) {
            var value = data[key];
            if (value === 'yes') value = true;
            else if (value === 'no') value = false;
            options[key.replace(/-(\w)/g, upper)] = value;
        }
        return options;
    }

    function makeUrl(url, context) {
        return template(url, context, encodeURIComponent);
    }

    function template(tmpl, context, filter) {
        return tmpl.replace(/\{([^\}]+)\}/g, function(m, key) {
            //console.log(filter(context[key]))
            // If key doesn't exists in the context we should keep template tag as is
            return key in context ? (filter ? filter(context[key]) : context[key]) : m;
        });
    }

    function getElementClassNames(elem, mod) {
        var cls = classPrefix + elem;
        return cls + ' ' + cls + '_' + mod;
    }

    function closeOnClick(elem, callback) {
        function handler(e) {
            if ((e.type === 'keydown' && e.which !== 27) || $(e.currentTarget).closest(elem).length) return;
            elem.removeClass(openClass);
            doc.off(events, handler);
            if ($.isFunction(callback)) callback();
        }
        var doc = $(document);
        var events = 'click touchstart keydown';
        doc.on(events, handler);
    }

    function showInViewport(elem) {
        var offset = 10;
        if (document.documentElement.getBoundingClientRect) {
            var left = parseInt(elem.css('left'), 10);
            var top = parseInt(elem.css('top'), 10);

            var rect = elem[0].getBoundingClientRect();
            if (rect.left < offset)
                elem.css('left', offset - rect.left + left);
            else if (rect.right > window.innerWidth - offset)
                elem.css('left', window.innerWidth - rect.right - offset + left);

            if (rect.top < offset)
                elem.css('top', offset - rect.top + top);
            else if (rect.bottom > window.innerHeight - offset)
                elem.css('top', window.innerHeight - rect.bottom - offset + top);
        }
        elem.addClass(openClass);
    }


    var baidu = function(){
        window._bd_share_config={
            "common":{
                "bdSnsKey":{},
                "bdText":$('.bdsharebuttonbox').data('text'),
                "bdMiniList":false,
                "bdUrl" : $('.bdsharebuttonbox').data('url'),
                "bdPic":"",
                "bdSize":"32"
            },
            "share":{}
        }

        /* LGECN-2310 : 20180718 modify */
        $('body').append('<script src=/cn/baidumap/baiduShare-master/static/api/js/share.js?v=89860593.js?cdnversion=' +~(-new Date()/36e5) + '></script>');
        /*//LGECN-2310 : 20180718 modify */
        
        var nIntervId;
        $('.bds_weixin').on('click', function(event){
            event.preventDefault();
            if ($('#bdshare_weixin_qrcode_dialog').size() == 0 && !nIntervId) {
                nIntervId = setInterval(loadDOM, 1000);
            } else {
                newWindow();
            }

            function loadDOM(){
                if ($('#bdshare_weixin_qrcode_dialog').size() > 0) {
                    clearInterval(nIntervId);
                    newWindow();
                }
            }

            function newWindow(){
                $('#bdshare_weixin_qrcode_dialog').find('.bd_weixin_popup_close').hide();
                $('#bdshare_weixin_qrcode_dialog').css({ 
                    position : 'static',
                    left : 0,
                    top : 0,
                    width: 'auto',
                    height: 'auto'
                }).wrapAll('<div />');

                var myWindow, htmlTag = '';

                    if ($('html').hasClass('tablet') || $('body').hasClass('is-mobile')) {
                        myWindow = window.open('', '_blank');
                        htmlTag += '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no, minimal-ui">';
                    } else {
                        myWindow = window.open('', '', 'directories=no, menubar=no, status=no, location=no, width=300, height=330');
                    }
                    myWindow.document.getElementsByTagName('html')[0].innerHTML = '';

                    htmlTag += '<title>' + event.currentTarget.title + '</title>';
                    htmlTag += '<link rel="stylesheet" type="text/css" href="http://bdimg.share.baidu.com/static/api/css/weixin_popup.css"></head>';
                    htmlTag += $('#bdshare_weixin_qrcode_dialog').parent('div').html();

                    myWindow.document.getElementsByTagName('html')[0].innerHTML = htmlTag;
            }

        });
    }

	var yandex = function(){
		var script;

		//script = '<script src="//code.jquery.com/jquery-1.12.0.min.js"></script>';
		/* LGEGMO-4062 */
		script = '<script type="text/javascript" src="https://yastatic.net/share/share.js" charset="utf-8"></script>';
		/*//LGEGMO-4062 */
		$('.yandex').closest('.product_share').prepend(script);
	}

    /**
     * Auto initialization
     */
    var socialLike;
    return socialLike = function(){
        if ($('.' + prefix).hasClass('bdsharebuttonbox')) {
            baidu();
		} else if ($('.' + prefix).hasClass('yandex')) {
            yandex();
        } else {
            $('.' + prefix).socialLikes();
        }
    }

}));
