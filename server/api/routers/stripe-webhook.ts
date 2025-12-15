import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { CreditService } from "../../services/credit.service";
import { getDb } from "../../db";
import { credit_packages } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Stripe Webhook Router
 * Handles Stripe webhook events for payment processing
 *
 * Setup Instructions:
 * 1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
 * 2. Forward webhooks to local endpoint: stripe listen --forward-to localhost:3000/api/trpc/stripeWebhook.handleWebhook
 * 3. Copy webhook signing secret to .env: STRIPE_WEBHOOK_SECRET=whsec_...
 * 4. In production, configure webhook endpoint in Stripe Dashboard
 *
 * Events Handled:
 * - checkout.session.completed: Credits purchase completed
 * - payment_intent.succeeded: Payment succeeded
 * - payment_intent.payment_failed: Payment failed
 * - charge.refunded: Handle refunds
 */

export const stripeWebhookRouter = router({
    /**
     * Handle Stripe webhook events
     * This endpoint should be called directly via HTTP POST, not through tRPC
     *
     * Note: For raw webhook handling, you may need to create a separate Express/Next.js API route
     * that can access the raw request body for signature verification
     */
    handleWebhook: publicProcedure
        .input(
            z.object({
                event: z.any(), // Raw Stripe event object
                signature: z.string().optional(), // Stripe signature for verification
            })
        )
        .mutation(async ({ input }) => {
            const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

            if (!stripeSecretKey) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Stripe is not configured",
                });
            }

            try {
                // Import Stripe with type definition
                const { default: Stripe } = await import("stripe");
                const stripe = new Stripe(stripeSecretKey, {
                    apiVersion: "2024-12-18.acacia" as any,
                });

                // In production, verify the webhook signature
                // Note: This requires the raw request body, which may need special handling
                let event = input.event;

                if (webhookSecret && input.signature) {
                    // Signature verification would happen here
                    // This is just a placeholder - actual implementation needs raw body
                    console.warn("Webhook signature verification skipped - implement in API route");
                }

                // Handle the event
                switch (event.type) {
                    case "checkout.session.completed":
                        await handleCheckoutSessionCompleted(event.data.object);
                        break;

                    case "payment_intent.succeeded":
                        await handlePaymentIntentSucceeded(event.data.object);
                        break;

                    case "payment_intent.payment_failed":
                        await handlePaymentIntentFailed(event.data.object);
                        break;

                    case "charge.refunded":
                        await handleChargeRefunded(event.data.object);
                        break;

                    default:
                        console.log(`Unhandled event type: ${event.type}`);
                }

                return { success: true, received: true };
            } catch (error: any) {
                console.error("Webhook error:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Webhook handler failed: ${error.message}`,
                });
            }
        }),

    /**
     * Manually trigger credit fulfillment for a checkout session
     * Useful for testing or handling failed webhooks
     */
    fulfillCheckoutSession: publicProcedure
        .input(
            z.object({
                sessionId: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
            if (!stripeSecretKey) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Stripe is not configured",
                });
            }

            try {
                const { default: Stripe } = await import("stripe");
                const stripe = new Stripe(stripeSecretKey, {
                    apiVersion: "2024-12-18.acacia" as any,
                });

                const session = await stripe.checkout.sessions.retrieve(input.sessionId);

                if (session.payment_status !== "paid") {
                    throw new TRPCError({
                        code: "PRECONDITION_FAILED",
                        message: "Payment not completed",
                    });
                }

                await handleCheckoutSessionCompleted(session);

                return { success: true };
            } catch (error: any) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to fulfill checkout: ${error.message}`,
                });
            }
        }),
});

/**
 * Handle checkout session completed event
 * Awards credits to user account
 */
async function handleCheckoutSessionCompleted(session: any) {
    const metadata = session.metadata;

    if (!metadata || !metadata.userId || !metadata.packageId) {
        console.error("Missing metadata in checkout session:", session.id);
        return;
    }

    const userId = parseInt(metadata.userId);
    const packageId = parseInt(metadata.packageId);
    const creditType = metadata.creditType;
    const creditAmount = parseInt(metadata.creditAmount);

    // Verify package exists
    const db = await getDb();
    if (!db) {
        throw new Error("Database not available");
    }

    const packageResult = await db
        .select()
        .from(credit_packages)
        .where(eq(credit_packages.id, packageId))
        .limit(1);

    if (packageResult.length === 0) {
        console.error("Package not found:", packageId);
        return;
    }

    const pkg = packageResult[0];

    // Award credits using CreditService
    const creditService = new CreditService();

    try {
        await creditService.addCredits(
            userId,
            creditAmount,
            creditType,
            `Purchased ${pkg.name} via Stripe`,
            "purchase",
            {
                packageId,
                packageName: pkg.name,
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent,
                amountPaid: session.amount_total, // Amount in cents
                currency: session.currency,
            }
        );

        console.log(
            `Successfully awarded ${creditAmount} ${creditType} credits to user ${userId}`
        );
    } catch (error: any) {
        console.error("Failed to award credits:", error);
        throw error;
    }
}

/**
 * Handle payment intent succeeded event
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
    console.log("Payment intent succeeded:", paymentIntent.id);
    // Additional handling if needed (logging, analytics, etc.)
}

/**
 * Handle payment intent failed event
 */
async function handlePaymentIntentFailed(paymentIntent: any) {
    console.error("Payment intent failed:", paymentIntent.id);
    // Could send notification to user about failed payment
}

/**
 * Handle charge refunded event
 */
async function handleChargeRefunded(charge: any) {
    console.log("Charge refunded:", charge.id);

    // Get the payment intent to find related session
    if (!charge.payment_intent) {
        console.error("No payment intent found for refunded charge");
        return;
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        console.error("Stripe not configured");
        return;
    }

    try {
        const { default: Stripe } = await import("stripe");
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: "2024-12-18.acacia" as any,
        });

        // Find checkout sessions with this payment intent
        const sessions = await stripe.checkout.sessions.list({
            payment_intent: charge.payment_intent as string,
            limit: 1,
        });

        if (sessions.data.length === 0) {
            console.error("No checkout session found for payment intent");
            return;
        }

        const session = sessions.data[0];
        const metadata = session.metadata;

        if (!metadata || !metadata.userId) {
            console.error("Missing metadata in session");
            return;
        }

        const userId = parseInt(metadata.userId);
        const creditType = metadata.creditType as "enrichment" | "calling" | "scraping";
        const creditAmount = parseInt(metadata.creditAmount);

        // Deduct the credits back (refund)
        const creditService = new CreditService();

        try {
            await creditService.deductCredits(
                userId,
                creditAmount,
                creditType,
                `Refund for Stripe charge ${charge.id}`,
                charge.id,
                "stripe_refund",
                {
                    stripeChargeId: charge.id,
                    stripePaymentIntentId: charge.payment_intent,
                    refundAmount: charge.amount_refunded,
                }
            );

            console.log(
                `Successfully refunded ${creditAmount} ${creditType} credits from user ${userId}`
            );
        } catch (error: any) {
            console.error("Failed to refund credits:", error);
            // Don't throw - we don't want to fail the webhook
        }
    } catch (error: any) {
        console.error("Error handling refund:", error);
    }
}
