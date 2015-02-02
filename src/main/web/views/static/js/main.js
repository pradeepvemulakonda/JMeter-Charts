requirejs.config({
    paths: {
        'jquery': 'jquery',
        'jquery.bootstrap': 'bootstrap',
        'rest': 'rest',
        'd3': 'd3/d3',
        'tip': 'd3/tip',
        'mustache': 'mustache'

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

require(['require','jquery', 'jquery.bootstrap', 'plugins/metisMenu/metisMenu','plugins/typeahead/typeahead', 'plugins/morris/morris', 'rest', 'mustache', 'plugins/combobox/bootstrap-combobox'], function (require, $) {
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
		$('.project-nav').click(function (e) {
			require(['mustache'], function (Mustache) {
					$.get('/jc/templates/project.html', function(template) {
			    	var rendered = Mustache.render(template);
			    	$('.dynamic-template').html(rendered);
			    	if($(e.target).parent().hasClass('version-nav')) {
			    		$('.page-header').text('Version: ' + $(e.target).text());
			    	} else {
			    		$('.page-header').text('Project: ' + $(e.target).text());
			    	}

				});
			});
		});
		$('.main-project').click(function () {
			require(['mustache'], function (Mustache) {
					$.get('/jc/templates/project.html', function(template) {
				    	var rendered = Mustache.render(template);
				    	$('.dynamic-template').html(rendered);
						$('.page-header').text('Select a build to view detailed performance charts');

					});

			});
		});
	}


	/**
	 * Set the chart data
	 */
	function renderCharts(json) {
				var data = [],
					dataBar = [],
					dataLine = [],
					lineDomian = [],
					dataLineGroup=[],
					graph,
					jsonData = json[0].report.jsondata,
					ykeys = [],
					xkey = 'x',
					spinHTML = '<i class="fa fa-refresh fa-spin"></i>';

				$('#morris-area-chart').empty();
				$('#morris-bar-chart').empty();

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

				// Using requirejs
				require(['d3', 'tip'], function (d3, tip) {
					function getRandomColor() {
					    var letters = '0123456789ABCDEF'.split('');
					    var color = '#';
					    for (var i = 0; i < 6; i++ ) {
					        color += letters[Math.floor(Math.random() * 16)];
					    }
					    return color;
					}

					function ColorLuminance(hex, lum) {

						// validate hex string
						hex = String(hex).replace(/[^0-9a-f]/gi, '');
						if (hex.length < 6) {
							hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
						}
						lum = lum || 0;

						// convert to decimal and change luminosity
						var rgb = '#', c, i;
						for (i = 0; i < 3; i++) {
							c = parseInt(hex.substr(i*2,2), 16);
							c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
							rgb += ('00'+c).substr(c.length);
						}

						return rgb;
					}

					// render a bar chart
					barChart(d3, tip, dataBar);
					// render a bar chart
					lineChart(d3, lineDomian, dataLineGroup, tip);
					//render at vs time
					lineChartNTvsTime(d3, lineDomian, dataLineGroup);
				/*


				/// line chart
			*/
		});// require
	}


	function barChart(d3, tip, dataBar) {
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

		var chart = d3.select('.chart-bar')
		    .attr('width', width + margin.left + margin.right)
		    .attr('height', height + margin.top + margin.bottom)
		    .append('g')
		    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		chart.call(tipLocal);

		 var dataBarValue = [];

		 $.each(dataBar, function (index, data) {
			 dataBarValue.push(parseFloat(data.value));
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
	            .attr('transform', function(d) {
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
		      .attr('x', function(d) { return x(d.name); })
		      .attr('y', function(d) {
		    	  return y(d.value);
		    	})
		      .attr('height', function(d) { return height - y(d.value); })
		      .attr('width', x.rangeBand())
		      .on('mouseover', tipLocal.show)
		      .on('mouseout', tipLocal.hide)
		      .style('fill', function(d) {
		    	  return p(Math.floor(Math.random() * 20) + 1);
		      });

	//					  bar.on('mouseover', function(d) {
	//						  console.log(d3.select(this).attr('x'));
	//					  });

		  bar.append('text')
		      .attr('x', function(d) {
		    	  return x(d.name) + barWidth/2;
		      })
		      .attr('y', function(d) { return y(d.value) + 3; })
		      .attr('dy', '.75em')
		      .attr('class', 'bar-text')
		      .text(function(d) { return Math.floor(d.value); });

	}

	/**
	 * Generates a line chart
	 * @param  {Object} d3            [description]
	 * @param  {Object} lineDomian    [description]
	 * @param  {Object} dataLineGroup [description]
	 * @return {this}               [description]
	 */
	function lineChart(d3, lineDomian, dataLineGroup, tip) {

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

			var svg = d3.select('.chart-line')
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
				.style('stroke', function() {
				  return p(Math.floor(Math.random() * 20) + 1);
				});

			/*var legend = svg.append('g')
						  .attr('class','legend')
						  .attr('transform','translate(50,30)')
						  .style('font-size','12px')
						  .call(d3.legend);
			*/


			/*// Append marker
			var marker =
			svg.append('g')
			.append('rect')
			  .attr('height', 20)
			  .attr('width', 100)
			  .style('display', 'none')
			  .style('fill', '#FFFFFF')
			  .style('pointer-events', 'none')
			  .style('stroke', '#FB5050')
			  .style('stroke-width', '3px');

			// Add event listeners/handlers
			lineContainer.on('mouseover', function() {
			  marker.style('display', 'inherit');
			}).on('mouseout', function() {
			  marker.style('display', 'none');
			}).on('mousemove', function(d) {
			  var mouse = d3.mouse(this);
			  marker.attr('x', mouse[0]);
			  marker.attr('y', mouse[1]);
			  var group = d3.select(this).datum().group;
			});*/

			// lineContainer.append('text')
			// 	.datum(function(d) { return {name: d.group, value: d.dataLine[d.dataLine.length - 1]}; })
			// 	.attr('transform', function(d) { return 'translate(' + x(d.value.ms) + ',' + y(d.value.activeThread) + ')'; })
			// 	.attr('x', 3)
			// 	.attr('dy', '.35em')
			// 	.text(function(d) { return d.name; });
	}

	/**
	 * Generates a line chart
	 * @param  {Object} d3            [description]
	 * @param  {Object} lineDomian    [description]
	 * @param  {Object} dataLineGroup [description]
	 * @return {this}               [description]
	 */
	function lineChartNTvsTime(d3, lineDomian, dataLineGroup) {

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


			var svg = d3.select('.chart-line-2')
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
				.style('stroke', function() {
				  return p(Math.floor(Math.random() * 20) + 1);
				});

			lineContainer.append('text')
				.datum(function(d) { return {name: d.group, value: d.dataLine[d.dataLine.length - 1]}; })
				.attr('transform', function(d) { return 'translate(' + x(d.value.ms) + ',' + y(d.value.activeThread) + ')'; })
				.attr('x', 3)
				.attr('dy', '.35em')
				.text(function(d) { return d.name; });

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
	}



	/**
	 * Set the navigation links on document ready
	 */

	function setup() {

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
				$('.page-header').text('Version: ' + $(e.target).text());
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
				require(['mustache'], function (Mustache) {
					$.get('/jc/templates/chart.html', function(template) {
			    	var rendered = Mustache.render(template);
			    	$('.dynamic-template').html(rendered);
			    	$('.page-header').text('Build: ' + build);
			    	renderCharts(data);
				});
			});

			});
			$('#side-menu').metisMenu();
		}


		$(function () {
		    'use strict';

		    $.event.props.push( 'dataTransfer' );

		    // UPLOAD CLASS DEFINITION
		    // ======================

		    var dropZone = $('#drop-zone'),
		    filesToUpload= [];


		    var prepareUpload = function(files) {

		    	var uploadFileSection = $('.js-upload-files'),
		    		listGroup = uploadFileSection.find('.list-group');

		    	listGroup.find('em').remove();

		    	$.each(files, function (index, file) {
		    		filesToUpload.push({name:file.name, file: file});
		    		// <i class='fa fa-refresh fa-spin'></i>
		    		listGroup.append('<span class="list-group-item list-group-item-info"><span class="badge alert-info pull-right">ready to upload &nbsp;<i class="fa fa-times fa-fw"></i></span><span class="file-name">'+file.name+'</span></span>');
		    	});

		    	 $('.js-upload-files .fa-times').hover(
			       function () {
			         $(this).toggleClass('fa-inverse');
			       },
			      function () {
			          $(this).removeClass('fa-inverse');
			       }
			     );

		    	 $('.js-upload-files .fa-times').click(function (event) {
		    		 var fileName = $(event.target).closest('.list-group-item').find('.file-name').text();
		    		 $.each(filesToUpload, function (index, fileData) {
		    			 if(fileData && fileData.name === fileName) {
		    				 filesToUpload.splice(index, 1);
		    			 }
		    		 });

		    		 $(event.target).closest('.list-group-item').remove();
		    		 if($('.js-upload-files .list-group .list-group-item').size() <= 0) {
		    			 listGroup.append('<em>nothing selected</em>');
		    		 }

		    	 });

		        console.log(files);
		    };


		    var startUpload = function (files, form) {


		        // START A LOADING SPINNER HERE

		        // Create a formdata object and add the files
		    	var data = new FormData();
		    	$.each(files, function(index, file)
		    	{
		    		data.append('resultFiles', file.file);
		    		console.info(file.name);
		    	});

		    	data.append('project', form.find('[name="project"]').val());
		    	data.append('version', form.find('[name="version"]').val());
		    	data.append('build', form.find('[name="build"]').val());

		        $.ajax({
		            url: 'jc/upload',
		            type: 'POST',
		            data: data,
		            cache: false,
		            dataType: 'json',
		            processData: false, // Don't process the files
		            contentType: false, // Set content type to false as jQuery will
										// tell the server its a query string
										// request
		            success: function(data, textStatus, jqXHR)
		            {
		            	if(typeof data.error === 'undefined')
		            	{
		            		// Success so call function to process the form
		            		onSuccessfulUpload(event, data);
		            	}
		            	else
		            	{
		            		// Handle errors here
		            		onFailedUpload(event, data);
		            	}
		            },
		            error: function(jqXHR, textStatus, errorThrown)
		            {
		            	// Handle errors here
		            	onFailedUpload(null, textStatus);
		            	// STOP LOADING SPINNER
		            }
		        });
		    };


		    function onSuccessfulUpload(event, data) {
		    	var uploadFileSection = $('.js-upload-files'),
	    		listGroup = uploadFileSection.find('.list-group');
		    	var listFiles = $(listGroup).find('.file-name');
		    	$.each(listFiles, function (index, fileSection) {
		    		fileSection = $(fileSection);
			    		$.each(data, function (index2, fileStatus) {
			    			if(fileSection.text() === fileStatus.fileName) {
				    			if (!fileStatus.error) {
					    			fileSection.parent().removeClass('list-group-item-info').addClass('list-group-item-success');
					    			fileSection.parent().find('.alert-info').html('Uploaded successfully');
					    			fileSection.parent().find('.alert-info').removeClass('alert-info').addClass('alert-success');
				    			} else {
				    				fileSection.parent().removeClass('list-group-item-info').addClass('list-group-item-danger');
					    			fileSection.parent().find('.alert-info').html('Uploaded failed');
					    			fileSection.parent().find('.alert-info').removeClass('alert-info').addClass('alert-danger');
				    			}
			    			}
		    			});
		    	});
		    }

		    function onFailedUpload(event, data) {
		    	var uploadFileSection = $('.js-upload-files'),
	    		listGroup = uploadFileSection.find('.list-group');
		    	var listFiles = $(listGroup).find('.file-name');
		    	$.each(listFiles, function (index, fileSection) {
		    		fileSection = $(fileSection);
	    			fileSection.parent().removeClass('list-group-item-info').addClass('list-group-item-danger');
	    			fileSection.parent().find('.alert-info').html('Uploaded failed');
	    			fileSection.parent().find('.alert-info').removeClass('alert-info').addClass('alert-dangers');
		    	});
		    }

		 // Add events
		    $('#js-upload-form input[type=file]').on('change', function (event) {
		    	var files = event.target.files;
		    	prepareUpload(files);
		    });

		    $('#js-upload-form').submit(function(e) {
		    	e.stopPropagation(); // Stop stuff happening
		        e.preventDefault(); // Totally stop stuff happening
		        var uploadFiles = filesToUpload;
		        e.preventDefault();
		        startUpload(uploadFiles, $(this));
		    });

		    $('#js-upload-reset').click(function(e) {
		    	$('#js-upload-form').trigger('reset');
		        filesToUpload= [];
		        var uploadFileSection = $('.js-upload-files'),
	    		listGroup = uploadFileSection.find('.list-group');
		        listGroup.empty();
		        listGroup.append('<em>nothing selected</em>');
		    });

		    dropZone.on('drop', function(e) {
		        e.preventDefault();
		        this.className = 'upload-drop-zone';
		        prepareUpload(e.dataTransfer.files);
		    });

		    dropZone.on('dragover', function() {
		        this.className = 'upload-drop-zone drop';
		        return false;
		    });

		    dropZone.on('dragleave', function() {
		        this.className = 'upload-drop-zone';
		        return false;
		    });

		});

		/**
		 * Fetch the dropdowns
		 */
		 $(function(){
			 var projects;
		     if($('.typeahead.project').size() > 1) {
		    	 $('.typeahead.project').typeahead('destroy');

		     }
	    	 projects = buildBloodHound('jc/project');
	 		 projects.initialize(true);

			 $('.typeahead.project').typeahead({
	             hint: true,
	             highlight: true,
	             minLength: 0
	           },
	           {
	             name: 'projects',
	             displayKey: 'value',
	             source: projects.ttAdapter()
	           }
	         );

		 	// 'select'-button
		 	$('.emu-select').click(function(e){

		 	});

		 	$('.typeahead.project').on('typeahead:selected typeahead:autocompleted', function (event, suggestion) {
		 		if($('.typeahead.version').size() > 1) {
		 			$('.typeahead.version').typeahead('destroy');

		 		}
		 		var project = suggestion.value;
		 		var versions = buildBloodHound('/jc/project/'+project+'/version');
		 		// kicks off the loading/processing of `local` and
				// `prefetch`
		 		versions.initialize(true);

		 			$('.typeahead.version').typeahead({
	 	             hint: true,
	 	             highlight: true,
	 	             minLength: 0
	 	           },
	 	           {
	 	             name: 'versions',
	 	             displayKey: 'value',
	 	             source: versions.ttAdapter()
	 	           });


		 			$('.typeahead.version').on('typeahead:selected typeahead:autocompleted', function (event, suggestion) {
		 				if($('.typeahead.build').size() > 1) {
				 			$('.typeahead.build').typeahead('destroy');

				 		}
		 				var project = $('.typeahead.project').typeahead('val');
		 				var builds = buildBloodHound('/jc/project/'+project+'/version/'+suggestion.value+'/build');
		 				builds.initialize(true);

	 		 			$('.typeahead.build').typeahead({
	 		 	             hint: true,
	 		 	             highlight: true,
	 		 	             minLength: 0
	 		 	           },
	 		 	           {
	 		 	             name: 'builds',
	 		 	             displayKey: 'value',
	 		 	             source: builds.ttAdapter()
	 		 	         });
		 		});
			 });
		 });

		 function buildBloodHound(url) {
				return new Bloodhound({
					  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
						  queryTokenizer: Bloodhound.tokenizers.whitespace,
						  limit: 10,
						  remote: {
						    // url points to a json file that contains an array of country
							// names, see
						    // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
							  remote: url,
							  url: url,
						    // the json file contains an array of strings, but the
							// Bloodhound
						    // suggestion engine expects JavaScript objects so this converts
							// all of
						    // those strings
						    filter: function(list) {
						      return $.map(list, function(data) { return { value: data }; });
						    }
						  }
				});
		}
	}
});
