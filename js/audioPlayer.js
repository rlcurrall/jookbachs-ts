$(function() {

	// create/get dom elements
	var audio = document.createElement('audio');
	var slider = $('#slider');
	var sliderHandle = $('#sliderHandle');
	var playToggleButton = $('#playToggleButton');
	var isPaused = true;
	var isHandlePressed = false;

	// set audio parameters
	audio.src = 'music/03-In My Time of Dying.flac';
	audio.preload = 'metadata';
	audio.load();

	// jQueryUI slider
	slider.slider({

		create: function() {
			sliderHandle.text('0:00 / 0:00');
		},

		slide: function(event, ui) {
			setHandleTime(ui.value, audio.duration, sliderHandle);
			//console.log('slide');
		},

		start: function(event, ui) {
			isHandlePressed = true;
		},

		stop: function(event, ui) {
			isHandlePressed = false;
			audio.currentTime = ui.value;
		}

	});

	// jQueryUI play button
	playToggleButton.button({
		icon: 'ui-icon-play'
	});

	// disable the slider by default
	slider.slider('disable');

	// function called as audio is played through time to update slider
	audio.ontimeupdate = function() {

		if (!isHandlePressed) {
			slider.slider('option', 'value', audio.currentTime);
			setHandleTime(audio.currentTime, audio.duration, sliderHandle);
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

		if (audio.paused) {

			slider.slider('enable');
			slider.slider('option', 'max', audio.duration);

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

		time.sec = parseInt(sec);
		time.min = parseInt(sec / 60);
		time.sec %= 60;

		if (time.sec < 10) {
			time.sec = "0" + time.sec;
		}

		return time;

	}

});
