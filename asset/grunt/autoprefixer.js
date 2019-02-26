module.exports = {
    options: {
        // browsers: [],
        // silent: true
        cascade: false,
        remove: false
    },
    dev: {
        src: '<%=paths.tmpdev%>/lg4-common-<%= paths.local %>/css/**/*.css'
    },
    dist: {
        src: '<%=paths.dist%>/lg4-common-<%= paths.local %>/css/**/*.css'
    }
};
