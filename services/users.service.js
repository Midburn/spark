const constants = require('../models/constants');

class UsersService {
    /**
     * here we pass the query info from the SQL
     * and check the json info, the method will throw and error if failed
     * TODO - Simplifiy this function and break it down
     */
    modifyUsersInfo(info, subAction, camp, users, user, isAdmin) {
        const userData = info;
        let jsonInfo;
        //check for the sub action in the json info
        if (subAction === "pre_sale_ticket") {
            //check if the time of the pre sale is on
            //checking using the time constants for now
            //unless user is admin
            //TODO once the event table will be updated with presale ticket time, this needs to be replace
            if (isAdmin === false) {
                const currentTime = new Date();
                const start = new Date(constants.PRESALE_TICKETS_START_DATE);
                const end = new Date(constants.PRESALE_TICKETS_END_DATE);
                if (currentTime.getTime() < start.getTime() || currentTime.getTime() > end.getTime()) {
                    throw new Error("PreSale Tickes selection is currently closed");
                }
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
                let preSaleTicketsCount = 0;
                for (const i in users) {
                    if (users[i].camps_members_addinfo_json) {
                        const addinfo_json = JSON.parse(users[i].camps_members_addinfo_json);
                        if (addinfo_json.pre_sale_ticket === "true") {
                            preSaleTicketsCount++
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
}

module.exports = new UsersService();
