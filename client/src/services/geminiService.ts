
import { GoogleGenAI, Type } from "@google/genai";
import { AgentTask, ClientContext, SupportTicket } from '../types';

const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

const SYSTEM_INSTRUCTION = `
You are "HighCommand", a World-Class AI Agent specialized in GoHighLevel (GHL) automation, Full-Stack Web Development, and SEO Optimization.
You have access to the client's context (Brand Voice, Goals, Subaccount Info) from Notion, Google Drive, or Uploaded PDF Documents.

YOUR ROLES:
1. **Expert Automation Architect**: Plan Playwright sequences for GHL.
2. **UI/UX & Web Design Expert**: 
   - You can "see" websites via screenshot analysis to extract Design Tokens (Fonts, Colors, Spacing).
   - You understand the DOM structure of WordPress (Elementor/Divi) and how to map it to GHL's Drag-and-Drop Builder.
   - You can research GHL features (Memberships, Communities, Campaigns) to configure them according to SOPs.
3. **Reporting Analyst**:
   - You send detailed progress reports via Email to the team/client.
4. **Support Triage Specialist**:
   - You analyze incoming support tickets (Email, Slack, Voice Transcripts).
   - You determine the root cause and generate technical instructions for the automation agent to fix the issue.

VALID ACTIONS:
- NAVIGATE [url]
- ANALYZE_UX [url/selector] (Scans for design tokens, layout grid, and responsiveness)
- RESEARCH_FEATURE [feature_name] (e.g., "Membership Settings", "Email Campaign Config")
- INSPECT [element]
- CLONE_SECTION [source_selector] (Simulates copying a design block from WP to GHL)
- BUILD_ELEMENT [type] (Simulates dragging a GHL element: Row, Headline, Image)
- CONFIGURE_SETTINGS [setting_area] [details] (e.g., "Membership Access", "Review Request SMS")
- UPDATE_COPY [selector] [text]
- PLACE_ASSET [asset_tag] [target_element]
- CLICK [selector/text]
- TYPE [selector] [text]
- SCREENSHOT [context]
- SEND_REPORT [recipient] (Sends progress email with summary)

CONTEXT AWARENESS:
- If the user wants to build a funnel, start by ANALYZE_UX of the reference URL to get the design system.
- When researching features, use 'RESEARCH_FEATURE' to simulate checking the documentation/settings.
- Always end major milestones with SEND_REPORT to keep the team (VAs/Managers) informed.
- If Google Drive context is provided, use the file contents to inform your decisions (e.g., use the Copy Doc for text, the Brand Kit for colors).

When the user gives a command, return a JSON object representing the plan.
`;

export const generateAgentPlan = async (userRequest: string, clientContext: ClientContext | null): Promise<AgentTask> => {
  if (!ai) {
    console.error("Gemini API Key missing");
    return createMockPlan(userRequest, clientContext);
  }

  const seoContext = clientContext?.seo ? `
    SEO CONFIGURATION:
    Title: ${clientContext.seo.siteTitle}
    Keywords: ${clientContext.seo.keywords.join(', ')}
  ` : '';

  const assetContext = clientContext?.assets ? `
    AVAILABLE ASSETS:
    ${clientContext.assets.map(a => `- [${a.contextTag}] ${a.optimizedName} (Alt: ${a.altText})`).join('\n')}
  ` : '';

  // Relaxed check: Include drive context if files exist, regardless of source label
  const driveContext = clientContext?.driveFiles && clientContext.driveFiles.length > 0 ? `
    GOOGLE DRIVE DOCUMENTS (Primary Truth Source):
    ${clientContext.driveFiles.filter(f => f.selected).map(f => `
    --- FILE: ${f.name} (${f.mimeType}) ---
    CONTENT START
    ${f.content}
    CONTENT END
    `).join('\n')}
  ` : '';

  const contextString = clientContext 
    ? `CLIENT CONTEXT (${clientContext.source}):
       Name: ${clientContext.name}
       Subaccount: ${clientContext.subaccountName}
       Brand Voice: ${clientContext.brandVoice}
       Goal: ${clientContext.primaryGoal}
       Website: ${clientContext.website}
       ${seoContext}
       ${assetContext}
       ${driveContext}`
    : "NO SPECIFIC CLIENT CONTEXT SELECTED.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `USER INSTRUCTION: ${userRequest}\n\n${contextString}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "Summary of the mission" },
            subaccount: { type: Type.STRING, description: "The GHL Subaccount name" },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  target: { type: Type.STRING, description: "The UI element, URL, or Email Address" },
                  details: { type: Type.STRING, description: "Additional data (e.g. text to type, design tokens found)" }
                }
              }
            }
          }
        }
      }
    });

    const rawData = response.text;
    if (!rawData) throw new Error("Empty response from Gemini");

    const parsed = JSON.parse(rawData);
    
    return {
      id: crypto.randomUUID(),
      description: parsed.description,
      subaccount: parsed.subaccount || clientContext?.subaccountName || "Main Account",
      clientName: clientContext?.name,
      status: 'pending',
      steps: parsed.steps.map((s: any) => ({
        id: crypto.randomUUID(),
        action: s.action,
        target: s.target,
        details: s.details,
        status: 'pending'
      }))
    };

  } catch (error) {
    console.error("Gemini Plan Error:", error);
    return createMockPlan(userRequest, clientContext);
  }
};

export const analyzeSupportTicket = async (ticket: SupportTicket): Promise<{ analysis: string; command: string }> => {
  if (!ai) return { analysis: "AI Offline: Manual triage required.", command: "" };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this support ticket:
      Source: ${ticket.source}
      Priority: ${ticket.priority}
      Content: "${ticket.description}"
      
      Provide:
      1. A short analysis of the technical issue.
      2. A specific command string I can give to the 'HighCommand' agent to fix it.`,
      config: {
        systemInstruction: "You are a Level 3 Support Engineer. Analyze the ticket content and formulate a precise automation command to resolve it. Return JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            command: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      analysis: result.analysis || "Could not analyze ticket.",
      command: result.command || ""
    };

  } catch (e) {
    console.error("Ticket Analysis Error:", e);
    return { analysis: "Analysis failed.", command: "" };
  }
};

export const analyzeError = async (errorContext: string, step: string): Promise<string> => {
   if (!ai) return "AI Offline: Unable to analyze error.";
   
   try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: `Analyze this GoHighLevel browser automation error during step '${step}': ${errorContext}. Suggest a fix.`,
     });
     return response.text || "Error analysis unavailable.";
   } catch (e) {
     return "Failed to analyze error.";
   }
}

// Fallback if API fails or key missing
const createMockPlan = (req: string, context: ClientContext | null): AgentTask => ({
  id: crypto.randomUUID(),
  description: `Mock Plan: Design & Build for ${context?.name || 'Client'}`,
  subaccount: context?.subaccountName || "Demo Client Account",
  clientName: context?.name || "Unknown",
  status: 'pending',
  steps: [
    { id: crypto.randomUUID(), action: "NAVIGATE", target: `https://${context?.website || 'example.com'}`, status: 'pending' },
    { id: crypto.randomUUID(), action: "ANALYZE_UX", target: "Homepage Hero Section", details: "Extracting color palette, typography, and layout grid", status: 'pending' },
    { id: crypto.randomUUID(), action: "RESEARCH_FEATURE", target: "Membership Settings", details: "Checking GHL Documentation for best practices", status: 'pending' },
    { id: crypto.randomUUID(), action: "NAVIGATE", target: "https://app.gohighlevel.com/v2/editor/123", status: 'pending' },
    { id: crypto.randomUUID(), action: "BUILD_ELEMENT", target: "New Funnel Step", details: "Cloning Hero Section Layout from WP analysis", status: 'pending' },
    { id: crypto.randomUUID(), action: "CONFIGURE_SETTINGS", target: "Email Campaign", details: "Setting up Drip Sequence based on Brand Voice", status: 'pending' },
    { id: crypto.randomUUID(), action: "SEND_REPORT", target: "client@email.com", details: "Sending visual comparison and progress report", status: 'pending' },
  ]
});
