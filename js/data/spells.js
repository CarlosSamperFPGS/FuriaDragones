// Catálogo de habilidades (Spells) de Albion Online con IDs de iconos verificados

export function getAlbionSpellIconUrl(spellId) {
  if (!spellId) return "";
  return `https://render.albiononline.com/v1/spell/${spellId}.png`;
}

export const SPELLS_DATABASE = {
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
        MAIN_SWORD: { id: "MIGHTYBLOW", name: "Golpe Poderoso", icon: "MIGHTYBLOW" },
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
        { id: "DEFENSIVESLAM", name: "Golpe Defensivo (Q1)", icon: "DEFENSIVESLAM" },
        { id: "THREATENINGSTRIKE", name: "Golpe Amenazante (Q2)", icon: "THREATENINGSTRIKE" }
      ],
      w: [
        { id: "SNARECHARGE", name: "Carga Inmovilizadora (W1)", icon: "SNARECHARGE" },
        { id: "SILENCEROAR", name: "Rugido de Silencio (W2)", icon: "SILENCEROAR" }
      ],
      e: {
        MAIN_MACE: { id: "DEEPLEAP", name: "Salto de Impacto", icon: "DEEPLEAP" },
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
        { id: "DEFENSIVESLAM", name: "Martillazo Devastador (Q1)", icon: "DEFENSIVESLAM" },
        { id: "THREATENINGSTRIKE", name: "Aplastamiento (Q2)", icon: "THREATENINGSTRIKE" }
      ],
      w: [
        { id: "SNARECHARGE", name: "Géiser de Tierra (W1)", icon: "SNARECHARGE" },
        { id: "HAMSTRING", name: "Ralentización Pesada (W2)", icon: "HAMSTRING" }
      ],
      e: {
        MAIN_HAMMER: { id: "DEEPLEAP", name: "Golpe Aturdidor", icon: "DEEPLEAP" },
        "2H_HAMMER": { id: "GREAT_SLAM", name: "Embestida de Titán", icon: "CHARGE" },
        "2H_POLEHAMMER": { id: "POLE_SLAM", name: "Golpe de Maza", icon: "MIGHTYBLOW" },
        "2H_HAMMER_AVALON": { id: "HAND_JUSTICE", name: "Mano de la Justicia", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_HAMMER_STUN", name: "Fuerza Bruta", icon: "PASSIVE_CC_DURATION" }
      ]
    },

    crossbow: {
      q: [
        { id: "AUTOFIRE", name: "Fuego Automático (Q1)", icon: "AUTOFIRE" },
        { id: "EXPLOSIVEBOLT", name: "Perno Explosivo (Q2)", icon: "EXPLOSIVEBOLT" }
      ],
      w: [
        { id: "CALTROPS", name: "Abrojos (W1)", icon: "CALTROPS" },
        { id: "KNOCKBACKSHOT", name: "Disparo de Retroceso (W2)", icon: "KNOCKBACKSHOT" },
        { id: "INTERRUPT", name: "Perno Silenciador (W3)", icon: "INTERRUPT" }
      ],
      e: {
        MAIN_1HCROSSBOW: { id: "EXPLOSIVEBOLT", name: "Disparo Bomba", icon: "EXPLOSIVEBOLT" },
        "2H_CROSSBOW": { id: "CHARGE", name: "Tiro de Francotirador", icon: "CHARGE" },
        "2H_CROSSBOWLARGE": { id: "SWEEPING_BOLT", name: "Disparo de Asedio", icon: "AUTOFIRE" },
        "2H_DUALCROSSBOW_HELL": { id: "AUTOFIRE", name: "Lluvia de Pernos", icon: "AUTOFIRE" },
        "2H_REPEATINGCROSSBOW_UNDEAD": { id: "WEEPING_BOLT", name: "Mina de Llanto", icon: "EXPLOSIVEBOLT" },
        "2H_CROSSBOW_CANNON_AVALON": { id: "MAJESTIC_STRIKE", name: "Rayo de Energía", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_WELL_PREPARED", name: "Bien Preparado", icon: "PASSIVE_WELL_PREPARED" }
      ]
    },

    bow: {
      q: [
        { id: "POISONARROW", name: "Flecha Envenenada (Q1)", icon: "POISONARROW" },
        { id: "DEADLYSHOT", name: "Disparo Certero (Q2)", icon: "DEADLYSHOT" }
      ],
      w: [
        { id: "FROSTARROW", name: "Flecha Helada (W1)", icon: "FROSTARROW" },
        { id: "SPEEDSHOT", name: "Disparo Veloz (W2)", icon: "SPEEDSHOT" },
        { id: "RAY_OF_LIGHT", name: "Rayo de Luz (W3)", icon: "RAY_OF_LIGHT" }
      ],
      e: {
        "2H_BOW": { id: "ENCHANTEDQUIVER", name: "Carcaj Encantado", icon: "ENCHANTEDQUIVER" },
        "2H_WARBOW": { id: "MAGICARROW", name: "Flecha Mágica", icon: "MAGICARROW" },
        "2H_LONGBOW": { id: "RAIN_OF_ARROWS", name: "Lluvia de Flechas", icon: "AUTOFIRE" },
        "2H_BOW_KEEPER": { id: "BADON_STORM", name: "Tormenta de Badon", icon: "BADON_STORM" }
      },
      passive: [
        { id: "PASSIVE_SLOW_BOW", name: "Flechas Ralentizadoras", icon: "PASSIVE_CC_DURATION" }
      ]
    },

    spear: {
      q: [
        { id: "SPEARLUNGE", name: "Estocada Espiritual (Q1)", icon: "SPEARLUNGE" },
        { id: "IMPALE", name: "Empalar (Q2)", icon: "IMPALE" }
      ],
      w: [
        { id: "FORESTSPEARS", name: "Bosque de Lanzas (W1)", icon: "FORESTSPEARS" },
        { id: "PARRYINGSTRIKE", name: "Desvío Interior (W2)", icon: "PARRYINGSTRIKE" },
        { id: "HAMSTRING", name: "Golpe Tullidor (W3)", icon: "HAMSTRING" }
      ],
      e: {
        MAIN_SPEAR: { id: "RECKLESSCHARGE", name: "Arremetida Temeraria", icon: "RECKLESSCHARGE" },
        "2H_SPEAR": { id: "CHARGE", name: "Estocada Inmovilizadora", icon: "CHARGE" },
        "2H_GLAIVE": { id: "FLING", name: "Lanzamiento por el Aire", icon: "MIGHTYBLOW" },
        "2H_HARPOON_HELL": { id: "FEARLESS_STRIKE", name: "Cazaespíritus", icon: "FEARLESS_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_LIFELEECH", name: "Sed de Combate", icon: "PASSIVE_LIFELEECH" }
      ]
    },

    dagger: {
      q: [
        { id: "ASSASSINSPIRIT", name: "Espíritu Asesino (Q1)", icon: "ASSASSINSPIRIT" },
        { id: "DEADLYSWIPE", name: "Golpe Mortal (Q2)", icon: "DEADLYSWIPE" }
      ],
      w: [
        { id: "SHADOWEDGE", name: "Filo Sombrío (W1)", icon: "SHADOWEDGE" },
        { id: "INTERRUPT", name: "Estocada Prohibida (W2)", icon: "INTERRUPT" },
        { id: "CALTROPS", name: "Cuchillas Arrojadizas (W3)", icon: "CALTROPS" }
      ],
      e: {
        MAIN_DAGGER: { id: "BLOODLUST", name: "Sed Asesina", icon: "BLOODLUST" },
        "2H_DAGGERPAIR": { id: "SLIT_THROAT", name: "Cortar Cuello", icon: "MIGHTYBLOW" },
        "2H_CLAWPAIR": { id: "DISEMBOWEL", name: "Destripar", icon: "DEADLYSWIPE" },
        MAIN_RAPIER_MORGANA: { id: "FEARLESS_STRIKE", name: "Corte Sangriento (Bloodletter)", icon: "FEARLESS_STRIKE" },
        "2H_DUALDAGGER_UNDEAD": { id: "SOUL_CARVER", name: "Muerte Silenciosa (Deathgivers)", icon: "SOUL_CARVER" }
      },
      passive: [
        { id: "PASSIVE_DEEPWOUNDS", name: "Veneno Profundo", icon: "PASSIVE_DEEPWOUNDS" }
      ]
    },

    quarterstaff: {
      q: [
        { id: "CONCUSSIVEBLOW", name: "Golpe Contundente (Q1)", icon: "CONCUSSIVEBLOW" },
        { id: "ADRENALINEBOOST", name: "Rueda Ágil (Q2)", icon: "ADRENALINEBOOST" }
      ],
      w: [
        { id: "KNOCKBACKSHOT", name: "Giro de Fuerza (W1)", icon: "KNOCKBACKSHOT" },
        { id: "CHARGE", name: "Carrera Aturdidora (W2)", icon: "CHARGE" }
      ],
      e: {
        "2H_QUARTERSTAFF": { id: "DEEPLEAP", name: "Patada Voladora", icon: "DEEPLEAP" },
        "2H_IRONCLADEDSTAFF": { id: "HURRICANE", name: "Huracán", icon: "WHIRLWIND" },
        "2H_DOUBLEBLADEDSTAFF": { id: "FEARLESS_STRIKE", name: "Arremetida Sobrecargada", icon: "FEARLESS_STRIKE" },
        "2H_COMBATSTAFF_MORGANA": { id: "SOUL_CARVER", name: "Golpe de Monje Negro", icon: "SOUL_CARVER" },
        "2H_QUARTERSTAFF_AVALON": { id: "MAJESTIC_STRIKE", name: "Muro del Grial", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_CC_DURATION", name: "Maestría en Bastón", icon: "PASSIVE_CC_DURATION" }
      ]
    },

    holy: {
      q: [
        { id: "GENEROUSHEAL", name: "Curación Generosa (Q1)", icon: "GENEROUSHEAL" },
        { id: "FLASHHEAL", name: "Curación Fugaz (Q2)", icon: "FLASHHEAL" }
      ],
      w: [
        { id: "HOLYBEAM", name: "Rayo Sagrado (W1)", icon: "HOLYBEAM" },
        { id: "HOLYORB", name: "Orbe Sagrado (W2)", icon: "HOLYORB" },
        { id: "SACREDGROUND", name: "Suelo Sagrado (W3)", icon: "SACREDGROUND" }
      ],
      e: {
        MAIN_HOLYSTAFF: { id: "GENEROUSHEAL", name: "Curación Desesperada", icon: "GENEROUSHEAL" },
        "2H_HOLYSTAFF": { id: "HOLY_EXPLOSION", name: "Explosión Sagrada", icon: "SACREDGROUND" },
        "2H_DIVINESTAFF": { id: "DIVINE_PROTECTION", name: "Protección Divina", icon: "ENERGYSHIELD" },
        "2H_HOLYSTAFF_HELL": { id: "SACREDGROUND", name: "Santuario Caído", icon: "SACREDGROUND" },
        MAIN_HOLYSTAFF_AVALON: { id: "MAJESTIC_STRIKE", name: "Salto Santificado (Hallowfall)", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Luz Radiante", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    },

    nature: {
      q: [
        { id: "REJUVENATION", name: "Rejuvenecimiento (Q1)", icon: "REJUVENATION" },
        { id: "THORNGROWTH", name: "Espinas Vivas (Q2)", icon: "THORNGROWTH" }
      ],
      w: [
        { id: "REVITALIZE", name: "Revitalizar (W1)", icon: "REVITALIZE" },
        { id: "CLEANSE", name: "Semilla Limpiadora (W2)", icon: "CLEANSE" }
      ],
      e: {
        MAIN_NATURESTAFF: { id: "CIRCLEOFLIFE", name: "Círculo de Vida", icon: "CIRCLEOFLIFE" },
        "2H_NATURESTAFF": { id: "LIVING_ARMOR", name: "Armadura Viva", icon: "STONESKIN" },
        "2H_WILDSTAFF": { id: "WILD_PATH", name: "Senda Silvestre", icon: "CIRCLEOFLIFE" },
        "2H_NATURESTAFF_KEEPER": { id: "DRUIDIC_HEAL", name: "Espíritu de la Naturaleza", icon: "REJUVENATION" },
        "2H_NATURESTAFF_HELL": { id: "CIRCLEOFLIFE", name: "Nube de Plaga (Blight)", icon: "CIRCLEOFLIFE" }
      },
      passive: [
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Poder Natural", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    },

    fire: {
      q: [
        { id: "FIREBOLT", name: "Saeta de Fuego (Q1)", icon: "FIREBOLT" },
        { id: "BURNINGFIELD", name: "Campo Llameante (Q2)", icon: "BURNINGFIELD" }
      ],
      w: [
        { id: "WALLOFFLAMES", name: "Muro de Llamas (W1)", icon: "WALLOFFLAMES" },
        { id: "FIREBALL", name: "Bola de Fuego (W2)", icon: "FIREBALL" }
      ],
      e: {
        MAIN_FIRESTAFF: { id: "PYROBLAST", name: "Piroexplosión", icon: "PYROBLAST" },
        "2H_FIRESTAFF": { id: "FIREBALL", name: "Pilar de Fuego", icon: "FIREBALL" },
        "2H_INFERNOSTAFF": { id: "WALLOFFLAMES", name: "Conflagración", icon: "WALLOFFLAMES" },
        MAIN_FIRESTAFF_KEEPER: { id: "FIREBALL", name: "Fuego Fatuo (Magma Sphere)", icon: "FIREBALL" },
        "2H_FIRESTAFF_HELL": { id: "FIREBALL", name: "Meteoro Brimstone", icon: "FIREBALL" },
        "2H_FIRE_RINGPAIR_AVALON": { id: "PYROBLAST", name: "Canción del Ocaso", icon: "PYROBLAST" }
      },
      passive: [
        { id: "PASSIVE_WELL_PREPARED", name: "Furia Ígnea", icon: "PASSIVE_WELL_PREPARED" }
      ]
    },

    frost: {
      q: [
        { id: "FROSTBOLT", name: "Saeta de Hielo (Q1)", icon: "FROSTBOLT" },
        { id: "ICESHARDS", name: "Esquirlas de Hielo (Q2)", icon: "ICESHARDS" }
      ],
      w: [
        { id: "FROSTNOVA", name: "Nova de Escarcha (W1)", icon: "FROSTNOVA" },
        { id: "FROSTBEAM", name: "Rayo Congelante (W2)", icon: "FROSTBEAM" }
      ],
      e: {
        MAIN_FROSTSTAFF: { id: "FROSTNOVA", name: "Nova Libre", icon: "FROSTNOVA" },
        "2H_FROSTSTAFF": { id: "FROSTBEAM", name: "Ventisca Helada", icon: "FROSTBEAM" },
        "2H_GLACIALSTAFF": { id: "ICESHARDS", name: "Pilar Glacial", icon: "ICESHARDS" },
        MAIN_FROSTSTAFF_KEEPER: { id: "FROSTNOVA", name: "Orbe de Escarcha", icon: "FROSTNOVA" },
        MAIN_FROSTSTAFF_AVALON: { id: "FROSTNOVA", name: "Prisma Permafrost", icon: "FROSTNOVA" }
      },
      passive: [
        { id: "PASSIVE_CC_DURATION", name: "Congelación Profunda", icon: "PASSIVE_CC_DURATION" }
      ]
    },

    curse: {
      q: [
        { id: "VILECURSE", name: "Maldición Vil (Q1)", icon: "VILECURSE" },
        { id: "CURSEDSICKLE", name: "Hoz Maldita (Q2)", icon: "CURSEDSICKLE" }
      ],
      w: [
        { id: "ARMORPIERCER", name: "Perforador de Armadura (W1)", icon: "ARMORPIERCER" },
        { id: "DESECRATE", name: "Profanación (W2)", icon: "DESECRATE" }
      ],
      e: {
        MAIN_CURSEDSTAFF: { id: "DEATHCURSE", name: "Maldición Mortal", icon: "DEATHCURSE" },
        "2H_CURSEDSTAFF": { id: "DESECRATE", name: "Área de Maldición", icon: "DESECRATE" },
        "2H_DEMONICSTAFF": { id: "ARMORPIERCER", name: "Rayo Demoníaco", icon: "ARMORPIERCER" },
        MAIN_CURSEDSTAFF_UNDEAD: { id: "DEATHCURSE", name: "Calavera Maldita", icon: "DEATHCURSE" },
        "2H_CURSEDSTAFF_MORGANA": { id: "DESECRATE", name: "Cataclismo Damnation", icon: "DESECRATE" },
        MAIN_CURSEDSTAFF_AVALON: { id: "DEATHCURSE", name: "Invocación Shadowcaller", icon: "DEATHCURSE" }
      },
      passive: [
        { id: "PASSIVE_DEEPWOUNDS", name: "Perdición", icon: "PASSIVE_DEEPWOUNDS" }
      ]
    },

    arcane: {
      q: [
        { id: "FIREBOLT", name: "Saeta Arcana (Q1)", icon: "FIREBOLT" },
        { id: "ENERGYSHIELD", name: "Escudo Arcano (Q2)", icon: "ENERGYSHIELD" }
      ],
      w: [
        { id: "CLEANSE", name: "Limpieza Arcana (W1)", icon: "CLEANSE" }
      ],
      e: {
        MAIN_ARCANESTAFF: { id: "ENERGYSHIELD", name: "Escudo Protector", icon: "ENERGYSHIELD" },
        "2H_ARCANESTAFF": { id: "IMMORTAL", name: "Tiempo Congelado", icon: "IMMORTAL" },
        "2H_ENIGMATICSTAFF": { id: "ENERGYSHIELD", name: "Canalización de Escudo", icon: "ENERGYSHIELD" },
        "2H_ARCANE_RINGPAIR_AVALON": { id: "MAJESTIC_STRIKE", name: "Haz del Evocador", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_WELL_PREPARED", name: "Prontitud Arcana", icon: "PASSIVE_WELL_PREPARED" }
      ]
    },

    wargloves: {
      q: [
        { id: "HEROICSTRIKE", name: "Salto del Dragón (Q1)", icon: "HEROICSTRIKE" },
        { id: "RENDINGSTRIKE", name: "Puñetazo Creador (Q2)", icon: "RENDINGSTRIKE" }
      ],
      w: [
        { id: "CHARGE", name: "Patada Triple (W1)", icon: "CHARGE" },
        { id: "PARRYINGSTRIKE", name: "Guardia de Contraataque (W2)", icon: "PARRYINGSTRIKE" }
      ],
      e: {
        "2H_KNUCKLES_SET1": { id: "MIGHTYBLOW", name: "Golpe de Pelea", icon: "MIGHTYBLOW" },
        "2H_WARGLOVES_KEEPER": { id: "CHARGE", name: "Salto de Batalla", icon: "CHARGE" },
        "2H_KNUCKLES_SET3": { id: "MIGHTYBLOW", name: "Impacto Gravitacional (Spiked)", icon: "MIGHTYBLOW" },
        "2H_KNUCKLES_SET2": { id: "RENDINGSPIN", name: "Desgarro de Ursino", icon: "RENDINGSPIN" },
        "2H_KNUCKLES_HELL": { id: "FIREBALL", name: "Manos Infernales", icon: "FIREBALL" },
        "2H_KNUCKLES_UNDEAD": { id: "MAJESTIC_STRIKE", name: "Golpe Ravenstrike", icon: "MAJESTIC_STRIKE" },
        "2H_KNUCKLES_AVALON": { id: "MAJESTIC_STRIKE", name: "Puños Purificadores", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_WELL_PREPARED", name: "Flujo Marcial", icon: "PASSIVE_WELL_PREPARED" }
      ]
    },

    shapeshifter: {
      q: [
        { id: "FIREBOLT", name: "Pulso Humano (Q1)", icon: "FIREBOLT" }
      ],
      w: [
        { id: "FROSTNOVA", name: "Cambio de Fase (W1)", icon: "FROSTNOVA" }
      ],
      e: {
        "2H_SHAPESHIFTER_SET1": { id: "ADRENALINEBOOST", name: "Forma de Pantera", icon: "ADRENALINEBOOST" },
        "2H_SHAPESHIFTER_SET2": { id: "SACREDGROUND", name: "Forma de Treant", icon: "SACREDGROUND" },
        "2H_SHAPESHIFTER_SET3": { id: "DEEPLEAP", name: "Forma de Oso", icon: "DEEPLEAP" },
        "2H_SHAPESHIFTER_MORGANA": { id: "BLOODLUST", name: "Forma de Hombre Lobo", icon: "BLOODLUST" },
        "2H_SHAPESHIFTER_HELL": { id: "STONESKIN", name: "Forma de Golem Infernal", icon: "STONESKIN" },
        "2H_SHAPESHIFTER_KEEPER": { id: "REJUVENATION", name: "Forma de Ent", icon: "REJUVENATION" },
        "2H_SHAPESHIFTER_AVALON": { id: "MAJESTIC_STRIKE", name: "Forma de Luz Áurica", icon: "MAJESTIC_STRIKE" }
      },
      passive: [
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Afinidad Animal", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    }
  },

  head: {
    plate_head: {
      active: [
        { id: "STONESKIN", name: "Piel de Piedra", icon: "STONESKIN" },
        { id: "CLEANSE", name: "Bloqueo Defensivo", icon: "CLEANSE" },
        { id: "ENERGYSHIELD", name: "Escudo Protector", icon: "ENERGYSHIELD" }
      ],
      passive: [
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Dureza", icon: "PASSIVE_INCREASED_DEFENSE" },
        { id: "PASSIVE_CC_DURATION", name: "Tenacidad", icon: "PASSIVE_CC_DURATION" }
      ]
    },
    leather_head: {
      active: [
        { id: "CLEANSE", name: "Purga / Limpieza", icon: "CLEANSE" },
        { id: "RETALIATE", name: "Reflejo (Hunter Hood)", icon: "RETALIATE" },
        { id: "MEDITATION", name: "Meditación (Assassin Hood)", icon: "MEDITATION" }
      ],
      passive: [
        { id: "PASSIVE_WELL_PREPARED", name: "Mente Equilibrada", icon: "PASSIVE_WELL_PREPARED" },
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Ligereza", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    },
    cloth_head: {
      active: [
        { id: "ENERGYSHIELD", name: "Escudo de Energía (Scholar)", icon: "ENERGYSHIELD" },
        { id: "ICEBLOCK", name: "Bloque de Hielo (Cleric)", icon: "ICEBLOCK" },
        { id: "POISONARROW", name: "Bofetada de Veneno (Mage)", icon: "POISONARROW" },
        { id: "SACREDGROUND", name: "Círculo Mágico (Royal)", icon: "SACREDGROUND" }
      ],
      passive: [
        { id: "PASSIVE_WELL_PREPARED", name: "Agresión", icon: "PASSIVE_WELL_PREPARED" },
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Concentración", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    }
  },

  armor: {
    plate_armor: {
      active: [
        { id: "FURY", name: "Furia (Soldier)", icon: "FURY" },
        { id: "WINDWALL", name: "Muro de Viento (Knight)", icon: "WINDWALL" },
        { id: "ENFEEBLEAURA", name: "Aura Debilitante (Guardian)", icon: "ENFEEBLEAURA" },
        { id: "RETALIATE", name: "Escudo Demoníaco (Demon)", icon: "RETALIATE" }
      ],
      passive: [
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Dureza Reforzada", icon: "PASSIVE_INCREASED_DEFENSE" },
        { id: "PASSIVE_CC_DURATION", name: "Amenaza Aumentada", icon: "PASSIVE_CC_DURATION" }
      ]
    },
    leather_armor: {
      active: [
        { id: "BLOODLUST", name: "Sed de Sangre (Mercenary)", icon: "BLOODLUST" },
        { id: "HASTE", name: "Premura (Hunter)", icon: "HASTE" },
        { id: "AMBUSH", name: "Emboscada (Assassin)", icon: "AMBUSH" },
        { id: "ELECTRICFIELD", name: "Campo Eléctrico (Stalker)", icon: "ELECTRICFIELD" },
        { id: "LIFEDRAINAURA", name: "Aura Vampírica (Hellion)", icon: "LIFEDRAINAURA" }
      ],
      passive: [
        { id: "PASSIVE_WELL_PREPARED", name: "Mente y Cuerpo", icon: "PASSIVE_WELL_PREPARED" },
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Reflejos Rápidos", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    },
    cloth_armor: {
      active: [
        { id: "SPEEDCASTER", name: "Celeridad de Hechizo (Scholar)", icon: "SPEEDCASTER" },
        { id: "IMMORTAL", name: "Espíritu Inmortal (Cleric)", icon: "IMMORTAL" },
        { id: "PURGESHIELD", name: "Escudo Purificador (Mage)", icon: "PURGESHIELD" },
        { id: "SACREDGROUND", name: "Estandarte Real (Royal)", icon: "SACREDGROUND" }
      ],
      passive: [
        { id: "PASSIVE_WELL_PREPARED", name: "Poder Arcano Máximo", icon: "PASSIVE_WELL_PREPARED" },
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Concentración", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    }
  },

  shoes: {
    plate_shoes: {
      active: [
        { id: "WANDERLUST", name: "Ansia de Viajar (Soldier)", icon: "WANDERLUST" },
        { id: "SHIELDCHARGE", name: "Carga Protectora (Knight)", icon: "SHIELDCHARGE" },
        { id: "GIANTSTEPS", name: "Pies de Gigante (Guardian)", icon: "GIANTSTEPS" },
        { id: "SPRINT", name: "Carrera Estándar", icon: "SPRINT" }
      ],
      passive: [
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Paso Firme", icon: "PASSIVE_INCREASED_DEFENSE" },
        { id: "PASSIVE_CC_DURATION", name: "Tenacidad", icon: "PASSIVE_CC_DURATION" }
      ]
    },
    leather_shoes: {
      active: [
        { id: "REFRESHINGSPRINT", name: "Sprint Refrescante (Hunter)", icon: "REFRESHINGSPRINT" },
        { id: "DODGE", name: "Evasión (Assassin)", icon: "DODGE" },
        { id: "SPRINT", name: "Carrera Estándar", icon: "SPRINT" }
      ],
      passive: [
        { id: "PASSIVE_WELL_PREPARED", name: "Mente Equilibrada", icon: "PASSIVE_WELL_PREPARED" },
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Paso Ligero", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    },
    cloth_shoes: {
      active: [
        { id: "FOCUSEDRUN", name: "Carrera Concentrada (Scholar)", icon: "FOCUSEDRUN" },
        { id: "BLINK", name: "Teletransporte / Blink (Cleric)", icon: "BLINK" },
        { id: "DELAYEDTELEPORT", name: "Carrera Retardada (Mage)", icon: "DELAYEDTELEPORT" },
        { id: "SPRINT", name: "Carrera Estándar", icon: "SPRINT" }
      ],
      passive: [
        { id: "PASSIVE_WELL_PREPARED", name: "Agresión", icon: "PASSIVE_WELL_PREPARED" },
        { id: "PASSIVE_INCREASED_DEFENSE", name: "Concentración", icon: "PASSIVE_INCREASED_DEFENSE" }
      ]
    }
  }
};
