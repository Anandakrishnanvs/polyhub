var express = require("express");

var router = express.Router();

let notificationHelper = require("../helpers/notificationHelper");
let photosHelper = require("../helpers/photoGallery_helper");
const questionPaperHelper = require("../helpers/questionPaper_helpers");
let formHelper = require("../helpers/form_helper");
let staffHelper = require("../helpers/staff_helpers");
const async = require("hbs/lib/async");
let adminHelpers = require('../helpers/admin-helper')
//error handler
router.post('/register', (req, res) => {
  console.log("on register")
  let data = req.body
  console.log("Register data:", data);
  adminHelpers.createUser(data).then((response) => {
    console.log("Registration successful");
    req.session.user = response;
    res.redirect("/");
  }).catch((error) => {
    console.error("Registration error:", error);
    res.redirect("/?error=registration_failed");
  });
})
router.get("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/");
});
router.post('/Login', (req, res) => {
  console.log("on Login")
  let { email } = req.body
  let { password } = req.body
  let data = {
    email,
    password
  }
  console.log("Login data:", data);
  adminHelpers.doLoginUser(data).then((response) => {
    if (response) {
      console.log("Login successful:", response)
      req.session.user = response
      console.log(req.session.user, "from session")
      res.redirect("/");
    } else {
      console.log("Login failed: No response");
      res.redirect("/?error=login_failed");
    }
  }).catch((error) => {
    console.error("Login error:", error);
    res.redirect("/?error=login_failed");
  });
})
router.get('/Error/:status', (req, res) => {
  // render the error page
  let error = {
    status: 503,
    message: "DB Connection Lost "
  }
  res.status(req.params.status).render("error", { error });
})
/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    let notifications = await notificationHelper.fetchAllNotifications();
    let docs = await questionPaperHelper.fetchAllDocs();
    console.log(docs, "docs")
    let user = req.session.user;
    let error = req.query.error;
    let errorMessage = null;

    if (error === 'login_failed') {
      errorMessage = "Invalid email or password.";
    } else if (error === 'registration_failed') {
      errorMessage = "Registration failed. Please try again.";
    }

    if (user) {
      res.render("user/home", { notificationList: notifications, user, docs, errorMessage });
    } else {
      res.render("user/home", { notificationList: notifications, docs, errorMessage });
    }

  } catch (error) {
    res.redirect('/error/503')
  }

});
router.post('/searchMaterial', async (req, res) => {
  try {
    let notifications = await notificationHelper.fetchAllNotifications();
    let docs = await questionPaperHelper.fetchAllDocs();
    let subject = req.body.subject;
    let searchResults = await questionPaperHelper.fecthSingleMaterial(subject)
    console.log(searchResults, "result:::::::::::")
    console.log(docs, "docs")
    if (req.session.user) {
      let user = req.session.user;
      res.render("user/searchResult", { notificationList: notifications, user, docs: searchResults, searchResults });
    } else {
      res.render("user/searchResult", { notificationList: notifications, docs: searchResults, searchResults });
    }

  } catch (error) {
    res.redirect('/error/503')
  }
})

router.get("/all-questions", async function (req, res, next) {
  try {
    let allQuestions = await questionPaperHelper.fetchAllQuestionPapers();
    res.render("user/questions", { allQuestions });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/all-forms", async function (req, res, next) {
  try {
    let allForms = await formHelper.fetchAllForms();
    res.render("user/all-forms", { allForms });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/gallery", async function (req, res, next) {
  try {
    let photos = await photosHelper.fetchAllPhotos();
    res.render("user/gallery", { photos });
  } catch (error) {
    res.redirect('/error/503')
  }
});
// router.get("/Register", async function (req, res, next) {
//   try {

//     res.render("user/Register", { photos });
//   } catch (error) {
//     res.redirect('/error/503')
//   }
// });
router.get("/Computer", async function (req, res, next) {
  try {
    let computerGallery = await photosHelper.fetchAllPhotos();
    let computerQuestions = await questionPaperHelper.fetchDepartmentQuestions("ct");
    let computerStaff = await staffHelper.selectDepartmentStaff("ct");
    let material = await questionPaperHelper.fecthMaterial('ct')
    console.log(computerQuestions, "questions")
    console.log(material, "material..")
    let user = req.session.user;
    if (user) {
      res.render("user/computer", {
        photos: computerGallery,
        questions: computerQuestions,
        staffs: computerStaff,
        material: material,
        user
      });
    } else {
      res.render("user/computer", {
        photos: computerGallery,
        questions: computerQuestions,
        staffs: computerStaff,
        material: material
      });
    }

  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/civil", async function (req, res, next) {
  try {
    let civilGallery = await photosHelper.fetchAllPhotos();
    let civilQuestions = await questionPaperHelper.fetchDepartmentQuestions("ct");
    let civilStaff = await staffHelper.selectDepartmentStaff("ce");
    let material = await questionPaperHelper.fecthMaterial('ce')
    res.render("user/civil", {
      photos: civilGallery,
      questions: civilQuestions,
      staffs: civilStaff,
      material
    });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/ec", async function (req, res, next) {
  try {
    let photos = await photosHelper.fetchAllPhotos();
    let questions = await questionPaperHelper.fetchDepartmentQuestions("ec");
    let staffs = await staffHelper.selectDepartmentStaff("ec");
    let material = await questionPaperHelper.fecthMaterial('ec')
    res.render("user/ec", { photos, questions, staffs, material });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/mech", async function (req, res, next) {
  try {
    let photos = await photosHelper.fetchAllPhotos();
    let questions = await questionPaperHelper.fetchDepartmentQuestions("me");
    let staffs = await staffHelper.selectDepartmentStaff("me");
    let material = await questionPaperHelper.fecthMaterial('me')

    res.render("user/mech", { photos, questions, staffs, material });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/eee", async function (req, res, next) {
  try {
    let photos = await photosHelper.fetchAllPhotos();
    let questions = await questionPaperHelper.fetchDepartmentQuestions("eee");
    let staffs = await staffHelper.selectDepartmentStaff("eee");
    let material = await questionPaperHelper.fecthMaterial('eee')

    res.render("user/eee", { photos, questions, staffs, material });
  } catch (error) {
    res.redirect('/error/503')
  }
});
router.get("/genaral", function (req, res, next) {
  try {
    res.render("user/genaral");
  } catch (error) {
    res.redirect('/error/503')
  }
});



module.exports = router;
// router.all("/*", function (req, res, next) {
//   req.app.locals.layout = "layouts/layout"; // set your layout here
//   next(); // pass control to the next handler
// });
/* GET home page. */
