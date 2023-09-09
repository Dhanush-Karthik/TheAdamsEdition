const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

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


// Function to encrypt the password
function encryptPassword(password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  return hashedPassword;
}

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
