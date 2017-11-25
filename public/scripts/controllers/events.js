var events_all;

__get_all_events = function ($http, on_success) {
    if (events_all) {
        on_success(events_all);
    } else {
        var _url='/events';
        console.log(_url);
        $http.get(_url).then((res) => {
            events = res;
            on_success(res);
        });
    }
}

app.controller("eventsController", ($scope, $http, $filter) => {
    __get_all_events($http, (res) => {
        $scope.events = res.data.events;
        setTimeout(() => {
            innerHeightChange()
        }, 500);
    });
})