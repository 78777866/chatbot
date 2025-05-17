import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

// No changes needed for Netlify compatibility unless you want to export a handler.
// If you want to expose a Netlify Function, you could do:
// export default ai; // (if using Netlify Functions API handler)
