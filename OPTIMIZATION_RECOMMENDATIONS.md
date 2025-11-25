# Codebase Optimization Recommendations

## 🎯 Quick Wins (High Impact, Low Effort)

### 1. **Remove Console Logs from Production**
**Location:** `hooks/useConfettiLayout0.js` and `hooks/useConfettiLayout1.js` (console.log statements)
**Impact:** Reduces bundle size, improves performance
**Priority:** High
**Fix:**
```javascript
// Replace all console.log with:
if (process.env.NODE_ENV === 'development') {
  console.log('...')
}
```

### 2. **Optimize Canvas Rendering**
**Location:** `hooks/useConfettiLayout0.js` and `hooks/useConfettiLayout1.js` - `draw()` function
**Issue:** Clearing entire canvas every frame, drawing all particles even if off-screen
**Impact:** Significant performance improvement on mobile devices
**Priority:** High
**Recommendations:**
- Use dirty rectangle tracking (only clear/redraw changed areas)
- Cull off-screen particles (don't draw particles outside viewport)
- Batch canvas operations
- Consider using `willReadFrequently: false` for better GPU acceleration

### 3. **Debounce Card Bounds Updates**
**Location:** `hooks/useConfettiLayout0.js` and `hooks/useConfettiLayout1.js`
**Issue:** Random 1% chance to update bounds is inefficient
**Impact:** More predictable performance
**Priority:** Medium
**Fix:**
```javascript
// Instead of random check, use frame counter
if (frameCount % 60 === 0) { // Update every 60 frames (~1 second)
  cardBounds = updateCardBounds()
}
```

---

## 📦 Bundle Size Optimizations

### 4. **Code Splitting for Large Components**
**Location:** `components/SentCard1.jsx` (1536 lines)
**Impact:** Faster initial load, better code organization
**Priority:** Medium
**Recommendation:** Split into:
- `SentCardHeader.jsx`
- `SentCardBody.jsx` 
- `SentCardFooter.jsx` (already separate)
- Keep main `SentCard1.jsx` as orchestrator

### 5. **Lazy Load Confetti Hook**
**Location:** `components/SentCard1.jsx`
**Impact:** Reduce initial bundle size
**Priority:** Low
**Fix:**
```javascript
const useConfettiLayout0 = lazy(() => import('@/hooks/useConfettiLayout0'))
const useConfettiLayout1 = lazy(() => import('@/hooks/useConfettiLayout1'))
// Only load when card is hovered
```

### 6. **Image Optimization**
**Location:** All image imports
**Impact:** Reduce bundle size
**Priority:** Medium
**Recommendations:**
- Use Next.js Image component (already doing this ✅)
- Consider WebP format for better compression
- Lazy load images below the fold

---

## ⚡ Performance Optimizations

### 7. **Optimize Particle Array Operations**
**Location:** `hooks/useConfettiLayout0.js` and `hooks/useConfettiLayout1.js` - particle spawning/updating
**Issue:** Using `Array.from()` and `forEach()` for large arrays
**Impact:** Better performance with 200+ particles
**Priority:** Medium
**Recommendations:**
- Use `for` loops instead of `forEach` (faster)
- Pre-allocate particle array more efficiently
- Consider object pooling for particles

### 8. **Memoize Expensive Calculations**
**Location:** `components/SentCard1.jsx` - color calculations
**Issue:** Some color calculations may run on every render
**Impact:** Reduce unnecessary recalculations
**Priority:** Low
**Check:** Verify all expensive operations are memoized with `useMemo`

### 9. **Reduce Re-renders with useCallback**
**Location:** Check all components for inline functions
**Impact:** Prevent unnecessary child re-renders
**Priority:** Medium
**Status:** Most components already use `useCallback` ✅

---

## 🏗️ Architecture Improvements

### 10. **Split Large Files**
**Priority Files:**
- `components/SentCard1.jsx` (1536 lines) → Split into sub-components
- `components/sent-card/EnvelopeBoxContainer.jsx` (778 lines) → Extract animation logic
- `components/sent-card/GiftBoxContainer.jsx` (730 lines) → Extract animation logic

**Impact:** Better maintainability, easier testing
**Priority:** Low (but high value for long-term)

### 11. **Extract Animation Logic**
**Location:** `EnvelopeBoxContainer.jsx`, `GiftBoxContainer.jsx`
**Issue:** Complex animation logic mixed with rendering
**Impact:** Reusable animation system, easier to test
**Priority:** Low
**Recommendation:** Create `hooks/useBoxAnimation.js` and `hooks/useEnvelopeAnimation.js`

---

## 🔍 Code Quality

### 12. **Remove Debug Code**
**Location:** `hooks/useConfettiLayout0.js` and `hooks/useConfettiLayout1.js` - debug code
**Impact:** Cleaner code
**Priority:** Low
**Recommendation:** Remove debug elements or wrap in `__DEV__` flag

### 13. **Type Safety**
**Impact:** Catch bugs early, better IDE support
**Priority:** Low
**Recommendation:** Consider migrating to TypeScript gradually

---

## 📊 Performance Metrics to Monitor

1. **First Contentful Paint (FCP)**
2. **Time to Interactive (TTI)**
3. **Canvas FPS** (should maintain 60fps)
4. **Bundle Size** (target: < 500KB initial)
5. **Memory Usage** (confetti particles)

---

## 🎯 Implementation Priority

### Phase 1: Quick Wins (Do First)
1. ✅ Remove console logs (5 min)
2. ✅ Optimize canvas rendering (30 min)
3. ✅ Debounce bounds updates (5 min)

### Phase 2: Performance (Do Next)
4. ✅ Particle array optimizations (1 hour)
5. ✅ Code splitting (2-3 hours)

### Phase 3: Architecture (Long-term)
6. ✅ Split large components (4-6 hours)
7. ✅ Extract animation logic (2-3 hours)

---

## ✅ Already Optimized

- ✅ Components memoized with `React.memo`
- ✅ Static data outside components
- ✅ Custom hooks for reusability
- ✅ `useMemo` and `useCallback` used appropriately
- ✅ Next.js Image optimization
- ✅ Proper cleanup in useEffect hooks

---

## 📝 Notes

- The codebase is already well-optimized in many areas
- Focus on canvas rendering and bundle size for biggest impact
- Most optimizations are incremental improvements
- Consider user experience impact vs. development time

