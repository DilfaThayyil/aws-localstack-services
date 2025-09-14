# DynamoDB Service on LocalStack: Setup & Usage

## Overview

LocalStack provides a fully functional local emulation of **AWS DynamoDB**.
It allows creating tables and performing **CRUD operations** using either the AWS CLI or programmatic access via AWS SDKs.
This project serves as a **learning reference** for working with DynamoDB locally before deploying to AWS.

---

## Prerequisites

* [Docker](https://docs.docker.com/get-docker/) installed and running
* LocalStack container running locally
* [AWS CLI](https://aws.amazon.com/cli/) installed, with `awslocal` wrapper configured
* (Optional) [Node.js](https://nodejs.org/) environment for SDK usage

---

## Starting LocalStack

### With Docker

```bash
docker run -d -p 4566:4566 --name localstack localstack/localstack
```

### With LocalStack CLI

```bash
localstack start
```

---

## DynamoDB with AWS CLI (`awslocal`)

### Create a Table

```bash
awslocal dynamodb create-table \
  --table-name users \
  --attribute-definitions AttributeName=userID,AttributeType=S \
  --key-schema AttributeName=userID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### Insert an Item (Create)

```bash
awslocal dynamodb put-item \
  --table-name users \
  --item '{"userID": {"S": "u001"}, "name": {"S": "Alice"}, "email": {"S": "alice@example.com"}}'
```

### Query an Item (Read)

```bash
awslocal dynamodb get-item \
  --table-name users \
  --key '{"userID": {"S": "u001"}}'
```

### Update an Item

```bash
awslocal dynamodb update-item \
  --table-name users \
  --key '{"userID": {"S": "u001"}}' \
  --update-expression "SET email = :e" \
  --expression-attribute-values '{":e": {"S": "alice@newdomain.com"}}'
```

### Delete an Item

```bash
awslocal dynamodb delete-item \
  --table-name users \
  --key '{"userID": {"S": "u001"}}'
```

### List All Items (Scan)

```bash
awslocal dynamodb scan --table-name users
```

---

## Node.js SDK Example

An example Node.js app is available under [`examples/app.js`](./examples/app.js).
It demonstrates how to perform **CRUD operations** using the **AWS SDK v3** with LocalStack.

Run the example:

```bash
cd examples
npm init -y
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
node app.js
```

---

## Insights

* **CLI (`awslocal`)** is excellent for quick setups, demos, and administrative tasks.
* **Node.js SDK** is preferred for real-world applications requiring backend logic.
* Both approaches use the same underlying LocalStack DynamoDB service, enabling **consistent local development and testing** before deployment to AWS.

---

## Summary Table

| Method      | Use Case                        | Pros                        | Cons                       |
| ----------- | ------------------------------- | --------------------------- | -------------------------- |
| **AWS CLI** | Quick tests, demos, admin tasks | Simple, fast, no coding     | Limited automation/logic   |
| **Node.js** | Backend integration, automation | Realistic, flexible, robust | Requires programming setup |