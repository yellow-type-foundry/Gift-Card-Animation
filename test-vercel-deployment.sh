#!/bin/bash

# Test script for Vercel deployment
# Usage: ./test-vercel-deployment.sh YOUR_VERCEL_URL

if [ -z "$1" ]; then
  echo "❌ Error: Vercel URL required"
  echo "Usage: ./test-vercel-deployment.sh https://your-app.vercel.app"
  exit 1
fi

VERCEL_URL="$1"
API_URL="${VERCEL_URL}/api/capture-card"

echo "🧪 Testing Vercel Puppeteer deployment..."
echo "📍 API URL: $API_URL"
echo ""

# Test card props
TEST_PAYLOAD='{
  "from": "Test User",
  "title": "Test Card",
  "boxImage": "/assets/Box 1/Box 01.png",
  "giftTitle": "Test Gift",
  "giftSubtitle": "Test Collection",
  "progress": {"current": 1, "total": 3},
  "sentDate": "1d ago"
}'

echo "📤 Sending POST request..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD" \
  --max-time 60)

# Split response and status code
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

echo "📥 HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  # Save the image
  echo "$HTTP_BODY" > test-vercel-output.png
  
  # Check file size
  FILE_SIZE=$(stat -f%z test-vercel-output.png 2>/dev/null || stat -c%s test-vercel-output.png 2>/dev/null)
  FILE_SIZE_KB=$((FILE_SIZE / 1024))
  
  echo "✅ Success! Image received"
  echo "   File size: ${FILE_SIZE_KB} KB"
  
  # Check if it's a valid PNG
  if file test-vercel-output.png | grep -q "PNG"; then
    DIMENSIONS=$(file test-vercel-output.png | grep -oE '[0-9]+ x [0-9]+' || echo "unknown")
    echo "   Dimensions: $DIMENSIONS"
    
    if echo "$DIMENSIONS" | grep -q "1440 x 1080"; then
      echo "   ✅ Correct resolution (1440x1080)"
    else
      echo "   ⚠️  Unexpected dimensions (expected 1440x1080)"
    fi
  else
    echo "   ⚠️  File may not be a valid PNG"
  fi
  
  echo ""
  echo "💾 Saved to: test-vercel-output.png"
  echo "✅ Test passed!"
  exit 0
else
  echo "❌ Test failed!"
  echo "Response body:"
  echo "$HTTP_BODY" | head -c 500
  echo ""
  exit 1
fi

