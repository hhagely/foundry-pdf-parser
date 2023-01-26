import { PrimaryComponents } from '../types';

export default function (medicineTypeText: string) {
  let primaryComponent = '';

  switch (medicineTypeText) {
    case 'Augmenting':
      primaryComponent = PrimaryComponents.AUGMENTING;
      break;

    case 'Curative':
      primaryComponent = PrimaryComponents.CURATIVE;
      break;

    case 'Fortifying':
      primaryComponent = PrimaryComponents.FORTIFYING;
      break;

    case 'Restorative':
      primaryComponent = PrimaryComponents.RESTORATIVE;
      break;

    case 'Special':
      // do something with this
      break;
  }

  return primaryComponent;
}
