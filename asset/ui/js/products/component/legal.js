define(['jquery', 'chosen'], function($, chosen) {

	/*LGEGMO-4254 20180829 add*/
	function tabInit(){
		var $tab=$("div.tab-style");
		var $tabMenu=$($tab.data("tab-menu")).find("a");
		if ($("#" + $tab.data("active-tab")).length > 0) {
			$("#" + $tab.data("active-tab")).addClass("active");
			$tab.find($("a[data-tab="+$tab.data("active-tab")+"]").parent()).addClass("active");
		} else {
			$($tab.data("tab-panel")).children().eq(0).addClass("active");
		}
		$("#"+$tab.data("active-tab")).addClass("active");
		/*if ($("body").hasClass("is-mobile") && $tab.find("table").length > 0 && !$tab.find(".table-dl").length) {
			$tab.find("table").addClass("no-mobile")
		}*/
		$tabMenu.click(function(e){
			var $this=$(this);
			e.preventDefault();
			$this.parent("li").addClass("active").siblings().removeClass("active");
			$("#"+$this.data("tab")).addClass("active").siblings().removeClass("active");
		});
	}
	tabInit();
	$("#sortby").on("change",function(e){
		var $sortBy=$(this);
		$.ajax({
			url: $sortBy.data("url") + $sortBy.find("option:selected").val(),
			type: "post",
			dataType: "html",
			success: function(response){
                var targetParent = $($sortBy.data("target")).parent();
				$($sortBy.data("target")).remove();
				targetParent.append(response);
				tabInit();
			}
		});
	});
	/*//LGEGMO-4254 20180829 add*/

    var _legal = $('.legal-contents');
    if ($('body').hasClass('is-mobile')) {
        if ($('body').find('.legal').hasClass('patent')) {
            return;
        }

        _legal.find('h2').each(function() {
            $(this).find('span').css('width', '90%');
            $(this).append('<span class="tab-button"><a href="#"><i class="icon icon-menu-plus"></i></a></span>')
        });

        _legal.find('h2').click(function() {
            if ($(this).find('.tab-button').hasClass('active')) {
                $(this).find('.tab-button').removeClass('active');
                $(this).find('.tab-button i').removeClass('icon-menu-minus').addClass('icon-menu-plus');
                $(this).next().stop(true, false).slideUp('fast');
            } else {
                $(this).find('.tab-button').addClass('active');
                $(this).find('.tab-button i').removeClass('icon-menu-plus').addClass('icon-menu-minus');
                $(this).next().stop(true, false).slideDown('fast');
            }
            return false;
        });
    }

    if (_legal.parent().parent().hasClass('patent') == true) {
        var def = $('.sort-patent').html();

        function makeList(va) {
            //$('.sort-box .chosen-container-single').remove();
            $('.sort-patent').empty().append(def);
            _legal.find('.content-block').each(function() {
                var _selectText = $(this).find('h3 span').text();
                $('.sort-patent').append('<option value="' + _selectText + '">' + _legal.find('h2').eq(0).html() + '-' + _selectText + '</option>');
            });
            if (va == 1) $('.patent').find('.sort-patent').chosen({
                disable_search: false
            });
            else $('.patent').find('.sort-patent').trigger('chosen:updated');
            $('.patent').find('.sort-patent').unbind('change').bind('change', function(evt, params) {
                var _selected = params.selected;
                if (_selected == '') {
                    //return false;
                    _legal.find('.content-block').show();
                } else {
                    _legal.find('.content-block').hide();
                    _legal.find('.content-block').each(function() {
                        var _selectText = $(this).find('h3 span').text();
                        if (_selected == _selectText) {
                            $(this).show();
                        }
                    });
                }
            });
        }
        makeList(1);
        //$('.patent-all').click(function(){
        //_legal.find('.content-block').show();
        //makeList(0);
        //$('.patent').find('.sort-box').find('option').removeAttr('selected').eq(0).prop('selected', true);
        //$('.patent').find('.sort-patent').trigger('chosen:updated');

        /*
        $('.patent').find('.chosen-single > span').text('Select patent');
        $('.chosen-results li').removeClass('result-selected');
        $('.chosen-results li').eq(0).addClass('result-selected');
        */
        return false;
        //});
    }

});
