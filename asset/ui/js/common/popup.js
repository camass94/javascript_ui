/**
 * The popup module.
 * @module common/popup
 * @requires ic/ic
 * @requires ic/ui/module
 **/
/*
 * live chat markup sample
 * <a href="http://service.velaro.com/visitor/requestchat.aspx?siteid=4851&amp;showwhen=inqueue" data-url="http://service.velaro.com/visitor/requestchat.aspx?siteid=4851&amp;showwhen=inqueue" target="_blank" title="new window" class="popup-live-chat">Chat online</a>
 */
define(['ic/ic', 'ic/ui/module', 'common/dtm'], function(ic, Module, dtm) {
    'use strict';

    var proto;

    var newPopup = function(el, options) {
        var self = this;

        // Call the parent constructor
        newPopup.superclass.constructor.call(self, el, options);

        // object
        self.$liveChatPopup = self.$('.popup-live-chat');
        // -- object

        self._init();
    };
    // Inherit from Module
    ic.util.inherits(newPopup, Module);

    // Alias the prototype for less typing and better minification
    proto = newPopup.prototype;

    proto._defaults = {};

    proto._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self);

        // bind event
        self.$liveChatPopup.on('click', $.proxy(_livechat, self));
        // -- bind event
    }

    var _livechat = function(e) {
        var self = this;
        e.preventDefault();

        var u = self.$liveChatPopup.attr('data-url');
        var n = 'LiveChat';
        var c = "width=600, height=575, toolbar=no, menubar=no, statusbar=yes, scrollbar=no, resizable=no";
        window.open(u, n, c);
        sendEvent('footer-contact-live-chat', ''); // DTM

        return false;
    };

    //   Create the jquery plugin and set it to auto-wire to specified selector
    ic.jquery.plugin('newPopup', newPopup, 'body');
    return newPopup;

});
