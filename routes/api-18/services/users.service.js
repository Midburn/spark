const helperService = require('./helper.service'),
    _ = require('lodash'),
    constants = require('../../../models/constants'),
    knex = require('../../../libs/db').knex;

let _count_allocations = (users, ticketKey) => {
    let allocationCount = 0;
    for (const i in users) {
        if (users.hasOwnProperty(i)) {
            if (users[i].camps_members_addinfo_json) {
                const addinfo_json = JSON.parse(users[i].camps_members_addinfo_json);
                if (addinfo_json[ticketKey]) {
                    allocationCount++
                }
            }
        }
    }
    return allocationCount;
}
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
    modifyUsersInfo(info, addinfo_jason_subAction,camp, users, user, isAdmin, allocationDates, isGroupSale) {
        const userData = info;
        let jsonInfo;
        let ticketKey = isGroupSale ? 'group_sale_ticket' : 'pre_sale_ticket';
        let campQuotaKey;
        //check for the sub action in the json info
        if (addinfo_jason_subAction === "early_arrival") {
            ticketKey = 'early_arrival'
            if (userData === null) {
                jsonInfo = { [ticketKey]: true };
            }
            else {
                //if the object is not null then parse it and toggle the current value
                jsonInfo=JSON.parse(userData);
                if (jsonInfo[ticketKey] === true) {
                    jsonInfo[ticketKey] = false;
                }
                else {
                    jsonInfo[ticketKey] = true;
                }
            }
            // if (jsonInfo[ticketKey]) {
            //     //first count how many pre sale tickets are assinged to the camp members
            //     let allocationCount = _count_allocations(users, ticketKey)
            //     let campQuota = users.length/2;
            //     if (allocationCount >= campQuota) {
            //         throw new Error("Exceeded Early Arrival allocation quota");
            //     }
            // }
        }
        else if (addinfo_jason_subAction === "pre_sale_ticket") {
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
                jsonInfo = { [ticketKey]: "true" };
            }
            else {
                //if the object is not null then parse it and toggle the current value
                jsonInfo=JSON.parse(userData);
                if (jsonInfo[ticketKey] === "true") {
                    jsonInfo[ticketKey] = "false";
                }
                else {
                    jsonInfo[ticketKey] = "true";
                }
            }
            if (jsonInfo[ticketKey] === "true") {
                //first count how many pre sale tickets are assinged to the camp members
                let allocationCount = _count_allocations(users, ticketKey)

                //if the pre sale ticket count equal or higher than the quota
                //reject the reuestdgs
                campQuotaKey = isGroupSale ? 'group_sale_tickets_quota' : 'pre_sale_tickets_quota';
                if (allocationCount >= camp.attributes[campQuotaKey]) {
                    throw new Error("exceed pre sale tickets quota");
                }
            }
        }
         //if we are going to set a pre sale ticket to true, we need to check if the quota is ok

        jsonInfo = JSON.stringify(jsonInfo);
        return jsonInfo;
    }

    retrieveDataForPresale() {
        //the emails of all users with presale tickets
        return knex(constants.USERS_TABLE_NAME).select(constants.USERS_TABLE_NAME+'.email')
            .innerJoin(constants.CAMP_MEMBERS_TABLE_NAME,constants.CAMP_MEMBERS_TABLE_NAME+'.user_id', constants.USERS_TABLE_NAME+'.user_id')
            .innerJoin(constants.CAMPS_TABLE_NAME,constants.CAMP_MEMBERS_TABLE_NAME+'.camp_id', constants.CAMPS_TABLE_NAME+'.id')
            .whereRaw("camp_members.addinfo_json->'$.pre_sale_ticket'='true'").then(emails => {
                const emails_array = helperService.getFields(emails,"email");
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
