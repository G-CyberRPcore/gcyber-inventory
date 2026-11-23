# gcyber-inventory
**Advanced Multi-Container Drag & Drop Inventory & Cyberware Engine for CyberMP (Cyberpunk 2077)**

Part of the **[G-CyberRPcore](https://github.com/G-CyberRPcore)** modular roleplay framework ecosystem.

---

## ⚡ Overview
`gcyber-inventory` is an enterprise-grade, server-authoritative inventory system engineered specifically for CyberMP roleplay servers. Built with authentic Cyberpunk 2077 NetWatch styling, it decouples inventory logic from client memory, guaranteeing full protection against item duplication while delivering a sleek drag-and-drop dual-grid CEF user interface.

---

## 🚀 Key Features

* **Server-Authoritative Transactions**: Every item transfer, split, and consumption is validated server-side and persisted in MySQL / SQLite (`player_items` table).
* **Dual-Grid Multi-Container Architecture**:
  * **Player Pockets**: 35 personal slots with dynamic weight capacity (default 120 kg).
  * **Tactical Quickslots (Hotbar 1 - 5)**: Keybound for instant weapon equipping or consumable use.
  * **Vehicle Trunks & Glovebox**: Automatically links to nearest vehicle plate within interaction distance.
  * **Apartment Stashes**: Instanced secure containers for player housing.
  * **Ground Drops**: Real-time dropped item containers in the 3D game world.
* **Verified Native REDengine Integration**:
  * Item definitions aligned with verified CyberMP IDs from [punkmp.wiki/items](https://www.punkmp.wiki/items).
  * Weapon equipping triggers native 3D weapon props via REDengine transaction APIs.
* **Ecosystem HUD Integration**:
  * Consuming food (`synth_burger`, `burrito_xxl`) and drinks (`nicola_blue`, `water_bottle`) directly updates hunger and thirst in `gcyber-hud`.
  * Medical items (`maxdoc_mk1`, `bounce_back_mk1`) replenish health points.
* **Synthesized Cyberpunk Audio**:
  * Web Audio API sound synthesizer providing interactive clicks, equip audio, and drop feedback with zero external MP3 file dependencies.

---

## 📦 Installation & Setup

1. Clone or place `gcyber-inventory` into your server's `resources/` directory:
   ```text
   resources/gcyber-inventory/
   ```

2. Register in `server.toml`:
   ```toml
   resources = [
     "G-CyberRPcore",
     "gcyber-inventory"
   ]
   ```

3. Or deploy automatically with the ecosystem CLI:
   ```cmd
   gcyber deploy
   gcyber sync
   ```

---

## 🛡️ License
Licensed under the **MIT License**. Part of the official G-CyberRPcore project.
