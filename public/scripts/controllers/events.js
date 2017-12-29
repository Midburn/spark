var events_all;

__get_all_events = ($http, on_success) => {
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
    $scope.event = newEvent ? { addinfo_json: { created_at: new Date() } } : editEvent;
    $scope.eventStarted = $scope.event.addinfo_json.start_date < new Date();
    $scope.isCommunityCampsCopied = $scope.event.addinfo_json.community_camps ? true : false;

    $scope.createEvent = () => {
        var _url = '/events/new';
        $http.post(_url, $scope.event)
            .success((response) => {
                var withCamps = "";
                if ($scope.event.addinfo_json.community_camps) {
                    $scope.copyCommunities();
                    withCamps = "with camps"
                }
                alert(`new event created ${withCamps}!`);
                document.location.href = '/he/events-admin';

            }).error(() => {
                alert("Something went wrong");
            });
    }

    $scope.updateEvent = () => {
        var _url = '/events/update';
        $http.put(_url, $scope.event)
            .success(function (response) {
                var withCamps = "";
                if ($scope.event.addinfo_json.community_camps) {
                    $scope.copyCommunities();
                    withCamps = ",and camps added"
                    $scope.isCommunityCampsCopied = true;
                }
                alert(`Event updated ${withCamps}!`);
            })
            .error(() => {
                alert("Something went wrong");
            });
    }

    $scope.copyCommunities = () => {
        let fromEvent = $scope.event.ext_id_event_id;
        let toEvent = $scope.event.event_id;
        let _url = `/camps/copyCommunities/${fromEvent}/${toEvent}`;
        $http.post(_url, $scope.event)
            .success((response) => {
                console.log("communities copied");
            })
            .error(() => {
                alert("Something went wrong");
            });

    }

})// End of Angular Controller
