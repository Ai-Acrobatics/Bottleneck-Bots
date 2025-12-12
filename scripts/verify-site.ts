import { chromium } from "playwright";

async function verifySite() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Navigating to https://www.ghlagencyai.com...");
  await page.goto("https://www.ghlagencyai.com", { waitUntil: "networkidle", timeout: 30000 });
  
  await page.waitForTimeout(2000);

  const heroContent = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean);
    const bodyText = document.body.innerText;
    
    return {
      headline: h1?.textContent?.trim() || "H1 not found",
      buttons: buttons.slice(0, 6),
      hasNewCopy: bodyText.includes("Stop Managing") || bodyText.includes("Buy Back Your Time"),
      hasOldCopy: bodyText.includes("Fire Your Entire") || bodyText.includes("Fulfillment Team"),
      sample: bodyText.substring(0, 2000)
    };
  });

  console.log("\n=== VERIFICATION RESULTS ===\n");
  console.log("HEADLINE:", heroContent.headline);
  console.log("\nBUTTONS:", heroContent.buttons);
  
  console.log("\n=== DEPLOYMENT STATUS ===");
  if (heroContent.hasNewCopy && !heroContent.hasOldCopy) {
    console.log("✅ NEW COPY IS LIVE - UI/UX changes have been deployed!");
  } else if (heroContent.hasOldCopy) {
    console.log("❌ OLD COPY IS STILL SHOWING - Changes have NOT been deployed yet");
  } else {
    console.log("⚠️ UNABLE TO DETERMINE - Checking page content...");
    console.log("\nPage content sample:\n", heroContent.sample);
  }

  await browser.close();
}

verifySite().catch(console.error);
