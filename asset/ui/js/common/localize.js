require(['jquery'], function($) {
    'use strict';
    /*LGEGMO-4757 20190115 modify*/
    var localCountry = document.getElementsByTagName("html")[0].getAttribute("data-countrycode");
    $.getScript("/"+localCountry+ '/js/local.js').fail(function(xhr){
    	/*//LGEGMO-4757 20190115 modify*/
       // xhr.abort();
    });

});
