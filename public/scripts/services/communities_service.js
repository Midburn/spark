// angular_getCamps function from supplier_edit.js
nav_module.factory ('communitiesService', ['$http', '$q', communitiesFactory]);

function communitiesFactory ($http, $q) {
  const factory = {};
  const GROUP_STATIC_ROLES = {
    LEADER: 'LEADER',
    MOOP: 'MOOP',
    SAFETY: 'SAFETY',
    SOUND: 'SOUND',
    CONTENT: 'CONTENT',
    CONTACT: 'CONTACT',
    PRE_SALE_ALLOCATOR: 'PRE_SALE_ALLOCATOR',
    EARLY_ARRIVAL_ALLOCATOR: 'EARLY_ARRIVAL_ALLOCATOR',
  };
  const GROUP_TYPES = {
    CAMP: 'camp',
    ART: 'art',
  };
  /**
     * We should remodel Event Model in order to stop being based on string manipulations
     */
  function getFormerEventId () {
    let eventYear = parseInt (factory.currentEventId.replace ('MIDBURN', ''));
    eventYear--;
    return `MIDBURN${eventYear}`;
  }

  function getUser () {
    $http
      .get ('/communities/api/v1/user')
      .then (data => {
        const result = data.data.body;
        if (!result) {
          return;
        }
        factory.user = result.user;
        factory.currentEventId = result.currentEventId;
        factory.allocationGroups = factory.user.groups.filter (
          g =>
            g.event_id === getFormerEventId () &&
            isAllowedToAllocateTickets (g.id)
        ) || [];
      })
      .catch (e => {
        console.log (e);
      });
  }

  // Does the logged user manage this specific group
  function isGroupManager (groupId) {
    if (
      !factory.user.groups ||
      !factory.user.groups.find (g => g.id === groupId)
    ) {
      return false;
    }
    return factory.user.groups.some (
      g => g.id === +groupId && g.main_contact === factory.user.user_id
    );
  }

  function hasRole (groupId, role) {
    if (
      !factory.user.roles ||
      !factory.user.roles.find (g => g.group_id === groupId)
    ) {
      return false;
    }
    return !!factory.user.roles.find (
      r => r.role === role && r.group_id === groupId
    );
  }

  function isAllowedToAllocateTickets (groupId) {
    if (!factory.user) {
      return false;
    }
    // Add logic for more permissions here
    return (
      factory.user.isAdmin ||
      isGroupManager (groupId) ||
      hasRole (groupId, GROUP_STATIC_ROLES.LEADER) ||
      hasRole (groupId, GROUP_STATIC_ROLES.PRE_SALE_ALLOCATOR)
    );
  }

  factory.hasCamp = () => {
    if (!factory.user || !factory.user.groups) {
      return false;
    }
    return factory.user.groups.some (
      g =>
        g.event_id === factory.currentEventId &&
        g.group_type === GROUP_TYPES.CAMP
    );
  };

  factory.hasArt = () => {
    if (!factory.user || !factory.user.groups) {
      return false;
    }
    return factory.user.groups.some (
      g =>
        g.event_id === factory.currentEventId &&
        g.group_type === GROUP_TYPES.ART
    );
  };

  function getGroupId (type) {
    if (!factory.user || !factory.user.groups) {
      return;
    }
    for (const g of factory.user.groups) {
      if (g.event_id === factory.currentEventId && g.group_type === type) {
        return g.id;
      }
    }
  }

  factory.getCampId = () => {
    return getGroupId (GROUP_TYPES.CAMP);
  };

  factory.getArtId = () => {
    return getGroupId (GROUP_TYPES.ART);
  };

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
    if (!group.hasOwnProperty (propName)) {
      console.warn (
        `Property ${propName} doesn't exist in Camp! maybe the model changed?`
      );
      return '';
    }
    return group[propName];
  };

  getUser ();

  return factory;
}
