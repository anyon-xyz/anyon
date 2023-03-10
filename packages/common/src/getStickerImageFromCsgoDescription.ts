import type { Description2 } from "@anyon/api";

export const getStickerImageFromCsgoDescription = (
  itemDescriptions: Description2[]
) => {
  const stickers = itemDescriptions.filter((x) => x.value.includes("sticker"));

  if (stickers[0]) {
    const imgRegex = /<img width=64 height=48 src="(.*?)">/g;
    const stickerImgs: string[] = [];
    let m: RegExpExecArray | null;

    while ((m = imgRegex.exec(stickers[0].value)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === imgRegex.lastIndex) {
        imgRegex.lastIndex++;
      }

      m.forEach((match, groupIndex) => {
        if (groupIndex === 1) {
          stickerImgs.push(match);
        }
      });
    }

    return stickerImgs;
  }

  return [];
};
