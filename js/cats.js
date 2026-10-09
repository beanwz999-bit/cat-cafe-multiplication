/* ===========================================================
   Cats: breeds, SVG drawing, moods and adoption list
   =========================================================== */
const BREEDS = {
  orange:  { label: 'Orange Tabby', body: '#F6A55B', dark: '#DB7B30', chest: '#FFE6C9', eye: '#4CAF50', pattern: 'tabby',
             suggest: 'Mochi', blurb: 'A sunny little tabby who loves belly rubs.' },
  gray:    { label: 'Gray Kitty', body: '#A3AEBB', dark: '#748294', chest: '#E3E8EE', eye: '#F2B705', pattern: 'tabby',
             suggest: 'Pebble', blurb: 'A gentle gray kitty who naps in sunbeams.' },
  calico:  { label: 'Calico', body: '#FFF6EA', dark: '#F6A55B', dark2: '#4A4458', chest: '#FFFFFF', eye: '#7CB342', pattern: 'calico',
             suggest: 'Patches', blurb: 'Three colors and a hundred percent cuddles.' },
  black:   { label: 'Midnight Cat', body: '#3E3A4F', dark: '#2A2738', chest: '#3E3A4F', eye: '#F7D046', pattern: 'solid', light: true,
             suggest: 'Shadow', blurb: 'Mysterious and sweet. Loves chasing feathers!' },
  white:   { label: 'Snowball', body: '#FFFDF9', dark: '#EDE4D8', chest: '#FFFFFF', eye: '#5DADE2', pattern: 'solid',
             suggest: 'Marshmallow', blurb: 'Fluffy as a cloud and twice as soft.' },
  siamese: { label: 'Siamese', body: '#F5E8D6', dark: '#6D5240', chest: '#FBF3E8', eye: '#4A90E2', pattern: 'points',
             suggest: 'Coco', blurb: 'Super chatty! Will meow back when you talk.' },
  tuxedo:  { label: 'Tuxedo', body: '#33303F', dark: '#22202B', chest: '#FFFFFF', eye: '#8BC34A', pattern: 'tuxedo', light: true,
             suggest: 'Sir Pickles', blurb: 'Always dressed for a fancy party.' },
  brown:   { label: 'Brown Tabby', body: '#B08A62', dark: '#76563A', chest: '#EADAC4', eye: '#9CCC65', pattern: 'tabby',
             suggest: 'Biscuit', blurb: 'Loves snacks more than anything in the world.' },
  unicorn: { label: 'Unicorn Kitty 🦄', body: '#FFF2FD', dark: '#FFB8EF', chest: '#FFFFFF', eye: '#4CC9F0', pattern: 'unicorn',
             suggest: 'Sparkles', blurb: '✨ A magical unicorn cat with a glowing horn, rainbow tail, and starry aura!' },
};

const STARTER_BREEDS = ['orange', 'gray', 'calico'];
const ADOPT_ORDER = ['gray', 'black', 'white', 'siamese', 'tuxedo', 'brown', 'orange', 'calico', 'unicorn'];
const ADOPT_TIERS = [
  { price: 40, flowers: 3 },
  { price: 70, flowers: 8 },
  { price: 100, flowers: 15 },
  { price: 140, flowers: 24 },
  { price: 180, flowers: 34 },
  { price: 230, flowers: 46 },
  { price: 300, flowers: 60 },
  { price: 500, flowers: 100 },
];

const NEED_INFO = {
  hunger: { label: 'Tummy', emoji: '🍗', want: 'is hungry', color: 'linear-gradient(90deg,#FFB48F,#FF8F70)' },
  fun:    { label: 'Play',  emoji: '🧶', want: 'wants to play', color: 'linear-gradient(90deg,#C9B6FF,#9F82F0)' },
  cozy:   { label: 'Cozy',  emoji: '🛏️', want: 'is sleepy', color: 'linear-gradient(90deg,#A8D8FF,#6FB4F0)' },
};

const MOOD_TEXT = {
  ecstatic: 'is super happy! 😻',
  happy: 'is happy 😺',
  okay: 'is doing okay 🐱',
  sad: 'needs some love 😿',
};

const NAME_IDEAS = ['Mochi', 'Luna', 'Whiskers', 'Pumpkin', 'Biscuit', 'Oreo', 'Ginger', 'Noodle', 'Pepper', 'Cinnamon', 'Muffin', 'Ziggy', 'Bean', 'Sprinkles', 'Sparkles', 'Starlight', 'Celeste'];

function adoptionList(state) {
  const isDino = state && state.theme === 'dino';
  const order = isDino ? ADOPT_DINO_ORDER : ADOPT_ORDER;
  const starter = state.cats[0] ? state.cats[0].breed : null;
  return order.filter(b => b !== starter).slice(0, ADOPT_TIERS.length).map((breed, i) => ({
    breed,
    ...ADOPT_TIERS[i],
    adopted: state.adopted.includes(breed),
  }));
}

function catMood(cat) {
  const avg = (cat.hunger + cat.fun + cat.cozy) / 3;
  const min = Math.min(cat.hunger, cat.fun, cat.cozy);
  if (min < 20 || avg < 35) return 'sad';
  if (avg >= 85) return 'ecstatic';
  if (avg >= 60) return 'happy';
  return 'okay';
}

function neediest(cat) {
  return [['hunger', cat.hunger], ['fun', cat.fun], ['cozy', cat.cozy]].sort((a, b) => a[1] - b[1])[0];
}

function renderCostumeSVG(costumeKey) {
  if (!costumeKey) return '';
  switch (costumeKey) {
    case 'dino':
      return `<g class="costume-dino">
        <path d="M52 82 C52 42 70 30 100 30 C130 30 148 42 148 82 Z" fill="#70E000" opacity=".92"/>
        <path d="M58 82 C58 48 74 38 100 38 C126 38 142 48 142 82 Z" fill="none" stroke="#38B000" stroke-width="3"/>
        <polygon points="100,8 90,30 110,30" fill="#FFD166" stroke="#E5A93B" stroke-width="1.5"/>
        <polygon points="76,16 70,36 88,34" fill="#FFD166" stroke="#E5A93B" stroke-width="1.5"/>
        <polygon points="124,16 112,34 130,36" fill="#FFD166" stroke="#E5A93B" stroke-width="1.5"/>
      </g>`;
    case 'dog':
      return `<g class="costume-dog">
        <ellipse cx="46" cy="85" rx="14" ry="25" fill="#8D6E63" stroke="#5D4037" stroke-width="2.5"/>
        <ellipse cx="154" cy="85" rx="14" ry="25" fill="#8D6E63" stroke="#5D4037" stroke-width="2.5"/>
        <ellipse cx="100" cy="98" rx="12" ry="8" fill="#5D4037"/>
        <ellipse cx="100" cy="96" rx="5" ry="3" fill="#2B1D16"/>
      </g>`;
    case 'cow':
      return `<g class="costume-cow">
        <polygon points="62,45 52,25 70,38" fill="#FFE066" stroke="#DB9A00" stroke-width="2"/>
        <polygon points="138,45 148,25 130,38" fill="#FFE066" stroke="#DB9A00" stroke-width="2"/>
        <ellipse cx="100" cy="103" rx="15" ry="10" fill="#FFB3C1" stroke="#FF8FA3" stroke-width="2"/>
        <circle cx="94" cy="103" r="2" fill="#D85A75"/>
        <circle cx="106" cy="103" r="2" fill="#D85A75"/>
      </g>`;
    case 'chicken':
      return `<g class="costume-chicken">
        <path d="M85 45 Q92 20 100 25 Q108 20 115 45 Z" fill="#E63946" stroke="#C1121F" stroke-width="2"/>
        <polygon points="100,102 91,114 109,114" fill="#FFB703" stroke="#FB8500" stroke-width="2"/>
      </g>`;
    case 'crown':
      return `<g class="costume-crown">
        <polygon points="68,52 65,22 83,40 100,18 117,40 135,22 132,52" fill="#FFD166" stroke="#E5A93B" stroke-width="2"/>
        <circle cx="65" cy="22" r="3.5" fill="#E63946"/>
        <circle cx="100" cy="18" r="4" fill="#4CC9F0"/>
        <circle cx="135" cy="22" r="3.5" fill="#E63946"/>
      </g>`;
    case 'wizard':
      return `<g class="costume-wizard">
        <ellipse cx="100" cy="55" rx="45" ry="10" fill="#3D348B"/>
        <polygon points="100,0 68,52 132,52" fill="#5C4D7D"/>
        <text x="94" y="32" font-size="12" fill="#FFD166">⭐</text>
      </g>`;
    default:
      return '';
  }
}

/** Draws a cute sitting cat as an inline SVG string. */
function catSVG(breedKey, mood = 'happy', costumeKey = null) {
  const b = BREEDS[breedKey] || BREEDS.orange;
  const pat = b.pattern;
  const brow = b.light ? '#E9E3F5' : '#5A4A42';
  const mouthC = pat === 'tuxedo' ? '#5A4A42' : pat === 'points' ? '#2E2018' : brow;
  const whisk = pat === 'unicorn' ? '#FF9EE2' : (b.light ? 'rgba(255,255,255,.75)' : 'rgba(90,74,66,.5)');
  const earL = pat === 'points' || pat === 'calico' ? b.dark : pat === 'unicorn' ? '#FFD6FA' : b.body;
  const earR = pat === 'points' ? b.dark : pat === 'calico' ? b.dark2 : pat === 'unicorn' ? '#FFD6FA' : b.body;
  const tail = pat === 'points' ? b.dark : pat === 'calico' ? b.dark2 : pat === 'unicorn' ? 'url(#unicorn-rainbow)' : b.body;
  const paws = pat === 'points' ? b.dark : (pat === 'tuxedo' || pat === 'calico' || pat === 'unicorn') ? '#FFFFFF' : b.body;
  const delay = (Math.random() * 4).toFixed(2);

  let bodyPat = '';
  let headPat = '';
  if (pat === 'tabby') {
    bodyPat = `<g stroke="${b.dark}" stroke-width="6" stroke-linecap="round" fill="none">
      <path d="M60 140 Q70 142 73 151"/><path d="M58 157 Q68 159 70 168"/>
      <path d="M140 140 Q130 142 127 151"/><path d="M142 157 Q132 159 130 168"/></g>`;
    headPat = `<g stroke="${b.dark}" stroke-width="5" stroke-linecap="round" fill="none">
      <path d="M100 51 V63"/><path d="M87 54 L90 63"/><path d="M113 54 L110 63"/>
      <path d="M54 86 H64"/><path d="M55 96 H64"/><path d="M146 86 H136"/><path d="M145 96 H136"/></g>`;
  } else if (pat === 'calico') {
    bodyPat = `<ellipse cx="126" cy="146" rx="17" ry="14" fill="${b.dark2}"/><ellipse cx="74" cy="164" rx="13" ry="11" fill="${b.dark}"/>`;
    headPat = `<ellipse cx="76" cy="74" rx="19" ry="15" fill="${b.dark}"/><ellipse cx="126" cy="70" rx="15" ry="12" fill="${b.dark2}"/>`;
  } else if (pat === 'points') {
    headPat = `<ellipse cx="100" cy="105" rx="24" ry="18" fill="${b.dark}" opacity=".85"/>`;
  } else if (pat === 'tuxedo') {
    headPat = `<path d="M100 93 C88 93 79 102 79 111 C79 120 91 125 100 125 C109 125 121 120 121 111 C121 102 112 93 100 93Z" fill="#fff"/>`;
  } else if (pat === 'unicorn') {
    headPat = `<path d="M100 93 C88 93 79 102 79 111 C79 120 91 125 100 125 C109 125 121 120 121 111 C121 102 112 93 100 93Z" fill="#FFF0F8"/>
      <circle cx="68" cy="70" r="2.5" fill="#FFC6FF"/><circle cx="132" cy="70" r="2.5" fill="#FFC6FF"/>`;
  }

  let eyes;
  if (mood === 'ecstatic') {
    eyes = `<g stroke="${brow}" stroke-width="4.5" stroke-linecap="round" fill="none">
      <path d="M71 90 Q80 80 89 90"/><path d="M111 90 Q120 80 129 90"/></g>`;
  } else {
    const ry = mood === 'okay' ? 8 : 10;
    const ey = mood === 'sad' ? 90 : 88;
    const one = cx => `<ellipse cx="${cx}" cy="${ey}" rx="8.5" ry="${ry}" fill="${b.eye}"/>
      <ellipse cx="${cx}" cy="${ey + 1}" rx="4.4" ry="${ry - 2.5}" fill="#2B2233"/>
      <circle cx="${cx + 2.6}" cy="${ey - 3.5}" r="2.7" fill="#fff"/>`;
    eyes = `<g class="cat-eyes" style="animation-delay:${delay}s">${one(80)}${one(120)}</g>`;
    if (mood === 'sad') {
      eyes += `<g stroke="${brow}" stroke-width="3.5" stroke-linecap="round"><path d="M69 77 L87 72"/><path d="M131 77 L113 72"/></g>
        <path class="tear" d="M70 101 q-5 8 0 10 q5 -2 0 -10z" fill="#8EC9FF"/>`;
    }
  }

  const nose = `<path d="M94.5 101 H105.5 L100 107.5 Z" fill="#FF8FA3" stroke="#FF8FA3" stroke-width="2" stroke-linejoin="round"/>`;
  let mouth;
  if (mood === 'ecstatic') {
    mouth = `<path d="M91 110 Q100 127 109 110 Z" fill="#E8607A" stroke="${mouthC}" stroke-width="2.5" stroke-linejoin="round"/>`;
  } else if (mood === 'sad') {
    mouth = `<path d="M92 119 Q100 111 108 119" stroke="${mouthC}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else {
    mouth = `<path d="M100 107.5 V111 M100 111 Q96 116 91 113 M100 111 Q104 116 109 113" stroke="${mouthC}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  const blush = mood === 'sad' ? '' :
    `<circle cx="67" cy="106" r="7.5" fill="#FF8FA3" opacity=".45"/><circle cx="133" cy="106" r="7.5" fill="#FF8FA3" opacity=".45"/>`;
  const whiskers = `<g stroke="${whisk}" stroke-width="2" stroke-linecap="round">
    <path d="M76 104 L47 99"/><path d="M76 109 L46 112"/><path d="M124 104 L153 99"/><path d="M124 109 L154 112"/></g>`;

  const horn = pat === 'unicorn' ? `
    <g class="unicorn-horn">
      <path d="M100 2 L91 44 L109 44 Z" fill="url(#gold-horn)" stroke="#E5A93B" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M95 18 Q100 15 105 18" stroke="#FFF7DB" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M93 28 Q100 25 107 28" stroke="#FFF7DB" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M92 38 Q100 35 108 38" stroke="#FFF7DB" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="100" cy="4" r="3" fill="#FFF" opacity=".9"/>
    </g>` : '';

  const stars = pat === 'unicorn' ? `
    <text x="35" y="65" font-size="14" fill="#FFD166" opacity=".9">✨</text>
    <text x="155" y="65" font-size="14" fill="#FFD166" opacity=".9">✨</text>` : '';

  const defs = pat === 'unicorn' ? `
    <defs>
      <linearGradient id="unicorn-rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFADAD"/>
        <stop offset="20%" stop-color="#FFD6A5"/>
        <stop offset="40%" stop-color="#FDFFB6"/>
        <stop offset="60%" stop-color="#CAFFBF"/>
        <stop offset="80%" stop-color="#9BF6FF"/>
        <stop offset="100%" stop-color="#BDB2FF"/>
      </linearGradient>
      <linearGradient id="gold-horn" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFE066"/>
        <stop offset="50%" stop-color="#F7B801"/>
        <stop offset="100%" stop-color="#DB9A00"/>
      </linearGradient>
    </defs>` : '';

  const costumeHTML = costumeKey ? renderCostumeSVG(costumeKey) : '';

  return `<svg class="cat-svg mood-${mood}" viewBox="0 0 200 212" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${defs}
    <ellipse cx="100" cy="203" rx="58" ry="7" fill="rgba(75,58,87,.13)"/>
    <path class="cat-tail" style="animation-delay:-${delay}s" d="M136 174 Q182 170 178 128 Q176 108 188 98" stroke="${tail}" stroke-width="15" stroke-linecap="round" fill="none"/>
    <ellipse cx="100" cy="155" rx="48" ry="44" fill="${b.body}"/>
    ${bodyPat}
    <ellipse cx="100" cy="166" rx="25" ry="28" fill="${b.chest}"/>
    <ellipse cx="80" cy="194" rx="14" ry="9" fill="${paws}"/>
    <ellipse cx="120" cy="194" rx="14" ry="9" fill="${paws}"/>
    <g class="cat-head" style="animation-delay:-${delay}s">
      <path d="M57 70 L63 24 L97 50 Z" fill="${earL}" stroke="${earL}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M143 70 L137 24 L103 50 Z" fill="${earR}" stroke="${earR}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M66 60 L69 36 L87 50 Z" fill="#FFB3C1" stroke="#FFB3C1" stroke-width="3" stroke-linejoin="round"/>
      <path d="M134 60 L131 36 L113 50 Z" fill="#FFB3C1" stroke="#FFB3C1" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="100" cy="90" rx="50" ry="44" fill="${b.body}"/>
      ${headPat}${eyes}${blush}${nose}${mouth}${whiskers}${horn}${stars}${costumeHTML}
    </g>
  </svg>`;
}

/** Draws either a Cat or Dinosaur based on current game theme */
function petSVG(pet, mood = 'happy') {
  const costume = (typeof S !== 'undefined' && S.equippedCostumes) ? S.equippedCostumes[pet.id] : null;
  const isDino = typeof S !== 'undefined' && S.theme === 'dino';
  return isDino ? dinoSVG(pet.breed, mood, costume) : catSVG(pet.breed, mood, costume);
}
