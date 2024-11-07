import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import * as ejs from "https://deno.land/x/deno_ejs@v0.3.1/mod.ts";
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
      dirEntry.name !== "node_modules"
    ) {
      directories.push(dirEntry.name);
    }
  }
  return directories;
}

const currentDir = Deno.cwd();
const dirs = await getDirectories(currentDir);
console.log(dirs);

const watchedFolders = [
  "en/dist/Dev/js",
  "en/dist/Dev/scss",
  "en/ejs",
  "fr/dist/Dev/js",
  "fr/dist/Dev/scss",
];

async function compileJS(filePath: string) {
  const baseCompileFilePath = filePath.split("\\Dev\\")[0];
  const CompileFilePath = `${baseCompileFilePath}\\js`;
  const baseName = path.basename(filePath);
  const completePath = `${CompileFilePath}\\${baseName}`;
  await new Deno.Command("npx", {
    args: [
      "rollup",
      filePath,
      "--file",
      completePath,
      "--format",
      "es",
      "--treeshake",
      "--plugin",
      "terser",
    ],
    stdout: "inherit",
    stderr: "inherit",
  }).spawn();
}

async function compileCSS(filePath: string) {
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
  const templateData = { title: "Hello, Deno" };
  const template = await Deno.readTextFile(filePath);
  const html = ejs.render(template, templateData, {});
  await Deno.writeTextFile(completePath, html);
}

const watchFiles = async () => {
  const watcher = Deno.watchFs(watchedFolders);
  for await (const event of watcher) {
    if (event.kind === "modify") {
      const ePath = event.paths[0].replaceAll("/", "\\");
      if (ePath.includes("\\Dev\\scss")) {
        compileCSS(ePath);
      } else if (ePath.includes("\\Dev\\js")) {
        compileJS(ePath);
      } else if (ePath.includes("\\ejs")) {
        compileEJS(ePath);
      }
    }
  }
};

const serveFolder = async (folder: string, req: Request) => {
  const url = new URL(req.url);
  const pname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = `${folder}${pname}`;
  try {
    const file = await Deno.readFile(filePath);
    return new Response(file, { status: 200 });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
};

const startServer = async (port: number, folder: string) => {
  await serve((req) => serveFolder(folder, req), { port });
};

const main = () => {
  watchFiles();
  startServer(8000, "./en");
  startServer(8001, "./fr");
};

main();
