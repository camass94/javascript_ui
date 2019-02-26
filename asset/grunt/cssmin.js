module.exports = {
  options: {
    shorthandCompacting: false,
    roundingPrecision: -1,
    debug:true
  },
  target: {
    files: [{
      expand: true,
      cwd: '<%= paths.tmpdist %>/lg4-common-<%= paths.local %>/css',
      src: ['*.css', '!*.min.css'],
      dest: '<%= paths.tmpdist %>/lg4-common-<%= paths.local %>/css'/*,
      ext: '.css'*/
    }]
  }
};
