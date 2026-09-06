// Base de datos simplificada de items de Albion Online (sin descripciones)

export const ITEMS_DATABASE = {
  weapons: [
    // ESPADAS
    { id: "MAIN_1H_SWORD", name: "Espada Ancha", category: "Espadas", slot: "mainhand", twoHanded: false, spellTree: "sword", uniqueName: "MAIN_1H_SWORD" },
    { id: "2H_CLAYMORE", name: "Espada Larga (Claymore)", category: "Espadas", slot: "mainhand", twoHanded: true, spellTree: "sword", uniqueName: "2H_CLAYMORE" },
    { id: "2H_DUALSWORD", name: "Espadas Dobles", category: "Espadas", slot: "mainhand", twoHanded: true, spellTree: "sword", uniqueName: "2H_DUALSWORD" },
    { id: "MAIN_SCIMITAR_MORGANA", name: "Espada Clarent", category: "Espadas", slot: "mainhand", twoHanded: false, spellTree: "sword", uniqueName: "MAIN_SCIMITAR_MORGANA" },
    { id: "2H_CLEAVER_HELL", name: "Espada Tallada (Carving)", category: "Espadas", slot: "mainhand", twoHanded: true, spellTree: "sword", uniqueName: "2H_CLEAVER_HELL" },
    { id: "2H_DUALSCIMITAR_UNDEAD", name: "Par de Galatinas", category: "Espadas", slot: "mainhand", twoHanded: true, spellTree: "sword", uniqueName: "2H_DUALSCIMITAR_UNDEAD" },
    { id: "2H_CLAYMORE_AVALON", name: "Creador de Reyes (Kingmaker)", category: "Espadas", slot: "mainhand", twoHanded: true, spellTree: "sword", uniqueName: "2H_CLAYMORE_AVALON" },

    // HACHAS
    { id: "MAIN_AXE", name: "Hacha de Batalla", category: "Hachas", slot: "mainhand", twoHanded: false, spellTree: "axe", uniqueName: "MAIN_AXE" },
    { id: "2H_AXE", name: "Gran Hacha", category: "Hachas", slot: "mainhand", twoHanded: true, spellTree: "axe", uniqueName: "2H_AXE" },
    { id: "2H_HALBERD", name: "Alabarda", category: "Hachas", slot: "mainhand", twoHanded: true, spellTree: "axe", uniqueName: "2H_HALBERD" },
    { id: "2H_HALBERD_MORGANA", name: "Segador de Almas (Carrioncaller)", category: "Hachas", slot: "mainhand", twoHanded: true, spellTree: "axe", uniqueName: "2H_HALBERD_MORGANA" },
    { id: "2H_SCYTHE_HELL", name: "Guadaña Infernal", category: "Hachas", slot: "mainhand", twoHanded: true, spellTree: "axe", uniqueName: "2H_SCYTHE_HELL" },
    { id: "2H_AXE_AVALON", name: "Rompe-reinos (Realmbreaker)", category: "Hachas", slot: "mainhand", twoHanded: true, spellTree: "axe", uniqueName: "2H_AXE_AVALON" },

    // MAZAS Y MARTILLOS
    { id: "MAIN_MACE", name: "Maza de 1 Mano", category: "Mazas", slot: "mainhand", twoHanded: false, spellTree: "mace", uniqueName: "MAIN_MACE" },
    { id: "2H_HEAVY_MACE", name: "Maza Pesada", category: "Mazas", slot: "mainhand", twoHanded: true, spellTree: "mace", uniqueName: "2H_HEAVY_MACE" },
    { id: "2H_MACE_MORGANA", name: "Maza Camlann", category: "Mazas", slot: "mainhand", twoHanded: true, spellTree: "mace", uniqueName: "2H_MACE_MORGANA" },
    { id: "2H_DUALMACE_AVALON", name: "Juramento (Oathkeepers)", category: "Mazas", slot: "mainhand", twoHanded: true, spellTree: "mace", uniqueName: "2H_DUALMACE_AVALON" },
    { id: "MAIN_HAMMER", name: "Martillo de 1 Mano", category: "Martillos", slot: "mainhand", twoHanded: false, spellTree: "hammer", uniqueName: "MAIN_HAMMER" },
    { id: "2H_HAMMER", name: "Gran Martillo", category: "Martillos", slot: "mainhand", twoHanded: true, spellTree: "hammer", uniqueName: "2H_HAMMER" },
    { id: "2H_HAMMER_AVALON", name: "Mano de la Justicia", category: "Martillos", slot: "mainhand", twoHanded: true, spellTree: "hammer", uniqueName: "2H_HAMMER_AVALON" },

    // BALLESTAS Y ARCOS
    { id: "MAIN_1H_CROSSBOW", name: "Ballesta Ligera", category: "Ballestas", slot: "mainhand", twoHanded: false, spellTree: "crossbow", uniqueName: "MAIN_1H_CROSSBOW" },
    { id: "2H_CROSSBOW", name: "Ballesta Pesada", category: "Ballestas", slot: "mainhand", twoHanded: true, spellTree: "crossbow", uniqueName: "2H_CROSSBOW" },
    { id: "2H_DUALCROSSBOW_HELL", name: "Repetidoras de Perno (Boltcasters)", category: "Ballestas", slot: "mainhand", twoHanded: true, spellTree: "crossbow", uniqueName: "2H_DUALCROSSBOW_HELL" },
    { id: "2H_CROSSBOW_AVALON", name: "Moldeador de Energía (Energy Shaper)", category: "Ballestas", slot: "mainhand", twoHanded: true, spellTree: "crossbow", uniqueName: "2H_CROSSBOW_AVALON" },
    { id: "2H_BOW", name: "Arco Común", category: "Arcos", slot: "mainhand", twoHanded: true, spellTree: "bow", uniqueName: "2H_BOW" },
    { id: "2H_WARBOW", name: "Arco de Guerra", category: "Arcos", slot: "mainhand", twoHanded: true, spellTree: "bow", uniqueName: "2H_WARBOW" },
    { id: "2H_BOW_KEEPER", name: "Arco de Badon", category: "Arcos", slot: "mainhand", twoHanded: true, spellTree: "bow", uniqueName: "2H_BOW_KEEPER" },

    // LANZAS Y DAGAS
    { id: "MAIN_SPEAR", name: "Lanza de 1 Mano", category: "Lanzas", slot: "mainhand", twoHanded: false, spellTree: "spear", uniqueName: "MAIN_SPEAR" },
    { id: "2H_SPEAR", name: "Pica", category: "Lanzas", slot: "mainhand", twoHanded: true, spellTree: "spear", uniqueName: "2H_SPEAR" },
    { id: "2H_HARPOON_HELL", name: "Cazaespíritus (Spirithunter)", category: "Lanzas", slot: "mainhand", twoHanded: true, spellTree: "spear", uniqueName: "2H_HARPOON_HELL" },
    { id: "MAIN_DAGGER", name: "Daga de 1 Mano", category: "Dagas", slot: "mainhand", twoHanded: false, spellTree: "dagger", uniqueName: "MAIN_DAGGER" },
    { id: "MAIN_RAPIER_MORGANA", name: "Sangradora (Bloodletter)", category: "Dagas", slot: "mainhand", twoHanded: false, spellTree: "dagger", uniqueName: "MAIN_RAPIER_MORGANA" },
    { id: "2H_DUALSICKLE_UNDEAD", name: "Muerte Doble (Deathgivers)", category: "Dagas", slot: "mainhand", twoHanded: true, spellTree: "dagger", uniqueName: "2H_DUALSICKLE_UNDEAD" },

    // VARAS / BASTONES
    { id: "2H_QUARTERSTAFF", name: "Bastón de Monje", category: "Varas", slot: "mainhand", twoHanded: true, spellTree: "quarterstaff", uniqueName: "2H_QUARTERSTAFF" },
    { id: "2H_DOUBLEBLADEDSTAFF", name: "Vara de Doble Filo", category: "Varas", slot: "mainhand", twoHanded: true, spellTree: "quarterstaff", uniqueName: "2H_DOUBLEBLADEDSTAFF" },
    { id: "2H_QUARTERSTAFF_AVALON", name: "Buscador del Grial (Grailseeker)", category: "Varas", slot: "mainhand", twoHanded: true, spellTree: "quarterstaff", uniqueName: "2H_QUARTERSTAFF_AVALON" },

    // MAGIA SAGRADA Y NATURALEZA
    { id: "MAIN_HOLYSTAFF", name: "Bastón Sagrado", category: "Bastones Sagrados", slot: "mainhand", twoHanded: false, spellTree: "holy", uniqueName: "MAIN_HOLYSTAFF" },
    { id: "2H_HOLYSTAFF_HELL", name: "Bastón Caído (Fallen Staff)", category: "Bastones Sagrados", slot: "mainhand", twoHanded: true, spellTree: "holy", uniqueName: "2H_HOLYSTAFF_HELL" },
    { id: "MAIN_HOLYSTAFF_AVALON", name: "Santificado (Hallowfall)", category: "Bastones Sagrados", slot: "mainhand", twoHanded: false, spellTree: "holy", uniqueName: "MAIN_HOLYSTAFF_AVALON" },
    { id: "MAIN_NATURESTAFF", name: "Bastón Natural", category: "Bastones Naturales", slot: "mainhand", twoHanded: false, spellTree: "nature", uniqueName: "MAIN_NATURESTAFF" },
    { id: "2H_NATURESTAFF_KEEPER", name: "Bastón Silvestre (Wild Staff)", category: "Bastones Naturales", slot: "mainhand", twoHanded: true, spellTree: "nature", uniqueName: "2H_NATURESTAFF_KEEPER" },
    { id: "2H_NATURESTAFF_HELL", name: "Bastón de Plaga (Blight Staff)", category: "Bastones Naturales", slot: "mainhand", twoHanded: true, spellTree: "nature", uniqueName: "2H_NATURESTAFF_HELL" },

    // FUEGO, HIELO, MALDITO, ARCANO
    { id: "MAIN_FIRESTAFF", name: "Bastón de Fuego de 1M", category: "Fuego", slot: "mainhand", twoHanded: false, spellTree: "fire", uniqueName: "MAIN_FIRESTAFF" },
    { id: "2H_INFERNOSTAFF", name: "Bastón Infernal", category: "Fuego", slot: "mainhand", twoHanded: true, spellTree: "fire", uniqueName: "2H_INFERNOSTAFF" },
    { id: "2H_FIRE_RING_UNDEAD", name: "Bastón Brimstone", category: "Fuego", slot: "mainhand", twoHanded: true, spellTree: "fire", uniqueName: "2H_FIRE_RING_UNDEAD" },
    { id: "2H_ICE_CRYSTAL_UNDEAD", name: "Prisma de Permafrost", category: "Hielo", slot: "mainhand", twoHanded: true, spellTree: "frost", uniqueName: "2H_ICE_CRYSTAL_UNDEAD" },
    { id: "MAIN_CURSEDSTAFF", name: "Bastón Maldito de 1M", category: "Maldición", slot: "mainhand", twoHanded: false, spellTree: "curse", uniqueName: "MAIN_CURSEDSTAFF" },
    { id: "2H_CURSEDSTAFF_MORGANA", name: "Bastón de Condenación (Damnation)", category: "Maldición", slot: "mainhand", twoHanded: true, spellTree: "curse", uniqueName: "2H_CURSEDSTAFF_MORGANA" },
    { id: "MAIN_CURSEDSTAFF_AVALON", name: "Invocador de Sombras (Shadowcaller)", category: "Maldición", slot: "mainhand", twoHanded: false, spellTree: "curse", uniqueName: "MAIN_CURSEDSTAFF_AVALON" },
    { id: "2H_ARCANE_RING_AVALON", name: "Evocador (Evoker)", category: "Arcano", slot: "mainhand", twoHanded: true, spellTree: "arcane", uniqueName: "2H_ARCANE_RING_AVALON" },

    // GUANTES DE GUERRA Y CAMBIAFORMAS
    { id: "2H_WARGLOVES_SPIKED", name: "Guanteletes con Púas (Spiked)", category: "Guantes de Guerra", slot: "mainhand", twoHanded: true, spellTree: "wargloves", uniqueName: "2H_GLOVES_SPIKED" },
    { id: "2H_WARGLOVES_AVALON", name: "Puños de Avalonia", category: "Guantes de Guerra", slot: "mainhand", twoHanded: true, spellTree: "wargloves", uniqueName: "2H_GLOVES_AVALON" },
    { id: "2H_SHAPESHIFTER_PANTHER", name: "Bastón Acechador (Pantera)", category: "Cambiaformas", slot: "mainhand", twoHanded: true, spellTree: "shapeshifter", uniqueName: "2H_SHAPESHIFTER_PANTHER" },
    { id: "2H_SHAPESHIFTER_BEAR", name: "Bastón Primario (Oso)", category: "Cambiaformas", slot: "mainhand", twoHanded: true, spellTree: "shapeshifter", uniqueName: "2H_SHAPESHIFTER_BEAR" },
    { id: "2H_SHAPESHIFTER_TREANT", name: "Bastón Raíz (Treant)", category: "Cambiaformas", slot: "mainhand", twoHanded: true, spellTree: "shapeshifter", uniqueName: "2H_SHAPESHIFTER_TREANT" }
  ],

  offhands: [
    { id: "OFF_SHIELD", name: "Escudo Común", category: "Escudos", slot: "offhand", uniqueName: "OFF_SHIELD" },
    { id: "OFF_TOWERSHIELD_UNDEAD", name: "Escudo de Sarcófago", category: "Escudos", slot: "offhand", uniqueName: "OFF_TOWERSHIELD_UNDEAD" },
    { id: "OFF_SHIELD_AVALON", name: "Baluarte Astral (Astral Aegis)", category: "Escudos", slot: "offhand", uniqueName: "OFF_SHIELD_AVALON" },
    { id: "OFF_BOOK", name: "Tomo de Hechizos", category: "Magia", slot: "offhand", uniqueName: "OFF_BOOK" },
    { id: "OFF_HORN_KEEPER", name: "Llamador de Niebla (Mistcaller)", category: "Magia", slot: "offhand", uniqueName: "OFF_HORN_KEEPER" },
    { id: "OFF_TORCH", name: "Antorcha", category: "Combate", slot: "offhand", uniqueName: "OFF_TORCH" },
    { id: "OFF_DEMONSKULL_HELL", name: "Vela de la Cripta (Cryptcandle)", category: "Magia", slot: "offhand", uniqueName: "OFF_DEMONSKULL_HELL" },
    { id: "OFF_TOTEM_KEEPER", name: "Raíz Sagrada (Taproot)", category: "Defensa", slot: "offhand", uniqueName: "OFF_TOTEM_KEEPER" }
  ],

  head: [
    { id: "HEAD_PLATE_SET1", name: "Casco de Soldado", category: "Placa", slot: "head", armorType: "plate_head", uniqueName: "HEAD_PLATE_SET1" },
    { id: "HEAD_PLATE_SET2", name: "Casco de Caballero", category: "Placa", slot: "head", armorType: "plate_head", uniqueName: "HEAD_PLATE_SET2" },
    { id: "HEAD_PLATE_SET3", name: "Casco de Guardián", category: "Placa", slot: "head", armorType: "plate_head", uniqueName: "HEAD_PLATE_SET3" },
    { id: "HEAD_PLATE_HELL", name: "Casco Demoníaco", category: "Placa", slot: "head", armorType: "plate_head", uniqueName: "HEAD_PLATE_HELL" },
    { id: "HEAD_LEATHER_SET1", name: "Capucha de Mercenario", category: "Cuero", slot: "head", armorType: "leather_head", uniqueName: "HEAD_LEATHER_SET1" },
    { id: "HEAD_LEATHER_SET2", name: "Capucha de Cazador", category: "Cuero", slot: "head", armorType: "leather_head", uniqueName: "HEAD_LEATHER_SET2" },
    { id: "HEAD_LEATHER_SET3", name: "Capucha de Asesino", category: "Cuero", slot: "head", armorType: "leather_head", uniqueName: "HEAD_LEATHER_SET3" },
    { id: "HEAD_LEATHER_MORGANA", name: "Capucha de Acechador (Stalker)", category: "Cuero", slot: "head", armorType: "leather_head", uniqueName: "HEAD_LEATHER_MORGANA" },
    { id: "HEAD_LEATHER_HELL", name: "Capucha de Espectro (Specter)", category: "Cuero", slot: "head", armorType: "leather_head", uniqueName: "HEAD_LEATHER_HELL" },
    { id: "HEAD_CLOTH_SET1", name: "Hábito de Erudito", category: "Tela", slot: "head", armorType: "cloth_head", uniqueName: "HEAD_CLOTH_SET1" },
    { id: "HEAD_CLOTH_SET2", name: "Hábito de Clérigo", category: "Tela", slot: "head", armorType: "cloth_head", uniqueName: "HEAD_CLOTH_SET2" },
    { id: "HEAD_CLOTH_SET3", name: "Hábito de Mago", category: "Tela", slot: "head", armorType: "cloth_head", uniqueName: "HEAD_CLOTH_SET3" },
    { id: "HEAD_CLOTH_ROYAL", name: "Hábito Real", category: "Tela", slot: "head", armorType: "cloth_head", uniqueName: "HEAD_CLOTH_ROYAL" },
    { id: "HEAD_CLOTH_AVALON", name: "Hábito de Pureza", category: "Tela", slot: "head", armorType: "cloth_head", uniqueName: "HEAD_CLOTH_AVALON" }
  ],

  armor: [
    { id: "ARMOR_PLATE_SET1", name: "Armadura de Soldado", category: "Placa", slot: "armor", armorType: "plate_armor", uniqueName: "ARMOR_PLATE_SET1" },
    { id: "ARMOR_PLATE_SET2", name: "Armadura de Caballero", category: "Placa", slot: "armor", armorType: "plate_armor", uniqueName: "ARMOR_PLATE_SET2" },
    { id: "ARMOR_PLATE_SET3", name: "Armadura de Guardián", category: "Placa", slot: "armor", armorType: "plate_armor", uniqueName: "ARMOR_PLATE_SET3" },
    { id: "ARMOR_PLATE_HELL", name: "Armadura Demoníaca", category: "Placa", slot: "armor", armorType: "plate_armor", uniqueName: "ARMOR_PLATE_HELL" },
    { id: "ARMOR_PLATE_AVALON", name: "Armadura de Valentía", category: "Placa", slot: "armor", armorType: "plate_armor", uniqueName: "ARMOR_PLATE_AVALON" },
    { id: "ARMOR_LEATHER_SET1", name: "Chaqueta de Mercenario", category: "Cuero", slot: "armor", armorType: "leather_armor", uniqueName: "ARMOR_LEATHER_SET1" },
    { id: "ARMOR_LEATHER_SET2", name: "Chaqueta de Cazador", category: "Cuero", slot: "armor", armorType: "leather_armor", uniqueName: "ARMOR_LEATHER_SET2" },
    { id: "ARMOR_LEATHER_SET3", name: "Chaqueta de Asesino", category: "Cuero", slot: "armor", armorType: "leather_armor", uniqueName: "ARMOR_LEATHER_SET3" },
    { id: "ARMOR_LEATHER_MORGANA", name: "Chaqueta de Acechador (Stalker)", category: "Cuero", slot: "armor", armorType: "leather_armor", uniqueName: "ARMOR_LEATHER_MORGANA" },
    { id: "ARMOR_LEATHER_HELL", name: "Chaqueta de Hellion", category: "Cuero", slot: "armor", armorType: "leather_armor", uniqueName: "ARMOR_LEATHER_HELL" },
    { id: "ARMOR_LEATHER_UNDEAD", name: "Chaqueta de Espectro (Specter)", category: "Cuero", slot: "armor", armorType: "leather_armor", uniqueName: "ARMOR_LEATHER_UNDEAD" },
    { id: "ARMOR_CLOTH_SET1", name: "Túnica de Erudito", category: "Tela", slot: "armor", armorType: "cloth_armor", uniqueName: "ARMOR_CLOTH_SET1" },
    { id: "ARMOR_CLOTH_SET2", name: "Túnica de Clérigo", category: "Tela", slot: "armor", armorType: "cloth_armor", uniqueName: "ARMOR_CLOTH_SET2" },
    { id: "ARMOR_CLOTH_SET3", name: "Túnica de Mago", category: "Tela", slot: "armor", armorType: "cloth_armor", uniqueName: "ARMOR_CLOTH_SET3" },
    { id: "ARMOR_CLOTH_ROYAL", name: "Túnica Real", category: "Tela", slot: "armor", armorType: "cloth_armor", uniqueName: "ARMOR_CLOTH_ROYAL" },
    { id: "ARMOR_CLOTH_AVALON", name: "Túnica de Pureza", category: "Tela", slot: "armor", armorType: "cloth_armor", uniqueName: "ARMOR_CLOTH_AVALON" }
  ],

  shoes: [
    { id: "SHOES_PLATE_SET1", name: "Botas de Soldado", category: "Placa", slot: "shoes", armorType: "plate_shoes", uniqueName: "SHOES_PLATE_SET1" },
    { id: "SHOES_PLATE_SET2", name: "Botas de Caballero", category: "Placa", slot: "shoes", armorType: "plate_shoes", uniqueName: "SHOES_PLATE_SET2" },
    { id: "SHOES_PLATE_SET3", name: "Botas de Guardián", category: "Placa", slot: "shoes", armorType: "plate_shoes", uniqueName: "SHOES_PLATE_SET3" },
    { id: "SHOES_PLATE_HELL", name: "Botas Demoníacas", category: "Placa", slot: "shoes", armorType: "plate_shoes", uniqueName: "SHOES_PLATE_HELL" },
    { id: "SHOES_PLATE_ROYAL", name: "Botas Reales", category: "Placa", slot: "shoes", armorType: "plate_shoes", uniqueName: "SHOES_PLATE_ROYAL" },
    { id: "SHOES_LEATHER_SET1", name: "Zapatos de Mercenario", category: "Cuero", slot: "shoes", armorType: "leather_shoes", uniqueName: "SHOES_LEATHER_SET1" },
    { id: "SHOES_LEATHER_SET2", name: "Zapatos de Cazador", category: "Cuero", slot: "shoes", armorType: "leather_shoes", uniqueName: "SHOES_LEATHER_SET2" },
    { id: "SHOES_LEATHER_SET3", name: "Zapatos de Asesino", category: "Cuero", slot: "shoes", armorType: "leather_shoes", uniqueName: "SHOES_LEATHER_SET3" },
    { id: "SHOES_LEATHER_ROYAL", name: "Zapatos Reales", category: "Cuero", slot: "shoes", armorType: "leather_shoes", uniqueName: "SHOES_LEATHER_ROYAL" },
    { id: "SHOES_CLOTH_SET1", name: "Sandalias de Erudito", category: "Tela", slot: "shoes", armorType: "cloth_shoes", uniqueName: "SHOES_CLOTH_SET1" },
    { id: "SHOES_CLOTH_SET2", name: "Sandalias de Clérigo", category: "Tela", slot: "shoes", armorType: "cloth_shoes", uniqueName: "SHOES_CLOTH_SET2" },
    { id: "SHOES_CLOTH_SET3", name: "Sandalias de Mago", category: "Tela", slot: "shoes", armorType: "cloth_shoes", uniqueName: "SHOES_CLOTH_SET3" },
    { id: "SHOES_CLOTH_ROYAL", name: "Sandalias Reales", category: "Tela", slot: "shoes", armorType: "cloth_shoes", uniqueName: "SHOES_CLOTH_ROYAL" }
  ],

  cape: [
    { id: "CAPE", name: "Capa Normal", category: "Capas", slot: "cape", uniqueName: "CAPE" },
    { id: "CAPEITEM_FW_THETFORD", name: "Capa de Thetford", category: "Capas de Facción", slot: "cape", uniqueName: "CAPEITEM_FW_THETFORD" },
    { id: "CAPEITEM_FW_FORTSTERLING", name: "Capa de Fort Sterling", category: "Capas de Facción", slot: "cape", uniqueName: "CAPEITEM_FW_FORTSTERLING" },
    { id: "CAPEITEM_FW_MARTLOCK", name: "Capa de Martlock", category: "Capas de Facción", slot: "cape", uniqueName: "CAPEITEM_FW_MARTLOCK" },
    { id: "CAPEITEM_FW_LYMHURST", name: "Capa de Lymhurst", category: "Capas de Facción", slot: "cape", uniqueName: "CAPEITEM_FW_LYMHURST" },
    { id: "CAPEITEM_FW_BRIDGEWATCH", name: "Capa de Bridgewatch", category: "Capas de Facción", slot: "cape", uniqueName: "CAPEITEM_FW_BRIDGEWATCH" },
    { id: "CAPEITEM_FW_CAERLEON", name: "Capa de Caerleon", category: "Capas de Facción", slot: "cape", uniqueName: "CAPEITEM_FW_CAERLEON" },
    { id: "CAPEITEM_FW_BRECILIEN", name: "Capa de Brecilien", category: "Capas de Facción", slot: "cape", uniqueName: "CAPEITEM_FW_BRECILIEN" },
    { id: "CAPEITEM_DEMON", name: "Capa de Demonio", category: "Capas de Artefacto", slot: "cape", uniqueName: "CAPEITEM_DEMON" },
    { id: "CAPEITEM_UNDEAD", name: "Capa de No-Muerto", category: "Capas de Artefacto", slot: "cape", uniqueName: "CAPEITEM_UNDEAD" },
    { id: "CAPEITEM_MORGANA", name: "Capa de Morgana", category: "Capas de Artefacto", slot: "cape", uniqueName: "CAPEITEM_MORGANA" },
    { id: "CAPEITEM_HERETIC", name: "Capa de Hereje", category: "Capas de Artefacto", slot: "cape", uniqueName: "CAPEITEM_HERETIC" }
  ],

  food: [
    { id: "MEAL_STEW", name: "Estofado de Res", category: "Comida", slot: "food", uniqueName: "T8_MEAL_STEW" },
    { id: "MEAL_OMELETTE", name: "Tortilla de Cerdo", category: "Comida", slot: "food", uniqueName: "T7_MEAL_OMELETTE" },
    { id: "MEAL_ROAST", name: "Asado de Ternera", category: "Comida", slot: "food", uniqueName: "T7_MEAL_ROAST" },
    { id: "MEAL_PIE", name: "Pastel de Cerdo", category: "Comida", slot: "food", uniqueName: "T7_MEAL_PIE" },
    { id: "MEAL_SANDWICH", name: "Sándwich de Buey", category: "Comida", slot: "food", uniqueName: "T8_MEAL_SANDWICH" },
    { id: "MEAL_SOUP", name: "Sopa de Zanahorias", category: "Comida", slot: "food", uniqueName: "T1_MEAL_SOUP" }
  ],

  potion: [
    { id: "POTION_HEAL", name: "Poción de Curación", category: "Pociones", slot: "potion", uniqueName: "T7_POTION_HEAL" },
    { id: "POTION_POISON", name: "Poción de Veneno", category: "Pociones", slot: "potion", uniqueName: "T8_POTION_POISON" },
    { id: "POTION_REVIVE", name: "Poción de Resistencia", category: "Pociones", slot: "potion", uniqueName: "T7_POTION_REVIVE" },
    { id: "POTION_STONESKIN", name: "Poción de Gigante", category: "Pociones", slot: "potion", uniqueName: "T7_POTION_STONESKIN" },
    { id: "POTION_INVIS", name: "Poción de Invisibilidad", category: "Pociones", slot: "potion", uniqueName: "T8_POTION_INVIS_SET1" },
    { id: "POTION_ENERGY", name: "Poción de Energía", category: "Pociones", slot: "potion", uniqueName: "T7_POTION_ENERGY" }
  ],

  mount: [
    { id: "MOUNT_HORSE", name: "Caballo de Montar T5", category: "Monturas", slot: "mount", uniqueName: "T5_MOUNT_HORSE" },
    { id: "MOUNT_ARMORED_HORSE", name: "Caballo Blindado T6", category: "Monturas", slot: "mount", uniqueName: "T6_MOUNT_ARMORED_HORSE" },
    { id: "MOUNT_OX", name: "Buey de Transporte T6", category: "Monturas", slot: "mount", uniqueName: "T6_MOUNT_OX" },
    { id: "MOUNT_DIREWOLF", name: "Lobo Terrible T6", category: "Monturas", slot: "mount", uniqueName: "T6_MOUNT_DIREWOLF" },
    { id: "MOUNT_SWIFTCLAW", name: "Garrapresta T5", category: "Monturas", slot: "mount", uniqueName: "T5_MOUNT_SWIFTCLAW" },
    { id: "MOUNT_STAG", name: "Ciervo Gigante T4", category: "Monturas", slot: "mount", uniqueName: "T4_MOUNT_STAG" }
  ]
};

// Generador de URL oficial de Albion Online Render
export function getAlbionItemIconUrl(item, tier = "T4", enchantment = 0, quality = 1) {
  if (!item) return "";
  
  let finalUniqueName = item.uniqueName;
  if (!finalUniqueName.startsWith("T1_") && 
      !finalUniqueName.startsWith("T2_") && 
      !finalUniqueName.startsWith("T3_") && 
      !finalUniqueName.startsWith("T4_") && 
      !finalUniqueName.startsWith("T5_") && 
      !finalUniqueName.startsWith("T6_") && 
      !finalUniqueName.startsWith("T7_") && 
      !finalUniqueName.startsWith("T8_")) {
    finalUniqueName = `${tier}_${item.uniqueName}`;
  }

  if (enchantment > 0 && !item.slot.match(/food|potion|mount/)) {
    finalUniqueName = `${finalUniqueName}@${enchantment}`;
  }

  return `https://render.albiononline.com/v1/item/${finalUniqueName}.png?quality=${quality}`;
}
