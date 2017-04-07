app.controller("manageCampsController", function($scope, $http, $filter) {
    $http.get('/camps').then(function(res) {
        $scope.camps = res.data.camps;
        setTimeout(() => {
              innerHeightChange()
            }, 500)
    });

    $scope.removeCamp = (camp_id) => {
      var agree_remove = confirm('Remove camp\n\n\nThis action will remove camp #' + camp_id + '.\n\n\n---\n Are you sure?');
      if (agree_remove) {
          // NOT WORKING SOMEHOW
          // $http.post(`/camps/${camp_id}/remove`, (res) => {
          //     console.log(res);
          //     window.location.reload();
          // });
          $.post('/camps/' + camp_id + '/remove', (res) => {
            window.location.reload();
          })
      }
    }

    $scope.changeOrderBy = function(orderByValue) {
        $scope.orderCamps = orderByValue;
    }
});

app.controller("membersController", ($scope, $http) => {
    $http.get('/camps_all').then((res) => {
        console.log(res.data);
        $scope.camps = res.data.camps;
    });

    $scope.getMembers = (camp_id) => {
        if (typeof camp_id !== 'undefined') {
            $http.get(`/camps/${camp_id}/members`).then((res) => {
                $scope.members = res.data.members;
                setTimeout(() => {
                  innerHeightChange()
                }, 500)
            });
        }
    }
    $scope.changeOrderBy = (orderByValue) => {
        $scope.orderMembers = orderByValue;
    }
});
