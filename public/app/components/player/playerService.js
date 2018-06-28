app.factory('playerService', [
    'URL',
    'apiService',
    function PlayerService(URL, apiService) {

        // DEFINES HTTP/ROUTING REQUESTS CALLED BY CONTROLLER
        return {
            redirect: function (route) {
                apiService.redirect(route);
            },
            getAllLibraryTracks: function () {
                var url = URL.apiUrl + '/getlibrary';
                return apiService.httpGet(url, false);
            }
        }
    }
]);