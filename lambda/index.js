exports.handler = async (event) => {
    if (event.Records && Array.isArray(event.Records)) {
        event.Records.forEach(record => {
            const srcBucket = record.s3.bucket.name;
            const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
            console.log(`Bucket: ${srcBucket}, Key: ${srcKey}`);
        });
    } else {
        console.log("No Records in event:", event);
    }

    return {
        statusCode: 200,
        body: JSON.stringify('S3 event processed successfully!')
    };
};




// zip function.zip index.js
// aws --endpoint-url=http://localhost:4566 lambda create-function --function-name my-lambda --runtime nodejs18.x --role arn:aws:iam::000000000000:role/lambda-role --handler index.handler --zip-file fileb://function.zip
// aws--endpoint-url=http://localhost:4566 lambda invoke --function-name my-lambda output.json
// aws --endpoint-url=http://localhost:4566 iam create-role --role-name lambda-role --assume-role-policy-document file://trust-policy.json
// aws --endpoint-url=http://localhost:4566 lambda invoke --function-name my-lambda --payload file://example_event.json output.json