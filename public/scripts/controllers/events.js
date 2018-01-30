var events_all;
var currentEvent; // call currentEvent() (as function), then use as currentEvent (as object)

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

{
    let get_current_event = () => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    currentEvent = JSON.parse(xhttp.responseText).event;
                    currentEvent.addinfo_json = JSON.parse(currentEvent.addinfo_json);

                } else {
                    alert(`getting current event details failed`);
                    console.error(`${response.status} - ${response.responseText}`);
                }
            }
        };

        let _url = '/events/current';
        xhttp.open("GET", _url, false);
        xhttp.send();
        // keep as non sync, since we need to query the current event details before we use it.
    }

    currentEvent = async function () {
        await get_current_event();
    }
}

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
})

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
    }

    $scope.updateEvent = () => {
        let _url = '/events/update';
        $http.put(_url, $scope.event)
            .success(response => {
                swal("Event updated!");
            })
            .error(() => {
                alert("Something went wrong with updating the event");
            });
    }

    $scope.closeForm = () => {
        document.location.href = '/he/events-admin';
    }
})// End of Angular Controller
