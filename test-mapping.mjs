import { convertToModelMessages } from 'ai';

const messages = [
  { role: 'user', content: 'Tolong buatkan Review Mingguan dari task saya' },
  { 
    role: 'assistant', 
    content: '',
    toolInvocations: [
      {
        state: 'result',
        toolCallId: 'call_1',
        toolName: 'get_weekly_tasks',
        args: {},
        result: { success: true, tasks: [] }
      }
    ]
  }
];

const polyfilledMessages = messages.map((m) => {
  const copy = { ...m };
  if (!copy.parts) {
    const parts = [];
    if (copy.content) parts.push({ type: 'text', text: copy.content });
    if (copy.toolInvocations) {
      for (const t of copy.toolInvocations) {
        if (t.state === 'result') {
          parts.push({ type: 'tool-result', toolCallId: t.toolCallId, toolName: t.toolName, result: t.result });
        } else {
          parts.push({ type: 'tool-call', toolCallId: t.toolCallId, toolName: t.toolName, args: t.args });
        }
      }
    }
    copy.parts = parts;
  }
  return copy;
});

async function run() {
  console.log(JSON.stringify(await convertToModelMessages(polyfilledMessages), null, 2));
}
run();
