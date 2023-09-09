const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const userSchema = require("./userSchema");

const User = mongoose.model("User", userSchema);

// Admin endpoint
app.post("/admin", async (req, res) => {
    try {
      const { email, password } = req.body;
      const encryptedPassword = encryptPassword(password); // Encrypt the password
      const newUser = new User({
        email,
        emailVerified: false,
        roles: ["admin"],
        password: encryptedPassword,
      });
      await newUser.save();
      const newUserWithoutPassword = newUser.toObject();
      delete newUserWithoutPassword.password;
      res.status(201).json(newUserWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Admin usage
  // Get all users only for development
  app.get("/users", async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete a user by ID
  app.delete("/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findByIdAndDelete(userId).select("-password");
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// Public Endpoints
// Register a user
app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, address } =
      req.body;
    const encryptedPassword = encryptPassword(password); // Encrypt the password
    const newUser = new User({
      firstName,
      lastName,
      email,
      emailVerified: false,
      roles: ["user"],
      password: encryptedPassword,
      dateOfBirth,
      address,
    });
    await newUser.save();
    const newUserWithoutPassword = newUser.toObject();
    delete newUserWithoutPassword.password;
    res.status(201).json(newUserWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Validate or Generate JWT token
app.post("/token", async (req, res) => {
  try {
    let accessToken = req.headers.authorization;
    // Verify the access token
    if (accessToken) {
      if (accessToken.split(" ").length > 1) {
        accessToken = accessToken.split(" ")[1];
      }

      jwt.verify(accessToken, "dhanushsecrete", (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: "Token Invalid" });
        } else {
          return res.json({ message: "Valid token" });
        }
      });
    }
    // Generates access token
    else {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      const isMatch = await bcrypt.compare(password, user.password);
      if (user && isMatch) {
        const payload = {
          sub: user.id,
          iss: "http://localhost:3000",
          typ: "Bearer",
          email: user.email,
          roles: user.roles,
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          createdAt: user.createdAt,
        };

        const token = jwt.sign(payload, "dhanushsecrete", { expiresIn: 60 });
        res.cookie("token", token); // Add token to the cookie
        return res.status(200).json({ token });
      } else {
        console.log("hehe");
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to encrypt the password
function encryptPassword(password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  return hashedPassword;
}

// Get user info by ID
app.get("/user-info/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId).select("-password");
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Update a user by ID
app.put("/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const updatedUser = req.body;
      const user = await User.findByIdAndUpdate(userId, updatedUser, {
        new: true,
      }).select("-password");
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
