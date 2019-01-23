var suplliers_all;
var groups_prototype;

suppliers_app.controller("manageSuppliersController", function ($scope, $http, $filter) {
    // Set default value as contact name
    $scope.orderSupppliers = 'main_contact_name';
    $scope.isReverseOrder = false;

    __get_suppliers_all = function ($http, on_success) {
        if (suplliers_all) {
            on_success(suplliers_all);
        } else {
            var _url = '/suppliers';
            if (groups_prototype === 'prod_dep') {
                _url = '/prod_dep_all';
            }
            $http.get(_url).then((res) => {
                suplliers_all = res;
                on_success(res);
            });
        }
    }

    __get_suppliers_all($http, (res) => {
        $scope.suppliers = res.data.suppliers;
        setTimeout(() => {
            innerHeightChange()
        }, 500)
    });

    $scope.ExportCamps = (actionType) => {
        $.get('/camps_csv/' + actionType, (res) => {
            const blob = new Blob([res]);
            window.navigator.msSaveBlob(blob, "filename.csv");
        })

    };

    $scope.changeOrderBy = function (orderString) {
        if ($scope.orderSupppliers === orderString) {
            // Only toggle ordering
            $scope.isReverseOrder = !$scope.isReverseOrder;
            console.log($scope.isReverseOrder);
            return;
        }
        $scope.orderSupppliers = orderString;
    }
});
