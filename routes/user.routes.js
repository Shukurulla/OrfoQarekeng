import express from "express";
import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/token.js";

const router = express.Router();

router.post("/user/sign", async (req, res) => {
  try {
    const { username, password } = req.body;
    const findUser = await userModel.findOne({ username });
    if (findUser) {
      return res.status(401).json({
        status: "error",
        message: "Bunday foydalanuvchi oldin royhatdan otgan",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      ...req.body,
      password: hashedPassword,
    });
    const token = generateToken(user._id);
    res.status(200).json({ status: "success", data: user, token });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const findUser = await userModel.findOne({ username });
    if (!findUser) {
      return res
        .status(401)
        .json({ status: "error", message: "Bunday foydalanuvchi topilmadi" });
    }
    const comparePassword = await bcrypt.compare(password, findUser.password);

    if (!comparePassword) {
      return res
        .status(401)
        .json({ status: "error", message: "Password mos kelmadi" });
    }

    const token = generateToken(findUser._id);

    res.status(200).json({ status: "success", data: findUser, token });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

export default router;
