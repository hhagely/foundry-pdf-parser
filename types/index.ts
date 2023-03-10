export interface ParsedPdf {
  pages: PdfPage[];
}

export interface PdfPage {
  texts: PageText[];
}

export interface PageText {
  text: string;
  hasEOL: boolean;
}

export interface FoundryItem {
  name: string;
  type: string;
  img: string;
  data: unknown;
  // pageNum: number;
}

// interface FoundryItem extends FoundryItem {
//   medicineType: string;
//   strengthLevel: string;
//   primaryComponent: string;
//   secondaryComponent: string;
// }

export enum PrimaryComponents {
  AUGMENTING = 'deadly nightshade',
  CURATIVE = 'juniper berries',
  FORTIFYING = 'willow bark',
  RESTORATIVE = 'flesh wort',
  SPECIAL = '-',
}

export enum Reagents {
  EARTH = 'earth',
  FIRE = 'fire',
  WIND = 'wind',
  WATER = 'water',
  ICE = 'ice',
  LIGHTNING = 'lightning',
}
