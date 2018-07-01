app.controller('loginController', [ 
	'$rootScope',
	'$scope', 
	'$log',
	'$http', 
	'$location', 
	'$cookies',
	function LoginController( $rootScope, $scope, $log, $http, $location, $cookies) {

		$scope.sharedKey = '';
		$scope.serverAddress = $cookies.get('serverAddr');
    
		//-----------------------------
		// Methods
		//-----------------------------
		
		$scope.login = function() {
			$cookies.put('serverAddr', $scope.serverAddress);
			$location.path('/player');

			$rootScope.URL = {
				streamUrl: 'https://' + $scope.serverAddress + ':8443/stream',
				apiUrl: 'https://' + $scope.serverAddress + ':8443/api',
				socketUrl: 'https://' + $scope.serverAddress + ':8443'
			}

			// get list of all tracks from the server 
			/*
			var res = $http.post(apiUrl + '/authTest', {'sharedKey': $scope.sharedKey});

			res.success(function(data, status, headers, config) {
				console.log(data);
			});
			*/

			//$('#login').fadeOut(500);
			//$('#audioPlayer').fadeIn(500);

		}
	}
]);