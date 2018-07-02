/**
 * Defines the socket.io service on the scope rather than on the 'window'
 * safer in case of page reload
 */
app.factory('socket', [
    '$rootScope',
    function Socket ($rootScope) {
        var socket = io.connect($rootScope.URL.socketUrl);

        return {
            on: function (eventName, callback) {
                socket.on(eventName, () => {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            }
        }
    }
]);