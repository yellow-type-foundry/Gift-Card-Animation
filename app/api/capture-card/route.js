import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { execSync } from 'child_process'
import { existsSync } from 'fs'

// Route segment config for Vercel
export const runtime = 'nodejs'
export const maxDuration = 30

// URL to the Chromium binary package hosted in /public
// Construct URL based on available environment variables
function getChromiumPackUrl() {
  // Try different Vercel environment variables
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/chromium-pack.tar`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/chromium-pack.tar`
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/chromium-pack.tar`
  }
  // Local development fallback
  return 'http://localhost:3004/chromium-pack.tar'
}

const CHROMIUM_PACK_URL = getChromiumPackUrl()

// Cache the Chromium executable path to avoid re-downloading on subsequent requests
let cachedExecutablePath = null
let downloadPromise = null

/**
 * Downloads and caches the Chromium executable path.
 * Uses a download promise to prevent concurrent downloads.
 * 
 * First tries the custom tar file, then falls back to chromium-min's default download.
 */
async function getChromiumPath() {
  // Return cached path if available
  if (cachedExecutablePath) {
    console.log('[DEBUG] Using cached Chromium path:', cachedExecutablePath)
    return cachedExecutablePath
  }

  // Prevent concurrent downloads by reusing the same promise
  if (!downloadPromise) {
    console.log('[DEBUG] Starting Chromium download from:', CHROMIUM_PACK_URL)
    
    // Try custom tar file first
    downloadPromise = chromium
      .executablePath(CHROMIUM_PACK_URL)
      .then((path) => {
        cachedExecutablePath = path
        console.log('[DEBUG] Chromium path resolved successfully from custom tar:', path)
        return path
      })
      .catch((customTarError) => {
        console.warn('[WARN] Failed to download from custom tar, trying default download:', customTarError.message)
        
        // Fallback to chromium-min's default download (from GitHub releases)
        // This includes all necessary libraries
        return chromium
          .executablePath() // No URL = use default GitHub releases
          .then((path) => {
            cachedExecutablePath = path
            console.log('[DEBUG] Chromium path resolved successfully from default source:', path)
            return path
          })
          .catch((defaultError) => {
            console.error('[ERROR] Failed to get Chromium path from both sources')
            console.error('[ERROR] Custom tar error:', customTarError.message)
            console.error('[ERROR] Default download error:', defaultError.message)
            downloadPromise = null // Reset on error to allow retry
            
            throw new Error(
              `Failed to download Chromium: Custom tar (${customTarError.message}), Default (${defaultError.message})`
            )
          })
      })
  }

  return downloadPromise
}

// Configure Chromium for Vercel (if method is available)
if (typeof chromium.setGraphicsMode === 'function') {
  chromium.setGraphicsMode(false)
}

// Helper function to find Chrome/Chromium executable on local system
function findChromeExecutable() {
  const possiblePaths = [
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    // Windows (if running on Windows)
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ]
  
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path
    }
  }
  
  // Try to find Chrome using 'which' command (Unix-like systems)
  try {
    const chromePath = execSync('which google-chrome || which chromium || which chromium-browser', { encoding: 'utf-8' }).trim()
    if (chromePath) {
      return chromePath
    }
  } catch (e) {
    // Ignore errors
  }
  
  return null
}

export async function POST(request) {
  let browser = null
  try {
    const cardProps = await request.json()
    
    // Debug: Log environment detection
    console.log('[DEBUG] Environment check:')
    console.log('  VERCEL:', process.env.VERCEL)
    console.log('  AWS_LAMBDA_FUNCTION_NAME:', process.env.AWS_LAMBDA_FUNCTION_NAME)
    console.log('  NODE_ENV:', process.env.NODE_ENV)
    console.log('  VERCEL_URL:', process.env.VERCEL_URL)
    
    // Detect if we're running on Vercel
    const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME
    console.log('[DEBUG] isVercel:', isVercel)
    
    // Launch Puppeteer browser with Vercel-optimized configuration
    let launchOptions
    if (isVercel) {
      // Vercel: use chromium-min with URL-based extraction
      console.log('[DEBUG] Using Vercel configuration with chromium-min')
      console.log('[DEBUG] Chromium pack URL:', CHROMIUM_PACK_URL)
      
      // Get executable path using URL-based approach (downloads and extracts to /tmp)
      const executablePath = await getChromiumPath()
      
      console.log('[DEBUG] Chromium args count:', chromium.args?.length || 0)
      console.log('[DEBUG] Chromium headless:', chromium.headless)
      console.log('[DEBUG] Chromium defaultViewport:', chromium.defaultViewport)
      
      launchOptions = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: chromium.headless,
      }
    } else {
      // Local development: find and use system Chrome/Chromium
      console.log('[DEBUG] Using local development configuration')
      const chromePath = findChromeExecutable()
      if (!chromePath) {
        throw new Error(
          'Chrome/Chromium not found. Please install Google Chrome or set CHROME_EXECUTABLE_PATH environment variable.'
        )
      }
      console.log('[DEBUG] Found Chrome at:', chromePath)
      
      launchOptions = {
        executablePath: chromePath,
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      }
    }
    
    console.log('[DEBUG] Launching browser with options:', {
      ...launchOptions,
      executablePath: launchOptions.executablePath ? '[REDACTED]' : undefined,
    })
    const startTime = Date.now()
    browser = await puppeteer.launch(launchOptions)
    console.log('[DEBUG] Browser launched in', Date.now() - startTime, 'ms')
    
    const page = await browser.newPage()
    
    // Set viewport size - 4:3 aspect ratio
    const captureWidth = 720
    const captureHeight = 540 // 4:3 ratio (720 * 3/4 = 540)
    await page.setViewport({
      width: captureWidth,
      height: captureHeight,
      deviceScaleFactor: 2, // Higher DPI for better quality (720 * 2 = 1440px)
    })
    
    // Navigate to the capture page with card props
    // Detect base URL - use Vercel URL in production, or environment variable, or localhost
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3004'
    
    const propsString = encodeURIComponent(JSON.stringify(cardProps))
    const targetUrl = `${baseUrl}/capture-page?props=${propsString}`
    
    console.log('[DEBUG] Base URL:', baseUrl)
    console.log('[DEBUG] Target URL:', targetUrl)
    console.log('[DEBUG] Card props keys:', Object.keys(cardProps))
    
    const navigationStart = Date.now()
    await page.goto(targetUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })
    console.log('[DEBUG] Page loaded in', Date.now() - navigationStart, 'ms')
    
    // Wait for the capture-ready indicator
    console.log('[DEBUG] Waiting for #capture-ready selector...')
    const selectorStart = Date.now()
    await page.waitForSelector('#capture-ready', { timeout: 10000 })
    console.log('[DEBUG] Selector found in', Date.now() - selectorStart, 'ms')
    
    // Wait additional time for confetti animation to reach peak (1400ms + buffer)
    console.log('[DEBUG] Waiting for confetti animation (2000ms)...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Take screenshot of the entire page - 4:3 ratio
    console.log('[DEBUG] Taking screenshot...')
    const screenshotStart = Date.now()
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: captureWidth,
        height: captureHeight,
      },
    })
    console.log('[DEBUG] Screenshot taken in', Date.now() - screenshotStart, 'ms')
    console.log('[DEBUG] Screenshot size:', screenshot.length, 'bytes')
    
    await browser.close()
    console.log('[DEBUG] Browser closed. Total time:', Date.now() - startTime, 'ms')
    
    // Return the screenshot as PNG
    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/png',
      },
    })
  } catch (error) {
    console.error('[ERROR] Failed to capture card:', error.message)
    console.error('[ERROR] Stack:', error.stack)
    console.error('[ERROR] Error name:', error.name)
    if (error.cause) {
      console.error('[ERROR] Error cause:', error.cause)
    }
    
    if (browser) {
      try {
        await browser.close()
        console.log('[DEBUG] Browser closed after error')
      } catch (closeError) {
        console.error('[ERROR] Failed to close browser:', closeError.message)
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to capture card: ' + error.message,
        details: error.stack,
        environment: {
          isVercel: process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME,
          vercelUrl: process.env.VERCEL_URL,
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 500 }
    )
  }
}
