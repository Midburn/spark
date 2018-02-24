require("dotenv").config();
const agent = require("supertest").agent(require("../../app"));
const languages = process.env.languages || ["en", "he"];
const User = require("../../models/user").User;

// const ADMIN_USER_EMAIL = "omerp@websplanet.com";
// const ADMIN_USER_PASSWORD = "123456";
const ADMIN_USER_EMAIL = "aaa";
const ADMIN_USER_PASSWORD = "123456";

const users = [
    {
        email: "test_admin",
        password: "123456",
        roles: "admin"
    },
    {
        email: "test_camp_manager",
        password: "123456",
        roles: "camp_manager"
    },
    {
        email: "test_user",
        password: "123456",
        roles: ""
    }
];

(async () => {
    users.forEach(async (user) => {
        var newUser = new User({
            email: user.email,
            validated: true,
            roles: user.roles
        });
        newUser.generateHash(user.password);
        await newUser.save();
    });
})();

module.exports.Admin = users[0]; 
module.exports.campAdmin = users[1];
module.exports.user = users[2];
