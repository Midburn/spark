// angular_getSupplierById function from  supplier_edit.

// class Suppliers {

//     static $inject = ['$http', '$scope']

//     constructor(private $http, private $scope){}
//     getSupplierById () {
//         this.$http
//     }

//  }
suppliers_app.factory('suppliers', [ '$http' ,function ($http) {

    var factory = {};

    // factory.getSuppliersCamps = function ($http, $scope, supplier_id) {
    //     const isNew = $("#isNew").val();
    //     if (isNew === "false") {
    //         $http.get(`/suppliers/${supplier_id}/camps`).then((res) => {
    //             $scope.canDelete = true; //TODO check if the user can delete the camp
    //             $scope.relatedCamps = res.data.camps;
    //         });
    //     }
    // }
    factory.getSuppliersCamps = function (supplier_id, callback) {
        return $http.get(`/suppliers/${supplier_id}/camps`)
        .then(data => callback(data))
        .catch(e => callback(e))
    }

    factory.getSupplierById = function (supplier_id, callback) {
            $http.get(`/suppliers/${supplier_id}`)
            .then((res) => callback(res))
            .catch(e => callback(e))
    }

    return factory;
}]);
