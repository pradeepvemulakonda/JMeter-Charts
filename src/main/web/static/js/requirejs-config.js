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
        'compare': 'compare'
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
        }
    }
});
// load the main js file
require(['main']);