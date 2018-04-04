var suplliers_all;
var groups_prototype;

suppliers_app.controller("supplierEntriesController", function ($scope, $http, $filter) {
    getAllSuppliers = function (on_success) {
        if (suplliers_all) {
            on_success(suplliers_all);
        } else {
            const url = '/suppliers';
            $http.get(url)
                .then((res) => {
                    suplliers_all = res;
                    on_success(res);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
    getEntriesByStatus = function (status, on_success) {
        if (suplliers_all) {
            on_success(suplliers_all);
        } else {
            const url = '/suppliers/suppliers_gate_info/' + status;
            $http.get(url)
                .then((res) => {
                    suplliers_all = res;
                    on_success(res);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

    // Get suppliers for entry list
    getAllSuppliers((res) => {
        $scope.suppliers = res.data.suppliers;
        setTimeout(() => {
            innerHeightChange()
        }, 500)
    });

    getEntriesByStatus('Inside', (res) => {
        $scope.entries = res.data.suppliers;
        setTimeout(() => {
            innerHeightChange()
        }, 500)
    });

});
