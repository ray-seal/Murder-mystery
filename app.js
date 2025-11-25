// Home screen only — prebuilt cases removed.
// To add custom cases, load from case.json (see template in repo).

(() => {
  'use strict';

  // LocalStorage key for persisting case state
  const STORAGE_KEY = 'casefiles_state';
  
  // App state
  let appState = {
    cases: [],
    solvedCount: 0,
    lastOpenedCaseId: null,
    currentTab: 'open'
  };
  
  let currentCase = null;

  // PWA: service worker (register if available)
  function registerServiceWorker(){
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        // registration OK
      }).catch(() => { /* ignore SW errors */ });
    }
  }
  
  // Load state from localStorage
  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        appState = { ...appState, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
  }
  
  // Save state to localStorage
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cases: appState.cases,
        solvedCount: appState.solvedCount,
        lastOpenedCaseId: appState.lastOpenedCaseId,
        currentTab: appState.currentTab
      }));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }
  
  // Save game progress for current case
  function saveGameProgress() {
    if (!currentCase) return;
    
    const caseId = currentCase.id || currentCase.case_id;
    const progress = {
      caseId: caseId,
      selectedSuspect: document.getElementById('suspect-select').value,
      playerNotes: document.getElementById('player-notes').value,
      timestamp: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(`casefiles_progress_${caseId}`, JSON.stringify(progress));
      showToast('Game saved!');
    } catch (e) {
      console.warn('Failed to save game progress:', e);
    }
  }
  
  // Load game progress for a case
  function loadGameProgress(caseId) {
    try {
      const stored = localStorage.getItem(`casefiles_progress_${caseId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load game progress:', e);
    }
    return null;
  }
  
  // Show a temporary toast message
  function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:12px 24px;border-radius:6px;z-index:1000;opacity:0;transition:opacity 0.3s;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  }
  
  // Fetch cases from /cases/*.json or fallback to /case.json
  async function fetchCases() {
    const loadedCases = [];
    
    // Try to fetch from /cases/case-template.json first to see if /cases/ exists
    // Then try to load known case files or fallback to /case.json
    const casePaths = [
      '/case.json',
      '/cases/case-template.json'
    ];
    
    for (const path of casePaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const caseData = await response.json();
          const caseId = caseData.id || caseData.case_id || path;
          
          // Skip template file from active cases
          if (path.includes('case-template.json')) continue;
          
          // Check if case already exists in state
          const existingCase = appState.cases.find(c => 
            (c.id || c.case_id) === caseId
          );
          
          if (!existingCase) {
            loadedCases.push({
              ...caseData,
              id: caseId,
              status: caseData.status || 'open',
              filePath: path
            });
          }
        }
      } catch (e) {
        // Ignore fetch errors for missing files
      }
    }
    
    return loadedCases;
  }
  
  // Merge fetched cases with stored state
  function mergeCases(fetchedCases) {
    // Add new cases that aren't already in state
    for (const fetchedCase of fetchedCases) {
      const caseId = fetchedCase.id || fetchedCase.case_id;
      const existingIndex = appState.cases.findIndex(c => 
        (c.id || c.case_id) === caseId
      );
      
      if (existingIndex === -1) {
        appState.cases.push(fetchedCase);
      } else {
        // Preserve status from stored state
        const storedStatus = appState.cases[existingIndex].status;
        appState.cases[existingIndex] = { 
          ...fetchedCase, 
          status: storedStatus 
        };
      }
    }
    
    // Recalculate solved count
    appState.solvedCount = appState.cases.filter(c => c.status === 'closed').length;
    saveState();
  }
  
  // Update the solved counter display
  function updateSolvedCounter() {
    const counter = document.getElementById('solved-counter');
    if (counter) {
      counter.textContent = `Solved: ${appState.solvedCount}`;
    }
  }
  
  // Update tab badges
  function updateTabBadges() {
    const openCount = appState.cases.filter(c => c.status !== 'closed').length;
    const closedCount = appState.cases.filter(c => c.status === 'closed').length;
    
    document.getElementById('open-count').textContent = openCount;
    document.getElementById('closed-count').textContent = closedCount;
  }
  
  // Render cases list based on current tab
  function renderCasesList() {
    const listEl = document.getElementById('cases-list');
    const filteredCases = appState.cases.filter(c => {
      if (appState.currentTab === 'open') {
        return c.status !== 'closed';
      } else {
        return c.status === 'closed';
      }
    });
    
    if (filteredCases.length === 0) {
      const tabName = appState.currentTab === 'open' ? 'open' : 'closed';
      if (appState.cases.length === 0) {
        listEl.innerHTML = `
          <p class="no-cases-msg">
            No cases found. Add a case.json file to the root or 
            <a href="/cases/case-template.json" target="_blank">download the case template</a> 
            and add it to the /cases/ folder.
          </p>
        `;
      } else {
        listEl.innerHTML = `<p class="no-cases-msg">No ${tabName} cases.</p>`;
      }
      return;
    }
    
    listEl.innerHTML = filteredCases.map(c => {
      const caseId = c.id || c.case_id;
      const hasSavedProgress = !!loadGameProgress(caseId);
      const savedClass = hasSavedProgress ? 'saved' : '';
      return `
        <div class="case-item ${savedClass}" data-case-id="${caseId}">
          <span class="case-title">${c.title || 'Untitled Case'}</span>
          <span class="case-status">${c.status === 'closed' ? '✓ Solved' : 'Open'}</span>
        </div>
      `;
    }).join('');
    
    // Add click handlers
    listEl.querySelectorAll('.case-item').forEach(item => {
      item.addEventListener('click', () => {
        const caseId = item.dataset.caseId;
        openCase(caseId);
      });
    });
  }
  
  // Open a case and show game screen
  function openCase(caseId) {
    const caseData = appState.cases.find(c => 
      (c.id || c.case_id) === caseId
    );
    
    if (!caseData) return;
    
    currentCase = caseData;
    appState.lastOpenedCaseId = caseId;
    saveState();
    
    // Hide start screen, show game screen
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    // Populate case panel
    document.getElementById('case-title').textContent = caseData.title || 'Untitled Case';
    document.getElementById('case-summary').textContent = caseData.summary || '';
    
    // Victim info
    const victimEl = document.getElementById('victim-info');
    if (caseData.victim) {
      victimEl.innerHTML = `
        <h4>Victim</h4>
        <p><strong>${caseData.victim.name || 'Unknown'}</strong></p>
        <p>Age: ${caseData.victim.age || 'Unknown'} | Occupation: ${caseData.victim.occupation || 'Unknown'}</p>
        <p>Last seen: ${caseData.victim.last_known_location || 'Unknown'}</p>
      `;
    } else {
      victimEl.innerHTML = '';
    }
    
    // Timeline
    const timelineEl = document.getElementById('timeline-section');
    if (caseData.timeline && caseData.timeline.length > 0) {
      timelineEl.innerHTML = `
        <h4>Timeline</h4>
        <ul>
          ${caseData.timeline.map(t => `<li><strong>${t.time}</strong>: ${t.event}</li>`).join('')}
        </ul>
      `;
    } else {
      timelineEl.innerHTML = '';
    }
    
    // Clues
    const cluesEl = document.getElementById('clues-section');
    const clues = caseData.initial_clues || caseData.clues || [];
    if (clues.length > 0) {
      cluesEl.innerHTML = `
        <h4>Initial Clues</h4>
        <ul>
          ${clues.map(c => `<li>${typeof c === 'string' ? c : c.description || c}</li>`).join('')}
        </ul>
      `;
    } else {
      cluesEl.innerHTML = '';
    }
    
    // Suspects
    const suspectsListEl = document.getElementById('suspects-list');
    const suspectSelect = document.getElementById('suspect-select');
    const suspects = caseData.suspects || [];
    
    suspectsListEl.innerHTML = suspects.map(s => `
      <div class="suspect-card">
        <h4>${s.name || 'Unknown'}</h4>
        <p><strong>Relationship:</strong> ${s.relationship_to_victim || 'Unknown'}</p>
        <p>${s.notes || ''}</p>
        <p class="alibi"><strong>Alibi:</strong> ${s.alibi || 'None provided'}</p>
      </div>
    `).join('');
    
    // Populate suspect dropdown
    suspectSelect.innerHTML = '<option value="">Select a suspect...</option>' +
      suspects.map(s => `<option value="${s.id || s.name}">${s.name}</option>`).join('');
    
    // Load saved progress if exists
    const savedProgress = loadGameProgress(caseId);
    if (savedProgress) {
      document.getElementById('player-notes').value = savedProgress.playerNotes || '';
      if (savedProgress.selectedSuspect) {
        suspectSelect.value = savedProgress.selectedSuspect;
      }
    } else {
      document.getElementById('player-notes').value = '';
      suspectSelect.value = '';
    }
    
    // Show/hide close case button based on status
    const closeCaseBtn = document.getElementById('close-case-btn');
    if (caseData.status === 'closed') {
      closeCaseBtn.style.display = 'none';
    } else {
      closeCaseBtn.style.display = 'block';
    }
  }
  
  // Go back to cases list
  function goBackToCases() {
    // Auto-save before leaving
    if (currentCase) {
      saveGameProgress();
    }
    
    currentCase = null;
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    renderCasesList();
  }
  
  // Mark current case as solved/closed
  function markCaseAsSolved() {
    if (!currentCase) return;
    
    const caseId = currentCase.id || currentCase.case_id;
    const caseIndex = appState.cases.findIndex(c => 
      (c.id || c.case_id) === caseId
    );
    
    if (caseIndex !== -1 && appState.cases[caseIndex].status !== 'closed') {
      appState.cases[caseIndex].status = 'closed';
      appState.solvedCount++;
      saveState();
      updateSolvedCounter();
      updateTabBadges();
      
      // Save final progress
      saveGameProgress();
      
      showToast('Case marked as solved!');
      
      // Go back to cases list
      goBackToCases();
    }
  }
  
  // Switch tabs
  function switchTab(tab) {
    appState.currentTab = tab;
    saveState();
    
    // Update active tab styling
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    renderCasesList();
  }

  // Attach UI handlers after DOM ready
  document.addEventListener('DOMContentLoaded', async () => {
    registerServiceWorker();
    
    // Load persisted state
    loadState();
    updateSolvedCounter();
    
    // Fetch and merge cases
    const fetchedCases = await fetchCases();
    mergeCases(fetchedCases);
    
    // Update UI
    updateTabBadges();
    renderCasesList();
    
    // Restore active tab
    switchTab(appState.currentTab);
    
    // Tab button handlers
    document.getElementById('tab-open').addEventListener('click', () => switchTab('open'));
    document.getElementById('tab-closed').addEventListener('click', () => switchTab('closed'));
    
    // Game screen handlers
    document.getElementById('back-btn').addEventListener('click', goBackToCases);
    document.getElementById('save-btn').addEventListener('click', saveGameProgress);
    document.getElementById('close-case-btn').addEventListener('click', markCaseAsSolved);
    
    // Auto-save on notes change (debounced)
    let saveTimeout;
    document.getElementById('player-notes').addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveGameProgress, 2000);
    });
    
    // Auto-save on suspect selection
    document.getElementById('suspect-select').addEventListener('change', saveGameProgress);
  });

})();