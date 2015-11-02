"use strict";

var gulp = require('gulp');
var server = require('gulp-express');

gulp.task('server', function () {
    // Start the server at the beginning of the task
    server.run(['src/app.js']);
    gulp.watch(['src/**/*.js'], server.run);
});

gulp.task('default', ['server']);
