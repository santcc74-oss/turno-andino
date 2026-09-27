/* Crea artifact.html a partir de index.html para publicarlo en claude.ai
   (allá el documento ya trae <html>, <head> y <body>, así que se quitan).
   Uso: node tools/build-artifact.js */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8")
  .replace(/<!doctype html>\s*/i, "")
  .replace(/<\/?html[^>]*>\s*/gi, "")
  .replace(/<\/?head>\s*/gi, "")
  .replace(/<\/?body>\s*/gi, "")
  .replace(/<meta name="viewport"[^>]*>\s*/i, "")
  .replace(/<link rel="manifest"[^>]*>\s*/i, "");
fs.writeFileSync(path.join(root, "artifact.html"), html);
console.log("artifact.html listo");
