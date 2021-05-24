const gulp = require('gulp')
const less = require('gulp-less');
const ts = require('gulp-typescript');
const project = ts.createProject('tsconfig.json')


gulp.task('compile', () => {
  return gulp.src('src/**/*.ts')
    .pipe(project())
    .pipe(gulp.dest('dist/'))
})

gulp.task('less', () => {
  return gulp.src('src/less/*.less')
      .pipe(less())
      .pipe(gulp.dest('dist/css/'))
})

gulp.task('copy', async () => {
  return new Promise((resolve,reject) => {
    gulp.src('README.md').pipe(gulp.dest("dist/"))
    gulp.src("src/module.json").pipe(gulp.dest('dist/'))
    gulp.src("src/lang/**").pipe(gulp.dest('dist/lang/'))
    gulp.src("src/templates/**").pipe(gulp.dest('dist/templates/'))
    gulp.src("src/scripts/*.js").pipe(gulp.dest('dist/scripts/'))
    gulp.src("src/styles/**").pipe(gulp.dest('dist/styles/'))
    gulp.src("src/assets/**").pipe(gulp.dest('dist/assets/'))
    // @ts-ignore
    resolve();
  })
})

gulp.task('build', gulp.parallel('compile', 'less', 'copy'));

// This is supposed to copy the dist folder into the modules directory for testing. Only works if you've set it up the right way
//This works if development path is FoundryVTT/Data/dev/modules/swade-item-macros
const MODULEPATH = "C:/Users/Jacob/AppData/Local/FoundryVTT/Data/modules/global-inventory"

gulp.task('foundry', () => {
  return gulp.src('dist/**').pipe(gulp.dest(MODULEPATH))
})

gulp.task("update", gulp.series('build', 'foundry'))