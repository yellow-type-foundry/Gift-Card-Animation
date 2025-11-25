# Vercel Puppeteer Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Package Configuration
- ✅ Using `puppeteer-core` (not `puppeteer`)
- ✅ Using `@sparticuz/chromium-min` v131.0.0
- ✅ `serverExternalPackages` configured in `next.config.js`

### 2. API Route Configuration
- ✅ Route segment config: `runtime: 'nodejs'`
- ✅ Route segment config: `maxDuration: 30`
- ✅ Environment detection: `process.env.VERCEL === '1'`
- ✅ Using `chromium.args`, `chromium.defaultViewport`, `chromium.executablePath()`

### 3. Local Testing
- ✅ Tested locally and working
- ✅ Generates 1440x1080 PNG images
- ✅ Chrome detection works on macOS

## 🧪 Post-Deployment Testing

### Step 1: Deploy to Vercel
```bash
git push origin master
# Or use Vercel CLI: vercel --prod
```

### Step 2: Test the API Route
After deployment, test the API route with this curl command (replace `YOUR_VERCEL_URL`):

```bash
curl -X POST https://YOUR_VERCEL_URL.vercel.app/api/capture-card \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Test User",
    "title": "Test Card",
    "boxImage": "/assets/Box 1/Box 01.png",
    "giftTitle": "Test Gift",
    "giftSubtitle": "Test Collection",
    "progress": {"current": 1, "total": 3},
    "sentDate": "1d ago"
  }' \
  --output test-vercel-output.png
```

### Step 3: Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on the `capture-card` function
3. Check the logs for:
   - ✅ No errors about missing Chromium
   - ✅ No errors about executable path
   - ✅ Successful screenshot generation
   - ⚠️ Watch for timeout errors (should complete in < 30s)

### Step 4: Verify Image Output
- Check that `test-vercel-output.png` was created
- Verify dimensions: `file test-vercel-output.png` should show 1440x1080
- Open the image to verify it looks correct

### Step 5: Test from ShareModal
1. Open your deployed app
2. Click "Share to Social"
3. Wait for capture to complete
4. Verify the image appears in the modal
5. Test download button

## 🐛 Common Issues & Solutions

### Issue: "executablePath not found"
**Solution**: Verify `@sparticuz/chromium-min` is installed and `serverExternalPackages` is set

### Issue: Function timeout
**Solution**: 
- Check `maxDuration: 30` is set
- Verify the capture page loads quickly
- Check network requests in logs

### Issue: Blank/incorrect screenshot
**Solution**:
- Check `#capture-ready` selector exists in capture page
- Verify base URL is correct (should use `process.env.VERCEL_URL`)
- Check console logs for navigation errors

### Issue: Function size too large
**Solution**: 
- Verify `serverExternalPackages` prevents bundling
- Check function size in Vercel dashboard (should be < 50MB)

## 📊 Success Criteria

✅ API returns 200 OK with PNG image
✅ Image dimensions are 1440x1080
✅ Image contains the card content (not blank)
✅ Function completes in < 10 seconds
✅ No errors in Vercel function logs
✅ ShareModal can download the image

## 🔍 Debugging Commands

### Check function logs:
```bash
vercel logs YOUR_PROJECT_NAME --follow
```

### Test locally with Vercel environment:
```bash
vercel dev
# This sets VERCEL=1 and simulates Vercel environment
```

### Check function size:
Go to Vercel Dashboard → Functions → capture-card → View Details

