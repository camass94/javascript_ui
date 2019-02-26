/* global define */

/**
 * A utility module.
 * @module common/util
 */
define([], function() {

    'use strict';

    var util = {};

    /**
     * Gets the value of Bar.
     * @return {String} The value of bar.
     */
    util.getBar = function() {
        return 'bar';
    };

    /**
     * Class inheritance.
     * @param  {Function} subclass A function constructor.
     * @param  {Function} superclass A Function constructor.
     * @return {void}
     */
    util.inherits = function(subclass, superclass) {

    };

    /**
     * Whether a value is foobar.
     * @param {*} val The value to test.
     * @return {Boolean} `true` if foobar; `false` otherwise.
     */
    util.isFoobar = function(val) {
        return true;
    };

    return util;

});
