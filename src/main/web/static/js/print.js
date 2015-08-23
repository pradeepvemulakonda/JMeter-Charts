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