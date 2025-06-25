const mongoose = require("mongoose");

// Connection URLs for the databases
const adminDbUri = "mongodb://localhost:27017/admin1"; // Admin Database
const studentDbUri = "mongodb://localhost:27017/student1"; // Student Database
const wardenDbUri = "mongodb://localhost:27017/warden1"; // Warden Database
const menuDbUri = "mongodb://localhost:27017/menu1"; // Menu Database

// Connect to the Admin database
const adminConnection = mongoose.createConnection(adminDbUri);
adminConnection.on("connected", () => {
  console.log("Connected to Admin Database");
});
adminConnection.on("error", (err) => {
  console.error("Failed to connect to Admin Database:", err);
});

// Create a connection for the Student database
const studentConnection = mongoose.createConnection(studentDbUri);
studentConnection.on("connected", () => {
  console.log("Connected to Student Database");
});
studentConnection.on("error", (err) => {
  console.error("Failed to connect to Student Database:", err);
});

// Create a connection for the Warden database
const wardenConnection = mongoose.createConnection(wardenDbUri);
wardenConnection.on("connected", () => {
  console.log("Connected to Warden Database");
});
wardenConnection.on("error", (err) => {
  console.error("Failed to connect to Warden Database:", err);
});

// Create a connection for the Menu database
const menuConnection = mongoose.createConnection(menuDbUri);
menuConnection.on("connected", () => {
  console.log("Connected to Menu Database");
});
menuConnection.on("error", (err) => {
  console.error("Failed to connect to Menu Database:", err);
});

// Admin Schema and Model
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const AdminCollection = adminConnection.model("AdminCollection", adminSchema, "admins1");

// Warden Schema and Model
const wardenSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const WardenCollection = wardenConnection.model("WardenCollection", wardenSchema, "wardens1");

// Student Schema and Model
const studentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const StudentCollection = studentConnection.model("StudentCollection", studentSchema, "students1");

// Feedback Schema and Model
const feedbackSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentCollection", required: true },
  feedback: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const FeedbackCollection = studentConnection.model("FeedbackCollection", feedbackSchema, "feedbacks1");

// Menu Item Schema and Model (for the Menu database)
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true }
});
const MenuItem = menuConnection.model("MenuItem", menuItemSchema, "menu1");

// Notification Schema and Model (for the Admin database)
const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const NotificationCollection = adminConnection.model("NotificationCollection", notificationSchema, "notifications1");

// Attendance Schema and Model (for the Student database)
const attendanceSchema = new mongoose.Schema({
  username: { type: String, required: true },
  date: { type: String, required: true }, // e.g., "2024-10-20"
  breakfast: { type: Boolean, default: false },
  lunch: { type: Boolean, default: false },
  dinner: { type: Boolean, default: false },
});


const rebateFormSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentCollection', required: true },
  name: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  outpass: { type: String, required: true },
  dateSubmitted: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" } // Default status to "Pending"
});

const RebateForm = studentConnection.model("RebateForm", rebateFormSchema , "rebateform1");

// Define AttendanceCollection using the student connection
const AttendanceCollection = studentConnection.model("Attendance", attendanceSchema, "attendances1");

module.exports = {
  AdminCollection,
  StudentCollection,
  FeedbackCollection,
  MenuItem,
  WardenCollection,
  NotificationCollection,
  AttendanceCollection,
  RebateForm
};



