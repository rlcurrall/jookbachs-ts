app.factory('apiService', [
    '$http',
    '$location',
    '$q',
    function ApiService ($http, $location, $q) {
        return {
            redirect: function (route) {
                $location.path(route);
            },
            httpGet: function (url, useCache) {
                var doCache = (typeof useCache !== "undefined") ? useCache : false;

                var deferred = $q.defer();
                $http({ method: 'GET', url: url, cache: doCache })
                    .then( 
                        function success(resp) {
                            deferred.resolve(resp.data);
                            // can add handling here for specific response codes if needed
                        },
                        function error(errorData, responseCode) {
                            deferred.reject('ERROR: ' + errorData + '\nResponse Code: ' + responseCode);
                        }
                    );
                return deferred.promise;
            },

            httpGetRaw: function (url, useCache) {
                var doCache = (typeof useCache !== "undefined") ? useCache : false;

                var deferred = $q.defer();
                $http({ method: 'GET', url: url, cache: doCache })
                    .then( 
                        function success(resp) {
                            deferred.resolve(resp);
                            // can add handling here for specific response codes if needed
                        },
                        function error(errorData, responseCode) {
                            deferred.reject('ERROR: ' + errorData + '\nResponse Code: ' + responseCode);
                        }
                    );
                return deferred.promise;
            },

            httpPost: function (url, data) {
                var deferred = $q.defer();
                $http({ method: 'POST', url: url, data: data })
                    .then( 
                        function success(resp) {
                            deferred.resolve(resp.dat);
                        },
                        function error(errorData, responseCode) {
                            deferred.reject('ERROR: ' + errorData + '\nResponse Code: ' + responseCode)
                        }
                    );
                return deferred.promise;
            },

            httpPostRaw: function (url, data) {
                var deferred = $q.defer();
                $http({ method: 'POST', url: url, data: data })
                    .then( 
                        function success(resp) {
                            deferred.resolve(resp);
                        },
                        function error(errorData, responseCode) {
                            deferred.reject('ERROR: ' + errorData + '\nResponse Code: ' + responseCode)
                        }
                    );
                return deferred.promise;
            }
        }
    }
]);