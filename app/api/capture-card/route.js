import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(request) {
  let browser = null
  try {
    const cardProps = await request.json()
    
    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })
    
    const page = await browser.newPage()
    
    // Set viewport size - 4:3 aspect ratio
    const captureWidth = 640
    const captureHeight = 480 // 4:3 ratio (640 * 3/4 = 480)
    await page.setViewport({
      width: captureWidth,
      height: captureHeight,
      deviceScaleFactor: 2 // Higher DPI for better quality
    })
    
    // Navigate to the capture page with card props
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3004'
    const propsString = encodeURIComponent(JSON.stringify(cardProps))
    
    await page.goto(`${baseUrl}/capture-page?props=${propsString}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    })
    
    // Wait for the capture-ready indicator
    await page.waitForSelector('#capture-ready', { timeout: 10000 })
    
    // Wait additional time for confetti animation to reach peak (1400ms + buffer)
    // Use a simple delay function since waitForTimeout was removed
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Take screenshot of the entire page - 4:3 ratio
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: captureWidth,
        height: captureHeight
      }
    })
    
    await browser.close()
    
    // Return the screenshot as PNG
    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/png',
      },
    })
  } catch (error) {
    console.error('Error capturing card:', error)
    if (browser) {
      await browser.close()
    }
    return NextResponse.json(
      { error: 'Failed to capture card: ' + error.message },
      { status: 500 }
    )
  }
}

