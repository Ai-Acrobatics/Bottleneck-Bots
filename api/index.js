// Vercel serverless function wrapper for Express app
// This file is used by Vercel to handle all requests

import createApp from '../dist/index.js';

// Cache the Express app instance
let app = null;

export default async function handler(req, res) {
  // Set VERCEL environment variable for the app
  process.env.VERCEL = "1";
  process.env.NODE_ENV = "production";
  
  if (!app) {
    app = await createApp();
  }
  
  // Express apps are functions that take (req, res, next)
  return app(req, res);
}

