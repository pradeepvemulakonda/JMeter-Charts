
/**
 * New node file
 */
define(['jquery', 'canvg', 'jspdf'], function($, canvg, jsPDF) {

	return {
		// chart-report
	 	generatePdf: function (htmlParent, project) {
	 		var images = [];
	 		var doc = new jsPDF('landscape');
	 		doc.setFontSize(40);
			doc.text(35, 25, 'Report for project: ' + project);
			var i = 0;
			var end = htmlParent.find('svg').size();
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
				doc.addImage(img, 'png', 15, 40, 230, 120);
				if(i%2 === 0 && i < end) {
					doc.addPage(null, 'l');
				}
			});
			doc.save(project+ '-report.pdf');
		}

	};
 });