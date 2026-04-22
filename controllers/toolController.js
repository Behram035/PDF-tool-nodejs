import File from "../models/File.js";
import History from "../models/History.js";

import {
  mergePDFs,
  splitPDF,
  compressPDF,
  pdfToJpg,
  jpgToPdf,
  rotatePDF,
  deletePages,
  extractPages,
  addWatermark,
} from "../services/pdfService.js";

/*
UPLOAD FILE
*/
export const uploadPDF = async (req, res) => {
  try {
    const file = await File.create({
      filename: req.file.filename,
      path: req.file.path,
      user: req.user?._id || null,
    });

    res.json(file);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/*
MERGE PDF
*/
export const mergePDFController = async (req, res) => {
  try {
    const files = await File.find({
      _id: { $in: req.body.fileIds },
    });

    const mergedFile = await mergePDFs(files);

    await History.create({
      tool: "merge",
      inputFiles: files,
      outputFile: {
        filename: mergedFile.split("/").pop(),
        path: mergedFile,
      },
      status: "success",
      user: req.user?._id,
    });

    res.json({
      success: true,
      result: mergedFile,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const splitPDFController = async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({
        error: "fileId required",
      });
    }

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    const result = await splitPDF(file.path);

    if (!result?.zipPath) {
      return res.status(500).json({
        error: "ZIP creation failed",
      });
    }

    await History.create({
      tool: "split",
      inputFiles: [file],
      outputFile: {
        filename: result.zipPath.split("/").pop(),
        path: result.zipPath,
      },
      status: "success",
      user: req.user?._id || null,
    });

    res.json({
      success: true,
      zip: result.zipPath,
    });
  } catch (err) {
    console.error("Split error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};

/*
COMPRESS PDF
*/
export const compressPDFController = async (req, res) => {
  try {
    const file = await File.findById(req.body.fileId);

    if (!file) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    const result = await compressPDF(file.path);

    await History.create({
      tool: "compress",
      inputFiles: [file],
      outputFile: {
        filename: result.split("/").pop(),
        path: result,
      },
      status: "success",
      user: req.user?._id,
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/*
PDF → JPG
*/
export const pdfToJpgController = async (req, res) => {
  try {
    const { fileId } = req.body;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    const result = await pdfToJpg(file.path);

    if (!result?.zipPath) {
      return res.status(500).json({
        error: "ZIP creation failed",
      });
    }

    await History.create({
      tool: "pdf-to-jpg",
      inputFiles: [file],
      outputFile: {
        filename: result.zipPath.split("/").pop(),
        path: result.zipPath,
      },
      status: "success",
      user: req.user?._id,
    });

    res.json({
      success: true,
      zip: result.zipPath,
    });
  } catch (error) {
    console.error("PDF to JPG error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

/*
JPG → PDF
*/
export const jpgToPdfController = async (req, res) => {
  try {
    const { fileIds } = req.body;

    const images = await File.find({
      _id: { $in: fileIds },
    });

    if (!images.length) {
      return res.status(404).json({
        error: "Images not found",
      });
    }

    const pdfFile = await jpgToPdf(images);

    await History.create({
      tool: "jpg-to-pdf",
      inputFiles: images,
      outputFile: {
        filename: pdfFile.split("/").pop(),
        path: pdfFile,
      },
    });

    res.json({
      success: true,
      result: pdfFile,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const rotatePDFController = async (req, res) => {
  try {
    const file = await File.findById(req.body.fileId);

    const result = await rotatePDF(file.path, req.body.angle || 90);

    res.json({
      success: true,
      result,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export const deletePagesController = async (req, res) => {
  const file = await File.findById(req.body.fileId);

  const result = await deletePages(file.path, req.body.pages);

  res.json({
    success: true,
    result,
  });
};

export const extractPagesController = async (req, res) => {
  const file = await File.findById(req.body.fileId);

  const result = await extractPages(file.path, req.body.pages);

  res.json({
    success: true,
    result,
  });
};

export const watermarkController = async (req, res) => {
  try {
    const file = await File.findById(req.body.fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    const result = await addWatermark(file.path, req.body.text);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Watermark error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
