app.controller("manageCampsController", function($scope, $http, $filter) {
    var camps_table = document.getElementById('admin_camps')
    function _getCamps() {
        $http.get('/camps').then(function(res) {
            //console.log(res.data.camps);
            $scope.camps = res.data.camps;
            setTimeout(() => {
                  innerHeightChange()
                }, 500)
        });
    }
    $scope.changeOrderBy = function(orderByValue) {
        $scope.orderCamps = orderByValue;
    }
    if (typeof camps_table !== 'undefined') {
        _getCamps();
    }
});