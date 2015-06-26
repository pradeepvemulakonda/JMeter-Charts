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
					Loader.loadAsync(Enum.template.CHART),
					rest.fetchSelectedSamplesAsync(project)
				).done(function(projectTemaplate, compareTemplate, chartTemplate, selectedSamples){
					rest.fetchSamples(project, function (samples) {
						samplesProcessed = self.processSelectedSamples(samples, selectedSamples.sample);
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
					    		compare: compareTemplate,
					    		chart: chartTemplate
					    	});
				    	// render the projects template
				    	$('.dynamic-template').html(rendered);
				    	self._registerEventsAfterLoad(project);
				    	self.hideReport();
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
					Loader.loadAsync(Enum.template.COMPARE),
					Loader.loadAsync(Enum.template.CHART)
				).done(function(versionTemplate, compareTemplate, chartTemplate){
			    	var rendered = Mustache.render(versionTemplate, {
			    		project: project,
			    		terms: builds,
			    		type: 'build',
			    		show: (builds.length > 5)
			    	},
			    	{
			    		// partial tempalate
			    		compare: compareTemplate,
			    		chart: chartTemplate
			    	});
			    	// render the projects template
			    	$('.dynamic-template').html(rendered);
			    	self.hideReport();
			    	self._registerEventsAfterLoad(project, version);
				});
			},

			showReport: function() {
				$('.perf-test-report').show();
			},

			hideReport: function() {
				$('.perf-test-report').hide();
			},

			showComparisonView: function () {
				$('.perf-test-report').show();
				$('.detailed-charts').hide();
				$('.comparison-charts').show();

			},

			showDetailedView: function () {
				$('.perf-test-report').show();
				$('.detailed-charts').show();
				$('.comparison-charts').hide();
			},

			clearCompareSelection: function () {
				$('.compare-panel').hide();
				$('.history-container .compare').each(function(index, node){
					if($(node).hasClass('fa-check-square-o')) {
						$(node).toggleClass('fa-check-square-o').toggleClass('fa-square-o');
					}
				});
			},

			showCompareSelection: function () {
				$('.compare-panel').show();
			},

			processSelectedSamples: function(samples, selectedSamples) {
				samples = samples[0].name;
				var samplesProcessed = samples.map(function (name) {
					return {
						name: name
					};
				});
				if (!selectedSamples) {
					selectedSamples = [];
				}

				$.each(samplesProcessed, function (index, psample) {
					$.each(selectedSamples, function (index, ssample) {
						if(psample.name === ssample) {
							psample.checked = 'checked';
						}
					});
				});
				return samplesProcessed;
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
				require(['tables'], function (Tables) {
			    		$('.page-header').text((version ? 'Build: ' : 'Version:' )+ term);
			    		var localData = [];
			    		$.each(data[0].report.jsondata, function (index, value) {
			    			if($.inArray(value.threadgroup.name, selectedSamples.sample) !== -1) {
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
		    		self.hideReport();

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
						self.showCompareSelection();
					} else {
						self.clearCompareSelection();
					}
		    	});

		    	// compare the terms
		    	$('.dynamic-template .compare-button').click(function () {
		    		if(selectedTerm && selectedTerm.length <= 1) {
		    			alert('Select at least two items to compare');
		    		}

		    	    // display the report
		    	    self.showComparisonView();


		    		$('.dropdown-menu .print').click(function (event) {
			    		self.onPrintSvg(event, selectedTerm.join());
					});

		    		rest.fetchComparisionData(selectedTerm, project, version, function () {
		    			var comparisonData = arguments;
		    			rest.fetchSelectedSamples(project, function (selectedSamples) {
			  				var chartData = [];
			  				$.each(comparisonData, function (index, value){
			  					chartData.push(value[0][0]);
			  				});

			  				$.each(chartData, function (indexData, data) {
			  					var localData = [];
				  				$.each(data.report.jsondata, function (index, value) {
					    			if($.inArray(value.threadgroup.name, selectedSamples.sample) !== -1) {
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
		    		// display the report
		    	    self.showDetailedView();
		    	    self.clearCompareSelection();
		    		var term = $($(this).closest('.panel')).find('.term').text();
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
