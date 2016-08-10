/*global require, module,  __dirname */
/*jslint node: true */

'use strict';

var gulp = require('gulp');

var
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	clean = require('del'),
	runSequence = require('run-sequence'),
	concat = require('gulp-concat'),
	watch = require('gulp-watch'),
	autopolyfiller = require("gulp-autopolyfiller"),
	order = require('gulp-order'),
	merge = require('event-stream').merge,
	sprite = require('gulp.spritesmith'),
	rename = require('gulp-rename'),
	replace = require('gulp-replace'),
	path = require('path'),
	fs = require('fs'),
	gls = require('gulp-live-server');


gulp.task('serve', function() {
	var server = gls.static(['dist']);
	server.start();


	//use gulp.watch to trigger server actions(notify, start or stop)
	gulp.watch(['dist/css/**/*.css', 'dist/**/*.html'], function (file) {
		server.notify.apply(server, [file]);
	});

	gulp.watch(['scss/**/*.scss', '!scss/sprites/*.*', jsSource], function() {
		console.log('---------------------------------');
		gulp.start('default');
	});

});

var jsSource = [
	'bower_components/jquery/dist/jquery.min.js'
];

gulp.task('clean', function () {
	return clean('css/**/*.css', {force: true});
});

/* task scripts
 * spojuje vsechny scripty s jsSource do jedneho
 * a pridava polyfilly pro stare prohlizece
 */

gulp.task('scripts', function () {
	var scripts = gulp.src(jsSource)
		.pipe(concat('all.js'));
	var polyfills = scripts
		.pipe(autopolyfiller('polyfills.js', function () {
			browsers: ['last 3 versions']
		})
	);
	return merge(polyfills, scripts)
		// Order files. polyfills MUST be first!
		.pipe(order([
			'polyfills.js',
			'all.js'
		]))
		.pipe(concat('main.js'))
		.pipe(gulp.dest('js'));
});

/*
 * sass a autoprefixer v jednem tasku
 * vychozi soubor css/main.css
 *
 * ignoruje soubory se sprity
 */

gulp.task('styles', function () {
	return gulp.src(['scss/**/*.scss', '!scss/sprites/*.*'])
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 4 versions'],
			cascade: false
		}))
		.pipe(concat('main.css'))
		.pipe(gulp.dest('dist/css'));
});

/*
 * funkce která prochází všemi složky se sprity
 * a zpracová je po jedné v cyklu
 * aby se nevytvoril jeden velky spite ze vsech ikonek
 */

function getFolders(dir) {
	return fs.readdirSync(dir)
		.filter(function(file) {
		return fs.statSync(path.join(dir, file)).isDirectory();
		});
}

var pathToSprites = 'sprites';

/*
 * toto je task na vytvoreni scss stylu,
 * do slozky img/sprites/nazevSpritu/
 * vlozime jen obrazky (ikonky)
 *
 * task spriteScss vytvori scss soubor,
 * ve kterem bude zaklad pro mixiny
 * ukazky pouziti jsou ve stylovech souberech
 *
 * pokud mame obrazky pro hover,
 * tento obrazek musi mit nazev *nazevObrazku-hover*
 *
 * muzeme udelat vice sprajtu najednou,
 * pro to musime vytvorit samostatnou slozku
 * pro kazdou sadu obrazku
 * napriklad:
 * img/sprites/nazevSpritu1
 * img/sprites/nazevSpritu2
 *
 * tvorit mixiny je nutne v jinych souborech
 * nez vytvorenych taskem
 * pridat na zacatku @import "sprite-nazevSpritu.scss"
 *
 * ------------!important!-----------------
 * nepouzivat v nazvu obrazku velka pismena,
 * jinak, z "HTML.png" bude $-h-t-m-l-name: 'HTML'
 */

gulp.task('spritesScss', function() {
	var folders = getFolders(pathToSprites);
	var tasks = folders.map(function(folder) {
	var source = pathToSprites + '/' + folder + '/*.*';

	if (folder !== 'templates'){
		var spriteData = gulp.src(source)
				.pipe(sprite({
					imgName: 'sprite.png',
					cssName: 'sprite.scss',
					cssTemplate: 'img/sprites/templates/scss.spriteTemplate.handlebars'
				}));
		return merge(
			spriteData.img
				.pipe(rename (function (path){
					path.dirname = '';
					path.basename = 'sprite-' + folder;
				}))
				.pipe(gulp.dest('img/')),

			spriteData.css
				.pipe(rename (function (path){
						path.dirname = 'sprites/';
						path.basename = 'sprite-' + folder;
				}))
				.pipe(replace('$spritePath: "";', function (){
							  return '$spritePath: "../img/' + 'sprite-' + folder + '.png";';
				}))
				.pipe(gulp.dest('scss/'))
		);
	}
  });
});

gulp.task('default', function() {
	runSequence('clean',
			'spritesScss',
			['styles', 'scripts']
	);
});

gulp.task('watch', function () {
	gulp.watch(['scss/**/*.scss', '!scss/sprites/*.*', jsSource], function() {
		console.log('---------------------------------');
		gulp.start('default');
	});
});
