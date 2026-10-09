/* ===========================================================
   UI helpers: DOM shortcuts, modals, toasts, confetti, hearts
   =========================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

const UI = (() => {
  let confettiRaf = null;

  function toast(html, type = 'info', ms = 2800) {
    const root = $('#toast-root');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = html;
    root.appendChild(el);
    while (root.children.length > 3) root.firstElementChild.remove();
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 400);
    }, ms);
  }

  function modal(html, { onOpen, dismissable = true, className = '' } = {}) {
    const root = $('#modal-root');
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal ${className}" role="dialog" aria-modal="true">${html}</div>`;
    root.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('show'));
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      wrap.classList.remove('show');
      setTimeout(() => wrap.remove(), 250);
    };
    if (dismissable) wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
    wrap.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) { Sound.play('tap'); close(); }
    });
    if (onOpen) onOpen(wrap.querySelector('.modal'), close);
    return close;
  }

  function confirm(title, msg, yesLabel, onYes) {
    modal(`<div class="center">
        <h2 class="modal-title">${title}</h2>
        <p class="modal-text">${msg}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-close>Cancel</button>
          <button class="btn btn-danger" id="confirm-yes">${yesLabel}</button>
        </div></div>`, {
      onOpen: (m, close) => {
        $('#confirm-yes', m).addEventListener('click', () => { close(); onYes(); });
      },
    });
  }

  function anyModalOpen() {
    return $('#modal-root').children.length > 0;
  }

  function confetti(count = 140) {
    const cv = $('#confetti');
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth, H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    const colors = ['#FF8FAB', '#B9A2FF', '#6FD6B4', '#FFD166', '#8CC8FF', '#FFB48F'];
    const parts = Array.from({ length: count }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.4,
      y: H * 0.38,
      vx: (Math.random() - 0.5) * 18,
      vy: -Math.random() * 16 - 5,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      w: 8 + Math.random() * 8,
      h: 5 + Math.random() * 6,
      c: pick(colors),
      emoji: Math.random() < 0.14 ? pick(['🐟', '🐾', '💖', '⭐']) : null,
    }));
    const t0 = performance.now();
    if (confettiRaf) cancelAnimationFrame(confettiRaf);
    const step = t => {
      const el = t - t0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.vy += 0.38;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - el / 3200);
        if (p.emoji) {
          ctx.font = '24px serif';
          ctx.fillText(p.emoji, -12, 8);
        } else {
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
      if (el < 3200) confettiRaf = requestAnimationFrame(step);
      else ctx.clearRect(0, 0, W, H);
    };
    confettiRaf = requestAnimationFrame(step);
  }

  function floatText(fromEl, text, cls = '') {
    if (!fromEl) return;
    const r = fromEl.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = `float-text ${cls}`;
    el.textContent = text;
    el.style.left = `${r.left + r.width / 2}px`;
    el.style.top = `${r.top}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  function hearts(fromEl, emojis = ['💖', '💕', '💗', '✨']) {
    if (!fromEl) return;
    const r = fromEl.getBoundingClientRect();
    for (let i = 0; i < 7; i++) {
      const el = document.createElement('div');
      el.className = 'float-heart';
      el.textContent = pick(emojis);
      el.style.left = `${r.left + r.width * (0.25 + Math.random() * 0.5)}px`;
      el.style.top = `${r.top + r.height * 0.35}px`;
      el.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
      el.style.animationDelay = `${i * 0.06}s`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }
  }

  function restartAnim(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  return { toast, modal, confirm, anyModalOpen, confetti, floatText, hearts, restartAnim };
})();
