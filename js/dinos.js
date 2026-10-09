/* ===========================================================
   Dinos: species, SVG drawing, moods and adoption list
   =========================================================== */
const DINO_BREEDS = {
  trex:        { label: 'Tiny T-Rex', body: '#70E000', dark: '#38B000', chest: '#CCFF33', eye: '#FFD166',
                 suggest: 'Rexy', blurb: 'Small arms, huge heart! Loves practicing math.' },
  triceratops: { label: 'Triceratops', body: '#4EA8DE', dark: '#5E60CE', chest: '#90E0EF', eye: '#72EFDD',
                 suggest: 'Topsi', blurb: 'Has three cute little horns and loves head pats.' },
  stego:       { label: 'Stegosaurus', body: '#FF9E00', dark: '#E85D04', chest: '#FFD000', eye: '#70E000',
                 suggest: 'Spike', blurb: 'Colorful back plates that wiggle when happy!' },
  brachio:     { label: 'Brachiosaurus', body: '#9B5DE5', dark: '#7209B7', chest: '#F15BB5', eye: '#00F5D4',
                 suggest: 'Noodly', blurb: 'Super tall neck for picking high-up snacks.' },
  ptero:       { label: 'Pterodactyl', body: '#F72585', dark: '#B5179E', chest: '#FF9E00', eye: '#4CC9F0',
                 suggest: 'Wings', blurb: 'Flaps little wings and glides across the park!' },
  ankylosaur:  { label: 'Ankylosaurus', body: '#00B4D8', dark: '#0077B6', chest: '#ADE8F4', eye: '#FFD166',
                 suggest: 'Bumper', blurb: 'Armor-backed cutie with a soft tail club.' },
  velo:        { label: 'Velociraptor', body: '#FF5733', dark: '#C70039', chest: '#FFBD59', eye: '#00F5D4',
                 suggest: 'Speedy', blurb: 'Super fast runner! Wins every speed round.' },
  spino:       { label: 'Spinosaurus', body: '#72EFDD', dark: '#560BAD', chest: '#E0AAFF', eye: '#FF9E00',
                 suggest: 'Finny', blurb: 'Has a beautiful rainbow sail along its back.' },
};

const STARTER_DINOS = ['trex', 'triceratops', 'stego'];
const ADOPT_DINO_ORDER = ['triceratops', 'stego', 'brachio', 'ptero', 'ankylosaur', 'velo', 'spino', 'trex'];

/** Draws a cute sitting dinosaur as an inline SVG string. */
function dinoSVG(breedKey, mood = 'happy', costumeKey = null) {
  const b = DINO_BREEDS[breedKey] || DINO_BREEDS.trex;
  const brow = '#2B2233';
  const delay = (Math.random() * 4).toFixed(2);

  // Extra features per dino breed
  let backExtra = '';
  let headExtra = '';

  if (breedKey === 'triceratops') {
    headExtra = `<path d="M50 70 Q100 20 150 70" stroke="${b.dark}" stroke-width="12" fill="${b.dark}" stroke-linecap="round"/>
      <polygon points="65,48 55,25 75,38" fill="#FFF8E7" stroke="${b.dark}" stroke-width="2"/>
      <polygon points="135,48 145,25 125,38" fill="#FFF8E7" stroke="${b.dark}" stroke-width="2"/>
      <polygon points="100,75 100,55 106,75" fill="#FFF8E7"/>`;
  } else if (breedKey === 'stego') {
    backExtra = `<g fill="${b.dark}">
      <polygon points="70,120 60,95 85,110"/>
      <polygon points="100,115 90,85 115,105"/>
      <polygon points="130,120 120,95 142,112"/>
    </g>`;
  } else if (breedKey === 'spino') {
    backExtra = `<path d="M70 145 Q100 70 135 145 Z" fill="${b.dark}" stroke="${b.dark}" stroke-width="3"/>`;
  } else if (breedKey === 'brachio') {
    headExtra = `<path d="M90 48 Q100 35 110 48 Z" fill="${b.dark}"/>`;
  }

  // Eyes
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
  }

  // Mouth & Blush
  let mouth;
  if (mood === 'ecstatic') {
    mouth = `<path d="M91 110 Q100 127 109 110 Z" fill="#E8607A" stroke="${brow}" stroke-width="2.5" stroke-linejoin="round"/>`;
  } else if (mood === 'sad') {
    mouth = `<path d="M92 119 Q100 111 108 119" stroke="${brow}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else {
    mouth = `<path d="M92 110 Q100 118 108 110" stroke="${brow}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  const blush = mood === 'sad' ? '' :
    `<circle cx="67" cy="106" r="7.5" fill="#FF8FA3" opacity=".45"/><circle cx="133" cy="106" r="7.5" fill="#FF8FA3" opacity=".45"/>`;

  // Costume overlay
  const costumeHTML = costumeKey ? renderCostumeSVG(costumeKey) : '';

  return `<svg class="cat-svg dino-svg mood-${mood}" viewBox="0 0 200 212" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="100" cy="203" rx="58" ry="7" fill="rgba(75,58,87,.13)"/>
    ${backExtra}
    <!-- Dino Tail -->
    <path class="cat-tail" style="animation-delay:-${delay}s" d="M136 174 Q182 180 185 140 Q180 120 170 128" stroke="${b.dark}" stroke-width="16" stroke-linecap="round" fill="none"/>
    <!-- Body -->
    <ellipse cx="100" cy="155" rx="48" ry="44" fill="${b.body}"/>
    <ellipse cx="100" cy="166" rx="25" ry="28" fill="${b.chest}"/>
    <!-- Feet -->
    <ellipse cx="78" cy="194" rx="14" ry="9" fill="${b.dark}"/>
    <ellipse cx="122" cy="194" rx="14" ry="9" fill="${b.dark}"/>
    <!-- Tiny Dino Arms -->
    <path d="M70 148 Q60 152 65 160" stroke="${b.dark}" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M130 148 Q140 152 135 160" stroke="${b.dark}" stroke-width="6" stroke-linecap="round" fill="none"/>
    <!-- Head -->
    <g class="cat-head" style="animation-delay:-${delay}s">
      ${headExtra}
      <ellipse cx="100" cy="90" rx="48" ry="42" fill="${b.body}"/>
      ${eyes}${blush}${mouth}
      ${costumeHTML}
    </g>
  </svg>`;
}
