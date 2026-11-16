import castlevania from "@/assets/col-castlevania.jpg";
import zodiaco from "@/assets/col-zodiaco.jpg";
import finalfantasy from "@/assets/col-finalfantasy.jpg";

export type Collection = {
  slug: string;
  name: string;
  image: string;
  description: string;
  cardCount: number;
  sampleImages: string[];
  moxfieldUrl: string;
  deckcheckUrl: string;
};

export const collections: Collection[] = [
  {
    slug: "castlevania",
    name: "Castlevania",
    image: castlevania,
    description: "Castelo eterno, cacadores e a noite sem fim sob a lua de sangue.",
    cardCount: 119,
    sampleImages: [
      "/images/decks/castlevania/a-dracula-senhor-das-trevas-comandante.jpg",
      "/images/decks/castlevania/alucard-herdeiro-da-noite-sem-escudo.jpg",
      "/images/decks/castlevania/castelo-de-dracula-sob-a-lua-cheia.jpg",
      "/images/decks/castlevania/leon-belmont-juramento-do-vampire-killer.jpg",
      "/images/decks/castlevania/sypha-e-o-manuscrito-dos-oradores.jpg",
    ],
    moxfieldUrl: "",
    deckcheckUrl: "",
  },
  {
    slug: "cavaleiros-do-zodiaco",
    name: "Cavaleiros do Zodiaco",
    image: zodiaco,
    description: "Armaduras douradas, cosmo ardente e as doze casas em ouro puro.",
    cardCount: 147,
    sampleImages: [
      "/images/decks/cavaleiros-do-zodiaco/regulus-de-leao.jpg",
      "/images/decks/cavaleiros-do-zodiaco/albafica-de-peixes.jpg",
      "/images/decks/cavaleiros-do-zodiaco/ikki-de-fenix-armadura-divina.jpg",
      "/images/decks/cavaleiros-do-zodiaco/swords-to-plowshares.jpg",
      "/images/decks/cavaleiros-do-zodiaco/summon-hades-god-of-underworld.jpg",
    ],
    moxfieldUrl: "",
    deckcheckUrl: "",
  },
  {
    slug: "final-fantasy-vii",
    name: "Final Fantasy VII",
    image: finalfantasy,
    description: "Cristais, invocacoes lendarias e herois de um mundo em colapso.",
    cardCount: 112,
    sampleImages: [
      "/images/decks/final-fantasy-vii/cloud-e-a-lamina-em-midgar.jpg",
      "/images/decks/final-fantasy-vii/genesis-rhapsodos-versos-escarlates.jpg",
      "/images/decks/final-fantasy-vii/angeal-hewley-honra-de-soldier.jpg",
      "/images/decks/final-fantasy-vii/cid-highwind-no-hangar-do-highwind.jpg",
      "/images/decks/final-fantasy-vii/kadaj-e-a-lamina-souba.jpg",
    ],
    moxfieldUrl: "",
    deckcheckUrl: "",
  },
];

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}
