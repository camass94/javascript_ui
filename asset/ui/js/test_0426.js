//define([ 'module_common', 'module_player', 'combineModule' ], function(moduleCommon, modulePlayer) {
define([ 'module_common', 'combineModule'], function(moduleCommon, combineModule) {
	var exports = {
		version : "1.0"
	};

	var _mainKeys = {
		areaKeys : [ 'home', 'food', 'half', 'recommend', 'plan', 'event', /*'hotkill',*/ 'tvplus', 'tvbest', 'tvschedule'], //2019-01-15 좋은밥상 매장 추가//2019-01-30 좋은밥상 순서 변경//2019-04-02 좋은밥상 순서 변경//2019-04-10 편성표 키값 수정
		cbFnKeys : {
			INIT_CB_FN : 'initCallback',
			EVENT_BIND_CB_FN : 'eventBindCallback',
			SCOLL_CB_FN : 'scrollCallback',
			LEFT_SCOLL_CB_FN : 'scrollCallback',
			LOAD_CB_FN : 'loadCallback',
			DESTORY_CB_FN : 'destoryCallback'
		},
		ajaxAreaKeys : {
			GEN : 'genAccessCodes',
			AREA : 'areaAccessCodes',
			VM : 'vmAccessUrls'
		},
		accessStructureKeys : {
			GEN : 'genCode',
			AREA : 'areaCode',
			VM : 'vmUrl',
			CB_SUCCESS : 'cbSuccess',
			CB_FAIL : 'cbFail'
		}
	}

	//슬라이드 공통 초기실
	var _initSlide = function(){
		if(iOsAgent){
			var $el = jQuery("#pagecons > .mcv[data-index='" + _getCurrentLocationIdx() + "']");
			$el.find('.prd_cate .home, .cate_tlt li, .cate_cnt li, .hns_direct_order, .hns_direct_main_order').addClass('ios-cursor');
		}
		
	}

	var _mainAccessAreaInfos = {},
		_Util = moduleCommon.Util,
		_LazyLoadUtil = _Util.Ui.LazyLoad,
		_PageUtil = _Util.Page;

	// 메인 상단 UI
	var scheduleListScroll = true,
		showHomeBanner = true,
		homeFloating = null,
		homeTvScheduleLib;//2019-01-29 좋은밥상 수정2(좋은밥상 스와이프가 중지 되었음을 알려줄 변수명) 

// 메인 영역별로 Data 및 Event Binding : s
	var _tapMainInitObj = {
		_ajaxAreaKeys : (function() {
			return _mainKeys.ajaxAreaKeys;
		})(),

		_cbFnKeys : (function() {
			return _mainKeys.cbFnKeys;
		})(),

		_accessStructureKeys : (function() {
			return _mainKeys.accessStructureKeys;
        })(),
        
        // 2018-12-17 - 메인개선관련 : 화면별 마지막 gen파일과 화면 key값을 리턴한다
        /*_lastGenAccess : function(areaKey, genArry){
            var keyInfo;
            for (var i = 0; i < genArry.length; i++) {
                if ( i == genArry.length - 1 ) {
                    keyInfo = genArry[i];
                    keyInfo['structureType'] = Object.keys(genArry[i])[0];
                }                                    
            }
            keyInfo['areaKey'] = areaKey;
            return keyInfo;
        },*/

		// 영역별 배열 구조를 오브젝트 구조로 치환 : ex [{genCode : '8005051'},{genCode : '8005051'}...]
		_setArrayToAccessStructure : function(key, codes) {
			$.each(codes, function(index, vlaue) {
				codes[index] = {};
				codes[index][key] = vlaue;
			});
			return codes;
		},

		_isCuration : function(arrayArea) {
			return $('#pagebox').hasClass('curation');
		},
		// *** 홈
		home : {
			_mainAccessAreaInfos : {},
			init : function() {
				var _genKey = _tapMainInitObj._accessStructureKeys.GEN,
					_areaKey = _tapMainInitObj._accessStructureKeys.AREA,
					_ajaxAreaKeys = _tapMainInitObj._ajaxAreaKeys,
					_homeSwiper = _mainUi.home,
					_cbFnKeys = _tapMainInitObj._cbFnKeys,
					_mainAccessAreaInfos = _tapMainInitObj.home._mainAccessAreaInfos,
					_genAccessArray = null,
					_AreaAccessArray = null,
// 서버로 Gen 요청은 퍼블리싱에서는 없음 !! ( 생성되어있는 gen html 만 사용 )
//					_AreaAccessArray = [ '8005027', '8005036' ],
					_timer = _mainUi.home.timer();

				if(window.isPilot){
					if(_tapMainInitObj._isCuration()){
						// [편성표,생방송,tv베스트,추천상품,반값장터]
						_genAccessArray = [ "8006000-1", "8006000-2", "8006000-3", "8006000-4", "8006000-5", "8006000-6" ]; //2019-02-12 홈개선
					}
					else{
						_genAccessArray = [ "8006000-1", "8006000-2", "8006000-3", "8006000-4", "8006000-5", "8006000-6" ]; //2019-02-12 홈개선
					}

				}
				else{
					if(_tapMainInitObj._isCuration()) { // 큐레이션 사용자
						_genAccessArray = [ "8006000-1", "8006000-2", "8006000-3", "8006000-4", "8006000-5", "8006000-6" ]; //2019-02-12 홈개선
					}
					else{
						_genAccessArray = [ "8006000-1", "8006000-2", "8006000-3", "8006000-4", "8006000-5", "8006000-6" ]; //2019-02-12 홈개선
					}
				}

				_mainAccessAreaInfos[_ajaxAreaKeys.GEN] = _tapMainInitObj._setArrayToAccessStructure(_genKey, _genAccessArray);
//				_mainAccessAreaInfos[_ajaxAreaKeys.AREA] = _tapMainInitObj._setArrayToAccessStructure(_areaKey, _AreaAccessArray);

				// 메인 상단 UI
				_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN] = function() {

// *** Player 는 퍼블리싱에서 제어 하지 않음. !!!!!
//					$(document).on('click', '.vodRel', function(e) {
//						var playParams = {
//							"src" : $(this).attr('src'),
//							"img" : "",
//							"mode" : "onlyFull",
//							"islive" : "false",
//							"target" : "",
//							"player" : "",
//							"type" : "01"
//						};
//
//						modulePlayer.newPlayVideo(playParams);
//					});

//					// 생방송 보기 재생 이력 저장 (2015.08.20)
//					var _videoplay = function() {
//
//						var goodsCode = $('#onAirGoods').attr('goodsCode');
//						var SeqFrameNo = $('#onAirGoods').attr('seqFrameNo');
//						var seqNo = $('#onAirGoods').attr('seqNo');
//
//						var ajaxUrl = "/goods/videoplay/?goods_code=" + goodsCode + "&seq_frame_no=" + SeqFrameNo + "&seq_no=" + seqNo + "&live_vod_gb=L";
//
//						var _deferred = $.getJSON(js_v_static_path + ajaxUrl);
//
//						_deferred.fail(function() {
//							alert("일시적인 장애가 발생했습니다. 잠시후에 다시 요청 하시기 바랍니다.");
//						});
//					}
//
//					$(document).on('click', '.tv_view_go', function(e) {
//						var num = 0;
//						//플레이어실행으로 변경
//
//						// VOD 매장 메인 상품 플레이어
//						if ($(this).hasClass('vod_shop') && (!AppFlag || moduleCommon.appVersionCheck("android", "2.1.0") || moduleCommon.appVersionCheck("ios", "2.1.0"))) {
//							num = $(".tv_view_go.vod_shop").index($(this));
//
//							_PageUtil.goPageLog('page=tvBest&area=tvBest_Video&action=playVideo&goods=' + $('div.today_tv_v2').eq(num).attr('goodsCode'), '');
//
//							var playParams = {
//								"src" : $('div.today_tv_v2').eq(num).attr('src'),
//								"img" : "",
//								"mode" : "onlyFull",
//								"islive" : "false",
//								"target" : $('div.today_tv_v2').eq(num).children('a.tv_view_go.vod_shop'),
//								"player" : "",
//								"type" : "01"
//							};
//
//							modulePlayer.newPlayVideo(playParams);
//						}
//						// 생방송 플레이어
//						else {
//							var liveYn = jQuery('.tvlive_count').length > 0 ? "true" : "false";
//				            var src = "/live/mp4:a.stream/playlist.m3u8";
//
//				            //log용 ajax
//							goPageLog('page=home&area=home_liveGoods&action=playVideo&goods=' + jQuery('#tvGoods').attr('goodscode'), '');
//
//							if (_tapMainInitObj._isCuration()) {
//								jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1043697' });
//							}else{
//								jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1067615' });
//							}
//
//							if(liveYn == "true"){
//								_videoplay();
//							}
//							else if(jQuery(this).attr('vodUrl') != ""){
//								src = $(this).attr('vodUrl');
//							}
//
//							if (AppFlag && ((AndroidAgent && AppVersionAndroid < 200) || (iOsAgent && Number(AppVersioniOS.replace(/\D/gi, '')) < 200))) {
//								if (iOsAgent) {
//									var linkUrl = js_v_static_path + "/goods/view/" + $('#tvGoods').attr('goodscode');
//									var callUrl = "movieplay://url=" + src + "&goods=" + linkUrl + "&cs=080-840-1111&ars=080-844-1111";
//									location.href = callUrl;
//								} else {
//									var linkUrl = js_v_static_path + "/goods/view/" + $('#tvGoods').attr('goodsCode');
//									var cscall = "javascript:csCall()";
//									var ars = "javascript:arsCall()";
//									var orderCall = "javascript:directOrder()";
//									if (AppVersionAndroid >= 132) {
//										window.vod.callAndroid2(src, linkUrl, cscall, ars, orderCall);
//									} else {
//										window.vod.callAndroid(src, linkUrl, cscall, ars);
//									}
//								}
//							} else {
//								var videoPlay = $('.qplayer_wrapper.main');
//
//								if (videoPlay.length > 0) {
//									if (!AppFlag || moduleCommon.appVersionCheck("android", "2.1.0") || moduleCommon.appVersionCheck("ios", "2.1.0")) {
//										var playParams = {
//											"src" : src,
//											"img" : "",
//											"mode" : "",
//											"islive" : "true",
//											"target" : "",
//											"player" : videoPlay,
//											"type" : "02"
//										};
//
//										modulePlayer.newPlayVideo(playParams);
//									} else {
//										var playParams = {
//											"src" : "http://livevod.hnsmall.com:1935" + src,
//											"live" : "true",
//											"callback" : {
//												"hBuy" : "javascript:directOrder()",
//												"linkUrl" : "javascript:linkUrl(" + $('#tvGoods').attr('goodscode') + ")",
//												"product" : "",
//												"facebook" : "javascript:facebook()",
//												"kakaoTalk" : "javascript:kakaoTalk()",
//												"kakaoStory" : "javascript:kakaoStory()",
//												"line" : "javascript:line()",
//												"sms" : "javascript:sms()",
//												"androidVersion" : AppVersionAndroid,
//												"iosVersion" : Number(AppVersioniOS.replace(/\D/gi, ''))
//											}
//										}
//										modulePlayer.playVideo(playParams, videoPlay, "02");
//									}
//								}
//							}
//						}
//					});

					var wrapper = $('.swipe-home .homeTvListWrap');
					/* s : 화면 로딩시 요소의 유/무, display:block/none, 이미 실행된 경우 중복 막기 */
					if (!wrapper.length > 0 || wrapper.is(':hidden')) {
						homeTvScheduleLib = null;
						return;
					}
					if (homeTvScheduleLib) return;
					/* e :화면 로딩시 요소의 유/무, display:block/none, 이미 실행된 경우 중복 막기 */

					var btn = $('.bannerImg', wrapper);
					var scrollWrap = $('.scrollWrap', wrapper);
					var scheduleListLayer = $('.scheduleListLayer', wrapper);

					var _imageLoadFlag = false;

					btn.click(function(e) {

						if (!_imageLoadFlag) {
							var $ReplaceImgs = $('.scrollWrap').find("img[data-original*='//image']");
							$.each($ReplaceImgs, function() {
								var data_original = $(this).attr('data-original');
								$(this).attr('src', data_original);
							});
							_imageLoadFlag = true;
						}

						if (typeof (AppFlag) != "undefined" && AppFlag && ((AndroidAgent && AppVersionAndroid >= 200) || (iOsAgent && Number(AppVersioniOS.replace(/\D/gi, '')) >= 200))) {
							if (moduleCommon.appVersionCheck("android", "2.1.0") || moduleCommon.appVersionCheck("ios", "2.1.0")) {
								window.location = "apps://killVideo";
							} else {
								window.location = "apps://closeVideo";
							}
						}

						e.preventDefault();

						var imgSrc = $('img', this).attr('src');

						if (scheduleListLayer.is(':hidden')) {
							$('img', this).attr('src', imgSrc.replace('.jpg', '_close.jpg'));
							scheduleListLayer.slideDown();
							var scrollPos = 0;

							if ($('.scrollWrap li.onair').prev().length > 0) {
								scrollPos = scrollWrap.scrollTop() + $('.scrollWrap li.onair').prev().position().top;
							}

							scrollWrap.scrollTop(scrollPos);
							$("#homeBn").fadeOut(400);
							scheduleListScroll = false; //false : 열림

// *** tracking 관련 - 퍼블리싱에서 제어 안함.!!!
//							$.ajax({
//								url : '/sample/tracking?trackingarea=60000016^8000621^1061186'
//							});
						} else {
							$('img', this).attr('src', imgSrc.replace('_close.jpg', '.jpg'));
							scheduleListLayer.slideUp();

							if (homeFloating) {
								clearTimeout(homeFloating);
							}

							// 홈 프로모션 배너
							homeFloating = setTimeout(function() {
								if (showHomeBanner != undefined && showHomeBanner) {
									$("#homeBn").fadeIn("slow");
									scheduleListScroll = true; //true : 닫힘
								}
							}, 500);

							_mainUi.common.initBottonFloting();
						}
					});

					// 상품 편성표 닫기 버튼
					$('.btnWrap .btnClose', scheduleListLayer).click(function(e) {
						if (typeof (AppFlag) != "undefined" && AppFlag && ((AndroidAgent && AppVersionAndroid >= 200) || (iOsAgent && Number(AppVersioniOS.replace(/\D/gi, '')) >= 200))) {
							if (moduleCommon.appVersionCheck("android", "2.1.0") || moduleCommon.appVersionCheck("ios", "2.1.0")) {
								window.location = "apps://killVideo";
							} else {
								window.location = "apps://closeVideo";
							}
						}

						e.preventDefault();

						var imgSrc = $('.bannerImg img', wrapper).attr('src');
						$('.bannerImg img', wrapper).attr('src', imgSrc.replace('_close.jpg', '.jpg'));
						scheduleListLayer.slideUp();

						if (homeFloating) {
							clearTimeout(homeFloating);
						}

						// 홈 프로모션 배너
						homeFloating = setTimeout(function() {
							if (showHomeBanner != undefined && showHomeBanner) {
								$("#homeBn").fadeIn("slow");
								scheduleListScroll = true; //true : 닫힘
							}
						}, 500);

						_mainUi.common.initBottonFloting();

					});

					function orderOff(obj){
						var obj = jQuery('.'+obj);
						obj.toggle(function(){
							var $this = jQuery(this);
							$this.addClass('active');
							$this.next().hide();
						},function(){
							var $this = jQuery(this);
							$this.removeClass('active');
							$this.next().show();
						});
					}
					orderOff('order_off');

					/* 주문상품내역 클릭시 주문상품 노출 함수 */
					function orderOpen(obj){
						var obj = jQuery('.'+obj);
						obj.toggle(function(){
							var $this = jQuery(this);
							$this.removeClass('active');
							$this.next().show();
						},function(){
							var $this = jQuery(this);
							$this.addClass('active');
							$this.next().hide();
						});
					}
					orderOpen('order_open');

					// 이벤트 바인딩 종료
				};

				var $rootEle5 = null,
					 $rootEle1 = null,
					 $rootEle4 = null;

				var _setAfterImageLoaderEvent = function($pRootEle1, $pRootEle4){
					$rootEle1 = $pRootEle1;
					$rootEle4 = $pRootEle4;
				};

				var _onceFlag = false;
				var _afterImageLoaderEventTrigger = function(){
					if(!_onceFlag){
						_onceFlag = true;
						if($rootEle1 && $rootEle4){
							$rootEle1.find('.lazy:gt(9)').trigger("afterLoad");
							$rootEle4.find('.lazy').trigger("afterLoad");
						}
					}
				}

				_mainAccessAreaInfos[_cbFnKeys.LOAD_CB_FN] = function(_deferreds) {

				// 메인 html append ( arguments.length=3 : 모바일앱 | 그외 모바일웹 )
					return $.when.apply($, _deferreds).done(function() {

						var argLen = arguments.length;

						//  ** 모바일앱
						if( argLen === 3 ){

							var _$homeEle = $("#pagecons > .swipe-home > .homeTabCount"); //2019-02-12 홈개선

							if(arguments[0]){
								$rootEle1 = $(arguments[0][0]);
								$rootEle1.find('.lazy').lazyload({
							        event : "afterLoad"
							    });
							}

							if(arguments[1]){
								$rootEle5 = $(arguments[1][0]);
							}

							if(arguments[2]){
								$rootEle4 = $(arguments[2][0]);
								$rootEle4.find('.lazy').lazyload({
							        event : "afterLoad"
							    });
							}
							// ** 메인-홈 : 추천상품
							$('.tvlive').append($rootEle5);

							// ** 메인-홈 : TV베스트 + 반값장터
							_$homeEle.append($rootEle1).append($rootEle4);


							$rootEle1.find('.lazy:lt(10)').trigger("afterLoad");
							_setAfterImageLoaderEvent($rootEle1,$rootEle4);

						}else{
							// ** 모바일웹 ( 퍼블리싱은 이곳만 탐. )

							console.log('home here~~');
							var _$homeEle = $("#pagecons > .swipe-home > .homeTabCount"); //2019-02-12 홈개선
							var $rootEle = $(arguments[0][0]);
							var $repaceTodataOriginalEle = $rootEle.find('.scheduleListLayer').find('img').not(':first');

							$.each($repaceTodataOriginalEle, function(idx, val) {
								$(this).attr('data-original', $(this).attr('src'));
								$(this).removeAttr('src');
							});
							
							/* S: 2019-02-12 홈개선 */
							var $rootEleIdx = null, thresholdVal = 1500;
							$(arguments).each(function(i) {
								if(i < 6) {
									_$homeEle.append($(this)[0])
									_$homeEle.find('img').lazyload({threshold : thresholdVal});
								}
							});

							// 1. 상단편성표 html tag bind
							/*console.log("append1" + $rootEle);
							_$homeEle.append($rootEle); 
							//_$homeEle.append('<section class="tvlive"></section>'); //2019-02-12 홈개선(삭제)
 
							var $rootEle2 = null, thresholdVal = 1500;

							if(arguments[2]){
								$rootEle2 = $(arguments[2][0]);
								$rootEle2.find('img').lazyload({threshold : thresholdVal});
							}

							var $rootEle4 = null;

							if(arguments[4]){
								$rootEle4 = $(arguments[4][0]);
								$rootEle4.find('img').lazyload({threshold : thresholdVal});
							}

							var $rootEle5 = null;

							if(arguments[3]){
								$rootEle5 = $(arguments[3][0]);
								$rootEle5.find('img').lazyload({threshold : thresholdVal});
							}
							//2. 생방송 | 추천상품  html tag bind
							console.log("append2" + $rootEle5);
							$('.tvlive').append(arguments[1][0]).append($rootEle5);
							//$('.tvlive').append(arguments[1][0]);

							//3. tv베스트 | 반값장터  html tag bind
							console.log("append3" + $rootEle2);
							console.log("append4" + $rootEle4);
							_$homeEle.append($rootEle2).append($rootEle4);*/
							/* E: 2019-02-12 홈개선 */

							// 생방송영역 타이머 시작  ( target : web ) : app의 경우 main_tap_home.js 내 수행
                            _timer.start();
                            
                            // 2019-01-29 비디오 테스트
                            _mainUi.home.autoPlayModule();
						}

						_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN]();

					}).fail(function() {});
				}


				var _scrollAfterImageLoaderEventTrigger =function(){
					_popUpBanner();
					_afterImageLoaderEventTrigger();
				}

				var _popUpBanner = function() {

					if (homeFloating) {
						clearTimeout(homeFloating);
					}

					$("#homeBn").hide();

					// 홈 프로모션 배너
					homeFloating = setTimeout(function() {
						if (showHomeBanner != undefined && showHomeBanner && scheduleListScroll) {
							$("#homeBn").fadeIn("slow");
						}
					}, 500);

					_mainUi.common.initBottonFloting();
				}

				_mainAccessAreaInfos[_cbFnKeys.SCOLL_CB_FN] = _scrollAfterImageLoaderEventTrigger;

				_mainAccessAreaInfos[_cbFnKeys.INIT_CB_FN] = function() {
					 /* 2019-02-12 홈개선(추가 시작) */
	            	if(!_homeSwiper.swiperObj){
	            		_homeSwiper.swiper().init();
	            	}
	            	/* 2019-02-12 홈개선(추가 끝) */
	            	
					_popUpBanner();
					// 닫기버튼 위치 수정 2017-06-22
					var w = $("#homeBn").width(),
						h = $("#homeBn").height(),
						ratio = h/w;	// ratio 이미지의 가로세로 비율
					$("#homeBn .close_btn").show(); // 2018-10-11 수정
				}
				
				_mainAccessAreaInfos[_cbFnKeys.DESTORY_CB_FN] = function() {
					$("#homeBn").hide();
					_timer.stop();
					
					/* 2019-02-12 홈개선(추가 시작) */
					if(_homeSwiper.swiperObj){
						_homeSwiper.swiperObj.destroy(true, true);
						_homeSwiper.swiperObj2.destroy(true, true);
						_homeSwiper.swiperObj = null;
						_homeSwiper.swiperObj2 = null;
                	}
					$('.cont_sw > .home_fixed').remove();//스티키메뉴 삭제
					/* 2019-02-12 홈개선(추가 끝) */
                };
                
               
                
				return _mainAccessAreaInfos;
			}
		},

		// *** 반값장터
		half : {
			_mainAccessAreaInfos : {},

			init : function() {
				var _genKey = _tapMainInitObj._accessStructureKeys.GEN,
					_areaKey = _tapMainInitObj._accessStructureKeys.AREA,
					_ajaxAreaKeys = _tapMainInitObj._ajaxAreaKeys,
					_cbFnKeys = _tapMainInitObj._cbFnKeys,
					_mainAccessAreaInfos = _tapMainInitObj.half._mainAccessAreaInfos,
					_genAccessArray = [ '8005022-2' ], //2018-05-28수정
					_AreaAccessArray = null;
// 서버로 Gen 요청은 퍼블리싱에서는 없음 !! ( 생성되어있는 gen html 만 사용 )
//					_AreaAccessArray = [ '8005044' ];

				_mainAccessAreaInfos[_ajaxAreaKeys.GEN] = _tapMainInitObj._setArrayToAccessStructure(_genKey, _genAccessArray);
//				_mainAccessAreaInfos[_ajaxAreaKeys.AREA] = _tapMainInitObj._setArrayToAccessStructure(_areaKey, _AreaAccessArray);

				// 반값장터 html tag bind callback
				var _halfSuccess = function(data) {

					var $imgLazele,
						data_original_val,
						$ele = $('.mainNav.swipe-half.mcv');
					$ele.append(data).promise().done(function() {
						console.log("half append done");
						$imgLazele = $ele.find('img.lazy');
						_LazyLoadUtil.initLoadImgPolicy($imgLazele);
					});
				}

				// 반값장터 html tag bind callback  ( Curation home )
				var _halfCuretionSuccess = function(data) {
					console.log('_halfCuretionSuccess here !! ' + data);
					var $imgLazele,
						data_original_val,
						$ele = $('#half_list');
					$ele.append(data).promise().done(function() {
						$imgLazele = $('.half_plan_list').find('img.lazy');
						_LazyLoadUtil.initLoadImgPolicy($imgLazele, 15, true);
					});
				}

				var halfId,
					halfCategoryCode,
//					halfTemplate,
					subMarket,
					halfAjaxLoding = false;

				// 반값 할인 초기실행
				var _initHalf = function() {
					halfId = $('.half_goods section[class=loadingZone]').attr('target');
					halfCategoryCode = $('.half_goods section[class=loadingZone]').attr('category_code');
// handlebar 사용제거 ( 퍼블리싱에서는 사용안함 )
//				    halfTemplate = Handlebars.compile($('#displayPlanGoods-template').html());
					subMarket = $("#halfMenu li");
				}

				var _nextHalf = function() {

					_initHalf();

					var _$EleLoadingZone = $('.half_goods section[class=loadingZone]');

					var halfLoadingZoneCurrentPage = Number(_$EleLoadingZone.attr('currentpage'));
					var halfLoadingZoneIsMoreData = (_$EleLoadingZone.attr('ismoredata') == "true");
					var halfAreaCode = _$EleLoadingZone.attr('area_code');

					if (halfLoadingZoneIsMoreData && !halfAjaxLoding) {
						halfAjaxLoding = true;
						var planCode = $('#halfMenu li').find('.on').parent().attr('plan_code');
						var plangoodsgb = $('.cnt1 li.on').attr('planGoodsGb');
						var cashgb = $('.cnt2 li.on').attr('cashgb');
						$('.half_goods section[class=loadingZone]').attr('currentpage', ++halfLoadingZoneCurrentPage);
						$('#halfLoadingZone').show();

// 서버로  Data 요청에 의한 처리는 	퍼블리싱에서 처리안함!!!!
//						var _deferred = $.getJSON('/category/display/planshop/goods', {
//							plan_code : planCode,
//							plan_goods_gb : plangoodsgb,
//							cash_gb : cashgb,
//							currentPage : halfLoadingZoneCurrentPage,
//							rowsPerPage : 20,
//							target : "half"
//						});
//
//						_deferred.done(function(data) {
//							if (data.goodsList != null && data.goodsList.length > 0) {
//								halfLoadingZoneIsMoreData = (data.goodsList[0].totalCount / 20 > halfLoadingZoneCurrentPage) ? true : false;
//								$('.half_goods section[class=loadingZone]').attr('ismoredata', halfLoadingZoneIsMoreData);
//
//								$.each(data.goodsList, function(i, val) {
//									val.js_v_context_path = js_v_context_path;
//									val.js_v_static_Gimg_path = js_v_static_Gimg_path;
//									val.js_v_static_Gimg_error = js_v_static_Gimg_error;
//									val.js_v_static_img_path = js_v_static_img_path;
//
//									val.categoryCode = halfCategoryCode;
//									val.areaCode = halfAreaCode;
//
//									if (halfCategoryCode != '' && halfAreaCode != '') {
//										val.trackingUrl = "?trackingarea=" + halfCategoryCode + "^" + halfAreaCode;
//									} else {
//										val.trackingUrl = '';
//									}
//
//									// 이미지 URL 변경
//									val.goodsImageUrl = val.imageUrl + val.imageH;
//									if (val.adultYn == "1") {
//										val.goodsImageUrl = "/goods/adult/adultGoods_h.jpg";
//									} else if (val.imageWide != null && val.imageWide != "") {
//										val.goodsImageUrl = val.imageUrl + val.imageWide;
//									}
//
//									// 모바일가 계산
//									var couponPrice = 0;
//
//									val.coupon10Yn = "Y";
//									val.couponFlag = "Y";
//									val.dcRate = 0;
//
//									val.tvCouponPrice = val.bestPrice;
//
//									if (val.tvCouponPrice > 0 && val.couponDcAmt > 0) {
//										if (val.couponDcAmt == 50000 && val.couponDcRate < 10) {
//											val.coupon10Yn = "N";
//										}
//									} else {
//										val.coupon10Yn = "N";
//										val.couponFlag = "N";
//									}
//
//									// 할인율 계산
//									if (val.coupon10Yn == "Y") {
//										var tempPrice = val.orgPrice;
//
//										if (val.prevSalePrice > 0) {
//											tempPrice = val.prevSalePrice;
//										}
//
//										val.dcRate = Math.round((val.goodsPromo + val.couponDcAmt + val.cardAmt + val.prevPromo + val.saveamt) / tempPrice * 100);
//									}
//
//									val.orgPrice = $.number(Number(val.orgPrice));
//									val.bestPrice = $.number(Number(val.bestPrice));
//									val.prevSalePrice = $.number(Number(val.prevSalePrice));
//									val.tvCouponPrice = $.number(Number(val.tvCouponPrice));
//									val.finalDcAmt = $.number(Number(val.finalDcAmt));
//
//									$('.half_plan_list').append(halfTemplate(val));
//								});
//							} else {
//								if (halfLoadingZoneCurrentPage == 1) {
//									$('.boxHalf_wrap').html('<div class="list_none product_list"><em></em><p>조회 내역이 없습니다.</p></div>');
//								}
//
//								$('.half_goods section[class=loadingZone]').attr('ismoredata', false);
//							}
//
//							halfAjaxLoding = false;
//							$('#halfLoadingZone').hide();
//
//							_initSlide();
//
//						}).fail(function() {
//							halfAjaxLoding = false;
//							$('#halfLoadingZone').hide();
//							_Util.Ui.showAlertMsg(1);
//
//						});

						return _deferred;
					}
				}

				_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN] = function() {

					// tab event 삭제함.
					$(document).on('click', '.prd_cate .home', function(e) {
						$('.prd_cate').removeClass('on');
						$('.cate_tlt li').removeClass('on');
						$('.cate_cnt li').removeClass('on');
						$('.cate_cnt').hide();
						$('.selCate').text('전체카테고리');
						$('.selPrice').text('모든 금액');
						$('.cnt1 li').eq(0).addClass('on');
						$('.cnt2 li').eq(0).addClass('on');
						$('.half_plan_list').html('');
						$('.half_goods section[class=loadingZone]').attr('currentpage', 0);
						$('.half_goods section[class=loadingZone]').attr('ismoredata', true);
						_mainAccessAreaInfos[_cbFnKeys.SCOLL_CB_FN]();
					});

					// 2018-05-28 삭제
					//$(document).on('click', '.cate_tlt li', function(e) {
					//	var $this = $(this),
					//		cateWarp = '.cnt' + ($this.index() + 1);
					//	$('.cate_cnt').hide();
					//	if ($this.hasClass('on')) {
					//		$this.removeClass('on');
					//		$('.prd_cate').removeClass('on');
					//	} else {
					//		$('.prd_cate').addClass('on');
					//		$('.cate_tlt li').removeClass('on');
					//		$this.addClass('on');
					//		$('.cate_cnt_wrap').find(cateWarp).show();
					//	}
					//});

					$(document).on('click', '.cate_cnt li', function(e) {
						var $this = $(this);

						if (!$this.hasClass('on')) {
							if ($this.parents('.cnt1').size()) {
								$('.cnt1 li').removeClass('on');

								if ($('.cate_cnt.cnt1 li').index($this) === 0) {
									$('.selCate').text('전체카테고리');
								} else {
									$('.selCate').text($this.text());
								}
							} else {
								$('.cnt2 li').removeClass('on');

								if ($this.attr('cashgb') == 3) {
									$('.selPrice').text('한방에 달성!');
								} else {
									$('.selPrice').text($this.text());
								}
							}

							$this.addClass('on');
							$('.prd_cate').removeClass('on');
							$('.cate_tlt li').removeClass('on');
							$('.cate_cnt').hide();

							$('.half_plan_list').html('');
							$('.half_goods section[class=loadingZone]').attr('currentpage', 0);
							$('.half_goods section[class=loadingZone]').attr('ismoredata', true);

							_nextHalf();
						}
					});

					/* 2018-06-20 반값장터 전체보기 팝업, 새페이지로 전환 하면서 삭제
					$(document).on('click', '.allView', function(){
						//$('.swipe-half').css('transform', '');
						$('.allViewLayer').show();
						$('.contLayer').show();
						$('body').attr('style', 'overflow-y:hidden; position: fixed;');

						if(iOsAgent){
							var myScroll;
							myScroll = new IScroll('.contLayer .goodsHalf_wrap > div', {
								scrollbars: true,
								mouseWheel: true,
								click: true,
								interactiveScrollbars: true,
								shrinkScrollbars: 'scale',
								fadeScrollbars: true,
					            onScrollEnd:function(){
					            	myScroll.refresh();
					            }
							});
						}
					});

					$(document).on('click', '.allViewClose', function(){
						$('body').removeAttr( 'style' );
						$('.allViewLayer').hide();
						$('.contLayer').hide();
					});
					2018-06-20  반값장터 전체보기 팝업, 새페이지로 전환 하면서 삭제 */

					/*
					$(document).on('click','.halfCate_cnt li', function(){
						var $this = $(this);
						var $chk = $('.halfCate').css('position');
						$('.halfCate_cnt li').removeClass('on');
						$('.halfCate_tlt dt').addClass('on');
						$this.addClass('on');
						if ($chk != 'fixed'){
							var $cateTit = $this.find('span').text();
							var $cateSub =  $this.find('em').text();
							$('.halfCate_tlt').children('dt').text($cateTit);
							$('.halfCate_tlt').children('dd').text($cateSub);
						}
					});
					*/
					/* 2018-06-25 일 수정 시작 */
					$(document).on('click','.halfCate_cnt > ul > li', function(){
						var thisClass=$(this).attr("class").replace("on","").replace("ev","");
						var thisLi = $(".halfCate_cnt > ul > ."+thisClass+"");

						//var $chk = $('.halfCate').css('position');
						$(".halfCate_cnt > ul > li").removeClass('on');
						//$('.halfCate_tlt dt').addClass('on'); 2018-08-30 스티키수정
						thisLi.addClass('on');
						//if ($chk != 'fixed'){
						//2018-07-18 수정 시작(web만 스티키 카테고리 기능 제거)
						/* 2018-08-30 스티키수정  시작
							var $cateTit, $cateSub;

							if(AppFlag){
								$cateTit = $(".cont_sw > .halfCate ."+thisClass+"").children('span').text();
								$cateSub =  $(".cont_sw > .halfCate ."+thisClass+"").children('em').text();
							}else{
								$cateTit = $(".halfCate ."+thisClass+"").children('span').text();//2018-07-18 수정(.cont_sw > 삭제)
								$cateSub =  $(".halfCate ."+thisClass+"").children('em').text();//2018-07-18 수정(.cont_sw > 삭제)
							}
							//2018-07-18 수정 끝(web만 스티키 카테고리 기능 제거)
							$('.halfCate_tlt').children('dt').text($cateTit);
							$('.halfCate_tlt').children('dd').text($cateSub);
						//}
						2018-08-30 스티키수정  끝 */
						// 2018-08-28 sticky 개선 시작
                        if($(".mainNav.swipe-half.mcv").hasClass("harfScroll")){
                        	var winWidth=$(window).width();

                        	/* 2018-08-27 수정 시작 */
							if(AppFlag){
								if(winWidth > 360){
									$('.goodsHalf_wrap').css("marginTop", 284); // 카테고리 컨텐츠 여백 추가 class
								}
								var cateOffsetTop = $(".roll_wrap").outerHeight()+$(".banner_half").outerHeight();
							}else{
								if(winWidth > 360){
									$('.goodsHalf_wrap').css("marginTop", 234); // 카테고리 컨텐츠 여백 추가 class
								}
								var cateOffsetTop = $(".wrapAllHeader").outerHeight()+$(".roll_wrap").outerHeight()+$(".banner_half").outerHeight()-41;
							}
							/* 2018-08-27 수정 끝 */
							$('html, body').scrollTop(cateOffsetTop);
                        }
                        // 2018-08-28 sticky 개선 끝
					});
					/* 2018-06-25 일 수정 끝 */
					/*
					var didScroll = false;
					var cateTop = $('.hafBestWrap li').height() + $('.banner_half').height() + $('.hafBestWrap').offset().top;

					$('.halfTabConts').scroll(function() {
						  var $vm = $('.halfCate');

						  console.log($(this).scrollTop());

						  if($(this).scrollTop() >= cateTop) {
							 didScroll = true;
							 $vm.addClass('fixed');
							 $vm.addClass('optView');
						  } else {
							 $vm.removeClass('fixed');
						     $vm.removeClass('optView');
						  }
					});

					setInterval(function() {
						if (didScroll) {
							didScroll = false;
						} else {
							console.log($('.halfCate').css('position'));
							$('.halfCate').removeClass('optView');
						}
					}, 50);
					*/
					//2018-05-28 E

					/* 반값장터 서브매장 on처리 2016-03-28 추가  */
					$(document).on("click", "#halfMenu li", function(e) {
						var $this = $(this);

						if (!$this.hasClass('on')) {
							var halfTabIndex = subMarket.index($this);
							var areaCode = $this.attr('area_code');
							var planCode = $this.attr('plan_code');
							var bannerCode = $this.attr('banner_code');

// 트래킹코드는 퍼블리싱에서 처리 안함.!!
//							$.ajax({
//								url : '/sample/tracking?trackingarea=60000016^8000621^' + bannerCode
//							});

							$this.siblings().find('a').removeClass('on');
					        $this.find('a').addClass('on');

							$('.halfTabConts').html('');
							$('#halfLoadingZone').show();

// 서버로  Data 요청에 의한 처리는 	퍼블리싱에서 처리안함!!!!
//							var _deferred = $.get('/category/halfshop', {
//								areaCode : areaCode,
//								planCode : planCode,
//								halfTabIndex : halfTabIndex
//							});
//							_deferred.done(function(data) {
//								$('.halfTabConts').html(data).promise().done(function() {
//
//									if (halfTabIndex == 0) {
//										_mainUi.half.swiper().init();
//										var lazys1 = $('.swipe-half').find('#half_list img.lazy');
//										_LazyLoadUtil.initLoadImgPolicy(lazys1);
//									}
//
//									var lazys2 = $('.swipe-half').find('section.boxHalf_wrap img.lazy');
//									_LazyLoadUtil.initLoadImgPolicy(lazys2, null, true);
//								});
//
//								$('#halfLoadingZone').hide();
//								$('html, body').scrollTop(0);
//
//							}).fail(function() {
//								_Util.Ui.showAlertMsg(1);
//							});
						}
					});
// 플레이어 관련 이벤트 할당은 퍼블리싱에서 처리 하지 않음!!!
//					$(document).on('click', '.tv_view_go', function(e) {
//						var num = 0;
//
//						if ($(this).hasClass('btn_play_inner') && (!AppFlag || moduleCommon.appVersionCheck("android", "2.1.0") || moduleCommon.appVersionCheck("ios", "2.1.0"))) {
//							if ($(this).parents('.half_listBox').size()) {
//								_PageUtil.goPageLog('page=half&area=half_Goods20&action=playVideo&goods=' + $(this).attr('goodsCode'), '');
//							}
//
//							var playParams = {
//								"src" : $(this).attr('src'),
//								"img" : "",
//								"mode" : "onlyFull",
//								"islive" : "false",
//								"target" : "",
//								"player" : $(this).parent(),
//								"type" : "07"
//							};
//
//							modulePlayer.newPlayVideo(playParams);
//						}
//					});
//
//					$(document).on('click', '.vodRel', function(e) {
//						var playParams = {
//							"src" : $(this).attr('src'),
//							"img" : "",
//							"mode" : "onlyFull",
//							"islive" : "false",
//							"target" : "",
//							"player" : "",
//							"type" : "01"
//						};
//
//						modulePlayer.newPlayVideo(playParams);
//					});
//
//					// 생방송 보기 재생 이력 저장 (2015.08.20)
//					var _videoplay = function() {
//
//						var goodsCode = $('#onAirGoods').attr('goodsCode');
//						var SeqFrameNo = $('#onAirGoods').attr('seqFrameNo');
//						var seqNo = $('#onAirGoods').attr('seqNo');
//
//						var ajaxUrl = "/goods/videoplay/?goods_code=" + goodsCode + "&seq_frame_no=" + SeqFrameNo + "&seq_no=" + seqNo + "&live_vod_gb=L";
//
//						var _deferred = $.getJSON(js_v_static_path + ajaxUrl);
//
//						_deferred.fail(function() {
//							alert("일시적인 장애가 발생했습니다. 잠시후에 다시 요청 하시기 바랍니다.");
//						});
//					}
//
//					$(document).on('click', '.tv_view_go', function(e) {
//						var num = 0;
//						//플레이어실행으로 변경
//
//						// VOD 매장 메인 상품 플레이어
//						if ($(this).hasClass('vod_shop') && (!AppFlag || moduleCommon.appVersionCheck("android", "2.1.0") || moduleCommon.appVersionCheck("ios", "2.1.0"))) {
//							num = $(".tv_view_go.vod_shop").index($(this));
//
//							_PageUtil.goPageLog('page=tvBest&area=tvBest_Video&action=playVideo&goods=' + $('div.today_tv_v2').eq(num).attr('goodsCode'), '');
//
//							var playParams = {
//								"src" : $('div.today_tv_v2').eq(num).attr('src'),
//								"img" : "",
//								"mode" : "onlyFull",
//								"islive" : "false",
//								"target" : $('div.today_tv_v2').eq(num).children('a.tv_view_go.vod_shop'),
//								"player" : "",
//								"type" : "01"
//							};
//
//							modulePlayer.newPlayVideo(playParams);
//						}
//						// 생방송 플레이어
//						else {
//							var liveYn = jQuery('.tvlive_count').length > 0 ? "true" : "false";
//				            var src = "/live/mp4:a.stream/playlist.m3u8";
//
//				            //log용 ajax
//							goPageLog('page=home&area=home_liveGoods&action=playVideo&goods=' + jQuery('#tvGoods').attr('goodscode'), '');
//
//							if (_tapMainInitObj._isCuration()) {
//								jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1043697' });
//							}else{
//								jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1067615' });
//							}
//
//							if(liveYn == "true"){
//								_videoplay();
//							}
//							else if(jQuery(this).attr('vodUrl') != ""){
//								src = jQuery(this).attr('vodUrl');
//							}
//
//							if (AppFlag && ((AndroidAgent && AppVersionAndroid < 200) || (iOsAgent && Number(AppVersioniOS.replace(/\D/gi, '')) < 200))) {
//								if (iOsAgent) {
//									var linkUrl = js_v_static_path + "/goods/view/" + $('#tvGoods').attr('goodscode');
//									var callUrl = "movieplay://url=" + src + "&goods=" + linkUrl + "&cs=080-840-1111&ars=080-844-1111";
//									location.href = callUrl;
//								} else {
//									var linkUrl = js_v_static_path + "/goods/view/" + $('#tvGoods').attr('goodsCode');
//									var cscall = "javascript:csCall()";
//									var ars = "javascript:arsCall()";
//									var orderCall = "javascript:directOrder()";
//									if (AppVersionAndroid >= 132) {
//										window.vod.callAndroid2(src, linkUrl, cscall, ars, orderCall);
//									} else {
//										window.vod.callAndroid(src, linkUrl, cscall, ars);
//									}
//								}
//							} else {
//								var videoPlay = $('.qplayer_wrapper.main');
//
//								if (videoPlay.length > 0) {
//									if (!AppFlag || moduleCommon.appVersionCheck("android", "2.1.0") || moduleCommon.appVersionCheck("ios", "2.1.0")) {
//										var playParams = {
//											"src" : src,
//											"img" : "",
//											"mode" : "",
//											"islive" : "true",
//											"target" : "",
//											"player" : videoPlay,
//											"type" : "02"
//										};
//
//										modulePlayer.newPlayVideo(playParams);
//									} else {
//										var playParams = {
//											"src" : "http://livevod.hnsmall.com:1935" + src,
//											"live" : "true",
//											"callback" : {
//												"hBuy" : "javascript:directOrder()",
//												"linkUrl" : "javascript:linkUrl(" + $('#tvGoods').attr('goodscode') + ")",
//												"product" : "",
//												"facebook" : "javascript:facebook()",
//												"kakaoTalk" : "javascript:kakaoTalk()",
//												"kakaoStory" : "javascript:kakaoStory()",
//												"line" : "javascript:line()",
//												"sms" : "javascript:sms()",
//												"androidVersion" : AppVersionAndroid,
//												"iosVersion" : Number(AppVersioniOS.replace(/\D/gi, ''))
//											}
//										}
//										modulePlayer.playVideo(playParams, videoPlay, "02");
//									}
//								}
//							}
//						}
//					});

					// 더보기 수정 2017-07-27
					$('.swipe-home').on('click', '.tvGoodsMore', function(e){
						var $more = $(this),
							twoChannel = $more.closest('.two_channel_vod');

					    if (jQuery( ".tvGoods" ).is( ":hidden" ) ) {
					        jQuery( ".tvGoods" ).slideDown( "slow" );
					        if(twoChannel.length && $more.hasClass('ver02')) $more.addClass('opened');
					        jQuery('span', $more).html('닫기').attr('class','close');
					     } else {
					        jQuery( ".tvGoods" ).slideUp( "slow" );
					        if(twoChannel.length && $more.hasClass('ver02')) $more.removeClass('opened');
					        (twoChannel.length && $more.hasClass('ver02')) ? jQuery('span', $more).html('TV상품 더보기').attr('class','') : jQuery('span', $more).html('방송상품 더보기').attr('class','');
					     }
					    e.preventDefault();
					});

					 // 반값할인 메인 슬라이드 이전다음 버튼 이벤트 위임.
				     jQuery('#pagecons > .swipe-half').on('click', '#best-prev', function(){
						clearTimeout( _mainUi.half.swiperObj );
						_mainUi.half.swiperObj.prev();
					 });
					 jQuery('#pagecons > .swipe-half').on('click', '#best-next', function(){
						clearTimeout( _mainUi.half.swiperObj );
						_mainUi.half.swiperObj.next();
					 });

				}

				_mainAccessAreaInfos[_cbFnKeys.LOAD_CB_FN] = function(deferreds) {
					return $.when.apply($, deferreds).done(function(result1) {
						_halfSuccess(result1);
// 퍼블리싱에만 해당
//						_halfCuretionSuccess(result1);
						_initHalf();
						_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN]();
					}).fail(function() {});
// 퍼블리싱에만 해당
//					return $.when.apply($, deferreds).done(function(result1, result2) {
//						_halfSuccess(result1[0]);
//						_halfCuretionSuccess(result2[0]);
//						_initHalf();
//						_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN]();
//					}).fail(function() {});
				}

				_mainAccessAreaInfos[_cbFnKeys.SCOLL_CB_FN] = function() {
// 퍼블리싱에서는 반값장터 스크롤이벤트 할당하지 않음.
//						_nextHalf();
				}

				_mainAccessAreaInfos[_cbFnKeys.INIT_CB_FN] = function() {
					if (_mainUi.half.swiperObj) {
						_mainUi.half.swiper().init();

					} else {
						_mainUi.half.swiper().init();
					}
					_mainUi.common.initBottonFloting();
					_mainUi.half.halfMenuScroll();//2018-06-25(실행위치 변경)  반값장터 메뉴동작 */

					// 플리킹 영역에서 Transform과 fixed 충돌 해결  2018-05-28추가
					//var contBoxH = $(window).height() - 81;
					//$('.swipe-half > .halfTabConts').css('height', contBoxH);
					//$("#pagecons").height(contBoxH);
					//console.log(contBoxH);
				}

				_mainAccessAreaInfos[_cbFnKeys.DESTORY_CB_FN] = function() {
					if (_mainUi.half.swiperObj) {
						_mainUi.half.swiperObj.kill();
					} else {
						//_mainUi.half.swiperObj.kill();
					}
                }
                
                
				return _mainAccessAreaInfos;
			}
		},
        // *** 핫킬
        // 퍼블리싱에서 hotkill 사용안함
		// hotkill : {
		// 	_mainAccessAreaInfos : {},
		// 	init : function() {
		// 		var _genKey = _tapMainInitObj._accessStructureKeys.GEN,
		// 			_ajaxAreaKeys = _tapMainInitObj._ajaxAreaKeys,
		// 			_cbFnKeys = _tapMainInitObj._cbFnKeys,
		// 			_mainAccessAreaInfos = _tapMainInitObj.hotkill._mainAccessAreaInfos;
		// 			_mainAccessAreaInfos[_ajaxAreaKeys.GEN] = _tapMainInitObj._setArrayToAccessStructure(_genKey, [ '8005011' ]);

		// 		// 핫킬 변수 선언
		// 		var hotkillId,
		// 			hotkillLoadingZoneCurrentPage,
		// 			rowsPerPage = 10,
		// 			hotkillLoadingZoneIsMoreData,
		// 			hotKillTemplate,
		// 			hotKillCategoryCode,
		// 			hotKillAreaCode,
		// 			hotkillAjaxLoding = false;

		// 		// 핫킬 초기실행
		// 		var _initHotkill = function() {

		// 			var $ele = $('.hot_kill_best section[class=loadingZone]');
		// 			hotkillId = $ele.attr('target');
		// 			hotkillLoadingZoneCurrentPage = Number($ele.attr('currentpage'));
		// 			hotkillLoadingZoneIsMoreData = ($ele.attr('ismoredata') == "true");
		// 			hotKillCategoryCode = $ele.attr('category_code');
		// 			hotKillAreaCode = $ele.attr('area_code');
		// 		}

		// 		_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN] = function() {
		// 		}
		// 		// 핫킬 html tag bind
		// 		_mainAccessAreaInfos[_cbFnKeys.LOAD_CB_FN] = function(_deferreds) {

		// 			var _hotKillSuccess = function(data) {
		// 				var $imgLazele,
		// 					data_original_val,
		// 					$ele = $(".mainNav.swipe-hotkill.mcv");
		// 				$ele.append(data).promise().done(function() {
		// 					$imgLazele = $ele.find('img.lazy');
		// 					_LazyLoadUtil.initLoadImgPolicy($imgLazele, null, true);
		// 				});
		// 			}

		// 			// 비동기 이후 작업
		// 			return $.when.apply($, _deferreds).done(function(result1) {
		// 				_hotKillSuccess($.isArray(result1) ? result1[0] : result1);
		// 				_initHotkill();
		// 				_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN]();
		// 			}).fail(function() {});

		// 		}

        //         // 2018-12-17 - 메인개선관련 : 화면 key값과, ajax code 정보를 _mainAccessAreaInfos['lastLoad'] 로 보냄
        //         _mainAccessAreaInfos['lastLoad'] = _tapMainInitObj._lastGenAccess('hotkill', _mainAccessAreaInfos[_ajaxAreaKeys.GEN]);

		// 		return _mainAccessAreaInfos;
		// 	}
		// },

		// *** 추천관
		recommend : {
			_mainAccessAreaInfos : {},
			init : function() {
				var _genKey = _tapMainInitObj._accessStructureKeys.GEN,
				_ajaxAreaKeys = _tapMainInitObj._ajaxAreaKeys,
				_cbFnKeys = _tapMainInitObj._cbFnKeys,
				_mainAccessAreaInfos = _tapMainInitObj.recommend._mainAccessAreaInfos;
				_mainAccessAreaInfos[_ajaxAreaKeys.GEN] = _tapMainInitObj._setArrayToAccessStructure(_genKey, [ '8005099' ]);

//					_AreaAccessArray = [ '8005052' ];
//				_mainAccessAreaInfos[_ajaxAreaKeys.AREA] = _tapMainInitObj._setArrayToAccessStructure(_areaKey, _AreaAccessArray);
//				_mainAccessAreaInfos[_ajaxAreaKeys.VM] = _tapMainInitObj._setArrayToAccessStructure(_vmKey, [ '/category/main/curation_recommend' ]);

				_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN] = null;

				_mainAccessAreaInfos[_cbFnKeys.LOAD_CB_FN] = function(_deferreds) {
					var _recommandSuccess = function(data) {
						var $imgLazele,
							data_original_val,
							$ele = $(".mainNav.swipe-recommend.mcv");
						$ele.append(data).promise().done(function() {
							$imgLazele = $ele.find('img.lazy');
							_LazyLoadUtil.initLoadImgPolicy($imgLazele, 6, false);
						});
					}

					var _recommandGoodsSuccess = function(data) {
						var _replaceData = data.replace(/src/gi, 'data-original');
						$(".swipe-recommend").append(_replaceData);
						$(".swipe-recommend").find("img").lazyload({
							threshold : 1800
							/*effect : 'fadeIn',
						    effectTime : 1000*/
						});
					}

					var _deferreds,
						_conditionFn;

					_conditionFn = _recommandGoodsSuccess;

					// 비동기 이후 작업
					return $.when.apply($, _deferreds).done(function() {
						if(arguments.length === 2){
							_recommandSuccess(arguments[0][0]);
							_conditionFn(arguments[1][0]);
						}else{
							_recommandSuccess(arguments[0]);
						}

					}).fail(function() {
						_Util.Ui.showAlertMsg(1);
					});
				}

				_mainAccessAreaInfos[_cbFnKeys.INIT_CB_FN] = function() {
					_mainUi.common.initBottonFloting();
					/* S: 2019-04-22 추천관 개선: 퍼블용 */
					if(!$('.recommend_mark').hasClass("active")) $('.recommend_mark').addClass("active");
					/* E: 2019-04-22 추천관 개선: 퍼블용 */
				}
// 퍼블리싱에서는 상품 추가 바인딩 로직 안태움.
//				//추천관 더보기
//				var nextRecommendStatus = false;
//
//				var _nextRecommendGoods = function() {
//					if( !nextRecommendStatus ) {
//					  	jQuery.ajax({
//					           type: "get",
//					           url: "/category/main/curation_recommend",
//					           success: function(data, textStatus, jqXHR) {
//					  	 		$(".swipe-recommend").append(data);
//									nextRecommendStatus = true;
//					      	 },
//					           error:function(jqXHR, textStatus, errorThrown){
//					      	 	alert("일시적인 장애가 발생했습니다. 잠시후에 다시 요청 하시기 바랍니다.");
//
//					           }
//					  	});
//					}
//				};

				var _onceFlag = false;
				var _afterImageLoaderEventTrigger = function(){
					if(!_onceFlag){
						_onceFlag = true;

						if (!$('#pagebox').hasClass('curation')) {
							$("#recommandPlanList").find("img.lazy").trigger('afterLoad');
						} else {
							$(".swipe-recommend").find("img").trigger('afterLoad');
						}

					}
				}

				_mainAccessAreaInfos[_cbFnKeys.DESTORY_CB_FN_CB_FN] = null;
				_mainAccessAreaInfos[_cbFnKeys.SCOLL_CB_FN] = function(){
					//_afterImageLoaderEventTrigger();
                };
                

				return _mainAccessAreaInfos;
			}
		},
		// *** 기획전
		plan : {
			_mainAccessAreaInfos : {},
			init : function() {
				var _genKey = _tapMainInitObj._accessStructureKeys.GEN,
					_ajaxAreaKeys = _tapMainInitObj._ajaxAreaKeys,
					_cbFnKeys = _tapMainInitObj._cbFnKeys,
					_mainAccessAreaInfos = _tapMainInitObj.plan._mainAccessAreaInfos;

				_mainAccessAreaInfos[_ajaxAreaKeys.GEN] = _tapMainInitObj._setArrayToAccessStructure(_genKey, [ '8005014' ]);

				// plan 더보기 위한 변수선언
				var exhibitionId,
					exhibitionLoadingZoneIsMoreData,
					exhibitionTemplate,
					exhibitionAjaxLoding = false;

				// plan 초기실행
				var _initExhibition = function() {
					exhibitionId = $('#exhibitionLoadingZone').attr('target');
//					exhibitionTemplate = Handlebars.compile($('#exhibition-template').html());
					exhibitionLoadingZoneIsMoreData = ($('#exhibitionLoadingZone').attr('ismoredata') == "true");
				};
//  퍼블리싱에서는 기획전 추가 바인딩 로직 안태움.
//				// 스크롤 더보기
//				var _nextExhibition = function() {
//					_initExhibition();
//
//					if (exhibitionLoadingZoneIsMoreData && !exhibitionAjaxLoding) {
//						exhibitionAjaxLoding = true;
//						$('#exhibitionLoadingZone').show();
//
//						var _deferred = $.getJSON('/category/exhibition');
//
//						_deferred.done(function(data) {
//							$('#exhibitionLoadingZone').attr('ismoredata', 'false');
//
//							if (data.bannerList != null && data.bannerList.length > 0) {
//								$('#' + exhibitionId).show();
//
//								$.each(data.bannerList, function(i, val) {
//									$('#' + exhibitionId).append(exhibitionTemplate(val));
//								});
//								_initSlide();
//							} else {
//								$('#' + exhibitionId).hide();
//							}
//
//							var $lazyEle = $('div[name=nextExhibit]').find('img.lazy');
//							_LazyLoadUtil.initLoadImgPolicy($lazyEle);
//
//							exhibitionAjaxLoding = false;
//							$('#exhibitionLoadingZone').hide();
//						}).fail(function() {
//							exhibitionAjaxLoding = false;
//							_Util.Ui.showAlertMsg(1);
//						});
//					}
//				};

				_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN] = null;

				_mainAccessAreaInfos[_cbFnKeys.LOAD_CB_FN] = function(_deferreds) {

					// TODO 디폴트로 가저가야함.
					var _planSuccess = function(data) {
						var $imgLazele,
							data_original_val,
							$ele = $(".mainNav.swipe-plan.mcv");
						$ele.append(data).promise().done(function() {
							$imgLazele = $ele.find('img.lazy');
							$imgLazele.each(function(index, ele) {
								var $ele = $(this);
								$ele.attr('src', $ele.attr('data-original'));
							});
						});
					}

					// 비동기 이후 작업
					return $.when.apply($, _deferreds).done(function(result1) {

						_planSuccess(result1);

						$('.order_open_main').removeAttr('onClick');

						$(document).on('click','.order_open_main', function() {
							$(this).toggleClass('active').next().toggle();
						});

						_initExhibition();

					}).fail(function() {
						_Util.Ui.showAlertMsg(1);
					});
				}
//  퍼블리싱에서는 기획전 추가 바인딩 로직 안태움.
//				_mainAccessAreaInfos[_cbFnKeys.SCOLL_CB_FN] = _nextExhibition;

				_mainAccessAreaInfos[_cbFnKeys.INIT_CB_FN] = function() {
					$(".order_open_main").css("cursor","pointer");
					_mainUi.common.initBottonFloting();
				}

                _mainAccessAreaInfos[_cbFnKeys.DESTORY_CB_FN_CB_FN] = null;
                

				return _mainAccessAreaInfos;
			}
		},
		// ** 홈&해택
		event : {
			_mainAccessAreaInfos : {},
			init : function() {
				var _genKey = _tapMainInitObj._accessStructureKeys.GEN,
					_ajaxAreaKeys = _tapMainInitObj._ajaxAreaKeys,
					_cbFnKeys = _tapMainInitObj._cbFnKeys,
					_mainAccessAreaInfos = _tapMainInitObj.event._mainAccessAreaInfos;
                
				_mainAccessAreaInfos[_tapMainInitObj._ajaxAreaKeys.GEN] = _tapMainInitObj._setArrayToAccessStructure(_genKey, [ '8005013' ]);

// 퍼블리싱에서는 홈&해택  추가 바인딩 로직 안태움.
//				// 이벤트 더보기 체크
//				var eventAjaxLoading = false;
//
//				var _nextBanner = function() {
//					if(!$(".swipe-event .boxPlan").attr("aleadyLoadYn") && !eventAjaxLoading){
//						eventAjaxLoading = true;
//						var deferred = $.get('/main/tap/nexteventbanner');
//
//						deferred.done(function(data) {
//							var $ele = $("#mainEventBannerSection");
//							var appendDeferred = $ele.append(data);
//							appendDeferred.promise().done(function() {
//								$ele.find("img").lazyload({threshold : 100});
//							});
//							$(".swipe-event .boxPlan").attr("aleadyLoadYn",true);
//							eventAjaxLoading = false;
//						});
//
//						deferred.fail(function() {
//							eventAjaxLoading = false;
//							_Util.Ui.showAlertMsg(1);
//						});
//
//						return deferred;
//					}
//				}

				_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN] = function(_deferreds) {}

				_mainAccessAreaInfos[_cbFnKeys.LOAD_CB_FN] = function(_deferreds) {
					var _eventSuccess = function(data) {
						var $imgLazele,
							data_original_val,
							$ele = $(".mainNav.swipe-event.mcv");
						$ele.append(data).promise().done(function() {
							$(".mainNav.swipe-event.mcv").find("img").lazyload({threshold : 100});
						});
					}

					// 비동기 이후 작업
					return $.when.apply($, _deferreds).done(function(result1) {
						_eventSuccess($.isArray(result1) ? result1[0] : result1);
					}).fail(function() {
						_Util.Ui.showAlertMsg(1);
					});
				}

// 퍼블리싱에서는 홈&해택  추가 바인딩 로직 안태움.
//				_mainAccessAreaInfos[_cbFnKeys.SCOLL_CB_FN] = _nextBanner;
				_mainAccessAreaInfos[_cbFnKeys.INIT_CB_FN] = function() {
					_mainUi.common.initBottonFloting();
				}
                _mainAccessAreaInfos[_cbFnKeys.DESTORY_CB_FN] = null;
                

				return _mainAccessAreaInfos;
			}
		},
		// *** TV 플러스
		tvplus : {
			_mainAccessAreaInfos : {},
			init : function() {
				var _genKey = _tapMainInitObj._accessStructureKeys.GEN,
					_ajaxAreaKeys = _tapMainInitObj._ajaxAreaKeys,
					_cbFnKeys = _tapMainInitObj._cbFnKeys,
					_mainAccessAreaInfos = _tapMainInitObj.tvplus._mainAccessAreaInfos,
					_genAccessArray = [ '8005026']; //2018-08-24 홈쇼핑 다모아 네이밍 변경 및 디자인 변경(다모아)  4차 8005025-2 (2018-05-17수정), 3차:8005025-1, 2차:8005025 (2017-12-20 수정)
					_mainAccessAreaInfos[_ajaxAreaKeys.GEN] = _tapMainInitObj._setArrayToAccessStructure(_genKey,_genAccessArray);
					
                    // 2018-12-31-다모아수정 : 삭제
					// $(document).on('click','.se_nav > ul li a', function(){//카테고리 클릭 이벤트 //2018-11-21 다모아 2뎁스(수정)
					// 	var thisClass=$(this).parents("li").attr("class").replace("on","").replace("ev","").replace("hot","").replace(" ","");//2018-10-10 다모아 수정

					// 	var thisLi = $(".se_nav ul ."+thisClass+"");

					// 	if(thisClass=="cate09"){
					// 		$(".nav_wrap .se_nav_sub").css("display","block");//길어야1분 카테고리
					// 		$(".nav_wrap .se_nav_2depth").css("display","none");//2018-11-21 다모아 2뎁스(추가)
					// 	}else{
					// 		$(".nav_wrap .se_nav_sub").css("display","none");//길어야1분 카테고리
					// 		$(".nav_wrap .se_nav_2depth").css("display","block");//2018-11-21 다모아 2뎁스(추가)
					// 	}

					// 	$(".se_nav ul li").removeClass('on');
					// 	thisLi.addClass('on');

					// 	//2018-10-01 다모아 수정 시작//
					// 	var thisNum=Math.floor($(this).parents("li").index()/5);

					// 	$(".mainContent > .nav_wrap .se_nav > ul").css("marginTop",-(41*thisNum));//2018-11-21 다모아 2뎁스(수정)
                        
                    //     //2018-10-01 다모아 수정 끝//
					// 	return false;
					// });

                    // 2019-01-01-다모아수정 : 삭제
					// $(document).on('click','.mainContent > .nav_wrap .cate_close', function(){//카테고리 접고 펴기 이벤트
					// 	var thisClose=$(".mainContent > .nav_wrap .cate_close");
					// 	var cateWrap=$(".mainContent > .nav_wrap .nav_wrap_in .se_nav");//2018-10-01 다모아 수정
					// 	var theHeight=Math.ceil($(".mainContent > .nav_wrap .se_nav > ul li").length/5);//2018-11-21 다모아 2뎁스(수정)
					// 	var thisOn=Math.floor($(".mainContent > .nav_wrap .se_nav > ul .on").index()/5); //2018-11-21 다모아 2뎁스(수정)

					// 	if(thisClose.hasClass("on")){
					// 		thisClose.removeClass("on");
					// 		cateWrap.stop().animate({height:40},300);
					// 		$(".mainContent > .nav_wrap .se_nav ul").stop().animate({marginTop:-(41*thisOn)},300);//2018-10-01 다모아 수정
					// 	}else{
					// 		if($('.mainContent > .nav_wrap.fixed .se_nav_sub').is(':visible')){//2018-11-21 다모아 2뎁스(추가)
					// 			cateWrap.stop().animate({height:41*theHeight},300);
					// 		}else{//2018-11-21 다모아 2뎁스(추가)
					// 			cateWrap.stop().animate({height:(41*theHeight)+$(".se_nav_2depth").innerHeight()},300);//2018-11-21 다모아 2뎁스(추가)
					// 		}//2018-11-21 다모아 2뎁스(추가)

					// 		$(".mainContent > .nav_wrap .se_nav ul").stop().animate({marginTop:0},300);//2018-10-01 다모아 수정
					// 		thisClose.addClass("on");

					// 	}
					// });

					$(document).on('click','.se_best_area .se_btn_more', function(){//인기 메인 더보기 버튼 클릭 이벤트
						var thisNum=$(this).parents(".se_best_area").index();

						$(".se_best_area .se_btn_more").eq(thisNum).css("display","none");
						$(".se_best_area .se_btn_go").eq(thisNum).css("display","block");
						$(".se_list_wrap .recommend_list").eq(thisNum).removeAttr("style");/* 2018-09-27 다모아 추가 */
					});

                    $(document).on('click','.se_nav_sub ul li a', function(event){// 2019-01-01-다모아수정 : 수정 event 넘김
                        event.preventDefault(); // 2019-01-01-다모아수정 : 추가
						var thisClass=$(this).parents("li").attr("class").replace("on","").replace("ev","");
						var thisLi = $(".se_nav_sub ul ."+thisClass+"");

						$(".se_nav_sub ul li").removeClass('on');
						thisLi.addClass('on');
					});

					$(document).on('click','.mainContent > .nav_wrap .se_nav li a', function(){//길어야 1분 복사 카테고리 클릭 이벤트(스크롤 탑 이동)//2018-11-21 다모아 2뎁스(수정)
						var appTop=$(".app_setup").length;//상단에 app설치 안내가 있는지 체크

						if(appTop>0){//웹인경우
							var ScTopNum=144;
						}else{//앱인경우
							var ScTopNum=0;
						}
						$('html, body').scrollTop(ScTopNum);
						return false;
					});
					/* 2018-08-24 홈쇼핑 다모아 네이밍 변경 및 디자인 변경(다모아) 추가 끝 */
					
				/* 2018-11-21 다모아 2뎁스(추가 시작) */
				_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN] = function(_deferreds) {

                    var categoryEvent = (function(){
                        var depSwiper = _mainUi.tvplus.depthSlide(),
                            $naviWrap = $('.nav_wrap'),
                            $listArea = $(".mainContent > .nav_wrap .se_nav > ul"),
                            $list = $('.se_nav > ul li'),
                            $btns = $('.se_nav > ul li a'),
                            $btnMore = $(".mainContent > .nav_wrap .cate_close"),
                            $cateWrap = $(".mainContent > .nav_wrap .nav_wrap_in .se_nav"),
                            $swiperList = $(".se_nav_2depth_in").eq(0).find('> ul > li'),
                            thisNum = 0,
                            cateWrapHeight = 40; // 픽스 뎁스카테고리 높이값

                        if( $('.cate00').hasClass('on') ){$naviWrap.addClass('no_depth');}
                        
                        // 2019-01-09 - 다모아 수정개선 - $btns 클릭 이벤트 수정
                        $btns.on('click', function(event){
                            event.preventDefault();

                            var $thatList = $(this).parent('li'),
                                idx = $(this).parent('li').index();

                                thisNum = Math.floor($(this).parents("li").index()/5);
                                $listArea.css("marginTop", - ( cateWrapHeight * thisNum) );
                            
                            for (var i = 0; i < $naviWrap.length; i++) {
                                $naviWrap.eq(i).find($list).eq(idx).addClass('on').siblings().removeClass('on');
                            }

                            if ( $thatList.hasClass('cate00') || $thatList.hasClass('cate09') ) {

                                if( depSwiper._slideArry().length > 0 ) depSwiper.destroy(); // 2019-01-03 다모아 수정 : 추가
                                
                                $naviWrap.addClass('no_depth');
                                if($thatList.hasClass('cate09')){
                                    $naviWrap.addClass('oneminute_depth');
                                }else if( $thatList.hasClass('cate00') ) {
                                    $naviWrap.removeClass('oneminute_depth');
                                }
                            }else{
                                $naviWrap.removeClass('no_depth');
                                $naviWrap.removeClass('oneminute_depth');
                                
                                // 메뉴가 3개미만, swiper element 너비안에 메뉴가 안넘칠때 loop: false
                                var swiperLoop = function( $menuList ){
                                    var listWidth = null,
                                        loop = true;

                                    for (var i = 0; i < $menuList.length; i++) {
                                        for (var ii = 0; ii < $menuList.eq(i).find('> ul > li').length; ii++) {
                                            if( $menuList.eq(i).find('> ul > li').eq(ii).hasClass('active') ) $menuList.eq(i).find('> ul > li').eq(ii).removeClass('active');
                                            if( i === 0 ) {
                                                listWidth += $menuList.eq(i).find('> ul > li').eq(ii)[0].clientWidth + 20;
                                            }
                                        }
                                    }
                                    if( $menuList.eq(0).find('> ul > li').length <= 3 || listWidth <= $menuList.eq(0).outerWidth(true) ){
                                        loop = false;
                                    }
                                    return loop;
                                };

                                // resizing
                                var timeout = null;
                                var debounce = function(func, wait) {
                                    return function(){
                                        clearTimeout(timeout);
                                        timeout = setTimeout(func, wait);
                                    }
                                };

                                $(window).on('resize', function(){
                                    var swiperInit = debounce(function(){
                                        // 카테고리 변경시점에, 해당 카테고리의 swiper 메뉴리스트를 $swiperList에 재참조 후 swiper실행 
                                        if( depSwiper._slideArry().length > 0 ) depSwiper.destroy();
                                        $swiperList = $(".se_nav_2depth_in");
                                        depSwiper.init({ loop: swiperLoop($swiperList) });
                                    }, 200)();
                                }).trigger('resize');
                            }
                        });

                        var autoHeightAnimate = function(element, time){
                            var curHeight = element.height(),
                                autoHeight = element.css('height', 'auto').height();
                                element.height(curHeight);
                                element.stop().animate({ height: autoHeight }, time);
                        };

                        $btnMore.on('click', function(){
                            if( $btnMore.hasClass('on') ){
                                $btnMore.removeClass('on');
                                $listArea.css("marginTop", - ( cateWrapHeight * thisNum) );
                                $cateWrap.stop().animate( {height: cateWrapHeight } ,300);
                            }else{
                                $btnMore.addClass('on');
                                $listArea.css("marginTop", 0 );
                                autoHeightAnimate($cateWrap, 300);
                            }
                        });
                    })();

					/* 2018-08-24 홈쇼핑 다모아 네이밍 변경 및 디자인 변경(다모아) 추가 시작 */
					var scrolledTv = false;
					var timerTv;

					$(window).on('scroll', function(){//다모아 카테고리 스크롤 이벤트
						var scrollTop = $(window).scrollTop();
						var currentIdx =  _getCurrentLocationIdx();//스와이프 인덱스 값 다모아은5
                        var appTop=$(".app_setup").length;//상단에 app설치 안내가 있는지 체크
                        var thisNum = Math.floor($(".se_shop .se_nav > ul > .on").index()/5); // 2019-01-01-다모아수정 : 추가
						scrolledTv = true;

						if(appTop>0){//웹인경우
							var fixedTopNum=$(".se_shop").offset().top+5-42;
						}else{//앱인경우
							var fixedTopNum=5;
						}

						var cloneSeNav=$(".mainContent > .nav_wrap");
						var oriSeNav=$(".se_shop .nav_wrap");

						if(scrollTop>=fixedTopNum){
							if(currentIdx==6){//2019-01-30 좋은밥상 순서 변경//2019-04-02 좋은밥상 순서 변경
								cloneSeNav.addClass("fixed");
								oriSeNav.addClass("fixed");
                                
								$(".mainContent > .nav_wrap.fixed .se_nav_sub").css({"height":"0","paddingTop":"0","paddingBottom":"0","marginTop":"-1px"}); //2018-10-01 다모아 수정

							}else{
								cloneSeNav.removeClass("fixed");
							}

							$('.mainContent > .nav_wrap').addClass('optView');

							clearTimeout(timerTv);
							timerTv = setTimeout( scrollEndTv , 200 );
						}else{
							cloneSeNav.removeClass("fixed");
							oriSeNav.removeClass("fixed");
							var thisClose=$(".mainContent > .nav_wrap .cate_close");
							var cateWrap=$(".mainContent > .nav_wrap .nav_wrap_in .se_nav");//2018-10-01 다모아 수정
							thisClose.removeClass("on");
                            cateWrap.stop().animate({height:40},300);
                            
                            $(".mainContent > .nav_wrap .cate_close").removeClass('on'); // 2019-01-01-다모아수정 : 추가
                            $(".mainContent > .nav_wrap .se_nav > ul").css("marginTop", - ( 40 * thisNum) ); // 2019-01-01-다모아수정 : 추가
						}
					});

					function scrollEndTv(){
	                    if(scrolledTv){
	                        $('.mainContent > .nav_wrap').removeClass('optView');
	                        scrolledTv = false;
	                        $(".mainContent > .nav_wrap.fixed .se_nav_sub").stop().animate({height:60,paddingTop:10,paddingBottom:10,marginTop:-1},300);
	                    }
					}
					/* 2018-08-24 홈쇼핑 다모아 네이밍 변경 및 디자인 변경(다모아) 추가 끝 */

					/* 2018-08-24 홈쇼핑 다모아 네이밍 변경 및 디자인 변경(다모아) 삭제 시작 // 카테고리 버튼 이벤트 할당
					$(document).on('click', '#floatingCategory .btnCategory', function(e) {
						 var $el = $('#floatingCategory');

						 //2017-05-24 추가
						 if($el.is(':animated') || $el.hasClass('auto')){	//2017-09-13 수정
							 console.log('event stop...');
							 return false;
						 }

						 if($el.hasClass('on')){
							 //jQuery(".footer.v_0201").show();

							 $el.removeClass("on");
							 $el.css("right", "0");
							 //2017-09-18 삭제 $(".categoryWrap", $el).animate({opacity:0}, 300);
							 $el.animate({
								 right: "-=101",
							 }, 300, function() {
								 //2017-09-18 삭제 $("#floatingCategory .categoryWrap").css("visibility", "hidden");
							 });
						 }else{
							 prevScrollY = window.scrollY;
							 //Query(".footer.v_0201").hide();
							 //2017-09-18 삭제 $("#floatingCategory .categoryWrap").css("visibility", "visible");
							 //2017-09-18 삭제 $(".categoryWrap", $el).animate({opacity:1}, 300);
							 $el.addClass("on");
							 $el.css("right", "-101px");
							 $el.animate({
								 right: "+=101",
							 }, 300, function() {
							 });
						 }
						e.stopPropagation();
					});

					// dimmed layer tooltip 2018-03-13 추가
					$(document).on('click', '.damoaBtn1', function() {
						var offsetH1 = $('.nowOnAir.type02').offset();

						$('.deem').addClass('tooltip');
						$('.damoaMP1').css({'top':offsetH1.top+42+'px','display':'block'});
					});
					$(document).on('click', '.damoaBtn2', function() {
						var offsetH2 = $('.weeklyBest.type02').offset();

						$('.deem').addClass('tooltip');
						$('.damoaMP2').css({'top':offsetH2.top+42+'px','display':'block'});
					});
					$(document).on('click', '.btnLayerClose', function() {
						$('.deem').removeClass('tooltip');
						$('.damoaInfo').css('display','none');
					});
					$(document).on('touchstart', '.deem.tooltip', function() {
						$(this).removeClass('tooltip').css('display','none');
						$('.damoaInfo').css('display','none');
					});

					// 스크롤시 카테고리 고정 2017-11-16
					$(window).on('scroll', function(){
						var scrollTop = $(window).scrollTop();

						cateTop = $('.swipe-tvplus .half_top_tab').position().top; //2017-12-13 수정 //2018-05-17 삭제
						cateTop2 = cateTop+($(".app_setup").outerHeight()+$(".headerNew").outerHeight()); //2018-07-06 gnb수정 추가

						// 스크롤시 코치마크 사라짐 2017-12-14
						if($('.coach_mark.fixed').is(':visible')){
							if(_timer4 && _timer4 != undefined)	clearTimeout(_timer4);

				    		$('.coach_mark.fixed').removeClass('opacity');
				    		setTimeout(function(e){
								$('.coach_mark.fixed').css('display','none');
				    		}, 2000);
						}

						//2018-05-17 삭제
						// 카테고리메뉴 비활성시 스크롤 막음 2017-12-13
						if($('#cateNavi.disabled').length) return false;
				    	//console.log('call scroll');
						if(scrollTop>cateTop2){//2018-07-06 gnb수정(scrollTop>cateTop 를 scrollTop>cateTop2로 수정)
							$cateNaviClone.css('display', 'block');
							$cateNavi.css('opacity', 0);
						}else{
							$cateNaviClone.css('display', 'none');
							$cateNavi.css('opacity', 1);
						}
					});

					// 2018-05-17 S
					$(document).on('click', '.cateType02', function() {
						$('.damoaLeftBox').scrollTop(0);
						$('.cateType02').removeClass('on');
						$(this).addClass('on');
					});

					$('.damoaLeftBox').on('scroll', function(){
						$cateNaviClone = $('.docked2');
						$cateNavi = $('.icoView');

						 if($(this).scrollTop() >= 5) {
							 $cateNaviClone.show();
							 $cateNavi.hide();
						  } else {
							 $cateNaviClone.hide();
							 $cateNavi.show();
						  }
					});
					// 2018-05-17 E

					// 코치마크 터치시 사라짐 2017-12-14
					$(document).on("touchstart", function(e) {
						var touches;
						touches = e.originalEvent.touches[0];
						if($(touches.target.parentElement).hasClass('coach_mark')){
							if($('.coach_mark.fixed').is(':visible')){
					    		$('.coach_mark.fixed').removeClass('opacity');
								if(_timer3 && _timer3 != undefined)	clearTimeout(_timer3);
					    		_timer5 = setTimeout(function(e){
									$('.coach_mark.fixed').css('display','none');
					    		}, 2000);
							}
						};
					});
					*/ //홈2018-08-24 홈쇼핑 다모아 네이밍 변경 및 디자인 변경(다모아) 삭제 끝
// 플레이어관련 이벤트 할당 하지 않음 !!
//					$(document).on('click', '.imgZone', function(e) {
//						var playParams = {
//								"src" : $(this).parent().attr('src'),
//								"img" : "",
//								"mode" : "onlyFull",
//								"islive" : "false",
//								"target" : "",
//								"player" : "",
//								"vodVtYn" : $(this).parent().attr('vodVtYn'),
//								"type" : $(this).parent().attr('vodType')
//							};
//
//						modulePlayer.newPlayVideo(playParams);
//					});

				}

				_mainAccessAreaInfos[_cbFnKeys.LOAD_CB_FN] = function(_deferreds) {
					var _tvPlusSuccess = function(data) {
						var $imgLazele,
							data_original_val,
							$ele = $(".mainNav.swipe-tvplus.mcv");
						$ele.append(data).promise().done(function() {
							$imgLazele = $ele.find('img.lazy');
							_LazyLoadUtil.initLoadImgPolicy($imgLazele, 4, true);
						});
						_mainUi.tvplus.swiper().init('.tvPlusVideoWrap');
					}
					// 비동기 이후 작업
					return $.when.apply($, _deferreds).done(function(result1) {
						_tvPlusSuccess(result1);
						//_initTvPlus(); //2018-08-24 홈쇼핑 다모아 네이밍 변경 및 디자인 변경(다모아)
						_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN]();
					}).fail(function() {});
// 퍼블리싱 수정
//					return $.when.apply($, _deferreds).done(function(result1,result2) {
//						_tvPlusSuccess(result1[0]);
//						_tvPlusSuccess(result2[0]);
//						_initTvPlus();
//						_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN]();
//					}).fail(function() {});
				}
				// 플레이어관련 이벤트 할당 하지 않음 !!
//				_mainAccessAreaInfos[_cbFnKeys.SCOLL_CB_FN] = _nextTvPlus;

				// category 메뉴 tvplus 진입시 open후 2.5초후 close 됨 2017-09-18 수정
				_mainAccessAreaInfos[_cbFnKeys.INIT_CB_FN] = function() {

					// 2018-05-17 S
					var contBoxH = $(window).height() - 81;
					$('.swipe-tvplus > .renewal_v2').css('height', contBoxH);
					console.log(contBoxH);

					$("#footer").show();//2018-08-24 홈쇼핑 다모아 네이밍 변경 및 디자인 변경(다모아)

					aCate = function (aurl){
						jQuery.ajax({
							type: "get",
					           url: aurl,
					           success: function(data) {
					  	 		$(".damoaLeftBox").html(data);
					  	 		$('.damoaLeftBox').scrollTop(0);
					      	 },
					           error:function(){
					      	 	alert("일시적인 장애가 발생했습니다. 잠시후에 다시 요청 하시기 바랍니다.");
					           }
					  	});
						return false
					};
					aCate ('../../genhtml/60000020/8005025-01.html');
					// 2018-05-17 E

					/* 2018-08-24 홈쇼핑 다모아 네이밍 변경 및 디자인 변경(다모아) 삭제 시작
					var $el = $('#floatingCategory');

					if($el.css("display") == "none" ){
						$el.show().css({"right": "-101px"});
						$el.addClass("on auto");		//2017-09-13 수정
						_timer = setTimeout(function(){
							//$(".categoryWrap", $el).css("visibility", "visible");
							$el.animate({
								right: "0",
							}, 300, function() {
								clearTimeout(_timer);
							});
						}, 300);

						_timer2 = setTimeout(function(){
							$el.removeClass("on auto");		//2017-09-13 수정
							//$el.css("right", "0");
							$el.animate({
								right: "-101",
							}, 300, function() {
								//$(".categoryWrap", $el).css("visibility", "hidden");
								clearTimeout(_timer2);
							});
						}, 2500);
					}

					// 2018-05-17 삭제
					// 카테고리 메뉴 활성 2017-12-13
					if($('#cateNavi.disabled').length) $('#cateNavi.docked').removeClass('disabled');

			    	// 코치마크 생성 및 초기화 2017-12-14
			    	var $coachMark = $('.swipe-tvplus .coach_mark');
			    	if($coachMark.length){
						var $coachMarkClone = $coachMark.clone();
						$coachMark.remove();
				    	$('.wrap .cont_sw').append($coachMarkClone);
				    	$coachMarkClone.css('display','block');
			    		_timer3 = setTimeout(function(e){
				    		$coachMarkClone.addClass('fixed opacity');
			    		}, 500);
			    	}else{
			    		var $coachMarkClone = $('.coach_mark');
			    		$coachMarkClone.css('display','block');
			    		_timer3 = setTimeout(function(e){
				    		$coachMarkClone.addClass('fixed opacity');
			    		}, 500);
			    	}

			    	// 5초후 코치마크 사라짐 2017-12-14
			    	_timer4 = setTimeout(function(e){
				    	if(!$('.coach_mark').is(':hidden')) {
				    		$('.coach_mark').removeClass('opacity');
							if(_timer3 && _timer3 != undefined)	clearTimeout(_timer3);
							_timer5 = setTimeout(function(e){
								$('.coach_mark').css('display','none');
				    		}, 2000);
				    	}
			    	}, 5000);

					_mainUi.common.initBottonFloting();
				}

				// 2017-09-18 수정
				_mainAccessAreaInfos[_cbFnKeys.DESTORY_CB_FN] = function() {
					var $el = $('#floatingCategory');
					$el.hasClass('on') ? $el.css("right", "0px") : $el.css("right", "-101px");
					$el.removeClass("on auto").hide();

					// 2018-05-17 삭제
					// 카테고리 메뉴 비활성 2017-12-13
					var $cateNaviDocked = $('#cateNavi.docked');
					if($cateNaviDocked.length){
						$cateNaviDocked.css('display', 'none');
						$cateNaviDocked.addClass('disabled');
					}

					// 코치마크 사라짐 2017-12-14
					var $coachMarkFixed = $('.coach_mark.fixed');
			    	if($coachMarkFixed.length){
			    		$coachMarkFixed.css('display','none');
			    		$coachMarkFixed.removeClass('fixed opacity');
			    	}

					if(_timer && _timer != undefined) clearTimeout(_timer);
					if(_timer2 && _timer2 != undefined)	clearTimeout(_timer2);
					if(_timer4 && _timer4 != undefined)	clearTimeout(_timer4); // 2017-12-14 추가
					if(_timer5 && _timer5 != undefined)	clearTimeout(_timer5); // 2017-12-14 추가
					*/ //2018-08-24 홈쇼핑 다모아 네이밍 변경 및 디자인 변경(다모아) 삭제 끝
                }
                

				return _mainAccessAreaInfos;

			}

		},
		// *** TV베스트
		tvbest : {
			_mainAccessAreaInfos : {},
			init : function() {

				if((!AppFlag || moduleCommon.appVersionCheck("android", "2.4.7") || moduleCommon.appVersionCheck("ios", "2.2.22"))){
					var _genKey = _tapMainInitObj._accessStructureKeys.GEN,
						_areaKey = _tapMainInitObj._accessStructureKeys.AREA,
						_ajaxAreaKeys = _tapMainInitObj._ajaxAreaKeys,
						_tvbestSwiper = _mainUi.tvbest,//2019-02-18 tv베스트 개선(추가)
						_cbFnKeys = _tapMainInitObj._cbFnKeys,
						_genAccessArray = ['8007000-1', '8007000-2'],//2019-02-18 tv베스트 개선(수정)
//						_AreaAccessArray = ['8005057'],
						_AreaAccessArray = null,
						_mainAccessAreaInfos = _tapMainInitObj.tvbest._mainAccessAreaInfos;

					_mainAccessAreaInfos[_ajaxAreaKeys.GEN] = _tapMainInitObj._setArrayToAccessStructure(_genKey, _genAccessArray);
//					_mainAccessAreaInfos[_ajaxAreaKeys.AREA] = _tapMainInitObj._setArrayToAccessStructure(_areaKey, _AreaAccessArray);
					
					/* 2019-02-18 tv베스트 개선(삭제 시작)
					var tvbestId,
						tvbestLoadingZoneCurrentPage,
						rowsPerPage = 20,
						tvbestLoadingZoneIsMoreData,
						market,
						bannerH,	// 2017-09-29 추가
						tvbestAjaxLoading = false;

					var _initTvBest = function() {
						var $ele = $('.tv_shop_best section[class=loadingZone]');
						tvbestId = $ele.attr('target');
						tvbestLoadingZoneCurrentPage = Number($ele.attr('currentpage'));
						tvbestLoadingZoneIsMoreData = ($ele.attr('ismoredata') == "true");

					}
					var _imgLazyTvBest = function(){
						var $imgLazele = $('.tvBestLeftBox').find('img.lazy:not([src])');
						_LazyLoadUtil.initLoadImgPolicy($imgLazele, 10, true,".tvBestLeftBox");
					}

					var _topInTvBestCate = function(){
						var $banner = $('.swipe-tvbest').find('.bannerBx'),
							$img = $('img', $banner);

						if(bannerH === undefined){
							$img.each(function(i){
								var _$img = $(this);
								if (_$img.length === 1) { //length 프로퍼티는 해당 태그가 존재하면 1, 없으면 0을 리턴한다.
									if (_$img[0].complete === false || _$img.attr('src') !== '') {
										 console.log('이미지가 완전히 로딩되지 않음');
										 _$img.load(function () {
											 var _img = this;
											 console.log('이미지 로딩이 완료됨.');
											 bannerH = $banner.outerHeight();
											 $('.tvBestCateWrap').css('top', bannerH+'px');
										 });
									 }
								 }
							 });
						}else{
							 bannerH = $banner.outerHeight();
							 $('.tvBestCateWrap').css('top', bannerH+'px');
							console.log('orientationchange');
						}

					}

// 퍼블리싱에서는 TV베스트   추가 바인딩 로직 안태움.
//					var _nextTvBest = function(){
//						_initTvBest();
//						if(tvbestLoadingZoneIsMoreData && !tvbestAjaxLoading){
//							tvbestAjaxLoading = true;
//							tvbestLoadingZoneCurrentPage++;
//							$('.tv_shop_best section[class=loadingZone]').attr('currentpage',tvbestLoadingZoneCurrentPage);
//							var _deferred;
//							var mark = $(".tvBestCateWrap ul>.on");
//							var type = mark.attr("type");
//							if(mark.hasClass("cateType02")){
//								var planCode = mark.attr("plan_code");
//								_deferred = $.get('/category/tvbest/subshop', {
//									type : type,
//									planCode : planCode,
//									currentPage : tvbestLoadingZoneCurrentPage,
//									rowsPerPage : 20,
//									target : "tvBest"
//								});
//							}else{
//								var categoryCode = mark.attr("category_code");
//								_deferred = $.get('/category/tvbest/subshop', {
//									type : type,
//									categroyCode : categoryCode,
//									currentPage : tvbestLoadingZoneCurrentPage,
//									rowsPerPage : 20,
//									target : "tvBest"
//								});
//							}
//
//							_deferred.done(function(data) {
//								$('.prdListCard').append(data);
//								tvbestAjaxLoading = false;
//								_imgLazyTvBest();
//								_initSlide();
//							});
//						}
//					};
					2019-02-18 tv베스트 개선(추가) */
					_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN] = function() {

						//console.log('tv best event bind');
// 퍼블리싱에서는 TV베스트   추가 바인딩 이벤트 바인딩 하지 않음
//
//						$(document).on('click','.tvBestCateWrap > ul > li',function(e){
//							$('.tv_shop_best section[class=loadingZone]').attr('currentpage',1);
//							tvbestLoadingZoneCurrentPage = 0;
//							$(this).addClass("on");
//							$(this).siblings().removeClass("on");
//							var _deferred;
//							if($(this).hasClass("cateType02")){
//								_deferred = $.get('/category/tvbest/subshop', {
//									type : $(this).attr("type"),
//									planCode : $(this).attr("plan_code")
//								});
//							}else{
//								_deferred = $.get('/category/tvbest/subshop', {
//									type : "tvcategory",
//									categroyCode : $(this).attr("category_code")
//								});
//							}
//							_deferred.done(function(data) {
//								tvbestLoadingZoneCurrentPage= 1;
//								$('.prdListCard').html(data);
//								_imgLazyTvBest();
//								_initSlide();
//								$('.tvBestLeftBox').scrollTop(0);
//							});
//							_deferred.fail(function() {
//								_Util.Ui.showAlertMsg(1);
//							});
//						});
//	
						/* 2019-02-18 tv베스트 개선(삭제 시작)
						var scrollFlag = true;

						var tvBestCatchScroll = function(flag){
							if(AndroidAgent){ //App이고 안드로이드 버전이 2.4.7이상일때만 안드로이드에 던진다.
								if(flag==1 && scrollFlag){
									window.scrolled.scrollStarted();
									scrollFlag = false;
								}else if(flag==2 && !scrollFlag){
									window.scrolled.scrollStopped();
									scrollFlag = true;
								}
							}else if(iOsAgent){
								if(flag==1 && scrollFlag){
									location.href="hnsmallapp://webcontrol?action=scrollStarted";
									scrollFlag = false;
								}else if(flag==2 && !scrollFlag){
									location.href="hnsmallapp://webcontrol?action=scrollStopped";
									scrollFlag = true;
								}
							}
						};
						if(AppFlag){
							// 앱
							$('.tvBestLeftBox').on('touchmove',function(e) {
								if (_scrollTimeout) {
									clearTimeout(_scrollTimeout);
									_scrollTimeout = null;
									tvBestCatchScroll(1);
								}
								_scrollTimeout = setTimeout(function() {
									if($(".prdListCard").height()-($(".prdListCard").height()*0.4) < $(".tvBestLeftBox").scrollTop() + $(document).height()){
										_nextTvBest();
									}
									tvBestCatchScroll(2);
								}, 150);
							});
							$('.tvBestCateWrap').on('touchmove',function(e) {
								if (_scrollTimeout) {
									clearTimeout(_scrollTimeout);
									_scrollTimeout = null;
									tvBestCatchScroll(1);
								}
								_scrollTimeout = setTimeout(function() {
									tvBestCatchScroll(2);
								}, 150);

							});
						}else{
							// 웹

							$('.tvBestLeftBox').on('scroll',function(e) {
								console.log('left box scroll');
								if (_scrollTimeout) {
									clearTimeout(_scrollTimeout);
									_scrollTimeout = null;
								}
								_scrollTimeout = setTimeout(function() {
									if($(".prdListCard").height()-($(".prdListCard").height()*0.4) < $(".tvBestLeftBox").scrollTop() + $(document).height()){
//										_nextTvBest();
									}
								}, 150);
							});
							$('.tvBestCateWrap').on('scroll',function(e) {
								console.log('tvBestCateWrap box scroll');
								if (_scrollTimeout) {
									clearTimeout(_scrollTimeout);
									_scrollTimeout = null;
								}
								_scrollTimeout = setTimeout(function() {
								}, 150);

							});

							$(window).on('orientationchange, resize', function() {
								setTimeout(function() {
									_topInTvBestCate();
								}, 100);
							});
						}
						2019-02-18 tv베스트 개선(삭제 끝)*/
					}

					_mainAccessAreaInfos[_cbFnKeys.LOAD_CB_FN] = function(_deferreds) {
						var _tvBestSuccess = function(data1,data2) {
						var $ele = $(".mainNav.swipe-tvbest.mcv .tvBestTabCount");

							return $ele.append(data1[0], data2[0]);
						}
						// 비동기 이후 작업
						return $.when.apply($, _deferreds).done(function(result1, result2) {
							var deferred = _tvBestSuccess(result1, result2);
							/* 2019-02-18 tv베스트 개선(삭제 시작)
							deferred.promise().done(function() {
								_imgLazyTvBest();
								_initTvBest();
								_topInTvBestCate();	// 2017-10-10 추가
							});
							2019-02-18 tv베스트 개선(삭제 끝) */
						}).fail(function() {});

//						return $.when.apply($, _deferreds).done(function(result1,result2) {
//							var deferred = _tvBestSuccess(result1[0],result2[0]);
//							deferred.promise().done(function() {
//								_imgLazyTvBest();
//								_initTvBest();
//
//							});
//						}).fail(function() {});

					}

					_mainAccessAreaInfos[_cbFnKeys.SCOLL_CB_FN] = {};



					_mainAccessAreaInfos[_cbFnKeys.INIT_CB_FN] = function() {
						console.log("_mainAccessAreaInfos[_cbFnKeys.INIT_CB_FN]");
						/* 2019-02-18 tv베스트 개선(삭제 시작) 
						var contBoxH = $(window).height() - 81;
						$('.swipe-tvbest > .container').css('height', contBoxH);
						//$("#pagecons").height(contBoxH); //2018-07-03 tv베스트 선행수정
						 2019-02-18 tv베스트 개선(삭제 끝) */
						
						_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN]();
					
						/* 2019-02-18 tv베스트 개선(추가 시작) */
		            	if(!_tvbestSwiper.swiperObj){
		            		_tvbestSwiper.swiper().init();
		            	}
		            	/* 2019-02-18 tv베스트 개선(추가 끝) */
					}

					_mainAccessAreaInfos[_cbFnKeys.DESTORY_CB_FN] = function() {
						//$('body').css({'overflow': 'auto'});
						$("#pagecons").css({'height': 'auto'});
						$("#footer").show();
						
						/*2018-12-03 tv베스트 수정(AOS구형폰 대응 갤노트2)(추가 시작) */
						function hiddenTvbest(){
							var currentIdx =  _getCurrentLocationIdx();//스와이프 인덱스 값 tvbest는7
							if(currentIdx != 7){//2019-01-30 좋은밥상 순서 변경 //2019-04-02 좋은밥상 순서 변경
								$('.cont_sw > .tvBestCateWrap').css("display","none");
							}
						}
						hiddenTvbest();

						/*2018-12-03 tv베스트 수정(AOS구형폰 대응 갤노트2)(추가 끝) */
						
						/* 2019-02-18 tv베스트 개선(추가 시작) */
		            	if(_tvbestSwiper.swiperObj){
		            		_tvbestSwiper.swiperObj.destroy(true, true);
		            		_tvbestSwiper.swiperObj = null;
		            	}
						$('.cont_sw > .tv_fixed').remove();//스티키메뉴 삭제
						/*//2019-02-18 tv베스트 개선(추가 시작) */
                    }
                    

					return _mainAccessAreaInfos;
				}
// APP이고, 특정 버전 인경우 ( 퍼블리싱은 대상 아님 !! )
//				else{
//					var _genKey = _tapMainInitObj._accessStructureKeys.GEN,
//					_areaKey = _tapMainInitObj._accessStructureKeys.AREA,
//					_ajaxAreaKeys = _tapMainInitObj._ajaxAreaKeys,
//					_cbFnKeys = _tapMainInitObj._cbFnKeys,
//					_mainAccessAreaInfos = _tapMainInitObj.tvbest._mainAccessAreaInfos,
//					_genAccessArray = [ '8005023', '8005019' ],
//					_AreaAccessArray = [ '8005039' ];
//
//					_mainAccessAreaInfos[_ajaxAreaKeys.GEN] = _tapMainInitObj._setArrayToAccessStructure(_genKey, _genAccessArray);
//					_mainAccessAreaInfos[_ajaxAreaKeys.AREA] = _tapMainInitObj._setArrayToAccessStructure(_areaKey, _AreaAccessArray);
//
//					//tvbest 변수 선언
//					var tvbestId,
//						tvBestLoadingZoneCurrentPage,
//						tvBestLoadingZoneIsMoreData,
//						tvBestTemplate,
//						tvBestCategoryCode,
//						tvBestAreaCode,
//						market,
//						tvbestAjaxLoading = false;
//
//					//tvbest 초기실행
//					var _initTvbest = function() {
//						tvbestId = $('.tv_shop_best section[class=loadingZone]').attr('target');
//						tvBestLoadingZoneCurrentPage = Number($('.tv_shop_best section[class=loadingZone]').attr('currentpage'));
//						tvBestLoadingZoneIsMoreData = ($('.tv_shop_best section[class=loadingZone]').attr('ismoredata') == "true");
//						tvBestTemplate = Handlebars.compile($('#tvbannerlist-template').html());
//						tvBestCategoryCode = $('.tv_shop_best section[class=loadingZone]').attr('category_code');
//						tvBestAreaCode = $('.tv_shop_best section[class=loadingZone]').attr('area_code');
//						market = $(".vodMenu li");
//					}
//// 퍼블리싱에서는 TV베스트   추가 바인딩 로직 안태움.
////					var _nextTvBestList = function() {
////
////						if (tvBestLoadingZoneIsMoreData && !tvbestAjaxLoading) {
////							tvbestAjaxLoading = true;
////							tvBestLoadingZoneCurrentPage++;
////
////							$('#tvBestLoadingZone').show();
////
////							var _deferred = $.get('/category/display/planshop/goods', {
////								plan_code : "2016016298",
////								plan_goods_gb : "0",
////								currentPage : tvBestLoadingZoneCurrentPage,
////								rowsPerPage : 20,
////								target : "tvbest"
////							});
////
////							_deferred.done(function(data) {
////								if (data.goodsList != null && data.goodsList.length > 0) {
////									tvBestLoadingZoneIsMoreData = (data.goodsList[0].totalCount / 20 > tvBestLoadingZoneCurrentPage) ? true : false;
////
////									$.each(data.goodsList, function(i, val) {
////										val.js_v_context_path = js_v_context_path;
////										val.js_v_static_Gimg_path = js_v_static_Gimg_path;
////										val.js_v_static_Gimg_error = js_v_static_Gimg_error;
////										val.js_v_static_img_path = js_v_static_img_path;
////
////										val.categoryCode = tvBestCategoryCode;
////										val.areaCode = tvBestAreaCode;
////
////										if (tvBestCategoryCode != '' && tvBestAreaCode != '') {
////											val.trackingUrl = "?trackingarea=" + tvBestCategoryCode + "^" + tvBestAreaCode;
////										} else {
////											val.trackingUrl = '';
////										}
////
////										// 이미지 URL 변경
////										val.goodsImageUrl = js_v_static_Gimg_path + val.imageUrl + val.imageH;
////										if (val.adultYn == "1") {
////											val.goodsImageUrl = js_v_static_Gimg_path + "/goods/adult/adultGoods_h.jpg";
////										} else if (val.imageWide != null && val.imageWide != "") {
////											val.goodsImageUrl = js_v_static_Gimg_path + val.imageUrl + val.imageWide;
////										}
////
////										// 주문수량 표시
////										val.recommendYn = 'N';
////										if (Number(val.orderQty) < 100) {
////											val.recommendYn = 'Y';
////										}
////
////										// 모바일가 계산
////										var couponPrice = 0;
////
////										val.coupon10Yn = "Y";
////										val.couponFlag = "Y";
////										val.dcRate = 0;
////
////										val.tvCouponPrice = val.bestPrice;
////
////										if (val.tvCouponPrice > 0 && val.couponDcAmt > 0) {
////											if (val.couponDcAmt == 50000 && val.couponDcRate < 10) {
////												val.coupon10Yn = "N";
////											}
////										} else {
////											val.coupon10Yn = "N";
////											val.couponFlag = "N";
////										}
////
////										// 할인율 계산
////										if (val.coupon10Yn == "Y") {
////											var tempPrice = val.orgPrice;
////
////											if (val.prevSalePrice > 0) {
////												tempPrice = val.prevSalePrice;
////											}
////
////											val.dcRate = Math.round((val.goodsPromo + val.couponDcAmt + val.cardAmt + val.prevPromo + val.saveamt) / tempPrice * 100);
////										}
////
////										val.orgPrice = $.number(Number(val.orgPrice));
////										val.bestPrice = $.number(Number(val.bestPrice));
////										val.prevSalePrice = $.number(Number(val.prevSalePrice));
////										val.tvCouponPrice = $.number(Number(val.tvCouponPrice));
////										val.finalDcAmt = $.number(Number(val.finalDcAmt));
////										val.orderQty = $.number(Number(val.orderQty));
////
////										$('#' + tvbestId).append(tvBestTemplate(val));
////									});
////								} else {
////									tvBestLoadingZoneIsMoreData = false;
////								}
////
////								tvbestAjaxLoading = false;
////								$('#tvBestLoadingZone').hide();
////								_initSlide();
////							});
////							_deferred.fail(function() {
////								tvbestAjaxLoading = false;
////								$('#tvBestLoadingZone').hide();
////								_Util.Ui.showAlertMsg(1);
////							});
////						}
////					}
//
//					_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN] = function(_deferreds) {
//
//
//// **** video player는 퍼블에서 처리 안함 !!!!
////						// TV베스트 메뉴 클릭 이벤트 위임
////						$(".swipe-tvbest").on("click", ".vodMenu li", function(e) {
////							if (!$(this).hasClass('on')) {
////								var market = $(".vodMenu li");
////								market.removeClass('on');
////								$(this).addClass('on');
////
////								if (AppFlag) {
////									window.location = "apps://killVideo";
////								}
////
////								var vodBestCategoryCode = $(this).parent().attr('category_code');
////								var vodBestAreaCode = $(this).parent().attr('area_code');
////								var lgroup = $(this).attr('lgroup');
////								var cateName = $(this).text();
////
////								$('.tabCnt.on').hide();
////								$('.tabCnt.on').html('');
////								$('#vodBestLoading').show();
////
////								var _deferred = $.get('/category/vodcatebest', {
////									lgroup : lgroup,
////									categoryCode : vodBestCategoryCode,
////									areaCode : vodBestAreaCode
////								});
////
////								_deferred.done(function(data) {
////									$('.tabCnt.on').append(data);
////									$('#vodBestLoading').hide();
////									$('.tabCnt.on').show();
////									$("span#menuName").text(cateName);
////									_initSlide();
////								});
////								_deferred.fail(function() {
////									_Util.Ui.showAlertMsg(1);
////								});
////							}
////						});
////
////						$(document).on('click', '.vodRel', function(e) {
////							var playParams = {
////								"src" : $(this).attr('src'),
////								"img" : "",
////								"mode" : "onlyFull",
////								"islive" : "false",
////								"target" : "",
////								"player" : "",
////								"type" : "01"
////							};
////
////							modulePlayer.newPlayVideo(playParams);
////						});
////
////						function setPlayTime(id, val) {
////							$('#' + id).attr('playtime', val);
////						}
////
////						// TV BEST 동영상 소리 설정
////						$(".swipe-tvbest").on("click", ".volum", function() {
////							if ($(this).hasClass("volum_on") == true) {
////								$(this).removeClass("volum_on");
////								$(this).addClass("volum_off");
////							} else {
////								$(this).removeClass("volum_off");
////								$(this).addClass("volum_on");
////							}
////						});
////
////						// 생방송 보기 재생 이력 저장 (2015.08.20)
////						var _videoplay = function() {
////
////							var goodsCode = $('#onAirGoods').attr('goodsCode');
////							var SeqFrameNo = $('#onAirGoods').attr('seqFrameNo');
////							var seqNo = $('#onAirGoods').attr('seqNo');
////
////							var ajaxUrl = "/goods/videoplay/?goods_code=" + goodsCode + "&seq_frame_no=" + SeqFrameNo + "&seq_no=" + seqNo + "&live_vod_gb=L";
////
////							var _deferred = $.getJSON(js_v_static_path + ajaxUrl);
////
////							_deferred.fail(function() {
////								alert("일시적인 장애가 발생했습니다. 잠시후에 다시 요청 하시기 바랍니다.");
////							});
////						}
//
////						$(document).on('click', '.tv_view_go', function(e) {
////							var num = 0;
////							//플레이어실행으로 변경
////
////							// VOD 매장 메인 상품 플레이어
////							if ($(this).hasClass('vod_shop') && (!AppFlag || moduleCommon.appVersionCheck("android", "2.1.0") || moduleCommon.appVersionCheck("ios", "2.1.0"))) {
////								num = $(".tv_view_go.vod_shop").index($(this));
////
////								_PageUtil.goPageLog('page=tvBest&area=tvBest_Video&action=playVideo&goods=' + $('div.today_tv_v2').eq(num).attr('goodsCode'), '');
////
////								var playParams = {
////									"src" : $('div.today_tv_v2').eq(num).attr('src'),
////									"img" : "",
////									"mode" : "onlyFull",
////									"islive" : "false",
////									"target" : $('div.today_tv_v2').eq(num).children('a.tv_view_go.vod_shop'),
////									"player" : "",
////									"type" : "01"
////								};
////
////								modulePlayer.newPlayVideo(playParams);
////							}
////							// 생방송 플레이어
////							else {
////								var liveYn = jQuery('.tvlive_count').length > 0 ? "true" : "false";
////					            var src = "/live/mp4:a.stream/playlist.m3u8";
////
////					            //log용 ajax
////								goPageLog('page=home&area=home_liveGoods&action=playVideo&goods=' + jQuery('#tvGoods').attr('goodscode'), '');
////
////								if (_tapMainInitObj._isCuration()) {
////									jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1043697' });
////								}else{
////									jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1067615' });
////								}
////
////								if(liveYn == "true"){
////									_videoplay();
////								}
////								else if(jQuery(this).attr('vodUrl') != ""){
////									src = jQuery(this).attr('vodUrl');
////								}
////
////								if (AppFlag && ((AndroidAgent && AppVersionAndroid < 200) || (iOsAgent && Number(AppVersioniOS.replace(/\D/gi, '')) < 200))) {
////									if (iOsAgent) {
////										var linkUrl = js_v_static_path + "/goods/view/" + $('#tvGoods').attr('goodscode');
////										var callUrl = "movieplay://url=" + src + "&goods=" + linkUrl + "&cs=080-840-1111&ars=080-844-1111";
////										location.href = callUrl;
////									} else {
////										var linkUrl = js_v_static_path + "/goods/view/" + $('#tvGoods').attr('goodsCode');
////										var cscall = "javascript:csCall()";
////										var ars = "javascript:arsCall()";
////										var orderCall = "javascript:directOrder()";
////										if (AppVersionAndroid >= 132) {
////											window.vod.callAndroid2(src, linkUrl, cscall, ars, orderCall);
////										} else {
////											window.vod.callAndroid(src, linkUrl, cscall, ars);
////										}
////									}
////								} else {
////									var videoPlay = $('.qplayer_wrapper.main');
////
////									if (videoPlay.length > 0) {
////										if (!AppFlag || moduleCommon.appVersionCheck("android", "2.1.0") || moduleCommon.appVersionCheck("ios", "2.1.0")) {
////											var playParams = {
////												"src" : src,
////												"img" : "",
////												"mode" : "",
////												"islive" : "true",
////												"target" : "",
////												"player" : videoPlay,
////												"type" : "02"
////											};
////
////											modulePlayer.newPlayVideo(playParams);
////										} else {
////											var playParams = {
////												"src" : "http://livevod.hnsmall.com:1935" + src,
////												"live" : "true",
////												"callback" : {
////													"hBuy" : "javascript:directOrder()",
////													"linkUrl" : "javascript:linkUrl(" + $('#tvGoods').attr('goodscode') + ")",
////													"product" : "",
////													"facebook" : "javascript:facebook()",
////													"kakaoTalk" : "javascript:kakaoTalk()",
////													"kakaoStory" : "javascript:kakaoStory()",
////													"line" : "javascript:line()",
////													"sms" : "javascript:sms()",
////													"androidVersion" : AppVersionAndroid,
////													"iosVersion" : Number(AppVersioniOS.replace(/\D/gi, ''))
////												}
////											}
////											modulePlayer.playVideo(playParams, videoPlay, "02");
////										}
////									}
////								}
////							}
////						});
//					}
//
//					_mainAccessAreaInfos[_cbFnKeys.LOAD_CB_FN] = function(_deferreds) {
//
//						// TV Best Ajax Callback_1 ( ** html Tag Bind )
//						var _tvBestSuccess = function(data) {
//							var $imgLazele,
//								data_original_val,
//								$ele = $('.mainNav.swipe-tvbest.mcv');
//							$ele.append(data).promise().done(function() {
//								$imgLazele = $ele.find('img.lazy');
//								_LazyLoadUtil.initLoadImgPolicy($imgLazele, 9, true);
//							});
//						}
//						// TV Best Ajax Callback_2 ( ** html Tag Bind )
//						var _tvBestSuccess2 = function(data) {
//							var $imgLazele,
//								data_original_val,
//								$ele = $('.mainNav.swipe-tvbest.mcv');
//							$ele.append(data);
//						}
//						// TV Best Ajax Callback_3 ( ** html Tag Bind )
//						var _tvBestSuccess3 = function(data) {
//							var $imgLazele,
//								data_original_val,
//								$ele = $('.mainNav.swipe-tvbest.mcv');
//							$ele.append(data).promise().done(function() {
//								$imgLazele = $ele.find('img.lazy');
//								_LazyLoadUtil.initLoadImgPolicy($imgLazele, 1, true);
//							});
//						}
//
//						// 비동기 이후 작업 작업순서를 보장해야 한다면 아래와 같이 작성
//						return $.when.apply($, _deferreds).done(function(result1, result2, result3) {
//							_tvBestSuccess(result1[0]);
//							_tvBestSuccess2(result2[0]);
//							_tvBestSuccess3(result3[0]);
//							_mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN]();
//						}).fail(function(v1) {
//							_Util.Ui.showAlertMsg(1);
//						});
//					}
//
//					_mainAccessAreaInfos[_cbFnKeys.SCOLL_CB_FN] = _nextTvBestList;
//
//					_mainAccessAreaInfos[_cbFnKeys.INIT_CB_FN] = function() {
//						_initTvbest();
//						_mainUi.common.initBottonFloting();
//					}
//
//					_mainAccessAreaInfos[_cbFnKeys.DESTORY_CB_FN] = null;
//
//					return _mainAccessAreaInfos;
//				}
			}
        },
        // *** 좋은밥상
        //2019-01-15 좋은밥상 매장 추가 시작
		food : {
			_mainAccessAreaInfos : {},
			init : function() {
				var _genKey = _tapMainInitObj._accessStructureKeys.GEN,
					_ajaxAreaKeys = _tapMainInitObj._ajaxAreaKeys,
					_cbFnKeys = _tapMainInitObj._cbFnKeys,
					_foodSwiper = _mainUi.food,
					_mainAccessAreaInfos = _tapMainInitObj.food._mainAccessAreaInfos;
					_mainAccessAreaInfos[_ajaxAreaKeys.GEN] = _tapMainInitObj._setArrayToAccessStructure(_genKey, [ '8005077', '8005078' ]);
				
					var foodId,
                    foodCategoryCode,
                    foodAreaCode,
                    foodAjaxLoading = false;

				// 좋은밥상 초기실행
				var _initFood = function() {
                    foodId = $('.mainNav.swipe-food.mcv section[class=loadingZone]').attr('target');
                    foodCategoryCode = '60000020';
                    foodAreaCode = '8005078';
	            }

				var _imgLazyGoods = function(){
                    var $imgLazele = $('#food_goods_list').find('img.lazy');
                    _LazyLoadUtil.initLoadImgPolicy($imgLazele, 10, true);
                }

				var _foodSuccessTop = function(data){
					var $imgLazele,
	                    $ele = $('.mainNav.swipe-food.mcv .foodTabCount');
	                $ele.append(data).promise().done(function() {
	                    $imgLazele = $ele.find('img.lazy');
	                    _LazyLoadUtil.initLoadImgPolicy($imgLazele, 20, true);
	                });
                }

				var _foodSuccessBottom = function(data){
					var $imgLazele,
	                    $ele = $('.mainNav.swipe-food.mcv .foodTabCount');
	                $ele.append(data).promise().done(function() {
	                    $imgLazele = $('#food_goods_list').find('img.lazy');
	                    _LazyLoadUtil.initLoadImgPolicy($imgLazele, 10, true);
	                });
                }

				// 카테고리 이동 및 더보기
				var _nextFood = function(type) {

					_initFood();

                    var loadingZone = $('.mainNav.swipe-food.mcv section[class=loadingZone]');

                    var currentPage;
                    var isMoreData = (loadingZone.attr('ismoredata') == "true");

                    if(type == 'move'){
                    	// 카테고리 이동 = 1페이지
                    	currentPage = 1;
                    }else{
                    	// 더보기
                    	currentPage = Number(loadingZone.attr('currentpage')) + 1;
                    }
//                    if (isMoreData && !foodAjaxLoading) {
//                    	foodAjaxLoading = true;
//                        var bannerCode = $('.mainNav.swipe-food.mcv .foodTabCount .food_fixed li.on').attr('bannerCode');
//                        $('#foodLoadingZone').show();
//
//                        var _deferred = $.get('/category/nextFood', {
//                            categoryCode : foodCategoryCode,
//                            areaCode : foodAreaCode,
//                            bannerCode : bannerCode,
//                            currentPage : currentPage,
//                            rowsPerPage : 20
//                        });
//
//                     // Ajax 실행 후 처리
//	                    _deferred.done(function(data) {
//	                        if(data == null || data.replace(/(\s*)/g,"") ==""){
//	                        	if(currentPage == 1){
//	                        		// 등록된 상품이 없을경우
//	                        		if($('.mainNav.swipe-food.mcv .foodTabCount .list_none').length < 1) {
//	                        			$('#food_goods_list').html('<div class="list_none product_list"><em></em><p>조회 내역이 없습니다.</p></div>');
//	                        		}
//	                        	}
//	                            $('.mainNav.swipe-food.mcv section[class=loadingZone]').attr('ismoredata', false);
//	                        }else{
//	                        	if($('.mainNav.swipe-food.mcv .foodTabCount .list_none').length > 0) {
//                                    $('#food_goods_list').html('');
//                                }
//
//	                            $('#food_goods_list').append(data);
//	                            // 상품리스트 레이지로드 재적용
//		                        _imgLazyGoods();
//	                            _initSlide();
//	                        }
//
//	                        loadingZone.attr('currentPage', currentPage);
//	                        foodAjaxLoading = false;
//	                        $('#foodLoadingZone').hide();
//	                    }).fail(function() {
//	                        _Util.Ui.showAlertMsg(1);
//	                        foodAjaxLoading = false;
//	                        $('#foodLoadingZone').hide();
//	                    });
//
//                        return _deferred;
//                    }
				}

                // 좋은밥상 이벤트 바인드 로드 콜백 Func.
                _mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN] = function(_deferreds) {

                	// 전체보기
//                	$(document).on('click', '#foodAllView', function(e) {
//                        _PageUtil.goPage('/category/display/halfAllPop/60000020/8005077?trackingarea=60000016^8000621^1110098');
//                    });

                }

				// 좋은밥상 초기 로드 콜백 Func.
				_mainAccessAreaInfos[_cbFnKeys.LOAD_CB_FN] = function(_deferreds) {

					// 비동기 이후 작업
					return $.when.apply($, _deferreds).done(function(result1, result2) {
                        _foodSuccessTop(result1[0]);
                        _foodSuccessBottom(result2[0]);
                        _initFood();
                        _mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN]();
                    }).fail(function() {});

				}

				// 좋은밥상 스크롤 콜백
				_mainAccessAreaInfos[_cbFnKeys.SCOLL_CB_FN] = function() {
                    _nextFood('scroll');
                }

				// 좋은밥상 로드 후 세팅 시작
                _mainAccessAreaInfos[_cbFnKeys.INIT_CB_FN] = function() {

                	/* 2019-02-08 좋은밥상 수정(시작) */
                	if(!_foodSwiper.swiperObj){
                		_foodSwiper.swiper().init();
                	}
                	/* 2019-02-08 좋은밥상 수정(끝) */

                	//스티키 메뉴 세팅 시작
                	function foodFixedSet(){
						var theLength= $('.cont_sw > .food_fixed').length;

						if(theLength<=0){
							$(".foodTabCount .food_fixed").clone().appendTo(".cont_sw");
						}
						$(".foodTabCount .food_fixed, .cont_sw > .food_fixed, .foodTabCount .goodsHalf_wrap").removeClass("over");
					}
                	foodFixedSet();
                	//스티키 메뉴 세팅 끝

                	//클릭이벤트 들
                	$(document).on('click', '.food_fixed a', function(e) {//메뉴 on클래스 넣기
                		if(foodAjaxLoading == true) return;

                		var thisNum=$(this).parents(".food_fixed > ul > li").index();
                		var foodFixed=$(".food_fixed");

                		// 카테고리별 트레킹 S
                        var  bannerCode = $(this).attr('planGoodsGb');
//                        switch (bannerCode) {
//                          case '1109678' : jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1110099' }); break;
//                          case '1109681' : jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1110100' }); break;
//                          case '1109683' : jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1110101' }); break;
//                          case '1109684' : jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1110102' }); break;
//                          case '1109685' : jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1110103' }); break;
//                          case '1109687' : jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1110104' }); break;
//                          case '1109688' : jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1110105' }); break;
//                          case '1109689' : jQuery.ajax({ url: '/sample/tracking?trackingarea=60000016^8000621^1110106' }); break;
//                        }
                        // 카테고리별 트레킹 E

//                        $('#food_goods_list').html('');
                        $('.mainNav.swipe-food.mcv section[class=loadingZone]').attr('currentpage', 0);
                        $('.mainNav.swipe-food.mcv section[class=loadingZone]').attr('ismoredata',  true);

                        for(var i=0; i<=foodFixed.length; i++){
                			$(".food_fixed:eq("+i+") > ul > li").removeClass("on");
                			$(".food_fixed:eq("+i+") > ul > li").eq(thisNum).addClass("on");
                		}

                        // 카테고리 변경
                        _nextFood('move');

                		return false;
                	});

                	$(document).on('click', '.cont_sw > .food_fixed a', function(e) {//메뉴 눌렀을때 상단으로 스크롤 이동
                		var appCheck=$(".app_setup").length;
                		var cateFoodTop;

                		if(appCheck>0){//web인경우
                			cateFoodTop=$(".wrapAllHeader").height()+$(".foodTabCount .swiper_st").height()-42;
                    	}else{//앱인경우
                    		cateFoodTop=$(".foodTabCount .swiper_st").height();
                    	}

                		$('html, body').scrollTop(cateFoodTop);
                		return false;
                	});

                	//필수추가
                	_mainUi.common.initBottonFloting();
                }//좋은밥상 로드 후 세팅 끝

                //좋은밥상 스크롤 이벤트 시작
                $(window).on('scroll', function(){//좋은밥상 스크롤 이벤트
                //_mainAccessAreaInfos[_cbFnKeys.SCOLL_CB_FN] = function() {//스크롤 콜백 사용시 느려서 동작 에러남
                	var appCheck=$(".app_setup").length;
                	var fixedNum;
                	var foodScrollTop=$(window).scrollTop();

                	if(appCheck>0){//web인경우
                		fixedNum=$(".wrapAllHeader").height()+$(".foodTabCount .swiper_st").height()-42;
                	}else{//앱인경우
                		fixedNum=$(".foodTabCount .swiper_st").height();
                	}

                	if(foodScrollTop>=fixedNum){//메뉴보다 더 스크롤 했을때
                		$(".foodTabCount .food_fixed, .cont_sw > .food_fixed, .foodTabCount .goodsHalf_wrap").addClass("over");
            		}else{//메뉴보다 덜 스크롤 했을때
            			$(".foodTabCount .food_fixed, .cont_sw > .food_fixed, .foodTabCount .goodsHalf_wrap").removeClass("over");
            		}

                //}
                });//좋은밥상 스크롤 이벤트 끝

                //좋은밥상 나갔을때 이벤트 시작
                _mainAccessAreaInfos[_cbFnKeys.DESTORY_CB_FN] = function() {
                	if(_foodSwiper.swiperObj){//2019-01-29 좋은밥상 수정
                		_foodSwiper.swiperObj.destroy(true, true);
                		_foodSwiper.swiperObj = null;
                	}//2019-01-29 좋은밥상 수정
                	$('.cont_sw > .food_fixed').remove();//스티키메뉴 삭제
                };//좋은밥상 나갔을때 이벤트 끝

				return _mainAccessAreaInfos;
			}
		},
        //2019-01-15 좋은밥상 매장 추가 끝
        
        // *** TV스케줄
		// 2019-03-18 TV편성표 개선
		tvschedule : {//2019-04-10 편성표 키값 수정
			_mainAccessAreaInfos : {},
			init : function() {
				var _genKey = _tapMainInitObj._accessStructureKeys.GEN,
					_ajaxAreaKeys = _tapMainInitObj._ajaxAreaKeys,
					_cbFnKeys = _tapMainInitObj._cbFnKeys,
					_mainAccessAreaInfos = _tapMainInitObj.tvschedule._mainAccessAreaInfos;//2019-04-10 편성표 키값 수정
                    _mainAccessAreaInfos[_ajaxAreaKeys.GEN] = _tapMainInitObj._setArrayToAccessStructure(_genKey, [ '8005016' ]);
                
                var schedule = _mainUi.tvschedule.schedule();//2019-04-10 편성표 키값 수정


                _mainAccessAreaInfos[_cbFnKeys.INIT_CB_FN] = function() {	
                    $('#footer').css('display', 'none');
                    var reInit = function() {
                    	$('.mainContent').css({
                            'min-height': 'auto',
                            'overflow': 'hidden',
                            'height': window.innerHeight,
                            'box-sizing': 'border-box'
                        });
                    	schedule._reInit();
                	};
                    window.onresize = reInit;
                }
				
                _mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN] = function(_deferreds) {
                    // 테스트용 리스트 뿌리기 추후 삭제 S
                    (function(channel){
                        var list_1 = [];
                        var list_2 = [];
                        var list0Temp = $('.js-scheduleList_case1').html()
                        , list1_1Temp = $('.js-scheduleList_case2').html()
                        , list1_2Temp = $('.js-scheduleList_case3').html()
                        , list2Temp = $('.js-schedulePreview_case1').html()
                        , list2_1Temp = $('.js-schedulePreview_case2').html();
                        for (var i = 0; i < schedule.setChannelDay(channel).length; i++) {
                        	var last = (i==schedule.setChannelDay(channel).length -1) ?true:false;
                            list_1.push('<li data-item="'+schedule.setChannelDay(channel)[i]+'"><div class="vodDate"><span>03.'+schedule.setChannelDay(channel)[i]+' 수</span></div><div class="vodTime">16:00~16:50<em class="em">지금 방송 중!</em></div>'+list0Temp+'</li>');
                            list_1.push('<li data-item="'+schedule.setChannelDay(channel)[i]+'"><div class="vodTime">16:00~16:50</div>'+list1_1Temp+'</li>');
                            list_1.push('<li data-item="'+schedule.setChannelDay(channel)[i]+'"><div class="vodTime">16:00~16:50</div>'+list1_2Temp+'</li>');
                            list_2.push('<li data-item="'+schedule.setChannelDay(channel)[i]+'" class="swiper-slide"><div class="vodDate"><span>03.'+schedule.setChannelDay(channel)[i]+' 수</span></div>'+list2Temp+'</li>');
                            list_2.push('<li data-item="'+schedule.setChannelDay(channel)[i]+'" class="swiper-slide">'+list2_1Temp+'</li>');
                            list_2.push('<li data-item="'+schedule.setChannelDay(channel)[i]+'" class="swiper-slide">'+list2_1Temp+'</li>');
                        }
                        $('.scheduleList').html(list_1);
                        $('.schedulePreview').html(list_2);
                    })(schedule.channel); // true 원채널, false 투채널
                    // 테스트용 리스트 뿌리기 추후 삭제 E

                    var setTime = setTimeout(function(){
                        if(_mainUi.tvschedule) schedule._init();//2019-04-10 편성표 키값 수정
                    }, 1000);
                }

                _mainAccessAreaInfos[_cbFnKeys.DESTORY_CB_FN] = function() {
                    $('#footer').removeAttr('style');
                    $('.mainContent').removeAttr('style');
                };

				_mainAccessAreaInfos[_cbFnKeys.LOAD_CB_FN] = function(_deferreds) {
					var _tvScheduleSuccess = function(data) {
                        var $imgLazele,
                            data_original_val,
                            $ele = $(".mainNav.swipe-tvschedule.mcv");//2019-04-10 편성표 키값 수정
                        $ele.append(data).promise().done(function() {
                            $imgLazele = $ele.find('img');
                            _LazyLoadUtil.initLoadImgPolicy($imgLazele, $imgLazele.length, true);
                        });
                        console.log('---')
					}
					// 비동기 이후 작업
					return $.when.apply($, _deferreds).done(function(result1) {
                        _tvScheduleSuccess(result1);
                        _mainAccessAreaInfos[_cbFnKeys.EVENT_BIND_CB_FN]();
                    }).fail(function() {});
				}

				return _mainAccessAreaInfos;
			}
		},
	}
////////////////////// 메인 영역별로 Data 및 Event Binding : e

	// 메인 영역별 Url을 만든다.
	var _setMakeAccessUrl = function(mainAccessAreaInfos) {

		var _genUrl = "/genhtml/60000020/",
			_getUrlPrefix = 'html',
			_areaUrl = "/gen/areaView?category_code=60000020&area_code=",
			_ajaxAreaKeys = _mainKeys.ajaxAreaKeys,
			_accessStructureKeys = _mainKeys.accessStructureKeys;

		// 요청 Url별 분기 ( GEN:Static File or 동적GEN:서버요청 )
		var _makeUrlAppender = function(ajaxAreaObjKeys, ajaxAreaObjs) {

			var _codeObjVal = '',
				_url,
				_htmlExtension = '.';
			$.each(ajaxAreaObjs, function(index, accessStructureObjArray) {
				switch (ajaxAreaObjKeys) {
				case _ajaxAreaKeys.GEN:
					_codeObjVal = accessStructureObjArray[_accessStructureKeys.GEN];
					_codeObjVal = _genUrl + _codeObjVal;
					_codeObjVal += _codeObjVal.indexOf(_getUrlPrefix) > -1 ? _htmlExtension + _getUrlPrefix : '';
					accessStructureObjArray[_accessStructureKeys.GEN] = _codeObjVal;
					break;
				case _ajaxAreaKeys.AREA:
					_codeObjVal = accessStructureObjArray[_accessStructureKeys.AREA];
					_codeObjVal = _areaUrl + _codeObjVal;
					accessStructureObjArray[_accessStructureKeys.AREA] = _codeObjVal;
					break;
				case _ajaxAreaKeys.VM:
					break;
				default:
					break;
				}
			});
		}

		$.each(mainAccessAreaInfos, function(ajaxAreaObjKeys, ajaxAreaObjs) {
			if (ajaxAreaObjs && !$.isFunction(ajaxAreaObjs)) {
				_makeUrlAppender(ajaxAreaObjKeys, ajaxAreaObjs);
			}
		});

		return {
			mainAccessAreaInfos : mainAccessAreaInfos
		};
	}

	var _memoization = moduleCommon.memoization();

	// 메인별 화면 영역을 요청한다.
	var _requestMainAreas = function(tabMainObj, deferredCallBackFns) {

		var _accessStructureKeys = _mainKeys.accessStructureKeys,
			_accessUrl = '',
			deferreds = [];

		var _setAccessStructureDeferredFn = function(accessStructureObjDeferredProp, _deferredFns) {
			if (accessStructureObjDeferredProp) {
				if ($.isFunction(accessStructureObjDeferredProp)) {
					_deferredFns[0] = accessStructureObjDeferredProp;
				} else if ($.isArray(accessStructureObjDeferredProp)) {
					$.each(accessStructureObjDeferredProp, function(idx, fn) {
						if ($.isFunction(fn)) {
							_deferredFns.push(fn);
						}
					});
				}
			}
		}

		var deferredCallBackFnsIdx = 0;

// 향후 Gen Ajax 요청에 대해 fingerprint 추가 시 주석해제
//		$.ajaxSetup({cache : false});

		$.each(tabMainObj, function(ajaxAreaObjKeys, ajaxAreaObjs) { // area
			if (ajaxAreaObjs && !$.isFunction(ajaxAreaObjs)) {
				$.each(ajaxAreaObjs, function(accessStructureObjIndex, accessStructureObj) { // Structure
					var _deferredSuccessFns = [],
						_deferredFailFns = [],
						_deferred = null;

					_accessUrl = accessStructureObj[_mainKeys.accessStructureKeys.GEN] || accessStructureObj[_mainKeys.accessStructureKeys.AREA]
					|| accessStructureObj[_mainKeys.accessStructureKeys.VM];

					// callback Function이 있는경우.. ( 앱:메인홈 = 편성표[0] / 생방송[1] 2개 넘김 )
					if (deferredCallBackFns && deferredCallBackFns.length) {
						var accessStructureObjSuccessProp = accessStructureObj[_mainKeys.accessStructureKeys.CB_SUCCESS];

						// 성공 시 Callback ( _deferredSuccessFns 에 담음.. )
						if(deferredCallBackFns[deferredCallBackFnsIdx] && deferredCallBackFns[deferredCallBackFnsIdx][0]){
							accessStructureObjSuccessProp = deferredCallBackFns[deferredCallBackFnsIdx][0];
							_setAccessStructureDeferredFn(accessStructureObjSuccessProp, _deferredSuccessFns);
						}

						var accessStructureObjFailProp = accessStructureObj[_mainKeys.accessStructureKeys.CB_FAIL];

						// 실패 시 Callback
						if(deferredCallBackFns[deferredCallBackFnsIdx] && deferredCallBackFns[deferredCallBackFnsIdx][1]){
							accessStructureObjFailProp = deferredCallBackFns[deferredCallBackFnsIdx][1];
							_setAccessStructureDeferredFn(accessStructureObjFailProp, _deferredFailFns);
						}
					}

					if (_memoization.checkMemoization(_accessUrl)) {
						// TODO 만약 기존 디퍼드 객체가 필요 할경우.
						//_memoization.getMemoizationObj(_accessUrl, _deferred);
					} else {
						// Ajax 요청
						console.log("url::::::::::::::::" + _accessUrl);
						_deferred = $.get(_accessUrl).done(function(){
                            //_deferredSuccessFns

                        }).fail(_deferredFailFns);
						_memoization.applyMemoization(_accessUrl, _deferred);
						if( _deferredSuccessFns.length === 0 ){
							deferreds.push(_deferred);
						}
					}
					deferredCallBackFnsIdx++;
				});
			}
		});

// 향후 Gen Ajax 요청에 대해 fingerprint 추가 시 주석해제
//		$.ajaxSetup({cache : true});
		console.log("deferreds : " +deferreds );
		return deferreds;
	}

	exports.getMainInit = function(areaKey) {
		return _setMakeAccessUrl(_tapMainInitObj[areaKey]());
	}

	exports.getMainAjaxAreaKeys = function() {
		return {
			ajaxAreaKeys : _mainKeys.ajaxAreaKeys
		};
	}

	exports.getMainAreaKeys = function() {
		return {
			areaKeys : _mainKeys.areaKeys
		};
	}

	exports.getAccessStructureKeys = function() {
		return {
			accessStructureKeys : _mainKeys.accessStructureKeys
		};
	}

	var _currentLocationKey = null;

	var _setCurrentLocationKey = function(currentLocationKey) {
		_currentLocationKey = currentLocationKey;
	}

	exports.getCurrentLocationkey = function() {
		return _currentLocationKey;
	}

	var _currentLocationIdx = null;

	var _setCurrentLocationIdx = function(currentLocationIdx) {
		_currentLocationIdx = currentLocationIdx;
	}

	var _getCurrentLocationIdx = function(){
		return _currentLocationIdx;
	}

	exports.getCurrentLocationIdx = _getCurrentLocationIdx;

	exports.getMoveKey = function(idx) {
		return _mainKeys.areaKeys[idx];
	}

	var _scrollTimeout,
		_scrollCurrentObj,
		_scrollDeferred;

	exports.applyScrollEvent = function() {
		$(window).scroll(function() {
			var _scollCbFn = _scrollCurrentObj[_mainKeys.cbFnKeys.SCOLL_CB_FN];

			var _currentLocationIdx =  _getCurrentLocationIdx();

			if (_scollCbFn && $.isFunction(_scollCbFn)) {
				if (_getCurrentLocationIdx() === 0) {
					_scollCbFn();
				} else {
					if (_scrollTimeout) {
						clearTimeout(_scrollTimeout);
						_scrollTimeout = null;
					}

					var isAppendDataScrollPostion =  function(){

						var defualtScrollThreshold = 0.5;
						if(_currentLocationIdx === 6 || _currentLocationIdx === 7){
							defualtScrollThreshold = 0.7;
						}

						return (($(document).height() - ($(document).height() * defualtScrollThreshold) ) < ($(window).scrollTop() + $(window).height()));
					}

					_scrollTimeout = setTimeout(function() {
						if ( isAppendDataScrollPostion() ) {
							_scollCbFn();
							if (_currentLocationIdx === 5) {
								_scrollCurrentObj[_mainKeys.cbFnKeys.SCOLL_CB_FN] = null;
							}
						}
					}, 45);
				}
			}
		});

	}

	// 앱 영역을 생성한다.
	exports.getMainAreaTamplate = function(deferredCallBackFns) {

		var _mainTabObj = null;

		$.each(_mainKeys.areaKeys, function(index, value) {
			if (document.URL.indexOf(value) > -1) {
				_setCurrentLocationKey(value);
				_setCurrentLocationIdx(index);
				_mainTabObj = _setMakeAccessUrl(_tapMainInitObj[value].init()).mainAccessAreaInfos;
				return false;
			}
		});

		_scrollCurrentObj = _mainTabObj;

		// 영역코드별 ajax 요청
		var deferred = _requestMainAreas(_mainTabObj, deferredCallBackFns);

		var loadCbFnDeferred = null,
		loadCbFnDeferred = _mainTabObj[_mainKeys.cbFnKeys.LOAD_CB_FN](deferred);

		var initCbFnDeferred = $.when(loadCbFnDeferred).done(function() {
			var _indexObjInitCbFn = _mainTabObj[_mainKeys.cbFnKeys.INIT_CB_FN];
			if (_indexObjInitCbFn && $.isFunction(_indexObjInitCbFn)) {
				_indexObjInitCbFn();
			}
		});

		return initCbFnDeferred;
	}

	// 초기 메인 화면 영역을 생성한다.
	// TODO 보이지 않는 부분을 가져올 필요가 없음
	exports.getMainAreaTamplates = function(deferredCallBackFns) {

		var _indexObj,
			_prevObj,
			_prevObjKey,
			_nextObj,
			_nextObjKey,
			_currentLocationKey,
			_currentLocationIdx,
			_mergeObj,
			deferreds = [];

		var url = document.URL;

		if (url.indexOf('main') > -1) {

			var _lastIdx = (_mainKeys.areaKeys.length - 1);

			_prevObjKey = _mainKeys.areaKeys[_lastIdx];
			_currentLocationKey = _mainKeys.areaKeys[0];
			_currentLocationIdx = 0;
			_nextObjKey = _mainKeys.areaKeys[1];

			$.each(_mainKeys.areaKeys, function(index, currentLocationKey) {

				if (document.URL.indexOf(currentLocationKey) > -1) {

					_currentLocationKey = currentLocationKey;
					_currentLocationIdx = index;

					if (index === 0) {
						_prevObjKey = _mainKeys.areaKeys[_lastIdx]
						_nextObjKey = _mainKeys.areaKeys[index + 1];

					} else if (index === _lastIdx) {
						_prevObjKey = _mainKeys.areaKeys[index - 1];
						_nextObjKey = _mainKeys.areaKeys[0];
					} else {
						_prevObjKey = _mainKeys.areaKeys[index - 1];
						_nextObjKey = _mainKeys.areaKeys[index + 1];
					}
					return false;
				}
			});

			_setCurrentLocationKey(_currentLocationKey);
			_setCurrentLocationIdx(_currentLocationIdx);

			_indexObj = _setMakeAccessUrl($.extend({}, _tapMainInitObj[_currentLocationKey].init())).mainAccessAreaInfos;
			_scrollCurrentObj = _indexObj;
			_prevObj = _setMakeAccessUrl($.extend({}, _tapMainInitObj[_prevObjKey].init())).mainAccessAreaInfos;
			_nextObj = _setMakeAccessUrl($.extend({}, _tapMainInitObj[_nextObjKey].init())).mainAccessAreaInfos;

			_mergeObj = $.extend({}, [_prevObj, _nextObj ]);
		}

		var _exceptIndexObjDestoryCbFn = function(){
			var arr = $.map(_mainKeys.areaKeys,function(idx,value){
						return _currentLocationKey != idx ? idx : null;
					});

			var _exceptObjDestoryCbFn;
			var _exceptObj;
			for(i=0;i<arr.length;i++){
				_exceptObj = _tapMainInitObj[arr[i]]._mainAccessAreaInfos;

				_exceptObjDestoryCbFn = _exceptObj ? _exceptObj[_mainKeys.cbFnKeys.DESTORY_CB_FN] : null;
				if (_exceptObjDestoryCbFn && $.isFunction(_exceptObjDestoryCbFn)) {
					_exceptObjDestoryCbFn();
				}
			}
		};

		var indexDeferred = _requestMainAreas(_indexObj, null);
		var loadCbFnDeferred = indexDeferred.length ? _indexObj[_mainKeys.cbFnKeys.LOAD_CB_FN](indexDeferred) : null;

		var initCbFnDeferred = $.when(loadCbFnDeferred).done(function() {
			$.each(_mergeObj, function(key, obj) {
				var deferred = _requestMainAreas(obj, null);
				if(deferred.length){
					obj[_mainKeys.cbFnKeys.LOAD_CB_FN](deferred);
				}
			});
			_exceptIndexObjDestoryCbFn();
			var _indexObjInitCbFn = _indexObj[_mainKeys.cbFnKeys.INIT_CB_FN];
			if (_indexObjInitCbFn && $.isFunction(_indexObjInitCbFn)) {
				_indexObjInitCbFn();
			}
		});

		return initCbFnDeferred;
	}





	// 미리 보기 영역을 생성한다.
	exports.getMainPreviewAreaTamplate = function(previewIdx, invisibleIdx, currentIdx) {

		var _previewObj,
			_previewKey,
			_invisibleKey,
			_invisibleObj,
			_invisibleObjDestoryCbFn,
			_currentObj,
			_currentKey,
			_currentObjInitCbFn;

		_invisibleKey = _mainKeys.areaKeys[invisibleIdx];
		_invisibleObj = _tapMainInitObj[_invisibleKey]._mainAccessAreaInfos
		_invisibleObjDestoryCbFn = _invisibleObj[_mainKeys.cbFnKeys.DESTORY_CB_FN];
		if (_invisibleObjDestoryCbFn && $.isFunction(_invisibleObjDestoryCbFn)) {
			_invisibleObjDestoryCbFn();
		}

		_currentKey = _mainKeys.areaKeys[currentIdx];
		_setCurrentLocationKey(_currentKey);
		_setCurrentLocationIdx(currentIdx);
		_currentObj = _tapMainInitObj[_currentKey]._mainAccessAreaInfos;

		_scrollCurrentObj = _currentObj;
		_currentObjInitCbFn = _currentObj[_mainKeys.cbFnKeys.INIT_CB_FN];
		if (_currentObjInitCbFn && $.isFunction(_currentObjInitCbFn)) {
			_currentObjInitCbFn();
		}

		_previewKey = _mainKeys.areaKeys[previewIdx];
		_previewObj = _setMakeAccessUrl(_tapMainInitObj[_previewKey].init()).mainAccessAreaInfos;

		var deferred = _requestMainAreas(_previewObj, null);
		if (deferred.length) {
			_previewObj[_mainKeys.cbFnKeys.LOAD_CB_FN](deferred);
		}
	}

	// 메인 상단 UI

	var bottomFloating;

	var _mainUi = {
		common : {
			initBottonFloting : function() {
				$(window).scroll(function() {
					if (bottomFloating) {
						clearTimeout(bottomFloating);
					}

					$("footer.footer .btn_fontsize, footer.footer .btn_top_floating , .footer .btn_tv_search").hide();// 2018-07-06 gnb수정

					bottomFloating = setTimeout(function() {
						$("footer.footer .btn_fontsize").fadeIn("slow");
						if (parseInt($(window).scrollTop()) > 200) {
							$("footer.footer .btn_top_floating, .footer .btn_tv_search").fadeIn("slow");// 2018-07-06 gnb수정

							// 2018-07-06 gnb수정 시작
							var currentIdx =  _getCurrentLocationIdx();

							if(currentIdx==0){
								$(".footer .btn_tv_search").css("display","block");
							}else{
								$(".footer .btn_tv_search").css("display","none");
							}
							// 2018-07-06 gnb수정 끝
						}
					}, 1000);
				});
			},
            bottomBannerLoad: function() {return false;
                var url = "/genhtml/60000020/8005018.html";
                var x;
/*                if (js_v_bottom_bn_grp != undefined && js_v_bottom_bn_grp != "") {
                    url = "/main/bottom_banner"
                }
*/                $.get(url).done(function(data) {
                    if (data != null && data.replace(/(\s*)/g, "") != "") {
                        jQuery(".cont_sw").prepend(data);
                        if ($("#homeBn").length > 0) {
                            if (x) {
                                clearTimeout(x)
                            }
                            $("#homeBn").hide();
                            x = setTimeout(function() {
                                if (_Util.Cookie.getCookie("8005018") != "done") {
                                    $("#homeBn").fadeIn("slow")
                                }
                            }, 500)
                        }
                        var close = $("#homeBn .close_btn");
                        var img = $("#homeBn .bannerImg");	// 2017-12-11 수정
                        img.each(function(i) {
                            var $img = $(this);
                            if ($img.length === 1) {
                                if ($img[0].complete === false || $img.attr("src") !== "") {
									 console.log('배너 이미지가 완전히 로딩되지 않음');
                                	$img.load(function() {
										console.log('배너 이미지 로딩이 완료됨.');
                                        if (moduleCommon.appVersionCheck("android", "2.3.3")) {

                                            $(".homeBn").css({
                                                bottom: 51
                                            })
                                        } else {
                                            if (moduleCommon.appVersionCheck("ios", "2.2.7")) {
                                                $(".homeBn").css({
                                                    bottom: 46
                                                })
                                            }
                                        }

                                        var w = $("#homeBn").width()
                                          , h = $("#homeBn").height()
                                          , r = h / w;

                                        close.show(); // 2018-10-11 수정
                                    })
                                }
                            }
                        })
                    }
                }).fail(function() {
                    y.Ui.showAlertMsg(1)
                })
            }
		},
		tvplus : {
			// ***  tvplus swipe 영역 UI 변경 관련 적용 : 04.26
			swiper : function() {
				var _init = function(wrap) {
			    	/* 2018-11-21 다모아 2뎁스(삭제 시작)
			          var _wrapper = $(wrap);
						var _navWrap = $('.videoNavBox', _wrapper);
						var _navEle = $('li', _navWrap);
						var _slideWrap = $('.videoViewList', _wrapper);
						var _slideEle = $('li', _slideWrap);
						var _randomNum = Math.floor(Math.random() * 4);

						_slideEle.css({'width' : _wrapper.outerWidth()}).parent('ul').css({'width' : _wrapper.outerWidth()*6});

						//슬라이드 옵션추가(페이징,이전다음 버튼) 2017-03-17
						var tvplusSwipe = new Swiper(wrap + ' .videoViewList', {
							loop : true,
							speed:300,
							initialSlide: _randomNum,	//초기 슬라이드 인덱스번호
							nextButton: '.swiper-button-next',
							prevButton: '.swiper-button-prev',
							pagination: '.swiper-pagination',
							paginationType: 'fraction',
							onInit: function(swiper){
								if(_slideWrap.hasClass('type02')){
									$('li', _slideWrap).find('.videoUnitCard').css('display','block');
								}
							},
							onSlideChangeStart : function(swiper) {
								var _idx = 0;

								if(!$('.swiper-slide-active', _slideWrap).size()){
									if(swiper.touches.startX > swiper.touches.currentX){ // 이전 X좌표와 변경된 X좌표를 비교하여 이전 or 다음 선택
										_idx = 0;
				    	          	}else{
				    	          		_idx = 3;
				    	          	}
								}else{
									_idx = parseInt($('.swiper-slide-active', _slideWrap).attr('data-swiper-slide-index'));
								}
								_navEle.removeClass('on').eq(_idx).addClass('on');
							},
							onTouchMove : function(){
								if(typeof halfTouchUp == 'function' && AppFlag && AndroidAgent){
									window.halfTouchDown();
								}
							},
							onTouchEnd : function(){
								if(typeof halfTouchUp == 'function' && AppFlag && AndroidAgent){
									window.halfTouchUp();
								}
							},
							onTouchStart : function(){
								if(typeof halfTouchUp == 'function' && AppFlag && AndroidAgent){
									window.halfTouchDown();
								}
							}
						});
						$('a', _navEle).click(function() {
							var _this = $(this);
							var _idx = $('a', _navEle).index(this);

							if(!_this.parent().hasClass('on')) {
								$('a', _navEle).parent('li').removeClass('on');
								_this.parent('li').addClass('on');
								tvplusSwipe.slideTo(_idx+1);
							}
						});
						var resizeSwiper = null;


						$(window).on('resize', function(){
							clearTimeout(resizeSwiper);
							resizeSwiper = setTimeout(function() {sizeCh();}, 100);
					     });

						var sizeCh = function() {
							 _wrapper = $(wrap);
							_slideEle.css({'width' : _wrapper.outerWidth()}).parent('ul').css({'width' : _wrapper.outerWidth()*6});
							tvplusSwipe.update();
							var _onIdx = $(".videoNavBox ul li.on").index();
							tvplusSwipe.slideTo(_onIdx+1,0);
						}
						return {
							tvplusSwipe : tvplusSwipe
						}
						2018-11-21 다모아 2뎁스(삭제 끝) */
				}

				return {
					init : _init
				}
            }
            ,depthSlide : function(){
                // ** swiper 이슈
                // swiper api옵션 loop: false, slidesPerView: 'auto', centeredSlides: false 일때
                // swiper의 element의 너비값, 메뉴 너비값 비례하여 스와이프 끝에 도달했을시점부터 메뉴가 'swiper-slide-active' 클래스가 생성이 안됨
                // init, onSlideChangeEnd, onClick 시 활성화되는 메뉴는 'active' 클래스로 대체
                var tvDepthSlider = [];
                // 2019-01-09 - 다모아 수정개선 - slideConfig 내용 전부 수정
                var slideConfig = function( config ){
                    var options = {
                        slidesPerView: 'auto',
                        loop: config.loop,
                        observer: true,
                        observeParents: false,
                        longSwipes: true,
                        speed: 100,
                        spaceBetween: 20,
                        // 2019-01-15 onInit, onSlideChangeEnd, onSlideChangeStart 수정
                        onInit: function(swiper){
                            if(this.loop){
                                $('.se_nav_2depth_outer').addClass('loop');
                                $('.se_nav_2depth_outer').removeClass('no_loop');
                            }else{
                                $('.se_nav_2depth_outer').removeClass('loop');
                                $('.se_nav_2depth_outer').addClass('no_loop')

                                if( swiper.slides[swiper.activeIndex].className.indexOf('swiper-slide-active') !== -1 ){
                                    swiper.slides[swiper.activeIndex].classList.add('active');
                                }
                            }
                        },
                        onSlideChangeEnd: function(swiper){
                            for (var i = 0; i < tvDepthSlider.length; i++) {
                                if ( swiper.activeIndex !== tvDepthSlider[i].activeIndex && swiper !== tvDepthSlider[i] ) {
                                    tvDepthSlider[i].slideTo(swiper.activeIndex);
                                }
                            }
                        },
                        slideToLoop: function(swiper, speed){
                            var realIndex
                                ,slideToIndex = swiper.clickedIndex
                                ,$wrapperEl = swiper.wrapper
                                ,activeIndex = swiper.activeIndex
                                ,slides = swiper.wrapper.children()
                                ,slidesGrid = swiper.slidesGrid
                                ,swiperSize = swiper.size
                                ,slidesPerView = this.slidesPerView === 'auto' ? slidesPerViewDynamicLeft() : this.slidesPerView;

                            function slidesPerViewDynamicLeft(){
                                var spv = 1;
                                for (var i = activeIndex + 1; i < slides.length; i++ ) {
                                    if (slidesGrid[i] - slidesGrid[activeIndex] < swiperSize) {
                                        spv += 1;
                                    }
                                }
                                return spv;
                            }

                            function nextTick(callback, delay) {
                                if ( delay === void 0 ) delay = 0;
                                return setTimeout(callback, delay);
                            }
                            if(this.loop){
                                if (swiper.animating) { return; }
                                realIndex = parseInt($(swiper.clickedSlide).attr('data-swiper-slide-index'), 10);
                                if (slideToIndex >= slides.length - slidesPerView) { // 2019-01-24 : 클릭시 active index 초기화 수정
                                    swiper.fixLoop();
                                    slideToIndex = $wrapperEl
                                    .children(("." + (this.slideClass) + "[data-swiper-slide-index=\"" + realIndex + "\"]:not(." + (this.slideDuplicateClass) + ")"))
                                    .eq(0)
                                    .index();
                                    nextTick(function() {
                                        swiper.slideTo(slideToIndex, speed);
                                    });
                                }else{
                                    swiper.slideTo(slideToIndex, speed);
                                }
                            }else{
                                for (var i = 0; i < tvDepthSlider.length; i++) {
                                    for (var ii = 0; ii < swiper.slides.length; ii++) {
                                        if( tvDepthSlider[i].slides[ii].className.indexOf(' active') !== -1 ){
                                            tvDepthSlider[i].slides[ii].classList.remove('active');
                                        }
                                    }
                                    tvDepthSlider[i].slides[slideToIndex].classList.add('active');
                                    tvDepthSlider[i].slideTo(slideToIndex, speed);       
                                }
                            }
                        },
                        onClick: function(swiper, e){
                            if( typeof(swiper.clickedIndex) !== 'undefined' ){
                                this.slideToLoop(
                                    swiper, 
                                    100
                                );
                            }
                        }
                    };
                    return options;
                };
                var _init = function(){
                    var reHeight=($(".se_list_wrap .recommend_list").innerWidth()-42)/3,
                        $seNav = $(".se_shop .nav_wrap"),
                        cloneSeNav = $(".cont_sw > .nav_wrap").length;

                    $(".se_list_wrap .recommend_list").css("height",(reHeight+95)*3);
                    if(cloneSeNav<=0){
                        $seNav.clone().prependTo(".mainContent");
                    }
                };
                _init();

                return {
                    init: function(config){
                        for (var i = 0; i < $('.se_nav_2depth_in').length; i++) {
                            tvDepthSlider.push(
                                $('.se_nav_2depth_in').eq(i).swiper(slideConfig(config))
                            );
                        }
                    },
                    destroy: function(){
                        for (var i = 0; i < $('.se_nav_2depth_in').length; i++) {
                            tvDepthSlider[i].destroy(true, true);
                        }
                        tvDepthSlider = [];
                        this._slideArry();
                    },
                    _slideArry: function(){
                        return tvDepthSlider;
                    }
                }
            }

		}, 
		home : {
			/* 2019-02-12 홈개선(추가 시작) */
			swiperObj: null,
			multiTouchFlag : 0,
			swiper : function() {
				var _init = function(){
		        	//스와이프 세팅 시작(init에서 실행시, gnb메뉴 직접클릭해서 들어가면 두번 실행되서 자동으로넘어가기 에러나서 옮김)
					_mainUi.home.swiperObj = new Swiper(".homeTabCount .homeRollBox.swiper_st", {
		        		touchContain:false,
		        		// autoplay:"4000",
		        		autoplayDisableOnInteraction: false,
		        		watchSlidesVisibility:true,
		        		slidesPerView:"auto",
		        		loop:true,
		                spaceBetween:-92,
		                observer:true,
		        		effect: "coverflow",
		        		coverflow: {
		                    rotate: 80,
		                    stretch: 50,
		                    depth: 200,
		                    modifier: 1,
		                    slideShadows : false
		                },onInit: function(swiper){
		                	/* pag 초기세팅 시작 */
		        			var activeSpan=$(".homeTabCount .homeRollBox .pag_in .activeNum");
		        			var totalSpan=$(".homeTabCount .homeRollBox .pag_in .totalNum");
		        			var homeSlideLi=$(".homeTabCount .homeRollBox.swiper_st .swiper-slide").length-$(".homeTabCount .homeRollBox.swiper_st .swiper-slide-duplicate").length;
		        			totalSpan.text("/ "+homeSlideLi+"");
		        			activeSpan.text(1);
		        			swiper.startAutoplay();
		        			/* pag 초기세팅 끝 */
		        	    },onTransitionStart: function(swiper){
		        	    	/* pag 넘기기 시작 */
		        	    	var activeSpan=$(".homeTabCount .homeRollBox .pag_in .activeNum");
		        			var totalSpan=$(".homeTabCount .homeRollBox .pag_in .totalNum");
		        			var homeSlideLi=$(".homeTabCount .homeRollBox.swiper_st .swiper-slide").length-$(".homeTabCount .homeRollBox.swiper_st .swiper-slide-duplicate").length;
		        			var realActiveNum=Math.floor(swiper.activeIndex % homeSlideLi)+1; 
		        	    	activeSpan.text(realActiveNum);
		        	    	/* pag 넘기기 끝 */
		        	    }//,
//		        	     앱에서 내부 스와이프를 위해 필수 onTouchStart, onTouchEnd안에 halfTouchDown(), halfTouchUp()
//	                    onTouchStart: function(swiper, e){
//	                    	if(typeof halfTouchDown == 'function' && AppFlag && (AndroidAgent || appVersionCheck("ios", "2.2.44"))){
//	                            halfTouchDown();
//	                            _mainUi.home.multiTouchFlag = 1;
//	                        }
//	                    },
//	                    onTouchEnd: function(swiper, e){
//	                    	if(typeof halfTouchUp == 'function' && AppFlag && (AndroidAgent || appVersionCheck("ios", "2.2.44")) && _mainUi.food.multiTouchFlag == 1){
//	                            halfTouchUp();
//	                            _mainUi.home.multiTouchFlag = 0;
//	                        }
//	                    }
		    	    });
				
					/* 2019-03-18 홈 내 TV 베스트*/
					_mainUi.home.swiperObj2 = new Swiper(".homeTabCount .homeInTvbestBox.swiper_st", {
						touchContain:false,
		        		autoplay:"4000",
		        		autoplayDisableOnInteraction: false,
		        		watchSlidesVisibility:true,
		        		slidesPerView:"auto",
		        		loop:true,
		                spaceBetween:-50,
		                observer:true,
		                centeredSlides:true,
		        		onInit: function(swiper){
		                	/* pag 초기세팅 시작 */
		        			var activeSpan=$(".homeTabCount .homeInTvbestBox .pag_in .activeNum");
		        			var totalSpan=$(".homeTabCount .homeInTvbestBox .pag_in .totalNum");
		        			var homeSlideLi=$(".homeTabCount .homeInTvbestBox.swiper_st .swiper-slide").length-$(".homeTabCount .homeInTvbestBox.swiper_st .swiper-slide-duplicate").length;
		        			totalSpan.text("/ "+homeSlideLi+"");
		        			activeSpan.text(1);
		        			swiper.startAutoplay();
		        			/* pag 초기세팅 끝 */
		        	    },onTransitionStart: function(swiper){
		        	    	/* pag 넘기기 시작 */
		        	    	var activeSpan=$(".homeTabCount .homeInTvbestBox .pag_in .activeNum");
		        			var totalSpan=$(".homeTabCount .homeInTvbestBox .pag_in .totalNum");
		        			var homeSlideLi=$(".homeTabCount .homeInTvbestBox.swiper_st .swiper-slide").length-$(".homeTabCount .homeInTvbestBox.swiper_st .swiper-slide-duplicate").length;
		        			var realActiveNum=Math.floor(swiper.activeIndex % homeSlideLi)+1; 
		        	    	activeSpan.text(realActiveNum);
		        	    	/* pag 넘기기 끝 */
		        	    }
					});
					
					_mainUi.home.events();
				}	
				window.onresize = function() {
					if(_mainUi.home.swiperObj) {
						_mainUi.home.debounce(function(){
							_mainUi.home.swiperObj.onResize();
							_mainUi.home.swiperObj2.onResize();
		                }, 200);
					}
				}
				return {
                    init : _init
                }
	        	//스와이프 세팅 끝
			},
			debounce : function(func, wait){
                clearTimeout(this.timeout);
                this.timeout = setTimeout(func, wait);
            },
			/* 2019-02-12 홈개선(추가 끝) */
			timerObj : null,
			timer : function() {
				var homeLeftTime;

				// 홈 타이머 초기 셋팅
				var _initHomeTimer = function() {

					$('.tvlive_count').each(function() {
						var endDate = $(this).attr('endDate');
						var curDate = new Date();
						endDate = Date.parse(endDate);
						homeLeftTime = (endDate - curDate) / 1000;
						$(this).attr('leftTime', homeLeftTime);
					});
				}

				var _setHomeTimer = function() {
					$('.tvlive_count').each(function() {
						var jQthis = $(this);

						if (homeLeftTime <= 0) {
							jQthis.html("00:00:00");
							_stopTimer();
							//if( !$('.scrollWrap').find('li').last().is('.onair') ){
							//_getRealVODArea();
							//}
						} else {
							var leftHour = Math.floor(homeLeftTime / 3600);
							var leftMin = Math.floor(homeLeftTime % 3600 / 60);
							var leftSec = Math.floor(homeLeftTime % 3600 % 60);

							jQthis.html((leftHour < 10 ? "0" : "") + leftHour + ":" +
								(leftMin < 10 ? "0" : "") + leftMin + ":" +
								(leftSec < 10 ? "0" : "") + leftSec);
						}
						jQthis.attr('leftTime', homeLeftTime);
					});
				}

				var _timer = null;

				var _stopTimer = function() {
					clearInterval(_timer);
					_timer = null;
				}

				var _startTimer = function() {
					_initHomeTimer();
					if (_timer) {
						return;
					}

					_timer = setInterval(function() {
						homeLeftTime = homeLeftTime - 1;
						_setHomeTimer();
					}, 1000);
				}

				return {
					start : _startTimer,
					stop : _stopTimer
				}
			},
			events : function() {
				var hiddenBox = function(_this, target, event) { 
                	if(event) {
                		_this.hide();
                		target.slideDown(500);
                	}else {
                		target.slideUp(500);
                		_this.show();
                	}
                }
            	var hiddenVod = function(hide, fadeIn) { 
            		hide.hide();
            		fadeIn.fadeIn(300);
                }
                
                $('.homeTabCount .ac_btn a').on('click', function() {
                	var parents = $(this).parents('.more_tv') ,event = $(this).parent().is('.view_btn');
                	hiddenBox(parents.find('.view_btn'), parents.find('.hide_side'), event);
                	
                	if(event) parents.find('.close_btn').show();
                	else parents.find('.close_btn').hide();
                	return false;
                });
                $('.homeTabCount .onair_btn, .homeTabCount .mobile_btn').on('click', function(e) {
                	var hide = $(".homeTabCount .home_top"), fadeIn = $(".homeTabCount #onairPrt");
            		hiddenVod(hide, fadeIn);
            		return false;
            	});
                $('.homeTabCount #onairPrt .vod_close, .homeTabCount #mobilePrt .vod_close').on('click', function(e) {
                	var hide = $(".homeTabCount #onairPrt"), fadeIn = $(".homeTabCount .home_top");
            		hiddenVod(hide, fadeIn);
            		return false;
            	});
                
                $(document).on('click', '.home_top .sub_side > li', function(e) {
            		var thisNum=$(this).index();
            		var ViewList=$(".homeTabCount .main_side > li").eq(thisNum);
            		
            		$(this).addClass("on").siblings().removeClass("on");
            		ViewList.show().siblings().css("display","none");
            		return false;
            	});
            	
            	$(document).on('click', '.home_fixed a', function(e) {//메뉴 on클래스 넣기
            		var thisNum=$(this).parents(".home_fixed > ul > li").index();
            		var homeFixed=$(".home_fixed");

                    for(var i=0; i<=homeFixed.length; i++){
            			$(".home_fixed:eq("+i+") > ul > li").removeClass("on");
            			$(".home_fixed:eq("+i+") > ul > li").eq(thisNum).addClass("on");
            		}

                    // 카테고리 변경
                    //_nextFood('move');

            		return false;
            	});
            	
            	//스티키 메뉴 세팅 시작
            	function homeFixedSet(){
					var theLength= $('.cont_sw > .home_fixed').length;

					if(theLength<=0){
						$(".homeTabCount .home_fixed").clone().appendTo(".cont_sw");
					}
					$(".homeTabCount .home_fixed, .cont_sw > .home_fixed, .homeTabCount .goodsHalf_wrap").removeClass("over");
				}
            	homeFixedSet();
            	//스티키 메뉴 세팅 끝
            	
            	$(document).on('click', '.cont_sw > .home_fixed a', function(e) {//메뉴 눌렀을때 상단으로 스크롤 이동
            		var appCheck=$(".app_setup").length;
            		var cateHomeTop;

            		if(appCheck>0){//web인경우
            			cateHomeTop=($(".homeTabCount").height()+$(".wrapAllHeader").height()+$(".homeTabCount .home_best .title").innerHeight())-($(".homeTabCount .home_best").height()+42);
                	}else{//앱인경우
                		cateHomeTop=($(".homeTabCount").height()+$(".homeTabCount .home_best .title").innerHeight())-($(".homeTabCount .home_best").height()+42);
                	}
            		
            		$('html, body').scrollTop(cateHomeTop);
            		return false;
            	});
            	/* 2019-02-12 홈개선(추가 시작) */
				//홈 스크롤 이벤트 시작
                $(window).on('scroll', function(){//좋은밥상 스크롤 이벤트
                	var appCheck=$(".app_setup").length;
                	var fixedNum;
                	var homeScrollTop=$(window).scrollTop();

                	if(appCheck>0){//web인경우
                		fixedNum=($(".homeTabCount").height()+$(".wrapAllHeader").height()+$(".homeTabCount .home_best .title").innerHeight())-($(".homeTabCount .home_best").height()+42);
                	}else{//앱인경우
                		fixedNum=($(".homeTabCount").height()+$(".homeTabCount .home_best .title").innerHeight())-($(".homeTabCount .home_best").height()+42);
                	}
                	
                	if(homeScrollTop>=fixedNum){//메뉴보다 더 스크롤 했을때
                		$(".homeTabCount .home_fixed, .cont_sw > .home_fixed, .homeTabCount .goodsHalf_wrap").addClass("over");
            		}else{//메뉴보다 덜 스크롤 했을때
            			$(".homeTabCount .home_fixed, .cont_sw > .home_fixed, .homeTabCount .goodsHalf_wrap").removeClass("over");
            		}

                });//홈 스크롤 이벤트 끝
                /* 2019-02-12 홈개선(추가 끝) */
			},
			homeBannerClose : function(){
				$('.homeBn').fadeOut(400);
				var tvBtn = jQuery('.btn_tv_search');//2018-08-02 gnb연관수정
				tvBtn.css({'bottom' : 65});
				_Util.Cookie.setCookieDay('8005018', 'done', 1);
				showHomeBanner = false;
			},
            // 2019-01-29 비디오 테스트
            autoPlayModule : function(){
                var autoPlay = function(){
                    this.$inVideo = $('.in_video');
                    this.viewTopArr = [];
                    this.videoArr = [];
                    
                    /* S: 2019-03-22 홈 UI 비디오 개선 */ 
                    this.$btnReplay = this.$inVideo.find('.btn_replay');
                    this.$btnPause = this.$inVideo.find('.btn_play');
                    /* E: 2019-03-22 홈 UI 비디오 개선 */

                    this._init();
                };
                autoPlay.prototype._init = function(idx){
                    for (var i = 0; i < this.$inVideo.length; i++) {
                        this.viewTopArr.push(this.$inVideo.eq(i).find('video').offset().top);
                        this.videoArr.push(this.$inVideo.eq(i).find('video')[0]);
                    }
                    this.onStop();
                    this.scrolling();
                    
                    /* S: 2019-03-22 홈 UI 비디오 개선 */
                    this.$inVideo.on('click', {that:this}, this.ctrlEvent);
                    /* E: 2019-03-22 홈 UI 비디오 개선 */
                };
                
                /* S: 2019-03-22 홈 UI 비디오 개선 */
                autoPlay.prototype.ctrlEvent = function(e){
                	var that = e.data.that;
                	e.stopPropagation();
                    
                	var eventCnt = that.$btnPause.queue('fx').length;
		            for(var i=0; i<eventCnt; i++) {
		            	that.$btnPause.stop().css('opacity','1');
		            }
			
                	if($(e.target).is('button') && $(e.target).hasClass('btn_play')) {
                		if(that.$btnPause.hasClass('pause')) {
                			that.onPlay(0);
                    		that.$btnPause.removeClass('pause').hide();
                		}else {
                			if(that.$btnPause.queue('fx').length>0) that.$btnPause.queue('fx');that.$btnPause.show();
                			that.onPause(0);
                			that.$btnPause.addClass('pause').show();
                		}
                	}else if(!$(e.target).hasClass('btn_replay')){
                		if($(e.target).parents().find('.pause').size() <= 0) {
                			that.$btnPause.show().delay(1000).fadeOut();
                		}
                	}
                	
                };
                /* E: 2019-03-22 홈 UI 비디오 개선 */
                
                autoPlay.prototype.scrolling = function(){
                    var scrollTop, 
                        that = this,
                        timeout = null;
                    
                    /*var debounce = function(func, wait) {
                        return function(){
                            clearTimeout(timeout);
                            timeout = setTimeout(func, wait);
                        }
                    };*/
            
                    $(window).on('scroll', function(){
                    	/* S: 2019-03-22 홈 UI 비디오 개선 */
                    	if(that.$btnPause.hasClass('pause')) return false;
                    	/* E: 2019-03-22 홈 UI 비디오 개선 */
    		            _mainUi.home.debounce(function(){
                            scrollTop = $(window).scrollTop();
                            // 해당 view 넘버 비디오 실행
                            for (var i = 0; i < that.videoArr.length; i++) {
                                if( that.viewChk(scrollTop) == i && that.viewChk(scrollTop) !== -1 ){
                                    that.onPlay(that.viewChk(scrollTop));
                                }else{
                                    that.onPause(i);
                                }
                            }
                        }, 500);
                    }).trigger("scroll");
                };
                autoPlay.prototype.viewChk = function(scrollTop){
                    var viewNum = -1,
                        that = this,
                        min = minHeight(); // 근사치 최소값
                    
                    function minHeight(){
                        var max = 0;
                        for (var i = 0; i < that.videoArr.length; i++) {
                            if( max < that.videoArr[i].clientHeight ) max = that.videoArr[i].clientHeight;
                        }
                        return max;
                    }
                    var views = this.viewTopArr.map(function(top, idx){
                        var abs = ( (top - scrollTop ) < 0 ) ? - (top - scrollTop) : (top - scrollTop);
                        if( abs < min) {
                            min = abs;
                            return idx;
                        }
                    });

                    for (var i = 0; i < views.length; i++) {
                        if( typeof(views[i]) == 'number' ) {
                            viewNum = views[i];
                        }
                    }
                    return viewNum;
                };
                autoPlay.prototype.onPlay = function(videoIdx){
                    if( !this.videoArr[videoIdx].ended ){
                        this.videoArr[videoIdx].play();
                        //console.log(videoIdx, '재생');
                    }
                };
                autoPlay.prototype.onPause = function(videoIdx){
                    this.videoArr[videoIdx].pause();
                    //console.log(videoIdx, '멈춤');
                };
                autoPlay.prototype.onStop = function(){
                    var that = this;

                    for (var i = 0; i < this.videoArr.length; i++) {
                        that.videoArr[i].addEventListener('ended', function(){
                            var video = this,
                                parentNode = video.parentNode;

                            parentNode.classList.add("replay");
                            that.$btnPause.addClass('pause');/*2019-03-22 홈 UI 비디오 개선*/
                            for (var ii = 0; ii < parentNode.children.length; ii++) {
                                if( parentNode.children[ii].className == 'btn_replay' ){
                                    parentNode.children[ii].addEventListener('click', function(){
                                        that.onReplay(video);
                                        that.$btnPause.removeClass('pause');/*2019-03-22 홈 UI 비디오 개선*/
                                    });
                                }
                            }
                        });
                    }
                };
                autoPlay.prototype.onReplay = function(video){
                    var parentNode = video.parentNode,
                        scrollTop = $(window).scrollTop();
                    
                    if( video.ended ){
                        parentNode.classList.remove("replay");
                        video.currentTime = 0;
                        video.duration = 0;
                        // 해당 view 넘버 비디오 실행
                        for (var i = 0; i < this.videoArr.length; i++) {
                            if( this.viewChk(scrollTop) == i && this.viewChk(scrollTop) !== -1 ){
                                this.onPlay(this.viewChk(scrollTop));
                            }else{
                                this.onPause(i);
                            }
                        }
                        // console.log('다시재생');
                    }
                };

                return new autoPlay();
                
            }
		},
		half : {
			cnt : 0,
			swiperObj : null,
			planStHalf: null,
			nextAuto : function(){
				clearTimeout(_mainUi.half.planStHalf );
				_mainUi.half.swiperObj.slide(_mainUi.half.cnt + 1);
			},
			/* 2018-07-03  반값장터 메뉴동작 시작 */
            halfMenuScroll : function(){
            	//2018-07-18 수정 시작(web만 스티키 카테고리 기능 제거)
            	var cateList, cateListMenu, harfWrap, timer, scrolled, theWidth, currentIdx;

	            if(AppFlag){
					cateList = $('.halfCate');
					cateListMenu = $('.halfCate_cnt');
					harfWrap = $('.swipe-half');
					timer;
					scrolled = false;
					theWidth=$(".btn_play").height()-22;
					currentIdx;

					function halfMenuScrollSet(){
						var theLength= $('.cont_sw > .halfCate').length;

						if(theLength<=0){
							$(".halfTabConts .halfCate").clone().appendTo(".cont_sw");
						}
					}
					halfMenuScrollSet();
	            }
	            //2018-07-18 수정 끝(web만 스티키 카테고리 기능 제거)
				function halfPagTop(){
                    theWidth=$(".halfBest .active .goodImg").height()-24;// 2018-10-11 count 위치값 코드 재추가
					$(".renewal .count").css("top",theWidth); // 2018-10-11 count 위치값 코드 재추가

					//var activeHeight=Number($(window).width()-44)/2;  //2018-07-27 추가 2018-08-09 반값장터 ui개선
					var activeHeight=$('.halfBest .active .half_listBox').height(); //2018-07-27 추가  2018-08-22 반값장터 ui개선(이전버전으로 롤백)
					$('.halfBest > ul').css("height",activeHeight); //2018-07-27 추가
				}
				halfPagTop();
				
				//2018-07-18 수정 시작(web만 스티키 카테고리 기능 제거)
				if(AppFlag){
					function scroll (e) {//스크롤시 동작
						var fixedTop=$(".app_setup").outerHeight()+$(".headerNew").outerHeight()+$(".rn_gnb_wrap").outerHeight();//헤더부분 높이 계산
						var cateOffsetTop = fixedTop+$(".mainTit").outerHeight()+5+$(".hafBestWrap").outerHeight()+$(".banner_half").outerHeight();/* 2018-08-30 스티키수정 +$(".halfCate_tlt").outerHeight()*///메뉴 위쪽 높이계산
						var winWidth=$(window).width();//2018-07-05 추가수정
					  	scrolltop = window.pageYOffset || document.documentElement.scrollTop;
					  	scrolled = true;
					  	currentIdx =  _getCurrentLocationIdx();//스와이프 인덱스 값 반값장터는1
					  	var appTop=$(".app_setup").length;//상단에 app설치 안내가 있는지 체크

					  	//2018-07-05 추가수정 시작
		  				if(currentIdx == 1) {//반값장터인 경우
		  				$('.cont_sw > .halfCate').css("display","block");//복사된 스티키메뉴를 보여지게 한다
	  						if(appTop>0){//web인경우
	  							if(scrolltop >= cateOffsetTop-$(".rn_gnb_wrap").outerHeight()) {//스크롤이 스티키 메뉴를 지날경우 실행 //2018-08-02 gnb연관수정
		  							if(scrolled) $('.cont_sw > .halfCate').addClass('optView');
									harfWrap.addClass('harfScroll');
									$('.cont_sw > .halfCate').addClass('fixed').css("top","42px");//2018-08-02 gnb연관수정

									if(winWidth<360){
										$('.goodsHalf_wrap').css("marginTop",174); // 카테고리 컨텐츠 여백 추가 class 2018-08-09 반값장터 ui개선(marginTop값 증가)
									}else{
										$('.goodsHalf_wrap').css("marginTop",134); // 카테고리 컨텐츠 여백 추가 class 2018-08-09 반값장터 ui개선(marginTop값 증가)
									}

									clearTimeout(timer);
									timer = setTimeout( scrollEnd , 200 );
		  						} else {//스크롤이 스티키 메뉴를 지나지 않을 경우
									$('.cont_sw > .halfCate').removeClass('fixed').css("top",0);
									$('.goodsHalf_wrap').css("marginTop","0"); // 카테고리 컨텐츠 여백 제거 class//2018-07-05 gnb수정
									harfWrap.removeClass('harfScroll');
									$('.cont_sw > .halfCate').removeClass('optView');
								}
	  						} else {//app인경우
								if(scrolltop >= cateOffsetTop) {//스크롤이 스티키 메뉴를 지날경우 실행
		  							if(scrolled) $('.cont_sw > .halfCate').addClass('optView');
									harfWrap.addClass('harfScroll');
									$('.cont_sw > .halfCate').addClass('fixed').css("top",0);//2018-08-02 gnb연관수정
									if(winWidth<360){
										$('.goodsHalf_wrap').css("marginTop",164); // 카테고리 컨텐츠 여백 추가 class
									}else{
										$('.goodsHalf_wrap').css("marginTop",124); // 카테고리 컨텐츠 여백 추가 class
									}
									clearTimeout(timer);
									timer = setTimeout( scrollEnd , 200 );
		  						} else {//스크롤이 스티키 메뉴를 지나지 않을 경우
									$('.cont_sw > .halfCate').removeClass('fixed').css("top",0);
									$('.goodsHalf_wrap').css("marginTop","0"); // 카테고리 컨텐츠 여백 제거 class//2018-07-05 gnb수정
									harfWrap.removeClass('harfScroll');
									$('.cont_sw > .halfCate').removeClass('optView');
								}
							}
					  	}else{//반값장터가 아닌 경우 복사된 스티키메뉴를 감춘다
					  		$('.cont_sw > .halfCate').css("display","none");
					  		harfWrap.removeClass('harfScroll');
					  	}
		  				//2018-07-05 추가수정 끝
		  				e.preventDefault();
					};

	                function scrollEnd(){
	                    if(scrolled){
	                        $('.halfCate').removeClass('optView');
	                        scrolled = false;
	                    }
	                }
	                window.onload = scroll;
	                window.onscroll = scroll;
				}
                //2018-07-18 수정 끝(web만 스티키 카테고리 기능 제거)
                window.onresize = halfPagTop;
            },/* 2018-07-03  반값장터 메뉴동작 끝 */
			swiper : function() {
				var _init = function() {
					_mainUi.half.cnt = 0;
					var _$halfBestEle = $('.halfBest');

					if (!_$halfBestEle.size()) {
						return;
					}

					var _$EleLi = _$halfBestEle.find('li'),
						_len = _$EleLi.length,
						$countEle = $('.count'),
						_startIdx = 1;

					$countEle.find('.current').text((_startIdx));
					$countEle.find('.total').text('/' + _len);
					/*_$halfBestEle.find('li').addClass('on');*///2018-07-24 (반값장터상단롤링)
					_$halfBestEle.find('li').addClass('off');//2018-07-24 (반값장터상단롤링)
					_$halfBestEle.find('li').eq(0).addClass('active');//2018년 6월 4일 추가(배너 딤드처리)
					_$halfBestEle.find('li').eq(1).addClass('active_next');//2018-07-24 (반값장터상단롤링)
					_$halfBestEle.find('li').eq(_len-1).addClass('active_prev');//2018-07-24 (반값장터상단롤링)
					$('.halfBest > ul').css("height",_$halfBestEle.find('li').eq(0).height());//2018-07-24 (반값장터상단롤링)
					$('.halfBest > ul').addClass("half_w100p");//2018-07-24 (반값장터상단롤링)

					if(_mainUi.half.planStHalf){
						clearTimeout(_mainUi.half.planStHalf);
					}
					_mainUi.half.planStHalf = setTimeout( _mainUi.half.nextAuto, 4000 );

					_mainUi.half.swiperObj = new Swipe(_$halfBestEle.get(0), {
						stopPropagation: true,//2018-07-27 수정
						startSlide: 0,
						touchContain : false,//2018-07-27 추가
						bMulti: true,
						inSlide: true,
						callback : function(index, elem) {
							$countEle.find('.current').text((index + _startIdx));
							_$halfBestEle.find('li').removeClass('active active_prev active_next');//2018-06-04 추가(배너 딤드처리)

							//2018-07-24 (반값장터상단롤링) 시작
							var theIndexPrev=index-1;
							if(theIndexPrev==_len-1){
								theIndexPrev=1;
							}
							var theIndexNext=index+1;

							if(theIndexNext==_len){
								theIndexNext=0;
							}
							//2018-07-24 (반값장터상단롤링) 끝

							_$halfBestEle.find('li').eq(index).addClass('active');//2018-06-04 추가(배너 딤드처리)
							_$halfBestEle.find('li').eq(theIndexPrev).addClass('active_prev');//2018-07-24 (반값장터상단롤링)
							_$halfBestEle.find('li').eq(theIndexNext).addClass('active_next');//2018-07-24 (반값장터상단롤링)
							if (!$(elem).find('img.lazy').attr('src')) {
								$(elem).find('img.lazy').attr('src', $(elem).find('img.lazy').attr('data-original'));
							}
							//dele 다음으로 수동으로 넘겼을때 다시 자동으로 swipe되도록 수정
							//half에 cnt와 nextAuto추가했으니 검토바랍니다.
							_mainUi.half.cnt = index;
							clearTimeout( _mainUi.half.planStHalf );
							_mainUi.half.planStHalf = setTimeout(_mainUi.half.nextAuto,4000);


						}
					});
				}
				return {
					init : _init
				}
			}
		},
		/* 2019-02-08 좋은밥상 수정(시작) */
		food : {
			swiperObj: null,
			multiTouchFlag : 0,
			swiper : function() {
				var _init = function(){
		        	//스와이프 세팅 시작(init에서 실행시, gnb메뉴 직접클릭해서 들어가면 두번 실행되서 자동으로넘어가기 에러나서 옮김)
					_mainUi.food.swiperObj = new Swiper(".foodTabCount .swiper_st", {
		        		touchContain:false,
		        		autoplay:"4000",
		        		autoplayDisableOnInteraction: false,
		        		watchSlidesVisibility:true,
		        		slidesPerView:"auto",
		        		loop:true,
		                spaceBetween:-100,
		                observer:true,
		        		effect: "coverflow",
		        		coverflow: {
		                    rotate: 80,
		                    stretch: 50,
		                    depth: 200,
		                    modifier: 1,
		                    slideShadows : false
		                },onInit: function(swiper){
		                	/* pag 초기세팅 시작 */
		        			var activeSpan=$(".foodTabCount .pag_in .activeNum"); // 2019-02-12 홈개선(선택자 변경)
		        			var totalSpan=$(".foodTabCount .pag_in .totalNum"); // 2019-02-12 홈개선(선택자 변경)
		        			var foodSlideLi=$(".foodTabCount .swiper_st .swiper-slide").length-$(".foodTabCount .swiper_st .swiper-slide-duplicate").length;
		        			totalSpan.text("/ "+foodSlideLi+"");
		        			activeSpan.text(1);
		        			swiper.startAutoplay();
		        			/* pag 초기세팅 끝 */
		        	    },
		        	    onTransitionStart: function(swiper){
		        	    	/* pag 넘기기 시작 */
		        	    	var activeSpan=$(".foodTabCount .pag_in .activeNum");// 2019-02-12 홈개선(선택자 변경)
		        			var totalSpan=$(".foodTabCount .pag_in .totalNum");// 2019-02-12 홈개선(선택자 변경)
		        			var foodSlideLi=$(".foodTabCount .swiper_st .swiper-slide").length-$(".foodTabCount .swiper_st .swiper-slide-duplicate").length;
		        			var realActiveNum=Math.floor(swiper.activeIndex % foodSlideLi)+1; 
		        	    	activeSpan.text(realActiveNum);
		        	    	/* pag 넘기기 끝 */
		        	    }//,
//		        	     앱에서 내부 스와이프를 위해 필수 onTouchStart, onTouchEnd안에 halfTouchDown(), halfTouchUp()
//	                    onTouchStart: function(swiper, e){
//	                    	if(typeof halfTouchDown == 'function' && AppFlag && (AndroidAgent || appVersionCheck("ios", "2.2.44"))){
//	                            halfTouchDown();
//	                            _mainUi.food.multiTouchFlag = 1;
//	                        }
//	                    },
//	                    onTouchEnd: function(swiper, e){
//	                    	if(typeof halfTouchUp == 'function' && AppFlag && (AndroidAgent || appVersionCheck("ios", "2.2.44")) && _mainUi.food.multiTouchFlag == 1){
//	                            halfTouchUp();
//	                            _mainUi.food.multiTouchFlag = 0;
//	                        }
//	                    }
		    	    });
				}

				return {
                    init : _init
                }
	        	//스와이프 세팅 끝
			}
		},
		/* S : 2019-02-18 tv베스트 개선 */
		tvbest :{
			//스와이프 세팅 시작
			swiperObj: null,
			multiTouchFlag : 0,
			swiper : function() {
				var _init = function(){
					_mainUi.tvbest.swiperObj = new Swiper(".tvBestTabCount .swiper_st", {
		        		touchContain:false,
		        		loop:true,
		        		watchSlidesVisibility:true,
		        		slidesPerView:"auto",
		        		nextButton: '.tvBestTabCount  .swiper-button-next',
						prevButton: '.tvBestTabCount  .swiper-button-prev',
		                spaceBetween:0,
		                observer:true,
		        		onInit: function(swiper){
		        			var activeSpan=$(".tvBestTabCount .pag_in .activeNum");
		        			var totalSpan=$(".tvBestTabCount .pag_in .totalNum");
		        			var tvSlideLi=$(".tvBestTabCount .swiper_st .swiper-slide").length-$(".tvBestTabCount .swiper_st .swiper-slide-duplicate").length;
		        			totalSpan.text("/ "+tvSlideLi+"");
		        			activeSpan.text(1);
		        	    },onTransitionStart: function(swiper){
		        	    	var activeSpan=$(".tvBestTabCount .pag_in .activeNum");
		        			var totalSpan=$(".tvBestTabCount .pag_in .totalNum");
		        			var tvSlideLi=$(".tvBestTabCount .swiper_st .swiper-slide").length-$(".tvBestTabCount .swiper_st .swiper-slide-duplicate").length;// 2019-02-28 좋은밥상 에러 수정(추가)
		        			var realActiveNum=Math.floor(swiper.activeIndex % tvSlideLi)+1; // 2019-02-27 좋은밥상 에러 수정(추가)
		        	    	activeSpan.text(realActiveNum);
		        	    }//,
//		        	     앱에서 내부 스와이프를 위해 필수 onTouchStart, onTouchEnd안에 halfTouchDown(), halfTouchUp()
//	                    onTouchStart: function(swiper, e){
//	                    	if(typeof halfTouchDown == 'function' && AppFlag && (AndroidAgent || appVersionCheck("ios", "2.2.44"))){
//	                            halfTouchDown();
//	                            _mainUi.tvbest.multiTouchFlag = 1;
//	                        }
//	                    },
//	                    onTouchEnd: function(swiper, e){
//	                    	if(typeof halfTouchUp == 'function' && AppFlag && (AndroidAgent || appVersionCheck("ios", "2.2.44")) && _mainUi.tvbest.multiTouchFlag == 1){
//	                            halfTouchUp();
//	                            _mainUi.tvbest.multiTouchFlag = 0;
//	                        }
//	                    }
		    	    });
					
					_mainUi.tvbest.events();
				}
				
				window.onresize = function() {
					if(_mainUi.tvbest.swiperObj) {
						_mainUi.tvbest.debounce(function(){
							_mainUi.tvbest.swiperObj.onResize();
		                }, 200);
					}
				}

				return {
                    init : _init
                }
	        	//스와이프 세팅 끝
			},
			events : function() {
				$("#footer").hide();
                var hiddenBox = function(_this, target, event) { 
                	if(event) {
                		_this.hide();
                		target.slideDown(500);
                	}else {
                		target.slideUp(500);
                		_this.show();
                	}
                }
                var hiddenVod = function(hide, fadeIn) { 
            		hide.hide();
            		fadeIn.fadeIn(300);
                }
                $('.tvBestTabCount .ac_btn a').on('click', function() {
                	var parents = $(this).parents('.more_tv')
                		,event = $(this).parent().is('.view_btn');
                	hiddenBox(parents.find('.view_btn'), parents.find('.hide_side'), event);
                	
                	if(event) parents.find('.close_btn').show();
                	else parents.find('.close_btn').hide();
                	return false;
                });
                $('.tvBestTabCount .onair_btn, .tvBestTabCount .mobile_btn').on('click', function(e) {
                	var hide = $(".tvBestTabCount .thum_list .prdListCard"), fadeIn = $(".tvBestTabCount #onairPrt");
            		hiddenVod(hide, fadeIn);
            		return false;
            	});
                $('.tvBestTabCount #onairPrt .vod_close, .tvBestTabCount #mobilePrt .vod_close').on('click', function(e) {
                	var hide = $(".tvBestTabCount #onairPrt"), fadeIn = $(".tvBestTabCount .thum_list .prdListCard");
            		hiddenVod(hide, fadeIn);
            		return false;
            	});

				$(document).on('click', '.tv_fixed li a', function(e) {//메뉴 on클래스 넣기

            		var thisNum=$(this).parents(".tv_fixed > ul > li").index();
            		var foodFixed=$(".cont_sw > .tv_fixed");


                    for(var i=0; i<=foodFixed.length; i++){
            			$(".tv_fixed:eq("+i+") > ul > li").removeClass("on");
            			$(".tv_fixed:eq("+i+") > ul > li").eq(thisNum).addClass("on");
            		}
            		return false;
            	});
				//스크롤 이벤트 시작
                $(window).on('scroll', function(){
                	var appCheck=$(".app_setup").length;
                	var fixedNum;
                	var bestScrollTop=$(window).scrollTop();
                		
                	if(appCheck>0){//web인경우
                		fixedNum=($(".tvBestTabCount .fixed_top_wrap").innerHeight()+$(".wrapAllHeader").height())-41;
                	}else{//앱인경우
                		fixedNum=$(".tvBestTabCount .fixed_top_wrap").height()-$(".tvBestTabCount .best_list_header").height();
                	}
                	
                	if(bestScrollTop>=fixedNum){//메뉴보다 더 스크롤 했을때
                		$(".tvBestTabCount .best_list_header, .cont_sw > .best_list_header, .cont_sw > .tv_fixed, .tvBestTabCount .tv_fixed, .tvBestTabCount .best_list").addClass("over");
                		
            		}else{//메뉴보다 덜 스크롤 했을때
            			//$(".cont_sw > .tvBestCateWrap ul").scrollTop(0); 탑 이동 초기화
            			$(".tvBestTabCount .best_list_header, .cont_sw > .best_list_header, .cont_sw > .tv_fixed, .tvBestTabCount .tv_fixed, .tvBestTabCount .best_list").removeClass("over");
            			
            		}

                });//스크롤 이벤트 끝
                
                // 2018-07-03 tv베스트 선행 수정 시작
				function tvBestCateWraSet(){
					var theLength= $('.cont_sw > .tv_fixed').length;

					if(theLength<=0){
						$(".tv_fixed").clone().appendTo(".cont_sw");
						$('.cont_sw > .tv_fixed').css({"display":"none"}); // 2019-02-18 tv베스트 개선(선택자 수정) 
					}
					
					/* 2019-02-18 tv베스트 개선(추가 시작) */
					var theLength2= $('.cont_sw > .best_list_header').length;
					
					if(theLength2<=0){
						$(".best_list .best_list_header").clone().appendTo(".cont_sw");
					}
					/* 2019-02-18 tv베스트 개선(추가 끝) */
				}
				_mainUi.tvbest.debounce(tvBestCateWraSet, 300 );
				// 2018-07-03 tv베스트 선행 수정 끝
			},
			debounce : function(func, wait){
                clearTimeout(this.timeout);
                this.timeout = setTimeout(func, wait);
            }
		},
		/* E : 2019-02-18 tv베스트 개선 */
		hotkill : {
// 핫킬타이머 퍼블리싱에서는 사용안함.
//			timerObj : null,
//			timer : function() {
//
//				// 핫킬 변수
//				var hotKillLeftTime,
//					hotkillStartDate,
//					hotkillEndDate;
//
//				// 핫킬 타이머 초기 셋팅
//				var _initHotkillTimer = function() {
//					$('.hotkillTimer').each(function() {
//						var endDate = $(this).attr('endDate');
//						var curDate = new Date();
//						endDate = Date.parse(endDate);
//						hotKillLeftTime = (endDate - curDate) / 1000;
//						$(this).attr('leftTime', hotKillLeftTime);
//						hotkillStartDate = new Date($(this).attr('startDate'));
//						hotkillEndDate = new Date($(this).attr('endDate'));
//					});
//				}
//
//				// 핫킬 타이머 디스플레이
//				var _setHotkillTimer = function() {
//
//					$('.hotkillTimer').each(function() {
//						var jQthis = $(this);
//
//						if (hotKillLeftTime <= 0) {
//							if (jQthis.hasClass('maintabTit')) {
//								jQthis.html((hotkillStartDate.getMonth() + 1) + '.' + hotkillStartDate.getDate() + ' ~ ' +
//									(hotkillEndDate.getMonth() + 1) + '.' + hotkillEndDate.getDate() +
//									' <span>(0일 0시 0분 남음)</span>');
//							} else if (jQthis.hasClass('hotkillCom')) {
//								jQthis.html('<var>기간한정 특가 핫킬!</var> <em class="num">' + $(this).attr('endDate').substring(0, 5) + '</em><var>까지</var><br />' +
//									'<span><strong class="num">0</strong><var>일</var> <strong class="num">0</strong><var>시</var> <strong class="num">0</strong><var>분</var></span><var>후에 종료</var>');
//							} else {
//								jQthis.html('<span class="tit"><strong>' +
//									(hotkillStartDate.getMonth() + 1) + '.' + hotkillStartDate.getDate() + '~' +
//									(hotkillEndDate.getMonth() + 1) + '.' + hotkillEndDate.getDate() +
//									'</strong> (0일 0시 0분 남음)</span>');
//							}
//							_stopTimer();
//						} else {
//							var leftDay = Math.floor(hotKillLeftTime / 86400);
//							var leftHour = Math.floor(hotKillLeftTime % 86400 / 3600);
//							var leftMin = Math.floor(hotKillLeftTime % 86400 % 3600 / 60);
//
//							if (jQthis.hasClass('maintabTit')) {
//								jQthis.html((hotkillStartDate.getMonth() + 1) + '.' + hotkillStartDate.getDate() + ' ~ ' +
//									(hotkillEndDate.getMonth() + 1) + '.' + hotkillEndDate.getDate() +
//									' <span>(' + leftDay + '일 ' +
//									(leftHour < 10 ? '0' : '') + leftHour + '시 ' +
//									(leftMin < 10 ? '0' : '') + leftMin + '분 ' +
//									'남음)</span>');
//							} else if (jQthis.hasClass('hotkillCom')) {
//								jQthis.html('<var>기간한정 특가 핫킬!</var> <em class="num">' + $(this).attr('endDate').substring(0, 5) + '</em><var>까지</var><br />' +
//									'<span><strong class="num">' + leftDay + '</strong><var>일</var> ' +
//									'<strong class="num">' + (leftHour < 10 ? '0' : '') + leftHour + '</strong><var>시</var> ' +
//									'<strong class="num">' + (leftMin < 10 ? '0' : '') + leftMin + '</strong><var>분</var></span><var> 후에 종료</var>');
//							} else {
//								jQthis.html('<span class="tit"><strong>' +
//									(hotkillStartDate.getMonth() + 1) + '.' + hotkillStartDate.getDate() + '~' +
//									(hotkillEndDate.getMonth() + 1) + '.' + hotkillEndDate.getDate() +
//									'</strong> (' + leftDay + '일 ' +
//									(leftHour < 10 ? '0' : '') + leftHour + '시 ' +
//									(leftMin < 10 ? '0' : '') + leftMin + '분 ' +
//									'남음)</span>');
//							}
//						}
//						jQthis.attr('leftTime', hotKillLeftTime);
//					});
//				}
//
//				var _timerObj = null;
//
//				var _stopTimer = function() {
//					clearInterval(_timerObj);
//					_timerObj = null;
//				}
//
//				var _startTimer = function() {
//					_initHotkillTimer();
//					if (_timerObj) {
//						return;
//					}
//
//					_timerObj = setInterval(function() {
//						hotKillLeftTime = hotKillLeftTime - 1;
//						_setHotkillTimer();
//					}, 1000);
//				}
//
//				return {
//					start : _startTimer,
//					stop : _stopTimer
//				};
//			}
		},
		option : {
			init : function(){

				var lastYnA = false,
				lastYnB = false,
				lastYnC = false,
				lastYnD = true;

				var _optionOpen = function(){
				    try {
				        selOpt = {
				            optionName1: '',
				            optionName2: '',
				            optionName3: '',
				            optionName4: ''
				        };

				        if (Object.keys(hnsOptionLayer.goodsdtList.goodsdtList).length == 1) {
				            var goodsdtCode = '';

				            for (var code in hnsOptionLayer.goodsdtList.goodsdtList) { goodsdtCode = code; }

				            $('#opGoods').attr('goodscode', $('#tvGoods').attr('goodscode'));
				            $('#opGoods').attr('goodsdtcode', goodsdtCode);
				        }

				        if(hnsOptionLayer.goodsdtList.optionTitleA != '') {
				            if(hnsOptionLayer.goodsdtList.optionTitleB.trim().length == 0 ) {
				                lastYnA = true;
				            }
				            $('.hns_color').html('');
				            $('#colorList').html(hnsOptionLayer.goodsdtList.optionTitleA+'<em></em>');
				            if(hnsOptionLayer.goodsdtList.optionImageCheck == '1') { //이미지 없음
				                $('.hns_color').html(_makeOptionListA());
				            } else {
				                $('.hns_color').html(_makeOptionListImageA());
				            }
				        } else {
				            document.getElementById("colorList").style.display = "none";
				        }
				        if(hnsOptionLayer.goodsdtList.optionTitleB != '') {
				            $('.hns_size').html('');
				            $('#sizeList').html(hnsOptionLayer.goodsdtList.optionTitleB+'<em></em>');
				            $('.hns_size').html(_makeOptionListB(0));
				        } else {
				            document.getElementById("sizeList").style.display = "none";
				        }
				        if(hnsOptionLayer.goodsdtList.optionTitleC != '') {
				            $('.hns_pattern').html('');
				            $('#patternList').html(hnsOptionLayer.goodsdtList.optionTitleC+'<em></em>');
				            $('.hns_pattern').html(_makeOptionListC(0));
				        } else {
				            document.getElementById("patternList").style.display = "none";
				        }
				        if(hnsOptionLayer.goodsdtList.optionTitleD != '') {
				            $('.hns_').html('');
				            $('#formList').html(hnsOptionLayer.goodsdtList.optionTitleD+'<em></em>');
				            $('.hns_form').html(_makeOptionListD(0));
				        } else {
				            document.getElementById("formList").style.display = "none";
				        }

				        setTimeout(function(){ MAIN_OPTION_LAYER_SCROLL.resize(); }, 1000);
				    }
				    catch(err) {
				    }

				    return true;
				}

				var _makeOptionListA = function(){
				    var html = '';
				    var goodsdtList = hnsOptionLayer.goodsdtList;
				    var optionA_arr = [];
				    var orderableA_arr = [];
				    var orderCheckA_arr = [];
				    var optionB_arr = [];
				    var OptionName = [];
				    var OptionBName = [];
				    var num = Number(0);
				    if(hnsOptionLayer.goodsdtList.optionNameACheck == '0') {
				        html += '<div class="goodsview_Sty3">';
				        if(hnsOptionLayer.goodsdtList.optNameACheck == '1') {
				            html +=  '    <ul class="btn_2num">';
				        } else {
				            html +=  '    <ul class="btn_3num">';
				        }
				        for (var goodsdtCode in goodsdtList.goodsdtList) {
				            optionA_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameA);
				            if(lastYnA) {
				                orderableA_arr.push(goodsdtList.goodsdtList[goodsdtCode].briefOrderAbleCnt);
				                orderCheckA_arr.push(goodsdtList.goodsdtList[goodsdtCode].saleGb);
				            }
				        }
				        OptionName = _distinctOpt(optionA_arr);

				        for (var arrayNum  in OptionName) {
				            if(lastYnA) {
				                html +=  '          <li>';
				                if(orderableA_arr[arrayNum] > 0 && orderCheckA_arr[arrayNum] == '00') {
				                    html +=  '          <a id="buttonA'+num+'" class="optionBtn" onClick="selectOptionChioceA(this, '+ num + ')";>'+OptionName[arrayNum]+'</a>';
				                } else {
				                    html +=  '          <a id="buttonA'+num+'" class="optionBtn soldout">'+OptionName[arrayNum]+'</a>';
				                }
				                html += ' <input type="hidden" name="" id="A'+ num + '"  value="'+OptionName[arrayNum]+'"/>';
				                html +=  '          </li>';
				            } else {
				                html +=  '          <li><a id="buttonA'+num+'" class="optionBtn" onClick="selectOptionChioceA(this, '+ num + ')";>'+OptionName[arrayNum]+'</a>';
				                html += ' <input type="hidden" name="" id="A'+ num + '"  value="'+OptionName[arrayNum]+'"/></li>';
				            }
				            num++
				        }
				        html +=  '    </ul>';
				        html +=  '</div>';
				    } else {
				        html += '<div class="goodsview_Sty2">';
				        html += '    <div class="option_list_zone">';
				        html += '        <div class="select_box" id="selectBoxA" onclick="optionLists(event);"><h2>옵션을 선택해 주세요.</h2></div>    ';
				        html += '    </div>';
				        html += '    <div class="select_list" id="selectListA" style="display:none">';
				        html += '        <ul>';
				        for (var goodsdtCode in goodsdtList.goodsdtList) {
				            optionA_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameA);
				            if(lastYnA) {
				                orderableA_arr.push(goodsdtList.goodsdtList[goodsdtCode].briefOrderAbleCnt);
				                orderCheckA_arr.push(goodsdtList.goodsdtList[goodsdtCode].saleGb);
				            }
				        }
				        OptionName = _distinctOpt(optionA_arr);
				        for (var arrayNum  in OptionName) {
				            if(lastYnA) {
				                if(orderableA_arr[arrayNum] > 0 && orderCheckA_arr[arrayNum] == '00') {
				                    html += ' <li onClick="selectOptionChioceA(this, '+ num + ')";>'+OptionName[arrayNum]+'</li>';
				                } else {
				                    html += ' <li onClick="soldOut()";><font color="#777777">'+OptionName[arrayNum]+' (품절)</font></li>';
				                }
				                html += ' <input type="hidden" name="" id="A'+ num + '"  value="'+OptionName[arrayNum]+'"/>';
				            } else {
				                html += ' <li onClick="selectOptionChioceA(this, '+ num + ')";>'+OptionName[arrayNum]+'</li>';
				                html += ' <input type="hidden" name="" id="A'+ num + '"  value="'+OptionName[arrayNum]+'"/>';
				            }
				            num++
				        }
				        html += '        </ul>';
				        html += '    </div>';
				        html += '</div>';
				    }

				    return html;
				}

				var _makeOptionListImageA = function(){
				    var html = '';
				    var goodsdtList = hnsOptionLayer.goodsdtList;
				    var optionA_arr = [];
				    var optionAimg_arr = [];
				    var orderableA_arr = [];
				    var orderCheckA_arr = [];
				    var optionB_arr = [];
				    var OptionName = [];
				    var OptionImage = [];
				    var num = Number(0);
				    html += ' <div class="goodsview_Sty1">';
				    html += '   <table cellpadding="0" cellspacing="0" class="imgStyBox">';
				    html += '      <tbody>';
				    for (var goodsdtCode in goodsdtList.goodsdtList) {
				        optionA_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameA);
				        optionAimg_arr.push(goodsdtList.goodsdtList[goodsdtCode].imageUrl);
				        if(lastYnA) {
				            orderableA_arr.push(goodsdtList.goodsdtList[goodsdtCode].briefOrderAbleCnt);
				            orderCheckA_arr.push(goodsdtList.goodsdtList[goodsdtCode].saleGb);
				        }
				    }
				    OptionName = _distinctOpt(optionA_arr);
				    OptionImage = _distinctOptImage(optionAimg_arr);
				    var i = 0;
				    var j = OptionName.length;
				    html += '         <tr>';
				    for (var arrayNum  in OptionName) {
				        if(lastYnA) {
				            if(orderableA_arr[arrayNum] > 0  && orderCheckA_arr[arrayNum] == '00') {
				                html += '            <td><div class="boxline">';
				                html += '              <em></em>';
				                html += '              <div id="imgA'+num+'" class="imgStyinfor" onClick="selectOptionChioceA(this, '+ num + ')";>';
				            } else {
				                html += '            <td class="soldout"><div class="boxline">';
				                html += '              <em></em>';
				                html += '              <div id="imgA'+num+'" class="imgStyinfor">';
				            }
				            html += '                 <p class="img"><img src="' + js_v_static_Gimg_path + '/goodsdt/'+OptionImage[arrayNum]+'" alt=""></p>';
				            html += '                 <p class="goodsTit">'+OptionName[arrayNum]+'</p>';
				            html += '                 <input type="hidden" name="" id="A'+ num + '"  value="'+OptionName[arrayNum]+'"/>';
				            html += '              </div>';
				            html += '            </div></td>';
				        } else {
				            html += '            <td><div class="boxline">';
				            html += '              <em></em>';
				            html += '              <div id="imgA'+num+'" class="imgStyinfor" onClick="selectOptionChioceA(this, '+ num + ')";>';
				            html += '                 <p class="img"><img src="' + js_v_static_Gimg_path + '/goodsdt/'+OptionImage[arrayNum]+'" alt=""></p>';
				            //html += '                 <p class="img"><img src="http://devimage.hnsmall.com/images/goodsdt/'+OptionImage[arrayNum]+'" alt=""></p>';
				            html += '                 <p class="goodsTit">'+OptionName[arrayNum]+'</p>';
				            html += '                 <input type="hidden" name="" id="A'+ num + '"  value="'+OptionName[arrayNum]+'"/>';
				            html += '              </div>';
				            html += '            </div></td>';
				        }
				        num++;
				        i++;
				        if(i%3 == 0) {
				            html += '         </tr>';
				            if(j!= i) {
				                html += '         <tr>';
				            }
				        }
				    }
				    if(i%3 == 1) {
				        html += ' <td></td><td></td> </tr>';
				    } else if(i%3 == 2) {
				        html += '  <td></td> </tr>';
				    }
				    html += '      </tbody>';
				    html += '   </table>';
				    html += ' </div>';

				    return html;
				}

				var _makeOptionListB = function(bnum){
				    var html = '';
				    var goodsdtList = hnsOptionLayer.goodsdtList;
				    var optionA_arr = [];
				    var optionB_arr = [];
				    var OptionName = [];
				    var OptionBName = [];
				    var num = Number(0);
				    if(bnum == 0){
				        if(hnsOptionLayer.goodsdtList.optionNameBCheck == '0') {
				            html += '<div class="goodsview_Sty3">';
				            if(hnsOptionLayer.goodsdtList.optNameBCheck == '1') {
				                html +=  '    <ul class="btn_2num">';
				            } else {
				                html +=  '    <ul class="btn_3num">';
				            }
				            for (var goodsdtCode in goodsdtList.goodsdtList) {
				                optionB_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameB);
				            }
				            OptionBName = _distinctOpt(optionB_arr);
				            for (var arrayNum  in OptionBName) {
				                html +=  '          <li><a id="buttonB'+num+'" class="optionBtn" onClick="selectOptionChioceB(this, '+ num + ')";>'+OptionBName[arrayNum]+'</a>';
				                html += ' <input type="hidden" name="" id="B'+ num + '"  value="'+OptionBName[arrayNum]+'"/></li>';
				                num++
				            }
				            html +=  '    </ul>';
				            html +=  '</div>';
				        } else {
				            html += '<div class="goodsview_Sty2">';
				            html += '    <div class="option_list_zone">';
				            html += '        <div class="select_box" id="selectBoxB" onclick="optionLists(event);"><h2>옵션을 선택해 주세요.</h2></div>    ';
				            html += '    </div>';
				            html += '    <div class="select_list" id="selectListB" style="display:none">';
				            html += '        <ul>';
				            for (var goodsdtCode in goodsdtList.goodsdtList) {
				                optionB_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameB);
				            }
				            OptionBName = _distinctOpt(optionB_arr);
				            for (var arrayNum  in OptionBName) {
				                html += ' <li onClick="selectOptionChioceB(this,'+ num + ')";>'+OptionBName[arrayNum]+'</li>';
				                html += ' <input type="hidden" name="" id="B'+ num + '"  value="'+OptionBName[arrayNum]+'"/>';
				                num++
				            }
				            html += '        </ul>';
				            html += '    </div>';
				            html += '</div>';
				        }
				    } else {
				        if(hnsOptionLayer.goodsdtList.optionNameBCheck == '0') {
				            html += '<div class="goodsview_Sty3">';
				            if(hnsOptionLayer.goodsdtList.optNameBCheck == '1') {
				                html +=  '    <ul class="btn_2num">';
				            } else {
				                html +=  '    <ul class="btn_3num">';
				            }
				            OptionBName = _selectOptionA(selectAoption);
				            for (var goodsdtCode in goodsdtList.goodsdtList) {
				                optionB_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameB);
				            }
				            for (var arrayNum  in OptionBName) {
				                if(lastYnB) {
				                    html +=  '          <li>';
				                    if(lastOpt[arrayNum] > 0 && lastOpt2[arrayNum] == '00') {
				                        html +=  '          <a id="buttonB'+num+'" class="optionBtn" onClick="selectOptionChioceB(this, '+ num + ')";>'+OptionBName[arrayNum]+'</a>';
				                    }else {
				                        html +=  '          <a id="buttonB'+num+'" class="optionBtn soldout">'+OptionBName[arrayNum]+'</a>';
				                    }
				                    html += ' <input type="hidden" name="" id="B'+ num + '"  value="'+OptionBName[arrayNum]+'"/>';
				                    html +=  '          </li>';
				                }else {
				                    html +=  '          <li><a id="buttonB'+num+'" class="optionBtn" onClick="selectOptionChioceB(this, '+ num + ')";>'+OptionBName[arrayNum]+'</a>';
				                    html += ' <input type="hidden" name="" id="B'+ num + '"  value="'+OptionBName[arrayNum]+'"/></li>';
				                }
				                num++
				            }
				            lastOpt = [];
				            lastOpt2 = [];
				            html +=  '    </ul>';
				            html +=  '</div>';
				        } else {
				            html += '<div class="goodsview_Sty2">';
				            html += '    <div class="option_list_zone">';
				            html += '        <div class="select_box" id="selectBoxB" onclick="optionLists(event);"><h2>옵션을 선택해 주세요.</h2></div>    ';
				            html += '    </div>';
				            html += '    <div class="select_list" id="selectListB" style="display:none">';
				            html += '        <ul>';
				            for (var goodsdtCode in goodsdtList.goodsdtList) {
				                optionB_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameB);
				            }
				            OptionBName = _selectOptionA(selectAoption);
				            for (var arrayNum  in OptionBName) {
				                if(lastYnB) {
				                    if(lastOpt[arrayNum] > 0 && lastOpt2[arrayNum] == '00') {
				                        html += ' <li onClick="selectOptionChioceB(this,'+ num + ')";>'+OptionBName[arrayNum]+'</li>';
				                    } else {
				                        html += ' <li onClick="soldOut()";><font color="#777777">'+OptionBName[arrayNum]+' (품절)</font></li>';
				                    }
				                    html += ' <input type="hidden" name="" id="B'+ num + '"  value="'+OptionBName[arrayNum]+'"/>';
				                } else {
				                    html += ' <li onClick="selectOptionChioceB(this,'+ num + ')";>'+OptionBName[arrayNum]+'</li>';
				                    html += ' <input type="hidden" name="" id="B'+ num + '"  value="'+OptionBName[arrayNum]+'"/>';
				                }
				                num++
				            }
				            lastOpt = [];
				            lastOpt2 = [];
				            html += '        </ul>';
				            html += '    </div>';
				            html += '</div>';
				        }
				    }

				    return html;
				}
				var _makeOptionListC = function(cnum){
				    var html = '';
				    var goodsdtList = hnsOptionLayer.goodsdtList;
				    var optionA_arr = [];
				    var optionB_arr = [];
				    var optionC_arr = [];
				    var OptionName = [];
				    var OptionBName = [];
				    var OptionCName = [];
				    var num = Number(0);
				    if(cnum == 0){
				        if(hnsOptionLayer.goodsdtList.optionNameCCheck == '0') {
				            html += '<div class="goodsview_Sty3">';
				            if(hnsOptionLayer.goodsdtList.optNameCCheck == '1') {
				                html +=  '    <ul class="btn_2num">';
				            } else {
				                html +=  '    <ul class="btn_3num">';
				            }
				            for (var goodsdtCode in goodsdtList.goodsdtList) {
				                //if(num == 0) {
				                    optionC_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameC);
				                //}
				            }
				            OptionCName = _distinctOpt(optionC_arr);
				            for (var arrayNum  in OptionCName) {
				                html +=  '          <li><a id="buttonC'+num+'" class="optionBtn" onClick="selectOptionChioceC(this, '+ num + ')";>'+OptionCName[arrayNum]+'</a>';
				                html += ' <input type="hidden" name="" id="C'+ num + '"  value="'+OptionCName[arrayNum]+'"/></li>';
				                num++
				            }
				            html +=  '    </ul>';
				            html +=  '</div>';
				        } else {
				            html += '<div class="goodsview_Sty2">';
				            html += '    <div class="option_list_zone">';
				            html += '        <div class="select_box" id="selectBoxC" onclick="optionLists(event);"><h2>옵션을 선택해 주세요.</h2></div>    ';
				            html += '    </div>';
				            html += '    <div class="select_list" id="selectListC" style="display:none">';
				            html += '        <ul>';
				            for (var goodsdtCode in goodsdtList.goodsdtList) {
				                optionC_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameC);
				            }
				            OptionCName = _distinctOpt(optionC_arr);
				            for (var arrayNum  in OptionCName) {
				                html += ' <li onClick="selectOptionChioceC(this,'+ num + ')";>'+OptionCName[arrayNum]+'</li>';
				                html += ' <input type="hidden" name="" id="C'+ num + '"  value="'+OptionCName[arrayNum]+'"/>';
				                num++
				            }
				            html += '        </ul>';
				            html += '    </div>';
				            html += '</div>';
				        }
				    } else {
				        if(hnsOptionLayer.goodsdtList.optionNameCCheck == '0') {
				            html += '<div class="goodsview_Sty3">';
				            if(hnsOptionLayer.goodsdtList.optNameCCheck == '1') {
				                html +=  '    <ul class="btn_2num">';
				            } else {
				                html +=  '    <ul class="btn_3num">';
				            }
				            OptionCName = _selectOptionB(selectBoption);
				            for (var goodsdtCode in goodsdtList.goodsdtList) {
				                optionC_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameC);
				            }
				            for (var arrayNum  in OptionCName) {
				                if(lastYnC) {
				                    html +=  '          <li>';
				                    if(lastOpt[arrayNum] > 0 && lastOpt2[arrayNum] == '00') {
				                        html +=  '          <a id="buttonC'+num+'" class="optionBtn" onClick="selectOptionChioceC(this, '+ num + ')";>'+OptionCName[arrayNum]+'</a>';
				                    } else {
				                        html +=  '          <a id="buttonC'+num+'" class="optionBtn soldout">'+OptionCName[arrayNum]+'</a>';
				                    }
				                    html += ' <input type="hidden" name="" id="C'+ num + '"  value="'+OptionCName[arrayNum]+'"/>';
				                    html +=  '          </li>';
				                } else {
				                    html +=  '          <li><a id="buttonC'+num+'" class="optionBtn" onClick="selectOptionChioceC(this, '+ num + ')";>'+OptionCName[arrayNum]+'</a>';
				                    html += ' <input type="hidden" name="" id="C'+ num + '"  value="'+OptionCName[arrayNum]+'"/></li>';
				                }
				                num++
				            }
				            lastOpt = [];
				            lastOpt2 = [];
				            html +=  '    </ul>';
				            html +=  '</div>';
				        } else {
				            html += '<div class="goodsview_Sty2">';
				            html += '    <div class="option_list_zone">';
				            html += '        <div class="select_box" id="selectBoxC" onclick="optionLists(event);"><h2>옵션을 선택해 주세요.</h2></div>    ';
				            html += '    </div>';
				            html += '    <div class="select_list" id="selectListC" style="display:none">';
				            html += '        <ul>';
				            for (var goodsdtCode in goodsdtList.goodsdtList) {
				                optionC_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameC);
				            }
				            OptionCName = _selectOptionB(selectBoption);
				            for (var arrayNum  in OptionCName) {
				                if(lastYnC) {
				                    if(lastOpt[arrayNum] > 0 && lastOpt2[arrayNum] == '00') {
				                        html += ' <li onClick="selectOptionChioceC(this,'+ num + ')";>'+OptionCName[arrayNum]+'</li>';
				                    } else {
				                        html += ' <li onClick="soldOut()";><font color="#777777">'+OptionCName[arrayNum]+' (품절)</font></li>';
				                    }
				                    html += ' <input type="hidden" name="" id="C'+ num + '"  value="'+OptionCName[arrayNum]+'"/>';
				                } else {
				                    html += ' <li onClick="selectOptionChioceC(this,'+ num + ')";>'+OptionCName[arrayNum]+'</li>';
				                    html += ' <input type="hidden" name="" id="C'+ num + '"  value="'+OptionCName[arrayNum]+'"/>';
				                }
				                num++
				            }
				            lastOpt = [];
				            lastOpt2 = [];
				            html += '        </ul>';
				            html += '    </div>';
				            html += '</div>';
				        }
				    }

				    return html;
				}

				var _makeOptionListD = function(dnum){
				    var html = '';
				    var goodsdtList = hnsOptionLayer.goodsdtList;
				    var optionA_arr = [];
				    var optionB_arr = [];
				    var optionC_arr = [];
				    var optionD_arr = [];
				    var OptionName = [];
				    var OptionBName = [];
				    var OptionCName = [];
				    var OptionDName = [];
				    var num = Number(0);
				    if(dnum == 0){
				        if(hnsOptionLayer.goodsdtList.optionNameDCheck == '0') {
				            html += '<div class="goodsview_Sty3">';
				            if(hnsOptionLayer.goodsdtList.optNameDCheck == '1') {
				                html +=  '    <ul class="btn_2num">';
				            } else {
				                html +=  '    <ul class="btn_3num">';
				            }
				            for (var goodsdtCode in goodsdtList.goodsdtList) {
				                //if(num == 0) {
				                    optionD_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameD);
				                //}
				            }
				            OptionDName = _distinctOpt(optionD_arr);
				            for (var arrayNum  in OptionDName) {
				                html +=  '          <li><a id="buttonD'+num+'" class="optionBtn" onClick="selectOptionChioceD(this, '+ num + ')";>'+OptionDName[arrayNum]+'</a>';
				                html += ' <input type="hidden" name="" id="D'+ num + '"  value="'+OptionDName[arrayNum]+'"/></li>';
				                num++
				            }
				            html +=  '    </ul>';
				            html +=  '</div>';
				        } else {
				            html += '<div class="goodsview_Sty2">';
				            html += '    <div class="option_list_zone">';
				            html += '        <div class="select_box" id="selectBoxD" onclick="optionLists(event);"><h2>옵션을 선택해 주세요.</h2></div>    ';
				            html += '    </div>';
				            html += '    <div class="select_list" id="selectListD" style="display:none">';
				            html += '        <ul>';
				            for (var goodsdtCode in goodsdtList.goodsdtList) {
				                optionD_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameD);
				            }
				            OptionDName = _distinctOpt(optionD_arr);
				            for (var arrayNum  in OptionDName) {
				                html += ' <li onClick="selectOptionChioceD(this,'+ num + ')";>'+OptionDName[arrayNum]+'</li>';
				                html += ' <input type="hidden" name="" id="D'+ num + '"  value="'+OptionDName[arrayNum]+'"/>';
				                num++
				            }
				            html += '        </ul>';
				            html += '    </div>';
				            html += '</div>';
				        }
				    } else {
				        if(hnsOptionLayer.goodsdtList.optionNameDCheck == '0') {
				            html += '<div class="goodsview_Sty3">';
				            if(hnsOptionLayer.goodsdtList.optNameDCheck == '1') {
				                html +=  '    <ul class="btn_2num">';
				            } else {
				                html +=  '    <ul class="btn_3num">';
				            }
				            OptionDName = _selectOptionC(selectCoption);
				            for (var goodsdtCode in goodsdtList.goodsdtList) {
				                optionD_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameD);
				            }
				            for (var arrayNum  in OptionDName) {
				                if(lastYnD) {
				                html +=  '          <li>';
				                    if(lastOpt[arrayNum] > 0 && lastOpt2[arrayNum] == '00') {
				                        html +=  '          <a id="buttonD'+num+'" class="optionBtn" onClick="selectOptionChioceD(this, '+ num + ')";>'+OptionDName[arrayNum]+'</a>';
				                    } else {
				                        html +=  '          <a id="buttonD'+num+'" class="optionBtn soldout">'+OptionDName[arrayNum]+'</a>';
				                    }
				                    html += ' <input type="hidden" name="" id="D'+ num + '"  value="'+OptionDName[arrayNum]+'"/>';
				                html +=  '          </li>';
				                } else {
				                    html +=  '          <li><a id="buttonD'+num+'" class="optionBtn" onClick="selectOptionChioceD(this, '+ num + ')";>'+OptionDName[arrayNum]+'</a>';
				                    html += ' <input type="hidden" name="" id="D'+ num + '"  value="'+OptionDName[arrayNum]+'"/></li>';
				                }
				                num++
				            }
				            lastOpt = [];
				            lastOpt2 = [];
				            html +=  '    </ul>';
				            html +=  '</div>';
				        } else {
				            html += '<div class="goodsview_Sty2">';
				            html += '    <div class="option_list_zone">';
				            html += '        <div class="select_box" id="selectBoxD" onclick="optionLists(event);"><h2>옵션을 선택해 주세요.</h2></div>    ';
				            html += '    </div>';
				            html += '    <div class="select_list" id="selectListD" style="display:none">';
				            html += '        <ul>';
				            for (var goodsdtCode in goodsdtList.goodsdtList) {
				                optionD_arr.push(goodsdtList.goodsdtList[goodsdtCode].optionNameD);
				            }
				            OptionDName = _selectOptionC(selectCoption);
				            for (var arrayNum  in OptionDName) {
				                if(lastYnD) {
				                    if(lastOpt[arrayNum] > 0 && lastOpt2[arrayNum] == '00') {
				                        html += ' <li onClick="selectOptionChioceD(this,'+ num + ')";>'+OptionDName[arrayNum]+'</li>';
				                    } else {
				                        html += ' <li onClick="soldOut()";><font color="#777777">'+OptionDName[arrayNum]+' (품절)</font></li>';
				                    }
				                    html += ' <input type="hidden" name="" id="D'+ num + '"  value="'+OptionDName[arrayNum]+'"/>';
				                } else {
				                    html += ' <li onClick="selectOptionChioceD(this,'+ num + ')";>'+OptionDName[arrayNum]+'</li>';
				                    html += ' <input type="hidden" name="" id="D'+ num + '"  value="'+OptionDName[arrayNum]+'"/>';
				                }
				                num++
				            }
				            lastOpt = [];
				            lastOpt2 = [];
				            html += '        </ul>';
				            html += '    </div>';
				            html += '</div>';
				        }
				    }

				    return html;
				}

				var _optionLists = function(event){
				    var element = $(event.target)
				      , isLastSelect = false;

				    if (element.parent().hasClass('over')) {
				        element.parent().removeClass('over');
				        element.parent().parent().next().hide();
				    }
				    else {
				        element.parent().addClass('over');
				        element.parent().parent().next().show();
				    }
				    MAIN_OPTION_LAYER_SCROLL.resize();
				}

				var _distinctOpt = function (options){
				    var tempOptionArr = options
				          , insertTag = []
				          , insertYn = true;

				        for (var tepmOptionIndex in tempOptionArr) {
				            insertYn = true;

				            for (var insertOptionIndex in insertTag) {
				                if (tempOptionArr[tepmOptionIndex] == insertTag[insertOptionIndex]) { insertYn = false; break; }
				            }

				            if (insertYn) { insertTag.push(tempOptionArr[tepmOptionIndex]); }
				        }

				        return insertTag;

				}

				var optImage = [];
				var _distinctOptImage = function(options){
				    var tempOptionArr = options
				          , insertTag = []
				          , insertYn = true;

				        for (var tepmOptionIndex in tempOptionArr) {
				            insertYn = true;

				            for (var insertOptionIndex in insertTag) {
				                if (tempOptionArr[tepmOptionIndex] == insertTag[insertOptionIndex]) { insertYn = false; break; }
				            }

				            if (insertYn) { insertTag.push(tempOptionArr[tepmOptionIndex]); }
				        }

				        return insertTag;

				}

				var lastOpt = [];
				var lastOpt2 = [];
				var _selectOptionA = function(options){
				    var goodsdtList = hnsOptionLayer.goodsdtList;
				    var tempOptionArr = options
				          , insertTag = []
				          , insertYn = true;

				        for (var goodsdtCode in goodsdtList.goodsdtList) {
				            insertYn = true;
				            if(options ==  goodsdtList.goodsdtList[goodsdtCode].optionNameA){
				                for(i=0; i < insertTag.length; i++){
				                    if(goodsdtList.goodsdtList[goodsdtCode].optionNameB == insertTag[i]) { insertYn = false; break; }
				                }
				                if (insertYn) {insertTag.push(goodsdtList.goodsdtList[goodsdtCode].optionNameB);
				                    if(lastYnB) {
				                        lastOpt.push(goodsdtList.goodsdtList[goodsdtCode].briefOrderAbleCnt);
				                        lastOpt2.push(goodsdtList.goodsdtList[goodsdtCode].saleGb);
				                    }
				                }
				            }
				        }

				        return insertTag;

				}

				var _selectOptionB = function(options){
				    var goodsdtList = hnsOptionLayer.goodsdtList;
				    var tempOptionArr = options
				          , insertTag = []
				          , insertYn = true;

				        for (var goodsdtCode in goodsdtList.goodsdtList) {
				            insertYn = true;
				            if(selOpt.optionName1 == goodsdtList.goodsdtList[goodsdtCode].optionNameA && options ==  goodsdtList.goodsdtList[goodsdtCode].optionNameB){
				                for(i=0; i < insertTag.length; i++){
				                    if(goodsdtList.goodsdtList[goodsdtCode].optionNameC == insertTag[i]) { insertYn = false; break; }
				                }
				                if (insertYn) {insertTag.push(goodsdtList.goodsdtList[goodsdtCode].optionNameC);
				                    if(lastYnC) {
				                        lastOpt.push(goodsdtList.goodsdtList[goodsdtCode].briefOrderAbleCnt);
				                        lastOpt2.push(goodsdtList.goodsdtList[goodsdtCode].saleGb);
				                    }
				                }
				            }
				        }

				        return insertTag;

				}

				var _selectOptionC = function(options){
				    var goodsdtList = hnsOptionLayer.goodsdtList;
				    var tempOptionArr = options
				          , insertTag = []
				          , insertYn = true;

				        for (var goodsdtCode in goodsdtList.goodsdtList) {
				            insertYn = true;
				            if(selOpt.optionName1 == goodsdtList.goodsdtList[goodsdtCode].optionNameA && selOpt.optionName2 == goodsdtList.goodsdtList[goodsdtCode].optionNameB && options ==  goodsdtList.goodsdtList[goodsdtCode].optionNameC){
				                for(i=0; i < insertTag.length; i++){
				                    if(goodsdtList.goodsdtList[goodsdtCode].optionNameD == insertTag[i]) { insertYn = false; break; }
				                }
				                if (insertYn) {insertTag.push(goodsdtList.goodsdtList[goodsdtCode].optionNameD);
				                    if(lastYnD) {
				                        lastOpt.push(goodsdtList.goodsdtList[goodsdtCode].briefOrderAbleCnt);
				                        lastOpt2.push(goodsdtList.goodsdtList[goodsdtCode].saleGb);
				                    }
				                }
				            }
				        }

				        return insertTag;

				}


				var optionList = [];
				var tempOption = [];
				var selectAoption = "";
				var selectBoption = "";
				var selectCoption = "";
				var selectDoption = "";
				var selOpt = {
				        optionName1: '',
				        optionName2: '',
				        optionName3: '',
				        optionName4: ''
				    };

				//var lastOpt = [];
				var _selectOptionChioceA = function(objTag, index){
				    var obj = $(objTag);
				    var element = $(event.target);
				    var goodsdtList = hnsOptionLayer.goodsdtList;
				    var eventTartget = '#A'+index;
				    var eventbtnTartget = '#buttonA'+index;
				    var eventimgTartget = '#imgA'+index;
				    var optionType = $(eventTartget).val();
				    lastYnB = _getLastYn('A');
				    if(hnsOptionLayer.goodsdtList.optionNameACheck == '1') {
				        if(hnsOptionLayer.goodsdtList.optionImageCheck == '1') {
				            if ($("#selectBoxA").hasClass('over')) {
				                $("#selectBoxA").html('<h2>'+optionType+'</h2>');
				                selectAoption = optionType;
				                $("#selectBoxA").removeClass('over');
				                $("#selectListA").hide();
				                _optionfinish(1);
				                $('.hns_size').html(_makeOptionListB(1));

				                if(hnsOptionLayer.goodsdtList.optionTitleC.trim().length != 0){
				                    $('.hns_pattern').html(_makeOptionListC(0));
				                }
				                if(hnsOptionLayer.goodsdtList.optionTitleD.trim().length != 0){
				                    $('.hns_form').html(_makeOptionListD(0));
				                }
				            }
				            else {
				                $("#selectBoxA").addClass('over');
				                $("#selectListA").show();
				            }
				        } else {
				            $(eventimgTartget).parent().parent().parent().parent().find('td').removeClass('on')
				            $(eventimgTartget).parent().parent().addClass('on');
				            selectAoption = optionType;
				            _optionfinish(1);
				            $('.hns_size').html(_makeOptionListB(1));

				            if(hnsOptionLayer.goodsdtList.optionTitleC.trim().length != 0){
				                $('.hns_pattern').html(_makeOptionListC(0));
				            }
				            if(hnsOptionLayer.goodsdtList.optionTitleD.trim().length != 0){
				                $('.hns_form').html(_makeOptionListD(0));
				            }
				        }
				    } else {
				        if(hnsOptionLayer.goodsdtList.optionImageCheck == '1') {
				            $(eventbtnTartget).parent().parent().find('em').remove();
				            $(eventbtnTartget).addClass('on').prepend('<em></em>');
				            $(eventbtnTartget).parent().siblings().find('a').removeClass('on').find('em').remove();
				            selectAoption = optionType;
				            _optionfinish(1);
				            $('.hns_size').html(_makeOptionListB(1));

				            if(hnsOptionLayer.goodsdtList.optionTitleC.trim().length != 0){
				                $('.hns_pattern').html(_makeOptionListC(0));
				            }
				            if(hnsOptionLayer.goodsdtList.optionTitleD.trim().length != 0){
				                $('.hns_form').html(_makeOptionListD(0));
				            }
				        } else {
				            $(eventimgTartget).parent().parent().parent().parent().find('td').removeClass('on')
				            $(eventimgTartget).parent().parent().addClass('on');
				            selectAoption = optionType;
				            _optionfinish(1);
				            $('.hns_size').html(_makeOptionListB(1));

				            if(hnsOptionLayer.goodsdtList.optionTitleC.trim().length != 0){
				                $('.hns_pattern').html(_makeOptionListC(0));
				            }
				            if(hnsOptionLayer.goodsdtList.optionTitleD.trim().length != 0){
				                $('.hns_form').html(_makeOptionListD(0));
				            }
				        }
				    }
				    if(!lastYnA) {
				        selGoodsdtCode = '';
				        $('#opGoods').attr('goodsdtcode','');
				        selOpt['optionName2'] = '';
				        selOpt['optionName3'] = '';
				        selOpt['optionName4'] = '';
				        if($('.hns_size').attr('style') == "display:none;") {
				            $('#sizeList').click();
				        }
				    }

				    MAIN_OPTION_LAYER_SCROLL.resize();
				}

				var _selectOptionChioceB = function(objTag, index){
				    if(selOpt['optionName1'] == '') {
				        alert('상위 옵션을 먼저 선택해주세요');
				        return;
				    }
				    var obj = $(objTag);
				    var element = $(event.target);
				    var goodsdtList = hnsOptionLayer.goodsdtList;
				    var eventTartget = '#B'+index;
				    var eventbtnTartget = '#buttonB'+index;
				    var optionType = $(eventTartget).val();
				    lastYnC = _getLastYn('B');
				    if(hnsOptionLayer.goodsdtList.optionNameBCheck == '1') {
				        if ($("#selectBoxB").hasClass('over')) {
				            $("#selectBoxB").html('<h2>'+optionType+'</h2>');
				            selectBoption = optionType;
				            $("#selectBoxB").removeClass('over');
				            $("#selectListB").hide();
				            _optionfinish(2);
				            $('.hns_pattern').html(_makeOptionListC(1));
				            if(hnsOptionLayer.goodsdtList.optionTitleD.trim().length != 0){
				                $('.hns_form').html(_makeOptionListD(0));
				            }
				        }
				        else {
				            $("#selectBoxB").addClass('over');
				            $("#selectListB").show();
				        }
				    } else {
				        $(eventbtnTartget).parent().parent().find('em').remove();
				        $(eventbtnTartget).addClass('on').prepend('<em></em>');
				        $(eventbtnTartget).parent().siblings().find('a').removeClass('on').find('em').remove();
				        selectBoption = optionType;
				        _optionfinish(2);
				        $('.hns_pattern').html(_makeOptionListC(1));

				        if(hnsOptionLayer.goodsdtList.optionTitleD.trim().length != 0){
				            $('.hns_form').html(_makeOptionListD(0));
				        }
				    }
				    if(!lastYnB) {
				        selGoodsdtCode = '';
				        $('#opGoods').attr('goodsdtcode','');
				        selOpt['optionName3'] = '';
				        selOpt['optionName4'] = '';
				        if($('.hns_pattern').attr('style') == "display:none;") {
				            $('#patternList').click();
				        }
				    }

				    MAIN_OPTION_LAYER_SCROLL.resize();
				}

				var _selectOptionChioceC = function (objTag, index){
				    if(selOpt['optionName2'] == '') {
				        alert('상위 옵션을 먼저 선택해주세요');
				        return;
				    }
				    var obj = $(objTag);
				    var element = $(event.target);
				    var goodsdtList = hnsOptionLayer.goodsdtList;
				    var eventTartget = '#C'+index;
				    var eventbtnTartget = '#buttonC'+index;
				    var optionType = $(eventTartget).val();
				    if(hnsOptionLayer.goodsdtList.optionNameCCheck == '1') {
				        if ($("#selectBoxC").hasClass('over')) {
				            $("#selectBoxC").html('<h2>'+optionType+'</h2>');
				            selectCoption = optionType;
				            $("#selectBoxC").removeClass('over');
				            $("#selectListC").hide();
				            _optionfinish(3);
				            $('.hns_form').html(_makeOptionListD(1));
				        }
				        else {
				            $("#selectBoxC").addClass('over');
				            $("#selectListC").show();
				        }
				    } else {
				        $(eventbtnTartget).parent().parent().find('em').remove();
				        $(eventbtnTartget).addClass('on').prepend('<em></em>');
				        $(eventbtnTartget).parent().siblings().find('a').removeClass('on').find('em').remove();
				        selectCoption = optionType;
				        _optionfinish(3);
				        $('.hns_form').html(_makeOptionListD(1));
				    }
				    if(!lastYnC) {
				        selGoodsdtCode = '';
				        $('#opGoods').attr('goodsdtcode','');
				        selOpt['optionName4'] = '';
				        if($('.hns_form').attr('style') == "display:none;") {
				            $('#formList').click();
				        }
				    }

				    MAIN_OPTION_LAYER_SCROLL.resize();
				}

				var _selectOptionChioceD = function(objTag, index){
				    if(selOpt['optionName3'] == '') {
				        alert('상위 옵션을 먼저 선택해주세요');
				        return;
				    }
				    var obj = $(objTag);
				    var element = $(event.target);
				    var goodsdtList = hnsOptionLayer.goodsdtList;
				    var eventTartget = '#D'+index;
				    var eventbtnTartget = '#buttonD'+index;
				    var optionType = $(eventTartget).val();
				    if(hnsOptionLayer.goodsdtList.optionNameDCheck == '1') {
				        if ($("#selectBoxD").hasClass('over')) {
				            $("#selectBoxD").html('<h2>'+optionType+'</h2>');
				            selectDoption = optionType;
				            $("#selectBoxD").removeClass('over');
				            $("#selectListD").hide();
				            _optionfinish(4);
				        }
				        else {
				            $("#selectBoxD").addClass('over');
				            $("#selectListD").show();
				        }
				    } else {
				        $(eventbtnTartget).parent().parent().find('em').remove();
				        $(eventbtnTartget).addClass('on').prepend('<em></em>');
				        $(eventbtnTartget).parent().siblings().find('a').removeClass('on').find('em').remove();
				        selectDoption = optionType;
				        _optionfinish(4);
				    }

				}

				var _optNmCheck = function(optNm1, optNm2) {
					//alert(optNm1+' / '+optNm2);
				 if (optNm1 == '' || (optNm1 != '' && optNm1 == replaceChars(optNm2))) return true;
				 else return false;
				};

				var _compareOptChk = function(obj, tmpObj, idx) {
				    var result = false;

				        if (idx >= 1) {
				            if (_optNmCheck(obj.optionName1,tmpObj.optionName1)) result = true;
				            else result = false;
				        }
				        if (idx >= 2) {
				            if (result == true && _optNmCheck(obj.optionName2,tmpObj.optionName2)) result = true;
				            else result = false;
				        }
				        if (idx >= 3) {
				            if (result == true && _optNmCheck(obj.optionName3,tmpObj.optionName3)) result = true;
				            else result = false;
				        }
				        if (idx >= 4) {
				            if (result == true && _optNmCheck(obj.optionName4,tmpObj.optionName4)) result = true;
				            else result = false;
				        }

				    return result;
				};

				//옵션 선행 체크
				var _optPreCheck = function(idx) {
				    var result = true;
				    $('.high_option select').each(function(i) {
				        if (idx > i) {
				            if ($(this).hasClass('on')){ result = true;
				            }else{
				                alert($(this).attr('titleName')+'을 선택해 주세요.');
				                result = false;
				                return false;
				            }
				        }
				    });
				    return result;
				};

				var selGoodsdtCode = '';
				var _optionfinish = function(i) {
				    if(i==1) {
				        selOpt['optionName' + (i)] = selectAoption;
				        selGoodsdtCode = _getGoodsdtCode('A');
				    } else if(i==2) {
				        selOpt['optionName' + (i)] = selectBoption;
				        selGoodsdtCode = _getGoodsdtCode('B');
				    } else if(i==3) {
				        selOpt['optionName' + (i)] = selectCoption;
				        selGoodsdtCode = _getGoodsdtCode('C');
				    } else if(i==4) {
				        selOpt['optionName' + (i)] = selectDoption;
				        selGoodsdtCode = _getGoodsdtCode('D');
				    }
				    if(selGoodsdtCode !=null) {
				        $('#opGoods').attr('goodsdtcode',selGoodsdtCode);
				        var goodsCode= $('#tvGoods').attr('goodscode');
				        $('#opGoods').attr('goodscode',goodsCode);
				    }
				}

				var _selOptCheck = function(options){
				    var tempOptionArr = options
				          , insertTag = []
				          , insertYn = true;

				        for (var tepmOptionIndex in tempOptionArr) {
				            insertYn = true;

				            for (var insertOptionIndex in insertTag) {
				                if (tempOptionArr[tepmOptionIndex] == insertTag[insertOptionIndex]) { insertYn = false; break; }
				            }

				            if (insertYn) { insertTag.push(tempOptionArr[tepmOptionIndex]); }
				        }

				        return insertTag;

				}

				var _getGoodsdtCode = function(position) {

				    var isLastSelect = false;
				    if (position == 'A' && hnsOptionLayer.goodsdtList.optionTitleB.trim().length == 0) { isLastSelect = true; }
				    else if (position == 'B' && hnsOptionLayer.goodsdtList.optionTitleC.trim().length == 0) { isLastSelect = true; }
				    else if (position == 'C' && hnsOptionLayer.goodsdtList.optionTitleD.trim().length == 0) { isLastSelect = true; }
				    else if (position == 'D') { isLastSelect = true; }
				    if (isLastSelect) {
				        for (var key in hnsOptionLayer.goodsdtList.goodsdtList) {
				            var goodsdt = hnsOptionLayer.goodsdtList.goodsdtList[key];

				            if (goodsdt.optionNameA == selOpt.optionName1
				             && goodsdt.optionNameB == selOpt.optionName2
				             && goodsdt.optionNameC == selOpt.optionName3
				             && goodsdt.optionNameD == selOpt.optionName4) {

				                return key;
				            }
				        }

				    }
				    return null;
				}

				var _getLastYn = function(position) {

				    var isNextSelect = false;
				    if (position == 'A' && hnsOptionLayer.goodsdtList.optionTitleB.trim().length != 0 && hnsOptionLayer.goodsdtList.optionTitleC.trim().length == 0) { isNextSelect = true; }
				    else if (position == 'B' && hnsOptionLayer.goodsdtList.optionTitleC.trim().length != 0 && hnsOptionLayer.goodsdtList.optionTitleD.trim().length == 0) { isNextSelect = true; }
				    else if (position == 'C' && hnsOptionLayer.goodsdtList.optionTitleD.trim().length != 0) { isNextSelect = true; }

				    return isNextSelect;
				}

				var _changeNums = function(obj){

				    var this1 = $(obj);

				    if(this1.text() == "-"){
				        var mnum = Number(this1.next().val());
				        if(mnum > 1 ){
				            this1.next().val(mnum-1);
				        }else{
				            alert("1개이상 선택하셔야합니다.");
				        }
				    }else if(this1.text() == "+"){
				        var mnum = Number(this1.prev().val());
				        this1.prev().val(mnum+1);
				    }
				    var qty = $('#orderCnt').val();
				    $('#opGoods').attr('orderQty',qty);

				}

				var _soldOut = function(){
				    alert("해당상품은 품절되었습니다. 다른 상품을 선택해  상품을 선택해 주시기 바랍니다.");
				}

				var _optionLayerClose = function(){
					$('.tvshop_option').slideUp();
					$('.tvshop_option').attr('goodscode', '');
					$('.tvshop_option').attr('goodsdtcode', '');
					$('.tvshop_option').attr('orderQty', '');
				}

				return {
					optionOpen : _optionOpen,
					optionLists : _optionLists,
					selectOptionChioceA : _selectOptionChioceA,
					selectOptionChioceB : _selectOptionChioceB,
					selectOptionChioceC : _selectOptionChioceC,
					compareOptChk : _compareOptChk,
					optPreCheck : _optPreCheck,
					selOptCheck : _selOptCheck,
					changeNums : _changeNums,
					soldOut : _soldOut,
					optionLayerClose : _optionLayerClose
				}
			}

        },
        // 2019-03-18 TV편성표 개선
        tvschedule: {//2019-04-10 편성표 키값 수정
            schedule: function(){
                var ScheduleModule = function(){
                	this.daysWrapper = '.tvScheduleWrap > .scheduleNavi';
                    this.previewWrapper = '.scheduleArea > .scheduleRight';
                    
                    this.offsetTop = []; // 각 리스트의 offset top값 새로운 리스트 불러올시 갱신해줘야 함
                    this.daySwipe; // 날짜 스와이프에 대한 인스턴스
                    this.tvSwipe; // 편성표 미리보기 스와이프에 대한 인스턴스
                    this.dayChk; // 활성화된 요일
                    this.idxChk; // 활성화된 상품에 대한 index값
                    this.viewLength; // 뿌려진 상품 전체 갯수
                    this.timeout; // setTime 변수
                    this.ing; // 스크롤시 이중 실행을 막기위한 변수
                    this.channel = true; // 원채널, 투채널 구분자
                    this.dayCurrentIdx; // 활성화된 날짜 index
                    this.que = true; // default값 설정을위한 boolean
                    this.viewNum;
                    
                };
                ScheduleModule.prototype._reInit = function(){
                	var that = this;
                	this.reInit = true;
                	this.viewLength = 0;
                	this.viewNum = $(this.previewWrapper).find('.schedulePreview li.active').index();
                	this.offsetTop = [];
                	this.debounce(function() {
                		that._init();
                		that.HandleOffsetTop(that.viewNum, true)
                	})
                };
                ScheduleModule.prototype._init = function(){
                    var that = this,
                        $tvSchedule = $('.swipe-tvschedule .tvScheduleWrap');//2019-04-10 편성표 키값 수정
                    if($tvSchedule.size()<=0) return false; 
                    var paddingTop = $tvSchedule.offset().top - parseInt($('.swipe-tvschedule').css('padding-top'));
                    $tvSchedule.css('height', window.innerHeight - paddingTop);

                    if(!this.reInit) {
                    	// 편성표 썸네일 스와이프 실행
                    	this.scheduleSwiper();
                    	// 요일 스와이프, true 1채널, false 2채널
                    	this.daysSwiper(that.channel);
                    } else {
                		that.tvSwipe.onResize();
                		that.daySwipe.onResize();
                    }

                    var scrolling = $('.scheduleArea .scheduleLeft').on('scroll', function(e){
                        e.stopPropagation();
                        var scrollTop = $(this).scrollTop();
                        that.debounce(function(){
                            var viewNum;
                            var currentFlag = that.offsetTop.map(function(flag, idx){
                                if( flag <= scrollTop ){
                                    return idx;
                                }
                            });
                            for (var i = 0; i < currentFlag.length; i++) {
                                if( typeof(currentFlag[i]) == 'number' ){
                                    viewNum = i;
                                }
                            }
                            for (var ii = 0; ii < that.setChannelDay(that.channel).length; ii++) {
                                if( that.setChannelDay(that.channel)[ii] == Number($('.scheduleList li').eq(viewNum).attr('data-item'))) that.dayChk = ii;
                            }
                            typeof(viewNum) == 'undefined' ? that.HandleOffsetTop(that.viewNum, true)
                            : that.HandleOffsetTop(viewNum, true);
                        }, 100 );
                    }); 
                    
                };
                ScheduleModule.prototype.daysSwiper = function(channel){
                    this.channel = channel;

                    var that = this,
                        today = new Date(),
                        week = ['일', '월', '화', '수', '목', '금', '토'],
                        dayTemplate = [],
                        setDate = new Date(),
                        initial;
                    
                    channel ? setDate.setDate(today.getDate() - 10) : setDate.setDate(today.getDate() - 18);
                    var firstDay =  setDate.getDay();
                    	/*if(channel){//1채널일경우 이전 첫번째 요일 구하기
                    		if(today.getDay()<=3){
    	                    	firstDay=today.getDay()+4;
    	                 	}else{
    	                 		firstDay=today.getDay()-3;
    	                 	};
                    	}else{//2채널일경우 이전 첫번째 요일 구하기
                    		if(today.getDay()<=3){
    	                    	firstDay=today.getDay()+3;
    	                 	}else{
    	                 		firstDay=today.getDay()-4;
    	                 	};
                    	}*/
                    var weekSet = that.setChannelDay(channel).map(function(weekFlow){
                        if( firstDay >= week.length  ) firstDay = 0;
        
                        weekFlow = week[firstDay];
                        firstDay += 1;
                        return weekFlow;
                    });
                    
                    var templaetSet = function(){
                        if( today.getDate() == that.setChannelDay(channel)[i] ) {
                            initial = i;
                            return '<li class="swiper-slide today active"><button type="button">'
                            + '<span class="day">'+ that.setChannelDay(channel)[i] +'</span>'
                            + '<div class="week">오늘</div>'
                            + '</button></li>'
                        }else{
                            return '<li class="swiper-slide"><button type="button">'
                            + '<span class="day">'+ that.setChannelDay(channel)[i] +'</span>'
                            + '<div class="week">'+ weekSet[i] +'</div>'
                            + '</button></li>'
                        }
                    }
                    for (var i = 0; i < weekSet.length; i++) {
                        dayTemplate.push(templaetSet());
                    }
                    $('.scheduleNavi .swiper-wrapper').html(dayTemplate);
                    //////////////////////////////////////////// 날짜 뿌리기
                    
                    // 편성표 위치 정의
                    var goToTop = function(currentDay, swiper){
                        for (var i = 0; i < $('.scheduleList li').length; i++) {
                            if( Number($('.scheduleList li').eq(i).attr('data-item')) == currentDay ){
                                // swiper active 제어
                                if( typeof(swiper) !== undefined ){
                                    for (var ii = 0; ii < that.setChannelDay(channel).length; ii++) {
                                        if( that.setChannelDay(channel)[ii] == currentDay) that.dayChk = ii;
                                    }
                                }
                                that.HandleOffsetTop(i, false);
                                return;
                            }
                        }
                    };
                    var config = {
                        slidesPerView: 'auto',
                        longSwipes: true,
                        speed: 100,
                        initialSlide: channel ? initial - 1 : initial - 7,
                        observer: true,
                        observeParents: false,
                        
                        onInit: function(swiper){
                            that.dayCurrentIdx = initial;
                            var idxMove = function(direction){
                                if(direction == 'prev'){
                                    that.dayCurrentIdx == 0 ? that.dayCurrentIdx = 0 : that.dayCurrentIdx -= 1;
                                }else if(direction == 'next'){
                                    that.dayCurrentIdx == $(that.daysWrapper).find('li').length - 1 ? that.dayCurrentIdx = $(that.daysWrapper).find('li').length - 1
                                    : that.dayCurrentIdx += 1;
                                }
                                goToTop(that.setChannelDay(channel)[that.dayCurrentIdx], swiper);
                            };

                            $(that.daysWrapper).find('.controls > .btn_prev').on('click', function(){
                                idxMove('prev');
                            });
                            $(that.daysWrapper).find('.controls > .btn_next').on('click', function(){
                                idxMove('next');
                            });
                            
                            goToTop(that.setChannelDay(channel)[initial], swiper);
                        },
                        onClick: function(swiper){
                            goToTop(that.setChannelDay(channel)[swiper.clickedIndex], swiper);
                        }
                    };
                    
                    this.daySwipe = new Swiper( that.daysWrapper, config);
                };
                ScheduleModule.prototype.HandleOffsetTop = function(targetIdx, scrolling){
                    var $scheduleArea = $('.scheduleArea .scheduleLeft'),
                        $scheduleList = $scheduleArea.find('.scheduleList li'),
                        that = this;
                    
                    var goToIdx = function(target, idx){
                        if(target == that.daySwipe) that.dayCurrentIdx = idx;
                        var exIdx;
                        if( that.channel && target == that.daySwipe ){ exIdx = idx - 1
                        }else if(target == that.daySwipe) exIdx = idx - 5
                        
                        target.slideTo( target == that.daySwipe ? exIdx : idx);
                        $(target.slides[idx])
                        .addClass('active')
                        .siblings().removeClass('active');
                        $scheduleList.eq(idx)
                        .addClass('active')
                        .siblings().removeClass('active');
                    };
                    
                    // tv편성표 offsetTop push
                    if( this.viewLength !== $scheduleList.length){alert('HandleOffsetTop'+scrolling)
                    	$scheduleArea.scrollTop(0);
                        for (var i = 0; i < $scheduleList.length; i++) {
                            this.offsetTop.push($scheduleList.eq(i).offset().top - $scheduleArea.offset().top);
                        }
                        if(this.reInit) {
                        	$scheduleArea.scrollTop(this.offsetTop[this.viewNum]);
                        	goToIdx(this.tvSwipe, this.viewNum);
                        }
                        this.viewLength = $scheduleList.length;
                    }

                    var currentFlag = this.offsetTop.map(function(flag, idx){
                        if( targetIdx == idx ){
                            return flag;
                        }
                    });

                    for (var i = 0; i < currentFlag.length; i++) {
                        if( typeof(currentFlag[i]) == 'number' ){

                            if( !scrolling ){
                                $($scheduleArea).stop().animate({
                                    scrollTop: currentFlag[i] 
                                }, '100', function(){
                                    this.ing = true;
                                });
                            }else this.ing = false;

                            if( !scrolling && !this.ing ) return;

                            var that = this;
                            goToIdx(that.tvSwipe, i);
                            this.idxChk = i;

                            if(!this.que) {
                                goToIdx(this.daySwipe, this.dayChk);
                            }else{
                                this.que = false;
                                this.dayChk = new Date().getDate();
                            }
                        }
                    }
                }
                ScheduleModule.prototype.scheduleSwiper = function(){
                    var that = this;
                    
                    var config = {
                        direction: 'vertical',
                        slidesPerView: 'auto',
                        longSwipes: true,
                        speed: 100,
                        observer: true,
                        observeParents: false,
                        onClick: function(swiper){
                            that.HandleOffsetTop(swiper.clickedIndex, false);
                            // swiper active 제어
                            if( typeof(swiper) !== undefined ){
                                $(swiper.slides[swiper.clickedIndex])
                                .addClass('active')
                                .siblings().removeClass('active');
                            }
                        }
                    };
                    this.tvSwipe = new Swiper( that.previewWrapper, config );
                };
                ScheduleModule.prototype.debounce = function(func, wait){
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(func, wait);
                };
                ScheduleModule.prototype.setChannelDay = function(channel){
                    var today = new Date(),
                        dayNumber = [],
                        channelFirst = channel ? today.getDate() - 10 : today.getDate() - 18;

                    var monthLastDay = function(year, month){
                        var newDt = new Date();
                        newDt.setYear(year); 
                        newDt.setMonth(month);
                        newDt.setDate(0);

                        return newDt.getDate();
                    }

                    // 현재 날짜 기준 채널별 요일구함
                    for (var i = channelFirst; i <= channelFirst + 20; i++) {
                        if( i <= 0 ){
                            today.getMonth() == 0 ? dayNumber.push(monthLastDay(today.getFullYear(), 0) + i)
                            : dayNumber.push(monthLastDay(today.getFullYear(), today.getMonth()) + i);
                        }else if( i > monthLastDay(today.getFullYear(), today.getMonth() + 1) ){
                            today.getMonth() == 11 ? dayNumber.push(i - monthLastDay(today.getFullYear()+1, 1))
                            : dayNumber.push(i - monthLastDay(today.getFullYear(), today.getMonth() + 1));
                        }else{
                            dayNumber.push(i);
                        }
                    }
                    return dayNumber;
                };

                return new ScheduleModule;
            }
        }
	}

	exports.mainUi = _mainUi;

	return exports;
});
