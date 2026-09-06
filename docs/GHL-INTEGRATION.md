# ARQRAN + HighLevel integration

ARQRAN is designed to run as a standalone PWA and inside a CRM iframe/custom menu without creating a second UI codebase.

## Embed

Use the ARQRAN production URL in a HighLevel custom menu / iframe. The app detects iframe mode and posts structured events to the parent window on the `arqran` channel.

Example parent listener:

```js
window.addEventListener('message', event => {
  const data = event.data
  if (data?.channel !== 'arqran') return
  console.log('ARQRAN event', data)
})
```

Events include scene opens, clicks, downloads, AR button taps, PWA installs and other experience activity. Scene runtime events are also written to Supabase through `/api/events`.

## CRM data model

Do not bind ARQRAN directly to one CRM vendor. `ar_integrations` represents destinations such as HighLevel, generic webhooks, analytics platforms or future providers. `ar_event_deliveries` queues delivery work independently of the scene event itself.

Recommended HighLevel mapping:

- ARQRAN scene / campaign -> GHL custom field or opportunity metadata
- QR scan / scene_open -> contact timeline activity
- CTA click -> workflow trigger / tag
- download -> workflow trigger / tag
- collectible claim -> workflow trigger / opportunity update
- form / lead action -> contact create/update
- visit to a geo location -> custom event when supported

## Media import

HighLevel-hosted image, video or file URLs can be attached to ARQRAN objects when they are publicly retrievable. For private CRM assets, use a server-side import adapter that downloads the asset with authorized CRM credentials and copies it into the ARQRAN `ar-assets` bucket. Never expose CRM access tokens in browser code.

## Security before external CRM writes

Before enabling arbitrary integration writes, add ARQRAN user authentication and organization/workspace ownership. Integration credentials must be encrypted/server-side only. The iframe bridge is intentionally event-only and does not expose secrets to the host page.
