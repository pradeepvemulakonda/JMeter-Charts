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
define(['jquery', 'mustache'], function($, Mustache) {

		return {
			// chart-report
		 	generateTableHTML: function (data) {
		 		var tableData = [];
		 		var jsonData = data[0].report.jsondata;
		 		$.each(jsonData, function (index, threadGroup) {
		 			var data = [];
						data.push(threadGroup.threadgroup.name);
						data.push(threadGroup.threadgroup.averageTime);
						data.push(threadGroup.threadgroup.successCount);
						data.push(threadGroup.threadgroup.failureCount);
						data.push(threadGroup.threadgroup.totalCount);
						data.push(threadGroup.threadgroup.successPercentage);
						data.push(threadGroup.threadgroup.averageActiveThreads);
					tableData.push({
						data: data
					});
				});

				return tableData;
		 	}
		 };
 });