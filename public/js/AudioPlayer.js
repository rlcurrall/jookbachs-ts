// get reference to angular app
var app = angular.module('audioPlayerApp', []);

// get reference for jqLite
var $ = angular.element;

// create audio dom element
var audio = document.createElement('audio');

// slider jquery slections
//var seekSlider = $('#seekSlider');
//var seekSliderHandle = $('#seekSliderHandle');

// to allow user to drag slider while playing
//var isHandlePressed = false;

// define urls
var streamUrl = 'https://localhost:8443/stream';
var apiUrl = 'https://localhost:8443/api';
var socketUrl = 'https://localhost:8443';

// get reference for socket.io connection to server
var socket = io(socketUrl);

// trackId of the current track
var currentTrackId = 0;

// boolean flag for if the sidebar is open or not
var isAsideOpen = false;

socket.on('connect', function() {

	console.log('connected');

	var params = { 'playerName': 'default' };

	socket.emit('join', params, function(err) {

		if (err) {
			console.err(err);
		}



	});

})

app.controller('loginController', function($scope, $http) {

	$scope.login = function(event) {

		// get list of all tracks from the server
		var res = $http.post(apiUrl + '/authTest', {'sharedKey': $scope.sharedKey});

		res.success(function(data, status, headers, config) {
			console.log(data);
		});

		//$('#login').fadeOut(500);
		//$('#audioPlayer').fadeIn(500);

	}

});

// controller for populating the track list
app.controller('playerController', function($scope, $http) {

	$scope.playButtonText = 'play';

	// get list of all tracks from the server
	$http.get(apiUrl + '/listAllLibraryTracks').then(function(res) {
		$scope.trackList = res.data;
	});

	play = function(trackId) {

		if (typeof trackId !== null) {
			//$('#trackList li').removeClass('playing');
			//$('#trackList').find('li#' + trackId).addClass('playing');
		}

		try {
			audio.play();
		} catch (e) {
			console.log('caught' + e);
		}

		$scope.playButtonText = 'pause';

		//seekSlider.slider('option', 'max', audio.duration);

	}

	pause = function() {

		try {
			audio.pause();
		} catch (e) {
			console.log('caught' + e);
		}

		$scope.playButtonText = 'play';

	}

	// set the current track to a given trackId
	setTrack = function(trackId) {
		currentTrackId = trackId;
		try {
			audio.src = streamUrl + '?trackId=' + trackId;
		} catch (e) {
			console.log('caught' + e);
		}
		//seekSlider.slider('option', 'max', audio.duration);
	}

	playTrack = function(trackId) {
		setTrack(trackId);
		play(trackId);
	}

	// function called as audio is played through time to update slider
	audio.ontimeupdate = function() {
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
	function secToTime(sec) {

		var time = {};

		time.sec = Math.floor(sec);
		time.min = Math.floor(sec / 60);
		time.sec %= 60;

		if (time.sec < 10) {
			time.sec = "0" + time.sec;
		}

		return time;

	}

	// handle when a song ends
	audio.onended = function() {
		playTrack(++currentTrackId);
	}

	$scope.playTrack = function(event) {
		//var thisTrackId = $(event.target).index();
		//console.log(angular.element(event.target).parent().attr('id'));
		//angular.element(event.target).parent().children()[1].val();
		playTrack($(event.target).parent().attr('id'));
	};

	$scope.selectTrack = function(event) {

		var thisTrackId = $(event.target).parent().attr('id');
		currentTrackId = thisTrackId;

		if ($(event.target).parent().hasClass('selected')) {
			$(event.target).parent().removeClass('selected');
		} else {
			$(event.target).parent().addClass('selected');
		}

	}

	$scope.playToggle = function(event) {
		socket.emit('message', 'playStatus: ' + audio.paused);
		if (audio.paused) {
			play(currentTrackId);
		} else {
			pause();
		}
	};

	$scope.playNextTrack = function(event) {
		playTrack(++currentTrackId);
	};

	$scope.playPreviousTrack = function(event) {
		playTrack(--currentTrackId);
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

	$scope.logout = function(event) {
		//$('#login').fadeIn(500);
		//$('#audioPlayer').fadeOut(500);
		console.log('logout');
	};

	setTrack(0);

});
