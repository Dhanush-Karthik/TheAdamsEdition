const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const userSchema = require("./userSchema");

const User = mongoose.model("User", userSchema);

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

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
