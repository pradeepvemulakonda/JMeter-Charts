;(function(define) {

	define(['jquery', 'rest'], function($, rest) {
		var Compare = {

			/**
			 * Fetch the template for the selected project.
			 * 1) Fetch the versions
			 * 2) Fetch the compare template provide comparision between versions
			 * @param  {[type]} project  [description]
			 * @param  {[type]} versions [description]
			 * @return {[type]}          [description]
			 * @public
			 */
			fetchAndRenderProjectTemplate: function (project, versions) {
				var self = this;
				require(['mustache'], function (Mustache) {
					var projectTemaplate,
						compareTemplate;
					$.when(
						$.get('/jc/templates/version.html', function(template) {
							projectTemaplate = template;
						}),
						$.get('/jc/templates/compare.html', function(template) {
							compareTemplate = template;
						})
					).done(function(){
						rest.fetchSamples(project, function (samples) {
					    	var rendered = Mustache.render(projectTemaplate, {
					    		project: project,
					    		terms: versions,
					    		type: 'version',
					    		samples: samples[0].name,
					    		show: (versions.length > 8)
					    	},
					    	{
					    		// partial tempalate
					    		compare: compareTemplate
					    	});
					    	// render the projects template
					    	$('.dynamic-template').html(rendered);
					    	self._registerEventsAfterLoad(project);
						});
					});
				});
			},

			/**
			 * Fetch the template for the selected project.
			 * 1) Fetch the builds
			 * 2) Fetch the compare template provide comparision between between
			 * @method fetchAndRenderVersionTemplate
			 * @param  {[type]} project  [description]
			 * @param  {[type]} versions [description]
			 * @return {[type]}          [description]
			 * @public
			 */
			fetchAndRenderVersionTemplate: function (project, version, builds) {
				var self = this;
				require(['mustache'], function (Mustache) {
					var projectTemaplate,
						compareTemplate;
					$.when(
						$.get('/jc/templates/version.html', function(template) {
							projectTemaplate = template;
						}),
						$.get('/jc/templates/compare.html', function(template) {
							compareTemplate = template;
						})
					).done(function(){
						rest.fetchSamples(project, function (samples) {
					    	var rendered = Mustache.render(projectTemaplate, {
					    		project: project,
					    		terms: builds,
					    		type: 'build',
					    		samples: samples[0].name,
					    		show: (builds.length > 8)
					    	},
					    	{
					    		// partial tempalate
					    		compare: compareTemplate
					    	});
					    	// render the projects template
					    	$('.dynamic-template').html(rendered);
					    	self._registerEventsAfterLoad(project, version);
						});
					});
				});
			},

			/**
			 * Register events on project template page
			 * @param  {[type]} project [description]
			 * @return {[type]}         [description]
			 * @private
			 */
			_registerEventsAfterLoad: function (project, version) {
				var selectedTerm = [];
		    	// set the compare event
		    	require(['mustache', 'chart'], function (Mustache, Chart) {
		    		// select the term

		    		$('.compare-panel').hide();
			    	$('.history-container .compare').click(function () {

			    		$(this).toggleClass('fa-square-o').toggleClass('fa-check-square-o');
			    		var termText = $($(this).closest('.panel')).find('.term').text();

			    		// select the panel
						if($(this).hasClass('fa-check-square-o')) {
							$('.selection-panel').append('<span class="label label-primary '+ termText +'">'+ (version ? 'build:' : 'version:') + termText+'</span>&nbsp;');
							selectedTerm.push(termText);
						} else {
							$('.selection-panel').find('.label.label-primary.'+termText).remove();
							selectedTerm.splice($.inArray(termText, selectedTerm), 1);
						}
						console.log(selectedTerm);
						if(selectedTerm.length > 0) {
							$('.compare-panel').show();
						}
			    	});

			    	// compare the terms
			    	$('.dynamic-template .compare-button').click(function () {
			    		if(selectedTerm && selectedTerm.length <= 1) {
			    			alert('Select at least two items to compare');
			    		}

			    		if($('.perf-charts')) {
			    			$('.perf-charts').empty();
			    		}

			    		if($('.bar-chart-term')) {
			    			$('.bar-chart-term').empty();
			    		}

			    		rest.fetchComparisionData(selectedTerm, project, version, function () {
			  				var chartData = [];
			  				$.each(arguments, function (index, value){
			  					chartData.push(value[0][0]);
			  				});
			    			Chart.comparisionBarChart(chartData, version, '.bar-chart-term');
			    		});
			    	});

			    	// sroll initially to the latest term
					$('.history-container').scrollTo('100%', 0, {axis:'x'});

			    	$('.right.carousel-control').click(function() {
			    		$('.history-container').scrollTo('+=150px', 500, {axis:'x'});
			    	});
			    	$('.left.carousel-control').click(function () {
			    		$('.history-container').scrollTo('-=150px', 500, {axis:'x'});
			    	});

			    	// the search bar for terms
			    	$('.search-term').click(function() {
			    		var termNo = $('.term-search-text').val();
			    		$('.history-container').scrollTo($('.term:contains('+termNo+')'), 500, {axis:'x'});
			    	});

			    	// Select the data for a particlar term
			    	$('.history-scroll-box .panel-footer').click(function () {
			    		var term = $($(this).closest('.panel')).find('.term').text();
			    		if($('.bar-chart-term')) {
			    			$('.bar-chart-term').empty();
			    		}
			    		if($('.perf-charts')) {
			    			$('.perf-charts').empty();
			    		}

			    		if(version) {
							rest.fetchReport(project, version, term, function (data) {
								require(['mustache', 'chart'], function (Mustache, Chart) {
									$.get('/jc/templates/chart.html', function(template) {
							    		var rendered = Mustache.render(template);
							    		$('.perf-charts').html(rendered);
							    		$('.page-header').text('Build: ' + term);
							    		Chart.renderCharts(data);
									});
								});
							});
						} else {
							rest.fetchLatestBuildforVersion(project, term, function (data) {
								require(['mustache', 'chart'], function (Mustache, Chart) {
									$.get('/jc/templates/chart.html', function(template) {
							    		var rendered = Mustache.render(template);
							    		$('.perf-charts').html(rendered);
							    		$('.page-header').text('Version: ' + term);
							    		Chart.renderCharts(data);
									});
								});
							});
						}
				    });

				    $('#myTab a').click(function (e) {
				      	e.preventDefault();
					  	$(this).tab('show');
					});
				});
			}
		};

		return Compare;
	});

}(typeof define === 'function' && define.amd ? define : function(deps, factory) {
	'use strict';
	if (typeof module !== 'undefined' && module.exports) {
		// Node
		module.exports = factory(require('jquery'));
	} else {
		factory(jQuery);
	}
}));
