/* ===========================================================
   Purr-fect Products — main game: state, onboarding, café,
   shop, adoption, fact garden, interactive decor & roaming cats.
   =========================================================== */
const SAVE_KEY = 'purrfect-products-v1';
const ALL_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const NEEDS = ['hunger', 'fun', 'cozy'];

function defaultState() {
  return {
    version: 1,
    playerName: '',
    coins: 0,
    totalEarned: 0,
    lastSeen: Date.now(),
    settings: { sound: true, division: false, tables: ALL_TABLES.slice(), mode: 'x' },
    cats: [],
    inventory: {},
    decor: [],
    adopted: [],
    facts: {},
    stats: { answered: 0, correct: 0, bestStreak: 0, speedBest: { x: 0, d: 0, mix: 0 } },
    nextCatId: 1,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base, ...d,
      settings: { ...base.settings, ...d.settings },
      stats: { ...base.stats, ...d.stats, speedBest: { ...base.stats.speedBest, ...(d.stats && d.stats.speedBest) } },
    };
  } catch (e) {
    return null;
  }
}

let S = loadState() || defaultState();
let currentView = 'cafe';
let shopTab = 'food';
let gardenOp = 'x';
let cafeAnimRaf = null;
const catPos = {};

function save() {
  S.lastSeen = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage full */ }
}

/* ---------------- Coins ---------------- */
function updateCoins(bump) {
  const el = $('#coin-count');
  if (el) el.textContent = S.coins;
  if (bump) UI.restartAnim($('#coin-pill'), 'bump');
}
function addCoins(n, fromEl) {
  S.coins += n;
  S.totalEarned += n;
  updateCoins(true);
  setTimeout(() => Sound.play('coin'), 120);
  if (fromEl) UI.floatText(fromEl, `+${n} 🪙`);
  save();
}
function spendCoins(n) {
  if (S.coins < n) return false;
  S.coins -= n;
  updateCoins(true);
  save();
  return true;
}

/* ---------------- Cat needs ---------------- */
function applyOfflineDecay() {
  const hrs = (Date.now() - S.lastSeen) / 3600000;
  if (hrs < 0.05) return;
  const drop = Math.round(hrs * 6);
  S.cats.forEach(c => NEEDS.forEach(k => { if (c[k] > 20) c[k] = Math.max(20, c[k] - drop); }));
  save();
}

function tickNeeds() {
  if (document.hidden || $('#main').classList.contains('hidden') || Speed.active) return;
  let warning = null;
  S.cats.forEach(c => NEEDS.forEach(k => {
    const before = c[k];
    c[k] = Math.max(0, c[k] - (1 + Math.round(Math.random())));
    if (before >= 30 && c[k] < 30 && !warning) warning = `${NEED_INFO[k].emoji} <b>${esc(c.name)}</b> ${NEED_INFO[k].want}!`;
  }));
  if (warning) UI.toast(warning, 'warn');
  save();
}

/* ---------------- Navigation ---------------- */
function showView(name) {
  currentView = name;
  $$('.view').forEach(v => v.classList.toggle('active', v.id === `view-${name}`));
  $$('.tab').forEach(t => {
    const on = t.dataset.view === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on);
  });

  if (name !== 'cafe' && cafeAnimRaf) {
    cancelAnimationFrame(cafeAnimRaf);
    cafeAnimRaf = null;
  }

  ({ cafe: renderCafe, practice: () => Practice.show(), shop: renderShop, adopt: renderAdopt, garden: renderGarden })[name]();
}

function updateHeader() {
  $('#cafe-title').textContent = `${S.playerName}'s Cat Café`;
  document.title = `${S.playerName}'s Cat Café – Purr-fect Products`;
  if (S.cats[0]) $('#brand-cat').innerHTML = catSVG(S.cats[0].breed, 'happy');
  updateCoins(false);
}

function enterMain(returning) {
  $('#onboarding').classList.add('hidden');
  $('#onboarding').innerHTML = '';
  $('#main').classList.remove('hidden');
  updateHeader();
  showView('cafe');
  if (returning) setTimeout(() => UI.toast(`👋 Welcome back, <b>${esc(S.playerName)}</b>! Your cats missed you.`), 400);
}

/* =========================== Onboarding =========================== */
const Onboarding = (() => {
  let step = 0;
  const data = { name: '', breed: 'orange', kitten: '' };

  function start() {
    $('#main').classList.add('hidden');
    $('#onboarding').classList.remove('hidden');
    step = 0;
    render();
  }

  function pawBg() {
    let s = '';
    for (let i = 0; i < 14; i++) {
      s += `<span style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:-${(Math.random() * 8).toFixed(1)}s;font-size:${1.5 + Math.random() * 2}rem;transform:rotate(${Math.random() * 60 - 30}deg)">🐾</span>`;
    }
    return `<div class="paw-bg">${s}</div>`;
  }

  function dots() {
    return `<div class="ob-dots">${[0, 1, 2, 3, 4].map(i => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>`;
  }

  function render() {
    const el = $('#onboarding');
    let html = '';
    if (step === 0) {
      html = `
        <div class="ob-card pop-in">
          <img class="ob-logo" src="assets/icon.png" alt="Cat Café logo">
          <h2 class="ob-title">Purr-fect Products</h2>
          <p class="ob-sub">Run your very own <b>cat café</b>!<br>Solve math problems to earn 🪙 <b>cat coins</b> and take care of adorable kitties.</p>
          <button class="btn btn-xl" id="ob-next">Let's go! 🐾</button>
        </div>`;
    } else if (step === 1) {
      html = `
        <div class="ob-card pop-in">
          ${dots()}
          <div class="ob-emoji">👋</div>
          <h2 class="ob-title sm">What's your name?</h2>
          <input id="ob-input" class="text-input" maxlength="16" placeholder="Type your name" value="${esc(data.name)}" autocomplete="off" autocapitalize="words" autocorrect="off" spellcheck="false" enterkeyhint="next">
          <div class="modal-actions">
            <button class="btn btn-ghost" id="ob-back">Back</button>
            <button class="btn" id="ob-next" ${data.name.trim() ? '' : 'disabled'}>Next ➜</button>
          </div>
        </div>`;
    } else if (step === 2) {
      html = `
        <div class="ob-card wide pop-in">
          ${dots()}
          <h2 class="ob-title sm">Hi ${esc(data.name)}! Pick your first kitten</h2>
          <div class="kitten-pick">
            ${STARTER_BREEDS.map(b => `
              <button class="kitten-card ${data.breed === b ? 'on' : ''}" data-breed="${b}" id="pick-${b}">
                <div class="kc-cat">${catSVG(b, data.breed === b ? 'ecstatic' : 'happy')}</div>
                <span>${BREEDS[b].label}</span>
              </button>`).join('')}
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" id="ob-back">Back</button>
            <button class="btn" id="ob-next">Next ➜</button>
          </div>
        </div>`;
    } else if (step === 3) {
      const ideas = NAME_IDEAS.slice().sort(() => Math.random() - 0.5).slice(0, 5);
      html = `
        <div class="ob-card pop-in">
          ${dots()}
          <div class="ob-cat">${catSVG(data.breed, 'ecstatic')}</div>
          <h2 class="ob-title sm">What will you name your kitten?</h2>
          <input id="ob-input" class="text-input" maxlength="14" placeholder="Kitten name" value="${esc(data.kitten)}" autocomplete="off" autocapitalize="words" autocorrect="off" spellcheck="false" enterkeyhint="next">
          <div class="name-ideas">${ideas.map(n => `<button class="chip sm" data-name="${n}">${n}</button>`).join('')}</div>
          <div class="modal-actions">
            <button class="btn btn-ghost" id="ob-back">Back</button>
            <button class="btn" id="ob-next" ${data.kitten.trim() ? '' : 'disabled'}>Next ➜</button>
          </div>
        </div>`;
    } else if (step === 4) {
      html = `
        <div class="ob-card wide pop-in">
          ${dots()}
          <h2 class="ob-title sm">Welcome to ${esc(data.name)}'s Cat Café!</h2>
          <div class="how">
            <div class="how-step"><div class="how-icon">✖️</div><b>Solve</b><span>Answer times table problems</span></div>
            <div class="how-arrow">➜</div>
            <div class="how-step"><div class="how-icon">🪙</div><b>Earn</b><span>Get cat coins for right answers</span></div>
            <div class="how-arrow">➜</div>
            <div class="how-step"><div class="how-icon">😻</div><b>Care</b><span>Buy food, toys & beds for ${esc(data.kitten)}</span></div>
          </div>
          <p class="ob-note">🌸 Grow a flower in your Fact Garden for each fact you master, and adopt more kitties!</p>
          <p class="ob-parent">Grown-ups: tap ⚙️ any time to turn on <b>division</b> or choose which times tables to practice.</p>
          <button class="btn btn-mint btn-xl" id="ob-next">Open my café! 🏠</button>
        </div>`;
    }
    el.innerHTML = pawBg() + html;
    bind();
  }

  function bind() {
    const next = $('#ob-next');
    const back = $('#ob-back');
    const input = $('#ob-input');
    if (back) back.addEventListener('click', () => { Sound.play('tap'); step--; render(); });
    if (input) {
      const field = step === 1 ? 'name' : 'kitten';
      input.addEventListener('input', () => {
        data[field] = input.value;
        next.disabled = !input.value.trim();
      });
      input.addEventListener('keydown', e => { if (e.key === 'Enter' && input.value.trim()) { input.blur(); next.click(); } });
      setTimeout(() => input.focus(), 50);
    }
    $$('.kitten-card').forEach(c => c.addEventListener('click', () => {
      data.breed = c.dataset.breed;
      Sound.play('meow');
      render();
    }));
    $$('.name-ideas .chip').forEach(c => c.addEventListener('click', () => {
      Sound.play('tap');
      data.kitten = c.dataset.name;
      input.value = data.kitten;
      next.disabled = false;
    }));
    next.addEventListener('click', () => {
      if (next.disabled) return;
      Sound.play(step === 2 ? 'pop' : 'tap');
      if (input) input.blur();
      if (step < 4) { step++; render(); }
      else finish();
    });
  }

  function finish() {
    const fresh = defaultState();
    fresh.playerName = data.name.trim();
    fresh.cats = [{ id: 1, breed: data.breed, name: data.kitten.trim(), hunger: 55, fun: 70, cozy: 80 }];
    fresh.nextCatId = 2;
    fresh.coins = 10;
    fresh.inventory = { kibble: 1 };
    fresh.settings.sound = S.settings.sound;
    S = fresh;
    save();
    Sound.play('fanfare');
    setTimeout(() => Sound.play('meow'), 500);
    UI.confetti();
    Practice.reset();
    enterMain(false);
    setTimeout(() => UI.toast(`🐱 Tap <b>${esc(S.cats[0].name)}</b> to say hi! Here are 10 🪙 Cat Coins to get started.`, 'info', 4000), 900);
  }

  return { start };
})();

/* =========================== Interactive Decor =========================== */
function decorHTML() {
  const has = id => S.decor.includes(id);
  let wall = '', floor = '', top = '';
  if (has('lights')) {
    const colors = ['#FF8FAB', '#FFD166', '#6FD6B4', '#8CC8FF', '#B9A2FF'];
    top += `<div class="decor-item decor-lights" data-decor="lights">${Array.from({ length: 18 }, (_, i) => `<i style="--c:${colors[i % 5]};animation-delay:${(i % 4) * 0.4}s"></i>`).join('')}</div>`;
  }
  if (has('painting')) wall += `<button class="decor-item decor-painting" data-decor="painting"><span>🖼️</span><span class="d-sub">🐟</span></button>`;
  if (has('lamp')) wall += `<button class="decor-item decor-lamp" data-decor="lamp">🌙</button>`;
  if (has('tank')) wall += `<button class="decor-item decor-tank" data-decor="tank"><span class="fish f1">🐠</span><span class="fish f2">🐟</span><span class="bubble b1"></span><span class="bubble b2"></span></button>`;
  if (has('balloons')) wall += `<button class="decor-item decor-balloons" data-decor="balloons">🎈<span>🎈</span></button>`;
  if (has('rug')) floor += `<button class="decor-item decor-rug" data-decor="rug"></button>`;
  if (has('plant')) floor += `<button class="decor-item decor-plant" data-decor="plant">🪴</button>`;
  if (has('castle')) floor += `<button class="decor-item decor-castle" data-decor="castle">🏰</button>`;
  if (has('piano')) floor += `<button class="decor-item decor-piano" data-decor="piano">🎹</button>`;
  return { wall, floor, top };
}

function interactWithDecor(decorId, fromCat = null) {
  const item = DECOR[decorId];
  if (!item) return;
  const el = $(`.decor-${decorId}`);
  if (el) UI.restartAnim(el, 'bump');
  Sound.play(item.sound || 'tap');

  if (decorId === 'piano') {
    Sound.play('pianoKey');
    UI.floatText(el || $('#view-cafe'), '🎵', 'big');
  } else if (decorId === 'tank') {
    UI.floatText(el || $('#view-cafe'), '🐠', 'big');
  } else if (decorId === 'plant') {
    UI.hearts(el || $('#view-cafe'), ['🌿', '🌸', '💖']);
  } else if (decorId === 'castle') {
    UI.floatText(el || $('#view-cafe'), '🏰', 'big');
  } else if (decorId === 'rug') {
    UI.floatText(el || $('#view-cafe'), '💤', 'big');
  } else if (decorId === 'balloons') {
    UI.floatText(el || $('#view-cafe'), '🎈', 'big');
  }
}

/* =========================== Café & Roaming Cats =========================== */
const DEFAULT_SPOTS = [
  { x: 30, y: 14 }, { x: 50, y: 16 }, { x: 70, y: 14 }, { x: 20, y: 22 },
  { x: 80, y: 24 }, { x: 40, y: 26 }, { x: 60, y: 28 }, { x: 15, y: 30 },
];

function initCatPositions() {
  S.cats.forEach((c, i) => {
    if (!catPos[c.id]) {
      const sp = DEFAULT_SPOTS[i % DEFAULT_SPOTS.length];
      catPos[c.id] = {
        x: sp.x,
        y: sp.y,
        targetX: sp.x,
        targetY: sp.y,
        facing: Math.random() < 0.5 ? 1 : -1,
        state: 'idle',
        timer: Date.now() + 2000 + Math.random() * 3000,
        interactId: null,
      };
    }
  });
}

function cafeTip() {
  if (!S.cats.length) return '';
  const sorted = [...S.cats].sort((a, b) => Math.min(a.hunger, a.fun, a.cozy) - Math.min(b.hunger, b.fun, b.cozy));
  const c = sorted[0];
  const [need, val] = neediest(c);
  if (val < 45) {
    const has = Object.entries(ITEMS).some(([id, it]) => (it.stat === need || it.stat === 'all' || it.stat === 'every') && (S.inventory[id] || 0) > 0);
    return has
      ? `${NEED_INFO[need].emoji} <b>${esc(c.name)}</b> ${NEED_INFO[need].want}! Tap ${esc(c.name)} to help.`
      : `${NEED_INFO[need].emoji} <b>${esc(c.name)}</b> ${NEED_INFO[need].want}! Earn 🪙 <b>cat coins</b> in the Shop.`;
  }
  const nextCat = adoptionList(S).find(a => !a.adopted);
  if (nextCat && Problems.masteredCount(S) >= nextCat.flowers && S.coins >= nextCat.price) {
    return `🏠 A new kitty is waiting for you in <b>Adopt</b>!`;
  }
  const tips = [
    '🐾 Watch your cats roam around the café and play with decor!',
    '🌸 Get a fact right 3 times in a row to bloom a flower!',
    '⚡ Try a Speed Round to earn lots of cat coins fast!',
    '🪴 Make your café extra cozy with interactive decor from the Shop!',
  ];
  return tips[Math.floor(Date.now() / 45000) % tips.length];
}

function renderCafe() {
  const v = $('#view-cafe');
  const d = decorHTML();
  initCatPositions();

  const catsHTML = S.cats.map((c) => {
    const pos = catPos[c.id];
    const mood = catMood(c);
    const [need, val] = neediest(c);
    const bubble = val < 40
      ? `<span class="need-bubble">${NEED_INFO[need].emoji}</span>`
      : mood === 'ecstatic' ? `<span class="need-bubble love">💖</span>` : '';
    const scaleX = pos.facing;
    const isWalking = pos.state === 'walking';
    return `<button class="cat-spot ${isWalking ? 'is-walking' : ''}" data-cat="${c.id}" id="cat-${c.id}" style="left:${pos.x}%;bottom:${pos.y}%;z-index:${Math.floor(100 - pos.y)};--facing:${scaleX}" aria-label="Take care of ${esc(c.name)}">
        ${bubble}
        <div class="cat-bob" style="transform: scaleX(${scaleX})">${catSVG(c.breed, mood)}</div>
        <span class="cat-name">${esc(c.name)}</span>
      </button>`;
  }).join('');

  const happy = S.cats.length ? Math.round(S.cats.reduce((s, c) => s + (c.hunger + c.fun + c.cozy) / 3, 0) / S.cats.length) : 0;
  const flowers = Problems.masteredCount(S);

  v.innerHTML = `
    <div class="cafe">
      <div class="cafe-scene" id="cafe-scene">
        <div class="wall">
          <div class="window"><div class="sky"><span class="sun"></span><span class="cloud c1"></span><span class="cloud c2"></span></div></div>
          <div class="cafe-sign">☕ ${esc(S.playerName)}'s Cat Café</div>
          <div class="shelf"><span>☕</span><span>🧁</span><span>🍩</span></div>
          ${d.wall}
        </div>
        <div class="floor">${d.floor}</div>
        ${d.top}
        <div class="cats-layer" id="cats-layer">${catsHTML}</div>
      </div>
      <aside class="cafe-panel">
        <div class="panel-card">
          <div class="hello">Hi, ${esc(S.playerName)}! 👋</div>
          <p class="tip">${cafeTip()}</p>
          <div class="happy-meter">
            <span>Café happiness</span>
            <div class="m-track big"><div class="m-fill" style="width:${happy}%;background:linear-gradient(90deg,#FF8FAB,#FFD166)"></div></div>
            <b>${happy >= 80 ? '😻' : happy >= 55 ? '😺' : happy >= 35 ? '🐱' : '😿'}</b>
          </div>
          <button class="btn btn-xl btn-block" id="cafe-play">✖️ Earn Cat Coins</button>
        </div>
        <div class="mini-stats">
          <div><b>${S.cats.length}</b><span>cats</span></div>
          <div><b>${flowers}</b><span>flowers</span></div>
          <div><b>${S.stats.bestStreak}</b><span>best streak</span></div>
        </div>
      </aside>
    </div>`;

  $$('.decor-item', v).forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      interactWithDecor(item.dataset.decor);
    });
  });

  $$('.cat-spot', v).forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    UI.restartAnim(b, 'jump');
    openCare(Number(b.dataset.cat));
  }));

  $('#cafe-play').addEventListener('click', () => { Sound.play('tap'); showView('practice'); });

  startCatRoamingLoop();
}

function startCatRoamingLoop() {
  if (cafeAnimRaf) cancelAnimationFrame(cafeAnimRaf);

  function step() {
    if (currentView !== 'cafe') return;
    const now = Date.now();
    const activeDecorKeys = S.decor.filter(id => DECOR[id] && DECOR[id].spot);

    S.cats.forEach(c => {
      const pos = catPos[c.id];
      if (!pos) return;

      const catEl = $(`#cat-${c.id}`);
      if (!catEl) return;

      if (pos.state === 'walking') {
        const dx = pos.targetX - pos.x;
        const dy = pos.targetY - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.8) {
          pos.x += (dx / dist) * 0.18;
          pos.y += (dy / dist) * 0.12;
          pos.facing = dx > 0 ? 1 : -1;

          catEl.style.left = `${pos.x}%`;
          catEl.style.bottom = `${pos.y}%`;
          catEl.style.zIndex = Math.floor(100 - pos.y);
          const bob = catEl.querySelector('.cat-bob');
          if (bob) bob.style.transform = `scaleX(${pos.facing})`;
          catEl.classList.add('is-walking');
        } else {
          pos.x = pos.targetX;
          pos.y = pos.targetY;
          catEl.classList.remove('is-walking');

          if (pos.interactId) {
            pos.state = 'interacting';
            pos.timer = now + 4000 + Math.random() * 3000;
            interactWithDecor(pos.interactId, c);
          } else {
            pos.state = 'idle';
            pos.timer = now + 3000 + Math.random() * 5000;
          }
        }
      } else if (now > pos.timer) {
        const pickDecor = activeDecorKeys.length > 0 && Math.random() < 0.55;
        if (pickDecor) {
          const dKey = pick(activeDecorKeys);
          const spot = DECOR[dKey].spot;
          pos.targetX = Math.max(10, Math.min(88, spot.x + (Math.random() - 0.5) * 8));
          pos.targetY = Math.max(8, Math.min(32, spot.y + (Math.random() - 0.5) * 4));
          pos.interactId = dKey;
        } else {
          pos.targetX = 12 + Math.random() * 76;
          pos.targetY = 8 + Math.random() * 24;
          pos.interactId = null;
        }
        pos.state = 'walking';
      }
    });

    cafeAnimRaf = requestAnimationFrame(step);
  }

  cafeAnimRaf = requestAnimationFrame(step);
}

function openCare(id) {
  const cat = S.cats.find(c => c.id === id);
  if (!cat) return;
  Sound.play('meow');
  UI.modal('', {
    className: 'care-modal',
    onOpen: (m, close) => {
      const draw = () => {
        const mood = catMood(cat);
        const owned = Object.entries(ITEMS).filter(([itemId]) => (S.inventory[itemId] || 0) > 0);
        m.innerHTML = `
          <button class="modal-x" id="care-x" aria-label="Close">✕</button>
          <div class="care-top">
            <div class="care-cat" id="care-cat">${catSVG(cat.breed, mood)}</div>
            <div class="care-info">
              <h2>${esc(cat.name)}</h2>
              <p class="care-mood">${esc(cat.name)} ${MOOD_TEXT[mood]}</p>
              ${NEEDS.map(k => meterHTML(k, cat[k])).join('')}
            </div>
          </div>
          <h3 class="care-h">Give ${esc(cat.name)} something:</h3>
          ${owned.length ? `<div class="give-grid">${owned.map(([itemId, it]) => `
            <button class="give-btn" data-item="${itemId}" id="give-${itemId}">
              <span class="ge">${it.emoji}</span><span class="gn">${it.name}</span><span class="gc">×${S.inventory[itemId]}</span>
            </button>`).join('')}</div>`
            : `<p class="empty-note">You don't have any items yet. Earn 🪙 cat coins by solving problems, then visit the Shop!</p>`}
          <div class="care-actions">
            <button class="btn btn-lav btn-sm" id="care-pet">🤚 Pet</button>
            <button class="btn btn-ghost btn-sm" id="care-rename">✏️ Rename</button>
            <button class="btn btn-sun btn-sm" id="care-shop">🛍️ Shop</button>
            <button class="btn btn-sm" id="care-play">✖️ Earn Cat Coins</button>
          </div>`;
        $('#care-x', m).addEventListener('click', () => { Sound.play('tap'); close(); });
        $('#care-pet', m).addEventListener('click', () => {
          Sound.play('purr');
          UI.restartAnim($('#care-cat', m), 'wiggle');
          UI.hearts($('#care-cat', m));
        });
        $('#care-rename', m).addEventListener('click', () => { close(); openRename(cat); });
        $('#care-shop', m).addEventListener('click', () => { Sound.play('tap'); close(); showView('shop'); });
        $('#care-play', m).addEventListener('click', () => { Sound.play('tap'); close(); showView('practice'); });
        $$('.give-btn', m).forEach(b => b.addEventListener('click', () => give(cat, b.dataset.item, draw, m)));
      };
      draw();
    },
  });
}

function give(cat, itemId, redraw, m) {
  const it = ITEMS[itemId];
  if (!it || !(S.inventory[itemId] > 0)) return;
  if (it.stat !== 'all' && it.stat !== 'every' && cat[it.stat] >= 100) {
    UI.toast(`${NEED_INFO[it.stat].emoji} ${esc(cat.name)}'s ${NEED_INFO[it.stat].label.toLowerCase()} is already full!`);
    return;
  }
  S.inventory[itemId]--;
  if (it.stat === 'all') {
    S.cats.forEach(c => NEEDS.forEach(k => { c[k] = Math.min(100, c[k] + it.amount); }));
  } else if (it.stat === 'every') {
    NEEDS.forEach(k => { cat[k] = Math.min(100, cat[k] + it.amount); });
  } else {
    cat[it.stat] = Math.min(100, cat[it.stat] + it.amount);
  }
  save();
  redraw();
  const catEl = $('#care-cat', m);
  UI.restartAnim(catEl, 'wiggle');
  UI.hearts(catEl, it.stat === 'hunger' ? ['😋', '💖', it.emoji] : ['💖', '💕', it.emoji, '✨']);
  Sound.play('purr');
  if (it.stat === 'all') UI.toast(`🌿 Catnip party! All your cats are thrilled!`, 'gold');
  if (catMood(cat) === 'ecstatic') setTimeout(() => Sound.play('meow'), 600);
  if (currentView === 'cafe') renderCafe();
}

function openRename(cat) {
  UI.modal(`<div class="center">
      <div class="modal-cat">${catSVG(cat.breed, 'happy')}</div>
      <h2 class="modal-title">New name for ${esc(cat.name)}</h2>
      <input id="rename-input" class="text-input" maxlength="14" value="${esc(cat.name)}" autocomplete="off" autocorrect="off" spellcheck="false">
      <div class="modal-actions">
        <button class="btn btn-ghost" data-close>Cancel</button>
        <button class="btn btn-mint" id="rename-go">Save</button>
      </div></div>`, {
    onOpen: (m, close) => {
      const input = $('#rename-input', m);
      const go = () => {
        const n = input.value.trim();
        if (!n) return;
        cat.name = n;
        save();
        Sound.play('meow');
        close();
        updateHeader();
        renderCafe();
      };
      $('#rename-go', m).addEventListener('click', go);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    },
  });
}

function meterHTML(k, v) {
  const info = NEED_INFO[k];
  return `<div class="meter">
      <span class="m-label">${info.emoji} ${info.label}</span>
      <div class="m-track"><div class="m-fill ${v < 30 ? 'low' : ''}" style="width:${v}%;background:${info.color}"></div></div>
      <span class="m-val">${Math.round(v)}</span>
    </div>`;
}

/* =========================== Shop =========================== */
function renderShop() {
  const v = $('#view-shop');
  const isDecor = shopTab === 'decor';
  const entries = isDecor ? Object.entries(DECOR) : Object.entries(ITEMS).filter(([, it]) => it.tab === shopTab);
  v.innerHTML = `
    <div class="page">
      <div class="page-head">
        <h2 class="page-title">🛍️ Kitty Shop</h2>
        <p class="page-sub">Spend your cat coins on treats, toys and interactive café decor!</p>
      </div>
      <div class="seg shop-tabs" id="shop-tabs">
        ${SHOP_TABS.map(t => `<button data-tab="${t.id}" id="shop-tab-${t.id}" class="${t.id === shopTab ? 'on' : ''}">${t.emoji} ${t.label}</button>`).join('')}
      </div>
      <div class="shop-grid">
        ${entries.map(([id, it]) => {
          const owned = isDecor ? S.decor.includes(id) : (S.inventory[id] || 0);
          const afford = S.coins >= it.price;
          let btn;
          if (isDecor && owned) btn = `<button class="btn btn-ghost btn-sm" disabled>✓ In your café</button>`;
          else if (afford) btn = `<button class="btn btn-mint btn-sm buy-btn" data-id="${id}" id="buy-${id}">Buy · ${it.price} 🪙</button>`;
          else btn = `<button class="btn btn-ghost btn-sm" disabled>Need ${it.price - S.coins} more 🪙</button>`;
          return `<div class="shop-card ${isDecor && owned ? 'owned' : ''}">
              ${!isDecor && owned ? `<span class="owned-badge">×${owned}</span>` : ''}
              <div class="shop-emoji">${it.emoji}</div>
              <div class="shop-name">${it.name}</div>
              <div class="shop-desc">${it.desc}</div>
              <div class="shop-price">${it.price} 🪙</div>
              ${btn}
            </div>`;
        }).join('')}
      </div>
    </div>`;
  $('#shop-tabs').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    Sound.play('tap');
    shopTab = b.dataset.tab;
    renderShop();
  });
  $$('.buy-btn', v).forEach(b => b.addEventListener('click', () => buy(b.dataset.id, b)));
}

function buy(id, btn) {
  const isDecor = !!DECOR[id];
  const it = isDecor ? DECOR[id] : ITEMS[id];
  if (!spendCoins(it.price)) return;
  Sound.play('buy');
  UI.floatText(btn, `${it.emoji}`, 'big');
  if (isDecor) {
    S.decor.push(id);
    UI.toast(`${it.emoji} <b>${it.name}</b> added to your café!`, 'gold');
    UI.confetti(60);
  } else {
    S.inventory[id] = (S.inventory[id] || 0) + 1;
    UI.toast(`${it.emoji} You bought <b>${it.name}</b>! Tap a cat in the Café to give it.`);
  }
  save();
  renderShop();
}

/* =========================== Adopt =========================== */
function renderAdopt() {
  const v = $('#view-adopt');
  const list = adoptionList(S);
  const flowers = Problems.masteredCount(S);
  const remaining = list.filter(a => !a.adopted);
  v.innerHTML = `
    <div class="page">
      <div class="page-head">
        <h2 class="page-title">🐾 Adoption Center</h2>
        <p class="page-sub">These kitties are looking for a home! Grow flowers 🌸 in your Fact Garden and save 🪙 <b>cat coins</b> to adopt them.</p>
      </div>
      ${remaining.length ? '' : `<div class="all-done">🎉 Every kitty has a home in your café! You're an amazing cat caretaker!</div>`}
      <div class="adopt-grid">
        ${list.map((a, i) => {
          const br = BREEDS[a.breed];
          const owned = S.cats.find(c => c.breed === a.breed);
          if (a.adopted && owned) {
            return `<div class="adopt-card adopted">
              <div class="adopt-cat">${catSVG(a.breed, 'ecstatic')}</div>
              <div class="adopt-name">${esc(owned.name)}</div>
              <div class="adopt-blurb">Lives in your café 💖</div>
            </div>`;
          }
          const isNext = remaining[0] && remaining[0].breed === a.breed;
          const fOk = flowers >= a.flowers;
          const cOk = S.coins >= a.price;
          const locked = !isNext;
          return `<div class="adopt-card ${locked ? 'locked' : ''} ${isNext ? 'next' : ''}">
              <div class="adopt-cat">${catSVG(a.breed, 'happy')}${locked ? '<div class="lock">🔒</div>' : ''}</div>
              <div class="adopt-name">${br.label}</div>
              <div class="adopt-blurb">${br.blurb}</div>
              <div class="req ${fOk ? 'ok' : ''}"><span>🌸 ${Math.min(flowers, a.flowers)}/${a.flowers} flowers</span>
                <div class="m-track"><div class="m-fill" style="width:${Math.min(100, flowers / a.flowers * 100)}%;background:linear-gradient(90deg,#FFB3C8,#FF8FAB)"></div></div></div>
              <div class="req ${cOk ? 'ok' : ''}"><span>🪙 ${Math.min(S.coins, a.price)}/${a.price} cat coins</span>
                <div class="m-track"><div class="m-fill" style="width:${Math.min(100, S.coins / a.price * 100)}%;background:linear-gradient(90deg,#FFE29A,#FFC94A)"></div></div></div>
              ${isNext ? `<button class="btn btn-mint btn-sm adopt-btn" data-breed="${a.breed}" id="adopt-${a.breed}" ${fOk && cOk ? '' : 'disabled'}>${fOk && cOk ? 'Adopt 💖' : 'Keep practicing!'}</button>`
                : `<div class="adopt-blurb muted">Adopt kitty #${i} first</div>`}
            </div>`;
        }).join('')}
      </div>
    </div>`;
  $$('.adopt-btn', v).forEach(b => b.addEventListener('click', () => {
    const a = list.find(x => x.breed === b.dataset.breed);
    Sound.play('meow');
    openAdoptName(a);
  }));
}

function openAdoptName(a) {
  const br = BREEDS[a.breed];
  const ideas = [br.suggest, ...NAME_IDEAS.filter(n => !S.cats.some(c => c.name === n)).sort(() => Math.random() - 0.5).slice(0, 4)];
  UI.modal(`<div class="center">
      <div class="modal-cat">${catSVG(a.breed, 'ecstatic')}</div>
      <h2 class="modal-title">Name your new kitty!</h2>
      <input id="adopt-input" class="text-input" maxlength="14" value="${esc(br.suggest)}" autocomplete="off" autocorrect="off" spellcheck="false">
      <div class="name-ideas">${ideas.map(n => `<button class="chip sm" data-name="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-close>Not yet</button>
        <button class="btn btn-mint" id="adopt-go">Adopt for ${a.price} 🪙</button>
      </div></div>`, {
    onOpen: (m, close) => {
      const input = $('#adopt-input', m);
      $$('.name-ideas .chip', m).forEach(c => c.addEventListener('click', () => { Sound.play('tap'); input.value = c.dataset.name; }));
      $('#adopt-go', m).addEventListener('click', () => {
        const name = input.value.trim();
        if (!name) return;
        if (!spendCoins(a.price)) return;
        S.cats.push({ id: S.nextCatId++, breed: a.breed, name, hunger: 80, fun: 80, cozy: 80 });
        S.adopted.push(a.breed);
        save();
        close();
        Sound.play('fanfare');
        setTimeout(() => Sound.play('meow'), 450);
        UI.confetti();
        UI.toast(`💖 <b>${esc(name)}</b> moved into your café!`, 'gold', 3500);
        Practice.refreshBuddy();
        showView('cafe');
      });
    },
  });
}

/* =========================== Fact Garden =========================== */
const FLOWERS = ['🌸', '🌼', '🌷', '🌻', '🌺'];
const SPROUTS = ['', '🌱', '🌿'];

function renderGarden() {
  const v = $('#view-garden');
  const hasDiv = S.settings.division || Object.keys(S.facts).some(k => k[0] === 'd');
  if (!hasDiv) gardenOp = 'x';
  const op = gardenOp;
  const total = 144;
  const done = Problems.masteredCount(S, op);
  let grid = `<div class="g-head corner">${op === 'x' ? '×' : '÷'}</div>`;
  for (let c = 1; c <= 12; c++) grid += `<div class="g-head">${c}</div>`;
  for (let r = 1; r <= 12; r++) {
    grid += `<div class="g-head">${r}</div>`;
    for (let c = 1; c <= 12; c++) {
      const f = S.facts[Problems.key(op, r, c)];
      const lv = Problems.level(f);
      const icon = lv === 3 ? FLOWERS[(r + c) % FLOWERS.length] : SPROUTS[lv];
      grid += `<button class="g-cell lv${lv}" data-r="${r}" data-c="${c}" aria-label="${op === 'x' ? `${r} times ${c}` : `${r * c} divided by ${r}`}">${icon}</button>`;
    }
  }
  v.innerHTML = `
    <div class="page">
      <div class="page-head garden-head">
        <div>
          <h2 class="page-title">🌸 Fact Garden</h2>
          <p class="page-sub">Get a fact right <b>3 times in a row</b> (first try) and it blooms!</p>
        </div>
        ${hasDiv ? `<div class="seg" id="garden-seg">
          <button data-op="x" class="${op === 'x' ? 'on' : ''}">× Times</button>
          <button data-op="d" class="${op === 'd' ? 'on' : ''}">÷ Divide</button></div>` : ''}
      </div>
      <div class="garden-wrap">
        <div class="garden-progress">
          <div class="gp-num">${done}<small>/${total}</small></div>
          <div class="gp-label">facts blooming</div>
          <div class="m-track big"><div class="m-fill" style="width:${done / total * 100}%;background:linear-gradient(90deg,#9BE7C4,#FF8FAB)"></div></div>
          <div class="legend">
            <span><i class="lv0"></i> Not tried</span>
            <span><i class="lv1">🌱</i> Planted</span>
            <span><i class="lv2">🌿</i> Growing</span>
            <span><i class="lv3">🌸</i> Bloomed</span>
          </div>
          <p class="gp-tip">Tap any square to see the fact.</p>
          <div class="gp-detail" id="gp-detail"></div>
        </div>
        <div class="garden-grid">${grid}</div>
      </div>
    </div>`;
  const seg = $('#garden-seg');
  if (seg) seg.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    Sound.play('tap');
    gardenOp = b.dataset.op;
    renderGarden();
  });
  $$('.g-cell', v).forEach(cell => cell.addEventListener('click', () => {
    const r = +cell.dataset.r, c = +cell.dataset.c;
    const f = S.facts[Problems.key(op, r, c)];
    const text = op === 'x' ? `${r} × ${c} = ${r * c}` : `${r * c} ÷ ${r} = ${c}`;
    const lv = Problems.level(f);
    const streakN = f ? f.streak : 0;
    const status = ['Not tried yet', `Planted! ${streakN}/3 in a row`, `Growing! ${streakN}/3 in a row`, 'Bloomed! Mastered! 🎉'][lv];
    $$('.g-cell.sel', v).forEach(x => x.classList.remove('sel'));
    cell.classList.add('sel');
    Sound.play('pop');
    $('#gp-detail').innerHTML = `<div class="gd-fact">${text}</div><div class="gd-status">${status}</div>${f ? `<div class="gd-stats">✅ ${f.right} right · 🔁 ${f.misses} to practice</div>` : ''}`;
    UI.restartAnim($('#gp-detail'), 'pop-in');
  }));
}

/* =========================== Settings =========================== */
function tablesPickerHTML() {
  return `<div class="table-grid" id="table-grid">
      ${ALL_TABLES.map(t => `<button class="table-chip ${S.settings.tables.includes(t) ? 'on' : ''}" data-t="${t}" id="table-${t}">${t}s</button>`).join('')}
    </div>
    <div class="table-quick">
      <button class="chip sm" data-q="all">All</button>
      <button class="chip sm" data-q="easy">Easy (1, 2, 5, 10)</button>
      <button class="chip sm" data-q="mid">3, 4, 6</button>
      <button class="chip sm" data-q="hard">Tricky (7, 8, 9, 11, 12)</button>
    </div>`;
}

function bindTablesPicker(root, onChange) {
  const sync = () => {
    $$('.table-chip', root).forEach(ch => ch.classList.toggle('on', S.settings.tables.includes(+ch.dataset.t)));
    save();
    onChange && onChange();
  };
  $$('.table-chip', root).forEach(ch => ch.addEventListener('click', () => {
    const t = +ch.dataset.t;
    const set = S.settings.tables;
    if (set.includes(t)) {
      if (set.length === 1) { UI.toast('Pick at least one table 🙂'); return; }
      S.settings.tables = set.filter(x => x !== t);
    } else {
      S.settings.tables = [...set, t].sort((a, b) => a - b);
    }
    Sound.play('tap');
    sync();
  }));
  const presets = { all: ALL_TABLES.slice(), easy: [1, 2, 5, 10], mid: [3, 4, 6], hard: [7, 8, 9, 11, 12] };
  $$('.table-quick .chip', root).forEach(ch => ch.addEventListener('click', () => {
    S.settings.tables = presets[ch.dataset.q].slice();
    Sound.play('tap');
    sync();
  }));
}

function openSettings() {
  Sound.play('tap');
  UI.modal(`
    <h2 class="modal-title">⚙️ Settings</h2>
    <div class="set-row">
      <div><b>Player name</b></div>
      <input id="set-name" class="text-input sm" maxlength="16" value="${esc(S.playerName)}" autocomplete="off" autocorrect="off" spellcheck="false">
    </div>
    <div class="set-row">
      <div><b>🔊 Sounds</b><small>Meows, purrs and chimes</small></div>
      <button class="toggle ${S.settings.sound ? 'on' : ''}" id="set-sound" aria-label="Sounds"></button>
    </div>
    <div class="set-row">
      <div><b>➗ Include division</b><small>Adds ÷ problems, a Divide mode and a division garden</small></div>
      <button class="toggle ${S.settings.division ? 'on' : ''}" id="set-div" aria-label="Include division"></button>
    </div>
    <div class="set-block">
      <b>📚 Times tables to practice</b>
      ${tablesPickerHTML()}
    </div>
    <div class="set-row danger-zone">
      <div><b>Start over</b><small>Erase all progress, cats and cat coins</small></div>
      <button class="btn btn-danger btn-sm" id="set-reset">Reset game</button>
    </div>
    <div class="modal-actions"><button class="btn btn-mint" data-close id="set-done">Done</button></div>`, {
    className: 'settings-modal',
    onOpen: (m, close) => {
      const nameInput = $('#set-name', m);
      nameInput.addEventListener('change', () => {
        const n = nameInput.value.trim();
        if (n) { S.playerName = n; save(); updateHeader(); if (currentView === 'cafe') renderCafe(); }
      });
      $('#set-sound', m).addEventListener('click', e => {
        S.settings.sound = !S.settings.sound;
        Sound.setEnabled(S.settings.sound);
        e.currentTarget.classList.toggle('on', S.settings.sound);
        Sound.play('meow');
        save();
      });
      $('#set-div', m).addEventListener('click', e => {
        S.settings.division = !S.settings.division;
        if (S.settings.division && S.settings.mode === 'x') S.settings.mode = 'mix';
        e.currentTarget.classList.toggle('on', S.settings.division);
        Sound.play('tap');
        save();
        Practice.reset();
        if (currentView === 'practice') Practice.show();
        if (currentView === 'garden') renderGarden();
        UI.toast(S.settings.division ? '➗ Division is on! Choose Times, Divide or Mix in Practice.' : 'Division is off.');
      });
      bindTablesPicker(m, () => {
        Practice.reset();
        if (currentView === 'practice') Practice.show();
      });
      $('#set-reset', m).addEventListener('click', () => {
        close();
        UI.confirm('Start over?', 'This erases all cats, cat coins and garden progress. This can’t be undone.', 'Yes, erase everything', () => {
          localStorage.removeItem(SAVE_KEY);
          location.reload();
        });
      });
    },
  });
}

/* =========================== Boot =========================== */
function boot() {
  Sound.setEnabled(S.settings.sound);

  $$('.tab').forEach(t => t.addEventListener('click', () => {
    if (t.dataset.view === currentView) return;
    Sound.play('tap');
    showView(t.dataset.view);
  }));
  $('#btn-settings').addEventListener('click', openSettings);
  $('#coin-pill').addEventListener('click', () => { Sound.play('tap'); showView('shop'); });
  $('#brand-cat').addEventListener('click', () => { Sound.play('meow'); UI.restartAnim($('#brand-cat'), 'wiggle'); });

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    let k = null;
    if (/^\d$/.test(e.key)) k = e.key;
    else if (e.key === 'Backspace') k = 'back';
    else if (e.key === 'Enter') k = 'ok';
    if (!k) return;
    if (Speed.active) { Speed.key(k); e.preventDefault(); }
    else if (currentView === 'practice' && !UI.anyModalOpen() && Practice.built) { Practice.key(k); e.preventDefault(); }
  });

  document.addEventListener('gesturestart', e => e.preventDefault());
  setInterval(tickNeeds, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) save(); });

  if (!S.playerName || !S.cats.length) {
    Onboarding.start();
  } else {
    applyOfflineDecay();
    enterMain(true);
  }

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

boot();
