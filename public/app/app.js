// get reference to angular app
var app = angular.module('audioPlayerApp', [
		'ngCookies',
		'ngRoute',
		'ngResource',
		'ngMessages',
		'ngAria',
		'ngAnimate',
		'ngMaterial'
	])

	.config([
		'$routeProvider',
		'$mdIconProvider',
		'$mdThemingProvider',
		function ($routeProvider, $mdIconProvider, $mdThemingProvider) {

			// Routing
			$routeProvider
				.when('/', {
					redirectTo: '/login'
				})
				.when('/login', {
					templateUrl: 'app/components/login/loginView.html',
					controller: 'loginController'
				})
				.when('/player', {
					templateUrl: 'app/components/player/playerView.html',
					controller: 'playerController'
				});

			//--------------------------------------------------------------------
			// Themes (used to provide more consistent coloring across entire app)
			// ref: https://material.angularjs.org/latest/Theming/01_introduction
			//--------------------------------------------------------------------

				var customPrimary = {
					'50': '#27eaff',
					'100': '#0ee8ff',
					'200': '#00dcf3',
					'300': '#00c5da',
					'400': '#00aec0',
					'500': '#0097a7',
					'600': '#00808d',
					'700': '#006974',
					'800': '#00525a',
					'900': '#003b41',
					'A100': '#41edff',
					'A200': '#5aefff',
					'A400': '#74f2ff',
					'A700': '#002427'
				};
				$mdThemingProvider
					.definePalette('customPrimary', 
									customPrimary);
			
				var customAccent = {
					'50': '#6d5200',
					'100': '#866500',
					'200': '#a07800',
					'300': '#b98b00',
					'400': '#d39e00',
					'500': '#ecb100',
					'600': '#ffc720',
					'700': '#ffce3a',
					'800': '#ffd453',
					'900': '#ffda6d',
					'A100': '#ffc720',
					'A200': '#ffc107',
					'A400': '#ecb100',
					'A700': '#ffe186'
				};
				$mdThemingProvider
					.definePalette('customAccent', 
									customAccent);
			
				var customWarn = {
					'50': '#ffb280',
					'100': '#ffa266',
					'200': '#ff934d',
					'300': '#ff8333',
					'400': '#ff741a',
					'500': '#ff6400',
					'600': '#e65a00',
					'700': '#cc5000',
					'800': '#b34600',
					'900': '#993c00',
					'A100': '#ffc199',
					'A200': '#ffd1b3',
					'A400': '#ffe0cc',
					'A700': '#803200'
				};
				$mdThemingProvider
					.definePalette('customWarn', 
									customWarn);
			
				var customBackground = {
					'50': '#86a1a7',
					'100': '#77959c',
					'200': '#698990',
					'300': '#5f7b81',
					'400': '#546d73',
					'500': '#495f64',
					'600': '#3e5155',
					'700': '#334347',
					'800': '#293538',
					'900': '#1e2729',
					'A100': '#95acb1',
					'A200': '#a3b8bc',
					'A400': '#b2c3c7',
					'A700': '#13191a'
				};
				$mdThemingProvider
					.definePalette('customBackground', 
									customBackground);
			
			   $mdThemingProvider.theme('default')
				   .primaryPalette('customPrimary', {'default':'800'})
				   .accentPalette('customAccent', {'default':'200'})
				   .warnPalette('customWarn', {'default': 'A700'})
				   .backgroundPalette('customBackground', {'default':'900'}).dark();
				
				$mdThemingProvider.theme('panel')
				   .primaryPalette('customPrimary', {'default':'800'})
				   .accentPalette('customAccent', {'default':'200'})
				   .warnPalette('customWarn', {'default': 'A700'})
				   .backgroundPalette('customBackground', {'default':'A400'});
		}
	])

	.run([
		'$rootScope',
		'$location',
		function ($rootScope, $location) {
			// stuff
			$rootScope.URL = {
				streamUrl: 'https://' + $location.host() + ':8443/stream',
				apiUrl: 'https://' + $location.host() + ':8443/api',
				socketUrl: 'https://' + $location.host() + ':8443'
			};
		}
	]);