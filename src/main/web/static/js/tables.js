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
						data.push(threadGroup.threadgroup.scuccessPercentage);
						data.push(threadGroup.threadgroup.averageActiveThreads);
					tableData.push({
						data: data
					});
				});

				return tableData;
		 	}
		 };
 });