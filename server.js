// =====================================================================
// G-CyberRPcore Ecosystem - Advanced Modular Inventory Engine
// Server-Side Controller: Multi-Container, Drag & Drop, Persistence
// =====================================================================

const fs = require('fs');
const path = require('path');
const Config = require('./config.js');
const SharedItems = require('./shared/items.js');

console.log('[gcyber-inventory] Initializing Advanced Multi-Container Inventory Engine...');

// In-Memory Container Storage (Trunks, Gloveboxes, Stashes, Ground Drops)
const ActiveContainers = new Map(); // Key: containerId (e.g. 'trunk:NC-7788', 'drop:101'), Value: ContainerObject
const GroundDrops = new Map();      // Key: dropId, Value: { id, position, items, createdAt }
let dropCounter = 1000;

// Helper: Calculate total weight of an items array
function calculateWeight(items) {
  let total = 0;
  for (const item of items) {
    if (!item) continue;
    const def = SharedItems[item.id];
    const unitWeight = def ? def.weight : 0.5;
    total += unitWeight * (item.amount || 1);
  }
  return parseFloat(total.toFixed(2));
}

// Helper: Get or create secondary container
function getOrCreateContainer(containerId, maxSlots, maxWeight) {
  if (ActiveContainers.has(containerId)) {
    return ActiveContainers.get(containerId);
  }

  const container = {
    id: containerId,
    maxSlots: maxSlots || 30,
    maxWeight: maxWeight || 150.0,
    items: new Array(maxSlots || 30).fill(null)
  };
  ActiveContainers.set(containerId, container);
  return container;
}

// Helper: Check proximity between two 3D positions
function getDistance(pos1, pos2) {
  if (!pos1 || !pos2) return 999.0;
  const dx = (pos1[0] || 0) - (pos2[0] || 0);
  const dy = (pos1[1] || 0) - (pos2[1] || 0);
  const dz = (pos1[2] || 0) - (pos2[2] || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// =====================================================================
// Database Synchronization with G_CyberCore DAL
// =====================================================================

// Load player inventory from DB
async function loadPlayerInventory(citizenId) {
  const maxSlots = Config.Inventory.player.maxSlots;
  const slots = new Array(maxSlots).fill(null);

  if (!global.G_CyberCore || !global.G_CyberCore.DB) {
    console.log('[gcyber-inventory] G_CyberCore DB not ready, returning default empty inventory.');
    return slots;
  }

  try {
    const rows = await global.G_CyberCore.DB.Fetch(
      'SELECT slot, item_id, count, metadata FROM player_items WHERE citizenid = ? ORDER BY slot ASC',
      [citizenId]
    );

    if (rows && rows.length > 0) {
      for (const row of rows) {
        const slotIdx = parseInt(row.slot, 10);
        if (slotIdx >= 0 && slotIdx < maxSlots) {
          let meta = {};
          try {
            meta = (typeof row.metadata === 'string') ? JSON.parse(row.metadata) : (row.metadata || {});
          } catch (e) {
            meta = {};
          }

          slots[slotIdx] = {
            slot: slotIdx,
            id: row.item_id,
            amount: parseInt(row.count, 10) || 1,
            info: meta
          };
        }
      }
    } else {
      // Starter Gear for new citizens
      const starterItems = [
        { slot: 0, id: 'id_card', amount: 1, info: { citizenid: citizenId } },
        { slot: 1, id: 'cyber_phone', amount: 1, info: {} },
        { slot: 2, id: 'maxdoc_mk1', amount: 3, info: {} },
        { slot: 3, id: 'water_bottle', amount: 2, info: {} },
        { slot: 4, id: 'synth_burger', amount: 2, info: {} },
        { slot: 5, id: 'money', amount: 500, info: {} }
      ];

      for (const st of starterItems) {
        slots[st.slot] = st;
        await global.G_CyberCore.DB.Execute(
          'INSERT INTO player_items (citizenid, slot, item_id, count, metadata) VALUES (?, ?, ?, ?, ?)',
          [citizenId, st.slot, st.id, st.amount, JSON.stringify(st.info)]
        );
      }
    }
  } catch (err) {
    console.log(`[gcyber-inventory] Error loading inventory for ${citizenId}:`, err);
  }

  return slots;
}

// Save single slot to DB
async function savePlayerSlot(citizenId, slotIdx, itemData) {
  if (!global.G_CyberCore || !global.G_CyberCore.DB) return;

  try {
    if (!itemData) {
      await global.G_CyberCore.DB.Execute(
        'DELETE FROM player_items WHERE citizenid = ? AND slot = ?',
        [citizenId, slotIdx]
      );
    } else {
      const metaStr = JSON.stringify(itemData.info || {});
      const existing = await global.G_CyberCore.DB.FetchOne(
        'SELECT id FROM player_items WHERE citizenid = ? AND slot = ?',
        [citizenId, slotIdx]
      );

      if (existing) {
        await global.G_CyberCore.DB.Execute(
          'UPDATE player_items SET item_id = ?, count = ?, metadata = ? WHERE citizenid = ? AND slot = ?',
          [itemData.id, itemData.amount, metaStr, citizenId, slotIdx]
        );
      } else {
        await global.G_CyberCore.DB.Execute(
          'INSERT INTO player_items (citizenid, slot, item_id, count, metadata) VALUES (?, ?, ?, ?, ?)',
          [citizenId, slotIdx, itemData.id, itemData.amount, metaStr]
        );
      }
    }
  } catch (err) {
    console.log(`[gcyber-inventory] Error saving slot ${slotIdx} for ${citizenId}:`, err);
  }
}

// =====================================================================
// Network Events & Client Interaction
// =====================================================================

if (typeof mp !== 'undefined' && mp.events) {
  // 1. Open Inventory Request
  mp.events.onClient('gcyber:inventory:serverOpen', async (player, containerReqJson) => {
    if (!player || !player.citizenid) return;

    let containerReq = null;
    try {
      containerReq = containerReqJson ? JSON.parse(containerReqJson) : null;
    } catch (e) {
      containerReq = null;
    }

    const playerSlots = await loadPlayerInventory(player.citizenid);
    const playerWeight = calculateWeight(playerSlots);

    let containerData = null;
    if (containerReq && containerReq.type) {
      const type = containerReq.type; // 'trunk', 'glovebox', 'stash', 'drop'
      const id = containerReq.id || 'default';
      const fullId = `${type}:${id}`;

      let maxSlots = 30;
      let maxWeight = 150.0;
      if (type === 'trunk') {
        maxSlots = Config.Inventory.trunk.maxSlots;
        maxWeight = Config.Inventory.trunk.maxWeight;
      } else if (type === 'glovebox') {
        maxSlots = Config.Inventory.glovebox.maxSlots;
        maxWeight = Config.Inventory.glovebox.maxWeight;
      } else if (type === 'stash') {
        maxSlots = Config.Inventory.stash.maxSlots;
        maxWeight = Config.Inventory.stash.maxWeight;
      } else if (type === 'drop') {
        maxSlots = Config.Inventory.drop.maxSlots;
        maxWeight = Config.Inventory.drop.maxWeight;
      }

      const container = getOrCreateContainer(fullId, maxSlots, maxWeight);
      containerData = {
        type: type,
        id: fullId,
        label: containerReq.label || `${type.toUpperCase()} #${id}`,
        maxSlots: container.maxSlots,
        maxWeight: container.maxWeight,
        weight: calculateWeight(container.items),
        items: container.items
      };
    }

    player.emit('gcyber:inventory:clientOpen', JSON.stringify({
      player: {
        citizenid: player.citizenid,
        name: player.nickname || 'Citizen',
        maxSlots: Config.Inventory.player.maxSlots,
        maxWeight: Config.Inventory.player.maxWeight,
        weight: playerWeight,
        items: playerSlots
      },
      container: containerData,
      itemDefinitions: SharedItems
    }));
  });

  // 2. Drag & Drop Move Item (Between Slots / Containers)
  mp.events.onClient('gcyber:inventory:serverMoveItem', async (player, dataJson) => {
    if (!player || !player.citizenid) return;

    let data = null;
    try {
      data = JSON.parse(dataJson);
    } catch (e) {
      return;
    }

    const { fromType, fromSlot, toType, toSlot, containerId, amount } = data;
    const playerSlots = await loadPlayerInventory(player.citizenid);
    let container = containerId ? ActiveContainers.get(containerId) : null;

    let sourceItem = null;
    if (fromType === 'player') {
      sourceItem = playerSlots[fromSlot];
    } else if (fromType === 'container' && container) {
      sourceItem = container.items[fromSlot];
    }

    if (!sourceItem) return;

    let targetItem = null;
    if (toType === 'player') {
      targetItem = playerSlots[toSlot];
    } else if (toType === 'container' && container) {
      targetItem = container.items[toSlot];
    }

    const moveCount = (amount && amount > 0 && amount < sourceItem.amount) ? amount : sourceItem.amount;

    // A. Simple Move to Empty Slot
    if (!targetItem) {
      if (moveCount === sourceItem.amount) {
        // Full move
        if (fromType === 'player') playerSlots[fromSlot] = null;
        if (fromType === 'container' && container) container.items[fromSlot] = null;

        const newItem = { ...sourceItem, slot: toSlot };
        if (toType === 'player') playerSlots[toSlot] = newItem;
        if (toType === 'container' && container) container.items[toSlot] = newItem;
      } else {
        // Split stack
        sourceItem.amount -= moveCount;
        const newItem = { ...sourceItem, slot: toSlot, amount: moveCount };
        if (toType === 'player') playerSlots[toSlot] = newItem;
        if (toType === 'container' && container) container.items[toSlot] = newItem;
      }
    } else if (targetItem.id === sourceItem.id && SharedItems[sourceItem.id] && SharedItems[sourceItem.id].stackable) {
      // B. Merge Stackable Items
      const maxStack = SharedItems[sourceItem.id].maxStack || 100;
      const space = maxStack - targetItem.amount;
      const toMerge = Math.min(space, moveCount);

      targetItem.amount += toMerge;
      sourceItem.amount -= toMerge;

      if (sourceItem.amount <= 0) {
        if (fromType === 'player') playerSlots[fromSlot] = null;
        if (fromType === 'container' && container) container.items[fromSlot] = null;
      }
    } else {
      // C. Swap Slots
      if (fromType === toType) {
        if (fromType === 'player') {
          playerSlots[fromSlot] = { ...targetItem, slot: fromSlot };
          playerSlots[toSlot] = { ...sourceItem, slot: toSlot };
        } else if (container) {
          container.items[fromSlot] = { ...targetItem, slot: fromSlot };
          container.items[toSlot] = { ...sourceItem, slot: toSlot };
        }
      }
    }

    // Persist changes to database
    if (fromType === 'player') {
      await savePlayerSlot(player.citizenid, fromSlot, playerSlots[fromSlot]);
    }
    if (toType === 'player') {
      await savePlayerSlot(player.citizenid, toSlot, playerSlots[toSlot]);
    }

    // Acknowledge update to client
    player.emit('gcyber:inventory:clientUpdate', JSON.stringify({
      player: {
        weight: calculateWeight(playerSlots),
        items: playerSlots
      },
      container: container ? {
        id: container.id,
        weight: calculateWeight(container.items),
        items: container.items
      } : null
    }));
  });

  // 3. Use Item Action
  mp.events.onClient('gcyber:inventory:serverUseItem', async (player, slotIdx) => {
    if (!player || !player.citizenid) return;

    const playerSlots = await loadPlayerInventory(player.citizenid);
    const item = playerSlots[slotIdx];
    if (!item) return;

    const def = SharedItems[item.id];
    if (!def || !def.usable) {
      player.emit('gcyber:client:notify', 'Inventory', 'This item cannot be used directly.', 'error');
      return;
    }

    console.log(`[gcyber-inventory] ${player.nickname} used ${def.label} (${def.id})`);

    // Handle Consumable Medicine
    if (def.category === 'medicine') {
      const heal = (def.consumeEffect && def.consumeEffect.health) || 30;
      player.health = Math.min(100, (player.health || 100) + heal);
      player.emit('gcyber:client:notify', 'Medical', `Used ${def.label}. Restored ${heal}% vitality.`, 'success');
      player.emit('g-cyber:hud:updateHealth', player.health);
    }

    // Handle Food
    if (def.category === 'food') {
      const hunger = (def.consumeEffect && def.consumeEffect.hunger) || 30;
      player.emit('gcyber:client:notify', 'Nutrition', `Consumed ${def.label}.`, 'success');
      player.emit('g-cyber:hud:addHunger', hunger);
    }

    // Handle Drink
    if (def.category === 'drink') {
      const thirst = (def.consumeEffect && def.consumeEffect.thirst) || 35;
      player.emit('gcyber:client:notify', 'Hydration', `Drank ${def.label}.`, 'success');
      player.emit('g-cyber:hud:addThirst', thirst);
    }

    // Handle Weapon Equip
    if (def.category === 'weapon') {
      player.emit('gcyber:inventory:clientEquipWeapon', def.nativeId, def.id);
      player.emit('gcyber:client:notify', 'Armory', `Equipped ${def.label}.`, 'success');
      return; // Do not consume weapon item
    }

    // Handle Cyberware
    if (def.category === 'cyberware') {
      player.emit('gcyber:client:notify', 'Cyberware', `Neural link active: ${def.label}.`, 'success');
      return; // Do not consume cyberware
    }

    // Consume Stackable Item
    if (item.amount > 1) {
      item.amount--;
      await savePlayerSlot(player.citizenid, slotIdx, item);
    } else {
      playerSlots[slotIdx] = null;
      await savePlayerSlot(player.citizenid, slotIdx, null);
    }

    player.emit('gcyber:inventory:clientUpdate', JSON.stringify({
      player: {
        weight: calculateWeight(playerSlots),
        items: playerSlots
      }
    }));
  });

  // 4. Ground Drop Handler
  mp.events.onClient('gcyber:inventory:serverDropItem', async (player, dataJson) => {
    if (!player || !player.citizenid) return;

    let data = null;
    try {
      data = JSON.parse(dataJson);
    } catch (e) {
      return;
    }

    const { slot, amount } = data;
    const playerSlots = await loadPlayerInventory(player.citizenid);
    const item = playerSlots[slot];
    if (!item) return;

    const dropAmount = (amount && amount > 0 && amount < item.amount) ? amount : item.amount;
    const dropId = `drop:${++dropCounter}`;
    const pPos = player.position || [0, 0, 0];

    const container = getOrCreateContainer(dropId, Config.Inventory.drop.maxSlots, Config.Inventory.drop.maxWeight);
    container.items[0] = { ...item, slot: 0, amount: dropAmount };

    if (dropAmount === item.amount) {
      playerSlots[slot] = null;
      await savePlayerSlot(player.citizenid, slot, null);
    } else {
      item.amount -= dropAmount;
      await savePlayerSlot(player.citizenid, slot, item);
    }

    GroundDrops.set(dropId, {
      id: dropId,
      position: pPos,
      createdAt: Date.now()
    });

    player.emit('gcyber:client:notify', 'Drop', 'Dropped items onto the ground.', 'info');
    player.emit('gcyber:inventory:clientUpdate', JSON.stringify({
      player: {
        weight: calculateWeight(playerSlots),
        items: playerSlots
      }
    }));
  });
}

// Global API Export
global.G_CyberInventory = {
  GetPlayerInventory: loadPlayerInventory,
  SavePlayerSlot: savePlayerSlot,
  GetContainer: getOrCreateContainer,
  SharedItems: SharedItems
};

module.exports = global.G_CyberInventory;
