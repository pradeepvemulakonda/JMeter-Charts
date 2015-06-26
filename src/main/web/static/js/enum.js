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
			UPLOAD: 'upload',
			MENU: 'menu',
			SUB_MENU: 'sub-menu',
		},

		colors: [
					'#FFABA0',
					'#8AE2BA',
					'#B79195',
					'#9F84A3',
					'#3B5998',
					'#468499',
					'#FFE658',
					'#005A31',
					'#16A1FF',
					'#B0BACA',
					'#9AA280',
					'#C17D5B',
					'#591B61',
					'#575A59',
					'#D45D0C',
					'#580000',
					'#8B2B00',
					'#FF3A55',
					'#6E3260',
					'#3B3738']
	 };
});