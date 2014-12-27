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
	$.when( $.getJSON( "/jc/project" ) ).done(function( data, statusText, jqXHR) {
		var node = $(document.createDocumentFragment());
		$.each(data, function (index, text){
			addMenu(node, text, "/jc/project", fetchVersion);
		});
		$('.project-nav').append(node);
	});
});

function addMenu(node, menuDesc, url, callback) {
		var li = $("<li><a></a></li>") // li 
			.find("a") // a 
			.attr("href", "#")
			.bind('click.fetch', callback(menuDesc, url))// a 
			.html(menuDesc + '<span class="fa arrow"></span>') // a 
			.end() // li
			.addClass('active')
			.appendTo(node);
}

function fetchVersion(menuDesc, url) {
	return function (event) {
		fetchVersionInternal(menuDesc, event, url, 'version');
	}
}

function fetchBuild(menuDesc, url) {
	return function (event) {
		fetchBuildInternal(menuDesc, event, url, 'build');
	}
}

function fetchChartData(menuDesc, url) {
	return function (event) {
		fetchChartDataInternal(menuDesc, event, url);
	}
}

function fetchVersionInternal(menuDesc, event, url, nextResource) {
	url = url + '/' + event.target.text + '/' + nextResource;
	$.when( $.getJSON( url ) ).done(function (data, statusText, jqXHR) {
		$.each(data, function (index, menuDesc) {
			$("<ul class='nav nav-third-level'>").appendTo(event.target.parentNode);
			addMenu($(event.target.parentNode).find('ul'), menuDesc, url, fetchBuild);
		});
		$(event.target).unbind('click.fetch');
		$('#side-menu').metisMenu();
	});
}

function fetchBuildInternal(menuDesc, event, url, nextResource) {
	url = url + '/' + event.target.text + '/' + nextResource;
	$.when( $.getJSON( url ) ).done(function (data, statusText, jqXHR) {
		$.each(data, function (index, menuDesc) {
			$("<ul class='nav nav-fourth-level'>").appendTo(event.target.parentNode);
			addMenu($(event.target.parentNode).find('ul'), menuDesc, url, fetchChartData);
		});
		$(event.target).unbind('click.fetch');
		$('#side-menu').metisMenu();
	});
}

function fetchChartDataInternal(menuDesc, event, url) {
	url = url + '/' + event.target.text;
	$.when( $.getJSON( url ) ).done(function (data, statusText, jqXHR) {
		renderCharts(data);
	});
	$('#side-menu').metisMenu();
}




