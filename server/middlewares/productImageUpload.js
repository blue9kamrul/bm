import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productUploadsDir = path.join(__dirname, "../uploads/products");
const optimizedDir = path.join(productUploadsDir, "optimized");

// Ensure directories exist
[productUploadsDir, optimizedDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, productUploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${fileExtension}`);
  },
});

// File filter: images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

// Multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array("productImages", 4);

// Sharp processing function
const processImage = async (filePath, outputPath) => {
  await sharp(filePath)
    .resize({ width: 1200 })
    .toFormat("webp", { quality: 80 })
    .toFile(outputPath);
};

// Middleware
export const productImageUpload = (req, res, next) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("💥 Multer Error:", err);
      return res.status(400).json({ message: err.message });
    }

    // ✅ Check if files exist before processing
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const outputPath = path.join(
            optimizedDir,
            path.basename(file.filename, path.extname(file.filename)) + ".webp"
          );
          await processImage(file.path, outputPath);
          file.optimizedPath = outputPath;
        }
        console.log(`✅ Files uploaded and optimized: ${req.files.length} files`);
      } catch (e) {
        console.error("💥 Image Processing Error:", e);
        return res.status(500).json({ message: "Image processing failed" });
      }
    } else {
      // ✅ No files uploaded - this is fine for updates without images
      console.log("ℹ️ No files uploaded - proceeding with other updates");
    }

    next();
  });
};

// Export paths for other uses
export const productUploadsPath = productUploadsDir;
export const productOptimizedPath = optimizedDir;