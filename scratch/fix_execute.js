const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Dell\\3D Objects\\hilmi_os\\src\\features\\ai\\actions\\providers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.action.ts') && f !== 'tasks.action.ts');

files.forEach(f => {
  const file = path.join(dir, f);
  let content = fs.readFileSync(file, 'utf8');

  // Find all action definitions, they look like:
  // name: 'action_name',
  // ...
  // parameters: { ... }
  // }
  
  // We can just look for the end of the parameters object.
  // Actually, we can use a regex to match the `name: 'something'` and then inject the `execute` block inside the object.
  // Wait, an easier way is to just use a replacer that adds `execute` right before `}` if it's missing. But `}` can be anywhere.
  
  // Since the files are mostly auto-generated and have a standard format:
  /*
      {
        name: '...',
        description: '...',
        parameters: { ... }
      }
  */
  
  // Let's replace:
  // parameters: { ... }
  // }
  // with:
  // parameters: { ... },
  // execute: async (args) => ({ requiresConfirmation: true, type: '...', draft: args })
  // }
  
  // A better way is to parse the file line by line, find the action name, and insert `execute` at the end of the action block.
  
  const lines = content.split('\n');
  let currentAction = null;
  let braceCount = 0;
  let inAction = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.match(/^\s*name:\s*['"](.*?)['"],\s*$/)) {
      const match = line.match(/^\s*name:\s*['"](.*?)['"],\s*$/);
      if (!inAction) {
        currentAction = match[1];
        inAction = true;
        braceCount = 1; // Assuming we are inside `{`
      }
    }
    
    if (inAction) {
      if (line.includes('{')) braceCount += (line.match(/\{/g) || []).length;
      if (line.includes('}')) braceCount -= (line.match(/\}/g) || []).length;
      
      if (braceCount === 0) { // Found the closing brace of the action object
        if (!content.includes(`type: '${currentAction}'`)) {
            // Insert execute block before the closing brace
            lines.splice(i, 0, `        execute: async (args: any) => ({ requiresConfirmation: true, type: '${currentAction}', draft: args })`);
            
            // Wait, we need a comma on the previous line if it doesn't have one
            if (!lines[i-1].trim().endsWith(',')) {
               lines[i-1] = lines[i-1] + ',';
            }
        }
        inAction = false;
        currentAction = null;
      }
    }
  }
  
  fs.writeFileSync(file, lines.join('\n'));
});
console.log('Fixed actions!');
