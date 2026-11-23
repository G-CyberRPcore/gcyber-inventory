// =====================================================================
// G-CyberRPcore Ecosystem - Advanced Modular Inventory Engine
// Client-Side Controller: Input Handling, CEF Bridge, Weapon Equip
// =====================================================================

console.log('[gcyber-inventory] Client runtime loaded. Binding inventory controls...');

let isInventoryOpen = false;

// Helper: Safely control CEF input focus & cursor
function safeSetFocus(hasInputFocus, hasCursor) {
  try {
    if (typeof mp !== 'undefined' && mp.gui) {
      if (typeof mp.gui.cursor === 'object') {
        mp.gui.cursor.show(hasCursor, hasInputFocus);
      }
      if (typeof mp.gui.input === 'object') {
        mp.gui.input.focus(hasInputFocus);
      }
    }
  } catch (e) {
    console.log('[gcyber-inventory] safeSetFocus exception:', e);
  }
}

// Helper: Get nearest vehicle for Trunk / Glovebox interaction
function getNearbyVehicleContainer() {
  if (typeof mp === 'undefined' || !mp.players || !mp.players.local) return null;

  const localPlayer = mp.players.local;
  const pPos = localPlayer.position || [0, 0, 0];

  // If inside vehicle, open glovebox
  if (localPlayer.vehicle) {
    const veh = localPlayer.vehicle;
    const plate = (veh.getVariable && veh.getVariable('plate')) || 'NC-VEH';
    return {
      type: 'glovebox',
      id: plate,
      label: `GLOVEBOX [${plate}]`
    };
  }

  // Look for nearest vehicle in world
  if (mp.vehicles && typeof mp.vehicles.toArray === 'function') {
    const vehicles = mp.vehicles.toArray();
    for (const veh of vehicles) {
      const vPos = veh.position || [0, 0, 0];
      const dx = (pPos[0] || 0) - (vPos[0] || 0);
      const dy = (pPos[1] || 0) - (vPos[1] || 0);
      const dist = Math.hypot(dx, dy);

      if (dist <= 4.0) {
        const plate = (veh.getVariable && veh.getVariable('plate')) || 'NC-VEH';
        return {
          type: 'trunk',
          id: plate,
          label: `TRUNK [${plate}]`
        };
      }
    }
  }

  return null;
}

// =====================================================================
// CEF & Keybind Listeners
// =====================================================================

// Open / Close Toggle Function
function toggleInventory(forceState) {
  if (typeof forceState === 'boolean') {
    isInventoryOpen = forceState;
  } else {
    isInventoryOpen = !isInventoryOpen;
  }

  if (isInventoryOpen) {
    const containerReq = getNearbyVehicleContainer();
    safeSetFocus(true, true);
    if (mp.events && typeof mp.events.emitServer === 'function') {
      mp.events.emitServer('gcyber:inventory:serverOpen', JSON.stringify(containerReq));
    }
  } else {
    safeSetFocus(false, false);
    if (mp.events && typeof mp.events.emitCef === 'function') {
      mp.events.emitCef('gcyber:inventory:cefClose');
    }
  }
}

// Keybind Registration (Tab / I to open inventory)
if (typeof mp !== 'undefined' && mp.events) {
  // Key Down Listener
  if (typeof mp.events.add === 'function') {
    // CyberMP Native Key Handling
    const KEY_TAB = 9;
    const KEY_I = 73;

    // CyberMP Native Key Handling (onInputKeyEvent)
    try {
      if (mp.game && typeof mp.game.onInit === 'function') {
        mp.game.onInit(() => {
          try {
            if (typeof mp.game.onInputKeyEvent === 'function') {
              mp.game.onInputKeyEvent((action, key) => {
                if (action === 1) { // Press
                  if (key === 9 || key === 73) { // Tab or I
                    toggleInventory();
                  } else if (key === 27 && isInventoryOpen) { // ESC
                    toggleInventory(false);
                  } else if (key >= 49 && key <= 53 && !isInventoryOpen) {
                    if (mp.events && typeof mp.events.emitServer === 'function') {
                      mp.events.emitServer('gcyber:inventory:serverUseItem', key - 49);
                    }
                  }
                }
              });
            }
          } catch (e1) {}
        });
      }
    } catch (e) {}

    // Register Commands (/inv, /inventory)
    try {
      if (mp.commands && typeof mp.commands.add === 'function') {
        mp.commands.add('inv', () => toggleInventory());
        mp.commands.add('inventory', () => toggleInventory());
      }
    } catch (e2) {}

    // Fallback: Check if mp.keys exists
    if (typeof mp.keys !== 'undefined' && typeof mp.keys.bind === 'function') {
      mp.keys.bind(KEY_TAB, false, () => toggleInventory());
      mp.keys.bind(KEY_I, false, () => toggleInventory());

      // Hotbar Keys (1 to 5)
      const hotbarKeys = [49, 50, 51, 52, 53]; // Keys '1' to '5'
      hotbarKeys.forEach((keyVal, idx) => {
        mp.keys.bind(keyVal, false, () => {
          if (!isInventoryOpen && mp.events.emitServer) {
            mp.events.emitServer('gcyber:inventory:serverUseItem', idx);
          }
        });
      });
    }
  }

  // Handle Server -> Client Open
  mp.events.onServer('gcyber:inventory:clientOpen', (dataJson) => {
    isInventoryOpen = true;
    safeSetFocus(true, true);
    if (mp.events.emitCef) {
      mp.events.emitCef('gcyber:inventory:cefOpen', dataJson);
    }
  });

  // Handle Server -> Client Live Update
  mp.events.onServer('gcyber:inventory:clientUpdate', (dataJson) => {
    if (mp.events.emitCef) {
      mp.events.emitCef('gcyber:inventory:cefUpdate', dataJson);
    }
  });

  // Handle Weapon Equip Native
  mp.events.onServer('gcyber:inventory:clientEquipWeapon', (nativeId, itemId) => {
    console.log(`[gcyber-inventory] Equipping 3D native weapon: ${nativeId}`);
    try {
      if (typeof Game !== 'undefined' && Game.GetTransactionSystem) {
        // Native REDengine transaction call if available
        const ts = Game.GetTransactionSystem();
        const player = Game.GetPlayer();
        if (ts && player) {
          ts.GiveItemByTDBID(player, nativeId, 1);
        }
      }
    } catch (e) {
      console.log('[gcyber-inventory] Native weapon equip handled via CyberMP fallback.');
    }
  });

  // CEF -> Client Action Relays
  if (typeof mp.events.onCef === 'function') {
    mp.events.onCef('gcyber:inventory:cefMoveItem', (dataJson) => {
      if (mp.events.emitServer) {
        mp.events.emitServer('gcyber:inventory:serverMoveItem', dataJson);
      }
    });

    mp.events.onCef('gcyber:inventory:cefUseItem', (slotIdx) => {
      if (mp.events.emitServer) {
        mp.events.emitServer('gcyber:inventory:serverUseItem', slotIdx);
      }
    });

    mp.events.onCef('gcyber:inventory:cefDropItem', (dataJson) => {
      if (mp.events.emitServer) {
        mp.events.emitServer('gcyber:inventory:serverDropItem', dataJson);
      }
    });

    mp.events.onCef('gcyber:inventory:cefCloseWindow', () => {
      toggleInventory(false);
    });
  }
}
