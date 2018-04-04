
suppliers_app.controller("supplierEntriesController", function ($scope, $http, $filter) {
    function getAllSuppliers (on_success) {
        const url = '/suppliers';
        $http.get(url)
            .then((res) => {
                on_success(res);
            })
            .catch(err => {
                sweetAlert('Could not get supplier list: ' + err.message);s
            });
    }

    function getEntriesByStatus (status, on_success) {
        const url = '/suppliers/suppliers_gate_info/' + status;
        $http.get(url)
            .then((res) => {
                suplliers_all = res;
                on_success(res);
            })
            .catch(err => {
                sweetAlert('Could not get entries: ' + err.message);
            });
    }

    // Get suppliers for entry list
    getAllSuppliers((res) => {
        $scope.suppliers = res.data.suppliers;
        setTimeout(() => {
            innerHeightChange()
        }, 500)
    });

    // Get all entries (for 'Inside' status)
    refreshCurrentEntries();

    // New entry
    $scope.newEntry = {};

    $scope.addEntry = function () {
        if (!$scope.suppliers.find(supplier => supplier.supplier_id === $scope.newEntry.supplier_id)) {
            return sweetAlert(`Unknown supplier, please validate id/vat!`);
        }
        if (!$scope.newEntry.supplier_id || !$scope.newEntry.vehicle_plate_number
            || !$scope.newEntry.number_of_people_entered || !$scope.newEntry.allowed_visa_hours) {
            return sweetAlert(`Please fill all fields!`);
        }
        $http.post(`/suppliers/${$scope.newEntry.supplier_id}/add_gate_record_info/Inside`, $scope.newEntry)
            .then(done => {
                sweetAlert(`Supplier entry added!`);
                $scope.newEntry = {};
                refreshCurrentEntries();
            })
            .catch(err => {
                sweetAlert(`An error occurred while adding supplier entry ${err.data.data.message}`);
            });
    };

    $scope.supplierLeft = function(entry) {
        $http.post(`/suppliers/${$scope.newEntry.supplier_id}/add_gate_record_info/Outside`, entry)
            .then(done => {
                refreshCurrentEntries();
            })
            .catch(err => {
                sweetAlert(`An error occurred while editing supplier entry ${err.data.data.message}`);
            });
    };

    function refreshCurrentEntries() {
        getEntriesByStatus('Inside', (res) => {
            $scope.entries = res.data.suppliers;
            setTimeout(() => {
                innerHeightChange()
            }, 500)
        });
    }

});
