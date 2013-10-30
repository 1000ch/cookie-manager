module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    jshint:
      all: ["./src/js/*.js"]
    watch:
      files: ['./src/js/*.js']
      tasks: ['jshint']

  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  
  grunt.registerTask 'default', 'watch'