app.factory('menuService', [
    '$mdSidenav',
    '$mdPanel',
    function menuService(
        $mdSidenav,
        $mdPanel
    ) {

        return {
            buildToggler: function (navId) {
                return function () {
                    $mdSidenav(navId).toggle();
                }
            }
        }
    }
]);