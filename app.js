// Dynamic-modal murder-mystery app + stronger PWA handling
// This version does NOT include a static modal in index.html — modal is created only when needed.

(() => {
  'use strict';

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

  let resultModal = null; // will be created on demand
  let resultTitle = null;
  let resultText = null;
  let closeResult = null;

  const images = {
    crimeScene: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1600&q=80",
  };

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

    const suspectPool = shuffle(suspects).slice(0,4);
    const killerIndex = Math.floor(Math.random() * suspectPool.length);
    suspectPool.forEach(s => delete s.isKiller);
    suspectPool[killerIndex].isKiller = true;

    const clues = [];
    clues.push({ text: `Traces of ${weapon.toLowerCase()} material found near the body.`, pointsTo: suspectPool[killerIndex].name, truth:true });
    clues.push({ text: `A receipt found linking ${suspectPool[killerIndex].name} to the location earlier that day.`, pointsTo: suspectPool[killerIndex].name, truth:true });

    const decoySuspects = suspectPool.filter((s,i)=>i!==killerIndex);
    clues.push({ text: `${decoySuspects[0].name} had a loud argument with the victim last week.`, pointsTo: decoySuspects[0].name, truth:false });
    clues.push({ text: `Security camera shows a shadowy figure near the ${place.toLowerCase()}.`, pointsTo: null, truth:false });
    clues.push({ text: `A smear of unknown lipstick on a glass found at the scene.`, pointsTo: null, truth:false });

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
    heroPhoto.src = images.crimeScene;

    victimNameEl.textContent = c.victim.name;
    victimImgEl.src = c.victim.img;
    victimAgeEl.textContent = `Age: ${c.victim.age}`;
    locationEl.textContent = `Location: ${c.place}`;
    weaponEl.textContent = `Suspected weapon: ${c.weapon}`;
    motiveEl.textContent = `Possible motive: ${c.motive}`;

    cluesListEl.innerHTML = '';
    c.clues.forEach((clue, idx) => {
      const li = document.createElement('li');
      li.className = 'clue';
      li.textContent = clue.text;
      cluesListEl.appendChild(li);
    });

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
      showResult(`You solved it.`, `Correct — ${suspect.name} was the killer. The weapon was ${currentCase.weapon} and the motive was ${currentCase.motive}.`);
    } else {
      const real = currentCase.suspects[currentCase.killerIndex];
      showResult(`Case Unsolved`, `Your accusation was wrong. ${suspect.name} was not the killer. The real killer was ${real.name}. The weapon was ${currentCase.weapon}.`);
    }
  }

  // Dynamically create the result modal only when needed. This avoids any static modal showing up before JS runs,
  // and ensures close handlers are attached reliably.
  function createResultModal(){
    if(resultModal) return resultModal;

    // container
    const overlay = document.createElement('div');
    overlay.id = 'result-modal';
    overlay.className = 'modal hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.setAttribute('role','document');

    const h2 = document.createElement('h2');
    h2.id = 'result-title';
    const p = document.createElement('p');
    p.id = 'result-text';

    // close button
    const btn = document.createElement('button');
    btn.id = 'close-result';
    btn.type = 'button';
    btn.className = 'small-btn';
    btn.setAttribute('aria-label','Close result dialog');
    btn.textContent = 'Close';

    // force reload link as a fallback if something is seriously wrong
    const reload = document.createElement('a');
    reload.href = '.';
    reload.className = 'small-btn';
    reload.style.marginLeft = '8px';
    reload.textContent = 'Reload app';

    // append
    content.appendChild(h2);
    content.appendChild(p);
    const controls = document.createElement('div');
    controls.style.marginTop = '12px';
    controls.appendChild(btn);
    controls.appendChild(reload);
    content.appendChild(controls);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // store refs
    resultModal = overlay;
    resultTitle = h2;
    resultText = p;
    closeResult = btn;

    // handlers
    function doClose(){
      try{
        resultModal.classList.add('hidden');
        resultModal.setAttribute('aria-hidden','true');
        // remove from DOM after hiding to avoid stale overlays in some PWA contexts
        setTimeout(()=>{
          if(resultModal && resultModal.parentNode) resultModal.parentNode.removeChild(resultModal);
          resultModal = null; resultTitle = null; resultText = null; closeResult = null;
        }, 220);
      }catch(e){
        // last resort: navigate away which effectively closes overlay
        window.location.href = '.';
      }
    }

    closeResult.addEventListener('click', (e)=>{ e.preventDefault(); doClose(); });
    closeResult.addEventListener('touchend', (e)=>{ e.preventDefault(); doClose(); }, {passive:false});

    overlay.addEventListener('click', (e)=>{ if(e.target === overlay) doClose(); });

    // ESC key should also close
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') doClose(); });

    return overlay;
  }

  function showResult(title, text){
    try{
      const modal = createResultModal();
      if(!modal) return;
      // set content
      const t = modal.querySelector('#result-title');
      const b = modal.querySelector('#result-text');
      if(t) t.textContent = title;
      if(b) b.textContent = text;

      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden','false');

      // ensure visible CSS display
      modal.style.display = 'flex';

    }catch(err){
      // Very last-resort fallback: alert then reload
      try{ alert(title + '\n\n' + text); }catch(e){}
      // make sure app isn't blocked
      setTimeout(()=>{ window.location.href = '.'; }, 600);
    }
  }

  // PWA: register service worker (safe, wrapped in try/catch)
  function registerServiceWorker(){
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('SW registered', reg);
      }).catch(err => {
        console.warn('SW registration failed', err);
      });
    }
  }

  function attachUI(){
    if(startBtn) startBtn.addEventListener('click', () => {
      const c = generateCase();
      renderCase(c);
      if(startScreen){ startScreen.classList.add('hidden'); startScreen.setAttribute('aria-hidden','true'); }
      if(gameScreen){ gameScreen.classList.remove('hidden'); gameScreen.setAttribute('aria-hidden','false'); }
    });

    if(newCaseBtn) newCaseBtn.addEventListener('click', () => {
      const c = generateCase();
      renderCase(c);
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    try{
      attachUI();
      registerServiceWorker();
      // ensure no modal exists from older cached HTML
      const existing = document.getElementById('result-modal');
      if(existing) existing.parentNode.removeChild(existing);
    }catch(e){
      console.error('App init error', e);
    }
  });

})();