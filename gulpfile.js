var gulp =  require('gulp'), // Gulp
    sass = require('gulp-sass'), // Sass Compiler
    webserver = require('gulp-webserver'), // Web Server
    jshint = require('gulp-jshint'), // JS Hint Javascript Test
    stylish = require('jshint-stylish'), // More Stylish View for JS Hint
    clean = require('gulp-clean'), // Delete-Clean folder
    concat = require('gulp-concat'), // Combine JS files
    uglify = require('gulp-uglify'), // Compress JS files
    lbInclude = require('gulp-lb-include'), // Include HTML templates in to HTML
    htmlclean = require('gulp-htmlclean'), // Clean HTML file
    replace = require('gulp-replace'), // Replace string
    mkdirp = require('mkdirp'), // Create Directory
    rename = require("gulp-rename"), // Rename files
    exec = require('gulp-exec'), // Runs shell command from gulp
    gulpsync = require('gulp-sync')(gulp), // Sync tasks
    insert = require('gulp-insert'), // Insert string to any file.
    webshot=require('gulp-webshot'), // Taking screenshots
    imageResize = require('gulp-image-resize'), // Resize images
    gulpIgnore = require('gulp-ignore'), // Filter gulp selection
    imagemin = require('gulp-imagemin'); // Optimize Images


/********************* Editable : Project Properties *********************/
var CompanyName = 'MyCompany', // First letter capitalized or all uppercase
    BrandShorthand = 'MC', // All uppercase Ex : Takeda = MC 
    JobNum = '100001', // Job number
    ProductName = 'My_Product' // First letter capitalized, Use underscore instead of space
    Extention = 'Extention_Name',
    Version = '1'; // Version of presentation
    SlideCount = 2, // Slidecount should be equal to HTML slide you created in root folder. and it must start from 1 to total slide count.
    Year = 2016;

// Hidden Presentations [PresentationName, SlideCount]
var HiddenPresentations = [
    ['HiddenPresentation','1'],
    ['OtherHiddenPresentation','1']
];

/********************* End of Project Properties *********************/

var Title = CompanyName + ' ' + ProductName + ' v'+ Version;

var PresentationName = BrandShorthand + '_' + JobNum + '_' + ProductName + '_' + Extention;
var tmpSlideName = 'v'+Version+'_P{0}_'+ProductName+'_'+ Extention;

var HiddenPresentationName = BrandShorthand + '_' + JobNum + '_' + ProductName + '_{1}_HIDDEN';
var HiddenPageName = 'v'+Version+'_P{0}_' + ProductName + '_{1}_HIDDEN';

var path = {
    srcbase : './src',
    srcassets: './src/assets',
    srcjs: './src/js',
    // Development Paths
    devbase : './web',
    devassets : './web/assets',
    devjs : './web/js',
    // Build Paths
    buildbase : './'+PresentationName,
    buildassets : './'+ PresentationName +'/{slide}/assets',
    buildjs : './'+PresentationName+'/{slide}/js',
    // Hidden Presentation Build base
    buildbaseHidden : './'+HiddenPresentationName,
    buildassetsHidden : './'+ HiddenPresentationName +'/{slide}/assets',
    buildjsHidden : './'+HiddenPresentationName+'/{slide}/js'
};

/********************* Editable : Project Scripts *********************/

var Scripts = [
path.srcjs + '/lib/jquery-2.2.4.min.js',
path.srcjs + '/lib/iscroll-lite.js',
path.srcjs + '/lib/veeva-library-4.2.js',
path.srcjs + '/app.js']; // app.js should be last

/********************* End of Project Scripts *********************/

    //*** DEBUG MODE BEGIN (default) ------------------------------------------------------------------------------------
    gulp.task('default', gulpsync.sync(['debug-clean','jshint','handle-html','compilejs','compilejs:watch','handle-hidden-html','handle-html:watch','copy-images','copy-images:watch','copy-fonts','copy-fonts:watch','copy-video','copy-video:watch','styles','styles:watch','webserver']));

    // **** Test Javascript
    gulp.task('jshint', function() { return gulp.src(path.srcjs+'/*.js').pipe(jshint()).pipe(jshint.reporter(stylish)); });

    // **** Clean Folder
    gulp.task('debug-clean', function () {  return gulp.src(path.devbase, {read: false}).pipe(clean({force: true})); });

    // **** Compile SASS
    gulp.task('styles', function() { return gulp.src(path.srcassets + '/style.scss').pipe(sass().on('error', sass.logError)).pipe(sass({outputStyle: 'compressed'})).pipe(gulp.dest(path.devassets)) });
    gulp.task('styles:watch', function () { return gulp.watch(path.srcassets + '/style.scss', ['styles']) }); // Watch SASS files

     // **** Concat and Compress Javascripts
    gulp.task('compilejs', function() { return gulp.src(Scripts).pipe(concat('all.js')).pipe(insert.prepend("var presentationName='"+ PresentationName +"',tmpSlideName='"+ tmpSlideName +"',hiddenPresentationName='"+ HiddenPresentationName +"',hiddenPageName='"+ HiddenPageName +"',production=false;")).pipe(uglify()).pipe(gulp.dest(path.devjs+'/')); });
    gulp.task('compilejs:watch', function () { return gulp.watch(path.srcjs+'/*.js', ['compilejs']) }); // Watch javascript files

    // **** Generate HTML Files
    gulp.task('handle-html', function() {
        for (var i = 1; i <= SlideCount; i++) { // Copy slides one by one...
            var slidePath = path.srcbase + '/slide'+ i +'.html';
            gulp.src(slidePath) // Read HTML
            .pipe(lbInclude()) // Apply Templates
            .pipe(replace('{{Title}}', Title + ' Slide '+ i)) // Replace Title
            .pipe(replace('{{CompanyName}}', CompanyName))
            .pipe(replace('{{Year}}', Year))
            .pipe(htmlclean()) // Clean HTML
            .pipe(gulp.dest(path.devbase)); // Export Files
        }
    });
    // **** Generate Hidden Slide HTML Files
    gulp.task('handle-hidden-html', function() {
        // Loop Hidden Presentations
        for (var i = 0; i < HiddenPresentations.length; i++) {
            // Get Info
            var name = HiddenPresentations[i][0];
            var count = HiddenPresentations[i][1];
            // Loop Slides
            for (var x = 0; x < count; x++) {
                var slidePath = path.srcbase + '/' + name + '_slide' + (x+1) + '.html';
                gulp.src(slidePath) // Read HTML
                .pipe(lbInclude()) // Apply Templates
                .pipe(replace('{{Title}}', Title + ' Slide '+ i)) // Replace Title
                .pipe(replace('{{CompanyName}}', CompanyName))
                .pipe(replace('{{Year}}', Year))
                .pipe(htmlclean()) // Clean HTML
                .pipe(gulp.dest(path.devbase)); // Export Files
            }
        }
    });
    gulp.task('handle-html:watch', function () { return gulp.watch( [path.srcbase + '/*.html',path.srcbase + '/templates/*'], ['handle-html','handle-hidden-html']) }); // Watch HTML files

    // **** Copy Images
    gulp.task('copy-images', function() {
      return gulp.src(path.srcassets + '/img/**').pipe(gulp.dest(path.devassets+'/img'))  // Images
    });
    gulp.task('copy-images:watch', function () { return gulp.watch( [path.srcassets + '/img/**',path.srcassets + '/img/**/**'], ['copy-images']) }); // Watch Images

    // **** Copy Fonts
    gulp.task('copy-fonts', function() {
      return gulp.src(path.srcassets + '/fonts/**').pipe(gulp.dest(path.devassets+'/fonts'))  // Fonts
    });
    gulp.task('copy-fonts:watch', function () { return gulp.watch( path.srcassets + '/fonts/*', ['copy-fonts']) }); // Watch Fonts

    // **** Copy Videos
    gulp.task('copy-video', function() {
      return gulp.src(path.srcassets + '/video/**').pipe(gulp.dest(path.devassets+'/video'))  // Videos
    });
    gulp.task('copy-video:watch', function () { return gulp.watch( path.srcassets + '/video/*', ['copy-video']) }); // Watch Videos


    // **** Start HTTP Server and open default page
    gulp.task('webserver', function() {
      return gulp.src(path.devbase + '/')
        .pipe(webserver({
          fallback: 'slide1.html',
          livereload: true,
          directoryListing: { enable: true, path: path.devbase + '/' },
          open: true
        }));
    });
    //*** END OF DEBUG MODE ---------------------------------------------------------------------------------------------


    //*** BUILD FOR VEEVA BEGIN -----------------------------------------------------------------------------------------
    gulp.task('build', gulpsync.sync(['build-clean','build-createfolders','build-compilejs','build-sass','build-assets','build-webshot','build-full','build-thumb','build-delete-webshot','build-shell-zip','build-hidden']));
    gulp.task('build-optimize', gulpsync.sync(['build-clean','build-createfolders','build-compilejs','build-sass','build-assets-optimize','build-webshot','build-full-optimize','build-thumb-optimize','build-delete-webshot','build-shell-zip','build-hidden-optimize']));

    // **** Clean Folder
    gulp.task('build-clean', function () {  return gulp.src(path.buildbase, {read: false}).pipe(clean({force: true})); });

    // Build forlders first
    gulp.task('build-createfolders', function(){
        // Loop slides
        for (var i = 1; i <= SlideCount; i++) {
            // Generate Slide Name
            var slideName =  tmpSlideName.replace('{0}',i);
            // Create Folder
            mkdirp(path.buildbase + '/' + slideName);
            // Move HTML files and rename
            var slidePath = path.srcbase + '/slide'+ i +'.html';
            gulp.src(slidePath) // Read HTML
            .pipe(lbInclude()) // Apply Templates
            .pipe(replace('{{Title}}', Title + ' Slide '+ i)) // Replace Title
            .pipe(replace('{{CompanyName}}', CompanyName)) // Replace Company Name
            .pipe(replace('{{Year}}', Year)) // Replace Year
            .pipe(htmlclean()) // Clean HTML
            .pipe(rename(path.buildbase+'/'+slideName+'/'+slideName+'.html')) // Rename File
            .pipe(gulp.dest('./')) // Export File
        }
    });

    // Concat and compress javascript
    gulp.task('build-compilejs', function(){
        var p = gulp.src(Scripts).pipe(concat('all.js')).pipe(insert.prepend("var presentationName='"+ PresentationName +"',tmpSlideName='"+ tmpSlideName +"',hiddenPresentationName='"+ HiddenPresentationName +"',hiddenPageName='"+ HiddenPageName +"',production=true;")).pipe(uglify());
        for (var i = 1; i <= SlideCount; i++) {
            p = p.pipe(gulp.dest(path.buildjs.replace('{slide}',tmpSlideName.replace('{0}',i))))
        }
        return p;
    });

    // Build and compress sass
    gulp.task('build-sass', function(){
        var p = gulp.src(path.srcassets + '/style.scss').pipe(sass().on('error', sass.logError)).pipe(sass({outputStyle: 'compressed'}));
        for (var i = 1; i <= SlideCount; i++) {
            var slideName = tmpSlideName.replace('{0}',i);
            p = p.pipe(gulp.dest(path.buildassets.replace('{slide}',slideName)))
        }
        return p;
    });

    // Build and copy images
    gulp.task('build-assets', function(){
        var fonttask = gulp.src(path.srcassets + '/fonts/*');
        var imagetask = gulp.src(path.srcassets + '/img/*.{jpg,png,gif,svg}');
        for (var i = 1; i <= SlideCount; i++) {
            var slideName = tmpSlideName.replace('{0}',i);

            // Shared
            fonttask = fonttask.pipe(gulp.dest(path.buildassets.replace('{slide}',slideName)+'/fonts')) // Shared Fonts
            imagetask = imagetask.pipe(gulp.dest(path.buildassets.replace('{slide}',slideName)+'/img')) // Shared Images

            console.log('Copy Assets : ' + slideName + ' slide'+i);

            // Page Spesific                        
            gulp.src(path.srcassets + '/img/slide'+i+'/*').pipe(gulp.dest(path.buildassets.replace('{slide}',slideName)+'/img/slide'+i)) // Images
            gulp.src(path.srcassets + '/video/slide'+i+'/*').pipe(gulp.dest(path.buildassets.replace('{slide}',slideName)+'/video/slide'+i))  // Videos
        }
    });

    // Build and copy images
    gulp.task('build-assets-optimize', function(){
        var fonttask = gulp.src(path.srcassets + '/fonts/*');
        var imagetask = gulp.src(path.srcassets + '/img/*.{jpg,png,gif,svg}');
        for (var i = 1; i <= SlideCount; i++) {
            var slideName = tmpSlideName.replace('{0}',i);

            // Shared
            fonttask = fonttask.pipe(gulp.dest(path.buildassets.replace('{slide}',slideName)+'/fonts')) // Shared Fonts
            imagetask = imagetask.pipe(imagemin()).pipe(gulp.dest(path.buildassets.replace('{slide}',slideName)+'/img')) // Shared Images

            // Page Spesific                        
            gulp.src(path.srcassets + '/img/slide'+i+'/*').pipe(imagemin()).pipe(gulp.dest(path.buildassets.replace('{slide}',slideName)+'/img/slide'+i)) // Images
            gulp.src(path.srcassets + '/video/slide'+i+'/*').pipe(gulp.dest(path.buildassets.replace('{slide}',slideName)+'/video/slide'+i))  // Videos
        }
    });

    // Takes Screenshot of pages one by one
    gulp.task('build-webshot', function() {
      return gulp.src(path.buildbase + '/**/*.html')
        .pipe(webshot({ dest:'/',root:'/',windowSize : { width:1024, height:768 },shotSize:{ width:1024, height:768 }}))
    });

    // Save as captured png as a jpg and rename (Full Size)
    gulp.task('build-full', function () {
       return gulp.src([path.buildbase + '/**/*.png','!'+path.buildbase + '/**/assets/**'])
       .pipe(rename(function (path) {
            path.basename += "-full";
            path.extname = ".jpg"
        }))
       .pipe(gulp.dest(path.buildbase))
    });

    // Save as captured png as a jpg and rename (Full Size)
    gulp.task('build-full-optimize', function () {
       return gulp.src([path.buildbase + '/**/*.png','!'+path.buildbase + '/**/assets/**'])
       .pipe(rename(function (path) {
            path.basename += "-full";
            path.extname = ".jpg"
        }))
       .pipe(imagemin())
       .pipe(gulp.dest(path.buildbase))
    });

    // Resize and save as captured png as a jpg and rename (Thumb Size)
    gulp.task('build-thumb', function () {
       return gulp.src([path.buildbase + '/**/*.png','!'+path.buildbase + '/**/assets/**'])
       .pipe(imageResize({ format:'jpeg',width : 400, height : 300, crop : true, upscale : false })) // Resize Image
        .pipe(rename(function (path) {
            path.basename += "-thumb";
            path.extname = ".jpg"
        }))
        .pipe(gulp.dest(path.buildbase));
    });

    // Resize and save as captured png as a jpg and rename (Thumb Size)
    gulp.task('build-thumb-optimize', function () {
       return gulp.src([path.buildbase + '/**/*.png','!'+path.buildbase + '/**/assets/**'])
       .pipe(imageResize({ format:'jpeg',width : 400, height : 300, crop : true, upscale : false })) // Resize Image
        .pipe(rename(function (path) {
            path.basename += "-thumb";
            path.extname = ".jpg"
        }))
        .pipe(imagemin())
        .pipe(gulp.dest(path.buildbase));
    });

    // Delete Old file
    gulp.task('build-delete-webshot', function() {
      return gulp.src([path.buildbase + '/**/*.png','!'+path.buildbase + '/**/assets/**']).pipe(clean({force: true}));
    });


    // Build Zip files with Shell Command
    gulp.task('build-shell-zip', function(){
        for (var i = 1; i <= SlideCount; i++) {
            var slideName =  tmpSlideName.replace('{0}',i);
            gulp.src(path.buildbase+'/'+ slideName+'/').pipe(exec('cd '+ path.buildbase +'; zip -r "'+slideName +'.zip" "' + slideName +'"'))
        }
    });


    //*** END OF BUILD FOR VEEVA ----------------------------------------------------------------------------------------


    //*** BUILD HIDDEN FOR VEEVA BEGIN -----------------------------------------------------------------------------------------
    gulp.task('build-hidden', gulpsync.sync(['hidden-clean','hidden-createfolders','hidden-compilejs','hidden-sass','hidden-assets','hidden-webshot','hidden-full','hidden-thumb','hidden-delete-webshot','hidden-shell-zip']));
    gulp.task('build-hidden-optimize', gulpsync.sync(['hidden-clean','hidden-createfolders','hidden-compilejs','hidden-sass','hidden-assets-optimize','hidden-webshot','hidden-full','hidden-thumb','hidden-delete-webshot','hidden-shell-zip']));

    // **** Clean Folder
    gulp.task('hidden-clean', function () {  
        var tmpPaths = [];
        for (var i = 0; i < HiddenPresentations.length; i++) {
            tmpPaths.push(path.buildbaseHidden.replace('{1}',HiddenPresentations[i][0]));
        }
        return gulp.src(tmpPaths, {read: false}).pipe(clean({force: true}));
    });

    // **** Generate Hidden Slide HTML Files
    gulp.task('hidden-createfolders', function() {
        // Loop Hidden Presentations
        for (var i = 0; i < HiddenPresentations.length; i++) {
            // Get Info
            var name = HiddenPresentations[i][0];
            var count = HiddenPresentations[i][1];

            // Create Presentation Folder
            var tmpPresentationFolder = path.buildbaseHidden.replace('{1}',name);
            mkdirp(tmpPresentationFolder);

            // Loop Slides
            for (var x = 0; x < count; x++) {

                var tmpHiddenSlideName = HiddenPageName.replace('{0}',(x+1)).replace('{1}',name);

                // Create Slide Folder
                mkdirp(tmpPresentationFolder+'/'+tmpHiddenSlideName);

                // Get Slide
                var slidePath = path.srcbase + '/' + name + '_slide' + (x+1) + '.html';

                gulp.src(slidePath) // Read HTML
                .pipe(lbInclude()) // Apply Templates
                .pipe(replace('{{Title}}', Title + ' Slide '+ i)) // Replace Title
                .pipe(replace('{{CompanyName}}', CompanyName))
                .pipe(replace('{{Year}}', Year))
                .pipe(htmlclean()) // Clean HTML
                .pipe(rename(tmpPresentationFolder+'/'+ tmpHiddenSlideName +'/'+ tmpHiddenSlideName +'.html')) // Rename File
                .pipe(gulp.dest('./')) // Export File
            }
        }
    });

    // Concat and compress javascript
    gulp.task('hidden-compilejs', function(){
        var p = gulp.src(Scripts).pipe(concat('all.js')).pipe(insert.prepend("var presentationName='"+ PresentationName +"',tmpSlideName='"+ tmpSlideName +"',hiddenPresentationName='"+ HiddenPresentationName +"',hiddenPageName='"+ HiddenPageName +"',production=true;")).pipe(uglify());
        // Loop Hidden Presentations
        for (var i = 0; i < HiddenPresentations.length; i++) {
            // Get Info
            var name = HiddenPresentations[i][0];
            var count = HiddenPresentations[i][1];
            var tmpPresentationFolder = path.buildbaseHidden.replace('{1}',name);
            // Loop Slides
            for (var x = 0; x < count; x++) {
                var tmpHiddenSlideName = HiddenPageName.replace('{0}',(x+1)).replace('{1}',name);
                var targetPath = path.buildjsHidden.replace('{slide}',tmpHiddenSlideName).replace('{1}',name);
                // Save JS file every slide in every presentation container
                p = p.pipe(gulp.dest(targetPath))
            }
        }
        return p;
    });

    // Build and compress sass
    gulp.task('hidden-sass', function(){
        var p = gulp.src(path.srcassets + '/style.scss').pipe(sass().on('error', sass.logError)).pipe(sass({outputStyle: 'compressed'}));
        // Loop Hidden Presentations
        for (var i = 0; i < HiddenPresentations.length; i++) {
            // Get Info
            var name = HiddenPresentations[i][0];
            var count = HiddenPresentations[i][1];
            var tmpPresentationFolder = path.buildbaseHidden.replace('{1}',name);
            // Loop Slides
            for (var x = 0; x < count; x++) {
                var tmpHiddenSlideName = HiddenPageName.replace('{0}',(x+1)).replace('{1}',name);
                var targetPath = path.buildassetsHidden.replace('{slide}',tmpHiddenSlideName).replace('{1}',name);
                p = p.pipe(gulp.dest(targetPath))
            }
        }
        return p;
    });


    // Build and copy images
    gulp.task('hidden-assets', function(){
        var fonttask = gulp.src(path.srcassets + '/fonts/*');
        var imagetask = gulp.src(path.srcassets + '/img/*.{jpg,png,gif,svg}');

        // Loop Hidden Presentations
        for (var i = 0; i < HiddenPresentations.length; i++) {
            // Get Info
            var name = HiddenPresentations[i][0];
            var count = HiddenPresentations[i][1];
            var tmpPresentationFolder = path.buildbaseHidden.replace('{1}',name);
            // Loop Slides
            for (var x = 0; x < count; x++) {
                var s = x+1;
                var tmpHiddenSlideName = HiddenPageName.replace('{0}',s).replace('{1}',name);
                var targetPath = path.buildassetsHidden.replace('{slide}',tmpHiddenSlideName).replace('{1}',name);

                // Shared
                fonttask = fonttask.pipe(gulp.dest(targetPath+'/fonts')) // Shared Fonts 
                imagetask = imagetask.pipe(gulp.dest(targetPath+'/img')) // Shared Images

                console.log('Copy Hidden Assets from : ' + path.srcassets + '/img/'+ name +'_slide'+s+'/* to : ' + targetPath+'/img/'+ name +'slide'+s);

                // Page Spesific                        
                gulp.src(path.srcassets + '/img/'+ name +'_slide'+s+'/*').pipe(gulp.dest(targetPath+'/img/'+ name +'_slide'+s)) // Images
                gulp.src(path.srcassets + '/video/'+ name +'_slide'+s+'/*').pipe(gulp.dest(targetPath+'/video/'+ name +'_slide'+s))  // Videos
            }
        }
    });

    // Build and copy images
    gulp.task('hidden-assets-optimize', function(){
        var fonttask = gulp.src(path.srcassets + '/fonts/*');
        var imagetask = gulp.src(path.srcassets + '/img/*.{jpg,png,gif,svg}');

        // Loop Hidden Presentations
        for (var i = 0; i < HiddenPresentations.length; i++) {
            // Get Info
            var name = HiddenPresentations[i][0];
            var count = HiddenPresentations[i][1];
            var tmpPresentationFolder = path.buildbaseHidden.replace('{1}',name);
            // Loop Slides
            for (var x = 0; x < count; x++) {
                var s = x+1;
                var tmpHiddenSlideName = HiddenPageName.replace('{0}',s).replace('{1}',name);
                var targetPath = path.buildassetsHidden.replace('{slide}',tmpHiddenSlideName).replace('{1}',name);

                // Shared
                fonttask = fonttask.pipe(gulp.dest(targetPath+'/fonts')) // Shared Fonts 
                imagetask = imagetask.pipe(imagemin()).pipe(gulp.dest(targetPath+'/img')) // Shared Images

                // Page Spesific                        
                gulp.src(path.srcassets + '/img/'+ name +'_slide'+s+'/*').pipe(imagemin()).pipe(gulp.dest(targetPath+'/img/'+ name +'_slide'+s)) // Images
                gulp.src(path.srcassets + '/video/'+ name +'_slide'+s+'/*').pipe(gulp.dest(targetPath+'/video/'+ name +'_slide'+s))  // Videos
            }
        }
    });


    // Takes Screenshot of pages one by one
    gulp.task('hidden-webshot', function() {
       var tmpPaths = [];
        for (var i = 0; i < HiddenPresentations.length; i++) {
            tmpPaths.push(path.buildbaseHidden.replace('{1}',HiddenPresentations[i][0]) + '/**/*.html');
        }
        return gulp.src(tmpPaths)
        .pipe(webshot({ dest:'/',root:'/',windowSize : { width:1024, height:768 },shotSize:{ width:1024, height:768 }}))
    });

    // Save as captured png as a jpg and rename (Full Size)
    gulp.task('hidden-full', function () {
       var tmpPaths = [];
        for (var i = 0; i < HiddenPresentations.length; i++) {
            tmpPaths.push(path.buildbaseHidden.replace('{1}',HiddenPresentations[i][0]) + '/**/*.png');
            tmpPaths.push('!'+ path.buildbaseHidden.replace('{1}',HiddenPresentations[i][0]) + '/**/assets/**');
        }
       return gulp.src(tmpPaths, {base: "./"})
       .pipe(rename(function (path) {
            path.basename += "-full";
            path.extname = ".jpg"
        }))
       .pipe(gulp.dest('./'))
    });

    // Resize and save as captured png as a jpg and rename (Thumb Size)
    gulp.task('hidden-thumb', function () {
        var tmpPaths = [];
        for (var i = 0; i < HiddenPresentations.length; i++) {
            tmpPaths.push(path.buildbaseHidden.replace('{1}',HiddenPresentations[i][0]) + '/**/*.png');
            tmpPaths.push('!'+ path.buildbaseHidden.replace('{1}',HiddenPresentations[i][0]) + '/**/assets/**');
        }
        return gulp.src(tmpPaths, {base: "./"})
       .pipe(imageResize({ format:'jpeg',width : 400, height : 300, crop : true, upscale : false })) // Resize Image
        .pipe(rename(function (path) {
            path.basename += "-thumb";
            path.extname = ".jpg"
        }))
        .pipe(gulp.dest('./'));
    });

    // Delete Old file
    gulp.task('hidden-delete-webshot', function() {
        var tmpPaths = [];
        for (var i = 0; i < HiddenPresentations.length; i++) {
            tmpPaths.push(path.buildbaseHidden.replace('{1}',HiddenPresentations[i][0]) + '/**/*.png');
            tmpPaths.push('!'+ path.buildbaseHidden.replace('{1}',HiddenPresentations[i][0]) + '/**/assets/**');
        }
        return gulp.src(tmpPaths).pipe(clean({force: true}));
    });

    // Build Zip files with Shell Command
    gulp.task('hidden-shell-zip', function(){
        // Loop Hidden Presentations
        for (var i = 0; i < HiddenPresentations.length; i++) {
            // Get Info
            var name = HiddenPresentations[i][0];
            var count = HiddenPresentations[i][1];
            var tmpPresentationFolder = path.buildbaseHidden.replace('{1}',name);
            // Loop Slides
            for (var x = 0; x < count; x++) {
                var tmpHiddenSlideName = HiddenPageName.replace('{0}',(x+1)).replace('{1}',name);
                var targetPath = path.buildassetsHidden.replace('{slide}',tmpHiddenSlideName).replace('{1}',name);

                gulp.src(targetPath).pipe(exec('cd '+ tmpPresentationFolder +'; zip -r "'+tmpHiddenSlideName +'.zip" "' + tmpHiddenSlideName +'"'))

            }
        }
    });




    //*** OTHER COMMANDS -----------------------------------------------------------------------------------------
    gulp.task('clean', gulpsync.sync(['debug-clean','build-clean','hidden-clean']));

