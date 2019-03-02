nav_module.controller('navController', [
    '$scope',
    'communitiesService',
    'eventsService',
    function ($scope, communitiesService, eventsService) {
        $scope.communitiesService = communitiesService;
        $scope.eventsService = eventsService;

        /**
         * Test if allocations (appriciation) is visible.
         * @returns Boolean
         */
        $scope.isAllocationNavVisible = () => {
            if (!communitiesService || !communitiesService.user) {
                return false;
            }
            return $scope.isCampsAdmin() ||
                $scope.isArtInstallationsAdmin;
        };

        $scope.getAllocationGroups = () => {
            if (!eventsService.isPresaleAvailable()) {
                return [];
            }
            return communitiesService.allocationGroups;
        };

        $scope.isCampsAdmin = () => {
            return communitiesService.user && (communitiesService.user.isAdmin || communitiesService.user.isCampsAdmin);
        };

        $scope.isArtInstallationsAdmin = () => {
            return communitiesService.user && (communitiesService.user.isAdmin || communitiesService.user.isArtInstallationsAdmin);
        };

        $scope.getGroupName = (group, lng) => {
            return communitiesService.getPropertyByLang (group, 'name', lng);
        };

    },
]);
