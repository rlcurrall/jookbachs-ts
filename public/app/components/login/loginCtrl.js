app.controller('loginController', [ 
	'$rootScope',
	'$scope', 
	'$log',
	'$http', 
	'$location', 
	'$cookies',
	function LoginController( $rootScope, $scope, $log, $http, $location, $cookies) {

		$scope.sharedKey = '';
    
		//-----------------------------
		// Methods
		//-----------------------------
		
		$scope.login = function() {
			$location.path('/player');

		}
	}
]);