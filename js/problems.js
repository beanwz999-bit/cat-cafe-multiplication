/* ===========================================================
   Problems: generating facts, tracking mastery,
   and bringing missed facts back more often.
   Multiplication facts are stored order-free (7×8 == 8×7).
   Division facts are stored as dividend ÷ divisor = quotient,
   keyed by divisor (a) and quotient (b).
   =========================================================== */
const Problems = (() => {
  const recent = [];
  let review = [];

  function key(op, a, b) {
    if (op === 'x') return a <= b ? `x${a}-${b}` : `x${b}-${a}`;
    return `d${a}-${b}`;
  }

  function level(f) {
    if (!f || !f.seen) return 0;
    if (f.mastered) return 3;
    if (f.streak >= 1) return 2;
    return 1;
  }

  function weight(f) {
    if (!f || !f.seen) return 2.5;
    const w = f.streak >= 3 ? 0.5 : 2 + Math.min(f.misses, 4) * 1.2 - f.streak * 0.4;
    return Math.max(w, 0.4);
  }

  function make(op, a, b) {
    if (op === 'x') {
      const flip = Math.random() < 0.5;
      return { op, a, b, left: flip ? b : a, right: flip ? a : b, answer: a * b, sym: '×', key: key(op, a, b) };
    }
    return { op, a, b, left: a * b, right: a, answer: b, sym: '÷', key: key(op, a, b) };
  }

  function remember(k) {
    recent.push(k);
    if (recent.length > 4) recent.shift();
  }

  function next(state, mode) {
    review.forEach(r => r.due--);
    const ri = review.findIndex(r => r.due <= 0 && (mode === 'mix' || r.op === mode));
    if (ri >= 0) {
      const r = review.splice(ri, 1)[0];
      remember(r.key);
      return make(r.op, r.a, r.b);
    }

    const tables = state.settings.tables.length ? state.settings.tables : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const op = mode === 'mix' ? (Math.random() < 0.5 ? 'x' : 'd') : mode;
    const cands = [];
    let total = 0;
    for (const a of tables) {
      for (let b = 1; b <= 12; b++) {
        const k = key(op, a, b);
        if (recent.includes(k)) continue;
        let w = weight(state.facts[k]);
        if (a === 1 || b === 1) w *= 0.35; // ×1 facts are easy; show them less
        cands.push([a, b, w]);
        total += w;
      }
    }
    if (!cands.length) return make(op, tables[0], 1 + Math.floor(Math.random() * 12));
    let r = Math.random() * total;
    for (const c of cands) {
      r -= c[2];
      if (r <= 0) {
        remember(key(op, c[0], c[1]));
        return make(op, c[0], c[1]);
      }
    }
    const c = cands[cands.length - 1];
    remember(key(op, c[0], c[1]));
    return make(op, c[0], c[1]);
  }

  /** result: 'right' (first try, no hint), 'wrong', or 'assisted'. Returns true if a new flower bloomed. */
  function record(state, p, result) {
    const f = state.facts[p.key] || (state.facts[p.key] = { seen: 0, right: 0, misses: 0, streak: 0, mastered: false });
    f.seen++;
    if (result === 'right') { f.right++; f.streak++; }
    else if (result === 'wrong') { f.misses++; f.streak = 0; }
    if (!f.mastered && f.streak >= 3) {
      f.mastered = true;
      return true;
    }
    return false;
  }

  function addReview(p) {
    if (!review.some(r => r.key === p.key)) review.push({ op: p.op, a: p.a, b: p.b, key: p.key, due: 3 });
  }

  function masteredCount(state, op) {
    return Object.entries(state.facts).filter(([k, f]) => f.mastered && (!op || k[0] === op)).length;
  }

  function factText(p) {
    return `${p.left} ${p.sym} ${p.right} = ${p.answer}`;
  }

  return { key, level, next, record, addReview, masteredCount, factText, make };
})();
