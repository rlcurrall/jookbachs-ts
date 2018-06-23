angular.module('audioPlayerApp').controller('playerController', [
	'$scope',
	'$log',
	'$location',
	'socket',
	'$mdSidenav',
	'$mdDialog',
	'$',
	'AUDIO',
	'URL',
	'playerService',
	function(
		$scope, 
		$log, 
		$location, 
		socket,
		$mdSidenav,
		$mdDialog,
		$, 
		AUDIO, 
		URL, 
		playerService) {

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
					$scope.trackList = allTracks;
				},
				function error(error) {
					// may include better error handling later
					$log.log(error);
				}
			);
	}

	$scope.play = function(trackId) {
		$scope.playing = true;

		if (typeof trackId !== null) {
			//$('#trackList li').removeClass('playing');
			//$('#trackList').find('li#' + trackId).addClass('playing');
		}

		try {
			AUDIO.play();
		} catch (e) {
			$log.log('caught' + e);
		}

		//seekSlider.slider('option', 'max', audio.duration);
	}

	$scope.pause = function() {
		$scope.playing = false;
		try {
			AUDIO.pause();
		} catch (e) {
			$log.log('caught' + e);
		}
		$scope.playButtonText = 'play';
	}

	$scope.setTrack = function(trackId) {
		$scope.currentTrackId = trackId;
		try {
			AUDIO.src = URL.streamUrl + '?trackId=' + trackId;
		} catch (e) {
			$log.log('caught' + e);
		}
		//seekSlider.slider('option', 'max', audio.duration);
	}

	$scope.startStream = function(trackId) {
		$scope.setTrack(trackId);
		$scope.play(trackId);
	}

	AUDIO.onended = function() {
		$scope.startStream(++$scope.currentTrackId);
	}

	// sidenav stuff -- break out into own service...
	$scope.isOpen = function(){return $mdSidenav('left').isOpen()};
	function buildToggler(navID) {
		return function() {
		  // Component lookup should always be available since we are not using `ng-if`
		  $mdSidenav(navID)
			.toggle()
			.then(function () {
			  $log.debug("toggle " + navID + " is done");
			});
		};
	  }
	$scope.toggleLeft = buildToggler('left');

	$scope.closeLeft = function () {
		$mdSidenav('left').close()
		.then(function () {$log.log('close left is done')});
	}

	$scope.navigateTo = function(to, event) {
		$mdDialog.show(
		  $mdDialog.alert()
			.title('Navigating')
			.textContent('Imagine being taken to ' + to)
			.ariaLabel('Navigation demo')
			.ok('Neat!')
			.targetEvent(event)
		);
	  };

	//-------------------------------
    // Methods called by DOM
	//-------------------------------
	$scope.logout = function(event) {
		//$('#login').fadeIn(500);
		//$('#audioPlayer').fadeOut(500);
		$log.log('logout');
		$location.path('/login');
	};

	$scope.hideToggle = function(event) {
		//$("#queue").animate({width:'toggle'},500);

		if (isAsideOpen) {
			//$('#queue').slideUp(500);
			/*$('#trackList').animate({
				width: '+=15em'
			}, 500);*/
		} else {
			//$('#queue').slideDown(500);
			/*$('#trackList').animate({
				width: '-=15em'
			}, 500);*/
		}

		isAsideOpen = !isAsideOpen;
	};

	$scope.selectTrack = function(id) {
		$scope.currentTrackId = id;
	};

	$scope.playTrack = function(id) {
		$scope.startStream(id);
	};

	$scope.playNextTrack = function(event) {
		$scope.startStream(++$scope.currentTrackId);
	};

	$scope.playPreviousTrack = function(event) {
		$scope.startStream(--$scope.currentTrackId);
	};

	$scope.playToggle = function() {

		socket.emit('message', 'playStatus: ' + AUDIO.paused);
		if (AUDIO.paused) {
			$scope.play($scope.currentTrackId);
		} else {
			$scope.pause();
		}
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

	// formats and sets the timestamps on the specified slider handle
	/*function setHandleTime(currentSeconds, totalSeconds, handle) {

		var currentTime = secToTime(currentSeconds);
		var totalTime = secToTime(totalSeconds);

		handle.text(currentTime.min + ':' + currentTime.sec + ' / ' +
			totalTime.min + ':' + totalTime.sec);

	}*/

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

	$scope.playing = false;
	$scope.playButtonText = 'play';
	$scope.isAsideOpen = false;
	$scope.currentTrackId = 0;
	$scope.setTrack(0);
	$scope.loadLibrary();

}]);