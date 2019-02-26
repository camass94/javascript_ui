define(['ic/ic','global-config', 'jquery', 'common/tooltip','jquery.cookie'], function(ic,globalConfig, $,tooltip) {

    'use strict';
    /*LGEGMO-3687 20171129 modify*/
 
    var lgLanguage = {
    	target : $('.language-select'),
        footer: $('div.country-select a'),
    	cookieName : 'LG4_LANGUAGE',
    	local:$('.nomrgRight'),
    	localIp:function(){
    		var _ = this;
    		if(_.local.data("localIp")){
				$.ajax({
	                url: _.local.data("url"),
	                type: "post",
	                success: function(d) {
	                	_.local.find('form').append(d);
	                	ic.jquery.plugin('tooltipLayer', tooltip,  _.local.find('.tooltip-btn'));
	                	_.init();
	                	
	                }
				});
				
    		}else{
    			_.init();
    		}
    	},
    	init : function(){
    		var _ = this,
    			moveBtn =  _.target.find('a.go');
    			moveBtn.on('click', $.proxy(_.move, _));
                _.footer.on('click', function(event){
                    moveBtn.trigger('click');
                    event.preventDefault();   
                });
    	},
    	move : function(event){
    		var _ = this,
    			selectVal = _.target.find('a.go').data('country');
				
			$('input[name=countryVal]').val(selectVal);
			_.target.submit();

    		event.preventDefault();

    	}
    };
    
    lgLanguage.localIp();
	
    /*//LGEGMO-3687 20171129 modify*/
});
