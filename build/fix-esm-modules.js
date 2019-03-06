/**
 * Fixes the esm modules for browser compatibility
 * * Rename files to use mjs extension
 * * Append ".mjs" to references in import statements.
 */

const fs = require("fs").promises;
const path = require("path");
const esmDir = "dist/esm";

// run self executing, async function.
(async () => {
  // Get all filenames in the esm folder.
  const filenames = await fs.readdir(esmDir);

  const jsRe = /\b\.js$/;
  for (let fn of filenames) {
    // Skip files that don't end with .js.
    if (!jsRe.test(fn)) {
      continue;
    }
    // Combine folder and filename.
    fn = path.join(esmDir, fn);
    // Create the new filename by replacing the extension.
    const newName = fn.replace(jsRe, ".mjs");

    // Open file, change extensions.
    let fileContents = await fs.readFile(fn, {
      encoding: "utf-8"
    });

    // This Regex matches a reference to a local module.
    const fileRefRe = /"(\.\/[^\.]+?)"/g;

    // Replace the references to .js files (in file the .js extension is omitted) with equivalent .mjs files.
    fileContents = fileContents.replace(fileRefRe, '"$1.mjs"');
    await fs.writeFile(fn, fileContents, {
      encoding: "utf-8"
    });

    // Rename .js files to .mjs.
    console.log(`Renaming ${fn} to ${newName}`);
    await fs.rename(fn, newName);
  }
})();
