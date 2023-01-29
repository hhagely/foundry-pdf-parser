import { ParsedPdf, PdfPage, PageText } from '../types';

export default function buildIndicesMap(
  parsedPdf: ParsedPdf,
  searchString: string
): Map<number, number[]> {
  // key is the page number, value is the array of 'text' indexes that hold the searchString
  const indices: Map<number, number[]> = new Map<number, number[]>();
  const regex = new RegExp(searchString, 'i');

  parsedPdf.pages.forEach((page: PdfPage, pageIndex: number) => {
    page.texts.forEach((pageText: PageText, textIndex: number) => {
      if (pageText.text.match(regex)) {
        if (indices.has(pageIndex)) {
          const tempIndexes = indices.get(pageIndex) as number[];
          indices.set(pageIndex, [...tempIndexes, textIndex]);
        } else {
          indices.set(pageIndex, [textIndex]);
        }
      }
    });
  });

  return indices;
}
