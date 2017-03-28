app.controller("campEditController", function($scope, $http, $filter) {
    var camp_id = document.querySelector('#meta__camp_id').value;
    function _getMembers() {
        $http.get('/camps/' + camp_id + '/members').then(function(res) {
            console.log(res.data.members);
            $scope.members = res.data.members;
        });
    }
    $scope.changeOrderBy = function(orderByValue) {
        $scope.orderMembers = orderByValue;
    }
    if (typeof camp_id !== 'undefined') {
        _getMembers();
    }
    $scope.addMember = function() {
        var camp_id = document.querySelector('#meta__camp_id').value;
        var new_user_email = document.getElementById('camps_members_add_member').value;
        console.log('request to add ' + new_user_email + ' has been sent');
        $http.get('/camps/' + camp_id + '/members/' + new_user_email).then(function(res) {
            // TODO - show user that user member has been added
            // update table with new data
            _getMembers();
        }).catch(function (err) {
            console.log(err);
            // TODO handle errors
        });
    }
});