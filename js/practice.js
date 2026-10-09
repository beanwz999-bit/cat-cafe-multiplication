/* ===========================================================
   Practice mode (no timer) and Speed Round (60 seconds)
   =========================================================== */
const CHEERS = ['Purr-fect!', 'Meow-velous!', 'Paw-some!', 'Fur-tastic!', 'Claw-some!', 'Whisker-ific!',
  "You're the cat's pajamas!", 'Purr-ty amazing!', 'Hiss-tory in the making!', 'Feline fine!'];
const BUDDY_CHEERS = ['Yay! You did it!', 'Purrrr… so smart!', 'Meow! More cat coins!', "You're amazing!", 'High five! 🐾', 'Woohoo!'];

function numpadHTML() {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 'back', 0, 'ok'].map(k => {
    const cls = k === 'ok' ? 'key key-ok' : k === 'back' ? 'key key-back' : 'key';
    const label = k === 'ok' ? '✓' : k === 'back' ? '⌫' : k;
    const aria = k === 'ok' ? 'Check answer' : k === 'back' ? 'Delete' : k;
    return `<button class="${cls}" data-key="${k}" id="key-${k}" aria-label="${aria}">${label}</button>`;
  }).join('');
}

function bindNumpad(el, onKey) {
  el.addEventListener('pointerdown', e => {
    const b = e.target.closest('.key');
    if (!b) return;
    e.preventDefault();
    b.classList.add('pressed');
    setTimeout(() => b.classList.remove('pressed'), 110);
    onKey(String(b.dataset.key));
  });
}

function tablesLabel() {
  const t = S.settings.tables;
  const maxT = S.settings.upTo15 ? 15 : 12;
  if (t.length >= maxT) return `All tables (1-${maxT})`;
  if (t.length <= 4) return `Tables: ${t.join(', ')}`;
  return `${t.length} tables`;
}

function practiceMode() {
  return S.settings.division ? S.settings.mode : 'x';
}

/* ---------- Dot-array picture to help visualize facts ---------- */
function pictureHTML(p, full) {
  const rows = p.op === 'x' ? p.left : p.right;
  const cols = p.op === 'x' ? p.right : p.answer;
  const maxDim = Math.max(rows, cols);
  const size = Math.max(9, Math.min(24, Math.floor(190 / maxDim)));
  let dots = '';
  for (let r = 0; r < rows; r++) {
    dots += `<div class="dot-row ${r % 2 ? 'alt' : ''}" style="animation-delay:${r * 0.05}s">${'<i></i>'.repeat(cols)}</div>`;
  }
  let caption;
  if (p.op === 'x') {
    if (full) {
      const counts = Array.from({ length: rows }, (_, i) => (i + 1) * cols);
      caption = `${rows} rows of ${cols}: <span class="skip">${counts.join(', ')}</span>`;
    } else {
      caption = `${rows} rows of ${cols} paws. Count by ${cols}s!`;
    }
  } else if (full) {
    caption = `${p.left} shared into ${p.right} rows = <b>${p.answer}</b> in each row`;
  } else {
    caption = `${p.left} treats shared into ${p.right} equal rows. How many in each row?`;
  }
  return `<div class="dots" style="--dot:${size}px">${dots}</div><div class="pic-caption">${caption}</div>`;
}

/* =========================== Practice =========================== */
const Practice = (() => {
  let built = false;
  let cur = null, input = '', attempts = 0, hintUsed = false, phase = 'answer';
  let streak = 0, sessionCoins = 0, locked = false, buddyCat = null;

  function show() {
    if (!built) build();
    else refreshBuddy();
  }

  function reset() { built = false; }

  function build() {
    const v = $('#view-practice');
    const m = practiceMode();
    v.innerHTML = `
      <div class="practice">
        <div class="practice-toolbar">
          ${S.settings.division ? `
          <div class="seg" id="mode-seg" role="tablist">
            <button data-mode="x" id="mode-x" class="${m === 'x' ? 'on' : ''}">× Times</button>
            <button data-mode="d" id="mode-d" class="${m === 'd' ? 'on' : ''}">÷ Divide</button>
            <button data-mode="mix" id="mode-mix" class="${m === 'mix' ? 'on' : ''}">🔀 Mix</button>
          </div>` : ''}
          <button class="chip" id="btn-tables">📚 ${tablesLabel()}</button>
          <div class="spacer"></div>
          <button class="btn btn-sun btn-sm" id="btn-speed">⚡ Speed Round</button>
        </div>
        <div class="practice-body">
          <div class="practice-left">
            <div class="session-bar">
              <div class="session-pill">🔥 <b id="streak-n">${streak}</b>&nbsp;in a row</div>
              <div class="session-pill">🪙 +<b id="session-coins">${sessionCoins}</b>&nbsp;this time</div>
            </div>
            <div class="problem-card" id="problem-card">
              <div class="problem" id="problem"></div>
              <div class="feedback" id="feedback"></div>
              <div class="picture" id="picture"></div>
            </div>
            <div class="buddy-row">
              <div class="buddy" id="buddy"></div>
              <div class="buddy-bubble" id="buddy-bubble"></div>
              <button class="btn btn-ghost btn-sm" id="btn-hint">🐾 Show me</button>
            </div>
          </div>
          <div class="numpad" id="numpad">${numpadHTML()}</div>
        </div>
      </div>`;

    bindNumpad($('#numpad'), key);
    $('#btn-hint').addEventListener('click', hint);
    $('#btn-speed').addEventListener('click', () => { Sound.play('tap'); Speed.open(); });
    $('#btn-tables').addEventListener('click', () => { Sound.play('tap'); openTablesPicker(); });
    const seg = $('#mode-seg');
    if (seg) {
      seg.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        Sound.play('tap');
        S.settings.mode = b.dataset.mode;
        save();
        $$('button', seg).forEach(x => x.classList.toggle('on', x === b));
        nextProblem();
      });
    }
    built = true;
    refreshBuddy();
    nextProblem();
  }

  function openTablesPicker() {
    UI.modal(`<h2 class="modal-title">📚 Which times tables?</h2>
      <p class="modal-text">Pick the tables to practice. Tap to turn them on or off.</p>
      ${tablesPickerHTML()}
      <div class="modal-actions"><button class="btn btn-mint" data-close id="tables-done">Done</button></div>`, {
      onOpen: (m) => bindTablesPicker(m, () => {
        $('#btn-tables').textContent = `📚 ${tablesLabel()}`;
        nextProblem();
      }),
    });
  }

  function refreshBuddy() {
    if (!S.cats.length) return;
    buddyCat = [...S.cats].sort((a, b) => (a.hunger + a.fun + a.cozy) - (b.hunger + b.fun + b.cozy))[0];
    const el = $('#buddy');
    if (!el) return;
    el.innerHTML = catSVG(buddyCat.breed, catMood(buddyCat));
    if (phase === 'answer') say(defaultLine());
  }

  function defaultLine() {
    const c = buddyCat;
    const [need, val] = neediest(c);
    if (val < 50) return `${esc(c.name)} ${NEED_INFO[need].want}! Earn 🪙 cat coins to help!`;
    return `${esc(c.name)} is cheering for you!`;
  }

  function say(html) {
    const b = $('#buddy-bubble');
    if (!b) return;
    b.innerHTML = html;
    UI.restartAnim(b, 'pop-in');
  }

  function nextProblem() {
    cur = Problems.next(S, practiceMode());
    input = '';
    attempts = 0;
    hintUsed = false;
    phase = 'answer';
    locked = false;
    $('#feedback').innerHTML = '';
    $('#picture').innerHTML = '';
    $('#problem-card').classList.remove('has-picture');
    $('#btn-hint').classList.remove('pulse');
    $('#btn-hint').disabled = false;
    $('#problem').innerHTML = `<span class="num">${cur.left}</span><span class="sym">${cur.sym}</span><span class="num">${cur.right}</span><span class="sym eq">=</span><span class="answer empty" id="answer-box">?</span>`;
    UI.restartAnim($('#problem'), 'slide-in');
    if (buddyCat) say(defaultLine());
  }

  function updateAnswer() {
    const box = $('#answer-box');
    box.textContent = input || '?';
    box.classList.toggle('empty', !input);
  }

  function key(k) {
    if (locked || !cur) return;
    if (phase === 'reveal') {
      if (k === 'ok') { Sound.play('tap'); nextProblem(); }
      return;
    }
    if (k === 'back') { input = input.slice(0, -1); Sound.play('key'); updateAnswer(); return; }
    if (k === 'ok') { submit(); return; }
    if (/^\d$/.test(k) && input.length < 3) {
      if (input === '0') input = '';
      input += k;
      Sound.play('key');
      updateAnswer();
    }
  }

  function updateSession() {
    $('#streak-n').textContent = streak;
    $('#session-coins').textContent = sessionCoins;
  }

  function submit() {
    if (!input) return;
    const val = parseInt(input, 10);
    const box = $('#answer-box');
    const card = $('#problem-card');

    if (val === cur.answer) {
      const first = attempts === 0;
      let bloomed = false;
      if (first) bloomed = Problems.record(S, cur, hintUsed ? 'assisted' : 'right');
      const coins = first && !hintUsed ? 3 : 1;
      if (first && !hintUsed) streak++;
      S.stats.answered += first ? 1 : 0;
      if (first && !hintUsed) S.stats.correct++;
      if (streak > S.stats.bestStreak) S.stats.bestStreak = streak;
      sessionCoins += coins;

      box.classList.add('right');
      UI.restartAnim(card, 'celebrate');
      $('#feedback').innerHTML = `<span class="cheer">✨ ${pick(CHEERS)} ✨</span>`;
      Sound.play('correct');
      addCoins(coins, box);
      UI.restartAnim($('#buddy'), 'jump');
      say(pick(BUDDY_CHEERS));

      if (first && !hintUsed && streak > 0 && streak % 5 === 0) {
        setTimeout(() => {
          addCoins(5, $('#streak-n'));
          sessionCoins += 5;
          updateSession();
          UI.toast(`🔥 <b>${streak} in a row!</b> +5 bonus cat coins! 🪙`, 'gold');
          UI.confetti(80);
        }, 500);
      }
      if (bloomed) {
        const p = cur;
        setTimeout(() => {
          UI.toast(`🌸 <b>${Problems.factText(p)}</b> bloomed in your Fact Garden!`, 'bloom', 3200);
          Sound.play('bloom');
        }, 750);
      }
      updateSession();
      save();
      locked = true;
      setTimeout(nextProblem, 1300);
    } else {
      Sound.play('wrong');
      UI.restartAnim(card, 'shake');
      if (attempts === 0) {
        attempts = 1;
        Problems.record(S, cur, 'wrong');
        S.stats.answered++;
        streak = 0;
        input = '';
        updateAnswer();
        $('#feedback').innerHTML = `<span class="oops">Almost! Try again 🐾</span>`;
        $('#btn-hint').classList.add('pulse');
        say('You can do it! Tap <b>Show me</b> for a picture.');
      } else {
        phase = 'reveal';
        Problems.addReview(cur);
        input = String(cur.answer);
        box.textContent = cur.answer;
        box.classList.remove('empty');
        box.classList.add('reveal');
        $('#feedback').innerHTML = `<span class="reveal-text">It's <b>${cur.answer}</b>! Let's look together.</span>
          <button class="btn btn-mint btn-sm" id="btn-next">Next ➜</button>`;
        $('#btn-next').addEventListener('click', () => { Sound.play('tap'); nextProblem(); });
        showPicture(true);
        $('#btn-hint').disabled = true;
        say("That's a tricky one! We'll practice it again soon.");
      }
      updateSession();
      save();
    }
  }

  function showPicture(full) {
    $('#picture').innerHTML = pictureHTML(cur, full);
    $('#problem-card').classList.add('has-picture');
  }

  function hint() {
    if (phase !== 'answer' || !cur) return;
    Sound.play('pop');
    hintUsed = true;
    $('#btn-hint').classList.remove('pulse');
    showPicture(false);
    say(cur.op === 'x' ? 'Count the paws row by row!' : 'Count how many are in one row!');
  }

  return { show, reset, key, refreshBuddy, get built() { return built; } };
})();

/* =========================== Speed Round =========================== */
const Speed = (() => {
  const DURATION = 60000;
  let active = false, phase = 'idle', score = 0, missed = 0, endAt = 0, cur = null, input = '', raf = null, locked = false;
  let lastSecond = 60, timers = [];

  const el = () => $('#speed');

  function open() {
    active = true;
    el().classList.remove('hidden');
    renderIntro();
  }

  function close() {
    active = false;
    phase = 'idle';
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    timers = [];
    el().classList.add('hidden');
    el().innerHTML = '';
    Practice.refreshBuddy();
  }

  function modeLabel() {
    const m = practiceMode();
    return m === 'x' ? 'Multiplication' : m === 'd' ? 'Division' : 'Mixed × and ÷';
  }

  function renderIntro() {
    phase = 'intro';
    const best = S.stats.speedBest[practiceMode()] || 0;
    el().innerHTML = `
      <div class="speed-intro pop-in">
        <div class="speed-bolt">⚡</div>
        <h2>Speed Round!</h2>
        <p>Answer as many as you can in <b>60 seconds</b>.</p>
        <div class="speed-facts">
          <div><span>🪙</span><b>2 cat coins</b> for every right answer</div>
          <div><span>🏆</span><b>+10 bonus</b> for a new best score</div>
          <div><span>📚</span>${modeLabel()} · ${tablesLabel()}</div>
        </div>
        <div class="speed-best">Your best: <b>${best}</b></div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="sp-back">Back</button>
          <button class="btn btn-sun btn-xl" id="sp-go">Ready? Go!</button>
        </div>
      </div>`;
    $('#sp-back').addEventListener('click', () => { Sound.play('tap'); close(); });
    $('#sp-go').addEventListener('click', countdown);
  }

  function countdown() {
    phase = 'countdown';
    let n = 3;
    const tick = () => {
      if (!active) return;
      if (n > 0) {
        el().innerHTML = `<div class="countdown"><span class="cd-num" key="${n}">${n}</span></div>`;
        Sound.play('tick');
        n--;
        timers.push(setTimeout(tick, 800));
      } else {
        el().innerHTML = `<div class="countdown"><span class="cd-num go">GO!</span></div>`;
        Sound.play('go');
        timers.push(setTimeout(start, 500));
      }
    };
    tick();
  }

  function start() {
    if (!active) return;
    phase = 'play';
    score = 0;
    missed = 0;
    lastSecond = 60;
    endAt = Date.now() + DURATION;
    el().innerHTML = `
      <div class="speed-play">
        <div class="speed-top">
          <button class="btn btn-ghost btn-sm" id="sp-quit">✕ Stop</button>
          <div class="timer"><div class="timer-fill" id="sp-fill"></div><span class="timer-sec" id="sp-sec">60</span></div>
          <div class="sp-score">⭐ <b id="sp-score">0</b></div>
        </div>
        <div class="speed-body">
          <div class="sp-card" id="sp-card"><div class="problem" id="sp-problem"></div></div>
          <div class="numpad" id="sp-pad">${numpadHTML()}</div>
        </div>
      </div>`;
    $('#sp-quit').addEventListener('click', () => { Sound.play('tap'); finish(); });
    bindNumpad($('#sp-pad'), key);
    next();
    loop();
  }

  function loop() {
    if (phase !== 'play') return;
    const left = Math.max(0, endAt - Date.now());
    const pct = (left / DURATION) * 100;
    const fill = $('#sp-fill');
    if (fill) {
      fill.style.width = `${pct}%`;
      fill.classList.toggle('hurry', left < 10000);
    }
    const sec = Math.ceil(left / 1000);
    if (sec !== lastSecond) {
      lastSecond = sec;
      const s = $('#sp-sec');
      if (s) s.textContent = sec;
      if (sec <= 5 && sec > 0) Sound.play('tick');
    }
    if (left <= 0) { finish(); return; }
    raf = requestAnimationFrame(loop);
  }

  function next() {
    cur = Problems.next(S, practiceMode());
    input = '';
    locked = false;
    $('#sp-problem').innerHTML = `<span class="num">${cur.left}</span><span class="sym">${cur.sym}</span><span class="num">${cur.right}</span><span class="sym eq">=</span><span class="answer empty" id="sp-answer">?</span>`;
    UI.restartAnim($('#sp-problem'), 'slide-in');
  }

  function update() {
    const box = $('#sp-answer');
    box.textContent = input || '?';
    box.classList.toggle('empty', !input);
  }

  function key(k) {
    if (phase !== 'play' || locked) return;
    if (k === 'back') { input = input.slice(0, -1); Sound.play('key'); update(); return; }
    if (k === 'ok') { if (input) check(); return; }
    if (/^\d$/.test(k) && input.length < 3) {
      input += k;
      Sound.play('key');
      update();
      if (input.length >= String(cur.answer).length) check();
    }
  }

  function check() {
    locked = true;
    const val = parseInt(input, 10);
    const box = $('#sp-answer');
    if (val === cur.answer) {
      score++;
      $('#sp-score').textContent = score;
      const bloomed = Problems.record(S, cur, 'right');
      if (bloomed) UI.toast(`🌸 <b>${Problems.factText(cur)}</b> bloomed!`, 'bloom', 2000);
      box.classList.add('right');
      Sound.play('quick');
      UI.restartAnim($('#sp-card'), 'flash-good');
      timers.push(setTimeout(() => phase === 'play' && next(), 220));
    } else {
      missed++;
      Problems.record(S, cur, 'wrong');
      Problems.addReview(cur);
      box.textContent = cur.answer;
      box.classList.add('reveal');
      Sound.play('wrong');
      UI.restartAnim($('#sp-card'), 'shake');
      timers.push(setTimeout(() => phase === 'play' && next(), 1100));
    }
  }

  function finish() {
    if (phase !== 'play') return;
    phase = 'done';
    cancelAnimationFrame(raf);
    const m = practiceMode();
    const prev = S.stats.speedBest[m] || 0;
    const newBest = score > prev;
    if (newBest) S.stats.speedBest[m] = score;
    const coins = score * 2 + (newBest ? 10 : 0);
    save();
    el().innerHTML = `
      <div class="speed-intro pop-in">
        <div class="speed-bolt">${newBest ? '🏆' : '⏰'}</div>
        <h2>${newBest ? 'New best score!' : "Time's up!"}</h2>
        <div class="final-score">${score}</div>
        <p>right answers${missed ? ` · ${missed} to practice` : ''}</p>
        <div class="earned" id="sp-earned">+${coins} 🪙</div>
        <div class="speed-best">Best: <b>${S.stats.speedBest[m]}</b></div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="sp-done">Done</button>
          <button class="btn btn-sun" id="sp-again">⚡ Play again</button>
        </div>
      </div>`;
    if (coins > 0) addCoins(coins, $('#sp-earned'));
    Sound.play('fanfare');
    if (newBest && score > 0) UI.confetti();
    $('#sp-done').addEventListener('click', () => { Sound.play('tap'); close(); });
    $('#sp-again').addEventListener('click', () => { Sound.play('tap'); countdown(); });
  }

  return { open, close, key, get active() { return active; } };
})();
