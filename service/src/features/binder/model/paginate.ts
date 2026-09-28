import { type BinderPocket, type BinderPage } from './types';

export function paginate(pockets: BinderPocket[], slotsPerPage: number): BinderPage[] {
  if (pockets.length === 0) {
    return [];
  }

  const pages: BinderPage[] = [];
  let currentIndex = 0;

  while (currentIndex < pockets.length) {
    const slots: (BinderPocket | null)[] = [];
    
    for (let i = 0; i < slotsPerPage; i++) {
      if (currentIndex < pockets.length) {
        slots.push(pockets[currentIndex]);
        currentIndex++;
      } else {
        slots.push(null);
      }
    }

    pages.push({
      index: pages.length + 1,
      slots,
    });
  }

  return pages;
}

export function getPageCount(pockets: BinderPocket[], slotsPerPage: number): number {
  if (pockets.length === 0) {
    return 0;
  }
  return Math.ceil(pockets.length / slotsPerPage);
}
