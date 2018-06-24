app.controller('playerController', [
	'$scope',
	'$log',
	'$location',
	'socket',
	'$mdSidenav',
	'AUDIO',
	'URL',
	'playerService',
	'menuService',
	function(
		$scope, 
		$log, 
		$location, 
		socket,
		$mdSidenav,
		AUDIO, 
		URL, 
		playerService,
		menuService
	) {

	//-------------------------------
    // Socket.IO
	//-------------------------------
	
	socket.on('connect', function() {
		$log.log('connected');

		var params = { 'playerName': 'default' };

		socket.emit('join', params, function(err) {
			if (err) {
				$log.err(err);
			}
		});
	})

    //-------------------------------
    // Methods
	//-------------------------------

	$scope.loadLibrary = function () {
		playerService.getAllLibraryTracks()
			.then(
				function success(allTracks) {
					// Temporary mapper to get the last part of a file path
					var test = allTracks.map(function (track){
						var tem = track.path.substr(track.path.lastIndexOf('\\') + 1);
						var it = {
							$$hashKey: track.$$hashKey,
							id: track.id,
							path: tem,
							title: track.title
						}
						return it;
					});
					$scope.trackList = test;
				},
				function error(error) {
					// may include better error handling later
					$log.log(error);
				}
			);
	}

	$scope.play = function(trackId) {
		$scope.playing.id = trackId;
		$scope.playing.value = true;

		try {
			AUDIO.play();
		} catch (e) {
			$log.log('caught' + e);
		}
	}

	$scope.pause = function() {
		$scope.playing.value = false;
		try {
			AUDIO.pause();
		} catch (e) {
			$log.log('caught' + e);
		}
	}

	$scope.setTrack = function(trackId) {
		try {
			AUDIO.src = URL.streamUrl + '?trackId=' + trackId;
			$scope.playing.id = trackId;
		} catch (e) {
			$log.log('caught' + e);
		}
	}

	$scope.startStream = function(trackId) {
		$scope.setTrack(trackId);
		$scope.play(trackId);
	}

	AUDIO.onended = function() {
		$scope.startStream(++$scope.playing.id);
	}

	//-------------------------------
    // Methods called by DOM
	//-------------------------------
	$scope.logout = function(event) {
		$log.log('logout');
		$location.path('/login');
	};

	$scope.closeLeft = function () {
		$mdSidenav('left').close()
		.then(function () {$log.log('close left is done')});
	}
	
	$scope.toggleLeft = menuService.buildToggler('left');

	$scope.playTrack = function(id) {
		$scope.startStream(id);
	};

	$scope.playNextTrack = function() {
		$scope.startStream(++$scope.playing.id);
	};

	$scope.playPreviousTrack = function() {
		$scope.startStream(--$scope.playing.id);
	};

	$scope.playToggle = function() {
		if (AUDIO.paused) {
			$scope.play($scope.playing.id);
		} else {
			$scope.pause();
		}
		socket.emit('message', 'playStatus - paused: ' + AUDIO.paused);
	};

	//-------------------------------
    // Methods to clean up
	//-------------------------------

	// function called as audio is played through time to update slider
	AUDIO.ontimeupdate = function() {
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
	}

    //-------------------------------
    // Initialize
    //-------------------------------

	$scope.menu = {
		title: 'more',
		controller: 'playerController',
		items: [
			'Account',
			'Logout'
		]
	};

	$scope.toggleMenu = function (event, menu) {
		menuService.showToolbarMenu(event, menu);
	}
	$scope.playing = {
		id: null,
		value: false
	};
	$scope.playButtonText = 'play';
	$scope.isAsideOpen = false;
	$scope.setTrack(0);
	$scope.loadLibrary();

}]);