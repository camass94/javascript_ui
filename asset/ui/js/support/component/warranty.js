define(['jquery', 'global-config'], function(jquery,config) {
	$(function(){
		var StaticTabpanel = function(el){
			var element = $(el);
			var contents = $(el).data('tabpanel');
			var accordionFlag = true;
			var tabpanel = {
				options : {
					activeClass : 'active',
					sticky : 'div.sticky-tab',
					accordion : 'a[data-toggle]'
				},
				init: function(el){
					var self = this;
					$.extend(self.options, element.data());
					$(self.options.tabMenu).find('a').on('click', $.proxy(self.activeTab, self))
					$(self.options.tabMenu).find('li.active a').trigger('click');

					if($(contents).find(self.options.sticky).length > 0) { $(window).on('scroll.stickyNav', $.proxy(self.stickyNav, self)); }
					if($(contents).find(self.options.accordion).length > 0) {
						$(contents).find(self.options.accordion).on('click.accordionHandler', $.proxy(self.accordionHandler, self));
					}
				},
				activeTab: function(event){
					var self = this;
					var tab = $(event.currentTarget);
					var tabContent = tab.data('tab');
					var tabContentBox = $(contents).find('#' + tabContent);

					event.preventDefault();

					tab.parent().addClass(self.options.activeClass).siblings().removeClass(self.options.activeClass);
					tabContentBox.show().siblings().hide();

					if($(contents).find(self.options.accordion).length > 0) {
						self.accordionInit(tabContentBox);
					}
					
				},
				accordionInit: function(tabContentBox){
					var self = this;
					var flag = true;

					tabContentBox.find(self.options.accordion).each(function(){
						var tabOption = $(this).data();
						if (flag) {
							$(this).addClass(self.options.activeClass);
							$(tabOption.target).show();
							flag = false;
						} else {
							$(this).removeClass(self.options.activeClass);
							$(tabOption.target).hide();
						}
					})
				},
				accordionHandler: function(type){
					var self = this;
					var tab = $(event.currentTarget);
					var tabOption = tab.data();
					var target = tabOption.actionParent ? $(tab).parents(tabOption.actionParent).find(tabOption.target) : $(tabOption.target);

					if (accordionFlag) {
						accordionFlag = false;

						if (tab.hasClass(tabOption.activeClass)) {
							tab.removeClass(tabOption.activeClass);
							tabOption.transition = 'slideUp';
						} else {
							tab.addClass(tabOption.activeClass);
							tabOption.transition = 'slideDown';
						}

						target[tabOption.transition](tabOption.transitionSpeed, function(){
							accordionFlag = true;
						});
					
						event.preventDefault();

					} else {
						return false;
					}
				},
				stickyNav: function(event){
					var self = this;
					var scroll = $(event.currentTarget).scrollTop();
					var stickyTitle = $(contents).find(self.options.sticky);

					stickyTitle.each(function() {
	                    var fixedOffsetTop = $(this).offset().top;
	                    var limitOffsetTop = $(this).next(self.sticky).length > 0 ? $(this).next(self.sticky).offset().top : $(this).outerHeight(true) + $(this).offset().top;

	                    if (fixedOffsetTop < scroll && limitOffsetTop > scroll) {
	                    	if ($(this).find('.tit-point.fixed').length == 0) {
	                    		$(this).find(".tit-point").clone().prependTo($(this)).addClass('fixed');
	                    	}
	                        // $(this).find(".tit-point")
	                    } else {
	                    	if ($(this).find('.tit-point.fixed').length > 0) {
	                    		$(this).find(".tit-point.fixed").remove();
	                    	}
	                        //$(this).find(".tit-point").removeClass('fixed');
	                    }
	                })
					
				}

			}.init(el);
		}('[data-tabpanel]');
	})

});