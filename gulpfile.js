"use strict";

var gulp = require('gulp');
var gls = require('gulp-live-server');
var eslint = require('gulp-eslint'); //Lint JS files, including JSX
var apidoc = require('gulp-apidoc'); //Для сборки документации по АПИ

var config = {
  paths: {
    js: './src/**/*.js',
    dist: './dist',
    mainJs: './dist/app.js',
    src: './src',
    destDoc: './dist/doc'
  }
};
var server = gls.new(config.paths.mainJs);

//Start a local development server
gulp.task('server', function() {
  server.start();
});

//copy to dist
gulp.task('copy', function() {
    gulp.src(config.paths.js)
        .pipe(gulp.dest(config.paths.dist));
	gulp.src('package.json')
        .pipe(gulp.dest(config.paths.dist));
});

//Check js
gulp.task('lint', function() {
  return gulp.src(config.paths.js)
    .pipe(eslint({config: 'eslint.config.json'}))
    .pipe(eslint.format());
});

//check when edit
gulp.task('watch', function() {
  gulp.watch(config.paths.js, ['lint', 'apidoc', 'copy', function() {
    server.start.bind(server)() //restart my server
  }]);
});

//Create docs
gulp.task('apidoc', function(done){
  apidoc({
    src: config.paths.src,
    dest: config.paths.destDoc
  },done);
});

gulp.task('default', ['lint', 'apidoc', 'copy', 'server', 'watch']);
