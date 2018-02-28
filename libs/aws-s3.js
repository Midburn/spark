const AWS = require('aws-sdk'),
config = require('config'),
awsConfig = config.get('aws_config');

class s3Client {

    constructor() {
        this.s3 = new AWS.S3({region: awsConfig.defualt_region});
    }

    /**
     * Put a file buffer to S3
     * @param {the name of the object in S3} fileName
     * @param {the file buffer we would like to put} fileBuffer
     * @param {the bucket where the object should be put} bucket
     * @param {if specified, overriders the default spark region} region
     */
    uploadFileBuffer(fileName, fileBuffer, bucket, region) {
        // Check if maybe we`re not using the default region
        let s3Client = region ? _createS3ClientForNonDefaultRegion(region) : this.s3

        const params = {
            Key: fileName,
            Body: fileBuffer,
            Bucket: bucket
        }

        return s3Client.putObject(params).promise()
    }

    /**
     * Get the standard url for an object put in S3
     * @param {name of objet in S3} fileName
     * @param {name of bucket where the object was put} bucket
     * @param {if specified, overrides the default spark region} region
     */
    getObjectUrl(fileName, bucket, region = awsConfig.defualt_region) {
        return `https://s3-${region}.amazonaws.com/${bucket}/${fileName}`
    }

    /**
     * Get a presigned Url to the object, to reuse the server-side credentials.
     * @param {name of object in S3} fileName
     * @param {name of bucket where object was put} bucket
     * @param {if specified, overrides the default spark region} region
     */
    getPresignedUrl(fileName, bucket, region = awsConfig.defualt_region) {
        const presignedUrl = this.s3.getSignedUrl('getObject', {
            Bucket: bucket,
            Key: fileName,
            Expires: awsConfig.presignedUrlExpireSeconds
        })

        return presignedUrl
    }

    deleteObject(fileName, bucket, region = awsConfig.defualt_region) {
        const params = {
            Bucket: bucket,
            Key: fileName
        }
        return this.s3.deleteObject(params).promise()
    }

    listBucket(bucketName, prefix, region = awsConfig.defualt_region) {
        const params = {
            Bucket: bucketName,
            Prefix: prefix
        }
        return this.s3.listObjects(params).promise()
    }

    /**
     * This function is for the off chance
     * that we need to use a different region for some reaosn.
     * During regular use we reuse the client instance using the default region.
     * @param {alternate region} region
     */
    _createS3ClientForNonDefaultRegion (region) {
        return new AWS.S3({region: region})
    }
}

module.exports = s3Client;
