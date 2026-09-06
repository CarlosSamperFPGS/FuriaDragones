// Catálogo simplificado de habilidades (Spells) de Albion Online (sin descripciones)

export function getAlbionSpellIconUrl(spellId) {
  if (!spellId) return "";
  return `https://render.albiononline.com/v1/spell/${spellId}.png`;
}

export const SPELLS_DATABASE = {
  // ARMAS
  weapons: {
    sword: {
      q: [
        { id: "HEROICSTRIKE", name: "Golpe Heroico (Q1)", icon: "HEROICSTRIKE" },
        { id: "HEROICCLEAVE", name: "Tajo Heroico (Q2)", icon: "HEROICCLEAVE" },
        { id: "INTERRUPTINGBLOW", name: "Tajo Espinoso (Q3)", icon: "INTERRUPTINGBLOW" }
      ],
      w: [
        { id: "INTERRUPT", name: "Interrupción (W1)", icon: "INTERRUPT" },
        { id: "IRONWILL", name: "Voluntad de Hierro (W2)", icon: "IRONWILL" },
        { id: "HAMSTRING", name: "Cortar Tendones (W3)", icon: "HAMSTRING" },
        { id: "SPLITTINGSLASH", name: "Tajo Divisorio (W4)", icon: "SPLITTINGSLASH" },
        { id: "PARRYINGSTRIKE", name: "Golpe de Parada (W5)", icon: "PARRYINGSTRIKE" }
      ],
      e: {
        MAIN_1H_SWORD: { id: "MIGHTYBLOW", name: "Golpe Poderoso", icon: "MIGHTYBLOW" },
        "2H_CLAYMORE": { id: "CHARGE", name: "Embestida", icon: "CHARGE" },
        "2H_DUALSWORD": { id: "SPINNINGBLADES", name: "Hojas Giratorias", icon: "SPINNINGBLADES" },
        MAIN_SCIMITAR_MORGANA: { id: "MORGANA_SLASH", name: "Furia Clarent", icon: "MORGANA_SLASH" },
        "2H_CLEAVER_HELL": { id: "FEARLESS_STRIKE", name: "Golpe Intrépido", icon: "FEARLESS_STRIKE" },
        "2H_DUALSCIMITAR_UNDEAD": { id: "SOUL_CARVER", name: "Corte de Almas", icon: "SOUL_CARVER" },
        "2H_CLAYMORE_AVALON": { id: "MAJESTIC_STRIKE", name: "Golpe Majestuoso", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_DEEPWOUNDS", name: "Cortes Profundos", icon: "PASSIVE_DEEPWOUNDS" },
        { id: "PASSIVE_LIFELEECH", name: "Sorbos de Vida", icon: "PASSIVE_LIFELEECH" },
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Defensa Reforzada", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    },

    axe: {
      q: [
        { id: "RENDINGSTRIKE", name: "Corte Desgarrador (Q1)", icon: "RENDINGSTRIKE" },
        { id: "RENDINGSPIN", name: "Giro Desgarrador (Q2)", icon: "RENDINGSPIN" },
        { id: "RENDINGBLEED", name: "Golpe Voraz (Q3)", icon: "RENDINGBLEED" }
      ],
      w: [
        { id: "HEAVYSMASH", name: "Golpe Pesado (W1)", icon: "HEAVYSMASH" },
        { id: "ADRENALINEBOOST", name: "Impulso de Adrenalina (W2)", icon: "ADRENALINEBOOST" },
        { id: "BATTLE_RUSH", name: "Carga de Batalla (W3)", icon: "BATTLE_RUSH" },
        { id: "RAZOR_CUT", name: "Corte Afilado (W4)", icon: "RAZOR_CUT" }
      ],
      e: {
        MAIN_AXE: { id: "THROWING_AXES", name: "Lanzamiento de Hachas", icon: "THROWING_AXES" },
        "2H_AXE": { id: "WHIRLWIND", name: "Torbellino", icon: "WHIRLWIND" },
        "2H_HALBERD": { id: "DEADLY_SWING", name: "Golpe Mortal", icon: "DEADLY_SWING" },
        "2H_HALBERD_MORGANA": { id: "MORGANA_CARRION", name: "Lanza Maldita", icon: "MORGANA_CARRION" },
        "2H_SCYTHE_HELL": { id: "HELL_SCYTHE", name: "Cosecha Sangrienta", icon: "HELL_SCYTHE" },
        "2H_AXE_AVALON": { id: "AVALON_EARTHSPLIT", name: "Fisura Terrenal", icon: "AVALON_EARTHSPLIT" }
      },
      passive: [
        { id: "PASSIVE_BLEED_AXE", name: "Heridas Abiertas", icon: "PASSIVE_BLEED_AXE" },
        { id: "PASSIVE_LIFELEECH_AXE", name: "Robo de Vida", icon: "PASSIVE_LIFELEECH" }
      ]
    },

    mace: {
      q: [
        { id: "DEFENSIVE_SLAM", name: "Golpe Defensivo (Q1)", icon: "DEFENSIVE_SLAM" },
        { id: "THREATENING_STRIKE", name: "Golpe Amenazante (Q2)", icon: "THREATENING_STRIKE" }
      ],
      w: [
        { id: "SNARE_CHARGE", name: "Carga Inmovilizadora (W1)", icon: "SNARE_CHARGE" },
        { id: "SILENCE_ROAR", name: "Rugido de Silencio (W2)", icon: "SILENCE_ROAR" },
        { id: "GUARD_PULL", name: "Atracción Defensiva (W3)", icon: "GUARD_PULL" }
      ],
      e: {
        MAIN_MACE: { id: "DEEP_LEAP", name: "Salto de Impacto", icon: "DEEP_LEAP" },
        "2H_HEAVY_MACE": { id: "BATTLE_DISRUPT", name: "Disrupción Silenciosa", icon: "BATTLE_DISRUPT" },
        "2H_MACE_MORGANA": { id: "CAMLANN_VORTEX", name: "Vórtice de Camlann", icon: "CAMLANN_VORTEX" },
        "2H_DUALMACE_AVALON": { id: "OATH_SHIELD", name: "Defensa Sagrada", icon: "OATH_SHIELD" }
      },
      passive: [
        { id: "PASSIVE_CC_DURATION", name: "Control Prolongado", icon: "PASSIVE_CC_DURATION" },
        { id: "PASSIVE_DEF_BOOST", name: "Baluarte", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    },

    hammer: {
      q: [
        { id: "HAMMER_SLAM", name: "Martillazo Devastador (Q1)", icon: "DEFENSIVE_SLAM" },
        { id: "HAMMER_SMASH", name: "Aplastamiento (Q2)", icon: "THREATENING_STRIKE" }
      ],
      w: [
        { id: "HAMMER_GEYSER", name: "Géiser de Tierra (W1)", icon: "SNARE_CHARGE" },
        { id: "HAMMER_SLOW", name: "Ralentización Pesada (W2)", icon: "HAMSTRING" }
      ],
      e: {
        MAIN_HAMMER: { id: "HAMMER_STUN", name: "Golpe Aturdidor", icon: "DEEP_LEAP" },
        "2H_HAMMER": { id: "GREAT_SLAM", name: "Embestida de Titán", icon: "CHARGE" },
        "2H_HAMMER_AVALON": { id: "HAND_JUSTICE", name: "Mano de la Justicia", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_HAMMER_STUN", name: "Fuerza Bruta", icon: "PASSIVE_CC_DURATION" }
      ]
    },

    crossbow: {
      q: [
        { id: "AUTO_FIRE", name: "Fuego Automático (Q1)", icon: "AUTO_FIRE" },
        { id: "EXPLOSIVE_BOLT", name: "Perno Explosivo (Q2)", icon: "EXPLOSIVE_BOLT" }
      ],
      w: [
        { id: "CALTROPS", name: "Abrojos (W1)", icon: "CALTROPS" },
        { id: "KNOCKBACK_SHOT", name: "Disparo de Retroceso (W2)", icon: "KNOCKBACK_SHOT" },
        { id: "SILENCE_SHOT", name: "Perno Silenciador (W3)", icon: "INTERRUPT" }
      ],
      e: {
        MAIN_1H_CROSSBOW: { id: "EXPLOSIVE_MINE", name: "Disparo Bomba", icon: "EXPLOSIVE_BOLT" },
        "2H_CROSSBOW": { id: "SNIPER_SHOT", name: "Tiro de Francotirador", icon: "CHARGE" },
        "2H_DUALCROSSBOW_HELL": { id: "BOLT_BARRAGE", name: "Lluvia de Pernos", icon: "AUTO_FIRE" },
        "2H_CROSSBOW_AVALON": { id: "ENERGY_BEAM", name: "Rayo de Energía", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_WELL_PREPARED", name: "Bien Preparado", icon: "PASSIVE_WELL_PREPARED" }
      ]
    },

    bow: {
      q: [
        { id: "POISON_ARROW", name: "Flecha Envenenada (Q1)", icon: "POISON_ARROW" },
        { id: "DEADLY_SHOT", name: "Disparo Certero (Q2)", icon: "DEADLY_SHOT" }
      ],
      w: [
        { id: "FROST_ARROW", name: "Flecha Helada (W1)", icon: "FROST_ARROW" },
        { id: "SPEED_SHOT", name: "Disparo Veloz (W2)", icon: "ADRENALINEBOOST" },
        { id: "RAY_OF_LIGHT", name: "Rayo de Luz (W3)", icon: "RAY_OF_LIGHT" }
      ],
      e: {
        "2H_BOW": { id: "ENCHANTED_QUIVER", name: "Carcaj Encantado", icon: "ENCHANTED_QUIVER" },
        "2H_WARBOW": { id: "MAGIC_ARROW", name: "Flecha Mágica", icon: "MAGIC_ARROW" },
        "2H_BOW_KEEPER": { id: "BADON_STORM", name: "Tormenta de Badon", icon: "BADON_STORM" }
      },
      passive: [
        { id: "PASSIVE_SLOW_BOW", name: "Flechas Ralentizadoras", icon: "PASSIVE_CC_DURATION" }
      ]
    },

    spear: {
      q: [
        { id: "SPEAR_LUNGE", name: "Estocada Espiritual (Q1)", icon: "HEROICSTRIKE" },
        { id: "SPEAR_IMPALE", name: "Empalar (Q2)", icon: "RENDINGSTRIKE" }
      ],
      w: [
        { id: "FOREST_OF_SPEARS", name: "Bosque de Lanzas (W1)", icon: "AUTO_FIRE" },
        { id: "SPEAR_DEFLECT", name: "Desvío Interior (W2)", icon: "PARRYINGSTRIKE" },
        { id: "CRIPPLING_STRIKE", name: "Golpe Tullidor (W3)", icon: "HAMSTRING" }
      ],
      e: {
        MAIN_SPEAR: { id: "RECKLESS_CHARGE", name: "Arremetida Temeraria", icon: "MIGHTYBLOW" },
        "2H_SPEAR": { id: "ROOTING_THRUST", name: "Estocada Inmovilizadora", icon: "CHARGE" },
        "2H_HARPOON_HELL": { id: "SPIRIT_HARPOON", name: "Cazaespíritus", icon: "FEARLESS_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_LIFE_SPEAR", name: "Sed de Combate", icon: "PASSIVE_LIFELEECH" }
      ]
    },

    dagger: {
      q: [
        { id: "ASSASSIN_SPIRIT", name: "Espíritu Asesino (Q1)", icon: "HEROICSTRIKE" },
        { id: "DEADLY_SWIPE", name: "Golpe Mortal (Q2)", icon: "RENDINGSPIN" }
      ],
      w: [
        { id: "SHADOW_EDGE", name: "Filo Sombrío (W1)", icon: "CHARGE" },
        { id: "FORBIDDEN_STAB", name: "Estocada Prohibida (W2)", icon: "INTERRUPT" },
        { id: "THROWING_BLADES", name: "Cuchillas Arrojadizas (W3)", icon: "CALTROPS" }
      ],
      e: {
        MAIN_DAGGER: { id: "BLOODTHIRSTY_STRIKE", name: "Sed Asesina", icon: "ADRENALINEBOOST" },
        MAIN_RAPIER_MORGANA: { id: "BLOODLETTER_LUNGE", name: "Corte Sangriento", icon: "FEARLESS_STRIKE" },
        "2H_DUALSICKLE_UNDEAD": { id: "DEATH_GIVER", name: "Muerte Silenciosa", icon: "SOUL_CARVER" }
      },
      passive: [
        { id: "PASSIVE_DAGGER_BLEED", name: "Veneno Profundo", icon: "PASSIVE_DEEPWOUNDS" }
      ]
    },

    quarterstaff: {
      q: [
        { id: "CONCUSSIVE_BLOW", name: "Golpe Contundente (Q1)", icon: "HEROICSTRIKE" },
        { id: "CARTWHEEL", name: "Rueda Ágil (Q2)", icon: "ADRENALINEBOOST" }
      ],
      w: [
        { id: "FORCEFUL_SWING", name: "Giro de Fuerza (W1)", icon: "KNOCKBACK_SHOT" },
        { id: "STUN_RUN", name: "Carrera Aturdidora (W2)", icon: "CHARGE" }
      ],
      e: {
        "2H_QUARTERSTAFF": { id: "VAULT_KICK", name: "Patada Voladora", icon: "DEEP_LEAP" },
        "2H_DOUBLEBLADEDSTAFF": { id: "OVERPOWER", name: "Arremetida Sobrecargada", icon: "FEARLESS_STRIKE" },
        "2H_QUARTERSTAFF_AVALON": { id: "GRAIL_WALL", name: "Muro del Grial", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_STUN_CHANCE", name: "Maestría en Bastón", icon: "PASSIVE_CC_DURATION" }
      ]
    },

    holy: {
      q: [
        { id: "GENEROUS_HEAL", name: "Curación Generosa (Q1)", icon: "GENEROUS_HEAL" },
        { id: "FLASH_HEAL", name: "Curación Fugaz (Q2)", icon: "FLASH_HEAL" }
      ],
      w: [
        { id: "HOLY_BEAM", name: "Rayo Sagrado (W1)", icon: "HOLY_BEAM" },
        { id: "HOLY_ORB", name: "Orbe Sagrado (W2)", icon: "HOLY_ORB" },
        { id: "SACRED_GROUND", name: "Suelo Sagrado (W3)", icon: "SACRED_GROUND" }
      ],
      e: {
        MAIN_HOLYSTAFF: { id: "DESPERATE_HEAL", name: "Curación Desesperada", icon: "GENEROUS_HEAL" },
        "2H_HOLYSTAFF_HELL": { id: "FALLEN_SANCTUARY", name: "Santuario Caído", icon: "SACRED_GROUND" },
        MAIN_HOLYSTAFF_AVALON: { id: "HALLOWFALL_LEAP", name: "Salto Santificado", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_HEAL_BOOST", name: "Luz Radiante", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    },

    nature: {
      q: [
        { id: "REJUVENATION", name: "Rejuvenecimiento (Q1)", icon: "REJUVENATION" },
        { id: "THORN_GROWTH", name: "Espinas Vivas (Q2)", icon: "THORN_GROWTH" }
      ],
      w: [
        { id: "REVITALIZE", name: "Revitalizar (W1)", icon: "REVITALIZE" },
        { id: "CLEANSE_HEAL", name: "Semilla Limpiadora (W2)", icon: "CLEANSE_HEAL" },
        { id: "BRAMBLE_THORN", name: "Zarza Espinosa (W3)", icon: "BRAMBLE_THORN" }
      ],
      e: {
        MAIN_NATURESTAFF: { id: "CIRCLE_OF_LIFE", name: "Círculo de Vida", icon: "CIRCLE_OF_LIFE" },
        "2H_NATURESTAFF_KEEPER": { id: "WILD_PATH", name: "Senda Silvestre", icon: "WILD_PATH" },
        "2H_NATURESTAFF_HELL": { id: "BLIGHT_CANAL", name: "Nube de Plaga", icon: "BLIGHT_CANAL" }
      },
      passive: [
        { id: "PASSIVE_NATURE_HEAL", name: "Poder Natural", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    },

    fire: {
      q: [
        { id: "FIREBOLT", name: "Saeta de Fuego (Q1)", icon: "FIREBOLT" },
        { id: "BURNING_FIELD", name: "Campo Llameante (Q2)", icon: "BURNING_FIELD" }
      ],
      w: [
        { id: "WALL_OF_FLAMES", name: "Muro de Llamas (W1)", icon: "WALL_OF_FLAMES" },
        { id: "FIRE_BALL", name: "Bola de Fuego (W2)", icon: "FIRE_BALL" }
      ],
      e: {
        MAIN_FIRESTAFF: { id: "PYROBLAST", name: "Piroexplosión", icon: "FIRE_BALL" },
        "2H_INFERNOSTAFF": { id: "CONFLAGRATION", name: "Conflagración", icon: "WALL_OF_FLAMES" },
        "2H_FIRE_RING_UNDEAD": { id: "BRIMSTONE_FALL", name: "Meteoro Brimstone", icon: "FIRE_BALL" }
      },
      passive: [
        { id: "PASSIVE_BURN", name: "Piromanía", icon: "PASSIVE_BURN" }
      ]
    },

    frost: {
      q: [
        { id: "FROST_BOLT", name: "Saeta de Hielo (Q1)", icon: "FROST_BOLT" },
        { id: "ICE_SHARDS", name: "Esquirlas de Hielo (Q2)", icon: "ICE_SHARDS" }
      ],
      w: [
        { id: "FROST_NOVA", name: "Nova de Escarcha (W1)", icon: "FROST_NOVA" },
        { id: "FROST_BEAM", name: "Rayo Congelante (W2)", icon: "FROST_BEAM" }
      ],
      e: {
        "2H_ICE_CRYSTAL_UNDEAD": { id: "PERMAFROST_PRISM", name: "Prisma Permafrost", icon: "PERMAFROST_PRISM" }
      },
      passive: [
        { id: "PASSIVE_FROST_FREEZE", name: "Congelación Profunda", icon: "PASSIVE_CC_DURATION" }
      ]
    },

    curse: {
      q: [
        { id: "VILE_CURSE", name: "Maldición Vil (Q1)", icon: "VILE_CURSE" },
        { id: "CURSED_SICKLE", name: "Hoz Maldita (Q2)", icon: "CURSED_SICKLE" }
      ],
      w: [
        { id: "ARMOR_PIERCER", name: "Perforador de Armadura (W1)", icon: "ARMOR_PIERCER" },
        { id: "DESECRATE", name: "Profanación (W2)", icon: "DESECRATE" }
      ],
      e: {
        MAIN_CURSEDSTAFF: { id: "DEATH_CURSE", name: "Maldición Mortal", icon: "DEATH_CURSE" },
        "2H_CURSEDSTAFF_MORGANA": { id: "DAMNATION_CATA", name: "Cataclismo Damnation", icon: "DESECRATE" },
        MAIN_CURSEDSTAFF_AVALON: { id: "SHADOWCALLER_SOUL", name: "Invocación Shadowcaller", icon: "DARK_MATTER" }
      },
      passive: [
        { id: "PASSIVE_CURSE_BANE", name: "Perdición", icon: "PASSIVE_DEEPWOUNDS" }
      ]
    },

    arcane: {
      q: [
        { id: "ARCANE_BOLT", name: "Saeta Arcana (Q1)", icon: "FIREBOLT" },
        { id: "ARCANE_PROTECTION", name: "Escudo Arcano (Q2)", icon: "SACRED_GROUND" }
      ],
      w: [
        { id: "ARCANE_CLEANSE", name: "Limpieza Arcana (W1)", icon: "CLEANSE_HEAL" },
        { id: "TIME_CORRIDOR", name: "Corredor Temporal (W2)", icon: "WILD_PATH" }
      ],
      e: {
        "2H_ARCANE_RING_AVALON": { id: "EVOKER_BEAM", name: "Haz del Evocador", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_ARCANE_HASTE", name: "Prontitud Arcana", icon: "PASSIVE_WELL_PREPARED" }
      ]
    },

    wargloves: {
      q: [
        { id: "DRAGON_LEAP", name: "Salto del Dragón (Q1)", icon: "HEROICSTRIKE" },
        { id: "COMBO_PUNCH", name: "Puñetazo Creador (Q2)", icon: "RENDINGSTRIKE" }
      ],
      w: [
        { id: "TRIPLE_KICK", name: "Patada Triple (W1)", icon: "CHARGE" },
        { id: "COUNTER_STANCE", name: "Guardia de Contraataque (W2)", icon: "PARRYINGSTRIKE" }
      ],
      e: {
        "2H_WARGLOVES_SPIKED": { id: "GRAVITATIONAL_PUNCH", name: "Impacto Gravitacional", icon: "MIGHTYBLOW" },
        "2H_WARGLOVES_AVALON": { id: "PURIFYING_FISTS", name: "Puños Purificadores", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_GLOVES_FLOW", name: "Flujo Marcial", icon: "PASSIVE_WELL_PREPARED" }
      ]
    },

    shapeshifter: {
      q: [
        { id: "SHAPE_Q1", name: "Pulso Humano (Q1)", icon: "FIREBOLT" }
      ],
      w: [
        { id: "SHAPE_W1", name: "Cambio de Fase (W1)", icon: "FROST_NOVA" }
      ],
      e: {
        "2H_SHAPESHIFTER_PANTHER": { id: "PANTHER_FORM", name: "Forma de Pantera", icon: "ADRENALINEBOOST" },
        "2H_SHAPESHIFTER_BEAR": { id: "BEAR_FORM", name: "Forma de Oso", icon: "DEEP_LEAP" },
        "2H_SHAPESHIFTER_TREANT": { id: "TREANT_FORM", name: "Forma de Treant", icon: "SACRED_GROUND" }
      },
      passive: [
        { id: "PASSIVE_SHAPE_SHIFT", name: "Afinidad Animal", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    }
  },

  // CABEZA (SLOT D)
  head: {
    plate_head: {
      active: [
        { id: "STONE_SKIN", name: "Piel de Piedra", icon: "STONE_SKIN" },
        { id: "CLEANSE_HEAD", name: "Bloqueo Defensivo", icon: "CLEANSE_HEAD" },
        { id: "ENERGY_SHIELD", name: "Escudo Protector", icon: "ENERGY_SHIELD" }
      ],
      passive: [
        { id: "PASSIVE_TOUGHNESS", name: "Dureza", icon: "PASSIVE_INCREASED_DEFENSE" },
        { id: "PASSIVE_TENACITY", name: "Tenacidad", icon: "PASSIVE_CC_DURATION" }
      ]
    },
    leather_head: {
      active: [
        { id: "CLEANSE", name: "Purga / Limpieza", icon: "CLEANSE" },
        { id: "RETALIATE", name: "Reflejo (Hunter Hood)", icon: "RETALIATE" },
        { id: "MEDITATION", name: "Meditación (Assassin Hood)", icon: "MEDITATION" },
        { id: "STALKER_REVEAL", name: "Aliento de Dragón (Stalker)", icon: "STALKER_REVEAL" }
      ],
      passive: [
        { id: "PASSIVE_BALANCED_MIND", name: "Mente Equilibrada", icon: "PASSIVE_WELL_PREPARED" },
        { id: "PASSIVE_SWIFTNESS", name: "Ligereza", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    },
    cloth_head: {
      active: [
        { id: "ENERGY_SHIELD_SCHOLAR", name: "Escudo de Energía (Scholar)", icon: "ENERGY_SHIELD" },
        { id: "ICE_BLOCK", name: "Bloque de Hielo (Cleric)", icon: "ICE_BLOCK" },
        { id: "POISON_HOOD", name: "Bofetada de Veneno (Mage)", icon: "POISON_ARROW" },
        { id: "MAGIC_CIRCLE", name: "Círculo Mágico (Royal)", icon: "SACRED_GROUND" }
      ],
      passive: [
        { id: "PASSIVE_AGGRESSION", name: "Agresión", icon: "PASSIVE_WELL_PREPARED" },
        { id: "PASSIVE_CASTING", name: "Concentración", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    }
  },

  // PECHO (SLOT R)
  armor: {
    plate_armor: {
      active: [
        { id: "FURY", name: "Furia (Soldier)", icon: "FURY" },
        { id: "WIND_WALL", name: "Muro de Viento (Knight)", icon: "WIND_WALL" },
        { id: "ENFEEBLE_AURA", name: "Aura Debilitante (Guardian)", icon: "ENFEEBLE_AURA" },
        { id: "DEMONIC_SHIELD", name: "Escudo Demoníaco (Demon)", icon: "RETALIATE" }
      ],
      passive: [
        { id: "PASSIVE_TOUGHNESS_CHEST", name: "Dureza Reforzada", icon: "PASSIVE_INCREASED_DEFENSE" },
        { id: "PASSIVE_THREAT", name: "Amenaza Aumentada", icon: "PASSIVE_CC_DURATION" }
      ]
    },
    leather_armor: {
      active: [
        { id: "BLOODLUST", name: "Sed de Sangre (Mercenary)", icon: "BLOODLUST" },
        { id: "HASTE_HUNTER", name: "Premura (Hunter)", icon: "ADRENALINEBOOST" },
        { id: "AMBUSH", name: "Emboscada (Assassin)", icon: "AMBUSH" },
        { id: "ELECTRIC_FIELD", name: "Campo Eléctrico (Stalker)", icon: "ELECTRIC_FIELD" },
        { id: "LIFE_DRAIN_AURA", name: "Aura Vampírica (Hellion)", icon: "LIFE_DRAIN_AURA" }
      ],
      passive: [
        { id: "PASSIVE_BALANCED_BODY", name: "Mente y Cuerpo", icon: "PASSIVE_WELL_PREPARED" },
        { id: "PASSIVE_SWIFT_REFLEX", name: "Reflejos Rápidos", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    },
    cloth_armor: {
      active: [
        { id: "SPEED_CASTER", name: "Celeridad de Hechizo (Scholar)", icon: "SPEED_CASTER" },
        { id: "EVERLASTING_SPIRIT", name: "Espíritu Inmortal (Cleric)", icon: "EVERLASTING_SPIRIT" },
        { id: "PURGE_SHIELD", name: "Escudo Purificador (Mage)", icon: "PURGE_SHIELD" },
        { id: "ROYAL_BANNER", name: "Estandarte Real (Royal)", icon: "SACRED_GROUND" }
      ],
      passive: [
        { id: "PASSIVE_AGRESSIVE_CASTER", name: "Poder Arcano Máximo", icon: "PASSIVE_WELL_PREPARED" },
        { id: "PASSIVE_CONCENTRATION_CHEST", name: "Concentración", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    }
  },

  // BOTAS (SLOT F)
  shoes: {
    plate_shoes: {
      active: [
        { id: "WANDERLUST", name: "Ansia de Viajar (Soldier)", icon: "WANDERLUST" },
        { id: "SHIELD_CHARGE", name: "Carga Protectora (Knight)", icon: "SHIELD_CHARGE" },
        { id: "GIANT_STEPS", name: "Pies de Gigante (Guardian)", icon: "GIANT_STEPS" },
        { id: "RUN_GENERIC", name: "Carrera Estándar", icon: "RUN_GENERIC" }
      ],
      passive: [
        { id: "PASSIVE_TOUGH_FEET", name: "Paso Firme", icon: "PASSIVE_INCREASED_DEFENSE" },
        { id: "PASSIVE_TENACIOUS_FEET", name: "Tenacidad", icon: "PASSIVE_CC_DURATION" }
      ]
    },
    leather_shoes: {
      active: [
        { id: "REFRESHING_SPRINT", name: "Sprint Refrescante (Hunter)", icon: "REFRESHING_SPRINT" },
        { id: "DODGE", name: "Evasión (Assassin)", icon: "DODGE" },
        { id: "RUN_GENERIC", name: "Carrera Estándar", icon: "RUN_GENERIC" }
      ],
      passive: [
        { id: "PASSIVE_BALANCED_FEET", name: "Mente Equilibrada", icon: "PASSIVE_WELL_PREPARED" },
        { id: "PASSIVE_SPEED_FEET", name: "Paso Ligero", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    },
    cloth_shoes: {
      active: [
        { id: "FOCUSED_RUN", name: "Carrera Concentrada (Scholar)", icon: "FOCUSED_RUN" },
        { id: "BLINK", name: "Teletransporte / Blink (Cleric)", icon: "BLINK" },
        { id: "DELAYED_TELEPORT", name: "Carrera Retardada (Mage)", icon: "DELAYED_TELEPORT" },
        { id: "RUN_GENERIC", name: "Carrera Estándar", icon: "RUN_GENERIC" }
      ],
      passive: [
        { id: "PASSIVE_AGGRESSION_FEET", name: "Agresión", icon: "PASSIVE_WELL_PREPARED" },
        { id: "PASSIVE_CAST_FEET", name: "Concentración", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    }
  }
};
