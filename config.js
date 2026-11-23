const Config = {};

// Inventory General Limits & Capacity Settings
Config.Inventory = {
  // Player Pockets & Personal Gear
  player: {
    maxSlots: 35,
    maxWeight: 120.0 // Kilograms
  },

  // Vehicle Containers
  trunk: {
    maxSlots: 50,
    maxWeight: 250.0
  },
  glovebox: {
    maxSlots: 10,
    maxWeight: 15.0
  },

  // Property / Apartment Stash
  stash: {
    maxSlots: 60,
    maxWeight: 500.0
  },

  // Ground Drops
  drop: {
    maxSlots: 20,
    maxWeight: 100.0,
    decayTimeoutMs: 600000 // 10 minutes before cleanup
  },

  // Keybinds & Controls
  keybinds: {
    toggleInventory: 'Tab',
    hotbar: ['1', '2', '3', '4', '5']
  },

  // Spatial Interaction Distances (Meters)
  distances: {
    trunkInteract: 3.5,
    playerInteract: 2.5,
    dropInteract: 2.0
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Config;
}
