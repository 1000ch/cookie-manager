module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    jsvalidate:
      options:
        globals: {}
        esprimaOptions: {}
        verbose: false
      all:
        files:
          src: ['<%=jshint.all%>']
    jshint:
      all: ["./src/js/*.js"]
    watch:
      files: ['./src/js/*.js']
      tasks: ['jsvalidate', 'jshint']

  grunt.loadNpmTasks 'grunt-jsvalidate'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  
  grunt.registerTask 'default', 'watch'
  grunt.registerTask 'test', ['jsvalidate', 'jshint']
