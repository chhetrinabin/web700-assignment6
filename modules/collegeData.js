const Sequelize = require("sequelize");
require("dotenv").config();

// Initialize Sequelize
var sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

// ***** Creating Data Models *****

// Define the Student model
const Student = sequelize.define("Student", {
  studentNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressProvince: Sequelize.STRING,
  TA: Sequelize.BOOLEAN,
  status: Sequelize.STRING,
});

// Define the Course model
const Course = sequelize.define("Course", {
  courseId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courseCode: Sequelize.STRING,
  courseDescription: Sequelize.STRING,
});

// Course-Student relationship
Course.hasMany(Student, { foreignKey: "course" });

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        console.log("Database synced successfully.");
        resolve();
      })
      .catch((err) => {
        console.error("Unable to sync the database:", err);
        reject("Unable to sync the database.");
      });
  });
}

//  Get all students
function getAllStudents() {
  return new Promise(function (resolve, reject) {
    Student.findAll({
      order: [["studentNum", "ASC"]], // Sort students by studentNum in ascending order
    })
      .then(function (data) {
        if (data.length > 0) {
          resolve(data); // Resolve with the list of students
        } else {
          reject("no results returned"); // Reject if no students are found
        }
      })
      .catch(function () {
        reject("no results returned"); // Reject if an error occurs
      });
  });
}

// Get the students by the course
function getStudentsByCourse(course) {
  return new Promise(function (resolve, reject) {
    Student.findAll({
      where: {
        course: course, // Filter students by the specified course
      },
    })
      .then(function (data) {
        if (data.length > 0) {
          resolve(data); // Resolve with the list of students in the course
        } else {
          reject("no results returned"); // Reject if no students are found
        }
      })
      .catch(function () {
        reject("no results returned"); // Reject if an error occurs
      });
  });
}

// Get student by studentNum
function getStudentByNum(studentNum) {
  return new Promise(function (resolve, reject) {
    Student.findAll({
      where: {
        studentNum: studentNum, // Filter students by the specified studentNum
      },
    })
      .then(function (data) {
        if (data.length > 0) {
          resolve(data[0]); // Resolve with the first matching student
        } else {
          reject("no results returned"); // Reject if no student is found
        }
      })
      .catch(function () {
        reject("no results returned"); // Reject if an error occurs
      });
  });
}

// Get all courses
const getCourses = () => {
  return new Promise((resolve, reject) => {
    Course.findAll({
      order: [["courseId", "ASC"]], // Sort courses by courseId in ascending order
    })
      .then((data) => {
        data.length > 0 ? resolve(data) : reject("no results returned");
      })
      .catch(() => reject("no results returned"));
  });
};

// Get course by id
const getCourseById = (id) => {
  return new Promise((resolve, reject) => {
    Course.findAll({
      where: {
        courseId: id,
      },
    })
      .then((data) => {
        resolve(data[0]);
      })
      .catch(() => {
        reject("no result returned");
      });
  });
};

// Add a new student record
function addStudent(studentData) {
  return new Promise(function (resolve, reject) {
    // Ensure the TA property is explicitly set to true or false
    studentData.TA = studentData.TA ? true : false; // use of ternary operator

    // Replace any empty string values with null
    for (const field in studentData) {
      if (studentData[field] === "") {
        studentData[field] = null;
      }
    }

    // Use Sequelize's create method to add the student to the database
    Student.create({
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      addressStreet: studentData.addressStreet,
      addressCity: studentData.addressCity,
      addressProvince: studentData.addressProvince,
      TA: studentData.TA,
      status: studentData.status,
      course: studentData.course,
    })
      .then(function () {
        resolve(); // Resolve the promise if the student is successfully created
      })
      .catch(function () {
        reject("unable to create student"); // Reject the promise if an error occurs
      });
  });
}

// Update an existing student record
const updateStudent = (studentData) => {
  return new Promise((resolve, reject) => {
    studentData.TA = studentData.TA ? true : false;
    for (const field in studentData) {
      if (studentData[field] === "") {
        studentData[field] = null;
      }
    }
    Student.update(
      {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        addressStreet: studentData.addressStreet,
        addressCity: studentData.addressCity,
        addressProvince: studentData.addressProvince,
        TA: studentData.TA,
        status: studentData.status,
        course: studentData.course,
      },
      {
        where: {
          studentNum: studentData.studentNum,
        },
      }
    )
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("unable to update student");
      });
  });
};

// Add new course
function addCourse(courseData) {
  return new Promise((resolve, reject) => {
    for (const field in courseData) {
      if (courseData[field] === "") {
        courseData[field] = null;
      }
    }
    Course.create({
      courseCode: courseData.courseCode,
      courseDescription: courseData.courseDescription,
    })
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("unable to create course");
      });
  });
}

// Update the course record
const updateCourse = (courseData) => {
  return new Promise((resolve, reject) => {
    for (const prop in courseData) {
      if (courseData[prop] === "") {
        courseData[prop] = null;
      }
    }
    Course.update(
      {
        courseCode: courseData.courseCode,
        courseDescription: courseData.courseDescription,
      },
      {
        where: {
          courseId: courseData.courseId,
        },
      }
    )
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("unable to update course");
      });
  });
};

// Delete the course by its id
const deleteCourseById = (id) => {
  return new Promise((resolve, reject) => {
    Course.destroy({
      where: {
        courseId: id,
      },
    })
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject();
      });
  });
};

module.exports = {
  initialize,
  getAllStudents,
  getStudentsByCourse,
  getStudentByNum,
  getCourses,
  getCourseById,
  addStudent,
  updateStudent,
  addCourse,
  updateCourse,
  deleteCourseById,
};
