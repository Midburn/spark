function eventService($http, $q) {
    const state = {
        events: [],
        currentEventId: null
    };
    const service = {};

    service.getEvents = function () {
        const def = $q.defer();
        if (state.events.length) {
            def.resolve(state.events);
        }
        $http.get('/events')
            .success(function (res) {
                state.events = res.events;
                return def.resolve(state.events);
            })
            .error(function (err) {
                state.events = [];
                return def.reject(new Error('Error getting events list' + err.message));
            });
        return def.promise;
    };

    service.getCurrentEvent = function () {
        const def = $q.defer();
        if (state.currentEventId) {
            def.resolve(state.currentEventId);
        }
        $http.get('/events/current')
            .success(function (res) {
                state.currentEventId = res.id;
                return def.resolve(state.currentEventId);
            })
            .error(function (err) {
                state.events = [];
                return def.reject(new Error('Error getting current event' + err.message));
            });
        return def.promise;
    };

    return service;
}

app.factory('eventsService', ['$http', '$q', eventService]);
