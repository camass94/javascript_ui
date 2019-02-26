define(['jquery'], function($) {
    'use strict';
	(function($){
        var $repairCenter = $("#repairCenter")
        , $repairForm = $("#repairForm")
        , $repairWrap = $("#center-result-section")
        , ajax = {
            url :$repairCenter.attr("data-query-url"),
            dataType : "html",
            success : function(result){
                $repairWrap.html(result);
            }
        };
        $repairForm.on('submit', function(e){
            e.preventDefault();
            ajax.data = $repairForm.serialize();
            $.ajax(ajax);
        });

    })(jQuery);
});
