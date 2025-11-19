import { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../server/_core/index.js";

// Vercel serverless function handler
export default async function handler(req: IncomingMessage, res: ServerResponse) {
    const app = await createApp();
    app(req, res);
}
