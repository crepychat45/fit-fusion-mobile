#!/usr/bin/env node

/**
 * FitFusion Error Fix Script - Updated
 * This script fixes common React/TypeScript errors across the application
 */

const fs = require("fs");
const path = require("path");

// Fix useToast imports in all files
function fixAllImports() {
  const srcDir = path.join(__dirname, "src");

  function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, "utf8");
    let changed = false;

    // Replace useToast imports
    const oldToastImport =
      /import\s*{\s*useToast\s*}\s*from\s*["']@\/components\/ui\/use-toast["'];?/g;
    if (oldToastImport.test(content)) {
      content = content.replace(
        oldToastImport,
        `import { useToast } from "@/hooks/use-toast";`,
      );
      changed = true;
    }

    // Fix missing key props in map functions - improved regex
    const mapKeyRegex =
      /\.map\s*\(\s*\(([^)]+)\)\s*=>\s*<([^>\s]+)(?![^>]*\skey=)/g;
    content = content.replace(mapKeyRegex, (match, params, element) => {
      const keyProp = params.includes(",")
        ? params.split(",")[1].trim()
        : "index";
      const replacement = match.replace(
        "<" + element,
        `<${element} key={${keyProp}}`,
      );
      changed = true;
      return replacement;
    });

    // Fix React fragment issues
    const fragmentRegex = /return\s*\(\s*(<[^>]+>[\s\S]*?<[^>]+>)/g;
    content = content.replace(fragmentRegex, (match, jsxContent) => {
      if (jsxContent.match(/<[^>]+>\s*<[^>]+>/)) {
        changed = true;
        return match
          .replace("return (", "return (\n    <React.Fragment>")
          .replace(jsxContent, `${jsxContent}\n    </React.Fragment>`);
      }
      return match;
    });

    if (changed) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Fixed: ${filePath}`);
    }
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
console.log("🔧 Running FitFusion error fixes...");
fixAllImports();
console.log("✅ All fixes completed!");
