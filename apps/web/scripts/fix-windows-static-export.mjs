import { copyFile, readdir } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("out");

async function flattenSegmentDirectory(parent, segmentDirectory) {
  const sourceRoot = path.join(parent, segmentDirectory);

  async function copyFiles(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const source = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await copyFiles(source);
        continue;
      }

      const relative = path.relative(sourceRoot, source).split(path.sep).join(".");
      await copyFile(source, path.join(parent, `${segmentDirectory}.${relative}`));
    }
  }

  await copyFiles(sourceRoot);
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("__next.")) {
      await flattenSegmentDirectory(directory, entry.name);
    } else {
      await walk(path.join(directory, entry.name));
    }
  }
}

await walk(outputDirectory);
