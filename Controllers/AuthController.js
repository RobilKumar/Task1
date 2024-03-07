// express is needed to have Router , becoz router is of express
const express = require("express");
const { validateRegisterData } = require("../utils/AuthUtils");
const UserSchema = require("../Schemas/UserSchema");
const User = require("../Models/UserModels");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

// here creating router
const Authrouter = express.Router();

Authrouter.post("/register", async (req, res) => {
  console.log(req.body);
  const { username, email, password } = req.body;

  // clean the data
  try {
    await validateRegisterData({ email, password, username });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Data Invalid",
      error: error,
    });
  }

  try {
    await User.usernameAndEmailExist({ email, username });
    const userObj = new User({ email, username, password });
    // response return by register method will be saved in userDb variable
    const userDb = await userObj.register();
    res.send({
      status: 200,
      message: "Register success",
      data: userDb,
    });
  } catch (error) {
    //console.log(error);
    res.send({
      status: 200,
      message: "Database error",
      error: error,
    });
  }

  // return res.send("register hit");
});

Authrouter.post("/login", async (req, res) => {
  console.log("login working");

  const { loginId, password } = req.body;
  console.log(loginId, password);

  if (!loginId || !password) {
    return res.send({
      status: 400,
      message: "Missing credential",
    });
  }

  // find user with loginId

  try {
    const userDb = await User.findUserWithLoginId({ loginId });
    // comparing hashed password db and giving password
    const isMatched = await bcrypt.compare(password, userDb.password);
    if (!isMatched) {
      return res.send({
        staus: 400,
        message: "Password does not matched",
      });
    }

    // here we are modifying the session
    // and saving user object and data inside it
    // and one isAuth variable
    req.session.isAuth = true;
    req.session.user = {
      email: userDb.email,
      username: userDb.username,
      userId: userDb._id,
    };

    return res.send({
      status: 200,
      message: "login success",
    });
  } catch (error) {
    res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

// Forgot Password API Endpoint
Authrouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  console.log(email);

  try {
    // Find user by email
    const user = await UserSchema.findOne({ email });
    console.log(user);

    //const user = await User.findUserWithLoginId({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Save reset token and expiry date to user record
    user.token = resetToken;
    //user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.updateOne({ email: email }, { $set: { token: resetToken } });

    console.log(user);

    // Send password reset email with reset link containing token
    // Here, you would typically use a service like Nodemailer to send the email
    // Example:
    // sendEmail(user.email, 'Password Reset', `Click the link to reset your password: ${resetToken}`);
    // Create a Nodemailer transporter
    // Function to send password reset email
    const sendPasswordResetEmail = async (email, resetToken) => {
      // Create a Nodemailer transporter
      const transporter = nodemailer.createTransport({
        // Configure your email service or SMTP server details here
        // Example configuration for Gmail:
        service: "Gmail",

        auth: {
          user: process.env.EMAIL_USER, // Your Gmail email address
          pass: process.env.EMAIL_PASSWORD, // Your Gmail password or application-specific password
        },
      });

      // Define email options
      const mailOptions = {
        from: "robil.cs.coder@gmail.com",
        to: email,
        subject: "Password Reset",
        text: `Click the link to reset your password: http://localhost:6000/Auth/forgot-password?token=${resetToken}`,
      };

      try {
        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log("Password reset email sent:", info.response);
      } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
      }
    };

    // Example usage:
    console.log("email", email, "reset Token ", resetToken);
    sendPasswordResetEmail(email, resetToken)
      .then(() => console.log("Password reset email sent successfully"))
      .catch((error) =>
        console.error("Error sending password reset email:", error)
      );

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = Authrouter;
