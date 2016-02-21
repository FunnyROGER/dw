'use strict';

var gulp = require('gulp'),
$ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/,
    lazy: true,
    camelize: true
}),
pngquant = require('imagemin-pngquant'),
rimraf = require('rimraf'),
browserSync = require("browser-sync"),
//less = require('gulp-less'),
sass = require('gulp-sass'),
reload = browserSync.reload,
debuga = require('debuga'),
merge = require('merge-stream');

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html: 'src/html/**/*.html', 
        jade: 'src/jade/**/*.jade', 
        js: 'src/js/main.js',
        style: 'src/style/main.scss',
        spriteCss: 'src/style/partials/sprite',
        img: 'src/img/**/*.*',
        sprite: 'src/sprite/**/*.png', 
        svg: 'src/sprite-svg/*.svg', 
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/html/**/*.html', 
        jade: 'src/jade/**/*.jade', 
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        sprite: 'src/sprite/**/*.png', 
        svg: 'src/sprite-svg/*.svg', 
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};


var config = {
    reloadOnRestart: true,
    server: {
        baseDir: "./build",
        middleware: [debuga({
            dist: './build'
        })]
    },
    tunnel: true,
    host: 'localhost',
    port: 666,
    logPrefix: "Furo"
};



gulp.task('html:build', function () {
    gulp.src(path.src.html)
        //.pipe($.jade()) 
        .pipe($.rigger())
        .pipe($.htmlPrettify({indent_char: '  ', indent_size: 1})) 
        .pipe(gulp.dest(path.build.html)) 
        .pipe(reload({stream: true}));
    });

gulp.task('jade:build', function () {
    gulp.src(path.src.jade) 
    .pipe($.jade())
    .pipe($.rigger())
    .pipe($.htmlPrettify({indent_char: '  ', indent_size: 1})) 
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) 
    .pipe($.rigger())
    .pipe($.sourcemaps.init()) 
    .pipe($.uglify())
    .pipe($.sourcemaps.write('maps')) 
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({stream: true})); 
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
    .pipe($.sourcemaps.init())
    .pipe(sass()) 
    .pipe($.autoprefixer())
    .pipe($.minifyCss())
    .pipe($.sourcemaps.write('maps'))
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
    .pipe($.imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()],
        interlaced: true
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}));
});


gulp.task('image:sprite-svg', function () {
    gulp.src(path.src.svg)
    .pipe($.svgmin(function (file) {
        var prefix = path.basename(file.relative, path.extname(file.relative));
        return {
            plugins: [{
                cleanupIDs: {
                    prefix: prefix + '-',
                    minify: true
                }
            }]
        }
    }))
    .pipe($.svgstore())
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}));
});


gulp.task('image:sprite', function () {
    var spriteData = gulp.src(path.src.sprite)
    .pipe($.spritesmithMulti({
        spritesmith: function (options) {
            options.imgPath = '../img/' + options.imgName
        }
    }));

    var imgStream = spriteData.img
    .pipe(gulp.dest(path.build.img));

    var cssStream = spriteData.css
    .pipe($.extReplace('.scss'))
    .pipe(gulp.dest(path.src.spriteCss));

    spriteData.pipe(reload({stream: true}));
    return merge(imgStream, cssStream)
    spriteData.pipe(reload({stream: true}));
})


gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});


gulp.task('build', [
    //'image:sprite',
    'html:build',
    //'jade:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
    'image:sprite-svg'
    ]);


gulp.task('watch', function(){
    $.watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
/*    $.watch([path.watch.jade], function(event, cb) {
        gulp.start('jade:build');
    });*/
    $.watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    $.watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    $.watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    $.watch([path.watch.svg], function(event, cb) {
        gulp.start('image:sprite-svg');
    });
    /*  $.watch([path.watch.sprite], function(event, cb) {
        gulp.start('image:sprite');
    });*/
    $.watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);