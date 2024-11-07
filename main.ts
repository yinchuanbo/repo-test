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
  const templateData = { title: "Hello, Deno" };
  const template = await Deno.readTextFile(filePath);
  const html = ejs.render(template, templateData, {});
  await Deno.writeTextFile(completePath, html);
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
      } else if (ePath.includes("\\ejs")) {
        await compileEJS(ePath);
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
