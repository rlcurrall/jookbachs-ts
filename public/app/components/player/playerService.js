app.factory('playerService', [
    '$rootScope',
    'apiService',
    function PlayerService($rootScope, apiService) {

        // DEFINES HTTP/ROUTING REQUESTS CALLED BY CONTROLLER
        return {
            redirect: function (route) {
                apiService.redirect(route);
            },
            getAllLibraryTracks: function () {
                var url = $rootScope.URL.apiUrl + '/getlibrary';
                return apiService.httpGet(url, false);
            }
        }
    }
]);