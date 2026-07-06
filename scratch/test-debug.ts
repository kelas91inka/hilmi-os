import fetch from 'node-fetch';
async function test() {
  try {
    const res = await fetch('http://localhost:8000/api/ai/debug');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error(e.message);
  }
}
test();
