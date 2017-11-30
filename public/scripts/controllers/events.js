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

    $scope.event = {};
    $scope.event.createdAt = document.querySelector("#meta__created_at").value;
    $scope.event.event_id = document.querySelector("#meta__id").value;
    $scope.event.previousEventId = document.querySelector("#meta__previousEventId").value;
    $scope.event.gateCode = document.querySelector("#meta__gate_code").value;
    $scope.event.event_desc_he = document.querySelector("#meta__event_desc_he").value;
    $scope.event.event_desc_en = document.querySelector("#meta__event_desc_en").value;
    $scope.event.event_name_he = document.querySelector("#meta__event_name_he").value;
    $scope.event.event_name_en = document.querySelector("#meta__event_name_en").value;
    $scope.event.start_date = document.querySelector("#meta__startDate").value;
    $scope.event.end_date = document.querySelector("#meta__endDate").value;
    $scope.event.start_presale_tickets = document.querySelector("#meta__startPresaleTickets").value;
    $scope.event.end_presale_tickets = document.querySelector("#meta__endPresaleTickets").value;
    $scope.event.community_camps;//TODO - capture form the DB
    $scope.event.community_art_installation;//TODO - capture form the DB
    $scope.event.community_prod_dep;//TODO - capture form the DB
    $scope.event.tickets_info;//TODO - capture form the DB
    
    $scope.close = function() {
        var url = '/events-admin';
        window.location.replace(url);
    }

    $scope.sendEvent = function () {
        const url = '/events/new';
        $http.post(url, $scope.event)
        .success(function(response) {
            alert("Event add to DB");
        })
        .error(function() {
            alert("Something went wrong");
        });
    }

})// End of Angular Controller
