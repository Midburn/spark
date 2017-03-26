app.controller("membersController", ($scope, $http) => {
    $http.get('/camps_all').then((res) => {
        $scope.camps = res.data.camps;
    });

    $scope.getMembers = (camp_id) => {
        if (typeof camp_id !== 'undefined') {
            $http.get(`/camps/${camp_id}/members`).then((res) => {
                $scope.members = res.data.members;
                setTimeout(() => {
                  innerHeightChange()
                }, 500)
            });
        }
    }
    $scope.changeOrderBy = (orderByValue) => {
        $scope.orderMembers = orderByValue;
    }
});
