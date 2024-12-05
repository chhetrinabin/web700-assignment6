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
      sequelize.sync()
          .then(() => {
              console.log('Database synced successfully.');
              resolve();
          })
          .catch(err => {
              console.error('Unable to sync the database:', err);
              reject('Unable to sync the database.');
          });
  });
}


function getAllStudents() {
  return new Promise(function (resolve, reject) {
    reject();
  });
}

function getCourses() {
  return new Promise(function (resolve, reject) {
    reject();
  });
}

function getStudentsByCourse(course) {
  return new Promise(function (resolve, reject) {
    reject();
  });
}

function getStudentByNum(num) {
  return new Promise(function (resolve, reject) {
    reject();
  });
}

function addStudent(studentData) {
  return new Promise(function (resolve, reject) {
    reject();
  });
}

function getCourseById(id) {
  return new Promise(function (resolve, reject) {
    reject();
  });
}

function updateStudent(studentData) {
  return new Promise(function (resolve, reject) {
    reject();
  });
}

module.exports = {
  initialize,
  getAllStudents,
  getCourses,
  getStudentsByCourse,
  getStudentByNum,
  addStudent,
  getCourseById,
  updateStudent,
};
