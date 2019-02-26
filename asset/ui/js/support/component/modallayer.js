/*
    A simple jQuery modal (http://github.com/kylefox/jquery-modal)
    Version 0.5.2
*/

    define(['ic/ic', 'ic/ui/module', 'global-config', 'cs/forms', 'cs/styledform', 'cs/basicmotion', 'cs/scrollbar', 'cs/videoload', 'cs/droplist', 'cs/tabpanel', 'common/social-likes-share', 'support/feedback', 'support/share-email-sms'], function(ic, module, globalConfig, Forms, styledForm, BasicMotion, Modal, videoload, Selectsize, Tabpanel, socialShare, feedback, socialSms) {

        var current = null;
        var eventName = null;
        $.modal = function(el, options) {
            $.modal.close(); // Close any open modals.
            var remove, target;

            this.$body = $('body > .wrapper');
            if (!this.$body.length && $('body > .modal-content')) this.$body = $('body > .modal-content')
            this.hotspot = el || $($(el).chosen());
            this.options = $.extend({}, $.modal.defaults || {}, el.data());
            target = el.data('url') || el.attr('href') || el.val();
            this.documentHeight = $(document).height();
            var dependencyTargetName = el.data('dependency-target-name');
	    	var serviceTypePopSend = el.data('service-type');//LGEBR-3169 20161005 add
            //Select element by id from href
            if (/^#/.test(target) && target != "#") {
                this.$elm = $(target);
                if (this.$elm.length != 1) return null;
                this.block();
                this.open();
                //AJAX
                $('.jquery-modal .roll').spin(false);
            } else {
                this.$elm = $('<div class="modal-layer">');
				/* LGEBR-3169 20161005 add */
                if(lgFilter.locale =="/br" && serviceTypePopSend != undefined){
                	this.$elm = $('<div class="modal-layer byServiceType '+ serviceTypePopSend+ '">');
                }
                //console.log(serviceTypePopSend);
                /* LGEBR-3169 20161005 add */
                var thisBox = this.hotspot.parent()[0].nodeName.toLowerCase();

                this.$body.append(this.$elm);

                remove = function(event, modal) {
                    modal.elm.remove();
                };
                this.showSpinner();
                el.trigger($.modal.AJAX_SEND);
                var _this = this;

                this.block();

                var postSend = this.options.postSend;
                var postData = this.options.postData;

                // step list view my model
                if (!!dependencyTargetName) {
                    postData = {};
                    var dependencyTargetArray = dependencyTargetName.split(',');
                    /* LGEBR3249 */
                    var viewTarget = $('.step-list').data("view");
                    var b2bFlag = $(".step-list").hasClass("btb-repair");

                    if (dependencyTargetArray.length == 1) {
                        var dependencyValue = b2bFlag ? $('.container > div[data-target="' + viewTarget + '"]').find('[name=' + dependencyTargetName + ']') : $('[name=' + dependencyTargetName + ']');
                        dependencyValue.each(function() {
                            var isVisible = $(this).closest('.step').is(':visible');
                            if (isVisible) {
                                postData[dependencyTargetName] = $(this).val();
                            }
                        });
                    }

                    if (dependencyTargetArray.length > 1) {
                        $.each(dependencyTargetArray, function() {
                            var targetName = $.trim(this);
                            var dependencyValue;
                            if (b2bFlag) {
                               if ($('[name=' + targetName + ']').closest('div[data-target]').length > 0) {
                                   dependencyValue = $('.container > div[data-target="' + viewTarget + '"]').find('[name=' + targetName + ']')
                               } else {
                                   dependencyValue = $('[name=' + targetName + ']')
                               }
                            } else {
                                dependencyValue = $('[name=' + targetName + ']')
                            }

                            dependencyValue.each(function() {
                                var isVisible = $(this).closest('.step').is(':visible');
                                if (isVisible) {
                                    postData[targetName] = $(this).val();
                                }
                            });
                        });
                    }
                    /* LGEBR3249 */

                }


                // iframe option
                if (!!this.options.iframe) {
                    var $iframe = $('<iframe></iframe>');
                    var $wrap = $('<div class="modal-content"></div>');
                    $iframe.css({
                        'width': '100%',
                        'height': '850px'
                    });
                    this.$elm.append($wrap);
                    $wrap.append($iframe);

                    $iframe.on('load', function() {
                        $(this.contentDocument).find('[rel="modal:reload"]').on('click', function() {
                            $(this).modal();
                        });
                        $iframe.height($(this.contentDocument).height());
                    });

                    $iframe.attr('frameborder', '0');
                    $iframe.attr('scroll', 'no');
                    $iframe.attr('src', target);

                    this.wrap();
                    this.show();
                    return;
                }

                $.ajax({
                    url: target,
                    data: postData,
                    type: postSend ? "POST" : "GET",
                    success: function(html) {

                        // console.log(html)

                        if (!current) return;
                        el.trigger($.modal.AJAX_SUCCESS);

                        try {
                            current.$elm.empty().append(html).on($.modal.CLOSE, remove);
                            //alert("try");
                        } catch (err) {
                            //alert(err.message);
                            var htmlObj = $(html);
                            htmlObj.find(".content-description").empty();
                            var htmlStr = htmlObj.get(0).outerHTML;
                            current.$elm.empty().append(htmlStr).on($.modal.CLOSE, remove);
                        } finally {
                            //alert("finally");
                        }

                        current.hideSpinner();
                        current.open();
                        $('.jquery-modal .roll').spin(false);

                        styledForm(current.$elm)
                        ic.jquery.plugin('socialShare', socialShare, '[rel="share:open"]');
                        ic.jquery.plugin('basicMotion', BasicMotion, '.modal-layer [data-event]');
                        ic.jquery.plugin('videoLoad', videoload, '.modal-layer .video-box');
                        ic.jquery.plugin('feedback', feedback, '.survey');
                        ic.jquery.plugin('Selectsize', Selectsize, '.selectbox-size');
                        ic.jquery.plugin('tabpanel', Tabpanel, '.modal-layer [data-tab-target-parent]');
                        ic.jquery.plugin('socialSms', socialSms, '[rel="sms:open"]');
                        ic.jquery.plugin('socialSms', socialSms, '[rel="email:open"]');



                        el.trigger($.modal.AJAX_COMPLETE, current.$elm);

                    },
                    error: function() {

                        el.trigger($.modal.AJAX_FAIL);
                        current.hideSpinner();
                        el.trigger($.modal.AJAX_COMPLETE);

                    }
                })

            }

            if($(el).data("onclick")){
                this.modalClick = $(el).data("onclick");
                this.downFileName = $(el).data("file");
            }

        };

        $.modal.prototype = {
            constructor: $.modal,

            access: function() {

                var firstElement = this.$elm.find("a, input:not([disabled='disabled']), button, textarea, *[tabindex='0']").filter(':first');
                var lastElement = this.$elm.find("a, input:not([disabled='disabled']), button, textarea, *[tabindex='0']").filter(':last');

                firstElement = firstElement.hasClass('chosen-single') ? firstElement.parent().find('input') : firstElement;

                this.hotspot = this.hotspot.is('select') ? $('input[aria-describedby="msgSelect' + this.hotspot.data('pin-num') + '"]') : this.hotspot;

                /* LGECI-2422 : 20160607 modify */
                if(!this.$elm.is("#modalAlert")){
                    this.hotspot.off('keydown').on('keydown', $.proxy(function(b) {
                        if (b.keyCode == 9) {
                            if (this.$elm.size() > 0 && this.$elm.find('.close-modal').size() > 0) {
                                b.preventDefault();
                                firstElement.focus();
                                this.hotspot = this.hotspot.is('input[aria-describedby^="msgSelect"') ? $('select.' + $(this.hotspot).attr('aria-describedby')) : this.hotspot;
                            }
                        }
                    }, this));
                }
                /*//LGECI-2422 : 20160607 modify */

                firstElement.on('keydown', $.proxy(function(b) {
                    if (b.keyCode == 9 && b.shiftKey) {
                        if (this.$elm.size() > 0 && $(b.target).hasClass("close-modal") == false) {

                            if (this.$elm.find('.close-modal').size() > 0 && $(b.target).hasClass("modal-inner")) {
                                b.preventDefault();
                                lastElement.focus();
                            }
                        }
                    }
                }, this));

                lastElement.off('keydown').on('keydown', $.proxy(function(b) {
                    if (b.keyCode == 9 && b.shiftKey) {} else if (b.keyCode == 9) {
                        if (this.$elm.size() > 0 && this.$elm.find('.close-modal').size() > 0) {
                            b.preventDefault();
                            firstElement.focus();
                        }
                    }
                }, this));
            },

            open: function() {

                this.wrap();
                this.show();
                this.access();

                if (this.$elm.find('.selectbox').length > 0) {
                    $('.selectbox').chosen();

                    $("[data-change='ajaxLoad']", this.$elm).each(function() {
                        $(this).ajaxLoad()
                    });
                }

                if (this.$elm.find('input').length > 0) {
                    $('input[data-parent], input[data-all]', '.styled-form').styledCheckAll();
                }

                if (this.options.escapeClose) {
                    //ESC Keycode
                    $(document).on('keydown.modal', function(event) {
                        if (event.which == 27) $.modal.close();
                    });
                }

                if (this.options.clickClose) this.$elm.find('.dim').add(this.blocker).click($.modal.close);


                window.onresize = function() {
                    $.modal.resize();
                }

                if (this.$elm.find(".validateForm").length) {
                    ic.jquery.plugin('Forms', Forms, this.$elm.find(".validateForm"));
                }

                // reload link bind
                this.$elm.find('[rel="modal:reload"]').each(function() {
                    var $this = $(this);
                    var url = $this.data('url');
                    $this.on('click', function(e) {
                        e.preventDefault();
                        $this.modal();
                    });
                });

                if (this.$elm.find("#downLink").size()>0) {
                    this.$elm.find("#downLink").attr("onclick",this.modalClick);
                    this.$elm.find("#downLink").attr("adobe-file",this.downFileName);
                }

            },

            wrap: function() {
                this.$elm.find('.modal-inner > div').unwrap().end().wrapInner('<div class="modal-inner" tabindex="0" />')
                this.$elm.find('.empty').remove().end().append('<span class="empty" /> <span class="dim" />');
                $('.empty').css({
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    height: '100%'
                })
                $('.dim').css({
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: 1,
                    width: '100%',
                    height: '100%'
                })
            },

            close: function() {
                this.unblock();
                this.hide();
                $(document).off('keydown.modal');
            },

            block: function() {
                this.$elm.trigger($.modal.BEFORE_BLOCK, [this._ctx()]);
				/* LGETH-609 : 20161019 add */
                if(this.$body.find("[name=inHomeServiceCate]").length){
                	this.options.overlay = "none";
                }
                /*//LGETH-609 : 20161019 add */
                this.blocker = $('<div class="jquery-modal blocker"></div>').css({
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    position: "fixed",
                    zIndex: this.options.zIndex,
                    background: this.options.overlay,
                    opacity: this.options.opacity,
                    display: "none"
                });

                this.$body.append(this.blocker.wrapInner('<div class="roll" />'));
                this.blocker.stop().fadeIn(300).find('.roll').height('100%').spin(true, {
                    color: '#fff'
                });

                this.$elm.trigger($.modal.BLOCK, [this._ctx()]);
            },

            unblock: function() {
                if (this.blocker) this.blocker.stop().fadeOut(100, function() {
                    $(this).remove();
                });
                this.$elm.find('.dim').remove();
            },

            show: function() {

                this.$elm.trigger($.modal.BEFORE_OPEN, [this._ctx()]);
                if (this.options.showClose) {
                    this.closeButton = $('<a href="#close-modal" rel="modal:close" class="close-modal icon-close"><span>' + this.options.closeText + '</span></a>');
                    this.$elm.find('> div').append(this.closeButton);
                }
                this.$elm.addClass(this.options.modalClass + ' current');

                this.$body.append(this.$elm)
                this.$elm.show().trigger($.modal.OPEN, [this._ctx()]);
                this.center();

                $("body").addClass("onModal");

                // scrollbar
                if (!globalConfig.isMobile) {
                    if (this.$elm.outerHeight(true) > 450) {
                        if ($(this.options.modalScroll).find(".scrollbar-outer").size() > 0) {
                            $(this.options.modalScroll).find(".scrollbar-outer").scrollbar();
                        } else {
                            $(this.options.modalScroll).addClass("scrollbar-outer styled-scroll");
                            this.$elm.find(".scrollbar-outer").scrollbar()
                        }
                    }
                }

                this.blocker.find('.roll').remove();

            },

            hide: function() {
                this.$elm.trigger($.modal.BEFORE_CLOSE, [this._ctx()]);
                if (this.closeButton) this.closeButton.remove();
                this.$elm.removeClass('current');
                this.$elm.hide();
                this.$elm.trigger($.modal.CLOSE, [this._ctx()]);
                if (this.hotspot.is('select')) {
                    this.hotspot.trigger('chosen:activate');
                } else {
                    this.hotspot.focus();
                }

                if (!!this.options.modalCloseReset) {
                    $('[name='+ this.options.modalCloseReset +']').val('').trigger('chosen:updated');
                }

                $("body").removeClass("onModal");

            },

            showSpinner: function() {
                if (!this.options.showSpinner) return;
                this.spinner = this.spinner || $('<div class="' + this.options.modalClass + '-spinner"></div>')
                    .append(this.options.spinnerHtml);
                this.$body.append(this.spinner);
                this.spinner.show();
            },

            hideSpinner: function() {
                if (this.spinner) this.spinner.remove();
            },

            center: function() {
                var mxHeight = 850;
                var minusHeight = 0;
                var minusEmpty = 80;
                var windowHeight = document.documentElement.clientHeight - 50;
                var firstElement = this.$elm.find("a, input:not([disabled='disabled']), button, textarea, *[tabindex='0']").filter(':first');
                var modalHeight = this.$elm.find(">div").outerHeight(true);
                var modalWidth = this.$elm.find(">div").outerWidth();
                var thisScrollTop = $(window).scrollTop();
                var spotTop = windowHeight < modalHeight ? thisScrollTop + 50 : (thisScrollTop + (windowHeight - modalHeight) / 2);

                this.$elm.css({
                    position: 'absolute',
                    top: spotTop,
                    left: 0,
                    // left: "50%",
                    width: '100%',
                    // width: Math.min(modalWidth, this.$body.width() * .95),
                    // marginLeft: -(this.$elm.find(">div").outerWidth() / 2),
                    // maxHeight: mxHeight,
                    textAlign: 'center',
                    zIndex: 9999
                });
                firstElement.css("position", "relative");

                if (this.options.modalScroll != null && this.$elm.find(this.options.modalScroll).length && windowHeight < modalHeight) {
                    var scrollElem = this.options.modalScroll.split(".")[1];

                    this.$elm.find(".modal-content").children().each(function() {
                        if ($(this).hasClass(scrollElem) == false) {
                            minusHeight += $(this).outerHeight(true);
                        }
                    });

                    this.$elm.find("> div").css({
                        display: "inline-block",
                        position: 'relative',
                        zIndex: 10,
                        maxWidth: this.options.maxWidth,
                        //maxHeight: mxHeight,
                        textAlign: 'left',
                        verticalAlign: "middle",
                        overflowY: 'hidden',
                        marginTop: 0
                    })

                    this.$elm.find(this.options.modalScroll).css({
                        display: "block",
                        position: "relative",
                        zIndex: 10,
                        maxHeight: mxHeight - minusHeight,
                        overflowY: 'auto',
                        textAlign: 'left',
                        verticalAlign: "middle"
                    });

                } else {
                    this.$elm.find("> div").css({
                        display: "inline-block",
                        zIndex: 10,
                        maxWidth: this.options.maxWidth,
                        //maxHeight: mxHeight,
                        textAlign: 'left',
                        position: 'relative',
                        verticalAlign: "middle",
                        overflow: 'visible',
                        marginTop: 0
                    })
                }

                if (!globalConfig.isMobile) {
                    firstElement.focus();
                }
            },

            targetLayer: function() {
                //console.log(this.$elm);
            },

            //Return context for custom events
            _ctx: function() {
                return {
                    elm: this.$elm,
                    blocker: this.blocker,
                    options: this.options
                };
            }
        };


        $.modal.prototype.target = $.modal.prototype.targetLayer;
        //resize is alias for center for now
        $.modal.prototype.resize = $.modal.prototype.center;

        $.modal.close = function(event) {
            if (!current) return;
            if (event) event.preventDefault();
            current.close();
            current = null;
        };

        $.modal.resize = function() {
            if (!current) return;
            if (!globalConfig.isMobile) current.resize();
        };





        $.modal.defaults = {
            overlay: "#000",
            opacity: 0.75,
            zIndex: 300,
            escapeClose: true,
            clickClose: true,
            closeText: 'Close Window',
            modalClass: "modal",
            spinnerHtml: null,
            showSpinner: false,
            showClose: true,
            modalScroll: null
        };

        // Event constants
        $.modal.BEFORE_BLOCK = 'modal:before-block';
        $.modal.BLOCK = 'modal:block';
        $.modal.BEFORE_OPEN = 'modal:before-open';
        $.modal.OPEN = 'modal:open';
        $.modal.BEFORE_CLOSE = 'modal:before-close';
        $.modal.CLOSE = 'modal:close';
        $.modal.AJAX_SEND = 'modal:ajax:send';
        $.modal.AJAX_SUCCESS = 'modal:ajax:success';
        $.modal.AJAX_FAIL = 'modal:ajax:fail';
        $.modal.AJAX_COMPLETE = 'modal:ajax:complete';

        $.fn.modal = function(options) {
            if (this.length === 1) {
                current = new $.modal(this, options);
            }

            return this;
        };

        // Automatically bind links with rel="modal:close" to, well, close the modal.
        $('.wrapper').on('click', '[rel="modal:close"]', $.modal.close);
        $('.wrapper').on('click change', '[rel="modal:open"]', function(event) {
            if (!(event.type == "click" && event.currentTarget.tagName == "SELECT")) {
                if (!(event.currentTarget.tagName == "SELECT" && event.currentTarget.value == "")){
                	$(this).modal();
                	/*LGEIN-1806 20181001 add*/
                    if(lgFilter.locale == "/in" && !$(".new-banner").hasClass("hidden")){
                    	$(".close-banner").trigger("click")
                    }
                    /*LGEIN-1806 20181001 add*/
                }
                event.preventDefault();
            }
        });



    })
