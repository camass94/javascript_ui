define(['ic/ic'], function(ic) {
    'use strict';

    var Accordion = function(el, option) {
        this.$el = $(el);
        this.$items = this.$el.find('.item');
        this.option = {
            onlyOne: false
        };
        this.init();
    };

    var proto = {
        init: function() {
            this.$el.on('click', '.item [do=toggle]', ic.$.proxy(this.toggleItem, this));
        },
        toggleItem: function(e) {
            var $item = $(e.currentTarget).closest('.item');
            if ($item.hasClass('active')) return this.close($item);

            this.activeIndex = $item.index();

            $item.addClass('active');
            $item.find('.contents').slideDown();
            this.switchClass($item);
            this.setAnother();
        },
        switchClass: function(el) {
            el.find('[do=toggle] i')
            .toggleClass('icon-pagenav-down')
            .toggleClass('icon-pagenav-up');
        },
        setAnother: function() {
            if (!this.option.onlyOne) return;
            var el = this.$el.find('.item:not(:eq('+this.activeIndex+').active)');
            this.close(el);
        },
        close: function(el) {
            el.find('.contents').slideUp();
            el.removeClass('active');
            this.switchClass(el);
        }
    };

    ic.$.extend(Accordion.prototype, proto);
    ic.jquery.plugin('accordion', Accordion, '[role="accordion"]');
    return Accordion;
});
