var gulp = require("gulp");
var gutil = require("gulp-util");
var mocha = require("gulp-mocha");
var istanbul = require('gulp-istanbul');
var typings = require("gulp-typings");
var ts = require("gulp-typescript");
var webpack = require("webpack");
var exec = require('child_process').exec;

var webpackClientConfig = {
    entry: {
        project: ['babel-polyfill', './src/client/project.tsx'],
        task: ['babel-polyfill', './src/client/task.tsx'],
        imports: ['babel-polyfill', './src/client/imports.tsx']
    },
    output: {
        library: "[name]",
        filename: './dist/public/[name].bundle.js'
    },
    resolve: {
        extensions: ['', '.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'babel-loader?presets[]=es2015!ts-loader' },
            { test: /\.tsx$/, loader: 'babel-loader?presets[]=es2015!ts-loader' }
        ]
    },
    externals: {
        "redux": "Redux",
        "react": "React",
        "react-dom": "ReactDOM",
        "react-redux": "ReactRedux",
        "react-bootstrap": "ReactBootstrap",
        "es6-promise": "es6-promise",
        "whatwg-fetch": "fetch",
        "redux-thunk": "ReduxThunk"
    }
}

gulp.task("init:server:typings", function() {
    var stream = gulp.src("src/server/typings.json").pipe(typings());
    return stream;
})

gulp.task("init:client:typings", function() {
    var stream = gulp.src("src/client/typings.json").pipe(typings());
    return stream;
})

gulp.task("build:common", function() {
    var tsProject = ts.createProject("src/common/tsconfig.json");
    var result = tsProject.src().pipe(tsProject(ts.reporter.fullReporter()));
    return result.js.pipe(gulp.dest("dist/common")).pipe(gulp.dest("tests/common"));
})

gulp.task("build:server", function() {
    var tsProject = ts.createProject("src/server/tsconfig.json");
    var result = tsProject.src().pipe(tsProject(ts.reporter.fullReporter()));
    return result.js.pipe(gulp.dest("dist/server")).pipe(gulp.dest("tests/common"));
})

gulp.task("build:server:tests", function() {
    var tsProject = ts.createProject("src/tests/server/tsconfig.json");
    var result = tsProject.src().pipe(tsProject(ts.reporter.fullReporter()));
    return result.js.pipe(gulp.dest("tests/tests/server"));
})

gulp.task("build:client", function(callback) {
    webpack(webpackClientConfig, function(err, stats) {
        if (err) {
            throw new gutil.PluginError("webpack", err);
        }
        gutil.log("[webpack]", stats.toString("normal"));
        callback();
    })
})

gulp.task("test:server:pre", function () {
    return gulp.src(["dist/common/**/*.js", "dist/server/**/*.js"])
               .pipe(istanbul({includeUntested: true}))
               .pipe(istanbul.hookRequire());
});

gulp.task("test:server", ["build:server:tests", "test:server:pre"], function() {
    return gulp.src("dist/tests/server/*.js")
               .pipe(mocha({reporter: "spec"}))
               .pipe(istanbul.writeReports({
                    dir: "./coverage",
                    reportOpts: {
                        dir: "./coverage"
                    },
                    reporters: ["html"]
                }))
})

gulp.task("serve", function() {
    exec("node dist/www");
})

gulp.task("init", ["init:server:typings", "init:client:typings"])
gulp.task("default", ["build:common", "build:server", "build:client"])
gulp.task("test", ["test:server"])
