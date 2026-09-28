export const rarityIds = ["common", "rare", "epic", "legendary"] as const;

export type RarityId = (typeof rarityIds)[number];

export type RarityTheme = {
  id: RarityId;
  label: string;
  badge: string;
  line: string;
  glow: string;
  foil: readonly [string, string];
};

/** Visual data only. Animation components read this and do not hard-code a grade. */
export const rarityThemes: Record<RarityId, RarityTheme> = {
  common: {
    id: "common",
    label: "COMMON",
    badge: "N",
    line: "일상 속 한 장",
    glow: "#F3F6FB",
    foil: ["#F4F1EA", "#C9C2B3"],
  },
  rare: {
    id: "rare",
    label: "RARE",
    badge: "R",
    line: "눈이 머무는 순간",
    glow: "#6EC4FF",
    foil: ["#9ED8FF", "#2F6DFF"],
  },
  epic: {
    id: "epic",
    label: "EPIC",
    badge: "SR",
    line: "쉽게 손에 넣지 못할 장",
    glow: "#E2A8FF",
    foil: ["#F0C6FF", "#7A2BFF"],
  },
  legendary: {
    id: "legendary",
    label: "LEGENDARY",
    badge: "SSR",
    line: "소장하고 싶은 한 장",
    glow: "#FFD978",
    foil: ["#FFE7A3", "#C4841A"],
  },
};

export type CardArt = {
  rarity: RarityId;
  /** Path inside `public/`, passed to `staticFile()`. */
  frontSrc: string;
  backSrc: string;
};

export const legendaryDummyCard: CardArt = {
  rarity: "legendary",
  frontSrc: "fx/card_front.png",
  backSrc: "fx/card_back.png",
};
