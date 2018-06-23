angular.module('audioPlayerApp').controller('playerController', [
	'$scope',
	'$log',
	'$location',
	'socket',
	'$',
	'AUDIO',
	'URL',
	'playerService',
	function(
		$scope, 
		$log, 
		$location, 
		socket, 
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
		if (typeof trackId !== null) {
			//$('#trackList li').removeClass('playing');
			//$('#trackList').find('li#' + trackId).addClass('playing');
		}

		try {
			AUDIO.play();
		} catch (e) {
			$log.log('caught' + e);
		}

		$scope.playButtonText = 'pause';

		//seekSlider.slider('option', 'max', audio.duration);
	}

	$scope.pause = function() {
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

	$scope.selectTrack = function(event) {
		var thisTrackId = $(event.target).parent().attr('id');
		$scope.currentTrackId = thisTrackId;

		if ($(event.target).parent().hasClass('selected')) {
			$(event.target).parent().removeClass('selected');
		} else {
			$(event.target).parent().addClass('selected');
		}
	};

	$scope.playTrack = function(event) {
		$scope.startStream($(event.target).parent().attr('id'));
	};

	$scope.playNextTrack = function(event) {
		$scope.startStream(++$scope.currentTrackId);
	};

	$scope.playPreviousTrack = function(event) {
		$scope.startStream(--$scope.currentTrackId);
	};

	$scope.playToggle = function(event) {
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

	$scope.playButtonText = 'play';
	$scope.isAsideOpen = false;
	$scope.currentTrackId = 0;
	$scope.setTrack(0);
	$scope.loadLibrary();

}]);