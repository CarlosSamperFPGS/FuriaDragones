// Builds de ejemplo para Furia de Dragones organizadas por Carpetas de Contenido

export const DEFAULT_BUILDS = [
  {
    id: "furia_zvz_bruiser",
    name: "Bruiser - Rompe-reinos",
    role: "DPS Melee",
    folder: "ZvZ",
    notes: "Entrada con E + Hellion Jacket para romper formaciones.",
    equipment: {
      head: { id: "HEAD_CLOTH_SET2", tier: "T8", enchant: 1, quality: 2, activeSpell: "ICE_BLOCK", passiveSpell: "PASSIVE_AGGRESSION" },
      armor: { id: "ARMOR_LEATHER_HELL", tier: "T8", enchant: 1, quality: 2, activeSpell: "LIFE_DRAIN_AURA", passiveSpell: "PASSIVE_SWIFT_REFLEX" },
      shoes: { id: "SHOES_CLOTH_SET1", tier: "T8", enchant: 1, quality: 2, activeSpell: "FOCUSED_RUN", passiveSpell: "PASSIVE_AGGRESSION_FEET" },
      mainhand: { id: "2H_AXE_AVALON", tier: "T8", enchant: 2, quality: 3, qSpell: "RENDINGSPIN", wSpell: "ADRENALINEBOOST", eSpell: "AVALON_EARTHSPLIT", passiveSpell: "PASSIVE_BLEED_AXE" },
      offhand: null,
      cape: { id: "CAPEITEM_FW_FORTSTERLING", tier: "T8", enchant: 0, quality: 2 },
      food: { id: "MEAL_STEW", tier: "T8", enchant: 0, quality: 1 },
      potion: { id: "POTION_REVIVE", tier: "T7", enchant: 0, quality: 1 },
      mount: { id: "MOUNT_ARMORED_HORSE", tier: "T6", enchant: 0, quality: 1 }
    }
  },
  {
    id: "furia_zvz_tank",
    name: "Tanque Enganche - Maza Pesada",
    role: "Tanque Principal",
    folder: "ZvZ",
    notes: "Inicia con E para purgar y silenciar en área.",
    equipment: {
      head: { id: "HEAD_PLATE_SET2", tier: "T8", enchant: 1, quality: 2, activeSpell: "CLEANSE_HEAD", passiveSpell: "PASSIVE_TOUGHNESS" },
      armor: { id: "ARMOR_PLATE_SET3", tier: "T8", enchant: 2, quality: 2, activeSpell: "ENFEEBLE_AURA", passiveSpell: "PASSIVE_TOUGHNESS_CHEST" },
      shoes: { id: "SHOES_LEATHER_SET2", tier: "T8", enchant: 1, quality: 2, activeSpell: "REFRESHING_SPRINT", passiveSpell: "PASSIVE_SPEED_FEET" },
      mainhand: { id: "2H_HEAVY_MACE", tier: "T8", enchant: 1, quality: 2, qSpell: "DEFENSIVE_SLAM", wSpell: "SNARE_CHARGE", eSpell: "BATTLE_DISRUPT", passiveSpell: "PASSIVE_CC_DURATION" },
      offhand: null,
      cape: { id: "CAPEITEM_FW_MARTLOCK", tier: "T8", enchant: 0, quality: 2 },
      food: { id: "MEAL_OMELETTE", tier: "T7", enchant: 0, quality: 1 },
      potion: { id: "POTION_STONESKIN", tier: "T7", enchant: 0, quality: 1 },
      mount: { id: "MOUNT_ARMORED_HORSE", tier: "T6", enchant: 0, quality: 1 }
    }
  },
  {
    id: "furia_zvz_healer",
    name: "Healer Caído (Fallen)",
    role: "Healer Grupal",
    folder: "ZvZ",
    notes: "Santuario (E) sobre el grupo cuando reciban el clap.",
    equipment: {
      head: { id: "HEAD_LEATHER_SET3", tier: "T8", enchant: 1, quality: 2, activeSpell: "MEDITATION", passiveSpell: "PASSIVE_BALANCED_MIND" },
      armor: { id: "ARMOR_CLOTH_SET2", tier: "T8", enchant: 1, quality: 2, activeSpell: "EVERLASTING_SPIRIT", passiveSpell: "PASSIVE_AGRESSIVE_CASTER" },
      shoes: { id: "SHOES_CLOTH_SET1", tier: "T8", enchant: 1, quality: 2, activeSpell: "FOCUSED_RUN", passiveSpell: "PASSIVE_AGGRESSION_FEET" },
      mainhand: { id: "2H_HOLYSTAFF_HELL", tier: "T8", enchant: 2, quality: 3, qSpell: "GENEROUS_HEAL", wSpell: "HOLY_ORB", eSpell: "FALLEN_SANCTUARY", passiveSpell: "PASSIVE_HEAL_BOOST" },
      offhand: null,
      cape: { id: "CAPEITEM_FW_LYMHURST", tier: "T8", enchant: 0, quality: 2 },
      food: { id: "MEAL_OMELETTE", tier: "T7", enchant: 0, quality: 1 },
      potion: { id: "POTION_ENERGY", tier: "T7", enchant: 0, quality: 1 },
      mount: { id: "MOUNT_ARMORED_HORSE", tier: "T6", enchant: 0, quality: 1 }
    }
  },
  {
    id: "furia_gank_bloodletter",
    name: "Caza & Gank - Sangradora",
    role: "Ganker",
    folder: "Ganking & Roaming",
    notes: "Doble salto para alcanzar y rematar bajo el 40% de vida.",
    equipment: {
      head: { id: "HEAD_LEATHER_MORGANA", tier: "T6", enchant: 1, quality: 2, activeSpell: "STALKER_REVEAL", passiveSpell: "PASSIVE_BALANCED_MIND" },
      armor: { id: "ARMOR_LEATHER_SET3", tier: "T6", enchant: 1, quality: 2, activeSpell: "AMBUSH", passiveSpell: "PASSIVE_SWIFT_REFLEX" },
      shoes: { id: "SHOES_PLATE_SET1", tier: "T6", enchant: 1, quality: 2, activeSpell: "WANDERLUST", passiveSpell: "PASSIVE_TOUGH_FEET" },
      mainhand: { id: "MAIN_RAPIER_MORGANA", tier: "T6", enchant: 2, quality: 3, qSpell: "DEADLY_SWIPE", wSpell: "SHADOW_EDGE", eSpell: "BLOODLETTER_LUNGE", passiveSpell: "PASSIVE_DAGGER_BLEED" },
      offhand: { id: "OFF_HORN_KEEPER", tier: "T6", enchant: 1, quality: 2 },
      cape: { id: "CAPEITEM_UNDEAD", tier: "T6", enchant: 0, quality: 2 },
      food: { id: "MEAL_STEW", tier: "T8", enchant: 0, quality: 1 },
      potion: { id: "POTION_POISON", tier: "T8", enchant: 0, quality: 1 },
      mount: { id: "MOUNT_DIREWOLF", tier: "T6", enchant: 0, quality: 1 }
    }
  },
  {
    id: "furia_pve_battleaxe",
    name: "Farmeo Solitario - Hacha de Batalla",
    role: "PvE Solo",
    folder: "PvE & Dungeons",
    notes: "Robo de vida constante con hacha y chaqueta de mercenario.",
    equipment: {
      head: { id: "HEAD_CLOTH_SET1", tier: "T6", enchant: 1, quality: 2, activeSpell: "ENERGY_SHIELD_SCHOLAR", passiveSpell: "PASSIVE_AGGRESSION" },
      armor: { id: "ARMOR_LEATHER_SET1", tier: "T6", enchant: 1, quality: 2, activeSpell: "BLOODLUST", passiveSpell: "PASSIVE_BALANCED_BODY" },
      shoes: { id: "SHOES_LEATHER_SET1", tier: "T6", enchant: 1, quality: 2, activeSpell: "DODGE", passiveSpell: "PASSIVE_BALANCED_FEET" },
      mainhand: { id: "MAIN_AXE", tier: "T6", enchant: 2, quality: 3, qSpell: "RENDINGSPIN", wSpell: "ADRENALINEBOOST", eSpell: "THROWING_AXES", passiveSpell: "PASSIVE_LIFELEECH_AXE" },
      offhand: { id: "OFF_TORCH", tier: "T6", enchant: 1, quality: 2 },
      cape: { id: "CAPEITEM_FW_THETFORD", tier: "T6", enchant: 0, quality: 2 },
      food: { id: "MEAL_ROAST", tier: "T7", enchant: 0, quality: 1 },
      potion: { id: "POTION_HEAL", tier: "T7", enchant: 0, quality: 1 },
      mount: { id: "MOUNT_SWIFTCLAW", tier: "T5", enchant: 0, quality: 1 }
    }
  },
  {
    id: "furia_smallscale_carving",
    name: "Small Scale - Carving Sword",
    role: "DPS / Reducción",
    folder: "Small Scale & 5v5",
    notes: "Entrar con E para bajar defensas y que el resto ejecute.",
    equipment: {
      head: { id: "HEAD_LEATHER_SET2", tier: "T7", enchant: 1, quality: 2, activeSpell: "RETALIATE", passiveSpell: "PASSIVE_BALANCED_MIND" },
      armor: { id: "ARMOR_LEATHER_HELL", tier: "T7", enchant: 1, quality: 2, activeSpell: "LIFE_DRAIN_AURA", passiveSpell: "PASSIVE_SWIFT_REFLEX" },
      shoes: { id: "SHOES_PLATE_SET1", tier: "T7", enchant: 1, quality: 2, activeSpell: "WANDERLUST", passiveSpell: "PASSIVE_TOUGH_FEET" },
      mainhand: { id: "2H_CLEAVER_HELL", tier: "T7", enchant: 2, quality: 3, qSpell: "HEROICCLEAVE", wSpell: "SPLITTINGSLASH", eSpell: "FEARLESS_STRIKE", passiveSpell: "PASSIVE_DEEPWOUNDS" },
      offhand: null,
      cape: { id: "CAPEITEM_FW_THETFORD", tier: "T7", enchant: 0, quality: 2 },
      food: { id: "MEAL_STEW", tier: "T8", enchant: 0, quality: 1 },
      potion: { id: "POTION_REVIVE", tier: "T7", enchant: 0, quality: 1 },
      mount: { id: "MOUNT_ARMORED_HORSE", tier: "T6", enchant: 0, quality: 1 }
    }
  }
];
