
suppliers_app.controller("supplierEntriesController", function ($scope, $http, $filter) {
    function getAllSuppliers (on_success) {
        const url = '/suppliers';
        $http.get(url)
            .then((res) => {
                on_success(res);
            })
            .catch(err => {
                sweetAlert('Could not get supplier list: ' + err.message);
            });
    }

    function getAllEntries (on_success) {
        const url = '/suppliers/all_suppliers_entries';
        $http.get(url)
            .then((res) => {
                suplliers_all = res;
                on_success(res);
            })
            .catch(err => {
                sweetAlert('Could not get entries: ' + err.message);
            });
    }

    // function getEntriesByStatus (status, on_success) {
    //     const url = '/suppliers/suppliers_gate_info/' + status;
    //     $http.get(url)
    //         .then((res) => {
    //             suplliers_all = res;
    //             on_success(res);
    //         })
    //         .catch(err => {
    //             sweetAlert('Could not get entries: ' + err.message);
    //         });
    // }

    // Initial order by last entry
    $scope.orderEntries = 'enterance_time';
    $scope.isReverseOrder = true;

    // Init empty edited entry
    $scope.editedEntry = {};

    // Get suppliers for entry list
    getAllSuppliers((res) => {
        $scope.suppliers = res.data.suppliers;
        setTimeout(() => {
            innerHeightChange()
        }, 500)
    });

    // Get all entries (for 'Inside' status)
    refreshCurrentEntries();

    // New entry
    $scope.newEntry = {};

    $scope.addEntry = function () {
        if (!$scope.suppliers.find(supplier => supplier.supplier_id === $scope.newEntry.supplier_id)) {
            return sweetAlert(`Unknown supplier, please validate id/vat!`);
        }
        if (!$scope.newEntry.supplier_id || !$scope.newEntry.vehicle_plate_number
            || !$scope.newEntry.number_of_people_entered || !$scope.newEntry.allowed_visa_hours) {
            return sweetAlert(`Please fill all fields!`);
        }
        $http.post(`/suppliers/${$scope.newEntry.supplier_id}/add_gate_record_info/Inside`, $scope.newEntry)
            .then(done => {
                sweetAlert(`Supplier entry added!`);
                $scope.newEntry = {};
                refreshCurrentEntries();
            })
            .catch(err => {
                sweetAlert(`An error occurred while adding supplier entry ${err.data.data.message}`);
            });
    };

    $scope.supplierLeft = function(entry) {
        $http.post(`/suppliers/${$scope.newEntry.supplier_id}/add_gate_record_info/Outside`, entry)
            .then(done => {
                refreshCurrentEntries();
            })
            .catch(err => {
                sweetAlert(`An error occurred while editing supplier entry ${err.data.data.message}`);
            });
    };
    /* post a comment */
    $scope.addComment = function() {
        const supplierId = $scope.currentSupplierId;
        if ($scope.newComment) {
            const body = {
                comment: $scope.newComment
            };
            $scope.newComment = '';
            $http.post(`/suppliers/${supplierId}/supplier_comments`, body)
                .then((res) => {
                   loadComments(supplierId);
                   setTimeout(() => { //bypass angularJS delay on sata binding
                        // scroll bottom
                        const table = document.querySelector("#comments_modal table");
                        table.scrollTop = table.scrollHeight;
                   },100);
                })
                .catch((err) => {
                    sweetAlert(`An error occurred while adding supplier entry ${err.data.data.message}`);
                });
        }
    }
    /* show the comment modal*/
    $scope.showComments = function(supplierId) {
        loadComments(supplierId);
        $scope.currentSupplierId = supplierId;
        const modal = $("#comments_modal");
        modal.modal('show');
    }

    // Test if entry is past it's exit time;
    $scope.checkOverdue = function (entry) {
        const entryTime = moment(entry.enterance_time);
        const maxExitTime = entryTime.add(entry.allowed_visa_hours, 'hours');
        const now = new Date();
        // If maxExitTime is smaller then now - the supplier is overdue.
        return maxExitTime.toDate().getTime() < now.getTime() && entry.supplier_status === 'Inside';
    };

    $scope.changeOrderBy = function (orderString) {
        if ($scope.orderEntries === orderString) {
            // Only toggle ordering
            $scope.isReverseOrder = !$scope.isReverseOrder;
            return;
        }
        $scope.orderEntries = orderString;
    };
    /* get supplier comments*/
    function loadComments(supplierId) {
        $http.get(`/suppliers/${supplierId}/supplier_comments`)
        .then((res) => {
            $scope.supplierComment = res.data.supplier_comment;
        })
        .catch((error) => {
            sweetAlert(`An error occurred while adding supplier entry ${error.data.data.message}`);
        });
    }
    function refreshCurrentEntries() {
        getAllEntries((res) => {
            $scope.entries = res.data.suppliers;
            setTimeout(() => {
                innerHeightChange()
            }, 500)
        });
    }

    $scope.editEntry = function(entry) {
        $scope.editedEntry = {...entry};
        // show modal
        $('#edit_entry_request_modal').modal('show');
    };

    $scope.cancelEditedEntry = function() {
        $scope.editedEntry = {};
    };

    $scope.saveEditedEntry = function() {
        // show modal
        $('#edit_entry_request_modal').modal('hide');
        $http.put('/suppliers/edit-entry', $scope.editedEntry)
            .then(response => {
                sweetAlert(`Supplier entry edited!`);
                $scope.editedEntry = {};
                // Update view.
                const newData = response.data;
                $scope.entries = $scope.entries.map(entry => {
                    if (entry.record_id === newData.record_id) {
                        entry = newData;
                    }
                    return entry;
                });
            })
            .catch(err => {
                sweetAlert(`An error occurred while updating supplier entry ${err.data.data.message}`);
            });
    };

});
