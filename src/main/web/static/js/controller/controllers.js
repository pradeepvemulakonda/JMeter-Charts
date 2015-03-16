var jmeterChartsApp = angular.module('JMeterCharts', []);

jmeterChartsApp.controller('MainController', function ($scope, $http) {
	  $scope.orderProp = 'age';
	  $scope.fetchProjects = function () {
		  	$http.get('/jc/project').success(function(data) {
			    $scope.projects = data;
			});
	  };
	  $scope.fetchVersions = function (project) {
		  	$http.get('/jc/project/' + project + '/version').success(function(data) {
			    $scope.versions = data;
			});
	  };
});