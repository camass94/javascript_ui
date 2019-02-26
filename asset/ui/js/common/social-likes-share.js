/* global define */

/**
 * A module representing a Dog.
 * @module common/dog
 * @requires  common/util
 * @requires  common/animal
 */
define(['ic/ic', 'ic/ui/module', 'common/util', 'common/social-likes', 'global-config'], function(ic, Module, util, socialLike, globalConfig) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        $document = $(document),
        $window = $(window),
        proto,
        targetOpen = '[rel="share:open"]',
        targetClose = '[rel="share:close"]';


    var socialShare = function(el, options) {
        var _ = this;

        // Call the parent constructor
        socialShare.superclass.constructor.call(_, el, options);

        // selectors
        _.$el = $(el);
        _.$wrapper = _.$el.closest('.share_box');

        // Default Option
        _.defaults = {
            shareUrl: _.$el.data('url'),
            shareCon: '.product_share',
            shareWidth: 0,
            shareWidthCheck: true
        };
        _.options = $.extend({}, options, _.defaults, _.$el.data());

        _.init();

        // Event Handlers
        $('.wrapper').on('click', targetOpen, $.proxy(_.shareOpen, _));
        $('.wrapper').on('click', targetClose, $.proxy(_.shareOpen, _));

    };

    // util.inherits(AccordionTabs, Tabs);
    util.inherits(socialShare, Module);
    proto = socialShare.prototype;


    proto.init = function() {
        var _ = this;

        _.shareCall(_.options.shareUrl);

    }


    proto.shareWidth = function() {
        var _ = this,
            shareCon = _.$wrapper.find(_.options.shareCon);

        if (_.options.shareWidthCheck) {
            $.each(shareCon.find('ul.share_list > li'), function() {

                _.options.shareWidth += parseInt($(this).outerWidth(true));

            });

            _.options.shareWidthCheck = false;

        }

        return _.options.shareWidth;
    }


    proto.shareResponsive = function() {
        var _ = this,
            shareCon = _.$wrapper.find(_.options.shareCon),
            winWidth = $('.wrapper').width(),
            shareLeft = Math.abs(_.$el.offset().left),
            shareWidth = _.shareWidth() + 16,
            shareArrow = _.$wrapper.find('i.icon-triangle-down'),
            shareClose = shareCon.find('li.close').outerWidth(true),
            shareTop = shareArrow.position().top + shareArrow.height() - 1,
            shareRest = winWidth - shareLeft - _.$el.outerWidth(true),
            sharePosition = 0,
            modal = shareCon.parents('.modal-content');
        
        /* LGECN-2310 : 20180718 modify */
        if($("html").data("countrycode") == "cn" && $document.find(".wrapper").hasClass("support") && shareWidth < 140){
        	shareLeft = "0";
        }
        /*//LGECN-2310 : 20180718 modify */

        if (modal.length > 0) {
            // SNS Share in Modal Content Layer 
            var modalLeft = modal.offset().left;
            var modalPadding = parseInt(modal.css('padding-left'));
            var modalSharePadding = shareLeft - ((winWidth - modal.outerWidth(true)) / 2);
            var modalTitleWidth = modal.find('.modal-title').outerWidth(true);
            var modalShareRest = modalTitleWidth - modalSharePadding - _.$el.width();
            var scrollWidth = modal.find('.scroll-y').outerWidth(true);
            var modalStart = modalSharePadding - modalPadding - scrollWidth;
            
            shareCon.removeClass('responsive').css('width', 'auto');

            if (shareWidth > modalTitleWidth) {
                
                shareCon.addClass('responsive').css({
                    width: modalTitleWidth - 50
                });

                sharePosition = -(modalSharePadding - modalPadding - scrollWidth);

            } else if (shareWidth > modalTitleWidth - modalSharePadding){

                sharePosition = -(shareWidth - ((modalTitleWidth - scrollWidth) - modalStart));

            } else  {
                
                sharePosition = -(shareWidth / 2);
            }

            shareCon.css('left', sharePosition);

        } else if (shareWidth > winWidth) {

            shareCon.addClass('responsive').css({
                left: -shareLeft,
                width: winWidth
            });

        } else {

            shareCon.removeClass('responsive');
            
            if (shareWidth > shareRest){

                sharePosition = -(((shareWidth) - _.$el.outerWidth(true)) - shareRest);

            } else if (shareWidth > shareLeft)  {

                sharePosition = 0;

            } else {

                sharePosition = -((shareWidth - shareClose) / 2) + shareClose;

            }

            shareCon.css({
                left: sharePosition,
                width: 'auto'
            });

        }

        //Top position
        shareCon.css('top', shareTop);


    }


    proto.shareOpen = function(event) {
        var _ = this;

        if ($('.sms_box').hasClass('active')) {
            $('[rel="sms:open"]').trigger('click');
        }

        if (!_.$wrapper.hasClass('active')) {

            _.$wrapper.addClass('active').find(_.options.shareCon).show();
            _.shareCall(_.options.shareUrl, true);
            if (!globalConfig.isMobile) {
                _.shareResponsive();
            }

            if (!globalConfig.isMobile) {
                $(window).resize($.proxy(_.shareResponsive, _));
            }

        } else {

            // $(this).parents('.share_box').removeClass('active').find('.product-sns-share').hide();
            _.$wrapper.removeClass('active').find(_.options.shareCon).removeAttr('style').hide();

        }
        event.preventDefault();
        event.stopPropagation();

    }


    proto.XSSfilter = function(content) {

        return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    }

    // proto.shareCall = function(url, check) {
    //     var _ = this;

    //     if (_.$wrapper.find(_.options.shareCon).length == 0) {

    //         $.ajax({
    //             type: "GET",
    //             timeout: 50000,
    //             url: _.XSSfilter(url),
    //             success: $.proxy(function(con) {

    //                 _.$wrapper.find(_.options.shareCon).remove().end().append(con);

    //                 var socialButton = _.$wrapper.find(_.options.shareCon).find('.social-likes');

    //                 socialLike();

    //                 _.shareAccessibility();

    //             }, this)
    //         });

    //     }

    // }


    proto.shareCall = function(url, check) {
        var _ = this;

        if (_.$wrapper.find(_.options.shareCon).length == 0) {
            /* LGEGMO-1092 20160330 modify */
            var baseUrl = window.location.href;
            var longUrl;
            if ( baseUrl.indexOf("?") > -1 ) {
                longUrl = baseUrl.substring(0, baseUrl.indexOf('?') );
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
                            _.$wrapper.find(_.options.shareCon).remove().end().append(con);

                            var socialButton = _.$wrapper.find(_.options.shareCon).find('.social-likes');

                            socialLike();

                            _.shareAccessibility();

                        }, this)
                    });
                }, this)
            });
            /* //LGEGMO-1092 20160330 modify */
        }

    }


    proto.shareAccessibility = function(){
        var _ = this,
            shareCon = _.$wrapper.find(_.options.shareCon),
            firstElement = shareCon.find("a, input:not([disabled='disabled']), select, button, textarea, *[tabindex='0'], iframe").filter(':first'),
            lastElement = shareCon.find("a, input:not([disabled='disabled']), select, button, textarea, iframe").filter(':last'),
            closeElement = shareCon.find(targetClose);

        firstElement.off('keydown').on('keydown', function (b) {
            if(b.keyCode == 9 && b.shiftKey) {
                b.preventDefault();
                lastElement.focus();
            }
        });

        lastElement.off('keydown').on('keydown', function (b) {
            if(b.keyCode == 9 && b.shiftKey) {
            } else if (b.keyCode == 9) {
                b.preventDefault();
                firstElement.focus();
            }
        });

        closeElement.on('click', function (b) {
            b.preventDefault();
            _.$el.focus();
        });
    }

    plugin('socialShare', socialShare, targetOpen);


    return socialShare;
});
