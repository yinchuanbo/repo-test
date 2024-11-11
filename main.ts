import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import * as ejs from "https://deno.land/x/deno_ejs@v0.3.1/mod.ts";
import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";
import { createRequire } from "node:module";

// 类型定义
type TemplateData = {
  faceSwap: unknown;
  voiceGenerator: unknown;
  [key: string]: unknown;
};

interface CompileOptions {
  filename: string;
  async: boolean;
}

// 常量配置
const require = createRequire(import.meta.url);
const sass = require("sass");
const path = require("node:path");
const { minify } = require("html-minifier-terser");

const BASE_PORT = 8000;
const WATCH_DEBOUNCE_TIME = 2000;

async function getDirectories(dirPath: string): Promise<string[]> {
  const directories: string[] = [];
  for await (const dirEntry of Deno.readDir(dirPath)) {
    if (
      dirEntry.isDirectory &&
      !dirEntry.name.startsWith(".") &&
      !["node_modules", "repo"].includes(dirEntry.name)
    ) {
      directories.push(dirEntry.name);
    }
  }
  return directories;
}

const currentDir = Deno.cwd();
const dirs = await getDirectories(currentDir);
const ports: Record<string, number> = Object.fromEntries(
  dirs.map((dir, i) => [dir, BASE_PORT + i])
);

const watchedFolders: string[] = [
  "repo/js",
  "repo/scss",
  "repo/ejs",
  ...dirs.flatMap((dir) => [
    `${dir}/dist/Dev/js`,
    `${dir}/dist/Dev/scss`,
    `${dir}/dist/lan`,
    `${dir}/ejs`,
    `${dir}/patiles`,
  ]),
];

async function compileJS(filePath: string): Promise<void> {
  const baseCompileFilePath = filePath.split("\\Dev\\")[0];
  const compileFilePath = path.join(baseCompileFilePath, "js");
  const baseName = path.basename(filePath);
  const completePath = path.join(compileFilePath, baseName);

  const command = new Deno.Command("rollup", {
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
  });

  await command.spawn();
}

async function compileCSS(filePath: string): Promise<void> {
  const baseCompileFilePath = filePath.split("\\Dev\\")[0];
  const compileFilePath = path.join(baseCompileFilePath, "css");
  const baseName = path.basename(filePath);
  const completePath = path.join(
    compileFilePath,
    baseName.replace("scss", "css")
  );

  const result = await sass.compileAsync(filePath, {
    style: "compressed",
  });
  await Deno.writeTextFile(completePath, result.css);
}

async function compileEJS(filePath: string): Promise<void> {
  const baseCompileFilePath = filePath.split("\\ejs\\")[0];
  const baseName = path.basename(filePath);
  const completePath = path.join(
    baseCompileFilePath,
    baseName.replace("ejs", "html")
  );
  const lanPath = path.join(baseCompileFilePath, "dist", "lan", "index.js");

  delete require.cache[require.resolve(lanPath)];
  const rawTemplateData = require(lanPath) as TemplateData;

  const templateData: TemplateData = {
    ...rawTemplateData,
    faceSSwap: JSON.stringify(rawTemplateData.faceSwap),
    allData: JSON.stringify(rawTemplateData),
    voice_Generator: JSON.stringify(rawTemplateData.voiceGenerator),
  };

  try {
    const template = await Deno.readTextFile(filePath);
    const options: CompileOptions = {
      filename: filePath,
      async: false,
    };
    const result = await ejs.render(template, templateData, options);
    const minifiedContent = await minify(result, {
      collapseWhitespace: true,
      removeComments: true,
    });
    await Deno.writeTextFile(completePath, minifiedContent);
  } catch (err) {
    console.error("Error rendering EJS template:", err);
  }
}

async function getFiles(
  folderPath: string,
  suffix = ".ejs"
): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of Deno.readDir(folderPath)) {
    if (entry.isFile && entry.name.endsWith(suffix)) {
      files.push(entry.name);
    }
  }
  return files;
}

async function compileLan(filePath: string): Promise<void> {
  const baseCompileFilePath = path.dirname(filePath);
  const es6Path = path.join(baseCompileFilePath, "es6.js");
  const normalPath = path.join(baseCompileFilePath, "normal.js");

  const fileContent = await Deno.readTextFile(filePath);
  const jsonContent = fileContent.replace(/^module\.exports\s*=\s*/, "").trim();
  const es6content = `export default ${jsonContent}`;
  const normalcontent = `var jsonData = ${jsonContent}`;

  await Promise.all([
    Deno.writeTextFile(es6Path, es6content),
    Deno.writeTextFile(normalPath, normalcontent),
  ]);

  await compileAllEjs(filePath);
}

async function compileAllEjs(filePath: string): Promise<void> {
  const baseCompileFilePath = filePath.split("\\dist\\")[0];
  const saveFilePath = path.join(baseCompileFilePath, "ejs");
  const allEjsFiles = await getFiles(saveFilePath);

  await Promise.all(
    allEjsFiles.map((filename) => compileEJS(path.join(saveFilePath, filename)))
  );
}

async function findImports(importPath: string): Promise<string[]> {
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

async function compileRepoCode(filePath: string): Promise<void> {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath);
  const cwd = Deno.cwd();

  let importPath: string;
  let compileFunction: (file: string) => Promise<void>;

  switch (ext) {
    case ".js":
      importPath = `@js/${basename}`;
      compileFunction = compileJS;
      break;
    case ".scss":
      importPath = `repo/scss/${basename}`;
      compileFunction = compileCSS;
      break;
    case ".ejs":
      importPath = `repo/ejs/${basename}`;
      compileFunction = compileEJS;
      break;
    default:
      return;
  }

  const files = await findImports(importPath);
  await Promise.all(
    files.map(async (file) => {
      if (file.startsWith("repo")) {
        await compileRepoCode(file);
      } else {
        await compileFunction(path.join(cwd, file));
      }
    })
  );
}

const compiledFiles: Set<string> = new Set();

async function switchFiles(ePath = ""): Promise<void> {
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
    await compileLan(path.join(likeEjsPath, "dist", "lan", "index.js"));
  } else if (ePath.includes("\\repo")) {
    await compileRepoCode(ePath);
  }
}

async function watchFiles(): Promise<void> {
  const watcher = Deno.watchFs(watchedFolders);
  for await (const event of watcher) {
    if (event.kind === "modify") {
      const ePath = event.paths[0].replaceAll("/", "\\");
      if (compiledFiles.has(ePath)) continue;
      compiledFiles.add(ePath);
      await switchFiles(ePath);
      setTimeout(() => {
        compiledFiles.clear();
      }, WATCH_DEBOUNCE_TIME);
    }
  }
}

async function serveFolder(folder: string, req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = `${folder}${pname}`;
  const extname = path.extname(filePath).toLowerCase();

  const contentTypes: Record<string, string> = {
    ".svg": "image/svg+xml",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
  };

  const headers = new Headers();
  headers.set(
    "Content-Type",
    contentTypes[extname] || "application/octet-stream"
  );

  try {
    const file = await Deno.readFile(filePath);
    return new Response(file, { status: 200, headers });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

async function startServer(port: number, folder: string): Promise<void> {
  await serve((req) => serveFolder(folder, req), {
    port,
    onListen({ port }) {
      console.log(`${folder} Server started at http://localhost:${port}`);
    },
  });
}

function main(): void {
  watchFiles();
  Object.entries(ports).forEach(([folder, port]) => {
    startServer(port, folder);
  });
}

main();
