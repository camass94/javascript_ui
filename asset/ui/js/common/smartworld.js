define(['ic/ic', 'ic/ui/module', 'common/util', 'jquery'], function(ic, Module, util, $) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        $document = $(document),
        $window = $(window),
        proto,
        target = '.obs-submit';


    var SmartWorld = function(el, options) {
        var _ = this;

        // Call the parent constructor
        SmartWorld.superclass.constructor.call(_, el, options);

        // selectors
        _.$wrapper = $(el);
		
        // Default Option
        _.defaults = {
			form: document.createElement('form')
		};

		_.options = $.extend({}, options, _.defaults, _.$wrapper.data());

		_.init();
	}

    // util.inherits(AccordionTabs, Tabs);
    util.inherits(SmartWorld, Module);
    proto = SmartWorld.prototype;

    // Init
    proto.init = function() {
        var _ = this;

		_.options.form.setAttribute('method', 'post');
		_.options.form.setAttribute('id', 'smartworld');
		_.options.form.setAttribute('target', '_blank');
		_.options.form.setAttribute('action', '');
		
		_.$wrapper.on('click', $.proxy(_.onSubmit, _));
    };

	proto.onSubmit = function(event){
		var _ = this;

		event.preventDefault();

		if($('form#smartworld').size() == 0){
			document.body.appendChild(_.options.form);
		}
		_.options.form.action = _.options.url;
		_.options.form.submit();

		document.body.removeChild(_.options.form);
	};

    plugin('SmartWorld', SmartWorld, target);

    return SmartWorld;
});
