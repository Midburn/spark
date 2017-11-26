var events_all;

__get_all_events = function ($http, on_success) {
    if (events_all) {
        on_success(events_all);
    } else {
        var _url='/events';
        console.log(_url);
        $http.get(_url).then((res) => {
            events_all = res;
            on_success(res);
        });
    }
}

events_app.controller("eventsController", ($scope, $http, $filter) => {
    __get_all_events($http, (res) => {
        $scope.events = res.data.events;
        setTimeout(() => {
            innerHeightChange()
        }, 500);
    });
    $scope.changeOrderBy = function (orderByValue) {
        $scope.orderEvents = orderByValue;
    }
})

events_app.controller("eventsFormController", ($scope, $http, $filter) => {
    $scope.event = {};
    
    $scope.close = function () {
        //TODO: Need to configure correct close URL
        // url = '../he/events-admin';
        window.location.replace(url);
    }

    $scope.sendEvent = function () {
        //TODO: Need to configure correct send event URL
        // url = '../he/events-admin';
        $http.post(url, $scope.event);
    }

})