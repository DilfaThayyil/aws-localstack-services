exports.handler = async (event) => {
    event.Records.forEach(record => {
        const srcBucket = record.s3.bucket.name;
        const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
        console.log(`Bucket: ${srcBucket}, Key: ${srcKey}`);
    });
    return {
        statusCode: 200,
        body: JSON.stringify('S3 event processed successfully!')
    };
};

// Compress-Archive -Path index.js -DestinationPath function.zip
// Compress-Archive -Path index.js -update -DestinationPath function.zip
// --endpoint-url=http://localhost:4566
//  rest api id = jomuyphjyy