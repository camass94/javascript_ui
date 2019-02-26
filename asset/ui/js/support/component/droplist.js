define(['jquery', 'ic/ic', 'ic/ui/module'], function($, ic, module) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        SelectParser,
        proto;

    var Selectsize = function(el, options) {
        var self = this;
        Selectsize.superclass.constructor.call(self, el, options);
        self.el = el;
        self.$item = $(el);
        self.$item.hide();
        self._init();
    };

    util.inherits(Selectsize, module);

    proto = Selectsize.prototype;

    proto._defaults = {
        selected: "select-size-selected"
    };

    proto._init = function(a, b) {
        var self = this;

        self.set_up_html();
        self.results_build();
        self.results_option_build();
        self.$focusinput.on('keyup', $.proxy(self.keydown_checker, self));
        self.$focusinput.on('focusin', $.proxy(self._focusIn, self));
        self.$focusinput.on('focusout', $.proxy(self._focusOut, self));
        self.search_results.on('click', $.proxy(self.search_results_mouseover, self));
    };

    proto.set_up_html = function() {
        var self = this;
        var container_classes, container_props;
        self.sizeHeight = (self.$item.attr("size") * 40);

        container_classes = ["selectbox-size-wrap"];
        container_props = {
            'class': container_classes.join(' '),
            'style': "height: " + self.sizeHeight + "px;",
        };
        self.container = $("<div />", container_props);
        self.container.html('<div class="chosen-search"><input type="text" class="size-focus" autocomplete="off"></div><div class="selectbox-size-container styled-scroll scrollbar-outer minimum"><ul class="chosen-results"></ul></div>');
        self.$item.hide().next(".selectbox-size-wrap").remove().end().after(self.container);
        self.search_container = self.container.find('div.chosen-search').first();
        self.search_results = self.container.find('.chosen-results').first();
        self.selectbox = self.container.find(".selectbox-size-container");
        self.$focusinput = self.container.find("input.size-focus");
        self.droplistBox = $('.selectbox-size-wrap');
    };

    proto.results_build = function() {
        var self = this;
        self.results_data = SelectParser.select_to_array(self.el);
        if (!self.$item.next().find('.scrollbar-outer')) $('.scrollbar-outer').scrollbar();
    };

    proto.results_option_build = function(options) {
        var content, data, _i, _len, _ref;
        content = '';
        var self = this;
        _ref = self.results_data;
        self.droplistBox.find("ul").empty();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            data = _ref[_i];
            content += self.result_add_option(data);
        }

        return content;
    };

    proto._focusIn = function(e) {
        var self = this;
        if (!self.selectbox.find("li").hasClass(self.options.selected)) {
            self.selectbox.find("li:eq(0)").addClass(self.options.selected).siblings().removeClass(self.options.selected);

        }
        self.$item.next().addClass("selectbox-size-active");
    };

    proto._focusOut = function(e) {
        var self = this;
        self.$item.next().removeClass("selectbox-size-active");
    };


    proto.keydown_checker = function(evt) {
        var stroke, _ref1;
        var self = this;
        var nexttarget = self.selectbox.find("li.select-size-selected").next();
        var prevtarget = self.selectbox.find("li.select-size-selected").prev();
        stroke = (_ref1 = evt.which) != null ? _ref1 : evt.keyCode;
        switch (stroke) {
            case 38:

                self.result_key_event(prevtarget);
                evt.preventDefault();
                break;
            case 40:

                self.result_key_event(nexttarget);
                evt.preventDefault();
                break;
        }
    };


    proto.search_results_mouseover = function(evt) {
        var target;
        var self = this;
        target = $(evt.target);
        if (target) {
            evt.preventDefault();
            self.result_do_highlight(target);
            if(!$("body").hasClass("is-mobile")){
               self.$focusinput.focus(); 
            }
        }
    };


    proto.result_do_highlight = function(el) {
        var self = this;
        var high_bottom, high_top, maxHeight, visible_bottom, visible_top;

        if (el.length) {
            self.result_highlight = el;
            self.idx = self.result_highlight.data("option-array-index");
            self.result_size_select(self.idx);
            self.result_highlight.addClass(self.options.selected).siblings().removeClass(self.options.selected);
        }
    };

    proto.result_key_event = function(el) {
        var self = this;
        var high_bottom, high_top, maxHeight, visible_bottom, visible_top;

        if (el.length) {
            self.result_highlight = el;
            self.idx = self.result_highlight.data("option-array-index");
            self.result_highlight.addClass(self.options.selected).siblings().removeClass(self.options.selected);
            self.result_size_select(self.idx);
            maxHeight = self.sizeHeight;
            visible_top = self.search_results.parent().parent().scrollTop();
            visible_bottom = maxHeight + visible_top;
            high_top = self.result_highlight.position().top + self.search_results.parent().parent().scrollTop();
            high_bottom = high_top + self.result_highlight.outerHeight();
            if (high_bottom >= visible_bottom) {
                self.search_results.parent().parent().scrollTop((high_bottom - maxHeight) > 0 ? high_bottom - maxHeight : 0);
            } else if (high_top < visible_top) {
                self.search_results.parent().parent().scrollTop(high_top);
            }

        }
    };


    proto.result_size_select = function(idx) {
        var high, item;
        var self = this;

        self.el.options[idx].selected = true;
        self.selected_option_count = null;
        self.$item.trigger("change", {
            'selected': self.el.options[idx].value
        });
        self.current_selectedIndex = self.el.selectedIndex;
    };


    proto.result_add_option = function(option) {
        var classes, option_el, option_el_a, option_list;
        var self = this;
        option_el = document.createElement("li");
        option_el.style.cssText = option.style;
        option_el.setAttribute("data-option-array-index", option.array_index);
        option_el.innerHTML = option.html;
        if (option.title) {
            option_el.title = option.title;
        }

        self.droplistBox.find("ul").append(option_el);
        self.search_results = self.droplistBox.find('ul').children();
    };




    SelectParser = (function() {
        function SelectParser() {
            this.options_index = 0;
            this.parsed = [];
        }

        SelectParser.prototype.add_node = function(child) {
            if (child.nodeName.toUpperCase() === "OPTGROUP") {
                return this.add_group(child);
            } else {
                return this.add_option(child);
            }
        };

        SelectParser.prototype.add_group = function(group) {
            var group_position, option, _i, _len, _ref, _results;
            group_position = this.parsed.length;
            this.parsed.push({
                array_index: group_position,
                group: true,
                label: this.escapeExpression(group.label),
                title: group.title ? group.title : void 0,
                children: 0,
                disabled: group.disabled,
                classes: group.className
            });
            _ref = group.childNodes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                option = _ref[_i];
                _results.push(this.add_option(option, group_position, group.disabled));
            }
            return _results;
        };

        SelectParser.prototype.add_option = function(option, group_position, group_disabled) {
            if (option.nodeName.toUpperCase() === "OPTION") {
                if (option.text !== "") {
                    if (group_position != null) {
                        this.parsed[group_position].children += 1;
                    }
                    this.parsed.push({
                        array_index: this.parsed.length,
                        options_index: this.options_index,
                        value: option.value,
                        text: option.text,
                        html: option.innerHTML,
                        title: option.title ? option.title : void 0,
                        selected: option.selected,
                        disabled: group_disabled === true ? group_disabled : option.disabled,
                        group_array_index: group_position,
                        group_label: group_position != null ? this.parsed[group_position].label : null,
                        classes: option.className,
                        style: option.style.cssText
                    });
                } else {
                    this.parsed.push({
                        array_index: this.parsed.length,
                        options_index: this.options_index,
                        empty: true
                    });
                }
                return this.options_index += 1;
            }
        };

        SelectParser.prototype.escapeExpression = function(text) {
            var map, unsafe_chars;
            if ((text == null) || text === false) {
                return "";
            }
            if (!/[\&\<\>\"\'\`]/.test(text)) {
                return text;
            }
            map = {
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#x27;",
                "`": "&#x60;"
            };
            unsafe_chars = /&(?!\w+;)|[\<\>\"\'\`]/g;
            return text.replace(unsafe_chars, function(chr) {
                return map[chr] || "&amp;";
            });
        };

        return SelectParser;

    })();

    SelectParser.select_to_array = function(select) {
        var child, parser, _i, _len, _ref;
        parser = new SelectParser();
        _ref = select.childNodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            parser.add_node(child);
        }
        return parser.parsed;
    };


    ic.jquery.plugin('Selectsize', Selectsize, '.selectbox-size');

    return Selectsize;

})
