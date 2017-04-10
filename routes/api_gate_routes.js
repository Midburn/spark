// var User = require('../models/user').User;
// var Camp = require('../models/camp').Camp;
// const constants = require('../models/constants.js');
// var config = require('config');
// const knex = require('../libs/db').knex;
// const userRole = require('../libs/user_role');
// var mail = require('../libs/mail'),
//     mailConfig = config.get('mail');
// 
// module.exports = (app, passport) => {
//     /**
//      * API: (GET) get user by id
//      * request => /users/:id
//      */
//     app.get('/gate/:action/:reference',
//         [userRole.isLoggedIn(), userRole.isAllowToViewUser()],
//         (req, res) => {
//             User.forge({ user_id: req.params.id }).fetch({ columns: '*' }).then((user) => {
//                 if (user !== null) {
//                     res.json({ name: user.get('name'), email: user.get('email'), cell_phone: user.get('cell_phone') })
//                 } else {
//                     res.status(404).json({ message: 'Not found' })
//                 }

//             }).catch((err) => {
//                 res.status(500).json({
//                     error: true,
//                     data: {
//                         message: err.message
//                     }
//                 });
//             });
//         });

// }
