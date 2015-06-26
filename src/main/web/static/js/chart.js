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
 * Provided JMeter Charts application specific methods to render charts
 * @return {Object}
 */
;(function(define) {

	define(['jquery', 'enum', 'd3', 'tip'], function($, Enum, d3, tip) {
			var Chart = {
			/**
			 * Set the chart data
			 */
			processDataForCharts: function (json) {
						var dataBar = [],
							dataLine = [],
							lineDomian = [],
							dataLineGroup=[],
							jsonData = json[0].report.jsondata;

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
						return  {
							responseVsTimeData : dataBar,
							responseVsActiveThreads: {
								data: lineDomian,
								groupData: dataLineGroup
							}
						};
			},

			/**
			 * Compare responses from two versions
			 * @param  {Object} chart data containing data related to two versions/builds
			 * @param  {Object} version the versions to compare
			 * @param  {String} the container selector
			 */
			comparisionBarChart: function (chartData, version, container) {
				var data = {
					version: [],
					sample: []
				},
				legendData = [],
				sample = {};


				$.each(chartData, function(index, result){
					if(!version) {
						data.version.push(result.version);
						legendData.push('Version : '+ result.version)
					} else {
						data.version.push(result.build);
						legendData.push('Build : '+result.build)
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

				var color = d3.scale.ordinal()
				    .range(Enum.colors);

				var margin = {top: 100, right: 10, bottom: 170, left: 40},
				    width = 1050 - margin.left - margin.right,
				    height = 700 - margin.top - margin.bottom;

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
				    .tickFormat(d3.format('d'));

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

				var tipLocal = tip()
				.attr('class', 'd3-tip')
				.offset([-10, 0])
				.html(function(d) {
				return '<strong>Sample:</strong> <span style="color:white">' + d.name + '</span>';
				});

				svg.call(tipLocal);

				svg.append('g')
				  .attr('class', 'x axis')
				  .attr('transform', 'translate(0,' + height + ')')
				  .call(xAxis)
				  .selectAll("text")
		            .style("text-anchor", "end")
		            .attr("dx", "-.8em")
		            .attr("dy", ".15em")
		            .attr("transform", function(d) {
		                return "rotate(-45)"
                });

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
				  .on('mouseover', tipLocal.show)
				  .on('mouseout', tipLocal.hide)
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

				 d3.selectAll('.axis line')
				 .style('fill', 'none')
				 .style('stroke-width', '1px')
				 .style('stroke', 'black');
				d3.selectAll('.axis path')
				 .style('fill', 'none')
				 .style('stroke-width', '1px')
				 .style('stroke', 'black');

				legendData = versionNames.map(
					function(name, index) {
						return {
							name: name,
							value: legendData[index]
						};
				});

				var legend = svg.selectAll('.legend')
				  .data(legendData.slice().reverse())
				.enter().append('g')
				  .attr('class', 'legend')
				  .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

				legend.append('rect')
				  .attr('x', width - 18 + margin.right)
				  .attr('y', -margin.top)
				  .attr('width', 18)
				  .attr('height', 18)
				  .style('fill', function(d) { return color(d.name); });

				legend.append('text')
				  .attr('x', width - 24 + margin.right)
				  .attr('y', 9 - margin.top)
				  .attr('dy', '.35em')
				  .style('text-anchor', 'end')
				  .text(function(d) { return d.value; });
			},

			/**
			 * Render a bar chart with samples vs response time
			 * @param  {Object} dataBar data used to render bar data
			 * @param  {String} selector for container
			 */
			barChart: function (dataBar, container) {
				var sampleNames = [];
				var containerNode = $(container);
					if(containerNode) {
						containerNode.empty();
					} else {
						throw new TypeError('Container is not valid');
					}

				var color = d3.scale.ordinal()
				    .range(Enum.colors);

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

				x.domain(dataBar.map(function(d) { return d.name; }));
				y.domain([0, d3.max(dataBarValue)]);

				chart.append('g')
				  .attr('class', 'x axis')
				  .attr('transform', 'translate(0,' + height + ')')
				  .call(xAxis)
				  .selectAll('text')
				    .style('display', 'none')
				    .attr('dx', '-.8em')
				    .attr('dy', '.15em')
				    .attr('transform', function() {
				        return 'rotate(-65)';
				  });

				chart.append('g')
				    .attr('class', 'y axis')
				    .call(yAxis)
				    .append('text')
					.attr('transform', 'rotate(-90)')
					.attr('y', 6)
					.attr('dx', '-.8em')
					.attr('dy', '.1em')
					.style('text-anchor', 'end')
					.text('response time in ms');

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
					  return x(d.name) + barWidth/2 -17;
				  })
				  .attr('y', function(d) { return y(d.value) + 3; })
				  .attr('dy', '1.00em')
				  .attr('class', 'bar-text')
				  .style('stroke', 'white')
				  .style('fill', 'white')
				  .text(function(d) { return Math.floor(d.value); });
				d3.select('.bar-chart .clear').
				on('click', function () {
					d3.select('.bar-chart').selectAll('g rect').style('opacity', '0');
					d3.select('.bar-chart').selectAll('g text').style('opacity', '0');
				});

				d3.selectAll('.axis line')
				 .style('fill', 'none')
				 .style('stroke-width', '1px')
				 .style('stroke', 'black');
				d3.selectAll('.axis path')
				 .style('fill', 'none')
				 .style('stroke-width', '1px')
				 .style('stroke', 'black')


				width =  1024;
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
				        d3.select('.bar-chart').selectAll('g rect').each(function(h){
				        	if(h.name === d) {
				        		var rect = d3.select(this);
				        		rect.transition()
									.style('opacity', rect.style('opacity') === '0'? '1' : '0');
									$(this).next().toggle();
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
			},

			/**
			 * Generate a line chart which charts Average response to Average active threads
			 * @param  {Object} lineDomian  domian of the line chart
			 * @param  {Object} dataLineGroup  group data
			 * @param  {String} container the container where the svg should be rendered
			 */
			lineChart: function(lineDomian, dataLineGroup, container) {

				var color = d3.scale.ordinal()
					    .range(Enum.colors);

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
				d3.select('.line-chart').selectAll('g path').style('opacity', '0');
				});

				d3.selectAll('.axis line')
				 .style('fill', 'none')
				 .style('stroke-width', '1px')
				 .style('stroke', 'black');
				d3.selectAll('.axis path')
				 .style('fill', 'none')
				 .style('stroke-width', '1px')
				 .style('stroke', 'black');
				d3.selectAll('.container path')
				 .style('fill', 'none')
				 .style('stroke-width', '1px');

				width =  1024;
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
				        d3.select('.line-chart').selectAll('g path').each(function(){
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
			},

			/**
			 * Generate a line chart which charts Average number of active threads to time
			 * @param  {Object} lineDomian  domian of the line chart
			 * @param  {Object} dataLineGroup  group data
			 * @param  {String} container the container where the svg should be rendered
			 */
			lineChartNTvsTime: function (lineDomian, dataLineGroup, container) {
				var color = d3.scale.ordinal()
					    .range(Enum.colors);

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
				d3.select('.line-chart-2').selectAll('g path').style('opacity', '0');
				});

				d3.selectAll('.axis line')
				 .style('fill', 'none')
				 .style('stroke-width', '1px')
				 .style('stroke', 'black');
				d3.selectAll('.axis path')
				 .style('fill', 'none')
				 .style('stroke-width', '1px')
				 .style('stroke', 'black');
				d3.selectAll('.container path')
				 .style('fill', 'none')
				 .style('stroke-width', '1px');

				width =  1024;
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
				        d3.select('.line-chart-2').selectAll('g path').each(function(){
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
