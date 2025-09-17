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
