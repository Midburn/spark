// angular_getSupplierById function from  supplier_edit.

// class Suppliers {

//     static $inject = ['$http', '$scope']

//     constructor(private $http, private $scope){}
//     getSupplierById () {
//         this.$http
//     }

//  }
suppliers_app.factory('suppliers', function () {

    var factory = {};

    factory.getSuppliersCamps = function ($http, $scope, supplier_id) {
        const isNew = $("#isNew").val();
        if (isNew === "false") {
            $http.get(`/suppliers/${supplier_id}/camps`).then((res) => {
                $scope.canDelete = true; //TODO check if the user can delete the camp
                $scope.relatedCamps = res.data.camps;
            });
        }
    }
    
    factory.getSupplierById = function ($http, $scope, supplier_id) {
        const isNew = $("#isNew").val();
        if (isNew === "false") {
            $http.get(`/suppliers/${supplier_id}/camps`).then((res) => {
                $scope.canDelete = true; //TODO check if the user can delete the camp
                $scope.relatedCamps = res.data.camps;
            });
        }
    }

    

    return factory;

});


