;(function(define) {

	define(['jquery'], function($) {
			var Chart = {
			/**
			 * Set the chart data
			 */
			renderCharts: function (json) {
						var dataBar = [],
							dataLine = [],
							lineDomian = [],
							dataLineGroup=[],
							jsonData = json[0].report.jsondata;

						$('#morris-area-chart').empty();

						$.each(jsonData, function (index, threadGroup) {
								dataBar.push({
									name: threadGroup.threadgroup.name,
									value: threadGroup.threadgroup.averageTime
								});
								$.each(threadGroup.threadgroup.samples, function (innerIndex, sample) {
									dataLine.push({
										activeThread : sample.activeThreads,
										time: sample.timestamp,
										ms: sample.elapsedTime,
										name: sample.name
									});
									lineDomian.push({
										activeThread : sample.activeThreads,
										time: sample.timestamp,
										ms: sample.elapsedTime,
										name: sample.name
									});
								});
								dataLineGroup.push({
									group: threadGroup.threadgroup.name,
									dataLine: dataLine
								});
								dataLine = [];
						});

						// render a bar chart
						Chart.barChart(dataBar, '.bar-chart');
						// render a bar chart
						Chart.lineChart(lineDomian, dataLineGroup, '.line-chart');
						//render at vs time
						Chart.lineChartNTvsTime(lineDomian, dataLineGroup, '.line-chart-2');
			},

			comparisionBarChart: function (chartData, version, container) {
				var data = {
					version: [],
					sample: []
				},
				sample = {};


				$.each(chartData, function(index, result){
					if(!version) {
						data.version.push(result.version);
					} else {
						data.version.push(result.build);
					}

					$.each(result.report.jsondata, function(index, json) {
						if(sample[json.threadgroup.name]){
							sample[json.threadgroup.name].push(json.threadgroup.averageTime);
						} else{
							sample[json.threadgroup.name] = [];
				 			sample[json.threadgroup.name].push(json.threadgroup.averageTime);
						}
					});

					for(var key in sample) {
						if(sample.hasOwnProperty(key)) {
							data.sample.push({
								name: key,
								value: sample[key]
							});
						}
					}
				});

				require(['d3', 'tip'], function (d3, tip) {
					var color = d3.scale.ordinal()
					    .range(['darkcyan', 'darkgoldenrod', 'darkorange', 'blueviolet', 'greenyellow', 'indianred', 'thistle', 'steelblue', 'skyblue', 'teal', 'wheat', 'purple', 'peru', 'lightpink', 'lavender', 'dimgray', 'chocolate', 'cadetblue', 'mediumturquoise', 'olive', 'papayawhip', 'rosybrown']);

					var margin = {top: 20, right: 20, bottom: 30, left: 40},
					    width = 960 - margin.left - margin.right,
					    height = 500 - margin.top - margin.bottom;

					var x0 = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

					var x1 = d3.scale.ordinal();

					var y = d3.scale.linear()
					    .range([height, 0]);

					var xAxis = d3.svg.axis()
					    .scale(x0)
					    .orient('bottom');

					var yAxis = d3.svg.axis()
					    .scale(y)
					    .orient('left')
					    .tickFormat(d3.format('.2s'));

					var svg = d3.select(container)
						.append('svg')
					    .attr('width', width + margin.left + margin.right)
					    .attr('height', height + margin.top + margin.bottom)
					  .append('g')
					    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

					  var sampleNames = data.sample.map(function (d) {
					  		return d.name;
					  });
					  var versionNames = data.version;

					  data.sample.forEach(function(d) {
					    d.version = versionNames.map(
					    	function(name, index) {
					    	 return {
					    	 	name: name,
					    	 	value: +d.value[index]
					    	 };
					    });
					  });

					  x0.domain(sampleNames);
					  x1.domain(versionNames).rangeRoundBands([0, x0.rangeBand()]);
					  y.domain([0, d3.max(data.sample, function(d) {
					   	return +d3.max(d.value);
					 })]);

					  svg.append('g')
					      .attr('class', 'x axis')
					      .attr('transform', 'translate(0,' + height + ')')
					      .call(xAxis);

					  svg.append('g')
					      .attr('class', 'y axis')
					      .call(yAxis)
					    .append('text')
					      .attr('transform', 'rotate(-90)')
					      .attr('y', 6)
					      .attr('dy', '.71em')
					      .style('text-anchor', 'end')
					      .text('Average Time in (ms)');

					  var version = svg.selectAll('.version')
					      .data(data.sample)
					      .enter().append('g')
					      .attr('class', 'g')
					      .attr('transform', function(d) {
					      	return 'translate(' + x0(d.name) + ',0)';
					     });

					  version.selectAll('rect')
					      .data(function(d) {
					      	return d.version;
					      })
					    .enter().append('rect')
					      .attr('width', x1.rangeBand())
					      .attr('x', function(d) {
					      	return x1(d.name);
					      })
					      .attr('y', function(d) { return y(d.value); })
					      .attr('height', function(d) { return height - y(d.value); })
					      .style('fill', function(d) { return color(d.name); });

					  var legend = svg.selectAll('.legend')
					      .data(versionNames.slice().reverse())
					    .enter().append('g')
					      .attr('class', 'legend')
					      .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

					  legend.append('rect')
					      .attr('x', width - 18)
					      .attr('width', 18)
					      .attr('height', 18)
					      .style('fill', color);

					  legend.append('text')
					      .attr('x', width - 24)
					      .attr('y', 9)
					      .attr('dy', '.35em')
					      .style('text-anchor', 'end')
					      .text(function(d) { return d; });
				});
			},


			barChart: function (dataBar, container) {
				var sampleNames = [];
				var containerNode = $(container);
					if(containerNode) {
						containerNode.empty();
					} else {
						throw new TypeError('Container is not valid');
					}

				require(['d3', 'tip'], function (d3, tip) {
					var color = d3.scale.ordinal()
					    .range(['darkcyan', 'darkgoldenrod', 'darkorange', 'blueviolet', 'greenyellow', 'indianred', 'thistle', 'steelblue', 'skyblue', 'teal', 'wheat', 'purple', 'peru', 'lightpink', 'lavender', 'dimgray', 'chocolate', 'cadetblue', 'mediumturquoise', 'olive', 'papayawhip', 'rosybrown']);

					var margin = {top: 20, right: 30, bottom: 30, left: 40},
											    width = 960 - margin.left - margin.right,
											    height = 500 - margin.top - margin.bottom;

					var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

					var y = d3.scale.linear().range([height, 0]);

					var xAxis = d3.svg.axis()
							    .scale(x)
							    .orient('bottom');

					var yAxis = d3.svg.axis()
							    .scale(y)
							    .orient('left');

					var tipLocal = tip()
					  .attr('class', 'd3-tip')
					  .offset([-10, 0])
					  .html(function(d) {
					    return '<strong>Sample:</strong> <span style="color:white">' + d.name + '</span>';
					  });

					var chart = d3.select(container)
						.append('svg')
					    .attr('width', width + margin.left + margin.right)
					    .attr('height', height + margin.top + margin.bottom)
					    .append('g')
					    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

					chart.call(tipLocal);

					 var dataBarValue = [];

					 $.each(dataBar, function (index, data) {
						 dataBarValue.push(parseFloat(data.value));
						 sampleNames.push(data.name);
					 });

					 var p=d3.scale.category20();


					  x.domain(dataBar.map(function(d) { return d.name; }));
					  y.domain([0, d3.max(dataBarValue)]);

					  chart.append('g')
					      .attr('class', 'x axis')
					      .attr('transform', 'translate(0,' + height + ')')
					      .call(xAxis)
					      .selectAll('text')
				            .style('text-anchor', 'end')
				            .attr('dx', '-.8em')
				            .attr('dy', '.15em')
				            .attr('transform', function() {
				                return 'rotate(-65)';
				          });

					  chart.append('g')
					      .attr('class', 'y axis')
					      .call(yAxis);
					  var barWidth = width / dataBar.length;

					  var bar = chart.selectAll('.bar')
				      .data(dataBar)
				      .enter()
				      .append('g');

					   bar.append('rect')
					      .attr('class', 'bar')
					      .attr('x', function(d) {
					      	return x(d.name);
					      })
					      .attr('y', function(d) {
					    	  return y(d.value);
					    	})
					      .attr('data-bar', function(d) {
					    	  return d.name;
					    	})
					      .attr('height', function(d) { return height - y(d.value); })
					      .attr('width', x.rangeBand())
					      .on('mouseover', tipLocal.show)
					      .on('mouseout', tipLocal.hide)
					      .style('fill', function(d) {
					    	  return color(d.name);
					      });

					  bar.append('text')
					      .attr('x', function(d) {
					    	  return x(d.name) + barWidth/2 -12;
					      })
					      .attr('y', function(d) { return y(d.value) + 3; })
					      .attr('dy', '.75em')
					      .attr('class', 'bar-text')
					      .text(function(d) { return Math.floor(d.value); });


					  var legendSVG = d3.select('.chart-bar-legend')
					    .attr('width', width + margin.left + margin.right)
					    .attr('height', height + margin.top + margin.bottom)
					    .append('g')
					    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

					  var legend = legendSVG.selectAll('.legend')
					      .data(sampleNames.slice().reverse())
					    .enter().append('g')
					      .attr('class', 'legend')
					      .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; })
					      .on('click', function(d){
						        // Determine if current line is visible
						        // Hide or show the elements
						        d3.select('.chart-bar').selectAll('g rect').each(function(h){
						        	if(h.name === d) {
						        		var rect = d3.select(this);
						        		rect.transition()
  										.style('opacity', rect.style('opacity') === '0'? '1' : '0');
						        	}
						        });
						   });

					  legend.append('rect')
					      .attr('x', width - 18)
					      .attr('width', 18)
					      .attr('height', 18)
					      .style('fill', color);

					  legend.append('text')
					      .attr('x', width - 24)
					      .attr('y', 9)
					      .attr('dy', '.35em')
					      .style('text-anchor', 'end')
					      .text(function(d) { return d; });

					});
			},

			/**
			 * Generates a line chart
			 * @param  {Object} d3            [description]
			 * @param  {Object} lineDomian    [description]
			 * @param  {Object} dataLineGroup [description]
			 * @return {this}               [description]
			 */
			lineChart: function(lineDomian, dataLineGroup, container) {

				require(['d3', 'tip'], function (d3, tip) {
					var color = d3.scale.ordinal()
					    .range(['darkcyan', 'darkgoldenrod', 'darkorange', 'blueviolet', 'greenyellow', 'indianred', 'thistle', 'steelblue', 'skyblue', 'teal', 'wheat', 'purple', 'peru', 'lightpink', 'lavender', 'dimgray', 'chocolate', 'cadetblue', 'mediumturquoise', 'olive', 'papayawhip', 'rosybrown']);

				  var margin = {top: 20, right: 80, bottom: 30, left: 50},
				    width = 960 - margin.left - margin.right,
				    height = 500 - margin.top - margin.bottom;
				   var p=d3.scale.category20();

					var max1 = d3.max(lineDomian, function (d) {
						return +d.activeThread;
					});

					var max2 = d3.max(lineDomian, function (d) {
						return +d.ms;
					});

					var min1 = d3.min(lineDomian, function (d) {
						return +d.activeThread;
					});

					var min2 = d3.min(lineDomian, function (d) {
						return +d.ms;
					});

					var x = d3.scale.linear()
					    .range([0, width])
					    .domain([min1,max1])
					    .nice();

					var y = d3.scale.linear()
					    .range([height, 0])
					    .domain([min2,max2])
					    .nice();

					var xAxis = d3.svg.axis()
					    .scale(x)
					    .orient('bottom');


					var yAxis = d3.svg.axis()
					    .scale(y)
					    .orient('left');

					var tipLocal = tip()
				  			.attr('class', 'd3-tip')
							.html(function(d) {
					    		return '<strong>Sample:</strong> <span style="color:white">' + d.group + '</span>';
					  		});

					var svg = d3.select(container)
							.append('svg')
					    	.attr('width', width + margin.left + margin.right)
						    .attr('height', height + margin.top + margin.bottom)
						    .append('g')
						    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

					svg.call(tipLocal);

					svg.append('g')
						.attr('class', 'x axis')
						.attr('transform', 'translate(0,' + height + ')')
						.call(xAxis)
						.append('text')
						.attr('y', -12)
						.attr('x', width)
						.attr('dy', '.71em')
						.style('text-anchor', 'end')
						.text('no of active threads');

					svg.append('g')
						.attr('class', 'y axis')
						.call(yAxis)
						.append('text')
						.attr('transform', 'rotate(-90)')
						.attr('y', 6)
						.attr('dy', '.71em')
						.style('text-anchor', 'end')
						.text('response time in ms');

					var line = d3.svg.line()
						.interpolate('bundle')
						.x(function(d) {
							return x(d.activeThread);
						})
						.y(function(d) {
							return y(d.ms);
						});

					var lineContainer = svg.selectAll('.container')
						.data(dataLineGroup)
						.enter().append('g')
						.attr('class', 'container');

					lineContainer.append('path')
						.attr('class', 'line')
						.attr('d', function(d) {
							var newArray = d.dataLine.map(function (d) {
								return d;
							});
							var data = newArray.sort(function (a, b) {
								return a.activeThread-b.activeThread;
							});
							return line(data);
						})
						.attr('data-legend',function(d) {
							return d.group;
						})
						.style('stroke', function(d) {
						  return color(d.group);
						});

					var sampleNames = [];

					sampleNames = dataLineGroup.map(function (d) {
						return d.group;
					});

					d3.select('.line-chart .clear').
					on('click', function () {
						d3.select('.chart-line').selectAll('g path').style('opacity', '0');
					});

					var legendSVG = d3.select('.chart-line-legend')
					    .attr('width', width + margin.left + margin.right)
					    .attr('height', height + margin.top + margin.bottom)
					    .append('g')
					    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

					var legend = legendSVG.selectAll('.legend')
					      .data(sampleNames.slice().reverse())
					    .enter().append('g')
					      .attr('class', 'legend')
					      .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; })
					      .on('click', function(d){
						        // Determine if current line is visible
						        // Hide or show the elements
						        d3.select('.chart-line').selectAll('g path').each(function(){
						        	if($(this).data('legend') === d) {
						        		var rect = d3.select(this);
						        		rect.transition()
  										.style('opacity', rect.style('opacity') === '0'? '1' : '0');
						        	}
						        });
						   });

					  legend.append('rect')
					      .attr('x', width - 18)
					      .attr('width', 18)
					      .attr('height', 18)
					      .style('fill', color);

					  legend.append('text')
					      .attr('x', width - 24)
					      .attr('y', 9)
					      .attr('dy', '.35em')
					      .style('text-anchor', 'end')
					      .text(function(d) { return d; });
				});
			},

			/**
			 * Generates a line chart
			 * @param  {Object} d3            [description]
			 * @param  {Object} lineDomian    [description]
			 * @param  {Object} dataLineGroup [description]
			 * @return {this}               [description]
			 */
			lineChartNTvsTime: function (lineDomian, dataLineGroup, container) {
				require(['d3', 'tip'], function (d3, tip) {
				var color = d3.scale.ordinal()
					    .range(['darkcyan', 'darkgoldenrod', 'darkorange', 'blueviolet', 'greenyellow', 'indianred', 'thistle', 'steelblue', 'skyblue', 'teal', 'wheat', 'purple', 'peru', 'lightpink', 'lavender', 'dimgray', 'chocolate', 'cadetblue', 'mediumturquoise', 'olive', 'papayawhip', 'rosybrown']);

				 function interpolateSankey(points) {
					  var x0 = points[0][0], y0 = points[0][1], x1, y1, x2,
					      path = [x0, ',', y0],
					      i = 0,
					      n = points.length;
					  while (++i < n) {
					    x1 = points[i][0], y1 = points[i][1], x2 = (x0 + x1) / 2;
					    path.push('C', x2, ',', y0, ' ', x2, ',', y1, ' ', x1, ',', y1);
					    x0 = x1, y0 = y1;
					  }
					  return path.join('');
				 }


				  var margin = {top: 20, right: 80, bottom: 30, left: 50},
				    width = 960 - margin.left - margin.right,
				    height = 500 - margin.top - margin.bottom;
				   var p=d3.scale.category20();

					var max1 = d3.max(lineDomian, function (d) {
						return +d.time;
					});

					var max2 = d3.max(lineDomian, function (d) {
						return +d.activeThread;
					});

					var min1 = d3.min(lineDomian, function (d) {
						return +d.time;
					});

					var min2 = d3.min(lineDomian, function (d) {
						return +d.activeThread;
					});

					var x = d3.time.scale()
					    .range([0, width])
					    .domain([min1,max1])
					    .nice();

					var y = d3.scale.linear()
					    .range([height, 0])
					    .domain([min2,max2])
					    .nice();

					var xAxis = d3.svg.axis()
					    .scale(x)
					    .orient('bottom');


					var yAxis = d3.svg.axis()
					    .scale(y)
					    .tickFormat(d3.format('d'))
					    .orient('left');


					var svg = d3.select(container)
							.append('svg')
					    	.attr('width', width + margin.left + margin.right)
						    .attr('height', height + margin.top + margin.bottom)
						    .append('g')
						    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

					svg.append('g')
						.attr('class', 'x axis')
						.attr('transform', 'translate(0,' + height + ')')
						.call(xAxis)
						.append('text')
						.attr('y', -12)
						.attr('x', width)
						.attr('dy', '.71em')
						.style('text-anchor', 'end')
						.text('time in seconds');

					svg.append('g')
						.attr('class', 'y axis')
						.call(yAxis)
						.append('text')
						.attr('transform', 'rotate(-90)')
						.attr('y', 6)
						.attr('dy', '.71em')
						.style('text-anchor', 'end')
						.text('no of active threads');

					var line = d3.svg.line()
						.interpolate(interpolateSankey)
						.x(function(d) {
							return x(d.time);
						})
						.y(function(d) {
							return y(d.activeThread);
						});

					var lineContainer = svg.selectAll('.container')
						.data(dataLineGroup)
						.enter().append('g')
						.attr('class', 'container');

					lineContainer.append('path')
						.attr('class', 'line')
						.attr('d', function(d) {
							return line(d.dataLine);
						})
						.attr('data-legend', function (d) {
							return d.group;
						})
						.style('stroke', function(d) {
						  return color(d.group);
						});

					lineContainer.append('text')
						.datum(function(d) { return {name: d.group, value: d.dataLine[d.dataLine.length - 1]}; })
						.attr('transform', function(d) { return 'translate(' + x(d.value.ms) + ',' + y(d.value.activeThread) + ')'; })
						.attr('x', 3)
						.attr('dy', '.35em')
						.text(function(d) { return d.name; });

					var sampleNames = [];

					sampleNames = dataLineGroup.map(function (d) {
						return d.group;
					});

					d3.select('.line-chart-2 .clear').
					on('click', function () {
						d3.select('.chart-line-2').selectAll('g path').style('opacity', '0');
					});

					var legendSVG = d3.select('.chart-line-2-legend')
					    .attr('width', width + margin.left + margin.right)
					    .attr('height', height + margin.top + margin.bottom)
					    .append('g')
					    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

					var legend = legendSVG.selectAll('.legend')
					      .data(sampleNames.slice().reverse())
					    .enter().append('g')
					      .attr('class', 'legend')
					      .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; })
					      .on('click', function(d){
						        // Determine if current line is visible
						        // Hide or show the elements
						        d3.select('.chart-line-2').selectAll('g path').each(function(){
						        	if($(this).data('legend') === d) {
						        		var rect = d3.select(this);
						        		rect.transition()
  										.style('opacity', rect.style('opacity') === '0'? '1' : '0');
						        	}
						        });
						   });

					  legend.append('rect')
					      .attr('x', width - 18)
					      .attr('width', 18)
					      .attr('height', 18)
					      .style('fill', color);

					  legend.append('text')
					      .attr('x', width - 24)
					      .attr('y', 9)
					      .attr('dy', '.35em')
					      .style('text-anchor', 'end')
					      .text(function(d) { return d; });

				});
			}
		};
		return Chart;
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
