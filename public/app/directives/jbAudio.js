app.directive('jbAudio', [
    function () {
        return {
            restrict: 'AEC',
            scope : {
                queue: '=',
                currentTrack: '=',
                volume: '=',
                start: '=',
                currentTime: '=',
                loop: '=',
                playing: '='
            },
            controller: [
                function () {
                    // Initialization
                    

                    // Functions
                    $scope.stopAudio = function () {

                    }

                    $scope.playAudio = function () {

                    }

                    $scope.playNext = function () {

                    }
                }
            ]
        }
    }
])