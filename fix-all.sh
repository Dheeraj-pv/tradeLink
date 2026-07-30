#!/bin/bash
# fix-all.sh - Run all fixes in sequence

echo "🔧 Starting full linting fix..."

# Step 1: ESLint auto-fix
echo "📝 Running ESLint auto-fix..."
npx eslint . --fix --quiet

# Step 2: Fix React hooks
echo "📝 Fixing React hooks..."
node scripts/fix-effects.js

# Step 3: Fix any types
echo "📝 Fixing 'any' types..."
node scripts/fix-any.js

# Step 4: Fix images
echo "📝 Fixing image elements..."
node scripts/fix-images.js

# Step 5: Format code
echo "📝 Formatting code..."
npx prettier --write .

# Step 6: Check remaining issues
echo "📊 Checking remaining issues..."
npx eslint . --quiet

echo "✅ All fixes completed!"