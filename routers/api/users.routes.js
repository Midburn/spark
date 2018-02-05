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
    },
    {
        path: ':id',
        methods: [
            {
                get: userController.getById
            }
        ],
        middlewares: [userRole.isLoggedIn(), userRole.isAllowedToViewUser()]
    },
    {
        path: ':email',
        methods: [
            {
                get: userController.getByEmail
            }
        ],
        middlewares: [userRole.isLoggedIn()]
    },
    {
        path: ':id/join_cancel',
        methods: [
            {
                get: userController.updateCampStatus('join_cancel')
            }
        ],
        middlewares: [userRole.isLoggedIn()]
    },
    {
        path: ':id/join_approve',
        methods: [
            {
                get: userController.updateCampStatus('join_mgr')
            }
        ],
        middlewares: [userRole.isLoggedIn()]
    },
    {
        path: ':id/join_details',
        methods: [
            {
                get: userController.joinCamp
            }
        ],
        middlewares: [userRole.isLoggedIn()]
    }
];
const userRoutes = new BaseRouter('users', middlewares, routes);

module.exports = userRoutes;
