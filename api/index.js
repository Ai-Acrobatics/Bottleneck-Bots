// Vercel serverless function wrapper for Express app
// This file is used by Vercel to handle all requests

import createApp from '../dist/index.js';

// Create and export the Express app as a serverless function
// Vercel will handle the async initialization
let appPromise = null;

async function getApp() {
  if (!appPromise) {
    appPromise = createApp();
  }
  return await appPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}

