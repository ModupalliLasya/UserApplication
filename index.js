// index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

// Create User Profile
app.post("/api/user/create", async (req, res) => {
  const { username } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const newUser = new User({ username });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

// Add Points to User
app.post("/api/user/add-points", async (req, res) => {
  const { username, points } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.points += points;

    // Assign badges
    if (user.points >= 100 && !user.badges.includes("Top Recycler")) {
      user.badges.push("Top Recycler");
    }

    await user.save();
    res.status(200).json({ message: "Points added", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to add points" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
