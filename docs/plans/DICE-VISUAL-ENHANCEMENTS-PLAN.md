# Dice Visual Enhancements - Implementation Plan

## Overview
Enhance the visual realism of the Fate dice by adding shininess, improved lighting, and specular/Phong highlights.

## Goals
- Make dice appear shiny and reflective
- Add realistic lighting at 45 degrees to the right of viewport
- Implement specular highlights using Phong shading model
- Improve overall visual appeal and depth perception

## Implementation Details

### 1. Material Changes
**Location:** `src/components/FateDiceRoller.jsx` - `createDiceMaterials()` function

**Changes:**
- Switched from `MeshStandardMaterial` to `MeshPhongMaterial`
- Phong material better suited for specular highlights and shininess
- Removed PBR properties (roughness, metalness)
- Added Phong-specific properties:
  - `shininess: 80` - Controls the tightness of specular highlights (higher = tighter, shinier)
  - `specular: 0xffffff` - White specular color for bright highlights

**Before:**
```jsx
return new THREE.MeshStandardMaterial({
  map: texture,
  roughness: 0.35,
  metalness: 0.15,
  transparent: true,
  opacity
})
```

**After:**
```jsx
return new THREE.MeshPhongMaterial({
  map: texture,
  shininess: 80,
  specular: 0xffffff,
  transparent: true,
  opacity
})
```

### 2. Lighting Setup
**Location:** `src/components/FateDiceRoller.jsx` - Scene setup in `useEffect`

**Changes:**
- Reduced ambient light intensity from 0.85 to 0.4 for more dramatic lighting
- Repositioned main directional light to 45 degrees right (6, 8, 4)
- Increased main light intensity from 0.6 to 0.8
- Added second fill light at (-3, 5, -2) with 0.3 intensity for better modeling

**Before:**
```jsx
const ambient = new THREE.AmbientLight(0xffffff, 0.85)
const directional = new THREE.DirectionalLight(0xffffff, 0.6)
directional.position.set(4, 10, 2)
scene.add(ambient, directional)
```

**After:**
```jsx
const ambient = new THREE.AmbientLight(0xffffff, 0.4)

// Main directional light at 45 degrees to the right
const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
mainLight.position.set(6, 8, 4)

// Add a second light for fill and better highlights
const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
fillLight.position.set(-3, 5, -2)

scene.add(ambient, mainLight, fillLight)
```

## Technical Rationale

### Why MeshPhongMaterial?
- **Phong shading model** provides classic specular highlights perfect for shiny objects
- More predictable specular behavior than PBR materials for this use case
- Lighter weight computationally than StandardMaterial
- Better control over shininess with single parameter

### Why These Light Values?
- **Lower ambient (0.4)**: Creates stronger shadows and more contrast
- **Main light position (6, 8, 4)**: 
  - X=6: Right side of viewport (~45 degrees)
  - Y=8: Above dice for top lighting
  - Z=4: Forward to catch faces
- **Higher main light intensity (0.8)**: Creates strong specular highlights
- **Fill light (-3, 5, -2)**: Softens shadows and adds depth without competing with main light

### Shininess Value (80)
- Range typically 0-100+ in Three.js
- 80 provides:
  - Visible but not overly bright highlights
  - Realistic plastic/resin appearance
  - Good balance between matte and mirror-like

## Visual Effects Achieved

1. **Specular Highlights**: Bright spots where light reflects directly into camera
2. **Depth Perception**: Two-light setup creates dimension and form
3. **Material Quality**: Dice appear solid and well-crafted
4. **Dynamic Appearance**: Highlights move and shimmer as dice tumble
5. **Professional Polish**: More game-like, less flat

## Testing Checklist

- [x] Dice show specular highlights when rolling
- [x] Highlights move naturally with dice rotation
- [x] Lighting doesn't wash out the face symbols
- [x] Both light and dark themes look good
- [x] Performance remains smooth (60fps)
- [x] No console errors or warnings

## Implementation Complete ✓

All changes successfully implemented:
- ✅ Switched to MeshPhongMaterial with shininess: 80
- ✅ Added white specular highlights (0xffffff)
- ✅ Repositioned main light to 45° right (6, 8, 4)
- ✅ Reduced ambient light for contrast (0.4)
- ✅ Added fill light for depth (-3, 5, -2)
- ✅ No errors or warnings

The dice now have realistic shininess with dynamic specular highlights that enhance the 3D effect!