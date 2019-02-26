#LG HTML Guide (MKT)
**TOC**

[TOC]
##Grunt, RequireJS, SCSS
**iCF(iCrossing UI Framework)**
Node.js, bower, Grunt, Sass, Compass, fontforge 등 설치가 필요합니다.
자세한 내용은 iCF (readme.md) 문서를 참고하세요.

##Directory
lg4-common

|||
|--------|--------|
|css|- global.css, global-m.css : Header, Footer, 공통 css <br />- modules.css, modules-m.css : 모듈 관련 css <br />- products.css, products-m.css : 컨텐츠 관련 css <br />- webfonts.css : LG Smart font를 페이지 상단에서 미리 불러오도록 하기 위해 추가함.<br />- compare-print.css : Compare 페이지의 Print 팝업용 css|
|favicons|32x32.png, 57x57.png, 72x72.png 등 11개 파일|
|fonts/lg-icon|lg-icon.eot, lg-icon.svg, lg-icon.ttf, lg-icon.woff|
|fonts/lg-smart|LG_Smart_Bold.eot 등 24개 파일|
|fonts/slick|slick.eot, slick.svg, slick.ttf, slick.woff|
|img|공통 이미지 폴더|
|js|modernize.js|
|js/global|global.main.js|
|js/products|products.main.js|


##JS & CSS Files
###JS
global.main.js

|||
|--------|--------|
|js/common/app-footer.js|footer 영역의 Cookie 레이어 관련 스크립트. US는 사용하지 않음|
|js/common/app-footer-nav.js|Mobile용 Footer의 확장/축소 기능|
|js/common/app-header.js|GNB 관련 스크립트|
|js/common/app-header-mobile.js|GNB 모바일용 스크립트|
|js/common/app-header-search.js|Header의 Search 관련 스크립트|
|js/common/app-meganav.js|Tablet 용 Navi 관련 스크립트|
|js/common/beforeprint.js|프린트 실행 하기 전에 실행 시켜 주는 스크립트|
|js/common/browser-alert.js|IE8 이하이거나 호환성보기일 경우 팝업 띄워주는 스크립트|
|js/common/cart-link.js|Add to cart와 Header의 cart 클릭하여 이동 시, 쿠키 제거하는 스크립트|
|js/common/dtm.js|DTM 관련 스크립트|
|js/common/ecommerce.js|Cart에 추가된 제품 갯수 받아서 출력해 주는 스크립트|
|js/common/popup.js|팝업 관련 스크립트, 현재는 Live Chat 기능만 추가 되어 있음|
|js/common/read-more.js|Footer의 SEO 영역에 read more 로 줄임 처리|
|js/common/search-result.js|Search Result 관련 스크립트|
|js/common/sign-in.js|SIGN IN 여부 체크하여 마크업에 반영 하는 기능|
|js/common/skip-to-content.js|Header의 Skip Nav 기능|
|js/common/social-likes.js|Share Plugin|
|js/common/social-likes-shaare.js|Share 실행 시켜주는 스크립트|


products.main.js

|||
|--------|--------|
|js/common/bestbuy.js|Best Buy (Buy Now) 관련 스크립트 |
|js/common/ecorebates.js|Eco Rebate 스크립트|
|js/common/e-smart-zoom-jquery.js|Zoom 기능 Plugin|
|js/common/lazyload.js|이미지 Lazy load Plugin|
|js/common/touch-punch.js|jQuery UI에서 제공하는 slider 등을 모바일/타블렛 등의 환경에서 Touch Event로 동작 할 수 있도록 해 주는 Plugin|
|js/call-to-action/call-to-action-carousel.js|좌우 슬라이드 관련 스크립트|
|js/hero/hero-carousel.js|Product Hero 영역 관련 스크립트|
|js/products/app-tabs.js|제품 페이지 Tab 관련 스크립트|
|js/products/filter.js|Sub Category Filter, Start my search, Compare 관련 스크립트|
|js/products/find-a-store.js|Find a Store 관련 스크립트|
|js/products/find-the-right.js|FRP 디자인 관련 스크립트|
|js/products/find-the-right-filter.js|FRP 기능 관련 스크립트|
|js/products/group-slick.js|홈페이지, 카테고리 페이지 등 Hero 영역 관련 스크립트|
|js/products/legal.js|Patent, Legal 관련 스크립트|
|js/products/notice-board.js|Public Notice 관련 스크립트|
|js/products/product.stepchart.js|M09 모듈 관련 스크립트|
|js/products/product.stickynav.js|제품 페이지의 Sticky Nav 관련 스크립트|
|js/products/product-cookie.js|제품 페이지의 쿠키 관련 스크립트, 현재는 Recently view만 있음|
|js/products/product-hero.js|제품 페이지의 Hero 영역 관련 스크립트|
|js/products/product-lazy.js|이미지 Lazy 관련 실행 스크립트|
|js/products/product-lists-carousel.js|캐로젤인 제품 리스트 관련 스크립트|
|js/products/product-lists-view-more.js|캐로젤이 아닌 제품 리스트 관련 스크립트|
|js/products/products.ask.js|바자보이스 관련 스크립트|
|js/products/products.compare.js|제품 페이지의 Compare 기능|
|js/products/products-zoom.js|Zoom 기능 실행 스크립트|
|js/products/product-video.js|B모듈, C모듈, Hero의 video 관련 스크립트|
|js/products/site-map.js|Site map 모바일 페이지에서 확장/축소 스크립트|
|js/products/text-more.js|M04 모듈 관련 스크립트|
|js/products/three-static-tile.js|M11 모듈 관련 스크립트|
|js/products/where-to-buy.js|WTB 페이지 모바일에서 탭 구현하는 스크립트|
###CSS
global.css, global-m.css

|||
|--------|--------|
|scss/components/_browser-alert.scss|IE8 이하이거나 호환성보기일 경우 보여지는 팝업 관련 CSS|
|scss/components/_call-to-action.scss|iC 제작 CSS|
|scss/components/_colorchip.scss|컬러칩 관련 CSS|
|scss/components/_cookie.scss|Cookie 레이어 관련 SCSS, US는 사용하지 않음|
|scss/components/_footer.scss|Footer 관련 CSS|
|scss/components/_footer-seo.scss|Footer의 SEO 영역 관련 CSS|
|scss/components/_gnb-responsive.scss|브라우저 사이즈가 1200픽셀 이하일때 타블렛용 GNB가 보이도록 변경해 주는 CSS|
|scss/components/_header_inc_mobile.scss|모바일용 Header 관련 CSS|
|scss/components/_header_inc_web.scss|데스크탑/타블렛용 Header 관련 CSS|
|scss/components/_mega-nav.scss|Mega Nav 관련 CSS|
|scss/components/_mobile-nav.scss|모바일용 GNB CSS|
|scss/components/_my-lg.scss|My LG 영역 CSS|
|scss/components/_print.scss|프린트용 CSS|
|scss/components/_share.scss|데스크탑/타블렛용 Share CSS|
|scss/components/_share-m.scss|모바일용 Share CSS|
|scss/components/_sitemap.scss|Sitemap CSS|
|scss/components/_tablet-nav.scss|타블렛용 GNB CSS|

modules.css, modules-m.css

|||
|--------|--------|
|scss/module/_column-template.scss|Template 페이지 관련 CSS|
|scss/module/_contact.scss|Contact 모듈 관련 CSS|
|scss/module/_error.scss|에러 페이지 관련 CSS|
|scss/module/_hero.scss|Hero 관련 CSS|
|scss/module/_image_blocks.scss|M07 모듈 관련 CSS|
|scss/module/_legal.scss|Legal, Patent 관련 CSS|
|scss/module/_module.scss|M01~M03, M04, M05, M06, M08, M10, M12|
|scss/module/_print.scss|프린트 관련 CSS|
|scss/module/_sitemap.scss|Sitemap 관련 CSS|
|scss/module/_static-contents.scss|Static Template 관련 CSS|
|scss/module/_step_up_chart.scss|M09 모듈 관련 CSS|
|scss/module/_three-static-tile.scss|M11 모듈 관련 CSS|


products.css, products-m.css

|||
|--------|--------|
|scss/products/_ask.scss|제품 페이지의 ask & answer 영역|
|scss/products/_ask_old_ie.scss|제품 페이지의 ask & answer 영역 (IE8 이하)|
|scss/products/_content.scss|Return to Compare 버튼|
|scss/products/_discontinued.scss|Discontinued 용 CSS|
|scss/products/_ecorebates.scss|Eco rebate 관련 CSS|
|scss/products/_filter.scss|Sub Category Filter, Start my search, Compare 관련 CSS|
|scss/products/_filter-m.scss|Sub Category Filter, Start my search, Compare 관련 CSS (모바일용)|
|scss/products/_find-a-store.scss|Find a Store 모듈 관련 CSS|
|scss/products/_find-a-store_old_ie.scss|Find a Store 모듈 관련 CSS (IE8 이하)|
|scss/products/_find-the-right.scss|FRP 관련 CSS|
|scss/products/_key_feature.scss|제품 페이지의 Key Features 영역 관련 CSS|
|scss/products/_key_feature_old_ie.scss|제품 페이지의 Key Features 영역 관련 CSS (IE8 이하)|
|scss/products/_notice-board.scss|Public Notice 관련 CSS|
|scss/products/_product-lists.scss|제품 리스트 관련 CSS|
|scss/products/_search-result.scss|Search Result 관련 CSS|
|scss/products/_stickynav.scss|데스크탑/타블렛용 Sticky Nav 관련 CSS|
|scss/products/_stickynav-m.scss|모바일용 Sticky Nav 관련 CSS|
|scss/products/_support.scss|제품 페이지의 Support 메뉴 CSS|
|scss/products/_tabs.scss|제품 페이지 Tab 영역 CSS|
|scss/products/_tech-specs.scss|제품 페이지의 Tech Spec 영역 CSS|
|scss/products/_tech-specs_oldie.scss|제품 페이지의 Tech Spec 영역 CSS (IE8 이하)|
|scss/products/_where-to-buy.scss|WTB 페이지 관련 CSS|

##3rd Party
###Iframe/External Web page
1. Live Chat

	- 단순 팝업
    ```
    /lg4-common/js/common/popup.js
    ```
    - Markup
    ```
	<a href="http://service.velaro.com/visitor/requestchat.aspx?siteid=4851&amp;showwhen=inqueue" data-url="http://service.velaro.com/visitor/requestchat.aspx?siteid=4851&amp;showwhen=inqueue" target="_blank" title="new window" class="popup-live-chat">Chat online</a>
    ```
2. 360VR

	- 제품 페이지에서 외부 URL을 iframe 으로 불러 옵니다.
	- 예제 URL : [http://lgad.thorn.net/01/HE/360/2014/47LB6300/47LB6300.html](http://lgad.thorn.net/01/HE/360/2014/47LB6300/47LB6300.html)

###Javascript Injection/Javascript Library
1. BrightCove
	- BrightCove account와 video ID를 받아 iframe으로 호출하도록 구현.
	- 예제 URL : [http://players.brightcove.net/1432358930001/default_default/index.html?videoId=3811035969001](http://players.brightcove.net/1432358930001/default_default/index.html?videoId=3811035969001)
	- players.brightcove.net/++{Account}++/default_default/index.html?videoId=++{Video ID}++
	 ```
     /lg4-common/js/products/product-video.js
     ```

2. Where to Buy (Price Spider)
	- WTB 페이지의 HTML 내에서 다음 스크립트를 사용합니다.
    ```
    <script type="text/javascript" src="//embedded.pricespider.com/WidgetScript.psjs?wc=634ff9ef-4b08-46f4-9f17-aab1f055a05a"></script>
    <script type="text/javascript">
        var modelId = 'MD000001', // Product ID
            area = document.getElementById("whereToBuyArea");
        ps_Show({
            widgetConfigurationId: '634ff9ef-4b08-46f4-9f17-aab1f055a05a',
            container: area,
            sku: 'US_'+ modelId
        });
    </script>
    ```

3. Bazaar Voice
	- head tag 안에 다음 스크립트를 추가합니다. (Live에서는 -stg 제거)

	```
    <script type="text/javascript" src="http://display-stg.ugc.bazaarvoice.com/static/LG/en_US/bvapi.js"></script>
    ```

    - 실행 스크립트는 아래 파일을 참고하세요.
	```
    /lg4-common/js/products/products.ask.js
    ```

    - 바자보이스 적용된 부분
		- Product Page의 Sticky Nav (#BVRRSummaryContainer)
		- Product Page의 Reviews & Ratings (#BVRRContainer)
		- Product Page의 Ask & Answer (#BVQAContainer)
		- Product List의 Inline Reviews (setBVRatings)

	- 바자보이스의 디자인을 변경하거나 설정을 변경하려면, Bazaar Voice Workbench 사이트의 계정이 필요합니다.

4. Eco Rebate
	- runEcorebates() 함수 정의
	```
	/lg4-common/js/common/ecorebates.js
    ```
	- runEcorebates()를 실행 시켜 주는 부분
    ```
    /lg4-common/js/products/main.js
    ```
    - Markup
	```
	<div class="product-rebate">
		<div class="ecorebates-div" data-modelId="{Product ID}"></div>
	</div>
	```

5. Buy now (Best buy)
	- 실행 스크립트는 아래 파일을 참고하세요.
	```
    /lg4-common/js/common/bestbuy.js
    ```
    - Markup
    ```
    <a href="#" class="btn buynow" data-sku="3429088" data-partner-id="LG" value="buy now">Buy Now</a>
    ```

###Javascript Library
1. DTM
	- head tag 안에 다음 스크립트를 추가합니다. (Live시에는 -staging 제거)
	```
    <script src="//assets.adobedtm.com/9df6f1d56aab8e1a23bc5d911dd01089b83d4a51/satelliteLib-1db6628c0c9fad06d36dbead0b0904690f0b6d8f-staging.js"></script>
    ```

	- 실행 스크립트는 아래 파일을 참고하세요.
	```
    /lg4-common/js/common/dtm.js
    ```

	- Markup에서 a나 button에 data-sc-item 과 data-sc-value 값을 추가하면 자동으로 실행합니다.

	- body tag 하단에 아래 파일 내의 스크립트를 추가합니다.
	```
    /incl/script_dtm.inc
    ```

2. ForeSee
	- head tag에 아래 파일 내의 스크립트를 추가합니다.
	```
    /incl/script_foresee.inc
    ```

3. Floodlight
	- body tag 하단에 아래 파일 내의 스크립트를 추가합니다.
	```
    /incl/script_floodlight.inc
    ```

    - Product page의 Tab 영역에 FLOOD1 함수를 사용합니다.
	```
    <a onclick="FLOOD1('mugf40', 'unive001', '1?');" href="#">
    ```
    	- MOBILE 카테고리의 경우 : FLOOD1('mugf40', 'unive001', '1?');
    	- TV/AUDIO/VIDEO 카테고리의 경우 : FLOOD1('hebxl0', 'unive00', '1?');

4. MBOX
	- body tag 하단에 아래 파일 내의 스크립트를 추가합니다.
	```
    /incl/script_mbox.inc
    ```

5. Versa tag
	- body tag 하단에 아래 파일 내의 스크립트를 추가합니다.
	```
    /incl/script_versa.inc
    ```

6. Owner IQ Analytics
	- body tag 하단에 아래 파일 내의 스크립트를 추가합니다.
	```
    /incl/script_owner_iq.inc
    ```

###JSONP
1. Cart (Digital River)

	- 실행 스크립트는 아래 파일을 참고하세요.
    ```
    /lg4-common/js/common/ecommerce.js
    ```

##Ajax 구현
###Common
1. Search
	GNB Search Input에 텍스트 입력 시, 검색 결과 레이어를 Ajax 로 마크업을 가져와 출력시켜 주며,
    Search Result 페이지의 Input에 텍스트 입력 시에도 추천 검색어 레이어를 출력시켜 줍니다.
    데스크탑 버전에서는 페이징 클릭 시, 모바일 버전에서는 Load more 클릭 시 다음 페이지를 불러 오며,
    검색 결과 없을 시, Most Popular 제품 출력시에도 Ajax 처리 되어 있습니다.
    ```
    /lg4-common/js/common/app-header-search.js
    /lg4-common/js/common/search-result.js
    ```

2. Cart

	Cart에 담겨 있는 제품의 갯수를 Ajax로 가져와 처리합니다.
    ```
    /lg4-common/js/common/ecommerce.js
    ```

3. Sign in

	개발 페이지에서 Sign in 여부에 따라 쿠키(LG4_LOGIN)를 Y/N 으로 set 하며, 마크업에서는 페이지 접속 시 해당 쿠키가 없거나 Y인 경우에만 Ajax 호출합니다.
	Ajax 호출 후, Sign in 여부에 따라 마크업을 변경해 주며 사용자 이름 등을 표시해 줍니다.
    ```
    /lg4-common/js/common/sign-in.js
    ```

4. Share
	Share Box의 a 태그 클릭시, Layer 마크업을 Ajax로 받아 출력 시킵니다.
	```
    /lg4-common/js/common/social-likes.js
    /lg4-common/js/common/social-likes-share.js
    ```
    Markup
	```
	<div class="share_box" data-title-new-window="Open the new window">
		<a href="#" title="Open the share layer popup" data-url="/us/product/social.lg?url={URL}&productImg={Image URL}&supperCategory={Category ID}" class="stickyshare">SHARE<i class="icon icon-share"></i></a>
	</div>
    ```

###Contents
1. Public Notice (Mobile)
	모바일에서 Load More 클릭시 Ajax 호출을 통해 다음 페이지의 리스트를 불러 옵니다.
	```
	/lg4-common/js/common/notice-board.js
	```

2. Recently Viewed
	제품 페이지에서 Recently Viewed 영역에 데이터를 Ajax로 가져와 출력시켜 줍니다.
    ```
	/lg4-common/js/products/product-lists-carousel.js
	```

3. FRP
	FRP 페이지에서 Input 요소들의 enabled/disabled 를 체크하여 화면에 표현해 주는 부분과,
    결과 리스트를 출력시켜 주는 부분이 Ajax 로 구현 되어 있습니다.
    ```
	/lg4-common/js/products/find-the-right-filter.js
    ```

4. Sub Category / Basic Category / Compare
	Sub Category, Basic Category, Compare 페이지의 필터 영역에서
    필터 항목 체크/해제 시, Sort by 선택 시, 페이지 클릭시,  제품 결과 목록을 Ajax로 가져옵니다.
    ```
	/lg4-common/js/products/filter.js
    ```

5. Start my search
	Start my search 모듈에서 선택한 항목에 따른 제품 갯수를 ajax를 통해 가져와 출력시켜 줍니다.
    ```
	/lg4-common/js/products/filter.js
    ```

##Cookie
1. LG4_BROWSER_ALERT
	IE8 이하 및 호환성 보기로 접속 시 뜨는 레이어 팝업을 닫을 시, 해당 쿠키가 생성되며 1일동안 유효합니다.
	해당 쿠키가 유효한 상태에서는 해당 레이어 팝업이 보이지 않습니다.
	```
    Y
    ```
2. LG4_RECENTLY_VIEW
	최근 본 제품의 ID값이 아래와 같이 나열되어 추가됩니다.
	```
    MD05227701|MD00001294
    ```
3. LG4_LOGIN
	로그인 여부에 따라 Y 혹은 N 값이 들어갑니다.
	```
    Y/N
    ```

4. LG4_FILTER_CART
	Sub Category와 Basic Category, Compare 페이지에서 필터 항목을 체크하면, 아래와 같이 체크된 항목이 카테고리별로 구분되어 쿠키에 추가됩니다.
	```
	/us/cell-phones=FV11304899|FV11304897,/us/tvs=FV11304934|sizeMax:RG00001066|sizeMin:RG00001062
    ```

5. LG4_COMPARE_CART
	전 페이지에서 Add to Compare 버튼을 체크하면, 아래와 같이 체크된 제품이 카테고리별로 구분되어 쿠키에 추가됩니다.
	Compare 페이지 접속 시, 쿠키에 들어 있는 제품을 출력(개발)시켜 줍니다.
	```
    /us/cell-phones=MD05202309|MD05202320|MD05201144|MD05202312,/us/tvs=MD05227701
    ```

6. LG4_COMPARE_LOCK
	Compare 에서 Lock 클릭 시, 선택된 제품이 아래와 같이 카테고리별로 구분되어 쿠키에 추가됩니다.
	```
    /us/cell-phones=MD05202309,/us/tvs=MD05227701
    ```

##Color Chips
어드민에서 관리자가 컬러를 등록하면, CSS에서도 해당 컬러를 제작 해야 합니다.
아래 이미지에 22*22px 의 썸네일 추가 후, _colorship.scss 파일에서 해당 이미지 위치를 맞춰 주어야 합니다.
```
/lg4-common/img/common/colorchip_us.jpg
```
```
/lg4-common/scss/components/_colorchip.scss
```


