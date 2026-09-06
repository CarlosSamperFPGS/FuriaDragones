// Builds de ejemplo para Furia de Dragones con IDs 100% verificados

export const DEFAULT_BUILDS = [
  {
    id: "furia_zvz_bruiser",
    name: "Bruiser - Rompe-reinos",
    role: "DPS Melee",
    folder: "ZvZ",
    notes: "Entrada con E + Hellion Jacket para romper formaciones.",
    equipment: {
      head: { id: "HEAD_CLOTH_SET2", tier: "T8", enchant: 1, quality: 2, activeSpell: "ICEBLOCK", passiveSpell: "PASSIVE_WELL_PREPARED" },
      armor: { id: "ARMOR_LEATHER_HELL", tier: "T8", enchant: 1, quality: 2, activeSpell: "LIFEDRAINAURA", passiveSpell: "PASSIVE_INCREASED_DEFENSE" },
      shoes: { id: "SHOES_CLOTH_SET1", tier: "T8", enchant: 1, quality: 2, activeSpell: "FOCUSEDRUN", passiveSpell: "PASSIVE_WELL_PREPARED" },
      mainhand: { id: "2H_AXE_AVALON", tier: "T8", enchant: 2, quality: 3, qSpell: "RENDINGSPIN", wSpell: "ADRENALINEBOOST", eSpell: "AVALON_EARTHSPLIT", passiveSpell: "PASSIVE_BLEED_AXE" },
      offhand: null,
      cape: { id: "CAPEITEM_FW_FORTSTERLING", tier: "T8", enchant: 0, quality: 2 },
      food: { id: "T8_MEAL_STEW", tier: "T8", enchant: 0, quality: 1 },
      potion: { id: "POTION_REVIVE", tier: "T7", enchant: 0, quality: 1 },
      mount: { id: "T6_MOUNT_ARMORED_HORSE", tier: "T6", enchant: 0, quality: 1 }
    }
  },
  {
    id: "furia_zvz_tank",
    name: "Tanque Enganche - Maza Pesada",
    role: "Tanque Principal",
    folder: "ZvZ",
    notes: "Inicia con E para purgar y silenciar en área.",
    equipment: {
      head: { id: "HEAD_PLATE_SET2", tier: "T8", enchant: 1, quality: 2, activeSpell: "CLEANSE", passiveSpell: "PASSIVE_INCREASED_DEFENSE" },
      armor: { id: "ARMOR_PLATE_SET3", tier: "T8", enchant: 2, quality: 2, activeSpell: "ENFEEBLEAURA", passiveSpell: "PASSIVE_INCREASED_DEFENSE" },
      shoes: { id: "SHOES_LEATHER_SET2", tier: "T8", enchant: 1, quality: 2, activeSpell: "REFRESHINGSPRINT", passiveSpell: "PASSIVE_INCREASED_DEFENSE" },
      mainhand: { id: "2H_HEAVY_MACE", tier: "T8", enchant: 1, quality: 2, qSpell: "DEFENSIVESLAM", wSpell: "SNARECHARGE", eSpell: "BATTLE_DISRUPT", passiveSpell: "PASSIVE_CC_DURATION" },
      offhand: null,
      cape: { id: "CAPEITEM_FW_MARTLOCK", tier: "T8", enchant: 0, quality: 2 },
      food: { id: "T7_MEAL_OMELETTE", tier: "T7", enchant: 0, quality: 1 },
      potion: { id: "POTION_STONESKIN", tier: "T7", enchant: 0, quality: 1 },
      mount: { id: "T6_MOUNT_ARMORED_HORSE", tier: "T6", enchant: 0, quality: 1 }
    }
  },
  {
    id: "furia_zvz_healer",
    name: "Healer Caído (Fallen)",
    role: "Healer Grupal",
    folder: "ZvZ",
    notes: "Santuario (E) sobre el grupo cuando reciban el clap.",
    equipment: {
      head: { id: "HEAD_LEATHER_SET3", tier: "T8", enchant: 1, quality: 2, activeSpell: "MEDITATION", passiveSpell: "PASSIVE_WELL_PREPARED" },
      armor: { id: "ARMOR_CLOTH_SET2", tier: "T8", enchant: 1, quality: 2, activeSpell: "IMMORTAL", passiveSpell: "PASSIVE_WELL_PREPARED" },
      shoes: { id: "SHOES_CLOTH_SET1", tier: "T8", enchant: 1, quality: 2, activeSpell: "FOCUSEDRUN", passiveSpell: "PASSIVE_WELL_PREPARED" },
      mainhand: { id: "2H_HOLYSTAFF_HELL", tier: "T8", enchant: 2, quality: 3, qSpell: "GENEROUSHEAL", wSpell: "HOLYORB", eSpell: "SACREDGROUND", passiveSpell: "PASSIVE_INCREASED_DEFENSE" },
      offhand: null,
      cape: { id: "CAPEITEM_FW_LYMHURST", tier: "T8", enchant: 0, quality: 2 },
      food: { id: "T7_MEAL_OMELETTE", tier: "T7", enchant: 0, quality: 1 },
      potion: { id: "POTION_ENERGY", tier: "T6", enchant: 0, quality: 1 },
      mount: { id: "T6_MOUNT_ARMORED_HORSE", tier: "T6", enchant: 0, quality: 1 }
    }
  },
  {
    id: "furia_gank_bloodletter",
    name: "Caza & Gank - Sangradora",
    role: "Ganker",
    folder: "Ganking & Roaming",
    notes: "Doble salto para alcanzar y rematar bajo el 40% de vida.",
    equipment: {
      head: { id: "HEAD_LEATHER_MORGANA", tier: "T6", enchant: 1, quality: 2, activeSpell: "RETALIATE", passiveSpell: "PASSIVE_WELL_PREPARED" },
      armor: { id: "ARMOR_LEATHER_SET3", tier: "T6", enchant: 1, quality: 2, activeSpell: "AMBUSH", passiveSpell: "PASSIVE_INCREASED_DEFENSE" },
      shoes: { id: "SHOES_PLATE_SET1", tier: "T6", enchant: 1, quality: 2, activeSpell: "WANDERLUST", passiveSpell: "PASSIVE_INCREASED_DEFENSE" },
      mainhand: { id: "MAIN_RAPIER_MORGANA", tier: "T6", enchant: 2, quality: 3, qSpell: "DEADLYSWIPE", wSpell: "SHADOWEDGE", eSpell: "FEARLESS_STRIKE", passiveSpell: "PASSIVE_DEEPWOUNDS" },
      offhand: { id: "OFF_HORN_KEEPER", tier: "T6", enchant: 1, quality: 2 },
      cape: { id: "CAPEITEM_UNDEAD", tier: "T6", enchant: 0, quality: 2 },
      food: { id: "T8_MEAL_STEW", tier: "T8", enchant: 0, quality: 1 },
      potion: { id: "POTION_LAVA", tier: "T6", enchant: 0, quality: 1 },
      mount: { id: "T6_MOUNT_DIREWOLF", tier: "T6", enchant: 0, quality: 1 }
    }
  },
  {
    id: "furia_pve_battleaxe",
    name: "Farmeo Solitario - Hacha de Batalla",
    role: "PvE Solo",
    folder: "PvE & Dungeons",
    notes: "Robo de vida constante con hacha y chaqueta de mercenario.",
    equipment: {
      head: { id: "HEAD_CLOTH_SET1", tier: "T6", enchant: 1, quality: 2, activeSpell: "ENERGYSHIELD", passiveSpell: "PASSIVE_WELL_PREPARED" },
      armor: { id: "ARMOR_LEATHER_SET1", tier: "T6", enchant: 1, quality: 2, activeSpell: "BLOODLUST", passiveSpell: "PASSIVE_WELL_PREPARED" },
      shoes: { id: "SHOES_LEATHER_SET1", tier: "T6", enchant: 1, quality: 2, activeSpell: "DODGE", passiveSpell: "PASSIVE_INCREASED_DEFENSE" },
      mainhand: { id: "MAIN_AXE", tier: "T6", enchant: 2, quality: 3, qSpell: "RENDINGSPIN", wSpell: "ADRENALINEBOOST", eSpell: "THROWING_AXES", passiveSpell: "PASSIVE_LIFELEECH_AXE" },
      offhand: { id: "OFF_TORCH", tier: "T6", enchant: 1, quality: 2 },
      cape: { id: "CAPEITEM_FW_THETFORD", tier: "T6", enchant: 0, quality: 2 },
      food: { id: "T7_MEAL_ROAST", tier: "T7", enchant: 0, quality: 1 },
      potion: { id: "POTION_HEAL", tier: "T6", enchant: 0, quality: 1 },
      mount: { id: "T5_MOUNT_SWIFTCLAW", tier: "T5", enchant: 0, quality: 1 }
    }
  },
  {
    id: "furia_smallscale_carving",
    name: "Small Scale - Carving Sword",
    role: "DPS / Reducción",
    folder: "Small Scale & 5v5",
    notes: "Entrar con E para bajar defensas y que el resto ejecute.",
    equipment: {
      head: { id: "HEAD_LEATHER_SET2", tier: "T7", enchant: 1, quality: 2, activeSpell: "RETALIATE", passiveSpell: "PASSIVE_WELL_PREPARED" },
      armor: { id: "ARMOR_LEATHER_HELL", tier: "T7", enchant: 1, quality: 2, activeSpell: "LIFEDRAINAURA", passiveSpell: "PASSIVE_INCREASED_DEFENSE" },
      shoes: { id: "SHOES_PLATE_SET1", tier: "T7", enchant: 1, quality: 2, activeSpell: "WANDERLUST", passiveSpell: "PASSIVE_INCREASED_DEFENSE" },
      mainhand: { id: "2H_CLEAVER_HELL", tier: "T7", enchant: 2, quality: 3, qSpell: "HEROICCLEAVE", wSpell: "SPLITTINGSLASH", eSpell: "FEARLESS_STRIKE", passiveSpell: "PASSIVE_DEEPWOUNDS" },
      offhand: null,
      cape: { id: "CAPEITEM_FW_THETFORD", tier: "T7", enchant: 0, quality: 2 },
      food: { id: "T8_MEAL_STEW", tier: "T8", enchant: 0, quality: 1 },
      potion: { id: "POTION_REVIVE", tier: "T7", enchant: 0, quality: 1 },
      mount: { id: "T6_MOUNT_ARMORED_HORSE", tier: "T6", enchant: 0, quality: 1 }
    }
  }
];
