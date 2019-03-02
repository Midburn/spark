nav_module.controller('navController', [
    '$scope',
    'communitiesService',
    function ($scope, communitiesService) {
        $scope.communitiesService = communitiesService;

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

        $scope.isCampsAdmin = () => {
            return communitiesService.user.isAdmin || communitiesService.user.isCampsAdmin;
        };

        $scope.isArtInstallationsAdmin = () => {
            return communitiesService.user.isAdmin || communitiesService.user.isArtInstallationsAdmin;
        };

        $scope.getGroupName = (group, lng) => {
            return communitiesService.getPropertyByLang (group, 'name', lng);
        }

    },
]);
