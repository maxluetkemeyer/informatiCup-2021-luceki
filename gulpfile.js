// Import everything important
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const gutil = require("gulp-util");
const sourcemaps = require("gulp-sourcemaps");

// For SASS -> CSS
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const sassLint = require("gulp-sass-lint");

// HTML
const htmlmin = require("gulp-htmlmin");

// JavaScript
const babel = require("gulp-babel");
//const jshint = require('gulp-jshint');
//const browserify = require('gulp-browserify');
const uglify = require("gulp-uglify");

// Define src and dest folder
const src = "./monitoring";
const dest = "./dist";


/**
 * Sass Task
 */
const sassTask = () => {
    return gulp.src(`${src}/styles/**/*.sass`)
        .pipe(plumber()) // Error Handling
        // Lint SASS
        .pipe(sassLint({
            options: {
                formatter: "stylish",
            },
            rules: {
                "final-newline": 0,
                "no-mergeable-selectors": 1,
                "indentation": 0
            }
        }))
        .pipe(sassLint.format()) // Format SASS
        .pipe(sourcemaps.init()) // Start Source Map
        // Compile SASS -> CSS
        .pipe(sass.sync({
            outputStyle: "compressed"
        })).on("error", sass.logError)
        .pipe(postcss([autoprefixer(), cssnano()])) // Add Autoprefixer & cssNano
        .pipe(sourcemaps.write("")) // Write Source Map
        .pipe(gulp.dest(`${dest}/styles`));
};


/**
 * Skript Task
 */
const script = () => {
    return gulp.src(`${src}/scripts/**/*.js`)
        //Error Handling
        .pipe(plumber(((error) => {
            gutil.log(error.message);
        })))
        .pipe(sourcemaps.init()) // Start Source Map
        // Use Babel
        .pipe(babel({
            presets: ["@babel/env"]
        }))
        // Report of jslint -> TODO: turn off not defined
        // .pipe(jshint())
        // .pipe(jshint.reporter('jshint-stylish'))
        // Browserfy doesnt work yet
        // .pipe(browserify({
        //     insertGlobals: true
        // }))
        .pipe(uglify()) // Minify
        .pipe(sourcemaps.write("")) // Write Sourcemap
        .pipe(gulp.dest(`${dest}/scripts`));
};
/**
 * Copy JS libraries
 */
const libraries = () => {
    return gulp.src(`${src}/libraries/*.*`)
        .pipe(gulp.dest(`${dest}/scripts/libraries`));
};

/**
 * Html Task
 */
const html = () => {
    return gulp.src(`${src}/*.html`)
        .pipe(plumber()) // Error Handling
        // Minified Html
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            html5: true,
            removeEmptyAttributes: true,
            removeTagWhitespace: true,
            sortAttributes: true,
            sortClassName: true
        }))
        .pipe(gulp.dest(`${dest}`));
};

// Media Tasks
/**
 * Copy images
 */
const img = () => {
    return gulp.src(`${src}/img/**/*.*`)
        .pipe(gulp.dest(`${dest}/img`));
};
/**
 * Copy sounds
 */
const sounds = () => {
    return gulp.src(`${src}/sounds/**/*.*`)
        .pipe(gulp.dest(`${dest}/sounds`));
};

// Build Project
const build = gulp.series(sassTask, script, libraries, html, img, sounds);


exports.build = build; // build function (used when type gulp build)
exports.default = build; // Default function (used when type gulp)
