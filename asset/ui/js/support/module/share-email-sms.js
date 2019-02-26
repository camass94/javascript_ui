define(['ic/ic', 'ic/ui/module', 'global-config', 'cs/forms'], function(ic, Module, config, Forms) {

    var util = ic.util,
        plugin = ic.jquery.plugin,
    //events = ic.events,
    //$document = $(document),
    //$window = $(window),
        proto,
        targetOpen = '[rel="sms:open"]',
        targetOpenT = '[rel="email:open"]',
        targetClose = '[rel="sms:close"]',
        targetCloseT = '[rel="email:close"]';

    var socialSms = function(el, options, event) {
        var _ = this;

        // Call the parent constructor
        socialSms.superclass.constructor.call(_, el, options);

        // selectors
        _.$el = $(el);
        _.$cmBox = _.$el.closest('.cmbox');
        _.$wrapper = _.$el.attr('rel') == 'sms:open' ? _.$el.closest('.sms_box') : _.$el.closest('.email_box') ;
        _.targetOpen = _.$el.attr('rel') == 'sms:open' ? targetOpen : targetOpenT;
        _.targetClose = _.$el.attr('rel') == 'sms:open' ? targetClose : targetCloseT;

        // Default Option
        _.defaults = {
            smsUrl: _.$el.data('url'),
            smsCon: _.$el.attr('rel') == 'sms:open' ? '.search-model-title' : '.email_send',
            smsWidth: 0,
            smsWidthCheck: true
        };

        _.options = $.extend({}, options, _.defaults, _.$el.data());

        _.init();

        // Event Handlers
        $(document).on('click.smsOpen',_.targetOpen , $.proxy(_.smsOpen, _));
        $(document).on('click.smsClose', _.targetClose, $.proxy(_.smsOpen, _));
    };

    util.inherits(socialSms, Module);

    proto = socialSms.prototype;

    proto.init = function() {
        var _ = this;
        _.visibleBtn();
    };

    proto.visibleBtn = function(event) {
        var _ = this;
        var $sheareBox = $('.share_box');
        var $productBox = $('.product_share');

        $('[rel="sms:open"]').on('click', function(){
            $('.email_box').removeClass('active').find('.email_send').remove();
            $sheareBox.removeClass('active');
            $('.product_share').hide();
        });

        $('[rel="email:open"]').on('click', function(){
            $('.sms_box').removeClass('active').find('.search-model-title').remove();
            $sheareBox.removeClass('active');
            $('.product_share').hide();
        });

        $('[rel="share:open"]').on('click', function(){
            $('.sms_box, .email_box').removeClass('active').find('.modal-content').remove();
        });

    };

    proto.smsResponsive = function() {
        var _ = this,
            smsCon = _.$wrapper.find(_.options.smsCon),
            winWidth = $(window).width(),
            //smsRight = Math.round(winWidth - _.$el.offset().left - _.$wrapper.outerWidth(true)),
            //smsWidth = smsCon.width(),
            smsArrow = _.$wrapper.find('i.icon-triangle-down'),
            smsTop = smsArrow.position().top + smsArrow.height() - 1;
            //smsNoCloseArrow = Math.abs(Math.round(smsArrow.position().left)) - smsArrow.width(),
            //modal = smsCon.parents('.modal-content');

        if (winWidth > 920) {
            var setOffset = (winWidth - $('.container').width()) / 2;
            var smsBtnLeft = (_.$wrapper.offset().left - setOffset);
            if (smsBtnLeft > 580) {
                smsCon.addClass('responsive').css({
                    left: '-520px'
                });
            } else {
                smsCon.addClass('responsive').css({
                    left: '-40px'
                });
            }
        } else {
            smsCon.removeClass('responsive');
            smsCon.css({
                left: '-40px',
                'margin-left': 0
            });
        }

        //Top position
        smsCon.css('top', smsTop);
    };

    proto.smsResponRepair = function() {
        var _ = this,
            smsCon = _.$wrapper.find(_.options.smsCon),
            winWidth = $(window).width(),
            //smsRight = Math.round(winWidth - _.$el.offset().left - _.$wrapper.outerWidth(true)),
            //smsWidth = smsCon.width(),
            smsArrow = _.$wrapper.find('.icon.icon-triangle-down'),
            smsTop = smsArrow.position().top + smsArrow.height();

        if (winWidth > 920) {
            smsCon.addClass('responsive').css({
                left: '120px'
            });
        } else {
            smsCon.removeClass('responsive');
            smsCon.css({
                left: '20px',
                'margin-left': 0
            });
        }

        //Top position
        smsCon.css('top', smsTop);
    };

    //var onClick = 1;
    proto.smsOpen = function(event) {
        var _ = this;
        var $el = $(event.target);
        var $smsBox = $('.sms_box');

        //repair?
        var _responFunc = $(".repair-direction-title").length > 0 ? "smsResponRepair" : "smsResponsive";

        if (!_.$wrapper.hasClass('active')) {

            _.smsCall(_.options.smsUrl, true, smsCallBack);


        } else {
            // $(this).parents('.sms_box').removeClass('active').find('.product-sns-sms').hide();
            _.$wrapper.removeClass('active').find(_.options.smsCon).remove();
            //$('.LBD_ReloadLink > i,.LBD_SoundLink > i').remove();
        }

        function smsCallBack() {

            _.$wrapper.addClass('active').find(_.options.smsCon).show();
            ic.jquery.plugin('Forms', Forms, '#captcha-box.validateForm');

            if (!config.isMobile) {
                _[_responFunc]();
                $(window).resize($.proxy(_[_responFunc](), _));
            }

            $smsBox.find('#captcha-box').on('form:ajax:success', function(e, context, res) {
                if (res.result) {
                    $smsBox.find('#captcha-box, .text-failure').hide();
                    $smsBox.find('#captchaCodeText, .text-success').show();
                } else {
                    if (res.validate) {
                        $smsBox.find('#captcha-box, .text-success').hide();
                        $smsBox.find('#captchaCodeText, .text-failure').show();
                    }
                }
            });

            var phoneTypeCheck = function () {
                var languageCheck = window.location.pathname;
                var dataMaskedType = $('#contactMobilePhone');
                var dataMaskedTypeValue;

                if (!languageCheck.match('/br/')) {
                    dataMaskedType.unmask().attr({placeholder:''});
                } else { // only brazil
                    dataMaskedTypeValue = 'BRMobile';
                }
                dataMaskedType.attr('data-masked-type',dataMaskedTypeValue);
            }();

        }

        event.preventDefault();
        event.stopPropagation();
    };

    proto.XSSfilter = function(content) {
        return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    proto.smsCall = function(url, check, callback) {
        var _ = this;

        _.$wrapper.find(_.options.smsCon)

        if (_.$wrapper.find(_.options.smsCon).length == 0) {

            /* LGEGMO-1092 20160331 modify */
            var baseUrl = window.location.href;
            var longUrl;
            if ( baseUrl.indexOf("?") > -1 ) {
                longUrl = baseUrl.substring(0, baseUrl.indexOf('?'));
            } else {
                longUrl = baseUrl;
            }

            /* LGECS-1160 : 20170918 modify */
            var getShort = "https://www.lg.com/common/shorturl/getShortUrl.lgajax?longUrl=" + longUrl;
            /*//LGECS-1160 : 20170918 modify */

            $.ajax({
                type: "GET",
                timeout: 50000,
                url: encodeURI(getShort),
                dataType: "jsonp",
                jsonp: "callback",
                success: $.proxy(function(x) {
                    $.ajax({
                        type: "GET",
                        url: _.XSSfilter(url) + "&shortUrl=" + x.shortUrl,
                        success: $.proxy(function(con) {
                            _.$wrapper.find(_.options.smsCon).remove().end().append(con);
                        }, this),
                        complete: function(){
                            callback();
                        }
                    });

                }, this)
            });
            /* //LGEGMO-1092 20160331 modify */

        }
    };
    plugin('socialSms', socialSms, targetOpen);
    plugin('socialSms', socialSms, targetOpenT);


    return socialSms;
});