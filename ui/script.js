// =====================================================================
// G-CyberRPcore Ecosystem - Neural Inventory Matrix
// Frontend Client Engine: Drag & Drop, Sound FX, Container Bridge
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('[gcyber-inventory] UI Engine mounted.');

  // DOM Elements
  const appRoot = document.getElementById('inventory-app');
  const btnClose = document.getElementById('btn-close-inv');
  const clockEl = document.getElementById('hud-clock');

  // Player Elements
  const playerNameEl = document.getElementById('player-name');
  const playerIdEl = document.getElementById('player-id');
  const playerWeightTxt = document.getElementById('player-weight-txt');
  const playerWeightFill = document.getElementById('player-weight-fill');
  const playerHotbarGrid = document.getElementById('player-hotbar-grid');
  const playerSlotsGrid = document.getElementById('player-slots-grid');

  // Container Elements
  const containerNameEl = document.getElementById('container-name');
  const containerIdEl = document.getElementById('container-id');
  const containerWeightTxt = document.getElementById('container-weight-txt');
  const containerWeightFill = document.getElementById('container-weight-fill');
  const containerSlotsGrid = document.getElementById('container-slots-grid');
  const containerStandby = document.getElementById('container-standby');

  // Modal Elements
  const itemModal = document.getElementById('item-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalDesc = document.getElementById('modal-desc');
  const modalWeight = document.getElementById('modal-weight');
  const modalCount = document.getElementById('modal-count');
  const modalIcon = document.getElementById('modal-icon');
  const splitWrap = document.getElementById('split-wrap');
  const splitSlider = document.getElementById('split-slider');
  const splitValTxt = document.getElementById('split-val-txt');
  const btnModalUse = document.getElementById('btn-modal-use');
  const btnModalSplit = document.getElementById('btn-modal-split');
  const btnModalDrop = document.getElementById('btn-modal-drop');

  // State
  let playerData = null;
  let containerData = null;
  let itemDefinitions = {};
  let selectedSlotData = null;
  let draggedElementData = null;

  // Real-time Clock
  setInterval(() => {
    const now = new Date();
    clockEl.textContent = now.toTimeString().substring(0, 5);
  }, 1000);

  // Web Audio Synthesizer for Sleek Cyberpunk Sound FX
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playCyberSound(type) {
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === 'click') {
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'drop') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'use') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch (e) {
      // Audio fallback
    }
  }

  // Close Inventory Handler
  function closeInventory() {
    playCyberSound('click');
    appRoot.classList.add('hidden');
    itemModal.classList.add('hidden');
    if (window.mp && mp.events) {
      mp.events.emit('gcyber:inventory:cefCloseWindow');
    }
  }

  btnClose.addEventListener('click', closeInventory);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Tab') {
      if (!appRoot.classList.contains('hidden')) {
        e.preventDefault();
        closeInventory();
      }
    }
  });

  // Render Slots Helper
  function createSlotElement(slotIdx, item, type, isHotbar) {
    const slotEl = document.createElement('div');
    slotEl.className = 'inv-slot' + (isHotbar ? ' hotbar-slot' : '');
    slotEl.dataset.slot = slotIdx;
    slotEl.dataset.type = type;

    // Slot Number Display
    const numEl = document.createElement('span');
    numEl.className = 'slot-num';
    numEl.textContent = isHotbar ? `[${slotIdx + 1}]` : `#${slotIdx + 1}`;
    slotEl.appendChild(numEl);

    if (item && item.id) {
      const def = itemDefinitions[item.id] || {
        label: item.id,
        category: 'misc',
        weight: 0.5,
        icon: '📦'
      };

      slotEl.dataset.itemId = item.id;
      slotEl.draggable = true;

      // Content (Icon & Label)
      const contentEl = document.createElement('div');
      contentEl.className = 'slot-content';

      const iconEl = document.createElement('span');
      iconEl.className = 'slot-icon';
      iconEl.textContent = def.icon || '📦';
      contentEl.appendChild(iconEl);

      const nameEl = document.createElement('span');
      nameEl.className = 'slot-name';
      nameEl.textContent = def.label || item.id;
      contentEl.appendChild(nameEl);

      slotEl.appendChild(contentEl);

      // Bottom info (Weight & Amount)
      const bottomEl = document.createElement('div');
      bottomEl.className = 'slot-bottom';

      const weightEl = document.createElement('span');
      const totalWeight = ((def.weight || 0.5) * (item.amount || 1)).toFixed(1);
      weightEl.textContent = `${totalWeight}kg`;
      bottomEl.appendChild(weightEl);

      if (item.amount && item.amount > 1) {
        const amountEl = document.createElement('span');
        amountEl.className = 'slot-amount';
        amountEl.textContent = `x${item.amount}`;
        bottomEl.appendChild(amountEl);
      }

      slotEl.appendChild(bottomEl);

      // Click to open item action modal
      slotEl.addEventListener('click', () => {
        openItemModal(item, def, slotIdx, type);
      });

      // Drag & Drop Handlers
      slotEl.addEventListener('dragstart', (e) => {
        draggedElementData = {
          fromType: type,
          fromSlot: slotIdx,
          item: item
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(draggedElementData));
        slotEl.style.opacity = '0.5';
        playCyberSound('click');
      });

      slotEl.addEventListener('dragend', () => {
        slotEl.style.opacity = '1';
      });
    }

    // Drop Target Handlers
    slotEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      slotEl.classList.add('drag-over');
    });

    slotEl.addEventListener('dragleave', () => {
      slotEl.classList.remove('drag-over');
    });

    slotEl.addEventListener('drop', (e) => {
      e.preventDefault();
      slotEl.classList.remove('drag-over');
      playCyberSound('drop');

      let dragData = null;
      try {
        dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      } catch (err) {
        dragData = draggedElementData;
      }

      if (dragData) {
        const movePayload = {
          fromType: dragData.fromType,
          fromSlot: dragData.fromSlot,
          toType: type,
          toSlot: slotIdx,
          containerId: containerData ? containerData.id : null,
          amount: null // Full stack move
        };

        if (window.mp && mp.events) {
          mp.events.emit('gcyber:inventory:cefMoveItem', JSON.stringify(movePayload));
        }
      }
    });

    return slotEl;
  }

  // Render Full Inventory UI
  function renderInventory() {
    if (!playerData) return;

    // 1. Render Player Header
    playerNameEl.textContent = playerData.name || 'CITIZEN POCKETS';
    playerIdEl.textContent = `ID: ${playerData.citizenid || 'NC-0000'}`;

    const pWeight = playerData.weight || 0;
    const pMaxWeight = playerData.maxWeight || 120.0;
    playerWeightTxt.textContent = `${pWeight.toFixed(1)} / ${pMaxWeight.toFixed(1)} KG`;
    const pPct = Math.min(100, Math.round((pWeight / pMaxWeight) * 100));
    playerWeightFill.style.width = `${pPct}%`;

    // 2. Render Player Hotbar (Slots 0 to 4)
    playerHotbarGrid.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const item = playerData.items[i];
      const slotEl = createSlotElement(i, item, 'player', true);
      playerHotbarGrid.appendChild(slotEl);
    }

    // 3. Render Player Main Slots (Slots 5 to maxSlots - 1)
    playerSlotsGrid.innerHTML = '';
    const maxSlots = playerData.maxSlots || 35;
    for (let i = 5; i < maxSlots; i++) {
      const item = playerData.items[i];
      const slotEl = createSlotElement(i, item, 'player', false);
      playerSlotsGrid.appendChild(slotEl);
    }

    // 4. Render Container (if available)
    if (containerData && containerData.items) {
      containerStandby.classList.add('hidden');
      containerNameEl.textContent = containerData.label || 'LOCAL STORAGE';
      containerIdEl.textContent = containerData.id || 'ACTIVE';

      const cWeight = containerData.weight || 0;
      const cMaxWeight = containerData.maxWeight || 150.0;
      containerWeightTxt.textContent = `${cWeight.toFixed(1)} / ${cMaxWeight.toFixed(1)} KG`;
      const cPct = Math.min(100, Math.round((cWeight / cMaxWeight) * 100));
      containerWeightFill.style.width = `${cPct}%`;

      containerSlotsGrid.innerHTML = '';
      const cMaxSlots = containerData.maxSlots || 30;
      for (let i = 0; i < cMaxSlots; i++) {
        const item = containerData.items[i];
        const slotEl = createSlotElement(i, item, 'container', false);
        containerSlotsGrid.appendChild(slotEl);
      }
    } else {
      containerStandby.classList.remove('hidden');
      containerSlotsGrid.innerHTML = '';
      containerNameEl.textContent = 'LOCAL STORAGE';
      containerIdEl.textContent = 'STANDBY';
      containerWeightTxt.textContent = '0.0 / 0.0 KG';
      containerWeightFill.style.width = '0%';
    }
  }

  // Open Item Detail & Action Modal
  function openItemModal(item, def, slotIdx, type) {
    selectedSlotData = { item, def, slotIdx, type };
    playCyberSound('click');

    modalTitle.textContent = def.label || item.id;
    modalCategory.textContent = def.category || 'EQUIPMENT';
    modalDesc.textContent = def.description || 'Standard manufactured item in Night City.';
    modalWeight.textContent = `${def.weight || 0.5} KG`;
    modalCount.textContent = `x${item.amount || 1}`;
    modalIcon.textContent = def.icon || '📦';

    // Usable button
    if (def.usable && type === 'player') {
      btnModalUse.classList.remove('hidden');
    } else {
      btnModalUse.classList.add('hidden');
    }

    // Split Stack Slider
    if (item.amount && item.amount > 1 && def.stackable) {
      splitWrap.classList.remove('hidden');
      splitSlider.min = 1;
      splitSlider.max = item.amount - 1;
      splitSlider.value = Math.floor(item.amount / 2);
      splitValTxt.textContent = splitSlider.value;
      btnModalSplit.classList.remove('hidden');
    } else {
      splitWrap.classList.add('hidden');
      btnModalSplit.classList.add('hidden');
    }

    itemModal.classList.remove('hidden');
  }

  modalCloseBtn.addEventListener('click', () => {
    itemModal.classList.add('hidden');
    selectedSlotData = null;
  });

  splitSlider.addEventListener('input', () => {
    splitValTxt.textContent = splitSlider.value;
  });

  // Action Button: USE
  btnModalUse.addEventListener('click', () => {
    if (!selectedSlotData) return;
    playCyberSound('use');
    if (window.mp && mp.events) {
      mp.events.emit('gcyber:inventory:cefUseItem', selectedSlotData.slotIdx);
    }
    itemModal.classList.add('hidden');
    selectedSlotData = null;
  });

  // Action Button: DROP
  btnModalDrop.addEventListener('click', () => {
    if (!selectedSlotData) return;
    playCyberSound('drop');
    const amount = splitWrap.classList.contains('hidden') ? selectedSlotData.item.amount : parseInt(splitSlider.value, 10);
    if (window.mp && mp.events) {
      mp.events.emit('gcyber:inventory:cefDropItem', JSON.stringify({
        slot: selectedSlotData.slotIdx,
        amount: amount
      }));
    }
    itemModal.classList.add('hidden');
    selectedSlotData = null;
  });

  // Action Button: SPLIT
  btnModalSplit.addEventListener('click', () => {
    if (!selectedSlotData) return;
    playCyberSound('click');
    const splitCount = parseInt(splitSlider.value, 10);

    // Find first empty slot in player pockets
    let emptySlot = -1;
    for (let i = 0; i < playerData.items.length; i++) {
      if (!playerData.items[i]) {
        emptySlot = i;
        break;
      }
    }

    if (emptySlot !== -1 && window.mp && mp.events) {
      mp.events.emit('gcyber:inventory:cefMoveItem', JSON.stringify({
        fromType: selectedSlotData.type,
        fromSlot: selectedSlotData.slotIdx,
        toType: selectedSlotData.type,
        toSlot: emptySlot,
        containerId: containerData ? containerData.id : null,
        amount: splitCount
      }));
    }

    itemModal.classList.add('hidden');
    selectedSlotData = null;
  });

  // ===================================================================
  // CyberMP Events Interface
  // ===================================================================
  if (window.mp && mp.events) {
    const onEvent = (mp.events.on || mp.events.add).bind(mp.events);

    // Event: Open Inventory from Client
    onEvent('gcyber:inventory:cefOpen', (jsonStr) => {
      try {
        const payload = (typeof jsonStr === 'string') ? JSON.parse(jsonStr) : jsonStr;
        playerData = payload.player;
        containerData = payload.container;
        if (payload.itemDefinitions) {
          itemDefinitions = payload.itemDefinitions;
        }

        renderInventory();
        appRoot.classList.remove('hidden');
        playCyberSound('use');
      } catch (e) {
        console.error('[gcyber-inventory] cefOpen parse error:', e);
      }
    });

    // Event: Live Update from Server
    onEvent('gcyber:inventory:cefUpdate', (jsonStr) => {
      try {
        const payload = (typeof jsonStr === 'string') ? JSON.parse(jsonStr) : jsonStr;
        if (payload.player) {
          playerData.weight = payload.player.weight;
          playerData.items = payload.player.items;
        }
        if (payload.container && containerData) {
          containerData.weight = payload.container.weight;
          containerData.items = payload.container.items;
        }
        renderInventory();
      } catch (e) {
        console.error('[gcyber-inventory] cefUpdate error:', e);
      }
    });

    // Event: Force Close from Client
    onEvent('gcyber:inventory:cefClose', () => {
      appRoot.classList.add('hidden');
      itemModal.classList.add('hidden');
    });
  }
});
