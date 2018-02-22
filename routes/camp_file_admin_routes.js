const userRole = require('../libs/user_role'),
express = require('express'),
router = express.Router()
// Camp = require('../models/camp').Camp

router.get('/', userRole.isLoggedIn(), userRole.isAdmin(), (req, res) => {
    req.breadcrumbs([{
        name: 'breadcrumbs.home',
        url: `/${req.params.lng}/home`
    }])

    res.render('pages/camp_files')
})

module.exports = router
