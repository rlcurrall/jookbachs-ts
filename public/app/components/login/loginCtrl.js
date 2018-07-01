app.controller('loginController', [ 
	'$scope', 
	'$log',
	'$http', 
	'$location', 
	function LoginController( $scope, $log, $http, $location) {

		$scope.sharedKey = '';
		$scope.serverAddress = '';
    
		//-----------------------------
		// Methods
		//-----------------------------
		
		$scope.login = function() {
			$log.log($scope.sharedKey + '\n' + $scope.serverAddress);
			$location.path('/player');

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