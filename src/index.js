const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const multer = require("multer"); 
const router = express.Router();
const { AdminCollection, StudentCollection, FeedbackCollection,MenuItem, WardenCollection , NotificationCollection , AttendanceCollection , RebateForm} = require("./mongodb");
const templatePath = path.join(__dirname, '../templates');
const session = require('express-session');
// const MenuItem = require('../models/menuItem'); // Import the MenuItem model

// Middleware

app.use(express.json());

app.set("view engine", "hbs");
app.set("views", templatePath);
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from the public directory
app.use(express.static('css')); // Serve static files from the css directory
app.use(express.static('images'));
app.use(express.static('js'));
app.use(express.urlencoded({ extended: false }));



// Register custom helpers
hbs.registerHelper("eq", function (a, b) {
    return a === b;
});

hbs.registerHelper("not", function (a) {
    return !a;
});

hbs.registerHelper("findItem", function (items, day) {
    return items.some(item => item.day === day);
});



// Session setup
// Session setup with cookie options
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false, // Ensure session is not created unless needed
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1-day session
}));


// Update your storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Change this path to your desired directory
        cb(null, "C:\\Users\\SRIKRUTHA\\Downloads\\SE(F)");
    },
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Rest of your code remains unchanged


// Routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/login1", (req, res) => {
    res.render("login1");
});

app.get("/login2", (req, res) => {
    res.render("login2");
});

app.get("/adminhome", (req, res) => {
    res.render("adminhome");
});

app.get("/studenthome", (req, res) => {
    res.render("studenthome");
});

app.get("/wardenhome", (req, res) => {
    res.render("wardenhome");
});

app.get("/adminsearch", (req, res) => {
    res.render("adminsearch");
});

app.get("/adminform", (req, res) => {
    res.render("adminform");
});

app.get("/studentform", (req, res) => {
    res.render("studentform");
});


// Admin Login Route
app.post("/login", async (req, res) => {
    try {
        const user = await AdminCollection.findOne({ username: req.body.username });
        
        if (user && user.password === req.body.password) {
            res.render("adminhome");
        } else {
            res.send("Invalid username or password for Admin");
        }
    } catch (error) {
        console.error(error);
        res.send("An error occurred during Admin login.");
    }
});

// Student Login Route
app.post("/login1", async (req, res) => {
    try {
        const user = await StudentCollection.findOne({ username: req.body.username });
        
        if (user && user.password === req.body.password) {
            req.session.studentId = user._id;
            req.session.username = user.username;
            res.render("studenthome", { studentId: user._id });
        } else {
            res.send("Invalid username or password for Student");
        }
    } catch (error) {
        console.error(error);
        res.send("An error occurred during Student login.");
    }
});


app.post("/login2", async (req, res) => {
    try {
        const user = await WardenCollection.findOne({ username: req.body.username });
        
        if (user && user.password === req.body.password) {
            res.render("wardenhome");
        } else {
            res.send("Invalid username or password for Warden");
        }
    } catch (error) {
        console.error(error);
        res.send("An error occurred during warden login.");
    }
});




// Feedback Submission
app.post("/submitfeedback", async (req, res) => {
    const { feedback } = req.body;
    const studentId = req.session.studentId;

    if (!studentId) {
        return res.status(401).send("Unauthorized: No student ID found");
    }

    try {
        const newFeedback = new FeedbackCollection({ studentId, feedback });
        await newFeedback.save();
        res.redirect("/studentfeedback");
    } catch (error) {
        console.error("Error saving feedback:", error);
        res.status(500).send("Error submitting feedback");
    }
});

// Fetching Student Feedback
// Fetching Student Feedback
app.get("/studentfeedback", async (req, res) => {
    const studentId = req.session.studentId;

    if (!studentId) {
        return res.status(401).send("Unauthorized: No student ID found");
    }

    try {
        // Fetch feedbacks for the specific student
        const feedbacks = await FeedbackCollection.find({ studentId });

        // Format the date and sort feedbacks from latest to earliest
        const formattedFeedbacks = feedbacks
            .map(feedback => ({
                ...feedback.toObject(),
                date: feedback.date.toLocaleString('en-US')  // Format the date
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort feedbacks

        res.render("studentfeedback", { feedbacks: formattedFeedbacks, studentId });
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        res.status(500).send("Error fetching feedbacks");
    }
});


// Admin View All Feedbacks
// Admin View All Feedbacks
app.get("/adminfeedback", async (req, res) => {
    try {
        // Fetch all feedbacks and populate studentId
        const feedbacks = await FeedbackCollection.find().populate('studentId');

        // Format the date and sort feedbacks from latest to earliest
        const formattedFeedbacks = feedbacks
            .map(feedback => ({
                ...feedback.toObject(),
                date: feedback.date.toLocaleString('en-US')  // Format the date
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort feedbacks

        res.render("adminfeedback", { feedbacks: formattedFeedbacks });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching feedbacks");
    }
});


app.get("/wardenfeedback", async (req, res) => {
    try {
        // Fetch all feedbacks and populate studentId
        const feedbacks = await FeedbackCollection.find().populate('studentId');

        // Format the date and sort feedbacks from latest to earliest
        const formattedFeedbacks = feedbacks
            .map(feedback => ({
                ...feedback.toObject(),
                date: feedback.date.toLocaleString('en-US')  // Format the date
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort feedbacks

        res.render("wardenfeedback", { feedbacks: formattedFeedbacks });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching feedbacks");
    }
});





// Admin Menu Management Route
app.get("/adminmenu", async (req, res) => {
    try {
        const menuItems = await MenuItem.find(); // Fetch all menu items for admin
        res.render("adminmenu", { menuItems }); // Render the admin menu management view
    } catch (error) {
        console.error("Error fetching menu items:", error);
        res.status(500).send("Error fetching menu items");
    }
});

// Add a new MenuItem
app.post("/adminmenu", async (req, res) => {
    const { name, description, mealType, day } = req.body;
    try {
        const newMenuItem = new MenuItem({ name, description, mealType, day });
        await newMenuItem.save(); // Save the new menu item
        res.redirect("/adminmenu"); // Redirect to the admin menu management page
    } catch (error) {
        console.error("Error adding menu item:", error);
        res.status(500).send("Error adding menu item");
    }
});

// Edit a MenuItem (GET route to show the edit form)
app.get("/adminmenu/:id/edit", async (req, res) => {
    const { id } = req.params;
    try {
        const menuItem = await MenuItem.findById(id); // Find the menu item by ID
        if (!menuItem) {
            return res.status(404).send("Menu item not found");
        }
        res.render("editmenu", { menuItem }); // Render an edit view
    } catch (error) {
        console.error("Error fetching menu item for editing:", error);
        res.status(500).send("Error fetching menu item for editing");
    }
});

// Update a MenuItem (POST route to handle form submission)
app.post("/adminmenu/:id", async (req, res) => {
    const { id } = req.params;
    const { name, description, mealType, day } = req.body;
    try {
        await MenuItem.findByIdAndUpdate(id, { name, description, mealType, day }); // Update the menu item
        res.redirect("/adminmenu"); // Redirect to the admin menu management page
    } catch (error) {
        console.error("Error updating menu item:", error);
        res.status(500).send("Error updating menu item");
    }
});


// Delete a MenuItem
app.post("/adminmenu/:id/delete", async (req, res) => {
    const { id } = req.params;
    try {
        await MenuItem.findByIdAndDelete(id); // Delete the menu item
        res.redirect("/adminmenu"); // Redirect to the admin menu management page
    } catch (error) {
        console.error("Error deleting menu item:", error);
        res.status(500).send("Error deleting menu item");
    }
});


// Route to view the menu for students
app.get("/studentmenu", async (req, res) => {
    try {
        const menuItems = await MenuItem.find(); // Fetch all menu items
        res.render("studentmenu", { menuItems }); // Render the student menu view
    } catch (error) {
        console.error("Error fetching menu items:", error);
        res.status(500).send("Error fetching menu items");
    }
});


// Admin View and Add Notifications
app.get("/adminnotification", async (req, res) => {
    try {
        const notifications = await NotificationCollection.find().sort({ date: -1 });
        const formattedNotifications = notifications
            .map(notification => ({
                ...notification.toObject(),
                date: notification.date.toLocaleString('en-US')  // Format the date
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort notifications by date (newest first)

        res.render("adminnotification", { notifications: formattedNotifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).send("Error fetching notifications");
    }
});

app.post("/adminnotification", async (req, res) => {
    const { title, content } = req.body;
    try {
        const newNotification = new NotificationCollection({ title, content });
        await newNotification.save();
        res.redirect("/adminnotification");
    } catch (error) {
        console.error("Error adding notification:", error);
        res.status(500).send("Error adding notification");
    }
});

// Student View Notifications
app.get("/studentnotification", async (req, res) => {
    try {
        const notifications = await NotificationCollection.find().sort({ date: -1 });
        const formattedNotifications = notifications
            .map(notification => ({
                ...notification.toObject(),
                date: notification.date.toLocaleString('en-US')  // Format the date
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort notifications by date (newest first)

        res.render("studentnotification", { notifications: formattedNotifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).send("Error fetching notifications");
    }
});

        

app.post("/admin/mark", async (req, res) => {
    const { username, date, meal } = req.body;
    const update = { [meal]: true };

    try {
        await AttendanceCollection.updateOne(
            { username, date },
            { $set: update },
            { upsert: true }
        );
        res.status(200).json({ success: true, message: "Attendance marked successfully" });
    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ success: false, message: "Error marking attendance" });
    }
});

app.get("/admin/attendance/:username", async (req, res) => {
    try {
        const attendance = await AttendanceCollection.find({ username: req.params.username })
            .sort({ date: -1 })
            .lean();
        res.status(200).json({ attendance });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ message: "Error fetching attendance" });
    }
});

app.post("/admincalendar", (req, res) => {
    const { username } = req.body;
    res.redirect(`/admin/calendar/${username}`);
});

// Calendar route
app.get("/admin/calendar/:username", (req, res) => {
    const username = req.params.username;
    res.render('admincalendar', { username });
});


app.get("/studentcalendar", async (req, res) => {
    const username = req.session.username; // Assume username is stored in session

    if (!username) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }

    try {
        const attendance = await AttendanceCollection.find({ username }).sort({ date: -1 }).lean();
        res.render("studentcalendar", { username, attendance }); // Pass data to the view
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).send("Error fetching attendance");
    }
});

app.get("/student/attendance/:username", async (req, res) => {
    try {
        const attendance = await AttendanceCollection.find({ username: req.params.username })
            .sort({ date: -1 })
            .lean();
        res.status(200).json({ attendance });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ message: "Error fetching attendance" });
    }
});

app.post("/submitform", upload.single("outpass"), async (req, res) => {
    const { name, fromDate, toDate } = req.body;
    const studentId = req.session.studentId;

    if (!studentId) return res.status(401).send("Unauthorized: No student ID found");

    const daysDiff = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24));
    if (daysDiff < 3) return res.status(400).send("Error: Minimum 3 days required.");

    if (!req.file) return res.status(400).send("Error: Outpass file upload required.");

    try {
        const newForm = new RebateForm({
            studentId,
            name,
            fromDate,
            toDate,
            outpass: req.file.filename,
            status: "Pending",
            dateSubmitted: new Date()
        });

        await newForm.save();
        const forms = await RebateForm.find({ studentId }).sort({ dateSubmitted: -1 }).lean();
        console.log("aaaaa");
        res.render("studentform", { forms });
        console.log("aaaab");
    } catch (error) {
        console.error("Error submitting form:", error);
        res.status(500).send("Error submitting form");
    }
});

app.get("/studentform", async (req, res) => {
    console.log("hello");
    const studentId = req.session.studentId;

    if (!studentId) {
        return res.redirect("/login1"); // Redirect to login if no student ID in session
    }

    try {
        // Fetch forms for the specific student and sort by date submitted in descending order
        const forms = await RebateForm.find({ studentId }).sort({ dateSubmitted: -1 }).lean();
        res.render("studentform", { forms });
        console.log("error");
    } catch (error) {
        console.error("Error fetching forms:", error);
        res.status(500).send("Error fetching forms");
    }
});


app.get("/adminform", async (req, res) => {
    try {
        const forms = await RebateForm.find().populate("studentId", "name").sort({ dateSubmitted: -1 }).lean();
        res.render("adminform", { forms }); // Pass all forms to the admin view
    } catch (error) {
        console.error("Error fetching forms:", error);
        res.status(500).send("Error fetching forms");
    }
});


app.post("/approveform/:id", async (req, res) => {
    try {
        await RebateForm.findByIdAndUpdate(req.params.id, { status: "Approved" });
        res.redirect("/adminform");
    } catch (error) {
        console.error("Error approving form:", error);
        res.status(500).send("Error approving form");
    }
});



// Server Setup
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});