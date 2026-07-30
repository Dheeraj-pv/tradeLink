// scripts/fix-effects.js
const fs = require("fs");
const path = require("path");
const glob = require("glob");

function fixEffectFiles() {
  const files = glob.sync("app/**/*.{ts,tsx}", {
    ignore: ["**/node_modules/**", "**/generated/**"],
  });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf8");
    let changed = false;

    // Pattern 1: useEffect(() => { fetchX(); }, []);
    // Should be: useEffect(() => { async function load() { await fetchX(); } load(); }, []);
    const effectPattern =
      /useEffect\(\s*\(\s*\)\s*=>\s*\{\s*(\w+)\s*\(\s*\)\s*;?\s*\},\s*\[(\w*)\s*\]\s*\)/g;

    content = content.replace(effectPattern, (match, functionName, deps) => {
      changed = true;
      return `useEffect(() => {
  async function loadData() {
    await ${functionName}();
  }
  loadData();
}, [${deps}])`;
    });

    if (changed) {
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed effects in: ${file}`);
    }
  });
}

fixEffects();
