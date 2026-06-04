import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Areas matching the story chapters
const AREAS = {
  1: { name: "Sealed Cave", minEp: 0, enemyPool: ["Cave Bat", "Water Lizard", "Giant Centipede"] },
  2: { name: "Jura Forest Rim", minEp: 500, enemyPool: ["Goblin Scout", "Direwolf Rogue", "Wild Boar"] },
  3: { name: "Great Jura Forest", minEp: 3000, enemyPool: ["Orc Sentry", "Lizardman Soldier", "Direwolf Group"] },
  4: { name: "Swamps of Jura", minEp: 10000, enemyPool: ["Orc General", "Lizardman Elite"] },
  5: { name: "Tempest Outskirts", minEp: 50000, enemyPool: ["Falmuth Soldier", "Falmuth Knight", "Temple Mage"] },
  6: { name: "Walpurgis Banquet", minEp: 120000, enemyPool: ["Clayman Marionette", "Falmuth Knight", "Temple Mage"] },
  7: { name: "Tempest Colosseum", minEp: 250000, enemyPool: ["Labyrinth Basilisk", "Labyrinth Gargoyle", "Temple Mage"] },
  8: { name: "Tempest Imperial Front", minEp: 600000, enemyPool: ["Empire Soldier", "Empire Knight", "Empire Mage"] },
  9: { name: "Heavenly Gate", minEp: 1500000, enemyPool: ["Phantom Soldier", "Fallen Angel", "Seraphim Vanguard"] },
  10: { name: "Labyrinth Depths (Siege)", minEp: 4000000, enemyPool: ["Possessed Insectar", "Insectar Vanguard", "Flame Berserker"] },
  11: { name: "Cosmic Horizon (True Gate)", minEp: 10000000, enemyPool: ["Feldway Phantom", "Void Beast", "Chaos Entity"] }
};

// Initial Mazes for Chapters
const MAZES = {
  1: [
    ['P', '.', '#', 'O', '.'],
    ['.', '#', '.', '#', '.'],
    ['.', '.', 'E', '.', '#'],
    ['#', '#', '.', '#', '.'],
    ['O', '.', '.', '.', 'V']
  ],
  2: [
    ['P', '.', 'O', '.', '.'],
    ['#', '#', '.', '#', '.'],
    ['.', 'E', '.', 'E', '.'],
    ['.', '#', '#', '#', '.'],
    ['.', '.', 'O', '.', 'D'] // D for Direwolf Boss
  ],
  3: [
    ['P', '.', '.', '#', 'O'],
    ['.', '#', 'E', '#', '.'],
    ['O', '.', '.', '.', '.'],
    ['#', '#', 'E', '#', '.'],
    ['.', '.', '.', '.', 'B'] // B for Benimaru Ogre Group
  ],
  4: [
    ['P', '.', '#', 'E', '.'],
    ['.', '#', 'O', '#', '.'],
    ['.', '.', '.', 'E', '.'],
    ['#', '#', '.', '#', '#'],
    ['O', '.', 'E', '.', 'G'] // G for Geld the Orc Disaster
  ],
  5: [
    ['P', '.', '.', '.', 'E'],
    ['#', '#', 'E', '#', '.'],
    ['O', '.', 'H', '.', 'O'],
    ['.', '#', '#', '#', '.'],
    ['E', '.', 'O', '.', 'F'] // F for Falmuth Army Climax
  ],
  6: [
    ['P', '.', '.', '#', 'O'],
    ['.', '#', 'E', '#', '.'],
    ['O', '.', 'E', '.', 'O'],
    ['#', '#', '.', '#', '.'],
    ['E', '.', 'O', '.', 'K'] // K for Clayman (Lord of Marionettes)
  ],
  7: [
    ['P', '.', 'O', '.', 'E'],
    ['#', '#', '.', '#', '.'],
    ['O', '.', 'H', '.', 'O'], // H for Hinata rematch
    ['.', '#', '#', '#', '.'],
    ['E', '.', 'O', '.', 'L'] // L for Labyrinth Guardian (Bovix)
  ],
  8: [
    ['P', '.', 'E', '.', 'O'],
    ['#', '#', '.', '#', '.'],
    ['O', '.', 'E', '.', 'E'],
    ['.', '#', '#', '#', '#'],
    ['O', '.', 'E', '.', 'W'] // W for War General Calgurio
  ],
  9: [
    ['P', '.', '.', '#', 'O'],
    ['.', '#', 'E', '#', '.'],
    ['E', '.', 'O', '.', 'E'],
    ['#', '#', '.', '#', '.'],
    ['O', '.', 'E', '.', 'Y'] // Y for Michael
  ],
  10: [
    ['P', '.', '.', '#', 'O', '.', '.', '.', 'E', '.'],
    ['.', '#', '.', '#', '.', '#', '#', '.', '#', '.'],
    ['.', '#', '.', '.', '.', '.', 'E', '.', '#', '.'],
    ['#', '#', '#', '#', '.', '#', '#', '#', '#', '.'],
    ['O', '.', 'E', '.', '.', '.', 'O', '.', '.', '.'],
    ['.', '#', '#', '#', '#', '#', '#', '#', '#', '.'],
    ['.', '.', '.', 'E', '.', '.', '.', '.', 'E', '.'],
    ['.', '#', 'J', '#', '#', '#', '#', 'Z', '#', '.'],
    ['E', '#', '.', '#', 'O', '.', '.', '.', '#', 'O'],
    ['.', '.', '.', '.', '.', 'E', '.', '.', '.', '.']
  ],
  11: [
    ['P', '.', '.', '#', 'O', '.', '.', '.', 'E', '.'],
    ['.', '#', '.', '#', '.', '#', '#', '.', '#', '.'],
    ['.', '#', '.', '.', '.', '.', 'E', '.', '#', '.'],
    ['#', '#', '#', '#', '.', '#', '#', '#', '#', '.'],
    ['O', '.', 'E', '.', '.', '.', 'O', '.', '.', '.'],
    ['.', '#', '#', '#', '#', '#', '#', '#', '#', '.'],
    ['.', '.', '.', 'E', '.', '.', '.', '.', 'E', '.'],
    ['.', '#', '#', '#', '#', '#', '#', '#', '#', '.'],
    ['E', '#', '.', '#', 'O', '.', '.', '.', '#', 'O'],
    ['.', '.', '.', '.', '.', 'E', '.', '.', 'U', '.']
  ]
};

const PASSIVE_SKILLS = [
  "Great Sage", "Raphael", "Regeneration", "Infinite Regeneration",
  "Multidimensional Barrier", "Absorb", "Mimicry", "Dissolve", "Merciless",
  "Spacetime Manipulation", "Veldora Tempest", "Veldora", "Velgrynd"
];

const PREDATION_SKILLS = ["Predator", "Gluttony", "Beelzebuth"];

const CUSTOM_CLASSES = {
  warrior: {
    name: "Warrior",
    desc: "A front-line fighter focusing on strength and survivability. Starts with an Iron Blade.",
    hp: 50, mp: 0, str: 10, def: 5, agi: 0,
    skills: ["Strengthen Body"],
    items: [{ name: "Iron Blade", quantity: 1, type: "weapon" }]
  },
  mage: {
    name: "Mage",
    desc: "A magic wielder focusing on mana capacity and spells. Starts with an Apprentice Staff.",
    hp: 0, mp: 100, str: 2, def: 2, agi: 8,
    skills: ["Thought Acceleration"],
    magic: ["Magic Bullet"],
    items: [{ name: "Apprentice Staff", quantity: 1, type: "weapon" }]
  },
  rogue: {
    name: "Rogue",
    desc: "A swift assassin focusing on agility and stealth. Starts with a Thief Dagger.",
    hp: 20, mp: 20, str: 4, def: 1, agi: 12,
    skills: ["Hide"],
    items: [{ name: "Thief Dagger", quantity: 1, type: "weapon" }]
  },
  guard: {
    name: "Guard",
    desc: "A defensive protector focusing on high health and blocking. Starts with a Wooden Shield.",
    hp: 80, mp: 0, str: 3, def: 10, agi: -3,
    skills: ["Iron Wall"],
    items: [{ name: "Wooden Shield", quantity: 1, type: "armor" }]
  }
};

const CUSTOM_RACES = {
  slime: {
    name: "Slime",
    skills: ["Dissolve", "Absorb", "Mimicry", "Regeneration"],
    magic: ["Fireball"],
    evolutions: { 1: "Viscous Slime", 2: "Demon Slime", 3: "Viscosity God" },
    spawns: [
      {
        loc: "Sealed Cave",
        intro: "You wake up in a damp cavern dripping with magicules. Ancient sealed energy hums in the air...",
        quests: {
          1: { desc: "Gather 5 Magical Ore from cave nodes.", target: "Magical Ore", qty: 5, type: "gather" },
          2: { desc: "Defeat 3 Water Lizards in the Sealed Cave.", target: "Water Lizard", qty: 3, type: "hunt" },
          3: { desc: "Defeat Veldora's Reflection at bottom-right.", target: "boss_dragon", qty: 1, type: "boss" }
        }
      },
      {
        loc: "Magical Spring",
        intro: "You coalesce near a glowing lake deep in the Jura Forest, surrounded by pure water spirits...",
        quests: {
          1: { desc: "Gather 6 Hipokute Herbs from the spring shore.", target: "Hipokute Herb", qty: 6, type: "gather" },
          2: { desc: "Defeat 4 Cave Bats fluttering over the spring.", target: "Cave Bat", qty: 4, type: "hunt" },
          3: { desc: "Defeat the Abyssal Serpent at bottom-right.", target: "boss_serpent", qty: 1, type: "boss" }
        }
      }
    ]
  },
  dwarf: {
    name: "Dwarf Faction",
    skills: ["Earth Manipulation", "Strengthen Body", "Iron Wall"],
    magic: [],
    evolutions: { 1: "Veteran Smith", 2: "Steel Champion", 3: "Dwarven Hero" },
    spawns: [
      {
        loc: "Armed Nation Dwargon",
        intro: "You stand in the bustling capital of Dwargon. Kaijin asks for your assistance in the forge...",
        quests: {
          1: { desc: "Gather 5 Magical Ore for Master Kaijin.", target: "Magical Ore", qty: 5, type: "gather" },
          2: { desc: "Defeat 5 Dwarf Miners in the smithy district.", target: "Dwarf Miner", qty: 5, type: "hunt" },
          3: { desc: "Spar with King Gazel Dwargo at bottom-right.", target: "boss_gazel", qty: 1, type: "boss" }
        }
      },
      {
        loc: "Dwargon Deep Mines",
        intro: "You are stationed deep in the mine shafts. The tunnels are collapsing and monsters are invading...",
        quests: {
          1: { desc: "Gather 8 Steel Cores from the mineral veins.", target: "Steel Core", qty: 8, type: "gather" },
          2: { desc: "Defeat 4 Cave Bats nesting in the shafts.", target: "Cave Bat", qty: 4, type: "hunt" },
          3: { desc: "Defeat the Subterranean Golem at bottom-right.", target: "boss_golem", qty: 1, type: "boss" }
        }
      }
    ]
  },
  goblin: {
    name: "Goblin Faction",
    skills: ["Danger Detection", "Coercion", "Hide"],
    magic: [],
    evolutions: { 1: "Hobgoblin", 2: "Goblin Rider", 3: "Hobgoblin King" },
    spawns: [
      {
        loc: "Goblin Village Outskirts",
        intro: "You guard the weak wooden fence of your village. Direwolves prowl the borders...",
        quests: {
          1: { desc: "Gather 10 Wood to reinforce defenses.", target: "Wood", qty: 10, type: "gather" },
          2: { desc: "Defeat 4 Direwolves in the forest border.", target: "Direwolf Rogue", qty: 4, type: "hunt" },
          3: { desc: "Defeat the Direwolf Alpha at bottom-right.", target: "boss_direwolf", qty: 1, type: "boss" }
        }
      },
      {
        loc: "Goblin Shamans Cave",
        intro: "The tribe elder asks for your aid to recover a holy relic from the ancestral burial caves...",
        quests: {
          1: { desc: "Gather 6 Hipokute Herbs for the ritual.", target: "Hipokute Herb", qty: 6, type: "gather" },
          2: { desc: "Defeat 4 Wild Boars nesting near the caves.", target: "Wild Boar", qty: 4, type: "hunt" },
          3: { desc: "Defeat the Spectral Wolf Spirit at bottom-right.", target: "boss_spectral_wolf", qty: 1, type: "boss" }
        }
      }
    ]
  },
  lizardman: {
    name: "Lizardman Faction",
    skills: ["Water Blade", "Scale Armor", "Water Current Motion"],
    magic: [],
    evolutions: { 1: "Dragonewt", 2: "Dragon Warrior", 3: "Divine Dragonewt" },
    spawns: [
      {
        loc: "Swamps of Jura",
        intro: "You patrol the humid marsh borders. Rogue lizard factions challenge your authority...",
        quests: {
          1: { desc: "Gather 8 Hipokute Herbs from swamp nodes.", target: "Hipokute Herb", qty: 8, type: "gather" },
          2: { desc: "Defeat 4 Lizardman Soldier rebels.", target: "Lizardman Soldier", qty: 4, type: "hunt" },
          3: { desc: "Defeat Abil the Chieftain at bottom-right.", target: "boss_abil", qty: 1, type: "boss" }
        }
      },
      {
        loc: "Sunken Ruins",
        intro: "You explore the dark, mossy arches of a submerged city, hunting ancient beasts...",
        quests: {
          1: { desc: "Gather 6 Ancient Relics (represented by Magical Ore).", target: "Magical Ore", qty: 6, type: "gather" },
          2: { desc: "Defeat 4 Water Lizards swimming in the ruins.", target: "Water Lizard", qty: 4, type: "hunt" },
          3: { desc: "Defeat the Sunken Archon at bottom-right.", target: "boss_sunken_archon", qty: 1, type: "boss" }
        }
      }
    ]
  },
  ogre: {
    name: "Ogre Faction",
    skills: ["Explosive Flames", "Steel Strength", "Crestwater Slash"],
    magic: [],
    evolutions: { 1: "Kijin", 2: "Oni", 3: "Divine Oni" },
    spawns: [
      {
        loc: "Ogre Mountains",
        intro: "You survey the cold mountain passes. Orc scouts are infiltrating Ogre lands...",
        quests: {
          1: { desc: "Gather 5 Steel Cores to forge weapons.", target: "Steel Core", qty: 5, type: "gather" },
          2: { desc: "Defeat 5 Orc Sentry scouts.", target: "Orc Sentry", qty: 5, type: "hunt" },
          3: { desc: "Defeat the Orc Commander at bottom-right.", target: "boss_orc_commander", qty: 1, type: "boss" }
        }
      },
      {
        loc: "Volcano Edge",
        intro: "You guard the fire rift on the volcanic ridge. Hellish beasts are awakening...",
        quests: {
          1: { desc: "Gather 6 Fire Crystals (represented by Steel Core).", target: "Steel Core", qty: 6, type: "gather" },
          2: { desc: "Defeat 4 Cave Bats living near the lava shafts.", target: "Cave Bat", qty: 4, type: "hunt" },
          3: { desc: "Defeat the Fire Drake at bottom-right.", target: "boss_fire_drake", qty: 1, type: "boss" }
        }
      }
    ]
  },
  human: {
    name: "Human Adventurer",
    skills: ["Thought Acceleration", "Sword Slash", "Chant Annulment"],
    magic: ["Fireball"],
    evolutions: { 1: "Sage", 2: "Saint", 3: "Divine Saint" },
    spawns: [
      {
        loc: "Capital of Engrassia",
        intro: "You enter the Free Guild headquarters. Yuuki has posted a guild test...",
        quests: {
          1: { desc: "Gather 6 Magical Ore for the Free Guild.", target: "Magical Ore", qty: 6, type: "gather" },
          2: { desc: "Defeat 5 Falmuth Soldier scouts.", target: "Falmuth Soldier", qty: 5, type: "hunt" },
          3: { desc: "Spar with Guildmaster Yuuki at bottom-right.", target: "boss_yuuki", qty: 1, type: "boss" }
        }
      },
      {
        loc: "Frontier Outpost",
        intro: "You are assigned to the border outpost. Border raids from monsters are rising...",
        quests: {
          1: { desc: "Gather 8 Wood to fortify the outpost.", target: "Wood", qty: 8, type: "gather" },
          2: { desc: "Defeat 4 Orc Sentry scouts along the border.", target: "Orc Sentry", qty: 4, type: "hunt" },
          3: { desc: "Defeat Falmuth Captain Follow at bottom-right.", target: "boss_captain_follow", qty: 1, type: "boss" }
        }
      }
    ]
  },
  orc: {
    name: "Orc Faction",
    skills: ["Starved", "Body Armor", "Menace"],
    magic: [],
    evolutions: { 1: "Orc General", 2: "Orc King", 3: "Orc Disaster" },
    spawns: [
      {
        loc: "Orc Swarm Outskirts",
        intro: "You march with the starving horde. The marshlands lie ahead...",
        quests: {
          1: { desc: "Gather 10 Stone slabs for base structures.", target: "Stone", qty: 10, type: "gather" },
          2: { desc: "Defeat 4 Lizardman Soldier marsh guards.", target: "Lizardman Soldier", qty: 4, type: "hunt" },
          3: { desc: "Duel Rimuru Tempest at bottom-right.", target: "boss_rimuru", qty: 1, type: "boss" }
        }
      },
      {
        loc: "Dry Swamplands",
        intro: "Your tribe separates from the swarm. A rival Orc Warmonger has taken power...",
        quests: {
          1: { desc: "Gather 8 Wild Roots (represented by Hipokute Herb).", target: "Hipokute Herb", qty: 8, type: "gather" },
          2: { desc: "Defeat 5 Giant Centipedes infesting the swamp.", target: "Giant Centipede", qty: 5, type: "hunt" },
          3: { desc: "Defeat the Orc Usurper at bottom-right.", target: "boss_orc_usurper", qty: 1, type: "boss" }
        }
      }
    ]
  },
  dragonoid: {
    name: "Dragonoid Faction",
    skills: ["Dragon Skin", "Haki", "Coercion"],
    magic: ["Fireball"],
    evolutions: { 1: "Dragon Disciple", 2: "Chosen Dragonoid", 3: "Dragon Deity" },
    spawns: [
      {
        loc: "Worshippers Sanctuary",
        intro: "You pray in the sacred sanctuary. Priest Hermes issues a holy spar trial...",
        quests: {
          1: { desc: "Gather 5 Magical Ore for the dragon ritual.", target: "Magical Ore", qty: 5, type: "gather" },
          2: { desc: "Defeat 5 Temple Mages in the arena.", target: "Temple Mage", qty: 5, type: "hunt" },
          3: { desc: "Duel Priest Hermes at bottom-right.", target: "boss_hermes", qty: 1, type: "boss" }
        }
      },
      {
        loc: "Dragon Valley",
        intro: "You train in the steep valley winds, where ancient dragons fly...",
        quests: {
          1: { desc: "Gather 6 Dragon Flowers (represented by Hipokute Herb).", target: "Hipokute Herb", qty: 6, type: "gather" },
          2: { desc: "Defeat 4 Wyverns (represented by Cave Bat) in the skies.", target: "Cave Bat", qty: 4, type: "hunt" },
          3: { desc: "Defeat the Ancient Wyvern Lord at bottom-right.", target: "boss_wyvern_lord", qty: 1, type: "boss" }
        }
      }
    ]
  },
  demon: {
    name: "Demon Faction",
    skills: ["Chant Annulment", "Thought Acceleration", "Darkness Manipulation"],
    magic: ["Magic Bullet"],
    evolutions: { 1: "Archdemon", 2: "Demon Peer", 3: "Devil Lord" },
    spawns: [
      {
        loc: "Spiritual Underworld",
        intro: "You materialize in the dark abyss of the Spiritual World. The air is thick with raw magicules, and lesser spirits scream in the void...",
        quests: {
          1: { desc: "Gather 8 Chaos Shards.", target: "Magical Ore", qty: 8, type: "gather" },
          2: { desc: "Defeat 4 Lesser Demons in the spirit wastes.", target: "Lesser Demon", qty: 4, type: "hunt" },
          3: { desc: "Spar with Primordial White Testarossa at bottom-right.", target: "boss_testarossa", qty: 1, type: "boss" }
        }
      },
      {
        loc: "Frozen Demon Palace",
        intro: "You awaken in the biting cold winds of the Frozen Continent. The crimson palace of Lord Guy Crimson looms in the distance...",
        quests: {
          1: { desc: "Gather 8 Frost Crystals.", target: "Steel Core", qty: 8, type: "gather" },
          2: { desc: "Defeat 4 Ice Phantoms in the glacier fields.", target: "Ice Phantom", qty: 4, type: "hunt" },
          3: { desc: "Duel Rain's Avatar at bottom-right.", target: "boss_rain", qty: 1, type: "boss" }
        }
      }
    ]
  }
};

const CUSTOM_AREAS = {
  "Sealed Cave": { name: "Sealed Cave", enemyPool: ["Cave Bat", "Water Lizard", "Giant Centipede"] },
  "Magical Spring": { name: "Magical Spring", enemyPool: ["Water Lizard", "Cave Bat", "Giant Centipede"] },
  "Armed Nation Dwargon": { name: "Armed Nation Dwargon", enemyPool: ["Dwarf Miner", "Cave Bat", "Wild Boar"] },
  "Dwargon Deep Mines": { name: "Dwargon Deep Mines", enemyPool: ["Dwarf Miner", "Cave Bat", "Giant Centipede"] },
  "Goblin Village Outskirts": { name: "Goblin Village Outskirts", enemyPool: ["Goblin Scout", "Direwolf Rogue", "Wild Boar"] },
  "Goblin Shamans Cave": { name: "Goblin Shamans Cave", enemyPool: ["Cave Bat", "Direwolf Rogue", "Goblin Scout"] },
  "Swamps of Jura": { name: "Swamps of Jura", enemyPool: ["Lizardman Soldier", "Orc Sentry", "Water Lizard"] },
  "Sunken Ruins": { name: "Sunken Ruins", enemyPool: ["Water Lizard", "Giant Centipede", "Lizardman Soldier"] },
  "Ogre Mountains": { name: "Ogre Mountains", enemyPool: ["Orc Sentry", "Direwolf Rogue", "Wild Boar"] },
  "Volcano Edge": { name: "Volcano Edge", enemyPool: ["Cave Bat", "Orc Sentry", "Wild Boar"] },
  "Capital of Engrassia": { name: "Capital of Engrassia", enemyPool: ["Falmuth Soldier", "Falmuth Knight", "Temple Mage"] },
  "Frontier Outpost": { name: "Frontier Outpost", enemyPool: ["Orc Sentry", "Falmuth Soldier", "Temple Mage"] },
  "Orc Swarm Outskirts": { name: "Orc Swarm Outskirts", enemyPool: ["Lizardman Soldier", "Water Lizard", "Wild Boar"] },
  "Dry Swamplands": { name: "Dry Swamplands", enemyPool: ["Giant Centipede", "Water Lizard", "Orc Sentry"] },
  "Worshippers Sanctuary": { name: "Worshippers Sanctuary", enemyPool: ["Temple Mage", "Falmuth Knight", "Giant Centipede"] },
  "Dragon Valley": { name: "Dragon Valley", enemyPool: ["Cave Bat", "Falmuth Knight", "Giant Centipede"] },
  "Spiritual Underworld": { name: "Spiritual Underworld", enemyPool: ["Lesser Demon", "Cave Bat", "Giant Centipede"] },
  "Frozen Demon Palace": { name: "Frozen Demon Palace", enemyPool: ["Ice Phantom", "Falmuth Knight", "Giant Centipede"] }
};

export default function App() {
  // Game states
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Initializing System...");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [created, setCreated] = useState(false);
  const [showHud, setShowHud] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null); // null, "milim"
  const [setupScreen, setSetupScreen] = useState("intro"); // intro, custom_creation, story_intro, playing
  const [customName, setCustomName] = useState("");
  const [selectedRaceKey, setSelectedRaceKey] = useState("slime");
  const [selectedClassKey, setSelectedClassKey] = useState("warrior");
  const [customStatsPoints, setCustomStatsPoints] = useState(20);
  const [customStats, setCustomStats] = useState({ hp: 0, mp: 0, str: 0, def: 0, agi: 0 });
  const [creationPhase, setCreationPhase] = useState("race"); // race, class, points
  const [activeCustomEvent, setActiveCustomEvent] = useState(null); // null, or { type: "merchant" | "shrine" | "dungeon" }
  const [shrineSkills, setShrineSkills] = useState([]);

  // Database lists
  const [skillsDb, setSkillsDb] = useState({});
  const [magicDb, setMagicDb] = useState({});
  const [speciesDb, setSpeciesDb] = useState({});
  const [itemsDb, setItemsDb] = useState({});
  const [allSkillsList, setAllSkillsList] = useState([]);

  // Rimuru (Player) Core State
  const [rimuru, setRimuru] = useState({
    name: "Rimuru Tempest",
    species: "Slime",
    chapter: 1, // 1 to 5
    ep: 100,
    hp: 120,
    maxHp: 120,
    mp: 150,
    maxMp: 150,
    str: 10,
    def: 15,
    agi: 15,
    skills: ["Dissolve", "Absorb", "Mimicry", "Regeneration"],
    magic: ["Fireball"],
    allies: [], // named subordinates
    inventory: [
      { name: "Anti-magic Mask", quantity: 1, type: "accessory" }
    ],
    equippedWeapon: null,
    equippedArmor: null,
    equippedAccessory: null,
    location: "Sealed Cave",
    sleepTurns: 0, // sleep turns remaining
    veldoraNamed: false,
    direwolvesDefeated: false,
    ogresNamed: false,
    orcLordDefeated: false,
    milimBefriended: false,
    charybdisDefeated: false,
    hinataDefeated: false,
    megiddoCast: false,
    claymanDefeated: false,
    octagramFounded: false,
    labyrinthBuilt: false,
    labyrinthCleared: false,
    hinataReconciled: false,
    calgurioDefeated: false,
    patronDeitiesEvolved: false,
    collectedSouls: 0,
    michaelDefeated: false,
    cthughaUnlocked: false,
    dungeonFloor: 1,
    maxLabyrinthFloorCleared: 0,
    zegionDefeated: false,
    postGame: false,
    postGameBossCount: 0,
    customMode: false,
    customRace: "",
    customSpawnIndex: 0,
    customClass: "",
    customQuestStep: 1,
    customQuestCount: 0,
    town: {
      dwellings: 0,
      smithy: 0,
      laboratory: 0,
      goblins: 0,
      orcs: 0,
      wood: 0,
      stone: 0
    }
  });

  // Maze state
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });

  // Gameplay text logs
  const [logs, setLogs] = useState([
    { type: "system", text: "VOICE OF THE WORLD ONLINE. Reincarnation Sequence pending..." }
  ]);

  // UI state
  const [activeScreen, setActiveScreen] = useState("main"); // main, status, lab, town
  const [selectedSkillsForFusion, setSelectedSkillsForFusion] = useState([]);
  const [selectedSkillDetails, setSelectedSkillDetails] = useState(null);
  const [combat, setCombat] = useState(null); // null or combat active
  const [terminalInput, setTerminalInput] = useState("");
  const [autoCombat, setAutoCombat] = useState(false);
  
  const consoleEndRef = useRef(null);

  // Auto-scroll console output to bottom when new logs appear
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, combat]);

  // Load and save voice setting
  useEffect(() => {
    const savedAudio = localStorage.getItem('tensura_rpg_audio');
    if (savedAudio === 'true') {
      setAudioEnabled(true);
    }
  }, []);

  const toggleAudio = () => {
    playSound("click");
    setAudioEnabled(prev => {
      const next = !prev;
      localStorage.setItem('tensura_rpg_audio', String(next));
      addLog("system", `Audio system announcements toggled to: ${next ? "ENABLED" : "DISABLED"}`);
      return next;
    });
  };

  const addLog = (type, text) => {
    setLogs(prev => [...prev.slice(-99), { type, text }]);
  };

  const handleReincarnate = () => {
    setCreated(true);
    addLog("voice", "[Voice of the World]: Reincarnation complete. Species: Slime.");
    addLog("voice", "[Voice of the World]: Acquired Intrinsic Skills: 'Dissolve', 'Absorb', 'Mimicry', 'Regeneration'.");
    addLog("explore", "You awaken as a tiny blue slime in a pitch-black cave. You feel mystical energies around you.");
  };

  const handleCustomReincarnate = () => {
    playSound("level");
    const raceData = CUSTOM_RACES[selectedRaceKey];
    const classData = CUSTOM_CLASSES[selectedClassKey];
    
    // Pick random spawn location for this race
    const spawnIdx = Math.floor(Math.random() * raceData.spawns.length);
    const spawn = raceData.spawns[spawnIdx];

    // Compute stats with point buy allocation:
    // hp: +15, mp: +20, str: +1, def: +1, agi: +1 per point
    const baseHp = selectedRaceKey === "slime" ? 120 : selectedRaceKey === "dwarf" ? 200 : selectedRaceKey === "goblin" ? 100 : selectedRaceKey === "lizardman" ? 150 : selectedRaceKey === "ogre" ? 220 : selectedRaceKey === "human" ? 110 : selectedRaceKey === "orc" ? 250 : selectedRaceKey === "dragonoid" ? 300 : selectedRaceKey === "demon" ? 130 : 140;
    const baseMp = selectedRaceKey === "slime" ? 150 : selectedRaceKey === "dwarf" ? 80 : selectedRaceKey === "goblin" ? 60 : selectedRaceKey === "lizardman" ? 100 : selectedRaceKey === "ogre" ? 120 : selectedRaceKey === "human" ? 200 : selectedRaceKey === "orc" ? 50 : selectedRaceKey === "dragonoid" ? 300 : selectedRaceKey === "demon" ? 400 : 280;
    const baseStr = selectedRaceKey === "slime" ? 10 : selectedRaceKey === "dwarf" ? 22 : selectedRaceKey === "goblin" ? 8 : selectedRaceKey === "lizardman" ? 14 : selectedRaceKey === "ogre" ? 28 : selectedRaceKey === "human" ? 12 : selectedRaceKey === "orc" ? 24 : selectedRaceKey === "dragonoid" ? 35 : selectedRaceKey === "demon" ? 20 : 18;
    const baseDef = selectedRaceKey === "slime" ? 15 : selectedRaceKey === "dwarf" ? 25 : selectedRaceKey === "goblin" ? 8 : selectedRaceKey === "lizardman" ? 18 : selectedRaceKey === "ogre" ? 14 : selectedRaceKey === "human" ? 10 : selectedRaceKey === "orc" ? 18 : selectedRaceKey === "dragonoid" ? 30 : selectedRaceKey === "demon" ? 6 : 10;
    const baseAgi = selectedRaceKey === "slime" ? 15 : selectedRaceKey === "dwarf" ? 8 : selectedRaceKey === "goblin" ? 16 : selectedRaceKey === "lizardman" ? 12 : selectedRaceKey === "ogre" ? 15 : selectedRaceKey === "human" ? 14 : selectedRaceKey === "orc" ? 6 : selectedRaceKey === "dragonoid" ? 30 : selectedRaceKey === "demon" ? 30 : 22;


    const finalMaxHp = baseHp + classData.hp + customStats.hp * 15;
    const finalMaxMp = baseMp + classData.mp + customStats.mp * 20;
    const finalStr = baseStr + classData.str + customStats.str;
    const finalDef = baseDef + classData.def + customStats.def;
    const finalAgi = baseAgi + classData.agi + customStats.agi;

    const initialInventory = [
      { name: "Anti-magic Mask", quantity: 1, type: "accessory" },
      ...classData.items.map(item => ({ ...item }))
    ];

    const initialSkills = Array.from(new Set([...raceData.skills, ...classData.skills]));
    const initialMagic = Array.from(new Set([...(raceData.magic || []), ...(classData.magic || [])]));

    setRimuru({
      name: customName,
      species: raceData.name,
      chapter: 1,
      ep: 500,
      hp: finalMaxHp,
      maxHp: finalMaxHp,
      mp: finalMaxMp,
      maxMp: finalMaxMp,
      str: finalStr,
      def: finalDef,
      agi: finalAgi,
      skills: initialSkills,
      magic: initialMagic,
      allies: [],
      inventory: initialInventory,
      equippedWeapon: classData.items.find(i => i.type === "weapon") ? classData.items.find(i => i.type === "weapon").name : null,
      equippedArmor: classData.items.find(i => i.type === "armor") ? classData.items.find(i => i.type === "armor").name : null,
      equippedAccessory: null,
      location: spawn.loc,
      sleepTurns: 0,
      veldoraNamed: false,
      direwolvesDefeated: false,
      ogresNamed: false,
      orcLordDefeated: false,
      milimBefriended: false,
      charybdisDefeated: false,
      hinataDefeated: false,
      megiddoCast: false,
      claymanDefeated: false,
      octagramFounded: false,
      labyrinthBuilt: false,
      labyrinthCleared: false,
      hinataReconciled: false,
      calgurioDefeated: false,
      patronDeitiesEvolved: false,
      collectedSouls: 0,
      michaelDefeated: false,
      postGame: false,
      postGameBossCount: 0,
      customMode: true,
      customRace: selectedRaceKey,
      customSpawnIndex: spawnIdx,
      customClass: selectedClassKey,
      customQuestStep: 1,
      customQuestCount: 0,
      town: {
        dwellings: 0,
        smithy: 0,
        laboratory: 0,
        goblins: 0,
        orcs: 0,
        wood: 0,
        stone: 0
      }
    });

    generateCustomRaceMaze(selectedRaceKey, 1, spawnIdx);

    addLog("voice", `[Voice of the World]: Reincarnation complete. Background: ${classData.name}. Species: ${raceData.name}.`);
    addLog("voice", `[Voice of the World]: Acquired Skills: ${initialSkills.join(", ")}.`);
    addLog("explore", `${spawn.intro}`);
    addLog("explore", `You awaken as a named ${raceData.name} in ${spawn.loc}. Your journey begins.`);
    setCreated(true);
    setSetupScreen("playing");
  };

  const generateCustomRaceMaze = (raceKey, step, customSpawnIdx = 0) => {
    const size = 7;
    const newMaze = Array(size).fill(null).map(() => Array(size).fill('.'));
    newMaze[0][0] = 'P';

    // Obstacle walls
    const walls = [
      [1, 1], [1, 2], [1, 4], [1, 5],
      [3, 1], [3, 3], [3, 5],
      [5, 1], [5, 2], [5, 4], [5, 5]
    ];
    walls.forEach(([wy, wx]) => {
      newMaze[wy][wx] = '#';
    });

    // Place Resource Nodes 'O' (5 nodes)
    let placedO = 0;
    while (placedO < 5) {
      const rx = Math.floor(Math.random() * size);
      const ry = Math.floor(Math.random() * size);
      if (newMaze[ry][rx] === '.') {
        newMaze[ry][rx] = 'O';
        placedO++;
      }
    }

    // Place Enemy Tiles 'E' (5 nodes)
    let placedE = 0;
    while (placedE < 5) {
      const rx = Math.floor(Math.random() * size);
      const ry = Math.floor(Math.random() * size);
      if (newMaze[ry][rx] === '.') {
        newMaze[ry][rx] = 'E';
        placedE++;
      }
    }

    // Interactive Nodes
    newMaze[3][2] = 'T'; // Faction Trading Post
    newMaze[2][3] = 'S'; // Ancient Shrine
    newMaze[4][3] = 'D'; // Dungeon Trap

    if (step === 3) {
      newMaze[size - 1][size - 1] = 'X'; // Boss
    }

    setMaze(newMaze);
    setPlayerPos({ x: 0, y: 0 });
  };

  const advanceCustomQuest = () => {
    playSound("level");
    const nextStep = rimuru.customQuestStep + 1;
    const currentEvo = CUSTOM_RACES[rimuru.customRace].evolutions[rimuru.customQuestStep];
    setRimuru(prev => {
      const nextState = {
        ...prev,
        species: currentEvo || prev.species,
        customQuestStep: nextStep,
        customQuestCount: 0,
        maxHp: prev.maxHp + 150,
        hp: prev.maxHp + 150,
        maxMp: prev.maxMp + 100,
        mp: prev.maxMp + 100,
        str: prev.str + 25,
        def: prev.def + 20,
        agi: prev.agi + 20,
        ep: prev.ep + 25000
      };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", `[Voice of the World]: Evolution trigger accepted. Species reconstructed to '${currentEvo}'.`);
    addLog("explore", `You evolved into a ${currentEvo}! Stats increased and next quest unlocked.`);
    generateCustomRaceMaze(rimuru.customRace, nextStep, rimuru.customSpawnIndex);
  };

  const triggerCustomBoss = () => {
    const race = rimuru.customRace;
    const spawnIdx = rimuru.customSpawnIndex || 0;
    const spawn = CUSTOM_RACES[race]?.spawns[spawnIdx];
    if (!spawn) return;
    const quest = spawn.quests[3];

    let bossName = "Unknown Threat";
    let stats = { hp: 5000, ep: 100000, str: 100, def: 100, agi: 100, bossId: "custom_boss" };

    if (quest.target === "boss_dragon") { bossName = "Veldora's Reflection"; stats = { hp: 8000, ep: 100000, str: 180, def: 150, agi: 120, bossId: "custom_boss" }; }
    else if (quest.target === "boss_serpent") { bossName = "Abyssal Serpent"; stats = { hp: 6000, ep: 90000, str: 160, def: 120, agi: 140, bossId: "custom_boss" }; }
    else if (quest.target === "boss_gazel") { bossName = "King Gazel Dwargo"; stats = { hp: 12000, ep: 450000, str: 400, def: 350, agi: 300, bossId: "custom_boss" }; }
    else if (quest.target === "boss_golem") { bossName = "Subterranean Golem"; stats = { hp: 8500, ep: 150000, str: 250, def: 300, agi: 100, bossId: "custom_boss" }; }
    else if (quest.target === "boss_direwolf") { bossName = "Direwolf Alpha"; stats = { hp: 1500, ep: 15000, str: 60, def: 40, agi: 70, bossId: "custom_boss" }; }
    else if (quest.target === "boss_spectral_wolf") { bossName = "Spectral Wolf Spirit"; stats = { hp: 1800, ep: 18000, str: 70, def: 50, agi: 90, bossId: "custom_boss" }; }
    else if (quest.target === "boss_abil") { bossName = "Abil the Lizard Chieftain"; stats = { hp: 4000, ep: 80000, str: 140, def: 120, agi: 130, bossId: "custom_boss" }; }
    else if (quest.target === "boss_sunken_archon") { bossName = "Sunken Archon"; stats = { hp: 5000, ep: 100000, str: 150, def: 160, agi: 120, bossId: "custom_boss" }; }
    else if (quest.target === "boss_orc_commander") { bossName = "Orc Commander"; stats = { hp: 6000, ep: 120000, str: 220, def: 180, agi: 90, bossId: "custom_boss" }; }
    else if (quest.target === "boss_fire_drake") { bossName = "Fire Drake"; stats = { hp: 7000, ep: 130000, str: 240, def: 150, agi: 180, bossId: "custom_boss" }; }
    else if (quest.target === "boss_yuuki") { bossName = "Guildmaster Yuuki"; stats = { hp: 9000, ep: 350000, str: 350, def: 280, agi: 400, bossId: "custom_boss" }; }
    else if (quest.target === "boss_captain_follow") { bossName = "Falmuth Captain Follow"; stats = { hp: 7500, ep: 180000, str: 280, def: 220, agi: 200, bossId: "custom_boss" }; }
    else if (quest.target === "boss_rimuru") { bossName = "Rimuru Tempest (Avatar)"; stats = { hp: 10000, ep: 500000, str: 450, def: 400, agi: 450, bossId: "custom_boss" }; }
    else if (quest.target === "boss_orc_usurper") { bossName = "Orc Usurper"; stats = { hp: 8500, ep: 220000, str: 320, def: 240, agi: 80, bossId: "custom_boss" }; }
    else if (quest.target === "boss_hermes") { bossName = "Priest Hermes"; stats = { hp: 8000, ep: 250000, str: 300, def: 250, agi: 350, bossId: "custom_boss" }; }
    else if (quest.target === "boss_wyvern_lord") { bossName = "Ancient Wyvern Lord"; stats = { hp: 9000, ep: 280000, str: 350, def: 280, agi: 300, bossId: "custom_boss" }; }
    else if (quest.target === "boss_testarossa") { bossName = "Primordial White Testarossa"; stats = { hp: 11000, ep: 400000, str: 380, def: 300, agi: 450, bossId: "custom_boss" }; }
    else if (quest.target === "boss_rain") { bossName = "Primordial Blue Rain"; stats = { hp: 10500, ep: 380000, str: 360, def: 320, agi: 400, bossId: "custom_boss" }; }

    addLog("explore", `Warning! You stand before your destiny boss: ${bossName}!`);
    startCombat(bossName, { hp: stats.hp, ep: stats.ep, str: stats.str, def: stats.def, agi: stats.agi, isBoss: true, bossId: stats.bossId });
  };

  // CUSTOM GAME MODE EVENTS AND TOWN ACTIONS
  const usePotionOutsideCombat = (itemName) => {
    playSound("click");
    if (itemName === "Hipokute Potion") {
      if (rimuru.hp >= rimuru.maxHp) {
        addLog("system", "SYS: HP is already at maximum.");
        return;
      }
      consumeInventoryItem("Hipokute Potion", 1);
      setRimuru(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 150) }));
      addLog("explore", "You consume a Hipokute Potion and restore 150 HP.");
      playSound("spell");
    } else if (itemName === "Magicule Elixir") {
      if (rimuru.mp >= rimuru.maxMp) {
        addLog("system", "SYS: MP is already at maximum.");
        return;
      }
      consumeInventoryItem("Magicule Elixir", 1);
      setRimuru(prev => ({ ...prev, mp: Math.min(prev.maxMp, prev.mp + 100) }));
      addLog("explore", "You consume a Magicule Elixir and restore 100 MP.");
      playSound("spell");
    }
  };

  const handleMerchantAction = (actionType, detail) => {
    playSound("click");
    if (actionType === "buy_potion") {
      const epCost = 50;
      const hasOre = getInventoryQty("Magical Ore") >= 1;
      const hasEp = rimuru.ep >= epCost;
      
      if (detail === "ore" && hasOre) {
        consumeInventoryItem("Magical Ore", 1);
        addInventoryItem("Hipokute Potion", "healing");
        addLog("explore", "Merchant: Gained Hipokute Potion in exchange for 1 Magical Ore.");
      } else if (detail === "ep" && hasEp) {
        setRimuru(prev => ({ ...prev, ep: prev.ep - epCost }));
        addInventoryItem("Hipokute Potion", "healing");
        addLog("explore", `Merchant: Gained Hipokute Potion in exchange for ${epCost} EP.`);
      } else {
        addLog("system", "Merchant: Insufficient currency/resource.");
      }
    } else if (actionType === "buy_elixir") {
      const epCost = 50;
      const hasCore = getInventoryQty("Steel Core") >= 1;
      const hasEp = rimuru.ep >= epCost;
      
      if (detail === "core" && hasCore) {
        consumeInventoryItem("Steel Core", 1);
        addInventoryItem("Magicule Elixir", "magic");
        addLog("explore", "Merchant: Gained Magicule Elixir in exchange for 1 Steel Core.");
      } else if (detail === "ep" && hasEp) {
        setRimuru(prev => ({ ...prev, ep: prev.ep - epCost }));
        addInventoryItem("Magicule Elixir", "magic");
        addLog("explore", `Merchant: Gained Magicule Elixir in exchange for ${epCost} EP.`);
      } else {
        addLog("system", "Merchant: Insufficient currency/resource.");
      }
    } else if (actionType === "hire_merc") {
      const epCost = 300;
      const oreCost = 5;
      const hasOre = getInventoryQty("Magical Ore") >= oreCost;
      const hasEp = rimuru.ep >= epCost;
      
      const names = {
        slime: ["Water Elemental", "Slime Coalescence", "Magicule Blob"],
        dwarf: ["Dwarven Sapper", "Dwarven Defender", "Dwarven Marksman"],
        goblin: ["Goblin Hunter", "Goblin Skirmisher", "Goblin Wolf-Rider"],
        lizardman: ["Lizardman Spearman", "Swamp Scout", "Draconic Guard"],
        ogre: ["Ogre Vanguard", "Ogre Skirmisher", "Ogre Flame-Wielder"],
        human: ["Guild Mercenary", "Spellsword Recruit", "Shield Knight"],
        orc: ["Orc Ironclad", "Orc Berserker", "Orc Marauder"],
        dragonoid: ["Dragon Acolyte", "Dragon Sentinel", "Dragon Zealot"],
        demon: ["Lesser Imp", "Demon Vanguard", "Fallen Archdemon"]
      };
      const raceList = names[rimuru.customRace] || ["Mercenary Recruit", "Contract Knight", "Free Archer"];
      const hiredCount = rimuru.allies.filter(a => raceList.some(rName => a.startsWith(rName))).length;
      if (hiredCount >= 3) {
        addLog("system", "Merchant: You have already hired the maximum number of mercenaries for this region.");
        return;
      }
      const newAllyName = `${raceList[hiredCount]} (Level ${hiredCount + 1})`;
      
      if (detail === "ore" && hasOre) {
        consumeInventoryItem("Magical Ore", oreCost);
        setRimuru(prev => ({ ...prev, allies: [...prev.allies, newAllyName] }));
        addLog("explore", `Merchant: Hired ${newAllyName} in exchange for ${oreCost} Magical Ore.`);
        playSound("level");
      } else if (detail === "ep" && hasEp) {
        setRimuru(prev => ({ ...prev, ep: prev.ep - epCost, allies: [...prev.allies, newAllyName] }));
        addLog("explore", `Merchant: Hired ${newAllyName} in exchange for ${epCost} EP.`);
        playSound("level");
      } else {
        addLog("system", "Merchant: Insufficient currency/resource.");
      }
    } else if (actionType === "leave") {
      setActiveCustomEvent(null);
      addLog("explore", "You step away from the Trading Post.");
    }
  };

  const handleShrineAction = (actionType, detail) => {
    playSound("level");
    if (actionType === "bless_str") {
      setRimuru(prev => ({ ...prev, str: prev.str + 5 }));
      addLog("explore", "Shrine: The runic pillars flare. Your Strength (STR) increases by 5!");
    } else if (actionType === "bless_def") {
      setRimuru(prev => ({ ...prev, def: prev.def + 5 }));
      addLog("explore", "Shrine: The runic pillars flare. Your Defense (DEF) increases by 5!");
    } else if (actionType === "bless_agi") {
      setRimuru(prev => ({ ...prev, agi: prev.agi + 5 }));
      addLog("explore", "Shrine: The runic pillars flare. Your Agility (AGI) increases by 5!");
    } else if (actionType === "learn_skill") {
      const skillName = detail;
      if (skillName && !rimuru.skills.includes(skillName)) {
        setRimuru(prev => ({ ...prev, skills: [...prev.skills, skillName] }));
        addLog("explore", `Shrine: Divine wisdom flows. You have learned the skill: [${skillName}]!`);
      }
    }
    setActiveCustomEvent(null);
  };

  const handleDungeonAction = (choiceType) => {
    playSound("click");
    const trapIdx = activeCustomEvent?.trapIndex ?? 0;
    
    if (trapIdx === 0) {
      if (choiceType === "jump") {
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + rimuru.agi;
        if (total >= 20) {
          addLog("explore", `Dungeon: You vault across the pit with a perfect flip (Roll: ${roll} + AGI ${rimuru.agi} = ${total} >= 20). Gained 50 EP for style!`);
          setRimuru(prev => ({ ...prev, ep: prev.ep + 50 }));
          playSound("level");
        } else {
          const dmg = 40;
          addLog("explore", `Dungeon: You slip and crash into iron spikes (Roll: ${roll} + AGI ${rimuru.agi} = ${total} < 20). Took ${dmg} physical damage.`);
          setRimuru(prev => ({ ...prev, hp: Math.max(1, prev.hp - dmg) }));
          playSound("hit");
        }
      } else if (choiceType === "brace") {
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + rimuru.def;
        if (total >= 22) {
          addLog("explore", `Dungeon: Your armor absorbs the shock beautifully (Roll: ${roll} + DEF ${rimuru.def} = ${total} >= 22). Took only 10 damage and found 1 Steel Core at the bottom!`);
          setRimuru(prev => ({ ...prev, hp: Math.max(1, prev.hp - 10) }));
          addInventoryItem("Steel Core", "material");
          playSound("level");
        } else {
          const dmg = 30;
          addLog("explore", `Dungeon: The spikes pierce your guard (Roll: ${roll} + DEF ${rimuru.def} = ${total} < 22). Took ${dmg} physical damage.`);
          setRimuru(prev => ({ ...prev, hp: Math.max(1, prev.hp - dmg) }));
          playSound("hit");
        }
      }
    } else if (trapIdx === 1) {
      if (choiceType === "rush") {
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + rimuru.agi;
        if (total >= 22) {
          addLog("explore", `Dungeon: You speed run through the corridor (Roll: ${roll} + AGI ${rimuru.agi} = ${total} >= 22). Escaped the cloud with zero poison exposure!`);
          playSound("level");
        } else {
          const dmg = 30;
          addLog("explore", `Dungeon: You inhale noxious magicule fumes (Roll: ${roll} + AGI ${rimuru.agi} = ${total} < 22). Gained poisoning: Lost ${dmg} HP and 20 MP.`);
          setRimuru(prev => ({ ...prev, hp: Math.max(1, prev.hp - dmg), mp: Math.max(0, prev.mp - 20) }));
          playSound("hit");
        }
      } else if (choiceType === "disperse") {
        addLog("explore", `Dungeon: Using elemental arts, you disperse the toxic cloud! Clear pathway secured. Gained 50 EP.`);
        setRimuru(prev => ({ ...prev, ep: prev.ep + 50 }));
        playSound("spell");
      }
    } else if (trapIdx === 2) {
      if (choiceType === "force") {
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + rimuru.str;
        if (total >= 25) {
          addLog("explore", `Dungeon: You smash the chest lock with sheer brute force (Roll: ${roll} + STR ${rimuru.str} = ${total} >= 25). Found 2 Magical Ore and 1 Steel Core!`);
          addInventoryItem("Magical Ore", "material");
          addInventoryItem("Magical Ore", "material");
          addInventoryItem("Steel Core", "material");
          playSound("level");
        } else {
          const dmg = 25;
          addLog("explore", `Dungeon: The lid backfires and shocks you (Roll: ${roll} + STR ${rimuru.str} = ${total} < 25). Took ${dmg} electrical damage.`);
          setRimuru(prev => ({ ...prev, hp: Math.max(1, prev.hp - dmg) }));
          playSound("hit");
        }
      } else if (choiceType === "decipher") {
        const hasSkill = rimuru.skills.includes("Thought Acceleration");
        if (hasSkill) {
          addLog("explore", "Dungeon: [Thought Acceleration] calculates the runic cipher in milliseconds! Unlocked 1 Magicule Elixir, 1 Hipokute Potion, and 100 EP.");
          addInventoryItem("Magicule Elixir", "magic");
          addInventoryItem("Hipokute Potion", "healing");
          setRimuru(prev => ({ ...prev, ep: prev.ep + 100 }));
          playSound("level");
        } else {
          setRimuru(prev => ({ ...prev, mp: Math.max(0, prev.mp - 30) }));
          addLog("explore", "Dungeon: You exhaust 30 MP to align the rune seals. Success! Unlocked 1 Magicule Elixir, 1 Hipokute Potion, and 100 EP.");
          addInventoryItem("Magicule Elixir", "magic");
          addInventoryItem("Hipokute Potion", "healing");
          setRimuru(prev => ({ ...prev, ep: prev.ep + 100 }));
          playSound("spell");
        }
      } else if (choiceType === "leave") {
        addLog("explore", "Dungeon: You leave the chest locked and walk away.");
      }
    }
    setActiveCustomEvent(null);
  };

  const descendCorridor = () => {
    playSound("click");
    if (rimuru.mp < 15) {
      addLog("system", "SYS: Insufficient MP to traverse the labyrinth. Meditate or consume Magicule Elixir.");
      return;
    }
    const currentFloor = rimuru.dungeonFloor || 1;
    if (currentFloor % 10 === 0 && (rimuru.maxLabyrinthFloorCleared || 0) < currentFloor) {
      addLog("explore", `A dense spatial barrier blocks the path down on Floor ${currentFloor}. You must defeat the Floor Guardian first!`);
      return;
    }
    if (currentFloor >= 100) {
      addLog("explore", "You have reached the ultimate floor (Floor 100). No further descent is possible.");
      return;
    }
    setRimuru(prev => {
      const nextFloor = (prev.dungeonFloor || 1) + 1;
      return {
        ...prev,
        mp: Math.max(0, prev.mp - 15),
        dungeonFloor: nextFloor
      };
    });
    const nextFloor = currentFloor + 1;
    addLog("explore", `You step into the dark gateway and descend to Labyrinth Floor ${nextFloor}...`);
    const roll = Math.random();
    if (roll < 0.5) {
      let mob = "Labyrinth Basilisk";
      if (nextFloor <= 30) {
        const mobs = ["Cave Bat", "Water Lizard", "Giant Centipede", "Goblin Scout", "Direwolf Rogue", "Lesser Demon"];
        mob = mobs[Math.floor(Math.random() * mobs.length)];
      } else if (nextFloor <= 60) {
        const mobs = ["Orc Sentry", "Lizardman Soldier", "Direwolf Group", "Temple Mage", "Ice Phantom", "Labyrinth Basilisk"];
        mob = mobs[Math.floor(Math.random() * mobs.length)];
      } else if (nextFloor <= 90) {
        const mobs = ["Labyrinth Gargoyle", "Empire Soldier", "Empire Mage", "Orc General", "Lizardman Elite"];
        mob = mobs[Math.floor(Math.random() * mobs.length)];
      } else {
        const mobs = ["Empire Knight", "Phantom Soldier", "Fallen Angel", "Seraphim Vanguard"];
        mob = mobs[Math.floor(Math.random() * mobs.length)];
      }
      setTimeout(() => {
        addLog("explore", `An aggressive [${mob}] ambushes you in the dark corridor!`);
        startCombat(mob);
      }, 800);
    } else if (roll < 0.8) {
      setTimeout(() => {
        const resRoll = Math.random();
        if (resRoll < 0.4) {
          addInventoryItem("Magical Ore", "material");
          addLog("explore", "You discover a vein of glistening Magical Ore and extract 1 unit.");
        } else if (resRoll < 0.7) {
          addInventoryItem("Steel Core", "material");
          addLog("explore", "You scavenge a discarded weapons pile and find 1x Steel Core.");
        } else {
          addInventoryItem("Hipokute Herb", "material");
          addLog("explore", "You harvest a glowing green Hipokute Herb growing in a damp crevice.");
        }
        playSound("item");
      }, 800);
    } else {
      setTimeout(() => {
        addLog("explore", "The corridor is quiet. You find nothing but cold stone walls.");
      }, 800);
    }
  };

  const confrontLabyrinthGuardian = () => {
    playSound("click");
    const currentFloor = rimuru.dungeonFloor || 1;
    if (currentFloor % 10 !== 0) {
      addLog("explore", "There is no guardian on this floor. Keep descending until you reach a tenth floor (10, 20, 30, ...).");
      return;
    }
    
    let bossName = "";
    let bossData = null;
    
    switch (currentFloor) {
      case 10:
        bossName = "Gozurl (Floor 10 Guardian)";
        bossData = { hp: 2000, ep: 15000, str: 70, def: 60, agi: 50, bossId: "lab_floor_10" };
        break;
      case 20:
        bossName = "Mezurl (Floor 20 Guardian)";
        bossData = { hp: 4000, ep: 25000, str: 95, def: 80, agi: 70, bossId: "lab_floor_20" };
        break;
      case 30:
        bossName = "Bovix (Floor 30 Guardian)";
        bossData = { hp: 6000, ep: 45000, str: 130, def: 110, agi: 90, bossId: "lab_floor_30" };
        break;
      case 40:
        bossName = "Equix (Floor 40 Guardian)";
        bossData = { hp: 8500, ep: 65000, str: 160, def: 140, agi: 110, bossId: "lab_floor_40" };
        break;
      case 50:
        bossName = "Duo-Elemental Golem (Floor 50 Guardian)";
        bossData = { hp: 12000, ep: 90000, str: 210, def: 180, agi: 140, bossId: "lab_floor_50" };
        break;
      case 60:
        bossName = "Arch-Demon (Floor 60 Guardian)";
        bossData = { hp: 18000, ep: 130000, str: 270, def: 240, agi: 190, bossId: "lab_floor_60" };
        break;
      case 70:
        bossName = "Adalman (Floor 70 Guardian)";
        bossData = { hp: 25000, ep: 200000, str: 350, def: 300, agi: 240, bossId: "lab_floor_70" };
        break;
      case 80:
        bossName = "Albert (Floor 80 Guardian)";
        bossData = { hp: 35000, ep: 300000, str: 450, def: 400, agi: 280, bossId: "lab_floor_80" };
        break;
      case 90:
        bossName = "Kumara (Floor 90 Guardian)";
        bossData = { hp: 50000, ep: 450000, str: 550, def: 480, agi: 320, bossId: "lab_floor_90" };
        break;
      case 100:
        bossName = "Zegion (Floor 100 Guardian)";
        bossData = { hp: 80000, ep: 600000, str: 800, def: 700, agi: 500, bossId: "lab_floor_100" };
        break;
      default:
        addLog("system", "SYS: Invalid Floor Guardian reference.");
        return;
    }
    
    addLog("explore", `You step forward to confront ${bossName}! The atmosphere crackles with immense pressure.`);
    startCombat(bossName, bossData);
  };

  const mineLabyrinthOre = () => {
    playSound("click");
    if (rimuru.mp < 5) {
      addLog("system", "SYS: Insufficient MP to mine. Meditate or consume Magicule Elixir.");
      return;
    }
    setRimuru(prev => ({
      ...prev,
      mp: Math.max(0, prev.mp - 5)
    }));
    const currentFloor = rimuru.dungeonFloor || 1;
    const roll = Math.random();
    if (roll < 0.5) {
      const isMagical = Math.random() < 0.6;
      const itemName = isMagical ? "Magical Ore" : "Steel Core";
      addInventoryItem(itemName, "material");
      addLog("explore", `You channel magicules into the pickaxe and mine 1x ${itemName} from a glowing mineral pocket.`);
      playSound("item");
    } else if (roll < 0.8) {
      let mob = "Labyrinth Basilisk";
      if (currentFloor <= 30) {
        const mobs = ["Cave Bat", "Water Lizard", "Giant Centipede", "Lesser Demon"];
        mob = mobs[Math.floor(Math.random() * mobs.length)];
      } else if (currentFloor <= 60) {
        const mobs = ["Orc Sentry", "Lizardman Soldier", "Ice Phantom", "Labyrinth Basilisk"];
        mob = mobs[Math.floor(Math.random() * mobs.length)];
      } else if (currentFloor <= 90) {
        const mobs = ["Labyrinth Gargoyle", "Empire Soldier", "Orc General", "Lizardman Elite"];
        mob = mobs[Math.floor(Math.random() * mobs.length)];
      } else {
        const mobs = ["Empire Knight", "Phantom Soldier", "Fallen Angel"];
        mob = mobs[Math.floor(Math.random() * mobs.length)];
      }
      setTimeout(() => {
        addLog("explore", `Your mining strikes a monster nest! A [${mob}] leaps out of the rock wall!`);
        startCombat(mob);
      }, 600);
    } else {
      addLog("explore", "You spend some time digging but harvest only common gravel.");
    }
  };

  const meditateInLabyrinth = () => {
    playSound("click");
    const currentFloor = rimuru.dungeonFloor || 1;
    const roll = Math.random();
    if (roll < 0.15) {
      let mob = "Labyrinth Basilisk";
      if (currentFloor <= 30) {
        const mobs = ["Cave Bat", "Water Lizard", "Giant Centipede", "Lesser Demon"];
        mob = mobs[Math.floor(Math.random() * mobs.length)];
      } else if (currentFloor <= 60) {
        const mobs = ["Orc Sentry", "Lizardman Soldier", "Ice Phantom", "Labyrinth Basilisk"];
        mob = mobs[Math.floor(Math.random() * mobs.length)];
      } else if (currentFloor <= 90) {
        const mobs = ["Labyrinth Gargoyle", "Empire Soldier", "Orc General", "Lizardman Elite"];
        mob = mobs[Math.floor(Math.random() * mobs.length)];
      } else {
        const mobs = ["Empire Knight", "Phantom Soldier", "Fallen Angel"];
        mob = mobs[Math.floor(Math.random() * mobs.length)];
      }
      setTimeout(() => {
        addLog("explore", `Your meditation is interrupted! A wandering [${mob}] detects your magicule focus and attacks!`);
        startCombat(mob);
      }, 600);
    } else {
      const healHp = Math.floor(rimuru.maxHp * 0.15);
      const healMp = Math.floor(rimuru.maxMp * 0.15);
      setRimuru(prev => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + healHp),
        mp: Math.min(prev.maxMp, prev.mp + healMp)
      }));
      addLog("explore", `You sit in quiet contemplation, absorbing the ambient magicules. Restored ${healHp} HP and ${healMp} MP.`);
      playSound("spell");
    }
  };

  const gatherWoodCustom = () => {
    playSound("click");
    const race = rimuru.customRace;
    setRimuru(prev => ({
      ...prev,
      town: { ...prev.town, wood: prev.town.wood + 15 }
    }));
    
    let msg = "Goblins gathered 15 pieces of lumber.";
    if (race === "slime") msg = "You absorbed water crystals (+15 wood equivalents).";
    else if (race === "dwarf") msg = "Apprentice smiths collected forge fuel (+15 wood equivalents).";
    else if (race === "lizardman") msg = "Marsh hunters harvested swamp reeds (+15 wood equivalents).";
    else if (race === "ogre") msg = "Ogre warriors gathered mountain timber (+15 wood).";
    else if (race === "human") msg = "You acquired guild wood supplies (+15 wood).";
    else if (race === "orc") msg = "Orc horde scavenged forest bark (+15 wood).";
    else if (race === "dragonoid") msg = "Acolytes gathered sacred branches (+15 wood).";
    else if (race === "demon") msg = "You siphoned chaos energy from the void (+15 wood equivalents).";
    
    addLog("explore", msg);
  };

  const gatherStoneCustom = () => {
    playSound("click");
    const race = rimuru.customRace;
    setRimuru(prev => ({
      ...prev,
      town: { ...prev.town, stone: prev.town.stone + 8 }
    }));
    
    let msg = "Wolves quarried 8 stone slabs.";
    if (race === "slime") msg = "You absorbed magicule shards (+8 stone equivalents).";
    else if (race === "dwarf") msg = "Dwarf miners quarried iron ore (+8 stone equivalents).";
    else if (race === "lizardman") msg = "Marsh hunters dug up swamp clay (+8 stone equivalents).";
    else if (race === "ogre") msg = "Ogre warriors quarried granite (+8 stone).";
    else if (race === "human") msg = "You purchased building stone blocks (+8 stone).";
    else if (race === "orc") msg = "Orc labor force mined swamp rock (+8 stone).";
    else if (race === "dragonoid") msg = "Acolytes harvested volcanic stone (+8 stone).";
    else if (race === "demon") msg = "You crystallized magicules into solid hellstone (+8 stone equivalents).";
    
    addLog("explore", msg);
  };

  const buildDwellingCustom = () => {
    if (rimuru.town.wood < 20 || rimuru.town.stone < 10) {
      addLog("system", "Insufficient materials. Need 20 Wood, 10 Stone.");
      return;
    }
    const labels = getCustomTownLabels(rimuru.customRace);
    setRimuru(prev => ({
      ...prev,
      town: {
        ...prev.town,
        wood: prev.town.wood - 20,
        stone: prev.town.stone - 10,
        dwellings: prev.town.dwellings + 1
      }
    }));
    addLog("explore", `Constructed a new ${labels.build1}.`);
  };

  const buildSmithyCustom = () => {
    if (rimuru.town.wood < 50 || rimuru.town.stone < 30) {
      addLog("system", "Smithy construction requires 50 Wood, 30 Stone.");
      return;
    }
    setRimuru(prev => ({
      ...prev,
      str: prev.str + 15,
      def: prev.def + 10,
      town: {
        ...prev.town,
        wood: prev.town.wood - 50,
        stone: prev.town.stone - 30,
        smithy: prev.town.smithy + 1
      }
    }));
    addLog("explore", "Constructed a Forge/Smithy. STR (+15) and DEF (+10) increased.");
  };

  const buildLaboratoryCustom = () => {
    if (rimuru.town.wood < 100 || rimuru.town.stone < 80 || getInventoryQty("Magical Ore") < 5) {
      addLog("system", "Insufficient materials. Requires 100 Wood, 80 Stone, and 5 Magical Ore.");
      return;
    }
    const labels = getCustomTownLabels(rimuru.customRace);
    consumeInventoryItem("Magical Ore", 5);
    setRimuru(prev => ({
      ...prev,
      town: {
        ...prev.town,
        wood: prev.town.wood - 100,
        stone: prev.town.stone - 80,
        laboratory: prev.town.laboratory + 1
      }
    }));
    addLog("explore", `Constructed a new ${labels.build2}.`);
  };

  const recruitPopCustom = (type) => {
    playSound("click");
    const race = rimuru.customRace;
    const labels = getCustomTownLabels(race);
    
    if (type === "pop1") {
      const epCost = 100;
      if (rimuru.ep < epCost) {
        addLog("system", `Insufficient EP. Need ${epCost} EP.`);
        return;
      }
      setRimuru(prev => ({
        ...prev,
        ep: prev.ep - epCost,
        town: {
          ...prev.town,
          goblins: prev.town.goblins + 10
        }
      }));
      addLog("explore", `Recruited 10 ${labels.pop1} to your faction base (EP -100).`);
    } else {
      const epCost = 200;
      if (rimuru.ep < epCost) {
        addLog("system", `Insufficient EP. Need ${epCost} EP.`);
        return;
      }
      setRimuru(prev => ({
        ...prev,
        ep: prev.ep - epCost,
        town: {
          ...prev.town,
          orcs: prev.town.orcs + 5
        }
      }));
      addLog("explore", `Recruited 5 ${labels.pop2} to your faction base (EP -200).`);
    }
  };

  const getCustomTownLabels = (race) => {
    switch (race) {
      case "slime": return { title: "SLIME MAGICULE NEST", pop1: "Minor Slimes", pop2: "Magicule Elementals", build1: "Magicule Chamber", build2: "Spirit Pool" };
      case "dwarf": return { title: "ARMED NATION DWARGON FORGE", pop1: "Apprentice Smiths", pop2: "Steel Guards", build1: "High Forge", build2: "Runic Laboratory" };
      case "goblin": return { title: "GOBLIN WILDERNESS SETTLEMENT", pop1: "Goblin Peasants", pop2: "Direwolf Riders", build1: "Hut", build2: "Training Compound" };
      case "lizardman": return { title: "JURA MARSHLAND FORTRESS", pop1: "Marsh Hunters", pop2: "Dragonewt Soldiers", build1: "Mud Fort", build2: "Water Altar" };
      case "ogre": return { title: "OGRE PEAK MOUNTAIN TEMPLE", pop1: "Ogre Initiates", pop2: "Kijin Elite Guards", build1: "Stone Keep", build2: "Aura Shrine" };
      case "human": return { title: "INGRASSIA FREE GUILD BRANCH", pop1: "Guild Adventurers", pop2: "Shield Knights", build1: "Outpost", build2: "Magic Academy" };
      case "orc": return { title: "ORC DISASTER SWARM CITADEL", pop1: "Orc Laborers", pop2: "Orc Generals", build1: "Swarm Burrow", build2: "Sacrificial Pit" };
      case "dragonoid": return { title: "DRAGON WORSHIPPERS SANCTUARY", pop1: "Dragon Acolytes", pop2: "Draconic Sentinels", build1: "Sacred Pagoda", build2: "Dragon Flame Altar" };
      case "demon": return { title: "UNDERWORLD SPIRIT REALM", pop1: "Lesser Demons", pop2: "Demon Peers", build1: "Rift Gate", build2: "Abyssal Citadel" };
      default: return { title: "TEMPEST FEDERATION REGISTRY", pop1: "Goblins", pop2: "Orcs", build1: "Dwelling", build2: "Laboratory" };
    }
  };

  const selectSkillForFusion = (skill) => {
    playSound("click");
    const details = skillsDb[skill];
    if (details) {
      setSelectedSkillDetails({ name: skill, ...details });
    }
    setSelectedSkillsForFusion(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      }
      if (prev.length < 4) {
        return [...prev, skill];
      }
      return [prev[1], prev[2], prev[3], skill];
    });
  };

  // Lore / Wiki search engine
  const printWikiEntry = (name, dataType, typeLabel) => {
    addLog("voice", `[Raphael]: Entry found: ${name.toUpperCase()} (${typeLabel})`);
    if (dataType.infobox) {
      for (const [k, v] of Object.entries(dataType.infobox)) {
        if (v && typeof v === 'string') {
          addLog("system", `  * ${k}: ${v}`);
        }
      }
    }
    if (dataType.summary) {
      addLog("explore", `Summary: ${dataType.summary}`);
    } else if (dataType.sections && Object.keys(dataType.sections).length > 0) {
      const firstSecKey = Object.keys(dataType.sections)[0];
      addLog("explore", `Description: ${dataType.sections[firstSecKey]}`);
    } else {
      addLog("system", "No description available in the registry.");
    }
  };

  const searchWiki = (term) => {
    if (!term) {
      addLog("system", "SYS: Please specify a search term. Usage: 'wiki <term>'");
      return;
    }
    const termLower = term.toLowerCase();

    // Look in skills
    for (const [key, data] of Object.entries(skillsDb)) {
      if (key.toLowerCase() === termLower || key.toLowerCase().includes(termLower)) {
        printWikiEntry(key, data, "SKILL");
        return;
      }
    }
    // Look in magic
    for (const [key, data] of Object.entries(magicDb)) {
      if (key.toLowerCase() === termLower || key.toLowerCase().includes(termLower)) {
        printWikiEntry(key, data, "MAGIC");
        return;
      }
    }
    // Look in species
    for (const [key, data] of Object.entries(speciesDb)) {
      if (key.toLowerCase() === termLower || key.toLowerCase().includes(termLower)) {
        printWikiEntry(key, data, "SPECIES");
        return;
      }
    }
    // Look in items
    for (const [key, data] of Object.entries(itemsDb)) {
      if (key.toLowerCase() === termLower || key.toLowerCase().includes(termLower)) {
        printWikiEntry(key, data, "ITEM");
        return;
      }
    }
    addLog("system", `SYS: No wiki database entry found matching '${term}'.`);
  };

  const getSkillCategory = (skillName) => {
    const skill = skillsDb[skillName];
    if (skill && skill.infobox && skill.infobox.Category) {
      return skill.infobox.Category;
    }
    return "Extra Skill";
  };

  // Equipment configurations
  const WEAPONS = ["Magisteel Sword", "Beast Slayer", "Storm Dragon Sword", "Iron Blade", "Apprentice Staff", "Thief Dagger", "Genesis Grade Veldora Blade", "God Grade Guren Sword", "Ruinous Phantom Blade"];
  const ARMORS = ["Tempest Uniform", "Armor of Geld", "Hihi'irokane Shield", "Wooden Shield", "True Dragon Armor", "God Grade Tempest Raiment"];
  const ACCESSORIES = ["Anti-magic Mask", "Demon Lord Ring", "Spirit Ring", "Draconic Amulet"];

  const getItemStatBonus = (itemName) => {
    if (!itemName) return 0;
    switch (itemName) {
      case "Iron Blade": return 8;
      case "Apprentice Staff": return 4;
      case "Thief Dagger": return 6;
      case "Wooden Shield": return 6;
      case "Magisteel Sword": return 25;
      case "Beast Slayer": return 75;
      case "Storm Dragon Sword": return 300;
      case "God Grade Guren Sword": return 450;
      case "Genesis Grade Veldora Blade": return 900;
      case "Ruinous Phantom Blade": return 1200;
      case "Tempest Uniform": return 40;
      case "Armor of Geld": return 95;
      case "Hihi'irokane Shield": return 250;
      case "God Grade Tempest Raiment": return 350;
      case "True Dragon Armor": return 600;
      default: return 0;
    }
  };

  const getAccessoryBonuses = (itemName) => {
    const bonus = { hp: 0, mp: 0, str: 0, def: 0, agi: 0 };
    if (!itemName) return bonus;
    if (itemName === "Anti-magic Mask") {
      bonus.def = 15;
      bonus.agi = 10;
    } else if (itemName === "Demon Lord Ring") {
      bonus.mp = 150;
      bonus.str = 20;
    } else if (itemName === "Spirit Ring") {
      bonus.mp = 200;
      bonus.agi = 15;
    } else if (itemName === "Draconic Amulet") {
      bonus.str = 35;
      bonus.def = 20;
      bonus.hp = 100;
    }
    return bonus;
  };

  // Inventory management helpers
  const getInventoryQty = (itemName) => {
    const item = rimuru.inventory.find(i => i.name === itemName);
    return item ? item.quantity : 0;
  };

  const consumeInventoryItem = (itemName, qty) => {
    setRimuru(prev => {
      const inv = prev.inventory.map(i => {
        if (i.name === itemName) {
          return { ...i, quantity: i.quantity - qty };
        }
        return i;
      }).filter(i => i.quantity > 0);
      return { ...prev, inventory: inv };
    });
  };

  const addInventoryItem = (itemName, type) => {
    setRimuru(prev => {
      const inv = [...prev.inventory];
      const idx = inv.findIndex(i => i.name === itemName);
      if (idx >= 0) {
        inv[idx].quantity += 1;
      } else {
        inv.push({ name: itemName, quantity: 1, type });
      }
      return { ...prev, inventory: inv };
    });
  };

  const forgeEquipment = (itemName, type, requirements) => {
    for (const [reqItem, reqQty] of Object.entries(requirements)) {
      if (getInventoryQty(reqItem) < reqQty) {
        addLog("system", `Insufficient ${reqItem}. Need ${reqQty}.`);
        return;
      }
    }
    for (const [reqItem, reqQty] of Object.entries(requirements)) {
      consumeInventoryItem(reqItem, reqQty);
    }
    addInventoryItem(itemName, type);
    addLog("explore", `Kurobe successfully forged [${itemName}]! Item added to inventory.`);
    playSound("level");
  };

  const buildLaboratory = () => {
    if (rimuru.town.wood < 100 || rimuru.town.stone < 80 || getInventoryQty("Magical Ore") < 5) {
      addLog("system", "SYS: Insufficient resources. Laboratory requires 100 Wood, 80 Stone, and 5 Magical Ore.");
      return;
    }
    consumeInventoryItem("Magical Ore", 5);
    setRimuru(prev => ({
      ...prev,
      maxMp: prev.maxMp + 500,
      mp: prev.mp + 500,
      town: {
        ...prev.town,
        wood: prev.town.wood - 100,
        stone: prev.town.stone - 80,
        laboratory: prev.town.laboratory + 1
      }
    }));
    addLog("explore", "Constructed Vesta's Research Laboratory! Max MP increased by 500.");
    playSound("level");
  };

  const buildLabyrinth = () => {
    if (rimuru.town.wood < 100 || rimuru.town.stone < 100 || getInventoryQty("Magical Ore") < 20) {
      addLog("system", "SYS: Insufficient resources. Labyrinth requires 100 Wood, 100 Stone, and 20 Magical Ore.");
      return;
    }
    consumeInventoryItem("Magical Ore", 20);
    setRimuru(prev => ({
      ...prev,
      maxHp: prev.maxHp + 1000,
      hp: prev.hp + 1000,
      labyrinthBuilt: true,
      town: {
        ...prev.town,
        wood: prev.town.wood - 100,
        stone: prev.town.stone - 100
      }
    }));
    addLog("explore", "You build the 100-floor Labyrinth in collaboration with Ramiris and Veldora! Max HP increased by 1000.");
    playSound("level");
  };

  // Chapter Boss Triggers
  const ch1Veldora = () => {
    addLog("explore", "You step into the chamber of the Storm Dragon, Veldora Tempest!");
    addLog("voice", "[Veldora]: Welcome, small creature! I am Veldora, the Storm Dragon! I was sealed here 300 years ago by a Hero.");
    addLog("explore", "You talk to Veldora and offer to help release him by devouring the Unlimited Imprisonment seal.");
    addLog("explore", "You decide to name each other. You choose the name 'Tempest'.");
    addLog("voice", "[Voice of the World]: Commencing soul-link. Magicule consumption high. Entering sleep stabilization.");
    setRimuru(prev => ({ ...prev, sleepTurns: 3 }));
  };

  const ch2Boss = () => {
    addLog("explore", "A massive Direwolf charging with red glowing eyes leaps at you!");
    startCombat("Direwolf Boss", { hp: 500, ep: 1200, str: 35, def: 20, agi: 40, isBoss: true, bossId: "ch2" });
  };

  const ch3Boss = () => {
    addLog("explore", "The Kijin squad (Benimaru and others) ambushes you, thinking you are the Orc Disaster's general!");
    startCombat("Benimaru (Ogre Leader)", { hp: 1500, ep: 15000, str: 75, def: 55, agi: 80, isBoss: true, bossId: "ch3" });
  };

  const ch4Boss = () => {
    addLog("explore", "Geld, the Orc Disaster, stands towering. He radiates hunger and rot!");
    startCombat("Geld the Orc Disaster", { hp: 5000, ep: 95000, str: 180, def: 200, agi: 60, isBoss: true, bossId: "ch4" });
  };

  const ch4Milim = () => {
    addLog("explore", "You encounter Milim Nava, the Dragonoid Demon Lord!");
    addLog("voice", "[Milim]: Muwahahaha! I am Milim Nava, one of the oldest Demon Lords! You seem strong, let's fight!");
    if (getInventoryQty("Honey") > 0) {
      addLog("system", "SYS: You have Honey in your inventory. You can offer it to befriend her without fighting.");
    } else {
      addLog("explore", "If you fight her now, it will be extremely dangerous. (Hint: Find 'Honey' by scanning resource nodes 'O' in Jura Forest!)");
    }
    setActiveEvent("milim");
  };

  const handleBribeMilim = () => {
    playSound("level");
    consumeInventoryItem("Honey", 1);
    setRimuru(prev => {
      const nextState = {
        ...prev,
        milimBefriended: true,
        allies: [...prev.allies, "Milim Nava (Demon Lord)"]
      };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Dragonoid Demon Lord 'Milim Nava' has joined the Tempest Alliance.");
    addLog("explore", "Milim licks the honey off her fingers. 'This is amazing! I've never tasted anything so good! I'll be your friend!'");
    
    addLog("voice", "[Voice of the World]: WARNING. Catastrophe-class threat 'Charybdis' has been revived.");
    addLog("explore", "A giant flying beast 'Charybdis' appears above the swamps! Navigate to cell [4, 4] to defeat it.");
    setMaze(prev => {
      const copy = [...prev];
      copy[4][4] = 'C';
      return copy;
    });
    setPlayerPos({ x: 0, y: 0 });
    setActiveEvent(null);
  };

  const handleFightMilim = () => {
    addLog("explore", "You refuse to bribe her and prepare for battle against a true Demon Lord!");
    startCombat("Milim Nava (Demon Lord)", { hp: 100000, ep: 100000000, str: 5000, def: 4000, agi: 5000, isBoss: true, bossId: "ch4_milim" });
    setActiveEvent(null);
  };

  const ch4Charybdis = () => {
    addLog("explore", "You engage in battle with Calamity Charybdis!");
    startCombat("Calamity Charybdis", { hp: 8000, ep: 250000, str: 200, def: 180, agi: 100, isBoss: true, bossId: "ch4_charybdis" });
  };

  const ch5Hinata = () => {
    addLog("explore", "Hinata Sakaguchi, Captain of the Crusaders, stands before you in a holy barrier!");
    addLog("voice", "[Hinata]: I have come to purge you, monster. You are a threat to humanity.");
    startCombat("Hinata Sakaguchi", { hp: 10000, ep: 360000, str: 320, def: 280, agi: 450, isBoss: true, bossId: "ch5_hinata" });
  };

  const ch5Boss = () => {
    addLog("explore", "You enter the camp of the Falmuth vanguard. Shogo Taguchi, a summoned Otherworlder, challenges you!");
    startCombat("Falmuth Commander Shogo", { hp: 12000, ep: 350000, str: 380, def: 300, agi: 250, isBoss: true, bossId: "ch5" });
  };

  const ch6Clayman = () => {
    addLog("explore", "You enter the grand chamber of the Walpurgis Banquet. Clayman points at you with rage!");
    addLog("voice", "[Clayman]: Rimuru! You dirty slime! You dare stand before the Demon Lords! I will tear you apart!");
    startCombat("Demon Lord Clayman", { hp: 20000, ep: 400000, str: 450, def: 380, agi: 420, isBoss: true, bossId: "ch6_clayman" });
  };

  const ch7BovixEquix = () => {
    if (!rimuru.labyrinthBuilt) {
      addLog("explore", "There is nothing here yet. You must first build the Labyrinth in the Town panel.");
      return;
    }
    addLog("explore", "You enter the Labyrinth Arena. The twin guardians, Gozurl and Mezurl, step forward!");
    startCombat("Bovix & Equix", { hp: 25000, ep: 550000, str: 550, def: 520, agi: 480, isBoss: true, bossId: "ch7_bovix_equix" });
  };

  const ch7HinataRematch = () => {
    addLog("explore", "Hinata Sakaguchi meets you in the Tempest Colosseum. She draws her sword for a friendly spar.");
    addLog("voice", "[Hinata]: Let's see how much you've grown since our last clash, Rimuru. Don't hold back.");
    startCombat("Hinata (Friendly Spar)", { hp: 15000, ep: 420000, str: 400, def: 360, agi: 480, isBoss: true, bossId: "ch7_hinata" });
  };

  const ch8Calgurio = () => {
    addLog("explore", "You fly to the imperial front. General Calgurio of the Eastern Empire commands his magisteel armored army!");
    addLog("voice", "[Calgurio]: Monster nation Tempest shall fall! For the glory of the Emperor, attack!");
    startCombat("General Calgurio", { hp: 35000, ep: 1200000, str: 900, def: 850, agi: 800, isBoss: true, bossId: "ch8_calgurio" });
  };

  const ch9Michael = () => {
    addLog("explore", "The Heavenly Gate trembles. Archangel Michael manifests with radiant wings of light and cold authority!");
    addLog("voice", "[Michael]: Ignorant slime. Hand over the dragon factor of Veldora. The resurrection of the Star King is absolute.");
    startCombat("Archangel Michael", { hp: 80000, ep: 100000000, str: 3000, def: 2500, agi: 2800, isBoss: true, bossId: "ch9_michael" });
  };

  const ch5NextChapter = () => {
    playSound("click");
    setRimuru(prev => {
      const nextState = { ...prev, chapter: 6, location: "Walpurgis Banquet" };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Chapter 5 completed. Reconstructing map coordinates to Walpurgis...");
  };

  const ch6FoundOctagram = () => {
    playSound("level");
    setRimuru(prev => {
      const nextState = {
        ...prev,
        octagramFounded: true,
        ep: prev.ep + 50000,
        str: prev.str + 50,
        def: prev.def + 50,
        agi: prev.agi + 50
      };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Naming ceremony successful. Demon Lord Council established as 'Octagram'.");
    addLog("explore", "You have named the Eight Star Demon Lords 'Octagram'! Gained 50,000 EP and stat increases.");
  };

  const ch6NextChapter = () => {
    playSound("click");
    setRimuru(prev => {
      const nextState = { ...prev, chapter: 7, location: "Tempest Colosseum" };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Chapter 6 completed. Returning to Tempest for the Colosseum Founder's Festival...");
  };

  const ch7NextChapter = () => {
    playSound("click");
    setRimuru(prev => {
      const nextState = { ...prev, chapter: 8, location: "Tempest Imperial Front" };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Chapter 7 completed. Danger detected: Eastern Empire army approaching the borders...");
  };

  const ch8EvolvePatrons = () => {
    playSound("sleep");
    addLog("explore", "You sacrifice 1,000,000 souls to the Voice of the World. Your soul link vibrates as you enter sleep...");
    addLog("voice", "[Voice of the World]: Evolving Twelve Patron Deities. Commencing sleep stabilization...");
    setRimuru(prev => ({ ...prev, sleepTurns: 3 }));
  };

  const ch8NextChapter = () => {
    playSound("click");
    setRimuru(prev => {
      const nextState = { ...prev, chapter: 9, location: "Heavenly Gate" };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Chapter 8 completed. Heaven's gates opening: The Great Tenma War begins...");
  };

  const ch9CompleteGame = () => {
    playSound("click");
    setRimuru(prev => {
      const nextState = { ...prev, postGame: true, location: "Uncharted Rift" };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Main Story Chronology complete.");
    addLog("voice", "[Voice of the World]: Activating Uncharted Rift Sandbox Mode.");
    addLog("explore", "Welcome to Uncharted Rift Sandbox! Explore random grids, fight cosmic entities, and recruit Diablo.");
    setTimeout(() => generatePostGameMaze(), 500);
  };

  const ch9NextChapter = () => {
    playSound("click");
    setRimuru(prev => {
      const nextState = { ...prev, chapter: 10, location: "Labyrinth Depths" };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Chapter 9 completed. Danger detected: Possessed Jahil and Zelanus have breached the Labyrinth!");
  };

  const ch10Jahil = () => {
    addLog("explore", "Deep within the Labyrinth, the blazing heat intensifies. Possessed Jahil, wielding the Spear of Truth, stands in your way!");
    addLog("voice", "[Jahil]: Divine flame will consume all who dare stand against Feldway's grand design!");
    startCombat("Possessed Jahil", { hp: 120000, ep: 140000000, str: 4500, def: 3500, agi: 4000, isBoss: true, bossId: "ch10_jahil" });
  };

  const ch10Zelanus = () => {
    addLog("explore", "The space collapses as Zelanus, the Insectar King, descends. His impenetrable carapace and razor-sharp blades gleam!");
    addLog("voice", "[Zelanus]: Weak slime, you think you can defend this Labyrinth? Prepare to be shredded into dust.");
    startCombat("Insectar King Zelanus", { hp: 150000, ep: 180000000, str: 5500, def: 5000, agi: 4500, isBoss: true, bossId: "ch10_zelanus" });
  };

  const ch10NextChapter = () => {
    playSound("click");
    setRimuru(prev => {
      const skillsSet = new Set(prev.skills);
      skillsSet.add("Flame God Cthugha");
      const nextState = {
        ...prev,
        chapter: 11,
        location: "Cosmic Horizon",
        skills: Array.from(skillsSet),
        cthughaUnlocked: true
      };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Labyrinth Siege cleared.");
    addLog("voice", "[Voice of the World]: Ultimate Skill 'Flame God Cthugha' synthesized from Benimaru's essence.");
    addLog("voice", "[Voice of the World]: Spatial coordinates warping to Cosmic Horizon. Prepare for the final confrontation.");
  };

  const ch11Feldway = () => {
    addLog("explore", "Dead space and time warp around you. Feldway's True Form manifests, holding the Ultimate Sword of the Star King!");
    addLog("voice", "[Feldway]: The creator's path is absolute. Slime, you are merely an anomaly in the cosmic order. Prepare to be erased from all timelines!");
    startCombat("Feldway True Form", { hp: 300000, ep: 500000000, str: 8000, def: 7000, agi: 7500, isBoss: true, bossId: "ch11_feldway" });
  };

  const ch11CompleteGame = () => {
    playSound("click");
    setRimuru(prev => {
      const nextState = { ...prev, postGame: true, location: "Uncharted Rift" };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Cosmic Climax Chronology complete.");
    addLog("voice", "[Voice of the World]: Activating Uncharted Rift Sandbox Mode.");
    addLog("explore", "Welcome to Uncharted Rift Sandbox! Explore random grids, fight cosmic entities, and recruit Diablo.");
    setTimeout(() => generatePostGameMaze(), 500);
  };

  const chPostGameBoss = () => {
    const bosses = [
      { name: "Clayman (Demon Lord)", hp: 20000, ep: 800000, str: 500, def: 450, agi: 500, bossId: "post_clayman" },
      { name: "Diablo (Primordial Black)", hp: 35000, ep: 3000000, str: 1200, def: 1100, agi: 1300, bossId: "post_diablo" },
      { name: "Velgrynd (Scorch Dragon)", hp: 80000, ep: 74000000, str: 4500, def: 4000, agi: 5000, bossId: "post_velgrynd" },
      { name: "Guy Crimson (Lord of Darkness)", hp: 100000, ep: 100000000, str: 6000, def: 5500, agi: 6000, bossId: "post_guy" },
      { name: "Velzard (White Ice Dragon)", hp: 130000, ep: 80000000, str: 7000, def: 7500, agi: 5500, bossId: "post_velzard" },
      { name: "Feldway (Phantom King)", hp: 160000, ep: 90000000, str: 8000, def: 7000, agi: 7500, bossId: "post_feldway" },
      { name: "Ivaraj (Evil Dragon God)", hp: 250000, ep: 150000000, str: 10000, def: 9000, agi: 8000, bossId: "post_ivaraj" }
    ];
    const idx = Math.min(bosses.length - 1, rimuru.postGameBossCount || 0);
    const selected = bosses[idx];
    addLog("explore", `Warning! Cosmic distortion detected: ${selected.name} stands before you!`);
    startCombat(selected.name, { hp: selected.hp, ep: selected.ep, str: selected.str, def: selected.def, agi: selected.agi, isBoss: true, bossId: selected.bossId });
  };

  const generatePostGameMaze = () => {
    playSound("click");
    const size = 7;
    const newMaze = Array(size).fill(null).map(() => Array(size).fill('.'));
    newMaze[0][0] = 'P';
    
    // Add obstacles '#'
    const walls = [
      [1, 1], [1, 2], [1, 4], [1, 5],
      [3, 1], [3, 3], [3, 5],
      [5, 1], [5, 2], [5, 4], [5, 5]
    ];
    walls.forEach(([wy, wx]) => {
      newMaze[wy][wx] = '#';
    });
    
    // Add resource nodes 'O' (6 nodes)
    let placedO = 0;
    while (placedO < 6) {
      const rx = Math.floor(Math.random() * size);
      const ry = Math.floor(Math.random() * size);
      if (newMaze[ry][rx] === '.') {
        newMaze[ry][rx] = 'O';
        placedO++;
      }
    }
    // Add enemy spawners 'E' (6 nodes)
    let placedE = 0;
    while (placedE < 6) {
      const rx = Math.floor(Math.random() * size);
      const ry = Math.floor(Math.random() * size);
      if (newMaze[ry][rx] === '.') {
        newMaze[ry][rx] = 'E';
        placedE++;
      }
    }
    
    // Interactive Nodes
    newMaze[3][2] = 'T'; // Faction Trading Post
    newMaze[2][3] = 'S'; // Ancient Shrine
    newMaze[4][3] = 'D'; // Dungeon Trap
    
    // Add boss node at bottom right
    newMaze[size - 1][size - 1] = 'A';
    
    setMaze(newMaze);
    setPlayerPos({ x: 0, y: 0 });
    addLog("explore", "Generated new uncharted 7x7 rift territory. Radar scanner online.");
  };

  // Combat Mechanics
  const enemySkills = {
    "Cave Bat": "Ultrasonic Wave",
    "Water Lizard": "Water Spray",
    "Giant Centipede": "Paralysis Breath",
    "Goblin Scout": "Hide",
    "Direwolf Rogue": "Shadow Step",
    "Wild Boar": "Charge",
    "Orc Sentry": "Steel Body",
    "Lizardman Soldier": "Scale Armor",
    "Direwolf Group": "Menace",
    "Orc General": "Starved",
    "Lizardman Elite": "Water Manipulation",
    "Falmuth Soldier": "Physical Resistance",
    "Falmuth Knight": "Sword Slash",
    "Temple Mage": "Cast Cancel",
    "Lesser Demon": "Darkness Manipulation",
    "Ice Phantom": "Water Spray",
    "Clayman Marionette": "Curse Ray",
    "Labyrinth Basilisk": "Poison Spit",
    "Labyrinth Gargoyle": "Stone Claw",
    "Empire Soldier": "Rifle Shot",
    "Empire Knight": "Aura Blade",
    "Empire Mage": "Energy Cannon",
    "Phantom Soldier": "Void Slash",
    "Fallen Angel": "Holy Light",
    "Seraphim Vanguard": "Divine Judgment",
    "Possessed Insectar": "Parasitic Sting",
    "Insectar Vanguard": "Herculean Slash",
    "Flame Berserker": "Blazing Cleave",
    "Feldway Phantom": "Phantom Illusion strike",
    "Void Beast": "Dimensional Maw",
    "Chaos Entity": "Entropy Surge"
  };

  const startCombat = (enemyName, bossData = null) => {
    playSound("click");
    if (enemyName === "Archangel Michael") {
      setRimuru(prev => {
        const skillsSet = new Set(prev.skills);
        skillsSet.delete("Raphael");
        skillsSet.delete("Beelzebuth");
        skillsSet.add("Void God Azathoth");
        skillsSet.add("Harvest Lord Shub-Niggurath");
        const nextState = {
          ...prev,
          skills: Array.from(skillsSet),
          maxMp: prev.maxMp + 50000,
          mp: prev.maxMp + 50000
        };
        localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
        return nextState;
      });
      setTimeout(() => {
        addLog("voice", "[Voice of the World]: Emergency evolution process initiated by internal ego...");
        addLog("voice", "[Voice of the World]: Ultimate Skill 'Raphael' (Lord of Wisdom) evolved to Manas: 'Ciel' (Core of Knowledge).");
        addLog("voice", "[Voice of the World]: Fused Ultimate Skills 'Beelzebuth' and 'Raphael' with Veldora and Velgrynd factors.");
        addLog("voice", "[Voice of the World]: Acquired Void God 'Azathoth' and Harvest Lord 'Shub-Niggurath'.");
      }, 500);
    }
    let enemy = null;
    if (bossData) {
      enemy = {
        name: enemyName,
        hp: bossData.hp,
        maxHp: bossData.hp,
        ep: bossData.ep,
        str: bossData.str,
        def: bossData.def,
        agi: bossData.agi,
        isBoss: true,
        bossId: bossData.bossId
      };
    } else {
      const epMap = {
        "Cave Bat": { hp: 80, ep: 120, str: 8, def: 5, agi: 12 },
        "Water Lizard": { hp: 100, ep: 180, str: 12, def: 10, agi: 8 },
        "Giant Centipede": { hp: 120, ep: 220, str: 15, def: 12, agi: 6 },
        "Goblin Scout": { hp: 150, ep: 300, str: 15, def: 10, agi: 15 },
        "Direwolf Rogue": { hp: 180, ep: 450, str: 20, def: 12, agi: 25 },
        "Wild Boar": { hp: 200, ep: 400, str: 22, def: 15, agi: 10 },
        "Orc Sentry": { hp: 250, ep: 800, str: 25, def: 20, agi: 12 },
        "Lizardman Soldier": { hp: 300, ep: 1000, str: 28, def: 22, agi: 20 },
        "Direwolf Group": { hp: 350, ep: 1500, str: 35, def: 25, agi: 30 },
        "Orc General": { hp: 600, ep: 4500, str: 50, def: 45, agi: 25 },
        "Lizardman Elite": { hp: 500, ep: 3500, str: 45, def: 40, agi: 35 },
        "Falmuth Soldier": { hp: 800, ep: 5000, str: 55, def: 50, agi: 45 },
        "Falmuth Knight": { hp: 1200, ep: 12000, str: 80, def: 70, agi: 60 },
        "Temple Mage": { hp: 900, ep: 10000, str: 40, def: 45, agi: 50 },
        "Lesser Demon": { hp: 220, ep: 900, str: 20, def: 15, agi: 20 },
        "Ice Phantom": { hp: 190, ep: 800, str: 18, def: 18, agi: 22 },
        "Clayman Marionette": { hp: 1500, ep: 15000, str: 70, def: 60, agi: 80 },
        "Labyrinth Basilisk": { hp: 2000, ep: 25000, str: 90, def: 80, agi: 70 },
        "Labyrinth Gargoyle": { hp: 2500, ep: 30000, str: 100, def: 110, agi: 60 },
        "Empire Soldier": { hp: 3500, ep: 60000, str: 120, def: 90, agi: 100 },
        "Empire Knight": { hp: 5000, ep: 100000, str: 180, def: 150, agi: 140 },
        "Empire Mage": { hp: 4000, ep: 90000, str: 100, def: 100, agi: 160 },
        "Phantom Soldier": { hp: 7000, ep: 200000, str: 240, def: 200, agi: 220 },
        "Fallen Angel": { hp: 9000, ep: 350000, str: 300, def: 250, agi: 320 },
        "Seraphim Vanguard": { hp: 12000, ep: 600000, str: 400, def: 350, agi: 380 }
      };
      const stats = epMap[enemyName] || { hp: 100, ep: 200, str: 10, def: 10, agi: 10 };
      enemy = {
        name: enemyName,
        hp: stats.hp,
        maxHp: stats.hp,
        ep: stats.ep,
        str: stats.str,
        def: stats.def,
        agi: stats.agi,
        isBoss: false
      };
    }

    setCombat({
      enemy,
      enemyHp: enemy.hp,
      maxEnemyHp: enemy.maxHp,
      playerHp: rimuru.hp,
      playerMp: rimuru.mp,
      turn: 1,
      log: [`Combat initialized with ${enemy.name}. Prepare combat matrix.`]
    });
  };

  const handleCombatVictory = (enemy, devoured) => {
    const epGained = devoured ? Math.floor(enemy.ep * 0.15) : Math.floor(enemy.ep * 0.1);
    
    // Sync actual final HP and MP from combat
    const finalHp = combat ? combat.playerHp : rimuru.hp;
    const finalMp = combat ? combat.playerMp : rimuru.mp;

    setRimuru(prev => {
      const newEp = prev.ep + epGained;
      let newHp = Math.min(prev.maxHp, finalHp + Math.floor(prev.maxHp * 0.2));
      let newMp = Math.min(prev.maxMp, finalMp + Math.floor(prev.maxMp * 0.2));
      
      const inv = [...prev.inventory];
      let lootName = "Magical Ore";
      if (enemy.name.includes("Goblin") || enemy.name.includes("Direwolf")) {
        lootName = Math.random() > 0.5 ? "Wood" : "Stone";
      } else if (enemy.name.includes("Orc") || enemy.name.includes("Lizardman")) {
        lootName = Math.random() > 0.5 ? "Steel Core" : "Magical Ore";
      } else if (enemy.name.includes("Falmuth")) {
        lootName = "Steel Core";
      } else if (enemy.name.includes("Clayman") || enemy.name.includes("Labyrinth") || enemy.name.includes("Empire") || enemy.name.includes("Phantom") || enemy.name.includes("Angel") || enemy.name.includes("Seraphim")) {
        lootName = Math.random() > 0.5 ? "Magical Ore" : "Steel Core";
      }
      
      const idx = inv.findIndex(i => i.name === lootName);
      if (idx >= 0) inv[idx].quantity += 1;
      else inv.push({ name: lootName, quantity: 1, type: "material" });

      let nextSouls = prev.collectedSouls || 0;
      if (prev.chapter === 8 && !prev.customMode) {
        const gainedSouls = enemy.isBoss ? 200000 : 200000;
        nextSouls = Math.min(1000000, nextSouls + gainedSouls);
        setTimeout(() => {
          addLog("explore", `Harvested ${gainedSouls.toLocaleString()} souls. Total: ${nextSouls.toLocaleString()}/1,000,000`);
        }, 1200);
      }

      let finalSkills = [...prev.skills];
      if (devoured && enemySkills[enemy.name] && !finalSkills.includes(enemySkills[enemy.name])) {
        if (Math.random() > 0.4) {
          finalSkills.push(enemySkills[enemy.name]);
          setTimeout(() => {
            addLog("voice", `[Voice of the World]: Analysis complete. Learned Intrinsic/Extra skill [${enemySkills[enemy.name]}] via Predation.`);
          }, 800);
        }
      }

      let flags = {};
      if (enemy.isBoss) {
        if (enemy.bossId === "ch2") {
          flags = { direwolvesDefeated: true };
          setTimeout(() => {
            addLog("explore", "You have defeated the Direwolf Boss! Go to options to name your new subordinates.");
          }, 1000);
        } else if (enemy.bossId === "ch3") {
          flags = { ogresNamed: true };
          setTimeout(() => {
            addLog("explore", "You have subdued the Ogres. They agree to join Tempest. Go to options to name them.");
          }, 1000);
        } else if (enemy.bossId === "ch4") {
          flags = { orcLordDefeated: true };
          const geldArmorIdx = inv.findIndex(i => i.name === "Armor of Geld");
          if (geldArmorIdx < 0) {
            inv.push({ name: "Armor of Geld", quantity: 1, type: "armor" });
          }
          setTimeout(() => {
            addLog("explore", "You have defeated Geld the Orc Disaster! You can now devour him to acquire 'Gluttony'.");
          }, 1000);
        } else if (enemy.bossId === "ch4_charybdis") {
          flags = { charybdisDefeated: true };
          setTimeout(() => {
            addLog("explore", "Charybdis has been completely destroyed! Jura Forest is safe once again.");
            addLog("explore", "You can now advance to Chapter 5 and protect Tempest from the Falmuth kingdom.");
          }, 1000);
        } else if (enemy.bossId === "ch5_hinata") {
          flags = { hinataDefeated: true };
          setTimeout(() => {
            addLog("explore", "You have successfully defeated Hinata Sakaguchi! She retreats, shocked by your power.");
            addLog("explore", "You can now proceed to protect Tempest from the Falmuth army.");
          }, 1000);
        } else if (enemy.bossId === "ch5") {
          flags = { megiddoCast: true };
          const bsIdx = inv.findIndex(i => i.name === "Beast Slayer");
          if (bsIdx < 0) {
            inv.push({ name: "Beast Slayer", quantity: 1, type: "weapon" });
          }
          setTimeout(() => {
            addLog("explore", "You have wiped out the Falmuth vanguard! You can now cast Megiddo at the main army.");
          }, 1000);
        } else if (enemy.bossId === "ch6_clayman") {
          flags = { claymanDefeated: true };
          const dlcIdx = inv.findIndex(i => i.name === "Demon Lord Ring");
          if (dlcIdx < 0) {
            inv.push({ name: "Demon Lord Ring", quantity: 1, type: "accessory" });
          }
          setTimeout(() => {
            addLog("explore", "You have defeated Demon Lord Clayman and exposed his schemes at Walpurgis!");
            addLog("explore", "You can now propose the founding of the 'Octagram' to the Demon Lords.");
          }, 1000);
        } else if (enemy.bossId === "ch7_bovix_equix") {
          flags = { labyrinthCleared: true };
          setTimeout(() => {
            addLog("explore", "You have defeated the Gozurl and Mezurl twins (Bovix & Equix)!");
            addLog("explore", "The 100-floor Dungeon (Labyrinth) is now stabilized and generating tourist income.");
          }, 1000);
        } else if (enemy.bossId === "ch7_hinata") {
          flags = { hinataReconciled: true, allies: [...prev.allies, "Hinata Sakaguchi (Crusader Captain)"] };
          setTimeout(() => {
            addLog("explore", "You have won the friendly duel against Hinata Sakaguchi!");
            addLog("explore", "Hinata smiles and signs a friendship treaty between the Western Holy Empire and Tempest.");
          }, 1000);
        } else if (enemy.bossId === "ch8_calgurio") {
          flags = { calgurioDefeated: true };
          setTimeout(() => {
            addLog("explore", "You have defeated Eastern Empire General Calgurio and destroyed his vanguard force!");
            addLog("explore", "You can now evolve your Twelve Patron Deities through a Soul Offering.");
          }, 1000);
        } else if (enemy.bossId === "ch9_michael") {
          flags = { michaelDefeated: true };
          setTimeout(() => {
            addLog("explore", "You have defeated the Avatar of Michael and protected Veldora's soul!");
            addLog("explore", "The Heavenly Gate scenario is secure. But a massive energy signature is detected inside the Labyrinth depths!");
          }, 1000);
        } else if (enemy.bossId === "ch10_jahil") {
          flags = { jahilDefeated: true };
          setTimeout(() => {
            addLog("explore", "You have defeated Possessed Jahil! His divine flames dissipate.");
          }, 1000);
        } else if (enemy.bossId === "ch10_zelanus") {
          flags = { zelanusDefeated: true };
          setTimeout(() => {
            addLog("explore", "You have defeated the Insectar King Zelanus! His razor-sharp carapace shatters.");
          }, 1000);
        } else if (enemy.bossId === "ch11_feldway") {
          flags = { feldwayDefeated: true };
          setTimeout(() => {
            addLog("explore", "You have defeated Feldway's True Form and preserved the Star King's timeline!");
            addLog("explore", "All dimensions are stabilized. You have completed the grand chronicle of Tensura!");
          }, 1000);
        } else if (enemy.bossId.startsWith("lab_floor_")) {
          const fl = parseInt(enemy.bossId.substring(10));
          flags = { maxLabyrinthFloorCleared: Math.max(prev.maxLabyrinthFloorCleared || 0, fl) };
          
          if (fl === 100) {
            flags.zegionDefeated = true;
            const skillsSet = new Set(prev.skills);
            skillsSet.add("Storm King Veldora");
            flags.skills = Array.from(skillsSet);
            flags.allies = [...prev.allies, "Zegion (Insectar Lord)"];
            setTimeout(() => {
              addLog("voice", "[Voice of the World]: Ultimate Skill 'Storm King Veldora' synthesized successfully.");
              addLog("voice", "[Voice of the World]: Insectar Lord 'Zegion' has sworn allegiance to Tempest.");
              addLog("explore", "CONGRATULATIONS! You have conquered all 100 floors of the Labyrinth!");
            }, 1200);
          } else {
            setTimeout(() => {
              addLog("explore", `You have defeated the Floor ${fl} Guardian! You can now descend deeper.`);
            }, 1200);
          }
        } else if (enemy.bossId === "custom_boss") {
          const finalEvo = CUSTOM_RACES[prev.customRace].evolutions[3];
          flags = {
            postGame: true,
            location: "Uncharted Rift",
            species: finalEvo,
            ep: prev.ep + 100000,
            maxHp: prev.maxHp + 300,
            hp: prev.maxHp + 300,
            maxMp: prev.maxMp + 200,
            mp: prev.maxMp + 200,
            str: prev.str + 50,
            def: prev.def + 40,
            agi: prev.agi + 40
          };
          setTimeout(() => {
            addLog("voice", `[Voice of the World]: Scenario boss ${enemy.name} defeated! Unique scenario completed.`);
            addLog("voice", `[Voice of the World]: Evolved into final pinnacle form: '${finalEvo}'.`);
            addLog("explore", "Welcome to the endless Uncharted Rift sandbox! Use your custom stats and skills to fight cosmic bosses.");
            generatePostGameMaze();
          }, 1500);
        } else if (enemy.bossId.startsWith("post_")) {
          const nextCount = (prev.postGameBossCount || 0) + 1;
          flags = { postGameBossCount: nextCount };
          
          if (enemy.bossId === "post_diablo") {
            if (!prev.allies.includes("Diablo (Primordial Black)")) {
              setTimeout(() => {
                addLog("voice", "[Voice of the World]: Primordial Black 'Diablo' has sworn allegiance to Individual 'Rimuru Tempest'.");
              }, 1200);
              flags.allies = [...prev.allies, "Diablo (Primordial Black)"];
            }
          } else if (enemy.bossId === "post_velgrynd") {
            if (!prev.skills.includes("Velgrynd (skill)")) {
              setTimeout(() => {
                addLog("voice", "[Voice of the World]: Analysis complete. Acquired 'Velgrynd (skill)' through soul-link and analysis.");
              }, 1200);
              flags.skills = [...prev.skills, "Velgrynd (skill)"];
            }
          } else if (enemy.bossId === "post_velzard") {
            if (!prev.skills.includes("Velzard (skill)")) {
              setTimeout(() => {
                addLog("voice", "[Voice of the World]: Analysis complete. Acquired 'Velzard (skill)' through soul-link and analysis.");
              }, 1200);
              flags.skills = [...prev.skills, "Velzard (skill)"];
            }
          } else if (enemy.bossId === "post_feldway") {
            const hasWeapon = inv.some(i => i.name === "Ruinous Phantom Blade");
            if (!hasWeapon) {
              inv.push({ name: "Ruinous Phantom Blade", quantity: 1, type: "weapon" });
              setTimeout(() => {
                addLog("explore", "Feldway drops the legendary Genesis-grade [Ruinous Phantom Blade] (+1200 STR)!");
              }, 1200);
            }
          } else if (enemy.bossId === "post_ivaraj") {
            setTimeout(() => {
              addLog("voice", "[Voice of the World]: Threat 'Evil Dragon God Ivaraj' neutralized. Eternal cosmic peace achieved.");
            }, 1200);
          }
          
          setTimeout(() => {
            addLog("explore", `Cosmic entity ${enemy.name} has been defeated. Area cleared. Use the controls to scan next territory.`);
          }, 1500);
        }
      }

      // Check custom quest hunt progress
      if (prev.customMode) {
        const spawnIdx = prev.customSpawnIndex || 0;
        const activeQuest = CUSTOM_RACES[prev.customRace]?.spawns[spawnIdx]?.quests[prev.customQuestStep];
        if (activeQuest && activeQuest.type === "hunt" && activeQuest.target === enemy.name) {
          const nextCount = (prev.customQuestCount || 0) + 1;
          flags.customQuestCount = nextCount;
          setTimeout(() => {
            addLog("system", `QUEST PROGRESS: Defeated ${enemy.name} (${nextCount}/${activeQuest.qty})`);
            if (nextCount >= activeQuest.qty) {
              addLog("voice", "[Voice of the World]: Quest hunt objective met. You can now advance and evolve.");
            }
          }, 1200);
        }
      }

      return {
        ...prev,
        ep: newEp,
        hp: newHp,
        mp: newMp,
        skills: flags.skills || finalSkills,
        inventory: inv,
        ...flags
      };
    });

    addLog("explore", `Defeated ${enemy.name}! Gained ${epGained} EP and recovered some HP/MP.`);
    
    setMaze(prev => {
      const copy = [...prev];
      copy[playerPos.y][playerPos.x] = 'P';
      return copy;
    });
  };

  const executeCombatRound = (action) => {
    if (!combat) return;
    playSound("click");

    let updatedEnemyHp = combat.enemyHp;
    let updatedPlayerHp = combat.playerHp;
    let updatedPlayerMp = combat.playerMp;
    const newLog = [];

    const accBonus = getAccessoryBonuses(rimuru.equippedAccessory);
    const playerStr = rimuru.str + getItemStatBonus(rimuru.equippedWeapon) + accBonus.str;
    const playerDef = rimuru.def + getItemStatBonus(rimuru.equippedArmor) + accBonus.def;
    const playerAgi = rimuru.agi + accBonus.agi;

    if (action.type === 'item') {
      const itemName = action.name;
      if (itemName === "Hipokute Potion") {
        updatedPlayerHp = Math.min(rimuru.maxHp, updatedPlayerHp + 150);
        consumeInventoryItem("Hipokute Potion", 1);
        newLog.push(`Rimuru consumes a Hipokute Potion, restoring 150 HP.`);
        playSound("spell");
      } else if (itemName === "Magicule Elixir") {
        updatedPlayerMp = Math.min(rimuru.maxMp, updatedPlayerMp + 100);
        consumeInventoryItem("Magicule Elixir", 1);
        newLog.push(`Rimuru consumes a Magicule Elixir, restoring 100 MP.`);
        playSound("spell");
      }
    } else if (action.type === 'attack') {
      const dmg = Math.max(5, playerStr - combat.enemy.def);
      updatedEnemyHp = Math.max(0, updatedEnemyHp - dmg);
      newLog.push(`Rimuru strikes ${combat.enemy.name} for ${dmg} damage.`);
      playSound("hit");
    } else if (action.type === 'skill') {
      const skillName = action.name;
      let cost = 0;
      let dmg = 0;
      
      if (skillName === "Water Blade") {
        cost = 10;
        dmg = Math.max(15, playerStr * 2 - combat.enemy.def);
      } else if (skillName === "Black Flame") {
        cost = 25;
        dmg = Math.max(30, Math.floor(playerStr * 3.5 - combat.enemy.def * 0.5));
      } else if (skillName === "Black Lightning") {
        cost = 40;
        dmg = Math.max(50, Math.floor(playerStr * 5 - combat.enemy.def * 0.25));
      } else if (skillName === "Azathoth" || skillName === "Void God Azathoth") {
        cost = 150;
        dmg = Math.max(500, Math.floor(playerStr * 20 - combat.enemy.def * 0.1));
        newLog.push("Void God Azathoth unleashes [Turn Null / Imaginary Collapse]!");
      } else if (skillName === "Harvest Lord Shub-Niggurath") {
        cost = 80;
        dmg = Math.max(300, Math.floor(playerStr * 10 - combat.enemy.def * 0.2));
        const heal = Math.floor(rimuru.maxHp * 0.2);
        updatedPlayerHp = Math.min(rimuru.maxHp, updatedPlayerHp + heal);
        newLog.push(`Harvest Lord Shub-Niggurath duplicates supportive abilities, recovering ${heal} HP.`);
      } else if (skillName === "Veldora (skill)") {
        cost = 60;
        dmg = Math.max(100, Math.floor(playerStr * 7 - combat.enemy.def * 0.2));
      } else if (skillName === "Velgrynd (skill)") {
        cost = 70;
        dmg = Math.max(120, Math.floor(playerStr * 8 - combat.enemy.def * 0.2));
      } else if (skillName === "Velzard (skill)") {
        cost = 80;
        dmg = Math.max(150, Math.floor(playerStr * 9 - combat.enemy.def * 0.15));
        updatedPlayerHp = Math.min(rimuru.maxHp, updatedPlayerHp + playerDef * 2);
        newLog.push("Rimuru activates [Snow Crystal Barrier] block and deals freezing slash damage.");
      } else if (skillName === "Flame God Cthugha") {
        cost = 120;
        dmg = Math.max(400, Math.floor(playerStr * 15 - combat.enemy.def * 0.15));
        newLog.push("Flame God Cthugha incinerates the target with [Prometheus Celestial Flare]!");
      } else if (skillName === "Storm King Veldora") {
        cost = 140;
        dmg = Math.max(500, Math.floor(playerStr * 22 - combat.enemy.def * 0.15));
        newLog.push("Storm King Veldora unleashes [Storm Dragon Lightning Claw]!");
      } else if (skillName === "Ultrasonic Wave" || skillName === "Water Spray") {
        cost = 8;
        dmg = Math.max(12, Math.floor(playerStr * 1.5 - combat.enemy.def));
      } else if (skillName === "Sword Slash" || skillName === "Crestwater Slash") {
        cost = 10;
        dmg = Math.max(15, Math.floor(playerStr * 2.0 - combat.enemy.def));
      } else if (skillName === "Water Manipulation" || skillName === "Water Current Motion") {
        cost = 15;
        dmg = Math.max(20, Math.floor(playerStr * 2.2 - combat.enemy.def));
      } else if (skillName === "Earth Manipulation") {
        cost = 12;
        dmg = Math.max(18, Math.floor(playerStr * 1.5 + playerDef * 1.0 - combat.enemy.def));
      } else if (skillName === "Strengthen Body") {
        cost = 8;
        dmg = Math.max(15, Math.floor(playerStr * 2.5 - combat.enemy.def));
        updatedPlayerHp = Math.min(rimuru.maxHp, updatedPlayerHp + 25);
        newLog.push("Rimuru heals 25 HP via cell stimulation.");
      } else if (skillName === "Iron Wall" || skillName === "Scale Armor" || skillName === "Dragon Skin") {
        cost = 10;
        dmg = Math.max(10, Math.floor(playerDef * 3.0 - combat.enemy.def));
        updatedPlayerHp = Math.min(rimuru.maxHp, updatedPlayerHp + playerDef);
        newLog.push(`Regenerative shield blocks and recovers ${playerDef} HP.`);
      } else if (skillName === "Danger Detection") {
        cost = 5;
        dmg = Math.max(12, Math.floor(playerAgi * 2.5 - combat.enemy.def));
      } else if (skillName === "Hide" || skillName === "Shadow Step") {
        cost = 10;
        dmg = Math.max(25, Math.floor(playerAgi * 3.5 - combat.enemy.def * 0.5));
      } else if (skillName === "Coercion" || skillName === "Haki" || skillName === "Menace") {
        cost = 15;
        dmg = Math.max(20, Math.floor(playerStr * 2.0 - combat.enemy.def));
        updatedPlayerHp = Math.min(rimuru.maxHp, updatedPlayerHp + 20);
      } else if (skillName === "Starved") {
        cost = 12;
        dmg = Math.max(15, Math.floor(playerStr * 2.0 - combat.enemy.def));
        const heal = Math.floor(dmg * 0.5);
        updatedPlayerHp = Math.min(rimuru.maxHp, updatedPlayerHp + heal);
        newLog.push(`Starved absorbs vital energy, healing for ${heal} HP.`);
      } else if (skillName === "Thought Acceleration" || skillName === "Chant Annulment") {
        cost = 8;
        dmg = Math.max(14, Math.floor(playerAgi * 2.0 - combat.enemy.def));
      } else if (skillName === "Darkness Manipulation") {
        cost = 14;
        dmg = Math.max(22, Math.floor(playerStr * 1.8 + playerAgi * 1.5 - combat.enemy.def * 0.3));
      } else {
        cost = 5;
        dmg = Math.max(10, Math.floor(playerStr * 1.2 - combat.enemy.def));
      }

      if (updatedPlayerMp >= cost) {
        updatedPlayerMp -= cost;
        updatedEnemyHp = Math.max(0, updatedEnemyHp - dmg);
        newLog.push(`Rimuru uses [${skillName}] dealing ${dmg} damage (Cost: ${cost} MP).`);
        playSound("spell");
      } else {
        newLog.push(`Failed to use [${skillName}]: Insufficient MP.`);
      }
    } else if (action.type === 'magic') {
      const spellName = action.name;
      let cost = 0;
      let dmg = 0;
      const labBoost = 1.0 + (rimuru.town.laboratory || 0) * 0.1;

      if (spellName === "Fireball") { cost = 10; dmg = Math.max(12, Math.floor((playerStr * 1.5 - combat.enemy.def) * labBoost)); }
      else if (spellName === "Megiddo") { cost = 80; dmg = Math.max(150, Math.floor(playerStr * 10 * labBoost)); }
      else if (spellName === "Magic Bullet") { cost = 5; dmg = Math.max(20, Math.floor(playerStr * 1.1 * labBoost)); }
      else { cost = 15; dmg = Math.max(15, Math.floor((playerStr * 1.5 - combat.enemy.def) * labBoost)); }

      if (updatedPlayerMp >= cost) {
        updatedPlayerMp -= cost;
        updatedEnemyHp = Math.max(0, updatedEnemyHp - dmg);
        newLog.push(`Rimuru casts [${spellName}] dealing ${dmg} damage (Cost: ${cost} MP).`);
        playSound("spell");
      } else {
        newLog.push(`Failed to cast [${spellName}]: Insufficient MP.`);
      }
    } else if (action.type === 'predate') {
      const hpRatio = updatedEnemyHp / combat.maxEnemyHp;
      if (hpRatio <= 0.35) {
        playSound("spell");
        newLog.push(`Rimuru activates Predation / Gluttony / Beelzebuth!`);
        newLog.push(`Successfully devoured ${combat.enemy.name}!`);
        setCombat(null);
        handleCombatVictory(combat.enemy, true);
        return;
      } else {
        const failDmg = Math.max(5, Math.floor(playerStr * 0.5));
        updatedEnemyHp = Math.max(0, updatedEnemyHp - failDmg);
        newLog.push(`Predation failed! Target is too strong (HP > 35%). Dealt ${failDmg} damage.`);
        playSound("hit");
      }
    }

    if (updatedEnemyHp > 0 && rimuru.allies.length > 0) {
      rimuru.allies.slice(0, 3).forEach(ally => {
        if (updatedEnemyHp <= 0) return;
        
        if (ally.startsWith("Flair Lord Benimaru")) {
          if (rimuru.cthughaUnlocked) {
            const extra = 800;
            updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
            newLog.push(`Flair Lord Benimaru (Flame God Cthugha) supports: Casts [Prometheus Flame Burst] dealing ${extra} ultimate fire damage!`);
          } else {
            const extra = 250;
            updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
            newLog.push(`Flair Lord Benimaru supports: Casts [Black Flame Hellfire] dealing ${extra} fire damage.`);
          }
        } else if (ally.startsWith("Demon Lord Diablo")) {
          const extra = 400;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`Demon Lord Diablo supports: Activates [Primordial Black Void] dealing ${extra} void damage.`);
        } else if (ally.startsWith("War Lord Shion")) {
          const extra = 300;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`War Lord Shion supports: Executes [Chaotic Fate Slash] dealing ${extra} physical damage.`);
        } else if (ally.startsWith("Barrier Lord Geld")) {
          const extra = 100;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          updatedPlayerHp = Math.min(rimuru.maxHp, updatedPlayerHp + 60);
          newLog.push(`Barrier Lord Geld shields you (+60 HP block) and counters for ${extra} physical damage.`);
        } else if (ally.startsWith("Dragon Lord Gabil")) {
          const extra = 220;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`Dragon Lord Gabil supports: Releases [Dragon Factor Shockwave] dealing ${extra} sonic damage.`);
        } else if (ally.startsWith("Hinata Sakaguchi")) {
          const extra = 280;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`Hinata Sakaguchi supports: Executes [Seven Celestial Slashes] dealing ${extra} holy damage.`);
        } else if (ally.startsWith("Zegion")) {
          const extra = 600;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`Zegion (Insectar Lord) supports: Executes [Dimension Slash] dealing ${extra} spatial slash damage!`);
        } else if (ally.startsWith("Benimaru")) {
          const extra = 30;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`Benimaru supports: Casts [Black Flame] dealing ${extra} fire damage.`);
        } else if (ally.startsWith("Ranga")) {
          const extra = 25;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`Ranga supports: Casts [Black Lightning] dealing ${extra} lightning damage.`);
        } else if (ally.startsWith("Shion")) {
          const extra = 35;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`Shion supports: Strikes with her nodachi dealing ${extra} physical damage.`);
        } else if (ally.startsWith("Hakurou")) {
          const extra = 40;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`Hakurou supports: Executes [Crestwater Slash] dealing ${extra} damage.`);
        } else if (ally.startsWith("Souei")) {
          const extra = 20;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`Souei supports: Uses [Sticky Steel Thread] dealing ${extra} damage.`);
        } else if (ally.startsWith("Milim Nava")) {
          const extra = combat.enemy.bossId === "ch4_charybdis" ? 99999 : 150;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`Milim Nava supports: Casts [Drago Buster] dealing ${extra} cosmic damage!`);
        } else if (ally.startsWith("Diablo")) {
          const extra = 250;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`Diablo supports: Activates [Primordial Black Void] dealing ${extra} void damage.`);
        } else if (ally.startsWith("Dwarven Defender") || ally.startsWith("Shield Knight") || ally.startsWith("Dragon Sentinel") || ally.startsWith("Orc Ironclad")) {
          const extra = 12;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          updatedPlayerHp = Math.min(rimuru.maxHp, updatedPlayerHp + 5);
          newLog.push(`${ally.split(" ")[0]} shields you (+5 HP block) and counters for ${extra} physical damage.`);
        } else if (ally.startsWith("Dwarven Sapper") || ally.startsWith("Ogre Vanguard") || ally.startsWith("Orc Berserker")) {
          const extra = 25;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`${ally.split(" ")[0]} strikes with high fury, dealing ${extra} damage.`);
        } else if (ally.startsWith("Spellsword Recruit") || ally.startsWith("Ogre Flame-Wielder") || ally.startsWith("Dragon Zealot")) {
          const extra = 22;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`${ally.split(" ")[0]} imbues their weapon with magic, dealing ${extra} elemental damage.`);
        } else if (ally.startsWith("Dwarven Marksman") || ally.startsWith("Goblin Hunter") || ally.startsWith("Swamp Scout")) {
          const extra = 18;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`${ally.split(" ")[0]} shoots from afar, dealing ${extra} puncture damage.`);
        } else {
          const extra = 10;
          updatedEnemyHp = Math.max(0, updatedEnemyHp - extra);
          newLog.push(`${ally.split(" ")[0]} supports: Attacks dealing ${extra} damage.`);
        }
      });
    }

    if (updatedEnemyHp <= 0) {
      setCombat(null);
      handleCombatVictory(combat.enemy, false);
      return;
    }

    const nextTurn = (combat.turn || 1) + 1;
    let enemyDmg = Math.max(2, combat.enemy.str - playerDef);
    if (combat.enemy.bossId === "ch5_hinata" && nextTurn >= 5) {
      newLog.push("Hinata Sakaguchi casts [Disintegration]! Brilliant holy light completely disintegrates your body.");
      updatedPlayerHp = 0;
    } else {
      // 35% chance for normal enemies, 60% for bosses to cast their skill
      const isBoss = combat.enemy.isBoss;
      const skillName = enemySkills[combat.enemy.name];
      const useSkill = (isBoss && Math.random() < 0.6) || (!isBoss && skillName && Math.random() < 0.35);
      
      if (useSkill) {
        let skillDmg = enemyDmg;
        let skillUsed = skillName || "Special Skill";
        let effectMsg = "";
        
        if (isBoss) {
          const bossId = combat.enemy.bossId;
          if (bossId === "ch2") {
            skillUsed = "Dark Lightning Bolt";
            skillDmg = Math.max(10, Math.floor(combat.enemy.str * 1.5 - playerDef));
          } else if (bossId === "ch3") {
            skillUsed = "Black Fire Flare";
            skillDmg = Math.max(20, Math.floor(combat.enemy.str * 1.6 - playerDef));
          } else if (bossId === "ch4") {
            skillUsed = "Starved Decay";
            skillDmg = Math.max(30, Math.floor(combat.enemy.str * 1.4 - playerDef * 0.8));
            updatedPlayerMp = Math.max(0, updatedPlayerMp - 30);
            effectMsg = " (decayed 30 MP)";
          } else if (bossId === "ch4_charybdis") {
            skillUsed = "Gravity Tempest";
            skillDmg = Math.max(40, Math.floor(combat.enemy.str * 1.5 - playerDef));
          } else if (bossId === "ch5") {
            skillUsed = "Berserker Stampede";
            skillDmg = Math.max(35, Math.floor(combat.enemy.str * 1.7 - playerDef));
          } else if (bossId === "ch5_hinata" || bossId === "ch7_hinata") {
            skillUsed = "Seven Celestial Slashes";
            skillDmg = Math.max(50, Math.floor(combat.enemy.str * 1.8 - playerDef * 0.6));
          } else if (bossId === "ch6_clayman") {
            skillUsed = "Death Scream Demon Ray";
            skillDmg = Math.max(45, Math.floor(combat.enemy.str * 1.6 - playerDef * 0.7));
          } else if (bossId === "ch7_bovix_equix") {
            skillUsed = "Dual Minotaur-Centaur Smash";
            skillDmg = Math.max(60, Math.floor(combat.enemy.str * 1.7 - playerDef));
          } else if (bossId === "ch8_calgurio") {
            skillUsed = "Imperial Legion Artillery";
            skillDmg = Math.max(80, Math.floor(combat.enemy.str * 1.6 - playerDef));
          } else if (bossId === "ch9_michael") {
            skillUsed = "Regalia Dominion Spell";
            skillDmg = Math.max(120, Math.floor(combat.enemy.str * 2.0 - playerDef * 0.5));
          } else if (bossId === "ch10_jahil") {
            skillUsed = "Abyss Solar Flare";
            skillDmg = Math.max(180, Math.floor(combat.enemy.str * 2.3 - playerDef * 0.4));
          } else if (bossId === "ch10_zelanus") {
            skillUsed = "Insectar Overlord Blade";
            skillDmg = Math.max(220, Math.floor(combat.enemy.str * 2.5 - playerDef * 0.3));
          } else if (bossId === "ch11_feldway") {
            skillUsed = "True Chrono Collapse";
            skillDmg = Math.max(350, Math.floor(combat.enemy.str * 3.0 - playerDef * 0.2));
          } else if (bossId === "lab_floor_50") {
            skillUsed = "Duo-Elemental Smash";
            skillDmg = Math.max(90, Math.floor(combat.enemy.str * 1.8 - playerDef));
          } else if (bossId === "lab_floor_70") {
            skillUsed = "Death King Holy Magic";
            skillDmg = Math.max(150, Math.floor(combat.enemy.str * 2.1 - playerDef * 0.4));
          } else if (bossId === "lab_floor_80") {
            skillUsed = "Death Paladin Spear";
            skillDmg = Math.max(200, Math.floor(combat.enemy.str * 2.3 - playerDef * 0.3));
          } else if (bossId === "lab_floor_90") {
            skillUsed = "Nine-Tailed Fox Beast Roar";
            skillDmg = Math.max(250, Math.floor(combat.enemy.str * 2.4 - playerDef * 0.3));
          } else if (bossId === "lab_floor_100") {
            skillUsed = "Dimension Shear Slash";
            skillDmg = Math.max(350, Math.floor(combat.enemy.str * 2.9 - playerDef * 0.2));
          } else if (bossId === "post_diablo" || combat.enemy.name === "Primordial White Testarossa" || combat.enemy.name === "boss_testarossa") {
            skillUsed = "Death Streak Void";
            skillDmg = Math.max(150, Math.floor(combat.enemy.str * 2.2 - playerDef * 0.4));
          } else if (bossId === "post_velgrynd") {
            skillUsed = "Cardinal Acceleration Flare";
            skillDmg = Math.max(200, Math.floor(combat.enemy.str * 2.4 - playerDef * 0.3));
          } else if (bossId === "post_guy") {
            skillUsed = "Crimson Flare Void";
            skillDmg = Math.max(250, Math.floor(combat.enemy.str * 2.5 - playerDef * 0.2));
          } else if (combat.enemy.name.includes("Rain")) {
            skillUsed = "Blizzard Mist Ice Tempest";
            skillDmg = Math.max(100, Math.floor(combat.enemy.str * 1.8 - playerDef * 0.6));
          } else {
            skillUsed = "Boss Strike";
            skillDmg = Math.max(30, Math.floor(combat.enemy.str * 1.5 - playerDef));
          }
        } else {
          // Standard enemy skills
          if (skillName === "Ultrasonic Wave") {
            skillDmg = Math.max(3, Math.floor(combat.enemy.str * 1.3 - playerDef));
            updatedPlayerMp = Math.max(0, updatedPlayerMp - 15);
            effectMsg = " (drained 15 MP)";
          } else if (skillName === "Water Spray" || skillName === "Water Manipulation") {
            skillDmg = Math.max(4, Math.floor(combat.enemy.str * 1.4 - playerDef));
          } else if (skillName === "Paralysis Breath") {
            skillDmg = Math.max(3, Math.floor(combat.enemy.str * 1.2 - playerDef));
            effectMsg = " (inflicted minor paralysis)";
          } else if (skillName === "Shadow Step") {
            skillDmg = Math.max(5, Math.floor(combat.enemy.str * 1.5 - playerDef));
          } else if (skillName === "Charge") {
            skillDmg = Math.max(6, Math.floor(combat.enemy.str * 1.6 - playerDef));
          } else if (skillName === "Darkness Manipulation") {
            skillDmg = Math.max(5, Math.floor(combat.enemy.str * 1.5 - playerDef * 0.8));
          } else if (skillName === "Parasitic Sting") {
            skillDmg = Math.max(10, Math.floor(combat.enemy.str * 1.4 - playerDef));
            updatedPlayerMp = Math.max(0, updatedPlayerMp - 20);
            effectMsg = " (leached 20 MP)";
          } else if (skillName === "Entropy Surge") {
            skillDmg = Math.max(15, Math.floor(combat.enemy.str * 1.6 - playerDef * 0.9));
            effectMsg = " (scrambled thoughts)";
          } else {
            skillDmg = Math.max(4, Math.floor(combat.enemy.str * 1.3 - playerDef));
          }
        }
        
        updatedPlayerHp = Math.max(0, updatedPlayerHp - skillDmg);
        newLog.push(`${combat.enemy.name} activates [${skillUsed}] dealing ${skillDmg} damage${effectMsg}!`);
        playSound("spell");
      } else {
        updatedPlayerHp = Math.max(0, updatedPlayerHp - enemyDmg);
        newLog.push(`${combat.enemy.name} attacks Rimuru dealing ${enemyDmg} damage.`);
        playSound("hit");
      }
    }

    if (updatedPlayerHp <= 0) {
      if (combat.enemy.bossId === "ch4_milim") {
        playSound("level");
        setCombat(null);
        setRimuru(prev => {
          const nextState = {
            ...prev,
            hp: prev.maxHp,
            mp: prev.maxMp,
            milimBefriended: true,
            allies: [...prev.allies, "Milim Nava (Demon Lord)"]
          };
          localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
          return nextState;
        });
        addLog("voice", "[Voice of the World]: Combat halted. Individual 'Milim Nava' hostile intent resolved to friendly.");
        addLog("explore", "Milim stops fighting and giggles: 'You're tough and fun! I decided I won't kill you. Let's be best friends!'");
        
        addLog("voice", "[Voice of the World]: WARNING. Catastrophe-class threat 'Charybdis' has been revived.");
        addLog("explore", "A giant flying beast 'Charybdis' appears above the swamps! Navigate to cell [4, 4] to defeat it.");
        setMaze(prev => {
          const copy = [...prev];
          copy[4][4] = 'C';
          return copy;
        });
        setPlayerPos({ x: 0, y: 0 });
        return;
      }
      
      if (combat.enemy.bossId === "ch5_hinata") {
        playSound("spell");
        setCombat(null);
        setRimuru(prev => {
          const nextState = {
            ...prev,
            hp: prev.maxHp,
            mp: prev.maxMp,
            hinataDefeated: true
          };
          localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
          return nextState;
        });
        addLog("voice", "[Voice of the World]: Decoy escape successful. Body double sacrificed to bypass Captain Hinata.");
        addLog("explore", "You escape back to Tempest Outskirts safely. You can now challenge the Falmuth vanguard!");
        
        setMaze(prev => {
          const copy = [...prev];
          copy[2][2] = '.';
          copy[playerPos.y][playerPos.x] = 'P';
          return copy;
        });
        setPlayerPos({ x: 0, y: 0 });
        return;
      }

      playSound("sleep");
      setCombat(null);
      addLog("system", `Rimuru was defeated by ${combat.enemy.name}... Automatic reload from core database.`);
      setRimuru(prev => ({
        ...prev,
        hp: prev.maxHp,
        mp: prev.maxMp
      }));
      setMaze(JSON.parse(JSON.stringify(MAZES[rimuru.chapter])));
      setPlayerPos({ x: 0, y: 0 });
      return;
    }

    setCombat(prev => ({
      ...prev,
      enemyHp: updatedEnemyHp,
      playerHp: updatedPlayerHp,
      playerMp: updatedPlayerMp,
      turn: nextTurn,
      log: [...prev.log, ...newLog]
    }));
  };

  // Web Audio Context Synthesized Sound FX
  const playSound = (type) => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === "hit") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "spell") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.35);
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "sleep") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === "level") {
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.setValueAtTime(440, now + 0.08);
        osc.frequency.setValueAtTime(554, now + 0.16);
        osc.frequency.setValueAtTime(659, now + 0.24);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.setValueAtTime(0.04, now + 0.24);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.start();
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.log("Audio FX synthesis failed", e);
    }
  };

  // Trigger speech and sound effects when logs update
  const speakText = (text) => {
    if (!audioEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/\[Voice of the World\]:/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => 
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Zira")) && 
        v.lang.startsWith("en")
      );
      if (preferred) utterance.voice = preferred;
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.log("Speech synthesis failed", e);
    }
  };

  useEffect(() => {
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      if (lastLog.type === "voice") {
        speakText(lastLog.text);
        playSound("level");
      } else if (lastLog.type === "explore") {
        playSound("click");
      }
    }
  }, [logs, audioEnabled]);

  // Load the Fandom database JSON files
  useEffect(() => {
    const loadDatabases = async () => {
      try {
        setLoadingText("Accessing Voice of the World files...");
        setLoadingProgress(10);
        
        // Fetch Skills
        const resSkills = await fetch('/data/skills.json');
        if (resSkills.ok) {
          const data = await resSkills.json();
          setSkillsDb(data);
          setAllSkillsList(Object.keys(data));
        }
        setLoadingProgress(40);

        // Fetch Magic
        const resMagic = await fetch('/data/magic.json');
        if (resMagic.ok) {
          const data = await resMagic.json();
          setMagicDb(data);
        }
        setLoadingProgress(60);

        // Fetch Species
        const resSpecies = await fetch('/data/species.json');
        if (resSpecies.ok) {
          const data = await resSpecies.json();
          setSpeciesDb(data);
        }
        setLoadingProgress(80);

        // Fetch Items
        const resItems = await fetch('/data/items.json');
        if (resItems.ok) {
          const data = await resItems.json();
          setItemsDb(data);
        }
        setLoadingProgress(100);
        setLoadingText("Databases verified. Soul core ready.");
        
        // Load initial maze
        setMaze(JSON.parse(JSON.stringify(MAZES[1])));
        setPlayerPos({ x: 0, y: 0 });

        if (window.speechSynthesis) {
          window.speechSynthesis.getVoices();
        }

        setTimeout(() => setLoading(false), 500);
      } catch (err) {
        console.log("Error loading database files", err);
        setLoadingProgress(100);
        setLoadingText("System mismatch. Starting fallback terminal.");
        setTimeout(() => setLoading(false), 500);
      }
    };
    loadDatabases();
  }, []);

  // Great Sage Auto-Combat Engine
  useEffect(() => {
    if (!combat || !autoCombat) return;

    const timer = setTimeout(() => {
      // Auto logic
      const enemyHpRatio = combat.enemyHp / combat.maxEnemyHp;
      
      // 1. Predate if target is weak and we have predator capacity
      if (enemyHpRatio < 0.35 && rimuru.skills.some(s => ["Predator", "Gluttony", "Beelzebuth"].includes(s))) {
        executeCombatRound({ type: "predate" });
        return;
      }
      
      // 2. Cast powerful spells if magicules are high
      if (combat.playerMp >= 80 && rimuru.magic.includes("Megiddo")) {
        executeCombatRound({ type: "magic", name: "Megiddo" });
        return;
      }
      if (combat.playerMp >= 20 && rimuru.magic.includes("Fireball")) {
        executeCombatRound({ type: "magic", name: "Fireball" });
        return;
      }

      // 3. Trigger strongest available skill
      const activeSkills = rimuru.skills.filter(s => ["Water Blade", "Black Flame", "Black Lightning"].includes(s));
      if (activeSkills.length > 0) {
        // Prefer Black Flame or Water Blade
        const bestSkill = activeSkills.includes("Black Flame") ? "Black Flame" : activeSkills[0];
        executeCombatRound({ type: "skill", name: bestSkill });
        return;
      }

      // 4. Fallback to physical attack
      executeCombatRound({ type: "attack" });
    }, 850);

    return () => clearTimeout(timer);
  }, [combat, autoCombat]);

  // Handle Maze movements (Exploration Roguelike)
  const movePlayer = (dx, dy) => {
    if (activeCustomEvent) {
      addLog("system", "SYS: Resolve the active event before moving.");
      return;
    }
    const nextX = playerPos.x + dx;
    const nextY = playerPos.y + dy;

    const height = maze.length;
    const width = maze[0]?.length || 0;

    // Check bounds
    if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
      addLog("system", "SYS: Target coordinates out of bounds.");
      playSound("hit");
      return;
    }

    const cell = maze[nextY][nextX];

    // Check walls
    if (cell === '#') {
      addLog("explore", "You bumped into a dense obstacle wall.");
      playSound("hit");
      return;
    }

    // Passive town gathering based on population on each step
    const woodGathered = Math.floor(rimuru.town.goblins * 0.05);
    const stoneGathered = Math.floor(rimuru.town.orcs * 0.03);
    if (woodGathered > 0 || stoneGathered > 0) {
      setRimuru(prev => ({
        ...prev,
        town: {
          ...prev.town,
          wood: prev.town.wood + woodGathered,
          stone: prev.town.stone + stoneGathered
        }
      }));
    }

    // Process destination
    let updatedState = [...maze];
    updatedState[playerPos.y][playerPos.x] = '.'; // vacate previous position
    updatedState[nextY][nextX] = 'P'; // set new position
    setMaze(updatedState);
    setPlayerPos({ x: nextX, y: nextY });

    if (rimuru.customMode) {
      if (cell === 'T') {
        setActiveCustomEvent({ type: "merchant" });
        addLog("explore", "You enter the Faction Trading Post. Speak to the vendor.");
        return;
      } else if (cell === 'S') {
        const pool = ["Haki", "Steel Strength", "Coercion", "Thought Acceleration", "Regeneration", "Hide", "Water Blade", "Explosive Flames", "Iron Wall", "Danger Detection"];
        const filtered = pool.filter(s => !rimuru.skills.includes(s));
        const shuffled = [...filtered].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        setShrineSkills(selected);
        setActiveCustomEvent({ type: "shrine" });
        addLog("explore", "You stand before a glowing runic shrine. Wisdom overflows.");
        return;
      } else if (cell === 'D') {
        const trapIdx = Math.floor(Math.random() * 3);
        setActiveCustomEvent({ type: "dungeon", trapIndex: trapIdx });
        if (trapIdx === 0) addLog("explore", "CRITICAL WARNING: The floor crumbles into a spike pit!");
        else if (trapIdx === 1) addLog("explore", "CRITICAL WARNING: Green toxic gas vents hiss open!");
        else addLog("explore", "You find a mysterious glowing chest covered in defensive lock runes.");
        return;
      }
    }

    if (cell === 'O') {
      // Find ore or items
      const itemsList = ["Magical Ore", "Hipokute Herb", "Steel Core"];
      if (rimuru.chapter === 3 || rimuru.chapter === 4) {
        itemsList.push("Honey");
      }
      if (rimuru.customMode) {
        const spawnIdx = rimuru.customSpawnIndex || 0;
        const activeQuest = CUSTOM_RACES[rimuru.customRace]?.spawns[spawnIdx]?.quests[rimuru.customQuestStep];
        if (activeQuest && activeQuest.type === "gather" && !itemsList.includes(activeQuest.target)) {
          itemsList.push(activeQuest.target);
        }
      }
      const mat = itemsList[Math.floor(Math.random() * itemsList.length)];
      setRimuru(prev => {
        const inv = [...prev.inventory];
        const idx = inv.findIndex(i => i.name === mat);
        if (idx >= 0) inv[idx].quantity += 1;
        else inv.push({ name: mat, quantity: 1, type: "material" });

        // Track custom quest progress
        let questFlags = {};
        if (prev.customMode) {
          const spawnIdx = prev.customSpawnIndex || 0;
          const activeQuest = CUSTOM_RACES[prev.customRace]?.spawns[spawnIdx]?.quests[prev.customQuestStep];
          if (activeQuest && activeQuest.type === "gather" && activeQuest.target === mat) {
            const nextCount = (prev.customQuestCount || 0) + 1;
            questFlags.customQuestCount = nextCount;
            setTimeout(() => {
              addLog("system", `QUEST PROGRESS: Gathered ${mat} (${nextCount}/${activeQuest.qty})`);
              if (nextCount >= activeQuest.qty) {
                addLog("voice", "[Voice of the World]: Quest objective met. You can now advance and evolve.");
              }
            }, 1000);
          }
        }

        return { ...prev, inventory: inv, ...questFlags };
      });
      addLog("explore", `Absorbed resource node: Acquired [${mat}].`);
      playSound("level");
    } else if (cell === 'E') {
      // Spawn random enemy
      const area = rimuru.customMode ? CUSTOM_AREAS[rimuru.location] : AREAS[rimuru.chapter];
      const enemyName = area.enemyPool[Math.floor(Math.random() * area.enemyPool.length)];
      addLog("explore", `Stepped onto Enemy tile! Ambushed by ${enemyName}.`);
      startCombat(enemyName);
    } else if (cell === 'V') {
      ch1Veldora();
    } else if (cell === 'D' && !rimuru.customMode) {
      ch2Boss();
    } else if (cell === 'B') {
      ch3Boss();
    } else if (cell === 'G') {
      ch4Boss();
    } else if (cell === 'M') {
      ch4Milim();
    } else if (cell === 'C') {
      ch4Charybdis();
    } else if (cell === 'H') {
      if (rimuru.chapter === 7) {
        ch7HinataRematch();
      } else {
        ch5Hinata();
      }
    } else if (cell === 'F') {
      ch5Boss();
    } else if (cell === 'K') {
      ch6Clayman();
    } else if (cell === 'L') {
      ch7BovixEquix();
    } else if (cell === 'W') {
      ch8Calgurio();
    } else if (cell === 'Y') {
      ch9Michael();
    } else if (cell === 'J') {
      if (rimuru.jahilDefeated) {
        addLog("explore", "You stand where Possessed Jahil was defeated. Only ashes and scorched stone remain.");
      } else {
        ch10Jahil();
      }
    } else if (cell === 'Z') {
      if (rimuru.zelanusDefeated) {
        addLog("explore", "You stand where Zelanus was defeated. His shattered carapace pieces lie scattered.");
      } else {
        ch10Zelanus();
      }
    } else if (cell === 'U') {
      if (rimuru.feldwayDefeated) {
        addLog("explore", "You stand in the empty void where Feldway's True Form was erased.");
      } else {
        ch11Feldway();
      }
    } else if (cell === 'A') {
      chPostGameBoss();
    } else if (cell === 'X') {
      triggerCustomBoss();
    } else {
      addLog("explore", `Moved to coordinates [X:${nextX}, Y:${nextY}].`);
    }
  };

  // Sync Maze state on chapter change
  useEffect(() => {
    if (created && MAZES[rimuru.chapter]) {
      setMaze(JSON.parse(JSON.stringify(MAZES[rimuru.chapter])));
      setPlayerPos({ x: 0, y: 0 });
    }
  }, [rimuru.chapter, created]);

  // Save/Load States
  const saveGame = () => {
    try {
      localStorage.setItem('tensura_rpg_save', JSON.stringify(rimuru));
      addLog("system", "SYS: Progress successfully recorded in local storage.");
      playSound("level");
    } catch (e) {
      addLog("system", "SYS: Failed to write save state to disk.");
    }
  };

  const loadGame = () => {
    try {
      const dataStr = localStorage.getItem('tensura_rpg_save');
      if (dataStr) {
        const loaded = JSON.parse(dataStr);
        // Robust state migration
        const migrated = {
          ...loaded,
          customMode: loaded.customMode || false,
          customRace: loaded.customRace || "",
          customSpawnIndex: loaded.customSpawnIndex !== undefined ? loaded.customSpawnIndex : 0,
          customClass: loaded.customClass || "",
          customQuestStep: loaded.customQuestStep !== undefined ? loaded.customQuestStep : 1,
          customQuestCount: loaded.customQuestCount !== undefined ? loaded.customQuestCount : 0,
          allies: loaded.allies || [],
          inventory: loaded.inventory || [],
          equippedWeapon: loaded.equippedWeapon !== undefined ? loaded.equippedWeapon : null,
          equippedArmor: loaded.equippedArmor !== undefined ? loaded.equippedArmor : null,
          equippedAccessory: loaded.equippedAccessory !== undefined ? loaded.equippedAccessory : null,
          claymanDefeated: loaded.claymanDefeated || false,
          octagramFounded: loaded.octagramFounded || false,
          labyrinthBuilt: loaded.labyrinthBuilt || false,
          labyrinthCleared: loaded.labyrinthCleared || false,
          hinataReconciled: loaded.hinataReconciled || false,
          calgurioDefeated: loaded.calgurioDefeated || false,
          patronDeitiesEvolved: loaded.patronDeitiesEvolved || false,
          collectedSouls: loaded.collectedSouls || 0,
          michaelDefeated: loaded.michaelDefeated || false,
          cthughaUnlocked: loaded.cthughaUnlocked !== undefined ? loaded.cthughaUnlocked : false,
          dungeonFloor: loaded.dungeonFloor !== undefined ? loaded.dungeonFloor : 1,
          maxLabyrinthFloorCleared: loaded.maxLabyrinthFloorCleared !== undefined ? loaded.maxLabyrinthFloorCleared : 0,
          zegionDefeated: loaded.zegionDefeated !== undefined ? loaded.zegionDefeated : false,
          town: {
            dwellings: 0,
            smithy: 0,
            laboratory: 0,
            goblins: 0,
            orcs: 0,
            wood: 0,
            stone: 0,
            ...(loaded.town || {})
          }
        };
        setRimuru(migrated);
        setCreated(true);
        setSetupScreen("playing");
        addLog("voice", "[Voice of the World]: Restoration of player parameters complete.");
        
        // Regenerate maze based on state
        if (migrated.postGame) {
          generatePostGameMaze();
        } else if (migrated.customMode && migrated.customRace) {
          generateCustomRaceMaze(migrated.customRace, migrated.customQuestStep, migrated.customSpawnIndex);
        } else if (MAZES[migrated.chapter]) {
          setMaze(JSON.parse(JSON.stringify(MAZES[migrated.chapter])));
          setPlayerPos({ x: 0, y: 0 });
        }
      } else {
        addLog("system", "SYS: No save checkpoint found.");
      }
    } catch (e) {
      addLog("system", "SYS: Failed to read save state.");
    }
  };

  // String parser to resolve evolution requirements using all database skill keys
  const getRequiredSkills = (previousStr) => {
    if (!previousStr || allSkillsList.length === 0) return [];
    const sorted = [...allSkillsList].sort((a, b) => b.length - a.length);
    const matched = [];
    let temp = previousStr.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const skill of sorted) {
      if (skill.length < 3) continue;
      const normalizedSkill = skill.toLowerCase().replace(/\s*\(skill\)\s*/g, '').replace(/[^a-z0-9]/g, '');
      if (normalizedSkill.length >= 3 && temp.includes(normalizedSkill)) {
        matched.push(skill);
        temp = temp.replace(normalizedSkill, '');
      }
    }
    return matched;
  };

  // Naming state sleep advance
  const handleSleepTurn = () => {
    if (rimuru.sleepTurns <= 0) return;
    playSound("sleep");
    const nextSleep = rimuru.sleepTurns - 1;
    const woodGathered = Math.floor(rimuru.town.goblins * 0.05) * 5; // sleep production bonus
    const stoneGathered = Math.floor(rimuru.town.orcs * 0.03) * 5;
    setRimuru(prev => ({ 
      ...prev, 
      sleepTurns: nextSleep,
      town: {
        ...prev.town,
        wood: prev.town.wood + woodGathered,
        stone: prev.town.stone + stoneGathered
      }
    }));
    addLog("voice", `[Voice of the World]: System reconstruct activity... ${3 - nextSleep}/3 Sleep phases completed.`);
    
    if (nextSleep === 0) {
      if (rimuru.chapter === 1) {
        setRimuru(prev => {
          const nextState = {
            ...prev,
            ep: 8000,
            maxHp: 400,
            hp: 400,
            maxMp: 1000,
            mp: 1000,
            str: 45,
            def: 50,
            agi: 60,
            veldoraNamed: true,
            skills: [...prev.skills, "Great Sage", "Predator", "Water Blade", "Veldora (skill)"]
          };
          localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
          return nextState;
        });
        addLog("voice", "[Voice of the World]: Sleep state complete. Individual 'Rimuru Tempest' named successfully.");
        addLog("voice", "[Voice of the World]: Acquired Unique Skills: 'Great Sage' and 'Predator'.");
        addLog("explore", "You wake up. Veldora has entered your stomach via Predator for analysis. The cave barrier is now weak.");
      } else if (rimuru.chapter === 2) {
        setRimuru(prev => {
          const nextState = {
            ...prev,
            ep: 15000,
            maxHp: 800,
            hp: 800,
            maxMp: 2000,
            mp: 2000,
            str: 85,
            def: 75,
            agi: 95,
            allies: [...prev.allies, "Ranga (Tempest Star Wolf)", "Rigurd (Hobgoblin King)", "Gobta (Hobgoblin Rider)"],
            town: { ...prev.town, goblins: 100 }
          };
          localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
          return nextState;
        });
        addLog("voice", "[Voice of the World]: Sleep state complete. Naming evolutions for Goblin and Direwolf tribes successful.");
        addLog("explore", "Ranga has evolved into a Tempest Star Wolf. Goblins evolved to Hobgoblins.");
      } else if (rimuru.chapter === 3) {
        setRimuru(prev => {
          const nextState = {
            ...prev,
            ep: 35000,
            maxHp: 1500,
            hp: 1500,
            maxMp: 4500,
            mp: 4500,
            str: 140,
            def: 120,
            agi: 150,
            ogresNamed: true,
            allies: [...prev.allies, "Benimaru (Kijin)", "Shion (Kijin)", "Hakurou (Kijin)", "Shuna (Kijin)", "Souei (Kijin)"]
          };
          localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
          return nextState;
        });
        addLog("voice", "[Voice of the World]: Sleep state complete. Ogre tribe naming evolutions into Kijin successful.");
        addLog("explore", "Benimaru and the Ogres have evolved into Kijin.");
      } else if (rimuru.chapter === 5) {
        setRimuru(prev => {
          const nextState = {
            ...prev,
            species: "Demon Slime",
            ep: 1500000,
            maxHp: 12000,
            hp: 12000,
            maxMp: 25000,
            mp: 25000,
            str: 950,
            def: 900,
            agi: 1000,
            skills: prev.skills
              .filter(s => s !== "Great Sage" && s !== "Gluttony" && s !== "Merciless")
              .concat(["Raphael", "Beelzebuth", "Spacetime Manipulation", "Multidimensional Barrier", "Infinite Regeneration"])
          };
          localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
          return nextState;
        });
        addLog("voice", "[Voice of the World]: Harvest Festival complete. Species reconstruction to 'Demon Slime' successful.");
        addLog("voice", "[Voice of the World]: Unique Skill 'Great Sage' evolved to 'Raphael' (Lord of Wisdom).");
        addLog("voice", "[Voice of the World]: Unique Skill 'Gluttony' evolved to 'Beelzebuth' (Lord of Gluttony).");
        addLog("explore", "You awaken as a True Demon Lord. All Tempest citizens are resurrected.");
      } else if (rimuru.chapter === 8) {
        setRimuru(prev => {
          const nextState = {
            ...prev,
            ep: prev.ep + 2000000,
            maxHp: prev.maxHp + 10000,
            hp: prev.maxHp + 10000,
            maxMp: prev.maxMp + 20000,
            mp: prev.maxMp + 20000,
            str: prev.str + 400,
            def: prev.def + 400,
            agi: prev.agi + 450,
            patronDeitiesEvolved: true,
            allies: prev.allies
              .filter(a => !a.startsWith("Benimaru") && !a.startsWith("Diablo") && !a.startsWith("Shion") && !a.startsWith("Geld") && !a.startsWith("Gabil"))
              .concat([
                "Flair Lord Benimaru (True Demon Lord)",
                "Demon Lord Diablo (True Demon Lord)",
                "War Lord Shion (True Demon Lord)",
                "Barrier Lord Geld (True Demon Lord)",
                "Dragon Lord Gabil (True Demon Lord)"
              ])
          };
          localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
          return nextState;
        });
        addLog("voice", "[Voice of the World]: Twelve Patron Deities evolution complete. Gained 2,000,000 EP.");
        addLog("explore", "Your subordinates have evolved into True Demon Lords. Their supporting power has increased dramatically.");
      }
    }
  };

  const ch1BreakBarrier = () => {
    setRimuru(prev => {
      const nextState = { ...prev, chapter: 2, location: "Jura Forest Rim" };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Chapter 1 completed. Cave exit seal broken.");
  };

  const ch2NameAllies = () => {
    addLog("explore", "You decide to name the Goblins and Wolves to organize them.");
    addLog("voice", "[Voice of the World]: Naming evolutions require magicules. Entering Sleep State.");
    setRimuru(prev => ({ ...prev, sleepTurns: 3 }));
  };

  const ch2BuildDwelling = () => {
    if (rimuru.town.wood < 20 || rimuru.town.stone < 10) {
      addLog("system", "Insufficient materials. Need 20 Wood, 10 Stone.");
      return;
    }
    setRimuru(prev => ({
      ...prev,
      town: {
        ...prev.town,
        wood: prev.town.wood - 20,
        stone: prev.town.stone - 10,
        dwellings: prev.town.dwellings + 1
      }
    }));
    addLog("explore", "Constructed a standard Goblin Dwelling.");
  };

  const ch2GatherWood = () => {
    setRimuru(prev => ({
      ...prev,
      town: { ...prev.town, wood: prev.town.wood + 15 }
    }));
    addLog("explore", "Goblins gathered 15 pieces of lumber.");
  };

  const ch2GatherStone = () => {
    setRimuru(prev => ({
      ...prev,
      town: { ...prev.town, stone: prev.town.stone + 8 }
    }));
    addLog("explore", "Wolves quarried 8 stone slabs.");
  };

  const ch2NextChapter = () => {
    setRimuru(prev => {
      const nextState = { ...prev, chapter: 3, location: "Great Jura Forest" };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Chapter 2 completed. Goblin Village stabilized.");
  };

  const ch3NameOgres = () => {
    addLog("explore", "You name Benimaru, Shuna, Shion, Hakurou, and Souei.");
    addLog("voice", "[Voice of the World]: Commencing evolution to Kijin. System entering Sleep State.");
    setRimuru(prev => ({ ...prev, sleepTurns: 3 }));
  };

  const ch3BuildSmithy = () => {
    if (rimuru.town.wood < 50 || rimuru.town.stone < 30) {
      addLog("system", "Smithy construction requires 50 Wood, 30 Stone.");
      return;
    }
    setRimuru(prev => ({
      ...prev,
      str: prev.str + 15,
      def: prev.def + 10,
      town: {
        ...prev.town,
        wood: prev.town.wood - 50,
        stone: prev.town.stone - 30,
        smithy: prev.town.smithy + 1
      }
    }));
    addLog("explore", "Kurobe builds a Smithy! Offense and Defense parameters increased.");
  };

  const ch3NextChapter = () => {
    setRimuru(prev => {
      const nextState = { ...prev, chapter: 4, location: "Swamps of Jura" };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Chapter 3 completed. Kijin squad formed.");
  };

  const ch4PredateOrc = () => {
    setRimuru(prev => {
      const nextState = {
        ...prev,
        skills: [...prev.skills.filter(s => s !== "Predator"), "Gluttony"],
        town: { ...prev.town, orcs: 500 }
      };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Unique Skill 'Predator' evolved to Unique Skill 'Gluttony'.");
    addLog("explore", "You devour Geld, taking on the burden of his sins. The Orc army surrenders and joins Tempest (Recruited 500 Orcs!).");
    
    addLog("voice", "[Voice of the World]: High magicule reaction detected. Demon Lord 'Milim Nava' (Dragonoid) approaching.");
    addLog("explore", "A pink-haired girl lands in front of you with tremendous force! She demands to fight.");
    setActiveEvent("milim");
  };

  const ch4NextChapter = () => {
    setRimuru(prev => {
      const nextState = { ...prev, chapter: 5, location: "Tempest Outskirts" };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Chapter 4 completed. Jura Forest Federation formed.");
  };

  const ch5CastMegiddo = () => {
    if (rimuru.mp < 80) {
      addLog("system", "Insufficient magicules to cast Megiddo.");
      return;
    }
    setRimuru(prev => ({
      ...prev,
      mp: prev.mp - 80,
      megiddoCast: true
    }));
    addLog("explore", "You focus sunlight through water droplets... casting MEGIDDO!");
    addLog("voice", "[Voice of the World]: 20,000 Falmuth souls harvested.");
  };

  const ch5HarvestFestival = () => {
    addLog("explore", "You sacrifice the souls, and collapse into the sleep of the Harvest Festival.");
    addLog("voice", "[Voice of the World]: Evolution trigger accepted. Initializing True Demon Lord sleep state.");
    setRimuru(prev => ({ ...prev, sleepTurns: 3 }));
  };

  const ch5CompleteGame = () => {
    setRimuru(prev => {
      const nextState = { ...prev, postGame: true, location: "Uncharted Rift" };
      localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
      return nextState;
    });
    addLog("voice", "[Voice of the World]: Main Story Chronology complete.");
    addLog("voice", "[Voice of the World]: Activating Uncharted Rift Sandbox Mode.");
    addLog("explore", "Welcome to Uncharted Rift Sandbox! Explore random grids, fight cosmic entities, and recruit Diablo.");
    setTimeout(() => generatePostGameMaze(), 500);
  };

  // Equipment selection and stats boosts
  const equipItem = (itemName, type) => {
    playSound("level");
    setRimuru(prev => {
      const targetKey = type === "weapon" ? "equippedWeapon" : type === "armor" ? "equippedArmor" : "equippedAccessory";
      return { ...prev, [targetKey]: itemName };
    });
  };

  // Great Sage Fusion Lab
  const executeFusion = () => {
    if (selectedSkillsForFusion.length < 2 || selectedSkillsForFusion.length > 4) return;
    const selectedCount = selectedSkillsForFusion.length;
    
    addLog("voice", `[Raphael]: Initiating skill synthesis checks for ${selectedSkillsForFusion.join(" + ")}...`);
    playSound("spell");
    
    let matchedEvoSkill = null;
    for (const [skillName, data] of Object.entries(skillsDb)) {
      if (data.infobox && data.infobox.Previous) {
        const required = getRequiredSkills(data.infobox.Previous);
        if (required.length === selectedCount) {
          const reqSet = new Set(required.map(s => s.toLowerCase()));
          const allMatched = selectedSkillsForFusion.every(s => reqSet.has(s.toLowerCase()));
          if (allMatched) {
            matchedEvoSkill = skillName;
            break;
          }
        }
      }
    }

    if (matchedEvoSkill) {
      if (rimuru.skills.includes(matchedEvoSkill)) {
        addLog("voice", `[Raphael]: Skill '${matchedEvoSkill}' is already possessed.`);
      } else {
        setRimuru(prev => {
          const filtered = prev.skills.filter(s => !selectedSkillsForFusion.includes(s));
          const nextState = {
            ...prev,
            skills: [...filtered, matchedEvoSkill],
            ep: prev.ep + 10000 * selectedCount
          };
          localStorage.setItem('tensura_rpg_save', JSON.stringify(nextState));
          return nextState;
        });
        addLog("voice", `[Raphael]: Evolution successful. Combined fusions to unlock canon skill: '${matchedEvoSkill}'.`);
      }
    } else {
      addLog("voice", `[Raphael]: Analysis complete. Fusion yields no stable lore-accurate output.`);
    }
    
    setSelectedSkillsForFusion([]);
  };

  // Keyboard CLI Input Command Handler
  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    setTerminalInput("");
    if (!cmd) return;

    if (!created) {
      const num = parseInt(cmd);
      if (!isNaN(num)) {
        const buttons = document.querySelectorAll(".commands-list button:not(:disabled)");
        if (buttons && buttons[num - 1]) {
          buttons[num - 1].click();
          return;
        }
      }
      if (cmd === "1" || cmd.includes("reincarnate") || cmd.includes("slime")) {
        handleReincarnate();
        return;
      }
      setLogs(prev => [...prev, { type: "system", text: "SYS: Reincarnation pending. Please select a menu choice by entering its option number or clicking." }]);
      return;
    }

    addLog("system", `guest@tempest:~$ ${cmd}`);
    playSound("click");

    if (cmd === "clear") {
      setLogs([]);
      return;
    }
    if (cmd === "save") {
      saveGame();
      return;
    }
    if (cmd === "load") {
      loadGame();
      return;
    }
    if (cmd === "audio") {
      toggleAudio();
      return;
    }
    if (cmd === "help") {
      addLog("system", "CLI MANUAL: [1-9] (Select option), 'n/s/e/w' (Move in Grid), 'save' (Save), 'load' (Load), 'clear' (Clear screen), 'audio' (Toggle voice), 'hud' (Toggle stats), 'wiki <term>' (Search Wiki entry), 'auto' (Toggle auto-combat).");
      return;
    }
    if (cmd === "hud") {
      setShowHud(prev => !prev);
      return;
    }
    if (cmd === "auto" || cmd === "autocombat") {
      setAutoCombat(prev => !prev);
      addLog("system", `SYS: Auto-combat has been toggled.`);
      return;
    }
    if (cmd.startsWith("wiki ")) {
      const term = cmd.substring(5).trim();
      searchWiki(term);
      return;
    }
    if (cmd === "ciel" || cmd.startsWith("ciel ") || cmd === "/ciel" || cmd.startsWith("/ciel ")) {
      playSound("level");
      const cleanCmd = cmd.startsWith("/") ? cmd.substring(1) : cmd;
      const param = cleanCmd.substring(4).trim();
      
      const potentialFusions = [];
      const currentSkills = rimuru.skills;
      
      if (currentSkills.includes("Gluttony") && currentSkills.includes("Merciless") && !currentSkills.includes("Beelzebuth")) {
        potentialFusions.push("Gluttony + Merciless = Beelzebuth");
      }
      if (currentSkills.includes("Predator") && currentSkills.includes("Starved") && !currentSkills.includes("Gluttony")) {
        potentialFusions.push("Predator + Starved = Gluttony");
      }
      if (currentSkills.includes("Deviant") && currentSkills.includes("Great Sage") && !currentSkills.includes("Raphael")) {
        potentialFusions.push("Great Sage + Deviant = Raphael (Requires Harvest Festival)");
      }
      
      let message = "[Ciel]: ";
      if (param === "stats") {
        message += `Analysis active. Player parameters: EP: ${rimuru.ep.toLocaleString()}, STR: ${rimuru.str}, DEF: ${rimuru.def}, AGI: ${rimuru.agi}. Threat rating: ${rimuru.ep > 10000000 ? 'Catastrophe-class (True Dragon Grade)' : rimuru.ep > 1000000 ? 'Disaster-class (True Demon Lord)' : 'Calamity-class (Special A-rank)'}.`;
      } else if (param === "labyrinth" || param === "dungeon") {
        message += `Labyrinth analysis active. Current Floor ${rimuru.dungeonFloor}/100. Max floor cleared: ${rimuru.maxLabyrinthFloorCleared}. Floor 100 Guardian Zegion is ${rimuru.zegionDefeated ? 'neutralized (recruited)' : 'active (requires combat victory)'}.`;
      } else if (param === "fusions" || param === "fusion") {
        if (potentialFusions.length > 0) {
          message += `Skill Fusion Analysis: Possible fusions identified: ${potentialFusions.join(", ")}. Navigate to the Raphael Lab to execute.`;
        } else {
          message += "Skill Fusion Analysis: No compatible unique or extra skills available for fusion in repository. Predate higher-tier entities to gather factors.";
        }
      } else if (param === "help") {
        message += "Terminal Assistant Interface active. Supported sub-commands: 'ciel stats' (parameters overview), 'ciel labyrinth' (dungeon crawler status), 'ciel fusions' (Raphael synthesis mapping).";
      } else {
        message += `Terminal Assistant active. Supported queries: stats, labyrinth, fusions. (Possible fusions count: ${potentialFusions.length}).`;
      }
      
      addLog("voice", message);
      return;
    }

    // Grid Navigation direct input
    if (["n", "north"].includes(cmd)) { movePlayer(0, -1); return; }
    if (["s", "south"].includes(cmd)) { movePlayer(0, 1); return; }
    if (["e", "east"].includes(cmd)) { movePlayer(1, 0); return; }
    if (["w", "west"].includes(cmd)) { movePlayer(-1, 0); return; }

    const num = parseInt(cmd);
    if (!isNaN(num)) {
      const buttons = document.querySelectorAll(".commands-list button:not(:disabled)");
      if (buttons && buttons[num - 1]) {
        buttons[num - 1].click();
      } else {
        addLog("system", "SYS: Invalid menu choice.");
      }
      return;
    }

    addLog("system", `SYS: Unknown command '${cmd}'. Type 'help' for manual.`);
  };

  // Render health bar utility
  const renderProgressBar = (val, max) => {
    const percent = Math.min(100, Math.max(0, Math.floor((val / max) * 100)));
    const filled = Math.floor(percent / 10);
    return `[${'█'.repeat(filled) + '░'.repeat(10 - filled)}] ${percent}%`;
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="terminal-container">
        <div className="terminal-output">
          <p className="terminal-line green">&gt; ACCESSING SYSTEM MEMORY...</p>
          <p className="terminal-line gray">{loadingText}</p>
          <p className="terminal-line green">[{'#'.repeat(Math.floor(loadingProgress/5)) + '-'.repeat(20 - Math.floor(loadingProgress/5))}] {loadingProgress}%</p>
        </div>
      </div>
    );
  }

  // Pre-game setup screens
  if (!created) {
    if (setupScreen === "intro") {
      return (
        <div className="terminal-container">
          <div className="terminal-output">
            <p className="terminal-line green">========================================================</p>
            <p className="terminal-line white">                 TENSURA CANON CHRONICLES</p>
            <p className="terminal-line green">========================================================</p>
            <br />
            <p className="terminal-line secondary">SYSTEM ONLINE. Soul core transit buffer loaded.</p>
            <p className="terminal-line white">Choose your path of reincarnation:</p>
            <br />
            <p className="terminal-line secondary">
              1. **RIMURU CANON STORY MODE**: Play as Rimuru Tempest, experiencing the canonical anime/light novel events across Chapters 1-5 (Sealed Cave to Harvest Festival).
            </p>
            <p className="terminal-line secondary">
              2. **CUSTOM ROGUELIKE MODE**: Reincarnate as a customizable race (Dwarf, Goblin, Lizardman, Ogre, Human, Orc, Dragonoid, or Demon). Spawns in a unique canon location with a custom storyline, quest steps, and evolution paths. Completing your scenario unlocks the endless sandbox mode.
            </p>
          </div>
          <div className="terminal-divider">--------------------------------------------------------</div>
          <div className="terminal-input-area">
            <div className="commands-list">
              <button className="primary" onClick={() => setSetupScreen("story_intro")}>[1] CANON STORY MODE</button>
              <button className="primary" onClick={() => setSetupScreen("custom_creation")}>[2] CUSTOM ROGUELIKE MODE</button>
              {localStorage.getItem('tensura_rpg_save') && (
                <button className="primary" onClick={loadGame}>[3] LOAD SAVED GAME</button>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (setupScreen === "story_intro") {
      return (
        <div className="terminal-container">
          <div className="terminal-output">
            <p className="terminal-line green">========================================================</p>
            <p className="terminal-line white">                 TENSURA CANON CHRONICLES</p>
            <p className="terminal-line green">========================================================</p>
            <br />
            <p className="terminal-line secondary">SYSTEM LOADED. Satoru Mikami, a 37-year-old office worker, was stabbed by a robber on the street.</p>
            <p className="terminal-line voice">&gt; [Voice of the World]: Blood loss detected. Body heat failing.</p>
            <p className="terminal-line voice">&gt; [Voice of the World]: Resistance to cold successfully acquired.</p>
            <p className="terminal-line voice">&gt; [Voice of the World]: Physical attack resistance successfully acquired.</p>
            <br />
            <p className="terminal-line gray">Your consciousness fades as the transition sequence completes.</p>
          </div>
          <div className="terminal-divider">--------------------------------------------------------</div>
          <div className="terminal-input-area">
            <div className="commands-list">
              <button className="primary" onClick={handleReincarnate}>[1] REINCARNATE AS SLIME</button>
              <button onClick={() => setSetupScreen("intro")}>BACK</button>
            </div>
          </div>
        </div>
      );
    }

    if (setupScreen === "custom_creation") {
      const selectedRace = CUSTOM_RACES[selectedRaceKey];
      const selectedClass = CUSTOM_CLASSES[selectedClassKey];

      return (
        <div className="terminal-container" style={{ overflowY: 'auto' }}>
          <div className="terminal-output">
            <p className="terminal-line green">========================================================</p>
            <p className="terminal-line white">           CUSTOM REINCARNATION CONFIGURATOR</p>
            <p className="terminal-line green">========================================================</p>
            <br />
            
            {creationPhase === "race" && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="green">1. ENTER SOUL IDENTIFIER (NAME):</span>
                  <input 
                    type="text" 
                    value={customName} 
                    onChange={e => setCustomName(e.target.value)} 
                    placeholder="Enter character name..."
                    style={{ border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', padding: '4px', width: '300px' }}
                  />
                </div>
                <br />
                <span className="green">2. SELECT REINCARNATION SPECIES:</span>
                <div className="skills-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                  {Object.keys(CUSTOM_RACES).map((key) => (
                    <div 
                      key={key} 
                      className={`skill-node ${selectedRaceKey === key ? 'selected' : ''}`}
                      onClick={() => { playSound("click"); setSelectedRaceKey(key); }}
                    >
                      {CUSTOM_RACES[key].name}
                    </div>
                  ))}
                </div>
                <br />
                {selectedRace && (
                  <div style={{ border: '1px dashed var(--border-color)', padding: '12px' }}>
                    <p className="terminal-line white">SPECIES ANALYSIS: {selectedRace.name.toUpperCase()}</p>
                    <p className="terminal-line gray">  * Starting Skills: {selectedRace.skills.join(", ")}</p>
                    <p className="terminal-line gray">  * Starting Magic: {selectedRace.magic.length > 0 ? selectedRace.magic.join(", ") : "None"}</p>
                    <p className="terminal-line gray">  * Evolutions: {Object.values(selectedRace.evolutions).join(" -> ")}</p>
                    <p className="terminal-line secondary" style={{ marginTop: '8px' }}>
                      Potential spawn locations: {selectedRace.spawns.map(s => s.loc).join(" or ")}.
                      Spawn location is chosen randomly and unlocks a unique story and quest path!
                    </p>
                  </div>
                )}
              </>
            )}

            {creationPhase === "class" && (
              <>
                <span className="green">SELECT BACKGROUND CLASS ARCHETYPE:</span>
                <br />
                <div className="skills-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                  {Object.entries(CUSTOM_CLASSES).map(([key, data]) => (
                    <div 
                      key={key} 
                      className={`skill-node ${selectedClassKey === key ? 'selected' : ''}`}
                      onClick={() => { playSound("click"); setSelectedClassKey(key); }}
                    >
                      {data.name}
                    </div>
                  ))}
                </div>
                <br />
                {selectedClass && (
                  <div style={{ border: '1px dashed var(--border-color)', padding: '12px' }}>
                    <p className="terminal-line white">CLASS ANALYSIS: {selectedClass.name.toUpperCase()}</p>
                    <p className="terminal-line gray">  * Description: {selectedClass.desc}</p>
                    <p className="terminal-line gray">  * Stat Bonuses: HP +{selectedClass.hp} | MP +{selectedClass.mp} | STR +{selectedClass.str} | DEF +{selectedClass.def} | AGI +{selectedClass.agi}</p>
                    <p className="terminal-line gray">  * Class Skills: {selectedClass.skills.join(", ")}</p>
                    <p className="terminal-line gray">  * Class Magic: {selectedClass.magic ? selectedClass.magic.join(", ") : "None"}</p>
                  </div>
                )}
              </>
            )}

            {creationPhase === "points" && (
              <>
                <span className="green">DISTRIBUTE ATTRIBUTE SOUL POINTS (POINTS REMAINING: {customStatsPoints}):</span>
                <br />
                <div style={{ border: '1px dashed var(--border-color)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: "hp", name: "HP (Vitality)", scale: "+15 Max HP per point", val: customStats.hp },
                    { key: "mp", name: "MP (Magicules)", scale: "+20 Max MP per point", val: customStats.mp },
                    { key: "str", name: "STR (Strength)", scale: "+1 Attack power", val: customStats.str },
                    { key: "def", name: "DEF (Defense)", scale: "+1 Armor level", val: customStats.def },
                    { key: "agi", name: "AGI (Agility)", scale: "+1 Speed value", val: customStats.agi }
                  ].map(({ key, name, scale, val }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '450px' }}>
                      <div>
                        <span className="white">{name}</span>
                        <br />
                        <span className="gray" style={{ fontSize: '11px' }}>{scale}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                          onClick={() => {
                            if (val > 0) {
                              playSound("click");
                              setCustomStats(prev => ({ ...prev, [key]: val - 1 }));
                              setCustomStatsPoints(prev => prev + 1);
                            }
                          }}
                          disabled={val === 0}
                        >-</button>
                        <span className="green" style={{ width: '20px', textAlign: 'center', fontWeight: 'bold' }}>{val}</span>
                        <button 
                          onClick={() => {
                            if (customStatsPoints > 0) {
                              playSound("click");
                              setCustomStats(prev => ({ ...prev, [key]: val + 1 }));
                              setCustomStatsPoints(prev => prev - 1);
                            }
                          }}
                          disabled={customStatsPoints === 0}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
          <div className="terminal-divider">--------------------------------------------------------</div>
          <div className="terminal-input-area">
            <div className="commands-list">
              {creationPhase === "race" && (
                <>
                  <button onClick={() => setSetupScreen("intro")}>BACK TO MENU</button>
                  <button 
                    className="primary" 
                    onClick={() => { playSound("click"); setCreationPhase("class"); }}
                    disabled={!customName.trim()}
                  >
                    NEXT PHASE: CLASS ARCHETYPE
                  </button>
                </>
              )}
              {creationPhase === "class" && (
                <>
                  <button onClick={() => { playSound("click"); setCreationPhase("race"); }}>BACK TO SPECIES</button>
                  <button className="primary" onClick={() => { playSound("click"); setCreationPhase("points"); }}>
                    NEXT PHASE: SOUL POINTS
                  </button>
                </>
              )}
              {creationPhase === "points" && (
                <>
                  <button onClick={() => { playSound("click"); setCreationPhase("class"); }}>BACK TO CLASS</button>
                  <button 
                    className="primary" 
                    onClick={handleCustomReincarnate}
                  >
                    FINALIZE & REINCARNATE
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="terminal-container">
      {/* HUD Header */}
      {showHud && (
        <div className="hud-panel">
          <div className="hud-grid">
            <div>
              <span className="green">NAME:</span> {rimuru.name}<br />
              <span className="green">SPECIES:</span> {rimuru.species}
            </div>
            <div>
              <span className="green">HP:</span> {renderProgressBar(combat ? combat.playerHp : rimuru.hp, rimuru.maxHp)} ({combat ? combat.playerHp : rimuru.hp}/{rimuru.maxHp})<br />
              <span className="green">MP:</span> {renderProgressBar(combat ? combat.playerMp : rimuru.mp, rimuru.maxMp)} ({combat ? combat.playerMp : rimuru.mp}/{rimuru.maxMp})
            </div>
            <div>
              <span className="green">EP:</span> {rimuru.ep.toLocaleString()}<br />
              <span className="green">STR:</span> {rimuru.str} (Weapon: {rimuru.equippedWeapon || "None"})
            </div>
            <div>
              <span className="green">{rimuru.customMode ? "ACTIVE QUEST:" : "CHAPTER:"}</span> {rimuru.customMode ? (
                (() => {
                  const spawnIdx = rimuru.customSpawnIndex || 0;
                  const q = CUSTOM_RACES[rimuru.customRace]?.spawns[spawnIdx]?.quests[rimuru.customQuestStep];
                  return q ? `${q.desc} (${rimuru.customQuestCount}/${q.qty})` : "Complete";
                })()
              ) : rimuru.chapter}<br />
              <span className="green">DEF:</span> {rimuru.def} (Armor: {rimuru.equippedArmor || "None"})
            </div>
          </div>
        </div>
      )}

      {/* Main Terminal Screen */}
      <div className="terminal-output">
        {combat ? (
          <div className="combat-hud">
            <p className="terminal-line green">=================== COMBAT MATRIX ===================</p>
            <p className="terminal-line white">ENEMY: {combat.enemy.name} (EP: {combat.enemy.ep.toLocaleString()})</p>
            <p className="terminal-line red">ENEMY HP: {renderProgressBar(combat.enemyHp, combat.maxEnemyHp)} ({combat.enemyHp}/{combat.maxEnemyHp})</p>
            <p className="terminal-line green">----------------------------------------------------</p>
            {combat.log.map((line, idx) => (
              <p key={idx} className="terminal-line secondary">&gt; {line}</p>
            ))}
          </div>
        ) : activeCustomEvent ? (
          <div className="combat-hud">
            {activeCustomEvent.type === "merchant" && (
              <>
                <p className="terminal-line green">=================== FACTION TRADING POST ===================</p>
                <p className="terminal-line white">A traveling merchant invites you to browse their wares.</p>
                <p className="terminal-line secondary">&gt; "State your request, wanderer. I accept raw Magical Ore/Steel Core or pure magicule energy (EP)."</p>
                <br />
                <p className="terminal-line white">Your resources:</p>
                <p className="terminal-line gray">* Magical Ore: {getInventoryQty("Magical Ore")}</p>
                <p className="terminal-line gray">* Steel Core: {getInventoryQty("Steel Core")}</p>
                <p className="terminal-line gray">* EP: {rimuru.ep}</p>
                <p className="terminal-line gray">* Current Allies: {rimuru.allies.length}/3 Mercenaries</p>
              </>
            )}
            {activeCustomEvent.type === "shrine" && (
              <>
                <p className="terminal-line green">=================== RUNIC SHRINE ===================</p>
                <p className="terminal-line white">You stand before a glowing ancient obelisk pulsing with raw magicules.</p>
                <p className="terminal-line secondary">&gt; "A mortal draws close. Choose your blessing or absorb ancient knowledge."</p>
                <br />
                <p className="terminal-line white">Available Blessings:</p>
                <p className="terminal-line gray">* Blessing of Might: Permanent +5 STR</p>
                <p className="terminal-line gray">* Blessing of Aegis: Permanent +5 DEF</p>
                <p className="terminal-line gray">* Blessing of Haste: Permanent +5 AGI</p>
                {shrineSkills.length > 0 && (
                  <p className="terminal-line gray">* Knowledge Scribe: Choose to learn one of these skills: {shrineSkills.join(", ")}</p>
                )}
              </>
            )}
            {activeCustomEvent.type === "dungeon" && (() => {
              const trapIdx = activeCustomEvent.trapIndex;
              if (trapIdx === 0) {
                return (
                  <>
                    <p className="terminal-line red">=================== DUNGEON TRAP: SPIKE PIT ===================</p>
                    <p className="terminal-line white">The stone tiles crumble beneath your feet, revealing a deep pit of jagged iron spikes!</p>
                    <p className="terminal-line secondary">&gt; You must act in milliseconds. What is your action?</p>
                    <br />
                    <p className="terminal-line gray">* Option 1: Attempt to vault over the pit using your agility (AGI roll check vs 20).</p>
                    <p className="terminal-line gray">* Option 2: Brace for impact and block the spikes using your armor (DEF roll check vs 22).</p>
                  </>
                );
              } else if (trapIdx === 1) {
                return (
                  <>
                    <p className="terminal-line red">=================== DUNGEON TRAP: TOXIC GAS ===================</p>
                    <p className="terminal-line white">A hidden switch triggers hiss vents! Heavy green acid vapor fills the narrow corridor.</p>
                    <p className="terminal-line secondary">&gt; The gas dissolves organic tissue. Choose your evasion method:</p>
                    <br />
                    <p className="terminal-line gray">* Option 1: Hold your breath and sprint forward (AGI roll check vs 22).</p>
                    {["Fireball", "Explosive Flames", "Water Blade"].some(s => rimuru.magic.includes(s) || rimuru.skills.includes(s)) ? (
                      <p className="terminal-line gray">* Option 2: Disperse the cloud using elemental magic/skills.</p>
                    ) : (
                      <p className="terminal-line gray" style={{ opacity: 0.5 }}>* Option 2: [Locked] Disperse cloud (Requires Fireball, Explosive Flames, or Water Blade)</p>
                    )}
                  </>
                );
              } else {
                return (
                  <>
                    <p className="terminal-line green">=================== MYSTERIOUS RUNIC CHEST ===================</p>
                    <p className="terminal-line white">A steel chest sits in a dust alcove, sealed by complex runic logic circles.</p>
                    <p className="terminal-line secondary">&gt; "Only the worthy or the strong shall claim the contents."</p>
                    <br />
                    <p className="terminal-line gray">* Option 1: Force the lock open using raw strength (STR roll check vs 25).</p>
                    {rimuru.skills.includes("Thought Acceleration") ? (
                      <p className="terminal-line gray">* Option 2: Instantly bypass using Thought Acceleration.</p>
                    ) : (
                      <p className="terminal-line gray">* Option 2: Spent 30 MP to decipher the runic seals.</p>
                    )}
                    <p className="terminal-line gray">* Option 3: Leave it alone and walk away.</p>
                  </>
                );
              }
            })()}
          </div>
        ) : (
          logs.map((entry, idx) => (
            <p key={idx} className={`terminal-line ${entry.type === 'voice' ? 'green' : entry.type === 'system' ? 'gray' : 'white'}`}>
              &gt; {entry.text}
            </p>
          ))
        )}
        
        {/* Render Exploration Grid Map if exploring & no active combat */}
        {!combat && activeScreen === "main" && rimuru.sleepTurns === 0 && (
          <div style={{ margin: '8px 0', fontFamily: 'var(--font-mono)' }}>
            <p className="terminal-line green">
              === GRID RADAR ({rimuru.postGame ? `RIFT TARGET: ${["Clayman", "Diablo", "Velgrynd", "Guy Crimson"][Math.min(3, rimuru.postGameBossCount || 0)].toUpperCase()}` : rimuru.location.toUpperCase()}) ===
            </p>
            {maze.map((row, y) => (
              <p key={y} className="terminal-line" style={{ margin: 0 }}>
                {row.map((cell, x) => {
                  let className = "white";
                  if (cell === 'P') className = "green";
                  else if (cell === '#') className = "gray";
                  else if (cell === 'O') className = "white";
                  else if (cell === 'E') className = "white";
                  else if (rimuru.customMode && cell === 'D') className = "red";
                  else if (cell === 'X') className = "red";
                  else if (['V', 'D', 'B', 'G', 'F', 'M', 'C', 'H', 'T', 'S', 'K', 'L', 'W', 'Y', 'J', 'Z', 'U'].includes(cell)) className = "green";
                  
                  return (
                    <span key={x} className={className} style={{ marginRight: '16px', fontWeight: cell === 'P' ? 'bold' : 'normal' }}>
                      {cell}
                    </span>
                  );
                })}
              </p>
            ))}
            {rimuru.customMode ? (
              <p className="terminal-line gray" style={{ marginTop: '6px' }}>Legend: P=Player, #=Obstacle, O=Material, E=Enemy, T=Trading Post, S=Shrine, D=Trap, X=Boss</p>
            ) : (
              <p className="terminal-line gray" style={{ marginTop: '6px' }}>Legend: P=Rimuru, #=Obstacle, O=Material, E=Enemy, V/D/B/G/F/M/C/H/K/L/W/Y/J/Z/U=Boss/Event Node</p>
            )}
          </div>
        )}

        <div ref={consoleEndRef} />
      </div>

      <div className="terminal-divider">--------------------------------------------------------</div>

      {/* Control Input area */}
      <div className="terminal-input-area">
        <div className="prompt-line">
          <span className="green">
            RIMURU@{rimuru.location.toUpperCase().replace(/ /g, "_")}:~$
          </span>
          <form onSubmit={handleCommandSubmit} style={{ display: 'flex', flex: 1 }}>
            <input 
              type="text" 
              autoFocus 
              value={terminalInput} 
              onChange={e => setTerminalInput(e.target.value)} 
              placeholder="Type command or option number..."
              style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', flex: 1 }}
            />
          </form>
          {rimuru.sleepTurns > 0 && <span className="red">[SLEEP STATE ACTIVE: {rimuru.sleepTurns} PHASES REMAINING]</span>}
        </div>

        <div className="commands-list">
          {rimuru.sleepTurns > 0 ? (
            <button onClick={handleSleepTurn}>[1] SLEEP (ADVANCE TURN)</button>
          ) : activeCustomEvent ? (
            <>
              {activeCustomEvent.type === "merchant" && (
                <>
                  <button onClick={() => handleMerchantAction("buy_potion", "ep")} disabled={rimuru.ep < 50}>[1] BUY HP POTION (50 EP)</button>
                  <button onClick={() => handleMerchantAction("buy_potion", "ore")} disabled={getInventoryQty("Magical Ore") < 1}>[2] BUY HP POTION (1 ORE)</button>
                  <button onClick={() => handleMerchantAction("buy_elixir", "ep")} disabled={rimuru.ep < 50}>[3] BUY ELIXIR (50 EP)</button>
                  <button onClick={() => handleMerchantAction("buy_elixir", "core")} disabled={getInventoryQty("Steel Core") < 1}>[4] BUY ELIXIR (1 CORE)</button>
                  <button onClick={() => handleMerchantAction("hire_merc", "ep")} disabled={rimuru.ep < 300}>[5] HIRE MERCENARY (300 EP)</button>
                  <button onClick={() => handleMerchantAction("hire_merc", "ore")} disabled={getInventoryQty("Magical Ore") < 5}>[6] HIRE MERCENARY (5 ORE)</button>
                  <button onClick={() => handleMerchantAction("leave", "")}>[7] LEAVE SHOP</button>
                </>
              )}
              {activeCustomEvent.type === "shrine" && (
                <>
                  <button onClick={() => handleShrineAction("bless_str", "")}>[1] BLESSING OF MIGHT (+5 STR)</button>
                  <button onClick={() => handleShrineAction("bless_def", "")}>[2] BLESSING OF AEGIS (+5 DEF)</button>
                  <button onClick={() => handleShrineAction("bless_agi", "")}>[3] BLESSING OF HASTE (+5 AGI)</button>
                  {shrineSkills.map((skill, index) => (
                    <button key={skill} onClick={() => handleShrineAction("learn_skill", skill)}>
                      [{index + 4}] LEARN: {skill.toUpperCase()}
                    </button>
                  ))}
                </>
              )}
              {activeCustomEvent.type === "dungeon" && (() => {
                const trapIdx = activeCustomEvent.trapIndex;
                if (trapIdx === 0) {
                  return (
                    <>
                      <button onClick={() => handleDungeonAction("jump")}>[1] VAULT OVER PIT (AGI CHECK)</button>
                      <button onClick={() => handleDungeonAction("brace")}>[2] BRACE FOR IMPACT (DEF CHECK)</button>
                    </>
                  );
                } else if (trapIdx === 1) {
                  const canDisperse = ["Fireball", "Explosive Flames", "Water Blade"].some(s => rimuru.magic.includes(s) || rimuru.skills.includes(s));
                  return (
                    <>
                      <button onClick={() => handleDungeonAction("rush")}>[1] HOLD BREATH & RUSH (AGI CHECK)</button>
                      <button onClick={() => handleDungeonAction("disperse")} disabled={!canDisperse}>
                        [2] DISPERSE GAS (REQ ELEMENTAL ART)
                      </button>
                    </>
                  );
                } else {
                  return (
                    <>
                      <button onClick={() => handleDungeonAction("force")}>[1] SMASH CHEST (STR CHECK)</button>
                      <button onClick={() => handleDungeonAction("decipher")}>
                        {rimuru.skills.includes("Thought Acceleration") ? "[2] BYPASS W/ THOUGHT ACCELERATION" : "[2] DECIPHER RUNES (30 MP)"}
                      </button>
                      <button onClick={() => handleDungeonAction("leave")}>[3] LEAVE CHEST</button>
                    </>
                  );
                }
              })()}
            </>
          ) : activeEvent === "milim" ? (
            <>
              <button 
                onClick={handleBribeMilim} 
                disabled={getInventoryQty("Honey") < 1}
              >
                [1] OFFER HONEY TO MILIM (REQ: 1 HONEY)
              </button>
              <button onClick={handleFightMilim}>[2] FIGHT MILIM</button>
            </>
          ) : combat ? (
            // Combat UI
            <>
              <button onClick={() => executeCombatRound({ type: 'attack' })}>ATTACK</button>
              
              {rimuru.skills.filter(s => !PASSIVE_SKILLS.includes(s) && !PREDATION_SKILLS.includes(s)).slice(0, 6).map(skill => (
                <button key={skill} onClick={() => executeCombatRound({ type: 'skill', name: skill })}>
                  USE: {skill.toUpperCase()}
                </button>
              ))}

              {rimuru.magic.map(magic => (
                <button key={magic} onClick={() => executeCombatRound({ type: 'magic', name: magic })}>
                  CAST: {magic.toUpperCase()}
                </button>
              ))}

              {rimuru.skills.some(s => ["Predator", "Gluttony", "Beelzebuth"].includes(s)) && (
                <button onClick={() => executeCombatRound({ type: 'predate' })} style={{ borderColor: 'var(--text-primary)' }}>
                  PREDATE
                </button>
              )}

              {getInventoryQty("Hipokute Potion") > 0 && (
                <button onClick={() => executeCombatRound({ type: 'item', name: "Hipokute Potion" })}>
                  POTION ({getInventoryQty("Hipokute Potion")} left)
                </button>
              )}

              {getInventoryQty("Magicule Elixir") > 0 && (
                <button onClick={() => executeCombatRound({ type: 'item', name: "Magicule Elixir" })}>
                  ELIXIR ({getInventoryQty("Magicule Elixir")} left)
                </button>
              )}

              <button 
                onClick={() => setAutoCombat(prev => !prev)} 
                style={{ borderColor: autoCombat ? 'var(--text-primary)' : 'var(--border-color)' }}
              >
                {autoCombat ? "[AUTO-COMBAT: ON]" : "[AUTO-COMBAT: OFF]"}
              </button>
            </>
          ) : (
            // Main Exploration UI tabs
            <>
              {activeScreen === "main" && (
                <>
                  {rimuru.customMode ? (
                    <>
                      {/* Custom Grid Move Actions */}
                      <button onClick={() => movePlayer(0, -1)}>[N] MOVE NORTH</button>
                      <button onClick={() => movePlayer(0, 1)}>[S] MOVE SOUTH</button>
                      <button onClick={() => movePlayer(1, 0)}>[E] MOVE EAST</button>
                      <button onClick={() => movePlayer(-1, 0)}>[W] MOVE WEST</button>
                      
                      {(() => {
                        const spawnIdx = rimuru.customSpawnIndex || 0;
                        const q = CUSTOM_RACES[rimuru.customRace]?.spawns[spawnIdx]?.quests[rimuru.customQuestStep];
                        const canEvolve = q && q.type !== "boss" && rimuru.customQuestCount >= q.qty;
                        if (canEvolve) {
                          const currentEvo = CUSTOM_RACES[rimuru.customRace].evolutions[rimuru.customQuestStep];
                          return (
                            <button onClick={advanceCustomQuest}>
                              [5] EVOLVE TO {currentEvo.toUpperCase()}
                            </button>
                          );
                        }
                        if (q && q.type === "boss") {
                          return <span className="gray">Navigate to cell [4, 4] to defeat the scenario boss.</span>;
                        }
                        return <span className="gray">Complete quest to unlock next evolution.</span>;
                      })()}
                    </>
                  ) : (
                    <>
                      {/* Standard Grid Move Actions */}
                      <button onClick={() => movePlayer(0, -1)}>[N] MOVE NORTH</button>
                      <button onClick={() => movePlayer(0, 1)}>[S] MOVE SOUTH</button>
                      <button onClick={() => movePlayer(1, 0)}>[E] MOVE EAST</button>
                      <button onClick={() => movePlayer(-1, 0)}>[W] MOVE WEST</button>

                  {/* Chapter specific actions triggered dynamically when objectives are met */}
                  {rimuru.chapter === 1 && rimuru.veldoraNamed && (
                    <button onClick={ch1BreakBarrier}>[5] BREAK EXIT SEAL</button>
                  )}

                  {rimuru.chapter === 2 && (
                    <>
                      {rimuru.direwolvesDefeated && rimuru.allies.length === 0 && <button onClick={ch2NameAllies}>[5] NAME SUBORDINATES</button>}
                      {rimuru.allies.length > 0 && (
                        <button onClick={ch2NextChapter} disabled={rimuru.town.dwellings < 2}>[5] ADVANCE TO CH3 (REQ: 2 DWELLINGS)</button>
                      )}
                    </>
                  )}

                  {rimuru.chapter === 3 && (
                    <>
                      {rimuru.veldoraNamed && !rimuru.ogresNamed && (
                        <button onClick={ch3NameOgres} disabled={rimuru.ep < 20000}>[5] NAME OGRE WARRIORS</button>
                      )}
                      {rimuru.ogresNamed && (
                        <button onClick={ch3NextChapter} disabled={rimuru.town.smithy < 1}>[5] ADVANCE TO CH4 (REQ: SMITHY)</button>
                      )}
                    </>
                  )}

                  {rimuru.chapter === 4 && (
                    <>
                      {rimuru.orcLordDefeated && !rimuru.skills.includes("Gluttony") && (
                        <button onClick={ch4PredateOrc}>[5] DEVOUR ORC DISASTER</button>
                      )}
                      {rimuru.skills.includes("Gluttony") && !rimuru.charybdisDefeated && (
                        <span className="gray">Defeat Charybdis at cell [4, 4] to continue.</span>
                      )}
                      {rimuru.charybdisDefeated && (
                        <button onClick={ch4NextChapter}>[5] ADVANCE TO CHAPTER 5</button>
                      )}
                    </>
                  )}

                  {rimuru.chapter === 5 && (
                    <>
                      {!rimuru.hinataDefeated && (
                        <span className="gray">Clear Hinata's ambush at cell [2, 2] to proceed.</span>
                      )}
                      {rimuru.hinataDefeated && !rimuru.megiddoCast && (
                        <button onClick={ch5CastMegiddo} disabled={rimuru.mp < 80}>[5] CAST MEGIDDO (HARVEST SOULS)</button>
                      )}
                      {rimuru.megiddoCast && rimuru.species !== "Demon Slime" && (
                        <button onClick={ch5HarvestFestival}>[5] INITIATE HARVEST FESTIVAL</button>
                      )}
                      {rimuru.species === "Demon Slime" && (
                        <button onClick={ch5NextChapter}>[5] ADVANCE TO CHAPTER 6 (WALPURGIS BANQUET)</button>
                      )}
                    </>
                  )}

                  {rimuru.chapter === 6 && (
                    <>
                      {!rimuru.claymanDefeated && (
                        <span className="gray">Confront Clayman at cell [4, 4] to expose his schemes.</span>
                      )}
                      {rimuru.claymanDefeated && !rimuru.octagramFounded && (
                        <button onClick={ch6FoundOctagram}>[5] FOUND THE OCTAGRAM (RENAME DEMON LORDS)</button>
                      )}
                      {rimuru.octagramFounded && (
                        <button onClick={ch6NextChapter}>[5] ADVANCE TO CHAPTER 7 (FOUNDER'S FESTIVAL)</button>
                      )}
                    </>
                  )}

                  {rimuru.chapter === 7 && (
                    <>
                      {!rimuru.labyrinthBuilt && (
                        <span className="gray">Go to Town tab and build the Labyrinth to unlock trials.</span>
                      )}
                      {rimuru.labyrinthBuilt && !rimuru.labyrinthCleared && (
                        <span className="gray">Clear the Labyrinth trial (Bovix) at cell [4, 4].</span>
                      )}
                      {rimuru.labyrinthBuilt && !rimuru.hinataReconciled && (
                        <span className="gray">Spar with Hinata at cell [2, 2] to sign the peace treaty.</span>
                      )}
                      {rimuru.labyrinthCleared && rimuru.hinataReconciled && (
                        <button onClick={ch7NextChapter}>[5] ADVANCE TO CHAPTER 8 (EMPIRE INVASION)</button>
                      )}
                    </>
                  )}

                  {rimuru.chapter === 8 && (
                    <>
                      {!rimuru.calgurioDefeated && (
                        <span className="gray">Defeat Empire General Calgurio at cell [4, 4].</span>
                      )}
                      {rimuru.calgurioDefeated && (rimuru.collectedSouls || 0) < 1000000 && (
                        <span className="gray">Defeat Empire soldiers to gather 1,000,000 souls (Souls: {(rimuru.collectedSouls || 0).toLocaleString()}/1,000,000).</span>
                      )}
                      {rimuru.calgurioDefeated && (rimuru.collectedSouls || 0) >= 1000000 && !rimuru.patronDeitiesEvolved && (
                        <button onClick={ch8EvolvePatrons}>[5] EVOLVE TWELVE PATRON DEITIES (SOUL OFFERING)</button>
                      )}
                      {rimuru.patronDeitiesEvolved && (
                        <button onClick={ch8NextChapter}>[5] ADVANCE TO CHAPTER 9 (GREAT TENMA WAR)</button>
                      )}
                    </>
                  )}

                  {rimuru.chapter === 9 && (
                    <>
                      {!rimuru.michaelDefeated && (
                        <span className="gray">Confront Archangel Michael at cell [4, 4].</span>
                      )}
                      {rimuru.michaelDefeated && (
                        <button onClick={ch9NextChapter}>[5] ADVANCE TO CHAPTER 10 (LABYRINTH SIEGE)</button>
                      )}
                    </>
                  )}

                  {rimuru.chapter === 10 && (
                    <>
                      {!rimuru.jahilDefeated && (
                        <span className="gray" style={{ display: 'block', margin: '4px 0' }}>Defeat Possessed Jahil at coordinates [X:2, Y:7] (J).</span>
                      )}
                      {!rimuru.zelanusDefeated && (
                        <span className="gray" style={{ display: 'block', margin: '4px 0' }}>Defeat Insectar King Zelanus at coordinates [X:7, Y:7] (Z).</span>
                      )}
                      {rimuru.jahilDefeated && rimuru.zelanusDefeated && (
                        <button onClick={ch10NextChapter}>[5] ADVANCE TO CHAPTER 11 (COSMIC CLIMAX)</button>
                      )}
                    </>
                  )}

                  {rimuru.chapter === 11 && (
                    <>
                      {!rimuru.feldwayDefeated && (
                        <span className="gray">Confront Feldway's True Form at coordinates [X:8, Y:9] (U).</span>
                      )}
                      {rimuru.feldwayDefeated && (
                        <button onClick={ch11CompleteGame}>[5] COMPLETE STORY MODE & ENTER ENDLESS SANDBOX</button>
                      )}
                    </>
                  )}

                  {rimuru.postGame && (
                    <button onClick={generatePostGameMaze}>[5] SCAN NEW TERRITORY</button>
                  )}
                </>
              )}
            </>
          )}

              {/* Raphael Lab UI */}
              {activeScreen === "lab" && (
                <div className="lab-container">
                  <p className="terminal-line white">=== RAPHAEL SYNTHESIS COMPILER ===</p>
                  <p className="terminal-line gray">Selected fusions: {selectedSkillsForFusion.join(" + ") || "None"}</p>
                  <div className="skills-grid">
                    {rimuru.skills.map(skill => (
                      <div 
                        key={skill} 
                        className={`skill-node ${selectedSkillsForFusion.includes(skill) ? 'selected' : ''}`}
                        onClick={() => selectSkillForFusion(skill)}
                      >
                        {skill} [{getSkillCategory(skill).split(" ")[0].toUpperCase()}]
                      </div>
                    ))}
                  </div>
                  <button onClick={executeFusion} disabled={selectedSkillsForFusion.length < 2 || selectedSkillsForFusion.length > 4}>[1] EXECUTE SYNTHESIS</button>

                  {selectedSkillDetails && (
                    <div style={{ marginTop: '12px', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                      <p className="terminal-line green">=== ARCHIVE: {selectedSkillDetails.name.toUpperCase()} ===</p>
                      {selectedSkillDetails.infobox && Object.entries(selectedSkillDetails.infobox).map(([k, v]) => (
                        v && typeof v === 'string' && <p key={k} className="terminal-line gray" style={{ margin: 0 }}>* {k}: {v}</p>
                      ))}
                      {selectedSkillDetails.summary && <p className="terminal-line white" style={{ marginTop: '4px' }}>{selectedSkillDetails.summary}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Tempest Town Summary */}
              {activeScreen === "town" && (() => {
                const labels = getCustomTownLabels(rimuru.customRace);
                return (
                  <div className="town-hud">
                    <p className="terminal-line white">=== {labels.title} ===</p>
                    <div className="town-grid">
                      <div>
                        <span className="green">WOOD / FUEL:</span> {rimuru.town.wood}<br />
                        <span className="green">STONE / ORE:</span> {rimuru.town.stone}<br />
                        <span className="green">FORGES / SMITHY:</span> {rimuru.town.smithy}
                      </div>
                      <div>
                        <span className="green">{labels.build1.toUpperCase()}S:</span> {rimuru.town.dwellings}<br />
                        <span className="green">{labels.build2.toUpperCase()}:</span> {rimuru.town.laboratory}
                      </div>
                      <div>
                        <span className="green">{labels.pop1.toUpperCase()}:</span> {rimuru.town.goblins}<br />
                        <span className="green">{labels.pop2.toUpperCase()}:</span> {rimuru.town.orcs}<br />
                        <span className="green">SUPPORT ALLIES:</span> {rimuru.allies.length}
                      </div>
                    </div>
                    <div className="commands-list" style={{ marginTop: '8px' }}>
                      {rimuru.customMode ? (
                        <>
                          <button onClick={gatherWoodCustom}>[1] HARVEST WOOD (+15)</button>
                          <button onClick={gatherStoneCustom}>[2] HARVEST STONE (+8)</button>
                          <button onClick={buildDwellingCustom} disabled={rimuru.town.wood < 20 || rimuru.town.stone < 10}>
                            [3] BUILD {labels.build1.toUpperCase()} (20W, 10S)
                          </button>
                          <button onClick={buildSmithyCustom} disabled={rimuru.town.wood < 50 || rimuru.town.stone < 30}>
                            [4] BUILD FORGE (50W, 30S)
                          </button>
                          <button 
                            onClick={buildLaboratoryCustom} 
                            disabled={rimuru.town.wood < 100 || rimuru.town.stone < 80 || getInventoryQty("Magical Ore") < 5}
                          >
                            [5] BUILD {labels.build2.toUpperCase()} (100W, 80S, 5 Ore)
                          </button>
                          <button onClick={() => recruitPopCustom("pop1")} disabled={rimuru.ep < 100}>
                            [6] RECRUIT 10 {labels.pop1.toUpperCase()} (100 EP)
                          </button>
                          <button onClick={() => recruitPopCustom("pop2")} disabled={rimuru.ep < 200}>
                            [7] RECRUIT 5 {labels.pop2.toUpperCase()} (200 EP)
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={ch2GatherWood}>[1] GATHER LUMBER (+15W)</button>
                          <button onClick={ch2GatherStone}>[2] GATHER STONE (+8S)</button>
                          {rimuru.chapter === 2 && <button onClick={ch2BuildDwelling}>[3] BUILD DWELLING (20W, 10S)</button>}
                          {rimuru.chapter >= 3 && <button onClick={ch3BuildSmithy}>[3] BUILD SMITHY (50W, 30S)</button>}
                          {rimuru.chapter >= 4 && (
                            <button onClick={buildLaboratory} disabled={rimuru.town.wood < 100 || rimuru.town.stone < 80 || getInventoryQty("Magical Ore") < 5}>
                              [4] BUILD LABORATORY (100W, 80S, 5 Ore)
                            </button>
                          )}
                          {rimuru.chapter >= 7 && (
                            <button onClick={buildLabyrinth} disabled={rimuru.town.wood < 100 || rimuru.town.stone < 100 || getInventoryQty("Magical Ore") < 20 || rimuru.labyrinthBuilt}>
                              {rimuru.labyrinthBuilt ? "[5] LABYRINTH CONSTRUCTED" : "[5] BUILD LABYRINTH (100W, 100S, 20 Ore)"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
 
                    {(rimuru.town.smithy > 0 || (rimuru.customMode && rimuru.town.smithy > 0)) && (
                      <div style={{ marginTop: '12px', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                        <p className="terminal-line green">=== KUROBE'S SMITHY (FORGE EQUIPMENT) ===</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                          <div>
                            <p className="terminal-line white">Available Materials:</p>
                            <span className="gray">Magical Ore:</span> {getInventoryQty("Magical Ore")}<br />
                            <span className="gray">Steel Core:</span> {getInventoryQty("Steel Core")}<br />
                            <span className="gray">Hipokute Herb:</span> {getInventoryQty("Hipokute Herb")}
                          </div>
                          <div>
                            <p className="terminal-line white">Forge Recipes:</p>
                            <button 
                              onClick={() => forgeEquipment("Magisteel Sword", "weapon", { "Magical Ore": 5, "Steel Core": 3 })}
                              disabled={getInventoryQty("Magical Ore") < 5 || getInventoryQty("Steel Core") < 3}
                              style={{ display: 'block', width: '100%', marginBottom: '4px', textAlign: 'left' }}
                            >
                              [1] Magisteel Sword (5 Ore, 3 Steel) [+25 STR]
                            </button>
                            <button 
                              onClick={() => forgeEquipment("Tempest Uniform", "armor", { "Hipokute Herb": 10, "Magical Ore": 5 })}
                              disabled={getInventoryQty("Hipokute Herb") < 10 || getInventoryQty("Magical Ore") < 5}
                              style={{ display: 'block', width: '100%', marginBottom: '4px', textAlign: 'left' }}
                            >
                              [2] Tempest Uniform (10 Herb, 5 Ore) [+40 DEF]
                            </button>
                            <button 
                              onClick={() => forgeEquipment("Beast Slayer", "weapon", { "Magical Ore": 12, "Steel Core": 8 })}
                              disabled={getInventoryQty("Magical Ore") < 12 || getInventoryQty("Steel Core") < 8}
                              style={{ display: 'block', width: '100%', marginBottom: '4px', textAlign: 'left' }}
                            >
                              [3] Beast Slayer (12 Ore, 8 Steel) [+75 STR]
                            </button>
                            <button 
                              onClick={() => forgeEquipment("Armor of Geld", "armor", { "Steel Core": 20, "Magical Ore": 10 })}
                              disabled={getInventoryQty("Steel Core") < 20 || getInventoryQty("Magical Ore") < 10}
                              style={{ display: 'block', width: '100%', marginBottom: '4px', textAlign: 'left' }}
                            >
                              [4] Armor of Geld (20 Steel, 10 Ore) [+95 DEF]
                            </button>
                            {(rimuru.chapter >= 5 || rimuru.customMode) && (
                              <>
                                <button 
                                  onClick={() => forgeEquipment("Storm Dragon Sword", "weapon", { "Magical Ore": 50, "Steel Core": 30 })}
                                  disabled={getInventoryQty("Magical Ore") < 50 || getInventoryQty("Steel Core") < 30}
                                  style={{ display: 'block', width: '100%', marginBottom: '4px', textAlign: 'left' }}
                                >
                                  [5] Storm Dragon Sword [+300 STR]
                                </button>
                                <button 
                                  onClick={() => forgeEquipment("Hihi'irokane Shield", "armor", { "Magical Ore": 40, "Steel Core": 25 })}
                                  disabled={getInventoryQty("Magical Ore") < 40 || getInventoryQty("Steel Core") < 25}
                                  style={{ display: 'block', width: '100%', marginBottom: '4px', textAlign: 'left' }}
                                >
                                  [6] Hihi'irokane Shield [+250 DEF]
                                </button>
                                <button 
                                  onClick={() => forgeEquipment("Spirit Ring", "accessory", { "Magical Ore": 15, "Steel Core": 15, "Hipokute Herb": 5 })}
                                  disabled={getInventoryQty("Magical Ore") < 15 || getInventoryQty("Steel Core") < 15 || getInventoryQty("Hipokute Herb") < 5}
                                  style={{ display: 'block', width: '100%', marginBottom: '4px', textAlign: 'left' }}
                                >
                                  [11] Spirit Ring [+200 MP, +15 AGI]
                                </button>
                                <button 
                                  onClick={() => forgeEquipment("Draconic Amulet", "accessory", { "Magical Ore": 30, "Steel Core": 25 })}
                                  disabled={getInventoryQty("Magical Ore") < 30 || getInventoryQty("Steel Core") < 25}
                                  style={{ display: 'block', width: '100%', marginBottom: '4px', textAlign: 'left' }}
                                >
                                  [12] Draconic Amulet [+100 HP, +35 STR, +20 DEF]
                                </button>
                              </>
                            )}
                            {(rimuru.chapter >= 6 || rimuru.customMode) && (
                              <>
                                <button 
                                  onClick={() => forgeEquipment("God Grade Guren Sword", "weapon", { "Magical Ore": 30, "Steel Core": 20 })}
                                  disabled={getInventoryQty("Magical Ore") < 30 || getInventoryQty("Steel Core") < 20}
                                  style={{ display: 'block', width: '100%', marginBottom: '4px', textAlign: 'left' }}
                                >
                                  [9] God Grade Guren Sword [+450 STR]
                                </button>
                                <button 
                                  onClick={() => forgeEquipment("God Grade Tempest Raiment", "armor", { "Magical Ore": 25, "Steel Core": 15, "Hipokute Herb": 10 })}
                                  disabled={getInventoryQty("Magical Ore") < 25 || getInventoryQty("Steel Core") < 15 || getInventoryQty("Hipokute Herb") < 10}
                                  style={{ display: 'block', width: '100%', marginBottom: '4px', textAlign: 'left' }}
                                >
                                  [10] God Grade Tempest Raiment [+350 DEF]
                                </button>
                              </>
                            )}
                            {(rimuru.chapter >= 8 || rimuru.customMode) && (
                              <>
                                <button 
                                  onClick={() => forgeEquipment("Genesis Grade Veldora Blade", "weapon", { "Magical Ore": 80, "Steel Core": 50 })}
                                  disabled={getInventoryQty("Magical Ore") < 80 || getInventoryQty("Steel Core") < 50}
                                  style={{ display: 'block', width: '100%', marginBottom: '4px', textAlign: 'left' }}
                                >
                                  [7] Genesis Grade Veldora Blade [+900 STR]
                                </button>
                                <button 
                                  onClick={() => forgeEquipment("True Dragon Armor", "armor", { "Magical Ore": 60, "Steel Core": 45 })}
                                  disabled={getInventoryQty("Magical Ore") < 60 || getInventoryQty("Steel Core") < 45}
                                  style={{ display: 'block', width: '100%', marginBottom: '4px', textAlign: 'left' }}
                                >
                                  [8] True Dragon Armor [+600 DEF]
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Status HUD / Equipment Tab */}
              {activeScreen === "status" && (
                <div className="town-hud">
                  <p className="terminal-line white">=== EQUIPMENT SLOTS ===</p>
                  <div className="town-grid">
                    <div>
                      <span className="green">WEAPON:</span> {rimuru.equippedWeapon || "None"} (+{getItemStatBonus(rimuru.equippedWeapon)} STR)<br />
                      <span className="green">ARMOR:</span> {rimuru.equippedArmor || "None"} (+{getItemStatBonus(rimuru.equippedArmor)} DEF)<br />
                      <span className="green">ACCESSORY:</span> {rimuru.equippedAccessory || "None"} (Bonus: {(() => {
                        const b = getAccessoryBonuses(rimuru.equippedAccessory);
                        const parts = [];
                        if (b.str) parts.push(`+${b.str} STR`);
                        if (b.def) parts.push(`+${b.def} DEF`);
                        if (b.agi) parts.push(`+${b.agi} AGI`);
                        if (b.mp) parts.push(`+${b.mp} MP`);
                        return parts.join(", ") || "None";
                      })()})
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span className="green">INVENTORY:</span><br />
                      {rimuru.inventory.length === 0 && <span className="gray">Empty</span>}
                      {rimuru.inventory.map((item, idx) => (
                        <div key={item.name} style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                          <span>{item.name} (x{item.quantity})</span>
                          {["Hipokute Potion", "Magicule Elixir"].includes(item.name) && (
                            <span className="green" style={{ cursor: 'pointer' }} onClick={() => usePotionOutsideCombat(item.name)}>[Use Item]</span>
                          )}
                          {WEAPONS.includes(item.name) && (
                            rimuru.equippedWeapon === item.name ? (
                              <span className="gray">[Equipped Weapon]</span>
                            ) : (
                              <span className="green" style={{ cursor: 'pointer' }} onClick={() => equipItem(item.name, "weapon")}>[Equip Weapon]</span>
                            )
                          )}
                          {ARMORS.includes(item.name) && (
                            rimuru.equippedArmor === item.name ? (
                              <span className="gray">[Equipped Armor]</span>
                            ) : (
                              <span className="green" style={{ cursor: 'pointer' }} onClick={() => equipItem(item.name, "armor")}>[Equip Armor]</span>
                            )
                          )}
                          {ACCESSORIES.includes(item.name) && (
                            rimuru.equippedAccessory === item.name ? (
                              <span className="gray">[Equipped Accessory]</span>
                            ) : (
                              <span className="green" style={{ cursor: 'pointer' }} onClick={() => equipItem(item.name, "accessory")}>[Equip Accessory]</span>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Labyrinth Conquest Mode Tab */}
              {activeScreen === "dungeon" && (
                <div className="town-hud">
                  <p className="terminal-line white">=== RAMIRIS' LABYRINTH CONQUEST (FLOORS: 1-100) ===</p>
                  <div className="town-grid">
                    <div>
                      <span className="green">CURRENT FLOOR:</span> Floor {rimuru.dungeonFloor || 1} / 100<br />
                      <span className="green">MAX FLOOR CLEARED:</span> Floor {rimuru.maxLabyrinthFloorCleared || 0}<br />
                      <span className="green">LATEST GUARDIAN STATUS:</span> {(() => {
                        const floor = rimuru.dungeonFloor || 1;
                        if (floor % 10 !== 0) {
                          const nextG = Math.ceil(floor / 10) * 10;
                          return `Next boss awaits on Floor ${nextG}`;
                        } else {
                          const isCleared = (rimuru.maxLabyrinthFloorCleared || 0) >= floor;
                          return isCleared ? `Floor ${floor} Boss defeated (Neutralized)` : `Floor ${floor} Boss active (Path blocked!)`;
                        }
                      })()}
                    </div>
                    <div>
                      <span className="green">PLAYER VITALS:</span><br />
                      <span className="gray">HP:</span> {rimuru.hp} / {rimuru.maxHp}<br />
                      <span className="gray">MP:</span> {rimuru.mp} / {rimuru.maxMp}<br />
                      <span className="gray">ZEGION RECRUITED:</span> {rimuru.zegionDefeated ? "YES (Insectar Lord Ally)" : "NO (Challenging Floor 100)"}
                    </div>
                    <div>
                      <span className="green">ORE & HERB INVENTORY:</span><br />
                      <span className="gray">Magical Ore:</span> {getInventoryQty("Magical Ore")}<br />
                      <span className="gray">Steel Core:</span> {getInventoryQty("Steel Core")}<br />
                      <span className="gray">Hipokute Herb:</span> {getInventoryQty("Hipokute Herb")}
                    </div>
                  </div>

                  <div className="commands-list" style={{ marginTop: '12px' }}>
                    <button onClick={descendCorridor} disabled={rimuru.mp < 15 || ((rimuru.dungeonFloor || 1) % 10 === 0 && (rimuru.maxLabyrinthFloorCleared || 0) < (rimuru.dungeonFloor || 1))}>
                      [1] DESCEND CORRIDOR (Costs 15 MP)
                    </button>
                    
                    <button onClick={confrontLabyrinthGuardian} disabled={(rimuru.dungeonFloor || 1) % 10 !== 0}>
                      [2] CONFRONT GUARDIAN {(() => {
                        const floor = rimuru.dungeonFloor || 1;
                        if (floor % 10 === 0) {
                          const isCleared = (rimuru.maxLabyrinthFloorCleared || 0) >= floor;
                          return `(Floor ${floor} Boss${isCleared ? ' - Defeated' : ' - ACTIVE'})`;
                        }
                        return "";
                      })()}
                    </button>
                    
                    <button onClick={mineLabyrinthOre} disabled={rimuru.mp < 5}>
                      [3] EXCAVATE MAGICAL ORE (Costs 5 MP)
                    </button>
                    
                    <button onClick={meditateInLabyrinth}>
                      [4] MEDITATE & CHANNEL MAGICULES (Free, 15% Ambush Chance)
                    </button>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <p className="terminal-line gray" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                      Tip: Every 10 floors, a Guardian must be defeated to descend. Clear Floor 100 to defeat Zegion, acquire the ultimate skill "Storm King Veldora", and recruit Zegion as a combat support ally.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation and Utility Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderLeft: '2px solid var(--border-color)', paddingLeft: '8px' }}>
                <button onClick={() => setActiveScreen("main")}>TERMINAL</button>
                <button onClick={() => setActiveScreen("status")}>EQUIPMENT</button>
                <button onClick={() => setActiveScreen("lab")}>RAPHAEL LAB</button>
                <button onClick={() => setActiveScreen("town")}>TEMPEST</button>
                {(rimuru.labyrinthBuilt || rimuru.customMode) && (
                  <button onClick={() => setActiveScreen("dungeon")}>DUNGEON</button>
                )}
                <button onClick={toggleAudio} style={{ borderColor: audioEnabled ? 'var(--text-primary)' : 'var(--border-color)' }}>
                  {audioEnabled ? "VOICE: ON" : "VOICE: OFF"}
                </button>
                <button onClick={saveGame}>SAVE</button>
                <button onClick={loadGame}>LOAD</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
