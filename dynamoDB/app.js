const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
    region: "us-east-1",
    endpoint: "http://localhost:4566",
    credentials: { accessKeyId: "test", secretAccessKey: "test" }
});
const docClient = DynamoDBDocumentClient.from(client);

async function createUser(userID, name, email) {
    await docClient.send(new PutCommand({
        TableName: "users",
        Item: { userID, name, email }
    }));
    console.log("User created:", { userID, name, email });
}

async function getUser(userID) {
    const res = await docClient.send(new GetCommand({
        TableName: "users",
        Key: { userID }
    }));
    console.log("User:", res.Item);
}

async function deleteUser(userID) {
    await docClient.send(new DeleteCommand({
        TableName: "users",
        Key: { userID }
    }));
    console.log("User deleted:", userID);
}

async function listUsers() {
    const res = await docClient.send(new ScanCommand({ TableName: "users" }));
    console.log("All users:", res.Items);
}

(async () => {
    await createUser("u100", "Bob", "bob@example.com");
    await getUser("u100");
    await listUsers();
    await deleteUser("u100");
})();
