# Set up PlatePilot with Siri and Apple Intelligence

**Important:** PlatePilot is a web app. Safari/Home Screen web apps cannot directly run Apple's private Siri/Apple Intelligence model or read HealthKit. You create a native iPhone Shortcut as the bridge. Apple’s `Use Model` action can receive text, magic variables and photos on supported Apple Intelligence iPhones running a compatible iOS version. The interface may differ on your phone.

Official documentation: [Use Apple Intelligence in Shortcuts](https://support.apple.com/en-afri/guide/shortcuts/tpg3vrvwmclv/ios).

## Create the "PlatePilot Food AI" shortcut

1. On the iPhone, turn on Apple Intelligence in Settings if it is supported and desired.
2. Open **Shortcuts → +** and name it exactly `PlatePilot Food AI`.
3. Add action **Take Photo**. For the first version, keep **Show Camera Preview** enabled. This photo originates in the Shortcut, not the web app.
4. Add **Ask for Input**, choose Text, prompt: `Describe ingredients, cooking oil, sauces and portions (optional)`.
5. Add a **Text** action containing the full prompt below. Insert the **Photo** magic variable from Take Photo in the prompt (after `Photo:`), and the text result of Ask for Input after `Description:`. The text action should pass both variables through into the next step. If the photo magic variable isn't accepted, put both variables directly into the Use Model action's prompt.
6. Add the **Use Model** Apple Intelligence action. Select **On-Device** if appropriate, or Apple's **Cloud** model if your device offers it and you want better image understanding. Feed the previous Text action as the prompt. Disable Follow Up to get an output immediately. If the On-Device model cannot interpret the image, try Cloud instead.
7. Under the model action, set **Output** to Text if that option is available; it should output only JSON.
8. Add **Copy to Clipboard**, passing the `Use Model` response to it.
9. Optionally add **Show Notification** with `PlatePilot estimate copied. Return to PlatePilot → Add Food → Paste AI.`
10. Save and run your Shortcut once inside Shortcuts. Grant any necessary camera/model/clipboard permissions. If it doesn't output valid JSON, refine the prompt or use the model's Cloud setting.

Paste this into the model prompt (after inserting the image and description variables as described):

```text
Estimate the calories and macronutrients of this entire meal from the attached food photo and description. Consider realistic portions, oil, dressing, sauces and hidden ingredients. Use a cautious upper-middle calorie estimate so that it is less likely to undercount calories. Do not exaggerate protein. State uncertainty in notes and do not claim perfect accuracy.

Photo: [insert the Photo magic variable here]
Description: [insert the Ask for Input text magic variable here]

Reply with one VALID JSON object only, no markdown, no extra text, no code fences:
{"name":"Chicken and rice bowl","calories":720,"protein":42,"carbs":68,"fat":29,"fiber":5,"notes":"Assumed 180g chicken, 1 cup rice and about 1 tbsp oil; serving size uncertain"}

Every calorie and macro field must be a JSON number representing the WHOLE MEAL, never a per-100g value. If the photo cannot be analyzed, say that in notes and use the description, if available. Never invent the presence of ingredients not supported by the description/photo; specify any assumptions.
```

## Use it with PlatePilot

1. From your iPhone Home Screen, launch PlatePilot.
2. Tap **Food photo** → **Run Apple AI Shortcut**.
3. The Shortcut takes a picture and asks for description. The model produces JSON and copies it to your clipboard.
4. Return to PlatePilot, tap **Add food → Paste AI** (or **Paste AI result and review** in the photo workflow).
5. Tap **Paste clipboard**, or hold your finger in the text box and select Paste.
6. Tap **Review estimate**. Edit calories and macros if needed, then **Confirm and log food**.

To attach a photo locally in the log too, choose a photo in PlatePilot's photo screen before you tap the paste step. It stores a compressed copy in IndexedDB. The Shortcut itself doesn't automatically send its photo back to PlatePilot.

If you want to invoke it by voice, tell Siri **“Run PlatePilot Food AI”**. Siri launches the Shortcut; use the same paste workflow to save.

### Optional: automatic one-tap handoff via a URL

Advanced option, only after the basic Shortcut works:

1. In the Shortcut, after Use Model, add **URL Encode** using the model response. Encode it as a URL component.
2. Add **Text**: `https://YOUR-USERNAME.github.io/platepilot/?import=` and insert the encoded response immediately after the equals sign.
3. Add **Open URLs** with the Text value. Depending on iOS, this may open Safari rather than the Home Screen app. You can also paste manually, which is more reliable.
4. PlatePilot parses this query parameter and opens the review screen, without silently saving calories.

Do not put personal health data in a public GitHub commit or public URL. A deep-link URL can be stored in browser history or analytics outside PlatePilot. The clipboard route avoids sending estimates as URL parameters.

## Create the optional Siri voice food logger

1. Open **Shortcuts → +** and name it exactly `PlatePilot Voice Log`.
2. Add **Dictate Text**. Say your meal naturally, including portions, such as “Two eggs, a slice of toast and one tablespoon butter.”
3. Add **Text** with the prompt below, inserting the Dictated Text magic variable where indicated.
4. Add **Use Model**, choose Apple's **On-Device** or **Cloud** model and pass the Text prompt.
5. Add **Copy to Clipboard** with the model response.
6. Add **Show Notification**: `Voice nutrition estimate copied. Open PlatePilot and paste it.`
7. In PlatePilot, choose **Add Food → Paste AI → Paste clipboard → Review estimate**. Edit values, confirm and save.

Voice prompt:

```text
Estimate total calories and macros from this dictated food description. Be cautious about unmentioned cooking oil, sauces and serving sizes. Don't invent precise food weights. Respond ONLY with JSON: {"name":"meal","calories":500,"protein":30,"carbs":40,"fat":20,"fiber":3,"notes":"assumptions and uncertainty"}. Use numbers for the entire meal, not per 100g.

Dictated food: [insert Dictated Text magic variable here]
```

Run it by saying **“Hey Siri, run PlatePilot Voice Log”**, or tap **Log with Siri voice Shortcut** from the Today screen. The voice Shortcut does not log automatically; the review/paste step is deliberate to prevent unverified AI estimates entering your diary.

## Import a workout manually from a Shortcut

The PlatePilot importer also understands a separate workout JSON object:

```json
{"type":"workout","name":"Judo","date":"2026-10-17","minutes":75,"calories":520}
```

Create a second Shortcut if useful:

1. Name it `PlatePilot Workout`.
2. Use **Ask for Input** to collect workout name, date, duration and *active workout energy* as recorded by Apple Health or WHOOP.
3. Use a **Text** action to construct the JSON shown above. The date should use `YYYY-MM-DD`, and energy should be calories, not kilojoules. Use **Copy to Clipboard**.
4. Open PlatePilot → Settings → **Paste Shortcut response**, paste the JSON and choose **Review estimate**. Workout JSON imports immediately as a workout.

This is a manual bridge, **not automatic HealthKit access**. The native Shortcuts `Find Health Samples` action supports certain Health data, but direct workout access/fields vary; don't assume every WHOOP workout is exposed as a readable workout sample. If automatic syncing is essential, a native HealthKit companion or a secure WHOOP OAuth integration is the next development stage.

## Troubleshooting

- **Nothing happens when I tap Run Apple AI Shortcut**: confirm the Shortcut's exact name is `PlatePilot Food AI`, and launch it once from Apple's Shortcuts app. Some iOS versions ask whether to open another app.
- **No Use Model action**: confirm the iPhone supports Apple Intelligence, it is enabled, and iOS/Shortcuts are updated.
- **Photo isn't understood**: try the Apple Cloud model or a more detailed written description; the on-device model can be limited.
- **Paste clipboard does not work**: touch and hold the textarea, then use iOS Paste.
- **JSON error**: the response must be a single JSON object with `name`, numeric `calories`, `protein`, `carbs`, and `fat`; no preceding explanation. Copy the example format exactly.
- **Nutrition seems implausible**: edit it in the review form or log with a label/manual measurement. A food image cannot determine weight or oil precisely.
