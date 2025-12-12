import { chromium } from "playwright";

async function testMobile() {
  console.log("Testing mobile responsiveness...\n");
  
  const browser = await chromium.launch({ headless: true });
  
  // Test iPhone viewport
  const iphone = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
  });
  const mobilePage = await iphone.newPage();
  
  console.log("📱 Testing iPhone (375x812)...");
  await mobilePage.goto("https://www.ghlagencyai.com", { waitUntil: "networkidle", timeout: 30000 });
  await mobilePage.waitForTimeout(2000);
  
  // Check key elements
  const mobileChecks = await mobilePage.evaluate(() => {
    const h1 = document.querySelector('h1');
    const menuButton = document.querySelector('[aria-label*="menu"]') || document.querySelector('button svg');
    const ctaButton = document.querySelector('button');
    const body = document.body;
    
    // Check for horizontal overflow
    const hasOverflow = body.scrollWidth > body.clientWidth;
    
    return {
      headlineVisible: h1 ? h1.offsetHeight > 0 : false,
      headlineText: h1?.textContent?.substring(0, 50) || "Not found",
      hasMenuButton: !!menuButton,
      hasCTA: !!ctaButton,
      hasHorizontalOverflow: hasOverflow,
      viewportWidth: window.innerWidth
    };
  });
  
  console.log("  Headline visible:", mobileChecks.headlineVisible ? "✅" : "❌");
  console.log("  Headline:", mobileChecks.headlineText);
  console.log("  Menu button:", mobileChecks.hasMenuButton ? "✅" : "❌");
  console.log("  CTA button:", mobileChecks.hasCTA ? "✅" : "❌");
  console.log("  No horizontal overflow:", !mobileChecks.hasHorizontalOverflow ? "✅" : "❌");
  
  // Take mobile screenshot
  await mobilePage.screenshot({ path: "/tmp/mobile-test.png", fullPage: false });
  console.log("  Screenshot saved: /tmp/mobile-test.png");
  
  // Test tablet
  const tablet = await browser.newContext({
    viewport: { width: 768, height: 1024 }
  });
  const tabletPage = await tablet.newPage();
  
  console.log("\n📱 Testing Tablet (768x1024)...");
  await tabletPage.goto("https://www.ghlagencyai.com", { waitUntil: "networkidle", timeout: 30000 });
  await tabletPage.waitForTimeout(2000);
  
  const tabletChecks = await tabletPage.evaluate(() => {
    const body = document.body;
    return {
      hasHorizontalOverflow: body.scrollWidth > body.clientWidth,
      viewportWidth: window.innerWidth
    };
  });
  
  console.log("  No horizontal overflow:", !tabletChecks.hasHorizontalOverflow ? "✅" : "❌");
  
  // Test desktop
  const desktop = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const desktopPage = await desktop.newPage();
  
  console.log("\n🖥️  Testing Desktop (1920x1080)...");
  await desktopPage.goto("https://www.ghlagencyai.com", { waitUntil: "networkidle", timeout: 30000 });
  await desktopPage.waitForTimeout(2000);
  
  const desktopChecks = await desktopPage.evaluate(() => {
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');
    return {
      hasNav: !!nav,
      navLinksCount: navLinks.length,
      hasHorizontalOverflow: document.body.scrollWidth > document.body.clientWidth
    };
  });
  
  console.log("  Navigation visible:", desktopChecks.hasNav ? "✅" : "❌");
  console.log("  Nav links:", desktopChecks.navLinksCount);
  console.log("  No horizontal overflow:", !desktopChecks.hasHorizontalOverflow ? "✅" : "❌");
  
  await browser.close();
  
  console.log("\n=== MOBILE TEST COMPLETE ===");
}

testMobile().catch(console.error);
