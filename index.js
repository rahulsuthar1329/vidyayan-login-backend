import express from "express";
import userApi from "./api/userApi.js";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import "./config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/user", userApi);

app.get("/", (req, res) => {
  res.status(200).send("Api for Login and Register");
});

app.listen(port, () => {
  console.log(`server listening at port ${port}`);
});
