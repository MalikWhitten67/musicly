import os from 'os';
export default async (req, context) => { 
  return new Response(`Hello from ${os.hostname()}!`, {
    headers: {
      'content-type': 'text/plain',
    }, 
  })
};

export const config = {
  path: "/*",
}
