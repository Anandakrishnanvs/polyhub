//This module is for the executing operations of staff colletion
let db = require("../config/connection");
var objectId = require("mongodb").ObjectID;
const collections = require("../config/collections");

module.exports = {
  //insert new staff
  addNewStaff: (staffData) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.STAFF_LIST)
        .insertOne(staffData)
        .then((data) => {
          resolve(staffData._id);
        });
    });
  },
  //select the list of all the staffs
  StaffLogin: (StaffData) => {
    //get the data from the db and return
        console.log(StaffData,"Dlogin")
        const { email, phone } = StaffData;
          return new Promise(async (resolve,reject) =>{
            const staff = await db
            .get()
            .collection(collections.STAFF_LIST)
            .findOne({ email, phone });
            if (staff) {
              // If staff with given mobile and username is found, resolve with the staff details
              console.log(staff,"found!")
              resolve(staff);
          } else {
              // If staff credentials are invalid or not found, reject with appropriate message
              reject('Invalid credentials');
          }
        })
  },
  selectAllStaff: () => {
    //get the data from the db and return
    return new Promise(async (resolve, reject) => {
      let StaffList = await db
        .get()
        .collection(collections.STAFF_LIST)
        .find()
        .toArray();
      resolve(StaffList);
    });
  },
  //select the data of a single staff
  selectSingleStaff: (staffId) => {
    //fetch the data of a single staff using id from the parameter and return it
    return new Promise(async (resolve, reject) => {
      let staffDetails = await db
        .get()
        .collection(collections.STAFF_LIST)
        .find({ _id: objectId(staffId) })
        .toArray();
      if (staffDetails.length > 0) resolve(staffDetails[0]);
      else resolve({ errorMsg: "No staff founded" });
    });
  },
  deleteStaff: (staffId) => {
    //delete the data of the staff from db usin the id
    return new Promise(async (resolve, reject) => {
      let deletedStaff = await db
        .get()
        .collection(collections.STAFF_LIST)
        .find({ _id: objectId(staffId) })
        .toArray();
      console.log(deletedStaff);
      if (deletedStaff.length > 0) {
        db.get()
          .collection(collections.STAFF_LIST)
          .deleteOne({ _id: objectId(staffId) })
          .then(() => {
            resolve(deletedStaff);
          });
      } else {
        resolve({ errorMsg: " TEH STAFF DOESN'T EXIST !!!" });
      }
    });
  },
  deleteUser: (userID) => {
    //delete the data of the staff from db usin the id
    return new Promise(async (resolve, reject) => {
      let deletedStaff = await db
        .get()
        .collection(collections.STAFF_LIST)
        .find({ _id: objectId(userID) })
        .toArray();
      console.log(deletedStaff);
      if (deletedStaff.length > 0) {
        db.get()
          .collection(collections.STAFF_LIST)
          .deleteOne({ _id: objectId(staffId) })
          .then(() => {
            resolve(deletedStaff);
          });
      } else {
        resolve({ errorMsg: " TEH STAFF DOESN'T EXIST !!!" });
      }
    });
  },
  updateStaff: (staffId, staffData) => {
    //update the data of the staff using staffId
    return new Promise(async (resolve, reject) => {
      //check for the user
      let staffExist = await db
        .get()
        .collection(collections.STAFF_LIST)
        .find({ _id: objectId(staffId) });
      if (staffExist) {
        db.get()
          .collection(collections.STAFF_LIST)
          .updateOne({ _id: objectId(staffId)}, { $set:staffData} )
          .then(() => {
            resolve();
          });
      } else resolve("STAFF DOESN'T EXIST");
    });
  },
  selectDepartmentStaff: (department) => {
    //fetch the details of staff from a single department
    return new Promise(async (resolve, reject) => {
      console.log(department);
      let departmentStaff = await db
        .get()
        .collection(collections.STAFF_LIST)
        .find({ department_name: department })
        .toArray();
      resolve(departmentStaff);
    });
  },
};
