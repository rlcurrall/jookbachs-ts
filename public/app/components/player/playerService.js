app.factory('playerService', [
    '$http',
    'URL',
    'apiService',
    function PlayerService ( $http, URL, apiService ) {

        // DEFINES HTTP REQUESTS CALLED BY CONTROLLER
        return {
            getAllLibraryTracks: function () {
                var url = URL.apiUrl + '/getlibrary';
                return apiService.httpGet(url, false);
            }
        }
    }
]);