/* ===========================================================
   Shop items: care consumables & interactive cafe decor
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
  plant:    { name: 'Potted Plant',   emoji: '🪴', price: 25,  desc: 'A giant leafy plant for cats to sniff!', spot: { x: 10, y: 12 }, action: 'sniff', sound: 'purr' },
  balloons: { name: 'Party Balloons', emoji: '🎈', price: 35,  desc: 'Bouncy balloons cats love to bat at!', spot: { x: 88, y: 35 }, action: 'bat', sound: 'pop' },
  rug:      { name: 'Rainbow Rug',    emoji: '🌈', price: 40,  desc: 'A big soft rug for cat naps', spot: { x: 50, y: 16 }, action: 'nap', sound: 'purr' },
  painting: { name: 'Fish Painting',  emoji: '🖼️', price: 45,  desc: 'Wall art kitties love to stare at', spot: { x: 30, y: 45 }, action: 'stare', sound: 'meow' },
  lights:   { name: 'Fairy Lights',   emoji: '✨', price: 50,  desc: 'Twinkly lights that make the café glow', spot: { x: 50, y: 88 }, action: 'glow', sound: 'bloom' },
  lamp:     { name: 'Moon Lamp',      emoji: '🌙', price: 60,  desc: 'A warm glowing moon lamp', spot: { x: 74, y: 44 }, action: 'warm', sound: 'purr' },
  castle:   { name: 'Cat Castle',     emoji: '🏰', price: 80,  desc: 'A giant cat tree & castle to climb!', spot: { x: 84, y: 16 }, action: 'climb', sound: 'meow' },
  tank:     { name: 'Fish Tank',      emoji: '🐠', price: 95,  desc: 'Aquarium where cats watch fish swim!', spot: { x: 22, y: 38 }, action: 'watch', sound: 'pop' },
  piano:    { name: 'Tiny Piano',     emoji: '🎹', price: 120, desc: 'Cats walk over and play musical notes!', spot: { x: 36, y: 14 }, action: 'play', sound: 'pianoKey' },
};

const COSTUMES = {
  c_dino:    { id: 'dino',    name: 'Dino Suit',      emoji: '🦖', price: 35, desc: 'A green dinosaur hoodie with back spikes!' },
  c_dog:     { id: 'dog',     name: 'Dog Hoodie',     emoji: '🐶', price: 35, desc: 'A fluffy puppy hoodie with floppy brown ears!' },
  c_cow:     { id: 'cow',     name: 'Cow Onesie',     emoji: '🐮', price: 35, desc: 'A spotted cow onesie with tiny horns!' },
  c_chicken: { id: 'chicken', name: 'Chicken Outfit', emoji: '🐔', price: 35, desc: 'A yellow feather suit with a red comb!' },
  c_crown:   { id: 'crown',   name: 'Royal Crown',    emoji: '👑', price: 50, desc: 'A glittering gold crown for your fancy pet!' },
  c_wizard:  { id: 'wizard',  name: 'Wizard Hat',     emoji: '🧙', price: 50, desc: 'A starry purple wizard hat full of magic!' },
};

const SHOP_TABS = [
  { id: 'food', label: 'Food', emoji: '🍗' },
  { id: 'toys', label: 'Toys', emoji: '🧶' },
  { id: 'cozy', label: 'Cozy', emoji: '🛏️' },
  { id: 'special', label: 'Treats', emoji: '🌿' },
  { id: 'costumes', label: 'Costumes', emoji: '👗' },
  { id: 'decor', label: 'Decor', emoji: '🪴' },
];
