import { writeFileSync } from 'fs';
import { getDocument } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { ParsedPdf, PageText, FoundryItem } from './types';
import extractHerbalismItems from './utils/extractHerbalismItems';
import extractAlchemyItems from './utils/extractAlchemyItems';

import pdfData from './extracted-pdf-text.json';

const args = process.argv;
const pdfFile = args[2]; // will always be the 3rd arg

// todo: fix the stupid text extraction in the pdf first. these one-off scenarios are ridiculous
// todo: hold on to this character for searching later ★ ☆
// todo: probably need to include more data in the json file that the exported items from foundry
// todo: also have in them. Proficiency, flags, etc.

const processPdfData = () => {
  // todo: turn this back on
  // const herbalismItems = extractHerbalismItems(pdfData);

  // herbalismItems.forEach((herbalismItem: FoundryItem) => {
  //   writeFileSync(
  //     `./generatedFiles/herbalism/${herbalismItem.name}.json`,
  //     JSON.stringify(herbalismItem)
  //   );
  // });

  const alchemyItems = extractAlchemyItems(pdfData);

  // alchemyItems.forEach((alchemyItem: FoundryItem) => {
  //   writeFileSync(
  //     `./generatedFiles/alchemy/${alchemyItem.name}.json`,
  //     JSON.stringify(alchemyItem)
  //   );
  // });
  writeFileSync('./alchemy-test.json', JSON.stringify(alchemyItems));
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

  const herbalismItems = extractHerbalismItems(jsonData);

  writeFileSync('./herbalism-test-1.json', JSON.stringify(herbalismItems));
};

processPdfData();
