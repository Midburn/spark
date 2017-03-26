app.controller("membersController", function($scope, $http) {
    var camp_id = 167; // for admin: should retreive camp_id from camps select -- for camp_manager: his own camp_id;
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
