const AWS = require('aws-sdk'),
config = require('config'),
awsConfig = config.get('aws_config');

const credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.credentials = credentials;
const s3 = new AWS.S3({region: awsConfig.defaultRegion});

// TODO: get secret key and access and configure!

exports.uploadFileBuffer = (fileName, fileBuffer, bucket, region) => {
    // Check if maybe we`re not using the default region
    let s3Client = region ? createS3ClientForNonDefaultRegion(region) : s3;

    const params = {
        Key: fileName,
        Body: fileBuffer,
        Bucket: bucket
    };

    return s3Client.putObject(params).promise();
}

exports.getObjectUrl = (fileName, bucket, region) => {
    if (!region) region = awsConfig.defaultRegion;

    return `https://s3-${region}.amazonaws.com/${bucket}/${fileName}`;
}

/**
 * This function is for the off chance
 * that we need to use a different region for some reaosn.
 * During regular use we reuse the const created at the top using the default region.
 * @param {*} region
 */
const createS3ClientForNonDefaultRegion = (region) => {
    return new AWS.S3({region: region});
}
