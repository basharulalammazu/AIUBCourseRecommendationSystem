# PWA & Mobile App (Android/iOS) Guide

This project now supports a Progressive Web App (PWA) experience and can be packaged as a native-like Android/iOS application using Capacitor.

## 1. Features Added

- Web App Manifest (`manifest.webmanifest`)
- Service Worker with offline caching (`service-worker.js`)
- Offline fallback page (`offline.html`)
- Install button appears when app is installable
- Icons folder placeholder (`/icons`)
- Capacitor config for wrapping into native shells

## 2. Add Proper Icons

Place these files in `/icons/`:

```
icons/icon-192.png
icons/icon-512.png
icons/maskable-512.png
```

Use PWABuilder.com or favicon.io to generate.

## 3. Running Locally With SW

Because service workers require secure context:

- Easiest: deploy to GitHub Pages / Netlify / Vercel.
- For local dev with SW on Windows: use `npx serve .` or any static server (not just double-clicking the HTML file).

## 4. Testing PWA Install

1. Serve the site.
2. Open Chrome → DevTools → Application → Manifest (verify no errors).
3. You should see the install icon in the omnibox or the in-app "Install App" button.

## 5. Offline Strategy

- Cache-first for core assets.
- Network fetch fallback; if fails, serve `offline.html`.
- New/changed files require a version bump: update `CACHE_NAME` in `service-worker.js`.

## 6. Adjusting Cache Version

Edit:

```js
const CACHE_NAME = "aiub-courses-v1";
```

Increment to `aiub-courses-v2` after changing core assets.

## 7. Capacitor (Android / iOS)

### Install Dependencies

```
npm install
```

### Add Platforms

```
npx cap add android
npx cap add ios
```

### Copy Web Assets Into Native Containers

```
npx cap copy
```

### Open IDE Projects

```
npx cap open android
npx cap open ios
```

### Build & Run

Use Android Studio / Xcode to build and run on emulators or devices.

> Note: Because this is a static app, no build step is required—`webDir` points to project root.

## 8. Updating After Changes

```
# After editing HTML/CSS/JS
npx cap copy
# (Optional) to update native dependency versions
npx cap sync
```

## 9. iOS Specific Notes

- Ensure icons meet Apple requirements (1024x1024 App Store icon when exporting).
- Enable Associated Domains only if adding push or deep links later.

## 10. Android Specific Notes

- Adjust app ID in `capacitor.config.json` if publishing.
- Create signed release build via Android Studio (Build > Generate Signed Bundle).

## 11. Security & Privacy

- No network calls beyond static assets unless user uploads files.
- If adding APIs later, consider adding runtime permission prompts inside native shells if needed.

## 12. Roadmap Ideas

- Sync selected courses to localStorage (already partly implicit) for offline reopen.
- Offer optional dark/light themed icons.
- Add in-app settings page for cache clearing & SW update trigger.
- Integrate share target / Web Share API.

## 13. Troubleshooting

| Issue                        | Cause                                       | Fix                                                   |
| ---------------------------- | ------------------------------------------- | ----------------------------------------------------- |
| Install button never appears | Missing manifest or SW not controlling page | Check DevTools > Application > Service Workers        |
| Old version persists         | SW cache not updated                        | Increment CACHE_NAME and reload twice                 |
| Offline page not shown       | Path mismatch                               | Ensure `offline.html` in root & listed in CORE_ASSETS |
| Icons blurry                 | Low-res source                              | Regenerate proper sizes                               |

## 14. Production Deployment

Deploy the root directory to any static host (Netlify, Vercel, GitHub Pages). Make sure `service-worker.js` and `manifest.webmanifest` are at the site root.

---

Happy scheduling! 🚀
