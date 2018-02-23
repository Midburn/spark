class UsersController {

    constructor() {
        /**
         * Keep `this` reference
         */
        this.getUserById = this.getUserById.bind(this);
    }
    getUserById(req, res, next) {
        User.forge({ user_id: req.params.id }).fetch({ columns: '*' }).then((user) => {
            if (user !== null) {
                res.json({ name: user.get('name'), email: user.get('email'), cell_phone: user.get('cell_phone') })
            } else {
                res.status(404).json({ message: 'Not found' })
            }
        }).catch((err) => {
            /**
             * Pass the error to be handled by the generic error handler
             */
            next(err);
        });
    };

}

/**
 * Export singleton
 * @type {UsersController}
 */
module.exports = new UsersController();
