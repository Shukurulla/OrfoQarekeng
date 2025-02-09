import express from "express";
import wordModel from "../models/word.model.js";
import authMiddleware from "../middleware/authmiddleware.js";
import userModel from "../models/user.model.js";
import detectAlphabet from "../utils/compareWord.js";

const router = express.Router();

router.post("/word/create", authMiddleware, async (req, res) => {
  try {
    const { word } = req.body;
    const findUser = await userModel.findOne({ _id: req.userData.userId });
    if (!findUser) {
      return res
        .status(401)
        .json({ status: "error", message: "Siz royhatdan otmagansiz" });
    }

    const wordSchema = {
      word,
      isChecked: false,
      owner: findUser._id,
      type: detectAlphabet(word),
    };
    const createWord = await wordModel.create(wordSchema);

    res.status(200).json({
      status: "success",
      data: createWord,
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.get("/word/new", authMiddleware, async (req, res) => {
  try {
    const newWords = await wordModel.find({ isChecked: false });
    const users = await userModel.find();
    const wordWithInfo = newWords.map((item) => {
      return {
        _id: item._id,
        word: item.word,
        isChecked: item.isChecked,
        owner: users.filter((c) => c._id == item.owner)[0].username,
        type: item.type,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
    res.json({ data: wordWithInfo });
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get("/word/correct", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const findUser = await userModel.findById(userId);
    if (!findUser) {
      return res
        .status(400)
        .json({ status: "error", message: "Bunday foydalanuvchi topilmadi" });
    }
    const findCorrectWords = await wordModel.find({
      owner: userId,
      isChecked: true,
    });
    res.json({
      status: "success",
      data: { words: findCorrectWords, total: findCorrectWords.length },
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.get("/word/search/:word", authMiddleware, async (req, res) => {
  try {
    const { word } = req.params;

    // Berilgan so‘z bilan boshlanadigan barcha so‘zlarni topish
    const words = await wordModel.find({ word: new RegExp(`^${word}`, "i") });

    res.json(words);
  } catch (error) {
    console.error("Error searching words:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/word/my-words", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const findUser = await userModel.findById(userId);
    if (!findUser) {
      return res
        .status(401)
        .json({ status: "error", message: "Bunday foydalanuvchi topilmadi" });
    }
    const myWords = await wordModel.find({ owner: userId });
    res.json({ status: "success", data: myWords });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.delete("/word/delete/:id", authMiddleware, async (req, res) => {
  try {
    const findWord = await wordModel.findById(req.params.id);
    if (!findWord) {
      return res
        .status(401)
        .json({ status: "error", message: "Bunday soz topilmadi" });
    }
    await wordModel.findByIdAndDelete(findWord._id);
    res.status(200).json({ status: "success", message: "Soz ochirildi" });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

export default router;
