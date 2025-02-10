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

// router.post("/word/sound", authMiddleware, async (req, res) => {
//   try {
//     const { userId } = req.userData; // Foydalanuvchi ID'si
//     const { word, sound } = req.body; // So‘zning _id si va ovoz (true/false)

//     if (!word || typeof sound !== "boolean") {
//       return res.status(400).json({ message: "Invalid input data" });
//     }

//     const wordDoc = await wordModel.findById(word); // _id bo‘yicha so‘zni topish

//     if (!wordDoc) {
//       return res.status(404).json({ message: "Word not found" });
//     }

//     // Oldin ovoz bergan foydalanuvchini tekshirish
//     const hasVoted = wordDoc.inspectors.some((ins) => ins.id === userId);

//     if (hasVoted) {
//       return res
//         .status(400)
//         .json({ message: "You have already voted for this word" });
//     }

//     // Yangi ovoz qo‘shish
//     wordDoc.inspectors.push({ id: userId, sound });

//     // Foyizni hisoblash
//     const totalVotes = wordDoc.inspectors.length;
//     const trueVotes = wordDoc.inspectors.filter((ins) => ins.sound).length;
//     const trustScore = Math.round((trueVotes / totalVotes) * 100); // Yaxlitlash

//     wordDoc.trustScore = trustScore; // Yangilash

//     // Agar trustScore 80% dan yuqori bo‘lsa, `isChecked = true`
//     if (trustScore >= 80) {
//       wordDoc.isChecked = true;
//     }

//     await wordDoc.save(); // Yangilangan hujjatni saqlash

//     res.json({
//       message: "Vote recorded",
//       wordDoc,
//     });
//   } catch (error) {
//     console.error("Error in /word/sound:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/word/sound", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.userData;
    const { wordId, sound } = req.body;
    const updateWord = await wordModel.findByIdAndUpdate(wordId, {
      isChecked: sound,
    });
    res.status(200).json({ status: "success", data: updateWord });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.get("/word/:id", async (req, res) => {
  try {
    const findWord = await wordModel.findById(req.params.id);
    res.json({ word: findWord });
  } catch (error) {}
});

export default router;
