# Social Mockup Lab – Fake Chat, Post & Notification Generator

Browser-only generator for realistic **WhatsApp**, **iMessage/SMS**, **Instagram post**, **X post** and **lock-screen notification** mockups. One state object drives a live HTML/CSS phone preview (390×844, scaled to fit) and a dedicated canvas renderer that rasterises the same state to PNG at real 2x screenshot size (780×1688, or 836×1744 with the bezel).

**Live:** https://__SITE_URL__/ (placeholder – replace after deploy)

> Mockups are for creative, educational and parody use. Don't use them to deceive. The disclaimer is shown under the tool and repeated in `terms.html`.

## Features

**Free**
- 5 mockup types with realistic default content; segmented control switches the form + preview
- WhatsApp: contact name, status line, avatar (upload or initials), wallpaper color + doodle dots, date pill, messages with side/time/tick state, reorder ▲▼, light/dark
- iMessage: blue (iMessage) or green (SMS) bubbles, "Delivered", timestamp label, tails on the last bubble of a group
- Instagram: username, verified badge, avatar, photo or gradient placeholder, likes, bold-username caption, up to 3 comments, "View all N comments", time ago
- X: name, handle, verified, avatar, text with auto-highlighted @mentions/#hashtags/links, optional image, time, replies/reposts/likes/views
- Notifications: iOS-style lock screen, clock/date, 6 gradient wallpapers, 1–4 stacked cards (app emoji/color, title, body, time)
- Phone frame toggle (bezel + Dynamic Island), dark/light per type, overflow warning
- Download PNG (1x = 2× device pixels, watermark badge), copy to clipboard, reset
- 1 saved mockup slot; all drafts persisted in `localStorage`

**Pro (one-time, price from `config.js`)**
- No watermark
- 2x and 3x exports (1560×3376 / 2340×5064)
- Transparent-background PNG (no wallpaper, no frame)
- Sequence ZIP: one PNG per message count (chats) or per notification (JSZip lazy-loaded from jsDelivr)
- Unlimited saved mockups

## Files

```
index.html     tool page + SEO content + FAQ (JSON-LD WebApplication + FAQPage)
styles.css     _shared/base.css + phone/mockup/editor styles
app.js         state, DOM templates, canvas renderers, export, saves
monetize.js    shared theme / toast / analytics / AdSense / Pro licensing (copy of _shared)
studio.js      shared creative-tool helpers (copy of _shared)
config.js      window.APP_CONFIG (site URL, AdSense, GA, checkout URL, price, LICENSE, NEWSLETTER)
privacy.html   privacy policy (required for AdSense)
terms.html     terms of use (repeats the creative-use-only rule)
robots.txt, sitemap.xml, vercel.json, favicon.svg, .gitignore
```

Header, footer and lead card are placeholders: run `node _shared/apply-brand.js` from the repo root to inject the shared navbar/footer.

## Run locally

```bash
npx -y serve social-mockup-lab -l 5182
```

No build step.

## Deploy

Deploy the folder as a static site on Vercel (`vercel --prod`). After the first deploy, replace the placeholder URL everywhere:

```bash
sed -i 's/__SITE_URL__/mockuplab-tool.vercel.app/g' index.html privacy.html terms.html robots.txt sitemap.xml config.js README.md
```

## Monetization setup

1. **AdSense** – set `ADSENSE_CLIENT: "ca-pub-XXXXXXXXXXXXXXXX"` in `config.js`. Slots: `sidebar-1`, `below-tool`. `privacy.html` already discloses advertising cookies.
2. **Analytics** – set `GA_ID: "G-XXXXXXX"`. Events: `switch_type`, `generate`, `download`, `copy`, `download_zip`, `upload`, `save`, `pro_click`, `begin_checkout`, `license_activated`.
3. **Pro checkout** – create a one-time product on Lemon Squeezy, set `PRO_CHECKOUT_URL`, `PRO_PRICE` and the `LICENSE.store_id` / `product_id` so keys are validated against the License API. Until then only `LICENSE.test_keys` work.
4. **Newsletter** – set `NEWSLETTER.url` to show the lead card injected by `apply-brand.js`.

## Testing Pro locally

```js
localStorage.setItem('pro_license','1'); document.dispatchEvent(new Event('pro:changed'));
```
