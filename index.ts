import { writeFileSync } from 'fs';
import { getDocument } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { ParsedPdf, PdfPage, PageText, FoundryItem } from './types';
import getPrimaryComponent from './utils/getPrimaryComponent';
import pdfData from './extracted-pdf-text.json';

const args = process.argv;
const pdfFile = args[2]; // will always be the 3rd arg

// todo: fix the stupid text extraction in the pdf first. these one-off scenarios are ridiculous
// todo: hold on to this character for searching later ★ ☆
//
//
const extractMedicinalItems = (parsedPdf: ParsedPdf) => {
  // key is the page number, value is the array of 'text' indexes that hold the word 'secondary component'
  const secondaryComponentIndexes: Map<number, number[]> = new Map<
    number,
    number[]
  >();
  const herbalismItems: FoundryItem[] = [];

  // ? 1. Get a collection of the indexes of each text object containing 'secondary component' and the page it appears on
  parsedPdf.pages.forEach((page: PdfPage, pageIndex: number) => {
    const pageNum = pageIndex + 1; // starts with page number of 1;

    page.texts.forEach((pageText: PageText, textIndex: number) => {
      if (pageText.text.match(/secondary component:/i)) {
        if (secondaryComponentIndexes.has(pageIndex)) {
          const tempIndexes = secondaryComponentIndexes.get(pageIndex);
          secondaryComponentIndexes.set(pageIndex, [...tempIndexes, textIndex]);
        } else {
          secondaryComponentIndexes.set(pageIndex, [textIndex]);
        }
      }
    });
  });
  // debugger;
  secondaryComponentIndexes.forEach(
    (textIndexes: number[], pageIndex: number) => {
      textIndexes.forEach((textIndex: number) => {
        const { texts } = parsedPdf.pages[pageIndex];
        let hasStrengthMeter = false; // todo: use this for building the description out

        // item Name text *usually* appears 2 indexes BEFORE the words 'secondary component'
        let itemNameIndex = 2;
        // special case
        if (texts[textIndex - 1].text.includes('★')) {
          itemNameIndex = 3;
          hasStrengthMeter = true;
        }
        const itemName = texts[textIndex - itemNameIndex].text;

        // subtract 1 from itemNameIndex because if it has an extra line it could be 2 indexes
        // before 'secondary component' text
        const medicineTypeText =
          texts[textIndex - (itemNameIndex - 1)].text.split(' ')[0];
        const primaryComponent = getPrimaryComponent(medicineTypeText);
        herbalismItems.push({
          name: itemName,
          type: 'object',
          data: {
            description: '',
          },
        });
      });
    }
  );
  // ? 2. item title in index - 2
  // ? 3. the medicine type is index - 1, split on comma to get the strength level
  // ? 4. component is index + 1
  // ? 5. need to first

  return herbalismItems;
};

const processPdfData = () => {
  const herbalismItems = extractMedicinalItems(pdfData);

  writeFileSync('./herbalism-test-1.json', JSON.stringify(herbalismItems));
};

const processPdfFile = async () => {
  const loadingTask = getDocument(pdfFile);
  const jsonData: ParsedPdf = { pages: [] };

  const pdf = await loadingTask.promise;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    jsonData.pages.push({
      texts: textContent.items
        .map((textItem: TextItem) => ({
          text: textItem.str,
          hasEOL: textItem.hasEOL,
        }))
        .filter(
          (pageText: PageText) => pageText.text !== '' && pageText.text !== ' '
        ),
    });
  }

  /*
  todo: possibly remove all 'whitespace' lines from json file. Then design some algorithm to
  todo: distill the information down that we need. Just start with herbalism for now.
  */

  const herbalismItems = extractMedicinalItems(jsonData);

  writeFileSync('./herbalism-test-1.json', JSON.stringify(herbalismItems));
};

processPdfData();
