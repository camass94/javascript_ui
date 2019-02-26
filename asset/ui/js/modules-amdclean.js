var require = {
    'modules': [{
        'name': 'global/global.main'
    }, {
        'name': 'products/products.main',
        'exclude': ['global', 'jquery', 'lodash']
    }, {
        'name': 'support/support.main',
        'exclude': ['global', 'products', 'jquery', 'lodash']
    }, {
        'name': 'support/support.myaccount', // my lg
        'exclude': ['global', 'jquery', 'lodash']
    }, {
        'name': 'support/support.repair', // repair & warranty
        'exclude': ['global', 'jquery', 'lodash']
    }, {
        'name': 'support/support.etc', // guide & download, search, contact
        'exclude': ['global', 'jquery', 'lodash']
    }, {
        'name': 'aboutlg/aboutlg.main',
        'exclude': ['global', 'jquery', 'lodash']
    }]
};
