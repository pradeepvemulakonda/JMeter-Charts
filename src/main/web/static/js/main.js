requirejs.config({
    paths: {
        'jquery': 'jquery',
        'jquery.bootstrap': 'bootstrap',
        'rest': 'rest',
        'd3': 'd3/d3',
        'tip': 'd3/tip',
        'mustache': 'mustache',
        'chart': 'chart',
        'upload': 'upload',
        'compare': 'compare'
    },
    shim: {
        'jquery.bootstrap': {
            deps: ['jquery']
        },

        'plugins/metisMenu/metisMenu': {
        	deps: [ 'jquery' ],
            exports: 'jQuery.fn.metisMenu'
        },

        'plugins/morris/morris': {
        	deps: [ 'jquery', 'plugins/morris/raphael.min' ]
        },

        'plugins/combobox/bootstrap-combobox': {
        	deps: [ 'jquery']
        },

        'plugins/typeahead/typeahead': {
        	deps: [ 'jquery']
        },

		'plugins/scrollTo/scrollTo': {
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

require(['require','jquery', 'jquery.bootstrap', 'plugins/metisMenu/metisMenu','plugins/scrollTo/scrollTo','plugins/typeahead/typeahead', 'plugins/morris/morris', 'rest', 'mustache', 'compare', 'plugins/combobox/bootstrap-combobox'], function (require, $) {
	var rest = require('rest');

	// set the die menu
	$(function() {
	    $('#side-menu').metisMenu();
	});

	// Loads the correct sidebar on window load,
	// collapses the sidebar on window resize.
	// Sets the min-height of #page-wrapper to window size
	$(function() {
	    $(window).bind('load resize', function() {
	        var topOffset = 50;
	        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
	        if (width < 768) {
	            $('div.navbar-collapse').addClass('collapse');
	            topOffset = 100; // 2-row-menu
	        } else {
	            $('div.navbar-collapse').removeClass('collapse');
	        }

	        var height = (this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height;
	        height = height - topOffset;
	        if (height < 1) {
	        	height = 1;
	        }
	        if (height > topOffset) {
	            $('#page-wrapper').css('min-height', (height) + 'px');
	        }
	    });
	});

	/**
	 * render initial content
	 * @return {[type]}   [description]
	 */
	$(function() {
		require(['mustache'], function (Mustache) {
			$.get('/jc/templates/upload.html', function(template) {
			    var rendered = Mustache.render(template);
			    $('.dynamic-template').html(rendered);
			    	setup();
			    	addEvents();
			});
		});
	});

	function addEvents() {
		$('.main-project').click(function () {
			require(['mustache'], function (Mustache) {
					$.get('/jc/templates/latest-project.html', function(template) {
						rest.fetchLatest(function (data) {
							var rendered = Mustache.render(template, {
								project: data.name,
								version: data.version,
								build: data.build
							});
					    	$('.dynamic-template').html(rendered);
							$('.page-header').text('Select a Project to view detailed performance charts');
						});
					});
			});
		});
	}


	/**
	 * Adds a menu item
	 * @param {[type]}   node     [description]
	 * @param {[type]}   text     [description]
	 * @param {[type]}   clazz    [description]
	 * @param {Function} callback [description]
	 * @private
	 */
	function _addMenu(node, text, clazz, callback) {
		var anchor = $('<a>'+text + '<span class="fa arrow"></span>'+'</a>');
		anchor.bind('click', callback);
		var liNode = $('<li class = "active ' + clazz + '"></li>');
		liNode.append(anchor);
		node.append(liNode);
	}

	/**
	 * Set the navigation links on document ready
	 * fetch the project details on load
	 */

	function setup() {
		// setup the forms upload
		require(['upload'], function (Upload) {
			Upload.init();
		});

		// hide the error
		$('error-template').hide();

		rest.fetchProjects(function( data) {
			var node = $(document.createDocumentFragment());
			data = data.sort();
			$.each(data, function (index, projectName) {
				_addMenu(node, projectName, 'project-nav', fetchVersion);
			});
			$('.project-nav').append(node);
		});
	}

	/**
	 * Fetch the version data for the project
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	function fetchVersion(event) {
		rest.fetchVersions(event.target.text, function (data) {
			data = data.sort();
			var currentMenu = $(event.target);
			if(currentMenu.closest('.project-nav').find('.nav-third-level')) {
				currentMenu.closest('.project-nav').find('.nav-third-level').remove();
			}
			$('<ul class="nav nav-third-level">').appendTo(event.target.parentNode);
			$.each(data, function (index, version) {
				_addMenu($(event.target.parentNode).find('ul'), version, 'version-nav', fetchBuild);
			});
			$('#side-menu').metisMenu();

			require(['compare'], function (Compare) {
				Compare.fetchAndRenderProjectTemplate(event.target.text , data);
			});
		});
	}

	/**
	 * Fetch the build data for the selected version
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	function fetchBuild(event) {
		rest.fetchBuilds($($(event.target).parent().parent().parent()).children()[0].text, event.target.text, function (data) {
			data = data.sort();
			require(['compare'], function (Compare) {
				Compare.fetchAndRenderVersionTemplate($(event.target).closest('.project-nav').children()[0].text, event.target.text, data);
			});
		});
	}
});
