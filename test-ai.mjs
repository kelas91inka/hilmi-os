import { convertToModelMessages } from 'ai';
const msgs = [{ role: 'user', content: 'hello' }];
console.log(convertToModelMessages(msgs));
