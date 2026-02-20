var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;

module.exports = {
  findAdmin: () => {
    return new Promise(async (resolve, reject) => {
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne();
      resolve(admin);
    });
  },
  doLoginUser: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Login attempt:", userData);
        const { email, password } = userData;
        const database = db.get();
        if (!database) {
          console.error("Database connection not available");
          return reject("Database connection error");
        }
        const user = await database
          .collection(collection.USER_COLLECTION)
          .findOne({ email });
        if (user && user.password === password) {
          console.log("User found:", user);
          resolve(user);
        } else {
          console.log("Invalid credentials");
          reject('Invalid credentials');
        }
      } catch (error) {
        console.error("Login error:", error);
        reject(error);
      }
    });
  },
  createAdmin: () => {
    return new Promise(async (resolve, reject) => {
      let password = await bcrypt.hash("admin", 10);
      let admin = {
        username: "admin",
        password: password,
      };
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .insertOne(admin)
        .then(() => {
          resolve();
        });
    });
  },
  createUser: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Creating user:", data);
        const database = db.get();
        if (!database) {
          console.error("Database connection not available");
          return reject("Database connection error");
        }
        const result = await database
          .collection(collection.USER_COLLECTION)
          .insertOne(data);
        data._id = result.insertedId;
        console.log("User created successfully");
        resolve(data);
      } catch (error) {
        console.error("Error creating user:", error);
        reject(error);
      }
    });
  },
  doLogin: (details) => {
    return new Promise(async (resolve, reject) => {
      // Hardcoded admin login
      if (details.username === "admin@gmail.com" && details.password === "admin@123") {
        console.log("Hardcoded admin login successful");
        resolve({ admin: { username: "admin@gmail.com" } });
        return;
      }

      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ username: details.username });
      if (admin) {
        bcrypt.compare(details.password, admin.password).then((response) => {
          if (response) {
            let data = { admin };
            resolve(data);
          } else {
            resolve({ loginErr: "Incorect Password" });
          }
        });
      } else {
        resolve({ loginErr: "Incorect Admin Id" });
      }
    });
  },
  selectAllUser: () => {
    //get the data from the db and return
    return new Promise(async (resolve, reject) => {
      let StaffList = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(StaffList);
    });
  },
};
