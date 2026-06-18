fetch('http://localhost:3000/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversationId: 'test',
    messages: [{ role: 'user', content: 'Tolong buatkan Review Mingguan dari task saya' }]
  })
}).then(res => {
  console.log(res.status);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  function read() {
    reader.read().then(({done, value}) => {
      if (done) return;
      console.log(decoder.decode(value, {stream: true}));
      read();
    });
  }
  read();
});
