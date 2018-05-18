$(function() {

	/*
		setup
	*/
   
	var socket = io();
   
	// create/get dom elements
	var audio = document.createElement('audio');
	var seekSlider = $('#seekSlider');
	var seekSliderHandle = $('#seekSliderHandle');
	var playToggleButton = $('#playToggleButton');

	// to allow user to drag slider while playing
	var isHandlePressed = false;

	// set audio parameters
	audio.src = 'http://localhost:8081';
	audio.preload = 'metadata';
	audio.load();

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
			//console.log("fuck: " + ui.value);
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
