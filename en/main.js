const chokidar = require("chokidar");
const express = require("express");
var ejs = require("ejs");
const path = require("path");
const fs = require("fs").promises;
const fs2 = require("fs");
const ejsSourceDir = "./ejs";
const ejsOutputDir = "./";

const app = express();

const compressAndObfuscate = async (filePath) => {
  const pathArr = filePath.split("\\");
  const filename = pathArr[pathArr.length - 1];
  const name = filename.split(".");
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    delete require.cache[require.resolve("./dist/lan/index.js")];
    let jsonData = require(`./dist/lan/index.js`);
    const templatePath = path.join(__dirname, filePath);
    ejs.renderFile(
      templatePath,
      {
        ...jsonData,
        faceSSwap: JSON.stringify(jsonData.faceSwap),
        allData: JSON.stringify(jsonData),
      },
      (err, result) => {
        if (err) {
          console.error(err);
          return;
        }
        const htmlPath = path.join(__dirname, `${name[0]}.html`);
        fs2.writeFileSync(htmlPath, result);
      }
    );
    // var result = ejs.render(fileContent.toString(), {
    //   ...jsonData,
    //   faceSSwap:JSON.stringify(jsonData.faceSwap),
    //   allData: JSON.stringify(jsonData)
    // });
    // await fs.writeFile(path.join(ejsOutputDir, `${name[0]}.html`), result);
  } catch (error) {
    console.error(`${filePath} 编译时出错：`, error);
  }
};

async function asyncEs6Json() {
  delete require.cache[require.resolve("./dist/lan/index.js")];
  let jsonData = require(`./dist/lan/index.js`);
  await fs.writeFile(
    path.join(ejsOutputDir, `./dist/lan/es6.js`),
    `var jsonData = ${JSON.stringify(
      jsonData,
      null,
      2
    )}; export default jsonData`
  );
  await fs.writeFile(
    path.join(ejsOutputDir, `./dist/lan/normal.js`),
    `var jsonData = ${JSON.stringify(jsonData, null, 2)}`
  );
}

const watcher = chokidar.watch([ejsSourceDir], {
  ignoreInitial: true,
});

function getAllFilePaths(dirPath) {
  const files = fs2.readdirSync(dirPath);
  const filePaths = [];
  for (const file of files) {
    const filePath = `${dirPath}/${file}`;
    if (fs2.statSync(filePath).isDirectory()) {
      filePaths.push(...getAllFilePaths(filePath));
    } else {
      filePaths.push(filePath);
    }
  }
  return filePaths;
}

watcher.on("change", async (filePath) => {
  if (filePath.endsWith(".ejs")) {
    await compressAndObfuscate(filePath);
  }
});

fs2.watchFile("./dist/lan/index.js", async (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    const filePaths = getAllFilePaths(ejsSourceDir);
    for (let i = 0; i < filePaths.length; i++) {
      let p = filePaths[i];
      if (p.endsWith(".ejs")) {
        p = p.replace(/\//g, "\\");
        await asyncEs6Json();
        await compressAndObfuscate(p);
      }
    }
    console.log("执行完成");
  }
});

app.use(express.static(path.join(__dirname, "./")));

console.log("正在监听文件更改...");

app.listen(9527, () => {
  console.log("Server listening on port 9527");
});
