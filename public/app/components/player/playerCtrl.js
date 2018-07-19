app.controller('playerController', [
	'$rootScope',
	'$scope',
	'$log',
	'socket',
	'$mdSidenav',
	'AUDIO',
	'playerService',
	'menuService',
	function (
		$rootScope,
		$scope,
		$log,
		socket,
		$mdSidenav,
		AUDIO,
		playerService,
		menuService
	) {

		//-------------------------------
		// Socket.IO
		//-------------------------------

		socket.on('connect', function () {
			$log.log('connected');

			var params = {
				'playerName': 'default'
			};

			socket.emit('join', params, function (err) {
				if (err) {
					$log.err(err);
				}
			});
		});

		socket.on('disconnect', function () {

		});

		//-------------------------------
		// Methods
		//-------------------------------

		$scope.loadLibrary = function () {
			playerService.getAllLibraryTracks()
				.then(
					function success(allTracks) {
						var data = allTracks.map(function (track) {
							var canvas = document.createElement('canvas');
							canvas.width = 100;
							canvas.height = 100;
							var ctx = canvas.getContext("2d");
							var imgData = ctx.createImageData(100, 100);
							img = track.image.data; // need to do more research on how to convert to an image
							for (var i = 0; i < imgData.data.length; i += 4) {
								imgData.data[i+0] = 0;
								imgData.data[i+1] = 0;
								imgData.data[i+2] = 255;
								imgData.data[i+3] = 255;
							}
							ctx.putImageData(imgData, 0, 0);
							var dataURL = canvas.toDataURL("image/jpeg");
							var it = {
								id: track.id,
								title: track.title,
								artist: track.artist,
								cover: dataURL,
								album: track.album,
								year: track.year
							}
							return it;
						});
						$scope.trackList = data;
					},
					function error(error) {
						// may include better error handling later
						$log.log(error);
					}
				);
		}

		$scope.play = function (trackId) {
			try {
				AUDIO.play();
				$scope.current.value = true;
			} catch (e) {
				$log.log('caught' + e);
			}
		}

		$scope.pause = function () {
			try {
				AUDIO.pause();
				$scope.current.value = false;
			} catch (e) {
				$log.log('caught' + e);
			}
		}

		$scope.setTrack = function (trackId) {
			try {
				AUDIO.src = $rootScope.URL.streamUrl + '?trackId=' + trackId;
				$scope.current.id = trackId;
			} catch (e) {
				$log.log('caught' + e);
			}
		}

		$scope.startStream = function (trackId) {
			$scope.setTrack(trackId);
			$scope.playToggle(trackId);
		}

		AUDIO.onended = function () {
			$scope.startStream(++$scope.current.id);
		}


		//-----------------------------------------------------------------------

		$scope.stopAudio = function () {
			AUDIO.pause();
			AUDIO.src = null;
		}

		$scope.toggleAudio = function () {

		}

		$scope.setTrackData = function () {

		}

		AUDIO.onloadeddata = function () {
			$log.log(AUDIO.duration);
			$scope.current.duration = AUDIO.duration;
		};

		//-------------------------------
		// Methods called by DOM
		//-------------------------------

		$scope.toggleLeft = menuService.buildToggler('left');

		$scope.playTrack = function (id) {
			$scope.startStream(id);
		};

		$scope.playNextTrack = function () {
			$scope.startStream(++$scope.current.id);
		};

		$scope.playPreviousTrack = function () {
			$scope.startStream(--$scope.current.id);
		};

		$scope.playToggle = function () {
			if ($scope.current.id == null) {
				$scope.setTrack(0);
			}
			if (AUDIO.paused) {
				$scope.play($scope.current.id);
			} else {
				$scope.pause();
			}
			socket.emit('message', 'playStatus - paused: ' + AUDIO.paused);
		};

		//-------------------------------
		// Methods to clean up
		//-------------------------------

		// function called as audio is played through time to update slider
		AUDIO.ontimeupdate = function () {
			/*if (!isHandlePressed) {
				seekSlider.slider('option', 'value', audio.currentTime);
				setHandleTime(audio.currentTime, audio.duration, seekSliderHandle);
			}*/
		};

		// formats seconds to "(m)m:ss"
		$scope.secToTime = function (sec) {
			var time = {};

			time.sec = Math.floor(sec);
			time.min = Math.floor(sec / 60);
			time.sec %= 60;

			if (time.sec < 10) {
				time.sec = "0" + time.sec;
			}

			return time;
		};

		$scope.redirect = function (route) {
			$scope.stopAudio();
			playerService.redirect(route);
		};

		//-------------------------------
		// Initialize
		//-------------------------------

		$scope.menu = [{
				name: 'Account',
				route: '/account'
			},
			{
				name: 'Logout',
				route: '/login'
			}
		]

		$scope.current = {
			id: null,
			duration: null,
			value: false
		};
		$scope.isAsideOpen = false;
		$scope.loadLibrary();
	}
]);