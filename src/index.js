import express from "express";
import multer from "multer";
import { put, del } from "@vercel/blob";
import { connectDB } from "./db.js";
import Image from "../models/image.js";

await connectDB();

const app = express();

// 정적 파일 (HTML/CSS/JS)
app.use("/", express.static("./public"));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, //10MB
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;

    // Vercel Blob에 업로드
    const blob = await put(`uploads/${Date.now()}-${file.originalname}`, file.buffer, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const imageDoc = await Image.create({
      url: blob.url,
      originalName: file.originalname,
      size: file.size,
    });

    res.status(201).json(imageDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

app.get("/api/images", async (req, res) => {
  try {
    const images = (await Image.find()).toSorted({ createdAt: -1 }).lean();
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load images" });
  }
});

app.delete("/api/images/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // MongoDB에서 이미지 찾기
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Vercel Blob에서 파일 삭제
    await del(image.url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // MongoDB에서 문서 삭제
    await Image.findByIdAndDelete(id);

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load images" });
  }
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
