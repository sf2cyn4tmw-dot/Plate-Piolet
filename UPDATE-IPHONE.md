# Updating your existing PlatePilot to v6 from iPhone

**Always export a full JSON backup from your installed app to Files first. Do not delete the Home Screen app.**

1. In your installed PlatePilot app, open **Profile → Settings & Backups → Export full backup**. Save the JSON in Files/iCloud Drive. Verify it exists.
2. Download `platepilot-v6-iphone-update.zip` from ChatGPT. In iOS **Files**, tap once to unzip it.
3. In Safari, go to your **existing** GitHub repository, select `main`, choose **Add file → Upload files** and select all the included files. Update `app.js`, `smart-food.js`, `styles.css`, and `sw.js`; add `pi-search.js` as a new file. Do not upload the ZIP as a single file.
4. GitHub may prevent overwriting files with duplicate names through its web interface. If that happens, edit each file through GitHub's file editor or use a Git client on your Mac to commit changes. Do not delete the repository.
5. Commit to `main`; check your repository's **Actions** tab for the Pages deployment to finish.
6. Open your original PlatePilot Home Screen icon while online. Close and reopen as needed to fetch v6. Do **not** remove the icon or clear Safari website data: either action may cause loss of locally stored food history.
7. Open **Add → Food** and type `butter chicken from spice 6`. You should now see an instant whole-meal estimate, and the unrelated ingredient search is hidden under **Other food database results**.
8. For unfamiliar restaurant dishes, set up the optional **Raspberry Pi backend** using `PI-SETUP.md`, then connect it under **Profile → Settings & Backups → Intelligent restaurant search**.
9. Check one food diary entry from before the update, then create a new entry, quit the app and verify that the new entry persists.

Your existing IndexedDB schema (`platepilot-v1`) is unchanged. A new local `meta` record holds your private Pi URL and token. GitHub stores only the static app code.
