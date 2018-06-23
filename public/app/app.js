// get reference to angular app
var app = angular.module('audioPlayerApp', [
	'ngRoute',
	'ngResource',
	'ngMessages',
	'ngAria',
	'ngAnimate',
	'ngMaterial'
])

.config([
	'$routeProvider',
	'$locationProvider',
	'$mdThemingProvider',
	function ($routeProvider, $locationProvider, $mdThemingProvider) {

		// Routing
		$routeProvider
			.when('/', {redirectTo: '/login'})
			.when('/login', {
				templateUrl: 'app/components/login/loginView.html',
				controller: 'loginController'
			})
			.when('/player', {
				templateUrl: 'app/components/player/playerView.html',
				controller: 'playerController'
			}
		);

		//-------------------------------------------------------------------
		// Themes (replace CSS)
		// ref: https://material.angularjs.org/latest/Theming/01_introduction
		//-------------------------------------------------------------------

		// Default Theme
		$mdThemingProvider
			.theme('default')
			.primaryPalette('grey', {
				'default': '900'
			})
			.accentPalette('grey', {
				'default': '700'
			})
			.backgroundPalette('grey').dark();
		
		// Panel Theme
		$mdThemingProvider
			.theme('panel')
			.primaryPalette('indigo', {
				'default': '900'
			})
			.backgroundPalette('grey', {
				'default': '400'
			});
	}
]);





// slider jquery slections
//var seekSlider = $('#seekSlider');
//var seekSliderHandle = $('#seekSliderHandle');

// to allow user to drag slider while playing
//var isHandlePressed = false;

