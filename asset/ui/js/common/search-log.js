/* LGEPJT-304 : 20171026 add */
define(['jquery'], function($) {

	'use strict';

    var searchLog = {
        init : function() {
            searchLog.bindEvent();
        },

        bindEvent : function() {
        
            $(document).on('click', '[data-search-log]', function(e){
				var data = $.extend({"event":"click", "targetUrl":$(this).attr("href")}, $(this).data('searchLog'));
                sendLog(data);
            });

            var dataObj;
            var userEventType;

            $('[data-search-log-input]').bind('keypress', function(e){
                var eventCode = e.which || e.keyCode;
                if (eventCode == 13) {
                    /* LGEPJT-379 20171205 modify */
					dataObj = $.extend({"event":"enter", "keyValue":encodeURI($(this).val())}, $(this).data('searchLogInput'));
					/*// LGEPJT-379 20171205 modify */
                    userEventType = "enter";
                }
            });

            $('[data-search-log-button]').on('click', function(e) {
                /*input 의 경우 enter와 click 이 동시에 일어남,
                enter의 경우에 userEventType="enter"를 넣어 이후 발생하는 click이벤트에 userEventType을 포함시켜 보냄
                click만의 경우에는 userEvent 값 안넘어감 */
                /* LGEPJT-379 20171205 modify */
				dataObj = $.extend({"userEvent":userEventType, "event":"click", "keyValue":encodeURI($(this).siblings('input[name=search]').val())}, $(this).data('searchLogButton'));
				/*// LGEPJT-379 20171205 modify */
            });
            
            $('[data-search-log-filter]').on('click', function(e) {
                var categoryStr = "";
                $(this).parents(".search-filter").find(".filter-selectbox:not(.sort) .chosen-container .chosen-single > span").each(function(i, el){
                    if(i > 0){
                        categoryStr +=","
                    }
                    categoryStr += $(this).text().match(/.+[^ \(0-9\)]/g);
                });
                dataObj = $.extend({"category":categoryStr,"event":"click"}, $(this).data('searchLogFilter'));
                sendLog(dataObj);
            });

            $(".search-menu form, .search-top-area form").on("submit", function(e){
                sendLog(dataObj);
            });

            function sendLog(dataObj){
                var url = '/' + dataObj.localeCd + '/lgcompf4/endeca/logWrite.lgajax';

                $.ajax({
                    type: 'POST',
                    dataType: 'json',
                    data:dataObj,
                    url:url,
                    async:false,
                    success: function(data, textStatus, xhr){
                        //
                    }
                });
            }
        }
    }

    searchLog.init();

});
/* //LGEPJT-304 : 20171026 add */