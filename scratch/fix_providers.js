const fs = require('fs');
const path = require('path');

const providers = ['notes', 'projects', 'goals', 'habits', 'finance', 'diary', 'cms', 'achievements'];

providers.forEach(p => {
  const file = path.join('c:\\Users\\Dell\\3D Objects\\hilmi_os', 'src', 'features', 'ai', 'knowledge', 'providers', p + '.provider.ts');
  let content = fs.readFileSync(file, 'utf8');

  // Replace 'normal' with 'medium'
  content = content.replace(/'normal'/g, "'medium'");

  // Delete metadata line completely
  // The line usually looks like `metadata: { id: proj.id, status: proj.status }` or `metadata: { id: item.id }`
  content = content.replace(/\s*metadata:\s*\{[^}]*\}/g, "");
  // also handle dangling comma from the line before if needed, but in TS dangling comma in object literal is fine.
  
  // Also we might have trailing commas left over, but TS allows them.

  // Add invalidateCache() { knowledgeCache.invalidate(this.name); } before the class ends.
  // Find the last closing brace of the class
  if (!content.includes('invalidateCache()')) {
    const classMatch = content.match(/class\s+\w+\s+implements\s+IKnowledgeProvider\s*\{/);
    if (classMatch) {
      // Find where the class ends by looking for `import { moduleRegistry }`
      // We can just replace `}\n\nimport { moduleRegistry }`
      content = content.replace(/\}\s*import \{ moduleRegistry \}/g, `\n  invalidateCache() {\n    knowledgeCache.invalidate(this.name);\n  }\n}\n\nimport { moduleRegistry }`);
    }
  }

  fs.writeFileSync(file, content);
});

console.log("Fixed!");
