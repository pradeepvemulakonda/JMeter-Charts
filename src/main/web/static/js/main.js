require(['require',
		 'jquery',
		 'jquery.bootstrap',
		 'lib/metisMenu/dist/metisMenu',
		 'scrollTo',
		 'lib/typeahead.js/dist/typeahead.bundle.min',
		 'rest',
		 'mustache',
		 'compare',
		 'lib/bootstrap-combobox/js/bootstrap-combobox'], function (require, $) {
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
							$('.breadcrumb').empty().append('<li>Select Project</li>');
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
		var anchor;
		if(clazz == 'version-nav') {
			anchor = $('<a><i class="fa fa-code-fork" title="Version"></i><span class="divider"></span>'+text + '<span class="fa arrow"></span>'+'</a>');
		} else {
			anchor = $('<a><i class="fa fa-cube" title="Project"></i><span class="divider"></span>'+text + '<span class="fa arrow"></span>'+'</a>');
		}

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
		$('.error-template').hide();

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
		if($(event.target).is('a')) {
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
				$('.page-header').html('Displaying charts for Project: ' + event.target.text);
				$('.breadcrumb').empty().append('<li>Select Project</li>').append('<li>Project: "'+ event.target.text +'"</li>');
			});
		}
	}

	/**
	 * Fetch the build data for the selected version
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	function fetchBuild(event) {
		if($(event.target).is('a')) {
			rest.fetchBuilds($($(event.target).parent().parent().parent()).children()[0].text, event.target.text, function (data) {
				data = data.sort();
				var projectName = $(event.target).closest('.project-nav').children()[0].text;
				require(['compare'], function (Compare) {
					Compare.fetchAndRenderVersionTemplate(projectName, event.target.text, data);
				});
				$('.page-header').html('Displaying charts for Version: ' + event.target.text);
				$('.breadcrumb').empty().append('<li>Select Project</li>').append('<li>Project: "'+ projectName +'"</li>').append('<li>Version: "'+ event.target.text +'"</li>');
			});
		}
	}
});
