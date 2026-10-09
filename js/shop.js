/* ===========================================================
   Shop items: consumables (care for cats) and decorations
   =========================================================== */
const ITEMS = {
  kibble:  { tab: 'food', name: 'Crunchy Kibble', emoji: '🥣', price: 5,  stat: 'hunger', amount: 25,  desc: '+25 Tummy' },
  tuna:    { tab: 'food', name: 'Tuna Can',       emoji: '🥫', price: 12, stat: 'hunger', amount: 55,  desc: '+55 Tummy' },
  salmon:  { tab: 'food', name: 'Salmon Feast',   emoji: '🍣', price: 22, stat: 'hunger', amount: 100, desc: 'Fills the tummy!' },
  yarn:    { tab: 'toys', name: 'Yarn Ball',      emoji: '🧶', price: 6,  stat: 'fun',    amount: 25,  desc: '+25 Play' },
  mouse:   { tab: 'toys', name: 'Squeaky Mouse',  emoji: '🐭', price: 12, stat: 'fun',    amount: 55,  desc: '+55 Play' },
  feather: { tab: 'toys', name: 'Feather Wand',   emoji: '🪶', price: 22, stat: 'fun',    amount: 100, desc: 'Maximum fun!' },
  brush:   { tab: 'cozy', name: 'Soft Brush',     emoji: '🪮', price: 6,  stat: 'cozy',   amount: 25,  desc: '+25 Cozy' },
  blanket: { tab: 'cozy', name: 'Fluffy Blanket', emoji: '🧣', price: 12, stat: 'cozy',   amount: 55,  desc: '+55 Cozy' },
  bed:     { tab: 'cozy', name: 'Cloud Bed',      emoji: '🛏️', price: 22, stat: 'cozy',   amount: 100, desc: 'The comfiest nap!' },
  catnip:  { tab: 'special', name: 'Catnip Party', emoji: '🌿', price: 30, stat: 'all', amount: 30, desc: '+30 everything for ALL cats!' },
  cake:    { tab: 'special', name: 'Kitty Cupcake', emoji: '🧁', price: 18, stat: 'every', amount: 35, desc: '+35 Tummy, Play & Cozy for one cat' },
};

const DECOR = {
  plant:    { name: 'Potted Plant',   emoji: '🪴', price: 25,  desc: 'A leafy friend for the corner' },
  balloons: { name: 'Party Balloons', emoji: '🎈', price: 35,  desc: 'Every day is a party!' },
  rug:      { name: 'Rainbow Rug',    emoji: '🌈', price: 40,  desc: 'A soft, colorful rug' },
  painting: { name: 'Fish Painting',  emoji: '🖼️', price: 45,  desc: 'Fancy art for the wall' },
  lights:   { name: 'Fairy Lights',   emoji: '✨', price: 50,  desc: 'Twinkly lights' },
  lamp:     { name: 'Moon Lamp',      emoji: '🌙', price: 60,  desc: 'A glowing moon' },
  castle:   { name: 'Cat Castle',     emoji: '🏰', price: 80,  desc: 'A castle fit for cat royalty' },
  tank:     { name: 'Fish Tank',      emoji: '🐠', price: 95,  desc: 'Cats LOVE watching fish' },
  piano:    { name: 'Tiny Piano',     emoji: '🎹', price: 120, desc: 'For musical kitties' },
};

const SHOP_TABS = [
  { id: 'food', label: 'Food', emoji: '🍗' },
  { id: 'toys', label: 'Toys', emoji: '🧶' },
  { id: 'cozy', label: 'Cozy', emoji: '🛏️' },
  { id: 'special', label: 'Treats', emoji: '🌿' },
  { id: 'decor', label: 'Decor', emoji: '🪴' },
];
