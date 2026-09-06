# ARQRAN — How to Build Spatial Experiences

## Fastest path

1. Open `https://arqran.liv8.co` on a phone or desktop.
2. Add a 3D model, image, video, web panel, text, or audio object.
3. For a GLB, tap **Place in real-world AR** to test it immediately in the room.
4. Resize, rotate, tint, and position the object in Spatial Studio.
5. Turn on **Location-aware** to save latitude/longitude and reveal distances.
6. Use **Use where I am now** to drop the object at your physical location, or use the Google Map picker to choose another point.
7. Tap **Save scene** to persist the scene.
8. Tap **Test QR** for a private test flow, or **Publish SQR** for the branded scan flow.

## ARIA natural-language assistant

ARIA can make scene changes from plain English. Examples:

- `Make this twice as big and red.`
- `Stand this model upright.`
- `Drop this object where I am now.`
- `Add a video and reveal it within 20 meters.`
- `Turn this into a scavenger hunt.`
- `Add text that says You found it!`
- `Publish this and make the QR.`
- `Open this in real-world AR.`

When `OPENAI_API_KEY` is configured, ARIA uses the serverless AI endpoint for flexible interpretation. Without it, ARQRAN falls back to the built-in command interpreter for common scene commands.

## Scavenger hunts

Every object can have its own saved latitude, longitude, and three proximity bands:

- **Near** — first discovery cue.
- **Warm** — the user is getting close.
- **Reveal** — the hidden object becomes available.

The runtime calculates live distance and bearing on the user's device. A hunt can therefore guide someone toward a hidden 3D model, image, video, audio clue, text message, collectible, or web panel.

## Family and memory experiences

Ideas that require no special app installation:

- Put a family video at a meaningful location.
- Attach a voice recording or song to a room, memorial, or landmark.
- Put virtual art or photos on a wall.
- Build birthday or holiday treasure hunts around a home.
- Place a hidden message that only reveals when someone reaches the location.

## Trading / workspace experiences

- Place a web panel or dashboard in a spatial scene.
- Create a floating video/news panel.
- Use text or audio alerts as spatial objects.
- Add multiple panels to a single saved workspace scene.

Some websites block iframe embedding. ARQRAN keeps an **Open website** fallback for those sites.

## Google Maps

Set `VITE_GOOGLE_MAPS_API_KEY` to a browser-restricted Google Maps JavaScript API key. Restrict the key to `https://arqran.liv8.co/*`. Once configured, creators can click or drag a marker on the embedded map to save a latitude/longitude for the selected object.

## Persistence

ARQRAN stores published/saved scene data in Supabase through serverless APIs. Model files and future uploaded media are stored in the `ar-assets` bucket. Do not place service-role credentials in the browser.

## Environment variables

See `.env.example` for the current full list. Important production values include:

- `VITE_PUBLIC_AR_BASE_URL=https://arqran.liv8.co`
- `VITE_GOOGLE_MAPS_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ASSET_BUCKET=ar-assets`
- `SQR_API_BASE_URL=https://sqr.co/api`
- `SQR_API_KEY`
- `SQR_SCAN_HOST=scan.liv8.co`
- `OPENAI_API_KEY` (optional, for full ARIA interpretation)

## Important limitation: exact persistent indoor placement

GPS is suitable for getting someone near an experience, but it is not precise enough to guarantee that an object returns to the exact same inch of a wall or floor. That requires an image target, QR/visual marker, or a persistent spatial-anchor/VPS layer. ARQRAN's scene model already includes those anchor types so that exact-persistence work can be added without changing the content model.
