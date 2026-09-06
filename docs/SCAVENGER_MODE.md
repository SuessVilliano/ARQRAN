# ARQRAN scavenger mode

## What can work with no native app

A QR code can launch a WebAR scene directly in Safari/Chrome. The browser page can request camera + location permission, monitor the user's location while the page/PWA remains active, and unlock nearby scenes automatically.

Flow:

1. User scans one `scan.liv8.co` hunt QR.
2. ARQRAN opens a Hunt Session and requests location permission.
3. The browser watches location while the session is open.
4. When the user enters a scene geofence, ARQRAN announces/unlocks the nearby object.
5. User taps the camera/AR action and places or reveals the object.
6. Claims/checkpoints are written to Supabase.
7. The next hidden location becomes active.

This supports city, park, event, mall, campus, neighborhood and outdoor scavenger hunts without requiring App Store installation.

## Browser limitation

Mobile browsers cannot silently open the camera or continuously run camera AR after the page has been closed/backgrounded. That is an operating-system privacy restriction, not an ARQRAN limitation.

For background discovery, a PWA/native wrapper can register geofences and send a notification such as `Something is nearby`. The user then taps it to reopen the camera experience.

## Persistent placement

There are three different meanings of "put it in that place":

### 1. Saved object transform

ARQRAN saves the object's scale, pitch, yaw, roll, material tint, animation settings and AR scale. Every QR reopens the same authored object configuration.

### 2. Approximate geographic placement

GPS latitude/longitude + radius determines where a scene can unlock. GPS is suitable for scavenger-hunt zones but is not precise enough to pin a character to one exact corner of a room.

### 3. Exact visual/world placement

For an object that must repeatedly appear on the exact same wall/table/doorway, use a visual anchor (image target/marker) or a VPS/world-anchor provider. The camera recognizes the physical target and restores the authored transform relative to it.

Recommended ARQRAN modes:

- `free`: QR opens object and user places it.
- `geo`: object unlocks inside a GPS radius; user places it.
- `image`: camera recognizes a poster/photo/marker and pins the object to it.
- `world`: future VPS/spatial-anchor mode for exact location without a visible marker.

## Recommended product experience

QR remains the universal entry point. Users do not need an app for normal scenes. Scavenger hunts run as an ARQRAN Hunt Session/PWA so one initial QR can unlock many objects as the user moves. A native app is optional later for background geofencing, push notifications and advanced persistent spatial mapping.
