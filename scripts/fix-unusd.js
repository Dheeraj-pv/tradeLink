// scripts/fix-unused.js
const fs = require("fs");
const path = require("path");
const glob = require("glob");

function fixUnusedVars() {
  const files = glob.sync("app/**/*.{ts,tsx}", {
    ignore: ["**/node_modules/**", "**/generated/**"],
  });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf8");
    let changed = false;

    // Pattern: const unusedVar = something; but never used
    // This is complex - better to let ESLint handle it
    // But we can add comments to suppress warnings for intentional unused vars

    const pattern = /(\w+)\s*=\s*[^;]+;\s*(?!.*\1)/g;
    // Only if we can reliably detect unused vars...

    if (changed) {
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed unused vars in: ${file}`);
    }
  });
}

fixUnusedVars();
