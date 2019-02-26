define(['ic/ic', 'ic/ui/module'], function(ic, Module) {
    var proto,
        events = ic.events;

    var videoLoad = function(el, options) {
        var self = this;
        // Call the parent constructor
        videoLoad.superclass.constructor.call(self, el, options);
        self.appendVideo();
    };

    // Inherit from Module
    ic.util.inherits(videoLoad, Module);

    // Alias the prototype for less typing and better minification
    proto = videoLoad.prototype;

    proto._defaults = {
        videoContent: ".video-box",
        videoId: 3811035969001,
        videoAccount: 1432358930001,
        videoPlayer: "default",
        videoTitle: null
    };

    proto.appendVideo = function() {
        var self = this;
        var playerHTML = "";
        /* LGEGMO-4062 */
        playerHTML = '<iframe src="https://players.brightcove.net/' + self.options.videoAccount + '/' + self.options.videoPlayer + '_default/index.html?videoId=' + self.options.videoId + '"title="' + self.options.videoTitle + '" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';
        /*//LGEGMO-4062 */
        $(self.options.videoContent).empty().append(playerHTML);
    }

    ic.jquery.plugin('videoLoad', videoLoad, '.video-box');

    return videoLoad;

})
