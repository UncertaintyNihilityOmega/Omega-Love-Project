/* =====================================================================
   main.js  —  all the magic of the page
   (you normally never need to touch this file —
    names, timings and words live in config.js / loveWords.js / images.js)
   ===================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  const SVG_NS = 'http://www.w3.org/2000/svg';

  // one heart shape, used everywhere (100 x 100 box, tip at the bottom)
  const HEART_FULL  = 'M50 90 C30 74 8 56 8 34 C8 20 18 11 29 11 C39 11 47 17 50 27 C53 17 61 11 71 11 C82 11 92 20 92 34 C92 56 70 74 50 90 Z';
  // the same heart split in two halves that both start at the bottom tip,
  // so the click-heart is drawn symmetrically and the two lines meet at the top
  const HEART_LEFT  = 'M50 90 C30 74 8 56 8 34 C8 20 18 11 29 11 C39 11 47 17 50 27';
  const HEART_RIGHT = 'M50 90 C70 74 92 56 92 34 C92 20 82 11 71 11 C61 11 53 17 50 27';

  const RAINBOW = ['#ff3b6b', '#ff9a3b', '#ffe23b', '#3bff9a', '#3bb8ff', '#c13bff'];
  const SOFT_PINKS = ['#ff6f9c', '#f48fb1', '#ce93d8', '#ffab91', '#ff8a80', '#f8bbd0', '#b39ddb'];

  const $        = id => document.getElementById(id);
  const rand     = (min, max) => min + Math.random() * (max - min);
  const randInt  = (min, max) => Math.floor(rand(min, max + 1));
  const pick     = arr => arr[Math.floor(Math.random() * arr.length)];
  const hsl      = (h, s = 95, l = 58, a = 1) => `hsla(${Math.round(((h % 360) + 360) % 360)}, ${s}%, ${l}%, ${a})`;
  const shuffle  = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  function heartSVG(size, color) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', HEART_FULL);
    path.setAttribute('fill', color);
    svg.appendChild(path);
    return svg;
  }

  /* ------------------------------------------------------------------
     Settings (with safe fallbacks in case config.js is edited badly)
     ------------------------------------------------------------------ */
  const cfg = (typeof CONFIG === 'object' && CONFIG) ? CONFIG : {};
  const p1  = cfg.partner1 || {};
  const p2  = cfg.partner2 || {};
  const name1 = String(p1.name || 'Partner 1').trim();
  const name2 = String(p2.name || 'Partner 2').trim();
  const folder1 = p1.photoFolder || 'images/partner1/';
  const folder2 = p2.photoFolder || 'images/partner2/';

  const wordsIntervalMs = Math.max(5, Number(cfg.wordsIntervalMinutes) || 5) * 60 * 1000;
  const photoIntervalMs = Math.max(2, Number(cfg.photoIntervalSeconds) || 12) * 1000;

  const heartCfg = cfg.clickHeart || {};
  const DRAW_MS  = (Number(heartCfg.drawSeconds) || 2.4) * 1000;
  const HOLD_MS  = (Number(heartCfg.holdSeconds) || 1.8) * 1000;
  const FADE_MS  = (Number(heartCfg.fadeSeconds) || 1.6) * 1000;
  const NEON_CHANCE    = Number.isFinite(heartCfg.neonChance)    ? heartCfg.neonChance    : 0.22;
  const RAINBOW_CHANCE = Number.isFinite(heartCfg.rainbowChance) ? heartCfg.rainbowChance : 0.18;

  const words1 = (typeof partner1Words !== 'undefined' && Array.isArray(partner1Words)) ? partner1Words : [];
  const words2 = (typeof partner2Words !== 'undefined' && Array.isArray(partner2Words)) ? partner2Words : [];
  const list1  = (typeof partner1Images !== 'undefined' && Array.isArray(partner1Images)) ? partner1Images : [];
  const list2  = (typeof partner2Images !== 'undefined' && Array.isArray(partner2Images)) ? partner2Images : [];

  /* ------------------------------------------------------------------
     Names everywhere
     ------------------------------------------------------------------ */
  document.querySelectorAll('[data-name="1"]').forEach(el => { el.textContent = name1; });
  document.querySelectorAll('[data-name="2"]').forEach(el => { el.textContent = name2; });
  document.title = `${name1} ♥ ${name2}`;

  /* ------------------------------------------------------------------
     Lovely words panel
     - random sentence, never repeating one until all have been shown
     - changes every N minutes, or immediately when the panel is clicked
     ------------------------------------------------------------------ */
  class WordsPanel {
    constructor({ panel, scroll, text, progress, words, intervalMs }) {
      this.panel = panel;
      this.scroll = scroll;
      this.text = text;
      this.progress = progress;
      this.intervalMs = intervalMs;
      this.words = words.filter(w => typeof w === 'string' && w.trim().length);
      this.bag = [];
      this.current = null;
      this.timer = null;
      this.fadeTimer = null;

      panel.addEventListener('click', () => this.next());
      this.next(true);
    }

    pickSentence() {
      if (this.words.length === 0) {
        return 'Write your lovely words in\njs/loveWords.js  ♥';
      }
      if (this.words.length === 1) return this.words[0];

      if (this.bag.length === 0) {
        this.bag = shuffle(this.words.slice());
        // the bag is used from the end — make sure the next one isn't the one on screen
        const last = this.bag.length - 1;
        if (this.bag[last] === this.current) {
          const other = this.bag.findIndex(w => w !== this.current);
          [this.bag[last], this.bag[other]] = [this.bag[other], this.bag[last]];
        }
      }
      return this.bag.pop();
    }

    next(immediately = false) {
      clearTimeout(this.timer);
      clearTimeout(this.fadeTimer);

      const sentence = this.pickSentence();
      this.current = sentence;

      const apply = () => {
        this.text.textContent = sentence;
        this.scroll.scrollTop = 0;
        this.scroll.classList.remove('fade-out');
        this.restartProgress();
      };

      if (immediately) {
        apply();
      } else {
        this.scroll.classList.add('fade-out');
        this.fadeTimer = setTimeout(apply, 460);
      }

      this.timer = setTimeout(() => this.next(), this.intervalMs);
    }

    restartProgress() {
      const bar = this.progress;
      bar.style.transition = 'none';
      bar.style.width = '0%';
      void bar.offsetWidth;                                  // force the reset to paint
      bar.style.transition = `width ${this.intervalMs}ms linear`;
      bar.style.width = '100%';
    }
  }

  new WordsPanel({
    panel: $('wordsPanel1'), scroll: $('wordsScroll1'), text: $('wordsText1'),
    progress: $('wordsProgress1'), words: words1, intervalMs: wordsIntervalMs
  });
  new WordsPanel({
    panel: $('wordsPanel2'), scroll: $('wordsScroll2'), text: $('wordsText2'),
    progress: $('wordsProgress2'), words: words2, intervalMs: wordsIntervalMs
  });

  /* ------------------------------------------------------------------
     Photo panel — cross-fading slideshow, every photo fitted in the frame
     ------------------------------------------------------------------ */
  class PhotoPanel {
    constructor({ panel, frame, counter, folder, intervalMs }) {
      this.panel = panel;
      this.frame = frame;
      this.counter = counter;
      this.folder = folder;
      this.intervalMs = intervalMs;
      this.images = [];
      this.index = -1;
      this.timer = null;
      this.currentSlide = null;

      frame.style.setProperty('--photo-dur', intervalMs + 'ms');
      this.showEmpty();
      panel.addEventListener('click', () => this.next());
    }

    showEmpty() {
      const empty = document.createElement('div');
      empty.className = 'photo-empty';
      const heart = document.createElement('div');
      heart.className = 'empty-heart';
      heart.textContent = '♥';
      const msg = document.createElement('div');
      msg.append('Put your photos in', document.createElement('br'));
      const code = document.createElement('code');
      code.textContent = this.folder;
      msg.append(code, document.createElement('br'), 'named 1.jpg, 2.jpg, 3.jpg …');
      empty.append(heart, msg);
      this.frame.appendChild(empty);
      this.emptyEl = empty;
    }

    add(url) {
      this.images.push(url);
      if (this.images.length === 1) {
        if (this.emptyEl) { this.emptyEl.remove(); this.emptyEl = null; }
        this.next();
      } else {
        this.updateCounter();
        if (this.images.length === 2) this.scheduleNext();   // now there is something to rotate to
      }
    }

    updateCounter() {
      this.counter.textContent = this.images.length > 1
        ? `${this.index + 1} / ${this.images.length}`
        : '';
    }

    scheduleNext() {
      clearTimeout(this.timer);
      if (this.images.length > 1) this.timer = setTimeout(() => this.next(), this.intervalMs);
    }

    next() {
      if (this.images.length === 0) return;
      this.index = (this.index + 1) % this.images.length;
      const url = this.images[this.index];

      const slide = document.createElement('div');
      slide.className = 'slide';
      const backdrop = document.createElement('img');
      backdrop.className = 'backdrop';
      backdrop.alt = '';
      backdrop.src = url;
      const photo = document.createElement('img');
      photo.className = 'photo';
      photo.alt = '';
      photo.src = url;
      slide.append(backdrop, photo);
      this.frame.appendChild(slide);

      requestAnimationFrame(() => requestAnimationFrame(() => slide.classList.add('show')));

      const old = this.currentSlide;
      this.currentSlide = slide;
      if (old) {
        old.classList.remove('show');
        setTimeout(() => old.remove(), 1400);
      }

      this.updateCounter();
      this.scheduleNext();
    }
  }

  const photoPanel1 = new PhotoPanel({
    panel: $('photoPanel1'), frame: $('photoFrame1'), counter: $('photoCounter1'),
    folder: folder1, intervalMs: photoIntervalMs
  });
  const photoPanel2 = new PhotoPanel({
    panel: $('photoPanel2'), frame: $('photoFrame2'), counter: $('photoCounter2'),
    folder: folder2, intervalMs: photoIntervalMs
  });

  /* ---- finding the photos ---- */
  const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'gif', 'WEBP', 'GIF', 'svg', 'SVG'];

  function probe(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload  = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async function loadPhotos(folder, manifest, panel) {
    if (!folder.endsWith('/')) folder += '/';
    const seen = new Set();

    // 1) files listed by hand in images.js
    for (const entry of manifest) {
      if (typeof entry !== 'string' || !entry.trim()) continue;
      const name = entry.trim();
      const url = (/^(https?:)?\/\//.test(name) || name.includes('/')) ? name : folder + name;
      if (seen.has(url)) continue;
      seen.add(url);
      if (await probe(url)) panel.add(url);
      else console.warn(`[photos] listed in images.js but not found: ${url}`);
    }

    // 2) numbered files 1.jpg, 2.png, 3.webp ... until the first missing number
    if (cfg.autoDiscoverPhotos === false) return;
    const max = Math.max(1, Number(cfg.maxAutoDiscoverPhotos) || 100);
    for (let i = 1; i <= max; i++) {
      let hit = null;
      for (const ext of EXTENSIONS) {
        const url = `${folder}${i}.${ext}`;
        if (seen.has(url) || await probe(url)) { hit = url; break; }
      }
      if (!hit) break;
      if (!seen.has(hit)) { seen.add(hit); panel.add(hit); }
    }
  }

  loadPhotos(folder1, list1, photoPanel1);
  loadPhotos(folder2, list2, photoPanel2);

  /* ------------------------------------------------------------------
     Background — softly floating hearts
     ------------------------------------------------------------------ */
  const floatingLayer = $('floatingHearts');
  const MAX_FLOATING = 26;

  // removes an element when its animation ends — with a timer as a safety net,
  // because browsers pause animations (and their events) in hidden tabs
  function removeAfter(el, ms) {
    el.addEventListener('animationend', () => el.remove());
    setTimeout(() => el.remove(), ms);
  }

  function spawnFloatingHeart(startMidway = false) {
    if (document.hidden || floatingLayer.childElementCount >= MAX_FLOATING) return;
    const el = document.createElement('div');
    el.className = 'fheart';
    const dur = rand(14, 26);
    el.style.left = rand(-2, 100) + 'vw';
    el.style.setProperty('--dur', dur + 's');
    el.style.setProperty('--sway', rand(14, 60) + 'px');
    if (startMidway) el.style.animationDelay = -rand(0, dur) + 's';

    const svg = heartSVG(randInt(10, 34), pick(SOFT_PINKS));
    svg.style.opacity = rand(0.18, 0.5).toFixed(2);
    svg.style.animationDuration = rand(2.4, 4.5) + 's';
    el.appendChild(svg);

    removeAfter(el, dur * 1000 + 1000);
    floatingLayer.appendChild(el);
  }

  for (let i = 0; i < 14; i++) spawnFloatingHeart(true);
  setInterval(spawnFloatingHeart, 900);

  /* ------------------------------------------------------------------
     Little hearts rising out of the big heart
     ------------------------------------------------------------------ */
  const heartWrap = document.querySelector('.heart-wrap');

  function spawnMiniHeart() {
    if (document.hidden || heartWrap.querySelectorAll('.mini-heart').length >= 8) return;
    const el = document.createElement('div');
    el.className = 'mini-heart';
    const dur = rand(2.2, 3.4);
    el.style.left = rand(32, 68) + '%';
    el.style.top  = rand(38, 55) + '%';
    el.style.setProperty('--dx', rand(-40, 40) + 'px');
    el.style.setProperty('--dur', dur + 's');
    const svg = heartSVG(randInt(9, 18), pick(['#ff6f9c', '#ff8fb3', '#ffb3c9', '#fff']));
    svg.style.filter = 'drop-shadow(0 0 4px rgba(255,111,156,.8))';
    el.appendChild(svg);
    removeAfter(el, dur * 1000 + 500);
    heartWrap.appendChild(el);
  }

  setInterval(spawnMiniHeart, 1100);

  /* ------------------------------------------------------------------
     Click heart — drawn slowly with our names on either side
     ------------------------------------------------------------------ */
  const effects = $('heartEffects');
  const TOTAL_MS = DRAW_MS + HOLD_MS + FADE_MS;

  // length of one half of the heart outline (for the drawing animation)
  let halfLength = 128;
  (function measure() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', HEART_LEFT);
    svg.appendChild(path);
    document.body.appendChild(svg);
    try {
      const len = path.getTotalLength();
      if (Number.isFinite(len) && len > 0) halfLength = len;
    } catch (e) { /* keep the fallback */ }
    svg.remove();
  })();

  function chooseMode() {
    const r = Math.random();
    if (r < NEON_CHANCE) return 'neon';
    if (r < NEON_CHANCE + RAINBOW_CHANCE) return 'rainbow';
    return 'solid';
  }

  // sets the colour variables on the effect element, returns colours for the burst
  function colourise(el, mode) {
    if (mode === 'neon') {
      // white heart with a colourful, multi-layered glow
      const h = rand(0, 360);
      const c1 = hsl(h, 100, 62), c2 = hsl(h + 75, 100, 60), c3 = hsl(h + 190, 100, 58);
      el.style.setProperty('--stroke', '#ffffff');
      el.style.setProperty('--glow',
        `drop-shadow(0 0 2px #fff) drop-shadow(0 0 7px ${c1}) drop-shadow(0 0 16px ${c2}) drop-shadow(0 0 32px ${c3})`);
      el.style.setProperty('--text-color', '#ffffff');
      el.style.setProperty('--text-glow',
        `0 0 3px #fff, 0 0 8px ${c1}, 0 0 18px ${c2}, 0 0 34px ${c3}`);
      return { burst: ['#ffffff', c1, c2, c3], rainbowLetters: false };
    }

    if (mode === 'rainbow') {
      el.style.setProperty('--stroke', 'url(#rainbowGrad)');
      el.style.setProperty('--glow',
        'drop-shadow(0 0 3px rgba(255,255,255,.95)) drop-shadow(0 0 12px rgba(255,80,160,.8)) drop-shadow(0 0 26px rgba(90,140,255,.6))');
      return { burst: RAINBOW, rainbowLetters: true };
    }

    // solid: one random colour with a matching glow
    const h = rand(0, 360);
    const c = hsl(h, 92, 56), soft = hsl(h, 92, 62, 0.75), softer = hsl(h, 92, 48, 0.4);
    el.style.setProperty('--stroke', c);
    el.style.setProperty('--glow',
      `drop-shadow(0 0 3px ${c}) drop-shadow(0 0 12px ${soft}) drop-shadow(0 8px 20px ${softer})`);
    el.style.setProperty('--text-color', c);
    el.style.setProperty('--text-glow', `0 0 6px ${soft}, 0 0 18px ${softer}, 0 4px 14px ${softer}`);
    return { burst: [c, hsl(h + 25, 92, 66), '#ffffff'], rainbowLetters: false };
  }

  function buildName(text, rainbowLetters, hueOffset) {
    const wrap = document.createElement('span');
    wrap.className = 'ch-name';
    const chars = Array.from(text);
    const spread = DRAW_MS * 0.85;
    chars.forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ch-letter';
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.animationDelay = Math.round(120 + (i / Math.max(1, chars.length - 1)) * spread) + 'ms';
      if (rainbowLetters) {
        const h = hueOffset + (i / Math.max(1, chars.length)) * 300;
        s.style.color = hsl(h, 95, 58);
        s.style.textShadow = `0 0 6px ${hsl(h, 95, 60, 0.9)}, 0 0 16px ${hsl(h, 95, 60, 0.5)}`;
      }
      wrap.appendChild(s);
    });
    return wrap;
  }

  function buildHeart() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'ch-svg');
    svg.setAttribute('viewBox', '0 0 100 100');

    const fill = document.createElementNS(SVG_NS, 'path');
    fill.setAttribute('class', 'ch-fill');
    fill.setAttribute('d', HEART_FULL);
    svg.appendChild(fill);

    for (const d of [HEART_LEFT, HEART_RIGHT]) {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('class', 'ch-path');
      p.setAttribute('d', d);
      svg.appendChild(p);
    }
    return svg;
  }

  function spawnBurst(x, y, colours) {
    const count = 14;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'burst-heart';
      const angle = (i / count) * Math.PI * 2 + rand(-0.35, 0.35);
      const dist = rand(60, 150);
      const dur = rand(0.9, 1.6);
      const colour = pick(colours);
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      el.style.setProperty('--dy', (Math.sin(angle) * dist - 25).toFixed(1) + 'px');
      el.style.setProperty('--rot', rand(-120, 120).toFixed(0) + 'deg');
      el.style.setProperty('--dur', dur.toFixed(2) + 's');
      el.style.filter = `drop-shadow(0 0 5px ${colour})`;
      el.appendChild(heartSVG(randInt(8, 18), colour));
      removeAfter(el, dur * 1000 + 300);
      effects.appendChild(el);
    }
  }

  function spawnClickHeart(x, y) {
    const mode = chooseMode();
    const el = document.createElement('div');
    el.className = `click-heart mode-${mode}`;

    // the centre of the heart is exactly the click point (the names hang off both sides)
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    el.style.setProperty('--len', (halfLength + 2).toFixed(1));
    el.style.setProperty('--draw', DRAW_MS + 'ms');
    el.style.setProperty('--total', TOTAL_MS + 'ms');

    const { burst, rainbowLetters } = colourise(el, mode);
    const hueOffset = rand(0, 360);
    const left = buildName(name1, rainbowLetters, hueOffset);
    const right = buildName(name2, rainbowLetters, hueOffset + 150);
    left.classList.add('ch-left');
    right.classList.add('ch-right');
    el.append(left, buildHeart(), right);
    effects.appendChild(el);

    setTimeout(() => spawnBurst(x, y, burst), DRAW_MS);
    setTimeout(() => el.remove(), TOTAL_MS + 200);
  }

  document.addEventListener('click', e => {
    if (e.detail === 0 && e.clientX === 0 && e.clientY === 0) return;   // keyboard "clicks"
    spawnClickHeart(e.clientX, e.clientY);
  });

  /* ------------------------------------------------------------------
     THE SURPRISE — click the big heart in the middle
       50%: kisses & hearts slowly flood the page from the centre to the corners
       50%: a kaleidoscope of spinning geometric hearts that unite in the
            centre and explode into a gigantic heart
     ...then the message appears on top of the page, then all fades away.
     It cannot be started again until it has completely finished.
     ------------------------------------------------------------------ */
  const surpriseCfg = cfg.surprise || {};
  const SURPRISE_MS   = Math.max(5, Number(surpriseCfg.durationSeconds) || 20) * 1000;
  const MESSAGE_MS    = Math.max(1, Number(surpriseCfg.messageSeconds) || 5) * 1000;
  const MESSAGE_LIFE  = MESSAGE_MS + 900;                        // + fade in / fade out
  const SURPRISE_FADE = 1500;
  const KALEIDO_CHANCE = Number.isFinite(surpriseCfg.kaleidoscopeChance) ? surpriseCfg.kaleidoscopeChance : 0.5;
  const MESSAGE_TEXT  = String(surpriseCfg.message || "Our Love Is Infinite & Let's Build a Bright Future Together Darling~\nFeel Me In Your Heart~");

  const FLOOD_COLOURS = ['#ff4d8d', '#ff6f9c', '#ff8fb3', '#e6397a', '#ff3b6b', '#ff9ac2', '#d81b60', '#ffb3c9', '#ff5c8d'];
  const LIPSTICKS     = ['#e0245e', '#ff3d7a', '#d81b60', '#ff2e63', '#c2185b', '#ff5c8d', '#e91e63', '#b3123f', '#ff4f8b'];

  // a lipstick kiss mark (drawn, so it looks the same on every device)
  function kissSVG(size, colour) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 64');
    svg.setAttribute('width', size);
    svg.setAttribute('height', Math.round(size * 0.64));
    const upper = document.createElementNS(SVG_NS, 'path');
    upper.setAttribute('d', 'M4 32 C14 12 36 8 50 26 C64 8 86 12 96 32 Z');
    upper.setAttribute('fill', colour);
    const lower = document.createElementNS(SVG_NS, 'path');
    lower.setAttribute('d', 'M4 32 C18 58 82 58 96 32 Z');
    lower.setAttribute('fill', colour);
    const line = document.createElementNS(SVG_NS, 'path');
    line.setAttribute('d', 'M6 32 C30 37 70 37 94 32');
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', 'rgba(90, 0, 30, 0.45)');
    line.setAttribute('stroke-width', '2.2');
    line.setAttribute('stroke-linecap', 'round');
    const shine = document.createElementNS(SVG_NS, 'ellipse');
    shine.setAttribute('cx', '50'); shine.setAttribute('cy', '45');
    shine.setAttribute('rx', '15'); shine.setAttribute('ry', '4');
    shine.setAttribute('fill', '#fff'); shine.setAttribute('opacity', '0.28');
    svg.append(upper, lower, line, shine);
    return svg;
  }

  // an angular "gem" heart for the kaleidoscope
  const GEM_OUTER  = 'M50 88 L14 50 L14 27 L31 11 L50 27 L69 11 L86 27 L86 50 Z';
  const GEM_FACETS = 'M50 27 L14 50 M50 27 L86 50 M50 27 L50 88 M31 11 L14 50 M69 11 L86 50 M14 50 L50 62 L86 50';

  let surpriseRunning = false;
  const heartBeat = $('heartBeat');

  heartBeat.addEventListener('click', e => {
    if (surpriseRunning) return;         // locked: the normal little click-heart still appears
    e.stopPropagation();                 // ...but not when the surprise starts
    startSurprise();
  });

  function startSurprise() {
    surpriseRunning = true;

    const overlay = document.createElement('div');
    overlay.className = 'surprise';
    document.body.appendChild(overlay);

    const later = (fn, ms) => setTimeout(fn, Math.max(0, ms));

    if (Math.random() < KALEIDO_CHANCE) runKaleidoscope(overlay, later);
    else runFlood(overlay, later);

    later(showSurpriseMessage, SURPRISE_MS);

    const endAt = SURPRISE_MS + MESSAGE_LIFE;
    later(() => overlay.classList.add('fade-out'), endAt);
    later(() => { overlay.remove(); surpriseRunning = false; }, endAt + SURPRISE_FADE);
  }

  /* ---- variant 1: the flood ---- */
  function runFlood(overlay, later) {
    const W = window.innerWidth, H = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    const R = Math.hypot(cx, cy);                     // centre → corner

    // a soft pink tide that spreads from the centre to the corners
    const tide = document.createElement('div');
    tide.className = 'flood-tide';
    tide.style.width = tide.style.height = Math.round(R * 2.2) + 'px';
    tide.style.setProperty('--dur', (SURPRISE_MS - 1000) + 'ms');
    overlay.appendChild(tide);

    // spots on a jittered grid, appearing in order of distance from the centre
    const wanted = 420;
    const cell = Math.max(58, Math.sqrt((W * H) / wanted));
    const spots = [];
    for (let y = cell / 2; y < H + cell / 2; y += cell) {
      for (let x = cell / 2; x < W + cell / 2; x += cell) {
        const px = x + rand(-cell * 0.35, cell * 0.35);
        const py = y + rand(-cell * 0.35, cell * 0.35);
        spots.push({ x: px, y: py, d: Math.min(1, Math.hypot(px - cx, py - cy) / R) });
      }
    }
    const fillMs = SURPRISE_MS - 1400;
    spots.forEach(s => later(() => addFloodItem(overlay, s.x, s.y), 250 + s.d * fillMs + rand(-160, 160)));
  }

  function addFloodItem(overlay, x, y) {
    const el = document.createElement('div');
    el.className = 'flood-item';
    el.style.left = x.toFixed(1) + 'px';
    el.style.top = y.toFixed(1) + 'px';
    el.style.setProperty('--rot', rand(-35, 35).toFixed(0) + 'deg');

    const inner = document.createElement('span');
    inner.className = 'flood-inner';
    inner.style.animationDuration = rand(2.2, 4.2).toFixed(2) + 's';
    inner.style.animationDelay = (-rand(0, 3)).toFixed(2) + 's';

    if (Math.random() < 0.5) inner.appendChild(kissSVG(randInt(30, 64), pick(LIPSTICKS)));
    else inner.appendChild(heartSVG(randInt(24, 58), pick(FLOOD_COLOURS)));
    el.appendChild(inner);
    overlay.appendChild(el);
  }

  /* ---- variant 2: the kaleidoscope ---- */
  function gemHeartSVG(size, colour, smooth) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);

    const body = document.createElementNS(SVG_NS, 'path');
    body.setAttribute('d', smooth ? HEART_FULL : GEM_OUTER);
    body.setAttribute('fill', colour);
    body.setAttribute('fill-opacity', '0.55');
    body.setAttribute('stroke', '#fff');
    body.setAttribute('stroke-width', '2.6');
    body.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(body);

    if (!smooth) {
      const facets = document.createElementNS(SVG_NS, 'path');
      facets.setAttribute('d', GEM_FACETS);
      facets.setAttribute('fill', 'none');
      facets.setAttribute('stroke', '#fff');
      facets.setAttribute('stroke-opacity', '0.75');
      facets.setAttribute('stroke-width', '1.4');
      facets.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(facets);
    }
    return svg;
  }

  function runKaleidoscope(overlay, later) {
    const W = window.innerWidth, H = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    const R = Math.hypot(cx, cy);

    const bg = document.createElement('div');
    bg.className = 'kaleido-bg';
    bg.style.width = bg.style.height = Math.round(R * 2) + 'px';
    overlay.appendChild(bg);

    const stage = document.createElement('div');
    stage.className = 'kaleido-stage';
    overlay.appendChild(stage);

    // rings of hearts, each spinning at its own speed and direction,
    // plus a fainter "ghost" ring spinning the other way in between
    const rings = [
      { r: 0.17, n: 6,  dur: 9,  size: 0.115 },
      { r: 0.31, n: 10, dur: 14, size: 0.105 },
      { r: 0.47, n: 14, dur: 19, size: 0.10 },
      { r: 0.66, n: 18, dur: 25, size: 0.095 }
    ];
    const hearts = [];
    rings.forEach((ring, k) => {
      [false, true].forEach(ghost => {
        const ringEl = document.createElement('div');
        ringEl.className = 'kring' + (ghost ? ' ghost' : '');
        ringEl.style.animationDuration = (ring.dur * (ghost ? 1.7 : 1)).toFixed(1) + 's';
        ringEl.style.animationDirection = ((k + (ghost ? 1 : 0)) % 2) ? 'reverse' : 'normal';

        const radius = ring.r * R;
        const size = Math.max(24, ring.size * R * (ghost ? 0.7 : 1));
        const baseHue = 330 + k * 45;
        for (let i = 0; i < ring.n; i++) {
          const angle = (360 / ring.n) * i + (ghost ? 180 / ring.n : 0);
          const h = document.createElement('div');
          h.className = 'kheart';
          h.style.transform = `rotate(${angle}deg) translate(${radius.toFixed(1)}px) rotate(${-angle}deg)`;
          const svg = gemHeartSVG(size, hsl(baseHue + i * 9, 92, 64), i % 3 === 1);
          svg.style.animationDuration = rand(2.6, 5.2).toFixed(2) + 's';
          svg.style.animationDirection = i % 2 ? 'reverse' : 'normal';
          h.appendChild(svg);
          ringEl.appendChild(h);
          hearts.push({ el: h, angle, radius });
        }
        stage.appendChild(ringEl);
      });
    });

    // all hearts spiral into the centre and unite...
    const convergeMs = 3000;
    const explodeAt = SURPRISE_MS - 1400;
    later(() => {
      hearts.forEach(({ el, angle, radius }) => {
        el.animate([
          { transform: `rotate(${angle}deg) translate(${radius.toFixed(1)}px) rotate(${-angle}deg) scale(1)` },
          { transform: `rotate(${angle + 540}deg) translate(0px) rotate(${-(angle + 540)}deg) scale(0.1)` }
        ], { duration: convergeMs + rand(-250, 250), easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' });
      });
      bg.animate([
        { transform: 'translate(-50%, -50%) scale(1)' },
        { transform: 'translate(-50%, -50%) scale(0.04)' }
      ], { duration: convergeMs + 300, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' });
    }, explodeAt - convergeMs - 150);

    // ...and explode
    later(() => {
      stage.remove();
      bg.remove();
      explodeHeart(overlay, cx, cy, R);
    }, explodeAt);
  }

  function explodeHeart(overlay, cx, cy, R) {
    const flash = document.createElement('div');
    flash.className = 'kflash';
    overlay.appendChild(flash);

    // the gigantic heart (with its glow built in — no heavy filters)
    const giantSize = Math.round(Math.max(window.innerWidth, window.innerHeight) * 1.4);
    const giant = document.createElementNS(SVG_NS, 'svg');
    giant.setAttribute('class', 'kgiant');
    giant.setAttribute('viewBox', '0 0 100 100');
    giant.setAttribute('width', giantSize);
    giant.setAttribute('height', giantSize);
    const glow = document.createElementNS(SVG_NS, 'path');
    glow.setAttribute('d', HEART_FULL);
    glow.setAttribute('fill', '#ff7eb0');
    glow.setAttribute('opacity', '0.45');
    glow.setAttribute('transform', 'translate(50 50) scale(1.18) translate(-50 -50)');
    const body = document.createElementNS(SVG_NS, 'path');
    body.setAttribute('d', HEART_FULL);
    body.setAttribute('fill', 'url(#giantGrad)');
    giant.append(glow, body);
    giant.style.left = cx + 'px';
    giant.style.top = cy + 'px';
    overlay.appendChild(giant);

    // a heart-shaped shockwave
    const wave = document.createElementNS(SVG_NS, 'svg');
    wave.setAttribute('class', 'kwave');
    wave.setAttribute('viewBox', '0 0 100 100');
    wave.setAttribute('width', giantSize);
    wave.setAttribute('height', giantSize);
    const wavePath = document.createElementNS(SVG_NS, 'path');
    wavePath.setAttribute('d', HEART_FULL);
    wave.appendChild(wavePath);
    wave.style.left = cx + 'px';
    wave.style.top = cy + 'px';
    overlay.appendChild(wave);

    // hundreds of little hearts and kisses flying everywhere
    const count = 220;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'kparticle';
      const angle = rand(0, Math.PI * 2);
      const dist = R * rand(0.25, 1.15);
      const dur = rand(1.3, 2.8);
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      p.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(1) + 'px');
      p.style.setProperty('--rot', rand(-360, 360).toFixed(0) + 'deg');
      p.style.setProperty('--dur', dur.toFixed(2) + 's');
      p.style.animationDelay = rand(0, 0.25).toFixed(2) + 's';
      if (Math.random() < 0.25) p.appendChild(kissSVG(randInt(16, 46), pick(LIPSTICKS)));
      else p.appendChild(heartSVG(randInt(12, 44), Math.random() < 0.2 ? '#fff' : pick(FLOOD_COLOURS)));
      overlay.appendChild(p);
    }
  }

  /* ---- the message ---- */
  function showSurpriseMessage() {
    const msg = document.createElement('div');
    msg.className = 'surprise-message';
    msg.style.setProperty('--life', MESSAGE_LIFE + 'ms');
    MESSAGE_TEXT.split('\n').forEach(line => {
      const s = document.createElement('span');
      s.textContent = line;
      msg.appendChild(s);
    });
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), MESSAGE_LIFE + 100);
  }
})();
