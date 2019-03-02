nav_module.factory('eventsService', ['$http', '$q', eventsFactory]);

function eventsFactory($http, $q) {
    const factory = {};

    function getCurrentEventJson() {
        return factory.currentEvent && factory.currentEvent.addinfo_json ? JSON.parse(factory.currentEvent.addinfo_json) : {};
    }
    // IMPORTANT - currentEventId is set through jade in script tag in top-nav-new.jade
    function getCurrentEvent() {
        $http
            .get(`/events/${currentEventId}`)
            .then(data => {
                factory.currentEvent = data.data.event;
            })
            .catch(e => {
                console.log(e);
            });
    };

    factory.isArtEditingDisabled = () => {
        const currentEventJson = getCurrentEventJson();
        if (!currentEventJson) {
            return true;
        }
        return currentEventJson.edit_art_disabled;
    };

    factory.isCampEditingDisabled = () => {
        const currentEventJson = getCurrentEventJson();
        if (!currentEventJson) {
            return true;
        }
        return currentEventJson.edit_camp_disabled
    };

    factory.isPresaleAvailable = () => {
        const currentEventJson = getCurrentEventJson();
        if (!currentEventJson) {
            return false;
        }
        if (!currentEventJson.appreciation_tickets_allocation_start || !currentEventJson.appreciation_tickets_allocation_end) {
            return false;
        }
        const now = moment(new Date());
        const start = moment(currentEventJson.appreciation_tickets_allocation_start);
        const end = moment(currentEventJson.appreciation_tickets_allocation_end);
        return now.isAfter(start) && now.isBefore(end);
    };

    getCurrentEvent();

    return factory;
}
