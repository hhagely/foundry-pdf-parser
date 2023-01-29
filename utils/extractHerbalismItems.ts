import { FoundryItem, ParsedPdf } from '../types';
import getPrimaryComponent from '../utils/getPrimaryComponent';
import buildIndicesMap from '../utils/buildIndexesMap';

export default function extractHerbalismItems(parsedPdf: ParsedPdf) {
  const herbalismItems: FoundryItem[] = [];

  // ? 1. Get a collection of the indexes of each text object containing 'secondary component' and the page it appears on
  const secondaryComponentIndexes = buildIndicesMap(
    parsedPdf,
    'secondary component:'
  );

  secondaryComponentIndexes.forEach(
    (textIndexes: number[], indexOnPage: number) => {
      textIndexes.forEach((textIndex: number, index: number) => {
        const { texts } = parsedPdf.pages[indexOnPage];

        // item Name text *usually* appears 2 indexes BEFORE the words 'secondary component'
        const itemNameIndex = 2;
        const itemName = texts[textIndex - itemNameIndex].text;

        // subtract 1 from itemNameIndex because if it has an extra line it could be 2 indexes
        // before 'secondary component' text
        const medicineTypeIndex = textIndex - (itemNameIndex - 1);
        const medicineTypeText = texts[medicineTypeIndex].text;
        const primaryComponent = getPrimaryComponent(
          medicineTypeText.split(' ')[0]
        );
        const secondaryComponent = texts[textIndex + 1].text;

        // debugger;
        let description = `<p><em>${medicineTypeText}</em></p><p><strong>Primary Component: ${primaryComponent}</strong></p><p><strong>Secondary Component: ${secondaryComponent}</strong></p><p>`;
        let currentDescriptionIndex = textIndex + 2;
        while (texts[currentDescriptionIndex].hasEOL) {
          description += `${texts[currentDescriptionIndex].text} `;
          currentDescriptionIndex++;
        }

        // append the last one we skipped that has EOL false
        description += `${texts[currentDescriptionIndex].text}</p>`;

        herbalismItems.push({
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

  return herbalismItems;
}
