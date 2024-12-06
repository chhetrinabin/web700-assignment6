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
const bodyParser = require('body-parser');
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
app.use(bodyParser.json());

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

// setup a 'route' to listen on the default url path
// app.get("/", (req, res) => {
// res.send("Hello World!");
// });

// *** Start of static pages ***

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

// *** End of static pages ***

// *** Start of Students Routes ***

// Get Students record
app.get("/students", (req, res) => {
  if (req.query.course) {
    collegeData
      .getStudentsByCourse(req.query.course)
      .then((data) => {
        res.render("students", {
          students: data,
          message: null,
          title: "All students",
        });
      })
      .catch((err) => {
        console.error(err); // Log the error for debugging
        res.render("students", {
          students: [],
          title: "",
          message: "No students found for the selected course.",
        });
      });
  } else {
    collegeData
      .getAllStudents()
      .then((data) => {
        res.render("students", {
          students: data,
          title: "All Students",
          message: "",
        });
      })
      .catch((err) => {
        console.error(err); // Log the error for debugging
        res.render("students", {
          students: [],
          title: "All Students",
          message: "No students found.",
        });
      });
  }
});

// Get a student by student number
app.get("/student/:studentNum", (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};
  
    collegeData.getStudentByNum(parseInt(req.params.studentNum))
    .then((data) => {
      if (data) {
        viewData.student = data; //store student data in the "viewData" object as "student"
      } else {
        viewData.student = null; // set student to null if none were returned
      }
    })
    .catch(() => {
      viewData.student = null; // set student to null if there was an error
    })
    .then(collegeData.getCourses)
    .then((data) => {
      viewData.courses = data; // store course data in the "viewData" object as "courses"
      // loop through viewData.courses and once we have found the courseId that matches
      // the student's "course" value, add a "selected" property to the matching
      // viewData.courses object
      for (let i = 0; i < viewData.courses.length; i++) {
        if (viewData.courses[i].courseId == viewData.student.course) {
          viewData.courses[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.courses = []; // set courses to empty if there was an error
    })
    .then(() => {
      if (viewData.student == null) {
        // if no student - return an error
        res.status(404).send("Student Not Found");
      } else {
        res.render("student", { viewData: viewData, title: "Student Detail"}); // render the "student" view
      }
    });
});

// Adding "Get" route "/students/add"
app.get("/students/add", (req, res) => {
  collegeData
    .getCourses()
    .then((data) => {
      res.render("addStudent", { courses: data, title: "Add a student", message: "" });
    })
    .catch(() => {
      res.render("addStudent", { courses: [], title: "Add a student", message: "" });
    });
});

// POST route to add a new student
app.post("/students/add", (req, res) => {
  collegeData
    .addStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
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

// Delete student record by studentNum
app.get("/student/delete/:studentNum", (req, res) => {
  collegeData.deleteStudentByNum(parseInt(req.params.studentNum))
    .then(() => {
      res.redirect("/students");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Student / Student not found");
    });
});

// *** End of Students Routes ***

// *** Start of Courses Routes ***

// Get all courses
app.get("/courses", (req, res) => {
  collegeData
    .getCourses() // Assuming this function fetches all courses
    .then((courses) => {
      res.render("courses", {
        courses: courses,
        title: "All courses",
        message: "",
      }); // Pass courses to the view
    })
    .catch((error) => {
      res.render("courses", {
        courses: [],
        title: "All courses",
        message: "no results returned",
      }); // Handle error
    });
});

// Get a course by its id
app.get("/course/:id", (req, res) => {
  collegeData
    .getCourseById(req.params.id)
    .then((data) => {
      res.render("course", {
        title: `Course Details - ${data.courseCode}`,
        course: data,
      });
    })
    // handle no results
    .catch(() =>
      res.json({ title: "error", message: "query returned 0 results" })
    );
});

// Route to render the addCourse view
app.get("/courses/add", (req, res) => {
  res.render("addCourse", { title: "Add a Course", message: "" });
});

// Route to handle adding a new course
app.post("/courses/add", (req, res) => {
  collegeData
    .addCourse(req.body)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((err) => {
      res.status(500).send("Unable to add course");
    });
});

// Update course record
app.post("/course/update", (req, res) => {
  collegeData.updateCourse(req.body).then(res.redirect("/courses"));
});

// Route to delete a course by ID
app.get("/course/delete/:id", (req, res) => {
  collegeData
    .deleteCourseById(req.params.id)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Course / Course not found");
    });
});

// Handle Errors
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
