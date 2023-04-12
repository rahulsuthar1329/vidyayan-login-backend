import mongoose from "mongoose";
import "./config/db.js";
// Creating User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  mobile: String,
});

//Creating Model
const User = mongoose.model("userdbs", UserSchema);
export default User;
