#!/usr/bin/env node

/**
 * FitFusion Error Fix Script
 * This script fixes common React/TypeScript errors across the application
 */

const fs = require("fs");
const path = require("path");

// Fix useToast imports
function fixUseToastImports() {
  const srcDir = path.join(__dirname, "src");

  function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, "utf8");

    // Replace useToast imports
    content = content.replace(
      /import\s*{\s*useToast\s*}\s*from\s*["']@\/components\/ui\/use-toast["'];?/g,
      `import { useToast } from "@/hooks/use-toast";`,
    );

    // Fix missing key props in map functions
    content = content.replace(
      /\.map\s*\(\s*\(([^)]+)\)\s*=>\s*<([^>]+)(?!\s+key=)/g,
      (match, params, element) => {
        const keyProp = params.includes(",")
          ? params.split(",")[1].trim()
          : "index";
        return match.replace("<" + element, `<${element} key={${keyProp}}`);
      },
    );

    // Fix useState with array destructuring
    content = content.replace(
      /useState\s*\(\s*\[\s*([^\]]*)\s*\]\s*\)/g,
      "useState<any[]>([$1])",
    );

    // Fix missing Fragment wrapping
    content = content.replace(
      /return\s*\(\s*<([^>]+)>\s*<([^>]+)>/g,
      "return (\n    <React.Fragment>\n      <$1>\n      <$2>",
    );

    fs.writeFileSync(filePath, content, "utf8");
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        replaceInFile(filePath);
      }
    });
  }

  walkDir(srcDir);
}

// Run the fixes
console.log("🔧 Fixing FitFusion errors...");
fixUseToastImports();
console.log("✅ Error fixes completed!");
