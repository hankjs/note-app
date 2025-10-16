import { createCommand } from "lexical";

import { LexicalCommand } from "lexical";

export type ImageStatus =
  | { error: true }
  | { error: false; width: number; height: number };

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> =
  createCommand('RIGHT_CLICK_IMAGE_COMMAND');

export const imageCache = new Map<string, Promise<ImageStatus> | ImageStatus>();

export function useSuspenseImage(src: string): Promise<ImageStatus> {
  let cached = imageCache.get(src);
  
  if (cached && 'error' in cached && typeof cached.error === 'boolean') {
    return Promise.resolve(cached);
  } else if (!cached) {
    cached = new Promise<ImageStatus>((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () =>
        resolve({
          error: false,
          height: img.naturalHeight,
          width: img.naturalWidth,
        });
      img.onerror = () => resolve({ error: true });
    }).then((rval) => {
      imageCache.set(src, rval);
      return rval;
    });
    imageCache.set(src, cached);
    throw cached;
  }
  throw cached;
}

export function isSVG(src: string): boolean {
  return src.toLowerCase().endsWith('.svg');
}

export function noop() {}