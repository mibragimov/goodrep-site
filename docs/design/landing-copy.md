# Landing page copy: variant C ("Gym clock")

The owner's verdict on round 1: "i like variant C for landing page but the wording needs a writer, rest timer is not
the wow feature". This deck rewrites every word of `prototypes/C/index.html` and re-orders the page around the new
lead. The visual system stays: the slanted seven-segment cells, chartreuse on black, Archivo Expanded, the scoreboard
of zeros and the real screenshots. Research: `docs/research/landing-copy.md`.

## The angle: the number to beat

**Beat last time.** Every lifter's session is one loop, match last time and then beat it, and Goodrep is built around
that loop: last session's weight and reps are filled in and the earlier sets sit under the fields, so the target is on
screen before you touch the bar. No strength app we read leads with it, and it is the one claim our own screenshot
proves on sight (80 kg × 8 filled in, yesterday's 80 × 8 underneath), where speed and "progress" are what every page
already says.

Ownership (no account, no server, your iCloud) is the second beat, in the scoreboard; the one-time price is the
third, in the Pro section. The rest timer becomes a hands-on demo near the end.

## Rules this deck follows

- H1 at most 5 words per line and 2 lines on a 402 px phone; display lines short and uppercase (volt.md §1, §3).
- Concrete verbs, a lifter's words. No exclamation marks, no em dashes, none of unleash, elevate, seamless,
  effortless, journey, supercharge. No numbers or testimonials that are not in the facts; the 80 × 8 and 2,168 are
  the screenshots' own sample data.
- Spelling follows the store copy (British-leaning). No word on the page has a US/UK variant except "Home Screen"
  (Apple's term) and none needed changing.
- Pro is exactly three things (owner rule, 2026-10-30): exercise progress charts (weight, reps, est. 1RM, volume,
  one month back to all time), body charts, alternate app icons. Never "full charts", never the sideways chart.
- No price. The App Store link is a placeholder.

Source keys: **M-desc** = metadata.md, "Description, without Pro"; **M-pro** = "Description, with Pro"; **M-promo**
= promotional text; **M-sub** = subtitle; **M-priv** = App Privacy section; **Owner** = the owner's Pro rule of
2026-10-30. SPEC IDs as written.

## Page order

| # | Section | Was (round 1) | Now |
|---|---|---|---|
| 1 | Hero | GOODREP clock running a live rest timer, "Lift. Log. Rest. Repeat." | A board showing last session's set, "Beat last time." |
| 2 | Screens | 4 rounds, plan first | Same 4 screens, the logging screen first (it proves the hero) |
| 3 | Scoreboard | 4 zeros, 1 Pro payment, 400 exercises; Pro mixed into the footnotes | 5 zeros, all about ownership; two footnotes (iCloud, CSV) |
| 4 | Pro | a sentence under the scoreboard | its own section |
| 5 | Rest timer | second section, "The break starts itself." | a demo block: "Rest on the clock.", the live timer moved here |
| 6 | Closing | "Coming to the App Store." | unchanged state, rewritten button |

## 1. Hero

| Element | Copy | Source |
|---|---|---|
| Board, left tag | FLAT BENCH PRESS · LAST TIME | screenshot 03 sample data |
| Board, right tag | FILLED IN | M-desc "Weight and reps are filled in from last time"; E4.2 |
| Board, digits | 80 KG × 8 REPS (static, `aria-label` "Last time: 80 kilograms for 8 reps") | screenshot 03 |
| Eyebrow | A STRENGTH-TRAINING LOG FOR IPHONE | SPEC §1.1 "A personal strength-training log for iPhone" |
| **H1** | **BEAT / LAST TIME.** | M-desc "so you always know what to beat"; E4.2, E4.5 |
| **Subhead** | Open an exercise and last session's weight and reps are already in the fields, with your earlier sets listed under them. **Most sets take one tap.** No account, no ads, no subscription. | M-desc "Weight and reps are filled in from last time, so most sets take one tap"; "Your earlier sessions sit right under the entry fields"; M-desc "No account, no ads"; E11 / M-promo-with-Pro "no subscription" |
| CTA (launch state) | COMING TO THE APP STORE (ghost button to `#appstore`) | brief |
| Header nav | THE LOG · SCOREBOARD · PRO · APP STORE: SOON | |

### Alternates

| | H1 | Subhead |
|---|---|---|
| A | **LAST TIME, / FILLED IN.** | Every exercise opens on the weight and reps you did last session, with your earlier sets underneath. Lift, tap Add set, go again. No account, no ads, no subscription. |
| B | **YOUR LOG. / NOBODY ELSE'S.** | No account to make, no ads, no tracking. Every set lives on your iPhone and in your own iCloud, and leaves as a CSV file whenever you want. |

A keeps the angle with a plainer verb; B leads with ownership instead (angle 2 of the research).

## 2. Screens (`#rounds`)

| Element | Copy | Source |
|---|---|---|
| Eyebrow | ONE SESSION, FOUR SCREENS | |
| H2 | EVERY SET, / LOGGED HONESTLY. | M-sub "Every set, logged honestly" |
| 01, logging screen | **ONE TAP A SET.** Yesterday's 80 × 8 is already in the fields. Went heavier? Change the number, then tap Add set. | M-desc LOG EVERY SET bullets 1, 3; E4.2, E4.4; screenshot 03 |
| 02, workout editor | **BUILD IT ONCE.** Pick from more than 400 exercises on a body map, set targets like 3 × 8–10 and pair supersets. | M-desc PLAN YOUR WORKOUTS bullets 1, 2; E2.2, E3.3 |
| 03, summary | **READ THE TOTAL.** Sets, reps, volume and time, with a map of the muscles you trained. Share it as an image. | M-desc SEE HOW FAR bullet 2; E6.4 |
| 04, calendar | **EVERY DAY ON RECORD.** A calendar marks each training day. Open one to see every set you did. | M-desc SEE HOW FAR bullet 1; E6.1, E6.2 |

Alt text was rewritten to describe what each screen shows for the new captions (the logging screen's alt names the
filled-in 80 kg and 8 reps and the sets listed under them).

## 3. Scoreboard (`#score`)

| Element | Copy | Source |
|---|---|---|
| Eyebrow | SCOREBOARD | |
| H2 | LEFT OUT / ON PURPOSE. | |
| Board tags | LEFT OUT · COUNT | |
| Row | ACCOUNTS TO MAKE: 0. *Open the app and lift.* | M-desc "No sign-up"; §1.1 "no accounts"; E1.1 (onboarding can be skipped) |
| Row | ADS: 0. *Not on any screen.* | M-desc "no ads"; §1.1 |
| Row | TRACKERS AND ANALYTICS: 0. *We never see your workouts or health data.* | M-desc PRIVATE BY DESIGN, verbatim sentence |
| Row | SUBSCRIPTIONS: 0. *Nothing renews, so there is nothing to cancel.* | E11 "no subscription"; §1.2 |
| Row | SERVERS OF OURS: 0. *Your log lives on your iPhone and in your own iCloud.* | M-priv "there is no server of ours"; M-desc "on your iPhone and in your own iCloud" |
| Footnote 1 | **Your data stays yours.** Workouts, sets and measurements sync through your private iCloud database, which only your Apple Account can read. Apple Health is optional. | M-desc SYNCS WITH ICLOUD; WORKS WITH APPLE HEALTH; E9.1, E8 |
| Footnote 2 | **Take it with you.** Export every set you have logged as a CSV file for your spreadsheet, and import it again on any device. | M-desc SYNCS WITH ICLOUD bullet 2; E6.5 |

## 4. Pro (`#pro`)

| Element | Copy | Source |
|---|---|---|
| Eyebrow | GOODREP PRO | E11 name |
| H2 | PAY ONCE. / KEEP IT. | Owner; M-pro "Buy it once and keep it" |
| Line 1 | **EXERCISE CHARTS.** Weight, reps, estimated 1RM and volume, from the last month back to your first session. | Owner (1M to All); E6.3, E11.2 |
| Line 2 | **BODY CHARTS.** Body weight, body fat and tape measurements, charted over time. | Owner; E7.2, E11.2 |
| Line 3 | **APP ICONS.** Alternate icons for your Home Screen. | Owner; E11.2 |
| One-time line | **One purchase, no subscription.** Pro stays yours on all your iPhones and reaches your family through Family Sharing. | Owner; M-pro "on all your iPhones and with your family through Family Sharing"; E11 |
| Free line | Everything else stays free: unlimited logging and workouts, timers, the history calendar, the summary and its share image, CSV export and import, iCloud sync and Apple Health. | Owner's free list; E11.2 "Everything else in E1–E10 is free and unlimited" |

## 5. Rest timer demo (`#rest`)

| Element | Copy | Source |
|---|---|---|
| Eyebrow | BETWEEN SETS | |
| H2 | REST ON / THE CLOCK. | |
| Body | Log a set and the break timer can start by itself. At zero you get a beep and a haptic, a spoken cue if you want one, and a notification when the app is in the background. | M-desc LOG EVERY SET bullet 4; E4.7, E5.1 |
| Facts | PER EXERCISE: its own rest time · FULL SCREEN: −15 s · +15 s · VOICE, OPTIONAL: "Break over. Next: …" | E3.3, E4.8, E5.1 |
| Clock tags | BREAK TIMER · READY / RESTING / PAUSED / SET / BREAK OVER | |
| Cue under the clock | The app's break timer, working. Give it a go. | |
| Buttons | −15 · START REST / PAUSE · +15 | E4.8 |
| Live messages | "Resting 1 minute 30 seconds. Next: Standing overhead press." · "Break over. Next: …" | E5.1 |

The display idles on 01:30 instead of spelling GOODREP: the brand already sits in the header and the footer.

## 6. Closing (`#appstore`)

| Element | Copy |
|---|---|
| Eyebrow | LAUNCH |
| H2 | COMING TO / THE APP STORE. |
| Button (not a link yet) | FREE ON IPHONE · NOT OUT YET |
| Line | Questions before launch? support@goodrep.fitness |

## 7. Footer

GOODREP in segments; "Goodrep: Workout Tracker. Every set, logged honestly." (store name + M-sub); Privacy policy ·
Support · support@goodrep.fitness; © 2026 Mukhammadjon Ibragimov.

## 8. Metadata

| Tag | Copy |
|---|---|
| `<title>` | Goodrep: Workout Tracker · Beat last time |
| meta description | A strength-training log for iPhone. Last session's weight and reps are filled in, so most sets take one tap. No account, no ads, no tracking, and your data stays in your own iCloud. |
| og:title | Goodrep: beat last time |
| og:description | Last session's numbers, filled in and waiting. A strength-training log for iPhone with no account, no ads and no subscription. |

## Critic rounds

(recorded below as they happen)
