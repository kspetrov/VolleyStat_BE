"use strict";

var gulp = require('gulp');
var server = require('gulp-express');
var eslint = require('gulp-eslint'); //Lint JS files, including JSX

var config = {
    paths: {
        js: './src/**/*.js',
        mainJs: './src/app.js'
    }
};

//Start a local development server
gulp.task('server', function() {
    server.run([config.paths.mainJs]);
});

//Check js
gulp.task('lint', function() {
    return gulp.src(config.paths.js)
        .pipe(eslint({config: 'eslint.config.json'}))
        .pipe(eslint.format());
});

gulp.task('watch', function() {
    gulp.watch(config.paths.js, ['lint', 'server']);
});

gulp.task('default', ['lint', 'server', 'watch']);
