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

function mapUIMessagesToCore(msgs) {
  const core = [];
  for (const m of msgs) {
    if (m.role === 'user') {
      core.push({ role: 'user', content: m.content || '' });
    } else if (m.role === 'assistant') {
      if (!m.toolInvocations || m.toolInvocations.length === 0) {
        core.push({ role: 'assistant', content: m.content || '' });
        continue;
      }

      // Assistant message with tool calls
      const toolCalls = m.toolInvocations.map(t => ({
        type: 'tool-call',
        toolCallId: t.toolCallId,
        toolName: t.toolName,
        args: t.args || {}
      }));
      core.push({
        role: 'assistant',
        content: m.content ? [{ type: 'text', text: m.content }, ...toolCalls] : toolCalls
      });

      // If any tool invocations have a result, we must ALSO push a tool message!
      const toolResults = m.toolInvocations.filter(t => t.state === 'result');
      if (toolResults.length > 0) {
        core.push({
          role: 'tool',
          content: toolResults.map(t => ({
            type: 'tool-result',
            toolCallId: t.toolCallId,
            toolName: t.toolName,
            result: t.result
          }))
        });
      }
    }
  }
  return core;
}

console.log(JSON.stringify(mapUIMessagesToCore(messages), null, 2));
