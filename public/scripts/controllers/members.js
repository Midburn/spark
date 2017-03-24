app.controller("membersController", function($scope, $http) {
    var camp_id = 167;
    function _getMembers() {
        $http.get('/camps/' + camp_id + '/members').then(function(res) {
            $scope.members = res.data.members;
        });
    }
    $scope.changeOrderBy = function(orderByValue) {
        $scope.orderMembers = orderByValue;
    }
    if (typeof camp_id !== 'undefined') {
        _getMembers();
    }
});
