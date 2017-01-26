const gulp = require("gulp");
const ts = require("gulp-typescript");
const mocha = require("gulp-mocha");
const istanbul = require('gulp-istanbul');
const tslint = require("gulp-tslint");
const filter = require('gulp-filter');

gulp.task("build:common", function () {
    const tsProject = ts.createProject("src/common/tsconfig.json");
    const result = gulp.src("src/common/**/*.ts").pipe(tsProject());
    return result.js.pipe(gulp.dest("dist/lib/common")).pipe(gulp.dest("tests/common"));
})

gulp.task("build:common:tests", function () {
    const tsProject = ts.createProject("src/tests/common/tsconfig.json");
    const result = gulp.src("src/tests/common/**/*.ts").pipe(tsProject());
    return result.js.pipe(gulp.dest("tests/tests/common"));
})

gulp.task("watch:common:tests", ["build:common:tests"], function () {
    gulp.watch("src/tests/common/**/*.ts", ["build:common:tests"]);
})

gulp.task("watch:common", ["build:common"], function () {
    gulp.watch("src/common/**/*.ts", ["build:common"]);
})

gulp.task("build:server", function () {
    const tsProject = ts.createProject('src/server/tsconfig.json');
    const result = gulp.src("src/server/**/*.ts").pipe(tsProject());
    return result.js.pipe(gulp.dest("dist/lib/server")).pipe(gulp.dest("tests/server"));
})

gulp.task("watch:server", ["build:server"], function () {
    gulp.watch("src/server/**/*.ts", ["build:server"]);
})

gulp.task("build:server:tests", function () {
    const tsProject = ts.createProject("src/tests/server/tsconfig.json");
    const result = gulp.src("src/tests/server/**/*.ts").pipe(tsProject());
    return result.js.pipe(gulp.dest("tests/tests/server"));
})

gulp.task("watch:server:tests", ["build:server:tests"], function () {
    gulp.watch("src/tests/server/**/*.ts", ["build:server:tests"]);
})

gulp.task("test:pre", function () {
    // Removing entry points
    return gulp.src(["tests/common/**/*.js", "tests/server/**/*.js", "tests/client/**/*.js"])
        .pipe(istanbul({includeUntested: true}))
        .pipe(istanbul.hookRequire());
});

gulp.task("test", ["test:pre"], function () {
    return gulp.src("tests/tests/**/*.js")
        .pipe(mocha({reporter: "spec"}))
        .pipe(istanbul.writeReports({
            dir: "./coverage",
            reportOpts: {
                dir: "./coverage"
            },
            reporters: ["html"]
        }))
})

gulp.task('tslint', () => {
    const f = filter(["**", "!**/index.d.ts"]);
    return gulp.src("src/**/*.ts*").pipe(f).pipe(tslint())
        .pipe(tslint.report({formatter: 'prose', emitError: false}));
})

gulp.task("default", ["build:common", "build:common:tests", "build:server", "build:server:tests"])
gulp.task("watch", ["watch:common", "watch:common:tests", "watch:server", "watch:server:tests"])
