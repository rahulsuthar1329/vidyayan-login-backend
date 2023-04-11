import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected Successfully!");
  })
  .catch((err) => {
    console.log("Error connecting database : ", err);
  });
