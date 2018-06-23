app.controller('indexController', [
    '$rootScope',
    '$route',
    '$routeParams',
    '$location',
    function IndexController($route, $routeParams, $location) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;
        
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
    }
]);