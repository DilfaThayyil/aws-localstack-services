const { CloudWatchClient, PutMetricDataCommand } = require("@aws-sdk/client-cloudwatch");

const client = new CloudWatchClient({
    region: "us-east-1",
    endpoint: "http://localhost:4566",
    credentials: { accessKeyId: "test", secretAccessKey: "test" }
});

async function putMetric() {
    const command = new PutMetricDataCommand({
        Namespace: "DemoApp",
        MetricData: [
            {
                MetricName: "LambdaInvocations",
                Value: 1,
                Unit: "Count",
            }
        ],
    });
    await client.send(command);
    console.log("Metric data sent");
}

putMetric();
