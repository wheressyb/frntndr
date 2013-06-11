var fs = require('fs');
JSON.minify = require('jsonminify');

module.exports = function(grunt) {

    var pkg     = grunt.file.readJSON('package.json'),
        config  = grunt.file.readJSON('config.json');

    // Project configuration.
    grunt.initConfig({

        pkg: pkg,

        clean: {
            dir: {
                src: ['build/*']
            },
            test: {
                src: ['.grunt', '_SpecRunner.html']
            },
            zip: {
                src: ['<%= pkg.name %>.zip']
            }
        },

        sass: {
            options: {
                style: 'compressed',
                noCache: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/static/scss/',
                    src: ['**/*.scss', '!**/_*.scss'],
                    dest: 'src/static/css/',
                    ext: '.css'
                }]
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**', '!**/*.{html,js}', '!**/layout/**', '!**/components/**', '!**/static/scss/**'],
                    dest: 'build'
                }]
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

        httpcopy: {
            options: {
                serverUrl: 'http://localhost:' + config.server.port + '/',
                urlMapper: function(serverUrl, filePath) {
                    return serverUrl + filePath.replace(/^src\//, '');
                }
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.{html,js}', '!**/layout/**', '!**/components/**', '!**/js/spec/**'],
                    dest: 'build/'
                }]
            }
        },

        jshint: {
            dist: [
                'src/static/js/**/*.js',
                grunt.file.read('.jshintignore').trim().split('\n').map(function(s) { return '!' + s; })
            ],
            options: JSON.parse(JSON.minify(fs.readFileSync('.jshintrc', 'utf8')))
        },

        jasmine: {
            dist: {
                src: ['src/static/js/**/_*.js'],
                options: {
                    vendor: 'src/static/js/vendor/*.js',
                    specs: 'src/static/js/spec/*.js'
                }
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

        'ftp-deploy': {
            build: {
                auth: {
                    host: config.build.deploy.host,
                    port: config.build.deploy.port,
                    authKey: 'dtg'
                },
                src: 'build',
                dest: config.build.deploy.dest,
                exclusions: ['**/.DS_Store', '**/Thumbs.db', '**/.gitignore']
            }
        }

    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-ftp-deploy');
    grunt.loadNpmTasks('grunt-httpcopy');

    // Default task
    grunt.registerTask('default', [
        'clean:dir',
        'sass',
        'copy',
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