import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import * as ejs from "https://deno.land/x/deno_ejs@v0.3.1/mod.ts";
import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sass = require("sass");
const path = require("node:path");

async function getDirectories(path: string) {
  const directories: string[] = [];
  for await (const dirEntry of Deno.readDir(path)) {
    if (
      dirEntry.isDirectory &&
      !dirEntry.name.startsWith(".") &&
      dirEntry.name !== "node_modules" &&
      dirEntry.name !== "repo"
    ) {
      directories.push(dirEntry.name);
    }
  }
  return directories;
}

const currentDir = Deno.cwd();
const dirs = await getDirectories(currentDir);
const ports: Record<string, number> = {};
let watchedFolders: string[] = [];

for (let i = 0; i < dirs.length; i++) {
  const dir = dirs[i];
  ports[dir] = 8000 + i;
  watchedFolders = [
    ...watchedFolders,
    ...[
      `${dir}/dist/Dev/js`,
      `${dir}/dist/Dev/scss`,
      `${dir}/dist/lan`,
      `${dir}/ejs`,
      `${dir}/patiles`,
    ],
  ];
}

watchedFolders = [...watchedFolders, "repo/js", "repo/scss", "repo/ejs"];

async function compileJS(filePath: string) {
  const baseCompileFilePath = filePath.split("\\Dev\\")[0];
  const CompileFilePath = `${baseCompileFilePath}\\js`;
  const baseName = path.basename(filePath);
  const completePath = `${CompileFilePath}\\${baseName}`;
  await new Deno.Command("rollup", {
    args: [
      "--config",
      "rollup.config.js",
      filePath,
      "--file",
      completePath,
      "--format",
      "es",
      "--treeshake",
    ],
    stdout: "inherit",
    stderr: "inherit",
  }).spawn();
}

async function compileCSS(filePath: string) {
  console.log(filePath);
  const baseCompileFilePath = filePath.split("\\Dev\\")[0];
  const CompileFilePath = `${baseCompileFilePath}\\css`;
  const baseName = path.basename(filePath);
  const completePath = `${CompileFilePath}\\${baseName.replace("scss", "css")}`;
  const result = await sass.compileAsync(filePath, {
    style: "compressed",
  });
  await Deno.writeTextFile(completePath, result.css);
}

async function compileEJS(filePath: string) {
  const baseCompileFilePath = filePath.split("\\ejs\\")[0];
  const baseName = path.basename(filePath);
  const completePath = `${baseCompileFilePath}\\${baseName.replace(
    "ejs",
    "html"
  )}`;
  const lanPath = `${baseCompileFilePath}\\dist\\lan\\index.js`;
  delete require.cache[require.resolve(lanPath)];
  let templateData = require(lanPath);
  templateData = {
    ...templateData,
    faceSSwap: JSON.stringify(templateData.faceSwap),
    allData: JSON.stringify(templateData),
    voice_Generator: JSON.stringify(templateData.voiceGenerator),
  };
  const template = await Deno.readTextFile(filePath);
  try {
    const result = await ejs.render(template, templateData, {
      filename: filePath,
      async: false,
    });
    await Deno.writeTextFile(completePath, result);
  } catch (err) {
    console.log("Error rendering EJS template:", err);
  }
}

async function getFiles(
  folderPath: string,
  suffix: string = ".ejs"
): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of Deno.readDir(folderPath)) {
    if (entry.isFile && entry.name.endsWith(suffix)) {
      files.push(entry.name);
    }
  }
  return files;
}

async function compileLan(filePath: string) {
  const baseCompileFilePath = path.dirname(filePath);
  const es6Path = `${baseCompileFilePath}\\es6.js`;
  const normalPath = `${baseCompileFilePath}\\normal.js`;
  const fileContent = await Deno.readTextFile(filePath);
  const jsonContent = fileContent.replace(/^module\.exports\s*=\s*/, "").trim();
  const es6content = `export default ${jsonContent}`;
  const normalcontent = `var jsonData = ${jsonContent}`;
  await Deno.writeTextFile(es6Path, es6content);
  await Deno.writeTextFile(normalPath, normalcontent);
  compileAllEjs(filePath);
}

async function compileAllEjs(filePath: string) {
  const baseCompileFilePath = filePath.split("\\dist\\")[0];
  const saveFilePath = `${baseCompileFilePath}\\ejs`;
  const allEjsFiles = await getFiles(saveFilePath);
  for (let i = 0; i < allEjsFiles.length; i++) {
    const filename = allEjsFiles[i];
    await compileEJS(`${saveFilePath}\\${filename}`);
  }
}

async function findImports(importPath: string) {
  const matchingFiles: string[] = [];
  for await (const entry of walk("./", { exts: [".js", ".scss", ".ejs"] })) {
    const content = await Deno.readTextFile(entry.path);
    if (
      content.includes(`from "${importPath}"`) ||
      content.includes(`../../${importPath}`) ||
      content.includes(`../../../../${importPath}`)
    ) {
      matchingFiles.push(entry.path);
    }
  }
  return matchingFiles;
}

async function compileRepoCode(filePath: string) {
  const basename = path.basename(filePath);
  if (filePath.endsWith(".js")) {
    const files = await findImports(`@js/${basename}`);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.endsWith(".js")) {
        if (file.startsWith("repo")) {
          await compileRepoCode(file);
        } else {
          await compileJS(`${Deno.cwd()}\\${file}`);
        }
      }
    }
  } else if (filePath.endsWith(".ejs")) {
    const files = await findImports(`repo/ejs/${basename}`);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.endsWith(".ejs")) {
        if (file.startsWith("repo")) {
          await compileRepoCode(file);
        } else {
          await compileEJS(`${Deno.cwd()}\\${file}`);
        }
      }
    }
  } else if (filePath.endsWith(".scss")) {
    const files = await findImports(`repo/scss/${basename}`);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.endsWith(".scss")) {
        if (file.startsWith("repo")) {
          await compileRepoCode(file);
        } else {
          await compileCSS(`${Deno.cwd()}\\${file}`);
        }
      }
    }
  }
}

const compiledFiles: Set<string> = new Set();

const watchFiles = async () => {
  const watcher = Deno.watchFs(watchedFolders);
  for await (const event of watcher) {
    if (event.kind === "modify") {
      const ePath = event.paths[0].replaceAll("/", "\\");
      if (compiledFiles.has(ePath)) continue;
      compiledFiles.add(ePath);
      if (ePath.includes("\\Dev\\scss")) {
        await compileCSS(ePath);
      } else if (ePath.includes("\\Dev\\js")) {
        await compileJS(ePath);
      } else if (ePath.includes("\\ejs") && !ePath.includes("\\repo")) {
        await compileEJS(ePath);
      } else if (ePath.includes("\\lan\\index.js")) {
        await compileLan(ePath);
      } else if (ePath.includes("\\patiles")) {
        const likeEjsPath = ePath.split("\\patiles")[0];
        await compileLan(`${likeEjsPath}\\dist\\lan\\index.js`);
      } else if (ePath.includes("\\repo")) {
        await compileRepoCode(ePath);
      }
      setTimeout(() => {
        compiledFiles.clear();
      }, 2000);
    }
  }
};

const serveFolder = async (folder: string, req: Request) => {
  const url = new URL(req.url);
  const pname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = `${folder}${pname}`;
  const extname = path.extname(filePath).toLowerCase();
  try {
    const file = await Deno.readFile(filePath);
    const headers = new Headers();
    if (extname === ".svg") {
      headers.set("Content-Type", "image/svg+xml");
    }
    return new Response(file, { status: 200, headers });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
};

const startServer = async (port: number, folder: string) => {
  await serve((req) => serveFolder(folder, req), { port });
};

const main = () => {
  watchFiles();
  for (const lan in ports) {
    startServer(ports[lan], lan);
  }
};

main();
