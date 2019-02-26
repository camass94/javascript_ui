/**
 * The tabpanel module.
 * @module support/component/
 * @requires ic/ic
 * @requires ic/ui/module
 */

define(['jquery', 'ic/ic', 'ic/ui/module'], function($, ic, Module) {

    var Fileupload = function(el, options) {
        var self = this;
        var element = el;
        var defaults = {
            fileParent: null,
            fileButton: null,
            fileTarget: null
        };

        Fileupload.superclass.constructor.call(self, el, options);
        self.options = $.extend(defaults, self.options);

        if (self.options.fileTarget == null) {
            uploadActive();
        } else {
            uploadTargetActive();
        }


        function uploadActive() {
            var targetParent = self.options.fileParent;
            var targetButton = self.options.fileButton;
            var targetWrap = self.options.fileWrap || self.options.fileParent;

            $(targetWrap).on('click', targetButton, function(e) {
                var parent = $(this).closest(targetParent);
                $("input[type='file']", parent).click();
                e.preventDefault();
            });

            $(targetWrap).on('change', "input[type='file']", function (e) {
                var $this = $(e.target);
                var $parent = $this.parents(targetParent);
                $('.btn-cancel', $parent).prop('disabled', !$this.val());

                var _file = $(e.target).val();
                if (!_file) return;
                var fileName = _file.split('\\')[_file.split('\\').length-1];
                var fileType = fileName.split('.')[fileName.split('.').length-1].toLowerCase();
                var fileSize = $(e.target)[0].files ? $(e.target)[0].files[0].size : 1;
                var availableFileType = $(this).data('file-type').split('|');
                var errorMsg = $(this).data('error');

                if (availableFileType.indexOf(fileType)+1 && fileSize) {
                    $(this).closest(targetParent).find("input[type='text']").val(fileName);
                    $(this).closest(targetParent).find(".msg-placeholder").hide();
                    $(this).closest(targetParent).find("input[type='text']").removeClass('error');
                    $(this).closest(targetParent).find(".msg-error").html("");
                } else {
                    $(this).closest(targetParent).find("input[type='text']").add($(this)).val('');
                    //modalAlert(errorMsg);
                    $(this).closest(targetParent).find("input[type='text']").addClass('error').siblings(".msg-error").css("bottom", "45px");
                    $(this).closest(targetParent).find(".msg-error").html("<i class='icon icon-error'></i>" + errorMsg);
                    $(this).closest(targetParent).find("input[type='text']").focus();
                    return false;
                }
            }).on('click', '.btn-cancel', function(e) {
                var $textEl = $('[type="text"]', this.parentElement);
                var $fileEl = $('[type="file"]', this.parentElement);
                if (/MSIE/.test(navigator.userAgent)) {
                    $fileEl.replaceWith($fileEl.clone(true));
                    $textEl.val('');
                } else {
                    $fileEl.val('');
                    $textEl.val('');
                }
            });
        }

        function uploadTargetActive() {
            var targetParent = self.options.fileParent;
            var targetButton = self.options.fileButton;
            var targetFileId = self.options.fileTarget;
            var targetCancel = self.options.fileCancel;

            $(targetButton).bind("click", function(e) {
                $("#" + targetFileId).click();
                e.preventDefault();
            });

            $("#" + targetFileId).change(function() {
                var dataFile = $(this).val().split('\\');
                var reg = "\.(" + $(this).data('file-type') + ")";
                var errorMsg = $(this).data('error');

                if (new RegExp(reg, "i").test(dataFile)) {
                    $(targetParent).find("input[type='text']").val(dataFile[dataFile.length - 1]);
                    $(targetParent).find(".msg-placeholder").hide();
                } else {
                    $(targetParent).find("input[type='text']").add($(this)).val('');
                    $(targetParent).find("input[type='text']").addClass('error').siblings(".msg-error").css("bottom", "45px");
                    $(targetParent).find(".msg-error").html("<i class='icon icon-error'></i>" + errorMsg);
                    $(targetParent).find("input[type='text']").focus();
                    return false;
                }
            });

            if (!!targetCancel) {
                $(targetCancel).on('click', function() {
                    var $textEl = $(targetParent).find("input[type='text']");
                    var $fileEl = $("#" + targetFileId);
                    if (/MSIE/.test(navigator.userAgent)) {
                        $fileEl.replaceWith($fileEl.clone(true));
                        $textEl.val('');
                    } else {
                        $fileEl.val('');
                        $textEl.val('');
                    }
                });
            }
        }
    };

    ic.util.inherits(Fileupload, Module);
    ic.jquery.plugin('fileupload', Fileupload, '[data-file-parent]');

    return Fileupload;
});
