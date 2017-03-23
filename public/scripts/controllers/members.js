app.controller("membersController", function($scope, $http) {
    var camp_id = 6;
    function _getMembers() {
        $http.get('/camps/' + camp_id + '/members').then(function(res) {
            $scope.members = [res.data.users];
        });
    }
    $scope.changeOrderBy = function(orderByValue) {
        $scope.orderMembers = orderByValue;
    }
    if (typeof camp_id !== 'undefined') {
        _getMembers();
    }
});
