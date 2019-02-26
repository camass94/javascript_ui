define(['jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'mkt/spin'], function($, ic, module, config) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        proto;

    var Forms = function(el, options) {
        var self = this;

        Forms.superclass.constructor.call(self, el, options);
        self.options.onInit = $.proxy(self, 'init');
        self.options.onBuild = $.proxy(self, 'build');
        self.options.onReInit = $.proxy(self, 'reInit');
        self.options.onValidation = $.proxy(self, 'validation');

        self._init();
    };

    var XSSfilters = function(obj) {
        $.each(obj, function(index, field) {
            field.value = XSSfilter(field.value);
        });
        return $.param(obj)
    };

    util.inherits(Forms, module);

    proto = Forms.prototype;

    proto._defaults = {
        action: "",
        type: "get",
        async: true,
        focus: false,
        event: "change",
        responseloc: "self",
        msgElement: "span",
        msgClass: "msg-error",
        selectList: "[data-selected]"
    };

    proto._init = function(a, b) {
        var self = this;
        self.emit('init');

        self.$el = self.el.tagName == 'FORM' ? $(self.el) : $("form", self);
        self.$el.attr("action", self.options.action);

        self.$el.find('input[type="number"]').keydown(function(e) {
            var _self = this;
            if (e.keyCode == "189" || e.keyCode == "69" || e.keyCode == "190") {
                return false;
            } else if (_self.value.length > _self.maxLength - 1) {
                _self.value = _self.value.slice(0, _self.maxLength);
            }
        })

        if (self.$el.attr("method") != '') {
            self.options.type = self.$el.attr("method")
        } else {
            self.$el.attr("method", self.options.type);
        }
        if (self.options.responseloc == "self") {
            self.options.responseloc = self;
        } else {
            self.options.responseloc = "#" + self.options.responseloc;
        }

        self._build()
    };

    proto._build = function() {
        var self = this;
        self.blnSubmit = false;

        self.$el.on("click", 'button[type="submit"], .submit', $.proxy(function(e) {
            e.preventDefault();
            var target = $(e.target);
            self.emit('build');
            self.blnSubmit = true;

            if (!self.validateForm()) {
               self.submitForm();
            }
        }, self));

        self.$el.on("click", 'button[type="reset"], .reset', $.proxy(function(e) {
            e.preventDefault();
            self.resetForm();
        }, self));

        if (self.options.event == "change") {
            self.$el.on("change", "input,select,textarea", $.proxy(function(e) {
                if (self.blnSubmit) {
                    //e.preventDefault();
                    self.validateForm();
                }
            }, this))
        }

        self.$el.on("focus", "input,select,textarea", function(e) {
            var _menuTop = 0;
            var _el = $(this).parent().find(".msg-error") || $(this).closest("span").find(".msg-error") || $(this).closest("span").siblings(".msg-error");
            if (_el.length && _el.is(":visible")) {
                if($(".category-sticky").length){
                    _menuTop = $(".category-sticky").outerHeight(true) + $(".floating-menubox").outerHeight(true);
                } else {
                    _menuTop = 0;
                }
                var _top =  _el.offset().top - _menuTop;

                if (_top < $(window).scrollTop()) {
                    $('html, body').scrollTop(config.isMobile ? $(this).offset().top - _menuTop - 50 : (_el.offset().top - _menuTop - 10));
                }
            }
        });

        $("input[type!='hidden'],select,textarea", self.$el).each(function(n) {
            var $this = $(this);
            var msgbox = $this.siblings(self.options.msgElement + "." + self.options.msgClass);

            if (!msgbox.length && !$this.parent(".styled-checkbox, .styled-radio").length) {
                msgbox = $("<" + self.options.msgElement + " />").addClass(self.options.msgClass).insertAfter($this);
            } else {
                msgbox = $("<" + self.options.msgElement + " />").addClass(self.options.msgClass).appendTo($this.parent(".styled-checkbox, .styled-radio").parent("span"));
            }
        });

        $("[data-toggle-field]", self.$el).each(function() {
            $(this).toggleField(self)
        });

        $("[data-replace-button]", self.$el).each(function() {
            $(this).replaceButton($(this))
        });

        $("[data-copy-button]", self.$el).each(function() {
            $(this).copyForm($(this))
        });

    };

    proto.reInit = function() {
        var self = this;
        self.emit('reInit');
    };

    proto.resetForm = function() {
        var self = this;

        self.$el[0].reset();
        self.$el.find(".selectbox").removeClass("error").trigger("chosen:updated");
        self.$el.find("input[type='checkbox'], input[type='radio']").iCheck("uncheck").iCheck("update");
    };

    proto.submitForm = function(url) {

        var self = this;
        self.submitBtn = self.$el.find('[type="submit"]');
        self.submitBtn.spin(true);
        var pagecall = false;

        $.ajax({
            url: url || self.options.action,
            type: self.options.type,
            data: XSSfilters(self.$el.serializeArray()),

            //method: "post",
            //dataType: "json",

            beforeSend: function() {
                self.$el.addClass("process");
            },
            success: function(data) {
                try {
                    data = $.parseJSON(data);
                } catch (err) {
                    data = data;
                }

                var errorAction = function(){
                    var errs = [];
                    for (var f in data.error) {
                        var target = self.$el[0][f];

                        $(target).addClass("error").siblings(self.options.msgElement + "." + self.options.msgClass).css({
                            bottom: $(target).outerHeight(true) + 5
                        }).html("<i class='icon icon-error'></i>" + data.error[f]).parent("span").css({
                            "position": "relative",
                            "display": "block"
                        });
                        errs.push(target);
                    }

                    errs[0].focus();
                    self.submitBtn.spin(false);
                    $("html > div.page-dimmed").remove();
                }

                if (self.options.responseloc != self) {
                    var tgEl = $(self.options.responseloc);
                    var tgTop = tgEl.offset().top;
                    var winTop = $(window).scrollTop();

                    if(data.url){
                        $.ajax({
                            url: data.url,
                            success: function(data) {
                                $("html > div.page-dimmed").remove();
                                tgEl.empty().append(data);
                            },
                            error: function(xhr, status, thrown) {
                                self.submitBtn.spin(false);
                                $("html > div.page-dimmed").remove();
                                alert(status)
                            }
                        });
                    } else if (data.error) {
                        errorAction();
                    } else {
                        tgEl.empty().append(data);
                    }
                } else {
                    if (data.result) {
                        if(data.url) {
                            location.href = data.url;
                        }
                    } else {
                        if (data.error) {
                            errorAction();
                        }

                    }
                }
            },
            complete: function() {
                if (!pagecall) self.submitBtn.spin(false);
            },
            error: function(xhr, status, thrown) {
                self.submitBtn.spin(false);
                $("html > div.page-dimmed").remove();
                alert(status)
            }
        })
    };


    proto.validateForm = function() {
        var self = this;
        self.emit('validateForm');

        var fldCount = 0;
        var errCount = 0;

        $("input,select,textarea", self.$el).each($.proxy(function(idx, elm) {
            var fld = $(elm);
            var fldStyleForm = fld.parent(".styled-checkbox, .styled-radio");
            var valid = [];
            var types;

            function appendType(type) {
                var _type = typeof type == 'string' ? {
                    type: type
                } : type;

                valid.push(_type);
            }

            fld.removeClass("error");
            fldStyleForm.parent("span").removeClass("error");

            var required = fld.prop("required") || fld.attr("required") || (fld.val() && fld.data("validate") == "enter");
            var fldVisible = fld[0].tagName === "SELECT" && fld.next(".chosen-container").length ? fld.next().is(":visible") : fld.is(":visible");

            if (required && fldVisible && fld.attr("type") != "hidden" && fld.prop("disabled") == false) {

                fldCount++;

                var maxLength = fld.attr("maxlength");
                var minLength = fld.attr("minlength");

                if (maxLength && maxLength != '' && maxLength > 0 && fld.data("error-type") != "between" && fld.data("error-type") != "length" && fld.data("error-type") != "keywords") {
                    appendType({
                        type: "maxlength",
                        length: parseInt(maxLength)
                    })
                }
                if (minLength && minLength != '' && minLength > 0 && fld.data("error-type") != "between" && fld.data("error-type") != "length" && fld.data("error-type") != "keywords") {
                    appendType({
                        type: "minlength",
                        length: parseInt(minLength)
                    })
                }

                if (elm.nodeName == "INPUT") {
                    types = fld.data("rule") || fld.attr("type");
                } else {
                    types = elm.nodeName.toLowerCase();
                }

                if (types.indexOf(",") > -1) {
                    var typeArray = types.split(",");
                    $.each(typeArray, function(idx, type) {
                        return valid.push({
                            type: $.trim(type)
                        });
                    });
                } else if (self.validation[types]) {
                    appendType(types)
                }

                if (required) {
                    appendType('required');
                }

                if (fld.data("match")) {
                    appendType({
                        type: "match",
                        field: fld.data("match")
                    })
                }

                var validCount = valid.length;
                while (validCount--) {
                    var currentValid = valid.pop();
                    var validate;
                    if (currentValid.length) {
                        validate = self.validation[currentValid.type].apply(this, [fld, currentValid.length])
                    } else if (currentValid.field) {
                        validate = self.validation[currentValid.type].apply(this, [fld, currentValid.field])
                    } else {
                        validate = self.validation[currentValid.type].apply(this, [fld])
                    }
                    if (validate != true) {
                        if (!fldStyleForm.length) {
                            fld.addClass("error").siblings(self.options.msgElement + "." + self.options.msgClass).css({
                                bottom: fld.outerHeight(true) + 5
                            }).html("<i class='icon icon-error'></i>" + validate).parent("span").css({
                                "position": "relative",
                                "display": "block"
                            });
                        } else {
                            fldStyleForm.parent("span").addClass("error").find(self.options.msgElement + "." + self.options.msgClass).css({
                                bottom: fldStyleForm.parent("span").outerHeight(true) + 5
                            }).html("<i class='icon icon-error'></i>" + validate).parent("span").css({
                                "position": "relative",
                                "display": "inline-block"
                            });
                        }
                        break;
                    }
                }
            }
        }, this));

        if ($(":focus").is("input,select,textarea")) {
            // $(":focus", self.$el).focus();
        } else {
            var $errEl = self.$el.find(".error").eq(0);

            if ($errEl.hasClass("selectbox") && !$errEl.is("visible")) {
                $errEl.next().find("input").focus();
            } else if ($errEl.find(".styled-checkbox, .styled-radio").length) {
                $errEl.find(".styled-checkbox input, .styled-radio input").focus().parent().addClass('focus');
            } else {
                $errEl.focus();
            }
        }
        return self.$el.find(".error").length;
    };


    proto.validation = {
        email: function(a) {
            var b = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            if (b.test(a.val()) || (!a.attr("required") && !a.is("[required]")) && (!a.val() || a.val() == a.attr("placeholder"))) {
                return true
            } else {
                return ("" + formerror["email"]).split("%title%").join(a.attr("title"))
            }
        },
        tel: function(a) {
            var b = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
            if (b.test(a.val()) || (!a.attr("required") && !a.is("[required]")) && (!a.val() || a.val() == a.attr("placeholder"))) {
                return true
            } else {
                return ("" + formerror["tel"]).split("%title%").join(a.attr("title"))
            }
        },
        text: function(a) {
            if (!a.val() || a.val() != a.attr("placeholder")) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        password: function(a) {
            if (!a.val() || a.val() != a.attr("placeholder")) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        file: function(a) {
            if (a.val() || (!a.attr("required") && !a.is("[required]"))) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        match: function(a, b) {
            if (a.val() != a.attr("placeholder") && a.val() == $('[name="' + b + '"]', a.closest("form")).val()) {
                return true
            } else {
                return ("" + formerror["match"]).split("%title%").join(a.attr("title")).split("%target_title%").join($('[name="' + b + '"]').attr("title"))
            }
        },
        minlength: function(a, b) {
            if (!a.val() || a.val() == a.attr("placeholder") || a.val().length >= b) {
                return true
            } else {
                return ("" + formerror["minlength"]).split("%title%").join(a.attr("title")).split("%target%").join(b).split("%used%").join(a.val().length)
            }
        },
        maxlength: function(a, b) {
            if (!a.val() || a.val() == a.attr("placeholder") || a.val().length <= b) {
                return true
            } else {
                return ("" + formerror["maxlength"]).split("%title%").join(a.attr("title")).split("%target%").join(b).split("%used%").join(a.val().length)
            }
        },
        textarea: function(a) {
            if (a.val() && a.val() != a.attr("placeholder")) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        checkbox: function(a) {
            if (a.prop("checked") || (!a.attr("required") && !a.is("[required]"))) {
                return true
            } else {
                if (a.data('validmsg')) {
                    return a.data('validmsg');
                } else {
                    return ("" + formerror["checkbox"]).split("%title%").join(a.attr("title"));
                }

            }
        },
        radio: function(a) {
            if ($('input[name="' + a.attr("name") + '"]:checked').val() || !a.attr("required")) {
                return true
            } else {
                return ("" + formerror["radio"]).split("%title%").join(a.attr("title"))
            }
        },
        select: function(a) {
            //if (a.val() || (!a.attr("required") && !a.is("[required]")) || !a.find("option[value!='']").length) {
            if (a.val() || (!a.attr("required") && !a.is("[required]"))) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        number: function(a) {
            var b = /^\s*\d+\s*$/;
            if (b.test(a.val().replace(/\(|\)|\-/g, ''))) {
                return true
            } else {
                return ("" + formerror["number"]).split("%title%").join(a.attr("title"))
            }
        },
        date: function(a) {
            if (a.val() || (!a.attr("required") && !a.is("[required]"))) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        required: function(a) {
            var _val = $.trim(a.val());
            if (_val || (!a.attr("required") && !a.is("[required]")) || (!a.find("option[value!='']").length && a[0].tagName == "SELECT")) {
                return true
            } else {
                return ("" + formerror["required"]).split("%title%").join(a.attr("title"))
            }
        },
        length: function(a, b) {
            if (!a.val() || a.val() == a.attr("placeholder") || a.val().length == b) {
                return true
            } else {
                return ("" + formerror["length"]).split("%title%").join(a.attr("title")).split("%target%").join(b)
            }
        },
        invalid: function(a) {
            return ("" + formerror["invalid"]).split("%title%").join(a.attr("title"))
        },
        already: function(a) {
            return ("" + formerror["already"])
        },
        keywords: function(a, b) {
            if (!a.val() || a.val() == a.attr("placeholder") || a.val().length >= b) {
                return true
            } else {
                return ("" + formerror["keywords"]).split("%title%").join(a.attr("title")).split("%target%").join(b)
            }
        },
        postcode: function(a) {
            var b = /^[a-zA-Z0-9]/;
            if (b.test(a.val())) {
                return true
            } else {
                return ("" + formerror["postcode"]).split("%title%").join(a.attr("title"))
            }
        }
    };

    jQuery.prototype.toggleField = function(self) {
        var $this = $(this);
        var toggleTarget = $this.data("toggleField");

        if ($this.is(":checked")) {
            $(toggleTarget).show();
        } else {
            $(toggleTarget).hide();
        }

        $this.bind("change", function() {
            if ($this.is(":checked")) {
                $this.prop("required", true).attr("required", true);
                $(toggleTarget).show();
            } else {
                $this.removeProp("required").removeAttr("required");
                $(toggleTarget).hide();
            }
        });

    };

    jQuery.prototype.replaceButton = function($this) {
        var replaceUrl = $("[data-replace-url]");

        $this.on('click', function(e){
            e.preventDefault();
            replaceUrl.each(function(){
                if($(this).is(':checked')) {
                    var thisUrl = $(this).data('replace-url');
                    location.href = thisUrl;
                }
            })
        })
    };

    jQuery.prototype.copyForm = function($this) {

        $this.on('click', function(e){
            e.preventDefault();

            var copyForm = $("[data-copy-carbon]").find("[data-copy-value]");

            copyForm.each(function(){
                $(this).val($("[data-copy-original]").find('input[name="' + $(this).data('copy-value') + '"]').val());
            })
        })
    };

    ic.jquery.plugin('Forms', Forms, '.commonForm');
    return Forms;
});
