const mongoClient = require("mongodb").MongoClient;
const state = {
  db: null,
};

module.exports.connect = function (done) {
  const dbname = "polyhub_db";

  // MongoDB Atlas connection URL
  const url = process.env.MONGODB_URI || `mongodb+srv://polyhub_admin:polyhub_123@cluster0.6azsrel.mongodb.net/${dbname}?retryWrites=true&w=majority`;

  mongoClient.connect(url, (err, client) => {
    if (err) {
      console.error("❌ MongoDB connection error:", err.message);
      console.error("   Please verify your MongoDB connection string and network access");
      return done(err);
    }
    state.db = client.db(dbname);
    console.log("✅ MongoDB Connected Successfully to database:", dbname);
    done();
  });
};

module.exports.connectAsync = async function () {
  if (state.db) return state.db;
  const dbname = "polyhub_db";
  const url = process.env.MONGODB_URI || `mongodb+srv://polyhub_admin:polyhub_123@cluster0.6azsrel.mongodb.net/${dbname}?retryWrites=true&w=majority`;

  try {
    const client = await mongoClient.connect(url);
    state.db = client.db(dbname);
    console.log("✅ MongoDB Connected Successfully (Async) to database:", dbname);
    return state.db;
  } catch (err) {
    console.error("❌ MongoDB Async connection error:", err.message);
    throw err;
  }
};

module.exports.get = function () {
  if (!state.db) {
    console.error("⚠️  Database connection not established. Please check your MongoDB connection.");
  }
  return state.db;
};
