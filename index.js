import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import UserRouter from "./routes/user.routes.js";
import WordRouter from "./routes/word.routes.js";
import cors from "cors";
config();
const app = express();

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log(`database connected`);
});

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(UserRouter);
app.use(WordRouter);

app.listen(process.env.PORT, () => {
  console.log(`server has ben started on port ${process.env.PORT}`);
});
