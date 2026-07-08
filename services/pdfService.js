import fs from "fs";
import path from "path";
import { PDFDocument, degrees, rgb } from "pdf-lib";
import PDFDocument2 from "pdfkit";
import { exec } from "child_process";
import pdf from "pdf-poppler";
import archiver from "archiver";

export const mergePDFs = async (files) => {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const pdfBytes = fs.readFileSync(file.path);

    const pdf = await PDFDocument.load(pdfBytes);

    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();

  const outputPath = `processed/merged-${Date.now()}.pdf`;

  fs.writeFileSync(outputPath, mergedBytes);

  return outputPath;
};

export const splitPDF = async (filePath, ranges = []) => {
  const pdfBytes = fs.readFileSync(filePath);

  const pdfDoc = await PDFDocument.load(pdfBytes);

  const totalPages = pdfDoc.getPageCount();

  // default split every page
  if (!ranges.length) {
    ranges = Array.from({ length: totalPages }, (_, i) => (i + 1).toString());
  }

  const outputs = [];

  for (let range of ranges) {
    let pages = [];

    if (range.includes("-")) {
      const [start, end] = range.split("-").map(Number);

      for (let i = start; i <= end; i++) {
        if (i <= totalPages) pages.push(i - 1);
      }
    } else {
      const page = Number(range);

      if (page <= totalPages) pages.push(page - 1);
    }

    if (!pages.length) continue;

    const newPdf = await PDFDocument.create();

    const copiedPages = await newPdf.copyPages(pdfDoc, pages);

    copiedPages.forEach((p) => newPdf.addPage(p));

    const bytes = await newPdf.save();

    const filename = `split-${Date.now()}-${range}.pdf`;

    const outputPath = path.join("processed", filename);

    fs.writeFileSync(outputPath, bytes);

    outputs.push(outputPath);
  }

  // create zip
  const zipName = `split-${Date.now()}.zip`;

  const zipPath = path.join("processed", zipName);

  await createZip(outputs, zipPath);

  return {
    zipPath,
    files: outputs,
  };
};

/*
ZIP CREATOR FUNCTION
*/
const createZip = (files, zipPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", resolve);

    archive.on("error", reject);

    archive.pipe(output);

    files.forEach((file) => {
      archive.file(file, {
        name: path.basename(file),
      });
    });

    archive.finalize();
  });
};

export const compressPDF = (inputPath) => {
  return new Promise((resolve, reject) => {
    const outputPath = `processed/compressed-${Date.now()}.pdf`;

    const command = `gs -sDEVICE=pdfwrite \
-dCompatibilityLevel=1.4 \
-dPDFSETTINGS=/screen \
-dNOPAUSE -dQUIET -dBATCH \
-sOutputFile=${outputPath} ${inputPath}`;

    exec(command, (error) => {
      if (error) return reject(error);

      resolve(outputPath);
    });
  });
};

export const pdfToJpg = async (filePath) => {
  const outputDir = "processed";
  const prefix = `pdf-img-${Date.now()}`;

  const options = {
    format: "jpeg",
    out_dir: outputDir,
    out_prefix: prefix,
    page: null,
  };

  await pdf.convert(filePath, options);

  // Get list of generated JPG files
  const files = fs.readdirSync(outputDir);
  const jpgFiles = files
    .filter((file) => file.startsWith(prefix) && file.endsWith(".jpg"))
    .map((file) => path.join(outputDir, file));

  // Create ZIP with all JPG files
  const zipName = `pdf-to-jpg-${Date.now()}.zip`;
  const zipPath = path.join(outputDir, zipName);

  await createZip(jpgFiles, zipPath);

  return {
    zipPath,
    files: jpgFiles,
  };
};

export const jpgToPdf = async (imagePaths) => {
  return new Promise((resolve) => {
    const outputPath = `processed/jpg-to-pdf-${Date.now()}.pdf`;

    const doc = new PDFDocument2();

    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    imagePaths.forEach((img, index) => {
      if (index !== 0) doc.addPage();

      doc.image(img.path, {
        fit: [500, 700],
        align: "center",
        valign: "center",
      });
    });

    doc.end();

    stream.on("finish", () => resolve(outputPath));
  });
};

export const rotatePDF = async (filePath, angle = 90) => {
  const bytes = fs.readFileSync(filePath);

  const pdfDoc = await PDFDocument.load(bytes);

  const pages = pdfDoc.getPages();

  pages.forEach((page) => page.setRotation(degrees(angle)));

  const outputPath = `uploads/rotated-${Date.now()}.pdf`;

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
};

export const deletePages = async (filePath, pagesToRemove) => {
  const pdfDoc = await PDFDocument.load(fs.readFileSync(filePath));

  pagesToRemove
    .sort((a, b) => b - a)
    .forEach((pageIndex) => pdfDoc.removePage(pageIndex));

  const outputPath = `uploads/deleted-pages-${Date.now()}.pdf`;

  fs.writeFileSync(outputPath, await pdfDoc.save());

  return outputPath;
};

export const extractPages = async (filePath, pages) => {
  const pdfDoc = await PDFDocument.load(fs.readFileSync(filePath));

  const newDoc = await PDFDocument.create();

  const copiedPages = await newDoc.copyPages(pdfDoc, pages);

  copiedPages.forEach((page) => newDoc.addPage(page));

  const outputPath = `uploads/extracted-${Date.now()}.pdf`;

  fs.writeFileSync(outputPath, await newDoc.save());

  return outputPath;
};

export const addWatermark = async (filePath, text) => {
  const pdfDoc = await PDFDocument.load(fs.readFileSync(filePath));

  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    page.drawText(text, {
      x: 50,
      y: 300,

      size: 40,

      opacity: 0.3,

      color: rgb(0.75, 0.75, 0.75),
    });
  });

  const outputPath = `uploads/watermarked-${Date.now()}.pdf`;

  fs.writeFileSync(outputPath, await pdfDoc.save());

  return outputPath;
};
