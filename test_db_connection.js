const db = require('./config/connection');

console.log("Attempting to connect to MongoDB...");
db.connect((err) => {
    if (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    } else {
        console.log("Connection successful!");
        const database = db.get();
        if (database) {
            console.log("Database object obtained successfully.");
            // Try to list collections
            database.listCollections().toArray((err, collections) => {
                if (err) console.error("Error listing collections:", err);
                else {
                    console.log("Collections:", collections.map(c => c.name));
                }
                process.exit(0);
            });
        } else {
            console.error("Database object is null.");
            process.exit(1);
        }
    }
});
