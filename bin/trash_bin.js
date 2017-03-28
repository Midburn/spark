/**
     * API: (GET) camps member manager
     *  :id - camp_id
     *  :action - ?user_id=id 
     *      list - list camp member
     *      add - add user_id to camp 
     *              if already in camp, do nothing.
     *              if req.user is camp_manager on camp_id, will add him with status pending_mgr
     *              if req.user is user_id, will add him with status pending
     *      remove - remove user_id from camp
     *              if req.user is camp_manager on camp_id, will remove user_id
     *              if req.user.user_id = user_id, will remove him.
     *      approve - approve user_id from camp
     *              if not approve,
     *                  if req.user is camp_manager on camp_id, and status=pending, approve.
     *                  if req.user.user_id = user_id, and status=pending_mgr, approve.
     *      reject - reject user_id from camp
     *              if not approve,
     *                  if req.user is camp_manager on camp_id, 
     * 
     */
app.get('/camps/:id/members/:action', userRole.isLoggedIn(), (req, res) => {
    var action = req.params.action;
    var camp_id = req.params.id;
    // Camp.forge({ id: req.params.id }).fetch().then(function (camp) {
    Camp.forge({ id: camp_id }).fetch(
        {
            withRelated: ['members'],
        }
    ).then((camp) => {
        console.log(req.user);
        // console.log(camp);
        // debugger;
        var _camp = camp.toJSON();
        // console.log(_camp);
        if (_camp.event_id === constants.CURRENT_EVENT_ID) {
            if (action === 'approve') {
                // need to approve the user
            }
            CampMembers.forge({
                camp_id: camp_id,
                user_id: req.user.attributes.user_id,
                status: 'confirmed'
            }).save().then((member) => {
                res.status(200).json({ camp: _camp })
                // debugger;
                // console.log(member);
            });
            // camp is good for us lets get current members
            // CampMembers.forge({ camp_id: camp_id }).fetchAll(
            // ).then((members) => {
            //     res.status(200).json({ members: members.toJSON() });
            //     if (action === 'list') {
            //         // CampMembers({ camp_id: camp_id })

            //     } else if (action === 'add') {
            //         // if action=add then we will add new member
            //         var user_id = req.query.user_id;
            //     }

            // });

        } else {
            res.status(404).json({
                data: { message: 'Camp Not available in current event ' + constants.CURRENT_EVENT_ID },
                logged: camp
            })
        }
    });
    // // var reference=req.params.reference;
    // new CampMembers({
    //     camp_id: req.params.id
    // }).fetch().then(function (member) {
    //     if (member !== null) {
    //         User.forge({ user_id: member.attributes.user_id })
    //             .fetch().then((user) => {
    //                 res.status(200).json({ users: user.toJSON() })
    //             })
    //     } else {
    //         // not found
    //     }
    // })

    // res.status(200).json({ message: action+" "+reference});
});
        // // check if req.user has any camp.
        // // check if req.user approved camp
        // // req.user.can_join_camp(req)
        // req.user.getUserCamps((camps) => {
        //     var upd_status = 'pending';
        //     if (camps.length > 0) {
        //         console.log(camps);
        //         // already have camp, lets check which camp
        //         if (camps[0].id == req.params.id) {
        //             if (camps[0].camp_status == "pending_mgr") {
        //                 upd_status = 'approved';
        //             } else if (camps[0].camp_status === "approved" || camps[0].camp_status === "pending") {
        //                 upd_status = '';
        //             }
        //         } else {
        //             upd_status = '';
        //             res.status(404).json({
        //                 error: true,
        //                 data: {
        //                     message: 'already applied for different camp  ' + camps[0].id
        //                 }
        //             });
        //         }
        //     }
        //     if (upd_status!='') {
        //         // CampMember.forge({camp_id : req.params.id})
        //     }
        // });

        // });

        // CampMember.forge({
        //     camp_id: camp_id,
        //     user_id: user_id,
        //     status: 'pending'
        // }).save(null, { method: 'insert' }).then((camp_member) => {
        //     deliver()
        //     setPending()
        //     res.status(200).end()
        // }).catch((e) => {
        //     res.status(500).json({
        //         error: true,
        //         data: {
        //             message: e.message
        //         }
        //     })
        // })

