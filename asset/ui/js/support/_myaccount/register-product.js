/**
 * The support myaccount module.
 * @module support/support.myaccount
 */

define(['ic/ic', 'lodash', 'cs/model-browser', 'cs/fileupload', 'cs/spin'], function(ic, _, ModelBrowser, FileUpload) {
    'use strict';

    var isMobile = $('body').hasClass('is-mobile');

    var RegisterProduct = function(el, option) {
        this.$el = $(el);
        this.$form = $('form', el);
        this.modelBrowser = this.$form.find('.model-browser');
        this.originalHeight = this.modelBrowser.height();
        this.minHeight = this.modelBrowser.css('min-height');
        this.addedCount = 0;
        this.data = [];
        this.place = 'home';
        this.init();
    };

    var proto = {
        init: function() {
            var selectBox = this.modelBrowser.find('.model-selectbox');
            var searchBox = this.modelBrowser.find('.model-searchbox');

            if (!isMobile) {
                selectBox.css({height: this.modelBrowser.height()});
                searchBox.css({height: this.modelBrowser.height()});
            }

            this.$form.on('change','[role="installPlace"]:checked', $.proxy(this.togglePlace, this));
            this.$form.on('click','[role="addProduct"]', $.proxy(this.addHandler, this));
            this.$form.on('click','[role="edit"]', $.proxy(this.enterEditMode, this));
            this.$form.on('click','[role="delete"]', $.proxy(this.deleteItem, this));
            this.$form.on('click','[role="save"]', $.proxy(this.saveHandler, this));
            this.$form.on('click','[role="submit"]', $.proxy(this.submitHandler, this));

            this.$form.on('change','.select-model', $.proxy(this.toggleHeight, this));
            this.$form.on('click','.closebutton', $.proxy(this.toggleHeight, this));
            this.$form.on('change','#warrantyStartDate', $.proxy(this.changeStartDate, this));

            this.$form.on('modelBrowser:selectedModel.select', $.proxy(this.selectModel, this));
            this.$form.on('modelBrowser:selectedModel.search', $.proxy(this.selectModel, this));
            this.$form.on('modelBrowser:deselectModel.select', $.proxy(this.deSelectModel, this));
            this.$form.on('modelBrowser:deselectModel.search', $.proxy(this.deSelectModel, this));
        },

        changeStartDate: function(e) {
            var date = $(e.target).val();

            $('.item-set', this.$form).last()
                .find("#warrantyExpireDate")
                .val("").data('datepicker', false)
                .attr('data-startDate', date);
        },

        checkSelectedModel: function() {
            var confirmText = this.$form[0].confirmText.value;
            var isSelected = this.$el.find('.model-browser').hasClass('open');

            if ((this.addedCount || isSelected) && !confirm(confirmText)) {
                return false;
            } else {
                return true;
            }
        },

        togglePlace: function(e) {
            var $form = this.$form;
            var $item = $(e.currentTarget);
            var place = this.place = $item.attr('place');
            var another = place === 'home' ? 'business' : 'home';
            var reqToggleEl = this.$form.find("[required-when]");

            function lackInformation(res) {
                return location.assign(res.url);
            }

            function finalize() {
                $('[rel='+place+']', $form).toggle(true);
                $('[rel='+another+']', $form).toggle(false);
                $('.got-another', $form).toggle((place==='business'));
            }

            reqToggleEl.each(function(idx, el, list) {
                var _el = $(el);
                var status = _el.attr('required-when') === place;

                _el.find('.highlight').toggle(status);
                _el.find(':input').prop('required', status);
            });

            if (!this.checkSelectedModel()) {
                setTimeout(function() {
                    $form.find('input[place='+place+']').removeAttr('checked', false);
                    $form.find('input[place='+another+']').prop('checked', true);
                    $form.find('input[type=radio]').iCheck('update');
                });
                return;
            }

            if (place === 'home') {
                this.$form.find('[role="submit"]').attr('type', 'submit');
                this.reset();
                return finalize();
            }

            this.$form.find('[role="submit"]').attr('type', 'button');

            $.ajax({
                method: 'post',
                url: $item.data('url'),
                data: {},
                dataType: 'json',
                success: function (res) {
                    if (!res.result) lackInformation(res);
                    else finalize();
                }
            });

            this.reset();
        },

        extractData: function(el) {
            var scope = el || $('.item-set:last .form', this.$form);
            var data = {cid: $(el).parents('.item-set').index()};
            $(':input:not(button)', scope).each(function(idx, input) {
                if (!input.name) return;
                data[input.name] = input.value || "";
            });
            data.filePath = $('.model-view-image', scope).attr('src');
            return data;
        },

        isExist: function(model) {
            /* PJTBTOBCSR-251 */
            var _data = {serialNumber: model.serialNumber};
            if (model.modelNum) { _data.modelNum = model.modelNum; }
            if (model.keyword) { _data.keyword = model.keyword; }
            var data = this.data[_.findIndex(this.data, _data)];
            /* //PJTBTOBCSR-251 */

            if (!data) return false;
            return data.cid === model.cid ? false : true;
        },

        addHandler: function(e) {
            this.$form.one('form:validate:success', $.proxy(this.addProduct, this));
            this.$form.one('form:validate:fail', $.proxy(function() {
                this.$form.off('form:validate:success')
            }, this));
            this.$form.trigger('form:validate', e);
        },

        addProduct: function(e, originEvent) {
            var $item = $(originEvent.currentTarget).closest('.item-set');
            var itemId  = 'item-' + Date.now();
            var clone = $($item.clone());
            var data = this.extractData($item.find('.form'));
            var buttons = $('#buttonTmpl').html();
            /* LGEUK-1522 : 20170808 add */
            var keys = Object.keys(data);
           
            for(var i=0; i<keys.length; i++) {
				var _name = keys[i];
				if(_name != "cid"){
					var _val = data[_name];
				    if ((_val !="" && _val != undefined) && (_val.indexOf("<script>") > -1||_val.indexOf("</script>") > -1)) {
				        alert("Value of the field ["+ _name +"] contains invalid character. Remove special character");
				        $item.find("input[name='"+ keys[i] +"']").focus();
				        return false;
				    }
				}			   
			}
            /* //LGEUK-1522 : 20170808 add */
            if (this.isExist(data)) return alert($(originEvent.currentTarget).attr('exist-text'));

            clone.attr('id', itemId);
            clone.find(':input').val("");
            clone.find('#purchaseInfo :input').prop("disabled", true);
            clone.find('[role="addProduct"]').prop('disabled', true);
            clone.find('.model-browser').html($("#modelBrowserTemplate").html());

            clone.find('.selectbox').val("").chosen();
            clone.find('.selectbox:not(".select-model")').ajaxLoad();

            this.data.push(data);
            this.addedCount += 1;

            $item.find('.got-another').remove();
            $item.find('.form fieldset#purchaseInfo').append(buttons);

            if (this.addedCount < 5) {
                !isMobile && $item.after(clone.fadeIn());
                isMobile
                    && $item.after(clone)
                    && setTimeout(function() {
                        clone.find('.btn-close').css('top', clone.find('.model-searchbox').outerHeight()-30 + 'px');
                        $("html, body").scrollTop(clone.offset().top);
                    }, 100);
            } else {
                $item.after(clone.hide());
                this.formHide($item);
                isMobile && setTimeout(function() {
                    $("html, body").animate({scrollTop:$item.offset().top}, 250);
                }, 100);
            }

            new ModelBrowser('#' + itemId + ' .model-browser');
            new FileUpload('#' + itemId + ' [data-file-parent]');
            
            this.refreshForm(clone);
            this.fold($item, true);
        },

        enterEditMode: function(e) {
            var $item = $(e.currentTarget).closest('.item-set');
            var _able = true;

            $item.siblings().each($.proxy(function(idx, el) {
                if (!$(el).hasClass('editing')) return;
                _able = false;
                this.cancelEditMode(el, $item[0]);
            }, this));

            if (!_able) return;
            $item.addClass('editing');
            this.fold($item, false);
        },

        temporarySave: function(e, originalEvent) {
            var $item = $(originalEvent.currentTarget).closest('.item-set');
            var data = this.extractData($item.find('.form'));

			/* LGEUK-1522 : 20170808 add */
			var keys = Object.keys(data);
			
			for(var i=0; i<keys.length; i++) {
				var _name = keys[i];
				if(_name != "cid"){
					var _val = data[_name];
				    if ((_val !="" && _val != undefined) && (_val.indexOf("<script>") > -1||_val.indexOf("</script>") > -1)) {
				        alert("Value of the field ["+ _name +"] contains invalid character. Remove special character");
				        $item.find("input[name='"+ keys[i] +"']").focus();
				        return false;
				    }
				}
			   
			}
			/* //LGEUK-1522 : 20170808 add */
            if (this.isExist(data)) return alert($(originalEvent.currentTarget).attr('exist-text'));

            this.$form.find('.item-set:last :input:not("button")').attr('ignore', false);
            this.data[$item.index()] = data;
            $item.removeClass('editing');
            this.fold($item, true);
        },

        saveAndOpen: function(el, item) {
            var $item = $(el);
            var data = this.extractData($item.find('.form'));

			/* LGEUK-1522 : 20170808 add */
			var keys = Object.keys(data);
			
			for(var i=0; i<keys.length; i++) {
				var _name = keys[i];
				if(_name != "cid"){
					var _val = data[_name];
				    if ((_val !="" && _val != undefined) && (_val.indexOf("<script>") > -1||_val.indexOf("</script>") > -1)) {
				        alert("Value of the field ["+ _name +"] contains invalid character. Remove special character");
				        $item.find("input[name='"+ keys[i] +"']").focus();
				        return false;
				    }
				}			   
			}
			/* //LGEUK-1522 : 20170808 add */
            if (this.isExist(data)) return alert($item.find('[role=save]').attr('exist-text'));

            this.$form.find('.item-set:last :input:not("button")').attr('ignore', false);
            this.data[$item.index()] = data;
            $item.removeClass('editing');
            this.fold($item, true);
            $(item).addClass('editing');
            this.fold($(item), false);
        },

        cancelEditMode: function(el, $item) {
            var _this = this;
            $(el).one('temp', function(e) {
                _this.$form.find('.item-set:last :input:not("button")').attr('ignore', true);
                _this.$form.one('form:validate:success', $.proxy(_this.saveAndOpen, _this, el, $item));
                _this.$form.one('form:validate:fail', $.proxy(function() {
                    _this.$form.find('.item-set:last :input:not("button")').prop('ignore', false);
                    _this.$form.off('form:validate:success');
                }, _this));
                _this.$form.trigger('form:validate', e);
            }).trigger('temp');
        },

        saveHandler: function(e) {
            this.$form.find('.item-set:last :input:not("button")').attr('ignore', true);
            this.$form.one('form:validate:success', $.proxy(this.temporarySave, this));
            this.$form.one('form:validate:fail', $.proxy(function() {
                this.$form.find('.item-set:last :input:not("button")').prop('ignore', false);
                this.$form.off('form:validate:success');
            }, this));
            this.$form.trigger('form:validate', e);
        },

        deleteItem: function(e) {
            var $item = $(e.currentTarget).closest('.item-set');
            $item.slideUp(350, function() {$item.remove();});
            this.data.splice($item.index(), 1);

            if (this.addedCount >= 5) {
                this.addedCount -= 1;
                this.formShow();
            } else {
                this.addedCount -= 1;
            }
        },

        fold: function(el, flag) {
            var summary = $('.summary', el);
            var form = $('.form', el);
            var data = this.data[$(el).index()];
            var _opener = $('.model-browser', form).hasClass('selectbox-on') ? '.model-selectbox' : '.model-searchbox';
            var modelName = data.modelNum || data.keyword || data.search;

            data.href = form.find(_opener+' .model-view-detail > a').attr('href');
            
            if (flag) {
                $('.thumb img', summary).attr('src', data.filePath);
                $('.modelNum a', summary).attr('href', data.href);
                $('.modelNum a', summary).html(modelName);
                $('.serialNum span', summary).html(data.serialNumber);
                $(el).addClass('closed');
                !isMobile && summary.slideDown(300);
                !isMobile && form.slideUp(200);
                isMobile && summary.show();
                isMobile && form.hide();
            } else {
                $(el).removeClass('closed');
                !isMobile && form.slideDown(300);
                !isMobile && summary.slideUp(200);
                isMobile && form.show();
                isMobile && summary.hide();
            }
        },

        selectModel: function(e) {
            $('[role="addProduct"]', this.$form).prop('disabled', false);
            $('.item-set', this.$form).last().find('#purchaseInfo :input').prop("disabled", false);

            var _modelBrowser = $(".model-browser", this.$form);
            setTimeout(function() {
                _modelBrowser.first().find('.model-searchbox, .model-selectbox').height("auto");
            }, 500);
        },

        deSelectModel: function() {
            $('[role="addProduct"]', this.$form).prop('disabled', true);
            $('.item-set', this.$form).last().find('#purchaseInfo :input').prop("disabled", true);
            this.$form.find('.item-set .model-browser:not(".opend") .selectbox').trigger('chosen:updated');

            !isMobile && setTimeout(function() {
                $(".model-browser:last", this.$form).find('.model-searchbox, .model-selectbox').height(this.originalHeight);
            }, 500);
        },

        toggleHeight: function(e) {
            if (isMobile) return;

            var modelBrowser = $(e.currentTarget).closest('.model-browser');
            var selectBox = modelBrowser.find('.model-selectbox');
            var searchBox = modelBrowser.find('.model-searchbox');

            if (e.target.value) {
                searchBox.find('.btn-group').hide();
                selectBox.css({height: this.minHeight});
            } else {
                searchBox.find('.btn-group').show();
                selectBox.css({height: this.originalHeight});
            }
        },

        formHide: function() {
            this.$form.find('.maximum').fadeIn();
        },

        formShow: function() {
            this.$form.find('.item-set:last').slideDown();
            this.$form.find('.maximum').fadeOut();
        },

        refreshForm: function(el) {
            var $scope = $('.form', el);
            $(':input:not(button, [type=hidden])', $scope).val('');
            this.modelBrowserReset($scope);
        },

        modelBrowserReset: function(el) {
            if (el.find(".model-browser").hasClass('open')) {
                $('.closebutton', el).trigger('click');
            }
        },

        reset: function() {
            this.data = [];
            this.addedCount = 0;
            $('.item-set:not(":last")', this.$form).remove();
            this.refreshForm($('.item-set', this.$form).last());
        },

        submitHandler: function(e) {
            var exists = this.$form.find('.item-set:not(":last")');
            var lastFormUsed = this.$form.find('.item-set:last .model-browser').hasClass('open');

            if (!exists.length || (exists.length && lastFormUsed)) {
                this.$form.one('form:validate:success', $.proxy(this.submit, this));
                this.$form.one('form:validate:fail', $.proxy(function() {
                    this.$form.off('form:validate:success');
                }, this));
                this.$form.trigger('form:validate', e);
            } else if (exists.length && !lastFormUsed) {
                this.$form.find('.item-set:last :input:not("button")').attr('ignore', true);
                this.$form.one('form:validate:success', $.proxy(this.submit, this));
                this.$form.one('form:validate:fail', $.proxy(function() {
                    this.$form.find('.item-set:last :input:not("button")').prop('ignore', false);
                    this.$form.off('form:validate:success');
                }, this));
                this.$form.trigger('form:validate', e);
            }
        },

        submit: function() {
            if (this.place === 'home') return;

            var $form = this.$form;
            var lastFormUsed = $form.find('.item-set:last .model-browser').hasClass('open');
            var items = lastFormUsed ? $form.find('.item-set') : $form.find('.item-set:not(":last")');
            var len = items.length;
            var top = $("#content").offset().top + 40;
            var progress = $($('#progressTmpl').html());
            var dataSet = [];
            var itemSubmit = function(idx) {
                if (idx > len-1) return done();
                
                var id = 'b2bSubmitForm'+idx;
                var form = document.createElement('form');
                /* LGEUK-1522 : 20170808 modify */
                var exitSubmit = false;
                $form.find("input:not(button)").each(function(){
                	var _this = $(this);
                	var _name = _this.attr("name");
                	var _val = _this.val();
                	
				    if ((_val !="" && _val != undefined) && (_val.indexOf("<script>") > -1||_val.indexOf("</script>") > -1)) {
				    	alert("Value of the field ["+ _name +"] contains invalid character. Remove special character");
				    	exitSubmit = true;
	                    return false;
				    }
                }, this);
                
                if(exitSubmit){
                	
			        return false;
                }
                
                form.id = id;
                form.enctype = 'multipart/form-data';
                form.className = 'validateForm';

                $(items[idx]).wrap(form);
                var _form = $form.find('#'+id);
                
                _form.ajaxSubmit({
                    url: $form.attr("b2b-action"),
                    type: $form.attr("method"),
                    dataType: 'json',                    
                    success: function(data) {
                    	if(data.error){
                    		alert(data.error);
                    		return false;
                    		//$form.find("button[role=submit]").spin(false);
                    		
                        } else {
                        	/* LGECS-1015 20170410 modify */
                        	if(data.goUrl&& typeof(data.goUrl)!=="undefined"){
                                location.href = data.url;
                            }else{
                        		dataSet.push(data);
                                updateCount(idx+1);
                                itemSubmit(idx+1);
                        	}
                        	/*// LGECS-1015 20170410 modify */
                        	
                        	progress.find('.total').html(len);
                            $form.before(progress.fadeIn());
                            $form.prev().find('.spin').spin(true, {
                                lines: 12,
                                length: 10,
                                width: 20,
                                radius: 50,
                                scale: 0.5,
                                corners: 0.3,
                                color: '#777',
                                top: '50%',
                                left: '50%',
                                shadow: false,
                                position: 'absolute'
                            });
                           
                        }
						
                    }
                });
            };
            /* //LGEUK-1522 : 20170808 modify */
            function updateCount(count) {
                $form.prev().find('.current').html(count);
            }

            function done() {
                var textArr = [];
                $.each(_.sortBy(dataSet, 'order'), function(idx, obj, list) {
                    var buffer = [];
                    for (var prop in obj) {
                        buffer.push([prop+"="+obj[prop]]);
                    }
                    textArr.push(buffer.join(','));
                });
                var form = document.createElement('form');
                var data = document.createElement('input');
                /* PJTBTOBCSR-251 20161122 modified */
                $("body").append(form);
                /* /PJTBTOBCSR-251 20161122 modified */

                data.name = 'dataSet';
                data.value = textArr.join('&&');
                form.action = $form.attr('b2b-success');
                form.method = 'post';
                form.appendChild(data);

                form.submit();
            }

            itemSubmit(0);
            $("html, body").animate({ scrollTop: top }, 400);
        }
    };

    $.extend(RegisterProduct.prototype, proto);
    ic.jquery.plugin('accordion', RegisterProduct, '.register-product.business');

    return RegisterProduct;
});
