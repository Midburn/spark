var angular_getCamps = function ($http, $scope, supplier_id) {
  let isNew = $("#isNew").val();
  if (isNew === "false") {
    $http.get(`/suppliers/${supplier_id}/camps`).then((res) => {
        $scope.canDelete = true; //TODO check if the user can delete the camp
        $scope.relatedCamps = res.data.camps;
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
    var tpl, action_tpl;

    if (lang === "he") {
        // debugger;
        action_tpl = {
            approve: 'לאשר את',
            delete: 'למחוק את',
            reject: 'לדחות את',
            approve_mgr: 'להפוך למנהל את',
            remove: 'להסיר את',
            pre_sale_ticket : 'לאשר כרטיס מוקדם',
        };
        tpl = {
            alert_title: "האם את/ה בטוח?",
            alert_text: "האם את/ה בטוח שתרצה " + action_tpl[action_type] + " משתמש " + user_name + "?",
            alert_success_1: action_type + "!",
            alert_success_2: "משתמש " + user_name + action_type,
            alert_success_3: " בהצלחה",
        };
    } else {
        action_tpl = {
            approve: 'Approve',
            delete: 'Delete',
            reject: 'Reject',
            approve_mgr: 'Set Manager',
            remove: 'Remove',
            pre_sale_ticket: 'Update Pre Sale Ticket',
        };
        tpl = {
            alert_title: "Are you sure?",
            alert_text: "Are you sure you would like to " + action_tpl[action_type] + " " + user_name + "?",
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
                $scope.getCamps(camp_id);
            }).catch((err) => {
                jsonError=err.data.data.message;
                sweetAlert("Error!", "Something went wrong, please try again later \n" + jsonError, "error");
            })
        });
}

suppliers_app.controller("supllierEditController", ($scope, $http, $filter) => {
    var supplier_id = document.querySelector('#meta__supplier_id').value;
    var lang = $scope.lang;
    if (lang === undefined) {
        lang = 'he';
    }
    if (lang === "he") {
        $scope.status_options = [
            { id: 'food', value: 'אוכל' },
            { id: 'water', value: 'מים' },
            { id: 'shade', value: 'צל' },
            { id: 'carriage', value: 'הובלה' },
            { id: 'other', value: 'אחר' }]
    } else {
        $scope.status_options = [
            { id: 'food', value: 'food' },
            { id: 'water', value: 'water' },
            { id: 'shade', value: 'shade' },
            { id: 'carriage', value: 'carriage' },
            { id: 'other', value: 'other' }]
    }
    $http.get(`/camps_all`).then((res) => {
        $scope.allCamps = res.data.camps;
    });
    $scope.removeCamp = (campId) => {
        $http.delete(`/suppliers/${supplier_id}/camps/${campId}`).then((res) => {
         //TODO check if the user can delete the camp
        });

        $scope.getCamps();
    }
    $scope.getCamps = () => {
        angular_getCamps($http, $scope, supplier_id);
        setTimeout(() => {
            innerHeightChange();
        }, 500)
    }
    $scope.changeOrderBy = (orderByValue) => {
        $scope.orderMembers = orderByValue;
    }
    if (typeof supplier_id !== 'undefined') {
        $scope.current_supplier_id = supplier_id;
        $scope.getCamps();
    }
    $scope.lang = document.getElementById('meta__lang').value;
    // $scope.grouptype = document.getElementById('meta__grouptype').value;
    $scope.addCamp= () => {
        var supplier_id = $scope.current_supplier_id;
        const camp_id = $scope.add_camp_id;
        $http.put(`/suppliers/${supplier_id}/camps/${camp_id}`)
            .then(function (res) {
                // update table with new data
                $scope.getCamps();
                $scope.add_camp_id = '';
        }).catch((err) => {
            sweetAlert("Error!", "Add new camp error: " + err.data.data.message, "error");
        });
    }
    $scope.updateUser = (user_name, user_id,action_type) => {
        var camp_id = $scope.current_camp_id;
        var user_rec = {
            camp_id: camp_id,
            user_name: user_name,
            user_id: user_id,
        }
        angular_updateUser($http, $scope, action_type, user_rec);
    }

}); //end of controller

suppliers_app.controller("homeController", ($scope, $http, $filter) => {
    $scope.angular_getMyGroups = function ($http, $scope) {
        $http.get(`/my_groups`).then((res) => {
            // debugger;
            $scope.groups = res.data.groups;
            $scope.stat = res.data.stats;
        });
    }

    $scope.angular_ChangeCurrentEventId = function (event_id) {
        //set new current event id 
        $http.post('/events/change', {currentEventId: event_id}).then((res) => {
            window.location.reload();
        });
    }

    $scope.angular_getMyGroups($http, $scope);

});
