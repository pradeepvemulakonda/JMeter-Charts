requirejs.config({
    baseUrl: 'js',
    paths: {
        'jquery': 'lib/jquery/jquery',
        'jquery.bootstrap': 'lib/bootstrap/dist/js/bootstrap',
        'rest': 'rest',
        'd3': 'lib/d3/d3',
        'tip': 'lib/d3-tip/index',
        'mustache': 'lib/mustache/mustache',
        'chart': 'chart',
        'upload': 'upload',
        'compare': 'compare',
        'angular': 'lib/angular/angular',
        'angularRoute': 'lib/angular-route/angular-route',
        'angularMocks': 'lib/angular-mocks/angular-mocks',
        'text': 'lib/requirejs-text/text'
    },
    shim: {
        'jquery.bootstrap': {
            deps: ['jquery']
        },

        'lib/metisMenu/dist/metisMenu': {
        	deps: [ 'jquery' ],
            exports: 'jQuery.fn.metisMenu'
        },

        'lib/bootstrap-combobox/js/bootstrap-combobox': {
        	deps: [ 'jquery']
        },

        'lib/typeahead.js/dist/typeahead.bundle.min': {
        	deps: [ 'jquery']
        },

		'lib/Scroll-To/scrollTo': {
        	deps: [ 'jquery']
        },

        d3 : {
            exports : 'd3'
        },

        tip : {
        	deps: ['d3']
        },

        'mustache': {
            exports: 'Mustache'
        },

        'compare': {
        	exports: 'Compare'
        },

        'angular' : {'exports' : 'angular'},

        'angularRoute': ['angular'],

        'angularMocks': {
            deps:['angular'],
            'exports':'angular.mock'
        }
    },

    priority: [
        'angular'
    ]
});
// load the main js file
require(['angular','app', 'main', 'controller/controllers'], function(angular, app, main) {
        var $html = angular.element(document.getElementsByTagName('html')[0]);
        angular.element().ready(function() {
            // bootstrap the app manually
            angular.bootstrap(document, ['JMeterCharts', 'MainController']);
        });
    });