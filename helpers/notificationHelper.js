let db = require("../config/connection");
var objectId = require("mongodb").ObjectID;
const collections = require("../config/collections");

module.exports = {
  addNewNotification: (notificationObj) => {
    return new Promise((resolve, reject) => {
      // console.log(formObj);
      db.get()
        .collection(collections.NOTIFICATION_COLLECTION)
        .insertOne(notificationObj)
        .then(() => {
          resolve();
        });
    });
  },
  fetchLatestNotification: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.NOTIFICATION_COLLECTION)
        .insertOne(notificationObj)
        .then(() => {
          resolve();
        });
      //filter the object with foreach and take only dated 3 days ago
    });
  },
  fetchAllNotifications: () => {
    return new Promise(async (resolve, reject) => {
      let notificationList = await db
        .get()
        .collection(collections.NOTIFICATION_COLLECTION)
        .find()
        .toArray();
      resolve(notificationList);
    });
  },
  fetchOneNotification: (notificationId) => {
    return new Promise(async (resolve, reject) => {
      let notification = await db
        .get()
        .collection(collections.NOTIFICATION_COLLECTION)
        .find({ _id: objectId(notificationId) })
        .toArray();
      if (notification.length > 0) resolve(notification[0]);
      else resolve({ errorMsg: "No Notification found !!!" });
    });
  },
  updateNotification: (n_Obj, n_Id) => {
    return new Promise(async (resolve, reject) => {
      let notificationExist = await db
        .get()
        .collection(collections.NOTIFICATION_COLLECTION)
        .find({ _id: objectId(n_Id) });
        console.log("from notifi-helper",n_Obj);
      if (notificationExist) {
        db.get()
          .collection(collections.NOTIFICATION_COLLECTION)
          .updateOne({ _id: objectId(n_Id) }, { $set: n_Obj })
          .then(() => {
            resolve();
          });
      } else resolve("NOTIFICATION DOESN'T EXIST !!!");
    });
  },

  deleteNotification: (n_Id) => {
    return new Promise(async (resolve, reject) => {
      let deletedNotification = await db
        .get()
        .collection(collections.NOTIFICATION_COLLECTION)
        .find({ _id: objectId(n_Id) })
        .toArray();
      if (deletedNotification.length > 0) {
        db.get()
          .collection(collections.NOTIFICATION_COLLECTION)
          .deleteOne({ _id: objectId(n_Id) })
          .then(() => {
            resolve(deletedNotification);
          });
      } else {
        resolve({ errorMsg: " THE NOTIFICATION DOESN'T EXIST !!!" });
      }
    });
  },
};
