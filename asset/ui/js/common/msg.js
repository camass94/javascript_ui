define(['jquery'], function($) {
    'use strict';

    function getMsgJson(jsonUrl) {
        $.ajax({
            type: 'get',
            url: jsonUrl,
            async: false,
            dataType: "json",
            success: function(data) {
                if (typeof data === "string") {
                    data = jQuery.parseJSON(data);
                }

                commonMsg = data;
                errorMsg = data.ajaxerror;
                wtbMsg = data.wheretobuy;
            }
        });
    }

    msgJson = "/" + document.getElementsByTagName("html")[0].getAttribute("data-countrycode") + "/" + "js/msg.json";
    getMsgJson(msgJson);

});
