/* global define */

/**
 * A module representing a Dog.
 * @module common/dog
 * @requires  common/util
 * @requires  common/animal
 */
define(['ic/ic', 'ic/ui/module', 'common/util'], function(ic, Module, util) {

    'use strict';

    var util = ic.util,
        plugin = ic.jquery.plugin,
        events = ic.events,
        $document = $(document),
        $window = $(window),
        proto;


    var fileDownload = function(el, options) {
        var _ = this;

        // Call the parent constructor
        fileDownload.superclass.constructor.call(_, el, options);

        // selectors
        _.$wrapper = $(el);

        // Default Option
        _.defaults = {};
        _.options = $.extend({}, options, _.defaults, _.$wrapper.data());

        // Event Handlers
        $(el).on('click', $.proxy(_.fileDown, _));

    };

    // util.inherits(AccordionTabs, Tabs);
    util.inherits(fileDownload, Module);
    proto = fileDownload.prototype;


    proto.fileDown = function(event) {
        var _ = this;

        event.preventDefault();
        
        _.link = $(event.currentTarget);
        _.fileBox = _.link.closest('[data-file-download]');

        _.makeForm();
        
        var checkTarget = _.fileBox.data('fileFnc') ? _.link : _.fileBox;
        _.flag = checkTarget.data('flag').toUpperCase();
        _.downtime = checkTarget.data('downtime') || null;
        _.opentime = checkTarget.data('opentime') || null;
        _.fileBox.data('fileFnc') ? _.fileManual() : _.fileEco();

    }


    proto.makeForm = function() {
        var _ = this;

        $('form#formDown').remove();

        if ($('form#formDown').size() == 0) {

            var input = '<input type="hidden" id="DOC_ID" name="DOC_ID" value="' + _.options.doc +'" />';

            if (_.fileBox.data('fileFnc')) {

                _.options.original = _.options.original.replace(" ","_");
                input += '<input type="hidden" id="ORIGINAL_NAME_b1_a1" name="ORIGINAL_NAME_b1_a1" value="' + _.options.original +'" />';
                input += '<input type="hidden" id="what" name="what" value="MANUAL" />';
                input += '<input type="hidden" id="fileId" name="fileId" value="' + _.options.file +'" />';
                input += '<input type="hidden" id="fromSystem" name="fromSystem" value="LG.COM" />';

            } else {

                input += '<input type="hidden" id="ORIGINAL_NAME_b1_a1" name="ORIGINAL_NAME_b1_a1" value="' + _.options.original +'" />';
                input += '<input type="hidden" id="FILE_NAME" name="FILE_NAME" value="' + _.options.file +'" />';
                input += '<input type="hidden" id="TC" name="TC" value="DwnCmd" />';
                input += '<input type="hidden" id="GSRI_DOC" name="GSRI_DOC" value="GSRI" />';

            }

            var form = $('<form />').attr({
                id: 'formDown',
                method: 'get',
                action: ''
            }).append(input);

            $('body').append(form);

            _.form = document.getElementById('formDown');
        }

    }


    proto.fileEco = function(event) {
        var _ = this;

        if (_.flag == "Y") {

            alert(commonMsg['eco'].split('%downtime%').join(_.downtime).split('%opentime%').join(_.opentime));

        } else {

            _.form.method = "get";
            _.form.action = _.fileBox.data('action');
            _.form.target = "_self";
            _.form.submit();

        }

        return false;

    }


    proto.fileManual = function(event){
        var _ = this;
        var extArr = _.options.file.split(".");
        var ext = extArr[extArr.length - 1];
        var userAgent = navigator.userAgent;
        var isMSIE = /Trident|MSIE/.test(userAgent) ? true : false;
        
        if(_.options.fileSystem == 'GCSC'){

            if (ext == "djvu"){

                if (!isMSIE) {

                    alert(commonMsg['djvu']);
                    return;

                }

                _.form.action = _.options.gcscUrl;
                _.form.method = "post";
                _.form.target = "_blank";

            } else {

                if(_.flag == "Y"){

                    alert(commonMsg['eco'].split('%downtime%').join(_.downtime).split('%opentime%').join(_.opentime));
                    return;

                    // if (!isMSIE) {

                    //     alert(commonMsg['djvu']);
                    //     return false;

                    // }

                    // _.form.method = "post";
                    // _.form.target = "_blank";
                    // _.form.action = _.options.gcscUrl;


                } else {

                    //_.form.method = "get";
                    _.form.target = "_self";
                    _.form.action = _.fileBox.data('action');

                }

            }

        } else {

            _.form.target = "_blank";
            _.form.action = _.options.filePath;

        }

        _.form.submit();
        return false;


    }

    plugin('fileDownload', fileDownload, '[rel="file:open"]');


    return fileDownload;

});
