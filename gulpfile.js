"use strict";

var gulp = require('gulp');
var gls = require('gulp-live-server');
var eslint = require('gulp-eslint'); //Lint JS files, including JSX
var apidoc = require('gulp-apidoc'); //Для сборки документации по АПИ

var config = {
  paths: {
    js: './src/**/*.js',
    mainJs: './src/app.js'
  }
};
var server = gls.new(config.paths.mainJs);

//Start a local development server
gulp.task('server', function() {
  server.start();
});

//Check js
gulp.task('lint', function() {
  return gulp.src(config.paths.js)
    .pipe(eslint({config: 'eslint.config.json'}))
    .pipe(eslint.format());
});

gulp.task('watch', function() {
  gulp.watch(config.paths.js, ['lint', 'apidoc', function() {
    server.start.bind(server)() //restart my server
  }]);
});

//Create docs
gulp.task('apidoc', function(done){
  apidoc({
    src: "src/",
    dest: "doc/"
  },done);
});

gulp.task('default', ['lint', 'apidoc', 'server', 'watch']);
