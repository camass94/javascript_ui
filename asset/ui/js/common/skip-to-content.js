define(['jquery'], function($) {

    // skip to contents 
    $('.skip_nav > a').unbind('click').bind('click', function() {
        var _this = $(this);
        var _target = _this.attr('href');
        //alert($.type($(_target)));
        if (_target && $.type($(_target)) === 'object') {
            $(_target).attr('tabindex', '-1');
        }
        $(_target).focus();
        return false;
    });

});
