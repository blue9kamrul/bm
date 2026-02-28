import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads/products");
const optimizedDir = path.join(uploadsDir, "optimized");

// Ensure optimized directory exists
if (!fs.existsSync(optimizedDir)) fs.mkdirSync(optimizedDir, { recursive: true });

// Process all images
const files = fs.readdirSync(uploadsDir).filter(f => /\.(jpe?g|png)$/i.test(f));

console.log(`Found ${files.length} images to optimize...`);

const processImage = async (inputPath, outputPath) => {
  await sharp(inputPath)
    .resize({ width: 1200 })
    .toFormat("webp", { quality: 80 })
    .toFile(outputPath);
};

(async () => {
  for (const file of files) {
    const inputPath = path.join(uploadsDir, file);
    const outputPath = path.join(optimizedDir, path.basename(file, path.extname(file)) + ".webp");

    try {
      await processImage(inputPath, outputPath);
      console.log(`✅ Optimized: ${file} → ${path.basename(outputPath)}`);
    } catch (err) {
      console.error(`💥 Failed: ${file}`, err);
    }
  }

  console.log("All existing images processed!");
})();
