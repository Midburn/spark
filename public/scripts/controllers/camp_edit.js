var angular_getMembers = function ($http, $scope, camp_id) {
    if (camp_id === 'new') {
        $http.get('/users').then((res) => {
            $scope.members = [];
            $scope.approved_members = res.data.users;
        });
    } else {
        $http.get(`/camps/${camp_id}/members`).then((res) => {
            var members = res.data.members;
            var _members = [];
            var approved_members = [];
            var total_camp_tickets = 0;
            for (var i in members) {
                if (['approved', 'pending', 'pending_mgr', 'approved_mgr', 'rejected'].indexOf(members[i].member_status) > -1) {
                    _members.push(members[i]);
                }
                if (['approved', 'approved_mgr'].indexOf(members[i].member_status) > -1) {
                    approved_members.push(members[i]);
                }
                total_camp_tickets+=parseInt(members[i].current_event_id_ticket_count) || 0;
            }
            $scope.members = _members;
            $scope.approved_members = approved_members;
            $scope.all_approved_members = approved_members.length;
            $scope.total_camp_tickets = total_camp_tickets;
        });
    }
}
var angular_updateUser = function ($http, $scope, action_type, user_rec) {
    var camp_id = user_rec.camp_id;
    var user_name = user_rec.user_name;
    var user_id = user_rec.user_id;
    var lang = $scope.lang;
    if (lang === undefined) {
        lang = 'he';
    }
    var tpl;
    if (lang === "he") {
        tpl = {
            alert_title: "האם את/ה בטוח?",
            alert_text: "האם את/ה בטוח שתרצה לבצע " + action_type + " את משתמש " + user_name + "?",
            alert_success_1: action_type + "!",
            alert_success_2: "משתמש " + user_name + action_type,
            alert_success_3: " בהצלחה",
        };
    } else {
        tpl = {
            alert_title: "Are you sure?",
            alert_text: "Are you sure you would like to " + action_type + " " + user_name + "?",
            alert_success_1: action_type + "!",
            alert_success_2: user_name + "has been " + action_type,
            alert_success_3: "success",
        };
    }

    sweetAlert({
        title: tpl.alert_title,
        text: tpl.alert_text,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes",
        closeOnConfirm: false
    },
        () => {
            var request_str = `/camps/${camp_id}/members/${user_id}/${action_type}`
            $http.get(request_str).then((res) => {
                sweetAlert(tpl.alert_success_1, tpl.alert_success_1, "success");
                $scope.getMembers(camp_id);
            }).catch((err) => {
                sweetAlert("Error!", "Something went wrong, please try again later " + err, "error");
            })
        });
}

app.controller("campEditController", ($scope, $http, $filter) => {
    var camp_id = document.querySelector('#meta__camp_id').value;
    $scope.status_options = ['open', 'closed'];
    $scope.noise_level_options = ['quiet', 'medium', 'noisy', 'very noisy'];
    $scope.getMembers = () => {
        angular_getMembers($http, $scope, camp_id);
        setTimeout(() => {
            innerHeightChange();
        }, 500)
    }
    $scope.changeOrderBy = (orderByValue) => {
        $scope.orderMembers = orderByValue;
    }
    if (typeof camp_id !== 'undefined') {
        $scope.current_camp_id = camp_id;
        $scope.getMembers();
    }
    $scope.lang = document.getElementById('meta__lang').value;

    $scope.addMember = () => {
        var camp_id = $scope.current_camp_id;
        var new_user_email = $scope.camps_members_add_member
        var data = {
            user_email: new_user_email,
            camp_id: camp_id
        }

        $http.post(`/camps/${camp_id}/members/add`, data).then(function (res) {
            // update table with new data
            $scope.getMembers();
            $scope.camps_members_add_member='';
        }).catch((err) => {
            sweetAlert("Error!", "Add new member error: " + err.data.data.message, "error");
        });
    }
    $scope.updateUser = (user_name, user_id, action_type) => {
        var camp_id = $scope.current_camp_id;
        var user_rec = {
            camp_id: camp_id,
            user_name: user_name,
            user_id: user_id,
        }
        angular_updateUser($http, $scope, action_type, user_rec);
    }

});
