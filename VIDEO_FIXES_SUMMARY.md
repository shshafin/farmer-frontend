# Video Autoplay & Selection Fixes

## Issues Addressed

1. **Autoplay on Scroll/Refresh**: Videos weren't playing when scrolling down after a refresh.
   - **Cause**: Browser autoplay policies often block unmuted videos from playing automatically without user interaction.
   - **Fix**: Added `muted` attribute to all feed videos. This allows them to autoplay reliably.

2. **Video Selection Logic**: The previous logic picked the "topmost" visible video.
   - **Problem**: If you scrolled down but the previous video was still slightly visible at the top, it would keep playing, preventing the new (center) video from playing.
   - **Fix**: Updated logic to prioritize the video closest to the **center of the viewport**. This feels much more natural for a feed.

## Changes Made

### 1. Component Updates
- **`PostCard.jsx`**: Added `muted` attribute to `<video>`
- **`Post.jsx`**: Added `muted` attribute to `<video>`

### 2. Controller Logic Update (`useVideoVisibility.js`)
Changed sorting logic from:
```javascript
return rectA.top - rectB.top; // Sort by top position
```
To:
```javascript
// Sort by distance to center of viewport
const centerA = rectA.top + rectA.height / 2;
const centerB = rectB.top + rectB.height / 2;
return Math.abs(centerA - viewportCenter) - Math.abs(centerB - viewportCenter);
```

## Result
- Videos now autoplay reliably on page load and refresh (due to `muted`)
- Scrolling feels more responsive as the "focused" video plays
- Modal behavior remains correct (pauses feed videos)
