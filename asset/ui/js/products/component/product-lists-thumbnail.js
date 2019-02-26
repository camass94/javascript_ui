define(['global-config', 'jquery', 'slick-carousel'], function(globalConfig, $, slick) {

	function thumbnailOver(){ // pc
		$(".thumb-src").each(function(){

			if(!$(this).hasClass("is-loaded")){

				var i = 0;
				var self = $(this);
				var srcArr = $(self).find("img").data("thumb-src");
				var altText = $(self).find("img").attr("alt");
				var interval = null;

				$(self).addClass("is-loaded");

				function changeSrc(){ 
					i++;

					if(i > $(srcArr).length - 1) i=0;
					$(self).find("img").attr({
						"src" : srcArr[i],
						"alt" : altText
					});
				};

				if(srcArr.length > 1){
					$(self).on("mouseover focus", function(){
						clearInterval(interval);
						interval = setInterval(function(){
							changeSrc()
						}, 600);
					});

					$(self).on("mouseleave focusout", function(){
						clearInterval(interval);
						$(self).find("img").attr({
							"src" : srcArr[0],
							"alt" : altText
						});

						i = 0;
					});
				};

				$(self).find("img").error(function(){
					var errorText = $(this).data("error-text");

					$(this).attr("alt", errorText);
				});

			};

		});

	};

	function thumbnailSlick(){ // mobile

		$(".thumb-slick").each(function(){
			var self = $(this);

			if(!$(self).hasClass("slick-slider")){
				$(self).slick({
					lazyLoad: 'progressive',
					arrows: false,
					dots: true,
					customPaging: function(slider, i) {
						return '<div class="dot-nav" data-role="none">'+ (i + 1) +'</div>';
					}
				});
			};

		});

		$('.thumb-slick .slick-dots li .dot-nav').on('click', function(e){
			e.stopPropagation();
			return false;
		});

	};

	// init
	thumbnailOver();
	thumbnailSlick();

	$(document).ajaxComplete(function(e){
		thumbnailOver();
		thumbnailSlick();
	});

});