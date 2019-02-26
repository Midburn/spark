nav_module.controller ('navController', [
  'communitiesService',
  function ($scope, communitiesService) {
    console.log (communitiesService, $scope);
  },
]);
