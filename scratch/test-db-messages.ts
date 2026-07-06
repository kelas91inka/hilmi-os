import { getConversationsAction, getConversationMessagesAction } from '../src/features/ai/actions/ai.actions';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const result = await getConversationsAction();
  if (result.success && result.data?.length) {
    const cid = result.data[0].id;
    console.log("Checking conversation:", cid);
    const msgs = await getConversationMessagesAction(cid);
    if (msgs.success && msgs.data) {
      console.log("Found", msgs.data.length, "messages.");
      if (msgs.data.length > 0) {
        console.log("Latest Message Data:");
        const m = msgs.data[msgs.data.length - 1];
        console.log("DB ID:", m.id);
        console.log("Role:", m.role);
        console.log("Raw message_data:", typeof m.message_data, m.message_data?.substring(0, 100));
        if (m.message_data) {
           const parsed = JSON.parse(m.message_data);
           console.log("Parsed Object keys:", Object.keys(parsed));
        }
      }
    }
  }
}
run();
