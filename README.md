# Uncertainty ♥ Tessa — OurLoveMotivation

A little page for the two of you: your lovely words on the outside, your photos
next to them, and a beating heart with your names in the middle. Click anywhere and a
heart is slowly drawn with your names beside it; click the big heart for a surprise.

Open **`OurLoveMotivation.html`** in a browser (double-click it) — nothing to install.

```
OurLoveMotivation.html   ← the page (double-click to open)
index.html               ← only forwards to the page above (web hosts open index.html first)
css/style.css            ← all the looks
js/config.js             ← names, timings, heart-effect settings
js/loveWords.js          ← ♥ YOUR LOVELY WORDS (two arrays)
js/images.js             ← optional hand-written photo lists
js/main.js               ← the logic (you normally never touch it)
images/partner1/         ← photos of Partner 1 (left side)
images/partner2/         ← photos of Partner 2 (right side)
```

---

## 1. Your lovely words — `js/loveWords.js`

Two arrays: `partner1Words` (left panel) and `partner2Words` (right panel).

```js
const partner1Words = [
  "A short sentence in quotes, followed by a comma.",

  `A long text goes in backticks —
   you can press Enter as much as you like,
   write paragraphs, sign it...

   — with all my love`,
];
```

* A random sentence is shown; it changes every **5 minutes** (change `wordsIntervalMinutes` in `js/config.js`)
  or **immediately when you click the panel**. The thin bar at the bottom shows the time until the next one.
* No sentence repeats until all the others have been shown.
* Long texts scroll inside the panel; short ones sit in the middle.

## 2. Your photos — `images/partner1/` and `images/partner2/`

Just drop photos in and name them **`1.jpg`, `2.jpg`, `3.png`, `4.webp` …** (keep the numbers continuous —
the page stops looking at the first missing number). Nothing else to edit.

* Any size works — big, small, portrait, landscape — the photo is always fitted inside the frame,
  with a soft blurred copy behind it so there are never ugly empty bars.
* Photos change every 12 seconds (`photoIntervalSeconds` in `config.js`) or when you click the photo panel.
* Prefer your own file names? List them in `js/images.js` — they are shown first, then the numbered ones.
* Supported: jpg, jpeg, png, webp, gif, svg. iPhone **.HEIC** must be converted to .jpg first.
* Tip: resize huge photos to ~1600 px wide so the page loads fast (especially once it's online).

## 3. Names & timings — `js/config.js`

Names, both intervals, and the click-heart settings (how slowly it draws, how long it stays,
and how often it becomes neon or rainbow) all live there.

## 4. The click heart

Click anywhere: a heart is drawn slowly — its centre exactly where you clicked — with
`Uncertainty ♥ Tessa` on either side, then it floats away.

* most clicks → a random colour with a matching glow
* sometimes → **neon**: white heart with a colourful multi-layered glow
* sometimes → **rainbow**: rainbow-gradient heart with rainbow letters that keep shifting colour

## 5. The surprise — click the big heart

Clicking the beating heart in the middle starts a 20-second show (one of two, 50/50):

* **Kisses & hearts** slowly flood the whole page from the centre out to the corners, or
* a **kaleidoscope** of spinning geometric hearts that spiral into the centre, unite,
  and explode into a gigantic heart.

Afterwards the message (`surprise.message` in `config.js`, `\n` = new line) appears on top of
the page for 5 seconds, then everything fades and the page is back to normal.
It can't be started again until it has completely finished.

## 6. Embedding in Notion

Paste the link as an **Embed** block. Below ~1180 px wide the page rearranges itself to
`[photos 1] [heart] [photos 2]` with the two writing panels underneath, so it fits the embed;
drag the embed's bottom edge to give it more height if you like.

---

## 7. Putting it online — privately

> GitHub Pages only serves *private* repositories on a paid plan; a *public* repository would make
> your photos public. So use a host that takes a plain folder upload instead.

### Option A — "secret link" (5 minutes, free)

Only people who have the link can open it. Search engines never list it
(`<meta name="robots" content="noindex">` is already in the page).

1. Sign up at **cloudflare.com** (free).
2. Dashboard → **Workers & Pages → Create → Pages → Upload assets** (a "direct upload", no git needed).
3. Project name → this becomes your link, so make it unguessable, e.g. `love-x8k2o0q`.
4. Drag the whole project folder in (or a zip of it) → **Deploy**.
5. Your page is at `https://love-x8k2o0q.pages.dev` — send that link only to each other.
6. Changed the words or added photos? Open the project → **Create new deployment** → upload again.

(Alternative: **app.netlify.com/drop** — drag the folder, get a random `*.netlify.app` link.
Sign in so the site isn't deleted after 24 hours; rename the site to something unguessable.)

### Option B — real login, only the two of you (free, +10 minutes)

Same Cloudflare Pages site, plus **Cloudflare Access**: visitors must enter their e-mail and a
one-time code that is sent to it — and only the e-mails you allow get in. Photos included.

1. Pages project → **Settings → Access policy → Enable**. (First time it opens **Zero Trust**
   onboarding: pick a team name and the **Free** plan — up to 50 users. It may ask for a payment
   method, but the free plan is not charged.)
2. Go to the **Zero Trust** dashboard → **Access → Applications** → open the application that
   was created for your project → **Configure**.
3. Under the application's domains, add the production address too: `love-x8k2o0q.pages.dev`
   (by default only the preview addresses `*.love-x8k2o0q.pages.dev` are protected).
4. **Policies** → edit the policy: Action **Allow**, Include → **Emails** → your e-mail and Tessa's. Save.
5. Optional: in the application settings raise **Session duration** (e.g. 1 month) so you don't
   have to log in every day.

Now the link shows a small login page first; you each get a code by e-mail and you're in.

### Small privacy notes

* Photos can contain the place they were taken (GPS). Before uploading, in Windows:
  right-click photo → **Properties → Details → Remove Properties and Personal Information**.
* "Secret link" means exactly that: anyone you send it to can open it (and forward it).
  Option B is the one to use if that worries you.
