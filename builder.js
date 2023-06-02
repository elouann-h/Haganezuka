const fs = require("fs");

// All the folders of the "./lib" folder.
const folders = fs.readdirSync("./lib");

fs.rm("./lib", { recursive: true, force: true }, (err) => {
  if (err) throw err;
  console.log("Deleted ./lib");
  fs.mkdirSync("./lib");
});