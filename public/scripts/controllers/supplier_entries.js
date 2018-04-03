var suplliers_all;
var groups_prototype;

__get_suppliers_all = function ($http, on_success) {
    if (suplliers_all) {
        on_success(suplliers_all);
    } else {
        var _url = '/suppliers';
        if (groups_prototype === 'prod_dep') {
            _url = '/prod_dep_all';
        }
        console.log(_url);
        $http.get(_url).then((res) => {
            suplliers_all = res;
            on_success(res);
        });
    }
}

suppliers_app.controller("supplierEntriesController", function ($scope, $http, $filter) {
    // console.log(groups_prototype);
    __get_suppliers_all($http, (res) => {
        // console.log(groups_prototype);
        $scope.suppliers = res.data.suppliers;
        setTimeout(() => {
            innerHeightChange()
        }, 500)
    }); 

    $scope.changeOrderBy = function (orderByValue) {
        $scope.orderCamps = orderByValue;
    }
});