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
 * New node file
 */

define(['jquery', 'canvg', 'jspdf', 'rasterize', 'mustache'], function($, canvg, jsPDF, rasterizeHTML, Mustache) {
return {
		// chart-report
	 	generatePdf: function (htmlParent, env, tableData, project) {
	 		var images = [];
	 		console.log(rasterizeHTML);
	 		$.get('/jc/templates/environment-data-table.html', function(template) {

		    	var rendered = Mustache.render(template, {
		    		env: env
		    	});
		    	var dataTable = document.createElement('CANVAS');
		    	dataTable.height = '800';
		    	dataTable.width = '600';
		    	var envTable = document.createElement('CANVAS');
		    	envTable.height = '400';

		    	var r1 = rasterizeHTML.drawHTML(rendered, envTable);
		    	var r2 = rasterizeHTML.drawHTML(tableData, dataTable);
		    	Promise.all([r1, r2]).then(function (resultList) {
		    		// TODO remove this logic
		    		console.log(resultList);
		    		var i = 0;
					var end = htmlParent.find('svg').size();
					// create a new instance of pdf
					var doc = new jsPDF('landscape');
			 		doc.setFontSize(20);
			 		// set the heading
					doc.text(15, 15, 'Report for project: ' + project);
					doc.setLineWidth(1).setFontSize(10);
					// Add the environment table image
					doc.addImage(envTable.toDataURL('image/png'), 'png', 15, 25);
					// Add the smaple details table image
					doc.addImage(dataTable.toDataURL('image/png'), 'png', 100, 25);
					// add new page to show charts
					doc.addPage(null, 'l');
					// render charts
			 		htmlParent.find('svg').each(function() {
			 			i++;
					  	var svgElement = $(this);
					  	var serializer = new XMLSerializer();
						var str = serializer.serializeToString(svgElement[0]);
					  	// the canvg call that takes the svg xml and converts it to a canvas
						canvg('canvas', str);

						// the canvas calls to output a png
						var canvas = document.getElementById('canvas');
						var img = canvas.toDataURL('image/png');
						images.push(img);
						doc.addImage(img, 'png', 15, 40);
						if(i%2 === 0 && i < end) {
							doc.addPage(null, 'l');
						}
					});

					doc.save(project+ '-report.pdf');
					$('#loadingModal').modal('hide');
		    	});
			});
		}
	};
 });