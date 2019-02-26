module.exports = {
    lgIcons: {
        src: '<%= paths.src %>/lg4-common-<%= paths.local %>/fonts/lg-icon/svg/*.svg',
        dest: '<%= paths.src %>/lg4-common-<%= paths.local %>/fonts/lg-icon/',
        destCss:'<%= paths.src %>/lg4-common-<%= paths.local %>/scss/base/',
        options: {
            relativeFontPath : '/lg4-common-<%= paths.local %>/fonts/lg-icon/',
            stylesheet: 'scss',
            font:'lg-icon',
            types: 'eot,woff,ttf,svg',
            destHtml:'<%= paths.src %>/icon-font-tests/',
            templateOptions: {
                baseClass: 'icon',
                classPrefix: 'icon-',
                mixinPrefix: 'icon-'
            }
        }
    },
    //For demonstration only, able to build x amount of icons fonts
    exampleIcon: {
        src: '<%= paths.src %>/lg4-common-<%= paths.local %>/fonts/example/svg/*.svg',
        dest: '<%= paths.src %>/lg4-common-<%= paths.local %>/fonts/example/',
        destCss:'<%= paths.src %>/lg4-common-<%= paths.local %>/scss/base/',
        options: {
            relativeFontPath : '/lg4-common-<%= paths.local %>/fonts/example/',
            stylesheet: 'scss',
            font:'example',
            types: 'eot,woff,ttf,svg',
            destHtml:'<%= paths.src %>/icon-font-tests/',
            templateOptions: {
                baseClass: 'icon',
                classPrefix: 'icon-',
                mixinPrefix: 'icon-'
            }
        }
    }
}
