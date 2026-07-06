import fetch from 'node-fetch';
import { performance } from 'perf_hooks';

async function testPerformance() {
  const start = performance.now();
  console.log("Sending request to http://localhost:8000/api/ai/chat...");
  
  try {
    const res = await fetch('http://localhost:8000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversationId: "test-conv-id",
        systemContext: "Dashboard",
        messages: [
          {
            id: 'test-123',
            role: 'user',
            content: 'Halo, siapa namamu?',
            parts: [{ type: 'text', text: 'Halo, siapa namamu?' }]
          }
        ]
      })
    });
    
    console.log(`[⏱️ ${Math.round(performance.now() - start)}ms] Headers received`);
    
    if (!res.ok) {
      console.error("Error response:", await res.text());
      return;
    }
    
    const stream = res.body;
    let firstByte = false;
    
    if (stream) {
      stream.on('data', (chunk) => {
        if (!firstByte) {
          console.log(`[⏱️ ${Math.round(performance.now() - start)}ms] FIRST BYTE RECEIVED`);
          firstByte = true;
        }
      });
      stream.on('end', () => {
        console.log(`[⏱️ ${Math.round(performance.now() - start)}ms] Stream ended`);
      });
    }
  } catch (err: any) {
    console.error("Fetch error:", err.message);
  }
}

testPerformance();
