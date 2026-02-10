# Task 1.2 - Reduce Metallic Sheen - Implementation Plan

## Overview
Reduce the metallic sheen of the dice to make them look more like plastic rather than metal or highly polished surfaces. This will create a more realistic appearance for typical gaming dice.

## Current State

**Location:** `src/components/FateDiceRoller.jsx` lines 76-85

**Current Material Properties:**
```jsx
return new THREE.MeshPhongMaterial({
  map: texture,
  shininess: 80,
  specular: 0xffffff,
  transparent: true,
  opacity
})
```

**Analysis:**
- **Shininess: 80** - Very high, creates tight, bright specular highlights
- **Specular: 0xffffff** - Pure white specular, gives metallic appearance
- **Result:** Dice look shiny and metallic rather than plastic

## Problem
The current settings make the dice appear:
- Too shiny and reflective
- Metallic rather than plastic
- Overly polished like chrome or lacquered wood
- Less realistic for typical gaming dice

## Goal
Make the dice appear:
- Matte to semi-gloss plastic
- Less reflective
- More like real Fate/Fudge dice (which are typically plastic)
- Still show some specular highlights but softer and more diffuse
- Maintain visibility of symbols and readability

## Plastic Material Characteristics

Real plastic dice typically have:
- **Lower shininess** - Broader, softer highlights (not tight spots)
- **Colored/tinted specular** - Not pure white reflections
- **Matte to semi-gloss** - Not mirror-like
- **Diffuse appearance** - Light scatters more
- **Subtle highlights** - Present but not dominant

## Implementation Approaches

### Option 1: Reduce Shininess (Simple)
**Change:** Lower shininess value from 80 to 20-30

**Pros:**
- Simple one-value change
- Immediately reduces metallic appearance
- Broader, softer highlights

**Cons:**
- May still look slightly metallic with white specular
- Limited control

### Option 2: Reduce Shininess + Tint Specular (Recommended)
**Change:** Lower shininess AND change specular to match base colors

**Pros:**
- More realistic plastic appearance
- Specular color matches material color (like real plastic)
- Better overall realism
- Still shows form and lighting

**Cons:**
- Requires color coordination with face colors
- Slightly more complex

### Option 3: Switch to MeshStandardMaterial with Low Metalness
**Change:** Use PBR material with roughness/metalness

**Pros:**
- Physically accurate
- Modern rendering approach
- More realistic

**Cons:**
- Different shading model (would need to rebalance lighting)
- May lose some of the current look
- More work to tune

## Recommended Approach: Option 2

Reduce shininess to 20-30 and tint the specular color to match the dice material colors.

## Implementation Plan

### Step 1: Determine Target Shininess Value

**Recommended ranges:**
- Matte plastic: 10-20
- Semi-gloss plastic: 20-35
- Glossy plastic: 35-50
- Current (metallic): 80

**Target: 25** - Semi-gloss plastic, realistic for gaming dice

### Step 2: Determine Specular Color

Instead of pure white (`0xffffff`), use a tinted specular based on the die face color:

**Dark Mode (`#060c23`):**
- Specular: `0x1a2650` (slightly brighter version of face color)
- Effect: Blue-tinted highlights, like plastic

**Light Mode (`#dee1ed`):**
- Specular: `0xf0f3ff` (slightly brighter, subtle blue tint)
- Effect: Soft white-blue highlights, plastic appearance

### Step 3: Update Material Properties

**Location:** `src/components/FateDiceRoller.jsx` line 77-85

**Before:**
```jsx
return new THREE.MeshPhongMaterial({
  map: texture,
  shininess: 80,
  specular: 0xffffff,
  transparent: true,
  opacity
})
```

**After:**
```jsx
return new THREE.MeshPhongMaterial({
  map: texture,
  shininess: 25,
  specular: isDark ? 0x1a2650 : 0xf0f3ff,
  transparent: true,
  opacity
})
```

### Step 4: Test and Tune

**Testing priorities:**
1. Verify reduced metallic appearance
2. Check that highlights are still visible but softer
3. Ensure form and depth are still clear
4. Test in both light and dark modes
5. Verify symbols remain readable

**Tuning options if needed:**
- **Too matte:** Increase shininess to 30-35
- **Too shiny:** Decrease shininess to 15-20
- **Highlights too colored:** Lighten specular color
- **Highlights too white:** Darken/saturate specular color

## Alternative Values to Consider

### More Matte Option
```jsx
shininess: 15,
specular: isDark ? 0x0f1a3a : 0xe5e8f5,
```
Result: Very matte plastic, minimal highlights

### Standard Plastic Option (Recommended)
```jsx
shininess: 25,
specular: isDark ? 0x1a2650 : 0xf0f3ff,
```
Result: Typical plastic dice appearance

### Glossy Plastic Option
```jsx
shininess: 40,
specular: isDark ? 0x2a3660 : 0xffffff,
```
Result: Shiny but still plastic, not metallic

## Technical Details

### Shininess in Phong Model
- Controls size of specular highlight
- Range: 0-100+ (no hard limit)
- Lower = broader, softer highlights
- Higher = tighter, sharper highlights
- 80 is very high (mirror-like)
- 20-30 is typical for plastic

### Specular Color
- Defines color of highlights
- Pure white (0xffffff) = metallic/mirror appearance
- Tinted to match material = plastic/painted appearance
- Should be brighter than base color
- Slight blue tint matches our color scheme

### Why This Works
Real plastic has:
- Lower surface reflectivity (lower shininess)
- Colored reflections (material absorbs some light)
- Diffuse scattering (broader highlights)
- Non-metallic appearance

## Expected Results

### Before (Current - Metallic)
- Bright white highlights
- Tight, sharp specular spots
- Mirror-like reflections
- Metallic appearance

### After (Plastic)
- Softer, broader highlights
- Colored/tinted reflections
- Less intense specular
- Matte to semi-gloss plastic appearance
- More realistic for gaming dice

## File Changes Summary

### Modified Files
- `src/components/FateDiceRoller.jsx` (lines 77-85)
  - Reduce `shininess` from 80 to 25
  - Change `specular` from `0xffffff` to theme-based color

### No New Dependencies
All changes use existing Phong material properties

## Testing Checklist

- [x] Dice appear less metallic/shiny
- [x] Specular highlights are softer and broader
- [x] Highlights have subtle color tint matching faces
- [x] Dice look like plastic rather than metal
- [x] Symbols remain clearly visible
- [x] Form and depth still apparent
- [x] Works well with chamfered edges
- [x] Works well with shadows
- [x] Good appearance in both themes
- [x] No performance impact
- [x] No console errors

## Success Criteria

- ✅ Dice look like plastic gaming dice
- ✅ Reduced metallic sheen
- ✅ Softer, more natural highlights
- ✅ Maintains visual quality and readability
- ✅ Works in both light and dark modes

## Notes

- This is a purely visual change
- No impact on physics or performance
- Easy to tune if needed
- Complements chamfered edges nicely
- Works with existing lighting setup
- Can be adjusted further based on preference

## Timeline Estimate

- Step 1-3: 5 minutes (update values)
- Step 4: 10-15 minutes (testing and tuning)
- **Total: 15-20 minutes**

## Implementation Complete ✓

**Completed:** 2026-02-10 20:44

All changes have been successfully implemented:

### Changes Applied

**Location:** `src/components/FateDiceRoller.jsx` lines 81-82

**Before:**
```jsx
shininess: 80,
specular: 0xffffff,
```

**After:**
```jsx
shininess: 25,
specular: isDark ? 0x1a2650 : 0xf0f3ff,
```

### Material Properties Updated

**Shininess:** Reduced from 80 to 25
- From tight, metallic highlights to broader, softer plastic highlights
- Standard semi-gloss plastic appearance
- More realistic for gaming dice

**Specular Color:** Changed from pure white to tinted
- **Dark mode:** `0x1a2650` (blue-tinted, matches navy face color)
- **Light mode:** `0xf0f3ff` (soft white-blue)
- Specular now matches material color like real plastic

### Verification
- ✅ Dice no longer have metallic/chrome appearance
- ✅ Specular highlights are softer and more diffuse
- ✅ Highlights have subtle color tint appropriate to theme
- ✅ More realistic plastic appearance
- ✅ Symbols remain clearly visible
- ✅ Works beautifully with chamfered edges
- ✅ Shadows and lighting still effective
- ✅ No console errors or warnings
- ✅ All diagnostics passing

### Visual Results

The dice now have:
- Realistic plastic appearance (not metallic)
- Softer, broader specular highlights
- Color-tinted reflections matching the material
- Semi-gloss finish typical of gaming dice
- Enhanced realism when combined with chamfered edges
- Professional game-quality rendering

The metallic sheen has been successfully reduced, making the dice look like proper plastic gaming dice!