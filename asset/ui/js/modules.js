var require = {
    'modules': [{
        'name': 'global/global.main',
        'override': {
            'wrap': {
                'startFile': 'ui/lg4-common-gp/bower_components/almond/almond.js'
            }
        }
    }, {
        'name': 'global/global.footer',
        'excludeShallow': ['global/global.main', 'jquery', 'ic/ic', 'common/social-likes', 'common/social-likes-share']
    }, {
        'name': 'products/products.main',
        'excludeShallow': [
            //'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config'
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'slick-carousel', 'common/dtm', 'jqueryui', 'jquery.cookie', 'chosen', 'lazyload', 'lodash', 'mkt/hero-carousel', 'mkt/call-to-action-carousel', 'mkt/product-hero', 'mkt/product-lists-carousel', 'mkt/product-lists-view-more', 'mkt/product-compare', 'mkt/filter', 'mkt/slider-select', 'mkt/find-a-store', 'mkt/find-the-right', 'mkt/find-the-right-filter', 'mkt/search-result', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'products/products.carousel',
        'excludeShallow': [
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'slick-carousel', 'common/dtm', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'products/products.compare',
        'excludeShallow': [
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'products/products.filter',
        'excludeShallow': [
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'jquery.cookie', 'common/dtm', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'products/products.finder',
        'excludeShallow': [
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'jquery.cookie', 'common/dtm', 'mkt/product-compare', 'jqueryui', 'chosen', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'products/products.search',
        'excludeShallow': [
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'jquery.cookie', 'common/dtm', 'slick-carousel', 'chosen', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'products/products.wtb',
        'excludeShallow': [
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'jquery.cookie', 'common/dtm', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'products/products.wtb_cn',
        'excludeShallow': [
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'jquery.cookie', 'common/dtm', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'products/products.wtb_ru',
        'excludeShallow': [
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'jquery.cookie', 'common/dtm', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'support/support.main',
        'excludeShallow': ['global/global.main', 'jquery', 'ic/ic', 'cs/datepicker', 'cs/predictive', 'cs/modallayer', 'cs/forms', 'cs/ajaxform', 'cs/fileupload', 'support/feedback', 'support/product-selector', 'support/model-selector', 'support/step-list', 'support/sticky', 'cs/infobox', 'cs/gmapload', 'cs/repairmap', 'cs/tabpanel', 'common/social-likes', 'common/social-likes-share']
    }, {
        'name': 'support/support.repair',
        'excludeShallow': ['global/global.main', 'support/support.main', 'jquery', 'ic/ic', 'cs/datepicker', 'cs/predictive', 'cs/modallayer', 'cs/forms', 'cs/ajaxform', 'cs/fileupload', 'support/feedback', 'support/product-selector', 'support/model-selector', 'support/sticky', 'cs/infobox', 'cs/gmapload', 'cs/repairmap', 'cs/tabpanel', 'common/social-likes', 'common/social-likes-share']
    }, {
        'name': 'support/support.request.repair',
        'excludeShallow': ['global/global.main', 'support/support.main', 'jquery', 'ic/ic', 'cs/datepicker', 'cs/predictive', 'cs/modallayer', 'cs/forms', 'cs/ajaxform', 'cs/fileupload', 'support/feedback', 'support/product-selector', 'support/model-selector', 'support/step-list', 'support/sticky', 'cs/infobox', 'cs/gmapload', 'cs/repairmap', 'cs/tabpanel', 'common/social-likes', 'common/social-likes-share']
    }, {
        'name': 'support/support.myaccount',
        'excludeShallow': ['global/global.main', 'support/support.main', 'jquery', 'ic/ic', 'cs/datepicker', 'cs/predictive', 'cs/modallayer', 'cs/forms', 'cs/ajaxform', 'cs/fileupload', 'support/feedback', 'support/product-selector', 'support/model-selector', 'support/step-list', 'support/sticky', 'cs/infobox', 'cs/gmapload', 'cs/repairmap', 'cs/tabpanel', 'common/social-likes', 'common/social-likes-share']
    }, {
        'name': 'support/support.etc',
        'excludeShallow': ['global/global.main', 'support/support.main', 'jquery', 'ic/ic', 'cs/datepicker', 'cs/predictive', 'cs/modallayer', 'cs/forms', 'cs/ajaxform', 'cs/fileupload', 'support/feedback', 'support/product-selector', 'support/model-selector', 'support/step-list', 'support/sticky', 'cs/infobox', 'cs/gmapload', 'cs/repairmap', 'cs/tabpanel', 'common/social-likes', 'common/social-likes-share']
    }, {
        'name': 'support/support.modallayer',
        'excludeShallow': [
            'jquery', 'ic/ic', 'support/support.main', 'cs/forms', 'cs/ajaxform', 'cs/fileupload', 'support/product-selector', 'support/model-selector', 'support/step-list', 'support/sticky', 'cs/infobox', 'cs/gmapload', 'cs/repairmap', 'cs/tabpanel', 'jquery', 'ic/ic', 'ic/ui/module', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'support/support.component',
        'excludeShallow': [
            'jquery', 'ic/ic', 'support/support.main', 'cs/forms', 'cs/ajaxform', 'cs/fileupload', 'support/feedback', 'support/product-selector', 'support/model-selector', 'support/step-list', 'support/sticky', 'cs/infobox', 'cs/gmapload', 'cs/repairmap', 'cs/tabpanel', 'jquery', 'ic/ic', 'ic/ui/module', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'support/support.form',
        'excludeShallow': [
            'jquery', 'ic/ic', 'support/support.main', 'cs/datepicker', 'cs/predictive', 'cs/modallayer', 'support/feedback', 'support/product-selector', 'support/model-selector', 'support/step-list', 'support/sticky', 'cs/infobox', 'cs/gmapload', 'cs/repairmap', 'cs/tabpanel', 'jquery', 'ic/ic', 'ic/ui/module', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'support/support.module',
        'excludeShallow': [
            'jquery', 'ic/ic', 'support/support.main', 'cs/forms', 'cs/ajaxform', 'cs/fileupload', 'cs/datepicker', 'cs/predictive', 'cs/modallayer', 'cs/infobox', 'cs/gmapload', 'support/feedback', 'cs/repairmap', 'cs/tabpanel', 'jquery', 'ic/ic', 'ic/ui/module', 'support/step-list', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'support/support.tabpanel',
        'excludeShallow': [
            'jquery', 'ic/ic', 'support/support.main', 'cs/forms', 'cs/ajaxform', 'cs/fileupload', 'cs/datepicker', 'cs/predictive', 'cs/modallayer', 'cs/infobox', 'cs/gmapload', 'cs/repairmap', 'support/feedback', 'support/product-selector', 'support/model-selector', 'support/step-list', 'support/sticky', 'jquery', 'ic/ic', 'ic/ui/module', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'support/support.map',
        //'include': ['cs/gmapload'],
        'excludeShallow': [
            'jquery', 'ic/ic', 'support/support.main', 'cs/forms', 'cs/ajaxform', 'cs/fileupload', 'cs/datepicker', 'cs/predictive', 'cs/modallayer', 'support/feedback', 'support/product-selector', 'support/model-selector', 'support/step-list', 'support/sticky', 'cs/tabpanel', 'jquery', 'ic/ic', 'ic/ui/module', 'common/social-likes', 'common/social-likes-share'
        ]
        /* PJTBTOBCSR-143 */
    }, {
        'name': 'support/support.business',
        //'include': ['cs/gmapload'],
        'excludeShallow': [
            'jquery', 'ic/ic', 'support/support.main', 'cs/forms', 'cs/ajaxform', 'cs/fileupload', 'cs/datepicker', 'cs/predictive', 'cs/modallayer', 'support/feedback', 'support/product-selector', 'support/model-selector', 'support/step-list', 'support/sticky', 'cs/tabpanel', 'jquery', 'ic/ic', 'ic/ui/module', 'common/social-likes', 'common/social-likes-share'
        ]
        /* //PJTBTOBCSR-143 */
    }, {
        'name': 'support/support.map.baidu',
        'excludeShallow': [
            'jquery', 'ic/ic', 'support/support.main', 'cs/forms', 'cs/ajaxform', 'cs/fileupload', 'cs/datepicker', 'cs/predictive', 'cs/modallayer', 'support/feedback', 'support/product-selector', 'support/model-selector', 'support/step-list', 'support/sticky', 'cs/tabpanel', 'jquery', 'ic/ic', 'ic/ui/module', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'support/login',
        'excludeShallow': [
            'jquery', 'ic/ic', 'jquery', 'ic/ic', 'ic/ui/module', 'common/social-likes', 'common/social-likes-share'
        ]
     }, {
        'name': 'support/center-text',
        'excludeShallow': [
            'jquery', 'ic/ic', 'jquery', 'ic/ic', 'ic/ui/module', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'aboutlg/aboutlg.main',
        'excludeShallow': [
            //'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config'
            'global/global.main', 'global/global.footer', 'jquery', 'global-config', 'chosen', 'lazyload', 'mkt/modelsticky', 'common/social-likes', 'common/social-likes-share'
        ]
    /* LGEPJT-91 */
    }, {
        'name': 'products/products.findmap',
        'excludeShallow': [
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'jquery.cookie', 'common/dtm', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'products/products.findmap_cn',
        'excludeShallow': [
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'jquery.cookie', 'common/dtm', 'common/social-likes', 'common/social-likes-share'
        ]
    }, {
        'name': 'products/products.business',
        'excludeShallow': [
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'jquery.cookie', 'common/dtm', 'common/social-likes', 'jqueryui', 'chosen', 'common/social-likes-share'
        ]
    /* //LGEPJT-91 */
    }, 
    /* PJTPDP-11 */
    {
        'name': 'products/products.pdp',
        'excludeShallow': [
            'global/global.main', 'global/global.footer', 'jquery', 'ic/ic', 'ic/ui/module', 'global-config', 'slick-carousel', 'common/dtm', 'common/social-likes', 'common/social-likes-share'
        ]
    },
    /* //PJTPDP-11 */
    ]
};
