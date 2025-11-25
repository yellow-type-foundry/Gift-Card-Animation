import { NextResponse } from 'next/server'
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
    console.log('[DEBUG] Starting Chromium download')
    
    // Dynamically import chromium-min (matches working example)
    const chromium = (await import('@sparticuz/chromium-min')).default
    
    // Try default download first (faster, may be cached by Vercel)
    // Then fallback to custom tar if needed
    downloadPromise = chromium
      .executablePath() // No URL = use default GitHub releases (faster, cached)
      .then((path) => {
        cachedExecutablePath = path
        console.log('[DEBUG] Chromium path resolved successfully from default source:', path)
        return path
      })
      .catch((defaultError) => {
        console.warn('[WARN] Failed to download from default source, trying custom tar:', defaultError.message)
        console.log('[DEBUG] Custom tar URL:', CHROMIUM_PACK_URL)
        
        // Fallback to custom tar file
        return chromium
          .executablePath(CHROMIUM_PACK_URL)
          .then((path) => {
            cachedExecutablePath = path
            console.log('[DEBUG] Chromium path resolved successfully from custom tar:', path)
            return path
          })
          .catch((customTarError) => {
            console.error('[ERROR] Failed to get Chromium path from both sources')
            console.error('[ERROR] Default download error:', defaultError.message)
            console.error('[ERROR] Custom tar error:', customTarError.message)
            downloadPromise = null // Reset on error to allow retry
            
            throw new Error(
              `Failed to download Chromium: Default (${defaultError.message}), Custom tar (${customTarError.message})`
            )
          })
      })
  }

  return downloadPromise
}

// Note: chromium and puppeteer are imported dynamically to match working example

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
  const requestStartTime = Date.now()
  
  try {
    const cardProps = await request.json()
    
    // Debug: Log environment detection
    console.log('[DEBUG] Environment check:')
    console.log('  VERCEL:', process.env.VERCEL)
    console.log('  AWS_LAMBDA_FUNCTION_NAME:', process.env.AWS_LAMBDA_FUNCTION_NAME)
    console.log('  NODE_ENV:', process.env.NODE_ENV)
    console.log('  VERCEL_URL:', process.env.VERCEL_URL)
    
    // Detect if we're running on Vercel (match working example's detection)
    const isVercel = !!process.env.VERCEL_ENV || process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME
    console.log('[DEBUG] isVercel:', isVercel)
    console.log('[DEBUG] VERCEL_ENV:', process.env.VERCEL_ENV)
    
    // Launch Puppeteer browser with Vercel-optimized configuration
    // Use dynamic imports like working example
    let puppeteer, launchOptions
    let chromiumPathTime = null // Track timing for logging
    
    if (isVercel) {
      // Vercel: use chromium-min with URL-based extraction
      console.log('[DEBUG] Using Vercel configuration with chromium-min')
      console.log('[DEBUG] Chromium pack URL:', CHROMIUM_PACK_URL)
      
      // Dynamically import (matches working example)
      const chromiumImportStart = Date.now()
      const chromium = (await import('@sparticuz/chromium-min')).default
      puppeteer = await import('puppeteer-core')
      console.log('[DEBUG] Chromium imports took', Date.now() - chromiumImportStart, 'ms')
      
      // Get executable path using URL-based approach (downloads and extracts to /tmp)
      const chromiumPathStart = Date.now()
      const executablePath = await getChromiumPath()
      chromiumPathTime = Date.now() - chromiumPathStart
      console.log('[DEBUG] Chromium path resolution took', chromiumPathTime, 'ms')
      
      console.log('[DEBUG] Chromium args count:', chromium.args?.length || 0)
      
      // Match working example's launch options (simpler, no defaultViewport/headless from chromium)
      launchOptions = {
        headless: true,
        args: chromium.args,
        executablePath: executablePath,
      }
    } else {
      // Local development: use regular puppeteer with bundled Chromium (matches working example)
      console.log('[DEBUG] Using local development configuration')
      try {
        puppeteer = await import('puppeteer')
        launchOptions = {
          headless: true,
        }
      } catch (importError) {
        console.error('[ERROR] Failed to import puppeteer:', importError.message)
        console.log('[DEBUG] Falling back to puppeteer-core with system Chrome')
        // Fallback: use puppeteer-core with system Chrome
        puppeteer = await import('puppeteer-core')
        const chromePath = findChromeExecutable()
        if (!chromePath) {
          throw new Error(
            'Puppeteer not found in devDependencies and Chrome/Chromium not found. ' +
            'Please run: npm install --save-dev puppeteer'
          )
        }
        launchOptions = {
          executablePath: chromePath,
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
          ],
        }
      }
    }
    
    console.log('[DEBUG] Launching browser with options:', {
      ...launchOptions,
      executablePath: launchOptions.executablePath ? '[REDACTED]' : undefined,
    })
    const browserLaunchStart = Date.now()
    browser = await puppeteer.launch(launchOptions)
    const browserLaunchTime = Date.now() - browserLaunchStart
    console.log('[DEBUG] Browser launched in', browserLaunchTime, 'ms')
    
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
    // Detect base URL - prioritize production URL (public), then preview URL, then env var, then localhost
    // VERCEL_PROJECT_PRODUCTION_URL is the public production URL (no auth required)
    // VERCEL_URL is the preview URL (may require auth)
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3004'
    
    const propsString = encodeURIComponent(JSON.stringify(cardProps))
    const targetUrl = `${baseUrl}/capture-page?props=${propsString}`
    
    console.log('[DEBUG] Base URL:', baseUrl)
    console.log('[DEBUG] Target URL:', targetUrl)
    console.log('[DEBUG] Card props keys:', Object.keys(cardProps))
    
    const navigationStart = Date.now()
    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded', // Faster than networkidle2 - page structure is ready
      timeout: 15000, // Reduced timeout
    })
    const pageLoadTime = Date.now() - navigationStart
    console.log('[DEBUG] Page loaded in', pageLoadTime, 'ms')
    
    // Verify we're on the correct page (not redirected to login)
    const finalUrl = page.url()
    console.log('[DEBUG] Final URL after navigation:', finalUrl)
    if (finalUrl.includes('vercel.com/login') || finalUrl.includes('vercel.com/signin')) {
      throw new Error(`Page redirected to login page. Target was: ${targetUrl}, but ended up at: ${finalUrl}`)
    }
    
    // Wait for React to hydrate and confetti canvas to appear
    // Animation will auto-pause at frame 180 (peak), so we just need to wait for it to reach that frame
    console.log('[DEBUG] Waiting for confetti canvas...')
    const canvasWaitStart = Date.now()
    let canvasWaitTime = null
    try {
      await page.waitForFunction(() => {
        const canvases = document.querySelectorAll('canvas')
        return canvases.length > 0
      }, { timeout: 2000 })
      canvasWaitTime = Date.now() - canvasWaitStart
      console.log('[DEBUG] Canvas found in', canvasWaitTime, 'ms')
      
      // Wait for animation to reach frame 180 and pause
      // CRITICAL: The animation will pause automatically at frame 180, we just need to wait for it
      console.log('[DEBUG] Waiting for animation to reach frame 180 and pause...')
      const frameWaitStart = Date.now()
      try {
        await page.waitForFunction(() => {
          const frameCount = window.__confettiFrameCount || 0
          const isPaused = window.__confettiPaused || false
          // Wait until we reach frame 180 AND are paused
          // The animation will auto-pause at frame 180, so we wait for both conditions
          return frameCount >= 180 && isPaused
        }, { 
          timeout: 10000, // Max 10 seconds (should be much faster, but allow for slow networks)
          polling: 50 // Check every 50ms for faster response
        })
        const frameWaitTime = Date.now() - frameWaitStart
        const finalFrameCount = await page.evaluate(() => window.__confettiFrameCount || 0)
        const isPaused = await page.evaluate(() => window.__confettiPaused || false)
        console.log('[DEBUG] ✅ Animation reached frame 180 and paused in', frameWaitTime, 'ms')
        console.log('[DEBUG] ✅ Final frame count:', finalFrameCount, 'Paused:', isPaused)
        
        // Verify we're at the correct frame (should be 180, but allow 180-183 for flexibility)
        if (finalFrameCount < 180 || finalFrameCount > 183) {
          console.warn('[WARN] ⚠️ Frame count is', finalFrameCount, 'but expected 180-183')
        } else {
          console.log('[DEBUG] ✅ Frame count is correct (180-183)')
        }
        
        if (!isPaused) {
          console.error('[ERROR] ❌ Animation is NOT paused! This is a problem!')
        } else {
          console.log('[DEBUG] ✅ Animation is correctly paused')
        }
        
        // Small buffer to ensure pause is fully applied and rendering is complete
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (frameWaitError) {
        console.error('[ERROR] Frame wait timeout!', frameWaitError.message)
        const currentFrame = await page.evaluate(() => window.__confettiFrameCount || 0)
        const isPaused = await page.evaluate(() => window.__confettiPaused || false)
        console.error('[ERROR] Current frame:', currentFrame, 'Paused:', isPaused)
        
        // If we're past frame 180 but not paused, force pause via JavaScript
        if (currentFrame >= 180 && !isPaused) {
          console.log('[DEBUG] Forcing pause at frame', currentFrame)
          await page.evaluate(() => {
            // Try to find and stop the animation
            if (window.__confettiPaused !== undefined) {
              window.__confettiPaused = true
            }
          })
          await new Promise(resolve => setTimeout(resolve, 200))
        } else if (currentFrame < 180) {
          // If we're not at frame 180 yet, wait a bit more
          console.log('[DEBUG] Not at frame 180 yet, waiting additional 500ms...')
          await new Promise(resolve => setTimeout(resolve, 500))
        } else {
          // We're at or past frame 180, proceed with capture
          console.log('[DEBUG] Proceeding with capture at frame', currentFrame)
        }
      }
    } catch (e) {
      console.warn('[WARN] Canvas not found, using fallback timing')
      // Fallback: wait 1800ms if canvas detection fails (frame 180 at 60fps = ~3 seconds, but we wait less for speed)
      await new Promise(resolve => setTimeout(resolve, 1800))
    }
    
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
    const screenshotTime = Date.now() - screenshotStart
    console.log('[DEBUG] Screenshot taken in', screenshotTime, 'ms')
    console.log('[DEBUG] Screenshot size:', screenshot.length, 'bytes')
    
    await browser.close()
    const totalTime = Date.now() - requestStartTime
    console.log('[DEBUG] Browser closed. Total request time:', totalTime, 'ms')
    console.log('[DEBUG] Time breakdown:')
    if (isVercel) {
      console.log('  - Chromium path:', chromiumPathTime || 'N/A', 'ms')
    }
    console.log('  - Browser launch:', browserLaunchTime, 'ms')
    console.log('  - Page load:', pageLoadTime, 'ms')
    console.log('  - Canvas wait:', canvasWaitTime || 'N/A', 'ms')
    console.log('  - Screenshot:', screenshotTime, 'ms')
    
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
