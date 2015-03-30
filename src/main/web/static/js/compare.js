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
				var self = this,
					samplesProcessed = [],
					selectedSamples;
				require(['mustache'], function (Mustache) {
					var projectTemaplate,
						compareTemplate;
					$.when(
						$.get('/jc/templates/project.html', function(template) {
							projectTemaplate = template;
						}),
						$.get('/jc/templates/compare.html', function(template) {
							compareTemplate = template;
						}),
						$.get('jc/project/'+project+'/samples/selected', function(selectedSampleObject) {
							selectedSamples = selectedSampleObject;
						})
					).done(function(){
						rest.fetchSamples(project, function (samples) {
							samples = samples[0].name;
							samplesProcessed = samples.map(function (name) {
								return {
									name: name
								};
							});
							var samplesSelected = selectedSamples.samples ? selectedSamples.samples.slice(1, -1).replace(/"/g,'').split(',') : [];
							$.each(samplesProcessed, function (index, psample) {
								$.each(samplesSelected, function (index, ssample) {
									if(psample.name === ssample) {
										psample.checked = 'checked';
									}
								});
							});
					    	var rendered = Mustache.render(projectTemaplate, {
					    		project: project,
					    		terms: versions,
					    		type: 'version',
					    		samples: samplesProcessed,
					    		show: (versions.length > 8)
					    	},
					    	{
					    		// partial tempalate
					    		compare: compareTemplate
					    	});
					    	// render the projects template
					    	$('.dynamic-template').html(rendered);
					    	self._registerEventsAfterLoad(project);
					    	self.setupSamples(project);
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
					var versionTemplate,
						compareTemplate;
					$.when(
						$.get('/jc/templates/version.html', function(template) {
							versionTemplate = template;
						}),
						$.get('/jc/templates/compare.html', function(template) {
							compareTemplate = template;
						})
					).done(function(){
				    	var rendered = Mustache.render(versionTemplate, {
				    		project: project,
				    		terms: builds,
				    		type: 'build',
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
			},

			setupSamples: function (project) {
				var setSamples = [];
				$('.set-samples').click(function () {
					$('.samples input:checked').each(function () {
						setSamples.push($(this).attr('value'));
					});
					rest.setSamples(project, JSON.stringify(setSamples), function (error) {
						if(error) {
							$('error-template').html(error);
						}
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
						if(selectedTerm.length > 0) {
							$('.compare-panel').show();
							$('.chart-area').show();
						} else {
							$('.compare-panel').hide();
							$('.chart-area').hide();
						}
						if($('.chart-report')) {
			    			$('.chart-report').hide();
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
			    			var comparisonData = arguments;
			    			rest.fetchSelectedSamples(project, function (selectedSamples) {
								var samplesSelected = selectedSamples.samples ? selectedSamples.samples.slice(1, -1).replace(/"/g,'').split(',') : [];
				  				var chartData = [];
				  				$.each(comparisonData, function (index, value){
				  					chartData.push(value[0][0]);
				  				});

				  				$.each(chartData, function (indexData, data) {
				  					var localData = [];
					  				$.each(data.report.jsondata, function (index, value) {
						    			if($.inArray(value.threadgroup.name, samplesSelected) !== -1) {
						  					localData.push(value);
						    			}
						    		});
						    		data.report.jsondata = localData;
					  			});

				    			Chart.comparisionBarChart(chartData, version, '.bar-chart-term');
				    		});
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
			    		if($('.chart-report')) {
			    			$('.chart-report').show();
			    		}

			    		if(version) {
							rest.fetchReport(project, version, term, function (data) {
								rest.fetchSelectedSamples(project, function (selectedSamples) {
									var samplesSelected = selectedSamples.samples ? selectedSamples.samples.slice(1, -1).replace(/"/g,'').split(',') : [];
									require(['mustache', 'chart'], function (Mustache, Chart) {
										$.get('/jc/templates/chart.html', function(template) {
								    		var rendered = Mustache.render(template);
								    		$('.perf-charts').html(rendered);
								    		$('.page-header').text('Build: ' + term);
								    		var localData = [];
								    		$.each(data[0].report.jsondata, function (index, value) {
								    			if($.inArray(value.threadgroup.name, samplesSelected) !== -1) {
								  					localData.push(value);
								    			}
								    		});
								    		data[0].report.jsondata = localData;
								    		Chart.renderCharts(data);
								    		$('.dropdown-menu .print').click(function (event) {
									    		require(['print'], function (print) {
									    			var svg = $(event.target).closest('.panel').find('svg')[0];
									    			var serializer = new XMLSerializer();
													var str = serializer.serializeToString(svg);
									    			var img = print.printChart(str);
													$('.print-image').click(function () {
													    event.target.href = img; //this may not work in the future..
													});
									    		});
									    	});
										});
									});
								});
							});
						} else {
							rest.fetchLatestBuildforVersion(project, term, function (data) {
								rest.fetchSelectedSamples(project, function (selectedSamples) {
									var samplesSelected = selectedSamples.samples ? selectedSamples.samples.slice(1, -1).replace(/"/g,'').split(',') : [];
									require(['mustache', 'chart'], function (Mustache, Chart) {
										$.get('/jc/templates/chart.html', function(template) {
								    		var rendered = Mustache.render(template);
								    		$('.perf-charts').html(rendered);
								    		$('.page-header').text('Version: ' + term);
								    		var localData = [];
								    		$.each(data[0].report.jsondata, function (index, value) {
								    			if($.inArray(value.threadgroup.name, samplesSelected) !== -1) {
								  					localData.push(value);
								    			}
								    		});
								    		data[0].report.jsondata = localData;
								    		Chart.renderCharts(data);
								    		$('.dropdown-menu .print').click(function (event) {
									    		require(['print'], function (print) {
									    			var svg = $(event.target).closest('.panel').find('svg')[0];
									    			var serializer = new XMLSerializer();
													var str = serializer.serializeToString(svg);
									    			var img = print.printChart(str);
													$('.print-image').click(function () {
														this.href = img.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
													    this.download = 'save.png';
													});
									    		});
									    	});
										});
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
