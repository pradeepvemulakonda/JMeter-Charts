requirejs.config({
    paths: {
        'jquery': 'jquery',
        'jquery.bootstrap': 'bootstrap',
        'rest': 'rest',
        'd3': 'd3/d3',
        'tip': 'd3/tip',
        'mustache': 'mustache',
        'chart': 'chart'

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
		    	$('.error-template').text(data);
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
