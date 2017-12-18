var events_all;

__get_all_events = function ($http, on_success) {
    if (events_all) {
        on_success(events_all);
    } else {
        var _url = '/events';
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
    //initiate a new event, or fetch evet details for edit.
    $scope.event = newEvent ? {} : editEvent;

    $scope.sendEvent = function () {
        var _url = '/events/new';
        $http.post(_url, $scope.event)
        .success(function(response) {
            alert("Event added to DB");
        })
        .error(function() {
            alert("Something went wrong");
        });
    }

    $scope.updateEvent = function () {
        var _url = '/events/update';
        $http.put(_url, $scope.event)
        .success(function(response) {
            alert("Event updated");
        })
        .error(function() {
            alert("Something went wrong");
        });
    }

})// End of Angular Controller
