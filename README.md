# PlatePilot

**PlatePilot is an original, private, offline-first nutrition PWA.** Its core features require no subscription or account. It works on iPhone Home Screen, desktop, and other modern browsers.

## What's included

- Nutrition diary separated into Breakfast, Lunch, Dinner and Snacks, with date navigation.
- Editable calories, protein, carbs, fat, fiber, daily macro goals, and calorie budget.
- Over 60 offline **generic estimates** with editable portions; custom foods and favorites.
- Online brand-name product and barcode lookup through Open Food Facts, subject to internet access, its data quality and rate limits.
- Barcode camera button when the browser supports `BarcodeDetector`. **Safari may not support it**, so barcode numbers can always be entered manually.
- Camera photo attached to locally saved entries. Optional Apple Intelligence photo and voice estimates **via separately configured Apple Shortcuts**. It does not directly call Siri inside the web page.
- Search and save recipes (ingredient nutrition calculated by weight, per serving), reusable meal day plans.
- Water tracking, weight history, manual workout log, fasting timer, basic 7-day trends, adjustable calorie/macro goals, light or dark theme.
- Full JSON backup and restore, CSV export of food entries.
- Runs offline after first load; your logs live in **IndexedDB on the device**, not in GitHub.

## Deploy to GitHub Pages

You can use the GitHub website from a Mac or iPhone. From a Mac, bulk upload is easier.

1. Download `platepilot-github-pages.zip` from this ChatGPT response and unzip it.
2. In GitHub, create a **new public repository** named `platepilot` (or any name you prefer). No other files are required.
3. In that repository, choose **Add file → Upload files**. Upload the *contents* of the unzipped folder, not the ZIP itself. Preserve the icon files. Files such as `index.html`, `app.js`, `db.js`, `styles.css`, `sw.js`, `manifest.webmanifest` must be at the repository root.
4. Commit the files to the `main` branch.
5. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, `main`, `/ (root)`, then **Save**.
6. Your URL will normally be `https://YOUR-USERNAME.github.io/platepilot/`. Open that address in **Safari on your iPhone**.
7. Tap **Share → Add to Home Screen → Add**. If offered, enable **Open as Web App**.
8. Launch PlatePilot using the new Home Screen icon. Set your own calorie and macro targets in **Settings**.
9. Log a sample food, close the app, open it again, and verify the entry remains.
10. Under Settings, export a backup and save it to iCloud Drive or Files.

The app works with GitHub Pages project subpaths because all assets and the service worker use relative paths. Do not upload the zip itself as the only repository file.

### How to update

Replace the web files in your repo and increment `CACHE` in `sw.js` (for example `platepilot-static-v2`) when releasing an update. Reload the app online. IndexedDB entries are separate from the app cache and should remain, but **export a backup first**.

## Siri and Apple Intelligence food and voice estimates

The browser cannot directly execute Siri, Apple Intelligence, or iOS HealthKit. Instead, the PWA launches the iPhone Shortcut named **PlatePilot Food AI**, and accepts the Shortcut's output via paste, or via its optional `?import=` URL. See [SHORTCUTS.md](./SHORTCUTS.md) for setup and a tested-on-paper flow. Actual action wording and availability depend on iOS and the iPhone model, and need to be verified on your device.

A Shortcut that takes a photo in Shortcuts cannot automatically receive a photo you previously selected inside the web app. Both photo paths are offered so that you can keep a photo in the diary and separately analyze a photo in the Shortcut.

There is no external AI API key, server, or paid inference dependency in this project. **The shortcut is not included as an installable `.shortcut` file**. You configure it once in iOS Shortcuts using the guide, then use the Food Photo screen to open it.

## Apple Health and WHOOP

The PWA cannot directly fetch workout data from Apple Health. The included Fitness panel supports **manual workout entry and JSON import**. WHOOP API syncing, automatic Apple Health workout reads and background syncing are **not implemented**. They require a separate secure OAuth backend and/or iOS HealthKit companion. See [SHORTCUTS.md](./SHORTCUTS.md) for supported import format and a manual Shortcut workflow.

The app leaves exercise calories out of the calorie budget by default to reduce double counting. You can change that in Settings.

## Privacy and data retention

- All logs, weights, workouts, plans, saved foods, photos and preferences live in local IndexedDB and do not go to the GitHub repository.
- Open Food Facts queries send your search text/barcode to Open Food Facts, subject to their privacy terms. Your diary is not sent.
- Using Apple Intelligence or another Shortcut extension follows the model chosen in your Shortcut (on-device, Apple Private Cloud Compute, or extension provider). The app itself does not transmit the food photos to an AI server.
- Browser data can be lost during storage clearing, device replacement or certain iOS conditions. A Home Screen PWA and Safari tab may use separate storage partitions. Use your Home Screen icon consistently. Export JSON backups regularly.
- A JSON backup contains **all your personal nutrition records and photos**. Store and share it carefully.
- GitHub Pages for public repositories hosts your **application code** publicly. Your local private logs are not part of the repo.

## Known limitations

- Offline common-food numbers are general **approximations, not an authoritative nutrition database**. Branded entries depend on volunteer-contributed Open Food Facts data and can be wrong. Check the label.
- AI can misjudge portions, oils and hidden ingredients. The app requires confirmation and editing before saving.
- Barcode detection from a live camera depends on browser support; typing the barcode is the reliable fallback.
- Open Food Facts search is initiated by button rather than per keystroke due to API rate limits. A site-wide or per-IP rate limit or browser restrictions may affect lookup availability.
- Device-only logs do not automatically synchronize across phones or Macs. JSON export/import is the transfer mechanism.
- The PWA has no push notifications, native Apple Health access, or true automatic WHOOP synchronization.
- Importing workout JSON copies calorie values into a manually entered workout. Do not interpret them as verified WHOOP measures unless they came from a trustworthy source.

## Tech

Static, vanilla JavaScript ES modules, IndexedDB, CSS, SVG, service worker, no build step, no hosted database, no analytics trackers, no passwords/API keys. Relative URLs work on a GitHub Pages subpath.

Food product data: [Open Food Facts](https://world.openfoodfacts.org/) under ODbL; comply with their attribution and share-alike terms if distributing extracted data. The original offline generic estimates are approximate reference values, not an official USDA database. This software is not affiliated with Lose It!, Apple or WHOOP.
