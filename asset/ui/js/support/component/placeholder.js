define(['jquery'], function($) {
    var Modernizr = {};
    var inputElem = document.createElement("input"),
        attrs = {};
    Modernizr.input = (function(props) {
        for (var i = 0, len = props.length; i < len; i++) {
            attrs[props[i]] = props[i] in inputElem;
        }
        return attrs;
    })("autocomplete autofocus list placeholder max min multiple pattern required step".split(" "));

    //var elem = $("input[type='text'], input[type='password'], input[type='email'], textarea");
    var elem = $("input[placeholder],textarea[placeholder]");

    if (!Modernizr.input.placeholder) {
        _attr = elem.attr("placeholder");
        if ((typeof _attr !== typeof undefined && _attr !== false) && !$("#repairCenter").length) {
            $(".wrapper.support").find(elem).each(function() {
                if ($(this).val() == "" && ($(this).attr("placeholder") || $(this).data("placeholder"))) {
                    $(this).after("<span class='msg-placeholder'>" + $(this).attr("placeholder") + "</span>").parent().css({
                        "position": "relative",
                        "display": "block"
                    });
                }
            })

            elem.bind("focus", function() {
                if (!$(this).prop("disabled") && !$(this).prop("readonly")) {
                    $(this).parent().find(".msg-placeholder").hide();
                }
            })

            elem.bind("focusout", function() {
                if ($(this).val() == "") {
                    $(this).parent().find(".msg-placeholder").show();
                }
            })

            $("span.msg-placeholder").bind("click", function() {
                if (!$(this).siblings(elem).prop("disabled") && !$(this).siblings(elem).prop("readonly")) {
                    $(this).hide();
                    $(this).siblings(elem).focus();
                }
            })
        }
    }
});
