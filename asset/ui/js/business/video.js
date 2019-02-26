define(['jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'chosen', 'lazyload'], function($, ic, Module, gc, chosen, lazy) {

    $('.video-read .util .print a').unbind('click').bind('click', function() {
        window.print();
        return false;
    });

    var isMobile = $("body").is(".is-mobile");
    var videoForm = $(".video-list .board-wrap > form");
    if (videoForm.is('form')) {
        var url = videoForm[0].action,
            videoList = videoForm.find(".board-lists"),
            videoPages = isMobile ? videoForm.find(".list-bottom-button") : videoForm.find(".pages");

        function initVideo() {
            pageTrigger();
            // bind Event in Filter (once)
            videoForm.find(".search-result-toolbox a.btn").on({
                click: function(e) {
                    e.preventDefault();
                    videoForm[0].page.value = 1;
                    if (!isMobile) videoForm[0].pagePosition.value = 1;

                    var filterVal = $(e.currentTarget).closest('.search-filter').find('select').val();
                    var filterTxt = $(e.currentTarget).closest('.search-filter').find('select option:selected').text();
                    videoForm.find('.search-filter select').val(filterVal).eq(1).attr('disabled', 'disabled');
                    $.ajax({
                        url: url,
                        data: videoForm.serialize(),
                        success: function(b) {
                            $b = $(b);
                            if (!isMobile) {
                                videoPages.html($b.filter(".pages").html());
                                videoList.html($b.filter(".board-lists").html());
                            } else {
                                videoPages.html($b.filter(".list-bottom-button").html());
                                videoList.html($b.filter(".board-lists").html());
                            }
                            videoForm.find('.search-filter select').eq(1).removeAttr('disabled');
                            videoForm.find('.search-filter .chosen-single > span').html(filterTxt);
                            $('img.lazy').lazyload();
                            pageTrigger();
                            $("html, body").animate({
                                scrollTop: videoForm.offset().top
                            }, 500);
                        },
                        error: $.proxy(function(d, b, c) {
                            // console.log(d.status, c);
                            return false
                        }),
                    });
                }
            })
        }

        function pageTrigger() {
            // bind Event in Pagenation (all the time)
            videoPages.find("a").on({
                click: function(e) {
                    e.preventDefault();
                    if (!isMobile && $(e.currentTarget).data("page")) { // desktop Page
                        videoForm[0].page.value = $(e.currentTarget).data("page");
                        videoForm[0].pagePosition.value = $(e.currentTarget).data("pageposition");
                    } else {
                        videoForm[0].page.value = $(e.currentTarget).data("page");
                        // if ($(e.currentTarget).hasClass('active')) {
                        //     videoForm[0].page.value = $(e.currentTarget).data("page");
                        // } else {
                        //     return false;
                        // };
                    }

                    var filterVal = $('.search-filter').find('select').eq(0).val();
                    var filterTxt = $('.search-filter').find('select option:selected').eq(0).text();
                    videoForm.find('.search-filter select').val(filterVal).eq(1).attr('disabled', 'disabled');

                    $.ajax({
                        url: url,
                        data: videoForm.serialize(),
                        success: function(b) {
                            $b = $(b);
                            if (!isMobile) {
                                videoPages.html($b.filter(".pages").html());
                                videoList.html($b.filter(".board-lists").html());
                            } else {
                                if ($b.filter(".list-bottom-button").size() > 0) {
                                    videoPages.html($b.filter(".list-bottom-button").html());
                                } else {
                                    videoPages.hide();
                                }
                                videoList.append($b.filter(".board-lists").html());
                            }
                            videoForm.find('.search-filter select').eq(1).removeAttr('disabled');
                            videoForm.find('.search-filter .chosen-single > span').html(filterTxt);
                            $('img.lazy').lazyload();
                            pageTrigger();
                            if (!isMobile) {
                                $("html, body").animate({
                                    scrollTop: videoForm.offset().top
                                }, 500);
                            }
                        },
                        error: $.proxy(function(d, b, c) {
                            // console.log(d.status, c);
                            return false
                        }),
                    });

                }
            });
        }
        initVideo();
    }
});
