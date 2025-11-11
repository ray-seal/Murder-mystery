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
    crimeScene: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=60",
  };

  const victims = [
    { name: "Evelyn Hart", age: 42, gender: "Female", ethnicity: "Caucasian", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=60" },
    { name: "Marcus Bell", age: 36, gender: "Male", ethnicity: "Caucasian", img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=60" },
    { name: "Lydia Park", age: 27, gender: "Female", ethnicity: "Asian", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=60" }
  ];

  const suspects = [
    { name: "Henry Cross", role: "Neighbor", gender: "Male", ethnicity: "Caucasian", img: "https://images.unsplash.com/photo-1545996124-6b0b8d0be3ad?auto=format&fit=crop&w=400&q=60" },
    { name: "Sofia Miles", role: "Colleague", gender: "Female", ethnicity: "Hispanic", img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=60" },
    { name: "Rachel Foster", role: "Ex-partner", gender: "Female", ethnicity: "Caucasian", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=60" },
    { name: "Clara Voss", role: "Landlord", gender: "Female", ethnicity: "Asian", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=60" },
    { name: "Logan Price", role: "Business Partner", gender: "Male", ethnicity: "African American", img: "https://images.unsplash.com/photo-1543862473-c07d38a6f0f9?auto=format&fit=crop&w=400&q=60" }
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
  let completedTasks = [];
  let actionLog = [];

  function generateCase(){
    const victim = pickRandom(victims);
    const place = pickRandom(locations);
    const weapon = pickRandom(weapons);
    const motive = pickRandom(motives);

    const suspectPool = shuffle(suspects).slice(0,4);
    const killerIndex = Math.floor(Math.random() * suspectPool.length);
    suspectPool.forEach(s => delete s.isKiller);
    suspectPool[killerIndex].isKiller = true;

    const killer = suspectPool[killerIndex];
    const decoySuspects = suspectPool.filter((s,i)=>i!==killerIndex);

    // Generate all clues (hidden initially, revealed by tasks)
    const allClues = [];
    
    // Initial visible clues (no task required)
    allClues.push({ 
      text: `Victim found in ${place.toLowerCase()}.`, 
      pointsTo: null, 
      truth: false, 
      sourceTask: null, 
      visible: true 
    });

    // Dust for prints clues
    allClues.push({ 
      text: `Partial fingerprint (ID: FP-${Math.floor(Math.random()*9000+1000)}) found on ${weapon.toLowerCase()}.`, 
      pointsTo: killer.name, 
      truth: true, 
      sourceTask: 'dust',
      visible: false 
    });

    // Shoe imprint database clues
    allClues.push({ 
      text: `Shoe imprint matches size ${8 + Math.floor(Math.random()*5)}, commonly worn by ${killer.name}.`, 
      pointsTo: killer.name, 
      truth: true, 
      sourceTask: 'shoeDB',
      visible: false 
    });

    // Interview clues
    allClues.push({ 
      text: `${killer.name} claims to have been elsewhere during the incident, but cannot provide witnesses.`, 
      pointsTo: killer.name, 
      truth: true, 
      sourceTask: 'interview',
      visible: false 
    });
    allClues.push({ 
      text: `${decoySuspects[0].name} was at a public event with multiple witnesses at the time.`, 
      pointsTo: decoySuspects[0].name, 
      truth: false, 
      sourceTask: 'interview',
      visible: false 
    });

    // Fiber analysis clues
    allClues.push({ 
      text: `Fabric fibers found at scene match clothing owned by ${killer.name}.`, 
      pointsTo: killer.name, 
      truth: true, 
      sourceTask: 'fibers',
      visible: false 
    });
    allClues.push({ 
      text: `Generic cotton fibers found - inconclusive.`, 
      pointsTo: null, 
      truth: false, 
      sourceTask: 'fibers',
      visible: false 
    });

    // Blood analysis clues
    allClues.push({ 
      text: `Blood type matches victim. No other blood found at scene.`, 
      pointsTo: null, 
      truth: false, 
      sourceTask: 'blood',
      visible: false 
    });

    // Decoy clues
    allClues.push({ 
      text: `${decoySuspects[1].name} had a financial dispute with the victim last month.`, 
      pointsTo: decoySuspects[1].name, 
      truth: false, 
      sourceTask: 'interview',
      visible: false 
    });
    allClues.push({ 
      text: `Security camera shows a shadowy figure near the ${place.toLowerCase()}.`, 
      pointsTo: null, 
      truth: false, 
      sourceTask: 'dust',
      visible: false 
    });

    // Define investigation tasks
    const tasks = [
      {
        id: 'dust',
        label: 'Dust for Fingerprints',
        duration: 2000,
        completed: false,
        dependencies: [],
        description: 'Analyze surfaces for fingerprints'
      },
      {
        id: 'shoeDB',
        label: 'Check Shoe Imprint Database',
        duration: 2500,
        completed: false,
        dependencies: [],
        description: 'Search database for matching shoe prints'
      },
      {
        id: 'interview',
        label: 'Interview Witnesses',
        duration: 3000,
        completed: false,
        dependencies: [],
        description: 'Question suspects and witnesses'
      },
      {
        id: 'fibers',
        label: 'Analyze Fabric Fibers',
        duration: 2500,
        completed: false,
        dependencies: [],
        description: 'Examine fiber evidence from scene'
      },
      {
        id: 'blood',
        label: 'Run Blood Analysis',
        duration: 3500,
        completed: false,
        dependencies: [],
        description: 'Test blood samples from scene'
      }
    ];

    completedTasks = [];
    actionLog = [];

    currentCase = {
      victim,
      place,
      weapon,
      motive,
      suspects: suspectPool,
      killerIndex,
      clues: allClues,
      tasks: tasks
    };

    return currentCase;
  }

  function renderCase(c){
    heroPhoto.src = images.crimeScene;

    victimNameEl.textContent = c.victim.name;
    victimImgEl.src = c.victim.img;
    victimAgeEl.textContent = `Age: ${c.victim.age} | ${c.victim.gender}, ${c.victim.ethnicity}`;
    locationEl.textContent = `Location: ${c.place}`;
    weaponEl.textContent = `Suspected weapon: ${c.weapon}`;
    motiveEl.textContent = `Possible motive: ${c.motive}`;

    renderClues();
    renderTasks();
    renderActionLog();

    suspectsEl.innerHTML = '';
    c.suspects.forEach((s, idx) => {
      const card = document.createElement('div');
      card.className = 'suspect';
      card.dataset.index = idx;

      card.innerHTML = `
        <img src="${s.img}" alt="${s.name}" />
        <h4>${s.name}</h4>
        <p>${s.role}</p>
        <div class="suspect-meta">${s.gender}, ${s.ethnicity}</div>
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

  function renderClues(){
    if(!currentCase) return;
    cluesListEl.innerHTML = '';
    const visibleClues = currentCase.clues.filter(c => c.visible);
    visibleClues.forEach((clue, idx) => {
      const li = document.createElement('li');
      li.className = 'clue';
      li.textContent = clue.text;
      cluesListEl.appendChild(li);
    });
  }

  function renderTasks(){
    if(!currentCase) return;
    const tasksPanel = document.getElementById('tasks-panel');
    if(!tasksPanel) return;

    tasksPanel.innerHTML = '';
    currentCase.tasks.forEach(task => {
      const btn = document.createElement('button');
      btn.className = 'task-btn';
      btn.type = 'button';
      btn.dataset.taskId = task.id;
      
      const canRun = task.dependencies.every(dep => completedTasks.includes(dep));
      
      if(task.completed){
        btn.classList.add('completed');
        btn.disabled = true;
        btn.innerHTML = `${task.label} ✓`;
      } else if(!canRun){
        btn.disabled = true;
        btn.innerHTML = `${task.label} <span class="task-duration">(locked)</span>`;
      } else {
        btn.innerHTML = `${task.label} <span class="task-duration">(${task.duration/1000}s)</span>`;
        btn.addEventListener('click', () => runTask(task.id));
      }
      
      tasksPanel.appendChild(btn);
    });
  }

  function renderActionLog(){
    const logEl = document.getElementById('action-log');
    if(!logEl) return;

    logEl.innerHTML = '';
    if(actionLog.length === 0){
      logEl.innerHTML = '<div class="log-entry" style="opacity:0.6;">No actions taken yet.</div>';
      return;
    }

    actionLog.forEach(entry => {
      const div = document.createElement('div');
      div.className = entry.isClue ? 'log-entry clue-reveal' : 'log-entry';
      div.innerHTML = `<span class="log-entry-time">${entry.time}</span>${entry.text}`;
      logEl.appendChild(div);
    });

    // Scroll to bottom
    logEl.scrollTop = logEl.scrollHeight;
  }

  function addLogEntry(text, isClue = false){
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    actionLog.push({ time: timeStr, text, isClue });
    renderActionLog();
  }

  function runTask(taskId){
    if(!currentCase) return;
    
    const task = currentCase.tasks.find(t => t.id === taskId);
    if(!task || task.completed) return;

    // Disable task button during execution
    const btn = document.querySelector(`[data-task-id="${taskId}"]`);
    if(btn){
      btn.disabled = true;
      btn.innerHTML = `${task.label} <span class="task-duration">(Running...)</span>`;
    }

    addLogEntry(`Started: ${task.label}`);

    // Simulate task duration
    setTimeout(() => {
      task.completed = true;
      completedTasks.push(taskId);

      // Reveal clues associated with this task
      const taskClues = currentCase.clues.filter(c => c.sourceTask === taskId && !c.visible);
      taskClues.forEach(clue => {
        clue.visible = true;
        addLogEntry(`Evidence found: ${clue.text}`, true);
      });

      addLogEntry(`Completed: ${task.label}`);
      
      renderClues();
      renderTasks();
    }, task.duration);
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

    // Check if enough investigation has been done
    const minTasksRequired = 2;
    if(completedTasks.length < minTasksRequired){
      const remaining = minTasksRequired - completedTasks.length;
      showResult(
        `Insufficient Evidence`, 
        `You need to complete at least ${minTasksRequired} investigation tasks before making an accusation. Complete ${remaining} more task(s) to gather more evidence.`
      );
      return;
    }

    addLogEntry(`Accusation made: ${suspect.name}`);

    if(isKiller){
      showResult(`You solved it.`, `Correct — ${suspect.name} was the killer. The weapon was ${currentCase.weapon} and the motive was ${currentCase.motive}. You completed ${completedTasks.length} investigation tasks.`);
    } else {
      const real = currentCase.suspects[currentCase.killerIndex];
      showResult(`Case Unsolved`, `Your accusation was wrong. ${suspect.name} was not the killer. The real killer was ${real.name}. The weapon was ${currentCase.weapon}. Review the evidence more carefully.`);
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
