import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // use service role for scratch
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase env vars");
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error("Error fetching:", error);
    return;
  }
  
  console.log("Latest 5 messages:");
  for (const msg of data) {
    console.log(`\n[ID: ${msg.id}] [Role: ${msg.role}] [Conversation: ${msg.conversation_id}]`);
    console.log(`Content: ${msg.content ? msg.content.substring(0, 50) + '...' : 'null'}`);
    if (msg.message_data) {
      try {
        const parsed = JSON.parse(msg.message_data);
        console.log(`Message Data Keys:`, Object.keys(parsed));
        console.log(`Message Data (parts):`, parsed.parts ? "YES" : "NO");
        console.log(`Message Data (toolInvocations):`, parsed.toolInvocations ? "YES" : "NO");
        // Print the raw string
        console.log(`Raw Message Data:\n`, JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log("Could not parse message_data");
      }
    } else {
      console.log("No message_data");
    }
  }
}

run();
