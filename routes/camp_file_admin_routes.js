const userRole = require('../libs/user_role'),
express = require('express'),
router = express.Router(),
LOG = require('../libs/logger')(module),
S3 = require('../libs/aws-s3'),
config = require('config'),
awsConfig = config.get('aws_config');
// Camp = require('../models/camp').Camp

router.get('/', userRole.isLoggedIn(), userRole.isAdmin(), (req, res) => {
    req.breadcrumbs([{
        name: 'breadcrumbs.home',
        url: `/${req.params.lng}/home`
    }]);

    res.render('pages/camp_files')
});

router.post('/', userRole.isLoggedIn(), userRole.isAdmin(), async (req, res) => {
    const prefix = req.body.prefix,
        s3Client = new S3();

    try {
        let objectList = await s3Client.listBucket(awsConfig.buckets.camp_file_upload, prefix)
        return res.status(200).json({
            list: objectList
        })
    } catch (err) {
        LOG.error(err.message);
        return res.status(500).json({
            error: true,
            message: 'Error listing objects in bucket!'
        })
    }
});

router.get('/zip', userRole.isLoggedIn(), userRole.isAdmin(), (req, res) => {
    const s3Client = new S3();

    return s3Client.streamZipDataTo({
        bucket: awsConfig.buckets.camp_file_upload,
        prefix: '',
        pipe: res
    })
});

module.exports = router;
