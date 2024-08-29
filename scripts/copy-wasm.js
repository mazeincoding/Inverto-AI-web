const fs = require("fs");
const path = require("path");

const sourceDir = path.join(
  __dirname,
  "..",
  "node_modules",
  "onnxruntime-web",
  "dist"
);
const targetDir = path.join(__dirname, "..", "public");

fs.readdirSync(sourceDir)
  .filter((file) => file.endsWith(".wasm"))
  .forEach((file) => {
    fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
    console.log(`Copied ${file} to public directory`);
  });
