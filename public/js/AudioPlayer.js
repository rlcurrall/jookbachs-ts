// get reference to angular app
var app = angular.module('audioPlayerApp', []);

// get reference for socket.io connection to server
var socket = io();

// create audio dom element
var audio = document.createElement('audio');

// define urls
var streamUrl = 'https://sweylo.net:8444/stream';
var apiUrl = 'https://sweylo.net:8444/api';

// trackId of the current track
var currentTrackId = 0;

var isAsideOpen = false;

// controller for populating the track list
app.controller('playerController', function($scope, $http) {

	$scope.playButtonText = 'play';

	// get list of all tracks from the server
	$http.get(apiUrl + '/list_all_library_tracks').then(function(res) {
		$scope.trackList = res.data;
	});

	play = function() {
		audio.play();
		$scope.playButtonText = 'pause';
	}

	pause = function() {
		audio.pause();
		$scope.playButtonText = 'play';
	}

	// set the current track to a given trackId
	setTrack = function(trackId) {
		currentTrackId = trackId;
		audio.src = streamUrl + '?trackId=' + trackId;
	}

	playTrack = function(trackId) {
		currentTrackId = trackId;
		audio.src = streamUrl + '?trackId=' + trackId;
		$('#trackList li').removeClass('playing').eq(trackId).addClass('playing');
		play();
	}

	// handle when a song ends
	audio.onended = function() {
		playTrack(++currentTrackId);
	}

	$scope.playTrack = function(event) {
		var thisTrackId = $(event.target).index();
		playTrack(thisTrackId);
	};

	$scope.selectTrack = function(event) {

		var thisTrackId = $(event.target).index();
		currentTrackId = thisTrackId;

		if ($('#trackList li').eq(thisTrackId).hasClass('selected')) {
			$('#trackList li').eq(thisTrackId).removeClass('selected');
		} else {
			$('#trackList li').eq(thisTrackId).addClass('selected');
		}

	}

	$scope.playToggle = function(event) {
		if (audio.paused) {
			play();
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

		if (isAsideOpen) {
			//$('#queue').slideUp(500);
			$("#queue").animate({width:'toggle'},500);
			$('#trackList').animate({
				width: '+=15em'
			}, 500);
		} else {
			//$('#queue').slideDown(500);
			$("#queue").animate({width:'toggle'},500);
			$('#trackList').animate({
				width: '-=15em'
			}, 500);
		}

		isAsideOpen = !isAsideOpen;

	};

	setTrack(0);

});
