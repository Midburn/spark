var app = angular.module("ngCamps", []);

app.controller("membersController", function($scope, $http) {
    var camp_id = document.querySelector('#camp_members_camp_id').value;
    function _getMembers() {
        $http.get('/camps/' + camp_id + '/members').then(function(res) {
            $scope.members = [res.data.users];
        });
    }
    $scope.changeOrderBy = function(orderByValue) {
        $scope.orderMembers = orderByValue;
    }
    if (typeof camp_id !== 'undefined' && camp_id !== 'null') {
        _getMembers();
    }
});
