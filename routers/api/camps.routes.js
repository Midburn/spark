import * as userRole from '../../libs/user_role';
import * as userController from '../../controllers/api/users.controller';

const middlewares = [];
const routes = [
    {
        path: '',
        methods: [
            {
                get: userController.getAll
            }
        ]
    }
];
const campsRouter = new BaseRouter('camps', middlewares, routes);

module.exports = campsRouter;
