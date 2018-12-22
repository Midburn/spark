app.controller("manageCampsController", function ($scope, $http, $filter, camps) {
    // console.log(groups_prototype);
    camps.getAll($http, (res) => {
        // console.log(groups_prototype);
        $scope.camps = res.data.camps;
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
        $.get('/camps_csv/' + actionType, (res) => {
            //var presale_tickets_email = encodeURI(res);
            //window.open(presale_tickets_email);
            const blob = new Blob([res]);
            window.navigator.msSaveBlob(blob, "filename.csv");
            //window.location.reload();
        })

        //var agree_remove = confirm('Remove camp\n\n\nThis action will remove camp #' + camp_id + '.\n\n\n---\n Are you sure?');
        //if (agree_remove) {
        //$.post('/camps/' + camp_id + '/remove', (res) => {
        //window.location.reload();
        //})
        //}
    };

    $scope.removeCamp = (camp_id) => {
        const agree_remove = confirm('Remove camp\n\n\nThis action will remove camp #' + camp_id + '.\n\n\n---\n Are you sure?');
        if (agree_remove) {
            $.post('/camps/' + camp_id + '/remove', (res) => {
                window.location.reload();
            })
        }
    };
    // Test if you can allocate tickets based on event settings.
    $scope.isInDateRange = (isGroupSale) => {
        let current = new Date();
        let start = isGroupSale ? new Date(controllDates.group_sale_tickets_allocation_start) : new Date(controllDates.appreciation_tickets_allocation_start);
        let end = isGroupSale ? new Date(controllDates.group_sale_tickets_allocation_end) : new Date(controllDates.appreciation_tickets_allocation_end);
        return start < current && current < end;
    };

    $scope.isInEarlyArrivalRange = () => {
        let current = new Date();
        let start = new Date(controllDates.early_arrivals_start);
        let end = new Date(controllDates.early_arrivals_end);
        return start < current && current < end;
    };

    // update the camp pre sale quota
    $scope.updatePreSaleQuota = (camp_id, quota, isGroupSale) => {
        if ($scope.isInDateRange(isGroupSale)) {
            if (confirm('Confirm new quota to: ' + quota)) {
                $.post('/camps/' + camp_id + '/updatePreSaleQuota', { quota: Number(quota), isGroupSale: isGroupSale })
                    .success(() => { })
                    .error(() => {
                        alert("Quota must be in a positive number format");
                    });
            }
        }
    };
    $scope.updateEarlyArrivalQuota = (camp_id, quota, isGroupSale) => {
        if ($scope.isInEarlyArrivalRange()) {
            if (confirm('Confirm new quota to: ' + quota)) {
                $.post('/camps/' + camp_id + '/updateEarlyArrivalQuota', { quota: Number(quota), isGroupSale: isGroupSale })
                    .success(() => { })
                    .error(() => {
                        alert("Quota must be in a positive number format");
                    });
            }
        }
    };

    $scope.changeOrderBy = function (orderByValue) {
        $scope.orderCamps = orderByValue;
    }
});

app.controller("membersController", ($scope, $http, camps) => {
    camps.getAll($http, (res) => {
        const data = [];
        for (const i in res.data.camps) {
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
            camps.getCampMembers($http, $scope, camp_id);
            setTimeout(() => {
                innerHeightChange()
            }, 500);
        }
    };

    $scope.updateUser = (user_name, user_id, action_type) => {
        const camp_id = $scope.current_camp_id;
        const lang = 'he';
        const user_rec = {
            camp_id: camp_id,
            user_name: user_name,
            user_id: user_id,
            lang: lang,
        };
        camps.updateUser($http, $scope, action_type, user_rec);
    };

    $scope.changeOrderBy = (orderByValue) => {
        $scope.orderMembers = orderByValue;
    }
});
