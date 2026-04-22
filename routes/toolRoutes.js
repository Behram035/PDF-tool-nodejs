import express from "express";

import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

import {
  uploadPDF,
  mergePDFController,
  splitPDFController,
  compressPDFController,
  pdfToJpgController,
  jpgToPdfController,
  rotatePDFController,
  deletePagesController,
  extractPagesController,
  watermarkController,
} from "../controllers/toolController.js";

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadPDF);

router.post("/merge", protect, mergePDFController);

router.post("/split", protect, splitPDFController);

router.post("/compress", protect, compressPDFController);

router.post("/pdf-to-jpg", protect, pdfToJpgController);

router.post("/jpg-to-pdf", protect, jpgToPdfController);
router.post("/rotate", protect, rotatePDFController);
router.post("/delete-pages", protect, deletePagesController);
router.post("/extract-pages", protect, extractPagesController);
router.post("/watermark", protect, watermarkController);

export default router;
