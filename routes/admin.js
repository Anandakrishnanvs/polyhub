const { Router } = require("express");
let express = require("express");
let router = express.Router();

//db helpers
let staffHelper = require("../helpers/staff_helpers");
let questionHelper = require("../helpers/questionPaper_helpers");
let formHelper = require("../helpers/form_helper");
let photosHelper = require("../helpers/photoGallery_helper");
let notificationHelper = require("../helpers/notificationHelper");
let adminHelpers = require("../helpers/admin-helper");

//middlewares
router.all("*", function (req, res, next) {
  req.app.locals.layout = "layouts/admin-layout"; // set your layout here
  next(); // pass control to the next handler
});
//middleware for checking whether user is logged in
const verifyLogin = (req, res, next) => {
  if (req.session.admin|| req.session.staff) {
    next();
  } else {
    return res.redirect("/admin/login");
  }
};

router.get('/departmentLogin',(req,res)=>{
  console.log("its here")
  res.render('admin/departmentLogin',{ layout: false })
})

router.post('/Dlogin', async(req,res)=>{
    try {
     let email = req.body.email;
     let phone = req.body.phone;
     let StaffData   = {
      email,
      phone
     }
        let staff = await  staffHelper.StaffLogin(StaffData)
        console.log(staff,"admin.js")
        req.session.staff = staff;
      res.redirect("/admin/staffHome");
    } catch (error) {
        console.log(error)
    }
})

router.get("/login", async (req, res, next) => {
  try {
    let admin = await adminHelpers.findAdmin();
    if (admin) {
      res.render("admin/login", { layout: false });
    } else {
      adminHelpers.createAdmin().then(() => {
        res.render("admin/login", { layout: false });
      });
    }
  } catch (error) {
    res.redirect('/error/503')
  }
});

router.post("/login", (req, res, next) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.loginErr) {
      res.redirect("/admin/login");
    } else {
      req.session.admin = response.admin;
      res.redirect("/admin");
    }
  });
});

router.get('/staffHome',async(req,res)=>{
  try {
    let questions = await questionHelper.getQuestionCount();
    let forms = await formHelper.getFormsCount();
    let photos = await photosHelper.getPhotosCount();
    let staffList = await staffHelper.selectAllStaff();
    let {staff} = req.session;
    // console.log(staffList);
    res.render("admin/admin", {
      staffPartials: true,
      staff,
      counts: { questions, forms, photos, staffList,staffLogin:true },
    });
  } catch (error) {
    res.redirect('/error/503')
  }
})
router.get("/logout", (req, res) => {
  req.session.admin = null;
  req.secure.staff = null;
  res.redirect("/admin");
});

router.use(verifyLogin);

router.get("/", async function (req, res, next) {
  try {
    let questions = await questionHelper.getQuestionCount();
    let forms = await formHelper.getFormsCount();
    let photos = await photosHelper.getPhotosCount();
    let staffList = await staffHelper.selectAllStaff();
    let doscList = await questionHelper.getDocsCount();
    console.log(doscList,"docs list")
    // console.log(staffList);
    if(req.session.staff){
      res.render("admin/admin", {
        staffPartials: true,
        counts: { questions, forms, photos, staffList,doscList },
      });
    }else{
      res.render("admin/admin", {
        partials: true,
        counts: { questions, forms, photos, staffList,doscList },
      });
    }
   
  } catch (error) {
    res.redirect('/error/503')
  }
});

//staff routes----------------------------------------------------------------------------

//question papers--------------------------------------------------------
router.get("/question-papers", async (req, res, next) => {
  try {
    if(req.session.staff){
      let   staffPartials = true
    }else{
      staffPartials =  false
    }
    let QuestionsList = await questionHelper.fetchAllQuestionPapers();
  if(req.session.staff){
    res.render("admin/view-all-questions", {
      QuestionsList: QuestionsList,
      staffPartials:true
    });
  }else{
    res.render("admin/view-all-questions", {
      QuestionsList: QuestionsList,
    });
  }
     // console.log(staffList);

  } catch (error) {
    console.log(error)
    res.redirect('/error/503')
  }
});
router.get("/docs", async (req, res, next) => {
  try {
    if(req.session.staff){
      let   staffPartials = true
    }else{
      staffPartials =  false
    }
    let docsList = await questionHelper.fetchAllDocs()
    console.log(docsList)
  if(req.session.staff){
    res.render("admin/view-all-questions", {
      docsList: docsList,
      staffPartials:true
    });
  }else{
    res.render("admin/view-all-docs", {
      docsList: docsList,
    });
  }
     // console.log(staffList);

  } catch (error) {
    console.log(error)
    res.redirect('/error/503')
  }
});
router.get("/add-new-questionpaper", (req, res, next) => {
  if(req.session.staff){
    var {staff} = req.session;
    console.log(staff)
    res.render("admin/add-question-paper",{staff});
  }else{
    res.render("admin/add-question-paper");
  }
    
  res.render("admin/add-question-paper");
});
router.get("/add-new-material", (req, res, next) => {
  if(req.session.staff){
    var {staff} = req.session;
    console.log(staff)
    res.render("admin/add-new-Materials",{staff});
  }else{
    res.render("admin/add-new-Materials");
  }
});



router.post("/add-new-studyMaterials", (req, res, next) => {
  questionHelper.addNewMaterial(req.body).then((docId) => {
    console.log(docId);
    let docFromClient = req.files.qustionP;
    let uploadPath = "./public/docs/" + docId + ".pdf";
    docFromClient.mv(uploadPath, (err, done) => {
      if (!err) res.redirect("/admin/");
      else {
        res.status(400);
        res.redirect("/admin/add-new-material");
      }
    });
  });
});

router.post("/add-new-questionpaper", (req, res, next) => {
  questionHelper.addNewQuestionPaper(req.body).then((docId) => {
    console.log(docId);
    let docFromClient = req.files.qustionP;
    let uploadPath = "./public/questions/" + docId + ".pdf";
    docFromClient.mv(uploadPath, (err, done) => {
      if (!err) res.redirect("/admin/question-papers");
      else {
        res.status(400);
        res.redirect("/admin/add-new-questionpaper");
      }
    });
  });
});
router.get("/delete-questionpaper/:id", (req, res, next) => {
  let q_id = req.params.id;
  questionHelper.deleteQuestionPaper(q_id).then((deletedQuestion) => {
    if (deletedQuestion.errorMsg) {
      res.redirect("/admin/question-papers");
    } else {
      res.redirect("/admin/question-papers");
    }
  });
});
router.get("/edit-questionpaper/:id", async (req, res, next) => {
  let q_id = req.params.id;
  try {
    let q_obj = await questionHelper.fetchOneQuestionPaper(q_id);

    if (q_obj.errorMsg) {remove-user
      res.status(404);
      res.redirect("/admin/question-papers");
    } else
      res.render("admin/edit-questionPaper", {
        questionpaperObj: q_obj,
      });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.post("/edit-questionpaper", (req, res, next) => {
  let q_obj = req.body;
  let q_id = req.body._id;
  delete req.body._id;
  q_obj.dateAdded = new Date().toLocaleDateString();
  questionHelper.upadateQuestion(q_obj, q_id).then((err) => {
    if (err) console.log(err);
    else {
      if (req.files) {
        let docFromClient = req.files.questionP;
        let uploadPath = "./public/questions/" + q_id + ".pdf";
        docFromClient.mv(uploadPath, (err, done) => {
          if (!err) {
            res.status(200);
            res.redirect("/admin/question-papers");
          } else {
            res.status(400);
            res.redirect("/admin/edit-form-page");
          }
        });
      } else res.redirect("/admin/question-papers");
    }
  });
});
// router.get("/fetch-department-questions/:department", (req, res, next) => {
//   questionHelper
//     .fetchDepartmentQuestions(req.params.department)
//     .then((data) => {
//       res.json(data);
//     });
// });

//forms---------------------------------------------------------------------------------

router.get("/forms", async (req, res, next) => {
  try {
    let formsObj = await formHelper.fetchAllForms();
    // console.log(formsObj);
    if(req.session.staff){
      res.render("admin/view-all-forms", {
        formsList: formsObj,
        staffPartials:true
      });
    }else{
      res.render("admin/view-all-forms", {
        formsList: formsObj,
      });
    }
   
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/add-new-form", (req, res, next) => {
  res.render("admin/add-new-form");
});
router.post("/add-new-form",  (req, res, next) => {
  let formObj = req.body;
  formObj.dateAdded = new Date().toLocaleDateString();
  formHelper.addNewForm(formObj).then((formId) => {
    // console.log(formId);
    let docFromClient = req.files.newForm;
    let uploadPath = "./public/forms/" + formId + ".pdf";
    docFromClient.mv(uploadPath, (err, done) => {
      if (!err) {
        res.status(200);
        res.redirect("/admin/forms");
      } else {
        res.status(400);
        res.redirect("/admin/add-new-form");
      }
    });
  });
});
router.get('/delete-docs/:id',(req,res)=>{
      let {id} = req.params;
      formHelper.deleteDocs(id).then((deleteForm)=>{
        if (deleteForm.errorMsg) {
          res.redirect("/admin/docs");
        } else {
          console.log("successfully deleted");
          res.redirect("/admin/docs");
        }
      })
})
router.get("/edit-docs/:id", async (req, res, next) => {
  try {
    let docid = req.params.id;
    let formData = await formHelper.fetchOneDocs(docid);
    if (formData.errorMsg) {
      res.status(404);
      res.redirect("/admin/forms");
    } else
      res.render("admin/edit-docs", {
        formObj: formData,
      });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/delete-form/:id", (req, res, next) => {
  let f_id = req.params.id;
  formHelper.deleteForm(f_id).then((deletedForm) => {
    if (deletedForm.errorMsg) {
      res.redirect("/admin/forms");
    } else {
      console.log("successfully deleted");
      res.redirect("/admin/forms");
    }
  });
});
router.get("/edit-form-page/:id", async (req, res, next) => {
  try {
    let formId = req.params.id;
    let formData = await formHelper.fetchOneForm(formId);
    if (formData.errorMsg) {
      res.status(404);
      res.redirect("/admin/forms");
    } else
      res.render("admin/edit-form", {
        formObj: formData,
      });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.post("/edit-docs-page", (req, res, next) => {
  console.log(req.body);
  console.log(req.files);
  let formObj = req.body;
  let formId = req.body._id;
  delete req.body._id;
  formObj.dateAdded = new Date().toLocaleDateString();
  formHelper.updateDocs(formObj, formId).then((err) => {
    if (err) console.log(err);
    else {
      if (req.files) {
        let docFromClient = req.files.newForm;
        let uploadPath = "./public/docs/" + formId + ".pdf";
        docFromClient.mv(uploadPath, (err, done) => {
          if (!err) {
            res.status(200);
            res.redirect("/admin/docs");
          } else {
            res.status(400);
            res.redirect("/admin/docs");
          }
        });
      } else res.redirect("/admin/forms");
    }
  });
});
router.post("/edit-form-page", (req, res, next) => {
  // console.log(req.body);
  // console.log(req.files);
  let formObj = req.body;
  let formId = req.body._id;
  delete req.body._id;
  formObj.dateAdded = new Date().toLocaleDateString();
  formHelper.updateForm(formObj, formId).then((err) => {
    if (err) console.log(err);
    else {
      if (req.files) {
        let docFromClient = req.files.newForm;
        let uploadPath = "./public/forms/" + formId + ".pdf";
        docFromClient.mv(uploadPath, (err, done) => {
          if (!err) {
            res.status(200);
            res.redirect("/admin/forms");
          } else {
            res.status(400);
            res.redirect("/admin/edit-form-page");
          }
        });
      } else res.redirect("/admin/forms");
    }
  });
});

//gallery----------------------------------------------------------------------------------

router.get("/photo-gallery", async (req, res, next) => {
  //to render the gallery page
  try {
    let photos = await photosHelper.fetchAllPhotos();
    if(req.session.staff){
      res.render("admin/view-all-photos", {
        photoList: photos,
        staffPartials :true
      });
    }else{
      res.render("admin/view-all-photos", {
        photoList: photos,

      });
    }
  
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/add-to-gallery", (req, res, next) => {
  //to render the photo adding form
  res.render("admin/add-new-photogallery");
});
router.post("/add-to-gallery", (req, res, next) => {
  //to save data from form and send response
  let imgObj = req.body;
  imgObj.dateAdded = new Date().toLocaleDateString();
  photosHelper.addNewPhoto(imgObj).then((imgId) => {
    let docFromClient = req.files.image;
    let uploadPath = "./public/img/gallery/" + imgId + ".jpg";
    docFromClient.mv(uploadPath, (err, done) => {
      if (!err) {
        res.status(200).redirect("/admin/photo-gallery");
      } else {
        res.status(400).redirect("/admin/add-to-gallery");
      }
    });
  });
});
router.get("/delete-photo/:id", (req, res, next) => {
  let p_id = req.params.id;
  photosHelper.deletePhoto(p_id).then((delPhoto) => {
    if (delPhoto.errorMsg) {
      res.status(400).redirect("/admin/photo-gallery");
    } else {
      console.log("successfully deleted");
      res.redirect("/admin/photo-gallery");
    }
  });
});
router.get("/edit-gallery-photo/:id", async (req, res, next) => {
  try {
    let photoId = req.params.id;
    let photoObj = await photosHelper.fetchOnePhoto(photoId);
    if (photoObj.errorMsg) {
      res.status(404);
      res.redirect("/admin/photo-gallery");
    } else
      res.render("admin/edit-photo", {
        photoObj: photoObj,
      });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.post("/edit-gallery-photo", (req, res, next) => {
  let photoObj = req.body;
  let photoId = req.body._id;
  delete req.body._id;
  photoObj.dateAdded = new Date().toLocaleDateString();
  photosHelper.updateGallery(photoObj, photoId).then((err) => {
    if (err) console.log(err);
    else {
      if (req.files) {
        let docFromClient = req.files.image;
        let uploadPath = "./public/img/gallery/" + photoId + ".jpg";
        docFromClient.mv(uploadPath, (err, done) => {
          if (!err) {
            res.status(200);
            res.redirect("/admin/photo-gallery");
          } else {
            res.status(400);
            res.redirect("/admin/edit-gallery-photo");
          }
        });
      } else res.redirect("/admin/photo-gallery");
    }
  });
});

//notifications----------------------------------------------------------------------
router.get("/notifications", async (req, res, next) => {
  try {
    //to render the gallery page
    let notifications = await notificationHelper.fetchAllNotifications();
   if(req.session.staff){
    res.render("admin/view-all-notifications", {
      notificationList: notifications,
      staffPartials :true
    });
   }else{
    res.render("admin/view-all-notifications", {
      notificationList: notifications,
    });
   }
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/add-new-notification", (req, res, next) => {
  //to render the notification adding form
  res.render("admin/add-new-notification");
});
router.post("/add-new-notification", (req, res, next) => {
  //to save data from body and send response
  let notificationObj = req.body;
  notificationObj.dateUpdated = new Date().toLocaleDateString();
  notificationHelper.addNewNotification(notificationObj).then(() => {
    res.redirect("/admin/notifications");
  });
});
router.get("/edit-notification/:id", async (req, res, next) => {
  try {
    let n_Id = req.params.id;
    let n_Obj = await notificationHelper.fetchOneNotification(n_Id);
    if (n_Obj.errorMsg) {
      res.status(404);
      res.redirect("/admin/notifications");
    } else
      res.render("admin/edit-notification", {
        notificationObj: n_Obj,
      });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.post("/edit-notification", (req, res, next) => {
  let n_Obj = req.body;
  let n_Id = req.body._id;
  delete req.body._id;
  n_Obj.dateUpdated = new Date().toLocaleDateString();
  notificationHelper.updateNotification(n_Obj, n_Id).then((err) => {
    if (err) console.log(err);
    else res.redirect("/admin/notifications");
  });
});
router.get("/delete-notification/:id", (req, res, next) => {
  let n_Id = req.params.id;
  notificationHelper.deleteNotification(n_Id).then((delNotification) => {
    if (delNotification.errorMsg) {
      res.redirect("/admin/notifications");
    } else {
      console.log("successfully deleted");
      res.redirect("/admin/notifications");
    }
  });
});

// Get the details of all the staff numbers---------------------------------------------------
router.get("/staff-list", async (req, res, next) => {
  try {
    //get data from the database and send it
    let staffList = await staffHelper.selectAllStaff();
    res.render("admin/view-all-staffs", { staffList });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/user-list", async (req, res, next) => {
  try {
    //get data from the database and send it
    let userList = await adminHelpers.selectAllUser();
    console.log(userList,"staffs90909099090")
     res.render("admin/view-all-user", { userList });
  } catch (error) {
    res.redirect('/error/503')
  }
});

router.get("/add-new-staff", async (req, res, next) => {
  res.render("admin/add-new-staffs");
});
router.post("/add-new-staff", async (req, res, next) => {
  staffHelper.addNewStaff(req.body).then((imgId) => {
    let docFromClient = req.files.image;
    let uploadPath = "./public/img/staff/" + imgId + ".jpg";
    docFromClient.mv(uploadPath, (err, done) => {
      if (!err) {
        res.status(200).redirect("/admin/staff-list");
      } else {
        res.status(400).redirect("/admin/add-new-staff");
      }
    });
  });
});
router.get("/edit-staff/:id", async (req, res, next) => {
  try {
    let staffId = req.params.id;
    let staffDetails = await staffHelper.selectSingleStaff(staffId);
    console.log(staffDetails);
    if (staffDetails.errorMsg) {
      res.status(404).redirect("/admin/staff-list");
    } else res.render("admin/edit-staff", { staffDetails });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/remove-staff/:id", async (req, res, next) => {
  let staffId = req.params.id;
  staffHelper
    .deleteStaff(staffId)
    .then((deletedStaff) => {
      if (deletedStaff.errorMsg) {
        res.status(400).redirect("/admin/staff-list");
      } else {
        res.redirect("/admin/staff-list");
      }
    })
    .catch(() => {
      res.status(404).redirect("/admin/staff-list");
    });
});
router.get("/remove-user/:id", async (req, res, next) => {
  let userId = req.params.id;
  console.log(userId,"userid")
  staffHelper
    .deleteUser(userId)
    .then((deletedStaff) => {
      if (deletedStaff.errorMsg) {
        res.status(400).redirect("/admin/user-list");
      } else {
        res.redirect("/admin/user-list");
      }
    })
    .catch(() => {
      res.status(404).redirect("/admin/staff-list");
    });
});
router.post("/update-staff", (req, res, next) => {
  let staffId = req.body._id;
  delete req.body._id;
  staffHelper.updateStaff(staffId, req.body).then((err) => {
    if (err) {
      res.status(404).redirect("/admin/staff-list");
    } else {
      if (req.files) {
        let docFromClient = req.files.image;
        let uploadPath = "./public/img/staff/" + staffId + ".jpg";
        docFromClient.mv(uploadPath, (err, done) => {
          if (!err) {
            res.status(200).redirect("/admin/staff-list");
          } else {
            res.status(400).redirect("/admin/staff-list");
          }
        });
      } else res.redirect("/admin/staff-list");
    }
  });
});



module.exports = router;
