"use strict";

var gulp = require('gulp');
var del = require('del');
var gls = require('gulp-live-server');
var eslint = require('gulp-eslint'); //Lint JS files, including JSX
var apidoc = require('gulp-apidoc'); //Для сборки документации по АПИ
var source = require('vinyl-source-stream'); //For create Procfile

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

gulp.task('clean', function() {
  return del([config.paths.dist + '/*', '!' + config.paths.dist + '/.git']);
});

//Check js
gulp.task('lint', function() {
  gulp.src(config.paths.js)
    .pipe(eslint({config: 'eslint.config.json'}))
    .pipe(eslint.format());
});

//Create Procfile for heroku
gulp.task('procfile', ['clean'], function() {
  var stream = source('Procfile');
  stream.end('web: node app.js');
  stream.pipe(gulp.dest(config.paths.dist));
});

//Create docs
gulp.task('apidoc', ['clean'], function(done){
  apidoc({
    src: config.paths.src,
    dest: config.paths.destDoc
  },done);
});

//copy to dist
gulp.task('copy', ['clean', 'lint', 'procfile', 'apidoc'], function() {
  return gulp.src([config.paths.js, 'package.json'])
    .pipe(gulp.dest(config.paths.dist));
});

//Start a local development server
gulp.task('server:restart', ['copy'], function() {
  server.start.bind(server)();
});

//check when edit
gulp.task('watch', function() {
  gulp.watch(config.paths.js, ['server:restart']);
});

//Start a local development server
gulp.task('default', ['copy', 'watch'], function() {
  server.start();
});
