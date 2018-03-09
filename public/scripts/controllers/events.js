let events_all;

__get_all_events = function ($http, on_success) {
    if (events_all) {
        on_success(events_all);
    } else {
        const _url = '/events';
        $http.get(_url).then((res) => {
            events_all = res;
            on_success(res);
        });
    }
};

events_app.controller("eventsController", ($scope, $http, $filter) => {
    __get_all_events($http, (res) => {
        $scope.events = res.data.events;
        setTimeout(() => {
            innerHeightChange()
        }, 500);
    });
    $scope.changeOrderBy = orderByValue => {
        $scope.orderEvents = orderByValue;
    }
});

events_app.controller("eventsFormController", ($scope, $http, $filter) => {
    //initiate a new event, or fetch evet details for edit.
    $scope.isNew = isNew;
    $scope.event = isNew ? { addinfo_json: { created_at: new Date() } } : editEvent;
    $scope.eventStarted = $scope.event.addinfo_json.start_date < new Date();

    $scope.createEvent = () => {
        let _url = '/events/new';
        $http.post(_url, $scope.event)
            .success(response => {
                swal("Event added to DB!", `Event id:${$scope.event.event_id} added.`, "success");
                setTimeout(() => {
                    document.location.href = '/he/events-admin';
                }, 1000);
            })
            .error(() => {
                alert("Something went wrong with creating the event");
            });
    };

    $scope.updateEvent = () => {
        let _url = '/events/update';
        $http.put(_url, $scope.event)
            .success(response => {
                swal("Event updated!");
            })
            .error(() => {
                alert("Something went wrong with updating the event");
            });
    };

    $scope.closeForm = () => {
        document.location.href = '/he/events-admin';
    }
});// End of Angular Controller
