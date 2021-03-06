// Config
const version = '1.0.10';

// Require
const del = require('del');
const gulp = require('gulp');
const zip = require('gulp-zip');
const git = require('gulp-git');
const bump = require('gulp-bump');

// Task Clear
gulp.task('clear', function (cb) {
    return del([
        './application/cache/smarty_cache/*.php',
        './application/cache/smarty_template/*.php',
        './application/cache/log/*.log',
        '!.gitkeep'
    ], cb);
});

// Task New Version
gulp.task('version', function () {
    return gulp.src(['./package.json', './composer.json'])
        .pipe(bump({version: version}))
        .pipe(gulp.dest('./'));
});

// Task Publish
var filename = 'LuckyPHP-v' + version + '.zip';
gulp.task('publish_clear', function (cb) {
    return del(['./publish/' + filename], cb);
});
gulp.task('publish_pack', function (cb) {
    return gulp.src(['./**', '!./publish', '!./node_modules/**', '!./node_modules', '!./package.json', '!./gulpfile.js', '!./composer.lock'])
        .pipe(zip(filename))
        .pipe(gulp.dest('./publish'));
});
gulp.task('publish', gulp.series('publish_clear', 'publish_pack'));

// Task Git
gulp.task('git-add', function () {
    return gulp.src('.')
        .pipe(git.add());
});
gulp.task('git-commit', function () {
    return gulp.src('.')
        .pipe(git.commit('Bumped version number to v' + version));
});
gulp.task('git-push', function (cb) {
    return git.push('origin', 'master', cb);
});
gulp.task('git-new-tag', function (cb) {
    return git.tag('v' + version, 'v' + version, function (error) {
        if (error) {
            return cb(error);
        }
        return git.push('origin', 'master', {args: '--tags'}, cb);
    });
});

// Task Default
var taskGit = gulp.series('git-add', 'git-commit', 'git-push', 'git-new-tag');
var taskPublish = 'publish';
var taskDefault = gulp.series('clear', 'version', gulp.parallel(taskPublish, taskGit));
gulp.task('default', taskDefault);

//const fs = require('fs');
//// Function
//function version() {
//    return JSON.parse(fs.readFileSync('./composer.json', 'utf8')).version;
//};