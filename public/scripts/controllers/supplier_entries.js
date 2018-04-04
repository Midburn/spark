var suplliers_all;
var groups_prototype;

suppliers_app.controller("supplierEntriesController", function ($scope, $http, $filter) {
    getAllSuppliers = function ($http, on_success) {
        if (suplliers_all) {
            on_success(suplliers_all);
        } else {
            let _url = '/suppliers';
            if (groups_prototype === 'prod_dep') {
                _url = '/prod_dep_all';
            }
            $http.get(_url)
                .then((res) => {
                    suplliers_all = res;
                    on_success(res);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
    getAllEntries = function ($http, on_success) {
        if (suplliers_all) {
            on_success(suplliers_all);
        } else {
            let _url = '/suppliers';
            if (groups_prototype === 'prod_dep') {
                _url = '/prod_dep_all';
            }
            $http.get(_url)
                .then((res) => {
                    suplliers_all = res;
                    on_success(res);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

    getAllSuppliers($http, (res) => {
        $scope.suppliers = res.data.suppliers;
        setTimeout(() => {
            innerHeightChange()
        }, 500)
    });

    getAllEntries($http, (res) => {
        $scope.entries = res.data.entries;
        setTimeout(() => {
            innerHeightChange()
        }, 500)
    });

});
