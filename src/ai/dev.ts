// Only load dotenv in development (not in Netlify production)
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
}

import '@/ai/flows/summarize-upload.ts';
import '@/ai/flows/smart-web-search.ts';
import '@/ai/flows/describe-image-flow.ts';
