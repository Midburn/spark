// angular_getCamps function from supplier_edit.js
nav_module.factory('communitiesService', ['$http', '$q', communitiesFactory]);

function communitiesFactory($http, $q) {
    const factory = {};

    /**
     * We should remodel Event Model in order to stop being based on string manipulations
     */
    function getFormerEventId() {
        let eventYear = parseInt(factory.currentEventId.replace('MIDBURN', ''));
        eventYear--;
        return `MIDBURN${eventYear}`;
    }

    function getUser() {
        $http
            .get('/communities/api/v1/user')
            .then(data => {
                const result = data.data.body;
                factory.user = result.user;
                factory.currentEventId = result.currentEventId;
                factory.allocationGroups = factory.user.groups.filter(g => g.event_id === getFormerEventId()) || [];
                console.log(factory);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function hasGroup(groupType) {
        if (!factory.user || !factory.user.groups) {
            return false;
        }
        return factory.user.groups.some(
            g => g.event_id === factory.currentEventId && g.group_type === groupType
        );
    }

    factory.getPropertyByLang = (group, propName, lng) => {
        if (!group || !propName) {
            return '';
        }
        const isHeb = lng === 'he';
        switch (propName) {
            case 'name':
                propName = isHeb ? 'group_name_he' : 'group_name_en';
                break;
            case 'description':
                propName = isHeb ? 'group_desc_he' : 'group_desc_en';
                break;
            default:
                break;
        }
        if (!group.hasOwnProperty(propName)) {
            console.warn(
                `Property ${propName} doesn't exist in Camp! maybe the model changed?`
            );
            return '';
        }
        return group[propName];
    };

    getUser();

    return factory;
}
