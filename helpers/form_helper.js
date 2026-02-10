let db = require("../config/connection");
var objectId = require("mongodb").ObjectID;
const collections = require("../config/collections");

module.exports = {
  addNewForm: (formObj) => {
    return new Promise((resolve, reject) => {
      // console.log(formObj);
      db.get()
        .collection(collections.FORM_COLLECTIONS)
        .insertOne(formObj)
        .then(() => {
          resolve(formObj._id.toString());
        });
    });
  },
  getFormsCount: async () => {
    let count = await db.get().collection(collections.FORM_COLLECTIONS).count();
    return count;
  },
  fetchAllForms: () => {
    return new Promise(async (resolve, reject) => {
      let formList = await db
        .get()
        .collection(collections.FORM_COLLECTIONS)
        .find()
        .toArray();
      resolve(formList);
    });
  },
  deleteForm: (formId) => {
    //delete the data of the staff from db usin the id
    return new Promise(async (resolve, reject) => {
      let deletedForm = await db
        .get()
        .collection(collections.FORM_COLLECTIONS)
        .find({ _id: objectId(formId) })
        .toArray();
      // console.log(deletedForm);
      if (deletedForm.length > 0) {
        db.get()
          .collection(collections.FORM_COLLECTIONS)
          .deleteOne({ _id: objectId(formId) })
          .then(() => {
            resolve(deletedForm);
          });
      } else {
        resolve({ errorMsg: " THE QUESTION PAPER DOESN'T EXIST !!!" });
      }
    });
  },
  deleteDocs: (docID) => {
    //delete the data of the staff from db usin the id
    return new Promise(async (resolve, reject) => {
      let deletedForm = await db
        .get()
        .collection(collections.STUDY_MATERIAL)
        .find({ _id: objectId(docID) })
        .toArray();
      // console.log(deletedForm);
      if (deletedForm.length > 0) {
        db.get()
          .collection(collections.STUDY_MATERIAL)
          .deleteOne({ _id: objectId(docID) })
          .then(() => {
            resolve(deletedForm);
          });
      } else {
        resolve({ errorMsg: " THE QUESTION PAPER DOESN'T EXIST !!!" });
      }
    });
  },
  fetchOneForm: (formId) => {
    return new Promise(async (resolve, reject) => {
      let formData = await db
        .get()
        .collection(collections.FORM_COLLECTIONS)
        .find({ _id: objectId(formId) })
        .toArray();
      if (formData.length > 0) resolve(formData[0]);
      else resolve({ errorMsg: "No Form founded" });
    });
  },
  fetchOneDocs: (docId) => {
    return new Promise(async (resolve, reject) => {
      let formData = await db
        .get()
        .collection(collections.STUDY_MATERIAL)
        .find({ _id: objectId(docId) })
        .toArray();
      if (formData.length > 0) resolve(formData[0]);
      else resolve({ errorMsg: "No Form founded" });
    });
  },
  updateForm: (formObj, formId) => {
    return new Promise(async (resolve, reject) => {
      //check for the user
      let formExist = await db
        .get()
        .collection(collections.FORM_COLLECTIONS)
        .find({ _id: objectId(formId) });
      if (formExist) {
        db.get()
          .collection(collections.FORM_COLLECTIONS)
          .updateOne({ _id: objectId(formId) }, { $set: formObj })
          .then(() => {
            resolve();
          });
      } else resolve("Form DOESN'T EXIST");
    });
  },
  updateDocs: (formObj, formId) => {
    return new Promise(async (resolve, reject) => {
      //check for the user
      let formExist = await db
        .get()
        .collection(collections.STUDY_MATERIAL)
        .find({ _id: objectId(formId) });
      if (formExist) {
        db.get()
          .collection(collections.STUDY_MATERIAL)
          .updateOne({ _id: objectId(formId) }, { $set: formObj })
          .then(() => {
            resolve();
          });
      } else resolve("Form DOESN'T EXIST");
    });
  },
  
};

