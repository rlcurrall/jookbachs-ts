$(function() {

	/*
		setup
	*/
   
	// get reference for socket.io connection to server
	var socket = io();
   
	// create/get dom elements
	var audio = document.createElement('audio');
	var seekSlider = $('#seekSlider');
	var seekSliderHandle = $('#seekSliderHandle');
	var playToggleButton = $('#playToggleButton');

	// to allow user to drag slider while playing
	var isHandlePressed = false;
	
	// array to hold track information
	var tracks;
	
	// server to stream from
	var streamServerUrl = 'http://localhost:8081';
	var apiServerUrl = 'http://localhost:8080';

	// set audio parameters
	audio.src = streamServerUrl + '/?libraryIndex=0';
	audio.preload = 'metadata';
	audio.load();
	
	// get list of tracks through the API via Ajax
	$.get(apiServerUrl + '/api/list_all_library_tracks', function (res) {
		tracks = res;
		//console.log(tracks);
		for (var i = 0; i < tracks.length; i++) {
			$('#trackList').append('<li class="ui-widget-content">' + 
				tracks[i].path + '</li>');
		}
	});
	
	// setup selectable track list to select which song to play
	$('#trackList').selectable({
		stop: function() {
			$('.ui-selected', this).each(function() {
				var index = $('#trackList li').index(this);
				//$('#trackList li').eq(index).html();
				audio.src = streamServerUrl + '/?libraryIndex=' + index;
			});
		 }
    });

	// setup jQueryUI slider
	seekSlider.slider({

		// when slider is created
		create: function() {
			//seekSliderHandle.text('0:00 / 0:00');
			setHandleTime(0, 0, seekSliderHandle);
		},

		// when slider is sliding
		slide: function(event, ui) {
			setHandleTime(ui.value, audio.duration, seekSliderHandle);
			//console.log('slide');
		},

		// when the slider starts sliding
		start: function(event, ui) {
			isHandlePressed = true;
		},

		// when the slider stops sliding
		stop: function(event, ui) {
			isHandlePressed = false;
			//console.log(ui.value);
			audio.currentTime = ui.value;
		}

	});

	// setup jQueryUI play button
	playToggleButton.button({
		icon: 'ui-icon-play',
		label: 'play'
	});

	// disable the slider by default
	seekSlider.slider('disable');

	/*
		event-handlers
	*/

	// function called as audio is played through time to update slider
	audio.ontimeupdate = function() {
		if (!isHandlePressed) {
			seekSlider.slider('option', 'value', audio.currentTime);
			setHandleTime(audio.currentTime, audio.duration, seekSliderHandle);
		}
	};

	playToggleButton.click(function() {
		playToggle(audio);
	});

	$(window).keyup(function(event) {

		//console.log("key pressed: " + event.which);

		switch (event.which) {

			case 32: // spacebar
				playToggle(audio);
				break;

		}

	});

	function playToggle(audio) {

		socket.emit('message', 'playStatus: ' + audio.paused);

		if (audio.paused) {

			seekSlider.slider('enable');
			seekSlider.slider('option', 'max', audio.duration);

			playToggleButton.button('option', 'label', 'pause');
			playToggleButton.button('option', 'icon', 'ui-icon-pause');

			isPaused = false;
			audio.play();

		} else {

			playToggleButton.button('option', 'label', 'play');
			playToggleButton.button('option', 'icon', 'ui-icon-play');

			isPaused = true;
			audio.pause();

		}

	}

	/*
		helper functions
	*/

	// formats and sets the timestamps on the specified slider handle
	function setHandleTime(currentSeconds, totalSeconds, handle) {

		var currentTime = secToTime(currentSeconds);
		var totalTime = secToTime(totalSeconds);

		handle.text(currentTime.min + ':' + currentTime.sec + ' / ' +
			totalTime.min + ':' + totalTime.sec);

	}

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

});
