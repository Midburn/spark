
suppliers_app.controller("supllierShowController", ($scope, $http, $filter, camps, suppliers) => {
    const supplier_id = document.querySelector('#meta__supplier_id').value;
    camps.getAll($http,function() {}, $scope, supplier_id);
    suppliers.getSupplierById(supplier_id, function(res) {
        if (res.stack || res.message) {
            console.warn('getSupplierById: ' + res.message);
            return;
        } 
        $scope.supplier = res.data.supplier;
    });
    $scope.changeOrderBy = (orderByValue) => {
        $scope.orderCamps = orderByValue;
    }
});

suppliers_app.controller("supllierEditController", ($scope, $http, $filter, $q, suppliers, camps) => {
    const supplier_id = document.querySelector('#meta__supplier_id').value;
    const lang = document.getElementById('meta__lang').value || 'he';
    suppliers.getSupplierById(supplier_id, function(res) {
        if (res.stack || res.message) {
            console.warn('getSupplierById: ' + res.message);
            return;
        } 
        $scope.supplier = res.data.supplier;
    });
    if (lang === "he") {
        $scope.status_options = [
            { id: 'other', value: 'אחר' },
            { id: 'moving', value: 'הובלה' }
        ]
    } else {
        $scope.status_options = [
            { id: 'other', value: 'Other' },
            { id: 'moving', value: 'Moving' }
        ]
    }

    const angular_getSupplierFile = function ($http, $scope, $q, supplier_id) {
        const req_path = `/suppliers/${supplier_id}/contract`
        let getFilePromise = $q.defer()
    
        $http.get(req_path).then(function (res) {
            getFilePromise.resolve(res.data)
        }).catch(function (err) {
            const jsonError = err.data.message
            sweetAlert("Error!", "Something went wrong, please try again later \n" + jsonError)
            getFilePromise.reject(err)
        })
    
        return getFilePromise.promise
    }
    const angular_deleteSupplierFile = function ($http, $scope, $q, supplier_id) {
        const req_path = `/suppliers/${supplier_id}/contract/`;
        let deleteFilePromise = $q.defer()
        $http.delete(req_path).then(function (res) {
            deleteFilePromise.resolve(res.data.files)
        }).catch(function (err) {
            const jsonError = err.data.message;
            sweetAlert("Error!", "Could not delete file \n" + jsonError)
            deleteFilePromise.reject(err)
        })
    
        return deleteFilePromise.promise
    }
    $http.get(`/camps_all`)
        .then((res) => {
            $scope.allCamps = res.data.camps;
            return $http.get(`/art_all`);
        }).then(res => {
            $scope.allCamps.push(...res.data.camps);
    });
    $scope.removeCamp = (campId) => {
        $http.delete(`/suppliers/${supplier_id}/camps/${campId}`).then((res) => {
         //TODO check if the user can delete the camp
        });
        $scope.getCamps();
    }
    $scope.getCamps = () => {
        const isNew = $("#isNew").val();
        if (isNew !== "false") {
            $scope.relatedCamps = [];
            return;
        }
        suppliers.getSuppliersCamps(supplier_id, function(data) {
            if (data.stack || data.message) {
                console.warn('getSuppliersCamps: ' + data.message);
                return;
            } 
            $scope.canDelete = true; //TODO check if the user can delete the camp
            $scope.relatedCamps = data.camps;
        });
        setTimeout(() => {
            innerHeightChange();
        }, 500)
    }
    $scope.changeOrderBy = (orderByValue) => {
        $scope.orderMembers = orderByValue;
    };
    if (typeof supplier_id !== 'undefined') {
        $scope.current_supplier_id = supplier_id;
        $scope.getCamps();
    }

    $scope.addCamp= () => {
        const supplier_id = $scope.current_supplier_id;
        // Convert display name to id (prevent id shown in autocomplete)
        const add_camp_display_name = $scope.add_camp_display_name;
        const options = [];
        document.querySelectorAll("#campList option").forEach(option => options.push(option.value));
        if (!options.includes(add_camp_display_name)) {
            // Validate correct camp chosen.
            sweetAlert("oops", "Unknown camp chosen", "warning");
            return;
        }
        const camp_id = document.querySelector("#campList option[value='"+add_camp_display_name+"']").dataset.id;
        $http.put(`/suppliers/${supplier_id}/camps/${camp_id}`)
             .then(function (res) {
                // update table with new data
                $scope.getCamps();
                $scope.add_camp_display_name = '';
             }).catch((err) => {
                if (err.data.data.message.indexOf("Duplicate entry") !== -1) {
                    sweetAlert("!oops","You are trying to add a camp that already exists", "warning");
                }
                else {
                    sweetAlert("Error!", "Add new camp error: " + err.data.data.message, "error");
                }
        });
    };

    $scope.getFiles = () => {
        const isNew = $("#isNew").val();
        if (isNew === "false") {
            angular_getSupplierFile($http, $scope, $q, supplier_id)
            .then((res) => {
                if (!res.error) {
                    $scope.file = res.data;
                }
            }).catch((err) => {
                sweetAlert("Error!", "deleteFile: " + err.data.message, "error");
            })
        }
    }
    $scope.deleteFile = () => {
        $scope.file = null;
        angular_deleteSupplierFile($http, $scope, $q, supplier_id)
        .then(() => {
            $scope.getFiles();
        }).catch((err) => {
            sweetAlert("Error!", "deleteFile: " + err.data.message, "error");
        })
    }
    if (!_.isNil(supplier_id) && Number(supplier_id)) {
        $scope.current_supplier_id = supplier_id;
        $scope.getFiles();
    }

}); //end of controller
