# Layout Isolation Guide

## Problem
Changes meant for one layout sometimes affect other layouts due to:
1. Conditional logic that doesn't explicitly check `layoutNum`
2. Shared variables like `useBoxStyle` that can leak between layouts
3. Missing guards when applying layout-specific overrides

## Solution: Explicit Layout Guards

### Pattern to Follow

**ALWAYS use explicit layout guards when applying layout-specific logic:**

```javascript
// ✅ GOOD: Explicit layout check
const isLayout1 = !useSingleConfig && layoutNum === '1'
const isLayout2 = !useSingleConfig && layoutNum === '2'
const isLayout3 = !useSingleConfig && layoutNum === '3'

// Then use these guards for ALL layout-specific logic
hideEnvelope: isLayout1 ? useBoxStyle : (layoutConfig.hideEnvelope || false)
envelopeScale: (isLayout1 && useBoxStyle) ? 1.125 : (layoutConfig?.envelope?.scale || 1)
```

**❌ BAD: Implicit or missing layout checks**
```javascript
// This could affect other layouts if useBoxStyle is true
envelopeScale: useBoxStyle ? 1.125 : (layoutConfig?.envelope?.scale || 1)

// This doesn't check layoutNum
hideEnvelope: useBoxStyle
```

### Rules

1. **Always check `layoutNum` explicitly** - Never rely on derived variables alone
2. **Use layout guard constants** - Create `isLayout1`, `isLayout2`, `isLayout3` at the top
3. **Combine guards with conditions** - Use `(isLayout1 && useBoxStyle)` not just `useBoxStyle`
4. **Default to config values** - When not Layout 1, always use `layoutConfig.value`
5. **Add section comments** - Mark layout-specific sections clearly

### Example Structure

```javascript
// ============================================================================
// LAYOUT-SPECIFIC GUARDS
// ============================================================================
const isLayout1 = !useSingleConfig && layoutNum === '1'
const isLayout2 = !useSingleConfig && layoutNum === '2'
const isLayout3 = !useSingleConfig && layoutNum === '3'

// ============================================================================
// LAYOUT 1 SPECIFIC: cardStyle logic
// ============================================================================
const effectiveCardStyle = isLayout1 ? cardStyle : (layoutConfig?.cardStyle || 'envelope')
const useBoxStyle = effectiveCardStyle === 'box'

// ============================================================================
// ENVELOPE SETTINGS - Layout-specific overrides
// ============================================================================
// Layout 1 box style override: Only apply if it's Layout 1 AND box style
const effectiveEnvelopeScale = (isLayout1 && useBoxStyle) ? 1.125 : (layoutConfig?.envelope?.scale || 1)

// ============================================================================
// RETURN PROPS - Use guards for all layout-specific values
// ============================================================================
return {
  hideEnvelope: isLayout1 ? useBoxStyle : (layoutConfig.hideEnvelope || false),
  // ... other props
}
```

### Checklist Before Making Changes

- [ ] Does this change affect a specific layout? If yes, add explicit `isLayoutX` guard
- [ ] Are you using `useBoxStyle` or other derived variables? Combine with layout guard
- [ ] Are you overriding config values? Make sure the override only applies to the intended layout
- [ ] Have you tested all layouts (1, 2, 3) to ensure no cross-contamination?

