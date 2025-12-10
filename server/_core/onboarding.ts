import { Router } from "express";
import * as db from "../db";
import { sdk } from "./sdk";
import { HttpError } from "@shared/_core/errors";

const router = Router();

// POST /api/onboarding - Submit onboarding data for authenticated user
router.post("/", async (req, res) => {
  try {
    // Authenticate the user using session token
    const user = await sdk.authenticateRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Extract onboarding data from request body
    const {
      companyName,
      phone,
      industry,
      monthlyRevenue,
      employeeCount,
      website,
      goals,
      ghlApiKey,
    } = req.body;

    // Validate required fields
    if (!companyName) {
      return res.status(400).json({ error: "Company name is required" });
    }

    // Prepare user profile data
    const profileData = {
      userId: user.id,
      companyName,
      phone: phone || null,
      industry: industry || null,
      monthlyRevenue: monthlyRevenue || null,
      employeeCount: employeeCount || null,
      website: website || null,
      goals: goals || null, // JSONB field - will store array
      ghlApiKey: ghlApiKey || null,
    };

    // Create or update user profile
    const userProfile = await db.upsertUserProfile(profileData);

    if (!userProfile) {
      return res.status(500).json({ error: "Failed to save onboarding data" });
    }

    // Mark onboarding as complete
    await db.markOnboardingComplete(user.id);

    console.log("[Onboarding] Completed for user:", user.id, user.email);

    return res.json({
      success: true,
      message: "Onboarding completed successfully",
      profile: {
        id: userProfile.id,
        companyName: userProfile.companyName,
        industry: userProfile.industry,
        monthlyRevenue: userProfile.monthlyRevenue,
        employeeCount: userProfile.employeeCount,
        website: userProfile.website,
        phone: userProfile.phone,
      },
    });
  } catch (error) {
    console.error("[Onboarding] Error:", error);

    // Check if it's an HttpError from authentication
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: "Failed to complete onboarding" });
  }
});

// GET /api/onboarding - Get onboarding status for authenticated user
router.get("/", async (req, res) => {
  try {
    // Authenticate the user using session token
    const user = await sdk.authenticateRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get user profile if exists
    const userProfile = await db.getUserProfile(user.id);

    return res.json({
      success: true,
      onboardingCompleted: user.onboardingCompleted,
      profile: userProfile || null,
    });
  } catch (error) {
    console.error("[Onboarding] Error fetching status:", error);

    // Check if it's an HttpError from authentication
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: "Failed to fetch onboarding status" });
  }
});

export const onboardingRouter = router;
