var jmeterChartsApp = angular.module('JMeterCharts', []);

// Create a service

jmeterChartsApp.controller('MainController', function ($scope, $http, $rootScope) {
	  $scope.orderProp = 'age';
	  $scope.fetchProjects = function () {
		  	$http.get('/jc/project').success(function(data) {
			    $scope.projects = data;
			});
	  };

})

.controller('VersionController', function ($scope, $http) {
	 $scope.fetchVersions = function (project) {
		  	$http.get('/jc/project/' + project + '/version').success(function(data) {
			    $scope.versions = data;
			});
	  };
});