/* global define */

/**
 * A utility module.
 * @module common/util
 */
define(['ic/ic', 'ic/ui/module'], function(ic, Module) {

    'use strict';
    var proto,
        events = ic.events,
        $window = ic.dom.$window;
    /* footer nav function */



    var AppFooter = function(el, options) {
        var self = this;

        // Call the parent constructor
        AppFooter.superclass.constructor.call(self, el, options);

        //Desktop Nav Items
        self.$LayerToggleBtn = $('#appFooter .cookie-settings a');
        self.$ToggleLayer = $('.footer-layer');
        self.currentNavIndex = 0;

        self._init();
    };
    // Inherit from Module
    ic.util.inherits(AppFooter, Module);

    // Alias the prototype for less typing and better minification
    proto = AppFooter.prototype;

    proto._defaults = {
        //active class
        ac: 'active'
    };

    proto._init = function() {
        var self = this,
            eventHandler = $.proxy(self._handleEvent, self);
        self.$ToggleLayer.hide();
        self.$LayerToggleBtn.on('click', $.proxy(self._primaryNavOverHandler, self));
    }
    proto._primaryNavOverHandler = function(e) {
        var self = this;
        e.preventDefault();
        self.$ToggleLayer.fadeToggle();
    };



    //   Create the jquery plugin and set it to auto-wire to specified selector
    ic.jquery.plugin('AppFooter', AppFooter, '.AppFooter');





    return AppFooter;


});
