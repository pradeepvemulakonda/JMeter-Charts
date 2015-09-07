var jmeterChartsApp = angular.module('JMeterCharts', ['ui.bootstrap']);

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
})

.controller('SearchController', function ($scope, $http) {
	$scope.search = 'This is a search';
	$scope.show_empty_search = true;

	$scope.getProjects = function(val) {
	    return $http.get('/jc/project').then(function(response){
	      return response.data.map(function(item){
	        return item;
	      });
	    });
	};
});