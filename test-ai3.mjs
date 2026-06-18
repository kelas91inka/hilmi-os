import { convertToModelMessages } from 'ai';
const msgs = [{ role: 'user', content: 'hello', parts: undefined }];
const fixed = msgs.map(m => {
  const mCopy = { ...m };
  if (!mCopy.parts) {
    mCopy.parts = mCopy.content ? [{ type: 'text', text: mCopy.content }] : [];
  }
  return mCopy;
});
console.log(convertToModelMessages(fixed));
