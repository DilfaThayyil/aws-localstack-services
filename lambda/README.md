Here’s a clean, professional **README.md** version of what you wrote. You can copy–paste it directly into your projec
# 🚀 AWS Lambda Integration with LocalStack

This project demonstrates how to **deploy and invoke an AWS Lambda function locally using LocalStack**.
It covers:

* Creating a Lambda function
* Packaging the code
* Deploying it to LocalStack
* Invoking it via AWS CLI and Node.js SDK

---

## 📦 Prerequisites

Ensure the following are installed and running on your system:

* [Docker](https://docs.docker.com/get-docker/)
* [LocalStack](https://docs.localstack.cloud/) (via Docker or CLI)
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [Node.js](https://nodejs.org/) (for Lambda code and optional SDK invocation)

---

## ⚙️ Setup

### **1. Start LocalStack**

Run LocalStack in Docker:

```bash
docker run -d -p 4566:4566 --name localstack localstack/localstack
```

Or start via CLI:

```bash
localstack start
```

---

### **2. Create IAM Role for Lambda**

Create a file `trust-policy.json` with:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
```

Run:

```bash
aws --endpoint-url=http://localhost:4566 iam create-role \
  --role-name lambda-role \
  --assume-role-policy-document file://trust-policy.json
```

---

### **3. Create Lambda Function Code**

Create `index.js`:

```javascript
exports.handler = async (event) => {
  console.log("Lambda invoked with event:", JSON.stringify(event, null, 2));
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from LocalStack Lambda!" }),
  };
};
```

Package function:

```bash
zip function.zip index.js
```

---

### **4. Deploy Lambda Function**

```bash
aws --endpoint-url=http://localhost:4566 lambda create-function \
  --function-name my-lambda \
  --runtime nodejs18.x \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip
```

---

### **5. Invoke Lambda Function**

#### **Option 1: Using AWS CLI**

```bash
aws --endpoint-url=http://localhost:4566 lambda invoke \
  --function-name my-lambda \
  --payload '{ "Records":[{ "eventID":"1","eventName":"ObjectCreated:Put","s3":{"bucket":{"name":"my-test-bucket"},"object":{"key":"testfile.txt"}}}]}' \
  --cli-binary-format raw-in-base64-out output.json
```

View output:

```bash
cat output.json
```

---

#### **Option 2: Using Node.js SDK**

Install Lambda SDK:

```bash
npm install @aws-sdk/client-lambda
```

Create `invoke_lambda.js`:

```javascript
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const client = new LambdaClient({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" }
});

async function invokeLambda() {
  const command = new InvokeCommand({
    FunctionName: "my-lambda",
    Payload: Buffer.from(JSON.stringify({ key: "value" }))
  });
  const response = await client.send(command);
  const responsePayload = Buffer.from(response.Payload).toString();
  console.log("Lambda response:", responsePayload);
}

invokeLambda();
```

Run:

```bash
node invoke_lambda.js
```

---

## 🛠️ Troubleshooting

* Ensure LocalStack is running and accessible at **port 4566**
* Use `--cli-binary-format raw-in-base64-out` for Lambda payloads with AWS CLI
* Verify that the role ARN matches the IAM role created
* In PowerShell, wrap JSON payloads in **single quotes** to avoid escaping errors

---

## 📚 References

* [LocalStack AWS Lambda Docs](https://docs.localstack.cloud/user-guide/aws/lambda/)
* [AWS Lambda Node.js Handler](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html)
* [AWS CLI Lambda Invoke](https://docs.aws.amazon.com/cli/latest/reference/lambda/invoke.html)
