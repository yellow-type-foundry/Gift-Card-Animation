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
  const timings = {
    requestStart: requestStartTime,
    chromiumImport: null,
    chromiumPath: null,
    browserLaunch: null,
    pageLoad: null,
    canvasWait: null,
    animationStart: null,
    frame180Reached: null,
    pauseApplied: null,
    screenshot: null,
    browserClose: null,
    total: null
  }

  try {
    // Check for static mode (from query param or body)
    const url = new URL(request.url)
    const isStaticMode = url.searchParams.get('static') === 'true'
    
    const cardProps = await request.json()
    console.log('[TIMING] ========== CAPTURE REQUEST STARTED ==========')
    console.log('[TIMING] Request started at:', new Date(requestStartTime).toISOString())
    console.log('[TIMING] Static mode:', isStaticMode ? 'ENABLED (no animation wait)' : 'DISABLED (wait for frame 180)')
    
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
      timings.chromiumImport = Date.now() - chromiumImportStart
      console.log('[TIMING] Chromium imports:', timings.chromiumImport, 'ms')
      
      // Get executable path using URL-based approach (downloads and extracts to /tmp)
      const chromiumPathStart = Date.now()
      const executablePath = await getChromiumPath()
      timings.chromiumPath = Date.now() - chromiumPathStart
      console.log('[TIMING] Chromium path resolution:', timings.chromiumPath, 'ms')
      console.log('[TIMING] Time since request start:', Date.now() - requestStartTime, 'ms')
      
      console.log('[DEBUG] Chromium args count:', chromium.args?.length || 0)
      
      // Match working example's launch options (simpler, no defaultViewport/headless from chromium)
      // Add performance-focused args to speed up browser launch and rendering
      launchOptions = {
        headless: true,
        args: [
          ...chromium.args,
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-component-extensions-with-background-page',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-sync',
          '--disable-default-apps',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
        ],
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
    timings.browserLaunch = Date.now() - browserLaunchStart
    console.log('[TIMING] Browser launched:', timings.browserLaunch, 'ms')
    console.log('[TIMING] Time since request start:', Date.now() - requestStartTime, 'ms')
    
    const page = await browser.newPage()
    
    // Block unnecessary resources to speed up page load
    // Keep essential resources: HTML, CSS, JS, and images (card might have images)
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      const resourceType = request.resourceType()
      const url = request.url()
      
      // Block non-essential resources that slow down page load
      if (['font', 'media', 'websocket', 'manifest'].includes(resourceType)) {
        // Block fonts (use system fonts), media, websockets, manifests
        request.abort()
      } else if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        // Block Google Fonts (use system fonts instead)
        request.abort()
      } else if (url.includes('analytics') || url.includes('gtag') || url.includes('google-analytics')) {
        // Block analytics scripts
        request.abort()
      } else {
        // Allow: document, stylesheet, script, xhr, fetch, image (for card images)
        request.continue()
      }
    })
    
    // Set viewport size - 4:3 aspect ratio (landscape)
    // Reduced deviceScaleFactor from 2 to 1 for faster rendering (still good quality)
    const captureWidth = 720
    const captureHeight = 540 // 4:3 ratio (720 * 3/4 = 540)
    await page.setViewport({
      width: captureWidth,
      height: captureHeight,
      deviceScaleFactor: 1, // Reduced from 2 to 1 for faster rendering
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
    const staticParam = isStaticMode ? '&static=true' : ''
    const targetUrl = `${baseUrl}/capture-page?props=${propsString}${staticParam}`
    
    console.log('[DEBUG] Base URL:', baseUrl)
    console.log('[DEBUG] Target URL:', targetUrl)
    console.log('[DEBUG] Card props keys:', Object.keys(cardProps))
    
    const navigationStart = Date.now()
    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded', // Faster than networkidle2 - page structure is ready
      timeout: 10000, // Reduced timeout from 15s to 10s
    })
    timings.pageLoad = Date.now() - navigationStart
    console.log('[TIMING] Page loaded:', timings.pageLoad, 'ms')
    console.log('[TIMING] Time since request start:', Date.now() - requestStartTime, 'ms')
    
    // Verify we're on the correct page (not redirected to login)
    const finalUrl = page.url()
    console.log('[DEBUG] Final URL after navigation:', finalUrl)
    if (finalUrl.includes('vercel.com/login') || finalUrl.includes('vercel.com/signin')) {
      throw new Error(`Page redirected to login page. Target was: ${targetUrl}, but ended up at: ${finalUrl}`)
    }
    
    // Wait for React to hydrate and page to be ready
    if (isStaticMode) {
      // Static mode: just wait for page to be ready (no animation)
      console.log('[TIMING] Static mode: waiting for page to be ready (no animation)...')
      const staticWaitStart = Date.now()
      
      // Pre-inject capture-ready element to eliminate React hydration wait
      await page.evaluate(() => {
        if (!document.getElementById('capture-ready')) {
          const readyDiv = document.createElement('div')
          readyDiv.id = 'capture-ready'
          readyDiv.style.display = 'none'
          readyDiv.textContent = 'Ready'
          document.body.appendChild(readyDiv)
        }
      })
      
      try {
        // Wait for React to render the card (check for SentCard1 component)
        // Use a more specific selector that appears when card is rendered
        await page.waitForFunction(() => {
          // Check for card container or any card-specific element
          const hasCard = document.querySelector('[data-name="Gift Card"]') || 
                         document.querySelector('[data-name="Box"]') ||
                         document.querySelector('[data-name="Envelope"]')
          return hasCard !== null
        }, { timeout: 1500, polling: 25 }) // Faster polling: 25ms instead of 50ms
        timings.canvasWait = Date.now() - staticWaitStart
        console.log('[TIMING] Page ready in static mode:', timings.canvasWait, 'ms')
        console.log('[TIMING] Time since request start:', Date.now() - requestStartTime, 'ms')
        // Minimal delay to ensure render is complete (reduced from 50ms to 30ms)
        await new Promise(resolve => setTimeout(resolve, 30))
      } catch (e) {
        console.warn('[WARN] Card element not found, using fallback timing')
        // Reduced fallback wait from 200ms to 100ms
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } else {
      // Animation mode: wait for confetti canvas and animation to reach frame 180
      console.log('[TIMING] Waiting for confetti canvas and animation to start...')
      const canvasWaitStart = Date.now()
      try {
        // Wait for canvas AND animation to start in one check (faster)
        await page.waitForFunction(() => {
          const canvases = document.querySelectorAll('canvas')
          const frameCount = window.__confettiFrameCount || 0
          return canvases.length > 0 && frameCount > 0
        }, { timeout: 2000, polling: 25 }) // Faster polling: 25ms instead of 50ms
        timings.canvasWait = Date.now() - canvasWaitStart
        timings.animationStart = Date.now()
        console.log('[TIMING] Canvas found and animation started:', timings.canvasWait, 'ms')
        console.log('[TIMING] Time since request start:', Date.now() - requestStartTime, 'ms')
        
        // Get initial frame count for debugging
        const initialFrame = await page.evaluate(() => window.__confettiFrameCount || 0)
        console.log('[TIMING] Initial frame count when animation detected:', initialFrame)
        
        // Now wait for frame 180 to be reached (animation should pause automatically)
        // At 60fps, 180 frames = 3 seconds from when animation starts
        console.log('[TIMING] Waiting for animation to reach frame 180...')
        const frameWaitStart = Date.now()
        try {
          await page.waitForFunction(() => {
            const frameCount = window.__confettiFrameCount || 0
            return frameCount >= 180
          }, { 
            timeout: 3200, // Max 3.2 seconds (180 frames at 60fps = 3s, plus small buffer)
            polling: 25 // Faster polling: 25ms instead of 50ms for quicker response
          })
          
          timings.frame180Reached = Date.now() - frameWaitStart
          const timeFromAnimationStart = Date.now() - timings.animationStart
          console.log('[TIMING] Frame 180 reached in:', timings.frame180Reached, 'ms')
          console.log('[TIMING] Time from animation start to frame 180:', timeFromAnimationStart, 'ms')
          console.log('[TIMING] Effective FPS:', (180 / (timeFromAnimationStart / 1000)).toFixed(1))
          
          // Once frame 180 is reached, wait a tiny bit for pause to be applied
          const pauseWaitStart = Date.now()
          await new Promise(resolve => setTimeout(resolve, 30))
          
          // Verify pause state
          const { frameCount: finalFrameCount, isPaused } = await page.evaluate(() => ({
            frameCount: window.__confettiFrameCount || 0,
            isPaused: window.__confettiPaused || false
          }))
          
          timings.pauseApplied = Date.now() - pauseWaitStart
          console.log('[TIMING] Pause applied in:', timings.pauseApplied, 'ms')
          console.log('[TIMING] Final frame count:', finalFrameCount, 'Paused:', isPaused)
          
          // If not paused, force pause
          if (!isPaused && finalFrameCount >= 180) {
            console.log('[TIMING] Animation not paused, forcing pause...')
            const forcePauseStart = Date.now()
            await page.evaluate(() => {
              if (window.__confettiPaused !== undefined) {
                window.__confettiPaused = true
              }
            })
            await new Promise(resolve => setTimeout(resolve, 30))
            console.log('[TIMING] Force pause took:', Date.now() - forcePauseStart, 'ms')
          }
          
          // Verify we're at the correct frame (should be 180, but allow 180-183 for flexibility)
          if (finalFrameCount < 180 || finalFrameCount > 183) {
            console.warn('[WARN] ⚠️ Frame count is', finalFrameCount, 'but expected 180-183')
          } else {
            console.log('[TIMING] ✅ Frame count is correct (180-183)')
          }
        } catch (frameWaitError) {
          console.error('[ERROR] Frame wait timeout!', frameWaitError.message)
          // Batch evaluations to reduce round-trips
          const { frameCount: currentFrame, isPaused } = await page.evaluate(() => ({
            frameCount: window.__confettiFrameCount || 0,
            isPaused: window.__confettiPaused || false
          }))
          console.error('[ERROR] Current frame:', currentFrame, 'Paused:', isPaused)
          
          // If we're at or past frame 180, proceed immediately (don't wait more)
          if (currentFrame >= 180) {
            console.log('[DEBUG] Already at frame 180+, proceeding with capture')
            if (!isPaused) {
              console.log('[DEBUG] Forcing pause at frame', currentFrame)
              await page.evaluate(() => {
                if (window.__confettiPaused !== undefined) {
                  window.__confettiPaused = true
                }
              })
              await new Promise(resolve => setTimeout(resolve, 30))
            }
          } else {
            // If we're not at frame 180 yet, wait a bit more (but not too long)
            const remainingFrames = 180 - currentFrame
            const estimatedWait = Math.min((remainingFrames / 60) * 1000, 1500) // Max 1.5 seconds
            console.log('[DEBUG] Not at frame 180 yet (at', currentFrame, '), waiting', estimatedWait.toFixed(0), 'ms...')
            await new Promise(resolve => setTimeout(resolve, estimatedWait))
          }
        }
      } catch (e) {
        console.warn('[WARN] Canvas not found, using fallback timing')
        // Fallback: wait 3000ms if canvas detection fails (frame 180 at 60fps = 3 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
    
    // Take screenshot of the entire page - 4:3 ratio (landscape)
    // Using JPEG with high quality (0.95) for faster encoding while maintaining excellent quality
    // JPEG at 0.95 quality is visually indistinguishable from PNG for social media sharing
    console.log('[TIMING] Taking screenshot...')
    const screenshotStart = Date.now()
    const screenshot = await page.screenshot({
      type: 'jpeg', // JPEG is 2-3x faster to encode than PNG
      quality: 95, // High quality (0-100, 95 is visually lossless for most use cases)
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: captureWidth,
        height: captureHeight,
      },
      // Optimize screenshot encoding
      omitBackground: false,
    })
    timings.screenshot = Date.now() - screenshotStart
    console.log('[TIMING] Screenshot taken:', timings.screenshot, 'ms')
    console.log('[TIMING] Screenshot size:', screenshot.length, 'bytes')
    
    // Don't wait for browser close - return response immediately and close in background
    // This saves 100-300ms on response time
    const browserCloseStart = Date.now()
    browser.close().catch(err => {
      console.error('[ERROR] Failed to close browser in background:', err.message)
    })
    timings.browserClose = Date.now() - browserCloseStart
    timings.total = Date.now() - requestStartTime
    
    console.log('[TIMING] ========== COMPLETE TIMING BREAKDOWN ==========')
    console.log('[TIMING] Total request time:', timings.total, 'ms', `(${(timings.total / 1000).toFixed(2)}s)`)
    console.log('[TIMING] Breakdown:')
    if (isVercel) {
      console.log('[TIMING]   - Chromium imports:', timings.chromiumImport || 'N/A', 'ms')
      console.log('[TIMING]   - Chromium path:', timings.chromiumPath || 'N/A', 'ms')
    }
    console.log('[TIMING]   - Browser launch:', timings.browserLaunch, 'ms')
    console.log('[TIMING]   - Page load:', timings.pageLoad, 'ms')
    console.log('[TIMING]   - Canvas wait:', timings.canvasWait || 'N/A', 'ms')
    console.log('[TIMING]   - Frame 180 wait:', timings.frame180Reached || 'N/A', 'ms')
    console.log('[TIMING]   - Pause applied:', timings.pauseApplied || 'N/A', 'ms')
    console.log('[TIMING]   - Screenshot:', timings.screenshot, 'ms')
    console.log('[TIMING]   - Browser close:', timings.browserClose, 'ms')
    console.log('[TIMING] ================================================')
    
    // Return the screenshot as JPEG
    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/jpeg',
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
