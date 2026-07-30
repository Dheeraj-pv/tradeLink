// scripts/fix-lint.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Colors for console output
const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

console.log(
  `${colors.blue}🔧 Starting automated linting fixes...${colors.reset}\n`,
);

// 1. Auto-fix what ESLint can fix
console.log(
  `${colors.yellow}📝 Step 1: Running ESLint auto-fix...${colors.reset}`,
);
try {
  execSync("npx eslint . --fix --quiet", { stdio: "inherit" });
  console.log(`${colors.green}✅ ESLint auto-fix completed${colors.reset}\n`);
} catch (error) {
  console.log(
    `${colors.yellow}⚠️  Some issues couldn't be auto-fixed${colors.reset}\n`,
  );
}

// 2. Remove unused imports and variables
console.log(
  `${colors.yellow}📝 Step 2: Removing unused imports...${colors.reset}`,
);
try {
  execSync('npx eslint . --fix --rule "no-unused-vars: error" --quiet', {
    stdio: "inherit",
  });
  console.log(`${colors.green}✅ Unused imports removed${colors.reset}\n`);
} catch (error) {
  console.log(
    `${colors.yellow}⚠️  Some unused imports couldn't be removed${colors.reset}\n`,
  );
}

// 3. Format code
console.log(`${colors.yellow}📝 Step 3: Formatting code...${colors.reset}`);
try {
  execSync("npx prettier --write .", { stdio: "inherit" });
  console.log(`${colors.green}✅ Formatting completed${colors.reset}\n`);
} catch (error) {
  console.log(`${colors.yellow}⚠️  Formatting failed${colors.reset}\n`);
}

console.log(`${colors.green}✅ All automated fixes completed!${colors.reset}`);
console.log(
  `${colors.blue}📊 Run 'npm run lint:check' to see remaining issues${colors.reset}`,
);
