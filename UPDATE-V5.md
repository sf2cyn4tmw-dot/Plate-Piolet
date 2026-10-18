# PlatePilot v5 iPhone update

**First:** Open PlatePilot → Profile → Settings & Backups → Export full JSON backup.
Save the backup in Files and verify it exists.

In your current GitHub repository, open **Code** → **Add file** → **Upload files**.
Upload these **four individual files** from this ZIP in your repository's root:

* `app.js` — replace
* `styles.css` — replace
* `sw.js` — replace
* `smart-food.js` — add (new file)

Commit to `main` and wait for GitHub Pages to finish deploying.
Do **not** delete the existing Home Screen app or clear website storage.

In PlatePilot use + → Food, type:
`Reuben sandwhich from Buffalo bergens`
Tap **Find or estimate meal** → **Review & log this meal**.

### Important limits
This version matches common restaurant dishes using typical ingredient portion
estimates. Those are **not official restaurant macro values**. It searches
USDA / Open Food Facts for published matches but cannot search arbitrary
restaurant sites automatically. Unknown dishes need online database results or
the Apple Intelligence Shortcut, which needs separate setup. Review every
estimate before logging.
