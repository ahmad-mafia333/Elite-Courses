// Importing required modules
require("dotenv").config(); // To load environment variables from .env file
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Enable CORS (Cross-Origin Resource Sharing)
app.use(express.json()); // For parsing JSON request bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded bodies

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// MongoDB Models (Schemas)
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
});

const CourseSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  contentPath: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const Course = mongoose.model("Course", CourseSchema);

// Test route to check if server is working
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// Register route (POST /register)
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Hashing the password before saving to database
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// Login route (POST /login)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  // Compare the entered password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ error: "Invalid password" });

  // Generate JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ message: "Login successful", token });
});

// Get all courses route (GET /courses)
app.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: "Error fetching courses" });
  }
});

// Add a course route (POST /courses)
CourseSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  contentPath: String,
  link: { type: String, required: true },  // Added link field for course URL
  createdAt: { type: Date, default: Date.now },
});

  try {
    await course.save();
    res.status(201).json({ message: "Course added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error adding course" });
  }
;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});