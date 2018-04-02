var angular_getCamps = function ($http, $scope, supplier_id) {
  let isNew = $("#isNew").val();
  if (isNew === "false") {
    $http.get(`/suppliers/${supplier_id}/camps`).then((res) => {
        $scope.canDelete = true; //TODO check if the user can delete the camp
        $scope.relatedCamps = res.data.camps;
    });
  }
}

suppliers_app.controller("supllierEditController", ($scope, $http, $filter) => {
    var supplier_id = document.querySelector('#meta__supplier_id').value;
    var lang = document.getElementById('meta__lang').value || 'he';  
    if (lang === "he") {
        $scope.status_options = [
            { id: 'carriage', value: 'הובלה' },
            { id: 'other', value: 'אחר' }]
    } else {
        $scope.status_options = [
            { id: 'carriage', value: 'Carriage' },
            { id: 'other', value: 'Other' }]
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
    
    $scope.addCamp= () => {
        var supplier_id = $scope.current_supplier_id;
        const camp_id = $scope.add_camp_id;
        $http.put(`/suppliers/${supplier_id}/camps/${camp_id}`)
             .then(function (res) {
                // update table with new data
                $scope.getCamps();
                $scope.add_camp_id = '';
             }).catch((err) => {
                if (err.data.data.message.indexOf("Duplicate entry")) {
                    sweetAlert("!oops","You are trying to add a camp that is already exist","warning");
                }
                else {
                    sweetAlert("Error!", "Add new camp error: " + err.data.data.message, "error");
                }
        });
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
