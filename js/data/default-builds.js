/**
 * Default Builds for Gremio "Furia de Dragones"
 * Verified official IDs and spells
 */

export const DEFAULT_BUILDS = [
  {
    "id": "furia_zvz_bruiser",
    "name": "Bruiser - Romperreinos",
    "role": "DPS Melee",
    "folder": "ZvZ",
    "notes": "Entrada con E + Chaqueta de Vándalo para absorber y romper formaciones enemigas.",
    "equipment": {
      "head": {
        "id": "HEAD_CLOTH_SET2",
        "tier": "T8",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "ICEBLOCK2",
        "passiveSpell": "PASSIVE_INCREASED_DAMAGE"
      },
      "armor": {
        "id": "ARMOR_LEATHER_HELL",
        "tier": "T8",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "LIFESTEALAURA",
        "passiveSpell": "PASSIVE_ARMOR_BALANCE"
      },
      "shoes": {
        "id": "SHOES_CLOTH_SET1",
        "tier": "T8",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "CHANNELED_RUN",
        "passiveSpell": "PASSIVE_INCREASED_DAMAGE"
      },
      "mainhand": {
        "id": "2H_AXE_AVALON",
        "tier": "T8",
        "enchant": 2,
        "quality": 3,
        "qSpell": "RENDINGSPIN",
        "wSpell": "AXEBOOST",
        "eSpell": "LETHAL_CLEAVER",
        "passiveSpell": "PASSIVE_BLEEDCHANCE"
      },
      "offhand": null,
      "cape": {
        "id": "CAPEITEM_FW_FORTSTERLING",
        "tier": "T8",
        "enchant": 0,
        "quality": 2
      },
      "food": {
        "id": "MEAL_STEW",
        "tier": "T8",
        "enchant": 0,
        "quality": 1
      },
      "potion": {
        "id": "POTION_REVIVE",
        "tier": "T7",
        "enchant": 0,
        "quality": 1
      },
      "mount": {
        "id": "MOUNT_ARMORED_HORSE",
        "tier": "T6",
        "enchant": 0,
        "quality": 1
      }
    }
  },
  {
    "id": "furia_zvz_tank",
    "name": "Tanque Enganche - Maza Pesada",
    "role": "Tanque Principal",
    "folder": "ZvZ",
    "notes": "Inicia con E para purgar y silenciar en área a los enemigos.",
    "equipment": {
      "head": {
        "id": "HEAD_PLATE_SET2",
        "tier": "T8",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "DISRUPTIONIMMUNITY",
        "passiveSpell": "PASSIVE_MR_AR"
      },
      "armor": {
        "id": "ARMOR_PLATE_SET3",
        "tier": "T8",
        "enchant": 2,
        "quality": 2,
        "activeSpell": "TAUNT",
        "passiveSpell": "PASSIVE_ARMOR_MR_AR"
      },
      "shoes": {
        "id": "SHOES_LEATHER_SET2",
        "tier": "T8",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "OVERSPRINT",
        "passiveSpell": "PASSIVE_MAXLOAD_SHOES"
      },
      "mainhand": {
        "id": "2H_MACE",
        "tier": "T8",
        "enchant": 1,
        "quality": 2,
        "qSpell": "DEFENSIVESLAM",
        "wSpell": "GROUNDSHAKER",
        "eSpell": "SHRIEKMACE",
        "passiveSpell": "PASSIVE_STUNCHANCE"
      },
      "offhand": null,
      "cape": {
        "id": "CAPEITEM_FW_MARTLOCK",
        "tier": "T8",
        "enchant": 0,
        "quality": 2
      },
      "food": {
        "id": "MEAL_OMELETTE",
        "tier": "T7",
        "enchant": 0,
        "quality": 1
      },
      "potion": {
        "id": "POTION_STONESKIN",
        "tier": "T7",
        "enchant": 0,
        "quality": 1
      },
      "mount": {
        "id": "MOUNT_ARMORED_HORSE",
        "tier": "T6",
        "enchant": 0,
        "quality": 1
      }
    }
  },
  {
    "id": "furia_zvz_healer",
    "name": "Healer Caído (Fallen)",
    "role": "Healer Grupal",
    "folder": "ZvZ",
    "notes": "Santuario (E) sobre el grupo aliado en el momento del impacto enemigo.",
    "equipment": {
      "head": {
        "id": "HEAD_LEATHER_SET3",
        "tier": "T8",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "SUMMONER_CD_REDUCTION",
        "passiveSpell": "PASSIVE_BALANCE"
      },
      "armor": {
        "id": "ARMOR_CLOTH_SET2",
        "tier": "T8",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "LIFESAVIOR",
        "passiveSpell": "PASSIVE_ARMOR_INCREASED_DAMAGE"
      },
      "shoes": {
        "id": "SHOES_CLOTH_SET1",
        "tier": "T8",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "CHANNELED_RUN",
        "passiveSpell": "PASSIVE_MAXLOAD_SHOES"
      },
      "mainhand": {
        "id": "2H_HOLYSTAFF_HELL",
        "tier": "T8",
        "enchant": 2,
        "quality": 3,
        "qSpell": "GENEROUSHEAL",
        "wSpell": "PULSINGHEAL",
        "eSpell": "HOLY_ULTIMATE",
        "passiveSpell": "PASSIVE_HEALPOWERCHANCE"
      },
      "offhand": null,
      "cape": {
        "id": "CAPEITEM_FW_LYMHURST",
        "tier": "T8",
        "enchant": 0,
        "quality": 2
      },
      "food": {
        "id": "MEAL_OMELETTE",
        "tier": "T7",
        "enchant": 0,
        "quality": 1
      },
      "potion": {
        "id": "POTION_ENERGY",
        "tier": "T6",
        "enchant": 0,
        "quality": 1
      },
      "mount": {
        "id": "MOUNT_ARMORED_HORSE",
        "tier": "T6",
        "enchant": 0,
        "quality": 1
      }
    }
  },
  {
    "id": "furia_gank_bloodletter",
    "name": "Caza & Gank - Sangradora",
    "role": "Ganker",
    "folder": "Ganking & Roaming",
    "notes": "Doble movilidad para alcanzar presas y ejecutar cuando tengan menos del 40% de vida.",
    "equipment": {
      "head": {
        "id": "HEAD_LEATHER_MORGANA",
        "tier": "T6",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "SMELLOFBLOOD",
        "passiveSpell": "PASSIVE_BALANCE"
      },
      "armor": {
        "id": "ARMOR_LEATHER_SET3",
        "tier": "T6",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "AMBUSH",
        "passiveSpell": "PASSIVE_ARMOR_BALANCE"
      },
      "shoes": {
        "id": "SHOES_PLATE_SET1",
        "tier": "T6",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "WANDERLUST",
        "passiveSpell": "PASSIVE_MAXLOAD_SHOES"
      },
      "mainhand": {
        "id": "MAIN_RAPIER_MORGANA",
        "tier": "T6",
        "enchant": 2,
        "quality": 3,
        "qSpell": "SUNDERARMOR2",
        "wSpell": "THROWINGBLADES",
        "eSpell": "RAPIERSTAB",
        "passiveSpell": "PASSIVE_BLEEDCHANCE"
      },
      "offhand": {
        "id": "OFF_HORN_KEEPER",
        "tier": "T6",
        "enchant": 1,
        "quality": 2
      },
      "cape": {
        "id": "CAPEITEM_UNDEAD",
        "tier": "T6",
        "enchant": 0,
        "quality": 2
      },
      "food": {
        "id": "MEAL_STEW",
        "tier": "T8",
        "enchant": 0,
        "quality": 1
      },
      "potion": {
        "id": "POTION_LAVA",
        "tier": "T8",
        "enchant": 0,
        "quality": 1
      },
      "mount": {
        "id": "MOUNT_DIREWOLF",
        "tier": "T6",
        "enchant": 0,
        "quality": 1
      }
    }
  },
  {
    "id": "furia_pve_battleaxe",
    "name": "Farmeo Solitario - Hacha de Guerra",
    "role": "PvE Solo",
    "folder": "PvE & Dungeons",
    "notes": "Sostenibilidad continua y robo de vida en mazmorras y mundo abierto.",
    "equipment": {
      "head": {
        "id": "HEAD_CLOTH_SET1",
        "tier": "T6",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "ENERGYSHIELD2",
        "passiveSpell": "PASSIVE_INCREASED_DAMAGE"
      },
      "armor": {
        "id": "ARMOR_LEATHER_SET1",
        "tier": "T6",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "BLOODLUST",
        "passiveSpell": "PASSIVE_ARMOR_BALANCE"
      },
      "shoes": {
        "id": "SHOES_LEATHER_SET1",
        "tier": "T6",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "CLEANSE_DASH",
        "passiveSpell": "PASSIVE_MAXLOAD_SHOES"
      },
      "mainhand": {
        "id": "MAIN_AXE",
        "tier": "T6",
        "enchant": 2,
        "quality": 3,
        "qSpell": "RENDINGSTRIKE",
        "wSpell": "AXESMASH",
        "eSpell": "AXETHROW",
        "passiveSpell": "PASSIVE_BLEEDCHANCE"
      },
      "offhand": {
        "id": "OFF_TORCH",
        "tier": "T6",
        "enchant": 1,
        "quality": 2
      },
      "cape": {
        "id": "CAPEITEM_FW_THETFORD",
        "tier": "T6",
        "enchant": 0,
        "quality": 2
      },
      "food": {
        "id": "MEAL_ROAST",
        "tier": "T7",
        "enchant": 0,
        "quality": 1
      },
      "potion": {
        "id": "POTION_HEAL",
        "tier": "T6",
        "enchant": 0,
        "quality": 1
      },
      "mount": {
        "id": "MOUNT_COUGAR_KEEPER",
        "tier": "T5",
        "enchant": 0,
        "quality": 1
      }
    }
  },
  {
    "id": "furia_smallscale_carving",
    "name": "Small Scale - Espada Tallada",
    "role": "DPS / Penetración",
    "folder": "Small Scale & 5v5",
    "notes": "Reductor de armadura para coordinar kills rápidos en combates reducidos.",
    "equipment": {
      "head": {
        "id": "HEAD_LEATHER_SET2",
        "tier": "T7",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "RETALIATE2",
        "passiveSpell": "PASSIVE_BALANCE"
      },
      "armor": {
        "id": "ARMOR_LEATHER_HELL",
        "tier": "T7",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "LIFESTEALAURA",
        "passiveSpell": "PASSIVE_ARMOR_BALANCE"
      },
      "shoes": {
        "id": "SHOES_PLATE_SET1",
        "tier": "T7",
        "enchant": 1,
        "quality": 2,
        "activeSpell": "WANDERLUST",
        "passiveSpell": "PASSIVE_MAXLOAD_SHOES"
      },
      "mainhand": {
        "id": "2H_CLEAVER_HELL",
        "tier": "T7",
        "enchant": 2,
        "quality": 3,
        "qSpell": "HEROICSTRIKE2",
        "wSpell": "SPLITTINGSLASH",
        "eSpell": "CLAYMORESLASH",
        "passiveSpell": "PASSIVE_BLEEDCHANCE"
      },
      "offhand": null,
      "cape": {
        "id": "CAPEITEM_FW_THETFORD",
        "tier": "T7",
        "enchant": 0,
        "quality": 2
      },
      "food": {
        "id": "MEAL_STEW",
        "tier": "T8",
        "enchant": 0,
        "quality": 1
      },
      "potion": {
        "id": "POTION_REVIVE",
        "tier": "T7",
        "enchant": 0,
        "quality": 1
      },
      "mount": {
        "id": "MOUNT_ARMORED_HORSE",
        "tier": "T6",
        "enchant": 0,
        "quality": 1
      }
    }
  }
];
