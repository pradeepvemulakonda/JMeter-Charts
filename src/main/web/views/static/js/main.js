requirejs.config({
    paths: {
        'jquery': 'jquery',
        'jquery.bootstrap': 'bootstrap',
        'rest': 'rest',
        'd3': 'd3/d3',
        'tip': 'd3/tip',
        'mustache': 'mustache',
        'chart': 'chart',
        'upload': 'upload'
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
        }
    }
});

require(['require','jquery', 'jquery.bootstrap', 'plugins/metisMenu/metisMenu','plugins/scrollTo/scrollTo','plugins/typeahead/typeahead', 'plugins/morris/morris', 'rest', 'mustache', 'plugins/combobox/bootstrap-combobox'], function (require, $) {
	var rest = require('rest');
	var myBarChart;
	$(function() {
	    $('#side-menu').metisMenu();
	});

	// Loads the correct sidebar on window load,
	// collapses the sidebar on window resize.
	// Sets the min-height of #page-wrapper to window size
	$(function() {
	    $(window).bind('load resize', function() {
	        topOffset = 50;
	        width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
	        if (width < 768) {
	            $('div.navbar-collapse').addClass('collapse');
	            topOffset = 100; // 2-row-menu
	        } else {
	            $('div.navbar-collapse').removeClass('collapse');
	        }

	        height = (this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height;
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
			$.get('/jc/templates/dashboard.html', function(template) {
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
	 * Set the navigation links on document ready
	 */

	function setup() {

		// setup the forms upload
		require(['upload'], function (Upload) {
			Upload.init();
		});

		$(function () {
			rest.fetchProjects(function( data) {
				var node = $(document.createDocumentFragment());
				data = data.sort();
				$.each(data, function (index, projectName) {
					addMenu(node, projectName, 'project-nav', fetchVersion);
				});
				$('.project-nav').append(node);
			});
		});

		function addMenu(node, text, clazz, callback) {
			var anchor = $('<a>'+text + '<span class="fa arrow"></span>'+'</a>');
			anchor.bind('click.fetch', callback);
			var liNode = $('<li class = "active ' + clazz + '"></li>');
			liNode.append(anchor);
			node.append(liNode);
		}

		function fetchVersion(event) {
			rest.fetchVersions(event.target.text, function (data, statusText, jqXHR) {
				data = data.sort();
				$('<ul class="nav nav-third-level">').appendTo(event.target.parentNode);
				$.each(data, function (index, version) {
					addMenu($(event.target.parentNode).find('ul'), version, 'version-nav', fetchBuild);
				});
				$(event.target).unbind('click.fetch');
				$('#side-menu').metisMenu();
				fetchProjectTemplate(event.target.text, data);
			});
		}

		function fetchBuild(event) {
			rest.fetchBuilds($($(event.target).parent().parent().parent()).children()[0].text, event.target.text, function (data, statusText, jqXHR) {
				data = data.sort();
				$('<ul class="nav nav-fourth-level">').appendTo(event.target.parentNode);
				$.each(data, function (index, build) {
					addMenu($(event.target.parentNode).find('ul'), build, 'build-nav', fetchChartData);
				});
				$(event.target).unbind('click.fetch');
				$('#side-menu').metisMenu();
			});
		}

		function fetchChartData(event) {
			var projectName = $($(event.target).parent().parent().parent().parent().parent()).children()[0].text;
			var version = $($(event.target).parent().parent().parent()).children()[0].text;
			var build = event.target.text;
			rest.fetchReport(projectName, version, build,function (data) {
				require(['mustache', 'chart'], function (Mustache, Chart) {
					$.get('/jc/templates/chart.html', function(template) {
			    	var rendered = Mustache.render(template);
			    	$('.dynamic-template').html(rendered);
			    	$('.page-header').text('Build: ' + build);
			    	Chart.renderCharts(data);
				});
			});

			});
			$('#side-menu').metisMenu();
		}

		function fetchProjectTemplate(project, versions) {
			require(['mustache', 'Chart'], function (Mustache, Chart) {
					$.get('/jc/templates/project.html', function(template) {
						rest.fetchSamples(project, function (samples) {
					    	var rendered = Mustache.render(template, {
					    		project: project,
					    		versions: versions,
					    		samples: samples[0].name
					    	});

					    	// render the projects template
					    	$('.dynamic-template').html(rendered);
					    	var selectedVersions = [];
					    	// set the compare event
					    	$('.history-container .compare').click(function () {

					    		$(this).toggleClass('fa-square-o').toggleClass('fa-check-square-o');
					    		var versionText = $($(this).closest('.panel')).find('.version').text();

					    		// select the panel
								if($(this).hasClass('fa-check-square-o')) {
									$('.selection-panel').append('<span class="label label-primary '+ versionText +'">'+ 'version:' + versionText+'</span>&nbsp;');
									selectedVersions.push(versionText);
								} else {
									$('.selection-panel').find('.label.label-primary.'+versionText).remove();
									selectedVersions.splice($.inArray(versionText, selectedVersions), 1);
								}
								console.log(selectedVersions);
					    	});

					    	$('.dynamic-template .compare-button').click(function () {
					    		rest.fetchComparisionData(selectedVersions, project, true, function () {
					  				var chartData = [];
					  				$.each(arguments, function (index, value){
					  					chartData.push(value[0][0]);
					  				});
					    			Chart.comparisionBarChart(chartData, '.chart-bar');
					    		});
					    	});

							$('.history-container').scrollTo('100%', 0, {axis:'x'});

					    	$('.right.carousel-control').click(function() {
					    		$('.history-container').scrollTo('+=150px', 500, {axis:'x'});
					    	});
					    	$('.left.carousel-control').click(function () {
					    		$('.history-container').scrollTo('-=150px', 500, {axis:'x'});
					    	});
					    	$('.search-version').click(function() {
					    		var versionNo = $('.version-search-text').val();
					    		$('.history-container').scrollTo($('.version:contains('+versionNo+')'), 500, {axis:'x'});
					    	});

					    	$('.history-scroll-box .panel-footer').click(function () {
					    		var version = $($(this).closest('.panel')).find('.version').text(),
					    			dataBar = [];
								rest.fetchLatestBuildforVersion(project, version, function (data) {
									$.get('/jc/templates/versionTable.html', function(template) {
								    	var rendered = Mustache.render(template, {
								    		data: data[0].report.jsondata
								    	});
								    	$.each(data[0].report.jsondata, function (index, threadGroup) {
											dataBar.push({
												name: threadGroup.threadgroup.name,
												value: threadGroup.threadgroup.averageTime
											});
										});

										Chart.comparisionBarChart(dataBar, '.chart-bar');
								    	$('.version-table').html(rendered);
									});
								});
						    });

						    $('#myTab a').click(function (e) {
						      	e.preventDefault();
							  	$(this).tab('show');
							});
						});
					});
				});
			}
		}
});
