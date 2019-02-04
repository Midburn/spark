var suplliers_all;
var groups_prototype;

suppliers_app.controller("manageSuppliersController", function ($scope, $http, $filter, $log) {
    // Set default value as contact name
    $scope.orderSupppliers = 'main_contact_name';
    $scope.isReverseOrder = false;

    $scope.newSupplierBtnError = false;
    $scope.inputGlyphiconOk = false;
    $scope.okBtnDisabled = true;
    $scope.okBtnHref = null;
    var interval = 800;
    var typingTimer;

    $scope.newSupplierInputUp = function (event) {
        clearTimeout(typingTimer);
        typingTimer = setTimeout($scope.validate_existed_supplier(event), interval);
    };
    
    $scope.validate_existed_supplier = (event) => {
        const val = event.target.value,
            lang = $('body').attr('lang'),
            phoneREGX = /^\d{1,9}$/;
        if ((phoneREGX.test(val))) {
            $http.get('/suppliers/' + val)
                .then(function successCallback(data) {
                    if (data.status === 200 ) {
                        $scope.newSupplierBtnError = true;
                        $scope.inputGlyphiconOk = false;
                        $scope.okBtnDisabled = true;
                        $scope.okBtnHref = '/' + lang + '/suppliers/new?c=' + val;
                        swal("!oops", "You are trying to add a camp that already exists", "warning");
                    } else {
                        $scope.newSupplierBtnError = false;
                        $scope.inputGlyphiconOk = true;
                        $scope.okBtnDisabled = false;
                        $scope.okBtnHref = '/' + lang + '/suppliers/new?c=' + val;
                    }
                }, function errorCallback(error) {
                    jsonError = error.data.data.message;
                    swal("Error!", `Something went wrong, please try again later \n ${jsonError}`, "error");
                });
        }
        $scope.newSupplierBtnError = true;
        $scope.inputGlyphiconOk = false;
        $scope.okBtnDisabled = true;
        $scope.okBtnHref = null;
    }
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
