const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "..", "public");

for (const file of fs.readdirSync(publicDir)) {
  if (!file.endsWith(".b64")) continue;
  const src = path.join(publicDir, file);
  const dest = path.join(publicDir, file.replace(/\.b64$/, ""));
  fs.writeFileSync(dest, Buffer.from(fs.readFileSync(src, "utf8"), "base64"));
}
