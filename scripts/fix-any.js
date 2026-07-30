// scripts/fix-any.js
const fs = require("fs");
const path = require("path");
const glob = require("glob");

function fixAnyTypes() {
  const files = glob.sync("app/**/*.{ts,tsx}", {
    ignore: ["**/node_modules/**", "**/generated/**", "**/*.d.ts"],
  });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf8");
    let changed = false;

    // Replace function(param: any) with function(param: unknown)
    const anyPattern = /:\s*any\b/g;
    const newContent = content.replace(anyPattern, (match) => {
      changed = true;
      return ": unknown";
    });

    // Replace data: any = await with data: ApiResponse | null = null
    const apiPattern = /let\s+(\w+)\s*:\s*any\s*=\s*await\s+res\.json\(\)/g;
    const fixedContent = newContent.replace(apiPattern, (match, varName) => {
      changed = true;
      return `let ${varName}: ApiResponse | null = null;
      try {
        ${varName} = await res.json();
      } catch {
        // Handle non-JSON response
      }`;
    });

    if (changed) {
      fs.writeFileSync(file, fixedContent);
      console.log(`✅ Fixed 'any' types in: ${file}`);
    }
  });
}

fixAnyTypes();
