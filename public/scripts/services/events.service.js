/**
 * Run as self evoking function to keep global scope clean
 */
(function () {
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
                    state.events = res.events.map(e => {
                        e.addinfo_json = JSON.parse(e.addinfo_json) || {};
                        return e;
                    });
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

        service.isGroupEditingAvailable = function (group) {
            if (!state.events || !state.currentEventId) {
                return false;
            }
            const currentEvent = state.events.find(e => e.event_id === state.currentEventId);
            if (!currentEvent) {
                // Shouldn't happen...
                return false;
            }
            if (moment(new Date()).isAfter(currentEvent.end_date)) {
                /**
                 * Event already done.
                 */
                return false;
            }
            const edit_camp_disabled = currentEvent.addinfo_json.edit_camp_disabled;
            const edit_art_disabled = currentEvent.addinfo_json.edit_art_disabled;
            switch (group.group_type) {
                case 'Art Installation':
                    return !edit_art_disabled;
                default:
                    return !edit_camp_disabled;
            }
        };
        return service;
    }

    app.factory('eventsService', ['$http', '$q', eventService]);
})();
