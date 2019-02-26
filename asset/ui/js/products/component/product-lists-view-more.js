/* global define */

/**
 * Product List Carousel module.
 * @module products/prodcuts-lists-view-more
 * @requires ic/ic
 * @requires ic/ui/module
 */


define(['global-config', 'jquery'], function(globalConfig, $) {

    'use strict';


    var productViewMore = {};

    $('.product-lists.no-carousel').each(function(idx, item) {

        var listLocation;
        var listId = "product-list-no-carousel" + idx;
        this.id = listId;

        listLocation = "#" + listId;

        var numberOfSlidesToShow = 6;

        var numberOfProductsAvailable = $(listLocation + " .product").length;


        if (typeof $(this).attr('data-slides-to-show') !== "undefined") {
            numberOfSlidesToShow = $(this).attr('data-slides-to-show');
        }

        if (numberOfProductsAvailable <= numberOfSlidesToShow) {
            //hide the button if not enough products
            //$(listLocation).find(".view-more").hide();
        } else {
            //loop thru products, hide the extra until "view-more" click
            //$(listLocation + " .product").each(function(i) {
            //    if (i > numberOfSlidesToShow - 1) {
            //        $(this).hide();
            //    }
            //});
        }
    });

    /*
	$(".view-more").click(function(e) {
        e.preventDefault();

        var sectionId = "#" + $(this).closest('section').attr('id');

        $(sectionId + " .product").fadeIn("slow");

        //hide the button since all are shown
        $(this).fadeOut("slow");
    });
	*/

    return productViewMore;
});
