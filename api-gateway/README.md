# API Gateway + Lambda Integration (Node.js) on LocalStack

This guide demonstrates how to expose a **REST endpoint via API Gateway** that triggers a **Lambda function** written in Node.js.  
All resources are created and managed locally using **LocalStack**.

---

## Objective
- Deploy a Lambda function locally  
- Create an API Gateway REST API  
- Integrate the API with the Lambda function (proxy integration)  
- Invoke the endpoint to return a JSON response  

---

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/) or Docker Desktop  
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)  
- [awslocal CLI](https://github.com/localstack/awscli-local)  
- [Node.js](https://nodejs.org/) (v14 or higher recommended)  
- `zip` utility (to package Lambda code)  

---

## Step-by-Step Setup

### 1. Start LocalStack
Run LocalStack using Docker:
```bash
docker run -d -p 4566:4566 --name localstack localstack/localstack
````

Or start via CLI:

```bash
localstack start
```

---

### 2. Create Lambda Function Code (Node.js)

Create a file named **`lambda.js`**:

```javascript
exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello from Lambda via API Gateway!' }),
        headers: { "Content-Type": "application/json" }
    };
};
```

Zip the file:

```bash
zip function.zip lambda.js
```

---

### 3. Create IAM Role for Lambda

Create a file **`trust-policy.json`**:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
```

Create the role:

```bash
awslocal iam create-role --role-name lambda-role --assume-role-policy-document file://trust-policy.json
```

---

### 4. Deploy Lambda Function

```bash
awslocal lambda create-function --function-name apigw-lambda \
  --runtime nodejs18.x \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --handler lambda.handler \
  --zip-file fileb://function.zip
```

---

### 5. Create REST API in API Gateway

```bash
awslocal apigateway create-rest-api --name 'demo-api'
```

Copy the returned **API ID** (e.g., `abcd1234`).

---

### 6. Get the Root Resource ID

```bash
awslocal apigateway get-resources --rest-api-id <api-id>
```

Copy the **resource ID** of the root path `/` (e.g., `root1234`).

---

### 7. Create a Resource and Method

Create a resource `/hello`:

```bash
awslocal apigateway create-resource --rest-api-id <api-id> --parent-id <root-id> --path-part hello
```

Copy the returned **resource ID** (e.g., `resource5678`).

Create a `GET` method:

```bash
awslocal apigateway put-method --rest-api-id <api-id> --resource-id <resource-id> \
  --http-method GET --authorization-type "NONE"
```

---

### 8. Integrate GET Method with Lambda (Proxy Integration)

```bash
awslocal apigateway put-integration --rest-api-id <api-id> --resource-id <resource-id> \
  --http-method GET --integration-http-method POST --type AWS_PROXY \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:apigw-lambda/invocations
```

---

### 9. Grant Permission for API Gateway to Invoke Lambda

```bash
awslocal lambda add-permission --function-name apigw-lambda \
  --statement-id apigateway-test-permission \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn arn:aws:execute-api:us-east-1:000000000000:<api-id>/*/GET/hello
```

---

### 10. Deploy the API

```bash
awslocal apigateway create-deployment --rest-api-id <api-id> --stage-name test
```

---

### 11. Invoke the Endpoint

Construct the URL:

```
http://localhost:4566/restapis/<api-id>/test/_user_request_/hello
```

Test with curl:

```bash
curl http://localhost:4566/restapis/<api-id>/test/_user_request_/hello
```

Expected response:

```json
{ "message": "Hello from Lambda via API Gateway!" }
```

---

## Insights

* This setup mirrors a **real-world microservices deployment** where API Gateway serves as the HTTP frontend and Lambda functions as the backend.
* LocalStack reliably emulates **resource provisioning** and **event propagation** between API Gateway and Lambda.
* Logs and function outputs can be monitored via CloudWatch log groups (see S3 + Lambda example for log commands).

---

## References

* [LocalStack Documentation](https://docs.localstack.cloud/)
* [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
* [awslocal CLI](https://github.com/localstack/awscli-local)