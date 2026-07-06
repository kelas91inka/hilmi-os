import { intentResolver } from './src/features/ai/registry/intent-resolver.ts';
import './src/features/ai/knowledge/orchestrator.ts'; // load modules

async function test() {
  const query = "buat tugas menyiapkan berkas beasiswa unggulan minggu ini";
  const { modules, actionType } = await intentResolver.resolve(query);
  console.log("Action Type:", actionType);
  console.log("Modules:", modules.map(m => m.name));
  
  if (modules[0] && modules[0].actionProvider) {
    console.log("Actions:", modules[0].actionProvider.getActions().map(a => a.name));
  } else {
    console.log("No action provider found for module!");
  }
}

test();
