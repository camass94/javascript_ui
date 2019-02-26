/* global define */

/**
 * A module representing a Dog.
 * @module common/dog
 * @requires  common/util
 * @requires  common/animal
 */
define(['ic/ic', 'ic/ui/module', 'common/util', 'global-config'], function(ic, Module, util, globalConfig) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        $document = $(document),
        $window = $(window),
        proto;


    var lgLanguage = function(el, options) {
        var self = this;

        // Call the parent constructor
        lgLanguage.superclass.constructor.call(_, el, options);

        // selectors
        self.$el = $(el);

        // Default Option
        self.defaults = {
            langClose: '[rel="lang:close"]',
            tooltipTarget: '[rel="tooltip:open"], [rel="tooltip:close"]'
        };
        self.options = $.extend({}, options, self.defaults, self.$el.data());

        // Event Handlers
        $(self.options.tooltipTarget).on('click', $.proxy(self.langTooltip, _));
        $(document).on('click', self.options.langClose, $.proxy(self.langClose, _));

    };

    // util.inherits(AccordionTabs, Tabs);
    util.inherits(lgLanguage, Module);
    proto = lgLanguage.prototype;


    proto.shareWidth = function() {
        var _ = this,
            shareCon = self.$wrapper.find(self.options.shareCon);

        if (self.options.shareWidthCheck) {
            $.each(shareCon.find('ul.share_list > li'), function() {

                self.options.shareWidth += parseInt($(this).outerWidth(true));

            });

            self.options.shareWidthCheck = false;

        }

        return self.options.shareWidth;
    }


    proto.shareResponsive = function() {
        var _ = this,
            shareCon = self.$wrapper.find(self.options.shareCon),
            shareLeft = Math.round(self.$el.offset().left),
            winWidth = $(window).width(),
            shareWidth = self.shareWidth(),
            modal = shareCon.parents('.modal-content');

        if (shareWidth > modal.find('.modal-title').outerWidth(true) && modal.length > 0) {

            var modalLeft = modal.offset().left;
            var modalPadding = parseInt(modal.css('padding-left'));

            shareCon.addClass('responsive').css({
                left: -(shareLeft - modalLeft) + modalPadding + 4,
                width: modal.width() - 50
            });

        } else if (shareWidth > winWidth) {

            shareCon.addClass('responsive').css({
                left: -shareLeft,
                width: winWidth
            });

        } else {

            shareCon.removeClass('responsive');

            var leftVal = (shareLeft < shareWidth / 2) ? -(shareLeft - ((winWidth - shareWidth) / 2)) : -(shareWidth / 2)

            shareCon.css({
                left: leftVal,
                width: 'auto'
            });

        }

    }


    proto.shareOpen = function(event) {
        var _ = this;

        if (!self.$wrapper.hasClass('active')) {

            self.$wrapper.addClass('active').find(self.options.shareCon).show();
            self.shareCall(self.options.shareUrl, true);
            if (!globalConfig.isMobile) {
                self.shareResponsive();
            }

            if (!globalConfig.isMobile) {
                $(window).resize($.proxy(self.shareResponsive, _));
            }

        } else {

            // $(this).parents('.share_box').removeClass('active').find('.product-sns-share').hide();
            self.$wrapper.removeClass('active').find(self.options.shareCon).removeAttr('style').hide();

        }
        event.preventDefault();
        event.stopPropagation();

    }


    proto.XSSfilter = function(content) {

        return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    }


    proto.shareCall = function(url, check) {
        var _ = this;

        if (self.$wrapper.find(self.options.shareCon).length == 0) {

            $.ajax({
                type: "GET",
                timeout: 50000,
                url: self.XSSfilter(url),
                success: $.proxy(function(con) {

                    self.$wrapper.find(self.options.shareCon).remove().end().append(con);
                    self.$wrapper.find(self.options.shareCon).find('.social-likes').socialLikes();

                }, this)
            });

        }

    }

    plugin('lgLanguage', lgLanguage, '#app-lg-lang');


    return lgLanguage;
});
