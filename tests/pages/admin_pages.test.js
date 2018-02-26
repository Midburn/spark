require("dotenv").config();
const agent = require("supertest").agent(require("../../app"));
const languages = process.env.languages || ["en", "he"];
const User = require("../../models/user").User;

const testUser = {
    email: "test_admin",
    password:"123456",
    roles: "admin",
    validated: true
};
(async () => {
    let newUser = new User(testUser);
    newUser.generateHash(testUser.password);
    await newUser.save();
})();

describe("Admin Pages", function() {
    this.timeout(20000);
    before(async () => {
        await agent
            .post(`/${languages[0]}/login`)
            .send({
                email: testUser.email,
                password: testUser.password
            })
            .expect(302);
    });

    it(`home page should show in ${languages}`, () => {
        const page = "home";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            switch (languages[i]) {
                case "en":
                    regex = /Welcome Home/;
                    break;
                case "he":
                    regex = /הביתה,/;
                    break;
                default:
                    break;
            }
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(200)
                .expect(regex);
        }
        return Promise.all(promises);
    });

    it(`camps page should show in ${languages}`, () => {
        const page = "camps";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            switch (languages[i]) {
                case "en":
                    regex = /Camps/;
                    break;
                case "he":
                    regex = /מחנות נושא ואמנות/;
                    break;
                default:
                    break;
            }
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(200)
                .expect(regex);
        }
        return Promise.all(promises);
    });

    it(`npo page should show in ${languages}`, () => {
        const page = "npo";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            switch (languages[i]) {
                case "en":
                    regex = /Midburn Association/;
                    break;
                case "he":
                    regex = /עמותת מידברן/;
                    break;
                default:
                    break;
            }
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(200)
                .expect(regex);
        }
        return Promise.all(promises);
    });

    it(`gate page should show in ${languages}`, () => {
        const page = "gate";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            switch (languages[i]) {
                case "en":
                    regex = /Gate/;
                    break;
                case "he":
                    regex = /שער/;
                    break;
                default:
                    break;
            }
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(200)
                .expect(regex);
        }
        return Promise.all(promises);
    });

    it(`art-admin page should show in ${languages}`, () => {
        const page = "art-admin";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            switch (languages[i]) {
                case "en":
                    regex = /art/;
                    break;
                case "he":
                    regex = /מיצבים/;
                    break;
                default:
                    break;
            }
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(200)
                .expect(regex);
        }
        return Promise.all(promises);
    });

    it(`prod-admin page should show in ${languages}`, () => {
        const page = "prod-admin";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            switch (languages[i]) {
                case "en":
                    regex = /prod/;
                    break;
                case "he":
                    regex = /ניהול מחלקות הפקה/;
                    break;
                default:
                    break;
            }
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(200)
                .expect(regex);
        }
        return Promise.all(promises);
    });

    it(`npo-admin page should show in ${languages}`, () => {
        const page = "npo-admin";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            switch (languages[i]) {
                case "en":
                    regex = /npo-admin/;
                    break;
                case "he":
                    regex = /עמותת מידברן/;
                    break;
                default:
                    break;
            }
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(200)
                .expect(regex);
        }
        return Promise.all(promises);
    });

    it(`events-admin page should show in ${languages}`, () => {
        const page = "events-admin";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            switch (languages[i]) {
                case "en":
                    regex = /Events/;
                    break;
                case "he":
                    regex = /אירועים/;
                    break;
                default:
                    break;
            }
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(200)
                .expect(regex);
        }
        return Promise.all(promises);
    });
});
