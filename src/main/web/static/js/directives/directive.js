//jmeterChartsApp = angular.module('JMeterCharts', []);

jmeterChartsApp.directive('metismenu', ['$document', function ($document) {
	return function (scope, element, attrs) {
		//$document.querySelector('#side-menu').metisMenu();
		angular.element( document.querySelector( '#side-menu' ) ).metisMenu();
  	};
}]);