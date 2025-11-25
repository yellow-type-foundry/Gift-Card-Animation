# Capture Performance Optimizations

## Goal
Reduce capture time from 7-8 seconds to 2-3 seconds.

## Optimizations Applied

### 1. Resource Blocking (Expected savings: 1-2 seconds)
- **Blocked resources**: Fonts, media files, websockets, manifests, Google Fonts, analytics scripts
- **Kept resources**: HTML, CSS, JavaScript, images (for card rendering)
- **Impact**: Reduces network requests and page load time significantly

### 2. Reduced Device Scale Factor (Expected savings: 0.5-1 second)
- **Changed**: `deviceScaleFactor` from `2` to `1`
- **Impact**: 
  - Faster rendering (half the pixels to render)
  - Faster screenshot encoding
  - Still good quality at 720p resolution

### 3. Performance Browser Launch Args (Expected savings: 0.5-1 second)
- **Added flags**:
  - `--disable-background-networking`
  - `--disable-background-timer-throttling`
  - `--disable-renderer-backgrounding`
  - `--disable-breakpad`
  - `--disable-sync`
  - `--disable-extensions`
  - `--disable-gpu`
  - And more...
- **Impact**: Faster browser launch and reduced overhead

### 4. Reduced Wait Times (Expected savings: 0.2-0.3 seconds)
- **Static mode delay**: Reduced from 100ms to 50ms
- **Fallback wait**: Reduced from 500ms to 200ms
- **Page load timeout**: Reduced from 15s to 10s
- **Impact**: Less unnecessary waiting

### 5. Optimized Screenshot Settings
- **Current**: PNG format (high quality)
- **Note**: Could switch to JPEG with `quality: 0.9` for faster encoding if quality trade-off is acceptable

## Expected Total Improvement
- **Before**: 7-8 seconds
- **After**: 2-4 seconds (depending on Chromium cache status)
- **Improvement**: 3-5 seconds faster

## Remaining Bottlenecks (if still slow)
1. **Chromium download/extraction** (3-5s on cold start)
   - Solution: Vercel's `/tmp` directory caching helps, but cold starts still need download
   - Future: Consider pre-warming or using a CDN for Chromium

2. **Browser launch** (0.5-1s)
   - Already optimized with launch args
   - Hard to reduce further without compromising functionality

3. **React hydration** (0.5-1s)
   - Already minimized with static mode
   - Could potentially use SSR for capture page

## Testing
- Test with static mode enabled (`USE_STATIC_MODE = true` in ShareModal.jsx)
- Check Vercel function logs for `[TIMING]` breakdown
- Compare production vs localhost times

