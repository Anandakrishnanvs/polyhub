const mongoClient = require("mongodb").MongoClient;

const url = "mongodb+srv://admin:admin123@cluster0.bar7pxq.mongodb.net/?appName=Cluster0";
const dbname = "polyhub_db";

console.log("Attempting to connect to MongoDB...");
console.log("URL:", url);

mongoClient.connect(url, (err, client) => {
    if (err) {
        console.error("❌ Connection FAILED:", err.message);
        process.exit(1);
    }
    console.log("✅ Connection SUCCESSFUL!");
    const db = client.db(dbname);
    console.log("Database selected:", dbname);
    client.close();
    process.exit(0);
});
