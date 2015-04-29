/**
 * Constants for the application
 * @param  {JQuery}
 * @return {Object} an enum of all constants in the application
 */
define(['jquery'], function($) {

	return {
		template: {
			LATEST_PROJECT: 'latest-project',
			CHART: 'chart',
			COMPARE: 'compare',
			ENV_DATA: 'environment-data-table',
			NAV: 'navigation-template',
			REPORT: 'report',
			SAMPLE_DATA: 'sample-data-table',
			UPLOAD: 'upload'
		},

		colors: ['darkcyan', 'darkgoldenrod', 'darkorange', 'blueviolet', 'greenyellow', 'indianred', 'thistle', 'steelblue', 'skyblue', 'teal', 'wheat', 'purple', 'peru', 'lightpink', 'lavender', 'dimgray', 'chocolate', 'cadetblue', 'mediumturquoise', 'olive', 'papayawhip', 'rosybrown']
	 };
});