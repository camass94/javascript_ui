define([], function() {
    //console.log('global-config');
    var config = {
        isMobile: Boolean(document.body.className && new RegExp("(^|\\s)is-mobile(\\s|$)").test(document.body.className))
    };
    //console.log('isMobile:', config.isMobile);
    return config;
});
