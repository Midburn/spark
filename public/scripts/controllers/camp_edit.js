app.controller("campEditController", function($scope, $http) {
    var camp_id = document.querySelector('#meta__camp_id').value;
    
    function _getMembers() {
        $http.get('/users').then(function(res) {
            $scope.members = res.data.users;
        });
    }
    
    if (typeof camp_id !== 'undefined') {
        _getMembers();
    }
});
