import express from "express";
import User from "../models/User.js";
import otp, { generate } from "otp-generator";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Vonage } from "@vonage/server-sdk";
import database from "../config/db.js";

dotenv.config();

// Create Rotuer
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const vonage = new Vonage({
  apiKey: "fa21b407",
  apiSecret: "Yyh6FoO2Eb9XEIyk",
});

async function sendSMS(otpnumber, mobile) {
  const from = "Vonage APIs";
  const to = mobile.slice(1);
  const text = `Your OTP is : ${otpnumber}`;
  await vonage.sms
    .send({ to, from, text })
    .then((resp) => {
      console.log("Message sent successfully");
      console.log(resp);
    })
    .catch((err) => {
      console.log("There was an error sending the messages.");
      console.error(err);
    });
}

const generateOTP = () => {
  const otpnumber = otp.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  return otpnumber;
};

router.get("/", (req, res) => {
  res.send("Ony signin and signup is allowed");
});

// signup
router.post("/signup", async (req, res) => {
  await database();
  try {
    let { name, email, password, mobile } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    mobile = mobile.trim();

    const otpnumber = generateOTP();

    const mailOptions = {
      from: "rahulsuthar1329@gmail.com",
      to: email,
      subject: `Verification Code`,
      text: `Your OTP is : ${otpnumber}`,
    };

    if (!name || !email || !password || !mobile) {
      res.status(401).json({
        message: "Invalid Input",
      });
    } else if (!/^[a-zA-Z ]*$/.test(name)) {
      res.status(401).json({
        message: "Invalid name",
      });
    } else if (!/^[\w-\.]+@([\w]+\.)+[\w-]{2,4}$/.test(email)) {
      res.status(401).json({
        message: "Invalid email",
      });
    } else if (password.length < 8) {
      res.status(401).json({
        message: "Invalid password",
      });
    } else if (!/^(\+([1-9][0-9]))?[1-9]\d{9}$/.test(mobile)) {
      res.status(401).json({
        message: "Invalid Mobile No.",
      });
    } else {
      // check if the user already exists
      const user = await User.find({ email });
      if (user.length) {
        // User already exists
        res.json({
          message: "User already exist. Go to Login Page.",
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          mobile,
        });
        const result = await newUser.save();

        await transporter.sendMail(mailOptions);
        await sendSMS(otpnumber, mobile);

        res.status(201).json({
          user: result,
          message: "OTP sent to Email and SMS successfully.",
          otp: otpnumber,
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occured while checking the existing user",
    });
    console.log(error);
  }
});

// signin
router.post("/signin", async (req, res) => {
  await database();
  try {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();

    const user = await User.find({ email });
    console.log(user);
    if (user[0].password === password) {
      const otpnumber = generateOTP();

      const mailOptions = {
        from: "rahulsuthar1329@gmail.com",
        to: email,
        subject: `Verification Code`,
        text: `Your OTP is : ${otpnumber}`,
      };

      await transporter.sendMail(mailOptions);
      await sendSMS(otpnumber, user[0].mobile.slice(1));

      res.status(200).json({
        user,
        message: "OTP send to Mail and SMS successfully.",
        otp: otpnumber,
        success: true,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid Credentials!",
      });
    }
  } catch (error) {
    res.status(401).send({ msg: "Error occurred while logging in.!" });
    console.log(error);
  }
});

export default router;
