var User = require('../models/user').User;
var Camp = require('../models/camp').Camp;
var CampDetails = require('../models/camp').CampDetails;
var config = require('config');

const userRole = require('../libs/user_role');

var mail = require('../libs/mail'),
    mailConfig = config.get('mail');

module.exports = function(app, passport) {
    /**
     * API: (GET) get user by id
     * request => /users/:id
     */
    app.get('/users/:id', (req, res) => {
        User.forge({user_id: req.params.id}).fetch({columns: '*'}).then((user) => {
            if (user !== null) {
                res.json({name: user.get('name'), email: user.get('email'), cell_phone: user.get('cell_phone')})
            } else {
                res.status(404).json({message: 'Not found'})
            }

        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });
    /**
     * API: (POST) create camp
     * request => /camps/new
     */
    app.post('/camps/new', (req, res) => {
        var camp_name_he = req.body.camp_name_he,
            camp_name_en = req.body.camp_name_en;

        Camp.forge({
            camp_name_he: camp_name_he,
            camp_name_en: camp_name_en,
            camp_desc_he: req.body.camp_desc_he,
            camp_desc_en: req.body.camp_desc_en,
            contact_person_id: req.body.contact_person_id,
            facebook_page_url: req.body.facebook_page_url,
            main_contact: req.body.camp_main_contact,
            moop_contact: req.body.camp_moop_contact,
            safety_contact: req.body.camp_safety_contact,
            type: req.body.camp_type,
            created_at: Date(),
            updated_at: Date()
        }).save().then((camp) => {
            res.json({
                error: false,
                data: {
                    message: 'camp created',
                    camp_id: camp.attributes.id
                }
            });
            CampDetails.forge({
                camp_id: camp.attributes.id,
                camp_activity_time: req.body.camp_hours,
                child_friendly: req.body.camp_kids_friendly,
                noise_level: req.body.noise_lvl,
                public_activity_area_sqm: req.body.size_for_activity,
                public_activity_area_desc: req.body.public_area_reason
            }).save().then((campDetails) => {
                res.status(200).json({
                    error: false,
                    data: {
                        message: 'success'
                    }
                });
            }).catch((e) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: e.message
                    }
                });
            })
        }).catch((e) => {
            res.status(500).json({
                error: true,
                data: {
                    message: e.message
                }
            });
        });
    });

    /**
     * API: (PUT) edit camp
     * request => /camps/1/edit
     */
    app.put('/camps/:id/edit', (req, res) => {
        Camp.forge({id: req.params.id}).fetch().then(function(camp) {
            camp.save({
                // camp_name_en: req.body.camp_name_en,
                camp_name_he: req.body.camp_name_he,
                camp_desc_he: req.body.camp_desc_he,
                camp_desc_en: req.body.camp_desc_en,
                status: req.body.status,
                type: req.body.type,
                contact_person_id: req.body.contact_person_id,
                facebook_page_url: req.body.facebook_page_url,
                accept_families: req.body.accept_families,
                main_contact: req.body.main_contact,
                moop_contact: req.body.moop_contact,
                safety_contact: req.body.safety_contact
            }).then(function() {
                // TODO: not working with this table. need-a-fix
                CampDetails.forge({
                    camp_id: req.params.id,
                    camp_activity_time: req.body.camp_activity_time,
                    child_friendly: req.body.child_friendly,
                    noise_level: req.body.noise_level,
                    public_activity_area_sqm: req.body.public_activity_area_sqm,
                    public_activity_area_desc: req.body.public_activity_area_desc,
                    support_art: req.body.support_art,
                    location_comments: req.body.location_comments,
                    camp_location_street: req.body.camp_location_street,
                    camp_location_street_time: req.body.camp_location_street_time,
                    camp_location_area: req.body.camp_location_area
                }).save().then(() => {
                    res.json({error: false, status: 'Camp updated'});
                });
            }).catch(function(err) {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        }).catch(function(err) {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });
    // PUBLISH
    app.put('/camps/:id/publish', (req, res) => {
        // If camp met all its requirements, can publish
        Camp.forge({id: req.params.id}).fetch().then(function(camp) {
            camp.save({enabled: '1'}).then(function() {
                res.json({error: false, status: 'Publish'});
            }).catch(function(err) {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        }).catch(function(err) {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });
    // UNPUBLISH
    app.put('/camps/:id/unpublish', (req, res) => {
        Camp.forge({id: req.params.id}).fetch().then(function(camp) {
            camp.save({enabled: '0'}).then(function() {
                res.json({error: false, status: 'Unpublish'});
            }).catch(function(err) {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        }).catch(function(err) {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });

    /**
     * API: (GET) return published camps with:
     * camp_name_en, camp_name_he, camp_desc_en, camp_desc_he, status,
     * accept_families, contact_person_full_name, phone, email, facebook_page
     * request => /camps_published
     * method: JSONP
     */
    app.get('/camps_published', (req, res, next) => {
        Camp.fetchAll().then((camp) => {
            var published_camps = [];
            for (var i = 0; i < camp.models.length; i++) {
                if (camp.models[i].attributes.enabled === '1' && camp.models[i].attributes.status !== 'inactive') {
                    var fetched_camp = {
                        id: camp.models[i].attributes.id,
                        name_en: camp.models[i].attributes.camp_name_en,
                        name_he: camp.models[i].attributes.camp_name_he,
                        desc_en: camp.models[i].attributes.camp_desc_en,
                        desc_he: camp.models[i].attributes.camp_desc_he,
                        contact_person_id: camp.models[i].attributes.contact_person_id,
                        facebook_page_url: camp.models[i].attributes.facebook_page_url,
                        status: camp.models[i].attributes.status,
                        accept_families: camp.models[i].attributes.accept_families
                    };
                    published_camps.push(fetched_camp);
                }
            }
            res.status(200).jsonp({published_camps})
        }).catch((err) => {
            res.status(500).jsonp({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });
    /**
     * API: (GET) return camp's contact person with:
     * name_en, name_he, email, phone
     * request => /camps_contact_person/:id
     * method: JSONP
     */
    app.get('/camps_contact_person/:id', (req, res, next) => {
        // Allow this address to http-request to this endpoint.
        // var API_PUBLISHED_CAMPS_ALLOW_ORIGIN;
        // if (app.get('env') === 'development') {
        //    API_PUBLISHED_CAMPS_ALLOW_ORIGIN = config.get('published_camps_origin.dev');
        // } else {
        //   API_PUBLISHED_CAMPS_ALLOW_ORIGIN = config.get('published_camps_origin.prod');
        // }
        //
        // res.header('Access-Control-Allow-Origin', API_PUBLISHED_CAMPS_ALLOW_ORIGIN);
        // res.header('Access-Control-Allow-Methods', 'GET');
        // res.header('Access-Control-Allow-Headers', 'Content-Type');
        User.forge({user_id: req.params.id}).fetch({
            require: true,
            columns: ['first_name', 'last_name', 'email', 'cell_phone']
        }).then((user) => {
            res.status(200).jsonp({user: user.toJSON()})
        }).catch((err) => {
            res.status(500).jsonp({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });

    /**
     * API: (GET) return indication if camp exist, provide camp_name_en
     * request => /camps/<camp_name_en>
     */
    app.get('/camps/:camp_name_en', (req, res) => {
        var req_camp_name_en = req.params.camp_name_en;
        Camp.forge({camp_name_en: req_camp_name_en}).fetch().then((camp) => {
            if (camp === null) {
                // camp name is available
                res.status(204).end();
            } else {
                res.status(200).end();
            }
        }).catch((e) => {
            res.status(500).json({
                error: true,
                data: {
                    message: e.message
                }
            });
        });
    });

    /**
     * API: (GET) return active user list
     * request => /users
     */
    app.get('/users', (req, res) => {
        User.fetchAll().then((users) => {
            res.status(200).json({users: users.toJSON()})
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });

    /**
     * API: (GET) return camps list
     * request => /camps
     */
    app.get('/camps', (req, res) => {
        Camp.fetchAll().then((camp) => {
            res.status(200).json({camps: camp.toJSON()})
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });

    /**
     * API: (GET) return camps list which are open to new members
     * request => /camps_open
     */
    app.get('/camps_open', (req, res) => {
        Camp.forge({status: 'open'}).fetch({
          require: true,
          columns: ['id', 'camp_name_en']
        }).then((camp) => {
            if (camp !== null) {
                res.status(200).json({ camps: camp.toJSON() })
            } else {
                res.status(404).json({ data: { message: 'Not found' } })
            }
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });

    /**
     * API: (GET) camp join request
     * params: camp_id
     * request => /camps/2/join
     */
    app.get('/camps/:id/join', userRole.isLoggedIn(), (req, res) => {
        var user = {
          id: req.user.attributes.user_id,
          full_name: [req.user.attributes.first_name, req.user.attributes.first_name].join(', '),
          email: req.user.attributes.email,
          camp_id: req.user.attributes.camp_id
        }
        var camp = {
          id: req.params.id,
          manager_email: '' // later to be added
        };

        // User is camp free and doesn't have pending join request
        // User details will be sent to camp manager for approval
        if (req.user.isCampFree) {
          // Fetch camp manager email address
          User.forge({camp_id: camp.id})
              .fetch({
                  require: true,
                  columns: ['camp_id', 'email', 'roles']
                })
              .then((fetched_user) => {
                // Validate user is a camp_manager
                if (fetched_user.isCampManager) {
                  camp.manager_email = fetched_user.get('email')
                  // Response
                  res.json({
                      data: {
                        user: user,
                        camp: camp
                      }
                    });
                } else {
                  res.status(404).json({ data: { message: 'Couldn\'t find camp manager' } })
                }
              }).catch((e) => {
                  res.status(500).json({
                      error: true,
                      data: {
                          message: e.message
                      }
                  });
              });
        } else {
            // User cannot join another camp
            res.status(404).json({ data: { message: 'User can only join one camp!' } })
        }
    });
    app.post('/camps/join/deliver', userRole.isLoggedIn(), (req, res) => {
      var camp_manager_email = req.body['camp[manager_email]']
      var user_id = req.user.attributes.user_id

      // Mark user with request-pending
      User.forge({user_id: user_id})
          .fetch()
          .then((user) => {
            user.save({camp_id: -1}).then(function () {
              deliver()
              res.status(200).end()
          })
          .catch((e) => {
            res.status(500).json({
              error: true,
              data: {
                message: e.message
              }
            })
          })
          })

      /**
       * Deliver email request to camp manager
       * notifiying a user wants to join his camp
       * @return {boolean} should return true if mail delivered. FIXME: in mail.js
       */
      function deliver() {
        // FIXME: this function should return success value (async) and indicates to user.
        mail.send(
          camp_manager_email,
          mailConfig.from,
          'Spark: someone wants to join your camp!',
          'emails/camps/join_request', {}
        )
      }
    });

    /**
     * API: (POST) receive request and forward to mail
     * request => /camps/join/request
     */
    app.post('/camps/join/request', (req, res) => {
        res.status(200).json({error: false})
    });

    /**
     * API: (POST) create Program
     * request => /camps/program
     */
    app.post('/camps/program', (req, res) => {
        console.log(success);
        //TODO
    });

    /**
     * API: (GET) return camp members, provide camp id
     * query user with attribute: camp_id
     * request => /camps/1/members
     */
    app.get('/camps/:id/members', (req, res) => {
        User.forge({camp_id: req.params.id}).fetch({require: true}).then((users) => {
            res.status(200).json({users: users.toJSON()})
        }).catch((e) => {
            res.status(500).json({
                error: true,
                data: {
                    message: e.message
                }
            });
        });
    });

    /**
    * API: (GET) return camp manager email
    * query user with attribute: camp_id
    * request => /camps/1/camp_manager
    */
   app.get('/camps/:id/manager', (req, res) => {
     User.forge({camp_id: req.params.id})
         .fetch({
             require: true,
             columns: ['email', 'roles']
           })
         .then((user) => {
           if (user.get('roles').indexOf('camp_manager')) {
             res.status(200).json({user: {email: user.get('email')}})
           } else {
             res.status(404).json({data: {message: 'Not found'}})
           }
         }).catch((e) => {
             res.status(500).json({
                 error: true,
                 data: {
                     message: e.message
                 }
             });
         });
   })
}
