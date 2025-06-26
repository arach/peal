const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2 // For retina quality
    }
  });

  const page = await browser.newPage();
  
  // Navigate to the app
  await page.goto('http://localhost:3002', {
    waitUntil: 'networkidle2'
  });

  // Wait a bit for any animations to complete
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Take screenshot
  await page.screenshot({
    path: 'public/images/peal-app-screenshot.png',
    fullPage: false // Just viewport for a clean hero shot
  });

  console.log('Screenshot captured successfully!');
  
  await browser.close();
})();