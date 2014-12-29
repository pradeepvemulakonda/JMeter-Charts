requirejs.config({
    paths: {
        "jquery": "jquery",
        "jquery.bootstrap": "bootstrap",
        "rest": "rest"
    },
    shim: {
        "jquery.bootstrap": {
            deps: ["jquery"]
        },
        
        "plugins/metisMenu/metisMenu": {
        	deps: [ 'jquery' ],
            exports: 'jQuery.fn.metisMenu'
        },
        
        "plugins/morris/morris": {
        	deps: [ 'jquery', 'plugins/morris/raphael.min' ]
        }
    }
});

require(["require","jquery", "jquery.bootstrap", "plugins/metisMenu/metisMenu", "plugins/morris/morris", "rest"], function (require, $) {
	var rest = require('rest');
	
	$(function() {
	    $('#side-menu').metisMenu();
	});

	//Loads the correct sidebar on window load,
	//collapses the sidebar on window resize.
	// Sets the min-height of #page-wrapper to window size
	$(function() {
	    $(window).bind("load resize", function() {
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
	        if (height < 1) height = 1;
	        if (height > topOffset) {
	            $("#page-wrapper").css("min-height", (height) + "px");
	        }
	    });
	});

	/**
	 * Set the chart data
	 */
	function renderCharts(json) {
				var data = [],
					dataBar = [],
					graph,
					jsonData = json[0].report.jsondata,
					ykeys = [],
					xkey = 'x',
					barItem = {};
				
				var spinHTML = "<i class='fa fa-refresh fa-spin'></i>";
				
				$('#morris-area-chart').empty();
				$('#morris-bar-chart').empty();
				
				$.each(jsonData, function (index, threadGroup) {
					ykeys.push(threadGroup.threadgroup.name);
					barItem.x = '';
					barItem[threadGroup.threadgroup.name] = threadGroup.threadgroup.averageTime;
					$.each(threadGroup.threadgroup.samples, function (innerIndex, sample) {
						var item = {};
						item.x = sample.activeThreads;
						item[threadGroup.threadgroup.name] = sample.elapsedTime;
						data.push(item);
					});
				});
				
				dataBar.push(barItem);
				graph = Morris.Line({
			        element: 'morris-area-chart',
			        data: data,
			        xkey: xkey,
			        ykeys: ykeys,
			        labels: ykeys,
			        pointSize: 3,
			        resize: true,
			        hideHover: true,
			        //xLabels: '15sec',
			        hoverCallback: function (index, options, content, row) {
			        	  return "Active threads: " + row.x;
			        }
				});
				
				var barGraph = Morris.Bar({
			        element: 'morris-bar-chart',
			        data: dataBar,
			        xkey: 'x',
			        ykeys: ykeys,
			        labels: ykeys,
			        hideHover: 'auto',
			        resize: true,
			        hoverCallback: function (index, options, content, row) {
			        	  return "sin(" + row.x + ") = " + row.y + options;
			        }
			    });

	}

	/**
	 * Set the navigation links on document ready
	 */

	$(function () {
		rest.fetchProjects(function( data, statusText, jqXHR) {
			var node = $(document.createDocumentFragment());
			$.each(data, function (index, projectName) {
				addMenu(node, projectName, 'project-nav', fetchVersion);
			});
			$('.project-nav').append(node);
		});
	});

	function addMenu(node, text, clazz, callback) {
			$("<li><a></a></li>") // li 
				.find("a") // a 
				.attr("href", "#")
				.bind('click.fetch', callback)// a 
				.html(text + '<span class="fa arrow"></span>') // a 
				.end() // li
				.addClass('active')
				.addClass(clazz)
				.appendTo(node);
	}

	function fetchVersion(event) {
		rest.fetchVersions(event.target.text, function (data, statusText, jqXHR) {
			$.each(data, function (index, version) {
				$("<ul class='nav nav-third-level'>").appendTo(event.target.parentNode);
				addMenu($(event.target.parentNode).find('ul'), version, 'version-nav', fetchBuild);
			});
			$(event.target).unbind('click.fetch');
			$('#side-menu').metisMenu();
		});
	}

	function fetchBuild(event) {
		rest.fetchBuilds($($(event.target).parent().parent().parent()).children()[0].text, event.target.text, function (data, statusText, jqXHR) {
			$.each(data, function (index, build) {
				$("<ul class='nav nav-fourth-level'>").appendTo(event.target.parentNode);
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
		rest.fetchReport(projectName, version, build,function (data, statusText, jqXHR) {
			renderCharts(data);
		});
		$('#side-menu').metisMenu();
	}
	
	
	$(function () {
	    'use strict';
	    
	    $.event.props.push( "dataTransfer" );

	    // UPLOAD CLASS DEFINITION
	    // ======================

	    var dropZone = $('#drop-zone');
	    
	    var startUpload = function(files) {
	    	var uploadFileSection = $('.js-upload-finished'),
	    		listGroup = uploadFileSection.find('.list-group');
	    	$.each(files, function (index, file) {
	    		listGroup.append('<a href="#" class="list-group-item list-group-item-info"><span class="badge alert-info pull-right">uploading&nbsp;<i class="fa fa-refresh fa-spin"></i></span>'+file.name+'</a>');
	    	});
	        console.log(files);
	    };

	    $('#js-upload-form').submit(function(e) {
	        var uploadFiles = this.files;
	        e.preventDefault();
	        startUpload(uploadFiles);
	    });

	    dropZone.on('drop', function(e) {
	        e.preventDefault();
	        this.className = 'upload-drop-zone';
	        startUpload(e.dataTransfer.files);
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

});