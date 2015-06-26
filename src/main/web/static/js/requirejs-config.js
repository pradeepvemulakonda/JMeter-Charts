// Copyright 2015 Pradeep Vemulakonda

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the License at

//   http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.
requirejs.config({
    baseUrl: 'js',
    paths: {
        'jquery': 'lib/jquery/dist/jquery',
        'jquery.bootstrap': 'lib/bootstrap/dist/js/bootstrap',
        'rest': 'rest',
        'd3': 'lib/d3/d3',
        'tip': 'lib/d3-tip/index',
        'mustache': 'lib/mustache/mustache',
        'chart': 'chart',
        'enum': 'enum',
        'upload': 'upload',
        'compare': 'compare',
        'canvg': 'lib/canvg/dist/canvg',
        'jspdf': 'lib/jspdf/dist/jspdf.debug',
        'scrollTo': 'lib/jquery.scrollTo/jquery.scrollTo',
        'rasterize': 'lib/rasterizehtml/rasterizeHTML.allinone',
        'rsvp': 'lib/rsvp/rsvp',
        'promise-polyfill': 'lib/promise-polyfill/Promise'
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

		'scrollTo': {
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

        'enum': {
            exports: 'Enum'
        },

        'canvg': {
            exports: 'canvg'
        },

        'jspdf': {
            exports: 'jsPDF'
        },


        'rasterize': {
            exports: 'rasterizeHTML'
        }
    }
});
// load the main js file
require(['main']);