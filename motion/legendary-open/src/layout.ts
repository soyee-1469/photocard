import { HEIGHT, WIDTH } from "./timeline";

const closedSrcW = 501;
const closedSrcH = 1013;
const bodySrcH = 1013;
const topSrcW = 698;
const topSrcH = 116;
const peelSrcW = 708;
const peelSrcH = 385;

export const packW = 252;
export const closedH = Math.round((packW * closedSrcH) / closedSrcW);
export const bodyH = Math.round((packW * bodySrcH) / 546);
export const topH = Math.round((packW * topSrcH) / topSrcW);

export const packLeft = Math.round((WIDTH - packW) / 2);
export const packTop = 72;

const closedBottomPad = Math.round((closedH * 2) / closedSrcH);
const bodyBottomPad = Math.round((bodyH * 2) / bodySrcH);
const topBottomPad = Math.round((topH * 2) / topSrcH);
const topOverlap = Math.round(topH * 0.5);

export const bodyLeft = packLeft;
export const bodyTop =
  packTop + closedH - closedBottomPad - bodyH + bodyBottomPad;

const sealTop = bodyTop + topOverlap - topH + topBottomPad;

export const peelW = Math.round((peelSrcW * packW) / topSrcW);
export const peelH = Math.round((peelSrcH * packW) / topSrcW);
export const peelLeft = packLeft + packW - peelW;
const peelPadTop = Math.round((peelH * 19) / peelSrcH);
export const peelTop = sealTop - peelPadTop - 8;

export const cardW = 172;
export const cardH = Math.round((cardW * 375) / 230);
export const cardLeft = Math.round((WIDTH - cardW) / 2);
export const cardLandTop = 168;

export const stage = { width: WIDTH, height: HEIGHT };
