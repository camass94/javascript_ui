define(['jquery', 'global-config'], function($, globalConfig) {
	var $el = $(".glossary");
	var $list = globalConfig.isMobile ? $el.find(".list-content") : $el.find(".content-block");

	$el.find("#sortBy").change(function(){
		var id=$(this).val();
		$list.find("dt, dd").hide().removeClass("shown").each(function(){
			if ($(this).data("glossarybu") == id || id =="*") {
				$(this).show();
				$(this).addClass('shown');
				$(this).next().show();
			}
		});

		$list.each(function(){
			if(!globalConfig.isMobile){
				if($(this).find('.shown').size()<1){
					$(this).hide();
				}else{
					$(this).show();
				}
			} else {
				if($(this).find('.shown').size()<1){
					$(this).closest("li").hide();
				} else {
					$(this).closest("li").show();
				}
			}
		});
	});
});