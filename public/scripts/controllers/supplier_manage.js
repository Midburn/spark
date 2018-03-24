
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

suppliers_app.controller("manageSuppliersController", function ($scope, $http, $filter) {
    // console.log(groups_prototype);
    __get_suppliers_all($http, (res) => {
        // console.log(groups_prototype);
        $scope.suppliers = res.data.suppliers;
        setTimeout(() => {
            innerHeightChange()
        }, 500)
    });
    // $http.get('/camps_all').then(function (res) {
    //     $scope.camps = res.data.camps;
    //     setTimeout(() => {
    //         innerHeightChange()
    //     }, 500)
    // });
    $scope.ExportCamps = (actionType) => {
        //if (user.isAdmin) {
        //alert(actionType)

        //}
        console.log("test1")

        $.get('/camps_csv/' + actionType, (res) => {
            //var presale_tickets_email = encodeURI(res);
            //window.open(presale_tickets_email);
            console.log("print csv")
            var blob = new Blob([res]);
            window.navigator.msSaveBlob(blob, "filename.csv");

            //window.location.reload();
        })

        //var agree_remove = confirm('Remove camp\n\n\nThis action will remove camp #' + camp_id + '.\n\n\n---\n Are you sure?');
        //if (agree_remove) {
        //$.post('/camps/' + camp_id + '/remove', (res) => {
        //window.location.reload();
        //})
        //}
    }

    $scope.removeCamp = (camp_id) => {
        var agree_remove = confirm('Remove camp\n\n\nThis action will remove camp #' + camp_id + '.\n\n\n---\n Are you sure?');
        if (agree_remove) {
            $.post('/camps/' + camp_id + '/remove', (res) => {
                window.location.reload();
            })
        }
    }

    // update the camp pre sale quota
    $scope.updatePreSaleQuota = (camp_id, quota) => {

        let current = new Date();
        let start = new Date(controllDates.appreciation_tickets_allocation_start);
        let end = new Date(controllDates.appreciation_tickets_allocation_end);
        if (start < current && current < end) {
            if (confirm('Confirm new quota to: ' + quota)) {
                $.post('/camps/' + camp_id + '/updatePreSaleQuota', { "quota": quota })
                    .success(() => { })
                    .error(() => {
                        alert("Quota must be in a positive number format");
                    });
            }
        }
    }

    $scope.changeOrderBy = function (orderByValue) {
        $scope.orderCamps = orderByValue;
    }
});

suppliers_app.controller("membersController", ($scope, $http) => {
    __get_suppliers_all($http, (res) => {
        var data = [];
        for (var i in res.data.camps) {
            if (['open', 'closed'].indexOf(res.data.camps[i].status) > -1) {
                data.push(res.data.camps[i]);
            }
        }
        $scope.camps = data;
    });
    // $http.get('/camps_all').then((res) => {
    //     var data = res.data.camps;
    //     for (var i in res.data.camps) { }
    //     $scope.camps = res.data.camps;
    // });

    $scope.getMembers = (camp_id) => {
        if (typeof camp_id !== 'undefined') {
            $scope.current_camp_id = camp_id;
            angular_getMembers($http, $scope, camp_id);
            setTimeout(() => {
                innerHeightChange()
            }, 500);
        }
    }
    $scope.updateUser = (user_name, user_id, action_type) => {
        var camp_id = $scope.current_camp_id;
        var lang = 'he';
        var user_rec = {
            camp_id: camp_id,
            user_name: user_name,
            user_id: user_id,
            lang: lang,
        }
        angular_updateUser($http, $scope, action_type, user_rec);
    }

    $scope.changeOrderBy = (orderByValue) => {
        $scope.orderMembers = orderByValue;
    }
});
