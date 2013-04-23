module.exports = function(grunt) {

    var pkg     = grunt.file.readJSON('package.json'),
        config  = grunt.file.readJSON('config.json'),
        jsFiles = grunt.file.readJSON('src/static/js/all.json').files;

    jsFiles.forEach(function(v, i) {
        jsFiles[i] = 'src/static/js/' + v;
    });

    // Project configuration.
    grunt.initConfig({

        pkg: pkg,

        clean: {
            dir: {
                src: ['build/*']
            },
            zip: {
                src: ['<%= pkg.name %>.zip']
            },
            scss: {
                src: ['build/**/*.scss']
            },
            js: {
                src: ['build/**/*.js', 'build/**/*.json', '!build/static/js/all.js']
            },
            test: {
                src: ['.grunt', '_SpecRunner.html']
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**', '!**/views/**', '!**/static/js/spec/**'],
                    dest: 'build'
                }]
            }
        },

        sass: {
            options: {
                style: 'compressed'
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: ['**/*.scss', '!**/_*.scss'],
                    dest: 'build/',
                    ext: '.css'
                }]
            }
        },

        concat: {
            dist: {
                src: jsFiles,
                dest: 'build/static/js/all.js'
            }
        },

        uglify: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: ['**/*.js'],
                    dest: 'build/'
                }]
            }
        },

        compress: {
            dist: {
                options: {
                    archive: '<%= pkg.name %>.zip'
                },
                src: ['build/**']
            }
        },

        httpcopy: {
            options: {
                serverUrl: 'http://localhost:' + config.server.port + '/',
                urlMapper: function (serverUrl, filePath) {
                    return serverUrl + filePath.replace(/^src\/views\/pages\//, '');
                }
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/views/pages/',
                    src: ['**/*.html'],
                    dest: 'build/'
                }]
            }
        },

        'ftp-deploy': {
            build: {
                auth: {
                    host: config.deploy.host,
                    port: config.deploy.port,
                    authKey: 'dtg'
                },
                src: 'build',
                dest: config.deploy.dest,
                exclusions: ['**/.DS_Store', '**/Thumbs.db', '**/.gitignore']
            }
        },

        jshint: {
            dist: jsFiles,
            options: config.jshint
        },

        jasmine: {
            dist: {
                src: jsFiles,
                options: {
                    vendor: 'src/static/js/vendor/*.js',
                    specs: 'src/static/js/spec/*.js'
                }
            }
        }

    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-ftp-deploy');
    grunt.loadNpmTasks('grunt-httpcopy');

    // Default task
    grunt.registerTask('default', [
        'clean:dir',
        'copy',
        'sass',
        'clean:scss',
        'concat',
        'clean:js',
        'uglify',
        'httpcopy'
    ]);

    // Test task.
    grunt.registerTask('test', [
        'jshint',
        'jasmine',
        'clean:test'
    ]);

    // Zip task.
    grunt.registerTask('zip', [
        'clean:zip',
        'compress'
    ]);

    // Deploy task.
    grunt.registerTask('deploy', [
        'ftp-deploy'
    ]);

};