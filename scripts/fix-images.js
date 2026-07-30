// scripts/fix-images.js
const fs = require("fs");
const path = require("path");
const glob = require("glob");

function fixImages() {
  const files = glob.sync("{components,app}/**/*.{ts,tsx}", {
    ignore: ["**/node_modules/**", "**/generated/**"],
  });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf8");
    let changed = false;

    // Check if file uses img tags
    const imgPattern = /<img\s+([^>]*)>/g;

    if (imgPattern.test(content)) {
      // Add import for Image if not present
      if (!content.includes('import Image from "next/image"')) {
        content = `import Image from "next/image";\n${content}`;
        changed = true;
      }

      // Replace img with Image
      content = content.replace(/<img\s+([^>]*)>/g, (match, attrs) => {
        changed = true;
        // Extract src and alt
        const srcMatch = attrs.match(/src=["']([^"']*)["']/);
        const altMatch = attrs.match(/alt=["']([^"']*)["']/);
        const src = srcMatch ? srcMatch[1] : "";
        const alt = altMatch ? altMatch[1] : "";

        return `<Image src="${src}" alt="${alt}" width={100} height={100} />`;
      });

      if (changed) {
        fs.writeFileSync(file, content);
        console.log(`✅ Fixed images in: ${file}`);
      }
    }
  });
}

fixImages();
