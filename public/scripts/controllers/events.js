events_app.controller("eventsController", ($scope, $http, $filter) => {
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
    __get_all_events($http, (res) => {
        $scope.events = res.data.events;
        setTimeout(() => {
            innerHeightChange()
        }, 500);
    });

    $scope.changeOrderBy = orderByValue => {
        $scope.orderEvents = orderByValue;
    };

    $scope.resetTickets = () => {
        const input = document.createElement('input');
        input.type = 'password';
        swal({
            title: 'האם אתה בטוח שאתה רוצה לאפס את כירטוס האירוע?',
            text: 'אנא הזן סיסמתך על מנת לאשר פעולה זו',
            content: input,
        })
        .then((done) => {
            let _url = '/events/reset';
            $http.post(_url, { password: input.value })
                .success(response => {
                    swal("איפוס הכרטיסים בוצע בהצלחה", "success");
                    setTimeout(() => {
                        document.location.href = '/he/events-admin';
                    }, 1000);
                })
                .error((err) => {
                    swal('איפוס נכשל', err.data.message, "warning");
                });
        });
    }
});

events_app.controller("eventsFormController", ($scope, $http, $filter) => {

    //initiate a new event, or fetch evet details for edit.
    $scope.isNew = isNew;
    $scope.event = isNew ? {created_at: new Date(), addinfo_json: {}} : editEvent;
    $scope.eventStarted = $scope.event.start_date < new Date();

    $scope.getDateString = (date) => {
        const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
        if (typeof date === 'string' && !dateFormat.test(value)) {
            return;
        }
        return moment(date).format('YYYY-MM-DD');
    };

    $scope.getDateString = (date) => {
        const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
        if (typeof date === 'string' && !dateFormat.test(value)) {
            return;
        }
        return moment(date).format('YYYY-MM-DD');
    };

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
