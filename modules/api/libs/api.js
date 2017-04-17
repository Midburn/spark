const modules = require('../../../libs/modules');
const User = modules.require('users', 'models/user').User;
const passport = modules.require('users', 'libs/passport');

const api = module.exports = {};

api.permissions = {
    isAllowed: function(req, apiMethodPath, apiMethodParams) {
        // currently we return true for admin role
        // TODO: modify for more specific permissions
        // need to take into account that some api methods might be dangerous / allow misuse
        return req.user.isAdmin;
    }
};

api.users = {
    fetchById: function(req, userId) {
        if (api.permissions.isAllowed(req, "users/fetchById", userId)) {
            return User.forge({"user_id": userId}).fetch().then(function(object) {
                return {
                    "user_id": object.id,
                    "email": object.attributes.email,
                    "first_name": object.attributes.first_name,
                    "last_name": object.attributes.last_name
                }
            });
        }
    },
    fetchByEmail: function(req, email) {
      if (api.permissions.isAllowed(req, "users/fetchByEmail", email)) {
          return User.forge({email: email}).fetch().then(function(object) {
              return {
                  "user_id": object.id,
                  "email": object.attributes.email,
                  "first_name": object.attributes.first_name,
                  "last_name": object.attributes.last_name
              }
          })
      }
    },
    getTotalCount: function(req) {
        if (api.permissions.isAllowed(req, "users/getTotalCount")) {
            return User.count();
        }
    },
    fetchPage: function(req, opts) {
        if (api.permissions.isAllowed(req, "users/fetchPage")) {
            return User
                .query(function(qb) {
                    if (opts.searchTerm) {
                        qb
                            .where('email', 'LIKE', '%'+searchTerm+'%')
                            .orWhere('first_name', 'LIKE', '%'+searchTerm+'%')
                            .orWhere('last_name', 'LIKE', '%'+searchTerm+'%')
                        ;
                        if (!isNaN(searchTerm)) {
                            qb.orWhere('user_id', '=', searchTerm);
                        }
                    }
                })
                .orderBy(opts.orderBy)  // "-user_id"
                .fetchPage({
                    columns: opts.selectColumns,  // ["user_id", "email", "first_name", "last_name"]
                    pageSize: opts.resultsPerPage,  // 15
                    page: opts.currentPage  // 1
                }).then(function(rows) {
                    var data = rows.toJSON();
                    return {
                        pagination: rows.pagination, //  { page: 1, pageSize: 2, rowCount: 5, pageCount: 3 }
                        rows: data  // [{..}, {..}..]
                    };
                });
        }
    },
    signUp: function(req, email, password, user, done) {
        if (api.permissions.isAllowed(req, "users/signUp", {email:email, password:password, user:user})) {
            return passport.signup(email, password, user, function(savedUser, error) {
                // savedUser = {"user_id": 5 "first_name": "", "last_name: "", ...}
                // error = error message (string)
                done(savedUser, error);
            });
        }
    },
    edit: function(req, user_id, user) {
        if (api.permissions.isAllowed(req, "users/edit", {user_id: user_id, user: user})) {
            return User.forge({user_id: user_id}).save(user);
        }
    }
};
