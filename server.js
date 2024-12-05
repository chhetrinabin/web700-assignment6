/*********************************************************************************
 * WEB700 – Assignment 06
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 *
 * Name: Nabin Chhetri Student ID: 170439236  Date: Dec 04, 2024
 *
 * Online (Vercel) Link: 
 *
 ********************************************************************************/

var express = require("express");
var path = require("path");
var collegeData = require("./modules/collegeData");

var app = express();

const exphbs = require("ejs"); // Import EJS

// set the port
var HTTP_PORT = process.env.PORT || 8080;

// Set the view engine to EJS
app.engine("ejs", exphbs.renderFile); // app.engine for EJS
app.set("view engine", "ejs");

// Middleware to serve static files
app.use(express.static("public"));
app.use(express.static("views"));

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));

// Middleware to set activeRoute
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  next();
});

// Add custom helpers
exphbs.localsName = "helpers"; // Use "helpers" object to store custom helpers
app.locals.helpers = {
  navLink: function (url, options) {
    return (
      "<li" +
      (url == app.locals.activeRoute
        ? ' class="nav-item active" '
        : ' class="nav-item" ') +
      '><a class="nav-link" href="' +
      url +
      '">' +
      options.fn(this) +
      "</a></li>"
    );
  },
  equal: function (lvalue, rvalue, options) {
    if (arguments.length < 3)
      throw new Error("EJS Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  },
};

// setup a 'route' to listen on the default url path
// app.get("/", (req, res) => {
// res.send("Hello World!");
// });

// Update the "/" route to render "home.ejs"
app.get("/", (req, res) => {
  res.render("home", { title: "Home Page | Nabin" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About Page | Nabin" });
});

app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo", { title: "htmlDemo Page | Nabin" });
});

// Adding "Get" route "/students/add"
app.get("/students/add", (req, res) => {
  res.render("addStudent", { title: "Add Student Page " });
});

// Get Students record
app.get("/students", (req, res) => {
  const course = req.query.course;

  if (course) {
    collegeData
      .getStudentsByCourse(course)
      .then((data) => {
        res.render("students", {
          students: data,
          title: `Students in Course ${course} | Nabin`,
          message: null, // No message by default
        });
      })
      .catch((error) => {
        console.error(error);
        res.render("students", {
          students: [], // No students found
          title: `Students in Course ${course} | Nabin`,
          message: "No results",
        });
      });
  } else {
    collegeData
      .getAllStudents()
      .then((data) => {
        res.render("students", {
          students: data,
          title: "All Students | Nabin",
          message: null, // No message by default
        });
      })
      .catch((error) => {
        console.error(error);
        res.render("students", {
          students: [], // No students found
          title: "All Students | Nabin",
          message: "No results",
        });
      });
  }
});

app.get("/courses", (req, res) => {
  collegeData
    .getCourses()
    .then((data) => {
      // Render "courses.ejs" with the fetched data
      res.render("courses", {
        title: "All Courses | Nabin",
        courses: data,
      });
    })
    .catch(() => {
      // Render "courses.ejs" with a "no results" message
      res.render("courses", {
        title: "All Courses | Nabin",
        message: "No results",
      });
    });
});

// get a student by student number
app.get("/student/:num", (req, res) => {
  const data = collegeData.getStudentByNum(req.params.num)
    data.then((data) => {
      res.render('student', {
        title: `Info - ${data.firstName} ${data.lastName}`,
        student: data,
      });
    })
    // handle no results
    .catch(() => res.json({ message: "no results" }));
});


// POST route to add a new student
app.post("/students/add", (req, res) => {
  collegeData
    .addStudent(req.body)
    .then(() => {
      // Redirect to "/students" route to verify that the new student was added
      res.redirect("/students");
    })
    .catch((err) => {
      res.status(500).send("Error adding student: " + err);
    });
});

// Update the student info
app.post("/student/update", (req, res) => {
  collegeData
    .updateStudent(req.body) // Pass req.body to updateStudent method
    .then(() => {
      res.redirect("/students"); // Redirect to the students list upon successful update
    })
    .catch((err) => {
      res.status(500).send(err); // Handle errors appropriately
    });
});

// Get a course by its id
app.get("/course/:id", (req, res) => {
  collegeData
    .getCourseById(req.params.id)
    .then((data) => {
      res.render('course', {
        title: `Course Details - ${data.courseCode}`,
        course: data
      });
    })
    // handle no results
    .catch(() => res.json({ title: "error",
      message: "query returned 0 results" }));
});


app.use((req, res) => {
  // handle 404 errors
  res.status(404).send("Page Not Found");
});

// initialize the college data
collegeData
  .initialize()
  .then(() => {
    // start the http server to listen on HTTP_PORT
    app.listen(HTTP_PORT, () => {
      console.log("server listening on port: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    // output the error to the console
    console.error(err);
  });

module.exports = app;