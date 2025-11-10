// Simple murder-mystery case generator and UI
// Images are from Unsplash (free to use under Unsplash license). See README for full attributions.

const startBtn = document.getElementById('start-btn');
const newCaseBtn = document.getElementById('new-case');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const heroPhoto = document.getElementById('hero-photo');

const victimNameEl = document.getElementById('victim-name');
const victimImgEl = document.getElementById('victim-img');
const victimAgeEl = document.getElementById('victim-age');
const locationEl = document.getElementById('location');
const weaponEl = document.getElementById('weapon');
const motiveEl = document.getElementById('motive');
const cluesListEl = document.getElementById('clues-list');
const suspectsEl = document.getElementById('suspects');

const resultModal = document.getElementById('result-modal');
const resultTitle = document.getElementById('result-title');
const resultText = document.getElementById('result-text');
const closeResult = document.getElementById('close-result');

const images = {
  crimeScene: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1600&q=80",
};

// Some sample victims and suspects (Unsplash photos)
const victims = [
  { name: "Evelyn Hart", age: 42, img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80" },
  { name: "Marcus Bell", age: 36, img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=800&q=80" },
  { name: "Lydia Park", age: 27, img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80" }
];

const suspects = [
  { name: "Henry Cross", role: "Neighbor", img: "https://images.unsplash.com/photo-1545996124-6b0b8d0be3ad?auto=format&fit=crop&w=800&q=80" },
  { name: "Sofia Miles", role: "Colleague", img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=800&q=80" },
  { name: "Jamal Reed", role: "Ex-partner", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80" },
  { name: "Clara Voss", role: "Landlord", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80" },
  { name: "Logan Price", role: "Business Partner", img: "https://images.unsplash.com/photo-1543862473-c07d38a6f0f9?auto=format&fit=crop&w=800&q=80" }
];

const weapons = ["Letter opener", "Kitchen knife", "Antique candlestick", "Lead pipe", "Poison (bottle)"];
const locations = ["Living room", "Back alley", "Office", "Laundry room", "Rooftop"];
const motives = ["Jealousy", "Money", "Greed", "Revenge", "Self-defense"];

// shuffle helper
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array){
  return array.slice().sort(()=>Math.random()-0.5);
}

let currentCase = null;
let selectedSuspectIndex = null;

function generateCase(){
  const victim = pickRandom(victims);
  const place = pickRandom(locations);
  const weapon = pickRandom(weapons);
  const motive = pickRandom(motives);

  // Choose killer among suspects
  const suspectPool = shuffle(suspects).slice(0,4); // pick 4 suspects
  const killerIndex = Math.floor(Math.random() * suspectPool.length);
  suspectPool[killerIndex].isKiller = true;

  // Generate clues: some true, some decoys
  const clues = [];
  // True clues (2)
  clues.push({ text: `Traces of ${weapon.toLowerCase()} material found near the body.`, pointsTo: suspectPool[killerIndex].name, truth:true });
  clues.push({ text: `A receipt found linking ${suspectPool[killerIndex].name} to the location earlier that day.`, pointsTo: suspectPool[killerIndex].name, truth:true });

  // Decoy clues (3)
  const decoySuspects = suspectPool.filter((s,i)=>i!==killerIndex);
  clues.push({ text: `${decoySuspects[0].name} had a loud argument with the victim last week.`, pointsTo: decoySuspects[0].name, truth:false });
  clues.push({ text: `Security camera shows a shadowy figure near the ${place.toLowerCase()}.`, pointsTo: null, truth:false });
  clues.push({ text: `A smear of unknown lipstick on a glass found at the scene.`, pointsTo: null, truth:false });

  // Randomize order
  const shuffledClues = shuffle(clues);

  currentCase = {
    victim,
    place,
    weapon,
    motive,
    suspects: suspectPool,
    killerIndex,
    clues: shuffledClues
  };

  return currentCase;
}

function renderCase(c){
  // header photo
  heroPhoto.src = images.crimeScene;

  victimNameEl.textContent = c.victim.name;
  victimImgEl.src = c.victim.img;
  victimAgeEl.textContent = `Age: ${c.victim.age}`;
  locationEl.textContent = `Location: ${c.place}`;
  weaponEl.textContent = `Suspected weapon: ${c.weapon}`;
  motiveEl.textContent = `Possible motive: ${c.motive}`;

  // clues
  cluesListEl.innerHTML = '';
  c.clues.forEach((clue, idx) => {
    const li = document.createElement('li');
    li.className = 'clue';
    li.textContent = clue.text;
    cluesListEl.appendChild(li);
  });

  // suspects
  suspectsEl.innerHTML = '';
  c.suspects.forEach((s, idx) => {
    const card = document.createElement('div');
    card.className = 'suspect';
    card.dataset.index = idx;

    card.innerHTML = `
      <img src="${s.img}" alt="${s.name}" />
      <h4>${s.name}</h4>
      <p>${s.role}</p>
    `;

    card.addEventListener('click', () => {
      selectSuspect(idx);
    });

    const accuseBtn = document.createElement('button');
    accuseBtn.textContent = 'Accuse';
    accuseBtn.className = 'small-btn';
    accuseBtn.type = 'button';
    accuseBtn.style.marginTop = '8px';
    accuseBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      accuseSuspect(idx);
    });

    card.appendChild(accuseBtn);
    suspectsEl.appendChild(card);
  });

  // reset selection
  selectedSuspectIndex = null;
  updateSelectionUI();
}

function selectSuspect(i){
  selectedSuspectIndex = i;
  updateSelectionUI();
}

function updateSelectionUI(){
  const cards = suspectsEl.querySelectorAll('.suspect');
  cards.forEach(c => c.classList.remove('selected'));
  if(selectedSuspectIndex !== null){
    const sel = suspectsEl.querySelector(`.suspect[data-index="${selectedSuspectIndex}"]`);
    if(sel) sel.classList.add('selected');
  }
}

function accuseSuspect(i){
  const suspect = currentCase.suspects[i];
  const isKiller = !!suspect.isKiller;

  if(isKiller){
    resultTitle.textContent = "You solved it.";
    resultText.innerHTML = `Correct — ${suspect.name} was the killer. The weapon was ${currentCase.weapon} and the motive was ${currentCase.motive}.`;
  } else {
    // partial reveal: point out the real killer
    const real = currentCase.suspects[currentCase.killerIndex];
    resultTitle.textContent = "Case Unsolved";
    resultText.innerHTML = `Your accusation was wrong. ${suspect.name} was not the killer. The real killer was ${real.name}. The weapon was ${currentCase.weapon}.`;
  }

  showResult();
}

function showResult(){
  resultModal.classList.remove('hidden');
}

function closeModal(){
  resultModal.classList.add('hidden');
}

// Make sure close button is interactive on touch devices
if (closeResult) {
  // ensure it's treated as a button
  try { closeResult.type = 'button'; } catch(e) {}
  // normal click handler
  closeResult.addEventListener('click', closeModal);

  // also handle touchend for iOS so taps reliably close the dialog
  closeResult.addEventListener('touchend', function onTouchEnd(e){
    e.preventDefault(); // prevent double events
    closeModal();
  }, { passive: false });
}

// Clicking the overlay (outside dialog) closes too
resultModal.addEventListener('click', (e)=>{
  if(e.target === resultModal) closeModal();
});

startBtn.addEventListener('click', () => {
  const c = generateCase();
  renderCase(c);
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
});

newCaseBtn.addEventListener('click', () => {
  const c = generateCase();
  renderCase(c);
  window.scrollTo({top:0, behavior:'smooth'});
});
