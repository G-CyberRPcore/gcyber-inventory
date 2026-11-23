// =====================================================================
// G-CyberRPcore Ecosystem - Items Registry
// Verified against CyberMP Developer Wiki (punkmp.wiki/items)
// =====================================================================

const Items = {
  // --- MEDICAL & PHARMACEUTICALS ---
  maxdoc_mk1: {
    id: 'maxdoc_mk1',
    label: 'MaxDoc Mk.1 Inhaler',
    category: 'medicine',
    weight: 0.3,
    stackable: true,
    maxStack: 10,
    nativeId: 'Items.FirstAidMedkit',
    usable: true,
    consumeEffect: { health: 40, hunger: 0, thirst: 0, stress: -10 },
    icon: '💉',
    description: 'Trauma Team standard emergency medical inhaler. Restores 40% health instantly.'
  },
  maxdoc_mk2: {
    id: 'maxdoc_mk2',
    label: 'MaxDoc Mk.2 Inhaler',
    category: 'medicine',
    weight: 0.4,
    stackable: true,
    maxStack: 5,
    nativeId: 'Items.FirstAidMedkitCurative',
    usable: true,
    consumeEffect: { health: 70, hunger: 0, thirst: 0, stress: -15 },
    icon: '💉',
    description: 'Military-grade medical inhaler restoring 70% health.'
  },
  bounce_back_mk1: {
    id: 'bounce_back_mk1',
    label: 'Bounce Back Mk.1',
    category: 'medicine',
    weight: 0.2,
    stackable: true,
    maxStack: 10,
    nativeId: 'Items.BonesMcCoy',
    usable: true,
    consumeEffect: { health: 30, hunger: 0, thirst: 0, stress: -5 },
    icon: '🩸',
    description: 'Subcutaneous injector that accelerates tissue regeneration.'
  },
  bandage: {
    id: 'bandage',
    label: 'Synthetic Hemostatic Dressing',
    category: 'medicine',
    weight: 0.1,
    stackable: true,
    maxStack: 20,
    nativeId: 'Items.HealthBooster',
    usable: true,
    consumeEffect: { health: 15, hunger: 0, thirst: 0, stress: 0 },
    icon: '🩹',
    description: 'Stops heavy bleeding and stabilizes wounded limbs.'
  },

  // --- FOOD & NUTRITION ---
  synth_burger: {
    id: 'synth_burger',
    label: 'Synthetic Beef Burger',
    category: 'food',
    weight: 0.35,
    stackable: true,
    maxStack: 10,
    nativeId: 'Items.Burger',
    usable: true,
    consumeEffect: { health: 5, hunger: 35, thirst: 0, stress: -5 },
    icon: '🍔',
    description: 'AllFoods certified processed protein patty on soy bun.'
  },
  burrito_xxl: {
    id: 'burrito_xxl',
    label: 'Chupacabra XXL Burrito',
    category: 'food',
    weight: 0.5,
    stackable: true,
    maxStack: 5,
    nativeId: 'Items.Burrito',
    usable: true,
    consumeEffect: { health: 10, hunger: 55, thirst: -5, stress: -5 },
    icon: '🌯',
    description: 'Massive street-vendor burrito loaded with synthesized beans and artificial salsa.'
  },
  ramen_pack: {
    id: 'ramen_pack',
    label: 'Kabuki Instant Ramen',
    category: 'food',
    weight: 0.2,
    stackable: true,
    maxStack: 15,
    nativeId: 'Items.GoodQualityFood',
    usable: true,
    consumeEffect: { health: 5, hunger: 25, thirst: 0, stress: -5 },
    icon: '🍜',
    description: 'Classic freeze-dried noodles. Just add heated mineral water.'
  },

  // --- DRINKS & HYDRATION ---
  water_bottle: {
    id: 'water_bottle',
    label: 'Purified Water (500ml)',
    category: 'drink',
    weight: 0.5,
    stackable: true,
    maxStack: 10,
    nativeId: 'Items.Water',
    usable: true,
    consumeEffect: { health: 5, hunger: 0, thirst: 45, stress: -5 },
    icon: '💧',
    description: 'Filtered Night City tap water. Guaranteed 99.4% heavy-metal free.'
  },
  nicola_blue: {
    id: 'nicola_blue',
    label: 'NiCola Blue (Original)',
    category: 'drink',
    weight: 0.35,
    stackable: true,
    maxStack: 12,
    nativeId: 'Items.Soda',
    usable: true,
    consumeEffect: { health: 0, hunger: 0, thirst: 35, stress: -10 },
    icon: '🥤',
    description: 'Taste the love! The sweetest carbonated beverage in Night City.'
  },
  spunky_monkey: {
    id: 'spunky_monkey',
    label: 'Spunky Monkey Energy Drink',
    category: 'drink',
    weight: 0.35,
    stackable: true,
    maxStack: 10,
    nativeId: 'Items.EnergyDrink',
    usable: true,
    consumeEffect: { health: 0, hunger: 0, thirst: 30, stress: 5 },
    icon: '⚡',
    description: 'Extreme caffeine and taurine stimulant drink with neon green coloring.'
  },
  silverhand_tequila: {
    id: 'silverhand_tequila',
    label: 'Centzon Totochtin Tequila',
    category: 'drink',
    weight: 1.0,
    stackable: false,
    maxStack: 1,
    nativeId: 'Items.Tequila',
    usable: true,
    consumeEffect: { health: 0, hunger: 0, thirst: 15, stress: -30 },
    icon: '🍾',
    description: 'Johnny Silverhand’s signature drink ingredient: spicy tequila with a chili rim.'
  },

  // --- WEAPONS (VERIFIED ON PUNKMP WIKI) ---
  weapon_unity: {
    id: 'weapon_unity',
    label: 'Constitutional Arms Unity (9mm)',
    category: 'weapon',
    weight: 2.2,
    stackable: false,
    maxStack: 1,
    nativeId: 'Items.Preset_Unity_Default',
    ammoType: 'ammo_handgun',
    usable: true,
    icon: '🔫',
    description: 'Reliable, mass-produced semi-automatic pistol popular among Night City security.'
  },
  weapon_lexington: {
    id: 'weapon_lexington',
    label: 'Militech M-10AF Lexington',
    category: 'weapon',
    weight: 2.0,
    stackable: false,
    maxStack: 1,
    nativeId: 'Items.Preset_Lexington_Default',
    ammoType: 'ammo_handgun',
    usable: true,
    icon: '🔫',
    description: 'Fast-firing tactical combat handgun.'
  },
  weapon_copperhead: {
    id: 'weapon_copperhead',
    label: 'Nokota D5 Copperhead Rifle',
    category: 'weapon',
    weight: 4.8,
    stackable: false,
    maxStack: 1,
    nativeId: 'Items.Preset_Copperhead_Default',
    ammoType: 'ammo_rifle',
    usable: true,
    icon: '🗡️',
    description: 'Durable assault rifle favored by Nomad clans and street mercenaries.'
  },
  weapon_carnage: {
    id: 'weapon_carnage',
    label: 'Budget Arms Carnage Shotgun',
    category: 'weapon',
    weight: 7.2,
    stackable: false,
    maxStack: 1,
    nativeId: 'Items.Preset_Carnage_Default',
    ammoType: 'ammo_shotgun',
    usable: true,
    icon: '💥',
    description: 'Brutal pump-action shotgun packing massive kinetic stopping power.'
  },
  weapon_katana: {
    id: 'weapon_katana',
    label: 'Arasaka Steel Katana',
    category: 'weapon',
    weight: 2.5,
    stackable: false,
    maxStack: 1,
    nativeId: 'Items.Preset_Katana_Default',
    ammoType: null,
    usable: true,
    icon: '⚔️',
    description: 'Folded carbon steel blade honed to monomolecular edge.'
  },

  // --- AMMUNITION ---
  ammo_handgun: {
    id: 'ammo_handgun',
    label: 'Pistol Ammo (50x)',
    category: 'ammo',
    weight: 0.6,
    stackable: true,
    maxStack: 200,
    nativeId: 'Ammo.HandgunAmmo',
    usable: false,
    icon: '📦',
    description: 'Box of standard 9x19mm power rounds.'
  },
  ammo_rifle: {
    id: 'ammo_rifle',
    label: 'Rifle Cartridges (60x)',
    category: 'ammo',
    weight: 1.1,
    stackable: true,
    maxStack: 240,
    nativeId: 'Ammo.RifleAmmo',
    usable: false,
    icon: '📦',
    description: 'High-velocity 5.56mm caseless rifle cartridges.'
  },
  ammo_shotgun: {
    id: 'ammo_shotgun',
    label: 'Shotgun Shells (20x)',
    category: 'ammo',
    weight: 0.8,
    stackable: true,
    maxStack: 100,
    nativeId: 'Ammo.ShotgunAmmo',
    usable: false,
    icon: '📦',
    description: 'Heavy gauge kinetic buckshot shells.'
  },

  // --- CYBERWARE & OPERATING SYSTEMS ---
  cyberdeck_paraline: {
    id: 'cyberdeck_paraline',
    label: 'Militech Paraline Cyberdeck Mk.2',
    category: 'cyberware',
    slotType: 'os',
    weight: 1.2,
    stackable: false,
    maxStack: 1,
    nativeId: 'Items.CyberdeckC1',
    usable: true,
    icon: '💾',
    description: 'Entry-level netrunning deck featuring 6 RAM slots and quickhack buffer.'
  },
  sandevistan_dynalar: {
    id: 'sandevistan_dynalar',
    label: 'Dynalar Sandevistan Mk.3',
    category: 'cyberware',
    slotType: 'os',
    weight: 2.0,
    stackable: false,
    maxStack: 1,
    nativeId: 'Items.SandevistanC1',
    usable: true,
    icon: '⚡',
    description: 'Reflex booster accelerating neural transmission.'
  },
  kiroshi_optics_v1: {
    id: 'kiroshi_optics_v1',
    label: 'Kiroshi Optical Suite v1',
    category: 'cyberware',
    slotType: 'ocular',
    weight: 0.4,
    stackable: false,
    maxStack: 1,
    nativeId: 'Items.KiroshiOptics',
    usable: true,
    icon: '👁️',
    description: 'High-definition cybernetic eye with threat evaluation and HUD integration.'
  },

  // --- IDENTITY & ROLEPLAY TOOLS ---
  id_card: {
    id: 'id_card',
    label: 'Citizen Identification Card',
    category: 'identity',
    weight: 0.05,
    stackable: false,
    maxStack: 1,
    nativeId: 'Items.IdentityCard',
    usable: true,
    icon: '🪪',
    description: 'Official Night City Citizen Identification smart chip.'
  },
  drive_license: {
    id: 'drive_license',
    label: 'Night City Driver Permit',
    category: 'identity',
    weight: 0.05,
    stackable: false,
    maxStack: 1,
    nativeId: 'Items.LicenseCard',
    usable: true,
    icon: '🚗',
    description: 'Driver qualification badge registered with NC Transport Authority.'
  },
  cyber_phone: {
    id: 'cyber_phone',
    label: 'Agent NetWatch Holo-Phone',
    category: 'tool',
    weight: 0.3,
    stackable: false,
    maxStack: 1,
    nativeId: 'Items.CyberPhone',
    usable: true,
    icon: '📱',
    description: 'Encrypted communication agent linking citizen to NightNet.'
  },
  cyber_lockpick: {
    id: 'cyber_lockpick',
    label: 'Digital Bypass Lockpick',
    category: 'tool',
    weight: 0.3,
    stackable: true,
    maxStack: 5,
    nativeId: 'Items.Lockpick',
    usable: true,
    icon: '🔓',
    description: 'Handheld decryption tool used to bypass low-security vehicle and apartment locks.'
  },
  repair_kit: {
    id: 'repair_kit',
    label: 'Vehicle Diagnostic & Repair Kit',
    category: 'tool',
    weight: 5.0,
    stackable: false,
    maxStack: 2,
    nativeId: 'Items.RepairKit',
    usable: true,
    icon: '🔧',
    description: 'Comprehensive toolkit for servicing engines, tires, and bodywork.'
  },
  money: {
    id: 'money',
    label: 'Eurodollars (Eddies)',
    category: 'currency',
    weight: 0.001,
    stackable: true,
    maxStack: 1000000,
    nativeId: 'Items.money',
    usable: false,
    icon: '💵',
    description: 'Universal physical currency bills accepted across Night City.'
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Items;
}
