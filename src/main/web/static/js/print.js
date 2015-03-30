
/**
 * New node file
 */
define(['jquery', 'canvg'], function($, canvg) {

	return {
	 	printChart: function (svgElement) {
		 // the canvg call that takes the svg xml and converts it to a canvas
			canvg('canvas', svgElement);

			// the canvas calls to output a png
			var canvas = document.getElementById('canvas');
			var img = canvas.toDataURL('image/png');
			return img;
		}

	};
 });