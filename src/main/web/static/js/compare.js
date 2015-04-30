/**
 * Comparison module
 * @param  {[type]}
 * @module  web
 * @return {[type]}
 */
;(function(define) {

	define(['jquery', 'rest', 'enum', 'template-loader', 'chart'], function($, rest, Enum, Loader, Chart) {
		var Mustache =  require('mustache');
		var Compare = {

			/**
			 * Fetch the template for the selected project.
			 * 1) Fetch the versions
			 * 2) Fetch the compare template provide comparision between versions
			 * @param  {String} project  [description]
			 * @param  {String} versions [description]
			 * @public
			 */
			fetchAndRenderProjectTemplate: function (project, versions) {
				var self = this,
					samplesProcessed = [];
				$.when(
					Loader.loadAsync(Enum.template.REPORT),
					Loader.loadAsync(Enum.template.COMPARE),
					rest.fetchSelectedSamplesAsync(project)
				).done(function(projectTemaplate, compareTemplate, selectedSamples){
					rest.fetchSamples(project, function (samples) {
						samplesProcessed = self.processSelectedSamples(samples, selectedSamples);
				    	var rendered = Mustache.render(projectTemaplate, {
					    		project: project,
					    		terms: versions,
					    		type: 'version',
					    		samples: samplesProcessed,
					    		show: (versions.length > 5),
					    		showConfig: true,
				    		},
					    	{
					    		// partial tempalate
					    		compare: compareTemplate
					    	});
				    	// render the projects template
				    	$('.dynamic-template').html(rendered);
				    	$('.chart-report').hide();
				    	self._registerEventsAfterLoad(project);
				    	self.setupSamples(project);
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
				$.when(
					Loader.loadAsync(Enum.template.REPORT),
					Loader.loadAsync(Enum.template.COMPARE)
				).done(function(versionTemplate, compareTemplate){
			    	var rendered = Mustache.render(versionTemplate, {
			    		project: project,
			    		terms: builds,
			    		type: 'build',
			    		show: (builds.length > 5)
			    	},
			    	{
			    		// partial tempalate
			    		compare: compareTemplate
			    	});
			    	// render the projects template
			    	$('.dynamic-template').html(rendered);
			    	$('.chart-report').hide();
			    	self._registerEventsAfterLoad(project, version);
				});
			},

			processSelectedSamples: function(samples, selectedSamples) {
				samples = samples[0].name;
				var samplesProcessed = samples.map(function (name) {
					return {
						name: name
					};
				});
				var samplesSelected = this.santizeSamples(selectedSamples);
				$.each(samplesProcessed, function (index, psample) {
					$.each(samplesSelected, function (index, ssample) {
						if(psample.name === ssample) {
							psample.checked = 'checked';
						}
					});
				});
				return samplesProcessed;
			},

			santizeSamples: function (selectedSamples) {
				return selectedSamples.samples ? selectedSamples.samples.slice(1, -1).replace(/"/g,'').split(',') : [];
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

			onPrintSvg: function (event, project) {
				require(['print'], function (print) {
	    			var svg = $(event.target).closest('.panel').find('svg')[0];
	    			var serializer = new XMLSerializer();
					var str = serializer.serializeToString(svg);
	    			var img = print.printChart(str);
					$('.print-image').click(function () {
					    this.href = img.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
				    	this.download = project+ '-report.png';
					});
	    		});
			},

			onReportDownload: function (event, env, tableData, project) {
				require(['report'], function (report) {
					$('#envModal').modal('hide');
					$('#loadingModal').modal('show');
	    			var parent = $(event.target).closest('.panel');
	    			report.generatePdf(parent, env, tableData, project);
	    		});
			},

			processChartData: function(project, version, term, data, selectedSamples) {
				var self = this;
				var samplesSelected = this.santizeSamples(selectedSamples);
				require(['tables'], function (Tables) {
					Loader.load(Enum.template.CHART,  function(template) {
			    		var rendered = Mustache.render(template);
			    		$('.perf-charts').html(rendered);
			    		$('.page-header').text((version ? 'Build: ' : 'Version:' )+ term);
			    		var localData = [];
			    		$.each(data[0].report.jsondata, function (index, value) {
			    			if($.inArray(value.threadgroup.name, samplesSelected) !== -1) {
			  					localData.push(value);
			    			}
			    		});
			    		data[0].report.jsondata = localData;
			    		var entityId = data[0]._id;

			    		// process the data
			    		var chartData = Chart.processDataForCharts(data);

			    		// render a bar chart
						Chart.barChart(chartData.responseVsTimeData, '.bar-chart');
						// render a response vs active threads chart
						Chart.lineChart(chartData.responseVsActiveThreads.data, chartData.responseVsActiveThreads.groupData, '.line-chart');
						//render active threads vs time chart
						Chart.lineChartNTvsTime(chartData.responseVsActiveThreads.data, chartData.responseVsActiveThreads.groupData, '.line-chart-2');


			    		var tableData = Tables.generateTableHTML(data);
			    		Loader.load(Enum.template.SAMPLE_DATA,  function(template) {
					    	var renderedTableHTML = Mustache.render(template, {
					    		dataTable: tableData
					    	});
					    	$('.dropdown-menu .print').click(function (event) {
			    				self.onPrintSvg(event, project);
					    	});
					    	$('.dropdown-menu .report').click(function (event) {
					    		$('#envModal').modal('show');
					    		$('.add-details').click(function() {
					    			var form = $(this).closest('.modal').find('form');
					    			var sData = form.serializeArray();
					    			var formData = new FormData();
					    			$.each(sData, function (index, value) {
					    				formData.append(value.name, value.value);
					    			});
					    			rest.setEnvDetails(entityId, formData, function(err, data) {
				    					self.onReportDownload(event, sData, renderedTableHTML, project);
				    				});
					    		});
					    	});
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
				var selectedTerm = [],
					self = this;

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
		    		if($('.compare-chart')) {
			    		$('.compare-chart').hide();
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

		    		if($('.compare-chart')) {
			    		$('.compare-chart').show();
			    	}

		    		$('.dropdown-menu .print').click(function (event) {
			    		self.onPrintSvg(event, selectedTerm.join());
					});


		    		rest.fetchComparisionData(selectedTerm, project, version, function () {
		    			var comparisonData = arguments;
		    			rest.fetchSelectedSamples(project, function (selectedSamples) {
							var samplesSelected = self.santizeSamples(selectedSamples);
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

		    		if($('.compare-chart')) {
			    		$('.compare-chart').hide();
			    	}

		    		if(version) {
						rest.fetchReport(project, version, term, function (data) {
							rest.fetchSelectedSamples(project, function (selectedSamples) {
								self.processChartData(project, version, term, data, selectedSamples);
							});
						});
					} else {
						rest.fetchLatestBuildforVersion(project, term, function (data) {
							rest.fetchSelectedSamples(project, function (selectedSamples) {
								self.processChartData(project, version, term, data, selectedSamples);
							});
						});
					}
			    });

			    $('#myTab a').click(function (e) {
			      	e.preventDefault();
				  	$(this).tab('show');
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
