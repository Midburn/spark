// angular_getCamps function from supplier_edit.js
app.factory('camps', campsFactory);

// angular_getCamps function from supplier_edit.js
suppliers_app.factory('camps', campsFactory);

function campsFactory() {

    var factory = {};
    var camps_all;
    // Formerly known as get_camps_all
    factory.getAll = function ($http, on_success) {

        if (camps_all) {
            on_success(camps_all);
        } else {
            let _url = '/camps_all';
            if (groups_prototype === 'art_installation') {
                _url = '/art_all';
            } else if (groups_prototype === 'prod_dep') {
                _url = '/prod_dep_all';
            }
            //console.log(_url);
            $http.get(_url).then((res) => {
                camps_all = res;
                on_success(res);
            });
        }

    }

    factory.getCampMembers = function ($http, $scope, camp_id) {
        $http.get(`/camps/${camp_id}/members`).then((res) => {
            var members = res.data.members;
            var _members = [];
            var approved_members = [];
            var total_in_event = 0;
            var allocatedPreSaleTicketsCount = 0;
            var allocatedGroupSaleTicketsCount = 0;
            for (var i in members) {
                var newMember = members[i]
                //check if the user has a pre_sale ticket
                //if so the set the checkbox to true
                if (members[i].pre_sale_ticket) {
                    newMember.pre_sale_ticket_approved = members[i].pre_sale_ticket;
                    allocatedPreSaleTicketsCount++;
                }
                else {
                    newMember.pre_sale_ticket_approved = false;
                }
                if (members[i].group_sale_ticket) {
                    newMember.group_sale_ticket_approved = members[i].group_sale_ticket;
                    allocatedGroupSaleTicketsCount++;
                }
                else {
                    newMember.group_sale_ticket_approved = false;
                }
                if (['approved', 'pending', 'pending_mgr', 'approved_mgr', 'rejected'].indexOf(newMember.member_status) > -1) {
                    _members.push(newMember);
                }
                if (['approved', 'approved_mgr'].indexOf(newMember.member_status) > -1) {
                    approved_members.push(newMember);
                }
                total_in_event += parseInt(newMember.inside_event);
            }
            $scope.preSaleTicketsCount = preSaleTicketCount;
            $scope.groupSaleTicketsCount = groupSaleTicketCount;
            $scope.allocatedTickets = allocatedPreSaleTicketsCount + allocatedGroupSaleTicketsCount;
            $scope.pre_sale_tickets_quota = res.data.pre_sale_tickets_quota;
            $scope.group_sale_tickets_quota = res.data.group_sale_tickets_quota;
            $scope.members = _members;
            $scope.approved_members = approved_members;
            $scope.all_approved_members = approved_members.length;
            $scope.total_camp_tickets = totalTicketCount;
            $scope.total_in_event = total_in_event;
        });

    }

    factory.updateUser = function ($http, $scope, action_type, user_rec) {
        var camp_id = user_rec.camp_id;
        var user_name = user_rec.user_name;
        var user_id = user_rec.user_id;
        var lang = $scope.lang;
        if (lang === undefined) {
            lang = 'he';
        }
        var tpl, action_tpl;

        if (lang === "he") {
            // debugger;
            action_tpl = {
                approve: 'לאשר את',
                approveBtn: 'אשר',
                delete: 'למחוק את',
                reject: 'לדחות את',
                rejectBtn: 'בטל',
                approve_mgr: 'להפוך למנהל את',
                remove: 'להסיר את',
                pre_sale_ticket: 'לאשר כרטיס מוקדם',
                group_sale_ticket: 'לאשר כרטיס קבוצה',
                early_arrival: 'לאשר הגעה מוקדמת',
            };
            tpl = {
                alert_title: "האם את/ה בטוח?",
                alert_text: "האם את/ה בטוח שתרצה " + action_tpl[action_type] + " למשתמש " + user_name + "?",
                alert_success_1: action_type + "!",
                alert_success_2: "משתמש " + user_name + action_type,
                alert_success_3: " בהצלחה",
            };
        } else {
            action_tpl = {
                approve: 'Approve',
                approveBtn: 'Approve',
                delete: 'Delete',
                reject: 'Reject',
                rejectBtn: 'Reject',
                approve_mgr: 'Set Manager',
                remove: 'Remove',
                pre_sale_ticket: 'Update Pre Sale Ticket',
            };
            tpl = {
                alert_title: "Are you sure?",
                alert_text: "Are you sure you would like to " + action_tpl[action_type] + " " + user_name + "?",
                alert_success_1: action_type + "!",
                alert_success_2: user_name + "has been " + action_type,
                alert_success_3: "success",
            };
        }

        swal({
            title: tpl.alert_title,
            text: tpl.alert_text,
            type: "warning",
            buttons: {
                confirm: action_tpl.approveBtn,
                cancel: action_tpl.rejectBtn,
            }
        }).then(select => {
            if (select) {
                const url = `/camps/${camp_id}/members/${user_id}/${action_type}`
                $http.get(url).then(res => {
                    swal(tpl.alert_success_1, tpl.alert_success_1, "success");
                    $scope.getMembers(camp_id);
                }).catch((err) => {
                    jsonError = err.data.data.message;
                    swal("Error!", `Something went wrong, please try again later \n ${jsonError}`, "error");
                })
            }
        });
    }
    return factory;
};