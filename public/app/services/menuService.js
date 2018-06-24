app.factory('menuService', [
    '$mdSidenav',
    '$mdPanel',
    function menuService(
        $mdSidenav,
        $mdPanel
    ) {

        var menuTemplate = '' +
        '<div class="menu-panel" md-whiteframe="4">' +
        '  <div class="menu-content">' +
        '    <div class="menu-item" ng-repeat="item in ctrl.items">' +
        '      <button class="md-button">' +
        '        <span>{{item}}</span>' +
        '      </button>' +
        '    </div>' +
        '  </div>' +
        '</div>';

        return {
            buildToggler: function (navId) {
                return function() {
                    $mdSidenav(navId).toggle();
                }
            },
            showToolbarMenu: function (event, menu) {
                console.log(event);
                var position = $mdPanel.newPanelPosition()
                    .relativeTo(event.target)
                    .addPanelPosition(
                        $mdPanel.xposition.ALIGN_START,
                        $mdPanel.yposition.BELOW
                    );
                
                var config = {
                    id: 'toolbar_' + menu.title,
                    attachTo: angular.element(document.body),
                    controller: playerController,
                    controllerAs: 'ctrl',
                    template: menuTemplate,
                    position: position,
                    panelClass: 'menu-panel-container',
                    locals: {
                        items: menu.items
                    },
                    openFrom: event,
                    focusOnOpen: false,
                    zIndex: 100,
                    propagateContainerEvents: true,
                    groupName: 'menus'
                }

                $mdPanel.open(config);
            }
        }
    }
]);