const chokidar = require("chokidar");
const { minify } = require("terser");
const fs = require("fs").promises;
const path = require("path");
const sass = require("node-sass");
const jsSourceDir = "../js";
const jsOutputDir = "../../js";
const scssSourceDir = "../scss";
const cssOutputDir = "../../css";

const compressAndObfuscate = async (filePath) => {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const minified = await minify(fileContent);
    await fs.writeFile(
      path.join(jsOutputDir, path.basename(filePath)),
      minified.code
    );
    console.log(`文件 ${filePath} 压缩和混淆成功！`);
  } catch (error) {
    console.error(`压缩和混淆文件 ${filePath} 时出错：`, error);
  }
};

const compileSCSS = (filePath) => {
  return new Promise((resolve, reject) => {
    const outputFilePath = path.join(
      cssOutputDir,
      path.basename(filePath).replace(".scss", ".css")
    );
    sass.render(
      {
        file: filePath,
        outputStyle: "compressed",
        outFile: outputFilePath,
      },
      (error, result) => {
        if (!error) {
          fs.writeFile(outputFilePath, result.css)
            .then(() => {
              console.log(`SCSS 文件 ${filePath} 编译成功！`);
              resolve();
            })
            .catch((error) => {
              console.error(
                `写入编译后的 SCSS 文件 ${outputFilePath} 时出错：`,
                error
              );
              reject(error);
            });
        } else {
          console.error(`编译 SCSS 文件 ${filePath} 时出错：`, error);
          reject(error);
        }
      }
    );
  });
};

const watcher = chokidar.watch([jsSourceDir, scssSourceDir], {
  ignoreInitial: true,
});

watcher.on("change", async (filePath) => {
  console.log(`文件 ${filePath} 已更改。`);
  if (filePath.endsWith(".js")) {
    console.log("正在压缩和混淆 JavaScript...");
    try {
      await compressAndObfuscate(filePath);
    }catch (e) {
      console.log(e)
    }
  } else if (filePath.endsWith(".scss")) {
    console.log("正在编译 SCSS...");
    try {
      await compileSCSS(filePath);
    } catch (e) {
      console.log(e)
    }

  }
});


console.log("正在监听文件更改...");
