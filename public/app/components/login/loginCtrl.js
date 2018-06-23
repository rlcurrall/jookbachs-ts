app.controller('loginController', [ 
	'$scope', 
	'$http', 
	'$location', 
	function LoginController( $scope, $http, $location) {

		$scope.sharedKey = {
			key: ''
		};
    
		//-----------------------------
		// Methods
		//-----------------------------
		
		$scope.login = function() {

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