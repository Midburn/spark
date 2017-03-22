/**
 * Component: user camp-join pending request
 */
app.controller("joinPendingController", function($scope, $http) {
    var user_id = document.querySelector('#pending_request_user_id').value;
    
    $http.get('/users/' + user_id + '/camp').then(function(res) {
      $scope.camp = res.data.camp_member;
    });
    function _getUserCamp() {
    }
    if (typeof camp_id !== 'undefined') {
        _getUserCamp();
    }
    
    $scope.cancelRequest = function () {
      $http.post('/users/' + user_id + '/join_cancel').then(function(res) {
        console.log(res);
      });
    }
});

