import { FoundryItem, ParsedPdf, Reagents } from '../types';
import buildIndicesMap from './buildIndexesMap';

const getReagentString = (reagentNum: number): string => {
  switch (reagentNum) {
    case 1:
      return Reagents.EARTH;
    case 2:
      return Reagents.FIRE;
    case 3:
      return Reagents.WIND;
    case 4:
      return Reagents.WATER;
    case 5:
      return Reagents.ICE;
    case 6:
      return Reagents.LIGHTNING;
  }
};

export default function extractAlchemyItems(
  parsedPdf: ParsedPdf
): FoundryItem[] {
  const alchemyItems: FoundryItem[] = [];

  const alchemicalBaseIndexes = buildIndicesMap(parsedPdf, 'alchemical base:');
  const specialInstructionItems = buildIndicesMap(
    parsedPdf,
    'special instructions:'
  );

  // create a seaparate set of indexes for items that have 'special requirements' so that
  // we can build those descriptions differently.
  // handle this manually, we shouldn't start on this page.
  alchemicalBaseIndexes.delete(19);
  specialInstructionItems.delete(19);

  alchemicalBaseIndexes.forEach(
    (textIndexes: number[], indexOnPage: number) => {
      //todo: come back to this after the non-special items are looking ok.
      // if (specialInstructionItems.has(indexOnPage)) {
      //   // process
      // }
      textIndexes.forEach((textIndex: number, index: number) => {
        const { texts } = parsedPdf.pages[indexOnPage];
        const itemNameIndex = 2;
        const reagentListIndex = 3;

        const itemName = texts[textIndex - itemNameIndex].text;
        const alchemyInfoIndex = textIndex - (itemNameIndex - 1);
        const alchemyInfo = texts[alchemyInfoIndex].text;
        const alchemicalBase = texts[textIndex + 1].text;

        const reagentNumbers = texts[textIndex + reagentListIndex].text
          .trim()
          .split('+');

        const reagents = reagentNumbers
          .map((reagent: string) => getReagentString(Number(reagent)))
          .join(' + ');

        let description = `<p><em>${alchemyInfo}</em></p><p><strong>Alchemical base: ${alchemicalBase}</strong></p><p><strong>Reagents: ${reagents}</strong></p>`;
        // debugger;
        let currentDescriptionIndex = textIndex + 4;
        while (texts[currentDescriptionIndex].hasEOL) {
          description += `${texts[currentDescriptionIndex].text} `;
          currentDescriptionIndex++;
        }

        // append the last one we skipped that has EOL false
        description += `${texts[currentDescriptionIndex].text}</p>`;

        alchemyItems.push({
          name: itemName,
          type: 'object',
          img: '',
          data: {
            description,
          },
        });
      });
    }
  );

  return alchemyItems;
}
