
exports.down = function(knex, Promise) {

};

exports.up = function (knex, Promise) {
    return Promise.all([
        knex('events').insert({
            event_id: "SANDBOX2017",
<<<<<<< HEAD
            gate_code: "171819",
=======
            gate_code: "171820",
>>>>>>> master
            name: "Sandbox 2017 ארגז חול",
            gate_status: "early_arrival"
        })
    ]);
<<<<<<< HEAD
};
=======
};
>>>>>>> master
