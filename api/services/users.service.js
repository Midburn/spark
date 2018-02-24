const helperService = require('./helper.service');

class UsersService {
    /**
     * formely known as Modify_User_AddInfo
     * here we pass the query info from the SQL
     * and check the json info, the method will throw and error if failed
     * @param info
     * @param addinfo_jason_subAction
     * @param camp
     * @param users
     * @param user
     * @param isAdmin
     * @param allocationDates
     * @returns {*}
     */
    modifyUsersInfo(info, addinfo_jason_subAction,camp, users, user, isAdmin, allocationDates) {
        const userData = info;
        let jsonInfo;
        //check for the sub action in the json info
        if (addinfo_jason_subAction === "pre_sale_ticket") {
            const {start, end} = allocationDates;
            const now = new Date();
            const isValidAllocationDate = start < now && now < end;
            //check if the time of the pre sale is on
            if (isAdmin === false && !isValidAllocationDate) {
                throw new Error("PreSale Tickes selection is currently closed");
            }
            //if the user is not approved yet in the
            //reject the reuest
            if (user.member_status === 'pending') {
                throw new Error("Cannot assign Pre-sale ticket to pending user");
            }
            //check if the json info is null
            //if so then set it the value as this is the first init of the data
            if (userData === null) {
                jsonInfo = {"pre_sale_ticket": "true"};
            }
            else {
                //if the object is not null then parse it and toggle the current value
                jsonInfo=JSON.parse(userData);
                if (jsonInfo.pre_sale_ticket === "true") {
                    jsonInfo.pre_sale_ticket = "false";
                }
                else {
                    jsonInfo.pre_sale_ticket = "true";
                }
            }
            //if we are going to set a pre sale ticket to true, we need to check if the quota is ok
            if (jsonInfo.pre_sale_ticket === "true") {
                //first count how many pre sale tickets are assinged to the camp members
                let preSaleTicketsCount=0;
                for (const i in users) {
                    if (users.hasOwnProperty(i)) {
                        if (users[i].camps_members_addinfo_json) {
                            const addinfo_json = JSON.parse(users[i].camps_members_addinfo_json);
                            if (addinfo_json.pre_sale_ticket === "true") {
                                preSaleTicketsCount++
                            }
                        }
                    }
                }
                //if the pre sale ticket count equal or higher than the quota
                //reject the reuest
                if (preSaleTicketsCount >= camp.attributes.pre_sale_tickets_quota) {
                    throw new Error("exceed pre sale tickets quota");
                }
            }
        }
        jsonInfo = JSON.stringify(jsonInfo);
        return jsonInfo;
    }

    retrieveDataForPresale() {
        //the emails of all users with presale tickets
        return knex(constants.USERS_TABLE_NAME).select(constants.USERS_TABLE_NAME+'.email')
            .innerJoin(constants.CAMP_MEMBERS_TABLE_NAME,constants.CAMP_MEMBERS_TABLE_NAME+'.user_id', constants.USERS_TABLE_NAME+'.user_id')
            .innerJoin(constants.CAMPS_TABLE_NAME,constants.CAMP_MEMBERS_TABLE_NAME+'.camp_id', constants.CAMPS_TABLE_NAME+'.id')
            .whereRaw("camp_members.addinfo_json->'$.pre_sale_ticket'='true'").then(emails => {
                emails_array = helperService.getFields(emails,"email");
                if (!_.isUndefined(emails)) {
                    return {
                        status: 200,
                        data: {
                            emails_array
                        }
                    };
                } else {
                    return {
                        status: 404,
                        data: { data: { message: 'Not found' } }
                    };
                }
            }).catch(err => {
                return {
                    status: 500,
                    data: {
                        error: true,
                        data: { message: err.message }
                    }
                };
            });
    }
}

/**
 * Export singleton
 * @type {UsersService}
 */
module.exports = new UsersService();
