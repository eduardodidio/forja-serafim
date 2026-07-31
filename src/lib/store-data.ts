import diablo from "@/assets/col-diablo.jpg";
import castlevania from "@/assets/col-castlevania.jpg";
import zodiaco from "@/assets/col-zodiaco.jpg";
import finalfantasy from "@/assets/col-finalfantasy.jpg";
import felinos from "@/assets/col-felinos.jpg";
import dragoes from "@/assets/col-dragoes.jpg";
import bloodborne from "@/assets/col-bloodborne.jpg";
import anime from "@/assets/col-anime.jpg";
import cyberpunk from "@/assets/col-cyberpunk.jpg";

export const CARD_TYPES = [
  "Criatura",
  "Instantânea",
  "Feitiço",
  "Artefato",
  "Terreno",
  "Encantamento",
  "Planeswalker",
] as const;

export type CardType = (typeof CARD_TYPES)[number];

export type Collection = {
  slug: string;
  name: string;
  image: string;
  description: string;
  cardCount: number;
};

export type ProxyCard = {
  id: string;
  name: string;
  original: string;
  type: CardType;
  price: number;
  collection: string;
  image: string;
  art: string;
};

type Seed = {
  slug: string;
  name: string;
  image: string;
  description: string;
  cards: [string, string, CardType, number][];
};

const seeds: Seed[] = [
  {
    slug: "diablo",
    name: "Diablo",
    image: diablo,
    description: "Infernos ardentes, demônios maiores e a ruína de Tristram em arte full art.",
    cards: [
      ["Senhor do Terror", "Rakdos, Lord of Riots", "Criatura", 24],
      ["Portal do Inferno", "Blood Moon", "Encantamento", 19],
      ["Chama de Mefisto", "Lightning Bolt", "Instantânea", 15],
      ["Ruínas de Tristram", "Blood Crypt", "Terreno", 21],
      ["Pedra da Alma", "Sol Ring", "Artefato", 22],
      ["Caçador de Demônios", "Ob Nixilis", "Planeswalker", 29],
      ["Grito de Baal", "Damnation", "Feitiço", 18],
      ["Legião das Sombras", "Bitterblossom", "Encantamento", 20],
    ],
  },
  {
    slug: "castlevania",
    name: "Castlevania",
    image: castlevania,
    description: "Castelo eterno, caçadores e a noite sem fim sob a lua de sangue.",
    cards: [
      ["Conde da Noite Eterna", "Sorin Markov", "Planeswalker", 29],
      ["Chicote Vampire Killer", "Sword of Feast and Famine", "Artefato", 25],
      ["Castelo de Dracula", "Castle Locthwain", "Terreno", 21],
      ["Belmont, o Caçador", "Thalia", "Criatura", 23],
      ["Água Benta", "Path to Exile", "Instantânea", 15],
      ["Sinfonia da Noite", "Approach of the Second Sun", "Feitiço", 18],
      ["Morcegos Ancestrais", "Bat Colony", "Criatura", 16],
      ["Maldição de Belmont", "Curse of Death's Hold", "Encantamento", 19],
    ],
  },
  {
    slug: "cavaleiros-do-zodiaco",
    name: "Cavaleiros do Zodíaco",
    image: zodiaco,
    description: "Armaduras douradas, cosmo ardente e as doze casas em ouro puro.",
    cards: [
      ["Cavaleiro de Ouro", "Serra Angel", "Criatura", 24],
      ["Meteoro de Pégaso", "Shock", "Instantânea", 14],
      ["Casa de Áries", "Ancient Tomb", "Terreno", 22],
      ["Armadura Sagrada", "Shield of the Oversoul", "Artefato", 20],
      ["Cosmo Supremo", "Overwhelming Splendor", "Encantamento", 19],
      ["Athena Desperta", "Elspeth", "Planeswalker", 29],
      ["Execução Aurora", "Wrath of God", "Feitiço", 18],
      ["Fênix Renascida", "Phoenix of Ash", "Criatura", 21],
    ],
  },
  {
    slug: "final-fantasy",
    name: "Final Fantasy",
    image: finalfantasy,
    description: "Cristais, invocações lendárias e heróis de um mundo em colapso.",
    cards: [
      ["Cristal Primordial", "Chrome Mox", "Artefato", 26],
      ["Invocação Bahamut", "Ancient Gold Dragon", "Criatura", 30],
      ["Cura Suprema", "Heroic Intervention", "Instantânea", 17],
      ["Planície de Cristal", "Hallowed Fountain", "Terreno", 21],
      ["Limit Break", "Berserk", "Feitiço", 19],
      ["Cavaleiro da Luz", "Knight of the White Orchid", "Criatura", 20],
      ["Materia Antiga", "Mana Vault", "Artefato", 25],
      ["Julgamento Final", "Cyclonic Rift", "Instantânea", 27],
    ],
  },
  {
    slug: "felinos",
    name: "Felinos",
    image: felinos,
    description: "Predadores elegantes, olhos de brasa e a caçada silenciosa.",
    cards: [
      ["Pantera de Obsidiana", "Nacatl War-Pride", "Criatura", 20],
      ["Salto Fatal", "Ambuscade", "Instantânea", 15],
      ["Savana Dourada", "Savannah", "Terreno", 23],
      ["Rugido Ancestral", "Overrun", "Feitiço", 18],
      ["Coleira do Alfa", "Cloudstone Curio", "Artefato", 21],
      ["Rainha das Selvas", "Arahbo", "Criatura", 26],
      ["Instinto Selvagem", "Rhythm of the Wild", "Encantamento", 19],
      ["Guardião Listrado", "Regal Caracal", "Criatura", 22],
    ],
  },
  {
    slug: "dragoes",
    name: "Dragões",
    image: dragoes,
    description: "Escamas douradas, sopro de fogo e a fúria dos senhores do céu.",
    cards: [
      ["Dragão Ancião Dourado", "Ancient Copper Dragon", "Criatura", 30],
      ["Sopro Devastador", "Blasphemous Act", "Feitiço", 19],
      ["Pico dos Dragões", "Dragonskull Summit", "Terreno", 21],
      ["Tesouro do Ninho", "Treasure Hoard", "Artefato", 22],
      ["Ira Escamada", "Dragon Tempest", "Encantamento", 20],
      ["Filhote de Brasa", "Dragon Whelp", "Criatura", 16],
      ["Voo Incandescente", "Fling", "Instantânea", 14],
      ["Sarkhan Desperto", "Sarkhan", "Planeswalker", 29],
    ],
  },
  {
    slug: "bloodborne",
    name: "Bloodborne",
    image: bloodborne,
    description: "Yharnam em névoa, lanternas rubras e horrores além da razão.",
    cards: [
      ["Caçador de Yharnam", "Hunter of Nightmares", "Criatura", 23],
      ["Serra Serrilhada", "Bloodforged Battle-Axe", "Artefato", 21],
      ["Névoa Carmesim", "Fog", "Instantânea", 14],
      ["Ruas de Yharnam", "Shadowblood Ridge", "Terreno", 20],
      ["Sonho do Caçador", "Nightmare Unmaking", "Feitiço", 18],
      ["Insight Proibido", "Sphinx's Tutelage", "Encantamento", 19],
      ["Besta da Lua", "Werewolf Pack Leader", "Criatura", 22],
      ["Sangue Antigo", "Bond of Revival", "Feitiço", 17],
    ],
  },
  {
    slug: "anime",
    name: "Anime",
    image: anime,
    description: "Traço vibrante, pétalas ao vento e golpes que cortam o horizonte.",
    cards: [
      ["Espadachim das Pétalas", "Isamaru", "Criatura", 20],
      ["Corte Relâmpago", "Lightning Strike", "Instantânea", 14],
      ["Dojo Silencioso", "Eiganjo Castle", "Terreno", 21],
      ["Técnica Proibida", "Time Warp", "Feitiço", 27],
      ["Katana Espiritual", "Kusari-Gama", "Artefato", 20],
      ["Elo de Alma", "Bond of Discipline", "Encantamento", 18],
      ["Rival Eterno", "Toshiro Umezawa", "Criatura", 23],
      ["Despertar Final", "Kiora", "Planeswalker", 29],
    ],
  },
  {
    slug: "cyberpunk",
    name: "Cyberpunk",
    image: cyberpunk,
    description: "Neon, chuva ácida e samurais cromados nas ruas da megacidade.",
    cards: [
      ["Samurai Cromado", "Ninja of the Deep Hours", "Criatura", 23],
      ["Overclock", "Twincast", "Instantânea", 17],
      ["Distrito Neon", "Watery Grave", "Terreno", 22],
      ["Implante Neural", "Aetherflux Reservoir", "Artefato", 25],
      ["Invasão de Sistema", "Thoughtseize", "Feitiço", 21],
      ["Contrato Corporativo", "Rhystic Study", "Encantamento", 28],
      ["Netrunner", "Faerie Mastermind", "Criatura", 20],
      ["Blackout Total", "Cyclonic Rift", "Instantânea", 27],
    ],
  },
];

export const collections: Collection[] = seeds.map((s) => ({
  slug: s.slug,
  name: s.name,
  image: s.image,
  description: s.description,
  cardCount: s.cards.length,
}));

export const cards: ProxyCard[] = seeds.flatMap((s) =>
  s.cards.map(([name, original, type, price], i) => ({
    id: `${s.slug}-${i + 1}`,
    name,
    original,
    type,
    price,
    collection: s.slug,
    image: s.image,
    art: `Arte full art exclusiva da coleção ${s.name}, criada artesanalmente pela Casa do Serafim. Impressão premium em papel de alta gramatura com acabamento de linha e cantos arredondados, mantendo o padrão de tamanho oficial para uso casual e colecionismo.`,
  })),
);

export const FOIL_EXTRA = 6;

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function getCard(id: string) {
  return cards.find((c) => c.id === id);
}

export function cardsOf(slug: string) {
  return cards.filter((c) => c.collection === slug);
}

export function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
