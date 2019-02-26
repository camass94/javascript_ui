/**
 * The app header module.
 * @module common/app-header
 * @requires ic/ic
 * @requires ic/ui/module
 */
define(['ic/ic', 'ic/ui/module'], function(ic, Module) {

    'use strict';

    /*

    var proto,
        events = ic.events;

    var AppMyLG = function(el, options) {
        var self = this;
        // Call the parent constructor
        AppMyLG.superclass.constructor.call(self, el, options);

        self.$mylgLoginBtn = self.$('.mylg-login-btn');
        self.$mylgLoginNav = self.$('.mylg-login-nav');
        self.$mylgLoginForm = self.$('.mylg-login-form');
        self.$mylgFormCloseBtn = self.$('.mylg-form-close-btn');

        self._init();
    };

    // Inherit from Module
    ic.util.inherits(AppMyLG, Module);

    // Alias the prototype for less typing and better minification
    proto = AppMyLG.prototype;

    proto._defaults = {};

    proto._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self);

        //self.$mylgLoginBtn.on('click', $.proxy(_loginHandler, self));
        self.$mylgFormCloseBtn.on('click', $.proxy(_closeLoginHandler, self));

    }

    proto._handleEvent = function(e) {
        var self = this;
        e.preventDefault();
    };

    var _loginHandler = function(e) {
        var self = this;
        console.log("my lg handler ");
        e.preventDefault();
        self.$mylgLoginNav.toggleClass('active');
        self.$mylgLoginForm.toggleClass('active');
    };

    var _closeLoginHandler = function(e) {
        var self = this;
        e.preventDefault();
        self.$mylgLoginNav.toggleClass('active');
        self.$mylgLoginForm.toggleClass('active');
    }

    // Create the jquery plugin and set it to auto-wire to specified selector
    ic.jquery.plugin('AppMyLG', AppMyLG, '#app-my-lg');

    return AppMyLG;

	*/
});
