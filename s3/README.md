# S3 Bucket with Lambda Trigger (Node.js) on LocalStack

This guide demonstrates how to set up an **S3 bucket with a Lambda trigger** using **LocalStack** and **Node.js**.  
You will create a local Lambda function that is automatically triggered when a file is uploaded to an S3 bucket.  

---

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/) or Docker Desktop  
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)  
- [awslocal CLI](https://github.com/localstack/awscli-local)  
- [Node.js](https://nodejs.org/) (v14 or higher recommended)  
- `zip` utility (to package Lambda code)  

---

## Step-by-Step Setup and Commands

### 1. Start LocalStack
Run LocalStack using Docker:
```bash
docker run -d -p 4566:4566 --name localstack localstack/localstack
```

Or start via CLI:
```bash
localstack start
```

---

### 2. Create an S3 Bucket
```bash
awslocal s3 mb s3://my-test-bucket
```

---

### 3. Create the Lambda Function Code (Node.js)

Create a file named **`index.js`** with the following content:

```javascript
exports.handler = async (event) => {
    console.log("Received S3 event: ", JSON.stringify(event, null, 2));
    return {
        statusCode: 200,
        body: JSON.stringify('S3 event processed successfully!')
    };
};
```

Optionally, to log more details (bucket and key):

```javascript
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
```

---

### 4. Package the Lambda Function
```bash
zip function.zip index.js
```

---

### 5. Create IAM Role (for Local Use)

Create a file named **`trust-policy.json`**:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": { "Service": "lambda.amazonaws.com" },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

Create the role:
```bash
awslocal iam create-role --role-name lambda-role --assume-role-policy-document file://trust-policy.json
```

---

### 6. Deploy the Lambda Function
```bash
awslocal lambda create-function --function-name s3-trigger-lambda \
  --runtime nodejs18.x \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip
```

---

### 7. Configure S3 Bucket Notification to Trigger Lambda

Create a file named **`notification.json`**:

```json
{
  "LambdaFunctionConfigurations": [
    {
      "LambdaFunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:s3-trigger-lambda",
      "Events": ["s3:ObjectCreated:*"]
    }
  ]
}
```

Apply the notification:
```bash
awslocal s3api put-bucket-notification-configuration \
  --bucket my-test-bucket \
  --notification-configuration file://notification.json
```

---

### 8. Upload a File to Trigger Lambda
```bash
echo "file contents" > testfile.txt
awslocal s3 cp testfile.txt s3://my-test-bucket/
```

---

### 9. Check Logs for Lambda Execution

List log groups:
```bash
awslocal logs describe-log-groups
```

List log streams:
```bash
awslocal logs describe-log-streams --log-group-name /aws/lambda/s3-trigger-lambda
```

Fetch log events (replace `<log-stream-name>` with the actual value):
```bash
awslocal logs get-log-events \
  --log-group-name /aws/lambda/s3-trigger-lambda \
  --log-stream-name <log-stream-name>
```

---

## Expected Outcome
- A file upload to `my-test-bucket` triggers the Lambda function.  
- The Lambda logs the event details, including the bucket name and object key, to CloudWatch Logs in LocalStack.  

---

## References
- [LocalStack Documentation](https://docs.localstack.cloud/)  
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)  
- [awslocal CLI](https://github.com/localstack/awscli-local)  
