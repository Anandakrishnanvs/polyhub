var express = require("express");
var https = require("https");
var http = require("http");

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

// Helper: proxy a PDF from Cloudinary to the browser.
// Uses cloudinary.utils.private_download_url — the correct server-to-server download API.
// Tries 'authenticated' type first (existing files), then 'upload' type (new files).
function proxyDownload(res, folder, publicId, filename) {
  const cloudinary = require('../config/cloudinary');

  // Fetch URL following redirects, call cb(response) on success or errCb(err) on failure
  function fetchWithRedirects(url, maxRedirects, cb, errCb) {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    protocol.get(url, (response) => {
      const { statusCode, headers } = response;
      if ([301, 302, 303, 307, 308].includes(statusCode) && headers.location) {
        response.resume();
        if (maxRedirects <= 0) { errCb(new Error('Too many redirects')); return; }
        const nextUrl = headers.location.startsWith('http')
          ? headers.location
          : new URL(headers.location, url).toString();
        fetchWithRedirects(nextUrl, maxRedirects - 1, cb, errCb);
        return;
      }
      cb(response, statusCode);
    }).on('error', errCb);
  }

  function streamFromUrl(url, onFail) {
    fetchWithRedirects(url, 5, (cloudinaryRes, statusCode) => {
      const contentType = cloudinaryRes.headers['content-type'] || '';
      if (statusCode !== 200 || contentType.includes('text/html')) {
        console.log(`Cloudinary: status=${statusCode} ct=${contentType} — trying alternate delivery type...`);
        cloudinaryRes.resume();
        onFail();
        return;
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      if (cloudinaryRes.headers['content-length']) {
        res.setHeader('Content-Length', cloudinaryRes.headers['content-length']);
      }
      cloudinaryRes.pipe(res);
    }, (err) => {
      console.error('Proxy network error:', err.message);
      if (!res.headersSent) res.status(500).send('Download failed');
    });
  }

  try {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    // Cloudinary may store the public_id WITH or WITHOUT the .pdf extension baked in,
    // depending on how the file was uploaded. We try all combinations:
    // 1. authenticated + id (without .pdf in public_id) — format appended by Cloudinary
    // 2. authenticated + id.pdf (with .pdf already in public_id) — no extra format
    // 3. upload + id (without .pdf)
    // 4. upload + id.pdf (with .pdf)
    const candidates = [
      { publicId: `${folder}/${publicId}`, format: 'pdf', type: 'authenticated' },
      { publicId: `${folder}/${publicId}.pdf`, format: '', type: 'authenticated' },
      { publicId: `${folder}/${publicId}`, format: 'pdf', type: 'upload' },
      { publicId: `${folder}/${publicId}.pdf`, format: '', type: 'upload' },
    ];

    function tryNext(index) {
      if (index >= candidates.length) {
        if (!res.headersSent) res.status(404).send('File not found on Cloudinary');
        return;
      }
      const { publicId: pid, format, type } = candidates[index];
      const url = cloudinary.utils.private_download_url(pid, format || undefined, {
        resource_type: 'raw',
        type,
        expires_at: expiresAt
      });
      console.log(`Trying [${type}] public_id="${pid}" format="${format}"...`);
      streamFromUrl(url, () => tryNext(index + 1));
    }

    tryNext(0);
  } catch (error) {
    console.error('Download setup error:', error);
    if (!res.headersSent) res.status(500).send('Download failed');
  }
}

// Download routes - proxy PDF bytes through the server to avoid cross-origin auth errors
router.get("/docs/:id.pdf", (req, res) => {
  proxyDownload(res, 'study_materials', req.params.id, 'study-material-' + req.params.id);
});

router.get("/questions/:id.pdf", (req, res) => {
  proxyDownload(res, 'question_papers', req.params.id, 'question-paper-' + req.params.id);
});

router.get("/forms/:id.pdf", (req, res) => {
  proxyDownload(res, 'forms', req.params.id, 'form-' + req.params.id);
});

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
