let db = require("../config/connection");
var objectId = require("mongodb").ObjectID;
const collections = require("../config/collections");

module.exports = {
  //add , delete , fetch all , fetch by department
  addNewMaterial: (questionObj) => {
    return new Promise((resolve, reject) => {
      console.log(questionObj);
      db.get()
        .collection(collections.STUDY_MATERIAL)
        .insertOne(questionObj)
        .then((data) => {
          resolve(questionObj._id.toString());
        });
    });
  },
  addNewQuestionPaper: (questionObj) => {
    return new Promise((resolve, reject) => {
      console.log(questionObj);
      db.get()
        .collection(collections.QUESTION_PAPERS)
        .insertOne(questionObj)
        .then((data) => {
          resolve(questionObj._id.toString());
        });
    });
  },
  getQuestionCount: async () => {
    let count = await db.get().collection(collections.QUESTION_PAPERS).count();
    return count;
  },
  getDocsCount: async () => {
    let count = await db.get().collection(collections.STUDY_MATERIAL).count();
    return count;
  },
  
  fetchAllQuestionPapers: () => {
    //get the data from the db and return
    return new Promise(async (resolve, reject) => {
      let allQuestions = await db
        .get()
        .collection(collections.QUESTION_PAPERS)
        .find()
        // .sort({ department_name: -1 })
        .toArray();
      resolve(allQuestions);
    });
  },
  fetchAllDocs: () => {
    //get the data from the db and return
    return new Promise(async (resolve, reject) => {
      let allQuestions = await db
        .get()
        .collection(collections.STUDY_MATERIAL)
        .find()
        // .sort({ department_name: -1 })
        .toArray();
      resolve(allQuestions);
    });
  },
  deleteQuestionPaper: (QuestionId) => {
    //delete the data of the staff from db usin the id
    return new Promise(async (resolve, reject) => {
      let deletedQuestion = await db
        .get()
        .collection(collections.QUESTION_PAPERS)
        .find({ _id: objectId(QuestionId) })
        .toArray();
      console.log(deletedQuestion);
      if (deletedQuestion.length > 0) {
        db.get()
          .collection(collections.QUESTION_PAPERS)
          .deleteOne({ _id: objectId(QuestionId) })
          .then(() => {
            resolve(deletedQuestion);
          });
      } else {
        resolve({ errorMsg: " THE QUESTION PAPER DOESN'T EXIST !!!" });
      }
    });
  },
  fetchDepartmentQuestions: (department) => {
    //fetch the details of staff from a single department
    return new Promise(async (resolve, reject) => {
      console.log(department);
      let departmentQuestions = await db
        .get()
        .collection(collections.QUESTION_PAPERS)
        .find({ department: department })
        .toArray();
      resolve(departmentQuestions);
    });
  },
  fecthMaterial: (department) => {
    //fetch the details of staff from a single department
    return new Promise(async (resolve, reject) => {
      console.log(department);
      let satudyMateral  = await db
        .get()
        .collection(collections.STUDY_MATERIAL)
        .find({ department: department })
        .toArray();
      resolve(satudyMateral);
    });
  },
  fecthSingleMaterial: (subject) => {
    //fetch the details of staff from a single department
    return new Promise(async (resolve, reject) => {
      console.log(subject);
      let searchResult  = await db
        .get()
        .collection(collections.STUDY_MATERIAL)
        .find({ subject: subject })
        .toArray();
      resolve(searchResult);
    });
  },
  fetchOneQuestionPaper: (q_id) => {
    return new Promise(async (resolve, reject) => {
      let qObj = await db
        .get()
        .collection(collections.QUESTION_PAPERS)
        .find({ _id: objectId(q_id) })
        .toArray();
      if (qObj.length > 0) resolve(qObj[0]);
      else resolve({ errorMsg: " THE QUESTION PAPER DOESN'T EXIST !!!" });
    });
  },
  upadateQuestion: (qObj, qId) => {
    return new Promise(async (resolve, reject) => {
      //check for the user
      console.log("From helper", qObj);
      let questionExist = await db
        .get()
        .collection(collections.QUESTION_PAPERS)
        .find({ _id: objectId(qId) })
        .toArray();
      // console.log("Exist", questionExist);
      if (questionExist.length > 0) {
        db.get()
          .collection(collections.QUESTION_PAPERS)
          .updateOne({ _id: objectId(qId) }, { $set: qObj })
          .then(() => {
            // console.log("From helper", photoObj);
            resolve();
          });
      } else resolve("QUSTIONPAPER DOESN'T EXIST");
    });
  },
};
