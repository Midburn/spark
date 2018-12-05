
app.controller("campEditController", ($scope, $http, $filter, $q, camps) => {
    var camp_id = document.querySelector('#meta__camp_id').value;
    var lang = $scope.lang;
    if (lang === undefined) {
        lang = 'he';
    }
    if (lang === "he") {
        $scope.status_options = [
            { id: 'open', value: 'מחנה פתוח למצטרפים חדשים' },
            { id: 'closed', value: 'סגור למצטרפים חדשים' }];
        $scope.noise_level_options = [
            { id: 'quiet', value: 'שקט' },
            { id: 'medium', value: 'בינוני' },
            { id: 'noisy', value: 'רועש' },
            { id: 'very noisy', value: 'מאוד רועש' }];
    } else {
        $scope.status_options = ['Opened to new member', 'Closed to new members'];
        $scope.status_options = [
            { id: 'open', value: 'Opened to new member' },
            { id: 'closed', value: 'Closed to new members' }];
        $scope.noise_level_options = [
            { id: 'quiet', value: 'Quiet' },
            { id: 'medium', value: 'Medium' },
            { id: 'noisy', value: 'Noisy' },
            { id: 'very noisy', value: 'Very Noisy' }];
    }

    const angular_deleteCampFile = function ($http, $scope, $q, camp_id, doc_id) {
    const req_path = `/camps/${camp_id}/documents/${doc_id}/`
    let deleteFilePromise = $q.defer()

    $http.delete(req_path).then(function (res) {
        deleteFilePromise.resolve(res.data.files)
    }).catch(function (err) {
        const jsonError = err.data.message;
        sweetAlert("Error!", "Could not delete file \n" + jsonError)
        deleteFilePromise.reject(err)
    })

    return deleteFilePromise.promise
}

// var angular_getMembers = function ($http, $scope, camp_id) {
//     $http.get(`/camps/${camp_id}/members`).then((res) => {
//             var members = res.data.members;
//             var _members = [];
//             var approved_members = [];
//             var total_in_event = 0;
//             var allocatedPreSaleTicketsCount=0;
//             var allocatedGroupSaleTicketsCount=0;
//             for (var i in members) {
//                 var newMember=members[i]
//                 //check if the user has a pre_sale ticket
//                 //if so the set the checkbox to true
//                 if (members[i].pre_sale_ticket) {
//                     newMember.pre_sale_ticket_approved=members[i].pre_sale_ticket;
//                     allocatedPreSaleTicketsCount++;
//                 }
//                 else {
//                     newMember.pre_sale_ticket_approved = false;
//                 }
//                 if (members[i].group_sale_ticket) {
//                     newMember.group_sale_ticket_approved=members[i].group_sale_ticket;
//                     allocatedGroupSaleTicketsCount++;
//                 }
//                 else {
//                     newMember.group_sale_ticket_approved = false;
//                 }
//                 if (['approved', 'pending', 'pending_mgr', 'approved_mgr', 'rejected'].indexOf(newMember.member_status) > -1) {
//                     _members.push(newMember);
//                 }
//                 if (['approved', 'approved_mgr'].indexOf(newMember.member_status) > -1) {
//                     approved_members.push(newMember);
//                 }
//                 total_in_event += parseInt(newMember.inside_event);
//             }
//             $scope.preSaleTicketsCount = preSaleTicketCount;
//             $scope.groupSaleTicketsCount = groupSaleTicketCount;
//             $scope.allocatedTickets = allocatedPreSaleTicketsCount + allocatedGroupSaleTicketsCount;
//             $scope.pre_sale_tickets_quota = res.data.pre_sale_tickets_quota;
//             $scope.group_sale_tickets_quota = res.data.group_sale_tickets_quota;
//             $scope.members = _members;
//             $scope.approved_members = approved_members;
//             $scope.all_approved_members = approved_members.length;
//             $scope.total_camp_tickets = totalTicketCount;
//             $scope.total_in_event = total_in_event;
//         });
//     }

// var angular_updateUser = function ($http, $scope, action_type, user_rec) {
//     var camp_id = user_rec.camp_id;
//     var user_name = user_rec.user_name;
//     var user_id = user_rec.user_id;
//     var lang = $scope.lang;
//     if (lang === undefined) {
//         lang = 'he';
//     }
//     var tpl, action_tpl;

//     if (lang === "he") {
//         // debugger;
//         action_tpl = {
//             approve: 'לאשר את',
//             approveBtn: 'אשר',
//             delete: 'למחוק את',
//             reject: 'לדחות את',
//             rejectBtn: 'בטל',
//             approve_mgr: 'להפוך למנהל את',
//             remove: 'להסיר את',
//             pre_sale_ticket : 'לאשר כרטיס מוקדם',
//             group_sale_ticket : 'לאשר כרטיס קבוצה',
//             early_arrival : 'לאשר הגעה מוקדמת',
//         };
//         tpl = {
//             alert_title: "האם את/ה בטוח?",
//             alert_text: "האם את/ה בטוח שתרצה " + action_tpl[action_type] + " למשתמש " + user_name + "?",
//             alert_success_1: action_type + "!",
//             alert_success_2: "משתמש " + user_name + action_type,
//             alert_success_3: " בהצלחה",
//         };
//     } else {
//         action_tpl = {
//             approve: 'Approve',
//             approveBtn: 'Approve',
//             delete: 'Delete',
//             reject: 'Reject',
//             rejectBtn: 'Reject',
//             approve_mgr: 'Set Manager',
//             remove: 'Remove',
//             pre_sale_ticket: 'Update Pre Sale Ticket',
//         };
//         tpl = {
//             alert_title: "Are you sure?",
//             alert_text: "Are you sure you would like to " + action_tpl[action_type] + " " + user_name + "?",
//             alert_success_1: action_type + "!",
//             alert_success_2: user_name + "has been " + action_type,
//             alert_success_3: "success",
//         };
//     }

//     swal({
//         title: tpl.alert_title,
//         text: tpl.alert_text,
//         type: "warning",
//         buttons: {
//             confirm: action_tpl.approveBtn,
//             cancel: action_tpl.rejectBtn,
//         }
//     }).then(select => {
//             if (select) {
//                 const url = `/camps/${camp_id}/members/${user_id}/${action_type}`
//                 $http.get(url).then(res => {
//                     swal(tpl.alert_success_1, tpl.alert_success_1, "success");
//                     $scope.getMembers(camp_id);
//                 }).catch((err) => {
//                     jsonError = err.data.data.message;
//                     swal("Error!", `Something went wrong, please try again later \n ${jsonError}`, "error");
//                 })
//             }
//         });
// }

const angular_getCampFile = function ($http, $scope, $q, camp_id) {
    const req_path = `/camps/${camp_id}/documents/`
    let getFilePromise = $q.defer()

    $http.get(req_path).then(function (res) {
        getFilePromise.resolve(res.data.files)
    }).catch(function (err) {
        const jsonError = err.data.message
        sweetAlert("Error!", "Something went wrong, please try again later \n" + jsonError)
        getFilePromise.reject(err)
    })

    return getFilePromise.promise
}

    $scope.getMembers = () => {
        camps.getCampMembers($http, $scope, camp_id);
        setTimeout(() => {
            innerHeightChange();
        }, 500)
    }

    $scope.getSuppliers = () => {
        const promise = $q.defer();
        const camp_id = $scope.current_camp_id;
        $http.get(`/suppliers/${camp_id}/suppliers`).then(s => {
            $scope.camp_suppliers = s.data.suppliers;
            return $http.get('/suppliers').then(s => {
                $scope.all_suppliers = s.data.suppliers.filter(
                    supplier => !$scope.camp_suppliers.find(s => s.supplier_id === supplier.supplier_id));
                promise.resolve();
            })
        }).catch(e => promise.reject(e));
    }

    $scope.changeOrderBy = (orderByValue) => {
        $scope.orderMembers = orderByValue;
    }
    $scope.lang = document.getElementById('meta__lang').value;
    // $scope.grouptype = document.getElementById('meta__grouptype').value;

    $scope.removeSupplier = supplier_id => {
        const promise = $q.defer();
        const camp_id = $scope.current_camp_id;
        $http.delete(`/suppliers/${supplier_id}/camps/${camp_id}`).then(() => {
            $scope.getSuppliers();
            promise.resolve();
        }).catch(e => {
            const jsonError = e.data.message;
            sweetAlert("Error!", "Could not remove supplier \n" + jsonError);
            promise.reject(e);
        });
    };

    $scope.addSupplierError = '';

    $scope.addSupplier = () => {
        const promise = $q.defer();
        const camp_id = $scope.current_camp_id;
        const {add_supplier_id} = $scope;
        $http.put(`/suppliers/${add_supplier_id}/camps/${camp_id}`).then(() => {
            $scope.getSuppliers();
            $scope.addSupplierError = '';
            promise.resolve();
        }).catch(e => {
            sweetAlert("Oops...", e.data.data.message, "error");
            promise.reject(e)
        });
    }

    $scope.addMember = () => {
        var camp_id = $scope.current_camp_id;
        var new_user_email = $scope.camps_members_add_member
        var data = {
            user_email: new_user_email,
            camp_id: camp_id,
        }
        $http.post(`/camps/${camp_id}/members/add`, data).then(function (res) {
            // update table with new data
            $scope.getMembers();
            $scope.camps_members_add_member = '';
        }).catch((err) => {
            sweetAlert("Error!", "Add new member error: " + err.data.data.message, "error");
        });
    }

    $scope.updateUser = (user_name, user_id,action_type) => {
        var camp_id = $scope.current_camp_id;
        var user_rec = {
            camp_id: camp_id,
            user_name: user_name,
            user_id: user_id,
        };
        camps.updateUser($http, $scope, action_type, user_rec);
    };

    $scope.allocationPeriodisActive = (isGroupSale) => {
        const now = new Date();
        const allocationPeriod = {
            start : isGroupSale ? new Date(controllDates.group_sale_tickets_allocation_start) : new Date(controllDates.appreciation_tickets_allocation_start),
            end : isGroupSale ? new Date(controllDates.group_sale_tickets_allocation_end) : new Date(controllDates.appreciation_tickets_allocation_end),
        };
        return allocationPeriod.start < now && now < allocationPeriod.end;
    };

    $scope.earlyArrivalPeriodIsActive = () => {
        const now = new Date();
        const earlyArrivalPeriod = {
            start : new Date(controllDates.early_arrivals_start),
            end : new Date(controllDates.early_arrivals_end),
        };
        return earlyArrivalPeriod.start < now && now < earlyArrivalPeriod.end;
    };

    $scope.updateEarlyArrival = (user_name, user_id, action_type) => {
        var camp_id = $scope.current_camp_id;
        var user_rec = {
            camp_id: camp_id,
            user_name: user_name,
            user_id: user_id,
        }

        camps.updateUser($http, $scope, action_type, user_rec);
    }

    //when the user wants to update a pre sale ticket
    //this method is executed
    $scope.updatePreSaleTicket = (user_name, user_id,action_type,pre_sale_ticket_approved) => {
        var camp_id = $scope.current_camp_id;
        var user_rec = {
            camp_id: camp_id,
            user_name: user_name,
            user_id: user_id,
        }

        camps.updateUser($http, $scope, action_type, user_rec);
    }

    $scope.getFiles = () => {
        angular_getCampFile($http, $scope, $q, camp_id)
        .then((files) => {
            console.log('Got camp files!')
            $scope.files = files;
        }).catch((err) => {
            console.log(err)
        })
    }

    $scope.deleteFile = (doc_id) => {
        angular_deleteCampFile($http, $scope, $q, camp_id, doc_id)
        .then((files) => {
            console.log('File deleted')
            $scope.files = files;
        }).catch((err) => {
            console.log(err)
        })
    }

    if (!_.isNil(camp_id) && Number(camp_id)) {
        $scope.current_camp_id = camp_id;
        $scope.getMembers();
        $scope.getFiles();
        $scope.getSuppliers();
    }

}); //end of controller

app.controller("homeController", ($scope, $http, $filter) => {
    $scope.carCount = 0;
    $scope.entryCount = 0;
    $scope.angular_getMyGroups = function ($http, $scope) {
        $http.get(`/my_groups`).then((res) => {
            // debugger;
            $scope.groups = res.data.groups;
            $scope.stat = res.data.stats;
        });
    };

    $scope.getCarCount = ($http, $scope) => {
        $http.get(`/api/gate/vehicle-counter/${currentEventId}`).then((res) => {
            // debugger;
            $scope.carCount = res.data.vehicleCount;
        });
    };

    $scope.getEntryCount = ($http, $scope) => {
        $http.get(`/api/gate/entry-counter/${currentEventId}?type=early_arrival`).then((res) => {
            // debugger;
            $scope.earlyArrivalCount = res.data.entryCount;
        });
    };

    $scope.angular_ChangeCurrentEventId = function (event_id) {
        //set new current event id
        $http.post('/events/change', {currentEventId: event_id}).then((res) => {
            window.location.reload();
        });
    };

    $scope.isGroupEditable = function (group) {
        const edit_camp_disabled = currentEventRules.edit_camp_disabled;
        const edit_art_disabled = currentEventRules.edit_art_disabled;
        if (!group.can_edit) {
            return false;
        }
        switch (group.group_type) {
            case 'Art Installation':
                return !edit_art_disabled;
            default:
                return !edit_camp_disabled;
        }

    };

    $scope.angular_getMyGroups($http, $scope);
    $scope.getCarCount($http, $scope);
    $scope.getEntryCount($http, $scope);

});
