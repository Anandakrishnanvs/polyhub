let db = require("../config/connection");
var objectId = require("mongodb").ObjectID;
const collections = require("../config/collections");

module.exports = {
  addNewPhoto: (imgObj) => {
    return new Promise((resolve, reject) => {
      // console.log(formObj);
      db.get()
        .collection(collections.PHOTO_COLLECTION)
        .insertOne(imgObj)
        .then(() => {
          resolve(imgObj._id.toString());
        });
    });
  },
  getPhotosCount: async () => {
    let count = await db.get().collection(collections.PHOTO_COLLECTION).count();
    return count;
  },
  fetchAllPhotos: async () => {
    let photosList = await db
      .get()
      .collection(collections.PHOTO_COLLECTION)
      .find()
      .toArray();
    return photosList;
  },
  deletePhoto: (photoId) => {
    //delete photo from db usin the id
    return new Promise(async (resolve, reject) => {
      let deletedPhoto = await db
        .get()
        .collection(collections.PHOTO_COLLECTION)
        .find({ _id: objectId(photoId) })
        .toArray();
      if (deletedPhoto.length > 0) {
        db.get()
          .collection(collections.PHOTO_COLLECTION)
          .deleteOne({ _id: objectId(photoId) })
          .then(() => {
            resolve(deletedPhoto);
          });
      } else {
        resolve({ errorMsg: " THE PHOTO DOESN'T EXIST !!!" });
      }
    });
  },
  fetchDeptPhoto: (dept) => {
    return new Promise(async (resolve, reject) => {
      let photoObj = await db
        .get()
        .collection(collections.PHOTO_COLLECTION)
        .find({ department: dept })
        .toArray();
      if (photoObj.length > 0) resolve(photoObj);
      else resolve({ errorMsg: " THE PHOTO DOESN'T EXIST !!!" });
    });
  },
  fetchOnePhoto: (photoId) => {
    return new Promise(async (resolve, reject) => {
      let photoObj = await db
        .get()
        .collection(collections.PHOTO_COLLECTION)
        .find({ _id: objectId(photoId) })
        .toArray();
      if (photoObj.length > 0) resolve(photoObj[0]);
      else resolve({ errorMsg: " THE PHOTO DOESN'T EXIST !!!" });
    });
  },
  updateGallery: (photoObj, photoId) => {
    return new Promise(async (resolve, reject) => {
      //check for the user
      console.log("From helper", photoObj);
      let photoExist = await db
        .get()
        .collection(collections.PHOTO_COLLECTION)
        .find({ _id: objectId(photoId) })
        .toArray();
      console.log("Exist", photoExist);
      if (photoExist.length > 0) {
        db.get()
          .collection(collections.PHOTO_COLLECTION)
          .updateOne({ _id: objectId(photoId) }, { $set: photoObj })
          .then(() => {
            // console.log("From helper", photoObj);
            resolve();
          });
      } else resolve("PHOTO DOESN'T EXIST");
    });
  },
};
