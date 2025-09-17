const { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand, ListBucketsCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({
    region: "us-east-1",
    endpoint: "http://localhost:4566",
    credentials: { accessKeyId: "test", secretAccessKey: "test" },
    forcePathStyle: true
});

async function createBucket(bucketName) {
    await client.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log("Bucket created:", bucketName);
}

async function uploadObject(bucketName, key, body) {
    await client.send(new PutObjectCommand({ Bucket: bucketName, Key: key, Body: body }));
    console.log(`Object uploaded: ${key}`);
}

async function listBuckets() {
    const res = await client.send(new ListBucketsCommand({}));
    console.log("Buckets:", res.Buckets);
}

(async () => {
    await createBucket("my-test-bucket");
    await uploadObject("my-test-bucket", "hello.txt", "Hello from LocalStack!");
    await listBuckets();
})();
