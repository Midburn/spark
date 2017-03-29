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
    $scope.updateUser = (user_name, user_id, action_type) => {
        var camp_id = document.getElementById('meta__camp_id').value;
        sweetAlert({
            title: "Are you sure?",
            text: "Are you sure you would like to " + action_type + " " + user_name + "?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: false
            },
            function(){
                var request_str = `/camps/${camp_id}/members/${user_id}/${action_type}`
                $http.get(request_str).then((res) => {
                    sweetAlert(action_type + "!", user_name + "has been " + action_type, "success");
                    // TODO - check if table update is needed
                    setTimeout(() => {
                        innerHeightChange()
                    }, 500)
                }).catch((err) => {
                    console.log(err.message);
                     sweetAlert("Error!", "Something went wrong, please try again later", "error");
                })
                
            });
    }
});