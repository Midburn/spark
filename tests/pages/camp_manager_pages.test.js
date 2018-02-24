require("dotenv").config();
const agent = require("supertest").agent(require("../../app"));
const languages = process.env.languages || ["en", "he"]
const User = require("../../models/user").User;
const testUser = require("./0_init.test").campAdmin;

describe("Camp_Admin Pages", function() {
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
                case 'en':
                    regex = /Welcome Home/;
                    break;
                case 'he':
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
                case 'en':
                    regex = /Camps/;
                    break;
                case 'he':
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
                case 'en':
                    regex = /Midburn Association/;
                    break;
                case 'he':
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

    it(`gate page forbidden ${languages}`, () => {
        const page = "gate";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(403)
        }
        return Promise.all(promises);
    });

    it(`art-admin page forbidden ${languages}`, () => {
        const page = "art-admin";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(403);
        }
        return Promise.all(promises);
    });

    it(`prod-admin page forbidden ${languages}`, () => {
        const page = "prod-admin";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(403);
        }
        return Promise.all(promises);
    });

    it(`npo-admin page forbidden ${languages}`, () => {
        const page = "npo-admin";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(403);
        }
        return Promise.all(promises);
    });

    it(`events-admin page forbidden ${languages}`, () => {
        const page = "events-admin";
        const promises = [];
        let regex;
        for (let i = 0; i < languages.length; i++) {
            promises[i] = agent
                .get(`/${languages[i]}/${page}`)
                .expect(403);
        }
        return Promise.all(promises);
    });

});
